import { expect, test } from '@playwright/test'

test('business checking compares each detail against the supplied pixels without changing the draft', async ({ page }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/business-evidence-fixtures.ts', identity = '/tests/browser/evidence-fixtures.ts', transport = '/tests/browser/evidence-transport.ts'
    const { businessInput, businessFile, attachBusiness } = await import(fixtures) as typeof import('./business-evidence-fixtures')
    const { identityDemo } = await import(identity) as typeof import('./evidence-fixtures')
    const { nativeBusiness } = await import(transport) as typeof import('./evidence-transport')
    const requests: import('../../src/evidence-assistance/contract').StageRequest[] = []
    const { demo } = await identityDemo({ async evaluate(request) { requests.push(request); return nativeBusiness() } })
    const attachment = await attachBusiness(await businessFile())
    const before = await demo.readApplication(businessInput.applicationId)
    const handle = demo.createEvidenceAssistance({ ...businessInput, attachment })
    const source = await handle.inspect()
    await handle.run()
    const state = handle.read(), after = await demo.readApplication(businessInput.applicationId)
    handle.dispose()
    return { state, before, after, sourceHash: source.ok && source.value.source.hash, requests: requests.map(request => ({ ...request, image: { ...request.image, bytes: Array.from(new Uint8Array(request.image.bytes).slice(0, 8)) } })) }
  })
  expect(result.state.status, JSON.stringify(result.state)).toBe('completed')
  expect(result.before).toEqual(result.after)
  expect(result.state.result?.findings).toEqual({ category: 'business', readability: 'clear', businessNamePresence: 'present', businessNameSupport: 'different', addressPresence: 'present', addressSupport: 'conflict', operatingSincePresence: 'present', operatingSinceSupport: 'consistent' })
  expect(result.state.result?.provenance.source.hash).toBe(result.sourceHash)
  expect(result.state.result?.coverage).toMatchObject({ totalPages: 1, successful: [1], unchecked: [] })
  expect(result.requests).toHaveLength(1)
  expect(result.requests[0].image.bytes).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
  expect(result.requests[0].state).not.toHaveProperty('declaredApplicantName')
  expect(Object.keys(result.requests[0].questions)).toEqual(['category', 'readability', 'businessNamePresence', 'businessNameSupport', 'addressPresence', 'addressSupport', 'operatingSincePresence', 'operatingSinceSupport'])
})

