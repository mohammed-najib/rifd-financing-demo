import { z } from 'zod';

const money = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const evidence = z.string().trim().min(1).max(2000);
const stateSchema = z
  .object({
    schemaVersion: z.literal(1),
    // All actual pre-feature charges except the two separately listed stopped attempts.
    priorActualNano: money,
    priorBillingEvidence: evidence,
    stoppedAttempts: z
      .array(z.object({ id: z.string(), actualNano: money, billingEvidence: evidence }).strict())
      .length(2),
    credit: z
      .object({
        availableNano: money,
        checkedAt: z.iso.datetime(),
        billingEvidence: evidence,
        refillDisabled: z.literal(true),
        dedicatedKeyConfirmed: z.literal(true),
      })
      .strict(),
    validationAttempts: z
      .array(
        z
          .object({
            id: z.string().min(1),
            state: z.enum(['reserved', 'reconciled', 'unknown']),
            maximumNano: money.positive(),
            actualNano: money.nullable(),
            billingEvidence: evidence.nullable(),
          })
          .strict(),
      )
      .max(4),
    nextAttemptReservationsNano: z.array(money.positive()).min(1).max(2),
    pricingEvidence: evidence,
  })
  .strict();

// Read-only preparation for ticket 14. This neither reserves nor dispatches work,
// modifies a historical ledger, nor authorizes restarting its halted controller.
export function checkValidationAccounting(input: unknown, now = Date.now()) {
  const parsed = stateSchema.safeParse(input);
  if (!parsed.success) return { eligibleForReservation: false, reason: 'missing-reconciliation' };
  const state = parsed.data;
  const ids = state.stoppedAttempts.map(attempt => attempt.id).sort();
  if (ids.join(',') !== 'development-pass-1/ar-identity-01/0,development-pass-1/ar-identity-01/1')
    return { eligibleForReservation: false, reason: 'missing-stopped-attempts' };
  const checkedAt = Date.parse(state.credit.checkedAt);
  // A future runner must reread current credit and reserve durably immediately
  // before dispatch. Even this preparatory observation expires in 15 minutes.
  if (!Number.isFinite(now) || checkedAt > now || now - checkedAt > 15 * 60_000)
    return { eligibleForReservation: false, reason: 'stale-credit' };
  if (state.validationAttempts.length + state.nextAttemptReservationsNano.length > 4)
    return { eligibleForReservation: false, reason: 'attempt-budget' };
  if (
    new Set(state.validationAttempts.map(attempt => attempt.id)).size !==
    state.validationAttempts.length
  )
    return { eligibleForReservation: false, reason: 'invalid-attempt-accounting' };
  let actualNano =
    state.priorActualNano +
    state.stoppedAttempts.reduce((sum, attempt) => sum + attempt.actualNano, 0);
  let reservedNano = state.nextAttemptReservationsNano.reduce((sum, amount) => sum + amount, 0);
  for (const attempt of state.validationAttempts) {
    if (attempt.state === 'unknown')
      return { eligibleForReservation: false, reason: 'unknown-billing' };
    if (attempt.state === 'reconciled') {
      if (
        attempt.actualNano === null ||
        attempt.actualNano > attempt.maximumNano ||
        !attempt.billingEvidence
      )
        return { eligibleForReservation: false, reason: 'invalid-attempt-accounting' };
      actualNano += attempt.actualNano;
    } else {
      if (attempt.actualNano !== null || attempt.billingEvidence !== null)
        return { eligibleForReservation: false, reason: 'invalid-attempt-accounting' };
      reservedNano += attempt.maximumNano;
    }
  }
  if (actualNano + reservedNano > 1_000_000_000)
    return { eligibleForReservation: false, reason: 'validation-ceiling' };
  if (state.credit.availableNano - reservedNano < 4_000_000_000)
    return { eligibleForReservation: false, reason: 'protected-credit' };
  return {
    eligibleForReservation: true,
    reason: 'eligible-for-durable-reservation',
    actualNano,
    reservedNano,
  };
}
