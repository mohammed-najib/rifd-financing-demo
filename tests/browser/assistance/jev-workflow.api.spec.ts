import { expect, test } from '@playwright/test';
import { createJevWorkflow } from '../../../src/live-assistance/server/jev';
import { createLiveService } from '../../../src/live-assistance/server/service';
import { createAdmission } from '../../../src/live-assistance/server/admission';
import { memoryStore } from '../../live/fixtures';
import {
  locatedIdentity,
  providerRequest,
  verifiedBounds,
  type ProviderRequest,
} from '../../live/provider';
import { nativeIdentity } from '../support/evidence-transport';
import { nativeFinancial } from '../support/financial-evidence-fixtures';
import type { PreparedPage } from '../../../src/evidence-assistance/contract';

test('browser analysis uses the admitted SDK workflow, restores exact highlights and leaves financing unchanged', async ({
  page,
}) => {
  const calls: ProviderRequest[] = [];
  const service = createLiveService({
    admission: createAdmission(memoryStore(), 'dummy-key-with-at-least-thirty-two-bytes'),
    authorize: async (auth, app) => {
      if (auth !== 'Bearer dummy-auth' || app !== 'dummy-app') throw Error('credentials');
      return 'guest';
    },
    execute: createJevWorkflow({
      apiKey: 'dummy-no-provider-access',
      fetch: async (_url, init) => {
        const request = await providerRequest(init);
        calls.push(request);
        return Response.json(
          calls.length === 1
            ? {
                ...nativeIdentity(),
                answers: { ...nativeIdentity().answers, ...locatedIdentity() },
              }
            : verifiedBounds(request),
          { headers: { 'x-typesafe-request-id': `fake-${calls.length}` } },
        );
      },
    }),
  });
  await page.route('**/api/evidence-analysis', async route => {
    const headers = route.request().headers();
    const reply = await service({
      body: Buffer.from(route.request().postData()!),
      authorization: headers.authorization,
      appCheck: headers['x-firebase-appcheck'],
      network: '192.0.2.1',
    });
    await route.fulfill({ status: reply.status, headers: reply.headers, json: reply.body });
  });
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixturesPath = '/tests/browser/support/evidence-fixtures.ts',
      clientPath = '/src/live-assistance/client/index.ts',
      recordsPath = '/src/evidence-assistance/analysis/record.ts',
      restorePath = '/src/evidence-assistance/preparation/restore.ts';
    const { identityDemo, identityInput } = (await import(
      fixturesPath
    )) as typeof import('../support/evidence-fixtures');
    const { browserLiveTransport } = (await import(
      clientPath
    )) as typeof import('../../../src/live-assistance/client');
    const { readRecord } = (await import(
      recordsPath
    )) as typeof import('../../../src/evidence-assistance/analysis/record');
    const { restoreRegion } = (await import(
      restorePath
    )) as typeof import('../../../src/evidence-assistance/preparation/restore');
    const { demo } = await identityDemo(
      browserLiveTransport(async () => ({
        authorization: 'Bearer dummy-auth',
        appCheck: 'dummy-app',
      })),
    );
    const before = await demo.readApplication(identityInput.applicationId);
    const handle = demo.createEvidenceAssistance(identityInput),
      inspected = await handle.inspect();
    await handle.run();
    const state = handle.read(),
      retained = readRecord(state.result);
    const restored =
      inspected.ok &&
      retained &&
      (await restoreRegion(
        inspected.value.source,
        retained,
        1,
        'fullName',
        new AbortController().signal,
      ));
    return {
      state,
      retained: !!retained,
      restored: !!restored,
      unchanged:
        JSON.stringify(before) ===
        JSON.stringify(await demo.readApplication(identityInput.applicationId)),
    };
  });
  expect(calls).toHaveLength(2);
  expect(result.state.status).toBe('completed');
  expect(result.state.result?.findings).toMatchObject({
    category: 'identity',
    readability: 'clear',
    nameSupport: 'different',
  });
  expect(result.state.result?.locations).toMatchObject([
    { page: 1, target: 'fullName', status: 'shown' },
  ]);
  expect(result.state.result?.pages?.[0].native.bridge?.mapped).not.toHaveProperty('fullNameBox');
  expect(result.state.result?.pages?.[0].native.locations?.fullName.box?.confidence).toBeNull();
  expect(result.retained).toBe(true);
  expect(result.restored).toBe(true);
  expect(result.unchanged).toBe(true);
});

