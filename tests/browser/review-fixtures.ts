import type { Dataset } from '../../src/domain/model'

// Compatibility fixture for a receipt committed before inspection was required.
export function makeHistoricalAssessmentReceipt(operationId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('rifd-demo')
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const db = open.result
      const tx = db.transaction('state', 'readwrite')
      const store = tx.objectStore('state')
      const read = store.get('dataset')
      read.onsuccess = () => {
        const data: Dataset = read.result
        const receipt = data.mutationReceipts.find(receipt => receipt.operationId === operationId)!
        const intent = JSON.parse(receipt.fingerprint)
        delete intent.inspection
        receipt.fingerprint = JSON.stringify(intent)
        store.put(data, 'dataset')
      }
      tx.oncomplete = () => { db.close(); resolve() }
      tx.onabort = () => { db.close(); reject(tx.error) }
    }
  })
}
