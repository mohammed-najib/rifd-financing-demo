import { expect, test, type Page } from '@playwright/test'

async function openDraft(page: Page) {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  return page.evaluate(async () => {
    const demo = window.demo
    await demo.startup()
    const context = await demo.signIn('mariam')
    const before = await demo.readApplication('RIFD-2026-001')
    if (!context.ok || !before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('No draft')
    const prepared = await demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: before.value.id, slot: 'purchase', selectionId: 'selection', source: { kind: 'local', file: new File(['replacement'], 'DEMO.png', { type: 'image/png' }) } })
    if (!prepared.ok) throw new Error('No prepared file')
    const documents = Object.fromEntries(Object.entries(before.value.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../../src/demo').DraftDocuments
    documents.purchase = { kind: 'prepared', attachment: prepared.value }
    window.datasetId = context.value.datasetId
    window.draftCommand = { kind: 'saveDraft', applicationId: before.value.id, product: before.value.product, fields: { ...before.value.snapshot.fields, explanation: 'incomplete' }, documents }
    return before.value
  })
}

test('raw draft progress and prepared file bytes commit together and restore after refresh', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    await demo.startup()
    const context = await demo.signIn('mariam')
    const before = await demo.readApplication('RIFD-2026-001')
    if (!context.ok || !before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('No draft')
    const prepared = await demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: before.value.id, slot: 'purchase', selectionId: 'first', source: { kind: 'local', file: new File(['fictional bytes'], 'DEMO.png', { type: 'image/png' }) } })
    if (!prepared.ok) throw new Error('Preparation failed')
    const selected = await demo.readApplication(before.value.id)
    const save = await window.commitOn(demo, { kind: 'saveDraft', applicationId: before.value.id, product: before.value.product, fields: { ...before.value.snapshot.fields, explanation: ' x ' }, documents: { ...Object.fromEntries(Object.entries(before.value.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])), purchase: { kind: 'prepared', attachment: prepared.value } } as import('../../../src/demo').DraftDocuments })
    const after = await demo.readApplication(before.value.id)
    return { before, selected, save, after }
  })
  expect(result.selected).toEqual(result.before)
  expect(result.save).toMatchObject({ ok: true, value: { receipt: { kind: 'saveDraft', workspaceRevision: 2 }, application: { status: 'draft', sharedRevision: 1, snapshot: { fields: { explanation: ' x ' } }, history: [] } } })
  if (!result.after.ok) throw new Error('No saved draft')
  const fileId = result.after.value.snapshot.documents.purchase!
  await page.reload()
  await page.waitForFunction(() => window.demo)
  const restored = await page.evaluate(async id => {
    await window.demo.startup()
    const view = await window.demo.readApplication('RIFD-2026-001')
    const file = await window.demo.readFile('RIFD-2026-001', id)
    return { view, file: file.ok ? { ...file.value, bytes: Array.from(new Uint8Array(file.value.bytes)) } : file }
  }, fileId)
  expect(restored.view).toMatchObject({ ok: true, value: { snapshot: { fields: { explanation: ' x ' } } } })
  expect(restored.file).toMatchObject({ name: 'DEMO.png', mime: 'image/png', bytes: [...Buffer.from('fictional bytes')] })
})

for (const failure of ['save', 'storage'] as const) test(`${failure} failure retains the old file, ready bytes and raw edits without a receipt`, async ({ page }) => {
  const before = await openDraft(page)
  const result = await page.evaluate(async failure => {
    const demo = window.demo
    demo.setControls({ slow: false, failure })
    const failed = await window.commitOn(demo, window.draftCommand)
    const after = await demo.readApplication(window.draftCommand.applicationId)
    const inspection = await window.inspectOn(demo, window.draftCommand)
    const ready = window.draftCommand.documents.purchase
    if (ready.kind !== 'prepared') throw new Error('No ready file')
    const preparedRead = await demo.readPrepared(window.draftCommand.applicationId, ready.attachment)
    const unattached = await demo.readFile(window.draftCommand.applicationId, ready.attachment.id)
    const retry = await window.commitOn(demo, window.draftCommand)
    return { failed, after, inspection, preparedRead: preparedRead.ok ? new TextDecoder().decode(preparedRead.value.bytes) : null, unattached, retry, controls: demo.controls(), notices: await demo.readNotifications() }
  }, failure)
  expect(result.failed).toMatchObject({ ok: false, error: { kind: failure === 'save' ? 'requestFailed' : 'storage' } })
  expect(result.after).toEqual({ ok: true, value: before })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  expect(result.preparedRead).toBe('replacement')
  expect(result.unattached).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
  expect(result.retry).toMatchObject({ ok: true, value: { receipt: { workspaceRevision: 2 }, application: { sharedRevision: 1, history: [] } } })
  expect(result.controls.failure).toBeNull()
  expect(result.notices.ok && result.notices.value).toHaveLength(1)
})

