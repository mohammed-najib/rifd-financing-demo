import type { StageRequest, StageDispatch } from '../evidence-assistance/contract'
import { bounds, versions } from '../evidence-assistance/contract'
import { envelope, reportedUsage } from '../evidence-assistance/policy'
import { type Admission, type Reservation, LiveStop } from './admission'
import { validateRequest, type ValidatedRequest } from './request'
import { supervise } from './supervision'
import { liveReasons, type LiveReason, type LiveReply } from './wire'

export type LiveWork = {
  signal: AbortSignal
  check(): void
  evaluate(request: StageRequest, prepare: (signal: AbortSignal) => Promise<() => Promise<unknown>>): Promise<unknown>
}
export type FixedWorkflow = (request: ValidatedRequest, work: LiveWork) => Promise<void>
type Request = { body: Buffer; authorization?: string; appCheck?: string; network: string | null; path?: string; signal?: AbortSignal }
export const liveResponseHeaders = { 'Cache-Control': 'private, no-store, max-age=0', Pragma: 'no-cache', Vary: 'Authorization, X-Firebase-AppCheck, X-Rifd-Network-Proof', 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' }
const headers = liveResponseHeaders

export function createLiveService(options: {
  admission: Admission
  authorize(auth?: string, appCheck?: string): Promise<string>
  execute?: FixedWorkflow
  now?: () => number
  serverMilliseconds?: number
  attemptMilliseconds?: number
}) {
  const now = options.now ?? Date.now
  return async (input: Request): Promise<{ status: number; headers: typeof headers; body: LiveReply }> => {
    const run = supervise(input.signal, Math.min(options.serverMilliseconds ?? 45_000, 45_000))
    let ticket: Reservation | undefined, marking: Promise<string> | undefined
    let terminal: 'completed' | 'stopped' = 'stopped'
    const stages: Extract<LiveReply, { status: 'completed' }>['stages'] = []
    const dispatched: StageDispatch[] = []
    try {
      const guest = await run.wait(() => options.authorize(input.authorization, input.appCheck).catch(() => { throw new LiveStop('access-denied') }))
      if (!guest) throw new LiveStop('access-denied')
      const request = await run.wait(() => validateRequest(input.body, run.signal))
      if (request.runId.slice(0, 10) !== new Date(now()).toISOString().slice(0, 10)) throw new LiveStop('run-expired')
      if (!input.network || !options.execute) throw new LiveStop('service-unavailable')
      run.check()
      // The key covers actual received bytes, canonical allowed context and all
      // question versions. It establishes equality, never source authenticity.
      const fingerprint = options.admission.keyed('input', JSON.stringify({ ...request, pages: request.pages.map(page => ({ page: page.page, manifest: page.manifest, digest: options.admission.keyed('image', page.bytes.toString('base64')) })), versions }))
      const reservation = options.admission.reserve({ guest, network: input.network, runId: request.runId, fingerprint, attempts: request.maximumAttempts, now: now() })
      // If supervision wins while Firestore commits, stop the eventual ticket.
      void reservation.then(value => { if (run.signal.aborted && !value.duplicate) return options.admission.finish(value, 'stopped', now()) }).catch(() => undefined)
      ticket = await run.wait(() => reservation)
      if (ticket.duplicate) return { status: 200, headers, body: { status: 'duplicate', completion: ticket.status } }
      const admitted = ticket
      let sequence = 0, busy = false, halted = false
      let cropBytes = request.pages.reduce((sum, page) => sum + page.bytes.length, 0)
      let cropPixels = request.pages.reduce((sum, page) => sum + page.width * page.height, 0)
      const seen = new Set<string>()
      function stopStage(reason: LiveReason): never { halted = true; throw new LiveStop(reason) }
      await run.wait(() => options.execute!(request, {
        signal: run.signal, check: () => run.check(),
        async evaluate(stage, prepare) {
          const attemptMs = Math.min(options.attemptMilliseconds ?? 8000, 8000)
          run.check(attemptMs)
          if (busy || halted || sequence >= request.maximumAttempts) stopStage('run-stopped')
          const key = `${stage.stage}:${stage.image.manifest.page}`
          if (seen.has(key) || stage.runId !== request.runId || stage.model !== versions.model || JSON.stringify(stage.versions) !== JSON.stringify(versions)) stopStage('invalid-request')
          const images = [stage.image, ...(stage.images ?? [])], assets = [...images, ...(stage.crops ?? [])]
          const questions = Object.values(stage.questions)
          if (questions.filter(question => question.type === 'box').length > 9 || Object.keys(stage.questions).filter(key => key.endsWith('Support')).length > 4) stopStage('prepared-limit')
          if (stage.stage === 'bound-verification' && (images.length !== 1 || questions.length > 54 || questions.some(question => question.type !== 'noul'))) stopStage('prepared-limit')
          if (images.length > 4 || assets.length > (stage.stage === 'bound-verification' ? 10 : 4) || questions.length > (stage.stage === 'bound-verification' ? 64 : 32) || (stage.crops?.length ?? 0) > 9) stopStage('prepared-limit')
          if (assets.reduce((sum, asset) => sum + asset.bytes.byteLength, 0) > bounds.combinedBytes) stopStage('prepared-limit')
          if (assets.some(asset => asset.bytes.byteLength > bounds.imageBytes)) stopStage('prepared-limit')
          const dimensions = assets.map(asset => 'manifest' in asset ? asset.manifest : asset.binding)
          if (dimensions.some(size => size.width < bounds.minimumSide || size.height < bounds.minimumSide || size.width > bounds.maximumSide || size.height > bounds.maximumSide) || dimensions.reduce((sum, size) => sum + size.width * size.height, 0) > bounds.combinedPixels) stopStage('prepared-limit')
          cropBytes += (stage.crops ?? []).reduce((sum, crop) => sum + crop.bytes.byteLength, 0)
          cropPixels += (stage.crops ?? []).reduce((sum, crop) => sum + crop.binding.width * crop.binding.height, 0)
          if (cropBytes > bounds.combinedBytes || cropPixels > bounds.combinedPixels) stopStage('prepared-limit')
          const metadata = { runId: stage.runId, stage: stage.stage, model: stage.model, plan: stage.plan, state: stage.state, questions: stage.questions, versions: stage.versions, dependencies: stage.dependencies }
          if (Buffer.byteLength(JSON.stringify(metadata)) > bounds.contextBytes) stopStage('context-limit')
          const page = stage.image.manifest.page
          if (!request.selectedPages.includes(page) || stage.stage === 'combined-page-declaration' && request.totalPages !== 1 || stage.stage === 'page' && request.totalPages === 1 || stage.stage === 'document-comparison' && request.totalPages === 1) stopStage('invalid-request')
          seen.add(key); busy = true
          const attempt = supervise(run.signal, attemptMs)
          let connection: string | undefined
          let invoked = false, marked: Promise<string> | undefined
          try {
            const send = await attempt.wait(() => prepare(attempt.signal))
            // Marking is conservative. An ambiguous commit consumes its entry.
            marked = marking = options.admission.mark(admitted, sequence++, now())
            connection = await attempt.wait(() => marking!)
            attempt.check(); run.check()
            await attempt.wait(() => options.admission.recheck(admitted, now()))
            attempt.check(); run.check()
            const answer = await attempt.wait(() => {
              dispatched.push({ stage: stage.stage, page: stage.image.manifest.page }); invoked = true
              return send()
            })
            if (!reportedUsage.safeParse(answer && typeof answer === 'object' && 'usage' in answer ? answer.usage : undefined).success) throw new LiveStop('accounting-unavailable')
            const parsed = envelope.safeParse(answer)
            if (!parsed.success) throw new LiveStop('invalid-response')
            stages.push({ stage: stage.stage, page: stage.image.manifest.page, answer })
            await attempt.wait(() => options.admission.disconnect(connection!))
            return answer
          } catch (error) {
            halted = true
            if (connection && invoked) await options.admission.blockAccounting().catch(() => undefined)
            else if (marked) void marked.then(id => options.admission.disconnect(id)).catch(() => undefined)
            // Unknown remote outcomes keep the connection lease and consume the
            // marked entry. No retry, later stage or assumed cancellation refund.
            throw error
          } finally { busy = false; attempt.dispose() }
        },
      }))
      run.check()
      if (halted || busy) throw new LiveStop('run-stopped')
      terminal = 'completed'
      await run.wait(() => options.admission.finish(admitted, terminal, now()))
      return { status: 200, headers, body: { status: 'completed', stages, dispatched } }
    } catch (error) {
      const reason: LiveReason = error instanceof LiveStop && liveReasons.includes(error.message as LiveReason) ? error.message as LiveReason : 'service-unavailable'
      if (stages.length) return { status: 200, headers, body: { status: 'completed', stages, dispatched, stoppedReason: reason } }
      return { status: reason === 'access-denied' ? 401 : reason === 'body-limit' ? 413 : reason === 'invalid-request' ? 400 : 503, headers, body: { status: 'unavailable', reason, ...(dispatched.length ? { dispatched } : {}) } }
    } finally {
      run.dispose()
      if (ticket && !ticket.duplicate && terminal !== 'completed') {
        // A late marking transaction must settle before releasing unsent work.
        const captured = ticket
        void Promise.resolve(marking).catch(() => undefined).then(() => options.admission.finish(captured, 'stopped', now())).catch(() => undefined)
      }
    }
  }
}
