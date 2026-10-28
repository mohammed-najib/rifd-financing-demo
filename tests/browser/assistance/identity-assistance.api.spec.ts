import { expect, test } from '@playwright/test';

test('identity checking uses authorized source pixels and leaves financing data untouched', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const demoModule = '/src/demo/index.ts',
      transportModule = '/tests/browser/support/evidence-transport.ts';
    const { createDemo } = (await import(demoModule)) as typeof import('../../../src/demo');
    const { fakeEvidenceTransport } = (await import(
      transportModule
    )) as typeof import('../support/evidence-transport');
    window.demo.dispose();
    const requests: import('../../../src/evidence-assistance/contract').StageRequest[] = [];
    const demo = createDemo({ evidenceTransport: fakeEvidenceTransport(requests) });
    await demo.startup();
    await demo.signIn('mariam');
    const before = await demo.readApplication('RIFD-2026-001');
    const assistance = demo.createEvidenceAssistance({
      action: 'check-document',
      applicationId: 'RIFD-2026-001',
      slot: 'identity',
      audience: 'applicant',
      context: 'draft',
    });
    const selected = await assistance.inspect();
    await assistance.run();
    const state = assistance.read();
    const after = await demo.readApplication('RIFD-2026-001');
    assistance.dispose();
    demo.dispose();
    return {
      before,
      after,
      selectedHash: selected.ok && selected.value.source.hash,
      state,
      requests: requests.map(request => ({
        ...request,
        image: { ...request.image, bytes: undefined },
      })),
    };
  });
  expect(result.before).toEqual(result.after);
  expect(result.state.status).toBe('completed');
  expect(result.state.result?.findings).toMatchObject({
    category: 'identity',
    readability: 'clear',
    namePresence: 'present',
    nameSupport: 'different',
  });
  expect(result.state.result?.coverage).toMatchObject({
    totalPages: 1,
    selected: [1],
    successful: [1],
    unchecked: [],
    failed: [],
  });
  expect(result.state.result?.provenance.source.hash).toBe(result.selectedHash);
  expect(result.state.result?.provenance.native.answers.readability?.score).toBe(1.995);
  expect(result.requests).toHaveLength(1);
  expect(result.requests[0].plan.maximumAttempts).toBe(2);
  expect(Object.keys(result.requests[0].questions)).toEqual([
    'category',
    'readability',
    'namePresence',
    'nameSupport',
    'fullNameBox',
    'fullNameMultiplicity',
  ]);
});

test('source-only findings survive missing declarations, uncertainty and unavailable comparisons', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixturesPath = '/tests/browser/support/evidence-fixtures.ts',
      transportPath = '/tests/browser/support/evidence-transport.ts';
    const { identityDemo, identityInput } = (await import(
      fixturesPath
    )) as typeof import('../support/evidence-fixtures');
    const { nativeIdentity } = (await import(
      transportPath
    )) as typeof import('../support/evidence-transport');
    let native: unknown = nativeIdentity();
    const requests: import('../../../src/evidence-assistance/contract').StageRequest[] = [];
    const { demo } = await identityDemo({
      async evaluate(request) {
        requests.push(request);
        return native;
      },
    });
    const check = async (declaredName?: string) => {
      const handle = demo.createEvidenceAssistance({ ...identityInput, declaredName });
      await handle.run();
      const state = handle.read();
      handle.dispose();
      return state;
    };
    const missing = await check('');
    const invalid = await check('x'.repeat(101));
    native = {
      ...nativeIdentity(),
      answers: {
        ...nativeIdentity().answers,
        category: { ...nativeIdentity().answers.category, confidence: 0.98 },
        namePresence: { type: 'noul', noul: 0.5 },
        readability: {
          ...nativeIdentity().answers.readability,
          score: 1.4,
          probabilities: { '0': 0, '1': 0.6, '2': 0.4 },
        },
      },
    };
    const uncertain = await check();
    native = {
      ...nativeIdentity(),
      answers: {
        ...nativeIdentity().answers,
        namePresence: { type: 'noul', noul: 0.01 },
        nameSupport: {
          type: 'choice',
          choice: 'not_found',
          confidence: 0.99,
          probabilities: { consistent: 0, different: 0, not_found: 1, conflict: 0, uncertain: 0 },
        },
      },
    };
    const absent = await check();
    native = { ...nativeIdentity(), answers: { ...nativeIdentity().answers, nameSupport: null } };
    const comparisonFailed = await check();
    native = { ...nativeIdentity(), usage: null };
    const usageFailed = await check();
    return {
      missing,
      invalid,
      uncertain,
      absent,
      comparisonFailed,
      usageFailed,
      questions: requests.slice(0, 2).map(request => Object.keys(request.questions)),
      context: requests[0].state,
    };
  });
  for (const state of [result.missing, result.invalid])
    expect(state.result?.findings).toMatchObject({
      category: 'identity',
      readability: 'clear',
      namePresence: 'present',
      nameSupport: 'missing-context',
    });
  expect(result.questions).toEqual([
    ['category', 'readability', 'namePresence', 'fullNameBox', 'fullNameMultiplicity'],
    ['category', 'readability', 'namePresence', 'fullNameBox', 'fullNameMultiplicity'],
  ]);
  expect(result.context.declaredApplicantName).toBeNull();
  expect(result.uncertain.result?.findings).toEqual({
    category: 'undetermined',
    readability: 'undetermined',
    namePresence: 'undetermined',
    nameSupport: 'undetermined',
  });
  expect(result.absent.result?.findings).toMatchObject({
    namePresence: 'absent',
    nameSupport: 'not_found',
  });
  expect(result.comparisonFailed.result?.findings).toMatchObject({
    category: 'identity',
    namePresence: 'present',
    nameSupport: 'unavailable',
  });
  expect(result.usageFailed).toMatchObject({ status: 'unavailable', reason: 'invalid-response' });
  expect(result.usageFailed.result?.id).toBe(result.comparisonFailed.result?.id);
});

