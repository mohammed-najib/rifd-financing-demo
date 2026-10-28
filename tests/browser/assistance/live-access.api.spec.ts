import { expect, test } from '@playwright/test';
import { nativeBusiness, nativeIdentity } from '../support/evidence-transport';
import { validateRequest } from '../../../src/live-assistance/server/request';

test('a first unavailable run preserves inspected scope without inventing checked work', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const demo = window.demo;
    await demo.startup();
    await demo.signIn('mariam');
    const handle = demo.createEvidenceAssistance({
      action: 'check-document',
      applicationId: 'RIFD-2026-001',
      slot: 'business',
      audience: 'applicant',
      context: 'draft',
    });
    await handle.inspect();
    const before = await demo.readApplication('RIFD-2026-001');
    await handle.run([2]);
    const state = handle.read();
    handle.dispose();
    return { state, before, after: await demo.readApplication('RIFD-2026-001') };
  });
  expect(result.state).toMatchObject({
    status: 'unavailable',
    reason: 'live-unavailable',
    result: null,
    coverage: {
      totalPages: 2,
      selected: [2],
      prepared: [],
      dispatched: [],
      successful: [],
      failed: [],
      unreadable: [],
      unchecked: [1, 2],
      uncheckedCount: 2,
    },
  });
  expect(result.after).toEqual(result.before);
});

for (const explicitSelection of [false, true])
  test(`a first offline run keeps ${explicitSelection ? 'explicit' : 'default'} pages selectable and retries after reconnection`, async ({
    page,
    context,
  }) => {
    let sessions = 0;
    const submissions: { selectedPages: number[] }[] = [];
    await page.route('**/fake-guest-session', route => {
      sessions++;
      return route.fulfill({
        json: { authorization: 'Bearer dummy-guest', appCheck: 'dummy-app-check' },
      });
    });
    await page.route('**/api/evidence-analysis', route => {
      const body = route.request().postDataJSON() as { selectedPages: number[] };
      submissions.push(body);
      return route.fulfill({
        json: {
          status: 'completed',
          stages: [
            ...body.selectedPages.map(page => ({ stage: 'page', page, answer: nativeBusiness() })),
            { stage: 'document-comparison', page: body.selectedPages[0], answer: nativeBusiness() },
          ],
        },
      });
    });
    await page.goto('/tests/browser/support/evidence-screen.html?live');
    await page.getByRole('button', { name: 'English', exact: true }).click();
    const assistance = page
      .locator('section[aria-labelledby="business-heading"]')
      .locator('.evidence-assistance');
    await assistance.getByRole('button', { name: 'Check document', exact: true }).click();
    await expect(assistance.getByRole('button', { name: 'Run check', exact: true })).toBeEnabled();
    await assistance
      .locator('summary')
      .filter({ hasText: 'Select pages to check, at most four' })
      .click();
    if (explicitSelection)
      await assistance.getByRole('checkbox', { name: 'Page 1', exact: true }).uncheck();
    await context.setOffline(true);
    await assistance.getByRole('button', { name: 'Run check', exact: true }).click();
    await expect(assistance.getByRole('status')).toContainText(
      'Live analysis is currently unavailable',
    );
    await assistance.getByText('Check details', { exact: true }).click();
    await expect(assistance.getByText('Total source pages: 2', { exact: true })).toBeVisible();
    await expect(assistance.getByRole('checkbox', { name: 'Page 2', exact: true })).toBeChecked();
    await expect(
      assistance.getByRole('button', { name: 'Retry check', exact: true }),
    ).toBeEnabled();
    expect(sessions).toBe(0);
    expect(submissions).toHaveLength(0);
    await context.setOffline(false);
    await assistance.getByRole('button', { name: 'Retry check', exact: true }).click();
    await expect(assistance.locator('.check-result dl')).toBeVisible({ timeout: 30_000 });
    expect(sessions).toBe(1);
    expect(submissions).toHaveLength(1);
    expect(submissions[0].selectedPages).toEqual(explicitSelection ? [2] : [1, 2]);
  });

