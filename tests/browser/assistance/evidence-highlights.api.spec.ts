import { expect, test } from '@playwright/test';

// The accepted controller seam uses actual browser preparation and fake provider answers.
test('a named identity finding follows an exactly bound, lossless verified region', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts',
      transport = '/tests/browser/support/evidence-transport.ts';
    const { identityDemo, identityInput, attachIdentity } = (await import(
      fixtures
    )) as typeof import('../support/evidence-fixtures');
    const { nativeIdentity } = (await import(
      transport
    )) as typeof import('../support/evidence-transport');
    const requests: import('../../../src/evidence-assistance/contract').StageRequest[] = [];
    const { demo } = await identityDemo({
      async evaluate(request) {
        requests.push(request);
        if (request.stage === 'bound-verification')
          return {
            model: 'jev-1.14.0',
            answers: Object.fromEntries(
              Object.keys(request.questions).map(key => [
                key,
                { type: 'noul', noul: key.endsWith('Association') ? 0.99 : 0.01 },
              ]),
            ),
            usage: { input_tokens: 500, output_tokens: 60 },
          };
        return {
          ...nativeIdentity(),
          answers: {
            ...nativeIdentity().answers,
            fullNameBox: {
              type: 'box',
              box: { left: 0.1015, top: 0.2005, right: 0.3005, bottom: 0.2505 },
              confidence: null,
            },
            fullNameMultiplicity: {
              type: 'choice',
              choice: 'single',
              confidence: 0.1,
              probabilities: { absent: 0, single: 0.99, repeated: 0.01, uncertain: 0 },
            },
          },
        };
      },
    });
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1320;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#fff';
    context.fillRect(0, 0, 1000, 1320);
    context.fillStyle = '#000';
    context.font = '20px sans-serif';
    context.fillText('Fictional Applicant Name', 105, 300);
    context.fillStyle = '#e00000';
    context.fillRect(150, 270, 1, 15);
    const blob = await new Promise<Blob>(resolve =>
      canvas.toBlob(blob => resolve(blob!), 'image/png'),
    );
    const attachment = await attachIdentity(
      new File([blob], 'fictional-identity.png', { type: 'image/png' }),
    );
    const handle = demo.createEvidenceAssistance({ ...identityInput, attachment });
    await handle.run();
    const state = handle.read();
    const parent = await createImageBitmap(new Blob([requests[1].image.bytes])),
      crop = await createImageBitmap(new Blob([requests[1].crops![0].bytes]));
    const parentCanvas = new OffscreenCanvas(parent.width, parent.height),
      cropCanvas = new OffscreenCanvas(crop.width, crop.height);
    const parentContext = parentCanvas.getContext('2d')!,
      cropContext = cropCanvas.getContext('2d')!;
    parentContext.drawImage(parent, 0, 0);
    cropContext.drawImage(crop, 0, 0);
    const original = parentContext.getImageData(101, 264, 200, 67).data,
      copied = cropContext.getImageData(40, 106, 200, 67).data;
    const nonWhite = original.some((value, index) => index % 4 !== 3 && value !== 255);
    const lossless = original.every((value, index) => value === copied[index]),
      padding = Array.from(cropContext.getImageData(0, 0, 1, 1).data);
    parent.close();
    crop.close();
    return {
      nonWhite,
      lossless,
      padding,
      state,
      requests: requests.map(request => ({
        ...request,
        image: { ...request.image, bytes: undefined },
        crops: request.crops?.map(crop => ({ ...crop, bytes: undefined })),
      })),
    };
  });
  expect(result.nonWhite).toBe(true);
  expect(result.lossless).toBe(true);
  expect(result.padding).toEqual([255, 255, 255, 255]);
  expect(result.state.status).toBe('completed');
  expect(result.requests.map(request => request.stage)).toEqual([
    'combined-page-declaration',
    'bound-verification',
  ]);
  expect(result.state.result?.locations).toMatchObject([
    {
      page: 1,
      target: 'fullName',
      status: 'shown',
      box: { left: 0.1015, top: 0.2005, right: 0.3005, bottom: 0.2505 },
    },
  ]);
  expect(result.state.result?.pages?.[0].native.locations?.fullName.box?.confidence).toBeNull();
  expect(result.requests[1].image.manifest).toEqual(result.requests[0].image.manifest);
  expect(result.requests[1].crops?.[0].binding).toMatchObject({
    method: 'lossless-boundary-pad-v1',
    enclosure: { left: 101, top: 264, right: 301, bottom: 331 },
    width: 280,
    height: 280,
    padding: { left: 40, right: 40, top: 106, bottom: 107 },
    transform: [1, 0, 0, 1, -61, -158],
  });
});

