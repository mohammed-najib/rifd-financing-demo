import { expect, test } from '@playwright/test'
import { damageDataset } from '../support/startup-fixtures'
import type { DatasetDamage } from '../support/startup-fixtures'

test.describe.configure({ mode: 'parallel' })

test('nonempty storage without its dataset requires recovery and preserves its records', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const open = indexedDB.open('rifd-demo', 1)
    open.onupgradeneeded = () => open.result.createObjectStore('state')
    open.onsuccess = () => {
      const db = open.result
      const tx = db.transaction('state', 'readwrite')
      tx.objectStore('state').put('Existing data', 'unrecognized-record')
      tx.oncomplete = () => { db.close(); resolve() }
      tx.onabort = () => reject(tx.error)
    }
    open.onerror = () => reject(open.error)
  }))
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: false, error: { kind: 'damaged' } })
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: false, error: { kind: 'damaged' } })
})

test('readable but unwritable session storage requires recovery before sign-in', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(() => {
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (this === sessionStorage) throw new DOMException('Fixture quota', 'QuotaExceededError')
      return setItem.call(this, key, value)
    }
  })
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: false, error: { kind: 'storage' } })
  expect(await page.evaluate(() => window.demo.listApplications())).toMatchObject({ ok: false })
})

test('missing prepared samples refuse readiness until the saved dataset is repaired', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  const original = await page.evaluate(() => window.demo.startup())
  if (!original.ok) throw new Error('Startup failed')
  await page.evaluate(() => window.demo.dispose())
  await page.evaluate(damageDataset, 'catalog' as const)
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: false, error: { kind: 'damaged' } })
  await page.evaluate(() => window.repairStartupFixture())
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true, value: { datasetId: original.value.datasetId } })
})

for (const mode of ['missingFile', 'bytes', 'shape', 'schema', 'seed', 'rules', 'identity', 'sequence', 'round'] satisfies DatasetDamage[]) {
  test(`${mode} damage preserves the dataset through refused startup and explicit retry`, async ({ page }) => {
    await page.goto('/tests/browser/support/api.html')
    await page.waitForFunction(() => window.demo)
    const original = await page.evaluate(() => window.demo.startup())
    if (!original.ok) throw new Error('Startup failed')
    await page.evaluate(() => window.demo.dispose())
    await page.evaluate(damageDataset, mode)
    const kind = ['schema', 'seed', 'rules'].includes(mode) ? 'unsupported' : 'damaged'
    expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: false, error: { kind } })
    expect(await page.evaluate(() => window.demo.context())).toMatchObject({ ok: false })
    await page.evaluate(() => window.repairStartupFixture())
    expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true, value: { datasetId: original.value.datasetId } })
    const records = await page.evaluate(async () => { await window.demo.signIn('salma'); return window.demo.listApplications() })
    expect(records.ok && records.value).toHaveLength(12)
  })
}

for (const mode of ['legacy', 'rawDraft'] satisfies DatasetDamage[]) {
  test(`${mode} remains usable alongside the incomplete Submitted seed`, async ({ page }) => {
    await page.goto('/tests/browser/support/api.html')
    await page.waitForFunction(() => window.demo)
    const original = await page.evaluate(() => window.demo.startup())
    if (!original.ok) throw new Error('Startup failed')
    await page.evaluate(() => window.demo.dispose())
    await page.evaluate(damageDataset, mode)
    expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true, value: { datasetId: original.value.datasetId } })
    const reads = await page.evaluate(async () => {
      await window.demo.signIn('mariam')
      const draft = await window.demo.readApplication('RIFD-2026-001')
      const samples = await window.demo.listSamples('RIFD-2026-001')
      await window.demo.signIn('salma')
      return { draft, samples, incomplete: await window.demo.readApplication('RIFD-2026-003') }
    })
    expect(reads.incomplete).toMatchObject({ ok: true, value: { status: 'submitted', snapshot: { documents: { financial: null } } } })
    expect(reads.samples.ok && reads.samples.value.every(sample => sample.product === 'inventory')).toBe(true)
    if (mode === 'rawDraft') expect(reads.draft).toMatchObject({ ok: true, value: { snapshot: { fields: { amount: 'invalid amount', operatingSince: 'not a month', explanation: '' } } } })
  })
}

for (const fault of ['denied', 'failedOpen', 'sessionRead', 'sessionRemove'] as const) {
  test(`${fault} startup can be retried explicitly after storage becomes available`, async ({ page }) => {
    await page.goto('/tests/browser/support/api.html')
    await page.waitForFunction(() => window.demo)
    await page.evaluate(fault => {
      if (fault === 'denied' || fault === 'failedOpen') {
        const open = IDBFactory.prototype.open
        IDBFactory.prototype.open = function (...args: Parameters<IDBFactory['open']>) {
          if (fault === 'denied') throw new DOMException('Fixture denial', 'SecurityError')
          const request = open.apply(this, args)
          request.addEventListener('upgradeneeded', () => request.transaction!.abort())
          return request
        }
        window.repairStartupFixture = async () => { IDBFactory.prototype.open = open }
      } else {
        const method = fault === 'sessionRead' ? 'getItem' : 'removeItem'
        const descriptor = Object.getOwnPropertyDescriptor(Storage.prototype, method)!
        Object.defineProperty(Storage.prototype, method, { configurable: true, value() { throw new DOMException('Fixture denial', 'SecurityError') } })
        window.repairStartupFixture = async () => { Object.defineProperty(Storage.prototype, method, descriptor) }
      }
    }, fault)
    expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: false, error: { kind: 'storage' } })
    expect(await page.evaluate(() => window.demo.signIn('mariam'))).toMatchObject({ ok: false })
    await page.evaluate(() => window.repairStartupFixture())
    expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true, value: { session: null } })
    expect(await page.evaluate(() => window.demo.signIn('mariam'))).toMatchObject({ ok: true })
  })
}

