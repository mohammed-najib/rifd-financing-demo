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
    window.submitCommand = {
      kind: 'submit', datasetId: context.value.datasetId, operationId: 'submit-1', applicationId: draft.value.id,
      expectedWorkspaceRevision: draft.value.workspace.revision, expectedSharedRevision: draft.value.sharedRevision,
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
    const prepared = await demo.prepareAttachment({ datasetId: window.submitCommand.datasetId, applicationId: window.submitCommand.applicationId, slot: 'purchase', selectionId: 'purchase', source: { kind: 'local', file: new File(['fictional publication bytes'], 'DEMO.png', { type: 'image/png' }) } })
    if (!prepared.ok) throw new Error('Preparation failed')
    window.submitCommand.documents.purchase = { kind: 'prepared', attachment: prepared.value }
    const command = structuredClone(window.submitCommand)
    const submitting = demo.execute(window.submitCommand)
    window.submitCommand.fields.explanation = 'Later typing cannot change the captured publication.'
    const submitted = await submitting
    const replay = await demo.execute(command)
    const notices = await demo.readNotifications()
    await demo.signIn('salma')
    const staff = await demo.readApplication(command.applicationId)
    const queue = await demo.listApplications()
    await demo.signIn('mariam')
    return { submitted, replay, staff, queue, notices, command }
  })
  expect(result.submitted).toMatchObject({ ok: true, value: {
    receipt: { kind: 'submit', sharedRevision: 2, workspaceRevision: 2 },
    application: { status: 'submitted', submittedAt: '2026-10-14', workspace: null, evidenceMonths: ['2026-07', '2026-08', '2026-09'], snapshot: { fields: { explanation: 'Purchase stock for this fictional retail business.' } }, history: [{ kind: 'submitted', date: '2026-10-14', reason: null }] },
  } })
  expect(result.replay).toEqual(result.submitted)
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
    const replay = await window.demo.execute(command)
    const fileId = replay.ok ? replay.value.application.snapshot.documents.purchase! : ''
    const file = await window.demo.readFile(command.applicationId, fileId)
    return { replay, inspection: await window.demo.inspectOperation(command), bytes: file.ok ? new TextDecoder().decode(file.value.bytes) : null }
  }, result.command)
  expect(restored.replay).toEqual(result.submitted)
  expect(restored.inspection).toMatchObject({ ok: true, value: { status: 'committed' } })
  expect(restored.bytes).toBe('fictional publication bytes')
})

test('the operation boundary refuses every invalid field and missing, pending or failed required document without consuming failure', async ({ page }) => {
  const before = await openSubmission(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const command = window.submitCommand
    demo.setControls({ slow: false, failure: 'submission' })
    const invalid = { fullName: 'x', mobile: '12', city: 'x', email: 'invalid', businessName: 'x', activity: 'invalid', address: 'x', operatingSince: '2026-11', revenue: '-1', expenses: '1,00', amount: '1', term: '18', budget: '0', explanation: '' }
    const fields = []
    for (const [field, value] of Object.entries(invalid)) fields.push({ field, result: await demo.execute({ ...command, fields: { ...command.fields, [field]: value } }) })
    const documents = []
    for (const slot of ['identity', 'business', 'financial', 'purchase'] as const) {
      documents.push(await demo.execute({ ...command, documents: { ...command.documents, [slot]: { kind: 'saved', fileId: null } } }))
      for (const kind of ['pending', 'failed']) documents.push(await demo.execute({ ...command, documents: { ...command.documents, [slot]: { kind } } } as unknown as import('../../../src/demo').SubmitOperation))
    }
    const bypass = await demo.execute({ ...command, allowIncomplete: true } as import('../../../src/demo').SubmitOperation)
    return { fields, documents, bypass, controls: demo.controls(), inspection: await demo.inspectOperation(command), after: await demo.readApplication(command.applicationId) }
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
    const prepared = await demo.prepareAttachment({ datasetId: window.submitCommand.datasetId, applicationId: window.submitCommand.applicationId, slot: 'financial', selectionId: 'financial', source: { kind: 'local', file: new File(['new evidence'], 'DEMO.pdf', { type: 'application/pdf' }) } })
    if (!prepared.ok) throw new Error('No evidence')
    window.submitCommand.documents.financial = { kind: 'prepared', attachment: prepared.value }
    demo.setControls({ slow: false, failure })
    const failed = await demo.execute(window.submitCommand)
    const after = await demo.readApplication(window.submitCommand.applicationId)
    const inspection = await demo.inspectOperation(window.submitCommand)
    const ready = await demo.readPrepared(window.submitCommand.applicationId, prepared.value)
    const unpublished = await demo.readFile(window.submitCommand.applicationId, prepared.value.id)
    const retry = await demo.execute(window.submitCommand)
    const replay = await demo.execute(window.submitCommand)
    return { failed, after, inspection, ready: ready.ok ? new TextDecoder().decode(ready.value.bytes) : null, unpublished, retry, replay, notices: await demo.readNotifications() }
  }, failure)
  expect(result.failed).toMatchObject({ ok: false, error: { kind: failure === 'submission' ? 'requestFailed' : 'storage' } })
  expect(result.after).toEqual({ ok: true, value: before })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  expect(result.ready).toBe('new evidence')
  expect(result.unpublished).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
  expect(result.retry).toMatchObject({ ok: true, value: { application: { sharedRevision: 2, workspace: null, history: [{ kind: 'submitted' }] } } })
  expect(result.replay).toEqual(result.retry)
  expect(result.notices.ok && result.notices.value).toHaveLength(1)
})

