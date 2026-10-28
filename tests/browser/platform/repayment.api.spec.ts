import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('historical repayment reads retain accepted terms when current product rules and browser dates change', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const original = await page.evaluate(async () => {
    await window.demo.startup();
    await window.demo.signIn('mariam');
    return window.demo.readApplication('RIFD-2026-005');
  });
  expect(original).toMatchObject({
    ok: true,
    value: {
      repayment: {
        amount: 1_200_000,
        term: 18,
        product: 'equipment',
        ruleVersion: 1,
        approvedAt: '2026-07-10',
        markup: 96_000,
        total: 1_296_000,
        completed: 144_000,
        remaining: 1_152_000,
      },
    },
  });
  if (!original.ok) throw new Error('No historical approval');
  expect(original.value.repayment?.rows).toHaveLength(18);
  expect(original.value.repayment?.rows.slice(0, 3)).toEqual([
    { due: '2026-08-15', amount: 72_000, status: 'completed' },
    { due: '2026-09-15', amount: 72_000, status: 'completed' },
    { due: '2026-10-15', amount: 72_000, status: 'upcoming' },
  ]);
  expect(original.value.repayment?.rows.at(-1)).toEqual({
    due: '2028-01-15',
    amount: 72_000,
    status: 'upcoming',
  });
  await page.clock.setSystemTime(new Date('2035-06-20T12:00:00Z'));
  for (const refresh of [false, true]) {
    if (refresh) {
      await page.reload();
      await page.waitForFunction(() => window.demo);
    }
    const read = await page.evaluate(async () => {
      // Change the actual exported rules, leaving the saved approval untouched.
      const modulePath = '/src/domain/index.ts';
      const { products } = (await import(
        /* @vite-ignore */ modulePath
      )) as typeof import('../../../src/domain');
      products.equipment.markupPercent = 99;
      products.equipment.terms = [6];
      await window.demo.startup();
      await window.demo.signIn('mariam');
      const applicant = await window.demo.readApplication('RIFD-2026-005');
      await window.demo.signIn('salma');
      const staff = await window.demo.readApplication('RIFD-2026-005');
      return { applicant, staff };
    });
    for (const result of [read.applicant, read.staff]) {
      expect(result.ok && result.value.repayment).toEqual(original.value.repayment);
      expect(result.ok && result.value.sharedRevision).toBe(original.value.sharedRevision);
    }
  }
});

test('repayment follows application ownership and submitted staff access with no data for forbidden reads', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const demo = window.demo;
    await demo.startup();
    const unsigned = await demo.readApplication('RIFD-2026-005');
    await demo.signIn('huda');
    const forbidden = await demo.readApplication('RIFD-2026-005');
    const missing = await demo.readApplication('RIFD-2026-missing');
    await demo.signIn('salma');
    const draft = await demo.readApplication('RIFD-2026-001');
    const states = await Promise.all(
      ['002', '004', '006', '007'].map(id => demo.readApplication(`RIFD-2026-${id}`)),
    );
    return { unsigned, forbidden, missing, draft, states };
  });
  expect(result.unsigned).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } });
  expect(result.forbidden).toEqual(result.missing);
  expect(result.draft).toEqual(result.missing);
  expect(result.states).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({ status: 'submitted', repayment: null }),
      }),
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({ status: 'correctionsRequested', repayment: null }),
      }),
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({ status: 'rejected', repayment: null }),
      }),
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({ status: 'underReview', repayment: null }),
      }),
    ]),
  );
});
