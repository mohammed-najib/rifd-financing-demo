import { bounds, type AssistanceReason, type EvidenceSource, type Coverage, type PreparedPage } from './contract'

export class PreparationError extends Error {
  constructor(public reason: AssistanceReason, public totalPages: number | null = null) { super(reason) }
}

function workerPage(source: EvidenceSource, signal: AbortSignal, pageNumber: number, explicit: boolean, milliseconds: number, inspectOnly = false): Promise<PreparedPage | number> {
  if (!source.bytes.byteLength || source.bytes.byteLength > bounds.sourceBytes) return Promise.reject(new PreparationError('source-limit'))
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException('Cancelled', 'AbortError')); return }
    let knownTotal: number | null = null
    const worker = new Worker(new URL('./prepare.worker.ts', import.meta.url), { type: 'module' })
    const finish = () => { clearTimeout(timer); signal.removeEventListener('abort', abort); worker.terminate() }
    const abort = () => { finish(); reject(new DOMException('Cancelled', 'AbortError')) }
    const timer = setTimeout(() => { finish(); reject(new PreparationError('preparation-timeout', knownTotal)) }, Math.min(bounds.pageMilliseconds, milliseconds))
    signal.addEventListener('abort', abort, { once: true })
    worker.onerror = () => { finish(); reject(new PreparationError('invalid-source')) }
    worker.onmessage = (event: MessageEvent<{ kind?: string; page?: PreparedPage; reason?: AssistanceReason; totalPages?: number }>) => {
      if (event.data.kind === 'evidence-scope') { knownTotal = event.data.totalPages ?? null; return }
      if (event.data.kind !== 'prepared-evidence') return
      finish()
      if (event.data.page) resolve(event.data.page)
      else if (inspectOnly && !event.data.reason && event.data.totalPages) resolve(event.data.totalPages)
      else reject(new PreparationError(event.data.reason ?? 'invalid-source', event.data.totalPages ?? null))
    }
    const bytes = source.bytes.slice(0)
    worker.postMessage({ ...source, bytes, pageNumber, explicit, inspectOnly }, [bytes])
  })
}

export const inspectSource = (source: EvidenceSource, signal: AbortSignal) => workerPage(source, signal, 1, true, bounds.pageMilliseconds, true) as Promise<number>
export const preparePage = (source: EvidenceSource, signal: AbortSignal, pageNumber = 1, explicit = false, milliseconds: number = bounds.pageMilliseconds) => workerPage(source, signal, pageNumber, explicit, milliseconds) as Promise<PreparedPage>

export const emptyCoverage = (): Coverage => ({ totalPages: null, selected: [], prepared: [], dispatched: [], successful: [], failed: [], unreadable: [], unchecked: [], uncheckedCount: null })
export const sourcePages = (total: number) => total <= bounds.pdfPages ? Array.from({ length: total }, (_, i) => i + 1) : []

// Each worker owns exactly one original page. No failed page is replaced by a
// lower-quality raster, and each run starts with fresh coverage.
export async function prepareEvidence(source: EvidenceSource, signal: AbortSignal, selected?: number[], progress: (coverage: Coverage) => void = () => {}) {
  const coverage = emptyCoverage(), pages: PreparedPage[] = [], failures: { page: number; reason: AssistanceReason }[] = []
  if (selected && (!selected.length || selected.length > 4 || new Set(selected).size !== selected.length || selected.some(page => !Number.isInteger(page) || page < 1 || page > bounds.pdfPages))) throw new PreparationError('page-selection')
  coverage.selected = selected ? [...selected].sort((a, b) => a - b) : [1]
  const started = performance.now()
  let bytes = 0, pixels = 0
  for (let index = 0; index < coverage.selected.length; index++) {
    const number = coverage.selected[index]
    try {
      const remaining = bounds.preparationMilliseconds - (performance.now() - started)
      if (remaining <= 0) throw new PreparationError('preparation-timeout', coverage.totalPages)
      const page = await preparePage(source, signal, number, !!selected, remaining)
      coverage.totalPages = page.totalPages
      if (selected?.some(number => number > page.totalPages)) throw new PreparationError('page-selection', page.totalPages)
      if (!selected) coverage.selected = sourcePages(page.totalPages)
      bytes += page.bytes.byteLength; pixels += page.manifest.width * page.manifest.height
      if (bytes > bounds.combinedBytes || pixels > bounds.combinedPixels) throw new PreparationError('prepared-limit', page.totalPages)
      pages.push(page); coverage.prepared.push(number)
    } catch (error) {
      if (signal.aborted) throw error
      if (!(error instanceof PreparationError)) throw error
      coverage.totalPages ??= error.totalPages
      if (!selected && coverage.totalPages && coverage.totalPages <= 4) coverage.selected = sourcePages(coverage.totalPages)
      if (['page-selection', 'prepared-limit', 'source-limit'].includes(error.reason)) {
        if (!selected && error.reason === 'page-selection') coverage.selected = []
        if (error.reason === 'prepared-limit') coverage.failed.push(number)
        progress({ ...coverage, unchecked: sourcePages(coverage.totalPages ?? 1), uncheckedCount: coverage.totalPages })
        throw error
      }
      failures.push({ page: number, reason: error.reason }); coverage.failed.push(number)
      if (coverage.totalPages === null) { progress(coverage); throw error }
    }
    coverage.unchecked = sourcePages(coverage.totalPages ?? 1); coverage.uncheckedCount = coverage.totalPages
    progress(structuredClone(coverage))
  }
  return { pages, coverage, failures }
}
