import { expect, test, type Page } from '@playwright/test'

test.describe.configure({ mode: 'parallel' })

async function openSubmission(page: Page) {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  return page.evaluate(async () => {
    const demo = window.demo
    await demo.startup()
    const context = await demo.signIn('mariam')
    const draft = await demo.readApplication('RIFD-2026-001')
    if (!context.ok || !draft.ok || draft.value.role !== 'applicant' || !draft.value.workspace) throw new Error('No draft')
    window.datasetId = context.value.datasetId
    window.submitCommand = {
      kind: 'submit', applicationId: draft.value.id,
      product: draft.value.product, fields: { ...draft.value.snapshot.fields, explanation: 'Purchase stock for this fictional retail business.' },
      documents: Object.fromEntries(Object.entries(draft.value.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../../src/demo').DraftDocuments,
    }
    return draft.value
  })
}

test('submission publishes captured fields and files once, retires the workspace and restores after refresh', async ({ page }) => {
  const before = await openSubmission(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const prepared = await demo.prepareAttachment({ datasetId: window.datasetId, applicationId: window.submitCommand.applicationId, slot: 'purchase', selectionId: 'purchase', source: { kind: 'local', file: new File(['fictional publication bytes'], 'DEMO.png', { type: 'image/png' }) } })
    if (!prepared.ok) throw new Error('Preparation failed')
    window.submitCommand.documents.purchase = { kind: 'prepared', attachment: prepared.value }
    const command = structuredClone(window.submitCommand)
    const submitting = window.commitOn(demo, window.submitCommand)
    window.submitCommand.fields.explanation = 'Later typing cannot change the captured publication.'
    const submitted = await submitting
    const repeat = await window.commitOn(demo, command)
    const notices = await demo.readNotifications()
    await demo.signIn('salma')
    const staff = await demo.readApplication(command.applicationId)
    const queue = await demo.listApplications()
    await demo.signIn('mariam')
    return { submitted, repeat, staff, queue, notices, command }
  })
  expect(result.submitted).toMatchObject({ ok: true, value: {
    receipt: { kind: 'submit', sharedRevision: 2, workspaceRevision: 2 },
    application: { status: 'submitted', submittedAt: '2026-10-14', workspace: null, evidenceMonths: ['2026-07', '2026-08', '2026-09'], snapshot: { fields: { explanation: 'Purchase stock for this fictional retail business.' } }, history: [{ kind: 'submitted', date: '2026-10-14', reason: null }] },
  } })
  // Repeating the intent after publication is a new attempt refused by state, not
  // a receipt replay: the single submission keeps one history entry and notice.
  expect(result.repeat).toMatchObject({ ok: false, error: { kind: 'invalidState' } })
  expect(result.notices.ok && result.notices.value).toHaveLength(1)
  expect(result.staff).toMatchObject({ ok: true, value: { assignment: null, assignedToYou: false, assessments: { identity: { status: 'awaitingReview' }, business: { status: 'awaitingReview' }, financial: { status: 'awaitingReview' }, purchase: { status: 'awaitingReview' } }, checks: { evidence: 'unchecked', operatingHistory: 'unchecked', purpose: 'unchecked', budget: 'unchecked', capacity: 'unchecked' }, activity: [{ kind: 'submitted' }] } })
  expect(result.staff.ok && 'workspace' in result.staff.value).toBe(false)
  expect(result.queue.ok && result.queue.value.find(row => row.id === before.id)).toMatchObject({ status: 'submitted', assignment: null })
  if (!result.submitted.ok) throw new Error('Submission failed')
  const event = result.submitted.value.application.history[0]
  expect(result.staff.ok && result.staff.value.history[0]).toEqual(event)
  await page.reload()
  await page.waitForFunction(() => window.demo)
  const restored = await page.evaluate(async command => {
    await window.demo.startup()
    const view = await window.demo.readApplication(command.applicationId)
    if (!view.ok) throw new Error('No application')
    const file = await window.demo.readFile(command.applicationId, view.value.snapshot.documents.purchase!)
    return {
      repeat: await window.commit(command),
      inspection: await window.inspect(command),
      view,
      bytes: file.ok ? new TextDecoder().decode(file.value.bytes) : null,
      notices: await window.demo.readNotifications(),
    }
  }, result.command)
  // The published record has no workspace, so neither repeating the intent nor
  // inspecting it can produce another publication.
  expect(restored.repeat).toMatchObject({ ok: false, error: { kind: 'invalidState' } })
  expect(restored.inspection).toMatchObject({ ok: false, error: { kind: 'invalidState' } })
  expect(restored.view).toMatchObject({ ok: true, value: { status: 'submitted', workspace: null } })
  expect(restored.view.ok && restored.view.value.history).toHaveLength(1)
  expect(restored.bytes).toBe('fictional publication bytes')
  expect(restored.notices.ok && restored.notices.value).toHaveLength(1)
})

test('the operation boundary refuses every invalid field and missing, pending or failed required document without consuming failure', async ({ page }) => {
  const before = await openSubmission(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const command = window.submitCommand
    demo.setControls({ slow: false, failure: 'submission' })
    const invalid = { fullName: 'x', mobile: '12', city: 'x', email: 'invalid', businessName: 'x', activity: 'invalid', address: 'x', operatingSince: '2026-11', revenue: '-1', expenses: '1,00', amount: '1', term: '18', budget: '0', explanation: '' }
    const fields = []
    for (const [field, value] of Object.entries(invalid)) fields.push({ field, result: await window.commitOn(demo, { ...command, fields: { ...command.fields, [field]: value } }) })
    const documents = []
    for (const slot of ['identity', 'business', 'financial', 'purchase'] as const) {
      documents.push(await window.commitOn(demo, { ...command, documents: { ...command.documents, [slot]: { kind: 'saved', fileId: null } } }))
      for (const kind of ['pending', 'failed']) documents.push(await window.commitOn(demo, { ...command, documents: { ...command.documents, [slot]: { kind } } } as unknown as import('../../../src/demo').AttemptIntent))
    }
    const bypass = await window.commitOn(demo, { ...command, allowIncomplete: true } as unknown as import('../../../src/demo').AttemptIntent)
    return { fields, documents, bypass, controls: demo.controls(), inspection: await window.inspectOn(demo, command), after: await demo.readApplication(command.applicationId) }
  })
  for (const { field, result: refused } of result.fields) {
    expect(refused).toMatchObject({ ok: false, error: { kind: 'validation' } })
    expect(refused).toMatchObject({ error: { fieldIssues: [expect.objectContaining({ field })] } })
  }
  for (const refused of [...result.documents, result.bypass]) expect(refused).toMatchObject({ ok: false, error: { kind: 'validation' } })
  expect(result.controls.failure).toBe('submission')
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  expect(result.after).toEqual({ ok: true, value: before })
})

