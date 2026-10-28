import { expect, test } from '@playwright/test'

test.describe.configure({ mode: 'parallel' })

test('either permitted role prints the identical public submitted record without private correction or review data', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    await demo.startup()
    const context = await demo.signIn('huda')
    const response = await demo.readApplication('RIFD-2026-004')
    if (!context.ok || !response.ok || response.value.role !== 'applicant' || !response.value.workspace) throw new Error('No response')
    const workspace = response.value.workspace
    const saved = await window.commitOn(demo, { kind: 'saveCorrections', applicationId: response.value.id, roundId: workspace.roundId!, product: response.value.product, fields: { ...workspace.snapshot.fields, amount: '450000' }, documents: Object.fromEntries(Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../../src/demo').DraftDocuments })
    if (!saved.ok) throw new Error(JSON.stringify(saved))
    const owner = await demo.readPrintSummary('RIFD-2026-004')
    const applicantView = await demo.readApplication('RIFD-2026-004')
    await demo.signIn('salma')
    const staff = await demo.readPrintSummary('RIFD-2026-004')
    const approved = await demo.readPrintSummary('RIFD-2026-005')
    const rejected = await demo.readPrintSummary('RIFD-2026-006')
    const draft = await demo.readPrintSummary('RIFD-2026-001')
    const missing = await demo.readPrintSummary('missing')
    await demo.signIn('mariam')
    const forbidden = await demo.readPrintSummary('RIFD-2026-004')
    await demo.signOut()
    const unsigned = await demo.readPrintSummary('RIFD-2026-005')
    return { owner, applicantView, staff, approved, rejected, draft, missing, forbidden, unsigned }
  })
  expect(result.owner).toEqual(result.staff)
  expect(result.owner).toMatchObject({ ok: true, value: { snapshot: { fields: { amount: '600000' } }, savedAt: null, rounds: [{ targets: [{ kind: 'field', field: 'amount' }, { kind: 'document', slot: 'purchase' }] }] } })
  expect(JSON.stringify(result.owner)).not.toContain('450000')
  expect(result.applicantView).toMatchObject({ ok: true, value: { workspace: { snapshot: { fields: { amount: '450000' } } } } })
  if (!result.owner.ok) throw new Error('No print record')
  expect(Object.keys(result.owner.value).sort()).toEqual(['documents', 'evidenceMonths', 'history', 'id', 'product', 'rounds', 'savedAt', 'snapshot', 'status', 'submittedAt'])
  for (const target of result.owner.value.rounds[0].targets) expect(target).not.toHaveProperty('verified')
  expect(result.approved).toMatchObject({ ok: true, value: { history: expect.arrayContaining([expect.objectContaining({ kind: 'approved', reason: { en: expect.any(String), ar: expect.any(String) } })]) } })
  expect(result.rejected).toMatchObject({ ok: true, value: { history: expect.arrayContaining([expect.objectContaining({ kind: 'rejected', reason: { en: expect.any(String), ar: expect.any(String) } })]) } })
  expect(result.draft).toEqual(result.missing)
  expect(result.forbidden).toEqual(result.missing)
  expect(result.unsigned).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } })
})

test('draft print reads only the last saved raw progress and rejects an unsaved new draft', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    await demo.startup()
    const context = await demo.signIn('mariam')
    const draft = await demo.readApplication('RIFD-2026-001')
    const unsaved = await demo.newDraft('equipment')
    if (!context.ok || !draft.ok || draft.value.role !== 'applicant' || !draft.value.workspace || !unsaved.ok) throw new Error('No draft')
    const fields = { ...draft.value.snapshot.fields, explanation: 'SAVED FICTIONAL PROGRESS', amount: 'invalid saved amount' }
    const saved = await window.commitOn(demo, { kind: 'saveDraft', applicationId: draft.value.id, product: draft.value.product, fields, documents: Object.fromEntries(Object.entries(draft.value.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../../src/demo').DraftDocuments })
    fields.explanation = 'LATER UNSAVED INPUT'
    return { saved, summary: await demo.readPrintSummary(draft.value.id), unsaved: await demo.readPrintSummary(unsaved.value.id) }
  })
  expect(result.saved.ok).toBe(true)
  expect(result.summary).toMatchObject({ ok: true, value: { status: 'draft', snapshot: { fields: { amount: 'invalid saved amount', explanation: 'SAVED FICTIONAL PROGRESS' } }, history: [], savedAt: expect.stringContaining('T') } })
  expect(result.unsaved).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
})
