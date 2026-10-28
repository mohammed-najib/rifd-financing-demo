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

test('claim and review start commit separately and a repeated intent adds no activity', async ({ page }) => {
  await openStaff(page)
  await page.evaluate(refuseCommitNotices)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-002')
    if (!before.ok) throw new Error('No submission')
    const claim = { kind: 'claimApplication' as const, applicationId: before.value.id }
    const claimed = await window.commitOn(demo, claim)
    // A repeated intent is a new operation, refused by the record's own rules.
    const replay = await window.commitOn(demo, claim)
    const afterClaim = await demo.readApplication(claim.applicationId)
    const start = { kind: 'startReview' as const, applicationId: before.value.id }
    const started = await window.commitOn(demo, start)
    const startReplay = await window.commitOn(demo, start)
    await demo.signIn('mariam')
    return { before, claimed, replay, afterClaim, started, startReplay, public: await demo.readApplication(claim.applicationId), notices: await demo.readNotifications(), start }
  })
  expect(result.claimed).toMatchObject({ ok: true, value: { receipt: { kind: 'claimApplication', sharedRevision: 2 }, application: { status: 'submitted', assignedToYou: true } } })
  expect(result.replay).toMatchObject({ ok: false, error: { kind: 'invalidState' } })
  if (!result.before.ok || !result.claimed.ok || result.before.value.role !== 'reviewer' || result.claimed.value.application.role !== 'reviewer') throw new Error('Claim failed')
  expect(result.afterClaim).toEqual({ ok: true, value: result.claimed.value.application })
  expect(result.claimed.value.application.history).toEqual(result.before.value.history)
  expect(result.claimed.value.application.snapshot).toEqual(result.before.value.snapshot)
  expect(result.claimed.value.application.activity).toHaveLength(result.before.value.activity.length + 1)
  expect(result.started).toMatchObject({ ok: true, value: { receipt: { kind: 'startReview', sharedRevision: 3 }, application: { status: 'underReview', assignedToYou: true } } })
  expect(result.startReplay).toMatchObject({ ok: false, error: { kind: 'invalidState' } })
  expect(result.public).toMatchObject({ ok: true, value: { status: 'underReview', history: [{ kind: 'submitted' }, { kind: 'reviewStarted', date: '2026-10-14' }] } })
  expect(result.notices?.ok && result.notices.value).toHaveLength(1)
  if (!result.started?.ok || result.started.value.application.role !== 'reviewer') throw new Error('Review not started')
  expect(result.started.value.application.activity.map(event => event.kind)).toEqual(['submitted', 'assigned', 'reviewStarted'])
  expect(result.started.value.application.activity.at(-1)?.id).toBe(result.started.value.application.history.at(-1)?.id)
  await page.reload()
  await page.waitForFunction(() => window.demo)
  const restored = await page.evaluate(async intent => {
    await window.demo.startup()
    await window.demo.signIn('salma')
    return { inspection: await window.inspect(intent), replay: await window.commit(intent) }
  }, result.start!)
  // Nothing is pending after a committed attempt, so the record itself is the answer.
  expect(restored.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted', application: result.started.value.application } })
  expect(restored.replay).toMatchObject({ ok: false, error: { kind: 'invalidState' } })
})