for (const failure of ['submission', 'storage'] as const) test(`${failure} failure aborts publication and retains ready bytes for an explicit retry`, async ({ page }) => {
  const before = await openSubmission(page)
  const result = await page.evaluate(async failure => {
    const demo = window.demo
    const prepared = await demo.prepareAttachment({ datasetId: window.datasetId, applicationId: window.submitCommand.applicationId, slot: 'financial', selectionId: 'financial', source: { kind: 'local', file: new File(['new evidence'], 'DEMO.pdf', { type: 'application/pdf' }) } })
    if (!prepared.ok) throw new Error('No evidence')
    window.submitCommand.documents.financial = { kind: 'prepared', attachment: prepared.value }
    demo.setControls({ slow: false, failure })
    const failed = await window.commitOn(demo, window.submitCommand)
    const after = await demo.readApplication(window.submitCommand.applicationId)
    const inspection = await window.inspectOn(demo, window.submitCommand)
    const ready = await demo.readPrepared(window.submitCommand.applicationId, prepared.value)
    const unpublished = await demo.readFile(window.submitCommand.applicationId, prepared.value.id)
    const retry = await window.commitOn(demo, window.submitCommand)
    const replay = await window.commitOn(demo, window.submitCommand)
    return { failed, after, inspection, ready: ready.ok ? new TextDecoder().decode(ready.value.bytes) : null, unpublished, retry, replay, notices: await demo.readNotifications() }
  }, failure)
  expect(result.failed).toMatchObject({ ok: false, error: { kind: failure === 'submission' ? 'requestFailed' : 'storage' } })
  expect(result.after).toEqual({ ok: true, value: before })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  expect(result.ready).toBe('new evidence')
  expect(result.unpublished).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
  expect(result.retry).toMatchObject({ ok: true, value: { application: { sharedRevision: 2, workspace: null, history: [{ kind: 'submitted' }] } } })
  // The explicit retry is the only publication; repeating it afterwards is refused
  // by state and cannot add a second history entry or notice.
  expect(result.replay).toMatchObject({ ok: false, error: { kind: 'invalidState' } })
  expect(result.retry.ok && result.retry.value.application.history).toHaveLength(1)
  expect(result.notices.ok && result.notices.value).toHaveLength(1)
})

