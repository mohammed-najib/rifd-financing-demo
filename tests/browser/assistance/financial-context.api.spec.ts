import { expect, test } from '@playwright/test'

test('financial results retain exact multipage coverage after Save and reject edited averages', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/financial-evidence-fixtures.ts', identity = '/tests/browser/support/evidence-fixtures.ts', saves = '/tests/browser/support/analysis-fixtures.ts'
    const { financialInput, financialFile, attachFinancial, nativeFinancial } = await import(fixtures) as typeof import('../support/financial-evidence-fixtures')
    const { identityDemo } = await import(identity) as typeof import('../support/evidence-fixtures')
    const { alterAnalysis } = await import(saves) as typeof import('../support/analysis-fixtures')
    const { demo, datasetId } = await identityDemo({ async evaluate(request) { return nativeFinancial(request) } })
    const attachment = await attachFinancial(await financialFile(5))
    const handle = demo.createEvidenceAssistance({ ...financialInput, attachment }); await handle.run([2, 4]); const temporary = handle.read()
    const before = await demo.readApplication(financialInput.applicationId)
    if (!before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('draft')
    const documents = Object.fromEntries(Object.entries(before.value.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../../src/demo').DraftDocuments
    documents.financial = { kind: 'prepared', attachment }
    const saved = await demo.execute({ kind: 'saveDraft', datasetId, applicationId: financialInput.applicationId, operationId: crypto.randomUUID(), expectedWorkspaceRevision: before.value.workspace.revision, product: before.value.product, fields: { ...before.value.snapshot.fields, ...financialInput.declaredFinancial }, documents })
    if (!saved.ok) throw new Error(saved.error.kind)
    await handle.refresh(); const retained = handle.read(); handle.dispose()
    const reopened = demo.createEvidenceAssistance({ ...financialInput, attachment: undefined }); await reopened.inspect(); const restored = reopened.read()
    const changes = await demo.execute({ kind: 'saveDraft', datasetId, applicationId: financialInput.applicationId, operationId: crypto.randomUUID(), expectedWorkspaceRevision: saved.value.application.role === 'applicant' ? saved.value.application.workspace!.revision : -1, product: saved.value.application.product, fields: { ...saved.value.application.snapshot.fields, revenue: '999999' }, documents: Object.fromEntries(Object.entries(saved.value.application.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../../src/demo').DraftDocuments })
    if (!changes.ok) throw new Error(changes.error.kind)
    reopened.dispose()
    const changed = demo.createEvidenceAssistance({ ...financialInput, declaredFinancial: undefined }); await changed.inspect(); const stale = changed.read(); changed.dispose()
    await alterAnalysis(run => { (run.coverage as { successful: number[] }).successful = [1, 2, 3, 4, 5] })
    const forged = demo.createEvidenceAssistance({ ...financialInput, declaredFinancial: undefined }); await forged.inspect()
    return { temporary, retained, restored, stale, forged: forged.read() }
  })
  expect(result.temporary.result?.temporary).toBe(true)
  expect(result.retained.result).toMatchObject({ temporary: false, coverage: { selected: [2, 4], successful: [2, 4], unchecked: [1, 3, 5] } })
  expect(result.restored.result).toMatchObject({ id: result.temporary.result?.id, restored: true, findings: { revenueSupport: 'undetermined' } })
  expect(result.stale.result).toMatchObject({ stale: true, findings: { revenueSupport: 'unavailable' } })
  expect(result.forged).toMatchObject({ storage: 'incompatible', result: null })
})

test('historical and correction financial contexts retain the actual initial submission month and correction permissions', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts'
    const { identityDemo } = await import(fixtures) as typeof import('../support/evidence-fixtures')
    const financial = '/tests/browser/support/financial-evidence-fixtures.ts'
    const { nativeFinancial } = await import(financial) as typeof import('../support/financial-evidence-fixtures')
    const { demo } = await identityDemo({ async evaluate(request) { return nativeFinancial(request) } })
    await demo.signIn('salma')
    const historical = demo.createEvidenceAssistance({ action: 'find-supporting-evidence', applicationId: 'RIFD-2026-005', slot: 'financial', audience: 'reviewer', context: 'submitted' })
    const original = await historical.inspect(); historical.dispose()
    await demo.signIn('huda')
    const view = await demo.readApplication('RIFD-2026-012')
    if (!view.ok || view.value.role !== 'applicant' || !view.value.workspace?.roundId) throw new Error('correction')
    const input = { action: 'check-document', applicationId: view.value.id, slot: 'financial', audience: 'applicant', context: 'correction-workspace', roundId: view.value.workspace.roundId } as const
    const allowed = demo.createEvidenceAssistance(input), forbidden = demo.createEvidenceAssistance({ ...input, declaredFinancial: { revenue: '999999', expenses: view.value.workspace.snapshot.fields.expenses } })
    const correction = await allowed.inspect(); await allowed.run()
    return { original, correction, state: allowed.read(), forbidden: await forbidden.inspect() }
  })
  expect(result.original.ok && result.original.value.declaration.financial).toMatchObject({ initialSubmissionMonth: '2026-07', expectedMonths: ['2026-04', '2026-05', '2026-06'] })
  expect(result.correction.ok && result.correction.value.declaration.financial).toMatchObject({ initialSubmissionMonth: '2026-10', expectedMonths: ['2026-07', '2026-08', '2026-09'] })
  expect(result.state.result?.findings.category, JSON.stringify(result.state)).toBe('financial')
  expect(result.forbidden).toMatchObject({ ok: false, error: { kind: 'permissionDenied' } })
})
