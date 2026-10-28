import { expect, test, type Page } from '@playwright/test'
import { loseNextWriteCompletion, refuseCommitNotices } from '../support/storage-faults'

test.describe.configure({ mode: 'parallel' })
async function staff(page: Page) {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  return page.evaluate(async () => {
    await window.demo.startup()
    const result = await window.demo.signIn('salma')
    if (!result.ok) throw new Error('No session')
    return result.value.datasetId
  })
}

test('opening a source does not confirm inspection and direct assessment bypasses have no effects', async ({ page }) => {
  const datasetId = await staff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-007')
    if (!before.ok || before.value.role !== 'reviewer') throw new Error('No record')
    const fileId = before.value.snapshot.documents.identity!
    const source = await demo.readFile(before.value.id, fileId)
    const outcome = await window.commitOn(demo, { kind: 'assessDocument', datasetId, operationId: 'bypass', applicationId: before.value.id, expectedSharedRevision: before.value.sharedRevision, slot: 'identity', fileId, status: 'accepted', reason: null } as import('../../../src/demo').ReviewOperation)
    return { before, source: source.ok, outcome, after: await demo.readApplication(before.value.id) }
  }, datasetId)
  expect(result.source).toBe(true)
  expect(result.outcome).toMatchObject({ ok: false, error: { kind: 'validation' } })
  expect(result.after).toEqual(result.before)
})

test('confirmation survives unrelated notes only with a fresh revision and cannot cross source contexts', async ({ page }) => {
  const datasetId = await staff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-007')
    const other = await demo.readApplication('RIFD-2026-003')
    if (!before.ok || before.value.role !== 'reviewer' || !other.ok || other.value.role !== 'reviewer') throw new Error('No review')
    const command = { kind: 'assessDocument' as const, datasetId, applicationId: before.value.id, operationId: 'inspected', expectedSharedRevision: before.value.sharedRevision, slot: 'identity' as const, fileId: before.value.snapshot.documents.identity!, status: 'accepted' as const, reason: null, inspection: { kind: 'inspected' as const, confirmed: true as const, contextToken: before.value.inspectionContexts.identity! } }
    const note = await window.commitOn(demo, { kind: 'saveNote', applicationId: before.value.id, text: { ar: 'سياق داخلي', en: 'Unrelated staff context' } })
    // The note moved the record, so the intent prepared before it is stale.
    const stale = await window.commitOn(demo, command, before.value)
    const current = await demo.readApplication(before.value.id)
    if (!current.ok || current.value.role !== 'reviewer') throw new Error('No current review')
    const base = { ...command }
    const refusals = []
    for (const inspection of [
      { kind: 'inspected', confirmed: false, contextToken: command.inspection.contextToken },
      { kind: 'inspected', confirmed: true, contextToken: current.value.inspectionContexts.business },
      { kind: 'inspected', confirmed: true, contextToken: other.value.inspectionContexts.identity },
      { kind: 'inspected', confirmed: true, contextToken: 'invented' },
    ]) refusals.push(await window.commitOn(demo, { ...base, inspection } as import('../../../src/demo').ReviewIntent))
    const unchanged = await demo.readApplication(before.value.id)
    const assessed = await window.commitOn(demo, base)
    // A retry with the view the assessment was prepared from is stale rather than a second assessment.
    const retried = await window.commitOn(demo, base, current.value)
    const afterRetry = await demo.readApplication(before.value.id)
    const changedIntent = await window.commitOn(demo, { ...base, inspection: { kind: 'unableToOpen', contextToken: command.inspection.contextToken } })
    const { inspection: omitted, ...legacy } = base
    void omitted
    const stripped = await window.commitOn(demo, legacy as unknown as import('../../../src/demo').ReviewIntent)
    return { note, stale, current, refusals, unchanged, assessed, retried, afterRetry, changedIntent, stripped, before }
  }, datasetId)
  expect(result.note.ok).toBe(true)
  expect(result.stale).toMatchObject({ error: { kind: 'staleRecord' } })
  for (const refusal of result.refusals) expect(refusal).toMatchObject({ error: { kind: 'validation' } })
  expect(result.unchanged).toEqual(result.current)
  if (!result.current.ok || result.current.value.role !== 'reviewer' || !result.before.ok || result.before.value.role !== 'reviewer') throw new Error('No review')
  expect(result.current.value.inspectionContexts).toEqual(result.before.value.inspectionContexts)
  expect(result.assessed).toMatchObject({ ok: true, value: { application: { assessments: { identity: { status: 'accepted' } } } } })
  expect(result.retried).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(result.afterRetry).toEqual(result.assessed.ok ? { ok: true, value: result.assessed.value.application } : null)
  expect(result.changedIntent).toMatchObject({ error: { kind: 'validation' } })
  expect(result.stripped).toMatchObject({ error: { kind: 'validation' } })
})

