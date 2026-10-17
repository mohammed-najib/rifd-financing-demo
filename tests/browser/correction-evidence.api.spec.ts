import { expect, test } from '@playwright/test'

test('private correction checks bind actual reviewer reasons, permitted targets and initial submission context without financing effects', async ({ page }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixturePath = '/tests/browser/evidence-fixtures.ts', correctionPath = '/tests/browser/correction-evidence-fixtures.ts'
    const { identityDemo } = await import(fixturePath) as typeof import('./evidence-fixtures')
    const { requestIdentityCorrection, correctionApplicationId } = await import(correctionPath) as typeof import('./correction-evidence-fixtures')
    const requests: import('../../src/evidence-assistance/contract').StageRequest[] = []
    const transportPath = '/tests/browser/evidence-transport.ts'
    const { fakeEvidenceTransport } = await import(transportPath) as typeof import('./evidence-transport')
    const { demo } = await identityDemo(fakeEvidenceTransport(requests))
    const input = await requestIdentityCorrection(demo)
    const before = await demo.readApplication(correctionApplicationId), notices = await demo.readNotifications(), print = await demo.readPrintSummary(correctionApplicationId)
    const handle = demo.createEvidenceAssistance(input)
    const selected = await handle.inspect()
    await handle.run()
    return { before, after: await demo.readApplication(correctionApplicationId), notices, afterNotices: await demo.readNotifications(), print, afterPrint: await demo.readPrintSummary(correctionApplicationId), selected, state: handle.read(), request: requests[0] && { state: requests[0].state, dependencies: requests[0].dependencies } }
  })
  expect(result.state.status).toBe('completed')
  expect(result.before).toEqual(result.after)
  expect(result.notices).toEqual(result.afterNotices)
  expect(result.print).toEqual(result.afterPrint)
  if (!result.before.ok || result.before.value.role !== 'applicant' || !result.selected.ok) throw new Error('fixture')
  const round = result.before.value.rounds.at(-1)!
  expect(result.selected.value.binding).toMatchObject({ context: 'correction-workspace', contextId: round.id, roundId: round.id, durable: true })
  expect(result.state.result?.findings.nameSupport).toBe('different')
  expect(result.request.state).toMatchObject({ declaredApplicantName: result.before.value.workspace!.snapshot.fields.fullName, correction: { targets: round.targets, initialSubmissionMonth: result.before.value.submittedAt!.slice(0, 7) } })
  expect(JSON.stringify(result.request)).not.toContain('verified')
  for (const dependencies of Object.values(result.request.dependencies)) expect(dependencies).toContain('correction')
})

