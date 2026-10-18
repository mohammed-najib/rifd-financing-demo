import { expect, test } from '@playwright/test'

for (const product of ['inventory', 'equipment'] as const) test(`${product} purchase checking binds separate description and budget findings to the actual source`, async ({ page }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async product => {
    const fixtures = '/tests/browser/purchase-evidence-fixtures.ts', identity = '/tests/browser/evidence-fixtures.ts', transport = '/tests/browser/evidence-transport.ts'
    const { purchaseInput, attachPurchase, savePurchase } = await import(fixtures) as typeof import('./purchase-evidence-fixtures')
    const { identityDemo } = await import(identity) as typeof import('./evidence-fixtures')
    const { nativePurchase } = await import(transport) as typeof import('./evidence-transport')
    const requests: import('../../src/evidence-assistance/contract').StageRequest[] = []
    const { demo } = await identityDemo({ async evaluate(request) { requests.push(request); return nativePurchase(product) } })
    const attachment = await attachPurchase(product)
    await savePurchase({ explanation: product === 'inventory' ? 'Restock shop shelves with supplies' : 'Productive packing equipment', budget: '١٬٢٠٠٬٠٠٠' }, attachment, product)
    const before = await demo.readApplication(purchaseInput.applicationId)
    const handle = demo.createEvidenceAssistance(purchaseInput), selected = await handle.inspect()
    await handle.run(); const state = handle.read(); handle.dispose()
    return { state, before, after: await demo.readApplication(purchaseInput.applicationId), selected, requests: requests.map(({ state, questions, dependencies, image }) => ({ state, questions, dependencies, pixels: Array.from(new Uint8Array(image.bytes).slice(0, 8)) })) }
  }, product)
  expect(result.state.status, JSON.stringify(result.state)).toBe('completed')
  expect(result.before).toEqual(result.after)
  expect(result.state.result?.findings).toEqual({ category: product === 'inventory' ? 'stock' : 'equipment', readability: 'clear', descriptionPresence: 'present', descriptionSupport: 'consistent', budgetPresence: 'present', budgetSupport: 'different' })
  expect(result.state.result?.provenance.source.hash).toBe(result.selected.ok && result.selected.value.source.hash)
  expect(result.state.result?.coverage).toMatchObject({ totalPages: 1, successful: [1], unchecked: [] })
  expect(result.requests).toHaveLength(1)
  expect(result.requests[0].pixels).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
  expect(result.requests[0].state).toMatchObject({ declaredPurchase: { product, budget: '1200000' } })
  expect(Object.keys(result.requests[0].questions)).toEqual(['category', 'readability', 'descriptionPresence', 'descriptionSupport', 'budgetPresence', 'budgetSupport', 'explanationBox', 'explanationMultiplicity', 'budgetBox', 'budgetMultiplicity'])
  for (const dependencies of Object.values(result.requests[0].dependencies)) expect(dependencies).toEqual(expect.arrayContaining(['declaration.purchase.product', 'declaration.purchase.explanation.value', 'declaration.purchase.explanation.status', 'declaration.purchase.budget.value', 'declaration.purchase.budget.status']))
})

