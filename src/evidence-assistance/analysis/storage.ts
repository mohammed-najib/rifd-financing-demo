import type { Result } from '../../demo/types'
import type { EvidenceRun, SelectedEvidence } from '../contract'
import { contextKey, readRecord } from './record'

// Financing writes and analysis writes share this lock, including reset. Browsers
// without Web Locks retain ordinary financing and temporary assistance only.
export async function withAnalysisAuthority<T>(work: () => Promise<T>): Promise<T> {
  return navigator.locks ? await navigator.locks.request('rifd-analysis-authority-v1', work) : await work()
}

type Entry = { schemaVersion: 1; datasetId: string; generation: string; clearGeneration: string; latest: EvidenceRun | null }
export type AnalysisTicket = { key: string; generation: string; clearGeneration: string }
export type StoredAnalysis = { generation: string; clearGeneration: string; latest: EvidenceRun | null; incompatible: boolean }

export function createAnalysisStorage(currentDataset: () => Promise<string>, announce: (datasetId: string) => void) {
  let db: IDBDatabase | null = null
  let opening: Promise<IDBDatabase> | null = null
  let closed = false
  let lifetime = 0
  const open = (): Promise<IDBDatabase> => {
    if (closed || !navigator.locks) return Promise.reject(new Error('analysis-storage'))
    if (db) return Promise.resolve(db)
    opening ??= new Promise<IDBDatabase>((resolve, reject) => {
      const captured = lifetime
      let refused = false
      const timer = setTimeout(() => { refused = true; reject(new Error('analysis-storage')) }, 1000)
      const request = indexedDB.open('rifd-evidence-analysis', 1)
      request.onupgradeneeded = () => { if (refused || closed || captured !== lifetime) request.transaction!.abort(); else request.result.createObjectStore('contexts') }
      request.onblocked = request.onerror = () => { refused = true; clearTimeout(timer); reject(new Error('analysis-storage')) }
      request.onsuccess = () => {
        clearTimeout(timer)
        const connection = request.result
        if (refused || closed || captured !== lifetime || connection.objectStoreNames.length !== 1 || !connection.objectStoreNames.contains('contexts')) { connection.close(); reject(new Error('analysis-storage')); return }
        try {
          const store = connection.transaction('contexts').objectStore('contexts')
          if (store.keyPath !== null || store.autoIncrement || store.indexNames.length) throw new Error('analysis-storage')
          connection.onversionchange = connection.onclose = () => { connection.close(); if (db === connection) db = null }
          db = connection; resolve(connection)
        } catch { connection.close(); reject(new Error('analysis-storage')) }
      }
    }).finally(() => { opening = null })
    return opening
  }
  const transaction = async <T>(work: (store: IDBObjectStore, finish: (value: T) => void) => void, valid: () => boolean = () => true): Promise<T> => {
    const connection = await open()
    return new Promise<T>((resolve, reject) => {
      const tx = connection.transaction('contexts', 'readwrite')
      let result: T
      let finished = false
      const timer = setTimeout(() => { try { tx.abort() } catch { /* A lost completion can follow a commit. */ } reject(new Error('analysis-storage')) }, 1000)
      const fail = () => { clearTimeout(timer); reject(new Error('analysis-storage')) }
      tx.onabort = fail
      tx.onerror = () => { /* Abort is terminal. */ }
      tx.oncomplete = () => { clearTimeout(timer); if (finished && valid()) resolve(result); else reject(new Error('analysis-storage')) }
      try {
        if (!valid()) { tx.abort(); return }
        work(tx.objectStore('contexts'), value => {
          if (!valid()) { tx.abort(); return }
          result = value; finished = true
        })
      } catch { tx.abort() }
    })
  }
  const entry = (raw: unknown, datasetId: string): Entry => {
    if (!raw || typeof raw !== 'object') return { schemaVersion: 1, datasetId, generation: '', clearGeneration: '', latest: null }
    const value = raw as Partial<Entry>
    if (value.schemaVersion !== 1 || value.datasetId !== datasetId || typeof value.generation !== 'string' || typeof value.clearGeneration !== 'string') throw new Error('analysis-storage')
    return value as Entry
  }
  const authorized = async <T>(selection: Pick<SelectedEvidence, 'binding'>, work: () => Promise<T>): Promise<T> => withAnalysisAuthority(async () => {
    if (await currentDataset() !== selection.binding.datasetId) throw new Error('analysis-authority')
    return work()
  })
  return {
    async clean() {
      return withAnalysisAuthority(async () => {
        const datasetId = await currentDataset()
        await transaction<void>((store, finish) => {
          const request = store.openCursor()
          request.onsuccess = () => {
            const cursor = request.result
            if (!cursor) { finish(); return }
            const value = cursor.value as Partial<Entry> | null
            // Read-time validation still rejects incompatible records in this dataset.
            if (!value || value.datasetId !== datasetId || value.latest && readRecord(value.latest) && Date.parse(value.latest.expiresAt) <= Date.now()) cursor.delete()
            cursor.continue()
          }
        })
      })
    },
    read(selection: SelectedEvidence): Promise<StoredAnalysis> {
      return authorized(selection, () => transaction((store, finish) => {
        const key = contextKey(selection.binding), request = store.get(key)
        request.onsuccess = () => {
          try {
            const saved = entry(request.result, selection.binding.datasetId)
            const latest = saved.latest ? readRecord(saved.latest) : null
            const incompatible = !!saved.latest && (!latest || contextKey(latest.provenance.binding) !== key)
            if (incompatible) { finish({ generation: saved.generation, clearGeneration: saved.clearGeneration, latest: null, incompatible: true }); return }
            if (latest && Date.parse(latest.expiresAt) <= Date.now()) {
              store.put({ ...saved, latest: null }, key)
              finish({ generation: saved.generation, clearGeneration: saved.clearGeneration, latest: null, incompatible: false })
            } else finish({ generation: saved.generation, clearGeneration: saved.clearGeneration, latest, incompatible: false })
          } catch { finish({ generation: '', clearGeneration: '', latest: null, incompatible: true }) }
        }
      }))
    },
    begin(selection: SelectedEvidence, valid: () => boolean): Promise<AnalysisTicket> {
      return authorized(selection, async () => {
        const key = contextKey(selection.binding), generation = crypto.randomUUID()
        let clearGeneration: string = crypto.randomUUID()
        await transaction<void>((store, finish) => {
          const request = store.get(key)
          request.onsuccess = () => {
            let previous: EvidenceRun | null = null
            try { const saved = entry(request.result, selection.binding.datasetId); previous = readRecord(saved.latest); clearGeneration = saved.clearGeneration || clearGeneration } catch { /* A fresh explicit run replaces incompatible storage. */ }
            store.put({ schemaVersion: 1, datasetId: selection.binding.datasetId, generation, clearGeneration, latest: previous }, key)
            finish()
          }
        }, valid)
        announce(selection.binding.datasetId)
        return { key, generation, clearGeneration }
      })
    },
    retain(selection: SelectedEvidence, ticket: AnalysisTicket, run: EvidenceRun, valid: () => boolean, resolve: () => Promise<Result<SelectedEvidence>>): Promise<boolean> {
      return authorized(selection, async () => {
        const current = await resolve()
        if (!current.ok || !current.value.binding.durable || current.value.binding.dependencyKey !== selection.binding.dependencyKey) return false
        if (!readRecord(run)) throw new Error('analysis-record')
        const retained = await transaction<boolean>((store, finish) => {
          const request = store.get(ticket.key)
          request.onsuccess = () => {
            const saved = entry(request.result, selection.binding.datasetId)
            if (saved.generation !== ticket.generation || !valid()) { finish(false); return }
            const write = store.put({ ...saved, latest: { ...run, temporary: false } }, ticket.key)
            write.onsuccess = () => { if (!valid()) store.transaction.abort() }
            finish(true)
          }
        }, valid)
        if (retained) announce(selection.binding.datasetId)
        return retained
      })
    },
    clear(selection: Pick<SelectedEvidence, 'binding'>, valid: () => boolean): Promise<void> {
      return authorized(selection, async () => {
        await transaction<void>((store, finish) => {
          store.put({ schemaVersion: 1, datasetId: selection.binding.datasetId, generation: crypto.randomUUID(), clearGeneration: crypto.randomUUID(), latest: null }, contextKey(selection.binding)); finish()
        }, valid)
        announce(selection.binding.datasetId)
      })
    },
    start() { closed = false },
    close() { closed = true; lifetime++; db?.close(); db = null },
  }
}
export type AnalysisStorage = ReturnType<typeof createAnalysisStorage>
