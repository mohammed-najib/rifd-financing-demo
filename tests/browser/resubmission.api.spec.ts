import { expect, test, type Page } from '@playwright/test'
import { loseNextWriteCompletion } from './storage-faults'

test.describe.configure({ mode: 'parallel' })

async function response(page: Page, id = 'RIFD-2026-004') {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  return page.evaluate(async id => {
    const demo = window.demo
    await demo.startup()
    const session = await demo.signIn('huda')
    const before = await demo.readApplication(id)
    if (!session.ok || !before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('No workspace')
    const view = before.value
    const slot = id === 'RIFD-2026-004' ? 'purchase' : 'financial'
    const prepared = await demo.prepareAttachment({ datasetId: session.value.datasetId, applicationId: id, slot, selectionId: 'response', source: { kind: 'local', file: new File(['fictional response evidence'], 'DEMO-response.png', { type: 'image/png' }) } })
    if (!prepared.ok) throw new Error('No file')
    const command = {
      kind: 'resubmit' as const, datasetId: session.value.datasetId, applicationId: id, operationId: 'resubmit',
      expectedWorkspaceRevision: view.workspace!.revision, expectedSharedRevision: view.sharedRevision, roundId: view.workspace!.roundId!,
      product: view.product, fields: { ...view.workspace!.snapshot.fields, ...(id === 'RIFD-2026-004' ? { amount: '450000' } : {}) },
      documents: { ...Object.fromEntries(Object.entries(view.workspace!.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])), [slot]: { kind: 'prepared', attachment: prepared.value } } as import('../../src/demo').DraftDocuments,
    }
    return { before: view, command, prepared: prepared.value, notices: await demo.readNotifications() }
  }, id)
}

test('publishes Huda’s complete response once, preserves review context and resets exactly four dependent checks', async ({ page, context }) => {
  const setup = await response(page)
  const staff = await context.newPage()
  await staff.goto('/tests/browser/api.html'); await staff.waitForFunction(() => window.demo)
  const before = await staff.evaluate(async () => {
    await window.demo.startup(); await window.demo.signIn('salma')
    return window.demo.readApplication('RIFD-2026-004')
  })
  const result = await page.evaluate(async command => ({ published: await window.demo.execute(command), replay: await window.demo.execute(command), notices: await window.demo.readNotifications() }), setup.command)
  expect(result.published).toMatchObject({ ok: true, value: { receipt: { kind: 'resubmit', sharedRevision: 2, workspaceRevision: 2 }, application: { status: 'underReview', workspace: null, snapshot: { fields: { amount: '450000' }, documents: { purchase: setup.prepared.id } } } } })
  expect(result.replay).toEqual(result.published)
  expect(result.notices).toEqual(setup.notices)
  const after = await staff.evaluate(() => window.demo.readApplication('RIFD-2026-004'))
  if (!before.ok || before.value.role !== 'reviewer' || !after.ok || after.value.role !== 'reviewer') throw new Error('No review')
  expect(after.value).toMatchObject({ assignment: before.value.assignment, submittedAt: before.value.submittedAt, evidenceMonths: before.value.evidenceMonths, checks: { evidence: 'unchecked', operatingHistory: 'passed', purpose: 'unchecked', budget: 'unchecked', capacity: 'unchecked' }, assessments: { ...before.value.assessments, purchase: { status: 'awaitingReview', reason: null } } })
  expect(after.value.rounds[0]).toMatchObject({ baseline: before.value.rounds[0].baseline, response: after.value.snapshot, targets: before.value.rounds[0].targets })
  expect(after.value.history.filter(event => event.kind === 'resubmitted')).toHaveLength(1)
  expect(after.value.activity.filter(event => event.kind === 'resubmitted')).toHaveLength(1)
  await page.reload(); await page.waitForFunction(() => window.demo)
  expect(await page.evaluate(async () => { await window.demo.startup(); return window.demo.readApplication('RIFD-2026-004') })).toMatchObject({ ok: true, value: { workspace: null, status: 'underReview' } })
})