test('purchase guards distinguish absence, unrelated quotations, missing context, conflicts and unavailable answers', async ({ page }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/purchase-evidence-fixtures.ts', identity = '/tests/browser/evidence-fixtures.ts', transport = '/tests/browser/evidence-transport.ts'
    const { purchaseInput, attachPurchase, purchaseFile } = await import(fixtures) as typeof import('./purchase-evidence-fixtures')
    const { identityDemo, pdfFile } = await import(identity) as typeof import('./evidence-fixtures')
    const { nativePurchase } = await import(transport) as typeof import('./evidence-transport')
    const requests: import('../../src/evidence-assistance/contract').StageRequest[] = []
    let response: unknown = nativePurchase()
    const { demo } = await identityDemo({ async evaluate(request) { requests.push(request); return response } })
    const check = async (lines?: string[], changes = {}) => {
      const attachment = await attachPurchase('inventory', await purchaseFile('inventory', lines))
      const handle = demo.createEvidenceAssistance({ ...purchaseInput, attachment, declaredPurchase: { product: 'inventory', explanation: 'Restock shop shelves with supplies', budget: '1200000', ...changes } })
      await handle.run(); const state = handle.read(); handle.dispose(); return state
    }
    const missing = await check(undefined, { explanation: '', budget: '1,00,000' })
    const missingBudget = await check(undefined, { budget: '' })
    const absentAnswers = { ...nativePurchase().answers, descriptionPresence: { type: 'noul', noul: 0.01 }, descriptionSupport: { type: 'choice', choice: 'not_found', confidence: 0.99, probabilities: { consistent: 0, different: 0, not_found: 1, conflict: 0, uncertain: 0 } } }
    response = { ...nativePurchase(), answers: absentAnswers }
    const absent = await check(['Fictional stock purchase plan', 'Total budget: 900,000 YER'])
    response = { ...nativePurchase(), answers: { ...absentAnswers, category: nativePurchase('equipment').answers.category } }
    const unrelated = await check(['Fictional equipment quotation', 'Unrelated machinery', 'Total budget: 900,000 YER'])
    response = { ...nativePurchase(), answers: { ...nativePurchase().answers, readability: { ...nativePurchase().answers.readability, score: 1, probabilities: { '0': 0, '1': 1, '2': 0 } } } }
    const obscured = await check(['Fictional obscured stock purchase plan'])
    response = { ...nativePurchase(), answers: { ...nativePurchase().answers, descriptionSupport: { type: 'choice', choice: 'uncertain', confidence: 0.999, probabilities: { consistent: 0, different: 0, not_found: 0, conflict: 0, uncertain: 1 } }, budgetSupport: { type: 'choice', choice: 'conflict', confidence: 0.999, probabilities: { consistent: 0, different: 0, not_found: 0, conflict: 1, uncertain: 0 } } } }
    const conflict = await check(['Fictional stock purchase plan', 'Purchase: supplies / equipment', 'Total budget: 1,200,000 YER', 'Total budget: 900,000 YER'])
    response = { ...nativePurchase(), answers: { ...nativePurchase().answers, descriptionSupport: { ...nativePurchase().answers.descriptionSupport, confidence: 0.989 }, budgetPresence: { type: 'noul', noul: 0.98 } } }
    const uncertain = await check()
    response = { ...nativePurchase(), answers: { ...nativePurchase().answers, budgetSupport: null } }
    const partial = await check()
    response = { ...nativePurchase(), usage: null }
    const unavailable = await check()
    response = nativePurchase()
    const attempts = requests.length
    const multipageAttachment = await attachPurchase('inventory', await pdfFile(2))
    const handle = demo.createEvidenceAssistance({ ...purchaseInput, attachment: multipageAttachment, declaredPurchase: { product: 'inventory', explanation: 'Restock shop shelves with supplies', budget: '1200000' } }); await handle.run()
    return { missing, missingBudget, absent, unrelated, obscured, conflict, uncertain, partial, unavailable, multipage: handle.read(), multipageReadable: (await demo.readPrepared(purchaseInput.applicationId, multipageAttachment)).ok, multipageAttempts: requests.length - attempts, requests: requests.map(({ state, questions }) => ({ state, questions })) }
  })
  expect(result.missing.result?.findings).toMatchObject({ category: 'stock', readability: 'clear', descriptionPresence: 'present', descriptionSupport: 'missing-context', budgetPresence: 'present', budgetSupport: 'missing-context' })
  expect(Object.keys(result.requests[0].questions)).toEqual(['category', 'readability', 'descriptionPresence', 'budgetPresence', 'explanationBox', 'explanationMultiplicity', 'budgetBox', 'budgetMultiplicity'])
  expect(result.requests[0].state).toEqual({ page: 'original-page-1', declaredPurchase: { product: 'inventory', explanation: null, budget: null } })
  expect(result.missingBudget.result?.findings).toMatchObject({ descriptionSupport: 'consistent', budgetSupport: 'missing-context' })
  expect(result.requests[1].questions).toHaveProperty('descriptionSupport')
  expect(result.requests[1].questions).not.toHaveProperty('budgetSupport')
  expect(result.absent.result?.findings).toMatchObject({ descriptionPresence: 'absent', descriptionSupport: 'not_found', budgetSupport: 'different' })
  expect(result.unrelated.result?.findings).toMatchObject({ category: 'equipment', descriptionPresence: 'undetermined', descriptionSupport: 'undetermined', budgetSupport: 'undetermined' })
  expect(result.obscured.result?.findings).toMatchObject({ readability: 'partial', descriptionSupport: 'undetermined', budgetSupport: 'undetermined' })
  expect(result.obscured.result?.coverage.unreadable).toEqual([1])
  expect(result.conflict.result?.findings).toMatchObject({ descriptionSupport: 'undetermined', budgetPresence: 'present', budgetSupport: 'conflict' })
  expect(result.uncertain.result?.findings).toMatchObject({ descriptionSupport: 'undetermined', budgetPresence: 'undetermined', budgetSupport: 'undetermined' })
  expect(result.partial.result?.findings).toMatchObject({ descriptionSupport: 'consistent', budgetSupport: 'unavailable' })
  expect(result.partial.result?.stages).toContainEqual({ stage: 'budget-comparison', outcome: 'unavailable' })
  expect(result.unavailable).toMatchObject({ status: 'unavailable', reason: 'invalid-response', result: null })
  expect(result.multipage).toMatchObject({ status: 'completed', result: { findings: { descriptionSupport: 'consistent', budgetSupport: 'different' } }, coverage: { totalPages: 2, dispatched: [1, 2], successful: [1, 2], unchecked: [] } })
  expect(result.multipageReadable).toBe(true)
  expect(result.multipageAttempts).toBe(3)
})

