import { expect, test } from '@playwright/test'
import { damageDataset } from './startup-fixtures'
import { addLegacyValues, addUnknownStore, holdSlowRequest } from './reset-fixtures'
import { loseNextWriteCompletion } from './storage-faults'

test.describe.configure({ mode: 'parallel' })

test('unsupported stores with binary keys, typed data, maps and files can be confirmed and reset', async ({ page }) => {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(() => window.demo.startup())
  await page.evaluate(() => window.demo.dispose())
  await page.evaluate(addLegacyValues)
  const reset = await page.evaluate(async () => {
    const observed = await window.demo.inspectReset()
    if (!observed.ok) throw new Error('No legacy observation')
    return window.demo.execute({ kind: 'resetDemo', context: observed.value, operationId: 'legacy-values-reset', confirmed: true })
  })
  expect(reset).toMatchObject({ ok: true })
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true })
  const applications = await page.evaluate(async () => { await window.demo.signIn('salma'); return window.demo.listApplications() })
  expect(applications.ok && applications.value).toHaveLength(12)
})

test('blocked schema reset never completes later in the background and retains its one-shot failure', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(() => window.demo.startup())
  await page.evaluate(() => window.demo.dispose())
  await page.evaluate(addUnknownStore)
  const observed = await page.evaluate(() => window.demo.inspectReset())
  if (!observed.ok) throw new Error('No schema context')
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const open = indexedDB.open('rifd-demo')
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      window.repairStartupFixture = async () => { open.result.close() }
      IDBFactory.prototype.deleteDatabase = () => { throw new Error('Destructive deletion is forbidden') }
      resolve()
    }
  }))
  await page.evaluate(() => window.demo.setControls({ slow: false, failure: 'storage' }))
  const command = { kind: 'resetDemo' as const, context: observed.value, operationId: 'blocked-reset', confirmed: true as const }
  expect(await page.evaluate(command => window.demo.execute(command), command)).toMatchObject({ ok: false, error: { kind: 'blocked' } })
  expect(await page.evaluate(() => window.demo.controls())).toEqual({ slow: false, failure: 'storage' })
  await page.evaluate(() => window.repairStartupFixture())
  expect(await page.evaluate(command => window.demo.execute(command), command)).toMatchObject({ ok: false, error: { kind: 'storage' } })
  expect(await page.evaluate(command => window.demo.execute(command), command)).toMatchObject({ ok: true, value: { replay: false } })
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true })
})

test('denied reset access and failed resource preparation preserve the existing session and data', async ({ page }) => {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const original = await window.demo.startup()
    if (!original.ok) throw new Error('No startup')
    await window.demo.signIn('mariam')
    const observed = await window.demo.inspectReset()
    if (!observed.ok) throw new Error('No reset context')
    const command = { kind: 'resetDemo' as const, context: observed.value, operationId: 'denied-reset', confirmed: true as const }
    window.demo.setControls({ slow: false, failure: 'storage' })
    const open = IDBFactory.prototype.open
    IDBFactory.prototype.open = () => { throw new DOMException('Denied reset fixture', 'SecurityError') }
    const denied = await window.demo.execute(command)
    IDBFactory.prototype.open = open
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = () => { throw new Error('Resource failure fixture') }
    const resources = await window.demo.execute(command)
    HTMLCanvasElement.prototype.getContext = getContext
    return { original: original.value.datasetId, denied, resources, context: await window.demo.context(), controls: window.demo.controls() }
  })
  expect(result.denied).toMatchObject({ ok: false, error: { kind: 'storage' } })
  expect(result.resources).toMatchObject({ ok: false, error: { kind: 'resources' } })
  expect(result.context).toMatchObject({ ok: true, value: { datasetId: result.original, session: { identity: 'mariam' } } })
  expect(result.controls).toEqual({ slow: false, failure: 'storage' })
})

