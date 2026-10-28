import { expect, test, type Page } from '@playwright/test'
import { loseNextWriteCompletion, refuseCommitNotices } from '../support/storage-faults'

test.describe.configure({ mode: 'parallel' })

async function openStaff(page: Page) {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  return page.evaluate(async () => {
    await window.demo.startup()
    const context = await window.demo.signIn('salma')
    if (!context.ok) throw new Error('No staff session')
    return context.value
  })
}

test('claim and review start commit separately with durable receipts and distinct public activity', async ({ page }) => {
  const context = await openStaff(page)
  await page.evaluate(refuseCommitNotices)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-002')
    if (!before.ok) throw new Error('No submission')
    const claim = { kind: 'claimApplication' as const, datasetId, operationId: 'claim', applicationId: before.value.id, expectedSharedRevision: before.value.sharedRevision }
    const claimed = await demo.execute(claim)
    const replay = await demo.execute(claim)
    if (!claimed.ok) return { before, claimed, replay }
    const start = { ...claim, kind: 'startReview' as const, operationId: 'start', expectedSharedRevision: claimed.value.application.sharedRevision }
    const started = await demo.execute(start)
    const startReplay = await demo.execute(start)
    await demo.signIn('mariam')
    return { before, claimed, replay, started, startReplay, public: await demo.readApplication(claim.applicationId), notices: await demo.readNotifications(), claim, start }
  }, context.datasetId)
  expect(result.claimed).toMatchObject({ ok: true, value: { receipt: { kind: 'claimApplication', sharedRevision: 2 }, application: { status: 'submitted', assignedToYou: true } } })
  expect(result.replay).toEqual(result.claimed)
  if (!result.before.ok || !result.claimed.ok) throw new Error('Claim failed')
  expect(result.claimed.value.application.history).toEqual(result.before.value.history)
  expect(result.claimed.value.application.snapshot).toEqual(result.before.value.snapshot)
  expect(result.started).toMatchObject({ ok: true, value: { receipt: { kind: 'startReview', sharedRevision: 3 }, application: { status: 'underReview', assignedToYou: true } } })
  expect(result.startReplay).toEqual(result.started)
  expect(result.public).toMatchObject({ ok: true, value: { status: 'underReview', history: [{ kind: 'submitted' }, { kind: 'reviewStarted', date: '2026-10-14' }] } })
  expect(result.notices?.ok && result.notices.value).toHaveLength(1)
  if (!result.started?.ok || result.started.value.application.role !== 'reviewer') throw new Error('Review not started')
  expect(result.started.value.application.activity.map(event => event.kind)).toEqual(['submitted', 'assigned', 'reviewStarted'])
  expect(result.started.value.application.activity.at(-1)?.id).toBe(result.started.value.application.history.at(-1)?.id)
  await page.reload()
  await page.waitForFunction(() => window.demo)
  const restored = await page.evaluate(async command => {
    await window.demo.startup()
    await window.demo.signIn('salma')
    return { inspection: await window.demo.inspectOperation(command), replay: await window.demo.execute(command) }
  }, result.start!)
  expect(restored.inspection).toMatchObject({ ok: true, value: { status: 'committed', result: result.started.value } })
  expect(restored.replay).toEqual(result.started)
})

