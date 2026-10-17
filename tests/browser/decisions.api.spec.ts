import { expect, test, type Page } from '@playwright/test'
import type { ReviewOperation } from '../../src/demo'
import { loseNextWriteCompletion, refuseCommitNotices } from './storage-faults'

test.describe.configure({ mode: 'parallel' })

async function start(page: Page) {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(async () => { await window.demo.startup(); await window.demo.signIn('salma') })
}

async function ready(page: Page, id = 'RIFD-2026-007') {
  return page.evaluate(async id => {
    const demo = window.demo
    const context = await demo.context()
    const result = await demo.readApplication(id)
    if (!context.ok || !context.value.session || !result.ok || result.value.role !== 'reviewer') throw new Error('No review')
    let view = result.value
    const run = async (edit: Record<string, unknown>) => {
      const result = await demo.execute({ datasetId: context.value.datasetId, applicationId: id, operationId: crypto.randomUUID(), expectedSharedRevision: view.sharedRevision, ...edit } as ReviewOperation)
      if (!result.ok || result.value.application.role !== 'reviewer') throw new Error(JSON.stringify(result))
      view = result.value.application
    }
    if (!view.assignedToYou) await run({ kind: 'claimApplication' })
    if (view.status === 'submitted') await run({ kind: 'startReview' })
    for (const document of view.documents) await run({ kind: 'assessDocument', slot: document.slot, fileId: document.file?.id, inspection: { kind: 'inspected', confirmed: true, contextToken: view.inspectionContexts[document.slot]! }, status: 'accepted', reason: null })
    for (const check of ['evidence', 'operatingHistory', 'purpose', 'budget', 'capacity']) await run({ kind: 'recordCheck', check, outcome: 'passed' })
    return { view, command: { kind: 'approve' as const, datasetId: context.value.datasetId, applicationId: id, operationId: 'decision', expectedSharedRevision: view.sharedRevision, confirmed: true as const, confirmationSessionId: context.value.session.sessionId, reason: { ar: 'استوفى الطلب معايير التمويل.', en: 'The application meets the financing criteria.' } } }
  }, id)
}

for (const kind of ['approve', 'reject'] as const) test(`${kind} refuses all ineligible states and actors without a decision receipt or effects`, async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async kind => {
    const demo = window.demo
    const context = await demo.context()
    if (!context.ok || !context.value.session) throw new Error('No staff session')
    const base = { datasetId: context.value.datasetId, kind, reason: { ar: 'سبب القرار', en: 'Decision reason' }, confirmed: true as const, confirmationSessionId: context.value.session.sessionId }
    const states = []
    for (const id of ['001', '002', '003', '011', '007', '008', '004', '013', '005', '006']) {
      const applicationId = `RIFD-2026-${id}`
      const before = await demo.readApplication(applicationId)
      const command = { ...base, applicationId, expectedSharedRevision: before.ok ? before.value.sharedRevision : 1, operationId: `${kind}-${id}` }
      states.push({ id, before, outcome: await demo.execute(command), inspection: await demo.inspectOperation(command), after: await demo.readApplication(applicationId) })
    }
    const beforeActors = await demo.readApplication('RIFD-2026-007')
    const actors = []
    for (const identity of [null, 'mariam', 'huda'] as const) {
      if (identity) await demo.signIn(identity)
      else await demo.signOut()
      const current = await demo.context()
      const before = await demo.readApplication('RIFD-2026-007')
      const command = { ...base, confirmationSessionId: current.ok && current.value.session ? current.value.session.sessionId : base.confirmationSessionId, applicationId: 'RIFD-2026-007', expectedSharedRevision: 1, operationId: `${kind}-${identity}` }
      actors.push({ identity, before, outcome: await demo.execute(command), after: await demo.readApplication(command.applicationId) })
    }
    await demo.signIn('salma')
    return { states, actors, beforeActors, afterActors: await demo.readApplication('RIFD-2026-007') }
  }, kind)
  const errors: Record<string, string> = { '001': 'unavailable', '002': 'permissionDenied', '003': 'invalidState', '011': 'permissionDenied', '007': 'validation', '008': 'permissionDenied', '004': 'invalidState', '013': 'permissionDenied', '005': 'invalidState', '006': 'invalidState' }
  for (const state of result.states) {
    expect(state.outcome, `${kind} ${state.id}`).toMatchObject({ ok: false, error: { kind: errors[state.id] } })
    expect(state.after).toEqual(state.before)
    if (state.before.ok) expect(state.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
    else expect(state.inspection.ok).toBe(false)
  }
  for (const actor of result.actors) {
    expect(actor.outcome, `${kind} ${actor.identity}`).toMatchObject({ ok: false, error: { kind: actor.identity === null ? 'sessionExpired' : actor.identity === 'mariam' ? 'permissionDenied' : 'unavailable' } })
    expect(actor.after).toEqual(actor.before)
  }
  expect(result.afterActors).toEqual(result.beforeActors)
})

