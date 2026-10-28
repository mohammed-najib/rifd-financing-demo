import { expect, test, type Page } from '@playwright/test'
import type { ReviewIntent } from '../../../src/demo'
import { loseNextWriteCompletion } from '../support/storage-faults'

test.describe.configure({ mode: 'parallel' })

async function start(page: Page) {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(async () => { await window.demo.startup(); await window.demo.signIn('salma') })
}

test('simulated colleague transfer commits once and preserves the completed review', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-007')
    if (!before.ok) throw new Error('No application')
    const intent = { kind: 'transferApplication', applicationId: before.value.id, from: 'salma', to: 'khaled', confirmed: true, simulated: true } as const
    const transfer = await window.commitOn(demo, intent)
    // A repeated transfer is a new operation refused by the assignment it already changed.
    return { before, transfer, replay: await window.commitOn(demo, intent), inspection: await window.inspectOn(demo, intent), after: await demo.readApplication(before.value.id) }
  })
  expect(result.transfer).toMatchObject({ ok: true, value: { application: { status: 'underReview', assignment: { en: 'Khaled Ali' }, assignedToYou: false } } })
  expect(result.replay).toMatchObject({ error: { kind: 'invalidState' } })
  // Nothing is pending after a committed transfer, so inspection reports the record.
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted', application: result.transfer.ok ? result.transfer.value.application : null } })
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
    const base = { applicationId: before.value.id }
    const transferred = await window.commitOn(demo, { ...base, kind: 'transferApplication', from: 'salma', to: 'khaled', confirmed: true, simulated: true })
    const edits = [
      { kind: 'claimApplication' }, { kind: 'unassignApplication' }, { kind: 'startReview' },
      { kind: 'transferApplication', from: 'salma', to: 'khaled', confirmed: true },
      { kind: 'assessDocument', slot: 'identity', fileId: before.value.snapshot.documents.identity, inspection: { kind: 'inspected', confirmed: true, contextToken: before.value.role === 'reviewer' ? before.value.inspectionContexts.identity! : 'unavailable' }, status: 'needsReplacement', reason: { ar: 'سبب غير مطبق', en: 'Unapplied reason' } },
      { kind: 'recordCheck', check: 'purpose', outcome: 'failed' },
      { kind: 'saveNote', text: { ar: 'ملاحظة غير مطبقة', en: 'Unapplied note' } },
      { kind: 'verifyCorrection', roundId: 'earlier-round', field: 'amount', verified: true },
      { kind: 'requestCorrections', confirmed: true, targets: [{ kind: 'field', field: 'amount', reason: { ar: 'تعديل المبلغ', en: 'Change the amount' } }] },
      ...(['approve', 'reject'] as const).map(kind => ({ kind, reason: { ar: 'سبب القرار', en: 'Decision reason' }, confirmed: true })),
    ]
    const refusals = []
    for (const edit of edits) {
      const intent = { ...base, ...edit } as ReviewIntent
      // Every write was prepared from the record before the simulated transfer.
      refusals.push({ result: await window.commitOn(demo, intent, before.value), inspection: await window.inspectOn(demo, intent) })
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
      ineligible.push({ before, result: await window.commitOn(demo, command), after: await demo.readApplication(command.applicationId) })
    }
    const base = { applicationId: 'RIFD-2026-007' }
    const held = await demo.readApplication(base.applicationId)
    if (!held.ok) throw new Error('No application')
    const command = { ...base, kind: 'saveNote', text: { ar: 'نص محفوظ للمحاولة', en: 'Retained text for retry' } } as const
    await window.commitOn(demo, { ...base, kind: 'transferApplication', from: 'salma', to: 'khaled', confirmed: true, simulated: true })
    // The note prepared before the transfer is stale; the current one is refused by assignment.
    const stale = await window.commitOn(demo, command, held.value)
    const forbidden = await window.commitOn(demo, command)
    await demo.signIn('huda')
    const hidden = await window.commitOn(demo, command)
    await demo.signIn('salma')
    const reclaim = await window.commitOn(demo, { ...base, kind: 'transferApplication', from: 'khaled', to: 'salma', confirmed: true })
    const oldIntent = await window.commitOn(demo, command, held.value)
    const inspected = await demo.readApplication(base.applicationId)
    if (!inspected.ok) throw new Error('No inspection')
    const saved = await window.commitOn(demo, { ...command })
    // The retry moved the record, so the view it was prepared from is now stale.
    const replay = await window.commitOn(demo, { ...command }, inspected.value)
    return { ineligible, stale, forbidden, hidden, reclaim, oldIntent, saved, replay, after: await demo.readApplication(base.applicationId) }
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
  expect(result.replay).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(result.after).toEqual(result.saved.ok ? { ok: true, value: result.saved.value.application } : null)
  if (!result.after.ok || result.after.value.role !== 'reviewer') throw new Error('No record')
  expect(result.after.value.notes.filter(note => note.text.en === 'Retained text for retry')).toHaveLength(1)
})