test('repeating a committed draft save is a new operation and inspection reports the current record', async ({ page }) => {
  await openDraft(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const command = structuredClone(window.draftCommand)
    const first = await window.commitOn(demo, command)
    if (!first.ok || first.value.application.role !== 'applicant') throw new Error('Save failed')
    const later = await window.commitOn(demo, { ...command, fields: { ...command.fields, explanation: 'later input' } })
    const repeat = await window.commitOn(demo, command)
    const changed = await window.commitOn(demo, { ...command, fields: { ...command.fields, explanation: 'changed intent' } })
    const view = await demo.readApplication(command.applicationId)
    return { command, first, later, repeat, changed, view }
  })
  expect(result.first).toMatchObject({ ok: true, value: { receipt: { kind: 'saveDraft', workspaceRevision: 2 }, application: { workspace: { revision: 2 } } } })
  expect(result.later).toMatchObject({ ok: true, value: { receipt: { workspaceRevision: 3 }, application: { workspace: { revision: 3 }, snapshot: { fields: { explanation: 'later input' } } } } })
  // There is no outstanding attempt to resolve: repeating the same intent is a
  // brand new write with its own receipt, not a replay of the first outcome.
  expect(result.repeat).toMatchObject({ ok: true, value: { receipt: { kind: 'saveDraft', workspaceRevision: 4 }, application: { sharedRevision: 1, history: [], workspace: { revision: 4 } } } })
  expect(result.changed).toMatchObject({ ok: true, value: { receipt: { workspaceRevision: 5 }, application: { workspace: { revision: 5 }, snapshot: { fields: { explanation: 'changed intent' } } } } })
  if (!result.first.ok || !result.repeat.ok) throw new Error('No first or repeat save')
  expect(result.repeat.value.receipt.operationId).not.toBe(result.first.value.receipt.operationId)
  expect(result.view).toMatchObject({ ok: true, value: { sharedRevision: 1, history: [], workspace: { revision: 5 }, snapshot: { fields: { explanation: 'changed intent' } } } })
  await page.reload()
  await page.waitForFunction(() => window.demo)
  const restored = await page.evaluate(async command => {
    await window.demo.startup()
    return { repeat: await window.commit(command), inspection: await window.inspect(command), view: await window.demo.readApplication(command.applicationId) }
  }, result.command)
  // The staged attachment did not survive the reload, so a fresh attempt is
  // refused by validation while the stored record keeps its latest revision.
  expect(restored.repeat).toMatchObject({ ok: false, error: { kind: 'validation', slot: 'purchase' } })
  expect(restored.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted', application: { sharedRevision: 1, workspace: { revision: 5 }, snapshot: { fields: { explanation: 'changed intent' } } } } })
  expect(restored.view).toMatchObject({ ok: true, value: { workspace: { revision: 5 }, snapshot: { fields: { explanation: 'changed intent' } } } })
})