test('a complete initial submission is approved once with exact frozen terms and durable applicant effects', async ({ page }) => {
  await page.clock.install()
  await start(page)
  await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.signIn('mariam')
    const draft = await demo.readApplication('RIFD-2026-001')
    if (!context.ok || !draft.ok || draft.value.role !== 'applicant' || !draft.value.workspace) throw new Error('No draft')
    const submitted = await demo.execute({ kind: 'submit', datasetId: context.value.datasetId, operationId: 'submit', applicationId: draft.value.id, expectedWorkspaceRevision: draft.value.workspace.revision, expectedSharedRevision: draft.value.sharedRevision, product: draft.value.product, fields: { ...draft.value.snapshot.fields, amount: '100010', term: '6', explanation: 'Purchase fictional inventory for the store.' }, documents: Object.fromEntries(Object.entries(draft.value.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../src/demo').DraftDocuments })
    if (!submitted.ok) throw new Error(JSON.stringify(submitted))
    await demo.signIn('salma')
  })
  const { command } = await ready(page, 'RIFD-2026-001')
  await page.evaluate(refuseCommitNotices)
  const result = await page.evaluate(async command => {
    const demo = window.demo
    const approved = await demo.execute(command as unknown as ReviewOperation)
    const replay = await demo.execute(command as unknown as ReviewOperation)
    const misuse = await demo.execute({ ...command, reason: { ar: 'سبب آخر', en: 'Changed reason' } } as unknown as ReviewOperation)
    await demo.signIn('mariam')
    return { approved, replay, misuse, applicant: await demo.readApplication(command.applicationId), notices: await demo.readNotifications(), print: await demo.readPrintSummary(command.applicationId) }
  }, command)
  expect(result.approved).toMatchObject({ ok: true, value: { receipt: { kind: 'approve' }, application: { status: 'approved', repayment: { amount: 100010, term: 6, product: 'inventory', ruleVersion: 1, approvedAt: '2026-10-14', markup: 5001, total: 105011, completed: 0, remaining: 105011, rows: [
    { due: '2026-11-15', amount: 17501, status: 'upcoming' }, { due: '2026-12-15', amount: 17501, status: 'upcoming' }, { due: '2027-01-15', amount: 17501, status: 'upcoming' }, { due: '2027-02-15', amount: 17501, status: 'upcoming' }, { due: '2027-03-15', amount: 17501, status: 'upcoming' }, { due: '2027-04-15', amount: 17506, status: 'upcoming' },
  ] } } } })
  expect(result.replay).toEqual(result.approved)
  expect(result.misuse).toMatchObject({ error: { kind: 'identifierMisuse' } })
  expect(result.applicant).toMatchObject({ value: { status: 'approved', history: expect.arrayContaining([{ id: expect.any(String), sequence: expect.any(Number), date: '2026-10-14', kind: 'approved', reason: command.reason }]) } })
  expect(result.notices.ok && result.notices.value.filter(notice => notice.applicationId === command.applicationId && notice.kind === 'approved')).toHaveLength(1)
  expect(result.print).toMatchObject({ value: { status: 'approved', history: expect.arrayContaining([expect.objectContaining({ kind: 'approved', reason: command.reason })]) } })
  await page.reload(); await page.waitForFunction(() => window.demo)
  const restored = await page.evaluate(async id => { await window.demo.startup(); return window.demo.readApplication(id) }, command.applicationId)
  expect(restored).toEqual(result.applicant)
  const renewedReplay = await page.evaluate(async command => {
    const context = await window.demo.signIn('salma')
    if (!context.ok || !context.value.session) throw new Error('No renewed session')
    return window.demo.execute({ ...command, confirmationSessionId: context.value.session.sessionId })
  }, command)
  expect(renewedReplay).toEqual(result.approved)
  await page.clock.setSystemTime(new Date('2035-06-20T12:00:00Z'))
  const later = await page.evaluate(async id => {
    const modulePath = '/src/domain/index.ts'
    const { products } = await import(/* @vite-ignore */ modulePath) as typeof import('../../src/domain')
    products.inventory.markupPercent = 99
    products.inventory.terms = [12]
    await window.demo.signIn('mariam')
    return window.demo.readApplication(id)
  }, command.applicationId)
  expect(later).toEqual(result.applicant)
})

test('a corrected response needs explicit current-target verification before approval', async ({ page }) => {
  await start(page)
  await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.signIn('huda')
    const before = await demo.readApplication('RIFD-2026-004')
    if (!context.ok || !before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('No correction response')
    const workspace = before.value.workspace
    const fields = { ...workspace.snapshot.fields, amount: '450000' }
    const prepared = await demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: before.value.id, slot: 'purchase', selectionId: 'response', source: { kind: 'generated', fields } })
    if (!prepared.ok) throw new Error('No plan')
    const published = await demo.execute({ kind: 'resubmit', datasetId: context.value.datasetId, applicationId: before.value.id, operationId: 'resubmit', roundId: workspace.roundId!, expectedWorkspaceRevision: workspace.revision, expectedSharedRevision: before.value.sharedRevision, product: before.value.product, fields, documents: { ...Object.fromEntries(Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])), purchase: { kind: 'prepared', attachment: prepared.value } } as import('../../src/demo').DraftDocuments })
    if (!published.ok) throw new Error(JSON.stringify(published))
    await demo.signIn('salma')
  })
  const { command, view } = await ready(page, 'RIFD-2026-004')
  const result = await page.evaluate(async ({ command, roundId }) => {
    const demo = window.demo
    const refused = await demo.execute(command)
    const verified = await demo.execute({ kind: 'verifyCorrection', datasetId: command.datasetId, applicationId: command.applicationId, operationId: 'verify', expectedSharedRevision: command.expectedSharedRevision, roundId, field: 'amount', verified: true })
    if (!verified.ok) throw new Error('Verification failed')
    const approved = await demo.execute({ ...command, expectedSharedRevision: verified.value.application.sharedRevision })
    return { refused, approved }
  }, { command, roundId: view.rounds.at(-1)!.id })
  expect(result.refused).toMatchObject({ error: { kind: 'validation' } })
  expect(result.approved).toMatchObject({ value: { application: { status: 'approved', repayment: { amount: 450000, term: 6, markup: 22500, total: 472500, rows: expect.arrayContaining([{ due: '2026-11-15', amount: 78750, status: 'upcoming' }, { due: '2027-04-15', amount: 78750, status: 'upcoming' }]) } } } })
})