test('an uncertain reset is inspected through its public receipt before explicit replay', async ({ page }) => {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(() => window.demo.startup())
  await page.evaluate(loseNextWriteCompletion)
  const result = await page.evaluate(async () => {
    const observed = await window.demo.inspectReset()
    if (!observed.ok) throw new Error('No reset context')
    const command = { kind: 'resetDemo' as const, context: observed.value, operationId: 'unknown-reset', confirmed: true as const }
    const reset = await window.demo.execute(command)
    const inspected = await window.demo.inspectResetOperation(command)
    const replay = await window.demo.execute(command)
    return { reset, inspected, replay }
  })
  expect(result.reset).toMatchObject({ ok: false, error: { kind: 'outcomeUnknown' } })
  expect(result.inspected).toMatchObject({ ok: true, value: { status: 'committed', result: { replay: true } } })
  expect(result.replay).toMatchObject({ ok: true, value: { replay: true } })
})

test('exact reset replay precedes resource and session checks and cannot erase work after a later reset', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    await window.demo.startup()
    const context = await window.demo.inspectReset()
    if (!context.ok) throw new Error('No reset context')
    const command = { kind: 'resetDemo' as const, context: context.value, operationId: 'replayed-reset', confirmed: true as const }
    const first = await window.demo.execute(command)
    const after = await window.demo.context()
    if (!after.ok) throw new Error('No reset dataset')
    await window.demo.execute({ kind: 'setLanguage', datasetId: after.value.datasetId, expectedRevision: 1, operationId: 'later-language', language: 'en' })
    window.demo.dispose()
    window.demo.setControls({ slow: true, failure: 'storage' })
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function () { throw new Error('Replay must not generate resources') }
    const replay = await window.demo.execute(command)
    HTMLCanvasElement.prototype.getContext = getContext
    const controls = window.demo.controls()
    const restored = await window.demo.startup()
    const misuse = await window.demo.execute({ ...command, context: { kind: 'dataset', datasetId: crypto.randomUUID() } })
    window.demo.setControls({ slow: false, failure: null })
    const next = await window.demo.inspectReset()
    if (!next.ok) throw new Error('No next context')
    const secondCommand = { ...command, operationId: 'new-reset', context: next.value }
    const second = await window.demo.execute(secondCommand)
    const current = await window.demo.context()
    if (!current.ok) throw new Error('No current context')
    await window.demo.execute({ kind: 'setLanguage', datasetId: current.value.datasetId, expectedRevision: 1, operationId: 'newer-work', language: 'en' })
    const obsolete = await window.demo.execute(command)
    return { first, replay, controls, restored, misuse, second, secondCommand, obsolete, final: await window.demo.context() }
  })
  expect(result.first).toMatchObject({ ok: true, value: { replay: false } })
  expect(result.replay).toEqual(result.first.ok ? { ok: true, value: { ...result.first.value, replay: true } } : null)
  expect(result.controls).toEqual({ slow: true, failure: 'storage' })
  expect(result.restored).toMatchObject({ ok: true, value: { preferences: { language: 'en' }, session: null } })
  expect(result.misuse).toMatchObject({ ok: false, error: { kind: 'identifierMisuse' } })
  expect(result.obsolete).toMatchObject({ ok: false, error: { kind: 'supersededDataset' } })
  expect(result.final).toMatchObject({ ok: true, value: { preferences: { language: 'en' } } })
  expect(result.final.ok && result.final.value.datasetId).toBe(result.second.ok && result.second.value.datasetId)
  await page.evaluate(damageDataset, 'schema' as const)
  const historical = await page.evaluate(async command => {
    const startup = await window.demo.startup()
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = () => { throw new Error('Historical replay must not prepare resources') }
    const replay = await window.demo.execute(command)
    HTMLCanvasElement.prototype.getContext = getContext
    return { startup, replay, context: await window.demo.context() }
  }, result.secondCommand)
  expect(historical.startup).toMatchObject({ ok: false, error: { kind: 'unsupported' } })
  expect(historical.replay).toEqual(result.second.ok ? { ok: true, value: { ...result.second.value, replay: true } } : null)
  expect(historical.context).toMatchObject({ ok: false, error: { kind: 'unsupported' } })
})

