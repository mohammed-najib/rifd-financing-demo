import type { DocumentSlot, Fields } from './model'
import type { ProductRules } from './index'

export type FieldIssue = { field: keyof Fields; rule: 'text' | 'mobile' | 'email' | 'activity' | 'month' | 'money' | 'amount' | 'term'; minimum?: number; maximum?: number }
export const foldDigits = (value: string) => value.replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x660))

export function parseWholeYER(raw: string): number | null {
  const value = foldDigits(raw).trim()
  if (!/^(?:\d+|\d{1,3}(?:[,٬]\d{3})+)$/.test(value)) return null
  const amount = Number(value.replace(/[,٬]/g, ''))
  return Number.isSafeInteger(amount) ? amount : null
}

function monthValue(raw: string): string | null {
  const value = foldDigits(raw).trim()
  return /^(?!0000)\d{4}-(?:0[1-9]|1[0-2])$/.test(value) ? value : null
}

export function normalizeField(field: keyof Fields, raw: string): string {
  const value = foldDigits(raw).trim()
  if (['amount', 'revenue', 'expenses', 'budget'].includes(field)) {
    const number = parseWholeYER(value)
    if (number !== null) return String(number)
  }
  if (field === 'term' && /^\d+$/.test(value)) return String(Number(value))
  if (field === 'operatingSince') return monthValue(value) ?? value
  if (field === 'mobile') return value.replace(/[\s-]/g, '')
  if (field === 'email') return value.toLowerCase()
  return value.normalize('NFC').replace(/\s+/g, ' ').toLowerCase()
}

export function validateFields(fields: Fields, product: ProductRules, submissionMonth: string): FieldIssue[] {
  const issues: FieldIssue[] = []
  const limits = { fullName: [2, 100], city: [2, 60], businessName: [2, 100], address: [5, 250], explanation: [20, 500] } as const
  for (const [field, [minimum, maximum]] of Object.entries(limits)) {
    const length = [...fields[field as keyof Fields].trim()].length
    if (length < minimum || length > maximum) issues.push({ field: field as keyof Fields, rule: 'text', minimum, maximum })
  }
  if (!/^\+?\d{9,15}$/.test(normalizeField('mobile', fields.mobile))) issues.push({ field: 'mobile', rule: 'mobile' })
  const email = fields.email.trim()
  const label = '[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?'
  if (email && (email.length > 254 || !new RegExp(`^[A-Za-z0-9.!#$%&'*+/=?^_\x60{|}~-]+@${label}(?:\\.${label})+$`).test(email))) issues.push({ field: 'email', rule: 'email' })
  if (!['retail', 'services', 'production'].includes(fields.activity)) issues.push({ field: 'activity', rule: 'activity' })
  const month = monthValue(fields.operatingSince)
  if (!month || month > submissionMonth) issues.push({ field: 'operatingSince', rule: 'month' })
  for (const field of ['revenue', 'expenses', 'budget', 'amount'] as const) {
    const minimum = field === 'amount' ? product.minimum : field === 'budget' ? 1 : 0
    const maximum = field === 'amount' ? product.maximum : 50_000_000
    const value = parseWholeYER(fields[field])
    if (value === null || value < minimum || value > maximum) issues.push({ field, rule: field === 'amount' ? 'amount' : 'money', minimum, maximum })
  }
  const term = foldDigits(fields.term).trim()
  if (!/^\d+$/.test(term) || !product.terms.includes(Number(term))) issues.push({ field: 'term', rule: 'term' })
  return issues
}

export const applicationSteps = ['personal', 'business', 'financing', 'documents', 'review'] as const
export type ApplicationStep = typeof applicationSteps[number]
export const resolveStep = (value: unknown): ApplicationStep => applicationSteps.includes(value as ApplicationStep) ? value as ApplicationStep : 'personal'
export const stepFields: Record<Exclude<ApplicationStep, 'documents' | 'review'>, readonly (keyof Fields)[]> = {
  personal: ['fullName', 'mobile', 'city', 'email'],
  business: ['businessName', 'activity', 'address', 'operatingSince', 'revenue', 'expenses'],
  financing: ['amount', 'term', 'budget', 'explanation'],
}
export const emptyDocuments = (): Record<DocumentSlot, null> => ({ identity: null, business: null, financial: null, purchase: null })
