// Bundle into a temporary IAM-private verifier. This is never imported by the
// public application or functions entry point and has no provider transport.
import { randomBytes, randomUUID } from 'node:crypto'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { createAdmission } from '../src/live-assistance/admission'
import { cleanupMetadata, firestoreMetadata, metadataCollection } from '../src/live-assistance/firestore'

export async function verifyHostedAdmission() {
  const db = getFirestore()
  const liveControl = db.collection(metadataCollection).doc('control')
  const before = (await liveControl.get()).data()
  if (!before || before.enabled !== false || before.slots?.length || before.pendingUsage?.length) throw Error('live-control-must-stay-closed')
  const collectionName = `liveAssistanceVerification_${randomUUID().replaceAll('-', '')}`
  const collection = db.collection(collectionName)
  // The production adapter and cleanup run unchanged. Only the collection is
  // redirected, so no test can enable production control or change allowances.
  const isolated = new Proxy(db, {
    get(target, property) {
      if (property === 'collection') return (name: string) => {
        if (name !== metadataCollection) throw Error('unexpected-collection')
        return collection
      }
      const value = Reflect.get(target, property)
      return typeof value === 'function' ? value.bind(target) : value
    },
  }) as Firestore
  const secret = randomBytes(48).toString('base64url')
  const revisions = [createAdmission(firestoreMetadata(isolated), secret), createAdmission(firestoreMetadata(isolated), secret)]
  // Independent calendar example from the retention policy. Keep the expected
  // dates literal rather than repeating the production expiry calculation.
  const now = Date.parse('2026-10-18T12:00:00Z')
  const day = '2026-10-18', month = '2026-10'
  const dailyExpiry = Date.parse('2026-10-20T00:00:00Z')
  const monthlyExpiry = Date.parse('2026-12-06T00:00:00Z')
  const checks: { name: string; passed: boolean }[] = []
  function check(name: string, passed: boolean) {
    checks.push({ name, passed })
    if (!passed) throw Error(name)
  }
  async function denied(action: () => Promise<unknown>, reason: string) {
    try { await action(); return false } catch (error) { return error instanceof Error && error.message === reason }
  }
  async function clear() {
    const documents = await collection.limit(200).get()
    if (documents.size === 200) throw Error('verification-document-limit')
    const batch = db.batch()
    documents.docs.forEach(document => batch.delete(document.ref))
    await batch.commit()
  }
  async function reset() { await clear(); await collection.doc('control').set({ enabled: true, slots: [] }) }
  const input = (i: number, at = now, attempts = 9) => ({ guest: `fixture-guest-${i}`, network: `192.0.2.${i + 1}`, runId: `fixture-run-${i}`, fingerprint: 'fixture-keyed-input', attempts, now: at })
  let failure: string | undefined, cleanupComplete = false
  try {
    await reset()
    const duplicates = await Promise.all(revisions.map(revision => revision.reserve(input(0))))
    check('cross-instance-deduplication', duplicates.filter(ticket => ticket.duplicate).length === 1 && (await collection.doc(`day-${day}`).get()).get('attempts') === 9)
    const ticket = duplicates.find(value => !value.duplicate)!
    const records = await Promise.all(ticket.keys.filter(key => key.startsWith('run-') || key.startsWith('guest-') || key.startsWith('network-') || key.startsWith('day-')).map(key => collection.doc(key).get()))
    check('daily-expiry-is-second-following-utc-midnight', records.filter(record => record.exists).every(record => record.get('expiresAt') === dailyExpiry))
    check('monthly-expiry-is-next-month-start-plus-35-days', (await collection.doc(`month-${month}`).get()).get('expiresAt') === monthlyExpiry)
    check('same-guest-concurrency-refused', await denied(() => revisions[1].reserve({ ...input(0), runId: 'fixture-concurrent-run' }), 'guest-active'))
    await collection.doc('control').update({ enabled: false })
    check('operator-disable-stops-reservation', await denied(() => revisions[1].reserve(input(1)), 'service-disabled'))
    check('operator-disable-stops-existing-run', await denied(() => revisions[0].recheck(ticket, now), 'service-disabled'))

    await reset()
    const outcomes = await Promise.allSettled(Array.from({ length: 12 }, (_, i) => revisions[i % 2].reserve(input(i))))
    // Retry contention failures with the same IDs, never with replacement IDs.
    for (let i = 0; i < outcomes.length; i++) if (outcomes[i].status === 'rejected') outcomes[i] = (await Promise.allSettled([revisions[i % 2].reserve(input(i))]))[0]
    check('transactional-daily-cap-across-instances', outcomes.filter(result => result.status === 'fulfilled').length === 11 && outcomes.some(result => result.status === 'rejected' && result.reason?.message === 'daily-allowance') && (await collection.doc(`day-${day}`).get()).get('attempts') === 99)

    await reset()
    const slots = await Promise.all([0, 1, 2].map(i => revisions[i % 2].reserve(input(i))))
    await revisions[0].mark(slots[0], 0, now)
    await revisions[1].mark(slots[1], 0, now)
    check('two-connection-cap', await denied(() => revisions[0].mark(slots[2], 0, now), 'service-busy'))
    await cleanupMetadata(isolated, now + 60_000)
    const pruned = (await collection.doc('control').get()).data()!
    check('cleanup-prunes-expired-connection-slots', pruned.slots.length === 0)
    check('expired-connection-preserves-unknown-accounting-stop', pruned.pendingUsage.length === 2 && await denied(() => revisions[0].reserve(input(3, now + 61_000)), 'accounting-unavailable'))

    await reset()
    const refundable = await revisions[0].reserve(input(0))
    const connection = await revisions[0].mark(refundable, 0, now)
    await revisions[0].disconnect(connection)
    await revisions[0].finish(refundable, 'stopped', now)
    check('only-unmarked-attempts-refunded', (await collection.doc(`day-${day}`).get()).get('attempts') === 1 && (await collection.doc(refundable.key).get()).get('released') === 8)
    check('terminal-run-id-deduplicates', (await revisions[1].reserve(input(0))).status === 'stopped')
    check('expired-run-read-refused-before-sweep', await denied(() => revisions[1].reserve(input(0, dailyExpiry)), 'run-expired'))
    const serialized = JSON.stringify((await collection.get()).docs.map(document => ({ id: document.id, ...document.data() })))
    check('metadata-has-no-raw-guest-network-or-run-id', !/fixture-guest-|fixture-run-|192\.0\.2\./.test(serialized))
    await cleanupMetadata(isolated, dailyExpiry - 1)
    check('daily-records-retained-before-expiry', (await collection.doc(refundable.key).get()).exists)
    await cleanupMetadata(isolated, dailyExpiry)
    check('daily-expired-records-deleted-monthly-retained', (await collection.get()).docs.map(document => document.id).sort().join(',') === `control,month-${month}`)
    await cleanupMetadata(isolated, monthlyExpiry)
    check('monthly-expired-records-deleted', (await collection.get()).docs.map(document => document.id).join(',') === 'control')

    await reset()
    await collection.doc(`month-${month}`).set({ attempts: 995, expiresAt: monthlyExpiry })
    check('monthly-cap-refused', await denied(() => revisions[0].reserve(input(0)), 'monthly-allowance'))
  } catch (error) { failure = error instanceof Error ? error.message : 'verification-failed' }
  finally {
    await clear()
    cleanupComplete = (await collection.limit(1).get()).empty
  }
  const after = (await liveControl.get()).data()
  const liveControlPreserved = !!after && JSON.stringify(before) === JSON.stringify(after)
  return {
    checkedAt: new Date().toISOString(), providerAttempts: 0,
    method: 'Production admission/Firestore modules executed in an IAM-private cloud function with an isolated real Firestore collection; two independent admission instances; no provider transport',
    dailyExpiry: new Date(dailyExpiry).toISOString(), monthlyExpiry: new Date(monthlyExpiry).toISOString(),
    checks, failure, syntheticDocumentsRemoved: cleanupComplete, liveControlPreserved,
    limitation: 'Tests production components in the deployed runtime. The public HTTP handler remains disabled and does not execute admission or provider work. Future expiry boundaries use explicit clock parameters, not elapsed wall-clock observation.',
    passed: !failure && checks.every(value => value.passed) && cleanupComplete && liveControlPreserved,
  }
}