test('missing declarations skip only dependent comparisons and guards keep wrong or ambiguous evidence undetermined', async ({ page }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/business-evidence-fixtures.ts', identity = '/tests/browser/evidence-fixtures.ts', transport = '/tests/browser/evidence-transport.ts'
    const { businessInput, businessFile, attachBusiness } = await import(fixtures) as typeof import('./business-evidence-fixtures')
    const { identityDemo } = await import(identity) as typeof import('./evidence-fixtures')
    const { nativeBusiness } = await import(transport) as typeof import('./evidence-transport')
    const requests: import('../../src/evidence-assistance/contract').StageRequest[] = []
    let native: unknown = nativeBusiness()
    const { demo } = await identityDemo({ async evaluate(request) { requests.push(request); return native } })
    const check = async (lines?: string[], declaredBusiness?: import('../../src/evidence-assistance/contract').EvidenceInput['declaredBusiness']) => {
      const attachment = await attachBusiness(await businessFile(lines))
      const handle = demo.createEvidenceAssistance({ ...businessInput, attachment, declaredBusiness })
      await handle.run(); const state = handle.read(); handle.dispose(); return state
    }
    const missing = await check(undefined, { businessName: '', address: '12 Market Street, Aden', operatingSince: '2030-01' })
    const sourceOnly = await check(undefined, { businessName: 'x', address: '', operatingSince: '0000-12' })
    const noPresence = { type: 'noul', noul: 0.01 }
    const notFound = { type: 'choice', choice: 'not_found', confidence: 0.99, probabilities: { consistent: 0, different: 0, not_found: 1, conflict: 0, uncertain: 0 } }
    native = { ...nativeBusiness(), answers: { ...nativeBusiness().answers, operatingSincePresence: noPresence, operatingSinceSupport: notFound } }
    const absent = await check(['Fictional business evidence', 'Business name: Harbor Supplies', 'Address: 12 Market Street, Aden'])
    native = { ...nativeBusiness(), answers: { ...nativeBusiness().answers, category: { type: 'choice', choice: 'other', confidence: 0.999, probabilities: { identity: 0, business: 0, financial: 0, stock: 0, equipment: 0, other: 1, mixed: 0, uncertain: 0 } }, operatingSincePresence: noPresence, operatingSinceSupport: notFound } }
    const unrelated = await check(['Fictional picnic invitation', 'Meet at the park'])
    native = { ...nativeBusiness(), answers: { ...nativeBusiness().answers, readability: { ...nativeBusiness().answers.readability, score: 0.005, probabilities: { '0': 0.995, '1': 0.005, '2': 0 } } } }
    const unreadable = await check(['[Fictional obscured business details]'])
    native = { ...nativeBusiness(), answers: { ...nativeBusiness().answers, businessNameSupport: { type: 'choice', choice: 'uncertain', confidence: 0.999, probabilities: { consistent: 0, different: 0, not_found: 0, conflict: 0, uncertain: 1 } }, operatingSincePresence: { type: 'noul', noul: 0.5 } } }
    const ambiguous = await check(['Fictional business evidence', 'Harbor Supplies / Harbor Services', 'Address: 12 Market Street, Aden', 'Address: 90 Port Street, Aden', 'Operating since: 2024-01 / 2024-02'])
    native = { ...nativeBusiness(), answers: { ...nativeBusiness().answers, addressSupport: null } }
    const partial = await check()
    native = { ...nativeBusiness(), usage: null }
    const unavailable = await check()
    return { missing, sourceOnly, absent, unrelated, unreadable, ambiguous, partial, unavailable, requests: requests.map(({ state, questions, dependencies }) => ({ state, questions, dependencies })) }
  })
  expect(result.missing.result?.findings).toMatchObject({ category: 'business', businessNamePresence: 'present', businessNameSupport: 'missing-context', addressSupport: 'conflict', operatingSinceSupport: 'missing-context' })
  expect(result.requests[0].questions).not.toHaveProperty('businessNameSupport')
  expect(result.requests[0].questions).toHaveProperty('addressSupport')
  expect(result.requests[0].questions).not.toHaveProperty('operatingSinceSupport')
  expect(result.requests[0].state).toEqual({ page: 'original-page-1', declaredBusiness: { businessName: null, address: '12 Market Street, Aden', operatingSince: null } })
  expect(Object.keys(result.requests[1].questions)).toEqual(['category', 'readability', 'businessNamePresence', 'addressPresence', 'operatingSincePresence'])
  expect(result.sourceOnly.result?.findings).toMatchObject({ category: 'business', readability: 'clear', businessNamePresence: 'present' })
  expect(result.absent.result?.findings).toMatchObject({ operatingSincePresence: 'absent', operatingSinceSupport: 'not_found', businessNamePresence: 'present', businessNameSupport: 'different' })
  expect(result.unrelated.result?.findings).toMatchObject({ category: 'other', businessNameSupport: 'undetermined', addressSupport: 'undetermined', operatingSincePresence: 'undetermined', operatingSinceSupport: 'undetermined' })
  expect(result.unreadable.result?.findings).toMatchObject({ readability: 'unreadable', businessNameSupport: 'undetermined', addressSupport: 'undetermined', operatingSinceSupport: 'undetermined' })
  expect(result.ambiguous.result?.findings).toMatchObject({ businessNameSupport: 'undetermined', addressSupport: 'conflict', operatingSinceSupport: 'undetermined' })
  expect(result.partial.result?.findings).toMatchObject({ category: 'business', businessNameSupport: 'different', addressSupport: 'unavailable', operatingSinceSupport: 'consistent' })
  expect(result.partial.result?.stages).toContainEqual({ stage: 'address-comparison', outcome: 'unavailable' })
  expect(result.unavailable).toMatchObject({ status: 'unavailable', reason: 'invalid-response', result: null })
  for (const dependencies of Object.values(result.requests[0].dependencies)) expect(dependencies).toEqual(expect.arrayContaining(['declaration.business.businessName.value', 'declaration.business.businessName.status', 'declaration.business.address.value', 'declaration.business.address.status', 'declaration.business.operatingSince.value', 'declaration.business.operatingSince.status']))
})

