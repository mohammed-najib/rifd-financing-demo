import { expect, test, type Page } from '@playwright/test'
import { loseNextWriteCompletion, refuseCommitNotices } from './storage-faults'

test.describe.configure({ mode: 'parallel' })
async function staff(page: Page) {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  return page.evaluate(async () => {
    await window.demo.startup()
    const result = await window.demo.signIn('salma')
    if (!result.ok) throw new Error('No session')
    return result.value.datasetId
  })
}

test('requests a missing document and a field with a fixed baseline, private workspace and one public notice', async ({ page }) => {
  const datasetId = await staff(page)
  await page.evaluate(refuseCommitNotices)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const applicationId = 'RIFD-2026-003'
    await demo.execute({ kind: 'startReview', datasetId, applicationId, operationId: 'start', expectedSharedRevision: 1 })
    const before = await demo.readApplication(applicationId)
    if (!before.ok) throw new Error('No record')
    const sent = await demo.execute({ kind: 'requestCorrections', datasetId, applicationId, operationId: 'request', expectedSharedRevision: before.value.sharedRevision, confirmed: true, targets: [
      { kind: 'field', field: 'revenue', reason: { ar: 'صحح الإيراد الشهري.', en: 'Correct monthly revenue.' } },
      { kind: 'document', slot: 'financial', reason: { ar: 'أضف ملخص الأشهر الثلاثة.', en: 'Add the three-month summary.' } },
    ] })
    const staff = await demo.readApplication(applicationId)
    await demo.signIn('huda')
    return { before, sent, staff, applicant: await demo.readApplication(applicationId), notifications: await demo.readNotifications(), print: await demo.readPrintSummary(applicationId) }
  }, datasetId)
  expect(result.sent).toMatchObject({ ok: true, value: { receipt: { kind: 'requestCorrections', sharedRevision: 3 }, application: { status: 'correctionsRequested', assignedToYou: true } } })
  if (!result.before.ok || !result.staff.ok || !result.applicant.ok || result.applicant.value.role !== 'applicant' || result.staff.value.role !== 'reviewer') throw new Error('No record')
  const round = result.staff.value.rounds.at(-1)!
  expect(round.baseline).toEqual(result.before.value.snapshot)
  expect(round.response).toBeNull()
  expect(round.targets).toEqual([
    { kind: 'field', field: 'revenue', reason: { ar: 'صحح الإيراد الشهري.', en: 'Correct monthly revenue.' }, verified: false },
    { kind: 'document', slot: 'financial', reason: { ar: 'أضف ملخص الأشهر الثلاثة.', en: 'Add the three-month summary.' }, verified: false },
  ])
  expect(result.applicant.value.workspace).toMatchObject({ revision: 1, roundId: round.id, snapshot: result.before.value.snapshot })
  expect(result.staff.value).not.toHaveProperty('workspace')
  expect(result.staff.value.snapshot).toEqual(result.before.value.snapshot)
  expect(result.staff.value.checks).toEqual(result.before.value.role === 'reviewer' && result.before.value.checks)
  expect(result.staff.value.permissions).toMatchObject({ requestCorrections: false, assessDocument: false, recordCheck: false, saveNote: true })
  expect(result.staff.value.history).toHaveLength(result.before.value.history.length + 1)
  expect(result.staff.value.history.at(-1)).toMatchObject({ kind: 'correctionsRequested', reason: { en: expect.stringContaining('Correct monthly revenue.') } })
  expect(result.notifications).toMatchObject({ ok: true, value: expect.arrayContaining([expect.objectContaining({ applicationId: 'RIFD-2026-003', kind: 'correctionsRequested', read: false })]) })
  expect(JSON.stringify(result.applicant)).not.toContain('verified')
  expect(result.print).toMatchObject({ ok: true, value: { rounds: [{ targets: result.applicant.value.rounds[0].targets }] } })
  await page.reload(); await page.waitForFunction(() => window.demo)
  expect(await page.evaluate(async () => { await window.demo.startup(); return window.demo.readApplication('RIFD-2026-003') })).toEqual(result.applicant)
})