test('publication requires current private and shared revisions, reading access and an unused intent', async ({ page }) => {
  await openSubmission(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const command = window.submitCommand
    demo.setControls({ slow: false, failure: 'submission' })
    const shared = await demo.execute({ ...command, expectedSharedRevision: 99 })
    const workspace = await demo.execute({ ...command, expectedWorkspaceRevision: 99 })
    await demo.signIn('huda')
    const otherOwner = await demo.execute(command)
    await demo.signIn('salma')
    const reviewer = await demo.execute(command)
    await demo.signIn('mariam')
    const armed = demo.controls()
    demo.setControls({ slow: false, failure: null })
    const first = await demo.execute(command)
    const changed = await demo.execute({ ...command, fields: { ...command.fields, city: 'Different city' } })
    const kind = await demo.execute({ kind: 'saveDraft', datasetId: command.datasetId, applicationId: command.applicationId, operationId: command.operationId, expectedWorkspaceRevision: command.expectedWorkspaceRevision, product: command.product, fields: command.fields, documents: command.documents })
    const newAttempt = await demo.execute({ ...command, operationId: 'new-attempt' })
    demo.setControls({ slow: false, failure: 'submission' })
    const replay = await demo.execute({ ...command, expectedWorkspaceRevision: 99, expectedSharedRevision: 99 })
    return { shared, workspace, otherOwner, reviewer, armed, first, changed, kind, newAttempt, replay, controls: demo.controls() }
  })
  expect(result.shared).toMatchObject({ ok: false, error: { kind: 'staleRecord' } })
  expect(result.workspace).toMatchObject({ ok: false, error: { kind: 'staleWorkspace' } })
  for (const refusal of [result.otherOwner, result.reviewer]) expect(refusal).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
  for (const refusal of [result.changed, result.kind]) expect(refusal).toMatchObject({ ok: false, error: { kind: 'identifierMisuse' } })
  expect(result.newAttempt.ok).toBe(false)
  expect(result.replay).toEqual(result.first)
  expect(result.armed.failure).toBe('submission')
  expect(result.controls.failure).toBe('submission')
})

test('a concurrent save or submission can publish only the inspected workspace, with one history entry', async ({ page, context }) => {
  await openSubmission(page)
  const second = await context.newPage()
  await openSubmission(second)
  const save = await second.evaluate(() => {
    const command = window.submitCommand
    return window.demo.execute({ kind: 'saveDraft', datasetId: command.datasetId, applicationId: command.applicationId, operationId: 'private-save', expectedWorkspaceRevision: command.expectedWorkspaceRevision, product: command.product, fields: command.fields, documents: command.documents })
  })
  expect(save.ok).toBe(true)
  expect(await page.evaluate(() => window.demo.execute(window.submitCommand))).toMatchObject({ ok: false, error: { kind: 'staleWorkspace' } })
  const outcomes = await Promise.all([page, second].map((tab, index) => tab.evaluate(async index => {
    const latest = await window.demo.readApplication(window.submitCommand.applicationId)
    if (!latest.ok || latest.value.role !== 'applicant') throw new Error('No latest')
    return window.demo.execute({ ...window.submitCommand, operationId: `inspected-${index}`, expectedWorkspaceRevision: latest.value.workspace!.revision, expectedSharedRevision: latest.value.sharedRevision })
  }, index)))
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
    const pending = demo.execute(window.submitCommand)
    demo.expireSession()
    const expired = await pending
    await demo.signIn('mariam')
    return { expired, after: await demo.readApplication(window.submitCommand.applicationId), inspection: await demo.inspectOperation(window.submitCommand), controls: demo.controls() }
  })
  expect(result.expired).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } })
  expect(result.after).toEqual({ ok: true, value: before })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  expect(result.controls.failure).toBe('submission')
})