test('a new young business submits normally and is rejected on operating history with incomplete review', async ({ page }) => {
  await start(page)
  const command = await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.signIn('omar')
    const draft = await demo.newDraft('inventory')
    if (!context.ok || !draft.ok || !draft.value.workspace) throw new Error('No new draft')
    const fields = { ...draft.value.snapshot.fields, businessName: 'متجر تجريبي جديد', activity: 'retail' as const, address: 'شارع السوق، عدن', operatingSince: '2026-08', revenue: '700000', expenses: '500000', amount: '100010', term: '6', budget: '250000', explanation: 'Purchase stock for a new fictional retail business.' }
    const documents = {} as import('../../src/demo').DraftDocuments
    for (const slot of ['identity', 'business', 'financial', 'purchase'] as const) {
      const prepared = await demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: draft.value.id, slot, selectionId: slot, source: { kind: 'generated', fields } })
      if (!prepared.ok) throw new Error('No evidence')
      documents[slot] = { kind: 'prepared', attachment: prepared.value }
    }
    const submitted = await demo.execute({ kind: 'submit', datasetId: context.value.datasetId, applicationId: draft.value.id, operationId: 'submit-new', expectedWorkspaceRevision: 0, expectedSharedRevision: 1, product: 'inventory', fields, documents })
    if (!submitted.ok) throw new Error(JSON.stringify(submitted))
    const staff = await demo.signIn('salma')
    if (!staff.ok || !staff.value.session) throw new Error('No reviewer')
    const base = { datasetId: context.value.datasetId, applicationId: draft.value.id }
    for (const [index, kind] of (['claimApplication', 'startReview'] as const).entries()) {
      const result = await demo.execute({ ...base, kind, operationId: kind, expectedSharedRevision: 2 + index })
      if (!result.ok) throw new Error(JSON.stringify(result))
    }
    const failed = await demo.execute({ ...base, kind: 'recordCheck', operationId: 'failed', expectedSharedRevision: 4, check: 'operatingHistory', outcome: 'failed' })
    if (!failed.ok) throw new Error('No failed criterion')
    return { ...base, kind: 'reject' as const, operationId: 'reject-new', expectedSharedRevision: 5, confirmed: true as const, confirmationSessionId: staff.value.session.sessionId, reason: { ar: 'مدة النشاط شهران، والحد الأدنى ستة أشهر.', en: 'The business has operated for two months; six months are required.' } }
  })
  await page.evaluate(refuseCommitNotices)
  const result = await page.evaluate(async command => {
    const rejected = await window.demo.execute(command)
    await window.demo.signIn('omar')
    return { rejected, notices: await window.demo.readNotifications(), view: await window.demo.readApplication(command.applicationId) }
  }, command)
  expect(result.rejected).toMatchObject({ value: { application: { status: 'rejected', repayment: null, checks: { operatingHistory: 'failed', evidence: 'unchecked' }, assessments: { financial: { status: 'awaitingReview' } } } } })
  expect(result.view).toMatchObject({ value: { history: expect.arrayContaining([expect.objectContaining({ kind: 'rejected', reason: command.reason })]) } })
  expect(result.notices.ok && result.notices.value.filter(notice => notice.applicationId === command.applicationId)).toHaveLength(1)
})

