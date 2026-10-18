import { initializeApp, deleteApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { expect, test } from 'vitest'
import { createAdmission } from '../../src/live-assistance/admission'
import { firestoreMetadata, cleanupMetadata, metadataCollection } from '../../src/live-assistance/firestore'

test.skipIf(!process.env.FIRESTORE_EMULATOR_HOST)('Firestore transactions serialize revisions, deny browser metadata access and clean expired records', async () => {
  if (!/^127\.0\.0\.1:\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST ?? '')) throw Error('local-emulator-required')
  const app = initializeApp({ projectId: 'demo-rifd' }, 'live-emulator-test')
  const db = getFirestore(app), collection = db.collection(metadataCollection)
  const key = 'dummy-key-with-at-least-thirty-two-bytes'
  const now = Date.UTC(2026, 9, 18), expires = Date.UTC(2026, 9, 20)
  try {
    const old = await collection.get()
    const batch = db.batch(); old.docs.forEach(doc => batch.delete(doc.ref)); await batch.commit()
    await collection.doc('control').set({ enabled: true, slots: [] })
    const revisions = [createAdmission(firestoreMetadata(db), key), createAdmission(firestoreMetadata(db), key)]
    const reserve = (i: number) => revisions[i % 2].reserve({ guest: `private-guest-${i}`, network: `192.0.2.${i}`, runId: `private-run-${i}`, fingerprint: 'keyed-input', attempts: 9, now })
    const outcomes = await Promise.allSettled(Array.from({ length: 12 }, (_, i) => reserve(i)))
    expect(outcomes.filter(result => result.status === 'fulfilled').length).toBeLessThanOrEqual(11)
    // Firestore can exhaust transaction retries under deliberate contention.
    // Retrying the same fixed IDs serially must still stop at the shared limit.
    for (let i = 0; i < outcomes.length; i++) if (outcomes[i].status === 'rejected') outcomes[i] = (await Promise.allSettled([reserve(i)]))[0]
    expect(outcomes.filter(result => result.status === 'fulfilled')).toHaveLength(11)
    expect(outcomes.find(result => result.status === 'rejected')).toMatchObject({ reason: { message: 'daily-allowance' } })
    const ticket = outcomes.find(result => result.status === 'fulfilled')
    if (ticket?.status !== 'fulfilled') throw Error('no-reservation')
    await revisions[0].mark(ticket.value, 0, now)
    await cleanupMetadata(db, now + 60_000)
    expect((await collection.doc('control').get()).get('slots')).toEqual([])
    const guestKey = ticket.value.keys.find(key => key.startsWith('guest-'))!
    await collection.doc(guestKey).delete()
    const guestIndex = outcomes.findIndex(result => result.status === 'fulfilled')
    await expect(revisions[1].reserve({ guest: `private-guest-${guestIndex}`, network: `192.0.2.${guestIndex}`, runId: 'new-after-missing-state', fingerprint: 'new', attempts: 1, now: now + 61_000 })).rejects.toThrow('accounting-unavailable')
    // Rules apply even when somebody knows a document's opaque name.
    const denied = await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/demo-rifd/databases/(default)/documents/${metadataCollection}/${ticket.value.key}`)
    expect(denied.status).toBe(403)
    const metadata = await collection.get()
    const serialized = JSON.stringify(metadata.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    expect(serialized).not.toContain('private-guest-')
    expect(serialized).not.toContain('192.0.2.')
    expect(serialized).not.toContain('private-run-')
    expect((await collection.doc('month-2026-10').get()).get('expiresAt')).toBe(Date.UTC(2026, 11, 6))
    expect(await cleanupMetadata(db, expires - 1)).toBe(0)
    expect(await cleanupMetadata(db, expires)).toBeGreaterThan(0)
    expect((await collection.get()).docs.map(doc => doc.id).sort()).toEqual(['control', 'month-2026-10'])
    await cleanupMetadata(db, Date.UTC(2026, 11, 6))
    expect((await collection.get()).docs.map(doc => doc.id)).toEqual(['control'])
  } finally { await db.terminate(); await deleteApp(app) }
}, 90_000)