test('purchase results survive matching Save and restore, but relevant details, product and source changes invalidate them', async ({ page }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/purchase-evidence-fixtures.ts', identity = '/tests/browser/evidence-fixtures.ts', transport = '/tests/browser/evidence-transport.ts'
    const { purchaseInput, attachPurchase, savePurchase } = await import(fixtures) as typeof import('./purchase-evidence-fixtures')
    const { identityDemo } = await import(identity) as typeof import('./evidence-fixtures')
    const { nativePurchase } = await import(transport) as typeof import('./evidence-transport')
    let attempts = 0
    const { demo } = await identityDemo({ async evaluate() { attempts++; return nativePurchase() } })
    const attachment = await attachPurchase(), declaredPurchase = { product: 'inventory' as const, explanation: 'Restock shop shelves with supplies', budget: '1200000' }
    const prepared = demo.createEvidenceAssistance({ ...purchaseInput, attachment, declaredPurchase })
    await prepared.run(); const temporary = prepared.read()
    await savePurchase({ explanation: declaredPurchase.explanation, budget: declaredPurchase.budget }, attachment); await prepared.refresh(); const retained = prepared.read(); prepared.dispose()
    const restored = demo.createEvidenceAssistance(purchaseInput); await restored.inspect(); const restoredState = restored.read()
    await savePurchase({ revenue: '800000', activity: 'services' }); await restored.refresh(); const unrelated = restored.read(); restored.dispose()
    const edits = []
    for (const fields of [{ explanation: 'Changed fictional stock purchase' }, { budget: '900000' }]) {
      const handle = demo.createEvidenceAssistance(purchaseInput); await handle.run()
      await savePurchase(fields); await handle.refresh(); edits.push(handle.read()); handle.dispose()
    }
    const previous = demo.createEvidenceAssistance(purchaseInput); await previous.run()
    const equipment = await attachPurchase('equipment'); await savePurchase({}, equipment, 'equipment'); await previous.refresh()
    const changedProduct = previous.read(); previous.dispose()
    const selected = demo.createEvidenceAssistance(purchaseInput); const current = await selected.inspect(); selected.dispose()
    return { temporary, retained, restoredState, unrelated, edits, changedProduct, current, attempts }
  })
  expect(result.temporary.result?.temporary).toBe(true)
  expect(result.retained.result).toMatchObject({ temporary: false, stale: false })
  expect(result.restoredState.result).toMatchObject({ id: result.temporary.result?.id, restored: true, stale: false })
  expect(result.unrelated.result).toMatchObject({ id: result.temporary.result?.id, stale: false })
  for (const state of result.edits) expect(state).toMatchObject({ reason: 'stale', result: { stale: true, findings: { category: 'unavailable', descriptionSupport: 'unavailable', budgetSupport: 'unavailable' } } })
  expect(result.changedProduct.result === null || result.changedProduct.result.stale).toBe(true)
  expect(result.current.ok && result.current.value.declaration).toMatchObject({ purchase: { product: 'equipment' } })
  expect(result.attempts).toBe(4)
})