test('confirmed transfers retain correction work and stay absent from applicant history and notifications', async ({ page }) => {
  const context = await openStaff(page)
  await page.evaluate(refuseCommitNotices)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    await demo.signIn('huda')
    const applicant = await demo.readApplication('RIFD-2026-004')
    const notices = await demo.readNotifications()
    await demo.signIn('salma')
    const before = await demo.readApplication('RIFD-2026-004')
    if (!before.ok) throw new Error('No correction application')
    const command = { kind: 'transferApplication' as const, datasetId, operationId: 'transfer', applicationId: before.value.id, expectedSharedRevision: before.value.sharedRevision, from: 'salma' as const, to: 'khaled' as const, confirmed: true as const }
    const transferred = await demo.execute(command)
    const replay = await demo.execute(command)
    await demo.signIn('huda')
    return { before, transferred, replay, applicant, notices, afterApplicant: await demo.readApplication(command.applicationId), afterNotices: await demo.readNotifications() }
  }, context.datasetId)
  expect(result.transferred).toMatchObject({ ok: true, value: { application: { status: 'correctionsRequested', assignedToYou: false, assignment: { en: 'Khaled Ali' } } } })
  expect(result.replay).toEqual(result.transferred)
  if (!result.before.ok || !result.transferred.ok) throw new Error('Transfer failed')
  const before = result.before.value as import('../../../src/demo/types').StaffView
  const after = result.transferred.value.application as import('../../../src/demo/types').StaffView
  expect({ ...after, sharedRevision: before.sharedRevision, assignment: before.assignment, assignedToYou: before.assignedToYou, permissions: before.permissions, activity: before.activity, inspectionContexts: before.inspectionContexts }).toEqual(before)
  expect(after.inspectionContexts).not.toEqual(before.inspectionContexts)
  expect(after.activity.slice(0, -1)).toEqual(before.activity)
  expect(after.activity.at(-1)).toMatchObject({ kind: 'assigned', actor: 'salma', description: { en: 'Application transferred from Salma Nasser to Khaled Ali.' } })
  if (!result.applicant.ok || !result.afterApplicant.ok) throw new Error('Applicant cannot read')
  expect({ ...result.afterApplicant.value, sharedRevision: result.applicant.value.sharedRevision }).toEqual(result.applicant.value)
  expect(result.afterNotices).toEqual(result.notices)
})

test('unassignment survives failed change notices and replays without another activity entry', async ({ page }) => {
  const context = await openStaff(page)
  await page.evaluate(refuseCommitNotices)
  const result = await page.evaluate(async datasetId => {
    const command = { kind: 'unassignApplication' as const, datasetId, applicationId: 'RIFD-2026-003', expectedSharedRevision: 1, operationId: 'unassign-notice' }
    const committed = await window.demo.execute(command)
    return { committed, replay: await window.demo.execute(command), inspection: await window.demo.inspectOperation(command), after: await window.demo.readApplication(command.applicationId) }
  }, context.datasetId)
  expect(result.committed).toMatchObject({ ok: true, value: { application: { sharedRevision: 2, status: 'submitted', assignment: null } } })
  expect(result.replay).toEqual(result.committed)
  expect(result.inspection).toMatchObject({ value: { status: 'committed', result: result.committed.ok ? result.committed.value : null } })
  expect(result.after).toEqual(result.committed.ok ? { ok: true, value: result.committed.value.application } : null)
})

const records = [
  { number: '001', status: 'draft', assignee: null },
  { number: '002', status: 'submitted', assignee: null },
  { number: '003', status: 'submitted', assignee: 'salma' },
  { number: '011', status: 'submitted', assignee: 'khaled' },
  { number: '007', status: 'underReview', assignee: 'salma' },
  { number: '008', status: 'underReview', assignee: 'khaled' },
  { number: '004', status: 'correctionsRequested', assignee: 'salma' },
  { number: '013', status: 'correctionsRequested', assignee: 'khaled' },
  { number: '005', status: 'approved', assignee: 'salma' },
  { number: '006', status: 'rejected', assignee: 'salma' },
] as const

