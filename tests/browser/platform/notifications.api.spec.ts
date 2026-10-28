import { expect, test, type Page } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

async function openNotices(page: Page) {
  await page.goto('/tests/browser/support/api.html');
  await page.waitForFunction(() => window.demo);
  await page.evaluate(async () => {
    await window.demo.startup();
    await window.demo.signIn('huda');
  });
}

test('reading one notice persists independently, refuses a repeat and leaves applications and other notices unchanged', async ({
  page,
}) => {
  await openNotices(page);
  const result = await page.evaluate(async () => {
    const demo = window.demo;
    const context = await demo.context();
    const notices = await demo.readNotifications();
    const before = await demo.readApplication('RIFD-2026-004');
    if (!context.ok || !notices.ok) throw new Error('No notifications');
    const command = {
      kind: 'markNotificationRead' as const,
      datasetId: context.value.datasetId,
      operationId: 'read-1',
      notificationId: notices.value[0].id,
      expectedRevision: 1,
    };
    const first = await window.commitOn(demo, command);
    const repeat = await window.commitOn(demo, command);
    const changed = await window.commitOn(demo, {
      ...command,
      notificationId: notices.value[1].id,
    });
    const stale = await window.commitOn(demo, { ...command });
    const after = await demo.readApplication('RIFD-2026-004');
    return {
      first,
      repeat,
      changed,
      stale,
      before,
      after,
      command,
      notices: await demo.readNotifications(),
    };
  });
  expect(result.first).toMatchObject({
    ok: true,
    value: {
      notification: { read: true, revision: 2 },
      destination: '/applications/RIFD-2026-004/corrections/current',
      receipt: { revision: 2 },
    },
  });
  expect(result.repeat).toMatchObject({ ok: false, error: { kind: 'staleNotification' } });
  expect(result.changed).toMatchObject({
    ok: true,
    value: {
      notification: { id: result.notices.ok ? result.notices.value[1].id : '', read: true },
    },
  });
  expect(result.stale).toMatchObject({ ok: false, error: { kind: 'staleNotification' } });
  expect(result.after).toEqual(result.before);
  expect(
    result.notices.ok && result.notices.value.map(notice => [notice.read, notice.revision]),
  ).toEqual([
    [true, 2],
    [true, 2],
  ]);
  await page.reload();
  const restored = await page.evaluate(async command => {
    await window.demo.startup();
    return window.commit(command);
  }, result.command);
  expect(restored).toMatchObject({ ok: false, error: { kind: 'staleNotification' } });
});

test('notification operations enforce ownership, session and dataset, including during a delayed write', async ({
  page,
}) => {
  await openNotices(page);
  const result = await page.evaluate(async () => {
    const demo = window.demo;
    const context = await demo.context();
    if (!context.ok) throw new Error('No context');
    const command = {
      kind: 'markNotificationRead' as const,
      datasetId: context.value.datasetId,
      operationId: 'read-access',
      notificationId: 'RIFD-2026-005-notice',
      expectedRevision: 1,
    };
    const forbidden = await window.commitOn(demo, command);
    const missing = await demo.resolveNotification('missing');
    const forbiddenLink = await demo.resolveNotification(command.notificationId);
    await demo.signIn('salma');
    const staff = [
      await demo.readNotifications(),
      await window.commitOn(demo, command),
      await demo.resolveNotification(command.notificationId),
    ];
    await demo.signIn('mariam');
    demo.setControls({ slow: true, failure: null });
    const writing = window.commitOn(demo, command);
    demo.expireSession();
    const expired = await writing;
    await demo.signIn('mariam');
    return {
      forbidden,
      missing,
      forbiddenLink,
      staff,
      expired,
      notices: await demo.readNotifications(),
    };
  });
  expect(result.forbidden).toEqual(result.missing);
  expect(result.forbiddenLink).toEqual(result.missing);
  for (const read of result.staff) expect(read).toEqual(result.missing);
  expect(result.expired).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } });
  expect(result.notices).toMatchObject({ ok: true, value: [{ read: false, revision: 1 }] });
});

test('a stale correction notification resolves current state on repeat and after refresh', async ({
  page,
}) => {
  await openNotices(page);
  const result = await page.evaluate(async () => {
    const demo = window.demo;
    const context = await demo.context();
    if (!context.ok) throw new Error('No context');
    const command = {
      kind: 'markNotificationRead' as const,
      datasetId: context.value.datasetId,
      operationId: 'old-request',
      notificationId: 'RIFD-2026-004-notice',
      expectedRevision: 1,
    };
    const first = await window.commitOn(demo, command);
    const response = await demo.readApplication('RIFD-2026-004');
    if (!response.ok || response.value.role !== 'applicant' || !response.value.workspace)
      throw new Error('No response');
    const workspace = response.value.workspace;
    const fields = { ...workspace.snapshot.fields, amount: '450000' };
    const prepared = await demo.prepareAttachment({
      datasetId: context.value.datasetId,
      applicationId: response.value.id,
      slot: 'purchase',
      selectionId: 'plan',
      source: { kind: 'generated', fields },
    });
    if (!prepared.ok) throw new Error('No plan');
    const resubmitted = await window.commitOn(demo, {
      kind: 'resubmit',
      applicationId: response.value.id,
      roundId: workspace.roundId!,
      product: response.value.product,
      fields,
      documents: {
        ...Object.fromEntries(
          Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [
            slot,
            { kind: 'saved', fileId },
          ]),
        ),
        purchase: { kind: 'prepared', attachment: prepared.value },
      } as import('../../../src/demo').DraftDocuments,
    });
    if (!resubmitted.ok) throw new Error(JSON.stringify(resubmitted));
    return {
      first,
      command,
      current: await demo.resolveNotification(command.notificationId),
      repeat: await window.commitOn(demo, command),
    };
  });
  expect(result.first).toMatchObject({
    ok: true,
    value: { destination: '/applications/RIFD-2026-004/corrections/current' },
  });
  expect(result.current).toMatchObject({
    ok: true,
    value: { destination: '/applications/RIFD-2026-004' },
  });
  expect(result.repeat).toMatchObject({ ok: false, error: { kind: 'staleNotification' } });
  await page.reload();
  expect(
    await page.evaluate(async () => {
      await window.demo.startup();
      return window.demo.resolveNotification('RIFD-2026-004-notice');
    }),
  ).toEqual(result.current);
});