test('a lost transaction completion is unknown until receipt inspection proves it saved', async ({ page }) => {
  await openDraft(page)
  const result = await page.evaluate(async () => {
    // System-boundary fault: commit normally but lose the observer's complete event.
    const transaction = IDBDatabase.prototype.transaction
    let loseNext = true
    IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase['transaction']>) {
      const tx = transaction.apply(this, args)
      if (args[1] === 'readwrite' && loseNext) {
        loseNext = false
        Object.defineProperty(tx, 'oncomplete', { configurable: true, set() { /* Lost observation. */ } })
      }
      return tx
    }
    const save = await window.commit(window.draftCommand)
    IDBDatabase.prototype.transaction = transaction
    const inspection = await window.inspect(window.draftCommand)
    const replay = await window.commit(window.draftCommand)
    return { save, inspection, replay }
  })
  expect(result.save).toMatchObject({ ok: false, error: { kind: 'outcomeUnknown' } })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'committed', result: { receipt: { workspaceRevision: 2 }, application: { workspace: { revision: 2 }, snapshot: { fields: { explanation: 'incomplete' } } } } } })
  // Inspection resolved the one lost transaction. Explicitly retrying afterwards
  // is a new operation committed on top of it, not a second copy of the receipt.
  expect(result.replay).toMatchObject({ ok: true, value: { receipt: { workspaceRevision: 3 }, application: { sharedRevision: 1, history: [], workspace: { revision: 3 }, snapshot: { fields: { explanation: 'incomplete' } } } } })
  if (!result.inspection.ok || result.inspection.value.status !== 'committed' || !result.replay.ok) throw new Error('No inspection or replay')
  expect(result.replay.value.receipt.operationId).not.toBe(result.inspection.value.result.receipt.operationId)
})

test('failed commit announcements cannot turn a completed save into a failed one', async ({ page }) => {
  await openDraft(page)
  const result = await page.evaluate(async () => {
    BroadcastChannel.prototype.postMessage = () => { throw new Error('Fixture notification failure') }
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key: string, value: string) { if (key === 'rifd.commit.v1') throw new Error('Fixture fallback failure'); setItem.call(this, key, value) }
    window.demo.subscribe(() => { throw new Error('Fixture render failure') })
    return { save: await window.commit(window.draftCommand), inspection: await window.inspect(window.draftCommand), repeat: await window.commit(window.draftCommand), view: await window.demo.readApplication(window.draftCommand.applicationId) }
  })
  expect(result.save).toMatchObject({ ok: true, value: { receipt: { workspaceRevision: 2 } } })
  // No attempt is pending after a committed save, so inspection answers with the
  // current record instead of the earlier receipt.
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted', application: { sharedRevision: 1, workspace: { revision: 2 } } } })
  expect(result.repeat).toMatchObject({ ok: true, value: { receipt: { workspaceRevision: 3 } } })
  expect(result.view).toMatchObject({ ok: true, value: { sharedRevision: 1, workspace: { revision: 3 }, history: [] } })
})

test('concurrent private saves refuse a stale workspace and require explicit new intent', async ({ page, context }) => {
  await openDraft(page)
  const second = await context.newPage()
  await openDraft(second)
  const saves = await Promise.all([page.evaluate(() => window.commit(window.draftCommand)), second.evaluate(() => window.commit({ ...window.draftCommand }))])
  expect(saves.filter(save => save.ok)).toHaveLength(1)
  expect(saves.find(save => !save.ok)).toMatchObject({ ok: false, error: { kind: 'staleWorkspace' } })
  const refusedPage = saves[0].ok ? second : page
  expect(await refusedPage.evaluate(() => window.inspect(window.draftCommand))).toMatchObject({ ok: true })
  const retry = await refusedPage.evaluate(async () => {
    const latest = await window.demo.readApplication('RIFD-2026-001')
    if (!latest.ok || latest.value.role !== 'applicant') throw new Error('No workspace')
    return window.commit({ ...window.draftCommand })
  })
  expect(retry).toMatchObject({ ok: true, value: { application: { workspace: { revision: 3 }, sharedRevision: 1 } } })
})

test('captured input saves while identity changes and expiry refuse pending authority', async ({ page }) => {
  await openDraft(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    demo.setControls({ slow: true, failure: null })
    const saving = window.commitOn(demo, window.draftCommand)
    window.draftCommand.fields.explanation = 'typed after save began'
    const captured = await saving
    const next = { ...window.draftCommand, operationId: 'interrupted', expectedWorkspaceRevision: 2 }
    const pending = window.commitOn(demo, next)
    await demo.signOut()
    const interrupted = await pending
    await demo.signIn('mariam')
    const after = await demo.readApplication('RIFD-2026-001')
    const inspection = await window.inspectOn(demo, next)
    return { captured, interrupted, after, inspection }
  })
  expect(result.captured).toMatchObject({ ok: true, value: { application: { snapshot: { fields: { explanation: 'incomplete' } } } } })
  expect(result.interrupted).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } })
  expect(result.after).toMatchObject({ ok: true, value: { workspace: { revision: 2 }, snapshot: { fields: { explanation: 'incomplete' } } } })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
})