test('actual PNG, oriented JPEG and proven one-page PDF retain complete raster geometry', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const results = await page.evaluate(async () => {
    const path = '/tests/browser/support/evidence-fixtures.ts';
    const { identityDemo, identityInput, attachIdentity, imageFile, pdfFile } = (await import(
      path
    )) as typeof import('../support/evidence-fixtures');
    const { demo } = await identityDemo();
    const results = [];
    for (const file of [
      await imageFile('image/png', 180, 600),
      await imageFile('image/jpeg', 640, 960, 6),
      await pdfFile(1, 90),
    ]) {
      const attachment = await attachIdentity(file);
      const handle = demo.createEvidenceAssistance({ ...identityInput, attachment });
      const source = await handle.inspect();
      await handle.run();
      const state = handle.read();
      results.push({ state, sourceHash: source.ok && source.value.source.hash });
      handle.dispose();
    }
    return results;
  });
  for (const result of results) {
    expect(result.state.status, JSON.stringify(result.state)).toBe('completed');
    expect(result.state.result?.provenance.raster.sourceHash).toBe(result.sourceHash);
    expect(result.state.result?.provenance.raster.rasterHash).toMatch(/^[a-f0-9]{64}$/);
  }
  expect(results[0].state.result?.provenance.raster).toMatchObject({
    width: 280,
    height: 600,
    padding: { left: 50, right: 50, top: 0, bottom: 0 },
  });
  expect(results[1].state.result?.provenance.raster).toMatchObject({
    width: 960,
    height: 640,
    sourceWidth: 640,
    sourceHeight: 960,
    uprightWidth: 960,
    uprightHeight: 640,
    orientation: 6,
  });
  expect(results[2].state.result?.provenance.raster).toMatchObject({
    width: 700,
    height: 500,
    rotation: 90,
    renderer: 'pdfjs-5.4.296',
    resources: 'pdfjs-5.4.296',
  });
});

test('sources requiring narrower selection, incomplete and oversized sources stay inspectable without dispatch', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const path = '/tests/browser/support/evidence-fixtures.ts';
    const { identityDemo, identityInput, attachIdentity, imageFile, pdfFile } = (await import(
      path
    )) as typeof import('../support/evidence-fixtures');
    let dispatched = 0;
    const { demo } = await identityDemo({
      async evaluate() {
        dispatched++;
        throw new Error('must not dispatch');
      },
    });
    const png = new Uint8Array(await (await imageFile('image/png')).arrayBuffer());
    const large = png.slice();
    new DataView(large.buffer).setUint32(16, 8193);
    const encrypted = await (
      await fetch('/tests/browser/fixtures/identity-encrypted.pdf')
    ).arrayBuffer();
    const files = [
      await pdfFile(5),
      new File([png.slice(0, 40)], 'incomplete.png', { type: 'image/png' }),
      new File([large], 'oversized.png', { type: 'image/png' }),
      await pdfFile(101),
      new File([encrypted], 'encrypted.pdf', { type: 'application/pdf' }),
    ];
    const states = [],
      sources = [];
    for (const file of files) {
      const attachment = await attachIdentity(file);
      const handle = demo.createEvidenceAssistance({ ...identityInput, attachment });
      await handle.run();
      states.push(handle.read());
      sources.push((await demo.readPrepared(identityInput.applicationId, attachment)).ok);
      handle.dispose();
    }
    return { states, sources, dispatched };
  });
  expect(result.dispatched).toBe(0);
  expect(result.sources).toEqual([true, true, true, true, true]);
  expect(result.states.map(state => state.reason)).toEqual([
    'page-selection',
    'invalid-source',
    'source-limit',
    'source-limit',
    'invalid-source',
  ]);
  expect(result.states[0].coverage).toMatchObject({
    totalPages: 5,
    successful: [],
    unchecked: [1, 2, 3, 4, 5],
    dispatched: [],
  });
});

