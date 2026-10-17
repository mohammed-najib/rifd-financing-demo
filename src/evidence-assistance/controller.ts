import type { Result } from '../demo/types'
import { type AssistanceState, type Coverage, type EvidenceAssistance, type EvidenceTransport, type SelectedEvidence } from './contract'
import { preparePage, PreparationError } from './prepare'
import { interpret, makeRequest } from './policy'

const coverage = (): Coverage => ({ totalPages: null, selected: [1], prepared: [], dispatched: [], successful: [], failed: [], unreadable: [], unchecked: [1], uncheckedCount: null })

export function createAssistance(resolve: () => Promise<Result<SelectedEvidence>>, transport: EvidenceTransport | undefined, onDispose: () => void) {
  let state: AssistanceState = { status: 'idle', result: null, coverage: coverage() }
  let generation = 0
  let abort: AbortController | null = null
  let dependencyKey: string | null = null
  const listeners = new Set<() => void>()
  const notify = () => { for (const listener of listeners) { try { listener() } catch { /* Presentation cannot change a run. */ } } }
  const stop = () => { generation++; abort?.abort(); abort = null }
  const invalidate = (reason: 'stale' | 'unauthorized') => {
    if (state.status === 'disposed') return
    stop(); dependencyKey = null; state = { status: 'unavailable', reason, result: null, coverage: coverage() }; notify()
  }
  const revalidate = async () => {
    const captured = generation
    const selected = await resolve()
    if (captured !== generation || state.status === 'disposed') return
    if (!selected.ok) invalidate('unauthorized')
    else if (dependencyKey && selected.value.binding.dependencyKey !== dependencyKey) invalidate('stale')
  }
  const api: EvidenceAssistance = {
    read: () => structuredClone(state),
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener) } },
    inspect: async () => {
      if (state.status === 'disposed') return { ok: false, error: { kind: 'unavailable', key: 'error.unavailable' } }
      return resolve()
    },
    cancel() { if (state.status === 'disposed') return; stop(); state = { ...state, status: 'cancelled', reason: undefined }; notify() },
    dispose() { if (state.status === 'disposed') return; stop(); state = { status: 'disposed', result: null, coverage: coverage() }; listeners.clear(); onDispose() },
    async run() {
      if (state.status === 'disposed' || state.status === 'preparing' || state.status === 'running') return
      stop()
      const captured = generation, cancellation = new AbortController()
      abort = cancellation
      const current = () => captured === generation && !cancellation.signal.aborted
      const startedAt = new Date().toISOString(), id = crypto.randomUUID()
      state = { ...state, status: 'preparing', reason: undefined, coverage: coverage() }; notify()
      let deadline: ReturnType<typeof setTimeout> | undefined
      try {
        const selected = await resolve()
        if (!current()) return
        if (!selected.ok) { invalidate('unauthorized'); return }
        const selection = selected.value
        dependencyKey = selection.binding.dependencyKey
        if (!transport) { state = { ...state, status: 'unavailable', reason: 'live-unavailable' }; notify(); return }
        const page = await preparePage(selection.source, cancellation.signal)
        if (!current()) return
        state.coverage.totalPages = page.totalPages; state.coverage.prepared = [1]
        const latest = await resolve()
        if (!current()) return
        if (!latest.ok || latest.value.binding.dependencyKey !== dependencyKey) { invalidate(latest.ok ? 'stale' : 'unauthorized'); return }
        const request = makeRequest(selection, page, id)
        state = { ...state, status: 'running' }; notify()
        if (!current()) return
        // A transport ignoring abort cannot keep local work alive or publish a late answer.
        const dispatchedAt = new Date().toISOString()
        const expired = new Promise<never>((_, reject) => {
          cancellation.signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true })
          deadline = setTimeout(() => { reject(new Error('provider-unavailable')); cancellation.abort() }, 8000)
        })
        state.coverage.dispatched = [1]
        const evaluated = transport.evaluate(request, cancellation.signal)
        notify()
        const raw = await Promise.race([evaluated, expired])
        const answeredAt = new Date().toISOString()
        if (!current()) return
        const final = await resolve()
        if (!current()) return
        if (!final.ok || final.value.binding.dependencyKey !== dependencyKey) { invalidate(final.ok ? 'stale' : 'unauthorized'); return }
        const result = interpret(raw, selection)
        const completeCoverage = { ...state.coverage, successful: [1], unchecked: [], uncheckedCount: 0, unreadable: result.findings.readability === 'unreadable' || result.findings.readability === 'partial' ? [1] : [] }
        const source = { id: selection.source.id, name: selection.source.name, mime: selection.source.mime, hash: selection.source.hash }
        const recordedRequest = { runId: request.runId, stage: request.stage, model: request.model, plan: request.plan, state: request.state, questions: request.questions, versions: request.versions, dependencies: request.dependencies }
        state = {
          status: 'completed', coverage: completeCoverage,
          result: {
            id, provenanceKind: 'live-analysis', temporary: true, coverage: completeCoverage, findings: result.findings,
            stages: [{ stage: 'combined-page-declaration', outcome: result.partial ? 'partial' : 'successful' }, { stage: 'name-comparison', outcome: selection.declaration.status === 'valid' ? result.native.answers.nameSupport ? 'successful' : 'unavailable' : 'skipped', reason: selection.declaration.status === 'valid' ? undefined : 'missing-context' }, { stage: 'bound-verification', outcome: 'skipped', reason: 'not-enabled' }],
            provenance: { source, binding: selection.binding, context: selection.declaration, versions: request.versions, plan: request.plan, request: recordedRequest, raster: page.manifest, native: result.native, startedAt, dispatchedAt, answeredAt, completedAt: new Date().toISOString() },
          },
        }; notify()
      } catch (error) {
        if (captured !== generation) return
        const reason = error instanceof PreparationError ? error.reason : error instanceof Error && ['context-limit', 'invalid-response'].includes(error.message) ? error.message as 'context-limit' | 'invalid-response' : 'provider-unavailable'
        const total = error instanceof PreparationError ? error.totalPages : state.coverage.totalPages
        state = { ...state, status: 'unavailable', reason, coverage: { ...state.coverage, totalPages: total, failed: [1], uncheckedCount: total, unchecked: total && total <= 100 ? Array.from({ length: total }, (_, i) => i + 1) : total ? [] : [1] } }; notify()
      } finally { clearTimeout(deadline); if (captured === generation) abort = null }
    },
  }
  return { api, invalidate, revalidate }
}
