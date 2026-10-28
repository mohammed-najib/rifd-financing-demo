import { expect, test, type Page } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

async function start(page: Page) {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  return page.evaluate(async () => {
    const demo = window.demo;
    await demo.startup();
    const context = await demo.signIn('mariam');
    const view = await demo.readApplication('RIFD-2026-001');
    if (!context.ok || !view.ok || view.value.role !== 'applicant' || !view.value.workspace)
      throw new Error('No draft');
    window.datasetId = context.value.datasetId;
    window.draftCommand = {
      kind: 'saveDraft',
      applicationId: view.value.id,
      product: view.value.product,
      fields: { ...view.value.snapshot.fields, explanation: 'private input' },
      documents: Object.fromEntries(
        Object.entries(view.value.snapshot.documents).map(([slot, fileId]) => [
          slot,
          { kind: 'saved', fileId },
        ]),
      ) as import('../../../src/demo').DraftDocuments,
    };
    return context.value.datasetId;
  });
}

test('storage fallback announces only committed identifiers and distinct revision scopes', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'BroadcastChannel', {
      value: class {
        constructor() {
          throw new Error('Fixture unavailable messaging');
        }
      },
    });
  });
  const datasetId = await start(page);
  const result = await page.evaluate(async () => {
    const demo = window.demo;
    demo.setControls({ slow: false, failure: 'storage' });
    const failed = await window.commitOn(demo, window.draftCommand);
    const afterAbort = localStorage.getItem('rifd.commit.v1');
    const saved = await window.commitOn(demo, window.draftCommand);
    const workspaceHint = JSON.parse(localStorage.getItem('rifd.commit.v1')!);
    const language = await window.commitOn(demo, {
      kind: 'setLanguage',
      expectedRevision: 1,
      language: 'en',
    });
    const preferenceHint = JSON.parse(localStorage.getItem('rifd.commit.v1')!);
    return {
      failed,
      afterAbort,
      saved,
      workspaceHint,
      language,
      preferenceHint,
      view: await demo.readApplication(window.draftCommand.applicationId),
    };
  });
  expect(result.failed).toMatchObject({ ok: false, error: { kind: 'storage' } });
  expect(result.afterAbort).toBeNull();
  expect(result.workspaceHint).toEqual({
    datasetId,
    kind: 'workspace',
    applicationId: 'RIFD-2026-001',
    revision: 2,
  });
  expect(result.preferenceHint).toEqual({ datasetId, kind: 'preferences', revision: 2 });
  expect(result.view).toMatchObject({
    ok: true,
    value: { sharedRevision: 1, workspace: { revision: 2 } },
  });
});

test('a committed private-save hint rereads only the receiving reviewer permissions and never carries protected input', async ({
  page,
  context,
}) => {
  const datasetId = await start(page);
  const reviewer = await context.newPage();
  await reviewer.goto('/tests/browser/support/api.html');
  await reviewer.waitForFunction(() => window.demo);
  await reviewer.evaluate(async () => {
    await window.demo.startup();
    await window.demo.signIn('salma');
  });
  const received = reviewer.evaluate(
    () =>
      new Promise(resolve => {
        const unsubscribe = window.demo.subscribe(async () => {
          unsubscribe();
          resolve({
            context: await window.demo.context(),
            draft: await window.demo.readApplication('RIFD-2026-001'),
            queue: await window.demo.listApplications(),
          });
        });
      }),
  );
  const result = await page.evaluate(async () => {
    const hints: unknown[] = [];
    const postMessage = BroadcastChannel.prototype.postMessage;
    BroadcastChannel.prototype.postMessage = function (message: unknown) {
      hints.push(message);
      postMessage.call(this, message);
    };
    const saved = await window.commit(window.draftCommand);
    const repeated = await window.commit(window.draftCommand);
    return { hints, saved, repeated };
  });
  // Every committed save announces identifiers only, never protected fields.
  expect(result.hints).toEqual([
    { datasetId, kind: 'workspace', applicationId: 'RIFD-2026-001', revision: 2 },
    { datasetId, kind: 'workspace', applicationId: 'RIFD-2026-001', revision: 3 },
  ]);
  expect(result.saved).toMatchObject({
    ok: true,
    value: { application: { workspace: { revision: 2 } } },
  });
  // Repeating the same intent is a new operation, not a receipt replay; it
  // advances the workspace revision without repeating the earlier receipt.
  expect(result.repeated).toMatchObject({
    ok: true,
    value: { application: { workspace: { revision: 3 } } },
  });
  expect(result.repeated.ok && result.repeated.value.receipt.operationId).not.toBe(
    result.saved.ok ? result.saved.value.receipt.operationId : '',
  );
  expect(await received).toMatchObject({
    context: { ok: true, value: { session: { identity: 'salma' } } },
    draft: { ok: false, error: { kind: 'unavailable' } },
    queue: { ok: true, value: expect.any(Array) },
  });
  const queue = await reviewer.evaluate(() => window.demo.listApplications());
  expect(queue.ok && queue.value).toHaveLength(12);
  expect(queue.ok && queue.value.some(application => application.id === 'RIFD-2026-001')).toBe(
    false,
  );
});