for (const failure of ['none', 'verification-usage', 'page-usage'])
  test(`four-page browser composition with ${failure}`, async ({ page }) => {
    const sent: ProviderRequest[] = [];
    const service = createLiveService({
      admission: createAdmission(memoryStore(), 'dummy-key-with-at-least-thirty-two-bytes'),
      authorize: async () => 'guest',
      execute: createJevWorkflow({
        apiKey: 'dummy-no-provider-access',
        fetch: async (_url, init) => {
          const request = await providerRequest(init);
          sent.push(request);
          const verification = sent.length > 5;
          if (verification)
            return Response.json({
              ...verifiedBounds(request),
              ...(failure === 'verification-usage'
                ? { usage: { input_tokens: 500, output_tokens: null } }
                : {}),
            });
          const raw = nativeFinancial(
            {
              questions: request.questions,
              stage: sent.length <= 4 ? 'page' : 'document-comparison',
              image: { manifest: { page: sent.length } } as PreparedPage,
            },
            { monthlyPages: true },
          );
          if (sent.length <= 4) {
            const targets = [
              'period',
              'month1Revenue',
              'month1Expenses',
              'month2Revenue',
              'month2Expenses',
              'month3Revenue',
              'month3Expenses',
              'revenue',
              'expenses',
            ];
            for (const target of targets) {
              const present = (raw.answers[`${target}Presence`] as { noul: number }).noul >= 0.99;
              raw.answers[`${target}Box`] = {
                type: 'box',
                box: { left: 0.1, right: 0.6, top: 0.2, bottom: 0.24 },
                confidence: null,
              };
              raw.answers[`${target}Multiplicity`] = {
                type: 'choice',
                choice: present ? 'single' : 'absent',
                confidence: 1,
                probabilities: {
                  absent: present ? 0 : 1,
                  single: present ? 1 : 0,
                  repeated: 0,
                  uncertain: 0,
                },
              };
            }
          }
          return Response.json(
            { ...raw, ...(failure === 'page-usage' && sent.length === 2 ? { usage: null } : {}) },
            { headers: { 'x-typesafe-request-id': `financial-${sent.length}` } },
          );
        },
      }),
    });
    await page.route('**/api/evidence-analysis', async route => {
      const reply = await service({
        body: Buffer.from(route.request().postData()!),
        network: '192.0.2.1',
      });
      await route.fulfill({ status: reply.status, headers: reply.headers, json: reply.body });
    });
    await page.goto('/tests/browser/support/api.html');
    await page.waitForFunction(() => window.demo);
    const result = await page.evaluate(async () => {
      const fixturesPath = '/tests/browser/support/evidence-fixtures.ts',
        financialPath = '/tests/browser/support/financial-evidence-fixtures.ts',
        clientPath = '/src/live-assistance/client/index.ts',
        recordPath = '/src/evidence-assistance/analysis/record.ts';
      const { identityDemo } = (await import(
        fixturesPath
      )) as typeof import('../support/evidence-fixtures');
      const { financialInput, financialFile, attachFinancial } = (await import(
        financialPath
      )) as typeof import('../support/financial-evidence-fixtures');
      const { browserLiveTransport } = (await import(
        clientPath
      )) as typeof import('../../../src/live-assistance/client');
      const { readRecord } = (await import(
        recordPath
      )) as typeof import('../../../src/evidence-assistance/analysis/record');
      const { demo } = await identityDemo(
        browserLiveTransport(async () => ({
          authorization: 'Bearer dummy-auth',
          appCheck: 'dummy-app',
        })),
      );
      const attachment = await attachFinancial(await financialFile(4, { monthlyPages: true }));
      const handle = demo.createEvidenceAssistance({ ...financialInput, attachment });
      await handle.run();
      const state = handle.read();
      return { state, retained: !!readRecord(state.result) };
    });
    expect(sent).toHaveLength(
      failure === 'page-usage' ? 2 : failure === 'verification-usage' ? 6 : 9,
    );
    if (failure !== 'page-usage') expect(Object.keys(sent[4].assets)).toHaveLength(4);
    expect(result.state.status).toBe('completed');
    expect(result.state.result?.coverage).toMatchObject(
      failure === 'page-usage'
        ? { totalPages: 4, dispatched: [1, 2], successful: [1], failed: [2], unchecked: [2, 3, 4] }
        : {
            totalPages: 4,
            dispatched: [1, 2, 3, 4],
            successful: [1, 2, 3, 4],
            failed: [],
            unchecked: [],
          },
    );
    expect(result.state.result?.provenance.accounting).toBe(
      failure === 'none' ? 'reported' : 'unresolved',
    );
    expect(result.state.result?.findings).toMatchObject(
      failure === 'page-usage'
        ? {
            periodSupport: 'undetermined',
            revenueSupport: 'undetermined',
            expensesSupport: 'undetermined',
          }
        : {
            periodSupport: 'consistent',
            revenueSupport: 'consistent',
            expensesSupport: 'consistent',
          },
    );
    expect(
      result.state.result?.locations?.filter(location => location.status === 'shown'),
    ).toHaveLength(failure === 'none' ? 8 : 0);
    expect(result.state.result?.verifications).toHaveLength(failure === 'none' ? 4 : 0);
    expect(result.retained).toBe(true);
  });