test('prerequisites, current session confirmation and assignment are checked before consuming failure', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.context()
    const before = await demo.readApplication('RIFD-2026-007')
    if (!context.ok || !context.value.session || !before.ok) throw new Error('No review')
    const base = { datasetId: context.value.datasetId, applicationId: before.value.id, expectedSharedRevision: before.value.sharedRevision, operationId: 'refused', confirmationSessionId: context.value.session.sessionId, confirmed: true as const, reason: { ar: 'سبب القرار', en: 'Decision reason' } }
    demo.setControls({ slow: false, failure: 'storage' })
    const approve = await demo.execute({ ...base, kind: 'approve' })
    const reject = await demo.execute({ ...base, kind: 'reject' })
    const evidence = await demo.execute({ datasetId: base.datasetId, applicationId: base.applicationId, expectedSharedRevision: base.expectedSharedRevision, kind: 'recordCheck', check: 'evidence', outcome: 'failed', operationId: 'evidence' })
    // The armed failure is consumed by this eligible assessment, which aborts.
    const missing = await demo.execute({ ...base, kind: 'reject', confirmed: false } as unknown as ReviewOperation)
    return { approve, reject, evidence, missing, after: await demo.readApplication(before.value.id), before }
  })
  for (const refusal of [result.approve, result.reject, result.missing]) expect(refusal).toMatchObject({ error: { kind: 'validation' } })
  expect(result.evidence).toMatchObject({ error: { kind: 'storage' } })
  expect(result.after).toEqual(result.before)
  const { command, view } = await ready(page)
  const failures = await page.evaluate(async command => {
    const demo = window.demo
    const empty = await demo.execute({ ...command, reason: { ar: ' ', en: ' ' } })
    const unconfirmed = await demo.execute({ ...command, confirmed: false } as unknown as ReviewOperation)
    await demo.signIn('salma')
    const expired = await demo.execute(command)
    const current = await demo.context()
    if (!current.ok || !current.value.session) throw new Error('No session')
    const transfer = await demo.execute({ kind: 'transferApplication', datasetId: command.datasetId, applicationId: command.applicationId, expectedSharedRevision: command.expectedSharedRevision, operationId: 'transfer', from: 'salma', to: 'khaled', confirmed: true })
    if (!transfer.ok) throw new Error('No transfer')
    const stale = await demo.execute({ ...command, confirmationSessionId: current.value.session.sessionId })
    const colleague = await demo.execute({ ...command, confirmationSessionId: current.value.session.sessionId, expectedSharedRevision: transfer.value.application.sharedRevision })
    return { empty, unconfirmed, expired, stale, colleague }
  }, command)
  for (const refusal of [failures.empty, failures.unconfirmed, failures.expired]) expect(refusal).toMatchObject({ error: { kind: 'validation' } })
  expect(failures.stale).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(failures.colleague).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(view.status).toBe('underReview')
})