test('publication requires current private and shared revisions, reading access and an unused intent', async ({ page }) => {
  await openSubmission(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const command = window.submitCommand
    const before = await demo.readApplication(command.applicationId)
    if (!before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('No draft')
    demo.setControls({ slow: false, failure: 'submission' })
    // A record prepared against another shared revision cannot publish over it.
    const shared = await window.commitOn(demo, command, { ...before.value, sharedRevision: before.value.sharedRevision + 1 })
    // A private revision that moved on is refused before publication is staged.
    const workspace = await window.commitOn(demo, command, { ...before.value, workspace: { ...before.value.workspace, revision: before.value.workspace.revision - 1 } })
    await demo.signIn('huda')
    const otherOwner = await window.commitOn(demo, command)
    await demo.signIn('salma')
    const reviewer = await window.commitOn(demo, command)
    await demo.signIn('mariam')
    const armed = demo.controls()
    demo.setControls({ slow: false, failure: null })
    const first = await window.commitOn(demo, command)
    demo.setControls({ slow: false, failure: 'submission' })
    const changed = await window.commitOn(demo, { ...command, fields: { ...command.fields, city: 'Different city' } })
    const kind = await window.commitOn(demo, { kind: 'saveDraft', applicationId: command.applicationId, product: command.product, fields: command.fields, documents: command.documents })
    const duplicate = await window.commitOn(demo, { ...command })
    const controls = demo.controls()
    return { shared, workspace, otherOwner, reviewer, armed, first, changed, kind, duplicate, controls, after: await demo.readApplication(command.applicationId), notices: await demo.readNotifications() }
  })
  expect(result.shared).toMatchObject({ ok: false, error: { kind: 'staleRecord' } })
  expect(result.workspace).toMatchObject({ ok: false, error: { kind: 'staleWorkspace' } })
  expect(result.otherOwner).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
  // Reviewers cannot read the private draft either, so neither can publish it.
  for (const refusal of [result.otherOwner, result.reviewer]) expect(refusal).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
  expect(result.armed.failure).toBe('submission')
  expect(result.first).toMatchObject({ ok: true, value: { application: { status: 'submitted', workspace: null, sharedRevision: 2, history: [{ kind: 'submitted' }] } } })
  // Once published, the same or a changed intent is a new attempt refused by
  // state; no second history entry or notice is produced.
  for (const refusal of [result.changed, result.kind, result.duplicate]) expect(refusal).toMatchObject({ ok: false, error: { kind: 'invalidState' } })
  expect(result.controls.failure).toBe('submission')
  expect(result.after).toMatchObject({ ok: true, value: { status: 'submitted', workspace: null } })
  expect(result.after.ok && result.after.value.history).toHaveLength(1)
  expect(result.notices.ok && result.notices.value).toHaveLength(1)
})

