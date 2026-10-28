import { expect, test } from '@playwright/test';

test('completed analysis reopens offline with its original provenance and leaves financing untouched', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const original = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts';
    const { identityDemo, identityInput } = (await import(
      fixtures
    )) as typeof import('../support/evidence-fixtures');
    const { demo } = await identityDemo();
    const before = await demo.readApplication(identityInput.applicationId);
    const handle = demo.createEvidenceAssistance(identityInput);
    await handle.run();
    const state = handle.read();
    handle.dispose();
    demo.dispose();
    return { before, state };
  });
  await page.context().setOffline(true);
  const result = await page.evaluate(async () => {
    const module = '/src/demo/index.ts';
    const { createDemo } = (await import(module)) as typeof import('../../../src/demo');
    const reopened = createDemo({
      latency: 50,
      verifyStoredFiles: false,
      loadFonts: false,
      includeOversizedSample: false,
      compactEvidence: true,
    });
    await reopened.startup();
    await reopened.signIn('mariam');
    const restored = reopened.createEvidenceAssistance({
      action: 'check-document',
      applicationId: 'RIFD-2026-001',
      slot: 'identity',
      audience: 'applicant',
      context: 'draft',
    });
    await restored.inspect();
    return { after: await reopened.readApplication('RIFD-2026-001'), restored: restored.read() };
  });
  expect(original.before).toEqual(result.after);
  expect(original.state.result?.temporary).toBe(false);
  expect(result.restored.result?.id).toBe(original.state.result?.id);
  expect(result.restored.result?.provenance).toEqual(original.state.result?.provenance);
  expect(result.restored.result?.restored).toBe(true);
});

test('failure and cancellation preserve the previous run and expiry while a usable partial run replaces it', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts',
      transport = '/tests/browser/support/evidence-transport.ts';
    const { identityDemo, identityInput } = (await import(
      fixtures
    )) as typeof import('../support/evidence-fixtures');
    const { nativeIdentity } = (await import(
      transport
    )) as typeof import('../support/evidence-transport');
    let mode: 'complete' | 'failure' | 'held' | 'partial' = 'complete';
    let dispatched = () => {},
      release = (value: unknown) => {
        void value;
      };
    const { demo } = await identityDemo({
      evaluate() {
        if (mode === 'failure') return Promise.reject(new Error('offline'));
        if (mode === 'held') {
          dispatched();
          return new Promise(resolve => {
            release = resolve;
          });
        }
        const native = nativeIdentity();
        return Promise.resolve(
          mode === 'partial'
            ? { ...native, answers: { ...native.answers, nameSupport: null } }
            : native,
        );
      },
    });
    const handle = demo.createEvidenceAssistance(identityInput);
    await handle.run();
    const original = handle.read();
    mode = 'failure';
    await handle.run();
    const failed = handle.read();
    mode = 'held';
    const sent = new Promise<void>(resolve => {
      dispatched = resolve;
    });
    const pending = handle.run();
    await sent;
    const during = handle.read();
    handle.cancel();
    release(nativeIdentity());
    await pending;
    const cancelled = handle.read();
    mode = 'partial';
    await handle.run();
    const partial = handle.read();
    handle.dispose();
    const reopened = demo.createEvidenceAssistance(identityInput);
    await reopened.inspect();
    return { original, during, failed, cancelled, partial, restored: reopened.read() };
  });
  for (const state of [result.during, result.failed, result.cancelled]) {
    expect(state.result?.id).toBe(result.original.result?.id);
    expect(state.result?.expiresAt).toBe(result.original.result?.expiresAt);
  }
  expect(result.partial.result?.id).not.toBe(result.original.result?.id);
  expect(result.partial.result?.findings).toMatchObject({
    category: 'identity',
    nameSupport: 'unavailable',
  });
  expect(result.partial.result?.stages[0].outcome).toBe('partial');
  expect(result.restored.result?.id).toBe(result.partial.result?.id);
});

