import { expect, test, type Page } from '@playwright/test'
import type { ReviewOperation } from '../../src/demo'
import { loseNextWriteCompletion } from './storage-faults'

test.describe.configure({ mode: 'parallel' })

async function start(page: Page) {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(async () => { await window.demo.startup(); await window.demo.signIn('salma') })
}

test('simulated colleague transfer commits once and preserves the completed review', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.context()
    const before = await demo.readApplication('RIFD-2026-007')
    if (!context.ok || !before.ok) throw new Error('No application')
    const command = { kind: 'transferApplication', datasetId: context.value.datasetId, applicationId: before.value.id, operationId: 'simulation', expectedSharedRevision: before.value.sharedRevision, from: 'salma', to: 'khaled', confirmed: true, simulated: true } as ReviewOperation
    const transfer = await demo.execute(command)
    return { before, transfer, replay: await demo.execute(command), inspection: await demo.inspectOperation(command), after: await demo.readApplication(before.value.id) }
  })
  expect(result.transfer).toMatchObject({ ok: true, value: { application: { status: 'underReview', assignment: { en: 'Khaled Ali' }, assignedToYou: false } } })
  expect(result.replay).toEqual(result.transfer)
  expect(result.inspection).toMatchObject({ value: { status: 'committed', result: result.transfer.ok ? result.transfer.value : null } })
  if (!result.before.ok || result.before.value.role !== 'reviewer' || !result.transfer.ok || result.transfer.value.application.role !== 'reviewer') throw new Error('No transfer')
  const before = result.before.value
  const after = result.transfer.value.application
  expect(after).toMatchObject({ snapshot: before.snapshot, assessments: before.assessments, checks: before.checks, notes: before.notes, rounds: before.rounds, history: before.history, repayment: before.repayment, sharedRevision: before.sharedRevision + 1 })
  expect(after.activity.slice(0, -1)).toEqual(before.activity)
  expect(after.activity.at(-1)).toMatchObject({ kind: 'assigned', actor: 'khaled', description: { en: 'Simulated transfer from Salma Nasser to Khaled Ali.' } })
  expect(result.after).toEqual({ ok: true, value: after })
})

test('every stale staff write is refused without a receipt or application and applicant effects', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.context()
    const before = await demo.readApplication('RIFD-2026-007')
    if (!context.ok || !context.value.session || !before.ok) throw new Error('No application')
    const base = { datasetId: context.value.datasetId, applicationId: before.value.id, expectedSharedRevision: before.value.sharedRevision }
    const transferred = await demo.execute({ ...base, kind: 'transferApplication', from: 'salma', to: 'khaled', confirmed: true, simulated: true, operationId: 'outside-transfer' })
    const edits = [
      { kind: 'claimApplication' }, { kind: 'unassignApplication' }, { kind: 'startReview' },
      { kind: 'transferApplication', from: 'salma', to: 'khaled', confirmed: true },
      { kind: 'assessDocument', slot: 'identity', fileId: before.value.snapshot.documents.identity, status: 'needsReplacement', reason: { ar: 'سبب غير مطبق', en: 'Unapplied reason' } },
      { kind: 'recordCheck', check: 'purpose', outcome: 'failed' },
      { kind: 'saveNote', text: { ar: 'ملاحظة غير مطبقة', en: 'Unapplied note' } },
      { kind: 'verifyCorrection', roundId: 'earlier-round', field: 'amount', verified: true },
      { kind: 'requestCorrections', confirmed: true, targets: [{ kind: 'field', field: 'amount', reason: { ar: 'تعديل المبلغ', en: 'Change the amount' } }] },
      ...(['approve', 'reject'] as const).map(kind => ({ kind, reason: { ar: 'سبب القرار', en: 'Decision reason' }, confirmed: true, confirmationSessionId: context.value.session!.sessionId })),
    ]
    const refusals = []
    for (const edit of edits) {
      const command = { ...base, ...edit, operationId: `stale-${edit.kind}` } as ReviewOperation
      refusals.push({ result: await demo.execute(command), inspection: await demo.inspectOperation(command) })
    }
    const after = await demo.readApplication(base.applicationId)
    await demo.signIn('mariam')
    return { transferred, after, refusals, applicant: await demo.readApplication(base.applicationId), notices: await demo.readNotifications() }
  })
  expect(result.refusals).toHaveLength(11)
  for (const refusal of result.refusals) {
    expect(refusal.result).toMatchObject({ ok: false, error: { kind: 'staleRecord' } })
    expect(refusal.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted', application: result.transferred.ok ? result.transferred.value.application : null } })
  }
  expect(result.after).toEqual(result.transferred.ok ? { ok: true, value: result.transferred.value.application } : null)
  expect(result.applicant).toMatchObject({ value: { status: 'underReview', repayment: null } })
  expect(result.applicant.ok && result.applicant.value.history.some(event => ['correctionsRequested', 'approved', 'rejected'].includes(event.kind))).toBe(false)
  expect(result.notices.ok && result.notices.value.filter(notice => notice.applicationId === 'RIFD-2026-007')).toEqual([])
})

