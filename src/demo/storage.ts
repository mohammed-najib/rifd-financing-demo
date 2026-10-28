import { datasetSchema, slots, type Dataset, type DocumentSlot, type Snapshot } from '../domain/model'
import type { ErrorKind } from './types'
import { manifest } from './seed/manifest'
import type { FieldIssue } from '../domain'

export class DemoError extends Error {
  constructor(readonly kind: ErrorKind, readonly slot?: DocumentSlot, readonly fieldIssues?: FieldIssue[]) { super(kind) }
}

const minimumZeroBytes = 65_536
const maximumZeroBytes = 5_000_001

// The large all-zero boundary samples otherwise copy megabytes on every
// metadata write. This lossless stored representation keeps the domain's bytes.
export function encodeStored(data: Dataset): unknown {
  return { ...data, files: data.files.map(file => {
    const length = file.bytes.byteLength
    if (length < minimumZeroBytes || length > maximumZeroBytes) return file
    const words = new Uint32Array(file.bytes, 0, Math.floor(length / 4))
    for (let index = 0; index < words.length; index++) if (words[index] !== 0) return file
    const tail = new Uint8Array(file.bytes, words.byteLength)
    for (const byte of tail) if (byte !== 0) return file
    return { ...file, bytes: { encoding: 'rifd-zero-v1', byteLength: length } }
  }) }
}

function decodeStored(raw: Record<string, unknown>): unknown {
  if (!Array.isArray(raw.files)) return raw
  return { ...raw, files: raw.files.map(file => {
    if (!file || typeof file !== 'object' || !file.bytes || typeof file.bytes !== 'object' || file.bytes instanceof ArrayBuffer) return file
    const bytes = file.bytes as Record<string, unknown>
    const length = bytes.byteLength
    if (bytes.encoding !== 'rifd-zero-v1' || typeof length !== 'number' || !Number.isSafeInteger(length) || length < minimumZeroBytes || length > maximumZeroBytes || Object.keys(bytes).length !== 2) throw new DemoError('damaged')
    return { ...file, bytes: new ArrayBuffer(length) }
  }) }
}

export function openStorage(onClose: (kind: ErrorKind) => void): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let refused = false
    const request = indexedDB.open('rifd-demo')
    request.onupgradeneeded = () => {
      try {
        if (refused) request.transaction!.abort()
        else request.result.createObjectStore('state')
      } catch {
        refused = true
        try { request.transaction?.abort() } catch { /* An interrupted upgrade may already be aborted. */ }
        reject(new DemoError('storage'))
      }
    }
    request.onblocked = () => { refused = true; reject(new DemoError('blocked')) }
    request.onerror = () => reject(new DemoError(request.error?.name === 'VersionError' ? 'unsupported' : 'storage'))
    request.onsuccess = () => {
      const db = request.result
      if (refused) { db.close(); return }
      if (db.objectStoreNames.length !== 1 || !db.objectStoreNames.contains('state')) {
        db.close(); reject(new DemoError('damaged')); return
      }
      const store = db.transaction('state', 'readonly').objectStore('state')
      if (store.keyPath !== null || store.autoIncrement || store.indexNames.length) {
        db.close(); reject(new DemoError('damaged')); return
      }
      db.onversionchange = () => { db.close(); onClose('blocked') }
      db.onclose = () => onClose('storage')
      if (db.version > 1) {
        void readStored(db).then(raw => {
          const data = validateDataset(raw)
          if (data.meta.lastReset?.datasetId !== data.meta.datasetId) throw new DemoError('unsupported')
          resolve(db)
        }).catch(error => { db.close(); reject(error) })
      } else resolve(db)
    }
  })
}

export function readStored(db: IDBDatabase): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('state', 'readonly')
    const store = tx.objectStore('state')
    const count = store.count()
    const request = store.get('dataset')
    tx.oncomplete = () => {
      if (request.result === undefined && count.result !== 0) reject(new DemoError('damaged'))
      else resolve(request.result)
    }
    tx.onabort = () => reject(new DemoError('storage'))
    tx.onerror = () => reject(new DemoError('storage'))
  })
}

// The callback is synchronous. No file/network work or awaited task runs inside the transaction.
export function transact(db: IDBDatabase, change: (current: unknown) => Dataset, abortWrite?: () => boolean): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('state', 'readwrite')
    const store = tx.objectStore('state')
    const count = store.count()
    const request = store.get('dataset')
    let result: Dataset
    let refusal: unknown
    const timeout = setTimeout(() => reject(new DemoError('outcomeUnknown')), 10_000)
    request.onsuccess = () => {
      try {
        if (request.result === undefined && count.result !== 0) throw new DemoError('damaged')
        result = change(request.result)
        const write = store.put(encodeStored(result), 'dataset')
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
  // Run the same complete checks without compiling this large schema during a
  // cold navigation. Reads are dominated by storage and the deliberate delay.
  const parsed = datasetSchema.safeParse(decodeStored(raw as Record<string, unknown>), { jitless: true })
  if (!parsed.success) throw new DemoError('damaged')
  const data = parsed.data
  if (data.meta.lastReset && data.meta.lastReset.datasetId !== data.meta.datasetId) throw new DemoError('damaged')
  const unique = (ids: string[]) => new Set(ids).size === ids.length
  if (![data.applications, data.files, data.identities, data.catalog, data.notifications].every(items => unique(items.map(item => item.id)))) throw new DemoError('damaged')
  const fileMap = new Map(data.files.map(file => [file.id, file]))
  const applicationMap = new Map(data.applications.map(application => [application.id, application]))
  const snapshotValid = (snapshot: Snapshot, id: string) => slots.every(slot => {
    const ref = snapshot.documents[slot]
    return ref === null || fileMap.get(ref)?.applicationId === id && fileMap.get(ref)?.slot === slot
  })
  for (const application of data.applications) {
    if ([...application.history, ...application.activity].some(event => event.sequence > data.meta.eventSequence)) throw new DemoError('damaged')
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
  // Catalog assets survive edits and product switches, including replacements for later offline use.
  for (const seed of manifest) {
    const id = `RIFD-2026-${String(seed.number).padStart(3, '0')}`
    for (const slot of slots) {
      const variants = data.catalog.filter(sample => sample.applicationId === id && sample.slot === slot && sample.product === seed.product).map(sample => sample.variant)
      if (!variants.includes('original') || (seed.replacement === slot || seed.missing === slot) && (!variants.includes('replacement') || !variants.includes('identical'))) throw new DemoError('damaged')
    }
  }
  for (const notice of data.notifications) if (applicationMap.get(notice.applicationId)?.owner !== notice.owner) throw new DemoError('damaged')
  if (!unique(data.mutationReceipts.map(receipt => `${receipt.actor}/${receipt.operationId}`))) throw new DemoError('damaged')
  for (const receipt of data.mutationReceipts) {
    const application = applicationMap.get(receipt.applicationId)
    const allowed = receipt.kind === 'saveDraft' || receipt.kind === 'submit' || receipt.kind === 'saveCorrections' || receipt.kind === 'resubmit' ? application?.owner === receipt.actor : !!application && application.status !== 'draft' && receipt.actor === 'salma'
    if (receipt.datasetId !== data.meta.datasetId || !allowed || data.receipts.some(existing => existing.actor === receipt.actor && existing.operationId === receipt.operationId)) throw new DemoError('damaged')
  }
  return data
}