test('reassignment away and back requires renewed confirmation even after reading the latest revision', async ({ page }) => {
  const datasetId = await staff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-007')
    if (!before.ok || before.value.role !== 'reviewer') throw new Error('No review')
    const committedCommand = { kind: 'assessDocument' as const, datasetId, applicationId: before.value.id, operationId: 'assessment-before-transfer', expectedSharedRevision: before.value.sharedRevision, slot: 'identity' as const, fileId: before.value.snapshot.documents.identity!, status: 'accepted' as const, reason: null, inspection: { kind: 'inspected' as const, confirmed: true as const, contextToken: before.value.inspectionContexts.identity! } }
    const committed = await window.commitOn(demo, committedCommand)
    if (!committed.ok) throw new Error('No initial assessment')
    let revision = committed.value.application.sharedRevision
    for (const [from, to] of [['salma', 'khaled'], ['khaled', 'salma']] as const) {
      const transfer = await window.commitOn(demo, { kind: 'transferApplication', datasetId, applicationId: before.value.id, from, to, confirmed: true })
      if (!transfer.ok) throw new Error('No transfer')
      revision = transfer.value.application.sharedRevision
    }
    const current = await demo.readApplication(before.value.id)
    if (!current.ok || current.value.role !== 'reviewer') throw new Error('No current review')
    const command = { kind: 'assessDocument' as const, datasetId, applicationId: before.value.id, operationId: 'renewed-inspection', expectedSharedRevision: revision, slot: 'identity' as const, fileId: current.value.snapshot.documents.identity!, status: 'accepted' as const, reason: null, inspection: { kind: 'inspected' as const, confirmed: true as const, contextToken: before.value.inspectionContexts.identity! } }
    const refused = await window.commitOn(demo, command)
    // The assessment prepared before the transfers cannot be retried from its old view.
    const replay = await window.commitOn(demo, committedCommand, before.value)
    const unchanged = await demo.readApplication(before.value.id)
    const renewed = await window.commitOn(demo, { ...command, inspection: { ...command.inspection, contextToken: current.value.inspectionContexts.identity! } })
    return { before, current, refused, unchanged, renewed, committed, replay }
  }, datasetId)
  expect(result.refused).toMatchObject({ error: { kind: 'validation' } })
  expect(result.unchanged).toEqual(result.current)
  expect(result.replay).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(result.renewed).toMatchObject({ ok: true, value: { application: { assessments: { identity: { status: 'accepted' } } } } })
})