test('live access starts only after notice and explicit Run; allowance refusal preserves ordinary work', async ({
  page,
}) => {
  let sessions = 0;
  const requests: Record<string, unknown>[] = [];
  await page.route('**/fake-guest-session', route => {
    sessions++;
    return route.fulfill({
      json: { authorization: 'Bearer dummy-guest', appCheck: 'dummy-app-check' },
    });
  });
  await page.route('**/api/evidence-analysis', async route => {
    const headers = route.request().headers();
    expect(headers.authorization).toBe('Bearer dummy-guest');
    expect(headers['x-firebase-appcheck']).toBe('dummy-app-check');
    requests.push(route.request().postDataJSON());
    expect(
      (
        await validateRequest(
          Buffer.from(route.request().postData()!),
          new AbortController().signal,
        )
      ).maximumAttempts,
    ).toBe(2);
    return route.fulfill({
      status: 503,
      json: { status: 'unavailable', reason: 'guest-allowance' },
      headers: { 'Cache-Control': 'private, no-store' },
    });
  });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/tests/browser/support/evidence-screen.html?live');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  const slot = page.locator('section[aria-labelledby="identity-heading"]');
  await slot.getByRole('button', { name: 'Check document', exact: true }).click();
  const assistance = slot.getByRole('region', { name: 'Experimental assistance', exact: true });
  await assistance.getByText('Check details', { exact: true }).click();
  await assistance.getByText('How is check data used?', { exact: true }).click();
  await expect(
    assistance.getByText(/Starting a check creates a Firebase guest session/),
  ).toBeVisible();
  await expect(assistance.getByText('Selected: 1', { exact: true })).toBeVisible();
  expect(sessions).toBe(0);
  expect(requests).toHaveLength(0);
  await assistance.getByRole('button', { name: 'Run check', exact: true }).click();
  await expect(assistance.getByText(/used its analysis allowance/)).toBeVisible();
  expect(sessions).toBe(1);
  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({
    slot: 'identity',
    totalPages: 1,
    selectedPages: [1],
    pages: [{ page: 1, png: expect.any(String) }],
  });
  expect(Object.keys(requests[0])).not.toEqual(
    expect.arrayContaining(['applicationId', 'fileId', 'questions', 'model', 'prompt']),
  );
  await assistance.getByRole('button', { name: 'Show current source', exact: true }).click();
  await expect(assistance.getByRole('img')).toBeVisible();
  await expect(
    assistance.getByRole('button', { name: 'Retain document', exact: true }),
  ).toBeEnabled();
  await page.getByRole('button', { name: 'العربية', exact: true }).click();
  await expect(slot.getByText(/استهلكت جلسة الضيف/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(requests).toHaveLength(1);
});

test('the browser consumes request-local results once and offline retry creates no guest request', async ({
  page,
  context,
}) => {
  let sessions = 0,
    submissions = 0;
  await page.route('**/fake-guest-session', route => {
    sessions++;
    return route.fulfill({
      json: { authorization: 'Bearer dummy-guest', appCheck: 'dummy-app-check' },
    });
  });
  await page.route('**/api/evidence-analysis', route => {
    submissions++;
    return route.fulfill({
      json: {
        status: 'completed',
        stages: [{ stage: 'combined-page-declaration', page: 1, answer: nativeIdentity() }],
      },
    });
  });
  await page.goto('/tests/browser/support/evidence-screen.html?live');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  const slot = page.locator('section[aria-labelledby="identity-heading"]');
  await slot.getByRole('button', { name: 'Check document', exact: true }).click();
  const assistance = slot.getByRole('region', { name: 'Experimental assistance', exact: true });
  await assistance.getByRole('button', { name: 'Run check', exact: true }).click();
  await expect(
    assistance.getByText('Printed name appears different from the declared name', { exact: true }),
  ).toBeVisible();
  expect(submissions).toBe(1);
  await context.setOffline(true);
  await assistance.getByRole('button', { name: 'Retry check', exact: true }).click();
  await expect(assistance.getByText(/Live analysis is currently unavailable/)).toBeVisible();
  expect(submissions).toBe(1);
  expect(sessions).toBe(1);
  await expect(
    assistance.getByRole('button', { name: 'Retain document', exact: true }),
  ).toBeEnabled();
});
