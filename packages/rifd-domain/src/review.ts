import { foldDigits, normalizeField, parseWholeYER } from './application.js'
import { domainDate, freezeRepayment, products } from './index.js'
import type { Fields, ProductId, Snapshot } from './model.js'

export const reviewDependencies = {
  evidence: { fields: ['fullName', 'businessName', 'address', 'operatingSince', 'revenue', 'expenses', 'explanation', 'budget'], documents: ['identity', 'business', 'financial', 'purchase'] },
  operatingHistory: { fields: ['operatingSince'], documents: ['business'] },
  purpose: { fields: ['activity', 'explanation'], documents: ['purchase'] },
  budget: { fields: ['amount', 'budget'], documents: ['purchase'] },
  capacity: { fields: ['amount', 'term', 'revenue', 'expenses'], documents: ['financial'] },
} as const
export type ReviewCheck = keyof typeof reviewDependencies

export function changedReviewChecks(before: Snapshot, after: Snapshot): ReviewCheck[] {
  return (Object.keys(reviewDependencies) as ReviewCheck[]).filter(check => {
    const dependencies = reviewDependencies[check]
    return dependencies.fields.some(field => normalizeField(field, before.fields[field]) !== normalizeField(field, after.fields[field]))
      || dependencies.documents.some(slot => before.documents[slot] !== after.documents[slot])
  })
}

// Call with a structurally valid submitted snapshot and its initial submission date.
export function reviewRules(fields: Fields, product: ProductId, submittedAt: string) {
  const monthIndex = (month: string) => { const [year, value] = month.split('-').map(Number); return year * 12 + value - 1 }
  const months = monthIndex(submittedAt.slice(0, 7)) - monthIndex(foldDigits(fields.operatingSince).trim())
  const amount = parseWholeYER(fields.amount)!
  const budget = parseWholeYER(fields.budget)!
  const surplus = parseWholeYER(fields.revenue)! - parseWholeYER(fields.expenses)!
  const repayment = freezeRepayment(amount, Number(foldDigits(fields.term).trim()), products[product], domainDate)
  const largestInstallment = Math.max(...repayment.rows.map(row => row.amount))
  return {
    operatingHistory: { months, passes: months >= 6 },
    budget: { amount, budget, passes: amount <= budget },
    capacity: { markup: repayment.markup, total: repayment.total, largestInstallment, surplus, passes: surplus > 0 && 5 * largestInstallment <= 2 * surplus },
  }
}