test('unknown completion is inspected without rewriting and later reads stay independent', async ({
  page,
}) => {
  await openNotices(page);
  const result = await page.evaluate(async () => {
    const demo = window.demo;
    const context = await demo.context();
    if (!context.ok) throw new Error('No context');
    const command = {
      kind: 'markNotificationRead' as const,
      datasetId: context.value.datasetId,
      operationId: 'uncertain-read',
      notificationId: 'RIFD-2026-004-notice',
      expectedRevision: 1,
    };
    const transaction = IDBDatabase.prototype.transaction;
    let loseNext = true;
    IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase['transaction']>) {
      const tx = transaction.apply(this, args);
      if (args[1] === 'readwrite' && loseNext) {
        loseNext = false;
        Object.defineProperty(tx, 'oncomplete', {
          configurable: true,
          set() {
            /* Lost storage completion. */
          },
        });
      }
      return tx;
    };
    const unknown = await window.commitOn(demo, command);
    IDBDatabase.prototype.transaction = transaction;
    const inspection = await window.inspectOnNotification(demo, command);
    const changedKind = await window.commitOn(demo, {
      kind: 'setLanguage',
      expectedRevision: 1,
      language: 'en',
    });
    const reusedLanguage = await window.commitOn(demo, { ...command });
    return {
      unknown,
      inspection,
      changedKind,
      reusedLanguage,
      notices: await demo.readNotifications(),
    };
  });
  expect(result.unknown).toMatchObject({ ok: false, error: { kind: 'outcomeUnknown' } });
  expect(result.inspection).toMatchObject({
    ok: true,
    value: { status: 'committed', result: { notification: { read: true, revision: 2 } } },
  });
  expect(result.changedKind).toMatchObject({
    ok: true,
    value: { preferences: { language: 'en', revision: 2 } },
  });
  expect(result.reusedLanguage).toMatchObject({ ok: false, error: { kind: 'staleNotification' } });
  expect(result.notices.ok && result.notices.value.map(notice => notice.revision)).toEqual([2, 1]);
});

test('expiry after staging rolls back a read and failed broadcasts cannot misreport a committed write', async ({
  page,
}) => {
  await openNotices(page);
  const result = await page.evaluate(async () => {
    const demo = window.demo;
    const context = await demo.context();
    if (!context.ok) throw new Error('No context');
    const command = {
      kind: 'markNotificationRead' as const,
      datasetId: context.value.datasetId,
      operationId: 'read-rollback',
      notificationId: 'RIFD-2026-004-notice',
      expectedRevision: 1,
    };
    const put = IDBObjectStore.prototype.put;
    let expireNext = true;
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
      const request = put.apply(this, args);
      if (expireNext && this.name === 'state') {
        expireNext = false;
        request.addEventListener('success', () => demo.expireSession());
      }
      return request;
    };
    const expired = await window.commitOn(demo, command);
    IDBObjectStore.prototype.put = put;
    await demo.signIn('huda');
    const beforeRetry = await demo.readNotifications();
    const aborted = await window.inspectOnNotification(demo, command);
    const hints: unknown[] = [];
    BroadcastChannel.prototype.postMessage = hint => {
      hints.push(hint);
      throw new Error('Broadcast fixture failure');
    };
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === 'rifd.commit.v1') throw new Error('Hint fixture failure');
      setItem.call(this, key, value);
    };
    demo.subscribe(() => {
      throw new Error('Observer fixture failure');
    });
    demo.setControls({ slow: false, failure: 'storage' });
    const committed = await window.commitOn(demo, command);
    const repeat = await window.commitOn(demo, command);
    const alreadyRead = await window.commitOn(demo, { ...command, expectedRevision: 2 });
    return {
      expired,
      beforeRetry,
      aborted,
      committed,
      repeat,
      alreadyRead,
      hints,
      controls: demo.controls(),
      datasetId: command.datasetId,
    };
  });
  expect(result.expired).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } });
  expect(
    result.beforeRetry.ok && result.beforeRetry.value.map(notice => [notice.read, notice.revision]),
  ).toEqual([
    [false, 1],
    [false, 1],
  ]);
  expect(result.aborted).toMatchObject({ ok: true, value: { status: 'notCommitted' } });
  expect(result.committed).toMatchObject({
    ok: true,
    value: { notification: { read: true, revision: 2 } },
  });
  expect(result.repeat).toMatchObject({ ok: false, error: { kind: 'staleNotification' } });
  expect(result.alreadyRead).toMatchObject({
    ok: true,
    value: { notification: { read: true, revision: 2 } },
  });
  expect(result.hints).toEqual([
    {
      datasetId: result.datasetId,
      kind: 'notification',
      notificationId: 'RIFD-2026-004-notice',
      revision: 2,
    },
  ]);
  expect(result.controls.failure).toBe('storage');
});
