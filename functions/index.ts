import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getAppCheck } from 'firebase-admin/app-check'
import { getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { onRequest } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { createAdmission } from '../src/live-assistance/admission'
import { firestoreMetadata, cleanupMetadata } from '../src/live-assistance/firestore'
import { trustedNetwork } from '../src/live-assistance/ingress'
import { createLiveService } from '../src/live-assistance/service'
import { firebaseGuestVerifier } from '../src/live-assistance/security'

initializeApp()
const accountingKey = defineSecret('LIVE_ACCOUNTING_KEY')

export const liveAnalysis = onRequest({
  region: 'europe-west1', memory: '512MiB', cpu: 1, minInstances: 0,
  maxInstances: 1, concurrency: 2, timeoutSeconds: 55, cors: false,
  secrets: [accountingKey],
  // Hosting and direct traffic must both pass the same verifier. No test modes,
  // emulator credentials, transport selection or public operator commands.
}, async (request, response) => {
  const abort = new AbortController()
  const disconnected = () => { if (!response.writableEnded) abort.abort() }
  response.on('close', disconnected)
  response.set('Cache-Control', 'private, no-store, max-age=0')
  if (request.method !== 'POST' || request.get('content-type')?.split(';')[0].trim() !== 'application/json' || request.get('content-encoding')) {
    response.status(400).json({ status: 'unavailable', reason: 'invalid-request' }); return
  }
  try {
    const service = createLiveService({
      admission: createAdmission(firestoreMetadata(getFirestore()), accountingKey.value()),
      authorize: firebaseGuestVerifier({ auth: (token, revoked) => getAuth().verifyIdToken(token, revoked), app: token => getAppCheck().verifyToken(token) }, process.env.LIVE_FIREBASE_APP_ID),
      // Ticket 12 installs the fixed Jev workflow here. Leaving it absent keeps
      // all production inference closed even if the operator enables admission.
    })
    const suffix = (process.env.LIVE_TRUSTED_PROXY_SUFFIX ?? '').split(',').map(value => value.trim()).filter(Boolean)
    const reply = await service({ body: request.rawBody, authorization: request.get('authorization'), appCheck: request.get('x-firebase-appcheck'), network: trustedNetwork(request.get('x-forwarded-for'), suffix), signal: abort.signal })
    response.set(reply.headers).status(reply.status).json(reply.body)
  } catch {
    response.status(503).json({ status: 'unavailable', reason: 'service-unavailable' })
  } finally { response.off('close', disconnected) }
})

export const cleanupLiveMetadata = onSchedule({ region: 'europe-west1', schedule: 'every 1 hours', timeoutSeconds: 55, maxInstances: 1 }, async () => {
  await cleanupMetadata(getFirestore())
})
