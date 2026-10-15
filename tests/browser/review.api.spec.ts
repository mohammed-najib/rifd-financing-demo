import { expect, test, type Page } from '@playwright/test'
import { loseNextWriteCompletion } from './storage-faults'

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

test('assessments and all five checks persist independently of public status and history', async ({ page }) => {
  const datasetId = await staff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const applicationId = 'RIFD-2026-007'
    const before = await demo.readApplication(applicationId)
    if (!before.ok) throw new Error('Missing record')
    let revision = before.value.sharedRevision
    const outcomes = []
    for (const slot of ['identity', 'business', 'financial', 'purchase'] as const) {
      const view = await demo.readApplication(applicationId)
      if (!view.ok) throw new Error('Missing record')
      const outcome = await demo.execute({ kind: 'assessDocument', datasetId, operationId: slot, applicationId, expectedSharedRevision: revision, slot, fileId: view.value.snapshot.documents[slot]!, status: 'accepted', reason: null })
      outcomes.push(outcome)
      if (outcome.ok) revision = outcome.value.application.sharedRevision
    }
    for (const check of ['evidence', 'operatingHistory', 'purpose', 'budget', 'capacity'] as const) {
      const outcome = await demo.execute({ kind: 'recordCheck', datasetId, operationId: check, applicationId, expectedSharedRevision: revision, check, outcome: 'passed' })
      outcomes.push(outcome)
      if (outcome.ok) revision = outcome.value.application.sharedRevision
    }
    return { before, outcomes, after: await demo.readApplication(applicationId) }
  }, datasetId)
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
  const datasetId = await staff(page)
  for (const number of ['002', '003', '011', '007', '008', '004', '013', '005', '006']) {
    const result = await page.evaluate(async ({ datasetId, number, kind }) => {
      const demo = window.demo
      const applicationId = `RIFD-2026-${number}`
      const before = await demo.readApplication(applicationId)
      if (!before.ok) throw new Error('No record')
      const base = { datasetId, applicationId, operationId: `${kind}-${number}`, expectedSharedRevision: before.value.sharedRevision }
      const command: import('../../src/demo').ReviewOperation = kind === 'assessDocument'
        ? { ...base, kind, slot: 'identity', fileId: before.value.snapshot.documents.identity!, status: 'accepted', reason: null }
        : kind === 'recordCheck' ? { ...base, kind, check: 'purpose', outcome: 'failed' }
        : { ...base, kind, text: { ar: 'سياق خاص', en: 'Private context' } }
      const outcome = await demo.execute(command)
      return { before, outcome, after: await demo.readApplication(applicationId), inspection: await demo.inspectOperation(command) }
    }, { datasetId, number, kind })
    const allowed = (kind === 'saveNote' ? ['007', '004', '005', '006'] : ['007']).includes(number)
    expect(result.outcome.ok, `${kind} ${number}`).toBe(allowed)
    if (!allowed) {
      expect(result.after).toEqual(result.before)
      expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
    } else {
      expect(result.inspection).toMatchObject({ ok: true, value: { status: 'committed' } })
      if (!result.before.ok || !result.after.ok) throw new Error('No record')
      expect(result.after.value.history).toEqual(result.before.value.history)
      expect(result.after.value.snapshot).toEqual(result.before.value.snapshot)
      expect(result.after.value.sharedRevision).toBe(result.before.value.sharedRevision + 1)
    }
  }
})