for (const kind of ['claimApplication', 'transferApplication', 'unassignApplication', 'startReview'] as const) {
  test(`${kind} respects every seeded state and assignment and leaves refused records untouched`, async ({ page }) => {
    const context = await openStaff(page)
    for (const record of records) {
      const allowedRecords: Record<typeof kind, readonly string[]> = {
        claimApplication: ['002'], transferApplication: ['003', '011', '007', '008', '004', '013'],
        unassignApplication: ['003', '011'], startReview: ['003'],
      }
      const allowed = allowedRecords[kind].includes(record.number)
      const result = await page.evaluate(async ({ datasetId, record, kind }) => {
        const applicationId = `RIFD-2026-${record.number}`
        const before = await window.demo.readApplication(applicationId)
        const command: import('../../../src/demo').ReviewOperation = {
          datasetId, applicationId, kind, operationId: `${kind}/${record.number}`, expectedSharedRevision: before.ok ? before.value.sharedRevision : 1,
          ...(kind === 'transferApplication' ? { from: record.assignee ?? 'salma', to: record.assignee === 'salma' ? 'khaled' : 'salma', confirmed: true as const } : {}),
        } as import('../../../src/demo').ReviewOperation
        const outcome = await window.demo.execute(command)
        return { before, outcome, after: await window.demo.readApplication(applicationId), inspection: await window.demo.inspectOperation(command) }
      }, { datasetId: context.datasetId, record, kind })
      expect(result.outcome.ok, `${kind} ${record.status}/${record.assignee}`).toBe(allowed)
      if (!allowed) {
        expect(result.after).toEqual(result.before)
        if (record.status === 'draft') expect(result.outcome).toMatchObject({ error: { kind: 'unavailable' } })
        else expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
      } else {
        expect(result.inspection).toMatchObject({ ok: true, value: { status: 'committed' } })
        expect(result.after).toEqual(result.outcome.ok ? { ok: true, value: result.outcome.value.application } : null)
        if (!result.before.ok || !result.after.ok) throw new Error('Record inaccessible')
        expect(result.after.value.sharedRevision).toBe(result.before.value.sharedRevision + 1)
        expect(result.after.value.status).toBe(kind === 'startReview' ? 'underReview' : record.status)
        expect(result.after.value.snapshot).toEqual(result.before.value.snapshot)
      }
    }
  })

  test(`${kind} rolls back a staged failure and resolves uncertain completion without duplicate effects`, async ({ page }) => {
    const context = await openStaff(page)
    const applicationId = `RIFD-2026-${kind === 'claimApplication' ? '002' : kind === 'startReview' ? '003' : '007'}`
    // Unassignment uses a Submitted application. Review and transfers use their normal fixtures.
    const id = kind === 'unassignApplication' ? 'RIFD-2026-003' : applicationId
    const command = { kind, applicationId: id, datasetId: context.datasetId, operationId: 'atomic-action', expectedSharedRevision: 1,
      ...(kind === 'transferApplication' ? { from: 'salma', to: 'khaled', confirmed: true } : {}),
    } as import('../../../src/demo').ReviewOperation
    const aborted = await page.evaluate(async command => {
      const before = await window.demo.readApplication(command.applicationId)
      window.demo.setControls({ slow: false, failure: 'storage' })
      const stale = await window.demo.execute({ ...command, expectedSharedRevision: 99 })
      const armed = window.demo.controls()
      const failure = await window.demo.execute(command)
      return { before, stale, armed, failure, after: await window.demo.readApplication(command.applicationId), inspection: await window.demo.inspectOperation(command) }
    }, command)
    expect(aborted.stale).toMatchObject({ ok: false, error: { kind: 'staleRecord' } })
    expect(aborted.armed.failure).toBe('storage')
    expect(aborted.failure).toMatchObject({ ok: false, error: { kind: 'storage' } })
    expect(aborted.after).toEqual(aborted.before)
    expect(aborted.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
    await page.evaluate(loseNextWriteCompletion)
    expect(await page.evaluate(command => window.demo.execute(command), command)).toMatchObject({ ok: false, error: { kind: 'outcomeUnknown' } })
    const committed = await page.evaluate(async command => {
      const inspection = await window.demo.inspectOperation(command)
      window.demo.setControls({ slow: false, failure: 'storage' })
      const replay = await window.demo.execute({ ...command, expectedSharedRevision: 99 })
      const otherId = command.applicationId === 'RIFD-2026-002' ? 'RIFD-2026-003' : 'RIFD-2026-002'
      const otherBefore = await window.demo.readApplication(otherId)
      const changed = await window.demo.execute({ ...command, applicationId: otherId })
      return { inspection, replay, changed, after: await window.demo.readApplication(command.applicationId), otherBefore, otherAfter: await window.demo.readApplication(otherId), controls: window.demo.controls() }
    }, command)
    expect(committed.inspection).toMatchObject({ ok: true, value: { status: 'committed' } })
    expect(committed.replay.ok).toBe(true)
    if (!committed.inspection.ok || committed.inspection.value.status !== 'committed') throw new Error('No receipt')
    expect(committed.replay).toEqual({ ok: true, value: committed.inspection.value.result })
    expect(committed.changed).toMatchObject({ ok: false, error: { kind: 'identifierMisuse' } })
    expect(committed.after).toEqual(committed.replay.ok ? { ok: true, value: committed.replay.value.application } : null)
    expect(committed.otherAfter).toEqual(committed.otherBefore)
    expect(committed.controls.failure).toBe('storage')
    if (!aborted.before.ok || !committed.replay.ok || committed.replay.value.application.role !== 'reviewer' || aborted.before.value.role !== 'reviewer') throw new Error('No staff projection')
    expect(committed.replay.value.application.activity).toHaveLength(aborted.before.value.activity.length + 1)
    expect(committed.replay.value.application.sharedRevision).toBe(2)
  })
}

test('review writes require the captured actor, dataset and confirmation and refuse changed identifiers', async ({ page }) => {
  const context = await openStaff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const command = { kind: 'transferApplication' as const, datasetId, operationId: 'transfer', applicationId: 'RIFD-2026-003', expectedSharedRevision: 1, from: 'salma' as const, to: 'khaled' as const, confirmed: true as const }
    const before = await demo.readApplication(command.applicationId)
    const invalid = []
    for (const extra of [{ confirmed: false }, { confirmed: undefined }, { from: 'khaled' }, { to: 'salma' }, { to: 'mariam' }, { state: 'underReview' }]) invalid.push(await demo.execute({ ...command, ...extra } as unknown as import('../../../src/demo').ReviewOperation))
    const wrongDataset = await demo.execute({ ...command, datasetId: crypto.randomUUID() })
    await demo.signOut()
    const unsigned = await demo.execute(command)
    await demo.signIn('huda')
    const applicant = await demo.execute(command)
    const staleApplicant = await demo.execute({ ...command, expectedSharedRevision: 99 })
    await demo.signIn('omar')
    const stranger = await demo.execute(command)
    await demo.signIn('salma')
    const afterRefusals = await demo.readApplication(command.applicationId)
    const first = await demo.execute(command)
    const changedIntent = await demo.execute({ ...command, to: 'salma' })
    const changedFamily = await demo.execute({ kind: 'unassignApplication', datasetId, operationId: command.operationId, applicationId: command.applicationId, expectedSharedRevision: 2 })
    const preference = await demo.execute({ kind: 'setLanguage', datasetId, operationId: command.operationId, expectedRevision: 1, language: 'en' })
    const lostAssignment = await demo.execute({ kind: 'startReview', datasetId, operationId: 'lost-assignment', applicationId: command.applicationId, expectedSharedRevision: 1 })
    const latestDenial = await demo.execute({ kind: 'startReview', datasetId, operationId: 'current-denial', applicationId: command.applicationId, expectedSharedRevision: 2 })
    const freshReplay = await demo.execute(command)
    return { before, invalid, wrongDataset, unsigned, applicant, staleApplicant, stranger, afterRefusals, first, changedIntent, changedFamily, preference, lostAssignment, latestDenial, freshReplay }
  }, context.datasetId)
  for (const refused of result.invalid) expect(refused.ok).toBe(false)
  expect(result.wrongDataset).toMatchObject({ error: { kind: 'supersededDataset' } })
  expect(result.unsigned).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(result.applicant).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(result.staleApplicant).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(result.stranger).toMatchObject({ error: { kind: 'unavailable' } })
  expect(result.afterRefusals).toEqual(result.before)
  for (const refusal of [result.changedIntent, result.changedFamily, result.preference]) expect(refusal).toMatchObject({ error: { kind: 'identifierMisuse' } })
  expect(result.lostAssignment).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(result.latestDenial).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(result.freshReplay).toEqual(result.first)
})