test('a blocked open cannot upgrade in the background after refusing startup', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const open = indexedDB.open('rifd-demo', 1)
    open.onupgradeneeded = () => open.result.createObjectStore('state')
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const blocker = open.result
      const nativeOpen = IDBFactory.prototype.open
      IDBFactory.prototype.open = function (name) {
        IDBFactory.prototype.open = nativeOpen
        const request = nativeOpen.call(this, name, 2)
        window.repairStartupFixture = () => new Promise(resolve => {
          request.addEventListener('error', () => resolve())
          request.addEventListener('success', () => { request.result.close(); resolve() })
          blocker.close()
        })
        return request
      }
      resolve()
    }
  }))
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: false, error: { kind: 'blocked' } })
  await page.evaluate(() => window.repairStartupFixture())
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true })
})

for (const closure of ['unexpected', 'versionchange'] as const) {
  test(`${closure} closes protected access and retries with the same saved dataset and session`, async ({ page }) => {
    await page.goto('/tests/browser/support/api.html')
    await page.waitForFunction(() => window.demo)
    await page.evaluate(closure => {
      const nativeOpen = IDBFactory.prototype.open
      IDBFactory.prototype.open = function (...args: Parameters<IDBFactory['open']>) {
        IDBFactory.prototype.open = nativeOpen
        const request = nativeOpen.apply(this, args)
        request.addEventListener('success', () => {
          const db = request.result
          window.repairStartupFixture = () => new Promise(resolve => {
            if (closure === 'unexpected') {
              db.close(); db.dispatchEvent(new Event('close')); resolve()
            } else {
              const upgrade = indexedDB.open('rifd-demo', 2)
              upgrade.onupgradeneeded = () => upgrade.transaction!.abort()
              upgrade.onerror = () => resolve()
            }
          })
        })
        return request
      }
    }, closure)
    const original = await page.evaluate(() => window.demo.startup())
    if (!original.ok) throw new Error('Startup failed')
    await page.evaluate(() => window.demo.signIn('mariam'))
    await page.evaluate(() => window.repairStartupFixture())
    expect(await page.evaluate(() => window.demo.context())).toMatchObject({ ok: false, error: { kind: closure === 'unexpected' ? 'storage' : 'blocked' } })
    expect(await page.evaluate(() => window.demo.listApplications())).toMatchObject({ ok: false })
    expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true, value: { datasetId: original.value.datasetId, session: { identity: 'mariam' } } })
    const records = await page.evaluate(() => window.demo.listApplications())
    expect(records.ok && records.value).toHaveLength(5)
  })
}

test('quota refusal preserves saved fields and files and permits an explicit retry of ready bytes', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const start = await window.demo.startup()
    if (!start.ok) throw new Error('Startup failed')
    await window.demo.signIn('mariam')
    const draft = await window.demo.readApplication('RIFD-2026-001')
    if (!draft.ok || draft.value.role !== 'applicant') throw new Error('No draft')
    const ready = await window.demo.prepareAttachment({ datasetId: start.value.datasetId, applicationId: draft.value.id, slot: 'purchase', selectionId: crypto.randomUUID(), source: { kind: 'sample', sampleId: 'RIFD-2026-001-purchase-original' } })
    if (!ready.ok) throw new Error('No prepared file')
    window.draftCommand = {
      kind: 'saveDraft', datasetId: start.value.datasetId, operationId: 'quota-retry', applicationId: draft.value.id,
      expectedWorkspaceRevision: draft.value.workspace!.revision, product: draft.value.product,
      fields: { ...draft.value.snapshot.fields, explanation: 'Keep this offline save' },
      documents: {
        identity: { kind: 'saved', fileId: draft.value.snapshot.documents.identity },
        business: { kind: 'saved', fileId: draft.value.snapshot.documents.business },
        financial: { kind: 'saved', fileId: draft.value.snapshot.documents.financial },
        purchase: { kind: 'prepared', attachment: ready.value },
      },
    }
    const put = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
      IDBObjectStore.prototype.put = put
      throw new DOMException(`Fixture quota for ${args[1]}`, 'QuotaExceededError')
    }
    const refused = await window.demo.execute(window.draftCommand)
    const unchanged = await window.demo.readApplication(draft.value.id)
    const retained = await window.demo.readPrepared(draft.value.id, ready.value)
    const inspected = await window.demo.inspectOperation(window.draftCommand)
    const retried = await window.demo.execute(window.draftCommand)
    return { refused, unchanged, retained: retained.ok ? retained.value.hash : null, hash: ready.value.hash, inspected, retried }
  })
  expect(result.refused).toMatchObject({ ok: false, error: { kind: 'storage' } })
  expect(result.unchanged).toMatchObject({ ok: true, value: { workspace: { revision: 1 }, snapshot: { fields: { explanation: '' } } } })
  expect(result.retained).toBe(result.hash)
  expect(result.inspected).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  expect(result.retried).toMatchObject({ ok: true, value: { application: { workspace: { revision: 2 }, snapshot: { fields: { explanation: 'Keep this offline save' } } } } })
})