test('purchase correction and reviewer tasks use the shared definitions while enforcing private permitted edits', async ({ page }) => {
  await page.goto('/tests/browser/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/purchase-evidence-fixtures.ts', identity = '/tests/browser/evidence-fixtures.ts', transport = '/tests/browser/evidence-transport.ts'
    const { requestPurchaseCorrection } = await import(fixtures) as typeof import('./purchase-evidence-fixtures')
    const { identityDemo } = await import(identity) as typeof import('./evidence-fixtures')
    const { nativePurchase } = await import(transport) as typeof import('./evidence-transport')
    const requests: import('../../src/evidence-assistance/contract').StageRequest[] = []
    const { demo } = await identityDemo({ async evaluate(request) { requests.push(request); return nativePurchase('equipment') } })
    const applicationId = 'RIFD-2026-007'
    await demo.signIn('salma')
    const reviewerInput = { action: 'find-supporting-evidence', applicationId, slot: 'purchase', audience: 'reviewer', context: 'submitted' } as const
    const beforeReview = await demo.readApplication(applicationId)
    const staff = demo.createEvidenceAssistance(reviewerInput); await staff.run(); const reviewer = staff.read(); staff.dispose()
    const afterReview = await demo.readApplication(applicationId)
    await requestPurchaseCorrection(demo)
    const before = await demo.readApplication(applicationId)
    if (!before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('workspace')
    const workspace = before.value.workspace, fields = workspace.snapshot.fields
    const declaredPurchase = { product: before.value.product, explanation: fields.explanation, budget: '1300000' }
    const input = { action: 'check-document', applicationId, slot: 'purchase', audience: 'applicant', context: 'correction-workspace', roundId: workspace.roundId!, declaredPurchase } as const
    const handle = demo.createEvidenceAssistance(input); await handle.run(); const correction = handle.read()
    const after = await demo.readApplication(applicationId), denied = []
    for (const changes of [{ explanation: 'Forbidden changed purchase explanation' }, { product: 'inventory' as const }]) {
      const forged = demo.createEvidenceAssistance({ ...input, declaredPurchase: { ...declaredPurchase, ...changes } }); denied.push(await forged.inspect()); forged.dispose()
    }
    const context = await demo.context()
    if (!context.ok) throw new Error('context')
    const documents = Object.fromEntries(Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../src/demo').DraftDocuments
    const saved = await demo.execute({ kind: 'saveCorrections', datasetId: context.value.datasetId, applicationId, operationId: crypto.randomUUID(), roundId: workspace.roundId!, expectedWorkspaceRevision: workspace.revision, product: before.value.product, fields: { ...fields, budget: '1300000' }, documents })
    if (!saved.ok) throw new Error(saved.error.kind)
    await demo.signIn('salma')
    const submitted = demo.createEvidenceAssistance(reviewerInput); await submitted.run(); const submittedState = submitted.read(); submitted.dispose()
    return { beforeReview, afterReview, reviewer, before, after, correction, denied, submittedState, privateState: handle.read(), requests: requests.map(({ state, questions, dependencies }) => ({ state, questions, dependencies })) }
  })
  expect(result.reviewer.status, JSON.stringify(result.reviewer)).toBe('completed')
  expect(result.beforeReview).toEqual(result.afterReview)
  expect(result.before).toEqual(result.after)
  expect(result.correction).toMatchObject({ status: 'completed', result: { temporary: true, findings: { descriptionSupport: 'consistent', budgetSupport: 'different' } } })
  for (const denied of result.denied) expect(denied).toMatchObject({ ok: false, error: { kind: 'permissionDenied' } })
  expect(result.requests[1].state).toMatchObject({ declaredPurchase: { product: 'equipment', budget: '1300000' }, correction: { initialSubmissionMonth: '2026-10', targets: [{ slot: 'purchase' }, { field: 'budget' }] } })
  for (const dependencies of Object.values(result.requests[1].dependencies)) expect(dependencies).toContain('correction')
  expect(result.requests[0].questions).toEqual(result.requests[1].questions)
  expect(result.requests[2].state).toMatchObject({ declaredPurchase: { budget: '1100000' } })
  expect(result.requests[2].state).not.toHaveProperty('correction')
  expect(result.privateState).toMatchObject({ status: 'unavailable', reason: 'unauthorized', result: null })
})