test('simulation eligibility, stale versus forbidden precedence, and explicit reclaimed retry', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.context()
    if (!context.ok) throw new Error('No context')
    const ineligible = []
    for (const suffix of ['001', '002', '003', '004', '005', '006', '008', '010', '011', '012', '013']) {
      const command = { kind: 'transferApplication', datasetId: context.value.datasetId, applicationId: `RIFD-2026-${suffix}`, expectedSharedRevision: 1, operationId: `simulate-${suffix}`, from: 'salma', to: 'khaled', confirmed: true, simulated: true } as const
      const before = await demo.readApplication(command.applicationId)
      ineligible.push({ before, result: await demo.execute(command), after: await demo.readApplication(command.applicationId) })
    }
    const base = { datasetId: context.value.datasetId, applicationId: 'RIFD-2026-007' }
    const command = { ...base, kind: 'saveNote', operationId: 'unapplied-note', expectedSharedRevision: 1, text: { ar: 'نص محفوظ للمحاولة', en: 'Retained text for retry' } } as const
    await demo.execute({ ...base, kind: 'transferApplication', operationId: 'simulated-transfer', expectedSharedRevision: 1, from: 'salma', to: 'khaled', confirmed: true, simulated: true })
    const stale = await demo.execute(command)
    const forbidden = await demo.execute({ ...command, expectedSharedRevision: 2 })
    await demo.signIn('huda')
    const hidden = await demo.execute(command)
    await demo.signIn('salma')
    const reclaim = await demo.execute({ ...base, kind: 'transferApplication', operationId: 'reclaim', expectedSharedRevision: 2, from: 'khaled', to: 'salma', confirmed: true })
    const oldIntent = await demo.execute(command)
    const inspected = await demo.readApplication(base.applicationId)
    if (!inspected.ok) throw new Error('No inspection')
    const retry = { ...command, operationId: 'fresh-note', expectedSharedRevision: inspected.value.sharedRevision }
    const saved = await demo.execute(retry)
    return { ineligible, stale, forbidden, hidden, reclaim, oldIntent, saved, replay: await demo.execute(retry) }
  })
  for (const fixture of result.ineligible) {
    expect(fixture.result.ok).toBe(false)
    expect(fixture.after).toEqual(fixture.before)
  }
  expect(result.stale).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(result.forbidden).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(result.hidden).toMatchObject({ error: { kind: 'unavailable' } })
  expect(result.reclaim).toMatchObject({ value: { application: { assignedToYou: true, sharedRevision: 3 } } })
  expect(result.oldIntent).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(result.saved).toMatchObject({ value: { application: { notes: expect.arrayContaining([expect.objectContaining({ text: { ar: 'نص محفوظ للمحاولة', en: 'Retained text for retry' } })]), sharedRevision: 4 } } })
  expect(result.replay).toEqual(result.saved)
})

