import type { Bilingual, DocumentSlot, ProductId } from '../../domain/model'
import type { FieldIssue } from '../../domain'

export const applicationText = {
  personal: { ar: 'البيانات الشخصية', en: 'Personal' }, business: { ar: 'النشاط التجاري', en: 'Business' }, financing: { ar: 'التمويل', en: 'Financing' }, documents: { ar: 'المستندات', en: 'Documents' }, review: { ar: 'المراجعة', en: 'Review' },
  steps: { ar: 'خطوات الطلب', en: 'Application steps' }, product: { ar: 'منتج التمويل', en: 'Financing product' },
  next: { ar: 'الخطوة التالية', en: 'Next step' }, previous: { ar: 'الخطوة السابقة', en: 'Previous step' },
  choose: { ar: 'اختيار هذا المنتج', en: 'Choose this product' }, new: { ar: 'طلب جديد', en: 'New application' }, resume: { ar: 'متابعة المسودة المحفوظة', en: 'Resume saved draft' },
  chooseDraft: { ar: 'بدء طلب جديد أم متابعة مسودة؟', en: 'Start new or resume a draft?' },
  choiceHint: { ar: 'لن يغير اختيار المنتج أي مسودة محفوظة. يمكنك تغيير المنتج داخل المسودة.', en: 'Choosing a product does not change a saved draft. You can change its product inside the draft.' },
  newHint: { ar: 'هذا طلب جديد غير محفوظ. يُحفظ في المتصفح عند حفظ التقدم أو نجاح التقديم.', en: 'This new application is unsaved. It becomes durable when you save progress or submit successfully.' },
  switchTitle: { ar: 'إزالة مستند المنتج السابق؟', en: 'Remove the previous product document?' },
  switchHint: { ar: 'سيُزال المستند الرابع عند الحفظ التالي فقط. ستبقى البيانات المشتركة والمستندات الثلاثة. لن تتغير المبالغ أو مدة السداد.', en: 'The fourth document will be removed on the next save. Shared information and the other three documents stay. Amount and term values stay as entered.' },
  cancel: { ar: 'إلغاء', en: 'Cancel' }, confirmSwitch: { ar: 'تغيير المنتج وإزالة المستند', en: 'Switch product and remove document' },
  check: { ar: 'فحص اكتمال الطلب', en: 'Check application' }, errors: { ar: 'صحح الحقول والمستندات التالية', en: 'Check these fields and documents' },
  valid: { ar: 'اكتملت متطلبات الصيغة والمستندات. يمكنك تقديم الطلب للمراجعة.', en: 'Field formats and document requirements are complete. You can submit the application for review.' },
  submit: { ar: 'تقديم الطلب', en: 'Submit application' },
  submitting: { ar: 'جارٍ تقديم الطلب', en: 'Submitting application' },
  submitted: { ar: 'قُدم طلبك. يمكنك متابعة حالته وسجله بهذا المرجع.', en: 'Your application was submitted. Use this reference to follow its status and history.' },
  submissionFailure: { ar: 'إخفاق التقديم التالي', en: 'Fail next submission' },
  submissionFailed: { ar: 'فشل التقديم. بقيت معلوماتك وملفاتك الجاهزة للمحاولة مجددًا.', en: 'Submission failed. Your information and ready files remain for retry.' },
  submissionUnknown: { ar: 'نتيجة التقديم غير مؤكدة. افحص النتيجة قبل المحاولة مجددًا.', en: 'Submission outcome unknown. Inspect the outcome before trying again.' },
  inspectSubmission: { ar: 'فحص نتيجة التقديم', en: 'Inspect submission outcome' },
  retained: { ar: 'تغييراتك غير المطبقة', en: 'Your unapplied changes' },
  retainedHint: { ar: 'أصبح الطلب للقراءة فقط. بقي عملك في هذا التبويب منفصلًا عن المعلومات المقدمة.', en: 'The application is now read-only. Your work remains in this tab, separate from the submitted information.' },
  reviewHint: { ar: 'هذه معلوماتك الحالية، وتشمل التغييرات غير المحفوظة. لا تعني صحة الصيغة استيفاء معايير المراجعة.', en: 'This is your current information, including unsaved changes. Valid formats do not establish review eligibility.' },
  financialHint: { ar: 'متوسطات يوليو وأغسطس وسبتمبر 2026، الأشهر الثلاثة المكتملة قبل شهر التقديم التجريبي. المصروفات لا تشمل السداد التوضيحي.', en: 'Averages for July, August and September 2026, the three completed months before the demo submission month. Expenses exclude illustrated repayments.' },
  once: { ar: 'تُضاف مرة واحدة. لا رسوم توضيحية أخرى.', en: 'Added once. No other illustrated charges.' },
  eligibility: { ar: 'معايير مراجعة افتراضية: مزاولة النشاط ستة أشهر، وملاءمة الغرض، وتغطية تكلفة الشراء، وألا يتجاوز أكبر قسط 40% من فائض شهري موجب.', en: 'Fictional review criteria: six operating months, suitable purpose, purchase budget coverage, and a largest installment no greater than 40% of positive monthly surplus.' },
  documentHint: { ar: 'مستند افتراضي مقروء يدعم المعلومات المدخلة لهذا المتطلب.', en: 'Readable fictional evidence supporting the information for this requirement.' },
  missing: { ar: 'أضف مستندًا جاهزًا لكل متطلب.', en: 'Supply a ready document for this requirement.' },
  stagedRemoval: { ar: 'إزالة المستند السابق غير محفوظة بعد.', en: 'Removal of the previous document is unsaved.' },
  noSave: { ar: 'لم يُحفظ بعد', en: 'Not saved yet' },
} satisfies Record<string, Bilingual>