test('real preparation validates file envelopes, hashes bytes and consumes only an eligible upload failure', async ({ page }) => {
  await openDraft(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const input = { datasetId: window.datasetId, applicationId: window.draftCommand.applicationId, slot: 'purchase' as const, selectionId: 'envelope' }
    demo.setControls({ slow: false, failure: 'upload' })
    const invalid = await demo.prepareAttachment({ ...input, source: { kind: 'local', file: new File(['abc'], 'DEMO.png', { type: 'application/pdf' }) } })
    const stillArmed = demo.controls()
    const progress: number[] = []
    const failed = await demo.prepareAttachment({ ...input, source: { kind: 'local', file: new File(['abc'], 'DEMO.png', { type: 'image/png' }) } }, percent => progress.push(percent))
    const retry = await demo.prepareAttachment({ ...input, source: { kind: 'local', file: new File(['abc'], 'DEMO.PnG') } })
    const empty = await demo.prepareAttachment({ ...input, source: { kind: 'local', file: new File([], 'DEMO.pdf', { type: 'application/pdf' }) } })
    const oversized = await demo.prepareAttachment({ ...input, source: { kind: 'local', file: new File([new Uint8Array(5_000_001)], 'DEMO.pdf', { type: 'application/pdf' }) } })
    const boundary = await demo.prepareAttachment({ ...input, source: { kind: 'local', file: new File([new Uint8Array(5_000_000)], 'DEMO.pdf', { type: 'application/pdf' }) } })
    if (!boundary.ok) throw new Error('Boundary refused')
    const command = { ...window.draftCommand, documents: { ...window.draftCommand.documents, purchase: { kind: 'prepared' as const, attachment: boundary.value } } }
    const saved = await window.commitOn(demo, command)
    return { invalid, stillArmed, progress, failed, retry, empty, oversized, boundary, saved }
  })
  expect(result.invalid).toMatchObject({ ok: false, error: { kind: 'validation', slot: 'purchase' } })
  expect(result.stillArmed.failure).toBe('upload')
  expect(result.progress).toEqual([0, 25, 50])
  expect(result.failed).toMatchObject({ ok: false, error: { kind: 'uploadFailed' } })
  expect(result.retry).toMatchObject({ ok: true, value: { mime: 'image/png', size: 3, hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad' } })
  expect(result.empty).toMatchObject({ ok: false, error: { kind: 'validation' } })
  expect(result.oversized).toMatchObject({ ok: false, error: { kind: 'validation' } })
  expect(result.boundary).toMatchObject({ ok: true, value: { size: 5_000_000 } })
  expect(result.saved.ok).toBe(true)
  await page.reload()
  await page.waitForFunction(() => window.demo)
  const restored = await page.evaluate(async () => {
    await window.demo.startup()
    const view = await window.demo.readApplication('RIFD-2026-001')
    if (!view.ok) throw new Error('No draft')
    const file = await window.demo.readFile(view.value.id, view.value.snapshot.documents.purchase!)
    return file.ok ? { size: file.value.bytes.byteLength, hash: file.value.hash } : file
  })
  expect(restored).toEqual({ size: 5_000_000, hash: result.boundary.ok ? result.boundary.value.hash : '' })
})

test('preparation ignores superseded selections and denies prepared reads to another identity', async ({ page }) => {
  await openDraft(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const input = { datasetId: window.datasetId, applicationId: window.draftCommand.applicationId, slot: 'purchase' as const, selectionId: 'older', source: { kind: 'local' as const, file: new File(['older'], 'DEMO.png', { type: 'image/png' }) } }
    const older = demo.prepareAttachment(input)
    const latest = demo.prepareAttachment({ ...input, selectionId: 'newer', source: { kind: 'local', file: new File(['newer'], 'DEMO.png', { type: 'image/png' }) } })
    const results = await Promise.all([older, latest])
    const ready = results[1]
    if (!ready.ok) throw new Error('No latest file')
    const bytes = await demo.readPrepared(input.applicationId, ready.value)
    if (bytes.ok) new Uint8Array(bytes.value.bytes).fill(0)
    const unchanged = await demo.readPrepared(input.applicationId, ready.value)
    await demo.signIn('huda')
    const forbidden = await demo.readPrepared(input.applicationId, ready.value)
    const save = await window.commitOn(demo, window.draftCommand)
    return { results, unchanged: unchanged.ok ? new TextDecoder().decode(unchanged.value.bytes) : null, forbidden, save }
  })
  expect(result.results[0]).toMatchObject({ ok: false, error: { kind: 'supersededSelection' } })
  expect(result.results[1].ok).toBe(true)
  expect(result.unchanged).toBe('newer')
  expect(result.forbidden).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
  expect(result.save).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
})

test('expired authority refuses a pending write and preparation, preserving the workspace', async ({ page }) => {
  const before = await openDraft(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const saving = window.commitOn(demo, window.draftCommand)
    const preparing = demo.prepareAttachment({ datasetId: window.datasetId, applicationId: window.draftCommand.applicationId, slot: 'purchase', selectionId: 'expires', source: { kind: 'local', file: new File(['expires'], 'DEMO.png', { type: 'image/png' }) } })
    const clock = Date.now
    Date.now = () => clock() + 16 * 60 * 1000
    const results = await Promise.all([saving, preparing])
    Date.now = clock
    await demo.signIn('mariam')
    return { results, after: await demo.readApplication(window.draftCommand.applicationId), inspection: await window.inspectOn(demo, window.draftCommand) }
  })
  expect(result.results).toEqual([expect.objectContaining({ ok: false, error: expect.objectContaining({ kind: 'sessionExpired' }) }), expect.objectContaining({ ok: false, error: expect.objectContaining({ kind: 'sessionExpired' }) })])
  expect(result.after).toEqual({ ok: true, value: before })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
})