test('a concurrent save or submission can publish only the inspected workspace, with one history entry', async ({ page, context }) => {
  const before = await openSubmission(page)
  const second = await context.newPage()
  await openSubmission(second)
  const save = await second.evaluate(() => {
    const command = window.submitCommand
    return window.commit({ kind: 'saveDraft', applicationId: command.applicationId, product: command.product, fields: command.fields, documents: command.documents })
  })
  expect(save.ok).toBe(true)
  // This tab still holds the record it prepared from, before the other tab saved.
  expect(await page.evaluate(view => window.commit(window.submitCommand, view), before)).toMatchObject({ ok: false, error: { kind: 'staleWorkspace' } })
  const outcomes = await Promise.all([page, second].map(tab => tab.evaluate(async () => {
    const latest = await window.demo.readApplication(window.submitCommand.applicationId)
    if (!latest.ok || latest.value.role !== 'applicant') throw new Error('No latest')
    return window.commit({ ...window.submitCommand })
  })))
  expect(outcomes.filter(result => result.ok)).toHaveLength(1)
  expect(outcomes.filter(result => !result.ok)).toHaveLength(1)
  const view = await page.evaluate(() => window.demo.readApplication(window.submitCommand.applicationId))
  expect(view).toMatchObject({ ok: true, value: { status: 'submitted', workspace: null, history: [{ kind: 'submitted' }] } })
  expect(view.ok && view.value.history).toHaveLength(1)
})

test('expiry before commit refuses publication without consuming its failure, and sign-in never retries', async ({ page }) => {
  const before = await openSubmission(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    demo.setControls({ slow: false, failure: 'submission' })
    const pending = window.commitOn(demo, window.submitCommand)
    demo.expireSession()
    const expired = await pending
    await demo.signIn('mariam')
    return { expired, after: await demo.readApplication(window.submitCommand.applicationId), inspection: await window.inspectOn(demo, window.submitCommand), controls: demo.controls() }
  })
  expect(result.expired).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } })
  expect(result.after).toEqual({ ok: true, value: before })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  expect(result.controls.failure).toBe('submission')
})

test('a lost publication completion requires receipt inspection and cannot duplicate history', async ({ page }) => {
  await openSubmission(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const before = await demo.readApplication(window.submitCommand.applicationId)
    if (!before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('No draft')
    const transaction = IDBDatabase.prototype.transaction
    let loseNext = true
    IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase['transaction']>) {
      const tx = transaction.apply(this, args)
      if (args[1] === 'readwrite' && loseNext) {
        loseNext = false
        Object.defineProperty(tx, 'oncomplete', { configurable: true, set() { /* System-boundary observer failure. */ } })
      }
      return tx
    }
    const submitted = await window.commit(window.submitCommand)
    IDBDatabase.prototype.transaction = transaction
    return {
      submitted,
      // Inspecting the pending attempt needs the record it was prepared from.
      inspection: await window.inspect(window.submitCommand, before.value),
      duplicate: await window.commit(window.submitCommand, before.value),
      view: await demo.readApplication(window.submitCommand.applicationId),
      notices: await demo.readNotifications(),
    }
  })
  expect(result.submitted).toMatchObject({ ok: false, error: { kind: 'outcomeUnknown' } })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'committed', result: { application: { status: 'submitted', workspace: null, sharedRevision: 2 } } } })
  // The retry is a new attempt against the already published record.
  expect(result.duplicate).toMatchObject({ ok: false, error: { kind: 'staleWorkspace' } })
  expect(result.view).toMatchObject({ ok: true, value: { status: 'submitted', workspace: null } })
  expect(result.view.ok && result.view.value.history).toHaveLength(1)
  expect(result.notices.ok && result.notices.value).toHaveLength(1)
})