test('field verification is separate from accepting evidence and a later round supersedes an unsuitable response', async ({ page }) => {
  const { command } = await response(page)
  const result = await page.evaluate(async command => {
    const demo = window.demo
    await demo.execute(command)
    await demo.signIn('salma')
    const read = async () => {
      const result = await demo.readApplication(command.applicationId)
      if (!result.ok || result.value.role !== 'reviewer') throw new Error('No review')
      return result.value
    }
    const review = async (edit: object) => demo.execute({ datasetId: command.datasetId, applicationId: command.applicationId, operationId: crypto.randomUUID(), expectedSharedRevision: (await read()).sharedRevision, ...edit } as import('../../src/demo').ReviewOperation)
    const unrequested = await review({ kind: 'verifyCorrection', roundId: command.roundId, field: 'mobile', verified: true })
    const verified = await review({ kind: 'verifyCorrection', roundId: command.roundId, field: 'amount', verified: true })
    const fileId = (await read()).snapshot.documents.purchase!
    await review({ kind: 'assessDocument', slot: 'purchase', fileId, status: 'accepted', reason: null })
    const accepted = await read()
    await review({ kind: 'assessDocument', slot: 'purchase', fileId, status: 'needsReplacement', reason: { ar: 'مستند غير مناسب', en: 'Still unsuitable evidence' } })
    const insufficient = await read()
    await review({ kind: 'requestCorrections', confirmed: true, targets: [{ kind: 'document', slot: 'purchase', reason: { ar: 'أضف تفاصيل', en: 'Include purchase details' } }] })
    const next = await read()
    const paused = await review({ kind: 'verifyCorrection', roundId: command.roundId, field: 'amount', verified: false })
    await demo.signIn('huda')
    const own = await demo.readApplication(command.applicationId)
    if (!own.ok || own.value.role !== 'applicant' || !own.value.workspace) throw new Error('No response')
    const workspace = own.value.workspace
    const prepared = await demo.prepareAttachment({ datasetId: command.datasetId, applicationId: command.applicationId, slot: 'purchase', selectionId: 'second', source: { kind: 'local', file: new File(['another complete fictional plan'], 'DEMO-second.png', { type: 'image/png' }) } })
    if (!prepared.ok) throw new Error('No file')
    const published = await demo.execute({ ...command, operationId: 'second-resubmit', roundId: workspace.roundId!, expectedSharedRevision: own.value.sharedRevision, expectedWorkspaceRevision: workspace.revision, fields: workspace.snapshot.fields, documents: { ...command.documents, purchase: { kind: 'prepared', attachment: prepared.value } } })
    await demo.signIn('salma')
    await review({ kind: 'assessDocument', slot: 'purchase', fileId: prepared.value.id, status: 'accepted', reason: null })
    return { unrequested, verified, accepted, insufficient, next, paused, published, final: await read(), applicant: own.value }
  }, command)
  expect(result.unrequested).toMatchObject({ error: { kind: 'validation' } })
  expect(result.verified).toMatchObject({ ok: true })
  expect(result.accepted.rounds[0].targets.map(target => target.verified)).toEqual([true, true])
  expect(result.insufficient.rounds[0].targets.map(target => target.verified)).toEqual([true, false])
  expect(result.next.rounds[1].baseline).toEqual(result.insufficient.snapshot)
  expect(result.next.rounds[0]).toMatchObject({ responseAssessments: result.insufficient.assessments })
  expect(result.applicant.rounds[0]).not.toHaveProperty('responseAssessments')
  expect(result.paused).toMatchObject({ error: { kind: 'invalidState' } })
  expect(result.published).toMatchObject({ ok: true, value: { application: { workspace: null, status: 'underReview' } } })
  expect(result.final.rounds[0]).toEqual(result.next.rounds[0])
  expect(result.final.rounds[1].targets[0].verified).toBe(true)
})

