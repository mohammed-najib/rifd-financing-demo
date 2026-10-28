import type { Firestore } from 'firebase-admin/firestore';
import { pruneExpiredConnections, type MetadataStore } from './admission';

export const metadataCollection = 'liveAssistanceMetadata';

export function firestoreMetadata(db: Firestore): MetadataStore {
  return {
    transaction(keys, update) {
      return db.runTransaction(async transaction => {
        const refs = keys.map(key => db.collection(metadataCollection).doc(key));
        const snapshots = await transaction.getAll(...refs);
        const next = update(
          Object.fromEntries(
            snapshots.map((snapshot, i) => [
              keys[i],
              snapshot.exists ? snapshot.data() : undefined,
            ]),
          ),
        );
        for (const [key, value] of Object.entries(next.writes)) {
          if (!keys.includes(key)) throw Error('Unreserved metadata key');
          transaction.set(
            db.collection(metadataCollection).doc(key),
            value as Record<string, unknown>,
          );
        }
        return next.value;
      });
    },
  };
}

// Numeric UTC expiries are enforced on reads as well as by this bounded sweep.
// Deletion is unconditional only for expired documents, rechecked transactionally
// so a refreshed guest record cannot be deleted by a stale cleanup query.
export async function cleanupMetadata(db: Firestore, now = Date.now()) {
  await pruneExpiredConnections(firestoreMetadata(db), now);
  const expired = await db
    .collection(metadataCollection)
    .where('expiresAt', '<=', now)
    .limit(500)
    .get();
  let deleted = 0;
  for (const candidate of expired.docs) {
    const removed = await db.runTransaction(async transaction => {
      const latest = await transaction.get(candidate.ref);
      const expiry: unknown = latest.get('expiresAt');
      if (typeof expiry !== 'number' || expiry > now) return false;
      transaction.delete(candidate.ref);
      return true;
    });
    if (removed) deleted++;
  }
  return deleted;
}