test('reset abort retains the dataset, session and prepared bytes; retry restores all defaults', async ({ page }) => {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const start = await window.demo.startup()
    if (!start.ok) throw new Error('No startup')
    await window.demo.signIn('mariam')
    const prepared = await window.demo.prepareAttachment({ datasetId: start.value.datasetId, applicationId: 'RIFD-2026-001', slot: 'purchase', selectionId: 'reset-file', source: { kind: 'sample', sampleId: 'RIFD-2026-001-purchase-original' } })
    if (!prepared.ok) throw new Error('No prepared bytes')
    const draft = await window.demo.readApplication('RIFD-2026-001')
    if (!draft.ok || draft.value.role !== 'applicant') throw new Error('No draft')
    await window.demo.execute({ kind: 'saveDraft', datasetId: start.value.datasetId, operationId: 'before-reset', applicationId: draft.value.id, expectedWorkspaceRevision: 1, product: draft.value.product,
      fields: { ...draft.value.snapshot.fields, explanation: 'Saved before reset' }, documents: {
        identity: { kind: 'saved', fileId: draft.value.snapshot.documents.identity }, business: { kind: 'saved', fileId: draft.value.snapshot.documents.business }, financial: { kind: 'saved', fileId: draft.value.snapshot.documents.financial }, purchase: { kind: 'prepared', attachment: prepared.value },
      } })
    await window.demo.execute({ kind: 'setLanguage', datasetId: start.value.datasetId, operationId: 'before-reset-language', expectedRevision: 1, language: 'en' })
    await window.demo.execute({ kind: 'markNotificationRead', datasetId: start.value.datasetId, operationId: 'before-reset-notice', notificationId: 'RIFD-2026-005-notice', expectedRevision: 1 })
    const inspection = await window.demo.inspectReset()
    if (!inspection.ok) throw new Error('No reset context')
    const command = { kind: 'resetDemo' as const, context: inspection.value, operationId: 'reset-abort', confirmed: true as const }
    window.demo.setControls({ slow: false, failure: 'storage' })
    const aborted = await window.demo.execute(command)
    const retainedContext = await window.demo.context()
    const retainedFile = await window.demo.readPrepared('RIFD-2026-001', prepared.value)
    const reset = await window.demo.execute(command)
    const context = await window.demo.context()
    await window.demo.signIn('mariam')
    const restoredDraft = await window.demo.readApplication('RIFD-2026-001')
    const retiredReceipt = await window.demo.inspectPreferenceOperation({ kind: 'setLanguage', datasetId: start.value.datasetId, operationId: 'before-reset-language', expectedRevision: 1, language: 'en' })
    await window.demo.signIn('salma')
    const queue = await window.demo.readStaffQueue()
    const counts = []
    const notices = []
    for (const identity of ['mariam', 'huda', 'omar'] as const) {
      await window.demo.signIn(identity)
      const applications = await window.demo.listApplications()
      const notifications = await window.demo.readNotifications()
      counts.push(applications.ok ? applications.value.length : -1)
      notices.push(notifications.ok ? notifications.value.map(item => item.read) : null)
    }
    return { original: start.value.datasetId, aborted, retainedContext, retainedFile: retainedFile.ok, reset, context, restoredDraft, retiredReceipt, controls: window.demo.controls(), queue, counts, notices }
  })
  expect(result.aborted).toMatchObject({ ok: false, error: { kind: 'storage' } })
  expect(result.retainedContext).toMatchObject({ ok: true, value: { datasetId: result.original, session: { identity: 'mariam' } } })
  expect(result.retainedFile).toBe(true)
  expect(result.reset).toMatchObject({ ok: true, value: { replay: false } })
  expect(result.context).toMatchObject({ ok: true, value: { session: null, preferences: { revision: 1, language: 'ar', queue: { status: 'all', product: 'all', assignment: 'all', sort: 'dateDesc' } } } })
  expect(result.context.ok && result.context.value.datasetId).not.toBe(result.original)
  expect(result.controls).toEqual({ slow: false, failure: null })
  expect(result.restoredDraft).toMatchObject({ ok: true, value: { workspace: { revision: 1 }, snapshot: { fields: { explanation: '' }, documents: { purchase: 'RIFD-2026-001-purchase-original' } } } })
  expect(result.retiredReceipt).toMatchObject({ ok: false, error: { kind: 'supersededDataset' } })
  expect(result.counts).toEqual([5, 5, 3])
  expect(result.notices).toEqual([[false], [false, false], [false, false]])
  expect(result.queue).toMatchObject({ ok: true, value: { total: 12, counts: { submitted: 4, underReview: 3, correctionsRequested: 3, approved: 1, rejected: 1 }, assignments: { you: 7, colleague: 3, unassigned: 2 } } })
})

