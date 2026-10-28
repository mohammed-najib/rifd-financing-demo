import type { ApplicationStatus, Bilingual, DocumentSlot, Fields, Identity, ProductId } from '../../domain/model'

export const identities: Identity[] = [
  { id: 'mariam', name: { ar: 'مريم سالم', en: 'Mariam Salem' }, role: 'applicant', selectable: true, mobile: '+000000000001', email: 'mariam@example.test', city: 'عدن' },
  { id: 'huda', name: { ar: 'هدى علي', en: 'Huda Ali' }, role: 'applicant', selectable: true, mobile: '+000000000002', email: 'huda@example.test', city: 'عدن' },
  { id: 'omar', name: { ar: 'عمر حسن', en: 'Omar Hassan' }, role: 'applicant', selectable: true, mobile: '+000000000003', email: 'omar@example.test', city: 'عدن' },
  { id: 'salma', name: { ar: 'سلمى ناصر', en: 'Salma Nasser' }, role: 'reviewer', selectable: true, mobile: '', email: '', city: '' },
  { id: 'khaled', name: { ar: 'خالد علي', en: 'Khaled Ali' }, role: 'reviewer', selectable: false, mobile: '', email: '', city: '' },
]
export const amountReason: Bilingual = {
  ar: 'القسط التوضيحي 105,000 ر.ي. يتجاوز حد القدرة الافتراضي 80,000 ر.ي. يرجى خفض مبلغ التمويل المطلوب.',
  en: 'The illustrated installment of 105,000 YER exceeds the fictional capacity limit of 80,000 YER. Please reduce the financing request.',
}
export const purchaseReason: Bilingual = {
  ar: 'يرجى تقديم خطة شراء مقروءة توضح المشتريات المقصودة والتكلفة الإجمالية.',
  en: 'Please provide a readable purchase plan showing the intended purchases and total cost.',
}
export const financialReason: Bilingual = {
  ar: 'يرجى تقديم ملخص مقروء لشهور يوليو إلى سبتمبر يدعم متوسط الإيرادات والمصروفات المعلنة.',
  en: 'Please provide a readable July to September summary supporting the declared revenue and expense averages.',
}
export const quotationReason: Bilingual = {
  ar: 'يرجى تقديم عرض سعر مقروء يوضح المعدات المقصودة وتكلفتها الإجمالية.',
  en: 'Please provide readable evidence of the intended equipment and its total quoted cost.',
}
export const rejectionReason: Bilingual = {
  ar: 'يتطلب معيار العرض التجريبي ستة أشهر من مزاولة النشاط. يسجل هذا الطلب شهرين فقط منذ أغسطس 2026.',
  en: 'The demo criterion requires six operating months. This application records only two months since August 2026.',
}
export const approvalReason: Bilingual = {
  ar: 'استوفت المعلومات والمستندات معايير هذا العرض الافتراضي. قُبلت شروط التمويل المقدمة.',
  en: 'The information and evidence satisfy this fictional demo\'s criteria. The submitted financing terms were accepted.',
}

