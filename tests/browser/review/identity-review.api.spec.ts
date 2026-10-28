import { expect, test } from '@playwright/test';

test('incomplete JPEG scan data cannot be sent as complete evidence even if a browser repairs it', async ({
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
    let dispatched = 0;
    const { demo } = await identityDemo({
      async evaluate() {
        dispatched++;
        return nativeIdentity();
      },
    });
    const original = new Uint8Array(await (await imageFile('image/jpeg')).arrayBuffer());
    const file = new File(
      [original.slice(0, Math.floor(original.length * 0.5)), new Uint8Array([255, 217])],
      'incomplete.jpg',
      { type: 'image/jpeg' },
    );
    const attachment = await attachIdentity(file);
    const handle = demo.createEvidenceAssistance({ ...identityInput, attachment });
    await handle.run();
    return {
      dispatched,
      state: handle.read(),
      readable: (await demo.readPrepared(identityInput.applicationId, attachment)).ok,
    };
  });
  expect(result.dispatched).toBe(0);
  expect(result).toMatchObject({
    state: { status: 'unavailable', reason: 'invalid-source', result: null },
    readable: true,
  });
});

test('negative presence requires readable compatible evidence and an empty answer set fails its stage', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const path = '/tests/browser/support/evidence-fixtures.ts',
      transportPath = '/tests/browser/support/evidence-transport.ts';
    const { identityDemo, identityInput } = (await import(
      path
    )) as typeof import('../support/evidence-fixtures');
    const { nativeIdentity } = (await import(
      transportPath
    )) as typeof import('../support/evidence-transport');
    const fixture = nativeIdentity();
    let native: unknown = {
      ...fixture,
      answers: {
        ...fixture.answers,
        namePresence: { type: 'noul', noul: 0.01 },
        readability: {
          ...fixture.answers.readability,
          score: 0,
          probabilities: { '0': 1, '1': 0, '2': 0 },
        },
      },
    };
    const { demo } = await identityDemo({
      async evaluate() {
        return native;
      },
    });
    const first = demo.createEvidenceAssistance(identityInput);
    await first.run();
    const unreadable = first.read();
    first.dispose();
    native = {
      ...fixture,
      answers: {
        ...fixture.answers,
        namePresence: { type: 'noul', noul: 0.01 },
        category: {
          ...fixture.answers.category,
          choice: 'business',
          probabilities: { ...fixture.answers.category.probabilities, identity: 0, business: 1 },
        },
      },
    };
    const incompatible = demo.createEvidenceAssistance(identityInput);
    await incompatible.run();
    const incompatibleState = incompatible.read();
    incompatible.dispose();
    native = { ...fixture, answers: {} };
    const second = demo.createEvidenceAssistance(identityInput);
    await second.run();
    return { unreadable, incompatible: incompatibleState, empty: second.read() };
  });
  expect(result.unreadable.result?.findings).toMatchObject({
    readability: 'unreadable',
    namePresence: 'undetermined',
    nameSupport: 'undetermined',
  });
  expect(result.incompatible.result?.findings).toMatchObject({
    category: 'business',
    namePresence: 'undetermined',
    nameSupport: 'undetermined',
  });
  expect(result.empty).toMatchObject({ status: 'unavailable', reason: 'invalid-response' });
  expect(result.empty.result?.id).toBe(result.incompatible.result?.id);
  expect(result.empty.coverage).toMatchObject({
    successful: [],
    failed: [1],
    unchecked: [1],
    uncheckedCount: 1,
  });
  expect(result.empty.result?.coverage).toEqual(result.incompatible.coverage);
});

test('cancellation at the dispatch boundary sends no provider request', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const path = '/tests/browser/support/evidence-fixtures.ts',
      transportPath = '/tests/browser/support/evidence-transport.ts';
    const { identityDemo, identityInput } = (await import(
      path
    )) as typeof import('../support/evidence-fixtures');
    const { nativeIdentity } = (await import(
      transportPath
    )) as typeof import('../support/evidence-transport');
    let dispatched = 0;
    const { demo } = await identityDemo({
      async evaluate() {
        dispatched++;
        return nativeIdentity();
      },
    });
    const handle = demo.createEvidenceAssistance(identityInput);
    handle.subscribe(() => {
      if (handle.read().status === 'running') handle.cancel();
    });
    await handle.run();
    return { dispatched, state: handle.read() };
  });
  expect(result.dispatched).toBe(0);
  expect(result.state).toMatchObject({
    status: 'cancelled',
    result: null,
    coverage: { dispatched: [] },
  });
});
