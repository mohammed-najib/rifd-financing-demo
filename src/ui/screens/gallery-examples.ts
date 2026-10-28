import type { ApplicationSummary } from '../../demo'
import { freezeRepayment, products } from '../../domain'
import type { Application, Fields, Notification } from '../../domain/model'

export const initialFields: Fields = {
  fullName: 'مريم سالم Mariam Salem', mobile: '+967 777 123 456', city: 'صنعاء', email: 'mariam@example.test',
  businessName: 'متجر الأقمشة Textile supplies', activity: 'retail', address: 'شارع الزبيري Al Zubairi Street، مبنى 12، صنعاء',
  operatingSince: '2025-01', revenue: '600000', expenses: '200000', amount: '1,00,000', term: '6', budget: '400000',
  explanation: 'شراء مخزون من الأقمشة واللوازم لموسم جديد. Textile supplies, batch RIFD-2026-EXAMPLE-001, for the fictional shop in صنعاء. هذا نص طويل لفحص التفاف السطور في الاتجاهين.',
}
export const exampleFile = { name: 'خطة-الشراء-purchase-plan-RIFD-2026-EXAMPLE-001.pdf', mime: 'application/pdf', size: 24800 }
export const exampleRows: ApplicationSummary[] = [
  { id: 'RIFD-2026-EXAMPLE-001', product: 'inventory', status: 'submitted', fullName: initialFields.fullName, businessName: 'متجر الأقمشة واللوازم المنزلية Textile supplies in صنعاء', amount: '300000', term: '6', submittedAt: '2026-10-14', nextAction: 'viewApplication', assignment: null },
  { id: 'RIFD-2026-EXAMPLE-002', product: 'equipment', status: 'underReview', fullName: 'هدى علي Huda Ali', businessName: 'ورشة المعدات Equipment workshop', amount: '1200000', term: '12', submittedAt: '2026-10-13', nextAction: 'viewApplication', assignedToYou: true },
]
export const exampleNotice: Notification = { id: 'gallery-notice', applicationId: 'RIFD-2026-EXAMPLE-001', owner: 'mariam', kind: 'approved', date: '2026-10-14', read: false, revision: 1 }
export const exampleHistory: Application['history'] = [
  { id: 'gallery-submitted', sequence: 1, date: '2026-10-10', kind: 'submitted', reason: null },
  { id: 'gallery-review', sequence: 2, date: '2026-10-12', kind: 'reviewStarted', reason: null },
  { id: 'gallery-approved', sequence: 3, date: '2026-10-14', kind: 'approved', reason: { ar: 'اكتملت مراجعة المثال.', en: 'The example review is complete.' } },
]
export const exampleRepayment = freezeRepayment(300_000, 6, products.inventory, '2026-10-14', 2)
export const examplePreview = {
  name: 'rifd-example.svg', mime: 'image/svg+xml',
  url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="600" height="800" fill="#fffdf8"/><rect x="60" y="60" width="480" height="8" fill="#0b6458"/><text x="60" y="125" font-family="sans-serif" font-size="32" fill="#0b6458">RIFD</text><g fill="#e0d8ca"><rect x="60" y="180" width="300" height="14"/><rect x="60" y="220" width="480" height="10"/><rect x="60" y="250" width="480" height="10"/><rect x="60" y="280" width="360" height="10"/><rect x="60" y="360" width="480" height="180" rx="8"/></g><text x="60" y="700" font-family="sans-serif" font-size="18" fill="#70685b">Component preview</text></svg>')}`,
}