test('a real same-context two-tab race serializes transfer and note without lost or duplicate effects', async ({ page, context }) => {
  await start(page)
  const other = await context.newPage()
  await start(other)
  const base = await page.evaluate(async () => {
    const context = await window.demo.context()
    if (!context.ok) throw new Error('No context')
    return { datasetId: context.value.datasetId, applicationId: 'RIFD-2026-007', expectedSharedRevision: 1 }
  })
  const transfer = { ...base, kind: 'transferApplication', operationId: 'racing-transfer', from: 'salma', to: 'khaled', confirmed: true } as const
  const note = { ...base, kind: 'saveNote', operationId: 'racing-note', text: { ar: 'ملاحظة متزامنة', en: 'Concurrent note' } } as const
  const outcomes = await Promise.all([
    page.evaluate(command => window.demo.execute(command), transfer),
    other.evaluate(command => window.demo.execute(command), note),
  ])
  expect(outcomes.filter(result => result.ok)).toHaveLength(1)
  expect(outcomes.find(result => !result.ok)).toMatchObject({ error: { kind: 'staleRecord' } })
  const winner = outcomes[0].ok ? transfer : note
  const final = await page.evaluate(async command => ({ replay: await window.demo.execute(command), view: await window.demo.readApplication(command.applicationId) }), winner)
  const success = outcomes.find(result => result.ok)!
  expect(final.replay).toEqual(success)
  expect(final.view).toEqual(success.ok ? { ok: true, value: success.value.application } : null)
  if (!final.view.ok || final.view.value.role !== 'reviewer') throw new Error('No view')
  expect(final.view.value.sharedRevision).toBe(2)
  expect(final.view.value.notes.filter(note => note.text.en === 'Concurrent note')).toHaveLength(winner.kind === 'saveNote' ? 1 : 0)
})

test('expired recovery refuses pending reclaim and inspection until a new sign-in', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.context()
    if (!context.ok) throw new Error('No context')
    const base = { datasetId: context.value.datasetId, applicationId: 'RIFD-2026-007' }
    const simulation = { ...base, kind: 'transferApplication', operationId: 'simulation', expectedSharedRevision: 1, from: 'salma', to: 'khaled', confirmed: true, simulated: true } as const
    const transfer = await demo.execute(simulation)
    demo.setControls({ slow: true, failure: null })
    const pending = demo.execute({ ...base, kind: 'transferApplication', operationId: 'expired-reclaim', expectedSharedRevision: 2, from: 'khaled', to: 'salma', confirmed: true })
    demo.expireSession()
    const refused = await pending
    const inspection = await demo.inspectOperation(simulation)
    await demo.signIn('salma')
    demo.setControls({ slow: false, failure: null })
    return { transfer, refused, inspection, after: await demo.readApplication(base.applicationId) }
  })
  expect(result.refused).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(result.inspection).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(result.after).toEqual(result.transfer.ok ? { ok: true, value: result.transfer.value.application } : null)
})

test('simulation rollback and unknown completion retain one atomic transfer and a distinct receipt intent', async ({ page }) => {
  await start(page)
  const aborted = await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.context()
    if (!context.ok) throw new Error('No context')
    const command = { kind: 'transferApplication', datasetId: context.value.datasetId, applicationId: 'RIFD-2026-007', operationId: 'simulation', expectedSharedRevision: 1, from: 'salma', to: 'khaled', confirmed: true, simulated: true } as const
    demo.setControls({ slow: false, failure: 'storage' })
    const before = await demo.readApplication(command.applicationId)
    const failed = await demo.execute(command)
    const afterFailure = await demo.readApplication(command.applicationId)
    return { command, before, failed, afterFailure, inspection: await demo.inspectOperation(command) }
  })
  expect(aborted.failed).toMatchObject({ error: { kind: 'storage' } })
  expect(aborted.afterFailure).toEqual(aborted.before)
  expect(aborted.inspection).toMatchObject({ value: { status: 'notCommitted' } })
  await page.evaluate(loseNextWriteCompletion)
  const result = await page.evaluate(async command => {
    const demo = window.demo
    const retry = await demo.execute(command)
    const { simulated: _simulated, ...normal } = command
    void _simulated
    return { retry, inspection: await demo.inspectOperation(command), replay: await demo.execute(command), misuse: await demo.execute(normal) }
  }, aborted.command)
  expect(result.retry).toMatchObject({ error: { kind: 'outcomeUnknown' } })
  expect(result.inspection).toMatchObject({ value: { status: 'committed', result: { application: { sharedRevision: 2 } } } })
  expect(result.replay).toEqual(result.inspection.ok && result.inspection.value.status === 'committed' ? { ok: true, value: result.inspection.value.result } : null)
  expect(result.misuse).toMatchObject({ error: { kind: 'identifierMisuse' } })
})