test('an explained unable-to-open source permits only replacement and replays without a second assessment', async ({ page }) => {
  const datasetId = await staff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-007')
    if (!before.ok || before.value.role !== 'reviewer') throw new Error('No review')
    const command = { kind: 'assessDocument' as const, datasetId, applicationId: before.value.id, operationId: 'unopenable', expectedSharedRevision: before.value.sharedRevision, slot: 'financial' as const, fileId: before.value.snapshot.documents.financial!, status: 'needsReplacement' as const, reason: { ar: 'تعذر فتح ملف الملخص.', en: 'The summary file could not be opened.' }, inspection: { kind: 'unableToOpen' as const, contextToken: before.value.inspectionContexts.financial! } }
    const refusals = []
    for (const edit of [{ status: 'accepted', reason: null }, { reason: null }, { reason: { ar: ' ', en: ' ' } }, { reason: { ar: 'تعذر فتح الملف', en: '' } }, { inspection: { kind: 'unableToOpen', contextToken: 'old-context' } }]) refusals.push(await window.commitOn(demo, { ...command, ...edit } as import('../../../src/demo').ReviewOperation))
    const unchanged = await demo.readApplication(before.value.id)
    const saved = await window.commitOn(demo, command)
    // A retry from the prepared view is stale, so no second assessment is recorded.
    const replay = await window.commitOn(demo, command, before.value)
    const inspected = await window.inspectOn(demo, command)
    return { before, refusals, unchanged, saved, replay, inspected, after: await demo.readApplication(before.value.id) }
  }, datasetId)
  for (const refusal of result.refusals) expect(refusal).toMatchObject({ error: { kind: 'validation' } })
  expect(result.unchanged).toEqual(result.before)
  expect(result.saved).toMatchObject({ ok: true, value: { application: { assessments: { financial: { status: 'needsReplacement', reason: { en: 'The summary file could not be opened.' } } }, checks: { evidence: 'unchecked' } } } })
  expect(result.replay).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(result.inspected).toMatchObject({ ok: true, value: { status: 'notCommitted', application: result.saved.ok ? result.saved.value.application : null } })
  if (!result.before.ok || result.before.value.role !== 'reviewer' || !result.after.ok || result.after.value.role !== 'reviewer') throw new Error('No review')
  expect(result.after).toEqual(result.saved.ok ? { ok: true, value: result.saved.value.application } : null)
  expect(result.after.value.activity).toHaveLength(result.before.value.activity.length + 1)
})

test('historical assessments stay readable and an unconfirmed legacy intent cannot write', async ({ page }) => {
  await staff(page)
  const prepared = await page.evaluate(async () => {
    const before = await window.demo.readApplication('RIFD-2026-007')
    if (!before.ok || before.value.role !== 'reviewer') throw new Error('No review')
    const intent = { kind: 'assessDocument' as const, applicationId: before.value.id, slot: 'identity' as const, fileId: before.value.snapshot.documents.identity!, status: 'accepted' as const, reason: null, inspection: { kind: 'inspected' as const, confirmed: true as const, contextToken: before.value.inspectionContexts.identity! } }
    const saved = await window.commitOn(window.demo, intent)
    if (!saved.ok) throw new Error('No assessment')
    return { intent, view: before.value }
  })
  await page.reload(); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async ({ intent, view }) => {
    const demo = window.demo
    const startup = await demo.startup()
    const before = await demo.readApplication(intent.applicationId)
    const { inspection, ...legacy } = intent
    void inspection
    // An intent without a current inspection context cannot write.
    const unconfirmed = await window.commitOn(demo, legacy as unknown as import('../../../src/demo').ReviewIntent)
    // The assessment prepared before it committed cannot be replayed from its old view.
    const stale = await window.commitOn(demo, intent, view)
    const inspected = await window.inspectOn(demo, intent)
    return { startup, before, unconfirmed, stale, inspected, after: await demo.readApplication(intent.applicationId) }
  }, prepared)
  expect(result.startup.ok).toBe(true)
  expect(result.before).toMatchObject({ ok: true, value: { assessments: { identity: { status: 'accepted' } } } })
  expect(result.unconfirmed).toMatchObject({ error: { kind: 'validation' } })
  expect(result.stale).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(result.inspected).toMatchObject({ ok: true, value: { status: 'notCommitted', application: result.before.ok ? result.before.value : null } })
  expect(result.after).toEqual(result.before)
})

