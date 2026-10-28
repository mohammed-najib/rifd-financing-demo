import { datasetSchema, type Dataset, type ResetContext } from '../../domain/model'
import { DemoError, encodeStored, validateDataset } from '../storage'
import type { ResetInspection, ResetOperation, ResetResult } from '../types'

type StoreObservation = { name: string; keyPath: string | string[] | null; autoIncrement: boolean; indexes: unknown[]; keys: IDBValidKey[]; values: unknown[] }
type Observation = { version: number; stores: StoreObservation[] }
// A known historical receipt remains public even when ordinary schema readiness fails.
const resetMetadataSchema = datasetSchema.shape.meta.pick({ datasetId: true, lastReset: true })

// Recovery compares schema and record metadata synchronously. Recognized RIFD
// buffers compare exact bytes; opaque browser values such as Blob expose metadata.
function sameValue(left: unknown, right: unknown, seen = new Map<object, object>()): boolean {
  if (Object.is(left, right)) return true
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false
  if (seen.has(left)) return seen.get(left) === right
  seen.set(left, right)
  if (left instanceof ArrayBuffer && right instanceof ArrayBuffer) {
    const a = new Uint8Array(left), b = new Uint8Array(right)
    return a.length === b.length && a.every((byte, index) => byte === b[index])
  }
  if (ArrayBuffer.isView(left) && ArrayBuffer.isView(right)) {
    return Object.getPrototypeOf(left) === Object.getPrototypeOf(right) && sameValue(
      left.buffer.slice(left.byteOffset, left.byteOffset + left.byteLength),
      right.buffer.slice(right.byteOffset, right.byteOffset + right.byteLength), seen,
    )
  }
  if (left instanceof Date && right instanceof Date) return Object.is(left.getTime(), right.getTime())
  if (Array.isArray(left) !== Array.isArray(right) || Object.getPrototypeOf(left) !== Object.getPrototypeOf(right)) return false
  if (left instanceof Map && right instanceof Map) return sameValue([...left], [...right], seen)
  if (left instanceof Set && right instanceof Set) return sameValue([...left], [...right], seen)
  if (left instanceof Number || left instanceof String || left instanceof Boolean || Object.prototype.toString.call(left) === '[object BigInt]') return Object.is(left.valueOf(), right.valueOf())
  const metadataKeys = (value: object) => {
    const keys = new Set(Object.getOwnPropertyNames(value))
    for (let prototype = Object.getPrototypeOf(value); prototype && prototype !== Object.prototype; prototype = Object.getPrototypeOf(prototype)) {
      for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(prototype))) if (descriptor.get) keys.add(key)
    }
    return keys
  }
  const keys = metadataKeys(left), otherKeys = metadataKeys(right)
  return keys.size === otherKeys.size && [...keys].every(key => otherKeys.has(key) && sameValue(Reflect.get(left, key), Reflect.get(right, key), seen))
}

function rawDataset(observation: Observation): unknown {
  const store = observation.stores.find(store => store.name === 'state')
  return store?.values[store.keys.indexOf('dataset')]
}
function canonicalStore(observation: Observation): boolean {
  const store = observation.stores[0]
  return observation.stores.length === 1 && store.name === 'state' && store.keyPath === null && !store.autoIncrement && !store.indexes.length
}
function resetReplay(raw: unknown, command: ResetOperation): string | null {
  const parsed = resetMetadataSchema.safeParse((raw as Dataset | undefined)?.meta)
  if (!parsed.success) return null
  const receipt = parsed.data.lastReset
  if (receipt?.operationId !== command.operationId) return null
  if (!sameValue(receipt.context, command.context)) throw new DemoError('identifierMisuse')
  if (receipt.datasetId !== parsed.data.datasetId) throw new DemoError('damaged')
  return receipt.datasetId
}

// No schema changes occur while inspecting an existing database.
function openForReset(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rifd-demo')
    let refused = false
    request.onupgradeneeded = () => {
      if (refused) request.transaction!.abort()
      else request.result.createObjectStore('state')
    }
    request.onblocked = () => { refused = true; reject(new DemoError('blocked')) }
    request.onerror = () => reject(new DemoError('storage'))
    request.onsuccess = () => {
      const connection = request.result
      connection.onversionchange = () => connection.close()
      if (refused) connection.close(); else resolve(connection)
    }
  })
}

// All requests are queued synchronously. The final callback remains in an active transaction.
function observe(connection: IDBDatabase, tx: IDBTransaction, version: number, ready: (observation: Observation) => void) {
  const names = Array.from(connection.objectStoreNames)
  const observation: Observation = { version, stores: [] }
  let pending = names.length * 2
  if (!pending) { ready(observation); return }
  for (const name of names) {
    const store = tx.objectStore(name)
    const result: StoreObservation = { name, keyPath: store.keyPath, autoIncrement: store.autoIncrement, indexes: Array.from(store.indexNames, name => {
      const index = store.index(name)
      return { name, keyPath: index.keyPath, multiEntry: index.multiEntry, unique: index.unique }
    }), keys: [], values: [] }
    observation.stores.push(result)
    const keys = store.getAllKeys(), values = store.getAll()
    keys.onsuccess = () => { result.keys = keys.result; if (!--pending) ready(observation) }
    values.onsuccess = () => { result.values = values.result; if (!--pending) ready(observation) }
  }
}
function readObservation(connection: IDBDatabase): Promise<Observation> {
  if (!connection.objectStoreNames.length) return Promise.resolve({ version: connection.version, stores: [] })
  return new Promise((resolve, reject) => {
    const tx = connection.transaction(Array.from(connection.objectStoreNames), 'readonly')
    let result: Observation
    observe(connection, tx, connection.version, value => { result = value })
    tx.oncomplete = () => resolve(result)
    tx.onabort = () => reject(new DemoError('storage'))
  })
}

