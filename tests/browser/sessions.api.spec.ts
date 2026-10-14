import { expect, test, type Page } from '@playwright/test'

test.describe.configure({ mode: 'parallel' })

async function start(page: Page) {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(async () => {
    await window.demo.startup()
    const context = await window.demo.signIn('mariam')
    const view = await window.demo.readApplication('RIFD-2026-001')
    if (!context.ok || !view.ok || view.value.role !== 'applicant' || !view.value.workspace) throw new Error('No draft')
    window.draftCommand = {
      kind: 'saveDraft', datasetId: context.value.datasetId, applicationId: view.value.id, operationId: 'interrupted-save',
      expectedWorkspaceRevision: view.value.workspace.revision, product: view.value.product,
      fields: { ...view.value.snapshot.fields, explanation: 'retained unfinished input' },
      documents: Object.fromEntries(Object.entries(view.value.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../src/demo').DraftDocuments,
    }
  })
}

test('explicit expiry revokes pending authority even after the same identity signs in again', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    demo.setControls({ slow: true, failure: 'save' })
    const pending = demo.execute(window.draftCommand)
    demo.expireSession()
    demo.setControls({ slow: false, failure: 'save' })
    await demo.signIn('mariam')
    const interrupted = await pending
    return { interrupted, inspection: await demo.inspectOperation(window.draftCommand), view: await demo.readApplication(window.draftCommand.applicationId), controls: demo.controls() }
  })
  expect(result.interrupted).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  expect(result.view).toMatchObject({ ok: true, value: { workspace: { revision: 1 }, snapshot: { fields: { explanation: '' } } } })
  expect(result.controls.failure).toBe('save')
})

test('only pointer and keyboard interaction renew the real fifteen-minute inactivity clock', async ({ page }) => {
  await page.clock.install()
  await start(page)
  await page.clock.runFor(14 * 60 * 1000)
  await page.dispatchEvent('body', 'pointerdown')
  await page.clock.runFor(14 * 60 * 1000)
  expect(await page.evaluate(() => window.demo.context())).toMatchObject({ ok: true, value: { session: { identity: 'mariam' } } })
  await page.dispatchEvent('body', 'keydown', { key: 'Tab' })
  await page.clock.runFor(14 * 60 * 1000)
  await page.dispatchEvent('body', 'pointermove')
  await page.evaluate(async () => {
    await window.demo.listApplications()
    const context = await window.demo.context()
    if (!context.ok) throw new Error('No context')
    await window.demo.execute({ kind: 'setLanguage', datasetId: context.value.datasetId, operationId: 'nonactivity', expectedRevision: context.value.preferences.revision, language: 'en' })
  })
  await page.clock.runFor(60_001)
  expect(await page.evaluate(() => window.demo.context())).toMatchObject({ ok: true, value: { session: null } })
  expect(await page.evaluate(() => window.demo.readFile('RIFD-2026-001', 'anything'))).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } })
})

test('expiry after staging a write aborts its fields, files and receipt together', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const prepared = await demo.prepareAttachment({ datasetId: window.draftCommand.datasetId, applicationId: window.draftCommand.applicationId, slot: 'purchase', selectionId: 'staged', source: { kind: 'local', file: new File(['private replacement'], 'DEMO.png', { type: 'image/png' }) } })
    if (!prepared.ok) throw new Error('Preparation failed')
    window.draftCommand.documents.purchase = { kind: 'prepared', attachment: prepared.value }
    // Expire between IndexedDB's successful put and transaction completion.
    const put = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
      const request = put.apply(this, args)
      request.addEventListener('success', () => demo.expireSession(), { once: true })
      return request
    }
    const interrupted = await demo.execute(window.draftCommand)
    IDBObjectStore.prototype.put = put
    await demo.signIn('mariam')
    return { interrupted, inspection: await demo.inspectOperation(window.draftCommand), unattached: await demo.readFile(window.draftCommand.applicationId, prepared.value.id), ready: await demo.readPrepared(window.draftCommand.applicationId, prepared.value) }
  })
  expect(result.interrupted).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted', application: { workspace: { revision: 1 }, snapshot: { fields: { explanation: '' } } } } })
  expect(result.unattached).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
  expect(result.ready.ok).toBe(true)
})

test('returning activity checks elapsed expiry before renewal when background timers have not run', async ({ page }) => {
  await page.clock.install()
  await start(page)
  const now = await page.evaluate(() => Date.now())
  await page.clock.setSystemTime(now + 15 * 60 * 1000 + 1)
  await page.dispatchEvent('body', 'pointerdown')
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  expect(await page.evaluate(() => window.demo.context())).toMatchObject({ ok: true, value: { session: null } })
  expect(await page.evaluate(() => window.demo.execute(window.draftCommand))).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } })
})