test('reset invalidates inspection even when a new dataset has the same application and document slot', async ({ page }) => {
  await staff(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-007')
    const resetContext = await demo.inspectReset()
    if (!before.ok || before.value.role !== 'reviewer' || !resetContext.ok) throw new Error('No review')
    const reset = await window.commitOn(demo, { kind: 'resetDemo', context: resetContext.value, confirmed: true })
    if (!reset.ok) throw new Error('No reset')
    await demo.signIn('salma')
    const current = await demo.readApplication(before.value.id)
    if (!current.ok || current.value.role !== 'reviewer') throw new Error('No new review')
    const command = { kind: 'assessDocument' as const, applicationId: before.value.id, slot: 'identity' as const, fileId: current.value.snapshot.documents.identity!, status: 'accepted' as const, reason: null }
    // The old token is bound to the replaced dataset even though the slot looks identical.
    const oldDataset = await window.commitOn(demo, { ...command, inspection: { kind: 'inspected', confirmed: true as const, contextToken: before.value.inspectionContexts.identity! } })
    const unconfirmed = await window.commitOn(demo, { ...command, inspection: { kind: 'inspected', confirmed: false, contextToken: current.value.inspectionContexts.identity! } } as unknown as import('../../../src/demo').ReviewIntent)
    const unchanged = await demo.readApplication(before.value.id)
    const renewed = await window.commitOn(demo, { ...command, inspection: { kind: 'inspected', confirmed: true as const, contextToken: current.value.inspectionContexts.identity! } })
    return { current, oldDataset, unconfirmed, unchanged, renewed, after: await demo.readApplication(before.value.id) }
  })
  expect(result.oldDataset).toMatchObject({ error: { kind: 'validation' } })
  expect(result.unconfirmed).toMatchObject({ error: { kind: 'validation' } })
  expect(result.unchanged).toEqual(result.current)
  expect(result.renewed).toMatchObject({ ok: true, value: { application: { assessments: { identity: { status: 'accepted' } } } } })
  expect(result.after).toEqual(result.renewed.ok ? { ok: true, value: result.renewed.value.application } : null)
})

test('assessments and all five checks persist independently of public status and history', async ({ page }) => {
  await staff(page)
  await page.evaluate(refuseCommitNotices)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const applicationId = 'RIFD-2026-007'
    const before = await demo.readApplication(applicationId)
    if (!before.ok) throw new Error('Missing record')
    const outcomes = []
    for (const slot of ['identity', 'business', 'financial', 'purchase'] as const) {
      const view = await demo.readApplication(applicationId)
      if (!view.ok || view.value.role !== 'reviewer') throw new Error('Missing record')
      const outcome = await window.commitOn(demo, { kind: 'assessDocument', applicationId, slot, fileId: view.value.snapshot.documents[slot]!, inspection: { kind: 'inspected', confirmed: true, contextToken: view.value.inspectionContexts[slot]! }, status: 'accepted', reason: null })
      outcomes.push(outcome)
    }
    for (const check of ['evidence', 'operatingHistory', 'purpose', 'budget', 'capacity'] as const) {
      const outcome = await window.commitOn(demo, { kind: 'recordCheck', applicationId, check, outcome: 'passed' })
      outcomes.push(outcome)
    }
    return { before, outcomes, after: await demo.readApplication(applicationId) }
  })
  expect(result.outcomes.every(result => result.ok)).toBe(true)
  expect(result.after).toMatchObject({ ok: true, value: { status: 'underReview', checks: { evidence: 'passed', operatingHistory: 'passed', purpose: 'passed', budget: 'passed', capacity: 'passed' } } })
  if (!result.before.ok || !result.after.ok) throw new Error('Missing record')
  expect(result.after.value.history).toEqual(result.before.value.history)
  expect(result.after.value.snapshot).toEqual(result.before.value.snapshot)
  await page.reload()
  await page.waitForFunction(() => window.demo)
  expect(await page.evaluate(async () => { await window.demo.startup(); return window.demo.readApplication('RIFD-2026-007') })).toEqual(result.after)
})

