import { expect, test } from '@playwright/test';

test('reviewer assistance reads submitted bytes and declarations while unfinished corrections stay private', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const fixturePath = '/tests/browser/support/evidence-fixtures.ts',
      correctionPath = '/tests/browser/support/correction-evidence-fixtures.ts';
    const transportPath = '/tests/browser/support/evidence-transport.ts';
    const { identityDemo, imageFile } = (await import(
      fixturePath
    )) as typeof import('../support/evidence-fixtures');
    const {
      requestIdentityCorrection,
      correctionCommand,
      prepareCorrectionIdentity,
      correctionApplicationId,
    } = (await import(correctionPath)) as typeof import('../support/correction-evidence-fixtures');
    const { fakeEvidenceTransport } = (await import(
      transportPath
    )) as typeof import('../support/evidence-transport');
    const requests: import('../../../src/evidence-assistance/contract').StageRequest[] = [];
    const { demo } = await identityDemo(fakeEvidenceTransport(requests));
    await requestIdentityCorrection(demo, [
      { kind: 'field', field: 'fullName', reason: { ar: 'صحح الاسم', en: 'Correct the name' } },
    ]);
    const attachment = await prepareCorrectionIdentity(demo, await imageFile('image/png'));
    const saved = await window.commitOn(
      demo,
      await correctionCommand(demo, { fullName: 'Private unfinished name' }, attachment),
    );
    if (!saved.ok) throw new Error(saved.error.kind);
    await demo.signIn('salma');
    const before = await demo.readApplication(correctionApplicationId);
    if (!before.ok) throw new Error('application');
    const file = await demo.readFile(
      correctionApplicationId,
      before.value.snapshot.documents.identity!,
    );
    const handle = demo.createEvidenceAssistance({
      action: 'find-supporting-evidence',
      applicationId: correctionApplicationId,
      slot: 'identity',
      audience: 'reviewer',
      context: 'submitted',
    });
    const selected = await handle.inspect();
    await handle.run();
    const selectedBytes = selected.ok ? [...new Uint8Array(selected.value.source.bytes)] : null;
    const submittedBytes = file.ok ? [...new Uint8Array(file.value.bytes)] : null;
    return {
      before,
      after: await demo.readApplication(correctionApplicationId),
      selected,
      file,
      selectedBytes,
      submittedBytes,
      state: handle.read(),
      requests,
    };
  });
  expect(result.selected).toMatchObject({
    ok: true,
    value: {
      declaration: {
        fullName: result.before.ok ? result.before.value.snapshot.fields.fullName : '',
      },
      binding: { audience: 'reviewer', context: 'submitted', durable: true },
    },
  });
  expect(result.selected.ok && result.selected.value.source).toEqual(
    result.file.ok
      ? {
          id: result.before.ok ? result.before.value.snapshot.documents.identity : '',
          ...result.file.value,
        }
      : null,
  );
  expect(result.state).toMatchObject({
    status: 'completed',
    result: { stale: false, temporary: false },
  });
  expect(result.requests).toHaveLength(1);
  expect(result.selectedBytes).toEqual(result.submittedBytes);
  expect(JSON.stringify(result.requests)).not.toContain('Private unfinished name');
  expect(result.before).toEqual(result.after);
});