test('cancel, retry, edits, replacement, sign-out and disposal cannot publish late answers', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const path = '/tests/browser/support/evidence-fixtures.ts',
      transportPath = '/tests/browser/support/evidence-transport.ts';
    const { identityDemo, identityInput, attachIdentity, imageFile } = (await import(
      path
    )) as typeof import('../support/evidence-fixtures');
    const { nativeIdentity } = (await import(
      transportPath
    )) as typeof import('../support/evidence-transport');
    let complete: (value: unknown) => void = () => {},
      held = true;
    const runIds: string[] = [];
    const { demo, datasetId } = await identityDemo({
      evaluate(request) {
        runIds.push(request.runId);
        return held
          ? new Promise(resolve => {
              complete = resolve;
            })
          : Promise.resolve(nativeIdentity());
      },
    });
    const dispatched = async (
      handle: import('../../../src/evidence-assistance/contract').EvidenceAssistance,
    ) => {
      const end = Date.now() + 10_000;
      while (handle.read().status !== 'running') {
        if (Date.now() > end || handle.read().status === 'unavailable')
          throw new Error(JSON.stringify(handle.read()));
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    };
    const handle = demo.createEvidenceAssistance(identityInput);
    let pending = handle.run();
    await dispatched(handle);
    handle.cancel();
    complete(nativeIdentity());
    await pending;
    const cancelled = handle.read();
    held = false;
    await handle.run();
    const retried = handle.read();
    const before = await demo.readApplication(identityInput.applicationId);
    if (!before.ok || before.value.role !== 'applicant') throw new Error('view');
    const documents = Object.fromEntries(
      Object.entries(before.value.workspace!.snapshot.documents).map(([slot, fileId]) => [
        slot,
        { kind: 'saved', fileId },
      ]),
    ) as import('../../../src/demo').DraftDocuments;
    await window.commitOn(demo, {
      kind: 'saveDraft',
      applicationId: identityInput.applicationId,
      datasetId,
      product: before.value.product,
      fields: { ...before.value.workspace!.snapshot.fields, fullName: 'New Fictional Name' },
      documents,
    });
    await handle.inspect();
    await new Promise(resolve => setTimeout(resolve, 100));
    const edited = handle.read();
    handle.dispose();
    held = true;
    const replaced = demo.createEvidenceAssistance(identityInput);
    pending = replaced.run();
    await dispatched(replaced);
    await attachIdentity(await imageFile('image/png'));
    complete(nativeIdentity());
    await pending;
    const replacement = replaced.read();
    replaced.dispose();
    demo.cancelPreparation(identityInput.applicationId, 'identity');
    const signedOut = demo.createEvidenceAssistance(identityInput);
    pending = signedOut.run();
    await dispatched(signedOut);
    await demo.signOut();
    complete(nativeIdentity());
    await pending;
    const lostAuthority = signedOut.read();
    signedOut.dispose();
    await demo.signIn('mariam');
    const disposed = demo.createEvidenceAssistance(identityInput);
    pending = disposed.run();
    await dispatched(disposed);
    disposed.dispose();
    complete(nativeIdentity());
    await pending;
    return {
      cancelled,
      retried,
      edited,
      replacement,
      lostAuthority,
      disposed: disposed.read(),
      runIds,
    };
  });
  expect(result.cancelled).toMatchObject({ status: 'cancelled', result: null });
  expect(result.retried.status).toBe('completed');
  expect(result.edited).toMatchObject({
    status: 'unavailable',
    reason: 'stale',
    result: { stale: true, findings: { nameSupport: 'unavailable' } },
  });
  expect(result.replacement).toMatchObject({
    status: 'unavailable',
    reason: 'stale',
    result: { stale: true, findings: { nameSupport: 'unavailable' } },
  });
  expect(result.lostAuthority).toMatchObject({
    status: 'unavailable',
    reason: 'unauthorized',
    result: null,
  });
  expect(result.disposed).toMatchObject({ status: 'disposed', result: null });
  expect(new Set(result.runIds).size).toBe(result.runIds.length);
});