test('real simultaneous claims commit once and a colleague transfer refuses the earlier start intent', async ({ page, context }) => {
  const staff = await openStaff(page)
  const second = await context.newPage()
  await openStaff(second)
  const command = { kind: 'claimApplication' as const, datasetId: staff.datasetId, operationId: 'race', applicationId: 'RIFD-2026-002', expectedSharedRevision: 1 }
  const outcomes = await Promise.all([page, second].map((tab, index) => tab.evaluate(command => window.demo.execute(command), { ...command, operationId: `race-${index}` })))
  expect(outcomes.filter(result => result.ok)).toHaveLength(1)
  expect(outcomes.find(result => !result.ok)).toMatchObject({ error: { kind: 'staleRecord' } })
  const start = { ...command, kind: 'startReview' as const, operationId: 'stale-start', expectedSharedRevision: 2 }
  await second.evaluate(command => window.demo.execute(command), { ...command, kind: 'transferApplication' as const, from: 'salma' as const, to: 'khaled' as const, confirmed: true as const, operationId: 'outside-transfer', expectedSharedRevision: 2 })
  expect(await page.evaluate(command => window.demo.execute(command), start)).toMatchObject({ error: { kind: 'staleRecord' } })
  const latest = await page.evaluate(() => window.demo.readApplication('RIFD-2026-002'))
  expect(latest).toMatchObject({ ok: true, value: { sharedRevision: 3, status: 'submitted', assignment: { en: 'Khaled Ali' }, permissions: { startReview: false } } })
  if (!latest.ok || latest.value.role !== 'reviewer') throw new Error('Not readable')
  expect(latest.value.history).toHaveLength(1)
  expect(latest.value.activity.map(event => event.kind)).toEqual(['submitted', 'assigned', 'assigned'])
})

