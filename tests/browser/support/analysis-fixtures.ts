import type { Fields } from '../../../src/domain/model'
import type { DraftDocuments, PreparedAttachment } from '../../../src/demo'
import { identityInput } from './evidence-fixtures'

export async function saveIdentity(fields: Partial<Fields> = {}, attachment?: PreparedAttachment) {
  const demo = window.demo
  const context = await demo.context(), view = await demo.readApplication(identityInput.applicationId)
  if (!context.ok || !view.ok || view.value.role !== 'applicant' || !view.value.workspace) throw new Error('fixture')
  const workspace = view.value.workspace
  const documents = Object.fromEntries(Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as DraftDocuments
  if (attachment) documents.identity = { kind: 'prepared', attachment }
  const result = await demo.execute({ kind: 'saveDraft', datasetId: context.value.datasetId, applicationId: identityInput.applicationId, operationId: crypto.randomUUID(), expectedWorkspaceRevision: workspace.revision, product: view.value.product, fields: { ...workspace.snapshot.fields, ...fields }, documents })
  if (!result.ok) throw new Error(result.error.kind)
  return result.value
}

// Storage faults are injected at the browser boundary. Assertions use Demo reads.
export function refuseAnalysisStorage() {
  const open = indexedDB.open.bind(indexedDB)
  indexedDB.open = (name, version) => {
    if (name === 'rifd-evidence-analysis') throw new DOMException('Analysis refused', 'SecurityError')
    return version === undefined ? open(name) : open(name, version)
  }
}

export function abortNextAnalysisRetention() {
  const put = IDBObjectStore.prototype.put
  IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
    const request = put.apply(this, args)
    const value = args[0]
    if (this.transaction.db.name === 'rifd-evidence-analysis' && value?.latest?.temporary === false) {
      IDBObjectStore.prototype.put = put
      request.addEventListener('success', () => this.transaction.abort())
    }
    return request
  }
}

export async function alterAnalysis(change: (run: Record<string, unknown>) => void) {
  await new Promise<void>((resolve, reject) => {
    const open = indexedDB.open('rifd-evidence-analysis', 1)
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const db = open.result, tx = db.transaction('contexts', 'readwrite'), cursor = tx.objectStore('contexts').openCursor()
      cursor.onsuccess = () => {
        const current = cursor.result
        if (!current) return
        const entry = current.value
        if (entry.latest) { change(entry.latest); current.update(entry) }
        current.continue()
      }
      tx.oncomplete = () => { db.close(); resolve() }
      tx.onabort = () => { db.close(); reject(tx.error) }
    }
  })
}
