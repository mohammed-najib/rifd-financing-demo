import { expect, test } from '@playwright/test';
import type { EvidenceAssistance } from '../../../src/evidence-assistance/contract';

declare global {
  interface Window {
    heldAnalysis: EvidenceAssistance;
    pendingAnalysis: Promise<void>;
    releaseAnalysis(): void;
  }
}

for (const mode of ['saved', 'unsaved', 'unsaved-after-begin-failure'] as const)
  test(`another tab clears or supersedes a pending ${mode} completion without transferring answers`, async ({
    page,
    context,
  }) => {
    await page.goto('/tests/browser/support/api.html');
    await page.waitForFunction(() => window.demo);
    await page.evaluate(async mode => {
      const fixture = '/tests/browser/support/evidence-fixtures.ts',
        native = '/tests/browser/support/evidence-transport.ts';
      const { identityDemo, identityInput } = (await import(
        fixture
      )) as typeof import('../support/evidence-fixtures');
      const { nativeIdentity } = (await import(
        native
      )) as typeof import('../support/evidence-transport');
      let dispatched = () => {};
      const { demo } = await identityDemo({
        evaluate() {
          dispatched();
          return new Promise(resolve => {
            window.releaseAnalysis = () => resolve(nativeIdentity());
          });
        },
      });
      if (mode === 'unsaved-after-begin-failure') {
        const put = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
          const request = put.apply(this, args);
          if (this.transaction.db.name === 'rifd-evidence-analysis') {
            IDBObjectStore.prototype.put = put;
            request.addEventListener('success', () => this.transaction.abort());
          }
          return request;
        };
      }
      const handle = demo.createEvidenceAssistance({
        ...identityInput,
        ...(mode !== 'saved' ? { declaredName: 'Private unsaved declaration' } : {}),
      });
      window.heldAnalysis = handle;
      const sent = new Promise<void>(resolve => {
        dispatched = resolve;
      });
      window.pendingAnalysis = handle.run();
      await sent;
    }, mode);
    const other = await context.newPage();
    await other.goto('/tests/browser/support/api.html');
    await other.waitForFunction(() => window.demo);
    const cleared = await other.evaluate(async () => {
      const fixture = '/tests/browser/support/evidence-fixtures.ts';
      const { identityDemo, identityInput } = (await import(
        fixture
      )) as typeof import('../support/evidence-fixtures');
      const { demo } = await identityDemo();
      const hints: unknown[] = [];
      BroadcastChannel.prototype.postMessage = hint => {
        hints.push(hint);
        throw new Error('Missed notice');
      };
      const setItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === 'rifd.commit.v1') throw new Error('Missed fallback');
        setItem.call(this, key, value);
      };
      const handle = demo.createEvidenceAssistance(identityInput);
      await handle.clear();
      return hints;
    });
    expect(cleared).toEqual([expect.objectContaining({ kind: 'analysis' })]);
    expect(Object.keys(cleared[0] as object).sort()).toEqual(['datasetId', 'kind']);
    const empty = await page.evaluate(async () => {
      window.releaseAnalysis();
      await window.pendingAnalysis;
      const completion = window.heldAnalysis.read();
      await window.heldAnalysis.refresh();
      return { completion, refreshed: window.heldAnalysis.read() };
    });
    expect(empty.completion.result).toBeNull();
    expect(empty.refreshed.result).toBeNull();
    await page.evaluate(async () => {
      window.pendingAnalysis = window.heldAnalysis.run();
      const end = Date.now() + 10_000;
      while (window.heldAnalysis.read().status !== 'running') {
        if (Date.now() > end) throw new Error('not dispatched');
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    });
    const winner = await other.evaluate(async () => {
      const handle = window.demo.createEvidenceAssistance({
        action: 'check-document',
        applicationId: 'RIFD-2026-001',
        slot: 'identity',
        audience: 'applicant',
        context: 'draft',
      });
      await handle.run();
      return handle.read();
    });
    const final = await page.evaluate(async () => {
      window.releaseAnalysis();
      await window.pendingAnalysis;
      window.dispatchEvent(new Event('focus'));
      const handle = window.demo.createEvidenceAssistance({
        action: 'check-document',
        applicationId: 'RIFD-2026-001',
        slot: 'identity',
        audience: 'applicant',
        context: 'draft',
      });
      await handle.inspect();
      return handle.read();
    });
    expect(winner.result?.temporary).toBe(false);
    expect(final.result?.id).toBe(winner.result?.id);
  });

test('cross-tab completion and financing edits preserve the originating view inputs and source', async ({
  page,
  context,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const original = await page.evaluate(async () => {
    const fixture = '/tests/browser/support/evidence-fixtures.ts';
    const { identityDemo, identityInput, attachIdentity, imageFile } = (await import(
      fixture
    )) as typeof import('../support/evidence-fixtures');
    const { demo } = await identityDemo();
    const attachment = await attachIdentity(await imageFile('image/png'));
    const handle = demo.createEvidenceAssistance({
      ...identityInput,
      attachment,
      declaredName: 'Private view input',
    });
    window.heldAnalysis = handle;
    await handle.run();
    return { result: handle.read().result, selected: await handle.inspect() };
  });
  const other = await context.newPage();
  await other.goto('/tests/browser/support/api.html');
  await other.waitForFunction(() => window.demo);
  await other.evaluate(async () => {
    const fixture = '/tests/browser/support/evidence-fixtures.ts',
      save = '/tests/browser/support/analysis-fixtures.ts';
    const { identityDemo, identityInput } = (await import(
      fixture
    )) as typeof import('../support/evidence-fixtures');
    const { saveIdentity } = (await import(save)) as typeof import('../support/analysis-fixtures');
    const { demo } = await identityDemo();
    await saveIdentity({ fullName: 'Other tab saved name' });
    const handle = demo.createEvidenceAssistance(identityInput);
    await handle.run();
  });
  const current = await page.evaluate(async () => {
    window.dispatchEvent(new Event('focus'));
    await window.heldAnalysis.refresh();
    return {
      result: window.heldAnalysis.read().result,
      selected: await window.heldAnalysis.inspect(),
    };
  });
  // The newer durable result supersedes pending work, but cannot replace the
  // meaning or selected evidence of a completed, unsaved view result.
  expect(current.selected.ok && current.selected.value.source).toEqual(
    original.selected.ok && original.selected.value.source,
  );
  expect(current.selected.ok && current.selected.value.declaration).toEqual(
    original.selected.ok && original.selected.value.declaration,
  );
  expect(current.selected.ok && current.selected.value.binding.dependencyKey).toBe(
    original.selected.ok && original.selected.value.binding.dependencyKey,
  );
  expect(current.result?.id).toBe(original.result?.id);
  expect(current.result?.temporary).toBe(true);
});