test('confirmed transfers retain correction work and stay absent from applicant history and notifications', async ({ page }) => {
  await openStaff(page)
  await page.evaluate(refuseCommitNotices)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    await demo.signIn('huda')
    const applicant = await demo.readApplication('RIFD-2026-004')
    const notices = await demo.readNotifications()
    await demo.signIn('salma')
    const before = await demo.readApplication('RIFD-2026-004')
    if (!before.ok) throw new Error('No correction application')
    const intent = { kind: 'transferApplication' as const, applicationId: before.value.id, from: 'salma' as const, to: 'khaled' as const, confirmed: true as const }
    const transferred = await window.commitOn(demo, intent)
    const replay = await window.commitOn(demo, intent)
    const afterTransfer = await demo.readApplication(intent.applicationId)
    await demo.signIn('huda')
    return { before, transferred, replay, afterTransfer, applicant, notices, afterApplicant: await demo.readApplication(intent.applicationId), afterNotices: await demo.readNotifications() }
  })
  expect(result.transferred).toMatchObject({ ok: true, value: { application: { status: 'correctionsRequested', assignedToYou: false, assignment: { en: 'Khaled Ali' } } } })
  expect(result.replay).toMatchObject({ ok: false, error: { kind: 'invalidState' } })
  if (!result.before.ok || !result.transferred.ok) throw new Error('Transfer failed')
  expect(result.afterTransfer).toEqual({ ok: true, value: result.transferred.value.application })
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