test('domain dates and financial windows stay fixed while same-day publications have durable order', async ({ page }) => {
  await page.clock.install({ time: new Date('2032-02-20T12:00:00Z') })
  await openSubmission(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    await demo.signIn('salma')
    const queue = await demo.listApplications()
    if (!queue.ok) throw new Error('No queue')
    const seeds = await Promise.all(queue.value.map(application => demo.readApplication(application.id)))
    const sequence = Math.max(...seeds.flatMap(view => view.ok && view.value.role === 'reviewer' ? view.value.activity.map(event => event.sequence) : []))
    await demo.signIn('mariam')
    const first = await window.commitOn(demo, window.submitCommand)
    const draft = await demo.newDraft('inventory')
    if (!draft.ok || !draft.value.workspace) throw new Error('No new draft')
    const files = await Promise.all((['identity', 'business', 'financial', 'purchase'] as const).map(async slot => {
      const file = await demo.prepareAttachment({ datasetId: window.datasetId, applicationId: draft.value.id, slot, selectionId: slot, source: { kind: 'local', file: new File([slot], `DEMO-${slot}.png`, { type: 'image/png' }) } })
      if (!file.ok) throw new Error('No prepared file')
      return [slot, { kind: 'prepared', attachment: file.value }]
    }))
    const second = await window.commitOn(demo, { ...window.submitCommand, applicationId: draft.value.id, documents: Object.fromEntries(files) as import('../../../src/demo').DraftDocuments })
    const historical = await demo.readApplication('RIFD-2026-005')
    return { sequence, first, second, historical, next: await demo.listApplications() }
  })
  for (const submission of [result.first, result.second]) expect(submission).toMatchObject({ ok: true, value: { application: { submittedAt: '2026-10-14', evidenceMonths: ['2026-07', '2026-08', '2026-09'] } } })
  expect(result.first.ok && result.first.value.application.history[0].sequence).toBe(result.sequence + 1)
  expect(result.second.ok && result.second.value.application.history[0].sequence).toBe(result.sequence + 2)
  expect(result.historical).toMatchObject({ ok: true, value: { submittedAt: '2026-07-03', evidenceMonths: ['2026-04', '2026-05', '2026-06'] } })
  expect(result.next.ok && result.next.value.filter(row => row.status === 'draft')).toHaveLength(0)
})

test('a dataset replacement during delayed publication refuses the old command and preserves the new dataset', async ({ page }) => {
  const before = await openSubmission(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const unsaved = await demo.newDraft('equipment')
    if (!unsaved.ok) throw new Error('No memory-only draft')
    demo.setControls({ slow: true, failure: null })
    const pending = window.commitOn(demo, window.submitCommand)
    // Isolated reset fixture until the public reset operation lands in ticket 18.
    const replacement = crypto.randomUUID()
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open('rifd-demo', 1)
      open.onsuccess = () => {
        const db = open.result
        const tx = db.transaction('state', 'readwrite')
        const store = tx.objectStore('state')
        const read = store.get('dataset')
        read.onsuccess = () => { read.result.meta.datasetId = replacement; store.put(read.result, 'dataset') }
        tx.oncomplete = () => { db.close(); resolve() }
        tx.onabort = () => { db.close(); reject(tx.error) }
      }
      open.onerror = () => reject(open.error)
    })
    const refused = await pending
    const context = await demo.startup()
    await demo.signIn('mariam')
    const after = await demo.readApplication(window.submitCommand.applicationId)
    return { refused, context, replacement, after, oldInspection: await window.inspectOn(demo, window.submitCommand), oldUnsaved: await demo.readApplication(unsaved.value.id), controls: demo.controls() }
  })
  expect(result.refused).toMatchObject({ ok: false, error: { kind: 'supersededDataset' } })
  expect(result.context).toMatchObject({ ok: true, value: { datasetId: result.replacement, session: null } })
  expect(result.after).toEqual({ ok: true, value: before })
  // The intent carries no dataset, so inspection reads the replacement dataset:
  // the refused attempt left nothing behind there.
  expect(result.oldInspection).toMatchObject({ ok: true, value: { status: 'notCommitted', application: { status: 'draft', workspace: { revision: 1 } } } })
  expect(result.oldUnsaved).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
  expect(result.controls).toEqual({ slow: false, failure: null })
})

