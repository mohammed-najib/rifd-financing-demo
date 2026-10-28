import { expect, test, type Page } from '@playwright/test'
import { loseNextWriteCompletion, refuseCommitNotices } from '../support/storage-faults'

test.describe.configure({ mode: 'parallel' })

async function applicant(page: Page) {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  return page.evaluate(async () => {
    const startup = await window.demo.startup()
    const session = await window.demo.signIn('huda')
    if (!startup.ok || !session.ok) throw new Error('No session')
    return session.value.datasetId
  })
}

test('private invalid corrections and replacement bytes survive reload while a same-context reviewer sees the submitted snapshot', async ({ page, context }) => {
  const datasetId = await applicant(page)
  await page.evaluate(refuseCommitNotices)
  const reviewer = await context.newPage()
  await reviewer.goto('/tests/browser/support/api.html')
  await reviewer.waitForFunction(() => window.demo)
  const staffBefore = await reviewer.evaluate(async () => {
    await window.demo.startup(); await window.demo.signIn('salma')
    return window.demo.readApplication('RIFD-2026-004')
  })
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-004')
    const notices = await demo.readNotifications()
    if (!before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('No workspace')
    const prepared = await demo.prepareAttachment({ datasetId, applicationId: before.value.id, slot: 'purchase', selectionId: 'replacement', source: { kind: 'local', file: new File(['private correction bytes'], 'DEMO-plan.png', { type: 'image/png' }) } })
    if (!prepared.ok) return { before, notices, prepared }
    const workspace = before.value.workspace
    const command = { kind: 'saveCorrections' as const, datasetId, applicationId: before.value.id, roundId: workspace.roundId!, operationId: 'private-save', expectedWorkspaceRevision: workspace.revision, product: before.value.product, fields: { ...workspace.snapshot.fields, amount: ' invalid ' }, documents: { ...Object.fromEntries(Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])), purchase: { kind: 'prepared', attachment: prepared.value } } as import('../../../src/demo').DraftDocuments }
    return { before, notices, prepared, command, save: await window.commitOn(demo, command), after: await demo.readApplication(before.value.id), afterNotices: await demo.readNotifications(), print: await demo.readPrintSummary(before.value.id) }
  }, datasetId)
  expect(result.prepared).toMatchObject({ ok: true })
  expect(result.save).toMatchObject({ ok: true, value: { receipt: { kind: 'saveCorrections', workspaceRevision: 2 }, application: { sharedRevision: 1, workspace: { snapshot: { fields: { amount: ' invalid ' } } } } } })
  expect(result.afterNotices).toEqual(result.notices)
  expect(await reviewer.evaluate(() => window.demo.readApplication('RIFD-2026-004'))).toEqual(staffBefore)
  if (!result.before.ok || !result.prepared.ok) throw new Error('No record')
  expect(result.after).toMatchObject({ value: { snapshot: result.before.value.snapshot, rounds: result.before.value.rounds, history: result.before.value.history } })
  expect(JSON.stringify(result.print)).not.toContain(' invalid ')
  expect(await reviewer.evaluate(id => window.demo.readFile('RIFD-2026-004', id), result.prepared.value.id)).toMatchObject({ error: { kind: 'unavailable' } })
  await page.reload(); await page.waitForFunction(() => window.demo)
  const restored = await page.evaluate(async command => {
    await window.demo.startup()
    const view = await window.demo.readApplication(command.applicationId)
    const file = await window.demo.readFile(command.applicationId, command.documents.purchase.kind === 'prepared' ? command.documents.purchase.attachment.id : '')
    return { view, bytes: file.ok ? new TextDecoder().decode(file.value.bytes) : file, repeat: await window.commit(command), inspection: await window.inspect(command) }
  }, result.command!)
  expect(restored.bytes).toBe('private correction bytes')
  expect(restored.view).toEqual(result.after)
  // The staged replacement did not survive the reload, so repeating the intent is
  // a fresh attempt refused by validation; inspection reports the stored record.
  expect(restored.repeat).toMatchObject({ ok: false, error: { kind: 'validation', slot: 'purchase' } })
  expect(restored.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted', application: { sharedRevision: 1, workspace: { revision: 2, snapshot: { fields: { amount: ' invalid ' } } } } } })
})

