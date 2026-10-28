import { expect, test } from 'vitest'
import { checkValidationAccounting } from '../../src/live-assistance/server/validation-accounting'

const now = Date.UTC(2026, 9, 18)
const reconciled = () => ({
  schemaVersion: 1, priorActualNano: 100_000_000, priorBillingEvidence: 'operator invoice reference',
  stoppedAttempts: [
    { id: 'development-pass-1/ar-identity-01/0', actualNano: 10_000_000, billingEvidence: 'provider record one' },
    { id: 'development-pass-1/ar-identity-01/1', actualNano: 10_000_000, billingEvidence: 'provider record two' },
  ],
  credit: { availableNano: 4_500_000_000, checkedAt: new Date(now).toISOString(), billingEvidence: 'current console reference', refillDisabled: true, dedicatedKeyConfirmed: true },
  validationAttempts: [],
  nextAttemptReservationsNano: [200_000_000, 200_000_000], pricingEvidence: 'current pessimistic maximum',
})

test('validation preflight stops on unreconciled historical charges or credit instead of substituting estimates', () => {
  const state = reconciled()
  expect(checkValidationAccounting({ ...state, priorActualNano: null }, now)).toMatchObject({ eligibleForReservation: false })
  expect(checkValidationAccounting({ ...state, stoppedAttempts: state.stoppedAttempts.map(a => ({ ...a, actualNano: null })) }, now)).toMatchObject({ eligibleForReservation: false })
  expect(checkValidationAccounting({ ...state, credit: { ...state.credit, availableNano: null } }, now)).toMatchObject({ eligibleForReservation: false })
})

test('actual cumulative charges and pessimistic reservations must fit both the dollar ceiling and protected credit', () => {
  const state = reconciled()
  // 0.10 + 0.01 + 0.01 actual, plus 0.40 reserved, leaves 4.10 credit.
  expect(checkValidationAccounting(state, now)).toMatchObject({ eligibleForReservation: true, actualNano: 120_000_000, reservedNano: 400_000_000 })
  expect(checkValidationAccounting({ ...state, priorActualNano: 600_000_001 }, now)).toMatchObject({ eligibleForReservation: false, reason: 'validation-ceiling' })
  expect(checkValidationAccounting({ ...state, credit: { ...state.credit, availableNano: 4_399_999_999 } }, now)).toMatchObject({ eligibleForReservation: false, reason: 'protected-credit' })
  expect(checkValidationAccounting({ ...state, priorActualNano: 580_000_000, credit: { ...state.credit, availableNano: 4_400_000_000 } }, now)).toMatchObject({ eligibleForReservation: true })
})

test('existing reservations and every attempted outcome remain counted without reopening the retired controller', () => {
  const state = reconciled()
  const attempt = { id: 'new-smoke-1', state: 'reserved', maximumNano: 200_000_000, actualNano: null, billingEvidence: null }
  expect(checkValidationAccounting({ ...state, validationAttempts: [attempt] }, now)).toMatchObject({ eligibleForReservation: false, reason: 'protected-credit' })
  expect(checkValidationAccounting({ ...state, validationAttempts: [{ ...attempt, state: 'unknown' }] }, now)).toMatchObject({ eligibleForReservation: false, reason: 'unknown-billing' })
  const settled = { ...attempt, state: 'reconciled', actualNano: 100_000_000, billingEvidence: 'settled provider record' }
  expect(checkValidationAccounting({ ...state, validationAttempts: [settled] }, now)).toMatchObject({ eligibleForReservation: true, actualNano: 220_000_000 })
  expect(checkValidationAccounting({ ...state, validationAttempts: [settled, { ...settled, id: '2' }, { ...settled, id: '3' }] }, now)).toMatchObject({ eligibleForReservation: false, reason: 'attempt-budget' })
  expect(checkValidationAccounting({ ...state, validationAttempts: [settled, settled] }, now)).toMatchObject({ eligibleForReservation: false, reason: 'invalid-attempt-accounting' })
  expect(checkValidationAccounting({ ...state, validationAttempts: [{ ...settled, actualNano: 200_000_001 }] }, now)).toMatchObject({ eligibleForReservation: false, reason: 'invalid-attempt-accounting' })
  expect(checkValidationAccounting(state, now + 900_001)).toMatchObject({ eligibleForReservation: false, reason: 'stale-credit' })
  expect(checkValidationAccounting(state, now - 1)).toMatchObject({ eligibleForReservation: false, reason: 'stale-credit' })
})