test('expiry between staging and completion rolls back review start and sign-in does not retry', async ({ page }) => {
  const context = await openStaff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const command = { kind: 'startReview' as const, datasetId, operationId: 'expired', applicationId: 'RIFD-2026-003', expectedSharedRevision: 1 }
    const before = await demo.readApplication(command.applicationId)
    const put = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
      const request = put.apply(this, args)
      request.addEventListener('success', () => demo.expireSession(), { once: true })
      return request
    }
    const outcome = await demo.execute(command)
    IDBObjectStore.prototype.put = put
    await demo.signIn('salma')
    return { before, outcome, after: await demo.readApplication(command.applicationId), inspection: await demo.inspectOperation(command) }
  }, context.datasetId)
  expect(result.outcome).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(result.after).toEqual(result.before)
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
})

test('a new application submitted through the public interface can be claimed and reviewed', async ({ page }) => {
  await openStaff(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.signIn('mariam')
    const draft = await demo.newDraft('inventory')
    const template = await demo.readApplication('RIFD-2026-001')
    if (!context.ok || !draft.ok || !template.ok) throw new Error('No draft')
    const fields = { ...template.value.snapshot.fields, explanation: 'Purchase fictional retail stock.' }
    const documents = {} as import('../../../src/demo').DraftDocuments
    for (const slot of ['identity', 'business', 'financial', 'purchase'] as const) {
      const file = await demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: draft.value.id, slot, selectionId: slot, source: { kind: 'generated', fields } })
      if (!file.ok) throw new Error('No evidence')
      documents[slot] = { kind: 'prepared', attachment: file.value }
    }
    const submitted = await demo.execute({ kind: 'submit', datasetId: context.value.datasetId, applicationId: draft.value.id, operationId: 'new-submit', expectedSharedRevision: 1, expectedWorkspaceRevision: 0, product: 'inventory', fields, documents })
    await demo.signIn('salma')
    const claimed = await demo.execute({ kind: 'claimApplication', datasetId: context.value.datasetId, applicationId: draft.value.id, operationId: 'new-claim', expectedSharedRevision: 2 })
    const started = await demo.execute({ kind: 'startReview', datasetId: context.value.datasetId, applicationId: draft.value.id, operationId: 'new-start', expectedSharedRevision: 3 })
    return { submitted, claimed, started }
  })
  expect(result.submitted.ok).toBe(true)
  expect(result.claimed).toMatchObject({ ok: true, value: { application: { status: 'submitted', assignedToYou: true } } })
  expect(result.started).toMatchObject({ ok: true, value: { application: { status: 'underReview', sharedRevision: 4, history: [{ kind: 'submitted' }, { kind: 'reviewStarted' }] } } })
})

