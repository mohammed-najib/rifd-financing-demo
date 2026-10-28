import { expect, test } from '@playwright/test';

test('pending, failed and removed replacements never attach a checked capture to the previous source', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const demo = window.demo;
    await demo.startup();
    const context = await demo.signIn('mariam');
    const view = await demo.readApplication('RIFD-2026-001');
    const example = await demo.selectSavedDemonstration({ exampleId: 'en-identity-10' });
    if (!context.ok || !view.ok || view.value.role !== 'applicant' || !example.ok)
      throw new Error('No fixture');
    const prepared = await demo.prepareAttachment({
      datasetId: context.value.datasetId,
      applicationId: view.value.id,
      slot: 'identity',
      selectionId: 'original',
      source: {
        kind: 'local',
        file: new File([example.value.source.bytes], 'identity.png', { type: 'image/png' }),
      },
    });
    if (!prepared.ok) throw new Error('No source');
    const documents = Object.fromEntries(
      Object.entries(view.value.workspace!.snapshot.documents).map(([slot, fileId]) => [
        slot,
        { kind: 'saved', fileId },
      ]),
    ) as import('../../../src/demo').DraftDocuments;
    documents.identity = { kind: 'prepared', attachment: prepared.value };
    const saved = await window.commitOn(demo, {
      kind: 'saveDraft',
      applicationId: view.value.id,
      fields: { ...view.value.workspace!.snapshot.fields, fullName: 'Mira Vale Fictional 570' },
      product: view.value.product,
      documents,
    });
    if (!saved.ok) throw new Error('No saved source');
    demo.cancelPreparation(view.value.id, 'identity');
    const current = {
      applicationId: view.value.id,
      slot: 'identity' as const,
      language: 'en' as const,
    };
    const select = async () => {
      const result = await demo.selectSavedDemonstration({ exampleId: 'en-identity-10', current });
      return result.ok ? result.value.attachment : result.error.kind;
    };
    const before = await select();
    demo.setControls({ slow: false, failure: 'upload' });
    const preparation = demo.prepareAttachment({
      datasetId: context.value.datasetId,
      applicationId: view.value.id,
      slot: 'identity',
      selectionId: 'replacement',
      source: {
        kind: 'local',
        file: new File(['other bytes'], 'replacement.png', { type: 'image/png' }),
      },
    });
    const pending = await select();
    await preparation;
    const failed = await select();
    demo.cancelPreparation(view.value.id, 'identity');
    const restored = await select();
    const removed = await demo.selectSavedDemonstration({
      exampleId: 'en-identity-10',
      current: { ...current, fileId: null },
    });
    return { before, pending, failed, restored, removed: removed.ok && removed.value.attachment };
  });
  expect(result).toEqual({
    before: 'current-document',
    pending: 'example',
    failed: 'example',
    restored: 'current-document',
    removed: 'example',
  });
});

test('a document-only correction cannot fabricate capture-matching values for locked declarations', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const demo = window.demo;
    await demo.startup();
    const context = await demo.signIn('huda');
    const view = await demo.readApplication('RIFD-2026-004');
    const example = await demo.selectSavedDemonstration({ exampleId: 'en-purchase-03' });
    if (!context.ok || !view.ok || view.value.role !== 'applicant' || !example.ok)
      throw new Error('No fixture');
    const prepared = await demo.prepareAttachment({
      datasetId: context.value.datasetId,
      applicationId: view.value.id,
      slot: 'purchase',
      selectionId: 'correction-source',
      source: {
        kind: 'local',
        file: new File([example.value.source.bytes], 'stock-plan.png', { type: 'image/png' }),
      },
    });
    if (!prepared.ok) throw new Error('No source');
    const before = await demo.readApplication(view.value.id);
    const selection = await demo.selectSavedDemonstration({
      exampleId: 'en-purchase-03',
      current: {
        applicationId: view.value.id,
        slot: 'purchase',
        language: 'en',
        attachment: prepared.value,
        fields: {
          ...view.value.workspace!.snapshot.fields,
          explanation: 'Purchase notebook stock for fictional shop 614',
          budget: '361400',
        },
      },
    });
    return { selection, before, after: await demo.readApplication(view.value.id) };
  });
  expect(result.selection).toMatchObject({ ok: false, error: { kind: 'permissionDenied' } });
  expect(result.before).toEqual(result.after);
});