test('a real same-context two-tab race serializes transfer and note without lost or duplicate effects', async ({ page, context }) => {
  await start(page)
  const other = await context.newPage()
  await start(other)
  const base = await page.evaluate(async () => {
    const view = await window.demo.readApplication('RIFD-2026-007')
    if (!view.ok || view.value.role !== 'reviewer') throw new Error('No view')
    return view.value
  })
  const applicationId = base.id
  const transfer = { kind: 'transferApplication' as const, applicationId, from: 'salma' as const, to: 'khaled' as const, confirmed: true as const }
  const note = { kind: 'saveNote' as const, applicationId, text: { ar: 'ملاحظة متزامنة', en: 'Concurrent note' } }
  const outcomes = await Promise.all([
    page.evaluate(command => window.commit(command), transfer),
    other.evaluate(command => window.commit(command), note),
  ])
  expect(outcomes.filter(result => result.ok)).toHaveLength(1)
  expect(outcomes.find(result => !result.ok)).toMatchObject({ error: { kind: 'staleRecord' } })
  const winner = outcomes[0].ok ? transfer : note
  const success = outcomes.find(result => result.ok)!
  // Retrying the winner from the view it was prepared from cannot repeat its effect.
  const final = await page.evaluate(async ({ command, view }) => ({ replay: await window.commit(command, view), view: await window.demo.readApplication(command.applicationId) }), { command: winner, view: base })
  expect(final.replay).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(final.view).toEqual(success.ok ? { ok: true, value: success.value.application } : null)
  if (!final.view.ok || final.view.value.role !== 'reviewer') throw new Error('No view')
  expect(final.view.value.sharedRevision).toBe(2)
  expect(final.view.value.notes.filter(note => note.text.en === 'Concurrent note')).toHaveLength(winner.kind === 'saveNote' ? 1 : 0)
  expect(final.view.value.activity).toHaveLength(base.activity.length + 1)
  expect(final.view.value.history).toEqual(base.history)
})

test('expired recovery refuses pending reclaim and inspection until a new sign-in', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.context()
    if (!context.ok) throw new Error('No context')
    const base = { datasetId: context.value.datasetId, applicationId: 'RIFD-2026-007' }
    const simulation = { ...base, kind: 'transferApplication', operationId: 'simulation', expectedSharedRevision: 1, from: 'salma', to: 'khaled', confirmed: true, simulated: true } as const
    const transfer = await window.commitOn(demo, simulation)
    demo.setControls({ slow: true, failure: null })
    const pending = window.commitOn(demo, { ...base, kind: 'transferApplication', from: 'khaled', to: 'salma', confirmed: true })
    demo.expireSession()
    const refused = await pending
    const inspection = await window.inspectOn(demo, simulation)
    await demo.signIn('salma')
    demo.setControls({ slow: false, failure: null })
    return { transfer, refused, inspection, after: await demo.readApplication(base.applicationId) }
  })
  expect(result.refused).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(result.inspection).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(result.after).toEqual(result.transfer.ok ? { ok: true, value: result.transfer.value.application } : null)
})

test('simulation rollback and unknown completion retain one atomic transfer and refuse repeats', async ({ page }) => {
  await start(page)
  const aborted = await page.evaluate(async () => {
    const demo = window.demo
    const intent = { kind: 'transferApplication', applicationId: 'RIFD-2026-007', from: 'salma', to: 'khaled', confirmed: true, simulated: true } as const
    demo.setControls({ slow: false, failure: 'storage' })
    const before = await demo.readApplication(intent.applicationId)
    const failed = await window.commitOn(demo, intent)
    const afterFailure = await demo.readApplication(intent.applicationId)
    return { intent, before, failed, afterFailure, inspection: await window.inspectOn(demo, intent) }
  })
  expect(aborted.failed).toMatchObject({ error: { kind: 'storage' } })
  expect(aborted.afterFailure).toEqual(aborted.before)
  expect(aborted.inspection).toMatchObject({ value: { status: 'notCommitted' } })
  await page.evaluate(loseNextWriteCompletion)
  const result = await page.evaluate(async intent => {
    const demo = window.demo
    const retry = await window.commitOn(demo, intent)
    const inspection = await window.inspectOn(demo, intent)
    const { simulated: _simulated, ...normal } = intent
    void _simulated
    return { retry, inspection, replay: await window.commitOn(demo, intent), normal: await window.commitOn(demo, normal), after: await demo.readApplication(intent.applicationId) }
  }, aborted.intent)
  expect(result.retry).toMatchObject({ error: { kind: 'outcomeUnknown' } })
  expect(result.inspection).toMatchObject({ value: { status: 'committed', result: { application: { sharedRevision: 2 } } } })
  // Repeating either transfer form is a new operation refused by the assignment it already changed.
  expect(result.replay).toMatchObject({ error: { kind: 'invalidState' } })
  expect(result.normal).toMatchObject({ error: { kind: 'invalidState' } })
  if (!result.inspection.ok || result.inspection.value.status !== 'committed') throw new Error('No outcome')
  expect(result.after).toEqual({ ok: true, value: result.inspection.value.result.application })
  const application = result.inspection.value.result.application
  if (application.role !== 'reviewer') throw new Error('No review')
  expect(application.activity).toHaveLength(aborted.before.ok && aborted.before.value.role === 'reviewer' ? aborted.before.value.activity.length + 1 : 0)
  expect(application.sharedRevision).toBe(2)
})
