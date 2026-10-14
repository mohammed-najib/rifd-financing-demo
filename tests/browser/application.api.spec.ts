import { expect, test } from '@playwright/test'

test('new draft stays private and memory-only until an atomic raw save, including four attachments', async ({ page }) => {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    await demo.startup()
    const context = await demo.signIn('omar')
    const opened = await demo.newDraft('equipment')
    if (!context.ok || !opened.ok) throw new Error('No new draft')
    const before = await demo.listApplications()
    const documents: import('../../src/demo').DraftDocuments = { identity: { kind: 'saved', fileId: null }, business: { kind: 'saved', fileId: null }, financial: { kind: 'saved', fileId: null }, purchase: { kind: 'saved', fileId: null } }
    for (const slot of ['identity', 'business', 'financial', 'purchase'] as const) {
      const prepared = await demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: opened.value.id, slot, selectionId: slot, source: { kind: 'local', file: new File([`DEMO ${slot}`], `${slot}.png`, { type: 'image/png' }) } })
      if (!prepared.ok) throw new Error('Not prepared')
      documents[slot] = { kind: 'prepared', attachment: prepared.value }
    }
    const command = { kind: 'saveDraft' as const, datasetId: context.value.datasetId, applicationId: opened.value.id, operationId: 'create', expectedWorkspaceRevision: 0, product: opened.value.product, fields: { ...opened.value.snapshot.fields, fullName: ' x ', amount: '١,٠٠', term: 'invalid' }, documents }
    demo.setControls({ slow: false, failure: 'storage' })
    const failed = await demo.execute(command)
    const afterFailure = await demo.listApplications()
    const inspection = await demo.inspectOperation(command)
    const saved = await demo.execute(command)
    return { before, failed, afterFailure, inspection, saved, command }
  })
  expect(result.before.ok && result.before.value).toHaveLength(3)
  expect(result.afterFailure).toEqual(result.before)
  expect(result.failed).toMatchObject({ ok: false, error: { kind: 'storage' } })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  expect(result.saved).toMatchObject({ ok: true, value: { receipt: { workspaceRevision: 1 }, application: { status: 'draft', history: [], snapshot: { fields: { fullName: ' x ', amount: '١,٠٠', term: 'invalid' } } } } })
  await page.reload()
  await page.waitForFunction(() => window.demo)
  const restored = await page.evaluate(async command => {
    const demo = window.demo
    await demo.startup()
    const replay = await demo.execute(command)
    const view = await demo.readApplication(command.applicationId)
    const bytes: Record<string, string> = {}
    if (view.ok) for (const document of view.value.documents) {
      const file = await demo.readFile(command.applicationId, document.file!.id)
      if (file.ok) bytes[document.slot] = new TextDecoder().decode(file.value.bytes)
    }
    await demo.signIn('salma')
    return { replay, view, bytes, forbidden: await demo.readApplication(command.applicationId) }
  }, result.command)
  expect(restored.replay).toEqual(result.saved)
  expect(restored.bytes).toEqual({ identity: 'DEMO identity', business: 'DEMO business', financial: 'DEMO financial', purchase: 'DEMO purchase' })
  expect(restored.forbidden).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
})

test('a product switch commits removal atomically, preserves shared evidence and retains invalid financing values', async ({ page }) => {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    await demo.startup()
    const context = await demo.signIn('mariam')
    const before = await demo.readApplication('RIFD-2026-001')
    if (!context.ok || !before.ok || before.value.role !== 'applicant' || !before.value.workspace) throw new Error('No draft')
    const documents = Object.fromEntries(Object.entries(before.value.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as import('../../src/demo').DraftDocuments
    const samples = await demo.listSamples(before.value.id)
    if (!samples.ok) throw new Error('No samples')
    const incompatibleSample = await demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: before.value.id, slot: 'purchase', product: 'equipment', selectionId: 'incompatible', source: { kind: 'sample', sampleId: samples.value.find(sample => sample.slot === 'purchase')!.id } })
    const command = { kind: 'saveDraft' as const, datasetId: context.value.datasetId, applicationId: before.value.id, operationId: 'switch', expectedWorkspaceRevision: before.value.workspace.revision, product: 'equipment' as const, fields: { ...before.value.snapshot.fields, amount: '١٠٠٬٠٠٠', term: '٦' }, documents }
    const incompatible = await demo.execute(command)
    command.documents.purchase = { kind: 'saved', fileId: null }
    demo.setControls({ slow: false, failure: 'storage' })
    const failed = await demo.execute(command)
    const unchanged = await demo.readApplication(before.value.id)
    const saved = await demo.execute(command)
    const staleSample = await demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: before.value.id, slot: 'purchase', selectionId: 'stale-catalog', source: { kind: 'sample', sampleId: samples.value.find(sample => sample.slot === 'purchase')!.id } })
    const oldFile = await demo.readFile(before.value.id, before.value.snapshot.documents.purchase!)
    return { before, incompatibleSample, incompatible, failed, unchanged, saved, staleSample, oldFile }
  })
  expect(result.incompatibleSample).toMatchObject({ ok: false, error: { kind: 'validation', slot: 'purchase' } })
  expect(result.incompatible).toMatchObject({ ok: false, error: { kind: 'validation', slot: 'purchase' } })
  expect(result.unchanged).toEqual(result.before)
  expect(result.failed).toMatchObject({ ok: false, error: { kind: 'storage' } })
  expect(result.saved).toMatchObject({ ok: true, value: { application: { product: 'equipment', snapshot: { fields: { amount: '١٠٠٬٠٠٠', term: '٦' }, documents: { ...result.before.ok && result.before.value.snapshot.documents, purchase: null } } } } })
  expect(result.staleSample).toMatchObject({ ok: false, error: { kind: 'validation', slot: 'purchase' } })
  expect(result.oldFile).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
})

test('a new application can prepare a fictional sample from its current fields without saving it', async ({ page }) => {
  await page.goto('/tests/browser/api.html')
  await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    await demo.startup()
    const context = await demo.signIn('huda')
    const opened = await demo.newDraft('equipment')
    if (!context.ok || !opened.ok) throw new Error('No draft')
    const sample = await demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: opened.value.id, slot: 'purchase', product: 'equipment', selectionId: 'new-sample', source: { kind: 'generated', fields: { ...opened.value.snapshot.fields, explanation: 'Purchase productive sewing equipment.', budget: '1200000' } } })
    if (!sample.ok) return { sample }
    const read = await demo.readPrepared(opened.value.id, sample.value)
    return { sample, bytes: read.ok ? read.value.bytes.byteLength : 0, saved: await demo.listApplications() }
  })
  expect(result.sample).toMatchObject({ ok: true, value: { source: 'sample', mime: 'image/jpeg' } })
  expect(result.bytes).toBeGreaterThan(0)
  expect(result.saved?.ok && result.saved.value).toHaveLength(5)
})