test('relevant edits, replacements and round publication fence late answers and separate each correction round', async ({ page }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixturePath = '/tests/browser/evidence-fixtures.ts', correctionPath = '/tests/browser/correction-evidence-fixtures.ts', transportPath = '/tests/browser/evidence-transport.ts'
    const { identityDemo, imageFile } = await import(fixturePath) as typeof import('./evidence-fixtures')
    const { requestIdentityCorrection, correctionCommand, prepareCorrectionIdentity } = await import(correctionPath) as typeof import('./correction-evidence-fixtures')
    const { nativeIdentity } = await import(transportPath) as typeof import('./evidence-transport')
    let held = false, dispatched = () => {}, release = (value: unknown) => { void value }
    const { demo } = await identityDemo({ evaluate() { if (!held) return Promise.resolve(nativeIdentity()); dispatched(); return new Promise(resolve => { release = resolve }) } })
    const input = await requestIdentityCorrection(demo, [{ kind: 'field', field: 'fullName', reason: { ar: 'صحح الاسم.', en: 'Correct the name.' } }])
    const handle = demo.createEvidenceAssistance(input); await handle.run(); const original = handle.read()
    const during = async (change: () => Promise<unknown>) => {
      held = true
      const sent = new Promise<void>(resolve => { dispatched = resolve })
      const pending = handle.run(); await sent
      await change(); release(nativeIdentity()); await pending; await handle.refresh()
      return handle.read()
    }
    const edited = await during(async () => {
      const saved = await demo.execute(await correctionCommand(demo, { fullName: 'Changed Fictional Name' }))
      if (!saved.ok) throw new Error(saved.error.kind)
    })
    const replaced = await during(async () => {
      const attachment = await prepareCorrectionIdentity(demo, await imageFile('image/png'))
      const saved = await demo.execute(await correctionCommand(demo, {}, attachment))
      if (!saved.ok) throw new Error(saved.error.kind)
    })
    const published = await during(async () => {
      const resubmitted = await demo.execute(await correctionCommand(demo, {}, undefined, 'resubmit'))
      if (!resubmitted.ok) throw new Error(resubmitted.error.kind)
    })
    const nextInput = await requestIdentityCorrection(demo)
    const next = demo.createEvidenceAssistance(nextInput); await next.inspect()
    const old = demo.createEvidenceAssistance(input); const refusedOldRound = await old.inspect()
    return { original, edited, replaced, published, nextInput, input, next: next.read(), refusedOldRound }
  })
  expect(result.original.result?.temporary).toBe(false)
  for (const state of [result.edited, result.replaced]) expect(state).toMatchObject({ status: 'unavailable', reason: 'stale', result: { id: result.original.result!.id, stale: true, findings: { category: 'unavailable', nameSupport: 'unavailable' } } })
  expect(result.published).toMatchObject({ status: 'unavailable', reason: 'unauthorized', result: null })
  expect(result.nextInput.roundId).not.toBe(result.input.roundId)
  expect(result.next.result).toBeNull()
  expect(result.refusedOldRound.ok).toBe(false)
})

for (const transition of ['sign-out', 'reset'] as const) test(`${transition} cancels pending private correction work without allowing a late answer to return`, async ({ page }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async transition => {
    const fixturePath = '/tests/browser/evidence-fixtures.ts', correctionPath = '/tests/browser/correction-evidence-fixtures.ts', transportPath = '/tests/browser/evidence-transport.ts'
    const { identityDemo } = await import(fixturePath) as typeof import('./evidence-fixtures')
    const { requestIdentityCorrection } = await import(correctionPath) as typeof import('./correction-evidence-fixtures')
    const { nativeIdentity } = await import(transportPath) as typeof import('./evidence-transport')
    let dispatched = () => {}, release = (value: unknown) => { void value }
    const { demo } = await identityDemo({ evaluate() { dispatched(); return new Promise(resolve => { release = resolve }) } })
    const input = await requestIdentityCorrection(demo)
    const handle = demo.createEvidenceAssistance(input)
    const sent = new Promise<void>(resolve => { dispatched = resolve })
    const pending = handle.run(); await sent
    if (transition === 'sign-out') await demo.signOut()
    else {
      const context = await demo.inspectReset()
      if (!context.ok) throw new Error('reset')
      const outcome = await demo.execute({ kind: 'resetDemo', context: context.value, confirmed: true, operationId: crypto.randomUUID() })
      if (!outcome.ok) throw new Error(outcome.error.kind)
    }
    release(nativeIdentity()); await pending
    const lost = handle.read(); handle.dispose()
    await demo.signIn('mariam')
    const restored = demo.createEvidenceAssistance(input); await restored.inspect()
    return { lost, restored: restored.read(), financing: await demo.readApplication(input.applicationId) }
  }, transition)
  expect(result.lost).toMatchObject({ status: 'unavailable', reason: 'unauthorized', result: null })
  expect(result.restored.result).toBeNull()
  expect(result.financing.ok).toBe(true)
})

