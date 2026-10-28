import { expect, test } from '@playwright/test'

test('the public interface opens exactly five checked captures offline without financing changes', async ({ page, context }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(async () => { await window.demo.startup(); await window.demo.signIn('mariam') })
  await context.setOffline(true)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const before = await demo.readApplication('RIFD-2026-001')
    const examples = await demo.listSavedDemonstrations()
    const opened = []
    if (examples.ok) for (const example of examples.value) {
      const result = await demo.selectSavedDemonstration({ exampleId: example.id, current: { applicationId: 'RIFD-2026-001', slot: example.slot, language: 'en' } })
      if (!result.ok) throw new Error(result.error.kind)
      opened.push({ id: result.value.capture.sourceFamily, provenance: result.value.provenance, attachment: result.value.attachment, findings: result.value.capture.findings, checkedAt: result.value.capture.checkedAt, sourceSize: result.value.source.bytes.byteLength, pages: result.value.pages.length })
    }
    return { examples, opened, before, after: await demo.readApplication('RIFD-2026-001') }
  })
  expect(result.examples.ok && result.examples.value.map(example => example.id)).toEqual(['ar-financial-01', 'en-business-02', 'en-purchase-03', 'en-identity-10', 'en-financial-10'])
  expect(result.opened.map(example => example.findings.highlights.length)).toEqual([1, 1, 1, 0, 1])
  expect(result.opened.every(example => example.attachment === 'example' && example.provenance === 'saved-demonstration' && example.checkedAt === '2026-10-17T05:01:38.245Z')).toBe(true)
  expect(result.opened[0].findings.pages.map(page => page.available)).toEqual([true, true, false, false])
  expect(result.opened[0].findings.comparisons.every(item => item.outcome === null)).toBe(true)
  expect(result.opened[4].findings.comparisons.every(item => item.outcome === null)).toBe(true)
  expect(result.before).toEqual(result.after)
})

test('only actual current bytes, declarations, page scope and frozen versions permit attachment', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    await demo.startup()
    const context = await demo.signIn('mariam')
    const before = await demo.readApplication('RIFD-2026-001')
    const example = await demo.selectSavedDemonstration({ exampleId: 'en-business-02' })
    if (!context.ok || !before.ok || before.value.role !== 'applicant' || !example.ok) throw new Error('Fixture unavailable')
    const fields = { ...before.value.workspace!.snapshot.fields, businessName: 'Cedar Demo Supplies 545', address: '545 Fictional Spring Street', operatingSince: '2022-04' }
    const prepared = await demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: before.value.id, slot: 'business', selectionId: 'checked-source', source: { kind: 'local', file: new File([example.value.source.bytes], 'arbitrary-renamed.png', { type: 'image/png' }) } })
    if (!prepared.ok) throw new Error('Preparation failed')
    const current = { applicationId: before.value.id, slot: 'business' as const, language: 'en' as const, attachment: prepared.value, fields }
    const exact = await demo.selectSavedDemonstration({ exampleId: 'en-business-02', current })
    const contexts = [
      { ...current, fields: { ...fields, address: 'Other street' } },
      { ...current, selectedPages: [] },
      { ...current, selectedPages: [1, 2] },
      { ...current, language: 'ar' as const },
      { ...current, versions: { model: 'jev-1.14.0', questions: 'evidence-questions-v1', preparation: 'full-page-pdfjs-5.4.296-v1', display: 'provisional-live-policy', selection: 'checked-static-capture-v1' } },
    ]
    const mismatched = []
    for (const changed of contexts) { const result = await demo.selectSavedDemonstration({ exampleId: 'en-business-02', current: changed }); mismatched.push(result.ok ? result.value.attachment : result.error.kind) }
    const after = await demo.readApplication(before.value.id)
    // A source with the same filename and supplied reference hash cannot replace actual bytes.
    const altered = await demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: before.value.id, slot: 'business', selectionId: 'other-source', source: { kind: 'local', file: new File(['changed bytes'], 'arbitrary-renamed.png', { type: 'image/png' }) } })
    if (!altered.ok) throw new Error('Altered source preparation failed')
    const changedBytes = await demo.selectSavedDemonstration({ exampleId: 'en-business-02', current: { ...current, attachment: altered.value } })
    const superseded = await demo.selectSavedDemonstration({ exampleId: 'en-business-02', current })
    await demo.signIn('salma')
    const forbidden = await demo.selectSavedDemonstration({ exampleId: 'en-business-02', current })
    await demo.signOut()
    const signedOut = await demo.selectSavedDemonstration({ exampleId: 'en-business-02', current })
    return { exact: exact.ok && exact.value.attachment, mismatched, changedBytes: changedBytes.ok && changedBytes.value.attachment, superseded, forbidden, signedOut, before, after }
  })
  expect(result.exact).toBe('current-document')
  expect(result.mismatched).toEqual(['example', 'example', 'example', 'example', 'example'])
  expect(result.changedBytes).toBe('example')
  expect(result.superseded).toMatchObject({ ok: false, error: { kind: 'supersededSelection' } })
  expect(result.forbidden).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
  expect(result.signedOut).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } })
  expect(result.before).toEqual(result.after)
})

test('a saved source restores exact attachment offline and pending reads lose authority on sign-out', async ({ page, context }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(async () => {
    const demo = window.demo
    await demo.startup()
    const context = await demo.signIn('mariam')
    const view = await demo.readApplication('RIFD-2026-001')
    const example = await demo.selectSavedDemonstration({ exampleId: 'en-identity-10' })
    if (!context.ok || !view.ok || view.value.role !== 'applicant' || !example.ok) throw new Error('Fixture unavailable')
    const attachment = await demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: view.value.id, slot: 'identity', selectionId: 'checked-identity', source: { kind: 'local', file: new File([example.value.source.bytes], 'fictional-identity.png', { type: 'image/png' }) } })
    if (!attachment.ok) throw new Error('Preparation failed')
    const documents = Object.fromEntries(Object.entries(view.value.workspace!.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../../src/demo').DraftDocuments
    documents.identity = { kind: 'prepared', attachment: attachment.value }
    const saved = await window.commitOn(demo, { kind: 'saveDraft', applicationId: view.value.id, fields: { ...view.value.workspace!.snapshot.fields, fullName: 'Mira Vale Fictional 570' }, product: view.value.product, documents })
    if (!saved.ok) throw new Error(saved.error.kind)
  })
  await page.reload()
  await page.waitForFunction(() => window.demo)
  await page.evaluate(() => window.demo.startup())
  await context.setOffline(true)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const current = { applicationId: 'RIFD-2026-001', slot: 'identity' as const, language: 'en' as const }
    const opened = await demo.selectSavedDemonstration({ exampleId: 'en-identity-10', current })
    const pending = demo.selectSavedDemonstration({ exampleId: 'en-identity-10', current })
    await demo.signOut()
    return { attachment: opened.ok && opened.value.attachment, pending: await pending }
  })
  expect(result.attachment).toBe('current-document')
  expect(result.pending).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } })
})