for (const kind of ['assessDocument', 'recordCheck', 'saveNote'] as const) test(`${kind} enforces every state and assignment without refused effects`, async ({ page }) => {
  await staff(page)
  const assignees: Record<string, string | null> = { '002': null, '003': 'salma', '011': 'khaled', '007': 'salma', '008': 'khaled', '004': 'salma', '013': 'khaled', '005': 'salma', '006': 'salma' }
  for (const number of ['002', '003', '011', '007', '008', '004', '013', '005', '006']) {
    const result = await page.evaluate(async ({ number, kind }) => {
      const demo = window.demo
      const applicationId = `RIFD-2026-${number}`
      const before = await demo.readApplication(applicationId)
      if (!before.ok || before.value.role !== 'reviewer') throw new Error('No record')
      const base = { applicationId }
      const command: import('../../../src/demo').ReviewIntent = kind === 'assessDocument'
        ? { ...base, kind, slot: 'identity', fileId: before.value.snapshot.documents.identity!, inspection: { kind: 'inspected', confirmed: true, contextToken: before.value.inspectionContexts.identity! }, status: 'accepted', reason: null }
        : kind === 'recordCheck' ? { ...base, kind, check: 'purpose', outcome: 'failed' }
        : { ...base, kind, text: { ar: 'سياق خاص', en: 'Private context' } }
      const outcome = await window.commitOn(demo, command)
      return { before, outcome, after: await demo.readApplication(applicationId), inspection: await window.inspectOn(demo, command) }
    }, { number, kind })
    const allowed = (kind === 'saveNote' ? ['007', '004', '005', '006'] : ['007']).includes(number)
    expect(result.outcome.ok, `${kind} ${number}`).toBe(allowed)
    if (!allowed) {
      // Review edits first require the record to be assigned to the acting reviewer.
      const refusal = assignees[number] !== 'salma' ? 'permissionDenied' : 'invalidState'
      expect(result.outcome).toMatchObject({ error: { kind: refusal } })
      expect(result.after).toEqual(result.before)
      expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
    } else {
      expect(result.after).toEqual(result.outcome.ok ? { ok: true, value: result.outcome.value.application } : null)
      if (!result.before.ok || !result.after.ok) throw new Error('No record')
      // Nothing is pending after a committed edit, so inspection reports the record.
      expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted', application: result.after.value } })
      expect(result.after.value.history).toEqual(result.before.value.history)
      expect(result.after.value.snapshot).toEqual(result.before.value.snapshot)
      expect(result.after.value.sharedRevision).toBe(result.before.value.sharedRevision + 1)
    }
  }
})

