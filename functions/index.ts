import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getAppCheck } from 'firebase-admin/app-check'
import { getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { onRequest } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { info } from 'firebase-functions/logger'
import { createAdmission, LiveStop } from '../src/live-assistance/server/admission'
import { firestoreMetadata, cleanupMetadata } from '../src/live-assistance/server/firestore'
import { createIngressVerifier } from '../src/live-assistance/server/ingress'
import { createLiveService, liveResponseHeaders } from '../src/live-assistance/server/service'
import { firebaseGuestVerifier } from '../src/live-assistance/server/security'
import { createJevWorkflow } from '../src/live-assistance/server/jev'
import type { LiveReply } from '../src/live-assistance/wire'
import { supervise } from '../src/live-assistance/server/supervision'

initializeApp()
const accountingKey = defineSecret('LIVE_ACCOUNTING_KEY')
// Provider capability and transactional admission are separate controls.
// Public runs still require valid Auth, App Check, ingress proof and allowances.
const liveDispatchEnabled = true
const providerKey = liveDispatchEnabled ? defineSecret('LIVE_TYPESAFE_API_KEY') : null

export const liveAnalysis = onRequest({
  region: 'europe-west1', memory: '512MiB', cpu: 1, minInstances: 0,
  maxInstances: 1, concurrency: 2, timeoutSeconds: 55, cors: false,
  serviceAccount: 'rifd-live-analysis@rifd-portfolio-mdnb.iam.gserviceaccount.com',
  // The dedicated provider key remains bound only to this server function.
  secrets: providerKey ? [accountingKey, providerKey] : [accountingKey],
  // Hosting and direct traffic must both pass the same verifier. No test modes,
  // emulator credentials, transport selection or public operator commands.
}, async (request, response) => {
  const abort = new AbortController()
  let ingressVerified = false
  const send = (status: number, body: LiveReply) => {
    // Fixed enums and counts only. Never pass the request, credentials, source,
    // context, run identifier or provider answer to the logger.
    info('live-assistance-response', { status, outcome: body.status, ingressVerified,
      reason: body.status === 'unavailable' ? body.reason : body.status === 'completed' ? body.stoppedReason : undefined,
    })
    response.status(status).json(body)
  }
  const disconnected = () => { if (!response.writableEnded) abort.abort() }
  response.on('close', disconnected)
  response.set(liveResponseHeaders)
  const proofRoute = request.path === '/network-proof' || request.path === '/liveAnalysis/network-proof'
  if (proofRoute) {
    response.vary('Origin')
    const origin = request.get('origin')
    if (origin && !['https://rifd-portfolio-mdnb.web.app', 'https://rifd-portfolio-mdnb.firebaseapp.com'].includes(origin)) {
      send(401, { status: 'unavailable', reason: 'access-denied' }); return
    }
    if (origin) response.set('Access-Control-Allow-Origin', origin)
    if (request.method === 'OPTIONS') {
      response.set({ 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck', 'Access-Control-Max-Age': '0' })
      response.status(204).end(); return
    }
  }
  if (request.method !== 'POST' || request.get('content-type')?.split(';')[0].trim() !== 'application/json' || request.get('content-encoding')) {
    send(400, { status: 'unavailable', reason: 'invalid-request' }); return
  }
  const receivedAt = Date.now()
  const access = supervise(abort.signal, 45_000)
  try {
    const authorize = firebaseGuestVerifier({ auth: (token, revoked) => getAuth().verifyIdToken(token, revoked), app: token => getAppCheck().verifyToken(token) }, process.env.LIVE_FIREBASE_APP_ID)
    const guest = await access.wait(() => authorize(request.get('authorization'), request.get('x-firebase-appcheck')).catch(() => { throw new LiveStop('access-denied') }))
    access.check()
    const ingress = createIngressVerifier(accountingKey.value(), process.env.LIVE_TRUSTED_INGRESS)
    if (proofRoute) {
      if (request.rawBody.length > 128 || request.rawBody.toString('utf8').trim() !== '{}') {
        send(400, { status: 'unavailable', reason: 'invalid-request' }); return
      }
      const proof = ingress.issue({ forwarded: request.get('x-forwarded-for'), peer: request.socket.remoteAddress, authority: request.get('host'), guest })
      if (!proof) { send(503, { status: 'unavailable', reason: 'service-unavailable' }); return }
      info('live-network-proof', { status: 200, outcome: 'ready' })
      response.status(200).json({ status: 'ready', proof }); return
    }
    const network = ingress.verify(request.get('x-rifd-network-proof'), guest)
    ingressVerified = network !== null
    const service = createLiveService({
      admission: createAdmission(firestoreMetadata(getFirestore()), accountingKey.value()),
      authorize: async () => guest,
      execute: providerKey ? createJevWorkflow({ apiKey: providerKey.value() }) : undefined,
      serverMilliseconds: Math.max(0, 45_000 - (Date.now() - receivedAt)),
    })
    const reply = await service({ body: request.rawBody, network, signal: abort.signal })
    response.set(reply.headers)
    send(reply.status, reply.body)
  } catch (error) {
    const denied = error instanceof LiveStop && error.message === 'access-denied'
    send(denied ? 401 : 503, { status: 'unavailable', reason: denied ? 'access-denied' : 'service-unavailable' })
  } finally { access.dispose(); response.off('close', disconnected) }
})

export const cleanupLiveMetadata = onSchedule({ region: 'europe-west1', schedule: 'every 1 hours', timeoutSeconds: 55, maxInstances: 1,
  serviceAccount: 'rifd-live-cleanup@rifd-portfolio-mdnb.iam.gserviceaccount.com',
}, async () => {
  const deleted = await cleanupMetadata(getFirestore())
  info('live-assistance-cleanup', { deleted })
})
