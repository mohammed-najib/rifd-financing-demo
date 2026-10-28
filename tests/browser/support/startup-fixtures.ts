import type { Dataset } from '../../../src/domain/model'

declare global { interface Window { repairStartupFixture(): Promise<void> } }

export type DatasetDamage = 'catalog' | 'missingFile' | 'bytes' | 'shape' | 'schema' | 'seed' | 'rules' | 'identity' | 'sequence' | 'round' | 'legacy' | 'rawDraft'

// Isolated storage fixtures, never imported by the product or its public API harness.
export function damageDataset(mode: DatasetDamage): Promise<void> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('rifd-demo', 1)
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const db = open.result
      const tx = db.transaction('state', 'readwrite')
      const store = tx.objectStore('state')
      const request = store.get('dataset')
      request.onsuccess = () => {
        const original: Dataset = request.result
        const data = structuredClone(original)
        window.repairStartupFixture = () => new Promise((resolve, reject) => {
          const repair = indexedDB.open('rifd-demo', 1)
          repair.onerror = () => reject(repair.error)
          repair.onsuccess = () => {
            const connection = repair.result
            const write = connection.transaction('state', 'readwrite')
            write.objectStore('state').put(original, 'dataset')
            write.oncomplete = () => { connection.close(); resolve() }
            write.onabort = () => { connection.close(); reject(write.error) }
          }
        })
        switch (mode) {
          case 'catalog': data.catalog = []; break
          case 'missingFile': data.files.shift(); break
          case 'bytes': new Uint8Array(data.files[0].bytes)[0] = 0; break
          case 'shape': Object.assign(data.applications[0].workspace!.snapshot.fields, { amount: 123 }); break
          case 'schema': Object.assign(data.meta, { schemaVersion: 2 }); break
          case 'seed': Object.assign(data.meta, { seedVersion: 2 }); break
          case 'rules': Object.assign(data.meta, { ruleVersion: 2 }); break
          case 'identity': data.identities.find(identity => identity.id === 'salma')!.role = 'applicant'; break
          case 'sequence': data.meta.eventSequence = 0; break
          case 'round': data.applications.find(application => application.status === 'correctionsRequested')!.workspace!.roundId = null; break
          case 'legacy':
            Reflect.deleteProperty(data, 'mutationReceipts')
            data.catalog.forEach(sample => Reflect.deleteProperty(sample, 'product'))
            break
          case 'rawDraft': Object.assign(data.applications[0].workspace!.snapshot.fields, { amount: 'invalid amount', operatingSince: 'not a month', explanation: '' }); break
        }
        store.put(data, 'dataset')
      }
      tx.oncomplete = () => { db.close(); resolve() }
      tx.onabort = () => { db.close(); reject(tx.error) }
    }
  })
}