for (const kind of ['assessDocument', 'recordCheck', 'saveNote'] as const) test(`${kind} rolls back all effects, refuses a stale retry and inspects unknown completion`, async ({ page }) => {
  await staff(page)
  const command = await page.evaluate(async kind => {
    const result = await window.demo.readApplication('RIFD-2026-007')
    if (!result.ok || result.value.role !== 'reviewer') throw new Error('No record')
    const base = { applicationId: result.value.id }
    return (kind === 'saveNote' ? { ...base, kind, text: { ar: 'ملاحظة', en: 'Note' } } : kind === 'recordCheck'
      ? { ...base, kind, check: 'purpose', outcome: 'passed' } : { ...base, kind, slot: 'financial', fileId: result.value.snapshot.documents.financial!, inspection: { kind: 'inspected', confirmed: true, contextToken: result.value.inspectionContexts.financial! }, status: 'needsReplacement', reason: { ar: 'غير مقروء', en: 'Unreadable' } }) as import('../../../src/demo').ReviewIntent
  }, kind)
  const aborted = await page.evaluate(async command => {
    const demo = window.demo
    const before = await demo.readApplication(command.applicationId)
    demo.setControls({ slow: false, failure: 'storage' })
    const armed = demo.controls()
    const outcome = await window.commitOn(demo, command)
    return { before, armed, outcome, after: await demo.readApplication(command.applicationId), inspection: await window.inspectOn(demo, command) }
  }, command)
  expect(aborted.armed.failure).toBe('storage')
  expect(aborted.outcome).toMatchObject({ error: { kind: 'storage' } })
  expect(aborted.after).toEqual(aborted.before)
  expect(aborted.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  await page.evaluate(loseNextWriteCompletion)
  expect(await page.evaluate(command => window.commit(command), command)).toMatchObject({ error: { kind: 'outcomeUnknown' } })
  const recovered = await page.evaluate(async ({ command, view }) => {
    const demo = window.demo
    // Inspecting the uncertain attempt resolves it into the one committed outcome.
    const inspection = await window.inspectOn(demo, command)
    // Retrying the intent prepared before the write is stale and cannot repeat the effect.
    const replay = await window.commitOn(demo, command, view)
    return { inspection, replay, after: await demo.readApplication(command.applicationId) }
  }, { command, view: aborted.before.ok ? aborted.before.value : undefined })
  expect(recovered.inspection).toMatchObject({ ok: true, value: { status: 'committed' } })
  expect(recovered.replay).toMatchObject({ error: { kind: 'staleRecord' } })
  if (!recovered.inspection.ok || recovered.inspection.value.status !== 'committed') throw new Error('No receipt')
  expect(recovered.after).toEqual({ ok: true, value: recovered.inspection.value.result.application })
  const after = recovered.inspection.value.result.application as import('../../../src/demo/types').StaffView
  const before = aborted.before.ok ? aborted.before.value as import('../../../src/demo/types').StaffView : null
  expect(after.activity).toHaveLength(before!.activity.length + 1)
  expect(after.sharedRevision).toBe(before!.sharedRevision + 1)
})

test('requires current evidence, a replacement reason and all accepted documents before consistency can pass', async ({ page }) => {
  const datasetId = await staff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const applicationId = 'RIFD-2026-003'
    await window.commitOn(demo, { kind: 'startReview', datasetId, applicationId })
    const before = await demo.readApplication(applicationId)
    if (!before.ok || before.value.role !== 'reviewer') throw new Error('No record')
    const base = { datasetId, applicationId, expectedSharedRevision: before.value.sharedRevision }
    const commands: import('../../../src/demo').ReviewOperation[] = [
      { ...base, kind: 'recordCheck', operationId: 'evidence', check: 'evidence', outcome: 'passed' },
      { ...base, kind: 'assessDocument', operationId: 'missing', slot: 'financial', fileId: 'invented', inspection: { kind: 'inspected', confirmed: true, contextToken: 'missing' }, status: 'accepted', reason: null },
      { ...base, kind: 'assessDocument', operationId: 'wrong-file', slot: 'identity', fileId: before.value.snapshot.documents.business!, inspection: { kind: 'inspected', confirmed: true, contextToken: before.value.inspectionContexts.identity! }, status: 'accepted', reason: null },
      { ...base, kind: 'assessDocument', operationId: 'no-reason', slot: 'identity', fileId: before.value.snapshot.documents.identity!, inspection: { kind: 'inspected', confirmed: true, contextToken: before.value.inspectionContexts.identity! }, status: 'needsReplacement', reason: null },
      { ...base, kind: 'saveNote', operationId: 'empty-note', text: { ar: ' ', en: ' ' } },
    ]
    const outcomes = []
    for (const command of commands) outcomes.push(await window.commitOn(demo, command))
    return { before, outcomes, after: await demo.readApplication(applicationId) }
  }, datasetId)
  for (const outcome of result.outcomes) expect(outcome).toMatchObject({ ok: false, error: { kind: 'validation' } })
  expect(result.after).toEqual(result.before)
})

