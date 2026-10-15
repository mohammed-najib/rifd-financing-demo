import { datasetSchema, slots, type Dataset, type DocumentSlot, type Snapshot } from '../domain/model'
import type { ErrorKind } from './types'
import { manifest } from './seed-manifest'
import type { FieldIssue } from '../domain'

export class DemoError extends Error {
  constructor(readonly kind: ErrorKind, readonly slot?: DocumentSlot, readonly fieldIssues?: FieldIssue[]) { super(kind) }
}

export function openStorage(onClose: () => void): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let refused = false
    const request = indexedDB.open('rifd-demo', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('state')
    request.onblocked = () => { refused = true; reject(new DemoError('blocked')) }
    request.onerror = () => reject(new DemoError(request.error?.name === 'VersionError' ? 'unsupported' : 'storage'))
    request.onsuccess = () => {
      const db = request.result
      if (refused) { db.close(); return }
      db.onversionchange = () => { db.close(); onClose() }
      db.onclose = onClose
      resolve(db)
    }
  })
}

export function readStored(db: IDBDatabase): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('state', 'readonly')
    const request = tx.objectStore('state').get('dataset')
    tx.oncomplete = () => resolve(request.result)
    tx.onabort = () => reject(new DemoError('storage'))
    tx.onerror = () => reject(new DemoError('storage'))
  })
}

// The callback is synchronous. No file/network work or awaited task runs inside the transaction.
export function transact(db: IDBDatabase, change: (current: unknown) => Dataset, abortWrite?: () => boolean): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('state', 'readwrite')
    const store = tx.objectStore('state')
    const request = store.get('dataset')
    let result: Dataset
    let refusal: unknown
    const timeout = setTimeout(() => reject(new DemoError('outcomeUnknown')), 10_000)
    request.onsuccess = () => {
      try {
        result = change(request.result)
        const write = store.put(result, 'dataset')
        // Abort after a successful put to exercise rollback of all staged effects.
        write.onsuccess = () => {
          try { if (abortWrite?.()) { refusal = new DemoError('storage'); tx.abort() } }
          catch (error) { refusal = error; tx.abort() }
        }
      }
      catch (error) { refusal = error; tx.abort() }
    }
    tx.oncomplete = () => { clearTimeout(timeout); resolve(result) }
    tx.onabort = () => { clearTimeout(timeout); reject(refusal ?? new DemoError('storage')) }
    tx.onerror = () => { /* Abort is the final outcome. */ }
  })
}

export function validateDataset(raw: unknown): Dataset {
  if (typeof raw !== 'object' || raw === null) throw new DemoError('damaged')
  const versions = (raw as { meta?: { schemaVersion?: unknown; seedVersion?: unknown; ruleVersion?: unknown } }).meta
  if (versions && (versions.schemaVersion !== 1 || versions.seedVersion !== 1 || versions.ruleVersion !== 1)) throw new DemoError('unsupported')
  const parsed = datasetSchema.safeParse(raw)
  if (!parsed.success) throw new DemoError('damaged')
  const data = parsed.data
  const unique = (ids: string[]) => new Set(ids).size === ids.length
  if (![data.applications, data.files, data.identities, data.catalog, data.notifications].every(items => unique(items.map(item => item.id)))) throw new DemoError('damaged')
  const fileMap = new Map(data.files.map(file => [file.id, file]))
  const applicationMap = new Map(data.applications.map(application => [application.id, application]))
  const snapshotValid = (snapshot: Snapshot, id: string) => slots.every(slot => {
    const ref = snapshot.documents[slot]
    return ref === null || fileMap.get(ref)?.applicationId === id && fileMap.get(ref)?.slot === slot
  })
  for (const application of data.applications) {
    if (!data.identities.some(identity => identity.id === application.owner && identity.role === 'applicant')) throw new DemoError('damaged')
    if (application.assignee && !data.identities.some(identity => identity.id === application.assignee && identity.role === 'reviewer')) throw new DemoError('damaged')
    if ((application.status === 'draft') !== (application.submitted === null) || (application.status === 'approved') !== (application.repayment !== null)) throw new DemoError('damaged')
    if (['underReview', 'correctionsRequested', 'approved', 'rejected'].includes(application.status) && !application.assignee) throw new DemoError('damaged')
    const snapshots = [application.submitted, application.workspace?.snapshot, ...application.rounds.flatMap(round => [round.baseline, round.response])].filter((snapshot): snapshot is Snapshot => !!snapshot)
    if (!snapshots.every(snapshot => snapshotValid(snapshot, application.id))) throw new DemoError('damaged')
    if (application.status === 'draft' && (!application.workspace || application.history.length || application.assessments || application.checks)) throw new DemoError('damaged')
    if (application.status === 'correctionsRequested' && (!application.workspace || application.rounds.at(-1)?.id !== application.workspace.roundId)) throw new DemoError('damaged')
  }
  for (const file of data.files) if (file.size !== file.bytes.byteLength || !applicationMap.has(file.applicationId)) throw new DemoError('damaged')
  for (const sample of data.catalog) {
    if (fileMap.get(sample.fileId)?.applicationId !== sample.applicationId || fileMap.get(sample.fileId)?.slot !== sample.slot) throw new DemoError('damaged')
    // Additive migration: legacy catalog bytes retain their original seed product after draft switches.
    sample.product ??= manifest.find(seed => sample.applicationId === `RIFD-2026-${String(seed.number).padStart(3, '0')}`)?.product
    if (!sample.product) throw new DemoError('damaged')
  }
  for (const notice of data.notifications) if (applicationMap.get(notice.applicationId)?.owner !== notice.owner) throw new DemoError('damaged')
  if (!unique(data.mutationReceipts.map(receipt => `${receipt.actor}/${receipt.operationId}`))) throw new DemoError('damaged')
  for (const receipt of data.mutationReceipts) {
    const application = applicationMap.get(receipt.applicationId)
    const allowed = receipt.kind === 'saveDraft' || receipt.kind === 'submit' || receipt.kind === 'saveCorrections' ? application?.owner === receipt.actor : !!application && application.status !== 'draft' && receipt.actor === 'salma'
    if (receipt.datasetId !== data.meta.datasetId || !allowed || data.receipts.some(existing => existing.actor === receipt.actor && existing.operationId === receipt.operationId)) throw new DemoError('damaged')
  }
  return data
}
