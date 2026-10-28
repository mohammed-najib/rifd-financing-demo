import type { Dataset } from '../../../src/domain/model'

// A persisted display fixture for pagination, not evidence of correction actions.
// It is isolated to each test's browser context and never ships with the app.
export function extendPrintHistory(): Promise<void> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('rifd-demo', 1)
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const db = open.result
      const tx = db.transaction('state', 'readwrite')
      const store = tx.objectStore('state')
      const read = store.get('dataset')
      read.onsuccess = () => {
        const data: Dataset = read.result
        const application = data.applications.find(value => value.id === 'RIFD-2026-005')!
        const final = application.history.pop()!
        for (let round = 1; round <= 12; round++) {
          const reason = { ar: `جولة ${round}. مستند افتراضي لمتجر صنعاء Textile supplies، المرجع RIFD-2026-005. نرجو توضيح تفاصيل الشراء والقيمة المطلوبة قبل إعادة التقديم.`, en: `Round ${round}. Fictional evidence for متجر صنعاء Textile supplies, reference RIFD-2026-005. Please clarify the purchase details and requested amount before resubmitting.` }
          for (const kind of ['correctionsRequested', 'resubmitted'] as const) application.history.push({ id: `print-${round}-${kind}`, sequence: ++data.meta.eventSequence, date: '2026-07-06', kind, reason })
        }
        application.history.push({ ...final, sequence: ++data.meta.eventSequence })
        store.put(data, 'dataset')
      }
      tx.oncomplete = () => { db.close(); resolve() }
      tx.onabort = () => { db.close(); reject(tx.error) }
    }
  })
}