test('failed post-commit observers leave a successful publication and a single shared revision hint', async ({ page }) => {
  await openSubmission(page)
  const result = await page.evaluate(async () => {
    const hints: unknown[] = []
    BroadcastChannel.prototype.postMessage = message => { hints.push(message); throw new Error('Fixture broadcast failure') }
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key: string, value: string) { if (key === 'rifd.commit.v1') throw new Error('Fixture fallback failure'); setItem.call(this, key, value) }
    window.demo.subscribe(() => { throw new Error('Fixture render failure') })
    const first = await window.commit(window.submitCommand)
    const replay = await window.commit(window.submitCommand)
    return { first, replay, hints, datasetId: window.datasetId }
  })
  expect(result.first).toMatchObject({ ok: true, value: { application: { status: 'submitted' } } })
  // Only the first publication commits, so it emits the one shared revision hint.
  expect(result.replay).toMatchObject({ ok: false, error: { kind: 'invalidState' } })
  expect(result.hints).toEqual([{ datasetId: result.datasetId, kind: 'application', applicationId: 'RIFD-2026-001', revision: 2 }])
})

test('real pending and failed replacement selections cannot fall back to saved files until explicitly discarded', async ({ page }) => {
  const before = await openSubmission(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const command = window.submitCommand
    demo.setControls({ slow: true, failure: 'upload' })
    const preparing = demo.prepareAttachment({ datasetId: window.datasetId, applicationId: command.applicationId, slot: 'purchase', selectionId: 'replacement', source: { kind: 'local', file: new File(['replacement'], 'DEMO.png', { type: 'image/png' }) } })
    const pending = await window.commitOn(demo, command)
    const preparation = await preparing
    demo.setControls({ slow: false, failure: 'submission' })
    const failed = await window.commitOn(demo, command)
    const armed = demo.controls()
    const after = await demo.readApplication(command.applicationId)
    demo.cancelPreparation(command.applicationId, 'purchase')
    demo.setControls({ slow: false, failure: null })
    const discarded = await window.commitOn(demo, command)
    return { pending, preparation, failed, armed, after, discarded }
  })
  expect(result.pending).toMatchObject({ ok: false, error: { kind: 'validation', slot: 'purchase' } })
  expect(result.preparation).toMatchObject({ ok: false, error: { kind: 'uploadFailed' } })
  expect(result.failed).toMatchObject({ ok: false, error: { kind: 'validation', slot: 'purchase' } })
  expect(result.armed.failure).toBe('submission')
  expect(result.after).toEqual({ ok: true, value: before })
  expect(result.discarded).toMatchObject({ ok: true, value: { application: { status: 'submitted' } } })
})

test('expiry after staging publication aborts the transaction before any submitted state or receipt becomes durable', async ({ page }) => {
  const before = await openSubmission(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const put = IDBObjectStore.prototype.put
    let expireNext = true
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
      const request = put.apply(this, args)
      if (expireNext && this.name === 'state') {
        expireNext = false
        request.addEventListener('success', () => demo.expireSession())
      }
      return request
    }
    const expired = await window.commitOn(demo, window.submitCommand)
    IDBObjectStore.prototype.put = put
    await demo.signIn('mariam')
    return { expired, after: await demo.readApplication(window.submitCommand.applicationId), inspection: await window.inspectOn(demo, window.submitCommand) }
  })
  expect(result.expired).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } })
  expect(result.after).toEqual({ ok: true, value: before })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
})