test('unsaved declarations and prepared files become recoverable only after an ordinary matching Save', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts',
      saves = '/tests/browser/support/analysis-fixtures.ts';
    const { identityDemo, identityInput, attachIdentity, imageFile } = (await import(
      fixtures
    )) as typeof import('../support/evidence-fixtures');
    const { saveIdentity } = (await import(saves)) as typeof import('../support/analysis-fixtures');
    const { demo } = await identityDemo();
    const before = await demo.readApplication(identityInput.applicationId);
    const edited = { ...identityInput, declaredName: 'Unsaved Fictional Name' };
    const handle = demo.createEvidenceAssistance(edited);
    await handle.run();
    const temporary = handle.read();
    const unchanged = await demo.readApplication(identityInput.applicationId);
    const other = demo.createEvidenceAssistance(edited);
    await other.inspect();
    const absent = other.read();
    other.dispose();
    await saveIdentity({ mobile: '777123456' });
    await handle.refresh();
    const unrelated = handle.read();
    await saveIdentity({ fullName: edited.declaredName });
    await handle.refresh();
    const saved = handle.read();
    handle.dispose();
    const reopened = demo.createEvidenceAssistance(identityInput);
    await reopened.inspect();
    const restored = reopened.read();
    reopened.dispose();
    const attachment = await attachIdentity(await imageFile('image/png'));
    const prepared = demo.createEvidenceAssistance({ ...identityInput, attachment });
    await prepared.run();
    const preparedTemporary = prepared.read();
    await saveIdentity({}, attachment);
    const preparedSaved = prepared.read();
    prepared.dispose();
    const source = demo.createEvidenceAssistance(identityInput);
    await source.inspect();
    return {
      before,
      unchanged,
      temporary,
      absent,
      unrelated,
      saved,
      restored,
      preparedTemporary,
      preparedSaved,
      source: source.read(),
    };
  });
  expect(result.unchanged).toEqual(result.before);
  expect(result.temporary.result?.temporary).toBe(true);
  expect(result.absent.result).toBeNull();
  expect(result.unrelated.result?.temporary).toBe(true);
  expect(result.saved.result?.temporary).toBe(false);
  expect(result.restored.result?.id).toBe(result.temporary.result?.id);
  expect(result.preparedTemporary.result?.temporary).toBe(true);
  expect(result.preparedSaved.result?.temporary).toBe(false);
  expect(result.preparedSaved.result?.id).toBe(result.preparedTemporary.result?.id);
  expect(result.source.result?.id).toBe(result.preparedTemporary.result?.id);
});

test('clear invalidates pending runs and a newer run wins even when commit hints are missed', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts',
      transport = '/tests/browser/support/evidence-transport.ts',
      faults = '/tests/browser/support/storage-faults.ts';
    const { identityDemo, identityInput } = (await import(
      fixtures
    )) as typeof import('../support/evidence-fixtures');
    const { nativeIdentity } = (await import(
      transport
    )) as typeof import('../support/evidence-transport');
    const { refuseCommitNotices } = (await import(
      faults
    )) as typeof import('../support/storage-faults');
    let held = false,
      release = (value: unknown) => {
        void value;
      },
      dispatched = () => {};
    const { demo } = await identityDemo({
      evaluate() {
        if (!held) return Promise.resolve(nativeIdentity());
        dispatched();
        return new Promise(resolve => {
          release = resolve;
        });
      },
    });
    const before = await demo.readApplication(identityInput.applicationId);
    const first = demo.createEvidenceAssistance(identityInput);
    await first.run();
    const old = first.read();
    held = true;
    let sent = new Promise<void>(resolve => {
      dispatched = resolve;
    });
    let pending = first.run();
    await sent;
    const clear = demo.createEvidenceAssistance(identityInput);
    refuseCommitNotices();
    await clear.clear();
    release(nativeIdentity());
    await pending;
    await first.refresh();
    const cleared = first.read();
    const afterClear = demo.createEvidenceAssistance(identityInput);
    await afterClear.inspect();
    const empty = afterClear.read();
    afterClear.dispose();
    sent = new Promise<void>(resolve => {
      dispatched = resolve;
    });
    pending = first.run();
    await sent;
    held = false;
    const newer = demo.createEvidenceAssistance(identityInput);
    await newer.run();
    const winner = newer.read();
    release(nativeIdentity());
    await pending;
    const final = demo.createEvidenceAssistance(identityInput);
    await final.inspect();
    return {
      before,
      after: await demo.readApplication(identityInput.applicationId),
      old,
      cleared,
      empty,
      winner,
      final: final.read(),
      late: first.read(),
    };
  });
  expect(result.old.result).not.toBeNull();
  expect(result.cleared.result).toBeNull();
  expect(result.empty.result).toBeNull();
  expect(result.before).toEqual(result.after);
  expect(result.final.result?.id).toBe(result.winner.result?.id);
  expect(result.late.result?.id).not.toBe(result.old.result?.id);
});