test('same-context tabs refuse a delayed old save and stale reset while recognizing the winning reset replay', async ({ page, context }) => {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(() => window.demo.startup())
  const other = await context.newPage()
  await other.addInitScript(() => { Object.defineProperty(window, 'BroadcastChannel', { value: class { constructor() { throw new Error('Missed hint') } } }) })
  await other.goto('/tests/browser/api.html')
  await other.waitForFunction(() => window.demo)
  const original = await other.evaluate(async () => {
    const startup = await window.demo.startup()
    if (!startup.ok) throw new Error('No startup')
    await window.demo.signIn('mariam')
    const view = await window.demo.readApplication('RIFD-2026-001')
    if (!view.ok || view.value.role !== 'applicant') throw new Error('No draft')
    window.draftCommand = { kind: 'saveDraft', datasetId: startup.value.datasetId, operationId: 'delayed-before-reset', applicationId: view.value.id, product: view.value.product, expectedWorkspaceRevision: 1, fields: { ...view.value.snapshot.fields, explanation: 'Never enter the new dataset' }, documents: {
      identity: { kind: 'saved', fileId: view.value.snapshot.documents.identity }, business: { kind: 'saved', fileId: view.value.snapshot.documents.business }, financial: { kind: 'saved', fileId: view.value.snapshot.documents.financial }, purchase: { kind: 'saved', fileId: view.value.snapshot.documents.purchase },
    } }
    return startup.value.datasetId
  })
  await other.evaluate(holdSlowRequest)
  await other.evaluate(() => window.demo.setControls({ slow: true, failure: 'storage' }))
  const delayed = other.evaluate(() => window.demo.execute(window.draftCommand))
  const reset = await page.evaluate(async () => {
    const observed = await window.demo.inspectReset()
    if (!observed.ok) throw new Error('No context')
    const command = { kind: 'resetDemo' as const, context: observed.value, operationId: 'winning-reset', confirmed: true as const }
    return { command, result: await window.demo.execute(command) }
  })
  expect(reset.result).toMatchObject({ ok: true })
  await other.evaluate(() => window.releaseSlowRequest())
  expect(await delayed).toMatchObject({ ok: false, error: { kind: 'supersededDataset' } })
  expect(await other.evaluate(command => window.demo.execute(command), reset.command)).toMatchObject({ ok: true, value: { replay: true } })
  expect(await other.evaluate(() => window.demo.context())).toMatchObject({ ok: true, value: { session: null } })
  await other.evaluate(() => window.demo.setControls({ slow: false, failure: 'storage' }))
  expect(await other.evaluate(datasetId => window.demo.execute({ kind: 'resetDemo', context: { kind: 'dataset', datasetId }, operationId: 'stale-competing-reset', confirmed: true }), original)).toMatchObject({ ok: false, error: { kind: 'supersededDataset' } })
  expect(await other.evaluate(() => window.demo.controls())).toEqual({ slow: false, failure: 'storage' })
  const draft = await other.evaluate(async () => { await window.demo.signIn('mariam'); return window.demo.readApplication('RIFD-2026-001') })
  expect(draft).toMatchObject({ ok: true, value: { workspace: { revision: 1 }, snapshot: { fields: { explanation: '' } } } })
})