test('uncertain bounds, repetition, malformed boxes and failed verification preserve named findings', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const results = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts',
      transport = '/tests/browser/support/evidence-transport.ts';
    const { identityDemo, identityInput, attachIdentity, imageFile } = (await import(
      fixtures
    )) as typeof import('../support/evidence-fixtures');
    const { nativeLocatedIdentity } = (await import(
      transport
    )) as typeof import('../support/evidence-transport');
    let scenario = '';
    const requests: string[] = [];
    const { demo } = await identityDemo({
      async evaluate(request) {
        requests.push(request.stage);
        const raw = nativeLocatedIdentity(request) as {
          answers: Record<string, unknown>;
          usage: unknown;
        };
        if (request.stage === 'bound-verification') {
          if (scenario === 'invalid usage') raw.usage = null;
          else if (scenario === 'unavailable') throw new Error('unavailable');
          else if (scenario.endsWith('Clipping'))
            raw.answers[`fullName${scenario}`] = { type: 'noul', noul: 0.01001 };
          else if (scenario === 'association')
            raw.answers.fullNameAssociation = { type: 'noul', noul: 0.98999 };
          else if (scenario === 'competing')
            raw.answers.fullNameCompetingValue = { type: 'noul', noul: 0.01001 };
        } else {
          if (scenario === 'malformed')
            raw.answers.fullNameBox = {
              type: 'box',
              box: { left: 0.7, right: 0.2, top: 0.1, bottom: 0.2 },
              confidence: 1,
            };
          if (scenario === 'null') raw.answers.fullNameBox = null;
          if (scenario === 'degenerate')
            raw.answers.fullNameBox = {
              type: 'box',
              box: { left: 0.2, right: 0.2, top: 0.1, bottom: 0.2 },
              confidence: null,
            };
          if (scenario === 'padding')
            raw.answers.fullNameBox = {
              type: 'box',
              box: { left: 0, right: 0.1, top: 0.1, bottom: 0.2 },
              confidence: 1,
            };
          if (scenario === 'presence') raw.answers.namePresence = { type: 'noul', noul: 0.98999 };
          if (scenario === 'multiplicity threshold')
            raw.answers.fullNameMultiplicity = {
              type: 'choice',
              choice: 'single',
              confidence: 1,
              probabilities: { absent: 0, single: 0.98999, repeated: 0.01001, uncertain: 0 },
            };
          if (scenario === 'repeated')
            raw.answers.fullNameMultiplicity = {
              type: 'choice',
              choice: 'repeated',
              confidence: 1,
              probabilities: { absent: 0, single: 0, repeated: 1, uncertain: 0 },
            };
          if (scenario === 'conflict')
            raw.answers.nameSupport = {
              type: 'choice',
              choice: 'conflict',
              confidence: 1,
              probabilities: {
                consistent: 0,
                different: 0,
                not_found: 0,
                conflict: 1,
                uncertain: 0,
              },
            };
        }
        return raw;
      },
    });
    const results = [];
    for (scenario of [
      'LeftClipping',
      'TopClipping',
      'RightClipping',
      'BottomClipping',
      'association',
      'competing',
      'malformed',
      'null',
      'degenerate',
      'presence',
      'multiplicity threshold',
      'repeated',
      'conflict',
      'invalid usage',
      'unavailable',
      'padding',
    ]) {
      requests.length = 0;
      const attachment =
        scenario === 'padding'
          ? await attachIdentity(await imageFile('image/png', 180, 600))
          : undefined;
      const handle = demo.createEvidenceAssistance({
        ...identityInput,
        ...(attachment ? { attachment } : {}),
      });
      await handle.run();
      results.push({ scenario, state: handle.read(), requests: [...requests] });
      handle.dispose();
    }
    return results;
  });
  for (const result of results) {
    expect(result.state.status, JSON.stringify(result)).toBe('completed');
    expect(result.state.result?.findings, result.scenario).toMatchObject({
      category: 'identity',
      readability: 'clear',
      nameSupport:
        result.scenario === 'conflict'
          ? 'conflict'
          : result.scenario === 'presence'
            ? 'undetermined'
            : 'different',
    });
    expect(result.state.result?.locations?.[0].status, result.scenario).toBe('suppressed');
    expect(result.requests.length).toBe(
      [
        'LeftClipping',
        'TopClipping',
        'RightClipping',
        'BottomClipping',
        'association',
        'competing',
        'invalid usage',
        'unavailable',
      ].includes(result.scenario)
        ? 2
        : 1,
    );
  }
});