test('staff reading is independent of assignment and assistance cannot bypass confirmation or disclose staff findings', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const path = '/tests/browser/support/evidence-fixtures.ts';
    const { identityDemo } = (await import(path)) as typeof import('../support/evidence-fixtures');
    const { demo, datasetId } = await identityDemo();
    const input = {
      action: 'find-supporting-evidence',
      applicationId: 'RIFD-2026-007',
      slot: 'identity',
      audience: 'reviewer',
      context: 'submitted',
    } as const;
    await demo.signIn('salma');
    let view = await demo.readApplication(input.applicationId);
    if (!view.ok || view.value.role !== 'reviewer') throw new Error('view');
    const initial = view.value;
    const handle = demo.createEvidenceAssistance(input);
    await handle.run();
    const completed = handle.read();
    const bypass = await window.commitOn(demo, {
      kind: 'assessDocument',
      datasetId,
      applicationId: input.applicationId,
      operationId: crypto.randomUUID(),
      expectedSharedRevision: initial.sharedRevision,
      slot: 'identity',
      fileId: initial.snapshot.documents.identity!,
      status: 'accepted',
      reason: null,
    } as import('../../../src/demo').ReviewOperation);
    const transfer = await window.commitOn(demo, {
      kind: 'transferApplication',
      datasetId,
      applicationId: input.applicationId,
      from: 'salma',
      to: 'khaled',
      confirmed: true,
    });
    if (!transfer.ok || transfer.value.application.role !== 'reviewer') throw new Error('transfer');
    view = await demo.readApplication(input.applicationId);
    await handle.refresh();
    const stale = handle.read();
    await handle.run();
    const colleague = handle.read();
    const refusedWrite = await window.commitOn(demo, {
      kind: 'assessDocument',
      datasetId,
      applicationId: input.applicationId,
      slot: 'identity',
      fileId: initial.snapshot.documents.identity!,
      status: 'accepted',
      reason: null,
      inspection: {
        kind: 'inspected',
        confirmed: true,
        contextToken: transfer.value.application.inspectionContexts.identity!,
      },
    });
    const invalidInputs = [
      { ...input, applicationId: 'RIFD-2026-001' },
      { ...input, declaredName: 'Override submitted name' },
      { ...input, context: 'correction-workspace' },
      { ...input, audience: 'applicant' },
    ];
    const invalid = [];
    for (const invalidInput of invalidInputs) {
      const next = demo.createEvidenceAssistance(
        invalidInput as import('../../../src/evidence-assistance/contract').EvidenceInput,
      );
      invalid.push(await next.inspect());
      next.dispose();
    }
    await demo.signIn('mariam');
    const lostAuthority = handle.read();
    const applicant = demo.createEvidenceAssistance(input);
    await applicant.run();
    return {
      completed,
      bypass,
      stale,
      colleague,
      refusedWrite,
      invalid,
      lostAuthority,
      applicant: applicant.read(),
      staffView: view,
      publicView: await demo.readApplication(input.applicationId),
      print: await demo.readPrintSummary(input.applicationId),
      notifications: await demo.readNotifications(),
    };
  });
  expect(result.completed.status).toBe('completed');
  expect(result.bypass).toMatchObject({ error: { kind: 'validation' } });
  expect(result.stale.result).toMatchObject({
    stale: true,
    findings: { nameSupport: 'unavailable' },
  });
  expect(result.colleague).toMatchObject({ status: 'completed', result: { stale: false } });
  expect(result.staffView).toMatchObject({
    value: { assignedToYou: false, permissions: { assessDocument: false } },
  });
  expect(result.refusedWrite).toMatchObject({ error: { kind: 'permissionDenied' } });
  for (const invalid of result.invalid) expect(invalid.ok).toBe(false);
  expect(result.lostAuthority.result).toBeNull();
  expect(result.applicant).toMatchObject({
    status: 'unavailable',
    result: null,
    reason: 'unauthorized',
  });
  for (const projection of [result.publicView, result.print, result.notifications]) {
    expect(JSON.stringify(projection)).not.toContain(result.completed.result!.id);
    expect(JSON.stringify(projection)).not.toContain('findings');
  }
});