test('ordinary Save retains a temporary business check and only model-visible edits stale it', async ({ page }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/business-evidence-fixtures.ts', identity = '/tests/browser/evidence-fixtures.ts', transport = '/tests/browser/evidence-transport.ts'
    const { businessInput, businessFile, attachBusiness, saveBusiness } = await import(fixtures) as typeof import('./business-evidence-fixtures')
    const { identityDemo } = await import(identity) as typeof import('./evidence-fixtures')
    const { nativeBusiness } = await import(transport) as typeof import('./evidence-transport')
    let attempts = 0
    const { demo } = await identityDemo({ async evaluate() { attempts++; return nativeBusiness() } })
    const attachment = await attachBusiness(await businessFile(['Fictional business evidence', 'Business name: Harbor Supplies', 'Address: 12 Market Street, Aden', 'Address: 90 Port Street, Aden', 'Operating since: 2024-01']))
    const declaredBusiness = { businessName: 'Harbor Shop', address: '12 Market Street, Aden', operatingSince: '٢٠٢٤-٠١' }
    const prepared = demo.createEvidenceAssistance({ ...businessInput, attachment, declaredBusiness })
    await prepared.run(); const temporary = prepared.read()
    await saveBusiness(declaredBusiness, attachment); await prepared.refresh(); const retained = prepared.read(); prepared.dispose()
    const restored = demo.createEvidenceAssistance(businessInput); await restored.inspect(); const restoredState = restored.read()
    await saveBusiness({ fullName: 'Unrelated Fictional Applicant', revenue: '800000' }); await restored.refresh(); const unrelated = restored.read(); restored.dispose()
    const edits = []
    for (const fields of [{ businessName: 'Changed Fictional Shop' }, { address: 'Changed address, Aden' }, { operatingSince: '2024-02' }]) {
      const handle = demo.createEvidenceAssistance(businessInput); await handle.run()
      await saveBusiness(fields); await handle.refresh(); edits.push(handle.read()); handle.dispose()
    }
    const saved = await demo.readApplication(businessInput.applicationId)
    return { temporary, retained, restoredState, unrelated, edits, attempts, saved }
  })
  expect(result.temporary.result?.temporary).toBe(true)
  expect(result.retained.result).toMatchObject({ temporary: false, stale: false })
  expect(result.restoredState.result).toMatchObject({ id: result.temporary.result?.id, restored: true, stale: false })
  expect(result.unrelated.result).toMatchObject({ id: result.temporary.result?.id, stale: false })
  for (const state of result.edits) expect(state).toMatchObject({ reason: 'stale', result: { stale: true, findings: { category: 'unavailable', businessNameSupport: 'unavailable', addressSupport: 'unavailable', operatingSinceSupport: 'unavailable' } } })
  expect(result.attempts).toBe(4)
  expect(result.saved.ok && result.saved.value.snapshot.fields.operatingSince).toBe('2024-02')
})