test('refuses invalid targets, empty reasons and an unconfirmed request without any effects', async ({ page }) => {
  const datasetId = await staff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-007')
    if (!before.ok) throw new Error('No record')
    const reason = { ar: 'صحح القيمة.', en: 'Correct the value.' }
    const field = { kind: 'field', field: 'amount', reason }
    const invalid = [
      { targets: [] }, { targets: [field, field] },
      { targets: [{ kind: 'document', slot: 'financial', reason }, { kind: 'document', slot: 'financial', reason }] },
      { targets: [{ kind: 'field', field: 'product', reason }] },
      { targets: [{ kind: 'field', field: 'evidenceMonths', reason }] },
      { targets: [{ kind: 'document', slot: 'unknown', reason }] },
      { targets: [{ ...field, reason: { ar: ' ', en: ' ' } }] },
      { targets: [{ ...field, reason: { ar: 'سبب', en: '' } }] },
      { targets: [field], confirmed: false },
      { targets: [field], confirmed: undefined },
      { targets: [field], unlockDependencies: true },
    ]
    demo.setControls({ slow: false, failure: 'storage' })
    const outcomes = []
    for (const payload of invalid) outcomes.push(await demo.execute({ kind: 'requestCorrections', datasetId, applicationId: before.value.id, operationId: crypto.randomUUID(), expectedSharedRevision: before.value.sharedRevision, confirmed: true, ...payload } as import('../../src/demo').ReviewOperation))
    return { before, outcomes, after: await demo.readApplication(before.value.id), controls: demo.controls() }
  }, datasetId)
  for (const outcome of result.outcomes) expect(outcome).toMatchObject({ ok: false, error: { kind: 'validation' } })
  expect(result.after).toEqual(result.before)
  expect(result.controls.failure).toBe('storage')
})

test('request permissions enforce state, assignment, dataset and applicant access', async ({ page }) => {
  const datasetId = await staff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const outcomes = []
    for (const id of ['002', '003', '011', '008', '004', '013', '005', '006']) {
      const applicationId = `RIFD-2026-${id}`
      const before = await demo.readApplication(applicationId)
      if (!before.ok) throw new Error('No record')
      const command = { kind: 'requestCorrections' as const, datasetId, applicationId, operationId: `refuse-${id}`, expectedSharedRevision: before.value.sharedRevision, confirmed: true as const, targets: [{ kind: 'field' as const, field: 'mobile' as const, reason: { ar: 'صحح الرقم.', en: 'Correct the number.' } }] }
      const outcome = await demo.execute(command)
      outcomes.push({ before, outcome, after: await demo.readApplication(applicationId), inspection: await demo.inspectOperation(command) })
    }
    const before = await demo.readApplication('RIFD-2026-007')
    if (!before.ok) throw new Error('No record')
    const command = { kind: 'requestCorrections' as const, datasetId, applicationId: before.value.id, operationId: 'access', expectedSharedRevision: before.value.sharedRevision, confirmed: true as const, targets: [{ kind: 'field' as const, field: 'mobile' as const, reason: { ar: 'صحح الرقم.', en: 'Correct the number.' } }] }
    const wrongDataset = await demo.execute({ ...command, datasetId: crypto.randomUUID() })
    await demo.signIn('mariam')
    const owner = await demo.execute(command)
    await demo.signIn('huda')
    const stranger = await demo.execute(command)
    await demo.signOut()
    const unsigned = await demo.execute(command)
    await demo.signIn('salma')
    return { outcomes, before, wrongDataset, owner, stranger, unsigned, after: await demo.readApplication(command.applicationId) }
  }, datasetId)
  for (const value of result.outcomes) {
    expect(value.outcome.ok).toBe(false)
    expect(value.after).toEqual(value.before)
    expect(value.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  }
  expect(result.wrongDataset).toMatchObject({ error: { kind: 'supersededDataset' } })
  expect(result.owner).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(result.stranger).toMatchObject({ error: { kind: 'unavailable' } })
  expect(result.unsigned).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(result.after).toEqual(result.before)
})