export function createResetStorage() {
  const observations = new Map<string, Observation>()
  const check = (observation: Observation, command: ResetOperation): ResetResult | null => {
    const raw = rawDataset(observation)
    const completed = resetReplay(raw, command)
    if (completed) return { datasetId: completed, replay: true }
    if (command.context.kind === 'dataset') {
      let current: Dataset
      try { current = validateDataset(raw) } catch { throw new DemoError('supersededDataset') }
      if (!canonicalStore(observation) || current.meta.datasetId !== command.context.datasetId) throw new DemoError('supersededDataset')
    } else if (!observations.has(command.context.token) || !sameValue(observations.get(command.context.token), observation)) throw new DemoError('supersededDataset')
    return null
  }
  return {
    async inspect(): Promise<ResetContext> {
      const connection = await openForReset()
      try {
        const observation = await readObservation(connection)
        try {
          const data = validateDataset(rawDataset(observation))
          if (!canonicalStore(observation) || observation.stores[0].keys.length !== 1 || observation.version > 1 && data.meta.lastReset?.datasetId !== data.meta.datasetId) throw new DemoError('unsupported')
          return { kind: 'dataset', datasetId: data.meta.datasetId }
        } catch {
          const token = crypto.randomUUID()
          observations.clear(); observations.set(token, observation)
          return { kind: 'recovery', token }
        }
      } finally { connection.close() }
    },
    async replay(command: ResetOperation): Promise<string | null> {
      const connection = await openForReset()
      try { return resetReplay(rawDataset(await readObservation(connection)), command) }
      finally { connection.close() }
    },
    async inspectOperation(command: ResetOperation): Promise<ResetInspection> {
      const connection = await openForReset()
      try {
        const result = check(await readObservation(connection), command)
        return result ? { status: 'committed', result } : { status: 'notCommitted' }
      } finally { connection.close() }
    },
    async replace(command: ResetOperation, seed: Dataset, abort: () => boolean): Promise<ResetResult> {
      const connection = await openForReset()
      const before = await readObservation(connection).catch(error => { connection.close(); throw error })
      seed.meta.lastReset = { operationId: command.operationId, context: command.context, fingerprint: 'resetDemo:confirmed', datasetId: seed.meta.datasetId }
      const rebuild = !canonicalStore(before)
      return new Promise((resolve, reject) => {
        let refusal: unknown
        let result: ResetResult
        let refused = false
        let activeConnection = connection
        const timeout = setTimeout(() => { activeConnection.close(); reject(new DemoError('outcomeUnknown')) }, 10_000)
        const stage = (target: IDBDatabase, tx: IDBTransaction, oldVersion: number) => {
          activeConnection = target
          const fail = (error: unknown) => { refusal = error; tx.abort() }
          observe(target, tx, oldVersion, current => {
            try {
              const replay = check(current, command)
              if (replay) { result = replay; if (rebuild) fail(new DemoError('supersededDataset')); return }
              if (rebuild) {
                for (const name of Array.from(target.objectStoreNames)) target.deleteObjectStore(name)
                target.createObjectStore('state')
              } else tx.objectStore('state').clear()
              const write = tx.objectStore('state').put(encodeStored(seed), 'dataset')
              result = { datasetId: seed.meta.datasetId, replay: false }
              write.onsuccess = () => { try { if (abort()) fail(new DemoError('storage')) } catch (error) { fail(error) } }
            } catch (error) { fail(error) }
          })
          tx.onabort = () => { clearTimeout(timeout); target.close(); reject(refusal ?? new DemoError('storage')) }
          tx.onerror = () => { /* Abort supplies the final outcome. */ }
          if (!rebuild) tx.oncomplete = () => { clearTimeout(timeout); target.close(); resolve(result) }
        }
        if (!rebuild) { stage(connection, connection.transaction(Array.from(connection.objectStoreNames), 'readwrite'), connection.version); return }
        const version = connection.version
        connection.close()
        const request = indexedDB.open('rifd-demo', version + 1)
        request.onblocked = () => { refused = true; clearTimeout(timeout); reject(new DemoError('blocked')) }
        request.onupgradeneeded = event => {
          if (refused) { request.transaction!.abort(); return }
          stage(request.result, request.transaction!, event.oldVersion)
        }
        request.onerror = () => { clearTimeout(timeout); reject(refusal ?? new DemoError('storage')) }
        request.onsuccess = () => {
          clearTimeout(timeout); request.result.close()
          if (refused || !result) reject(new DemoError('supersededDataset')); else resolve(result)
        }
      })
    },
    clear() { observations.clear() },
  }
}