test('a lost publication completion requires receipt inspection and cannot duplicate history', async ({ page }) => {
  await openSubmission(page)
  const result = await page.evaluate(async () => {
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
    const submitted = await window.demo.execute(window.submitCommand)
    IDBDatabase.prototype.transaction = transaction
    return { submitted, inspection: await window.demo.inspectOperation(window.submitCommand), replay: await window.demo.execute(window.submitCommand) }
  })
  expect(result.submitted).toMatchObject({ ok: false, error: { kind: 'outcomeUnknown' } })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'committed', result: { application: { status: 'submitted', workspace: null } } } })
  expect(result.replay.ok && result.replay.value.application.history).toHaveLength(1)
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
    const first = await demo.execute(window.submitCommand)
    const draft = await demo.newDraft('inventory')
    if (!draft.ok || !draft.value.workspace) throw new Error('No new draft')
    const files = await Promise.all((['identity', 'business', 'financial', 'purchase'] as const).map(async slot => {
      const file = await demo.prepareAttachment({ datasetId: window.submitCommand.datasetId, applicationId: draft.value.id, slot, selectionId: slot, source: { kind: 'local', file: new File([slot], `DEMO-${slot}.png`, { type: 'image/png' }) } })
      if (!file.ok) throw new Error('No prepared file')
      return [slot, { kind: 'prepared', attachment: file.value }]
    }))
    const second = await demo.execute({ ...window.submitCommand, operationId: 'second-publication', applicationId: draft.value.id, expectedWorkspaceRevision: 0, expectedSharedRevision: draft.value.sharedRevision, documents: Object.fromEntries(files) as import('../../../src/demo').DraftDocuments })
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
    const pending = demo.execute(window.submitCommand)
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
    return { refused, context, replacement, after, oldInspection: await demo.inspectOperation(window.submitCommand), oldUnsaved: await demo.readApplication(unsaved.value.id), controls: demo.controls() }
  })
  expect(result.refused).toMatchObject({ ok: false, error: { kind: 'supersededDataset' } })
  expect(result.context).toMatchObject({ ok: true, value: { datasetId: result.replacement, session: null } })
  expect(result.after).toEqual({ ok: true, value: before })
  expect(result.oldInspection).toMatchObject({ ok: false, error: { kind: 'supersededDataset' } })
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
    const first = await window.demo.execute(window.submitCommand)
    const replay = await window.demo.execute(window.submitCommand)
    return { first, replay, hints, datasetId: window.submitCommand.datasetId }
  })
  expect(result.first).toMatchObject({ ok: true, value: { application: { status: 'submitted' } } })
  expect(result.replay).toEqual(result.first)
  expect(result.hints).toEqual([{ datasetId: result.datasetId, kind: 'application', applicationId: 'RIFD-2026-001', revision: 2 }])
})

test('real pending and failed replacement selections cannot fall back to saved files until explicitly discarded', async ({ page }) => {
  const before = await openSubmission(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const command = window.submitCommand
    demo.setControls({ slow: true, failure: 'upload' })
    const preparing = demo.prepareAttachment({ datasetId: command.datasetId, applicationId: command.applicationId, slot: 'purchase', selectionId: 'replacement', source: { kind: 'local', file: new File(['replacement'], 'DEMO.png', { type: 'image/png' }) } })
    const pending = await demo.execute(command)
    const preparation = await preparing
    demo.setControls({ slow: false, failure: 'submission' })
    const failed = await demo.execute(command)
    const armed = demo.controls()
    const after = await demo.readApplication(command.applicationId)
    demo.cancelPreparation(command.applicationId, 'purchase')
    demo.setControls({ slow: false, failure: null })
    const discarded = await demo.execute(command)
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
    const expired = await demo.execute(window.submitCommand)
    IDBObjectStore.prototype.put = put
    await demo.signIn('mariam')
    return { expired, after: await demo.readApplication(window.submitCommand.applicationId), inspection: await demo.inspectOperation(window.submitCommand) }
  })
  expect(result.expired).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } })
  expect(result.after).toEqual({ ok: true, value: before })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
})
