import { expect, test } from '@playwright/test';

test('financial checks use the completed months and normalized declarations without changing financing data', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/financial-evidence-fixtures.ts',
      identity = '/tests/browser/support/evidence-fixtures.ts';
    const { financialInput, financialFile, attachFinancial, nativeFinancial } = (await import(
      fixtures
    )) as typeof import('../support/financial-evidence-fixtures');
    const { identityDemo } = (await import(
      identity
    )) as typeof import('../support/evidence-fixtures');
    const requests: import('../../../src/evidence-assistance/contract').StageRequest[] = [];
    const { demo } = await identityDemo({
      async evaluate(request) {
        requests.push(request);
        return nativeFinancial(request, { monthlyPages: true });
      },
    });
    const attachment = await attachFinancial(await financialFile(4, { monthlyPages: true }));
    const before = await demo.readApplication(financialInput.applicationId);
    const handle = demo.createEvidenceAssistance({ ...financialInput, attachment });
    await handle.run();
    return {
      state: handle.read(),
      before,
      after: await demo.readApplication(financialInput.applicationId),
      requests: requests.map(({ state, stage, questions, plan }) => ({
        state,
        stage,
        questions,
        plan,
      })),
    };
  });
  expect(result.state.status, JSON.stringify(result.state)).toBe('completed');
  expect(result.before).toEqual(result.after);
  expect(result.state.result?.findings).toMatchObject({
    periodSupport: 'consistent',
    revenueSupport: 'consistent',
    expensesSupport: 'consistent',
    month1RevenuePresence: 'present',
    month3ExpensesPresence: 'present',
  });
  expect(result.requests).toHaveLength(5);
  expect(result.requests[0].state.declaredFinancial).toEqual({
    initialSubmissionMonth: '2026-10',
    expectedMonths: ['2026-07', '2026-08', '2026-09'],
    revenue: '163200',
    expenses: '81600',
  });
  expect(
    result.requests.every(
      request =>
        Object.keys(request.questions).length <= (request.stage === 'document-comparison' ? 4 : 32),
    ),
  ).toBe(true);
});

for (const scenario of [
  'wrong period',
  'partial pages',
  'missing context',
  'unavailable comparison',
  'unreadable page',
  'context overflow',
] as const)
  test(`financial findings preserve coverage and period guards with ${scenario}`, async ({
    page,
  }) => {
    await page.goto('/tests/browser/support/api.html');
    await page.waitForFunction(() => window.demo);
    const result = await page.evaluate(async scenario => {
      const fixtures = '/tests/browser/support/financial-evidence-fixtures.ts',
        identity = '/tests/browser/support/evidence-fixtures.ts';
      const { financialInput, financialFile, attachFinancial, nativeFinancial } = (await import(
        fixtures
      )) as typeof import('../support/financial-evidence-fixtures');
      const { identityDemo } = (await import(
        identity
      )) as typeof import('../support/evidence-fixtures');
      const requests: import('../../../src/evidence-assistance/contract').StageRequest[] = [];
      const { demo } = await identityDemo({
        async evaluate(request) {
          requests.push(request);
          if (
            (scenario === 'partial pages' &&
              request.image.manifest.page === 2 &&
              request.stage === 'page') ||
            (['unavailable comparison', 'context overflow'].includes(scenario) &&
              request.stage === 'document-comparison')
          )
            throw new Error(scenario === 'context overflow' ? 'context-limit' : 'unavailable');
          const response = nativeFinancial(request, {
            ...(scenario === 'wrong period' ? { period: 'different' } : {}),
            revenue: 'conflict',
            unreadable:
              scenario === 'unreadable page' &&
              request.image.manifest.page === 2 &&
              request.stage === 'page',
          });
          // Put amount answers before the period answer to exercise order-independent guards.
          response.answers = Object.fromEntries(
            Object.entries(response.answers).sort(
              ([a], [b]) => Number(a.startsWith('period')) - Number(b.startsWith('period')),
            ),
          );
          return response;
        },
      });
      const attachment = await attachFinancial(
        await financialFile(2, { wrongPeriod: scenario === 'wrong period', conflict: true }),
      );
      const handle = demo.createEvidenceAssistance({
        ...financialInput,
        attachment,
        ...(scenario === 'missing context'
          ? { declaredFinancial: { revenue: '', expenses: 'not money' } }
          : {}),
      });
      await handle.run();
      const state = handle.read(),
        findings = state.result?.findings;
      return {
        state,
        keys: Object.keys(findings ?? {}),
        requests: requests.map(({ stage, questions, images, image }) => ({
          stage,
          questions: Object.keys(questions),
          pages: [image, ...(images ?? [])].map(image => image.manifest.page),
        })),
      };
    }, scenario);
    expect(result.state.status, JSON.stringify(result.state)).toBe('completed');
    expect(result.keys.indexOf('periodSupport')).toBeLessThan(
      result.keys.indexOf('revenueSupport'),
    );
    if (scenario === 'wrong period')
      expect(result.state.result?.findings).toMatchObject({
        periodSupport: 'different',
        revenueSupport: 'undetermined',
        expensesSupport: 'undetermined',
      });
    if (scenario === 'partial pages' || scenario === 'unreadable page') {
      expect(result.state.coverage).toMatchObject({
        totalPages: 2,
        successful: scenario === 'partial pages' ? [1] : [1, 2],
        failed: scenario === 'partial pages' ? [2] : [],
        unreadable: scenario === 'unreadable page' ? [2] : [],
        unchecked: scenario === 'partial pages' ? [2] : [],
      });
      expect(result.state.result?.findings).toMatchObject({
        periodSupport: 'undetermined',
        revenueSupport: 'conflict',
        expensesSupport: 'undetermined',
      });
      expect(result.requests.at(-1)?.pages).toEqual([1]);
    }
    if (scenario === 'missing context') {
      expect(result.state.result?.findings).toMatchObject({
        periodSupport: 'consistent',
        revenueSupport: 'missing-context',
        expensesSupport: 'missing-context',
        month2RevenuePresence: 'present',
      });
      expect(
        result.requests.every(
          request =>
            !request.questions.includes('revenueSupport') &&
            !request.questions.includes('expensesSupport'),
        ),
      ).toBe(true);
    }
    if (scenario === 'unavailable comparison' || scenario === 'context overflow') {
      expect(result.state.result?.findings).toMatchObject({
        periodSupport: 'unavailable',
        revenueSupport: 'conflict',
        expensesSupport: 'unavailable',
      });
      expect(result.state.result?.stages).toContainEqual({
        stage: 'document-comparison',
        outcome: 'unavailable',
        reason: scenario === 'context overflow' ? 'context-limit' : 'unavailable',
      });
    }
  });