test('changed context is stale, unrelated edits stay applicable and old claims never become current', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts',
      saves = '/tests/browser/support/analysis-fixtures.ts';
    const { identityDemo, identityInput } = (await import(
      fixtures
    )) as typeof import('../support/evidence-fixtures');
    const { saveIdentity } = (await import(saves)) as typeof import('../support/analysis-fixtures');
    const { demo } = await identityDemo();
    const handle = demo.createEvidenceAssistance(identityInput);
    await handle.run();
    const original = handle.read();
    await saveIdentity({ explanation: 'Unrelated saved purchase context' });
    await handle.refresh();
    const unrelated = handle.read();
    await saveIdentity({ fullName: 'Changed Fictional Name' });
    await handle.refresh();
    const stale = handle.read();
    handle.dispose();
    const restored = demo.createEvidenceAssistance(identityInput);
    await restored.inspect();
    return { original, unrelated, stale, restored: restored.read() };
  });
  expect(result.unrelated.result?.stale).toBe(false);
  expect(result.unrelated.result?.id).toBe(result.original.result?.id);
  for (const state of [result.stale, result.restored]) {
    expect(state).toMatchObject({ reason: 'stale', result: { stale: true } });
    expect(state.result?.findings).toEqual({
      category: 'unavailable',
      readability: 'unavailable',
      namePresence: 'unavailable',
      nameSupport: 'unavailable',
    });
    expect(state.result?.provenance).toEqual(result.original.result?.provenance);
    expect(state.result?.coverage).toEqual(result.original.result?.coverage);
  }
});

test('seven-day expiry is enforced on use and reopening without extending it', async ({ page }) => {
  await page.clock.install();
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const original = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts';
    const { identityDemo, identityInput } = (await import(
      fixtures
    )) as typeof import('../support/evidence-fixtures');
    const { demo } = await identityDemo();
    const handle = demo.createEvidenceAssistance(identityInput);
    await handle.run();
    return handle.read().result!;
  });
  expect(Date.parse(original.expiresAt) - Date.parse(original.provenance.completedAt)).toBe(
    604800000,
  );
  await page.clock.setSystemTime(Date.parse(original.expiresAt) - 60000);
  const beforeExpiry = await page.evaluate(async () => {
    window.demo.expireSession();
    const signedIn = await window.demo.signIn('mariam');
    if (!signedIn.ok) throw new Error(signedIn.error.kind);
    const handle = window.demo.createEvidenceAssistance({
      action: 'check-document',
      applicationId: 'RIFD-2026-001',
      slot: 'identity',
      audience: 'applicant',
      context: 'draft',
    });
    await handle.inspect();
    window.analysisHandle = handle;
    return handle.read();
  });
  expect(beforeExpiry.result?.expiresAt, JSON.stringify(beforeExpiry)).toBe(original.expiresAt);
  await page.clock.setSystemTime(Date.parse(original.expiresAt) + 1);
  expect(await page.evaluate(() => window.analysisHandle.read().result)).toBeNull();
  const expired = await page.evaluate(async () => {
    window.demo.expireSession();
    const signedIn = await window.demo.signIn('mariam');
    if (!signedIn.ok) throw new Error(signedIn.error.kind);
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
  expect(expired.result).toBeNull();
});

test('analysis-store refusal and incompatible records leave financing and source reads available', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts',
      faults = '/tests/browser/support/analysis-fixtures.ts';
    const { identityDemo, identityInput } = (await import(
      fixtures
    )) as typeof import('../support/evidence-fixtures');
    const { alterAnalysis, refuseAnalysisStorage } = (await import(
      faults
    )) as typeof import('../support/analysis-fixtures');
    let { demo } = await identityDemo();
    const before = await demo.readApplication(identityInput.applicationId);
    const states = [];
    for (const change of [
      (run: Record<string, unknown>) => {
        run.schemaVersion = 99;
      },
      (run: Record<string, unknown>) => {
        (run.provenance as { versions: { mapping: string } }).versions.mapping = 'old-mapping';
      },
      (run: Record<string, unknown>) => {
        (run.findings as { nameSupport: string }).nameSupport = 'consistent';
      },
      (run: Record<string, unknown>) => {
        (run.provenance as { raster: { sourceHash: string } }).raster.sourceHash = '0'.repeat(64);
      },
    ]) {
      const handle = demo.createEvidenceAssistance(identityInput);
      await handle.run();
      handle.dispose();
      await alterAnalysis(change);
      const restored = demo.createEvidenceAssistance(identityInput);
      await restored.inspect();
      states.push(restored.read());
      restored.dispose();
    }
    demo.dispose();
    refuseAnalysisStorage();
    ({ demo } = await identityDemo());
    const temporary = demo.createEvidenceAssistance(identityInput);
    await temporary.run();
    const selected = await temporary.inspect();
    return {
      before,
      after: await demo.readApplication(identityInput.applicationId),
      states,
      temporary: temporary.read(),
      source:
        selected.ok &&
        (await demo.readFile(identityInput.applicationId, selected.value.source.id)).ok,
    };
  });
  expect(
    result.states.every(state => state.storage === 'incompatible' && state.result === null),
  ).toBe(true);
  expect(result.temporary).toMatchObject({
    status: 'completed',
    storage: 'temporary-only',
    result: { temporary: true },
  });
  expect(result.source).toBe(true);
  expect(result.after).toEqual(result.before);
});