test('unassignment survives failed change notices and a repeated intent adds no activity entry', async ({ page }) => {
  await openStaff(page)
  await page.evaluate(refuseCommitNotices)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-003')
    const intent = { kind: 'unassignApplication' as const, applicationId: 'RIFD-2026-003' }
    const committed = await window.commitOn(demo, intent)
    return { before, committed, replay: await window.commitOn(demo, intent), inspection: await window.inspectOn(demo, intent), after: await demo.readApplication(intent.applicationId) }
  })
  expect(result.committed).toMatchObject({ ok: true, value: { application: { sharedRevision: 2, status: 'submitted', assignment: null } } })
  expect(result.replay).toMatchObject({ ok: false, error: { kind: 'invalidState' } })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted', application: result.committed.ok ? result.committed.value.application : null } })
  expect(result.after).toEqual(result.committed.ok ? { ok: true, value: result.committed.value.application } : null)
  if (!result.before.ok || !result.committed.ok || result.before.value.role !== 'reviewer' || result.committed.value.application.role !== 'reviewer') throw new Error('Unassignment failed')
  expect(result.committed.value.application.activity).toHaveLength(result.before.value.activity.length + 1)
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
    await openStaff(page)
    for (const record of records) {
      const allowedRecords: Record<typeof kind, readonly string[]> = {
        claimApplication: ['002'], transferApplication: ['003', '011', '007', '008', '004', '013'],
        unassignApplication: ['003', '011'], startReview: ['003'],
      }
      const allowed = allowedRecords[kind].includes(record.number)
      const result = await page.evaluate(async ({ record, kind }) => {
        const applicationId = `RIFD-2026-${record.number}`
        const before = await window.demo.readApplication(applicationId)
        const intent = {
          applicationId, kind,
          ...(kind === 'transferApplication' ? { from: record.assignee ?? 'salma', to: record.assignee === 'salma' ? 'khaled' : 'salma', confirmed: true as const } : {}),
        } as import('../../../src/demo').ReviewIntent
        const outcome = await window.commit(intent)
        return { before, outcome, after: await window.demo.readApplication(applicationId), inspection: await window.inspect(intent) }
      }, { record, kind })
      expect(result.outcome.ok, `${kind} ${record.status}/${record.assignee}`).toBe(allowed)
      if (!allowed) {
        const refusal = record.status === 'draft' ? 'unavailable' : kind === 'startReview' && record.assignee !== 'salma' ? 'permissionDenied' : 'invalidState'
        expect(result.outcome).toMatchObject({ error: { kind: refusal } })
        expect(result.after).toEqual(result.before)
        if (result.before.ok) expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
      } else {
        expect(result.outcome).toMatchObject({ ok: true, value: { receipt: { kind }, application: { sharedRevision: result.before.ok ? result.before.value.sharedRevision + 1 : 0 } } })
        expect(result.after).toEqual(result.outcome.ok ? { ok: true, value: result.outcome.value.application } : null)
        if (!result.before.ok || !result.after.ok) throw new Error('Record inaccessible')
        // Nothing is pending after a committed attempt, so inspection reports the record.
        expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted', application: result.after.value } })
        expect(result.after.value.sharedRevision).toBe(result.before.value.sharedRevision + 1)
        expect(result.after.value.status).toBe(kind === 'startReview' ? 'underReview' : record.status)
        expect(result.after.value.snapshot).toEqual(result.before.value.snapshot)
      }
    }
  })

  test(`${kind} rolls back a staged failure and resolves uncertain completion without duplicate effects`, async ({ page }) => {
    await openStaff(page)
    const record = kind === 'claimApplication' ? 'RIFD-2026-002' : kind === 'unassignApplication' ? 'RIFD-2026-003' : kind === 'startReview' ? 'RIFD-2026-003' : 'RIFD-2026-007'
    const intent = { kind, applicationId: record, ...(kind === 'transferApplication' ? { from: 'salma' as const, to: 'khaled' as const, confirmed: true as const } : {}) } as import('../../../src/demo').ReviewIntent
    const aborted = await page.evaluate(async ({ record, intent }) => {
      const before = await window.demo.readApplication(record)
      window.demo.setControls({ slow: false, failure: 'storage' })
      const armed = window.demo.controls()
      const failure = await window.commit(intent)
      const afterFailure = await window.demo.readApplication(record)
      const committed = await window.commit(intent)
      // Passing the pre-write record is how a caller asks for a stale outcome.
      const stale = await window.commit(intent, before.ok ? before.value : undefined)
      return { before, armed, failure, afterFailure, committed, stale, after: await window.demo.readApplication(record) }
    }, { record, intent })
    expect(aborted.armed.failure).toBe('storage')
    expect(aborted.failure).toMatchObject({ ok: false, error: { kind: 'storage' } })
    expect(aborted.afterFailure).toEqual(aborted.before)
    expect(aborted.committed).toMatchObject({ ok: true, value: { receipt: { kind, sharedRevision: 2 } } })
    expect(aborted.stale).toMatchObject({ ok: false, error: { kind: 'staleRecord' } })
    if (!aborted.before.ok || !aborted.committed.ok || aborted.before.value.role !== 'reviewer' || aborted.committed.value.application.role !== 'reviewer') throw new Error('No staff projection')
    expect(aborted.after).toEqual({ ok: true, value: aborted.committed.value.application })
    expect(aborted.committed.value.application.activity).toHaveLength(aborted.before.value.activity.length + 1)
    expect(aborted.committed.value.application.sharedRevision).toBe(2)

    const next = kind === 'claimApplication' ? { kind: 'startReview' as const }
      : kind === 'startReview' ? { kind: 'transferApplication' as const, from: 'salma' as const, to: 'khaled' as const, confirmed: true as const }
        : kind === 'unassignApplication' ? { kind: 'claimApplication' as const }
          : { kind: 'transferApplication' as const, from: 'khaled' as const, to: 'salma' as const, confirmed: true as const }
    await page.evaluate(loseNextWriteCompletion)
    expect(await page.evaluate(async ({ record, next }) => window.commit({ ...next, applicationId: record }), { record, next })).toMatchObject({ ok: false, error: { kind: 'outcomeUnknown' } })
    const resolved = await page.evaluate(async ({ record, next }) => {
      const inspection = await window.inspect({ ...next, applicationId: record })
      const replay = await window.commit({ ...next, applicationId: record })
      return { inspection, replay, after: await window.demo.readApplication(record) }
    }, { record, next })
    expect(resolved.inspection).toMatchObject({ ok: true, value: { status: 'committed' } })
    expect(resolved.replay).toMatchObject({ ok: false, error: { kind: 'invalidState' } })
    if (!resolved.inspection.ok || resolved.inspection.value.status !== 'committed' || resolved.inspection.value.result.application.role !== 'reviewer') throw new Error('No receipt')
    expect(resolved.after).toEqual({ ok: true, value: resolved.inspection.value.result.application })
    expect(resolved.inspection.value.result.application.activity).toHaveLength(aborted.committed.value.application.activity.length + 1)
    expect(resolved.inspection.value.result.application.sharedRevision).toBe(3)
  })
}

