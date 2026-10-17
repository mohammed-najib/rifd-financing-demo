import { bounds, type AssistanceReason, type EvidenceSource, type PreparedPage } from './contract'

export class PreparationError extends Error {
  constructor(public reason: AssistanceReason, public totalPages: number | null = null) { super(reason) }
}

export function preparePage(source: EvidenceSource, signal: AbortSignal): Promise<PreparedPage> {
  if (!source.bytes.byteLength || source.bytes.byteLength > bounds.sourceBytes) return Promise.reject(new PreparationError('source-limit'))
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException('Cancelled', 'AbortError')); return }
    const worker = new Worker(new URL('./prepare.worker.ts', import.meta.url), { type: 'module' })
    const finish = () => { clearTimeout(timer); signal.removeEventListener('abort', abort); worker.terminate() }
    const abort = () => { finish(); reject(new DOMException('Cancelled', 'AbortError')) }
    const timer = setTimeout(() => { finish(); reject(new PreparationError('preparation-timeout')) }, Math.min(bounds.pageMilliseconds, bounds.preparationMilliseconds))
    signal.addEventListener('abort', abort, { once: true })
    worker.onerror = () => { finish(); reject(new PreparationError('invalid-source')) }
    worker.onmessage = (event: MessageEvent<{ kind?: string; page?: PreparedPage; reason?: AssistanceReason; totalPages?: number }>) => {
      if (event.data.kind !== 'prepared-evidence') return
      finish()
      if (event.data.page) resolve(event.data.page)
      else reject(new PreparationError(event.data.reason ?? 'invalid-source', event.data.totalPages ?? null))
    }
    const bytes = source.bytes.slice(0)
    worker.postMessage({ ...source, bytes }, [bytes])
  })
}