test('simultaneous resubmissions in two tabs commit one response and refuse the other intent', async ({ page, context }) => {
  const { command } = await response(page)
  const saved = await page.evaluate(command => {
    const { expectedSharedRevision: _revision, ...save } = command
    void _revision
    return window.demo.execute({ ...save, kind: 'saveCorrections', operationId: 'save-ready' })
  }, command)
  if (!saved.ok || saved.value.application.role !== 'applicant' || !saved.value.application.workspace) throw new Error('No saved response')
  const workspace = saved.value.application.workspace
  const publish = { ...command, expectedWorkspaceRevision: workspace.revision, documents: Object.fromEntries(Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved' as const, fileId }])) as import('../../src/demo').DraftDocuments }
  const other = await context.newPage()
  await other.goto('/tests/browser/api.html'); await other.waitForFunction(() => window.demo)
  await other.evaluate(async () => { await window.demo.startup(); await window.demo.signIn('huda') })
  const outcomes = await Promise.all([
    page.evaluate(command => window.demo.execute(command), publish),
    other.evaluate(command => window.demo.execute({ ...command, operationId: 'other-publication' }), publish),
  ])
  expect(outcomes.filter(result => result.ok)).toHaveLength(1)
  expect(outcomes.find(result => !result.ok)).toMatchObject({ error: { kind: 'staleWorkspace' } })
  expect(await page.evaluate(() => window.demo.readApplication('RIFD-2026-004'))).toMatchObject({ value: { sharedRevision: 2, status: 'underReview', workspace: null } })
})

test('expiry at publication commit aborts all effects and same-identity recovery inspects before retry', async ({ page }) => {
  const { command, before } = await response(page)
  const result = await page.evaluate(async command => {
    const demo = window.demo
    const put = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
      IDBObjectStore.prototype.put = put
      const request = put.apply(this, args)
      request.addEventListener('success', () => demo.expireSession(), { once: true })
      return request
    }
    const expired = await demo.execute(command)
    await demo.signIn('huda')
    return { expired, after: await demo.readApplication(command.applicationId), inspection: await demo.inspectOperation(command), retry: await demo.execute(command) }
  }, command)
  expect(result.expired).toMatchObject({ error: { kind: 'sessionExpired' } })
  expect(result.after).toEqual({ ok: true, value: before })
  expect(result.inspection).toMatchObject({ value: { status: 'notCommitted' } })
  expect(result.retry).toMatchObject({ ok: true })
})

test('refuses formatting-only fields, identical renamed bytes, invalid forms and unrequested edits before consuming submission failure', async ({ page }) => {
  const { before, command } = await response(page)
  const result = await page.evaluate(async ({ before, command }) => {
    const demo = window.demo
    demo.setControls({ slow: false, failure: 'submission' })
    const unchanged = await demo.execute({ ...command, fields: { ...command.fields, amount: '٦٠٠٬٠٠٠' } })
    const invalid = await demo.execute({ ...command, fields: { ...command.fields, amount: 'invalid' } })
    const forbidden = await demo.execute({ ...command, fields: { ...command.fields, mobile: '123456789' } })
    const product = await demo.execute({ ...command, product: 'equipment' })
    const round = await demo.execute({ ...command, roundId: 'obsolete' })
    const original = await demo.readFile(command.applicationId, before.snapshot.documents.purchase!)
    if (!original.ok) throw new Error('No baseline file')
    const identical = await demo.prepareAttachment({ datasetId: command.datasetId, applicationId: command.applicationId, slot: 'purchase', selectionId: 'renamed', source: { kind: 'local', file: new File([original.value.bytes], `DEMO-renamed.${original.value.name.split('.').at(-1)}`, { type: original.value.mime }) } })
    if (!identical.ok) throw new Error('No identical file')
    const renamed = await demo.execute({ ...command, documents: { ...command.documents, purchase: { kind: 'prepared', attachment: identical.value } } })
    const armed = demo.controls()
    const after = await demo.readApplication(command.applicationId)
    return { unchanged, invalid, forbidden, product, round, renamed, armed, after }
  }, { before, command })
  expect(result.unchanged).toMatchObject({ error: { kind: 'validation' } })
  expect(result.invalid).toMatchObject({ error: { kind: 'validation', fieldIssues: [{ field: 'amount' }] } })
  expect(result.forbidden).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(result.product).toMatchObject({ error: { kind: 'permissionDenied' } })
  expect(result.round).toMatchObject({ error: { kind: 'invalidState' } })
  expect(result.renamed).toMatchObject({ error: { kind: 'validation', slot: 'purchase' } })
  expect(result.armed.failure).toBe('submission')
  expect(result.after).toEqual({ ok: true, value: before })
})

test('missing evidence publishes as Awaiting review and only its dependent checks reset', async ({ page }) => {
  await response(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.signIn('salma')
    if (!context.ok) throw new Error('No session')
    const base = { datasetId: context.value.datasetId, applicationId: 'RIFD-2026-003' }
    await demo.execute({ ...base, kind: 'startReview', operationId: 'start', expectedSharedRevision: 1 })
    for (const [index, check] of (['operatingHistory', 'purpose', 'budget', 'capacity'] as const).entries()) await demo.execute({ ...base, kind: 'recordCheck', operationId: `check-${check}`, expectedSharedRevision: 2 + index, check, outcome: 'passed' })
    const requested = await demo.execute({ ...base, kind: 'requestCorrections', operationId: 'request', expectedSharedRevision: 6, confirmed: true, targets: [{ kind: 'document', slot: 'financial', reason: { ar: 'أضف المستند الناقص', en: 'Add missing financial evidence' } }] })
    await demo.signIn('huda')
    const before = await demo.readApplication(base.applicationId)
    if (!before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('No workspace')
    const workspace = before.value.workspace
    const prepared = await demo.prepareAttachment({ ...base, slot: 'financial', selectionId: 'missing', source: { kind: 'local', file: new File(['financial evidence'], 'DEMO-added.png', { type: 'image/png' }) } })
    if (!prepared.ok) throw new Error('No evidence')
    const command = { ...base, kind: 'resubmit' as const, operationId: 'missing-response', roundId: workspace.roundId!, expectedWorkspaceRevision: workspace.revision, expectedSharedRevision: before.value.sharedRevision, product: before.value.product, fields: workspace.snapshot.fields, documents: { ...Object.fromEntries(Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])), financial: { kind: 'prepared', attachment: prepared.value } } as import('../../src/demo').DraftDocuments }
    const published = await demo.execute(command)
    await demo.signIn('salma')
    return { requested, published, review: await demo.readApplication(base.applicationId) }
  })
  expect(result.requested).toMatchObject({ ok: true })
  expect(result.published).toMatchObject({ ok: true, value: { application: { status: 'underReview', workspace: null } } })
  expect(result.review).toMatchObject({ value: { checks: { evidence: 'unchecked', capacity: 'unchecked', operatingHistory: 'passed', purpose: 'passed', budget: 'passed' }, assessments: { financial: { status: 'awaitingReview', reason: null } }, rounds: [{ baseline: { documents: { financial: null } }, targets: [{ verified: false }] }] } })
})