test('reset fences old completions before cleanup and recovers an interrupted analysis cleanup during active use', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts',
      native = '/tests/browser/support/evidence-transport.ts';
    const { identityDemo, identityInput } = (await import(
      fixtures
    )) as typeof import('../support/evidence-fixtures');
    const { nativeIdentity } = (await import(
      native
    )) as typeof import('../support/evidence-transport');
    let held = false,
      release = (value: unknown) => {
        void value;
      },
      dispatched = () => {};
    const { demo, datasetId } = await identityDemo({
      evaluate() {
        if (!held) return Promise.resolve(nativeIdentity());
        dispatched();
        return new Promise(resolve => {
          release = resolve;
        });
      },
    });
    const handle = demo.createEvidenceAssistance(identityInput);
    await handle.run();
    held = true;
    const sent = new Promise<void>(resolve => {
      dispatched = resolve;
    });
    const pending = handle.run();
    await sent;
    const transaction = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase['transaction']>) {
      if (this.name === 'rifd-evidence-analysis')
        throw new DOMException('Cleanup interrupted', 'UnknownError');
      return transaction.apply(this, args);
    };
    const observed = await demo.inspectReset();
    if (!observed.ok) throw new Error('reset context');
    const reset = await window.commitOn(demo, {
      kind: 'resetDemo',
      context: observed.value,
      confirmed: true,
    });
    release(nativeIdentity());
    await pending;
    const end = Date.now() + 5000;
    while (demo.analysisAvailability().cleanup === 'pending' && Date.now() < end)
      await new Promise(resolve => setTimeout(resolve, 10));
    const failed = demo.analysisAvailability(),
      old = handle.read();
    await demo.signIn('mariam');
    const financing = await demo.readApplication(identityInput.applicationId);
    IDBDatabase.prototype.transaction = transaction;
    window.dispatchEvent(new Event('focus'));
    while (demo.analysisAvailability().cleanup !== 'complete' && Date.now() < end)
      await new Promise(resolve => setTimeout(resolve, 10));
    const restored = demo.createEvidenceAssistance(identityInput);
    await restored.inspect();
    return {
      datasetId,
      reset,
      failed,
      recovered: demo.analysisAvailability(),
      old,
      restored: restored.read(),
      financing,
    };
  });
  expect(result.reset.ok && result.reset.value.datasetId).not.toBe(result.datasetId);
  expect(result.failed.cleanup).toBe('unavailable');
  expect(result.recovered.cleanup).toBe('complete');
  expect(result.old.result).toBeNull();
  expect(result.restored.result).toBeNull();
  expect(result.financing.ok).toBe(true);
});

declare global {
  interface Window {
    analysisOpenAttempts: string[];
    analysisHandle: import('../../../src/evidence-assistance/contract').EvidenceAssistance;
  }
}

test('an aborted retention transaction keeps the previous durable analysis and the new result temporary', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixture = '/tests/browser/support/evidence-fixtures.ts',
      fault = '/tests/browser/support/analysis-fixtures.ts';
    const { identityDemo, identityInput } = (await import(
      fixture
    )) as typeof import('../support/evidence-fixtures');
    const { abortNextAnalysisRetention } = (await import(
      fault
    )) as typeof import('../support/analysis-fixtures');
    const { demo } = await identityDemo();
    const handle = demo.createEvidenceAssistance(identityInput);
    await handle.run();
    const original = handle.read();
    abortNextAnalysisRetention();
    await handle.run();
    const temporary = handle.read();
    handle.dispose();
    const restored = demo.createEvidenceAssistance(identityInput);
    await restored.inspect();
    return {
      original,
      temporary,
      restored: restored.read(),
      financing: await demo.readApplication(identityInput.applicationId),
    };
  });
  expect(result.temporary).toMatchObject({
    status: 'completed',
    storage: 'temporary-only',
    result: { temporary: true },
  });
  expect(result.temporary.result?.id).not.toBe(result.original.result?.id);
  expect(result.restored.result?.id).toBe(result.original.result?.id);
  expect(result.restored.result?.expiresAt).toBe(result.original.result?.expiresAt);
  expect(result.financing.ok).toBe(true);
});