test('a tab whose connection closed for schema recovery adopts the committed reset on its next read', async ({ page, context }) => {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(() => window.demo.startup())
  const other = await context.newPage()
  await other.goto('/tests/browser/api.html')
  await other.waitForFunction(() => window.demo)
  await other.evaluate(async () => { await window.demo.startup(); await window.demo.signIn('mariam') })
  await page.evaluate(addUnknownStore)
  const reset = await page.evaluate(async () => {
    const observed = await window.demo.inspectReset()
    if (!observed.ok) throw new Error('No context')
    return window.demo.execute({ kind: 'resetDemo', context: observed.value, operationId: 'schema-new-tab', confirmed: true })
  })
  expect(reset).toMatchObject({ ok: true })
  expect(await other.evaluate(() => window.demo.context())).toMatchObject({ ok: true, value: { datasetId: reset.ok ? reset.value.datasetId : '', session: null, preferences: { language: 'ar' } } })
})

test('schema rebuilding aborts atomically, then a fresh reset recovers the unsupported database', async ({ page }) => {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(() => window.demo.startup())
  await page.evaluate(() => window.demo.dispose())
  await page.evaluate(addUnknownStore)
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: false })
  const observed = await page.evaluate(() => window.demo.inspectReset())
  expect(observed).toMatchObject({ ok: true, value: { kind: 'recovery' } })
  if (!observed.ok) throw new Error('No schema context')
  await page.evaluate(() => window.demo.setControls({ slow: false, failure: 'storage' }))
  expect(await page.evaluate(context => window.demo.execute({ kind: 'resetDemo', context, operationId: 'schema-reset', confirmed: true }), observed.value)).toMatchObject({ ok: false, error: { kind: 'storage' } })
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: false })
  expect(await page.evaluate(context => window.demo.execute({ kind: 'resetDemo', context, operationId: 'schema-reset', confirmed: true }), observed.value)).toMatchObject({ ok: true })
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true, value: { session: null } })
  const applications = await page.evaluate(async () => { await window.demo.signIn('salma'); return window.demo.listApplications() })
  expect(applications.ok && applications.value).toHaveLength(12)
})

test('damaged startup recovery requires a fresh confirmation after repair and resets without a session', async ({ page }) => {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(() => window.demo.startup())
  await page.evaluate(damageDataset, 'shape' as const)
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: false, error: { kind: 'damaged' } })
  const observed = await page.evaluate(() => window.demo.inspectReset())
  expect(observed).toMatchObject({ ok: true, value: { kind: 'recovery' } })
  if (!observed.ok) throw new Error('No recovery context')
  await page.evaluate(() => window.repairStartupFixture())
  expect(await page.evaluate(context => window.demo.execute({ kind: 'resetDemo', context, operationId: 'obsolete-recovery', confirmed: true }), observed.value)).toMatchObject({ ok: false, error: { kind: 'supersededDataset' } })
  await page.evaluate(damageDataset, 'schema' as const)
  const result = await page.evaluate(async () => {
    const inspected = await window.demo.inspectReset()
    if (!inspected.ok) throw new Error('No fresh context')
    const reset = await window.demo.execute({ kind: 'resetDemo', context: inspected.value, operationId: 'recovery-reset', confirmed: true })
    const startup = await window.demo.startup()
    return { reset, startup }
  })
  expect(result.reset).toMatchObject({ ok: true })
  expect(result.startup).toMatchObject({ ok: true, value: { session: null, preferences: { language: 'ar' } } })
})