test('restoration rejects changed bindings and crop hashes while preserving source findings', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts',
      transport = '/tests/browser/support/evidence-transport.ts',
      records = '/src/evidence-assistance/analysis/record.ts',
      restoration = '/src/evidence-assistance/preparation/restore.ts';
    const { identityDemo, identityInput } = (await import(
      fixtures
    )) as typeof import('../support/evidence-fixtures');
    const { nativeLocatedIdentity } = (await import(
      transport
    )) as typeof import('../support/evidence-transport');
    const { readRecord } = (await import(
      records
    )) as typeof import('../../../src/evidence-assistance/analysis/record');
    const { restoreRegion } = (await import(
      restoration
    )) as typeof import('../../../src/evidence-assistance/preparation/restore');
    const { demo } = await identityDemo({
      async evaluate(request) {
        return nativeLocatedIdentity(request);
      },
    });
    const handle = demo.createEvidenceAssistance(identityInput),
      inspected = await handle.inspect();
    if (!inspected.ok) throw new Error('source');
    await handle.run();
    const original = handle.read().result!;
    const changes = [
      'source',
      'raster',
      'page',
      'target',
      'rectangle',
      'transform',
      'context',
      'definitions',
      'crop hash',
    ];
    const changed = [];
    for (const change of changes) {
      const run = structuredClone(original),
        verification = run.verifications![0],
        region = verification.request.state.regions![0];
      if (change === 'source') region.sourceHash = '0'.repeat(64);
      if (change === 'raster') region.rasterHash = '0'.repeat(64);
      if (change === 'page') region.page = 2;
      if (change === 'target') region.target = 'address';
      if (change === 'rectangle') region.box.right += 0.001;
      if (change === 'transform') region.transform[4] += 1;
      if (change === 'context')
        verification.request.state.declaredApplicantName = 'Changed Fictional Name';
      if (change === 'definitions')
        verification.request.questions.fullNameAssociation.instructions = 'A changed question';
      if (change === 'crop hash') region.cropHash = '0'.repeat(64);
      const retained = readRecord(run);
      const pixels =
        retained &&
        (await restoreRegion(
          inspected.value.source,
          retained,
          1,
          'fullName',
          new AbortController().signal,
        ));
      changed.push({
        change,
        findings: retained?.findings,
        restored: !!pixels,
        status: retained?.locations?.[0].status,
      });
    }
    const restored = await restoreRegion(
      inspected.value.source,
      original,
      1,
      'fullName',
      new AbortController().signal,
    );
    return { changed, originalRestored: !!restored };
  });
  expect(result.originalRestored).toBe(true);
  for (const changed of result.changed) {
    expect(changed.findings, changed.change).toMatchObject({
      category: 'identity',
      nameSupport: 'different',
    });
    expect(changed.restored, changed.change).toBe(false);
    if (changed.change !== 'crop hash') expect(changed.status, changed.change).toBe('suppressed');
  }
});