test('ordinary runtime and unauthorized contexts cannot obtain fake live results', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const path = '/tests/browser/support/evidence-fixtures.ts';
    const { identityInput } = (await import(path)) as typeof import('../support/evidence-fixtures');
    const demo = window.demo;
    await demo.startup();
    await demo.signIn('mariam');
    const allowed = demo.createEvidenceAssistance(identityInput);
    await allowed.run();
    const states = [allowed.read()];
    allowed.dispose();
    for (const input of [
      { ...identityInput, applicationId: 'RIFD-2026-002' },
      { ...identityInput, applicationId: 'RIFD-2026-007' },
      { ...identityInput, slot: 'business' as const },
    ]) {
      const handle = demo.createEvidenceAssistance(input);
      await handle.run();
      states.push(handle.read());
      handle.dispose();
    }
    await demo.signIn('salma');
    const staff = demo.createEvidenceAssistance(identityInput);
    await staff.run();
    states.push(staff.read());
    staff.dispose();
    return states;
  });
  expect(result[0]).toMatchObject({
    status: 'unavailable',
    reason: 'live-unavailable',
    result: null,
  });
  expect(
    result.slice(1).every(state => state.status === 'unavailable' && state.result === null),
  ).toBe(true);
});

test('provider deadline stops unavailable work without automatic retries', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const path = '/tests/browser/support/evidence-fixtures.ts';
    const { identityDemo, identityInput } = (await import(
      path
    )) as typeof import('../support/evidence-fixtures');
    let attempts = 0;
    const { demo } = await identityDemo({
      evaluate() {
        attempts++;
        return new Promise(() => {});
      },
    });
    const handle = demo.createEvidenceAssistance(identityInput);
    await handle.run();
    return { attempts, state: handle.read() };
  });
  expect(result.attempts).toBe(1);
  expect(result.state).toMatchObject({
    status: 'unavailable',
    reason: 'provider-unavailable',
    result: null,
    coverage: { dispatched: [1], successful: [], failed: [1], unchecked: [1] },
  });
});

test('a missing PDF resource and a preparation timeout preserve ordinary inspection', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  await page.route('**/pdfjs/5.4.296/standard_fonts/**', route => route.fulfill({ status: 404 }));
  const resourceFailure = await page.evaluate(async () => {
    const path = '/tests/browser/support/evidence-fixtures.ts';
    const { identityDemo, identityInput, attachIdentity, pdfFile } = (await import(
      path
    )) as typeof import('../support/evidence-fixtures');
    const { demo } = await identityDemo({
      evaluate() {
        throw new Error('must not dispatch');
      },
    });
    const attachment = await attachIdentity(await pdfFile(1));
    const handle = demo.createEvidenceAssistance({ ...identityInput, attachment });
    await handle.run();
    const state = handle.read();
    handle.dispose();
    return {
      state,
      readable: (await demo.readPrepared(identityInput.applicationId, attachment)).ok,
    };
  });
  expect(resourceFailure).toMatchObject({
    state: { status: 'unavailable', reason: 'invalid-source', coverage: { dispatched: [] } },
    readable: true,
  });
  await page.route('**/prepare.worker.ts?worker_file&type=module', route =>
    route.fulfill({ contentType: 'application/javascript', body: 'self.onmessage = () => {}' }),
  );
  const timeout = await page.evaluate(async () => {
    const path = '/tests/browser/support/evidence-fixtures.ts';
    const { identityInput } = (await import(path)) as typeof import('../support/evidence-fixtures');
    window.demo.cancelPreparation(identityInput.applicationId, 'identity');
    const handle = window.demo.createEvidenceAssistance(identityInput);
    await handle.run();
    const state = handle.read();
    handle.dispose();
    return state;
  });
  expect(timeout).toMatchObject({
    status: 'unavailable',
    reason: 'preparation-timeout',
    coverage: { dispatched: [] },
  });
});