test('request rollback, uncertain completion and replay never duplicate rounds, public events or notifications', async ({ page }) => {
  const datasetId = await staff(page)
  const command = await page.evaluate(async datasetId => {
    const view = await window.demo.readApplication('RIFD-2026-007')
    if (!view.ok) throw new Error('No record')
    return { kind: 'requestCorrections' as const, datasetId, applicationId: view.value.id, operationId: 'atomic-request', expectedSharedRevision: view.value.sharedRevision, confirmed: true as const, targets: [{ kind: 'field' as const, field: 'amount' as const, reason: { ar: 'خفّض المبلغ.', en: 'Reduce the amount.' } }, { kind: 'document' as const, slot: 'purchase' as const, reason: { ar: 'استبدل العرض.', en: 'Replace the quotation.' } }] }
  }, datasetId)
  const aborted = await page.evaluate(async command => {
    const demo = window.demo
    const before = await demo.readApplication(command.applicationId)
    await demo.signIn('mariam'); const notices = await demo.readNotifications(); await demo.signIn('salma')
    demo.setControls({ slow: false, failure: 'storage' })
    const stale = await demo.execute({ ...command, expectedSharedRevision: 99 })
    const armed = demo.controls()
    const outcome = await demo.execute(command)
    const after = await demo.readApplication(command.applicationId)
    const inspection = await demo.inspectOperation(command)
    await demo.signIn('mariam'); const afterNotices = await demo.readNotifications(); await demo.signIn('salma')
    return { before, notices, stale, armed, outcome, after, inspection, afterNotices }
  }, command)
  expect(aborted.stale).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(aborted.armed.failure).toBe('storage')
  expect(aborted.outcome).toMatchObject({ error: { kind: 'storage' } })
  expect(aborted.after).toEqual(aborted.before)
  expect(aborted.afterNotices).toEqual(aborted.notices)
  expect(aborted.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  await page.evaluate(loseNextWriteCompletion)
  expect(await page.evaluate(command => window.demo.execute(command), command)).toMatchObject({ error: { kind: 'outcomeUnknown' } })
  const recovered = await page.evaluate(async command => {
    const demo = window.demo
    const inspection = await demo.inspectOperation(command)
    const replay = await demo.execute({ ...command, expectedSharedRevision: 99 })
    const misuse = await demo.execute({ ...command, targets: [command.targets[0]] })
    const view = await demo.readApplication(command.applicationId)
    if (!view.ok) throw new Error('No record')
    const base = { datasetId: command.datasetId, applicationId: command.applicationId, expectedSharedRevision: view.value.sharedRevision }
    const blocked = [
      await demo.execute({ ...command, ...base, operationId: 'second-request' }),
      await demo.execute({ ...base, kind: 'recordCheck', operationId: 'paused-check', check: 'purpose', outcome: 'failed' }),
      await demo.execute({ ...base, kind: 'assessDocument', operationId: 'paused-assessment', slot: 'identity', fileId: view.value.snapshot.documents.identity!, status: 'accepted', reason: null }),
    ]
    const note = await demo.execute({ ...base, kind: 'saveNote', operationId: 'permitted-note', text: { ar: 'ملاحظة خاصة.', en: 'Private pending context.' } })
    await demo.signIn('mariam')
    return { inspection, replay, misuse, blocked, note, applicant: await demo.readApplication(command.applicationId), notices: await demo.readNotifications(), print: await demo.readPrintSummary(command.applicationId) }
  }, command)
  expect(recovered.inspection).toMatchObject({ ok: true, value: { status: 'committed' } })
  if (!recovered.inspection.ok || recovered.inspection.value.status !== 'committed') throw new Error('No receipt')
  expect(recovered.replay).toEqual({ ok: true, value: recovered.inspection.value.result })
  expect(recovered.misuse).toMatchObject({ error: { kind: 'identifierMisuse' } })
  for (const outcome of recovered.blocked) expect(outcome).toMatchObject({ error: { kind: 'invalidState' } })
  expect(recovered.note.ok).toBe(true)
  expect(recovered.applicant).toMatchObject({ ok: true, value: { rounds: [expect.objectContaining({ targets: command.targets })] } })
  expect(JSON.stringify({ applicant: recovered.applicant, print: recovered.print, notices: recovered.notices })).not.toContain('Private pending context.')
  if (!recovered.notices.ok || !aborted.notices.ok) throw new Error('No notices')
  expect(recovered.notices.value).toHaveLength(aborted.notices.value.length + 1)
  const after = recovered.inspection.value.result.application
  if (!aborted.before.ok) throw new Error('No baseline')
  expect(after.history).toHaveLength(aborted.before.value.history.length + 1)
  expect(after.sharedRevision).toBe(aborted.before.value.sharedRevision + 1)
})

test('expiry aborts a staged request and a competing transfer refuses the old intent before assignment denial', async ({ page, context }) => {
  const datasetId = await staff(page)
  const setup = await page.evaluate(async datasetId => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-007')
    if (!before.ok) throw new Error('No record')
    const command = { kind: 'requestCorrections' as const, datasetId, applicationId: before.value.id, operationId: 'expired-request', expectedSharedRevision: before.value.sharedRevision, confirmed: true as const, targets: [{ kind: 'field' as const, field: 'mobile' as const, reason: { ar: 'صحح الرقم.', en: 'Correct the number.' } }] }
    const put = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
      const request = put.apply(this, args)
      request.addEventListener('success', () => demo.expireSession(), { once: true })
      return request
    }
    const expired = await demo.execute(command)
    IDBObjectStore.prototype.put = put
    await demo.signIn('salma')
    return { before, command, expired, after: await demo.readApplication(command.applicationId), inspection: await demo.inspectOperation(command) }
  }, datasetId)
  expect(setup.expired).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(setup.after).toEqual(setup.before)
  expect(setup.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  const second = await context.newPage()
  await staff(second)
  expect(await second.evaluate(command => window.demo.execute({ kind: 'transferApplication', datasetId: command.datasetId, applicationId: command.applicationId, operationId: 'competing-transfer', expectedSharedRevision: command.expectedSharedRevision, from: 'salma', to: 'khaled', confirmed: true }), setup.command)).toMatchObject({ ok: true })
  expect(await page.evaluate(command => window.demo.execute(command), setup.command)).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(await page.evaluate(command => window.demo.execute({ ...command, operationId: 'new-intent', expectedSharedRevision: command.expectedSharedRevision + 1 }), setup.command)).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(await page.evaluate(command => window.demo.inspectOperation(command), setup.command)).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
})