test('one page can verify nine crops in 54 Nouls and four pages use at most nine ordered attempts', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts',
      financial = '/tests/browser/support/financial-evidence-fixtures.ts',
      contract = '/src/evidence-assistance/contract.ts';
    const { identityDemo } = (await import(
      fixtures
    )) as typeof import('../support/evidence-fixtures');
    const { financialInput, financialFile, attachFinancial, nativeFinancial } = (await import(
      financial
    )) as typeof import('../support/financial-evidence-fixtures');
    const { locationTargets } = (await import(
      contract
    )) as typeof import('../../../src/evidence-assistance/contract');
    let multipage = false,
      oversized = false,
      unaccounted = false;
    const requests: { stage: string; page: number; questions: number; crops: number }[] = [];
    const { demo } = await identityDemo({
      async evaluate(request) {
        requests.push({
          stage: request.stage,
          page: request.image.manifest.page,
          questions: Object.keys(request.questions).length,
          crops: request.crops?.length ?? 0,
        });
        if (request.stage === 'bound-verification')
          return {
            model: 'jev-1.14.0',
            answers: Object.fromEntries(
              Object.keys(request.questions).map(key => [
                key,
                { type: 'noul', noul: key.endsWith('Association') ? 1 : 0 },
              ]),
            ),
            usage: unaccounted ? null : { input_tokens: 500, output_tokens: 60 },
          };
        const raw = nativeFinancial(request, { monthlyPages: multipage });
        if (request.stage !== 'document-comparison')
          for (const target of locationTargets('financial')) {
            const present = (raw.answers[target.presence] as { noul: number }).noul > 0.99;
            raw.answers[`${target.id}Box`] = {
              type: 'box',
              box: oversized
                ? { left: 0, right: 1, top: 0, bottom: 1 }
                : { left: 0.1, right: 0.6, top: 0.2, bottom: 0.24 },
              confidence: null,
            };
            raw.answers[`${target.id}Multiplicity`] = {
              type: 'choice',
              choice: present ? 'single' : 'absent',
              confidence: 0.999,
              probabilities: {
                absent: present ? 0 : 1,
                single: present ? 1 : 0,
                repeated: 0,
                uncertain: 0,
              },
            };
          }
        return raw;
      },
    });
    const singleAttachment = await attachFinancial(await financialFile(1));
    const single = demo.createEvidenceAssistance({
      ...financialInput,
      attachment: singleAttachment,
    });
    await single.run();
    const singleState = single.read(),
      singleRequests = [...requests];
    single.dispose();
    requests.length = 0;
    multipage = true;
    const attachment = await attachFinancial(await financialFile(4, { monthlyPages: true }));
    const multiple = demo.createEvidenceAssistance({ ...financialInput, attachment });
    await multiple.run();
    const multipleState = multiple.read(),
      multipleRequests = [...requests];
    multiple.dispose();
    requests.length = 0;
    unaccounted = true;
    const stopped = demo.createEvidenceAssistance({ ...financialInput, attachment });
    await stopped.run();
    const stoppedState = stopped.read(),
      stoppedRequests = [...requests];
    stopped.dispose();
    requests.length = 0;
    oversized = true;
    multipage = false;
    unaccounted = false;
    const large = await attachFinancial(await financialFile(1, { large: true }));
    const resourceLimited = demo.createEvidenceAssistance({ ...financialInput, attachment: large });
    await resourceLimited.run();
    return {
      singleState,
      singleRequests,
      multipleState,
      multipleRequests,
      stoppedState,
      stoppedRequests,
      limited: resourceLimited.read(),
      limitedRequests: requests,
    };
  });
  expect(
    result.singleState.result?.locations?.filter(location => location.status === 'shown'),
  ).toHaveLength(9);
  expect(result.singleRequests).toEqual([
    { stage: 'combined-page-declaration', page: 1, questions: 32, crops: 0 },
    { stage: 'bound-verification', page: 1, questions: 54, crops: 9 },
  ]);
  expect(result.multipleRequests.map(request => `${request.stage}:${request.page}`)).toEqual([
    'page:1',
    'page:2',
    'page:3',
    'page:4',
    'document-comparison:1',
    'bound-verification:1',
    'bound-verification:2',
    'bound-verification:3',
    'bound-verification:4',
  ]);
  expect(
    result.multipleState.result?.locations?.filter(location => location.status === 'shown'),
  ).toHaveLength(8);
  expect(result.stoppedRequests).toHaveLength(6);
  expect(result.stoppedState.result?.findings.periodSupport).toBe('consistent');
  expect(
    result.stoppedState.result?.locations?.every(location => location.status === 'suppressed'),
  ).toBe(true);
  expect(result.limitedRequests).toHaveLength(1);
  expect(result.limited.result?.findings.category).toBe('financial');
  expect(
    result.limited.result?.locations?.every(location => location.status === 'suppressed'),
  ).toBe(true);
  expect(result.limited.result?.stages).toContainEqual({
    page: 1,
    stage: 'bound-verification',
    outcome: 'unavailable',
    reason: 'prepared-limit',
  });
});

