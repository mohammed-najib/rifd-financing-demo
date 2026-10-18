import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getAppCheck } from 'firebase-admin/app-check'
import { getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { onRequest } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { info } from 'firebase-functions/logger'
import { createAdmission } from '../src/live-assistance/admission'
import { firestoreMetadata, cleanupMetadata } from '../src/live-assistance/firestore'
import { trustedNetwork } from '../src/live-assistance/ingress'
import { createLiveService, liveResponseHeaders } from '../src/live-assistance/service'
import { firebaseGuestVerifier } from '../src/live-assistance/security'
import { createJevWorkflow } from '../src/live-assistance/jev'
import type { LiveReply } from '../src/live-assistance/wire'

initializeApp()
const accountingKey = defineSecret('LIVE_ACCOUNTING_KEY')
// Capability is installed, but dispatch stays closed through hosted controls
// and bounded acceptance. Enabling admission alone cannot open inference.
const liveDispatchEnabled = false
// Firebase validates every declared secret during deployment, even an unbound
// one. Keep the empty provider secret undeclared during closed control checks.
const providerKey = liveDispatchEnabled ? defineSecret('LIVE_TYPESAFE_API_KEY') : null

export const liveAnalysis = onRequest({
  region: 'europe-west1', memory: '512MiB', cpu: 1, minInstances: 0,
  maxInstances: 1, concurrency: 2, timeoutSeconds: 55, cors: false,
  serviceAccount: 'rifd-live-analysis@rifd-portfolio-mdnb.iam.gserviceaccount.com',
  // The provider secret has no version until the operator installs a dedicated
  // key. Closed control checks must not require or expose that credential.
  secrets: providerKey ? [accountingKey, providerKey] : [accountingKey],
  // Hosting and direct traffic must both pass the same verifier. No test modes,
  // emulator credentials, transport selection or public operator commands.
}, async (request, response) => {
  const abort = new AbortController()
  const send = (status: number, body: LiveReply) => {
    // Fixed enums and counts only. Never pass the request, credentials, source,
    // context, run identifier or provider answer to the logger.
    info('live-assistance-response', { status, outcome: body.status,
      reason: body.status === 'unavailable' ? body.reason : body.status === 'completed' ? body.stoppedReason : undefined,
    })
    response.status(status).json(body)
  }
  const disconnected = () => { if (!response.writableEnded) abort.abort() }
  response.on('close', disconnected)
  response.set(liveResponseHeaders)
  if (request.method !== 'POST' || request.get('content-type')?.split(';')[0].trim() !== 'application/json' || request.get('content-encoding')) {
    send(400, { status: 'unavailable', reason: 'invalid-request' }); return
  }
  try {
    const service = createLiveService({
      admission: createAdmission(firestoreMetadata(getFirestore()), accountingKey.value()),
      authorize: firebaseGuestVerifier({ auth: (token, revoked) => getAuth().verifyIdToken(token, revoked), app: token => getAppCheck().verifyToken(token) }, process.env.LIVE_FIREBASE_APP_ID),
      execute: providerKey ? createJevWorkflow({ apiKey: providerKey.value() }) : undefined,
    })
    const suffix = (process.env.LIVE_TRUSTED_PROXY_SUFFIX ?? '').split(',').map(value => value.trim()).filter(Boolean)
    const reply = await service({ body: request.rawBody, authorization: request.get('authorization'), appCheck: request.get('x-firebase-appcheck'), network: trustedNetwork(request.get('x-forwarded-for'), suffix), signal: abort.signal })
    response.set(reply.headers)
    send(reply.status, reply.body)
  } catch {
    send(503, { status: 'unavailable', reason: 'service-unavailable' })
  } finally { response.off('close', disconnected) }
})

export const cleanupLiveMetadata = onSchedule({ region: 'europe-west1', schedule: 'every 1 hours', timeoutSeconds: 55, maxInstances: 1,
  serviceAccount: 'rifd-live-cleanup@rifd-portfolio-mdnb.iam.gserviceaccount.com',
}, async () => {
  const deleted = await cleanupMetadata(getFirestore())
  info('live-assistance-cleanup', { deleted })
})