test('ignoring suggestions cannot bypass a normalized field change after replacing the required evidence', async ({ page }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixturePath = '/tests/browser/evidence-fixtures.ts', correctionPath = '/tests/browser/correction-evidence-fixtures.ts'
    const { identityDemo, imageFile } = await import(fixturePath) as typeof import('./evidence-fixtures')
    const { requestIdentityCorrection, correctionCommand, prepareCorrectionIdentity } = await import(correctionPath) as typeof import('./correction-evidence-fixtures')
    const { demo } = await identityDemo()
    const input = await requestIdentityCorrection(demo, [{ kind: 'field', field: 'fullName', reason: { ar: 'صحح الاسم.', en: 'Correct the name.' } }])
    const view = await demo.readApplication(input.applicationId)
    if (!view.ok) throw new Error('view')
    const attachment = await prepareCorrectionIdentity(demo, await imageFile('image/png'))
    const handle = demo.createEvidenceAssistance({ ...input, attachment }); await handle.run(); const advice = handle.read(); handle.dispose()
    return { advice, outcome: await demo.execute(await correctionCommand(demo, { fullName: `  ${view.value.snapshot.fields.fullName}  ` }, attachment, 'resubmit')), after: await demo.readApplication(input.applicationId), before: view }
  })
  expect(result.advice.status).toBe('completed')
  expect(result.outcome).toMatchObject({ error: { kind: 'validation' } })
  expect(result.after).toEqual(result.before)
})

test('assistance cannot expand document-only permissions or satisfy unchanged correction targets', async ({ page }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixturePath = '/tests/browser/evidence-fixtures.ts', correctionPath = '/tests/browser/correction-evidence-fixtures.ts'
    const { identityDemo } = await import(fixturePath) as typeof import('./evidence-fixtures')
    const { requestIdentityCorrection, correctionCommand, prepareCorrectionIdentity } = await import(correctionPath) as typeof import('./correction-evidence-fixtures')
    const { demo } = await identityDemo()
    const input = await requestIdentityCorrection(demo)
    const before = await demo.readApplication(input.applicationId)
    const handle = demo.createEvidenceAssistance(input); await handle.run()
    const advice = handle.read(); handle.dispose()
    const forbidden = []
    for (const change of [{ declaredName: 'Forbidden name edit' }, { roundId: 'obsolete' }, { context: 'draft' as const }, { slot: 'business' as const }]) {
      const denied = demo.createEvidenceAssistance({ ...input, ...change }); forbidden.push(await denied.inspect()); denied.dispose()
    }
    const forbiddenSave = await demo.execute(await correctionCommand(demo, { fullName: 'Forbidden name edit' }))
    const unchanged = await demo.execute(await correctionCommand(demo, {}, undefined, 'resubmit'))
    const selected = before.ok && before.value.documents.find(document => document.slot === 'identity')?.file
    if (!selected) throw new Error('file')
    const source = await demo.readFile(input.applicationId, selected.id)
    if (!source.ok) throw new Error('source')
    const identical = await prepareCorrectionIdentity(demo, new File([source.value.bytes], 'another-name.png', { type: source.value.mime }))
    const sameContent = await demo.execute(await correctionCommand(demo, {}, identical, 'resubmit'))
    const after = await demo.readApplication(input.applicationId)
    await demo.signIn('huda')
    const other = demo.createEvidenceAssistance(input); const otherRead = await other.inspect(); other.dispose()
    await demo.signIn('salma')
    const staff = demo.createEvidenceAssistance(input); const staffRead = await staff.inspect(); staff.dispose()
    return { before, after, advice, forbidden, forbiddenSave, unchanged, sameContent, otherRead, staffRead }
  })
  expect(result.advice.status).toBe('completed')
  expect(result.forbidden.every(read => !read.ok)).toBe(true)
  expect(result.forbiddenSave).toMatchObject({ error: { kind: 'permissionDenied' } })
  for (const outcome of [result.unchanged, result.sameContent]) expect(outcome).toMatchObject({ error: { kind: 'validation', slot: 'identity' } })
  expect(result.before).toEqual(result.after)
  expect(result.otherRead.ok).toBe(false)
  expect(result.staffRead.ok).toBe(false)
})