test('preference changes and ineligible draft attempts leave the application write failure armed', async ({ page }) => {
  const before = await openDraft(page)
  const result = await page.evaluate(async before => {
    const demo = window.demo
    const command = window.draftCommand
    // One committed save supplies a genuinely older record for the stale attempt.
    const advanced = await window.commitOn(demo, command)
    if (!advanced.ok || advanced.value.application.role !== 'applicant') throw new Error('No advance')
    demo.setControls({ slow: false, failure: 'storage' })
    const language = await window.commitOn(demo, { kind: 'setLanguage', expectedRevision: 1, language: 'en' })
    // Another applicant cannot even read the draft this intent was prepared from.
    await demo.signIn('huda')
    const foreign = await window.commitOn(demo, command)
    await demo.signIn('mariam')
    const stale = await window.commitOn(demo, command, before)
    const prepared = command.documents.purchase
    if (prepared.kind !== 'prepared') throw new Error('No ready file')
    const forged = await window.commitOn(demo, { ...command, documents: { ...command.documents, purchase: { kind: 'prepared', attachment: { ...prepared.attachment, hash: '0'.repeat(64) } } } })
    const wrongSlot = await window.commitOn(demo, { ...command, documents: { ...command.documents, identity: prepared } })
    const armed = demo.controls()
    const eligible = await window.commitOn(demo, command)
    return { advanced, language, foreign, stale, forged, wrongSlot, armed, eligible, after: await demo.readApplication(command.applicationId), inspection: await window.inspectOn(demo, command) }
  }, before)
  expect(result.advanced).toMatchObject({ ok: true, value: { application: { workspace: { revision: 2 } } } })
  expect(result.language.ok).toBe(true)
  expect(result.foreign).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
  expect(result.stale).toMatchObject({ ok: false, error: { kind: 'staleWorkspace' } })
  expect(result.forged).toMatchObject({ ok: false, error: { kind: 'validation' } })
  expect(result.wrongSlot).toMatchObject({ ok: false, error: { kind: 'validation', slot: 'identity' } })
  expect(result.armed.failure).toBe('storage')
  expect(result.eligible).toMatchObject({ ok: false, error: { kind: 'storage' } })
  expect(result.after).toEqual(result.advanced.ok ? { ok: true, value: result.advanced.value.application } : null)
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted', application: { workspace: { revision: 2 } } } })
})