test('review writes require the captured actor and confirmation and refuse intents the record no longer allows', async ({ page }) => {
  await openStaff(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const intent = { kind: 'transferApplication' as const, applicationId: 'RIFD-2026-003', from: 'salma' as const, to: 'khaled' as const, confirmed: true as const }
    const before = await demo.readApplication(intent.applicationId)
    const invalid = []
    for (const extra of [{ confirmed: false }, { confirmed: undefined }, { from: 'khaled' }, { to: 'salma' }, { to: 'mariam' }, { state: 'underReview' }]) invalid.push(await window.commitOn(demo, { ...intent, ...extra } as unknown as import('../../../src/demo').ReviewIntent))
    await demo.signOut()
    const unsigned = await window.commitOn(demo, intent)
    await demo.signIn('huda')
    const applicant = await window.commitOn(demo, intent)
    // An applicant's own view cannot prepare a review attempt; a borrowed reviewer view still fails the actor check.
    const borrowedView = await window.commitOn(demo, intent, before.ok ? before.value : undefined)
    await demo.signIn('omar')
    const stranger = await window.commitOn(demo, intent)
    const foreignInspection = await window.inspectOn(demo, intent)
    await demo.signIn('salma')
    const afterRefusals = await demo.readApplication(intent.applicationId)
    const first = await window.commitOn(demo, intent)
    const afterFirst = await demo.readApplication(intent.applicationId)
    const changedIntent = await window.commitOn(demo, { ...intent, to: 'salma' })
    await demo.signIn('huda')
    // The applicant prepared this intent before the reviewer's write advanced the record.
    const staleApplicant = await window.commitOn(demo, intent, before.ok ? before.value : undefined)
    await demo.signIn('salma')
    const lostAssignment = await window.commitOn(demo, { kind: 'startReview', applicationId: intent.applicationId })
    const latestDenial = await window.commitOn(demo, { kind: 'startReview', applicationId: intent.applicationId })
    const preference = await window.commitOn(demo, { kind: 'setLanguage', expectedRevision: 1, language: 'en' })
    const stalePreference = await window.commitOn(demo, { kind: 'setLanguage', expectedRevision: 1, language: 'en' })
    const freshReplay = await window.commitOn(demo, intent)
    return { before, invalid, unsigned, applicant, borrowedView, stranger, foreignInspection, afterRefusals, first, afterFirst, changedIntent, staleApplicant, lostAssignment, latestDenial, preference, stalePreference, freshReplay, after: await demo.readApplication(intent.applicationId) }
  })
  for (const [index, refused] of result.invalid.entries()) {
    expect(refused).toMatchObject({ ok: false, error: { kind: ['validation', 'validation', 'invalidState', 'invalidState', 'validation', 'validation'][index] } })
  }
  expect(result.unsigned).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(result.applicant).toMatchObject({ error: { kind: 'invalidState' } })
  expect(result.borrowedView).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(result.stranger).toMatchObject({ error: { kind: 'unavailable' } })
  expect(result.foreignInspection).toMatchObject({ error: { kind: 'unavailable' } })
  expect(result.afterRefusals).toEqual(result.before)
  expect(result.first).toMatchObject({ ok: true, value: { receipt: { kind: 'transferApplication' }, application: { assignment: { en: 'Khaled Ali' } } } })
  if (!result.afterFirst.ok || !result.first.ok) throw new Error('Transfer failed')
  expect(result.afterFirst.value).toEqual(result.first.value.application)
  expect(result.changedIntent).toMatchObject({ error: { kind: 'invalidState' } })
  expect(result.staleApplicant).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(result.lostAssignment).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(result.latestDenial).toMatchObject({ error: { kind: 'permissionDenied' } })
  // A preference intent carries its own revision and never shares the application's identity.
  expect(result.preference).toMatchObject({ ok: true, value: { preferences: { language: 'en', revision: 2 } } })
  expect(result.stalePreference).toMatchObject({ error: { kind: 'stalePreference' } })
  expect(result.freshReplay).toMatchObject({ error: { kind: 'invalidState' } })
  // None of the refusals or the repeated transfer touched the record.
  expect(result.after).toEqual({ ok: true, value: result.afterFirst.value })
})