test('prepared corrections and edited declarations remain temporary until matching Save and stay private after resubmission', async ({ page, context }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const initial = await page.evaluate(async () => {
    const fixturePath = '/tests/browser/evidence-fixtures.ts', correctionPath = '/tests/browser/correction-evidence-fixtures.ts'
    const { identityDemo, imageFile } = await import(fixturePath) as typeof import('./evidence-fixtures')
    const { requestIdentityCorrection, correctionCommand, prepareCorrectionIdentity } = await import(correctionPath) as typeof import('./correction-evidence-fixtures')
    const { demo } = await identityDemo()
    const input = await requestIdentityCorrection(demo, [{ kind: 'field', field: 'fullName', reason: { ar: 'صحح الاسم.', en: 'Correct the declared name.' } }])
    const before = await demo.readApplication(input.applicationId)
    const attachment = await prepareCorrectionIdentity(demo, await imageFile('image/png'))
    const declaredName = 'Private Fictional Applicant'
    const handle = demo.createEvidenceAssistance({ ...input, attachment, declaredName })
    await handle.run()
    const temporary = handle.read()
    const other = demo.createEvidenceAssistance({ ...input, attachment, declaredName }); await other.inspect()
    const absent = other.read(); other.dispose()
    const unchanged = await demo.readApplication(input.applicationId)
    const nonmatchingSave = await demo.execute(await correctionCommand(demo, {}, attachment))
    await handle.refresh(); const stillTemporary = handle.read()
    const save = await demo.execute(await correctionCommand(demo, { fullName: declaredName }))
    await handle.refresh(); const saved = handle.read(); handle.dispose()
    const reopened = demo.createEvidenceAssistance(input); await reopened.inspect(); const restored = reopened.read(); reopened.dispose()
    return { input, before, unchanged, temporary, absent, nonmatchingSave, stillTemporary, save, saved, restored, attachment, applicantPrint: await demo.readPrintSummary(input.applicationId) }
  })
  expect(initial.temporary.result?.temporary).toBe(true)
  expect(initial.absent.result).toBeNull()
  expect(initial.before).toEqual(initial.unchanged)
  expect(initial.nonmatchingSave.ok).toBe(true)
  expect(initial.stillTemporary.result?.temporary).toBe(true)
  expect(initial.save.ok).toBe(true)
  expect(initial.saved.result?.temporary).toBe(false)
  expect(initial.restored.result?.id).toBe(initial.temporary.result?.id)
  expect(JSON.stringify(initial.applicantPrint)).not.toContain('Private Fictional Applicant')

  const staff = await context.newPage()
  await staff.goto('/tests/browser/api.html'); await staff.waitForFunction(() => window.demo)
  const privateReads = await staff.evaluate(async ({ input, fileId }) => {
    await window.demo.startup(); await window.demo.signIn('salma')
    const handle = window.demo.createEvidenceAssistance(input); const inspected = await handle.inspect(); handle.dispose()
    return { inspected, view: await window.demo.readApplication(input.applicationId), file: await window.demo.readFile(input.applicationId, fileId), print: await window.demo.readPrintSummary(input.applicationId), notices: await window.demo.readNotifications() }
  }, { input: initial.input, fileId: initial.attachment.id })
  expect(privateReads.inspected.ok).toBe(false)
  expect(privateReads.file.ok).toBe(false)
  expect(JSON.stringify(privateReads)).not.toContain('Private Fictional Applicant')
  const published = await page.evaluate(async input => {
    const correctionPath = '/tests/browser/correction-evidence-fixtures.ts'
    const { correctionCommand } = await import(correctionPath) as typeof import('./correction-evidence-fixtures')
    const outcome = await window.demo.execute(await correctionCommand(window.demo, {}, undefined, 'resubmit'))
    const handle = window.demo.createEvidenceAssistance(input); await handle.inspect(); const state = handle.read(); handle.dispose()
    return { outcome, state }
  }, initial.input)
  expect(published.outcome).toMatchObject({ ok: true, value: { application: { status: 'underReview', workspace: null } } })
  expect(published.state).toMatchObject({ status: 'unavailable', result: null })
  const publicReads = await staff.evaluate(async input => ({ view: await window.demo.readApplication(input.applicationId), print: await window.demo.readPrintSummary(input.applicationId) }), initial.input)
  expect(publicReads.view).toMatchObject({ ok: true, value: { snapshot: { fields: { fullName: 'Private Fictional Applicant' } } } })
  for (const reads of [privateReads, publicReads, published.outcome]) {
    expect(JSON.stringify(reads)).not.toContain(initial.temporary.result!.id)
    expect(JSON.stringify(reads)).not.toContain('live-analysis')
  }
})