test('unrelated notes retain findings while reassignment away and back rejects pending findings and old inspection', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const path = '/tests/browser/support/evidence-fixtures.ts',
      transportPath = '/tests/browser/support/evidence-transport.ts';
    const { identityDemo } = (await import(path)) as typeof import('../support/evidence-fixtures');
    const { nativeIdentity } = (await import(
      transportPath
    )) as typeof import('../support/evidence-transport');
    let held = false,
      release: (value: unknown) => void = () => {},
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
    await demo.signIn('salma');
    const input = {
      action: 'find-supporting-evidence',
      applicationId: 'RIFD-2026-007',
      slot: 'identity',
      audience: 'reviewer',
      context: 'submitted',
    } as const;
    const handle = demo.createEvidenceAssistance(input);
    await handle.run();
    const original = handle.read();
    const before = await demo.readApplication(input.applicationId);
    if (!before.ok || before.value.role !== 'reviewer') throw new Error('view');
    const base = { datasetId, applicationId: input.applicationId };
    const note = await window.commitOn(demo, {
      ...base,
      kind: 'saveNote',
      text: { ar: 'ملاحظة مستقلة', en: 'Unrelated note' },
    });
    if (!note.ok) throw new Error('note');
    await handle.refresh();
    const afterNote = handle.read();
    held = true;
    const sent = new Promise<void>(resolve => {
      dispatched = resolve;
    });
    const pending = handle.run();
    await sent;
    const away = await window.commitOn(demo, {
      ...base,
      kind: 'transferApplication',
      from: 'salma',
      to: 'khaled',
      confirmed: true,
    });
    if (!away.ok) throw new Error('away');
    const back = await window.commitOn(demo, {
      ...base,
      kind: 'transferApplication',
      from: 'khaled',
      to: 'salma',
      confirmed: true,
    });
    if (!back.ok) throw new Error('back');
    release(nativeIdentity());
    await pending;
    await handle.refresh();
    const oldConfirmation = await window.commitOn(demo, {
      ...base,
      kind: 'assessDocument',
      slot: 'identity',
      fileId: before.value.snapshot.documents.identity!,
      status: 'accepted',
      reason: null,
      inspection: {
        kind: 'inspected',
        confirmed: true,
        contextToken: before.value.inspectionContexts.identity!,
      },
    });
    const reopened = demo.createEvidenceAssistance(input);
    await reopened.inspect();
    return {
      original,
      afterNote,
      final: handle.read(),
      reopened: reopened.read(),
      oldConfirmation,
      after: await demo.readApplication(input.applicationId),
    };
  });
  expect(result.afterNote.result).toMatchObject({ id: result.original.result!.id, stale: false });
  for (const state of [result.final, result.reopened])
    expect(state.result).toMatchObject({
      id: result.original.result!.id,
      stale: true,
      findings: { nameSupport: 'unavailable' },
    });
  expect(result.oldConfirmation).toMatchObject({ error: { kind: 'validation' } });
  expect(result.after).toMatchObject({
    value: {
      status: 'underReview',
      assessments: { identity: { status: 'accepted' } },
      checks: { evidence: 'unchecked' },
      repayment: null,
    },
  });
});

test('resubmission makes retained reviewer findings old while private applicant analysis stays separate', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  const result = await page.evaluate(async () => {
    const path = '/tests/browser/support/evidence-fixtures.ts',
      correctionPath = '/tests/browser/support/correction-evidence-fixtures.ts';
    const { identityDemo, imageFile } = (await import(
      path
    )) as typeof import('../support/evidence-fixtures');
    const {
      requestIdentityCorrection,
      correctionCommand,
      prepareCorrectionIdentity,
      correctionInput,
      correctionApplicationId,
    } = (await import(correctionPath)) as typeof import('../support/correction-evidence-fixtures');
    const { demo } = await identityDemo();
    await requestIdentityCorrection(demo);
    await demo.signIn('salma');
    const input = {
      action: 'find-supporting-evidence',
      applicationId: correctionApplicationId,
      slot: 'identity',
      audience: 'reviewer',
      context: 'submitted',
    } as const;
    const original = demo.createEvidenceAssistance(input);
    await original.run();
    const old = original.read();
    await demo.signIn('mariam');
    const attachment = await prepareCorrectionIdentity(demo, await imageFile('image/png'));
    const saved = await window.commitOn(demo, await correctionCommand(demo, {}, attachment));
    if (!saved.ok) throw new Error('save');
    const privateHandle = demo.createEvidenceAssistance(await correctionInput(demo));
    await privateHandle.run();
    const privateRun = privateHandle.read();
    const submitted = await window.commitOn(
      demo,
      await correctionCommand(demo, {}, undefined, 'resubmit'),
    );
    if (!submitted.ok) throw new Error('resubmit');
    await demo.signIn('salma');
    const current = demo.createEvidenceAssistance(input);
    const selection = await current.inspect();
    const stale = current.read();
    await current.run();
    const fresh = current.read();
    current.dispose();
    const reopened = demo.createEvidenceAssistance(input);
    await reopened.inspect();
    return {
      old,
      privateRun,
      stale,
      fresh,
      reopened: reopened.read(),
      selection,
      after: await demo.readApplication(correctionApplicationId),
    };
  });
  expect(result.stale.result).toMatchObject({
    id: result.old.result!.id,
    stale: true,
    findings: { nameSupport: 'unavailable' },
  });
  expect(result.stale.result?.provenance.source.hash).not.toBe(
    result.selection.ok ? result.selection.value.source.hash : null,
  );
  expect(result.fresh.result).toMatchObject({ stale: false, temporary: false });
  expect(result.fresh.result?.id).not.toBe(result.privateRun.result?.id);
  expect(result.reopened.result?.id).toBe(result.fresh.result?.id);
  expect(result.after).toMatchObject({
    value: {
      status: 'underReview',
      assessments: { identity: { status: 'awaitingReview' } },
      repayment: null,
    },
  });
});