export const activities = {
  retail: { ar: 'التجزئة', en: 'Retail' }, services: { ar: 'الخدمات', en: 'Services' }, production: { ar: 'إنتاج صغير', en: 'Small production' },
} satisfies Record<string, Bilingual>

export function issueMessage(issue: FieldIssue): Bilingual {
  if (issue.rule === 'text') return { ar: `أدخل من ${issue.minimum} إلى ${issue.maximum} حرف بعد حذف الفراغات المحيطة.`, en: `Enter ${issue.minimum} to ${issue.maximum} characters after trimming outer whitespace.` }
  if (issue.rule === 'money' || issue.rule === 'amount') return { ar: `أدخل مبلغًا صحيحًا من ${issue.minimum!.toLocaleString('en-US')} إلى ${issue.maximum!.toLocaleString('en-US')} ر.ي.`, en: `Enter a whole amount from ${issue.minimum!.toLocaleString('en-US')} to ${issue.maximum!.toLocaleString('en-US')} YER.` }
  const messages: Record<Exclude<FieldIssue['rule'], 'text' | 'money' | 'amount'>, Bilingual> = {
    type: { ar: 'أدخل قيمة صالحة لهذا الحقل.', en: 'Enter a valid value for this field.' },
    mobile: { ar: 'أدخل من 9 إلى 15 رقمًا مع علامة + اختيارية في البداية. يسمح بالفراغات والشرطات.', en: 'Enter 9 to 15 digits with an optional leading +. Spaces and hyphens are allowed.' },
    email: { ar: 'أدخل بريدًا بصيغة ASCII مع نطاق منقط وبحد أقصى 254 حرفًا، أو اتركه فارغًا.', en: 'Enter an ASCII email with a dotted domain, at most 254 characters, or leave it empty.' },
    activity: { ar: 'اختر نوع النشاط.', en: 'Choose a business activity.' },
    month: { ar: 'أدخل شهرًا ميلاديًا بصيغة YYYY-MM، حتى 2026-10.', en: 'Enter a Gregorian month as YYYY-MM, no later than 2026-10.' },
    term: { ar: 'أدخل عدد أشهر مسموحًا للمنتج المختار.', en: 'Enter a month count offered by the selected product.' },
  }
  return messages[issue.rule]
}

export function documentRequirement(slot: DocumentSlot, product: ProductId): Bilingual {
  const shared: Record<Exclude<DocumentSlot, 'purchase'>, Bilingual> = {
    identity: { ar: 'مستند هوية افتراضي مقروء يذكر اسم المتقدم.', en: 'Readable fictional identity evidence naming the applicant.' },
    business: { ar: 'مستند افتراضي يدعم اسم النشاط وعنوانه وشهر بدء مزاولته.', en: 'Fictional evidence supporting the business name, address and operating-since month.' },
    financial: { ar: 'ملخص الأشهر الثلاثة المكتملة قبل شهر التقديم يدعم متوسط الإيرادات والمصروفات.', en: 'A summary for the three completed months before submission supporting average revenue and expenses.' },
  }
  return slot === 'purchase' ? product === 'inventory'
    ? { ar: 'خطة افتراضية تصف المخزون المراد شراؤه وتكلفته الإجمالية، بما يتفق مع وصف الشراء والتكلفة.', en: 'A fictional stock purchase plan consistent with the purchase explanation and total purchase budget.' }
    : { ar: 'عرض سعر افتراضي للمعدات الإنتاجية وتكلفتها الإجمالية، بما يتفق مع وصف الشراء والتكلفة.', en: 'A fictional quotation for productive equipment consistent with the purchase explanation and total purchase budget.' }
    : shared[slot]
}
