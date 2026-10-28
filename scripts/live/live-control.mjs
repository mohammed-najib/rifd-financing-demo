import { initializeApp, applicationDefault, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const [projectId, action] = process.argv.slice(2);
if (!projectId || !['initialize', 'disable', 'status'].includes(action))
  throw Error('Usage: node scripts/live-control.mjs PROJECT initialize|disable|status');
const app = initializeApp({ projectId, credential: applicationDefault() });
try {
  const db = getFirestore(app),
    control = db.collection('liveAssistanceMetadata').doc('control');
  if (action === 'initialize')
    await db.runTransaction(async transaction => {
      if ((await transaction.get(control)).exists)
        throw Error('Control already exists; initialization cannot reset allowances');
      transaction.create(control, { enabled: false, slots: [] });
    });
  if (action === 'disable')
    await db.runTransaction(async transaction => {
      if (!(await transaction.get(control)).exists) throw Error('Missing admission state');
      transaction.update(control, { enabled: false });
    });
  const record = await control.get();
  console.log(
    JSON.stringify({
      exists: record.exists,
      enabled: record.get('enabled') === true,
      accountingBlocked: record.get('accountingBlocked') === true,
      pendingUsage: record.get('pendingUsage')?.length ?? 0,
    }),
  );
  await db.terminate();
} finally {
  await deleteApp(app);
}