for (const kind of ['approve', 'reject'] as const) test(`${kind} rollback, unknown completion, replay and terminal locks preserve a single outcome`, async ({ page }) => {
  await start(page)
  const setup = await ready(page)
  if (kind === 'reject') await page.evaluate(async command => {
    const result = await window.demo.execute({ kind: 'recordCheck', datasetId: command.datasetId, applicationId: command.applicationId, expectedSharedRevision: command.expectedSharedRevision, operationId: 'fail-purpose', check: 'purpose', outcome: 'failed' })
    if (!result.ok) throw new Error('No failed criterion')
  }, setup.command)
  const command = { ...setup.command, kind, expectedSharedRevision: setup.command.expectedSharedRevision + (kind === 'reject' ? 1 : 0) }
  const failed = await page.evaluate(async command => {
    const demo = window.demo
    const before = await demo.readApplication(command.applicationId)
    demo.setControls({ slow: false, failure: 'storage' })
    return { result: await demo.execute(command), before, after: await demo.readApplication(command.applicationId), inspection: await demo.inspectOperation(command) }
  }, command)
  expect(failed.result).toMatchObject({ error: { kind: 'storage' } })
  expect(failed.after).toEqual(failed.before)
  expect(failed.inspection).toMatchObject({ value: { status: 'notCommitted' } })
  await page.evaluate(loseNextWriteCompletion)
  expect(await page.evaluate(command => window.demo.execute(command), command)).toMatchObject({ error: { kind: 'outcomeUnknown' } })
  const result = await page.evaluate(async command => {
    const demo = window.demo
    const inspection = await demo.inspectOperation(command)
    const replay = await demo.execute(command)
    const changed = await demo.execute({ ...command, reason: { ar: 'سبب مختلف', en: 'A different decision reason' } })
    if (!replay.ok || replay.value.application.role !== 'reviewer') throw new Error('No outcome')
    const view = replay.value.application
    const base = { datasetId: command.datasetId, applicationId: view.id, expectedSharedRevision: view.sharedRevision, operationId: 'locked' }
    const edits: Record<string, unknown>[] = [{ kind: 'recordCheck', check: 'purpose', outcome: 'passed' }, { kind: 'assessDocument', slot: 'identity', fileId: view.snapshot.documents.identity, inspection: { kind: 'inspected', confirmed: true, contextToken: view.inspectionContexts.identity! }, status: 'accepted', reason: null }, { kind: 'verifyCorrection', roundId: 'old', field: 'amount', verified: true }, { kind: 'transferApplication', from: 'salma', to: 'khaled', confirmed: true }, { kind: 'unassignApplication' }, { ...command, operationId: 'new-final', expectedSharedRevision: view.sharedRevision }, { kind: 'requestCorrections', targets: [{ kind: 'field', field: 'amount', reason: command.reason }], confirmed: true }]
    const refused = []
    for (const edit of edits) refused.push(await demo.execute({ ...base, ...edit } as ReviewOperation))
    const note = await demo.execute({ ...base, kind: 'saveNote', operationId: 'final-note', text: { ar: 'ملاحظة خاصة بعد القرار', en: 'Private note after the decision' } })
    const after = await demo.readApplication(view.id)
    await demo.signIn('mariam')
    const notices = await demo.readNotifications()
    const applicant = await demo.readApplication(view.id)
    return { inspection, replay, changed, refused, note, after, notices, applicant }
  }, command)
  expect(result.inspection).toMatchObject({ value: { status: 'committed', result: result.replay.ok ? result.replay.value : null } })
  expect(result.changed).toMatchObject({ ok: false, error: { kind: 'identifierMisuse' } })
  for (const refusal of result.refused) expect(refusal).toMatchObject({ ok: false })
  expect(result.note).toMatchObject({ ok: true })
  if (!result.replay.ok || !result.after.ok || !result.applicant.ok) throw new Error('No final view')
  expect(result.after.value.repayment).toEqual(result.replay.value.application.repayment)
  expect(result.after.value.history).toEqual(result.replay.value.application.history)
  expect('notes' in result.applicant.value).toBe(false)
  expect(result.notices.ok && result.notices.value.filter(notice => notice.applicationId === command.applicationId && notice.kind === (kind === 'approve' ? 'approved' : 'rejected'))).toHaveLength(1)
})