type Seed = {
  number: number; owner: 'mariam' | 'huda' | 'omar'; product: ProductId; status: ApplicationStatus;
  assignee: 'salma' | 'khaled' | null; business: string; activity: Fields['activity']; since: string;
  amount: number; budget: number; term: number; submitted: string | null; review?: string; request?: string;
  final?: string; accepted?: DocumentSlot[]; missing?: DocumentSlot; replacement?: DocumentSlot;
  operating?: 'passed' | 'failed'; capacity?: 'failed';
}
export const manifest: Seed[] = [
  { number: 1, owner: 'mariam', product: 'inventory', status: 'draft', assignee: null, business: 'متجر السهل التجريبي', activity: 'retail', since: '2025-01', amount: 200000, budget: 250000, term: 6, submitted: null },
  { number: 2, owner: 'mariam', product: 'equipment', status: 'submitted', assignee: null, business: 'ورشة المدار التجريبية', activity: 'services', since: '2024-03', amount: 1200000, budget: 1500000, term: 18, submitted: '2026-10-02' },
  { number: 3, owner: 'huda', product: 'inventory', status: 'submitted', assignee: 'salma', business: 'متجر النخيل التجريبي', activity: 'retail', since: '2025-01', amount: 300000, budget: 350000, term: 6, submitted: '2026-10-05', missing: 'financial' },
  { number: 4, owner: 'huda', product: 'inventory', status: 'correctionsRequested', assignee: 'salma', business: 'متجر الندى التجريبي', activity: 'retail', since: '2025-01', amount: 600000, budget: 650000, term: 6, submitted: '2026-10-02', review: '2026-10-03', request: '2026-10-04', accepted: ['identity', 'business', 'financial'], replacement: 'purchase', operating: 'passed', capacity: 'failed' },
  { number: 5, owner: 'mariam', product: 'equipment', status: 'approved', assignee: 'salma', business: 'ورشة المدار التجريبية', activity: 'services', since: '2024-03', amount: 1200000, budget: 1500000, term: 18, submitted: '2026-07-03', review: '2026-07-04', final: '2026-07-10', accepted: ['identity', 'business', 'financial', 'purchase'], operating: 'passed' },
  { number: 6, owner: 'omar', product: 'inventory', status: 'rejected', assignee: 'salma', business: 'ورشة البداية التجريبية', activity: 'production', since: '2026-08', amount: 200000, budget: 240000, term: 6, submitted: '2026-10-02', review: '2026-10-03', final: '2026-10-03', accepted: ['business'], operating: 'failed' },
  { number: 7, owner: 'mariam', product: 'equipment', status: 'underReview', assignee: 'salma', business: 'ورشة المدار التجريبية', activity: 'services', since: '2024-03', amount: 900000, budget: 1100000, term: 12, submitted: '2026-10-06', review: '2026-10-07', accepted: ['identity', 'business'], operating: 'passed' },
  { number: 8, owner: 'huda', product: 'inventory', status: 'underReview', assignee: 'khaled', business: 'متجر النخيل التجريبي', activity: 'retail', since: '2025-01', amount: 500000, budget: 650000, term: 12, submitted: '2026-10-06', review: '2026-10-07', accepted: ['business'], operating: 'passed' },
  { number: 9, owner: 'omar', product: 'equipment', status: 'underReview', assignee: 'salma', business: 'ورشة الأفق التجريبية', activity: 'production', since: '2024-02', amount: 700000, budget: 900000, term: 18, submitted: '2026-10-07', review: '2026-10-08' },
  { number: 10, owner: 'mariam', product: 'inventory', status: 'submitted', assignee: null, business: 'متجر السهل التجريبي', activity: 'retail', since: '2025-01', amount: 400000, budget: 500000, term: 12, submitted: '2026-10-08' },
  { number: 11, owner: 'huda', product: 'equipment', status: 'submitted', assignee: 'khaled', business: 'مطبعة البيان التجريبية', activity: 'services', since: '2024-01', amount: 800000, budget: 1000000, term: 18, submitted: '2026-10-09' },
  { number: 12, owner: 'huda', product: 'inventory', status: 'correctionsRequested', assignee: 'salma', business: 'متجر الندى التجريبي', activity: 'retail', since: '2025-01', amount: 350000, budget: 450000, term: 6, submitted: '2026-10-09', review: '2026-10-10', request: '2026-10-10', accepted: ['identity', 'business', 'purchase'], replacement: 'financial', operating: 'passed' },
  { number: 13, owner: 'omar', product: 'equipment', status: 'correctionsRequested', assignee: 'khaled', business: 'ورشة الأفق التجريبية', activity: 'production', since: '2024-02', amount: 1000000, budget: 1200000, term: 24, submitted: '2026-10-09', review: '2026-10-11', request: '2026-10-11', accepted: ['identity', 'business', 'financial'], replacement: 'purchase', operating: 'passed' },
]
export function seedFields(seed: Seed): Fields {
  const identity = identities.find(identity => identity.id === seed.owner)!
  const isEquipment = seed.product === 'equipment'
  return {
    fullName: identity.name.ar, mobile: identity.mobile, city: identity.city, email: identity.email,
    businessName: seed.business, activity: seed.activity, address: 'شارع السوق، موقع تجريبي، عدن',
    operatingSince: seed.since,
    revenue: String(seed.number === 6 ? 600000 : isEquipment ? 900000 : 700000),
    expenses: String(seed.number === 6 ? 400000 : isEquipment ? 650000 : 500000),
    amount: String(seed.amount), budget: String(seed.budget), term: String(seed.term),
    explanation: seed.number === 1 ? '' : isEquipment ? 'شراء آلة طباعة لاستخدامها في أعمال الورشة وتقديم خدمات الطباعة.'
      : seed.number === 3 ? 'شراء مخزون جديد من المواد الغذائية لتجديد البضائع في المتجر.'
      : seed.number === 6 ? 'شراء مواد أولية لتجديد مخزون الورشة ودعم نشاط الإنتاج الصغير.'
      : 'شراء مخزون من المستلزمات المنزلية لتجديد البضائع في المتجر.',
  }
}