test('retained applicant analysis stays private and never enters print or notifications', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixture = '/tests/browser/support/evidence-fixtures.ts';
    const { identityDemo, identityInput } = (await import(
      fixture
    )) as typeof import('../support/evidence-fixtures');
    const { demo } = await identityDemo();
    const print = await demo.readPrintSummary(identityInput.applicationId),
      notifications = await demo.readNotifications();
    const handle = demo.createEvidenceAssistance(identityInput);
    await handle.run();
    const original = handle.read();
    const afterPrint = await demo.readPrintSummary(identityInput.applicationId),
      afterNotifications = await demo.readNotifications();
    await demo.signOut();
    const signedOut = handle.read();
    await demo.signIn('salma');
    const staff = demo.createEvidenceAssistance(identityInput);
    await staff.inspect();
    const unauthorized = staff.read();
    const draft = await demo.readApplication(identityInput.applicationId);
    await demo.signIn('mariam');
    const owner = demo.createEvidenceAssistance(identityInput);
    await owner.inspect();
    return {
      print,
      notifications,
      afterPrint,
      afterNotifications,
      original,
      signedOut,
      unauthorized,
      draft,
      restored: owner.read(),
    };
  });
  expect(result.afterPrint).toEqual(result.print);
  expect(result.afterNotifications).toEqual(result.notifications);
  expect(result.signedOut.result).toBeNull();
  expect(result.unauthorized.result).toBeNull();
  expect(result.draft.ok).toBe(false);
  expect(result.restored.result?.id).toBe(result.original.result?.id);
});

test('financing startup failure never creates analysis storage', async ({ page }) => {
  await page.addInitScript(() => {
    window.analysisOpenAttempts = [];
    indexedDB.open = (name, version) => {
      if (name === 'rifd-demo') throw new DOMException('Financing unavailable', 'SecurityError');
      window.analysisOpenAttempts.push(`${name}/${version}`);
      throw new Error('Analysis must not open before financing');
    };
  });
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({
    ok: false,
    error: { kind: 'storage' },
  });
  const state = await page.evaluate(async () => {
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
  expect(state.result).toBeNull();
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => window.analysisOpenAttempts)).toEqual([]);
});

test('clear returns its actual outcome and updates availability after storage recovery', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixture = '/tests/browser/support/evidence-fixtures.ts',
      faults = '/tests/browser/support/analysis-fixtures.ts';
    const { identityDemo, identityInput } = (await import(
      fixture
    )) as typeof import('../support/evidence-fixtures');
    const { alterAnalysis } = (await import(
      faults
    )) as typeof import('../support/analysis-fixtures');
    const { demo } = await identityDemo();
    const handle = demo.createEvidenceAssistance(identityInput);
    await handle.run();
    await alterAnalysis(run => {
      run.schemaVersion = 99;
    });
    await handle.refresh();
    const incompatible = handle.read(),
      cleared = await handle.clear(),
      available = handle.read();
    const transaction = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase['transaction']>) {
      if (this.name === 'rifd-evidence-analysis') throw new Error('Storage unavailable');
      return transaction.apply(this, args);
    };
    const failed = await handle.clear(),
      unavailable = handle.read();
    IDBDatabase.prototype.transaction = transaction;
    const recovered = await handle.clear(),
      final = handle.read();
    await demo.signOut();
    const refused = await handle.clear();
    return { incompatible, cleared, available, failed, unavailable, recovered, final, refused };
  });
  expect(result.incompatible.storage).toBe('incompatible');
  expect(result.cleared).toMatchObject({ ok: true });
  expect(result.available.storage).toBe('available');
  expect(result.failed).toMatchObject({ ok: false });
  expect(result.unavailable.storage).toBe('temporary-only');
  expect(result.recovered).toMatchObject({ ok: true });
  expect(result.final.storage).toBe('available');
  expect(result.refused).toMatchObject({ ok: false });
});