test('known misleading pilot locations stay suppressed even with passing synthetic probabilities', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts',
      financial = '/tests/browser/support/financial-evidence-fixtures.ts',
      transport = '/tests/browser/support/evidence-transport.ts';
    const { identityDemo, identityInput, attachIdentity } = (await import(
      fixtures
    )) as typeof import('../support/evidence-fixtures');
    const { financialInput, attachFinancial, nativeFinancial } = (await import(
      financial
    )) as typeof import('../support/financial-evidence-fixtures');
    const { nativeLocatedIdentity } = (await import(
      transport
    )) as typeof import('../support/evidence-transport');
    const regressions = (await (
      await fetch('/tests/browser/fixtures/highlights/pilot-regressions.json')
    ).json()) as { caseId: string; page: number; target: string; box: unknown }[];
    let caseId = '',
      verificationCalls = 0,
      shifted = false;
    const { demo } = await identityDemo({
      async evaluate(request) {
        if (request.stage === 'bound-verification') {
          verificationCalls++;
          return nativeLocatedIdentity(request);
        }
        const raw =
          caseId === 'ar-identity-06'
            ? (nativeLocatedIdentity(request) as { answers: Record<string, unknown> })
            : nativeFinancial(request);
        for (const region of regressions.filter(
          region => region.caseId === caseId && region.page === request.image.manifest.page,
        )) {
          raw.answers[`${region.target}Box`] = {
            type: 'box',
            box: shifted
              ? {
                  ...(region.box as Record<string, number>),
                  top: (region.box as Record<string, number>).top + 0.000002,
                }
              : region.box,
            confidence: 1,
          };
          raw.answers[`${region.target}Multiplicity`] = {
            type: 'choice',
            choice: 'single',
            confidence: 1,
            probabilities: { absent: 0, single: 1, repeated: 0, uncertain: 0 },
          };
        }
        return raw;
      },
    });
    const locations = [];
    for (caseId of ['ar-identity-06', 'ar-financial-01', 'en-financial-10']) {
      const identity = caseId === 'ar-identity-06',
        extension = caseId === 'ar-financial-01' ? 'pdf' : 'png';
      const bytes = await (
        await fetch(`/tests/browser/fixtures/highlights/${caseId}.${extension}`)
      ).arrayBuffer();
      const file = new File([bytes], `${caseId}.${extension}`, {
        type: extension === 'pdf' ? 'application/pdf' : 'image/png',
      });
      const attachment = await (identity ? attachIdentity(file) : attachFinancial(file));
      const handle = demo.createEvidenceAssistance({
        ...(identity ? identityInput : financialInput),
        attachment,
      });
      await handle.run();
      locations.push(
        ...(handle.read().result?.locations ?? []).filter(location =>
          regressions.some(
            region =>
              region.caseId === caseId &&
              region.page === location.page &&
              region.target === location.target,
          ),
        ),
      );
      shifted = true;
      await handle.run();
      locations.push(
        ...(handle.read().result?.locations ?? []).filter(location =>
          regressions.some(
            region =>
              region.caseId === caseId &&
              region.page === location.page &&
              region.target === location.target,
          ),
        ),
      );
      shifted = false;
      handle.dispose();
    }
    return { locations, verificationCalls };
  });
  expect(result.locations).toHaveLength(10);
  expect(
    result.locations.every(
      location => location.status === 'suppressed' && location.reason === 'known-misleading-region',
    ),
  ).toBe(true);
  expect(result.verificationCalls).toBe(0);
});
