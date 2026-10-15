import type { ActorId, Application, Bilingual, ProductId, Repayment } from './model.js'

export const domainDate = '2026-10-14'
export const submissionMonth = domainDate.slice(0, 7)
export const initialEvidenceMonths = ['2026-07', '2026-08', '2026-09']

export function validateFileEnvelope(file: { name: string; type: string; size: number }): string | null {
  if (!Number.isInteger(file.size) || file.size <= 0 || file.size > 5_000_000) return null
  const extension = /\.([^.]+)$/.exec(file.name)?.[1].toLowerCase()
  const mime = extension === 'pdf' ? 'application/pdf' : extension === 'png' ? 'image/png' : extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : null
  return mime && (!file.type || file.type === mime) ? mime : null
}

export type ProductRules = { id: ProductId; version: 1; name: Bilingual; minimum: number; maximum: number; terms: readonly number[]; markupPercent: number; purpose: Bilingual }
export const products: Record<ProductId, ProductRules> = {
  inventory: { id: 'inventory', version: 1, name: { ar: 'تمويل المخزون', en: 'Inventory financing' }, minimum: 100000, maximum: 1000000, terms: [6, 12], markupPercent: 5, purpose: { ar: 'تجديد مخزون نشاط تجاري صغير قائم.', en: 'Replenish stock for an established small business.' } },
  equipment: { id: 'equipment', version: 1, name: { ar: 'تمويل المعدات', en: 'Equipment financing' }, minimum: 500000, maximum: 3000000, terms: [12, 18, 24], markupPercent: 8, purpose: { ar: 'شراء معدات إنتاجية لنشاط تجاري صغير قائم.', en: 'Purchase productive equipment for an established small business.' } },
}

export function freezeRepayment(amount: number, term: number, rules: ProductRules, approvedAt: string, completedCount = 0): Repayment {
  if (!Number.isSafeInteger(amount) || amount < rules.minimum || amount > rules.maximum || !rules.terms.includes(term)) throw new Error('Invalid financing terms')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(approvedAt) || !Number.isInteger(completedCount) || completedCount < 0 || completedCount > term) throw new Error('Invalid approval context')
  const markup = Math.floor((amount * rules.markupPercent + 50) / 100)
  const total = amount + markup
  const regular = Math.floor(total / term)
  const [year, month] = approvedAt.split('-').map(Number)
  const rows: Repayment['rows'] = Array.from({ length: term }, (_, index) => {
    const monthIndex = year * 12 + month + index
    return {
      due: `${Math.floor(monthIndex / 12)}-${String(monthIndex % 12 + 1).padStart(2, '0')}-15`,
      amount: index === term - 1 ? total - regular * (term - 1) : regular,
      status: index < completedCount ? 'completed' : 'upcoming',
    }
  })
  const completed = rows.filter(row => row.status === 'completed').reduce((sum, row) => sum + row.amount, 0)
  return { amount, term, product: rules.id, ruleVersion: rules.version, approvedAt, markup, total, rows, completed, remaining: total - completed }
}

export function canReadApplication(actor: ActorId, application: Pick<Application, 'owner' | 'status'>): boolean {
  return actor === 'salma' ? application.status !== 'draft' : application.owner === actor
}

export function reviewPermissions(actor: ActorId, application: Pick<Application, 'status' | 'assignee'>) {
  const staff = actor === 'salma'
  const submitted = application.status === 'submitted'
  return {
    claimApplication: staff && submitted && application.assignee === null,
    transferApplication: staff && application.assignee !== null && ['submitted', 'underReview', 'correctionsRequested'].includes(application.status),
    unassignApplication: staff && submitted && application.assignee !== null,
    startReview: staff && submitted && application.assignee === actor,
    assessDocument: staff && application.assignee === actor && application.status === 'underReview',
    recordCheck: staff && application.assignee === actor && application.status === 'underReview',
    verifyCorrection: staff && application.assignee === actor && application.status === 'underReview',
    requestCorrections: staff && application.assignee === actor && application.status === 'underReview',
    approve: staff && application.assignee === actor && application.status === 'underReview',
    reject: staff && application.assignee === actor && application.status === 'underReview',
    saveNote: staff && application.assignee === actor && ['underReview', 'correctionsRequested', 'approved', 'rejected'].includes(application.status),
  }
}

export { applicationSteps, emptyDocuments, foldDigits, normalizeField, parseWholeYER, resolveStep, stepFields, validateFields } from './application.js'
export type { ApplicationStep, FieldIssue } from './application.js'

export { changedReviewChecks, currentCorrectionTargets, decisionReadiness, reviewDependencies, reviewRules } from './review.js'
export type { ReviewCheck } from './review.js'
