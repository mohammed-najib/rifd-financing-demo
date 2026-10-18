import type { Result } from '../demo/types'
import { declaredDetail, evidenceTargets, type AssistanceState, type EvidenceAssistance, type EvidenceRun, type EvidenceTransport, type SelectedEvidence, type PageAnalysis, type ComparisonAnalysis, type StageRequest } from './contract'
import { prepareEvidence, inspectSource, emptyCoverage, sourcePages, PreparationError } from './prepare'
import { interpret, makeRequest, recordRequest, attemptPlan, composeFindings, usablePage } from './policy'
import { retentionMilliseconds } from './record'
import type { AnalysisStorage, AnalysisTicket } from './storage'

const coverage = emptyCoverage

export function createAssistance(resolve: () => Promise<Result<SelectedEvidence>>, transport: EvidenceTransport | undefined, storage: AnalysisStorage, authorizeClear: () => Promise<Result<SelectedEvidence['binding']>>, onDispose: () => void) {
  let state: AssistanceState = { status: 'idle', result: null, coverage: coverage(), storage: 'available' }
  let generation = 0
  let abort: AbortController | null = null
  let inspectedHash: string | null = null
  let dependencyKey: string | null = null
  let record: EvidenceRun | null = null
  let ticket: AnalysisTicket | null = null
  let clearGeneration: string | null = null
  let observedAuthority: Pick<AnalysisTicket, 'generation' | 'clearGeneration'> | null = null
  let refreshing: Promise<void> | null = null
  const listeners = new Set<() => void>()
  const notify = () => { for (const listener of listeners) { try { listener() } catch { /* Presentation cannot change a run. */ } } }
  const stop = () => { generation++; abort?.abort(); abort = null }
  const display = (selected?: SelectedEvidence) => {
    if (!record) { state.result = null; return }
    const stale = !selected || record.provenance.binding.dependencyKey !== selected.binding.dependencyKey
    state.result = { ...record, stale, findings: stale ? Object.fromEntries(Object.keys(record.findings).map(key => [key, 'unavailable'])) as EvidenceRun['findings'] : record.findings }
    if (stale && state.status !== 'preparing' && state.status !== 'running') { state.status = 'unavailable'; state.reason = 'stale' }
  }
  const invalidate = (reason: 'stale' | 'unauthorized') => {
    if (state.status === 'disposed') return
    stop(); dependencyKey = null; ticket = null
    if (reason === 'unauthorized') record = null
    state = { ...state, status: 'unavailable', reason, coverage: record?.coverage ?? coverage() }; display(); notify()
  }
  const refresh = (): Promise<void> => {
    if (state.status === 'disposed') return Promise.resolve()
    if (refreshing) return refreshing
    refreshing = (async () => {
      let captured = generation
      const selected = await resolve()
      if (captured !== generation || state.status === 'disposed') return
      if (!selected.ok) { invalidate(selected.error.kind === 'supersededSelection' || selected.error.kind === 'staleWorkspace' ? 'stale' : 'unauthorized'); return }
      const selection = selected.value
      if (dependencyKey && selection.binding.dependencyKey !== dependencyKey) {
        stop(); captured = generation; ticket = null; dependencyKey = null
        state.status = 'unavailable'; state.reason = 'stale'
      }
      try {
        const saved = await storage.read(selection)
        if (captured !== generation) return
        state.storage = saved.incompatible ? 'incompatible' : 'available'
        if (clearGeneration !== null && saved.clearGeneration !== clearGeneration) {
          stop(); captured = generation; ticket = null; record = null
          state = { ...state, status: 'idle', reason: undefined, coverage: coverage() }
        } else if (ticket && saved.generation !== ticket.generation) {
          stop(); captured = generation; ticket = null
          state = { ...state, status: record ? 'completed' : 'idle', reason: undefined, coverage: record?.coverage ?? coverage() }
        }
        clearGeneration = saved.clearGeneration
        observedAuthority = { generation: saved.generation, clearGeneration: saved.clearGeneration }
        if (record?.temporary && ticket && record.provenance.binding.dependencyKey === selection.binding.dependencyKey && selection.binding.durable) {
          const retained = await storage.retain(selection, ticket, record, () => captured === generation, resolve)
          if (captured !== generation) return
          if (retained) { record = { ...record, temporary: false }; saved.latest = record }
        }
        if (!record?.temporary && state.status !== 'preparing' && state.status !== 'running') {
          if (saved.latest) {
            const restored = record?.id !== saved.latest.id || record.restored
            record = { ...saved.latest, temporary: false, restored }
            state.status = 'completed'; state.reason = undefined; state.coverage = record.coverage
          } else if (record && !ticket) { record = null; state.status = 'idle'; state.reason = undefined; state.coverage = coverage() }
        }
      } catch {
        if (captured !== generation) return
        state.storage = 'temporary-only'
        if (record) record = { ...record, temporary: true }
      }
      if (record && Date.parse(record.expiresAt) <= Date.now()) { record = null; state.status = 'idle'; state.reason = undefined; state.coverage = coverage() }
      if (record) display(selection)
      else state.result = null
      notify()
    })().finally(() => { refreshing = null })
    return refreshing
  }
  const api: EvidenceAssistance = {
    read: () => {
      if (record && Date.parse(record.expiresAt) <= Date.now()) { stop(); record = null; ticket = null; state = { ...state, status: 'idle', result: null, reason: undefined, coverage: coverage() }; void refresh() }
      return structuredClone(state)
    },
    refresh,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener) } },
    inspect: async () => {
      if (state.status === 'disposed') return { ok: false, error: { kind: 'unavailable', key: 'error.unavailable' } }
      await refresh()
      const selection = await resolve()
      if (selection.ok && !abort && !['running', 'preparing'].includes(state.status) && inspectedHash !== selection.value.source.hash) {
        const captured = generation, inspection = new AbortController()
        abort = inspection
        try {
          const totalPages = await inspectSource(selection.value.source, inspection.signal)
          if (captured === generation && !inspection.signal.aborted) {
            inspectedHash = selection.value.source.hash
            if (!record) state.coverage = { ...coverage(), totalPages, selected: totalPages <= 4 ? sourcePages(totalPages) : [], unchecked: sourcePages(totalPages), uncheckedCount: totalPages }
            notify()
          }
        } catch (error) {
          if (captured === generation && error instanceof PreparationError) { state.reason = error.reason; state.coverage.totalPages = error.totalPages; notify() }
        } finally { if (abort === inspection) abort = null }
      }
      return selection
    },
    async clear() {
      const refused = (): Result<void> => ({ ok: false, error: { kind: 'unavailable', key: 'error.unavailable' } })
      if (state.status === 'disposed') return refused()
      stop(); record = null; ticket = null; clearGeneration = null; dependencyKey = null
      state = { status: 'idle', result: null, coverage: coverage(), storage: state.storage }; notify()
      const captured = generation
      const authorized = await authorizeClear()
      if (captured !== generation) return refused()
      if (!authorized.ok) { invalidate('unauthorized'); return { ok: false, error: authorized.error } }
      try {
        await storage.clear({ binding: authorized.value }, () => captured === generation)
        if (captured !== generation) return refused()
        state.storage = 'available'; notify()
        return { ok: true, value: undefined }
      } catch {
        if (captured === generation) { state.storage = 'temporary-only'; notify() }
        return { ok: false, error: { kind: 'storage', key: 'error.storage' } }
      }
    },
    cancel() { if (state.status === 'disposed') return; stop(); state = { ...state, status: 'cancelled', reason: undefined }; notify() },
    dispose() { if (state.status === 'disposed') return; stop(); record = null; ticket = null; state = { status: 'disposed', result: null, coverage: coverage(), storage: state.storage }; listeners.clear(); onDispose() },
    async run(selectedPages) {
      if (state.status === 'disposed' || state.status === 'preparing' || state.status === 'running') return
      await refresh()
      if (api.read().status === 'disposed') return
      let runAuthority = observedAuthority
      stop()
      const captured = generation, cancellation = new AbortController()
      abort = cancellation
      const current = () => captured === generation && !cancellation.signal.aborted
      const startedAt = new Date().toISOString(), id = crypto.randomUUID()
      state = { ...state, status: 'preparing', reason: undefined, coverage: record?.coverage ?? coverage() }; notify()
      let runCoverage = coverage()
      try {
        const selected = await resolve()
        if (!current()) return
        if (!selected.ok) { invalidate('unauthorized'); return }
        const selection = selected.value
        dependencyKey = selection.binding.dependencyKey
        if (!transport) { state = { ...state, status: 'unavailable', reason: 'live-unavailable' }; notify(); return }
        try { ticket = await storage.begin(selection, current); runAuthority = ticket; clearGeneration = ticket.clearGeneration; state.storage = 'available' }
        catch { ticket = null; state.storage = 'temporary-only' }
        if (!current()) return
        const prepared = await prepareEvidence(selection.source, cancellation.signal, selectedPages, next => {
          runCoverage = next
          if (current()) { state = { ...state, coverage: next }; notify() }
        })
        if (!current()) return
        runCoverage = prepared.coverage
        const plan = attemptPlan(runCoverage.totalPages!, runCoverage.selected)
        const pages: PageAnalysis[] = [], stages: EvidenceRun['stages'] = prepared.failures.map(failure => ({ page: failure.page, stage: 'preparation', outcome: 'unavailable', reason: failure.reason }))
        let comparison: ComparisonAnalysis | undefined, lastReason = prepared.failures[0]?.reason ?? 'provider-unavailable'
        let dispatchedAt = startedAt, answeredAt = startedAt
        const evaluate = async (request: StageRequest) => {
          const latest = await resolve()
          if (!current()) throw new DOMException('Cancelled', 'AbortError')
          if (!latest.ok || latest.value.binding.dependencyKey !== dependencyKey) { invalidate(latest.ok ? 'stale' : 'unauthorized'); throw new Error('stale') }
          const stageAbort = new AbortController()
          let timer: ReturnType<typeof setTimeout> | undefined
          const abortStage = () => stageAbort.abort()
          cancellation.signal.addEventListener('abort', abortStage, { once: true })
          state = { ...state, status: 'running', coverage: runCoverage }; notify()
          if (!current()) throw new DOMException('Cancelled', 'AbortError')
          if (request.stage !== 'document-comparison') runCoverage.dispatched.push(request.image.manifest.page)
          const sent = new Date().toISOString()
          if (dispatchedAt === startedAt) dispatchedAt = sent
          try {
            const expired = new Promise<never>((_, reject) => {
              stageAbort.signal.addEventListener('abort', () => reject(new Error('provider-unavailable')), { once: true })
              timer = setTimeout(() => { reject(new Error('provider-unavailable')); stageAbort.abort() }, 8000)
            })
            const raw = await Promise.race([transport.evaluate(request, stageAbort.signal), expired])
            answeredAt = new Date().toISOString()
            return raw
          } finally { clearTimeout(timer); cancellation.signal.removeEventListener('abort', abortStage) }
        }
        for (const page of prepared.pages) {
          try {
            const request = makeRequest(selection, page, id, plan)
            const raw = await evaluate(request)
            if (!current()) return
            const result = interpret(raw, selection)
            pages.push({ page: page.manifest.page, request: recordRequest(request), raster: page.manifest, ...result })
            runCoverage.successful.push(page.manifest.page)
            if (['unreadable', 'partial'].includes(result.findings.readability)) runCoverage.unreadable.push(page.manifest.page)
            stages.push({ page: page.manifest.page, stage: request.stage, outcome: result.partial ? 'partial' : 'successful' })
          } catch (error) {
            if (!current()) return
            lastReason = error instanceof Error && ['invalid-response', 'context-limit'].includes(error.message) ? error.message as typeof lastReason : 'provider-unavailable'
            runCoverage.failed.push(page.manifest.page)
            stages.push({ page: page.manifest.page, stage: 'page', outcome: 'unavailable', reason: lastReason })
          }
          runCoverage.failed.sort((a, b) => a - b)
          runCoverage.unchecked = sourcePages(runCoverage.totalPages!).filter(page => !runCoverage.successful.includes(page))
          runCoverage.uncheckedCount = runCoverage.unchecked.length
          state.coverage = structuredClone(runCoverage); notify()
        }
        const usable = pages.filter(page => usablePage(selection, page.findings))
        if (runCoverage.totalPages! > 1) {
          if (usable.length) {
            try {
              const images = prepared.pages.filter(page => usable.some(result => result.page === page.manifest.page))
              const request = makeRequest(selection, images[0], id, plan, images)
              if (Object.keys(request.questions).length) {
                const basis = composeFindings(selection, { ...runCoverage, totalPages: usable.length, successful: usable.map(page => page.page) }, usable)
                const result = interpret(await evaluate(request), selection, basis)
                if (!current()) return
                comparison = { request: recordRequest(request), ...result }
                stages.push({ stage: 'document-comparison', outcome: result.partial ? 'partial' : 'successful' })
              } else stages.push({ stage: 'document-comparison', outcome: 'skipped', reason: 'missing-context' })
            } catch (error) {
              if (!current()) return
              stages.push({ stage: 'document-comparison', outcome: 'unavailable', reason: error instanceof Error ? error.message : 'provider-unavailable' })
            }
          } else stages.push({ stage: 'document-comparison', outcome: 'skipped', reason: 'no-usable-pages' })
        }
        if (!pages.length) throw new PreparationError(lastReason, runCoverage.totalPages)
        if (!current()) return
        const final = await resolve()
        if (!current()) return
        if (!final.ok || final.value.binding.dependencyKey !== dependencyKey) { invalidate(final.ok ? 'stale' : 'unauthorized'); return }
        // Use the pre-run observation if a generation write failed. A transient
        // storage failure cannot make a later clear or newer run invisible.
        try {
          const saved = await storage.read(final.value)
          if (!current()) return
          const changed = runAuthority
            ? saved.generation !== runAuthority.generation || saved.clearGeneration !== runAuthority.clearGeneration
            : !!saved.generation || !!saved.clearGeneration
          if (changed) {
            stop(); ticket = null
            state = { ...state, status: record ? 'completed' : 'idle', reason: undefined }
            await refresh(); return
          }
        } catch {
          if (!current()) return
          state.storage = 'temporary-only'
          if (runAuthority) {
            state = { ...state, status: 'unavailable', reason: 'analysis-storage', result: null }; notify(); return
          }
          // When storage was unavailable throughout, the run has only its local
          // cancellation authority and is explicitly temporary-only.
        }
        const first = pages[0]
        const findings = runCoverage.totalPages === 1 ? first.findings : composeFindings(selection, runCoverage, pages, comparison)
        const source = { id: selection.source.id, name: selection.source.name, mime: selection.source.mime, hash: selection.source.hash }
        if (runCoverage.totalPages === 1) stages.push(...evidenceTargets(selection.binding.slot).map(target => ({ stage: `${target.field === 'fullName' ? 'name' : target.field}-comparison`, outcome: (declaredDetail(selection.declaration, target).status === 'valid' ? first.native.answers[target.support] ? 'successful' : 'unavailable' : 'skipped') as EvidenceRun['stages'][number]['outcome'], ...(declaredDetail(selection.declaration, target).status === 'valid' ? {} : { reason: 'missing-context' }) })))
        stages.push(...runCoverage.selected.map(page => ({ ...(runCoverage.totalPages === 1 ? {} : { page }), stage: 'bound-verification', outcome: 'skipped' as const, reason: 'not-enabled' })))
        const completedAt = new Date().toISOString()
        const completed: EvidenceRun = {
          schemaVersion: 1, id, provenanceKind: 'live-analysis', temporary: true, restored: false, stale: false, expiresAt: new Date(Date.parse(completedAt) + retentionMilliseconds).toISOString(), coverage: runCoverage, findings,
          pages, ...(comparison ? { comparison } : {}), stages,
          provenance: { source, binding: selection.binding, context: selection.declaration, ...(selection.correction ? { correction: selection.correction } : {}), versions: first.request.versions, plan, request: first.request, raster: first.raster, native: first.native, accounting: 'reported', startedAt, dispatchedAt, answeredAt, completedAt },
        }
        if (ticket && final.value.binding.durable) {
          try {
            if (await storage.retain(final.value, ticket, completed, current, resolve)) completed.temporary = false
            else { await refresh(); return }
          } catch { state.storage = 'temporary-only' }
        }
        if (!current()) return
        record = completed
        state = { ...state, status: 'completed', reason: undefined, result: completed, coverage: runCoverage }; notify()
      } catch (error) {
        if (captured !== generation) return
        const reason = error instanceof PreparationError ? error.reason : error instanceof Error && ['context-limit', 'invalid-response'].includes(error.message) ? error.message as 'context-limit' | 'invalid-response' : 'provider-unavailable'
        const total = error instanceof PreparationError ? error.totalPages : runCoverage.totalPages
        state = { ...state, status: 'unavailable', reason, coverage: { ...runCoverage, totalPages: total, uncheckedCount: total === null ? null : total - runCoverage.successful.length, unchecked: total ? sourcePages(total).filter(page => !runCoverage.successful.includes(page)) : [] } }; notify()
      } finally { if (captured === generation) abort = null }
    },
  }
  return { api, invalidate, revalidate: refresh }
}
