import { expect, test, type Page } from '@playwright/test';

test.use({ storageState: 'test-results/seed/api-full.json' });

// Historical and damaged storage fixtures exercise recovery through Demo.
async function storedBytes(page: Page, bytes: unknown) {
  await page.evaluate(() => window.demo.dispose());
  await page.evaluate(async bytes => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('rifd-demo');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const data = await new Promise<{ files: { id: string; bytes: unknown; hash: string }[] }>(
      resolve => {
        const request = db.transaction('state').objectStore('state').get('dataset');
        request.onsuccess = () => resolve(request.result);
      },
    );
    const file = data.files.find(file => file.id === 'sample-oversized')!;
    if (bytes === 'legacy' || bytes === 'nonzero') {
      const buffer = new Uint8Array(5_000_001);
      if (bytes === 'nonzero') buffer[buffer.length - 1] = 1;
      file.bytes = buffer.buffer;
      file.hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buffer))]
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
    } else file.bytes = bytes;
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('state', 'readwrite');
      tx.objectStore('state').put(data, 'dataset');
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  }, bytes);
}

async function sample(page: Page) {
  return page.evaluate(async () => {
    const result = await window.demo.readSample('RIFD-2026-001', 'sample-oversized');
    if (!result.ok) throw new Error('Oversized sample unavailable');
    const bytes = new Uint8Array(result.value.bytes);
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    return {
      length: bytes.length,
      zeros: bytes.every(byte => byte === 0),
      last: bytes.at(-1),
      hashMatches: hash === result.value.hash,
    };
  });
}

test('zero encoding and legacy buffers restore exact sample bytes through reload, offline reads and a superseded reset', async ({
  page,
  context,
}) => {
  await page.goto('/tests/browser/support/api.html?full=1');
  await page.waitForFunction(() => window.demo);
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true });
  expect(await page.evaluate(() => window.demo.signIn('mariam'))).toMatchObject({ ok: true });
  for (const bytes of [{ encoding: 'rifd-zero-v1', byteLength: 5_000_001 }, 'legacy', 'nonzero']) {
    await storedBytes(page, bytes);
    expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true });
    expect(await sample(page)).toEqual({
      length: 5_000_001,
      zeros: bytes !== 'nonzero',
      last: bytes === 'nonzero' ? 1 : 0,
      hashMatches: true,
    });
  }
  expect(
    await page.evaluate(async () => {
      const current = await window.demo.context();
      if (!current.ok) throw new Error('No context');
      return window.commit({
        kind: 'setLanguage',
        expectedRevision: current.value.preferences.revision,
        language: 'en',
      });
    }),
  ).toMatchObject({ ok: true });
  await page.reload();
  await page.waitForFunction(() => window.demo);
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true });
  await context.setOffline(true);
  expect(await sample(page)).toEqual({
    length: 5_000_001,
    zeros: false,
    last: 1,
    hashMatches: true,
  });
  await context.setOffline(false);
  const command = await page.evaluate(async () => {
    const current = await window.demo.inspectReset();
    if (!current.ok) throw new Error('No reset context');
    return { kind: 'resetDemo' as const, context: current.value, confirmed: true as const };
  });
  expect(await page.evaluate(command => window.commit(command), command)).toMatchObject({
    ok: true,
    value: { replay: false },
  });
  await page.reload();
  await page.waitForFunction(() => window.demo);
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true });
  // The reloaded tab cannot resend the reset's operation id, and its old dataset
  // context is superseded, so repeating the intent does not reset again.
  expect(await page.evaluate(command => window.commit(command), command)).toMatchObject({
    ok: false,
    error: { kind: 'supersededDataset' },
  });
  expect(await page.evaluate(() => window.demo.signIn('mariam'))).toMatchObject({ ok: true });
  expect(await sample(page)).toEqual({
    length: 5_000_001,
    zeros: true,
    last: 0,
    hashMatches: true,
  });
});

for (const bytes of [
  { encoding: 'rifd-zero-v2', byteLength: 5_000_001 },
  { encoding: 'rifd-zero-v1', byteLength: -1 },
  { encoding: 'rifd-zero-v1', byteLength: 5_000_002 },
  { encoding: 'rifd-zero-v1', byteLength: 100_000.5 },
  { encoding: 'rifd-zero-v1', byteLength: 5_000_001, extra: true },
])
  test(`damaged zero-buffer descriptor requires recovery: ${JSON.stringify(bytes)}`, async ({
    page,
  }) => {
    await page.goto('/tests/browser/support/api.html?full=1');
    await page.waitForFunction(() => window.demo);
    expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true });
    await storedBytes(page, bytes);
    expect(await page.evaluate(() => window.demo.startup())).toMatchObject({
      ok: false,
      error: { kind: 'damaged' },
    });
  });