for (const kind of ['assessDocument', 'recordCheck', 'saveNote'] as const) test(`${kind} rolls back all effects, fingerprints payload and inspects unknown completion`, async ({ page }) => {
  const datasetId = await staff(page)
  const command = await page.evaluate(async ({ datasetId, kind }) => {
    const result = await window.demo.readApplication('RIFD-2026-007')
    if (!result.ok) throw new Error('No record')
    const base = { datasetId, applicationId: result.value.id, operationId: 'atomic-review', expectedSharedRevision: result.value.sharedRevision }
    return (kind === 'saveNote' ? { ...base, kind, text: { ar: 'ملاحظة', en: 'Note' } } : kind === 'recordCheck'
      ? { ...base, kind, check: 'purpose', outcome: 'passed' } : { ...base, kind, slot: 'financial', fileId: result.value.snapshot.documents.financial!, status: 'needsReplacement', reason: { ar: 'غير مقروء', en: 'Unreadable' } }) as import('../../src/demo').ReviewOperation
  }, { datasetId, kind })
  const aborted = await page.evaluate(async command => {
    const demo = window.demo
    const before = await demo.readApplication(command.applicationId)
    demo.setControls({ slow: false, failure: 'storage' })
    const stale = await demo.execute({ ...command, expectedSharedRevision: 99 })
    const armed = demo.controls()
    const outcome = await demo.execute(command)
    return { before, stale, armed, outcome, after: await demo.readApplication(command.applicationId), inspection: await demo.inspectOperation(command) }
  }, command)
  expect(aborted.stale).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(aborted.armed.failure).toBe('storage')
  expect(aborted.outcome).toMatchObject({ error: { kind: 'storage' } })
  expect(aborted.after).toEqual(aborted.before)
  expect(aborted.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  await page.evaluate(loseNextWriteCompletion)
  expect(await page.evaluate(command => window.demo.execute(command), command)).toMatchObject({ error: { kind: 'outcomeUnknown' } })
  const recovered = await page.evaluate(async command => {
    const demo = window.demo
    const inspection = await demo.inspectOperation(command)
    const replay = await demo.execute({ ...command, expectedSharedRevision: 99 })
    const changed = await demo.execute({ ...command, ...(command.kind === 'saveNote' ? { text: { ar: 'مختلف', en: 'Changed' } } : command.kind === 'recordCheck' ? { outcome: 'failed' } : { reason: { ar: 'مختلف', en: 'Changed' } }) } as import('../../src/demo').ReviewOperation)
    return { inspection, replay, changed }
  }, command)
  expect(recovered.inspection).toMatchObject({ ok: true, value: { status: 'committed' } })
  if (!recovered.inspection.ok || recovered.inspection.value.status !== 'committed') throw new Error('No receipt')
  expect(recovered.replay).toEqual({ ok: true, value: recovered.inspection.value.result })
  expect(recovered.changed).toMatchObject({ error: { kind: 'identifierMisuse' } })
  const after = recovered.inspection.value.result.application as import('../../src/demo/types').StaffView
  const before = aborted.before.ok ? aborted.before.value as import('../../src/demo/types').StaffView : null
  expect(after.activity).toHaveLength(before!.activity.length + 1)
  expect(after.sharedRevision).toBe(before!.sharedRevision + 1)
})

test('requires current evidence, a replacement reason and all accepted documents before consistency can pass', async ({ page }) => {
  const datasetId = await staff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const applicationId = 'RIFD-2026-003'
    await demo.execute({ kind: 'startReview', datasetId, applicationId, operationId: 'start', expectedSharedRevision: 1 })
    const before = await demo.readApplication(applicationId)
    if (!before.ok) throw new Error('No record')
    const base = { datasetId, applicationId, expectedSharedRevision: before.value.sharedRevision }
    const commands: import('../../src/demo').ReviewOperation[] = [
      { ...base, kind: 'recordCheck', operationId: 'evidence', check: 'evidence', outcome: 'passed' },
      { ...base, kind: 'assessDocument', operationId: 'missing', slot: 'financial', fileId: 'invented', status: 'accepted', reason: null },
      { ...base, kind: 'assessDocument', operationId: 'wrong-file', slot: 'identity', fileId: before.value.snapshot.documents.business!, status: 'accepted', reason: null },
      { ...base, kind: 'assessDocument', operationId: 'no-reason', slot: 'identity', fileId: before.value.snapshot.documents.identity!, status: 'needsReplacement', reason: null },
      { ...base, kind: 'saveNote', operationId: 'empty-note', text: { ar: ' ', en: ' ' } },
    ]
    const outcomes = []
    for (const command of commands) outcomes.push(await demo.execute(command))
    return { before, outcomes, after: await demo.readApplication(applicationId) }
  }, datasetId)
  for (const outcome of result.outcomes) expect(outcome).toMatchObject({ ok: false, error: { kind: 'validation' } })
  expect(result.after).toEqual(result.before)
})

