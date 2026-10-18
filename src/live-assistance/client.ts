import type { EvidenceTransport, PreparedPage, SelectedEvidence, StageDispatch } from '../evidence-assistance/contract'
import { bounds } from '../evidence-assistance/contract'
import { envelope } from '../evidence-assistance/policy'
import { liveReplySchema, type LiveReason } from './wire'

export class LiveAccessError extends Error {
  constructor(public readonly reason: LiveReason, public readonly dispatched?: StageDispatch[]) { super(reason) }
}
export type RunInput = { runId: string; selection: SelectedEvidence; pages: PreparedPage[]; selectedPages: number[]; totalPages: number }
export type GuestCredentials = () => Promise<{ authorization: string; appCheck: string }>

function base64(bytes: ArrayBuffer) {
  const array = new Uint8Array(bytes)
  let binary = ''
  for (let i = 0; i < array.length; i += 8192) binary += String.fromCharCode(...array.subarray(i, i + 8192))
  return btoa(binary)
}

// A whole run crosses the network once. The returned evaluator only exposes
// request-local captures to the existing browser composition/lifecycle code.
export function browserLiveTransport(credentials: GuestCredentials, requestFetch: typeof fetch = fetch): EvidenceTransport {
  return {
    async evaluate() { throw new LiveAccessError('service-unavailable') },
    async begin(input, signal) {
      signal.throwIfAborted()
      if (typeof navigator !== 'undefined' && !navigator.onLine) throw new LiveAccessError('service-unavailable')
      const { selection } = input
      const body = JSON.stringify({
        runId: `${new Date().toISOString().slice(0, 10)}.${input.runId}`, slot: selection.binding.slot, audience: selection.binding.audience, context: selection.binding.context,
        totalPages: input.totalPages, selectedPages: input.selectedPages, declaration: selection.declaration,
        ...(selection.correction ? { correction: selection.correction } : {}),
        pages: input.pages.map(page => ({ page: page.manifest.page, png: base64(page.bytes), manifest: page.manifest })),
      })
      if (new TextEncoder().encode(body).byteLength > bounds.bodyBytes) throw new LiveAccessError('body-limit')
      let tokens: Awaited<ReturnType<GuestCredentials>>
      try { tokens = await credentials() } catch { throw new LiveAccessError('access-denied') }
      signal.throwIfAborted()
      let response: Response
      try {
        response = await requestFetch('/api/evidence-analysis', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: tokens.authorization, 'X-Firebase-AppCheck': tokens.appCheck }, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', body, signal })
      } catch { signal.throwIfAborted(); throw new LiveAccessError('service-unavailable') }
      const parsed = liveReplySchema.safeParse(await response.json().catch(() => null))
      signal.throwIfAborted()
      if (!parsed.success) throw new LiveAccessError('invalid-response')
      const reply = parsed.data
      if (reply.status === 'unavailable') throw new LiveAccessError(reply.reason, reply.dispatched)
      if (reply.status === 'duplicate') throw new LiveAccessError(reply.completion === 'active' ? 'guest-active' : 'run-stopped')
      if (!response.ok) throw new LiveAccessError('service-unavailable')
      const captures = new Map(reply.stages.map(stage => [`${stage.stage}:${stage.page}`, stage.answer]))
      if (captures.size !== reply.stages.length) throw new LiveAccessError('invalid-response')
      const dispatches = new Set((reply.dispatched ?? reply.stages).map(stage => `${stage.stage}:${stage.page}`))
      const unavailable = () => new Error(['invalid-response', 'context-limit', 'accounting-unavailable'].includes(reply.stoppedReason ?? '') ? reply.stoppedReason : 'provider-unavailable')
      return { accounting: [...dispatches].some(key => !captures.has(key)) ? 'unresolved' : 'reported', wasDispatched: request => dispatches.has(`${request.stage}:${request.image.manifest.page}`), verificationState(page) {
        if (!captures.has(`bound-verification:${page}`)) throw unavailable()
        const answer = envelope.safeParse(captures.get(`bound-verification:${page}`))
        return answer.success ? answer.data.bridge?.state : undefined
      }, async evaluate(request, attemptSignal) {
        attemptSignal.throwIfAborted(); signal.throwIfAborted()
        const key = `${request.stage}:${request.image.manifest.page}`
        if (!captures.has(key)) throw unavailable()
        const answer = captures.get(key); captures.delete(key)
        return answer
      } }
    },
  }
}

export function configuredLiveTransport(): EvidenceTransport | undefined {
  const configuration = import.meta.env.VITE_LIVE_FIREBASE_CONFIG
  const siteKey = import.meta.env.VITE_LIVE_RECAPTCHA_ENTERPRISE_SITE_KEY
  if (!configuration || !siteKey) return undefined
  return browserLiveTransport(async () => {
    const { guestCredentials } = await import('./firebase-client')
    return guestCredentials(JSON.parse(configuration), siteKey)
  })
}