test('real simultaneous claims commit once and a colleague transfer refuses the earlier start intent', async ({ page, context }) => {
  await openStaff(page)
  const second = await context.newPage()
  await openStaff(second)
  const claim = { kind: 'claimApplication' as const, applicationId: 'RIFD-2026-002' }
  const outcomes = await Promise.all([page, second].map(tab => tab.evaluate(intent => window.commit(intent), claim)))
  expect(outcomes.filter(result => result.ok)).toHaveLength(1)
  expect(outcomes.find(result => !result.ok)).toMatchObject({ error: { kind: 'staleRecord' } })
  const earlier = await page.evaluate(() => window.demo.readApplication('RIFD-2026-002'))
  expect(earlier).toMatchObject({ ok: true, value: { sharedRevision: 2, assignedToYou: true } })
  if (!earlier.ok) throw new Error('Not readable')
  // The reviewer's next intent was prepared from the record before the colleague transferred it.
  expect(await second.evaluate(intent => window.commit(intent), { kind: 'transferApplication' as const, applicationId: 'RIFD-2026-002', from: 'salma' as const, to: 'khaled' as const, confirmed: true as const })).toMatchObject({ ok: true })
  expect(await page.evaluate(({ start, view }) => window.commit(start, view), { start: { kind: 'startReview' as const, applicationId: 'RIFD-2026-002' }, view: earlier.value })).toMatchObject({ error: { kind: 'staleRecord' } })
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
    const outcome = await window.commitOn(demo, command)
    IDBObjectStore.prototype.put = put
    await demo.signIn('salma')
    return { before, outcome, after: await demo.readApplication(command.applicationId), inspection: await window.inspectOn(demo, command) }
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
    const submitted = await window.commitOn(demo, { kind: 'submit', applicationId: draft.value.id, product: 'inventory', fields, documents })
    await demo.signIn('salma')
    const claimed = await window.commitOn(demo, { kind: 'claimApplication', applicationId: draft.value.id })
    const started = await window.commitOn(demo, { kind: 'startReview', applicationId: draft.value.id })
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
        outcomes.push({ result: await window.commit(command), inspection: await window.inspect(command) })
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
  await openStaff(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const intent = { kind: 'claimApplication' as const, applicationId: 'RIFD-2026-002' }
    const before = await demo.readApplication(intent.applicationId)
    demo.setControls({ slow: true, failure: 'storage' })
    const pending = window.commitOn(demo, intent)
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
    // The intent carries no dataset identity, so the old receipt cannot be replayed after the switch.
    return { before, refused, invalidated, after: await demo.readApplication(intent.applicationId), oldReceipt: await window.inspectOn(demo, intent) }
  })
  expect(result.refused).toMatchObject({ error: { kind: 'supersededDataset' } })
  expect(result.invalidated).toMatchObject({ error: { kind: 'supersededDataset' } })
  if (!result.before.ok || result.before.value.role !== 'reviewer' || !result.after.ok || result.after.value.role !== 'reviewer') throw new Error('No review')
  expect({ ...result.after.value, inspectionContexts: result.before.value.inspectionContexts }).toEqual(result.before.value)
  expect(result.after.value.inspectionContexts).not.toEqual(result.before.value.inspectionContexts)
  expect(result.oldReceipt).toMatchObject({ ok: true, value: { status: 'notCommitted', application: result.after.value } })
})