test('notes stay out of applicant reads, print and notifications and survive refresh in final states', async ({ page }) => {
  const datasetId = await staff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    await demo.signIn('mariam')
    const before = { application: await demo.readApplication('RIFD-2026-005'), print: await demo.readPrintSummary('RIFD-2026-005'), notifications: await demo.readNotifications() }
    await demo.signIn('salma')
    const view = await demo.readApplication('RIFD-2026-005')
    if (!view.ok) throw new Error('No final record')
    const saved = await demo.execute({ kind: 'saveNote', datasetId, applicationId: view.value.id, operationId: 'final-note', expectedSharedRevision: view.value.sharedRevision, text: { ar: 'خاص فقط', en: 'Staff-only secret' } })
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
    const outcome = await demo.execute(command)
    IDBObjectStore.prototype.put = put
    await demo.signIn('salma')
    return { before: view, outcome, after: await demo.readApplication(view.value.id), inspection: await demo.inspectOperation(command) }
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
    const documents = {} as import('../../src/demo').DraftDocuments
    for (const slot of ['identity', 'business', 'financial', 'purchase'] as const) {
      const file = await demo.prepareAttachment({ datasetId, applicationId: draft.value.id, slot, selectionId: slot, source: { kind: 'generated', fields } })
      if (!file.ok) throw new Error('No evidence')
      documents[slot] = { kind: 'prepared', attachment: file.value }
    }
    const submitted = await demo.execute({ kind: 'submit', datasetId, operationId: 'submit-ineligible', applicationId: draft.value.id, expectedSharedRevision: 1, expectedWorkspaceRevision: 0, fields, product: 'inventory', documents })
    if (!submitted.ok) throw new Error('Structurally valid form refused')
    await demo.signIn('salma')
    await demo.execute({ kind: 'claimApplication', datasetId, operationId: 'claim', applicationId: draft.value.id, expectedSharedRevision: 2 })
    await demo.execute({ kind: 'startReview', datasetId, operationId: 'start', applicationId: draft.value.id, expectedSharedRevision: 3 })
    const before = await demo.readApplication(draft.value.id)
    const outcomes = []
    for (const check of ['operatingHistory', 'budget', 'capacity'] as const) outcomes.push(await demo.execute({ kind: 'recordCheck', datasetId, operationId: check, applicationId: draft.value.id, expectedSharedRevision: 4, check, outcome: 'passed' }))
    const after = await demo.readApplication(draft.value.id)
    const failed = await demo.execute({ kind: 'recordCheck', datasetId, operationId: 'record-failure', applicationId: draft.value.id, expectedSharedRevision: 4, check: 'capacity', outcome: 'failed' })
    return { before, outcomes, after, failed }
  }, datasetId)
  for (const outcome of result.outcomes) expect(outcome).toMatchObject({ ok: false, error: { kind: 'validation' } })
  expect(result.after).toEqual(result.before)
  expect(result.failed).toMatchObject({ ok: true, value: { application: { checks: { capacity: 'failed' } } } })
})

test('unsigned and applicant writes are refused, and reassignment invalidates an earlier review intent', async ({ page, context }) => {
  const datasetId = await staff(page)
  const command = await page.evaluate(async datasetId => {
    const result = await window.demo.readApplication('RIFD-2026-007')
    if (!result.ok) throw new Error('No record')
    return { kind: 'saveNote' as const, datasetId, applicationId: result.value.id, expectedSharedRevision: result.value.sharedRevision, operationId: 'held-note', text: { ar: 'خاص', en: 'Private' } }
  }, datasetId)
  const denied = await page.evaluate(async command => {
    const demo = window.demo
    const before = await demo.readApplication(command.applicationId)
    const wrongDataset = await demo.execute({ ...command, datasetId: crypto.randomUUID() })
    await demo.signOut()
    const unsigned = await demo.execute(command)
    await demo.signIn('mariam')
    const owner = await demo.execute(command)
    await demo.signIn('huda')
    const stranger = await demo.execute(command)
    await demo.signIn('salma')
    return { before, wrongDataset, unsigned, owner, stranger, after: await demo.readApplication(command.applicationId) }
  }, command)
  expect(denied.wrongDataset).toMatchObject({ error: { kind: 'supersededDataset' } })
  expect(denied.unsigned).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(denied.owner).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(denied.stranger).toMatchObject({ error: { kind: 'unavailable' } })
  expect(denied.after).toEqual(denied.before)
  const second = await context.newPage()
  await staff(second)
  expect(await second.evaluate(command => window.demo.execute({ kind: 'transferApplication', datasetId: command.datasetId, applicationId: command.applicationId, expectedSharedRevision: command.expectedSharedRevision, operationId: 'transfer', from: 'salma', to: 'khaled', confirmed: true }), command)).toMatchObject({ ok: true })
  expect(await page.evaluate(command => window.demo.execute(command), command)).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(await page.evaluate(command => window.demo.execute({ ...command, operationId: 'new-note', expectedSharedRevision: command.expectedSharedRevision + 1 }), command)).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(await page.evaluate(command => window.demo.inspectOperation(command), command)).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
})
