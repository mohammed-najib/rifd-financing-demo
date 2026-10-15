import { describe, expect, it } from 'vitest'
import { changedReviewChecks, currentCorrectionTargets, reviewRules } from './index'
import type { Application, Fields, Snapshot } from './model'

const fields: Fields = { fullName: 'مريم سالم', mobile: '+000000000001', city: 'عدن', email: '', businessName: 'متجر تجريبي', activity: 'retail', address: 'شارع السوق، عدن', operatingSince: '2026-04', revenue: '700000', expenses: '500000', amount: '100010', term: '6', budget: '250000', explanation: 'Purchase fictional retail stock.' }

it('uses the latest request for each target while retaining unrelated outstanding verification', () => {
  const snapshot: Snapshot = { fields, documents: { identity: null, business: null, financial: null, purchase: null } }
  const reason = { ar: 'تغيير مطلوب', en: 'Change required' }
  const rounds: Application['rounds'] = [
    { id: 'first', requestedAt: '2026-10-01', baseline: snapshot, response: snapshot, targets: [{ kind: 'field', field: 'amount', reason, verified: false }, { kind: 'field', field: 'mobile', reason, verified: false }, { kind: 'document', slot: 'purchase', reason, verified: false }] },
    { id: 'second', requestedAt: '2026-10-02', baseline: snapshot, response: snapshot, targets: [{ kind: 'field', field: 'amount', reason, verified: true }, { kind: 'document', slot: 'purchase', reason, verified: true }] },
  ]
  expect(currentCorrectionTargets(rounds).map(({ roundId, target }) => [roundId, target.kind === 'field' ? target.field : target.slot, target.verified])).toEqual([
    ['first', 'mobile', false], ['second', 'amount', true], ['second', 'purchase', true],
  ])
  expect(rounds[0].targets.every(target => !target.verified)).toBe(true)
})

describe('review criteria', () => {
  it('uses the initial submission month and the inclusive six-month boundary', () => {
    expect(reviewRules(fields, 'inventory', '2026-10-02').operatingHistory).toEqual({ months: 6, passes: true })
    expect(reviewRules({ ...fields, operatingSince: '٢٠٢٦-٠٤' }, 'inventory', '2026-10-02').operatingHistory).toEqual({ months: 6, passes: true })
    expect(reviewRules({ ...fields, operatingSince: '2026-05' }, 'inventory', '2026-10-02').operatingHistory).toEqual({ months: 5, passes: false })
  })
  it('uses half-up markup and the final installment at the exact capacity boundary', () => {
    const result = reviewRules({ ...fields, revenue: '٤٣٬٧٦٥', expenses: '0' }, 'inventory', '2026-10-02')
    expect(result.capacity).toEqual({ markup: 5001, total: 105011, largestInstallment: 17506, surplus: 43765, passes: true })
    expect(reviewRules({ ...fields, revenue: '43764', expenses: '0' }, 'inventory', '2026-10-02').capacity.passes).toBe(false)
    expect(reviewRules({ ...fields, revenue: '500000', expenses: '500000' }, 'inventory', '2026-10-02').capacity.passes).toBe(false)
    expect(reviewRules({ ...fields, revenue: '0', expenses: '1' }, 'inventory', '2026-10-02').capacity.passes).toBe(false)
  })
  it('allows financing exactly equal to the purchase budget', () => {
    expect(reviewRules({ ...fields, budget: '100010' }, 'inventory', '2026-10-02').budget.passes).toBe(true)
    expect(reviewRules({ ...fields, budget: '100009' }, 'inventory', '2026-10-02').budget.passes).toBe(false)
  })
  it('identifies exact field and document dependencies without treating formatting as change', () => {
    const baseline: Snapshot = { fields, documents: { identity: 'id', business: 'business', financial: 'financial', purchase: 'plan' } }
    const response = (changes: Partial<Fields>, documents = baseline.documents) => ({ fields: { ...fields, ...changes }, documents })
    expect(changedReviewChecks(baseline, response({ amount: '١٠٠٬٠١٠', fullName: '  مريم   سالم ' }))).toEqual([])
    expect(changedReviewChecks(baseline, response({ amount: '100000' }, { ...baseline.documents, purchase: 'new-plan' }))).toEqual(['evidence', 'purpose', 'budget', 'capacity'])
    expect(changedReviewChecks(baseline, response({ mobile: '+000000000002', city: 'تعز', email: 'a@example.test' }))).toEqual([])
    expect(changedReviewChecks(baseline, response({}, { ...baseline.documents, business: 'new-business' }))).toEqual(['evidence', 'operatingHistory'])
    expect(changedReviewChecks(baseline, response({ revenue: '700001' }))).toEqual(['evidence', 'capacity'])
    expect(changedReviewChecks(baseline, response({ activity: 'services' }))).toEqual(['purpose'])
    expect(changedReviewChecks(baseline, response({ term: '12' }))).toEqual(['capacity'])
  })
})

const dependencies: Array<[keyof Fields, string, string[]]> = [
  ['fullName', 'اسم مختلف', ['evidence']], ['businessName', 'نشاط مختلف', ['evidence']],
  ['address', 'عنوان مختلف', ['evidence']], ['operatingSince', '2025-01', ['evidence', 'operatingHistory']],
  ['revenue', '700001', ['evidence', 'capacity']], ['expenses', '500001', ['evidence', 'capacity']],
  ['explanation', 'Another fictional purchase explanation.', ['evidence', 'purpose']],
  ['budget', '250001', ['evidence', 'budget']], ['activity', 'production', ['purpose']],
  ['amount', '100011', ['budget', 'capacity']], ['term', '12', ['capacity']],
]
it.each(dependencies)('rechecks exactly the specified dependencies for %s', (field, value, expected) => {
  const before: Snapshot = { fields, documents: { identity: 'identity', business: 'business', financial: 'financial', purchase: 'purchase' } }
  expect(changedReviewChecks(before, { ...before, fields: { ...fields, [field]: value } })).toEqual(expected)
})
it.each([
  ['identity', ['evidence']], ['business', ['evidence', 'operatingHistory']],
  ['financial', ['evidence', 'capacity']], ['purchase', ['evidence', 'purpose', 'budget']],
] as const)('rechecks exact dependencies for a changed %s document identity', (slot, expected) => {
  const before: Snapshot = { fields, documents: { identity: 'identity', business: 'business', financial: 'financial', purchase: 'purchase' } }
  expect(changedReviewChecks(before, { ...before, documents: { ...before.documents, [slot]: 'replacement' } })).toEqual(expected)
})