test('business tasks share correction permissions and reviewer definitions without exposing private edits or reacting to notes', async ({ page }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const identity = '/tests/browser/evidence-fixtures.ts', transport = '/tests/browser/evidence-transport.ts', business = '/tests/browser/business-evidence-fixtures.ts'
    const { identityDemo } = await import(identity) as typeof import('./evidence-fixtures')
    const { businessInput, businessFile, attachBusiness, saveBusiness } = await import(business) as typeof import('./business-evidence-fixtures')
    const { nativeBusiness } = await import(transport) as typeof import('./evidence-transport')
    const requests: import('../../src/evidence-assistance/contract').StageRequest[] = []
    const { demo, datasetId } = await identityDemo({ async evaluate(request) { requests.push(request); return nativeBusiness() } })
    const applicationId = businessInput.applicationId
    const attachment = await attachBusiness(await businessFile())
    const draft = await saveBusiness({ explanation: 'Purchase fictional supplies for the shop shelves.' }, attachment)
    if (draft.application.role !== 'applicant' || !draft.application.workspace) throw new Error('draft')
    const draftDocuments = Object.fromEntries(Object.entries(draft.application.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../src/demo').DraftDocuments
    const published = await demo.execute({ kind: 'submit', datasetId, applicationId, operationId: crypto.randomUUID(), expectedWorkspaceRevision: draft.application.workspace.revision, expectedSharedRevision: draft.application.sharedRevision, product: draft.application.product, fields: draft.application.snapshot.fields, documents: draftDocuments })
    if (!published.ok) throw new Error(published.error.kind)
    const reviewerInput = { action: 'find-supporting-evidence', applicationId, slot: 'business', audience: 'reviewer', context: 'submitted' } as const
    await demo.signIn('salma')
    const claimed = await demo.execute({ kind: 'claimApplication', datasetId, applicationId, operationId: crypto.randomUUID(), expectedSharedRevision: published.value.application.sharedRevision })
    if (!claimed.ok) throw new Error(claimed.error.kind)
    const started = await demo.execute({ kind: 'startReview', datasetId, applicationId, operationId: crypto.randomUUID(), expectedSharedRevision: claimed.value.application.sharedRevision })
    if (!started.ok) throw new Error(started.error.kind)
    const reviewer = demo.createEvidenceAssistance(reviewerInput); await reviewer.run(); const original = reviewer.read()
    const staff = await demo.readApplication(applicationId)
    if (!staff.ok || staff.value.role !== 'reviewer') throw new Error('staff')
    const note = await demo.execute({ kind: 'saveNote', datasetId, applicationId, operationId: crypto.randomUUID(), expectedSharedRevision: staff.value.sharedRevision, text: { ar: 'ملاحظة مستقلة للمراجع', en: 'Unrelated private reviewer note' } })
    if (!note.ok) throw new Error(note.error.kind)
    await reviewer.refresh(); const afterNote = reviewer.read(); reviewer.dispose()
    const targets = [{ kind: 'document' as const, slot: 'business' as const, reason: { ar: 'استبدل إثبات النشاط غير الواضح.', en: 'Replace the unclear business evidence.' } }, { kind: 'field' as const, field: 'address' as const, reason: { ar: 'صحح عنوان النشاط.', en: 'Correct the business address.' } }]
    const requested = await demo.execute({ kind: 'requestCorrections', datasetId, applicationId, operationId: crypto.randomUUID(), expectedSharedRevision: note.value.application.sharedRevision, confirmed: true, targets })
    if (!requested.ok) throw new Error(requested.error.kind)
    await demo.signIn('mariam')
    const before = await demo.readApplication(applicationId)
    if (!before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('workspace')
    const workspace = before.value.workspace, fields = workspace.snapshot.fields
    const declaredBusiness = { businessName: fields.businessName, address: 'Private fictional address, Aden', operatingSince: fields.operatingSince }
    const input = { action: 'check-document', applicationId, slot: 'business', audience: 'applicant', context: 'correction-workspace', roundId: workspace.roundId!, declaredBusiness } as const
    const handle = demo.createEvidenceAssistance(input); await handle.run(); const correction = handle.read()
    const after = await demo.readApplication(applicationId)
    const denied = []
    for (const changes of [{ businessName: 'Forbidden business name' }, { operatingSince: '2024-01' }]) {
      const forged = demo.createEvidenceAssistance({ ...input, declaredBusiness: { ...declaredBusiness, ...changes } })
      denied.push(await forged.inspect()); forged.dispose()
    }
    const documents = Object.fromEntries(Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../src/demo').DraftDocuments
    const saved = await demo.execute({ kind: 'saveCorrections', datasetId, applicationId, operationId: crypto.randomUUID(), roundId: workspace.roundId!, expectedWorkspaceRevision: workspace.revision, product: before.value.product, fields: { ...fields, address: declaredBusiness.address }, documents })
    if (!saved.ok) throw new Error(saved.error.kind)
    await demo.signIn('salma')
    const submitted = demo.createEvidenceAssistance(reviewerInput); await submitted.run()
    return { original, afterNote, before, after, correction, denied, requests: requests.map(({ state, questions, dependencies }) => ({ state, questions, dependencies })), submitted: submitted.read(), privateState: handle.read() }
  })
  expect(result.original, JSON.stringify(result.original)).toMatchObject({ status: 'completed', result: { temporary: false, findings: { businessNameSupport: 'different' } } })
  expect(result.afterNote.result).toMatchObject({ id: result.original.result?.id, stale: false })
  expect(result.before).toEqual(result.after)
  expect(result.correction).toMatchObject({ status: 'completed', result: { temporary: true, findings: { addressSupport: 'conflict' } } })
  for (const denied of result.denied) expect(denied).toMatchObject({ ok: false, error: { kind: 'permissionDenied' } })
  expect(result.requests[1].state).toMatchObject({ declaredBusiness: { address: 'Private fictional address, Aden' }, correction: { initialSubmissionMonth: '2026-10', targets: [{ slot: 'business' }, { field: 'address' }] } })
  for (const dependencies of Object.values(result.requests[1].dependencies)) expect(dependencies).toContain('correction')
  expect(result.requests[0].questions).toEqual(result.requests[1].questions)
  expect(result.requests[2].state).not.toHaveProperty('correction')
  expect(JSON.stringify(result.requests[2].state)).not.toContain('Private fictional address')
  expect(JSON.stringify(result.requests)).not.toContain('Unrelated private reviewer note')
  expect(result.privateState).toMatchObject({ status: 'unavailable', reason: 'unauthorized', result: null })
})

test('a multipage business source stays inspectable and cannot produce whole-source agreement or absence', async ({ page }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/business-evidence-fixtures.ts', identity = '/tests/browser/evidence-fixtures.ts'
    const { businessInput, attachBusiness } = await import(fixtures) as typeof import('./business-evidence-fixtures')
    const { identityDemo, pdfFile } = await import(identity) as typeof import('./evidence-fixtures')
    let attempts = 0
    const { demo } = await identityDemo({ async evaluate() { attempts++; throw new Error('must not dispatch') } })
    const attachment = await attachBusiness(await pdfFile(2))
    const handle = demo.createEvidenceAssistance({ ...businessInput, attachment }); await handle.run()
    return { state: handle.read(), readable: (await demo.readPrepared(businessInput.applicationId, attachment)).ok, attempts }
  })
  expect(result).toMatchObject({ attempts: 0, readable: true, state: { status: 'unavailable', reason: 'multipage', result: null, coverage: { totalPages: 2, successful: [], dispatched: [], unchecked: [1, 2] } } })
})