test('every document and check can block approval, and evidence failure alone never enables rejection', async ({ page }) => {
  await start(page)
  const { command } = await ready(page)
  const result = await page.evaluate(async command => {
    const demo = window.demo
    let revision = command.expectedSharedRevision
    const edit = async (value: Record<string, unknown>) => {
      const result = await demo.execute({ datasetId: command.datasetId, applicationId: command.applicationId, operationId: crypto.randomUUID(), expectedSharedRevision: revision, ...value } as ReviewOperation)
      if (!result.ok) throw new Error(JSON.stringify(result))
      revision = result.value.application.sharedRevision
    }
    const decisions = []
    for (const check of ['evidence', 'operatingHistory', 'purpose', 'budget', 'capacity']) {
      await edit({ kind: 'recordCheck', check, outcome: 'unchecked' })
      decisions.push(await demo.execute({ ...command, expectedSharedRevision: revision }))
      await edit({ kind: 'recordCheck', check, outcome: 'passed' })
    }
    const view = await demo.readApplication(command.applicationId)
    if (!view.ok || view.value.role !== 'reviewer') throw new Error('No review')
    for (const slot of ['identity', 'business', 'financial', 'purchase'] as const) {
      await edit({ kind: 'assessDocument', slot, fileId: view.value.snapshot.documents[slot], inspection: { kind: 'inspected', confirmed: true, contextToken: view.value.inspectionContexts[slot]! }, status: 'needsReplacement', reason: command.reason })
      decisions.push(await demo.execute({ ...command, expectedSharedRevision: revision }))
      await edit({ kind: 'assessDocument', slot, fileId: view.value.snapshot.documents[slot], inspection: { kind: 'inspected', confirmed: true, contextToken: view.value.inspectionContexts[slot]! }, status: 'accepted', reason: null })
    }
    await edit({ kind: 'recordCheck', check: 'evidence', outcome: 'failed' })
    const rejected = await demo.execute({ ...command, kind: 'reject', expectedSharedRevision: revision })
    const after = await demo.readApplication(command.applicationId)
    return { decisions, rejected, after }
  }, command)
  for (const refused of [...result.decisions, result.rejected]) expect(refused).toMatchObject({ error: { kind: 'validation' } })
  expect(result.after).toMatchObject({ value: { status: 'underReview', repayment: null } })
})

test('expiry during a pending decision leaves the review unchanged and requires a new confirmation', async ({ page }) => {
  await start(page)
  const { command, view } = await ready(page)
  const result = await page.evaluate(async command => {
    const demo = window.demo
    demo.setControls({ slow: true, failure: null })
    const pending = demo.execute(command)
    demo.expireSession()
    const expired = await pending
    demo.setControls({ slow: false, failure: null })
    await demo.signIn('salma')
    return { expired, oldConfirmation: await demo.execute(command), after: await demo.readApplication(command.applicationId), inspection: await demo.inspectOperation(command) }
  }, command)
  expect(result.expired).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(result.oldConfirmation).toMatchObject({ error: { kind: 'validation' } })
  expect(result.after).toEqual({ ok: true, value: view })
  expect(result.inspection).toMatchObject({ value: { status: 'notCommitted' } })
})

test('two reviewer tabs cannot commit competing final outcomes from the same revision', async ({ page, context }) => {
  await start(page)
  const { command } = await ready(page)
  const other = await context.newPage()
  await start(other)
  const otherSession = await other.evaluate(() => window.demo.context())
  if (!otherSession.ok || !otherSession.value.session) throw new Error('No other session')
  const results = await Promise.all([
    page.evaluate(command => window.demo.execute(command), command),
    other.evaluate(command => window.demo.execute(command), { ...command, operationId: 'competing-decision', confirmationSessionId: otherSession.value.session.sessionId }),
  ])
  expect(results.filter(result => result.ok)).toHaveLength(1)
  expect(results.filter(result => !result.ok)).toEqual([{ ok: false, error: { kind: 'staleRecord', key: 'error.staleRecord' } }])
  const applicant = await page.evaluate(async id => { await window.demo.signIn('mariam'); return { view: await window.demo.readApplication(id), notices: await window.demo.readNotifications() } }, command.applicationId)
  expect(applicant.view.ok && applicant.view.value.history.filter(event => event.kind === 'approved')).toHaveLength(1)
  expect(applicant.notices.ok && applicant.notices.value.filter(notice => notice.applicationId === command.applicationId && notice.kind === 'approved')).toHaveLength(1)
})