test('terminal colleague assignments stay locked and readable', async ({ page }) => {
  const context = await openStaff(page)
  // Prepare valid terminal colleague fixtures at the storage boundary. Assertions use Demo only.
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('rifd-demo', 1)
    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction('state', 'readwrite')
      const store = tx.objectStore('state')
      const read = store.get('dataset')
      read.onsuccess = () => {
        const data = read.result as import('../../../src/domain/model').Dataset
        for (const application of data.applications) if (application.status === 'approved' || application.status === 'rejected') application.assignee = 'khaled'
        store.put(data, 'dataset')
      }
      tx.oncomplete = () => { db.close(); resolve() }
      tx.onabort = () => reject(new Error('Fixture aborted'))
    }
  }))
  for (const applicationId of ['RIFD-2026-005', 'RIFD-2026-006']) {
    const result = await page.evaluate(async ({ applicationId, datasetId }) => {
      const before = await window.demo.readApplication(applicationId)
      if (!before.ok) throw new Error('No terminal application')
      const outcomes = []
      for (const kind of ['claimApplication', 'unassignApplication', 'startReview', 'transferApplication'] as const) {
        const command = { kind, datasetId, applicationId, expectedSharedRevision: before.value.sharedRevision, operationId: `final-${kind}`, ...(kind === 'transferApplication' ? { from: 'khaled', to: 'salma', confirmed: true } : {}) } as import('../../../src/demo').ReviewOperation
        outcomes.push({ result: await window.demo.execute(command), inspection: await window.demo.inspectOperation(command) })
      }
      return { before, outcomes, after: await window.demo.readApplication(applicationId) }
    }, { applicationId, datasetId: context.datasetId })
    expect(result.before).toMatchObject({ ok: true, value: { assignment: { en: 'Khaled Ali' }, permissions: { claimApplication: false, unassignApplication: false, transferApplication: false, startReview: false } } })
    for (const outcome of result.outcomes) {
      expect(outcome.result.ok).toBe(false)
      expect(outcome.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
    }
    expect(result.after).toEqual(result.before)
  }
})

test('a replacement dataset refuses a delayed assignment before any receipt or activity commits', async ({ page }) => {
  const context = await openStaff(page)
  const result = await page.evaluate(async datasetId => {
    const demo = window.demo
    const command = { kind: 'claimApplication' as const, datasetId, operationId: 'old-dataset', applicationId: 'RIFD-2026-002', expectedSharedRevision: 1 }
    const before = await demo.readApplication(command.applicationId)
    demo.setControls({ slow: true, failure: 'storage' })
    const pending = demo.execute(command)
    const replacement = crypto.randomUUID()
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('rifd-demo', 1)
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction('state', 'readwrite')
        const store = tx.objectStore('state')
        const read = store.get('dataset')
        read.onsuccess = () => { const data = read.result; data.meta.datasetId = replacement; store.put(data, 'dataset') }
        tx.oncomplete = () => { db.close(); resolve() }
        tx.onabort = () => reject(new Error('Fixture aborted'))
      }
    })
    const refused = await pending
    const invalidated = await demo.context()
    await demo.startup()
    await demo.signIn('salma')
    return { before, refused, invalidated, after: await demo.readApplication(command.applicationId), oldReceipt: await demo.inspectOperation(command) }
  }, context.datasetId)
  expect(result.refused).toMatchObject({ error: { kind: 'supersededDataset' } })
  expect(result.invalidated).toMatchObject({ error: { kind: 'supersededDataset' } })
  if (!result.before.ok || result.before.value.role !== 'reviewer' || !result.after.ok || result.after.value.role !== 'reviewer') throw new Error('No review')
  expect({ ...result.after.value, inspectionContexts: result.before.value.inspectionContexts }).toEqual(result.before.value)
  expect(result.after.value.inspectionContexts).not.toEqual(result.before.value.inspectionContexts)
  expect(result.oldReceipt).toMatchObject({ error: { kind: 'supersededDataset' } })
})