test('notes stay out of applicant reads, print and notifications and survive refresh in final states', async ({ page }) => {
  const datasetId = await staff(page)
  await page.evaluate(refuseCommitNotices)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    await demo.signIn('mariam')
    const before = { application: await demo.readApplication('RIFD-2026-005'), print: await demo.readPrintSummary('RIFD-2026-005'), notifications: await demo.readNotifications() }
    await demo.signIn('salma')
    const view = await demo.readApplication('RIFD-2026-005')
    if (!view.ok) throw new Error('No final record')
    const saved = await window.commitOn(demo, { kind: 'saveNote', datasetId, applicationId: view.value.id, text: { ar: 'خاص فقط', en: 'Staff-only secret' } })
    const staffPrint = await demo.readPrintSummary(view.value.id)
    await demo.signIn('mariam')
    return { before, saved, staffPrint, after: { application: await demo.readApplication(view.value.id), print: await demo.readPrintSummary(view.value.id), notifications: await demo.readNotifications() } }
  }, datasetId)
  expect(result.saved).toMatchObject({ ok: true, value: { application: { status: 'approved' } } })
  expect(result.staffPrint).toEqual(result.before.print)
  expect(result.after.print).toEqual(result.before.print)
  expect(result.after.notifications).toEqual(result.before.notifications)
  if (!result.before.application.ok || !result.after.application.ok) throw new Error('No public record')
  expect({ ...result.after.application.value, sharedRevision: result.before.application.value.sharedRevision }).toEqual(result.before.application.value)
  expect(JSON.stringify(result.after)).not.toContain('Staff-only secret')
  expect(result.after.application.value).not.toHaveProperty('notes')
  await page.reload(); await page.waitForFunction(() => window.demo)
  expect(await page.evaluate(async () => { await window.demo.startup(); await window.demo.signIn('salma'); return window.demo.readApplication('RIFD-2026-005') })).toMatchObject({ ok: true, value: { notes: expect.arrayContaining([{ id: expect.any(String), actor: 'salma', date: '2026-10-14', text: { ar: 'خاص فقط', en: 'Staff-only secret' } }]) } })
})

test('expiry at transaction completion refuses notes and recovery never retries', async ({ page }) => {
  const datasetId = await staff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const view = await demo.readApplication('RIFD-2026-007')
    if (!view.ok) throw new Error('No record')
    const command = { kind: 'saveNote' as const, datasetId, applicationId: view.value.id, operationId: 'expired-note', expectedSharedRevision: view.value.sharedRevision, text: { ar: 'خاص', en: 'Private' } }
    const put = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
      const request = put.apply(this, args)
      request.addEventListener('success', () => demo.expireSession(), { once: true })
      return request
    }
    const outcome = await window.commitOn(demo, command)
    IDBObjectStore.prototype.put = put
    await demo.signIn('salma')
    return { before: view, outcome, after: await demo.readApplication(view.value.id), inspection: await window.inspectOn(demo, command) }
  }, datasetId)
  expect(result.outcome).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(result.after).toEqual(result.before)
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
})

