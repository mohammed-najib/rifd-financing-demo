import type { Application, DocumentSlot, Language, ProductId } from '../../domain/model'
import { documentLabel, events, outcomes, reviewChecks } from '../i18n'

export const reviewText = {
  sections: { ar: 'أقسام المراجعة', en: 'Review sections' },
  accept: { ar: 'قبول المستند', en: 'Accept document' },
  replace: { ar: 'يحتاج إلى استبدال', en: 'Needs replacement' },
  reason: { ar: 'سبب الاستبدال', en: 'Replacement reason' },
  saveAssessment: { ar: 'حفظ التقييم', en: 'Save assessment' },
  confirmInspection: { ar: 'أؤكد أنني فحصت المستند الحالي', en: 'I confirm I inspected the current source' },
  inspectionRequired: { ar: 'افحص المستند الأصلي ثم أكد فحصه قبل حفظ تقييمك. فتح المعاينة وحده لا يؤكد الفحص.', en: 'Inspect the original source, then confirm inspection before saving your assessment. Opening the preview does not confirm inspection.' },
  inspectionConfirmed: { ar: 'أكدت فحص المستند الحالي. اختر تقييمك بشكل مستقل.', en: 'You confirmed inspection of the current source. Choose your assessment separately.' },
  unableToOpen: { ar: 'تعذر علي فتح المستند الحالي', en: 'I could not open the current source' },
  unableHelp: { ar: 'يمكنك فقط طلب الاستبدال مع توضيح سبب تعذر فتح المستند. هذا لا يؤكد فحصه.', en: 'Explain why the source could not be opened and request replacement. This does not confirm inspection.' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  note: { ar: 'ملاحظة داخلية', en: 'Internal note' },
  saveNote: { ar: 'حفظ الملاحظة', en: 'Save note' },
  saveLeave: { ar: 'حفظ الملاحظة والمغادرة', en: 'Save note and leave' },
  private: { ar: 'الملاحظات والنشاط والتقييمات متاحة للموظفين فقط ولا تظهر في الطباعة.', en: 'Notes, activity and assessments are staff-only and excluded from print.' },
  saved: { ar: 'حُفظت نتيجة المراجعة.', en: 'Review change saved.' },
  working: { ar: 'جارٍ الحفظ…', en: 'Saving…' },
  inspect: { ar: 'فحص نتيجة المراجعة', en: 'Inspect review outcome' },
  latest: { ar: 'فحص أحدث مراجعة', en: 'Inspect latest review' },
  retry: { ar: 'إعادة محاولة الحفظ', en: 'Retry review save' },
  changed: { ar: 'تغير الطلب. افحص أحدث مراجعة قبل حفظ العمل المحفوظ هنا.', en: 'The application changed. Inspect the latest review before saving retained work.' },
  readOnly: { ar: 'التقييمات والفحوص للموظف المسند إليه الطلب في حالة قيد المراجعة. الملاحظات تتبع صلاحية الإسناد والحالة الحالية.', en: 'Assessments and checks require assignment to you and Under review. Notes follow the current assignment and state.' },
  fictional: { ar: 'معايير مراجعة افتراضية لهذا العرض التجريبي.', en: 'Review criteria invented for this demo.' },
  evidence: { ar: 'أكد توافق المستندات الأربعة المقبولة مع الاسم وبيانات النشاط والأرقام والغرض من الشراء.', en: 'Confirm all four accepted documents agree with the current name, business details, figures and purchase.' },
  purpose: { ar: 'أكد أن الشراء يناسب غرض المنتج ونوع النشاط المعلن.', en: 'Confirm the purchase fits the selected product and declared business activity.' },
  operating: { ar: 'الحد الأدنى ستة أشهر حتى شهر التقديم الأول.', en: 'At least six operating months at initial submission.' },
  budget: { ar: 'مبلغ التمويل لا يتجاوز تكلفة الشراء.', en: 'Financing must not exceed the purchase budget.' },
  capacity: { ar: 'الفائض موجب وأكبر قسط لا يتجاوز 40% منه. يشمل القسط الأخير باقي القسمة.', en: 'Surplus must be positive and the largest installment no greater than 40% of it. The final installment includes the remainder.' },
  months: { ar: 'أشهر مزاولة النشاط', en: 'Operating months' },
  surplus: { ar: 'الفائض الشهري', en: 'Monthly surplus' },
  largest: { ar: 'أكبر قسط توضيحي', en: 'Largest illustrated installment' },
  dependencies: { ar: 'يتطلب إعادة الفحص عند تغير', en: 'Recheck when changed' },
  verification: { ar: 'التحقق من التصحيحات', en: 'Correction verification' },
  verifyField: { ar: 'التحقق من تغيير الحقل', en: 'Verify field change' },
  undoField: { ar: 'إلغاء التحقق من الحقل', en: 'Undo field verification' },
  changedTarget: { ar: 'تغير عن المرجع', en: 'Changed from baseline' },
  added: { ar: 'أُضيف عن المرجع', en: 'Added since baseline' },
  replaced: { ar: 'استُبدل عن المرجع', en: 'Replaced since baseline' },
  resetChecks: { ar: 'فحوص تتطلب إعادة المراجعة بعد هذا الرد', en: 'Checks requiring review after this response' },
  previousAssessments: { ar: 'تقييمات الرد السابق', en: 'Previous response assessments' },
  historical: { ar: 'نتيجة سابقة؛ يحل محلها طلب أحدث لهذا الهدف.', en: 'Historical outcome; a later request replaces this target.' },
  verified: { ar: 'تم التحقق', en: 'Verified' },
  unverified: { ar: 'لم يتم التحقق', en: 'Not verified' },
  waiting: { ar: 'بانتظار إعادة التقديم. تبقى المعلومات المقدمة منفصلة عن استجابة المتقدم الخاصة.', en: 'Awaiting resubmission. Submitted information stays separate from the applicant’s private response.' },
  noCorrections: { ar: 'لا توجد تصحيحات مطلوبة.', en: 'No requested corrections.' },
} as const

// Earlier datasets retain compact seed descriptions. Translate their finite labels
// when displaying them, without rewriting stored history or free-form note text.
export function activityDescription(event: Application['activity'][number], product: ProductId, language: Language): string {
  const description = event.description.en
  if (event.kind !== 'note' && description === event.kind && event.description.ar === event.kind) return events[event.kind][language]
  const document = /^Document (identity|business|financial|purchase): (accepted|needsReplacement)$/.exec(description)
  if (event.kind === 'assessed' && document) return `${documentLabel(document[1] as DocumentSlot, product)[language]}: ${outcomes[document[2]][language]}`
  const check = /^Check (evidence|operatingHistory|purpose|budget|capacity): (passed|failed|unchecked)$/.exec(description)
  if (event.kind === 'checked' && check) return `${reviewChecks[check[1]][language]}: ${outcomes[check[2]][language]}`
  return event.description[language]
}