test('target, product, active round, ownership and workspace versions are checked before consuming a failure', async ({ page }) => {
  const datasetId = await applicant(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-004')
    if (!before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('No workspace')
    const workspace = before.value.workspace
    const command: import('../../../src/demo').ApplicationIntent = { kind: 'saveCorrections', applicationId: before.value.id, roundId: workspace.roundId!, product: before.value.product, fields: { ...workspace.snapshot.fields, amount: '' }, documents: Object.fromEntries(Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../../src/demo').DraftDocuments }
    // A committed save advances the private revision; the older view is the record
    // the stale attempt presents.
    const advanced = await window.commitOn(demo, command)
    if (!advanced.ok) throw new Error('No advance')
    demo.setControls({ slow: false, failure: 'save' })
    const forbidden = [
      await window.commitOn(demo, { ...command, fields: { ...command.fields, mobile: '123456789' } }),
      await window.commitOn(demo, { ...command, product: 'equipment' }),
      await window.commitOn(demo, { ...command, documents: { ...command.documents, identity: { kind: 'saved', fileId: null } } }),
      await demo.prepareAttachment({ datasetId, applicationId: command.applicationId, slot: 'identity', selectionId: 'forbidden', source: { kind: 'local', file: new File(['wrong target'], 'DEMO.png', { type: 'image/png' }) } }),
    ]
    const obsolete = await window.commitOn(demo, { ...command, roundId: 'obsolete' })
    const stale = await window.commitOn(demo, command, before.value)
    await demo.signIn('salma'); const staff = await window.commitOn(demo, command)
    await demo.signIn('mariam'); const other = await window.commitOn(demo, command)
    await demo.signIn('huda')
    const armed = demo.controls()
    const after = await demo.readApplication(command.applicationId)
    const failed = await window.commitOn(demo, command)
    const retry = await window.commitOn(demo, command)
    const changedRoundIntent = await window.commitOn(demo, { ...command, roundId: 'different-round' })
    return { advanced, before, after, forbidden, obsolete, stale, staff, other, armed, failed, retry, changedRoundIntent, final: await demo.readApplication(command.applicationId) }
  }, datasetId)
  for (const outcome of result.forbidden) expect(outcome).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(result.obsolete).toMatchObject({ error: { kind: 'invalidState' } })
  expect(result.stale).toMatchObject({ error: { kind: 'staleWorkspace' } })
  // A reviewer/replacement save is not an applicant workspace correction.
  expect(result.staff).toMatchObject({ error: { kind: 'invalidState' } })
  expect(result.other).toMatchObject({ error: { kind: 'unavailable' } })
  expect(result.armed.failure).toBe('save')
  expect(result.after).toEqual(result.advanced.ok ? { ok: true, value: result.advanced.value.application } : null)
  expect(result.failed).toMatchObject({ error: { kind: 'requestFailed' } })
  expect(result.retry).toMatchObject({ ok: true, value: { application: { workspace: { snapshot: { fields: { amount: '' } } } } } })
  // A changed round is never replayed as the saved receipt; it is refused by state.
  expect(result.changedRoundIntent).toMatchObject({ error: { kind: 'invalidState' } })
  expect(result.final).toEqual(result.retry.ok ? { ok: true, value: result.retry.value.application } : null)
})

test('competing private saves conflict while assignment and internal notes do not stale private work', async ({ page, context }) => {
  const datasetId = await applicant(page)
  const command = await page.evaluate(async datasetId => {
    const view = await window.demo.readApplication('RIFD-2026-004')
    if (!view.ok || view.value.role !== 'applicant' || !view.value.workspace) throw new Error('No workspace')
    const workspace = view.value.workspace
    return { kind: 'saveCorrections' as const, datasetId, applicationId: view.value.id, roundId: workspace.roundId!, operationId: 'first-save', expectedWorkspaceRevision: workspace.revision, product: view.value.product, fields: { ...workspace.snapshot.fields, amount: '450000' }, documents: Object.fromEntries(Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../../src/demo').DraftDocuments }
  }, datasetId)
  const second = await context.newPage()
  await applicant(second)
  const staff = await context.newPage()
  await staff.goto('/tests/browser/support/api.html'); await staff.waitForFunction(() => window.demo)
  const shared = await staff.evaluate(async datasetId => {
    const demo = window.demo
    await demo.startup(); await demo.signIn('salma')
    const before = await demo.readApplication('RIFD-2026-004')
    if (!before.ok) throw new Error('No record')
    await window.commitOn(demo, { kind: 'saveNote', datasetId, applicationId: before.value.id, text: { ar: 'ملاحظة داخلية.', en: 'Private staff context.' } })
    await window.commitOn(demo, { kind: 'transferApplication', datasetId, applicationId: before.value.id, from: 'salma', to: 'khaled', confirmed: true })
    return demo.readApplication(before.value.id)
  }, datasetId)
  const saves = await Promise.all([
    page.evaluate(command => window.commit(command), command),
    second.evaluate(command => window.commit({ ...command, fields: { ...command.fields, amount: '400000' } }), command),
  ])
  expect(saves.filter(outcome => outcome.ok)).toHaveLength(1)
  expect(saves.find(outcome => !outcome.ok)).toMatchObject({ error: { kind: 'staleWorkspace' } })
  expect(await staff.evaluate(() => window.demo.readApplication('RIFD-2026-004'))).toEqual(shared)
  const inspection = await page.evaluate(command => window.inspect(command), command)
  if (!inspection.ok) throw new Error('No inspection')
  const inspected = inspection.value.status === 'committed' ? inspection.value.result.application : inspection.value.application
  expect(inspected).toMatchObject({ workspace: { revision: 2 } })
  const winner = saves.find(outcome => outcome.ok)!
  if (!winner.ok) throw new Error('No save')
  expect(winner.value.application.sharedRevision).toBe(3)
  expect(JSON.stringify(winner.value.application)).not.toContain('Private staff context.')
})

test('rollback and unknown completion retain prepared files for inspection and explicit retry', async ({ page }) => {
  const datasetId = await applicant(page)
  const setup = await page.evaluate(async datasetId => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-012')
    if (!before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('No workspace')
    const prepared = await demo.prepareAttachment({ datasetId, applicationId: before.value.id, slot: 'financial', selectionId: 'replacement', source: { kind: 'local', file: new File(['saved private financial bytes'], 'DEMO-financial.pdf', { type: 'application/pdf' }) } })
    if (!prepared.ok) throw new Error('No file')
    const workspace = before.value.workspace
    const command = { kind: 'saveCorrections' as const, datasetId, applicationId: before.value.id, roundId: workspace.roundId!, operationId: 'atomic-save', expectedWorkspaceRevision: workspace.revision, product: before.value.product, fields: workspace.snapshot.fields, documents: { ...Object.fromEntries(Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])), financial: { kind: 'prepared', attachment: prepared.value } } as import('../../../src/demo').DraftDocuments }
    demo.setControls({ slow: false, failure: 'storage' })
    const failed = await window.commitOn(demo, command)
    const ready = await demo.readPrepared(command.applicationId, prepared.value)
    return { before, command, failed, after: await demo.readApplication(command.applicationId), ready: ready.ok ? new TextDecoder().decode(ready.value.bytes) : ready, inspection: await window.inspectOn(demo, command), file: await demo.readFile(command.applicationId, prepared.value.id) }
  }, datasetId)
  expect(setup.failed).toMatchObject({ error: { kind: 'storage' } })
  expect(setup.after).toEqual(setup.before)
  expect(setup.ready).toBe('saved private financial bytes')
  expect(setup.file).toMatchObject({ error: { kind: 'unavailable' } })
  expect(setup.inspection).toMatchObject({ value: { status: 'notCommitted' } })
  await page.evaluate(loseNextWriteCompletion)
  expect(await page.evaluate(command => window.commit(command), setup.command)).toMatchObject({ error: { kind: 'outcomeUnknown' } })
  const recovered = await page.evaluate(async command => ({ inspection: await window.inspect(command), replay: await window.commit(command), view: await window.demo.readApplication(command.applicationId) }), setup.command)
  expect(recovered.inspection).toMatchObject({ ok: true, value: { status: 'committed', result: { receipt: { kind: 'saveCorrections', workspaceRevision: 2 }, application: { workspace: { revision: 2 } } } } })
  // The explicit retry is a new operation and still holds the staged bytes: the
  // same file is attached once at the next private revision.
  expect(recovered.replay).toMatchObject({ ok: true, value: { receipt: { kind: 'saveCorrections', workspaceRevision: 3 }, application: { workspace: { revision: 3 } } } })
  if (!recovered.inspection.ok || recovered.inspection.value.status !== 'committed' || !recovered.replay.ok || setup.command.documents.financial.kind !== 'prepared') throw new Error('No inspection, replay or file')
  expect(recovered.replay.value.receipt.operationId).not.toBe(recovered.inspection.value.result.receipt.operationId)
  const replayView = recovered.replay.value.application
  if (!('workspace' in replayView) || !replayView.workspace) throw new Error('No workspace')
  expect(replayView.workspace.snapshot.documents.financial).toBe(setup.command.documents.financial.attachment.id)
  expect(recovered.view).toMatchObject({ ok: true, value: { workspace: { revision: 3 } } })
})

test('expiry at commit aborts all private changes and permits the same identity to inspect and retry', async ({ page }) => {
  const datasetId = await applicant(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-004')
    if (!before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('No workspace')
    const workspace = before.value.workspace
    const command = { kind: 'saveCorrections' as const, datasetId, applicationId: before.value.id, roundId: workspace.roundId!, operationId: 'expired-save', expectedWorkspaceRevision: workspace.revision, product: before.value.product, fields: { ...workspace.snapshot.fields, amount: '450000' }, documents: Object.fromEntries(Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../../src/demo').DraftDocuments }
    const put = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
      IDBObjectStore.prototype.put = put
      const request = put.apply(this, args)
      request.addEventListener('success', () => demo.expireSession(), { once: true })
      return request
    }
    const expired = await window.commitOn(demo, command)
    const locked = await demo.readApplication(command.applicationId)
    await demo.signIn('huda')
    return { before, expired, locked, after: await demo.readApplication(command.applicationId), inspection: await window.inspectOn(demo, command), retry: await window.commitOn(demo, command) }
  }, datasetId)
  expect(result.expired).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(result.locked).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(result.after).toEqual(result.before)
  expect(result.inspection).toMatchObject({ value: { status: 'notCommitted' } })
  expect(result.retry).toMatchObject({ ok: true })
})