test('substantive failures cannot be overridden to Passed through the public command interface', async ({ page }) => {
  const datasetId = await staff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    await demo.signIn('mariam')
    const template = await demo.readApplication('RIFD-2026-001')
    const draft = await demo.newDraft('inventory')
    if (!template.ok || !draft.ok) throw new Error('No draft')
    const fields = { ...template.value.snapshot.fields, amount: '100010', term: '6', budget: '100009', operatingSince: '2026-05', revenue: '43764', expenses: '0', explanation: 'Purchase fictional retail inventory.' }
    const documents = {} as import('../../../src/demo').DraftDocuments
    for (const slot of ['identity', 'business', 'financial', 'purchase'] as const) {
      const file = await demo.prepareAttachment({ datasetId, applicationId: draft.value.id, slot, selectionId: slot, source: { kind: 'generated', fields } })
      if (!file.ok) throw new Error('No evidence')
      documents[slot] = { kind: 'prepared', attachment: file.value }
    }
    const submitted = await window.commitOn(demo, { kind: 'submit', datasetId, applicationId: draft.value.id, fields, product: 'inventory', documents })
    if (!submitted.ok) throw new Error('Structurally valid form refused')
    await demo.signIn('salma')
    await window.commitOn(demo, { kind: 'claimApplication', datasetId, applicationId: draft.value.id })
    await window.commitOn(demo, { kind: 'startReview', datasetId, applicationId: draft.value.id })
    const before = await demo.readApplication(draft.value.id)
    const outcomes = []
    for (const check of ['operatingHistory', 'budget', 'capacity'] as const) outcomes.push(await window.commitOn(demo, { kind: 'recordCheck', datasetId, applicationId: draft.value.id, check, outcome: 'passed' }))
    const after = await demo.readApplication(draft.value.id)
    const failed = await window.commitOn(demo, { kind: 'recordCheck', datasetId, applicationId: draft.value.id, check: 'capacity', outcome: 'failed' })
    return { before, outcomes, after, failed }
  }, datasetId)
  for (const outcome of result.outcomes) expect(outcome).toMatchObject({ ok: false, error: { kind: 'validation' } })
  expect(result.after).toEqual(result.before)
  expect(result.failed).toMatchObject({ ok: true, value: { application: { checks: { capacity: 'failed' } } } })
})

test('unsigned and applicant writes are refused, and reassignment invalidates an earlier review intent', async ({ page, context }) => {
  await staff(page)
  const command = await page.evaluate(async () => {
    const result = await window.demo.readApplication('RIFD-2026-007')
    if (!result.ok || result.value.role !== 'reviewer') throw new Error('No record')
    return { kind: 'saveNote' as const, applicationId: result.value.id, text: { ar: 'خاص', en: 'Private' } }
  })
  const denied = await page.evaluate(async command => {
    const demo = window.demo
    const before = await demo.readApplication(command.applicationId)
    if (!before.ok) throw new Error('No record')
    await demo.signOut()
    const unsigned = await window.commitOn(demo, command)
    const unsignedBorrowed = await window.commitOn(demo, command, before.value)
    await demo.signIn('mariam')
    // The owner's own view cannot prepare a staff edit; a borrowed reviewer view still fails the actor check.
    const owner = await window.commitOn(demo, command)
    const ownerBorrowed = await window.commitOn(demo, command, before.value)
    await demo.signIn('huda')
    const stranger = await window.commitOn(demo, command)
    await demo.signIn('salma')
    return { before, unsigned, unsignedBorrowed, owner, ownerBorrowed, stranger, after: await demo.readApplication(command.applicationId) }
  }, command)
  expect(denied.unsigned).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(denied.unsignedBorrowed).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(denied.owner).toMatchObject({ error: { kind: 'invalidState' } })
  expect(denied.ownerBorrowed).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(denied.stranger).toMatchObject({ error: { kind: 'unavailable' } })
  expect(denied.after).toEqual(denied.before)
  const second = await context.newPage()
  await staff(second)
  expect(await second.evaluate(command => window.commit({ kind: 'transferApplication', applicationId: command.applicationId, from: 'salma', to: 'khaled', confirmed: true }), command)).toMatchObject({ ok: true })
  // The note prepared before the transfer is stale; a current intent is refused by assignment.
  expect(await page.evaluate(({ command, view }) => window.commit(command, view), { command, view: denied.before.value })).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(await page.evaluate(command => window.commit(command), command)).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(await page.evaluate(command => window.inspect(command), command)).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
})