test('publication abort, unknown completion and receipt replay never publish a partial response', async ({ page }) => {
  const setup = await response(page)
  const failed = await page.evaluate(async command => {
    const demo = window.demo
    demo.setControls({ slow: false, failure: 'storage' })
    return { result: await demo.execute(command), after: await demo.readApplication(command.applicationId), inspection: await demo.inspectOperation(command), file: await demo.readFile(command.applicationId, command.documents.purchase.kind === 'prepared' ? command.documents.purchase.attachment.id : '') }
  }, setup.command)
  expect(failed.result).toMatchObject({ error: { kind: 'storage' } })
  expect(failed.after).toEqual({ ok: true, value: setup.before })
  expect(failed.inspection).toMatchObject({ value: { status: 'notCommitted' } })
  expect(failed.file).toMatchObject({ error: { kind: 'unavailable' } })
  await page.evaluate(loseNextWriteCompletion)
  expect(await page.evaluate(command => window.demo.execute(command), setup.command)).toMatchObject({ error: { kind: 'outcomeUnknown' } })
  const recovered = await page.evaluate(async command => ({ inspection: await window.demo.inspectOperation(command), replay: await window.demo.execute(command), misuse: await window.demo.execute({ ...command, fields: { ...command.fields, amount: '400000' } }) }), setup.command)
  expect(recovered.inspection).toMatchObject({ value: { status: 'committed', result: recovered.replay.ok ? recovered.replay.value : null } })
  expect(recovered.misuse).toMatchObject({ error: { kind: 'identifierMisuse' } })
})

test('same-context publication races reject a competing private revision and preserve the current reassignment', async ({ page, context }) => {
  const { command } = await response(page)
  const other = await context.newPage()
  await other.goto('/tests/browser/api.html'); await other.waitForFunction(() => window.demo)
  await other.evaluate(async () => { await window.demo.startup(); await window.demo.signIn('huda') })
  const privateSave = await other.evaluate(async command => {
    const current = await window.demo.readApplication(command.applicationId)
    if (!current.ok || current.value.role !== 'applicant' || !current.value.workspace) throw new Error('No workspace')
    const { expectedSharedRevision: _revision, ...save } = command
    void _revision
    return window.demo.execute({ ...save, kind: 'saveCorrections', operationId: 'private-save', documents: Object.fromEntries(Object.entries(current.value.workspace.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../src/demo').DraftDocuments })
  }, command)
  expect(privateSave).toMatchObject({ ok: true })
  expect(await page.evaluate(command => window.demo.execute(command), command)).toMatchObject({ error: { kind: 'staleWorkspace' } })
  const staff = await context.newPage()
  await staff.goto('/tests/browser/api.html'); await staff.waitForFunction(() => window.demo)
  await staff.evaluate(async command => {
    await window.demo.startup(); await window.demo.signIn('salma')
    await window.demo.execute({ kind: 'transferApplication', datasetId: command.datasetId, applicationId: command.applicationId, operationId: 'transfer', expectedSharedRevision: command.expectedSharedRevision, from: 'salma', to: 'khaled', confirmed: true })
  }, command)
  expect(await page.evaluate(command => window.demo.execute({ ...command, expectedWorkspaceRevision: 2 }), command)).toMatchObject({ error: { kind: 'staleRecord' } })
  expect(await page.evaluate(command => window.demo.execute({ ...command, expectedWorkspaceRevision: 2, expectedSharedRevision: 2 }), command)).toMatchObject({ ok: true, value: { application: { status: 'underReview', sharedRevision: 3 } } })
  expect(await staff.evaluate(() => window.demo.readApplication('RIFD-2026-004'))).toMatchObject({ value: { assignedToYou: false, assignment: { en: 'Khaled Ali' } } })
})
