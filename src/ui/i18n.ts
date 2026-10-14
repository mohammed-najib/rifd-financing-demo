import type { ApplicationStatus, Bilingual, DocumentSlot, Fields, Language, ProductId } from '../domain/model'
import type { ErrorKind } from '../demo'
import { foldDigits, parseWholeYER } from '../domain'

export const text = {
  title: { ar: 'تمويل بخطوات واضحة', en: 'Financing, one clear step at a time' },
  chooseIdentity: { ar: 'اختر هوية تجريبية', en: 'Choose a demo identity' },
  chooserIntro: { ar: 'تصفح الطلبات بهوية افتراضية. يرى المتقدم طلباته فقط، وتقرأ المراجعة الطلبات المقدمة.', en: 'Explore with a fictional identity. Applicants see their own applications. The reviewer reads submitted applications.' },
  applicant: { ar: 'متقدم', en: 'Applicant' }, reviewer: { ar: 'مراجعة', en: 'Reviewer' },
  applications: { ar: 'طلباتي', en: 'My applications' }, staffApplications: { ar: 'قائمة الطلبات', en: 'Application queue' },
  products: { ar: 'منتجات التمويل', en: 'Financing products' }, switchIdentity: { ar: 'تغيير الهوية', en: 'Switch identity' },
  signOut: { ar: 'تسجيل الخروج', en: 'Sign out' }, loading: { ar: 'جارٍ تجهيز العرض التجريبي', en: 'Preparing the demo' },
  loadingDetail: { ar: 'نجهز البيانات والمستندات الافتراضية في هذا المتصفح.', en: 'Preparing fictional records and evidence in this browser.' },
  readLoading: { ar: 'جارٍ تحميل المعلومات', en: 'Loading information' }, retry: { ar: 'إعادة المحاولة', en: 'Retry' },
  unavailable: { ar: 'الطلب غير متاح', en: 'Application unavailable' }, unavailableDescription: { ar: 'هذا الرابط غير متاح للهوية الحالية. يمكنك العودة إلى الصفحة الرئيسية أو تغيير الهوية.', en: 'This link is unavailable to the current identity. Return home or switch identity.' },
  home: { ar: 'الصفحة الرئيسية', en: 'Home' },
  notice: { ar: 'عرض تجريبي. الأشخاص والمنتجات وشروط التمويل افتراضية. لا يُرسل أي طلب إلى بنك، ولا تُتحقق هوية، ولا تُعالج مدفوعات.', en: 'Demo. People, products, and financing terms are fictional. No request reaches a bank, no identity is verified, and no payment is processed.' },
  storageNotice: { ar: 'تظل البيانات والملفات في ملف هذا المتصفح ويمكن فحصها محليًا. لا تتزامن بين الأجهزة أو المتصفحات، وقد تختفي بمسح البيانات أو التصفح الخاص أو إخلاء التخزين. استخدم بيانات ومستندات افتراضية فقط.', en: 'Data and files stay in this browser profile and can be inspected locally. They do not sync across devices or browsers and may disappear through clearing, private browsing, or eviction. Use fictional data and documents only.' },
  sliceNotice: { ar: 'قارن المنتجات وأكمل مسودة بخمس خطوات واحفظ المستندات. سيُضاف التقديم وإجراءات المراجعة لاحقًا.', en: 'Compare products, complete five-step drafts and save documents. Submission and review actions will follow.' },
  ownIntro: { ar: 'طلباتك المحفوظة ومراحلها الحالية. افتح طلبًا للاطلاع على المعلومات والخطوة التالية.', en: 'Your saved applications and their current stages. Open an application to inspect its information and next step.' },
  staffIntro: { ar: 'اقرأ الطلبات المقدمة بجميع حالات الإسناد. المسودات والردود الخاصة غير ظاهرة للمراجعة.', en: 'Read submitted applications regardless of assignment. Drafts and private responses are hidden from reviewers.' },
  reference: { ar: 'مرجع الطلب', en: 'Reference' }, status: { ar: 'حالة الطلب', en: 'Application status' },
  amount: { ar: 'مبلغ التمويل', en: 'Financing amount' }, term: { ar: 'مدة السداد', en: 'Repayment term' }, months: { ar: 'شهرًا', en: 'months' },
  open: { ar: 'فتح الطلب', en: 'Open application' }, assignment: { ar: 'المراجع المسند إليه', en: 'Assigned reviewer' },
  unassigned: { ar: 'غير مسند', en: 'Unassigned' }, assignedToYou: { ar: 'مسند إليك', en: 'Assigned to you' }, submittedAt: { ar: 'تاريخ التقديم', en: 'Submitted on' },
  notSubmitted: { ar: 'لم يُقدّم بعد', en: 'Not submitted yet' }, nextAction: { ar: 'الخطوة التالية', en: 'Next step' },
  viewApplication: { ar: 'الاطلاع على الطلب', en: 'View application' }, inspectDraft: { ar: 'الاطلاع على المسودة المحفوظة', en: 'Inspect saved draft' },
  inspectCorrections: { ar: 'الاطلاع على طلب التصحيح', en: 'Inspect correction request' },
  draftNext: { ar: 'أكمل الخطوات الخمس واحفظ بياناتك ومستنداتك في هذا المتصفح. يمكن حفظ الإدخال غير المكتمل أو غير الصالح. المسودة لم تُقدّم للمراجعة.', en: 'Complete five steps and save your information and documents in this browser. Incomplete or invalid input can be saved. The draft has not been submitted for review.' },
  correctionNext: { ar: 'طلبت المراجعة تغييرات محددة أدناه. تظل المعلومات المقدمة ظاهرة للمراجعة حتى إعادة التقديم.', en: 'The reviewer requested the changes below. Submitted information remains visible to staff until resubmission.' },
  waitingNext: { ar: 'الطلب مقدم للمراجعة. يمكنك الاطلاع على معلوماته وسجله.', en: 'The application is with the reviewer. You can inspect its information and history.' },
  finalNext: { ar: 'سُجل قرار نهائي. معلومات الطلب ثابتة للقراءة.', en: 'A final decision has been recorded. Application information is read-only.' },
  savedInformation: { ar: 'المعلومات المحفوظة في المسودة', en: 'Saved draft information' }, submittedInformation: { ar: 'المعلومات المقدمة', en: 'Submitted information' },
  documents: { ar: 'المستندات', en: 'Documents' }, savedInDraft: { ar: 'محفوظ في المسودة', en: 'Saved in draft' }, included: { ar: 'ضمن المعلومات المقدمة', en: 'Included in submitted information' },
  missing: { ar: 'لم يُرفق مستند', en: 'No document supplied' }, history: { ar: 'سجل الطلب', en: 'Application history' },
  noHistory: { ar: 'لم يُقدّم هذا الطلب بعد. لا توجد أحداث مراجعة.', en: 'This application has not been submitted. There are no review events.' },
  checks: { ar: 'فحوص المراجعة', en: 'Review checks' }, notes: { ar: 'ملاحظات داخلية', en: 'Internal notes' }, activity: { ar: 'نشاط داخلي', en: 'Internal activity' },
  noNotes: { ar: 'لا توجد ملاحظات داخلية.', en: 'No internal notes.' }, corrections: { ar: 'التغييرات المطلوبة', en: 'Requested changes' },
  baseline: { ar: 'المعلومات المرجعية عند الطلب', en: 'Fixed request baseline' },
  privateWorkspace: { ar: 'رد خاص محفوظ', en: 'Private saved response' }, privateUnchanged: { ar: 'لم تتغير أهداف هذا الرد المحفوظ بعد. لا تراه المراجعة.', en: 'This saved response has not changed any targets yet. Staff cannot see it.' },
  repayment: { ar: 'جدول سداد توضيحي افتراضي', en: 'Fictional repayment illustration' },
  markup: { ar: 'الزيادة التوضيحية', en: 'Illustrative markup' }, total: { ar: 'إجمالي السداد التوضيحي', en: 'Illustrated repayment total' },
  completed: { ar: 'المبلغ المكتمل في المثال', en: 'Completed amount in the example' }, remaining: { ar: 'المبلغ المتبقي في المثال', en: 'Remaining amount in the example' },
  upcoming: { ar: 'قادم', en: 'Upcoming' }, completedRow: { ar: 'مكتمل', en: 'Completed' },
  financialWindow: { ar: 'أشهر الأدلة المالية', en: 'Financial evidence months' },
  emptyExplanation: { ar: 'لم يُكتب شرح الشراء بعد', en: 'Purchase explanation not entered yet' },
  all: { ar: 'جميع الطلبات المقدمة', en: 'All submitted applications' },
  minimum: { ar: 'الحد الأدنى', en: 'Minimum amount' }, maximum: { ar: 'الحد الأقصى', en: 'Maximum amount' },
  productIntro: { ar: 'منتجان افتراضيان لصاحب نشاط تجاري صغير قائم. الشروط والمعايير اختُرعت لهذا العرض.', en: 'Two fictional products for an individual owner of an established small business. Terms and criteria are invented for this demo.' },
  startupError: { ar: 'تعذر تجهيز العرض التجريبي', en: 'The demo could not start' },
} satisfies Record<string, Bilingual>

export const statuses: Record<ApplicationStatus, Bilingual> = {
  draft: { ar: 'مسودة', en: 'Draft' }, submitted: { ar: 'مقدم', en: 'Submitted' }, underReview: { ar: 'قيد المراجعة', en: 'Under review' },
  correctionsRequested: { ar: 'مطلوب تصحيح', en: 'Corrections requested' }, approved: { ar: 'موافق عليه', en: 'Approved' }, rejected: { ar: 'مرفوض', en: 'Rejected' },
}
export const draftText = {
  edit: { ar: 'إعداد المسودة', en: 'Prepare draft' }, save: { ar: 'حفظ التقدم', en: 'Save progress' },
  saved: { ar: 'محفوظ', en: 'Saved' }, unsaved: { ar: 'تغييرات غير محفوظة', en: 'Unsaved changes' },
  saving: { ar: 'جارٍ الحفظ', en: 'Saving' }, failed: { ar: 'لم يُحفظ', en: 'Save failed' }, unknown: { ar: 'نتيجة الحفظ غير مؤكدة', en: 'Save outcome unknown' },
  lastSave: { ar: 'آخر حفظ ناجح', en: 'Last successful save' },
  requirement: { ar: 'مستند يصف المخزون المراد شراؤه وتكلفته الإجمالية. استخدم ملفًا افتراضيًا فقط.', en: 'Evidence describing the stock to purchase and its total cost. Use a fictional file only.' },
  rawHint: { ar: 'يلزم 20 إلى 500 حرف عند التقديم. يمكنك حفظ النص كما أدخلته الآن.', en: 'Submission will require 20 to 500 characters. You can save the text exactly as entered now.' },
  fileHint: { ar: 'PDF أو JPEG أو PNG، أكبر من صفر وحتى 5,000,000 بايت. يجب أن يطابق نوع الملف امتداده.', en: 'PDF, JPEG or PNG, greater than zero and up to 5,000,000 bytes. MIME must match the extension.' },
  chooseFile: { ar: 'اختر مستندًا افتراضيًا محليًا', en: 'Choose a local fictional document' },
  sample: { ar: 'المستند التجريبي', en: 'Prepared sample' }, useSample: { ar: 'استخدام النموذج', en: 'Use sample' },
  selected: { ar: 'ملف مختار وغير محفوظ', en: 'Selected file, unsaved' }, preparing: { ar: 'جارٍ تجهيز الملف', en: 'Preparing file' }, ready: { ar: 'جاهز للحفظ', en: 'Ready to save' },
  preparationFailed: { ar: 'فشل تجهيز الملف', en: 'Preparation failed' }, retryPreparation: { ar: 'إعادة تجهيز الاختيار', en: 'Retry preparation' },
  discardSelection: { ar: 'تجاهل الاختيار غير المحفوظ', en: 'Discard unsaved selection' },
  previewSaved: { ar: 'معاينة الملف المحفوظ', en: 'Preview saved file' }, previewReady: { ar: 'معاينة الملف الجاهز', en: 'Preview ready file' },
  preview: { ar: 'معاينة المستند', en: 'Document preview' }, closePreview: { ar: 'إغلاق المعاينة', en: 'Close preview' },
  savedDocument: { ar: 'المستند المحفوظ', en: 'Saved document' }, readyDocument: { ar: 'مستند جاهز وغير محفوظ', en: 'Ready document, unsaved' },
  previewFailed: { ar: 'تعذرت المعاينة. يمكنك إعادة المحاولة أو فتح الملف أو تنزيله. لم يتغير الملف.', en: 'The preview could not render. Retry, open or download the file. The file is unchanged.' },
  openFile: { ar: 'فتح الملف', en: 'Open file' }, download: { ar: 'تنزيل الملف', en: 'Download file' },
  controls: { ar: 'أدوات العرض التجريبي', en: 'Demo controls' },
  controlScope: { ar: 'تطبق على هذا التبويب وتعود للوضع العادي بعد التحديث. إخفاق واحد مسلح فقط. لا يستهلك الإدخال غير الصالح أو إعادة العملية نفسها الإخفاق.', en: 'Applies to this tab and resets on refresh. Only one failure can be armed. Invalid input and exact replay do not consume it.' },
  slow: { ar: 'طلبات بطيئة', en: 'Slow requests' },
  normalTiming: { ar: 'عادي: الطلب 400 مللي ثانية، التجهيز 1,200 مللي ثانية، بالإضافة إلى العمل الفعلي.', en: 'Normal: requests 400 ms, preparation 1,200 ms, plus actual work.' },
  slowTiming: { ar: 'بطيء: الطلب 1,500 مللي ثانية، التجهيز 4,000 مللي ثانية، بالإضافة إلى العمل الفعلي.', en: 'Slow: requests 1,500 ms, preparation 4,000 ms, plus actual work.' },
  nextFailure: { ar: 'الإخفاق التالي', en: 'Next failure' }, none: { ar: 'لا يوجد إخفاق مسلح', en: 'No failure armed' },
  uploadFailure: { ar: 'إخفاق التجهيز الصالح التالي عند 50%', en: 'Fail next valid preparation at 50%' },
  saveFailure: { ar: 'إخفاق حفظ التقدم التالي', en: 'Fail next progress save' },
  storageFailure: { ar: 'إلغاء كتابة التخزين التالية لطلب مؤهل', en: 'Abort next eligible application storage write' },
  inspectOutcome: { ar: 'فحص نتيجة الحفظ', en: 'Inspect save outcome' }, loadLatest: { ar: 'فحص المسودة الأحدث', en: 'Inspect latest draft' },
  newer: { ar: 'توجد مسودة أحدث. بقيت تغييراتك دون تطبيق. افحص القيم المحفوظة ثم اختر إعادة تطبيقها.', en: 'A newer draft is available. Your edits remain unapplied. Inspect the saved values, then choose to reapply your edits.' },
  reapply: { ar: 'إعادة تطبيق تعديلاتي', en: 'Reapply my edits' }, latestExplanation: { ar: 'شرح الشراء المحفوظ الأحدث', en: 'Latest saved purchase explanation' },
  leave: { ar: 'لديك عمل غير محفوظ', en: 'You have unsaved work' }, stay: { ar: 'البقاء', en: 'Stay' }, discard: { ar: 'تجاهل التغييرات', en: 'Discard changes' }, saveLeave: { ar: 'الحفظ والمغادرة', en: 'Save and leave' },
  waitLeave: { ar: 'انتظر الحفظ أو التجهيز. أكمل الاختيارات غير المحفوظة أو تجاهلها قبل الحفظ والمغادرة.', en: 'Wait for saving or preparation. Complete or discard unfinished selections before saving and leaving.' },
} satisfies Record<string, Bilingual>
export const fieldLabels: Record<keyof Fields, Bilingual> = {
  fullName: { ar: 'اسم المتقدم الكامل', en: 'Applicant full name' }, mobile: { ar: 'رقم الجوال', en: 'Mobile' }, city: { ar: 'المدينة', en: 'City' }, email: { ar: 'البريد الإلكتروني', en: 'Email' },
  businessName: { ar: 'اسم النشاط التجاري', en: 'Business name' }, activity: { ar: 'نوع النشاط', en: 'Business activity' }, address: { ar: 'عنوان النشاط', en: 'Business address' },
  operatingSince: { ar: 'بداية النشاط', en: 'Operating since' }, revenue: { ar: 'متوسط الإيرادات الشهرية', en: 'Average monthly revenue' }, expenses: { ar: 'متوسط المصروفات الشهرية', en: 'Average monthly operating expenses' },
  amount: text.amount, term: text.term, budget: { ar: 'تكلفة الشراء', en: 'Purchase budget' }, explanation: { ar: 'شرح الشراء', en: 'Purchase explanation' },
}
export const reviewChecks: Record<string, Bilingual> = {
  evidence: { ar: 'اتساق المستندات والبيانات', en: 'Evidence consistency' }, operatingHistory: { ar: 'مدة مزاولة النشاط', en: 'Operating history' },
  purpose: { ar: 'ملاءمة الغرض لمنتج التمويل', en: 'Product purpose fit' }, budget: { ar: 'توافق مبلغ التمويل مع تكلفة الشراء', en: 'Purchase budget coverage' }, capacity: { ar: 'القدرة التوضيحية على السداد', en: 'Repayment capacity' },
}
export const outcomes: Record<string, Bilingual> = {
  unchecked: { ar: 'لم يُفحص', en: 'Unchecked' }, passed: { ar: 'اجتاز', en: 'Passed' }, failed: { ar: 'لم يجتز', en: 'Failed' },
  missing: text.missing, awaitingReview: { ar: 'بانتظار التقييم', en: 'Awaiting review' }, accepted: { ar: 'مقبول', en: 'Accepted' }, needsReplacement: { ar: 'يحتاج إلى استبدال', en: 'Needs replacement' },
}
export const events: Record<string, Bilingual> = {
  submitted: { ar: 'تقديم الطلب', en: 'Application submitted' }, reviewStarted: { ar: 'بدء المراجعة', en: 'Review started' },
  correctionsRequested: { ar: 'طلب تصحيحات', en: 'Corrections requested' }, resubmitted: { ar: 'إعادة التقديم', en: 'Application resubmitted' },
  approved: { ar: 'الموافقة على الطلب', en: 'Application approved' }, rejected: { ar: 'رفض الطلب', en: 'Application rejected' },
  assigned: { ar: 'إسناد الطلب', en: 'Application assigned' }, assessed: { ar: 'تقييم مستند', en: 'Document assessed' }, checked: { ar: 'فحص مراجعة', en: 'Review check recorded' }, note: { ar: 'إضافة ملاحظة داخلية', en: 'Internal note added' },
}
export const errors: Record<ErrorKind, Bilingual> = {
  unavailable: text.unavailableDescription,
  sessionExpired: { ar: 'انتهت الجلسة. اختر هويتك التجريبية للمتابعة.', en: 'The session expired. Choose your demo identity to continue.' },
  storage: { ar: 'تعذر الوصول إلى تخزين المتصفح. لم نمسح البيانات. تحقق من السماح بالتخزين ثم أعد المحاولة.', en: 'Browser storage could not be accessed. Existing data was not erased. Allow storage and retry.' },
  startup: text.startupError, resources: { ar: 'تعذر تجهيز الخطوط أو المستندات التجريبية. تحقق من الاتصال ثم أعد المحاولة.', en: 'Fonts or demo documents could not be prepared. Check the connection and retry.' },
  blocked: { ar: 'ترقية التخزين تنتظر تبويبًا آخر. أغلق تبويبات العرض الأخرى ثم أعد المحاولة.', en: 'A storage upgrade is waiting for another tab. Close other demo tabs and retry.' },
  unsupported: { ar: 'صيغة البيانات المحفوظة غير مدعومة. حُفظت البيانات دون تغيير.', en: 'The saved data format is unsupported. Existing data was preserved.' },
  damaged: { ar: 'تعذر التحقق من البيانات أو الملفات المحفوظة. حُفظت البيانات دون تغيير.', en: 'Saved data or files could not be validated. Existing data was preserved.' },
  stalePreference: { ar: 'غيّر تبويب آخر تفضيل اللغة. حُمّل التفضيل الأحدث. افحصه ثم اختر اللغة مجددًا إن رغبت.', en: 'Another tab changed the language preference. The latest preference was loaded. Inspect it before choosing again.' },
  supersededDataset: { ar: 'تغيرت مجموعة البيانات. أعد تحميل الصفحة لفتح العرض الحالي.', en: 'The dataset changed. Reload to open the current demo.' },
  identifierMisuse: { ar: 'تعذر تطبيق هذا الطلب. أعد المحاولة بعد فحص الإعداد الحالي.', en: 'This operation could not be applied. Inspect the current setting before retrying.' },
  validation: { ar: 'القيمة غير صالحة.', en: 'The value is invalid.' },
  staleWorkspace: { ar: 'حفظ تبويب آخر مسودة أحدث. افحصها قبل إعادة تطبيق تغييراتك.', en: 'Another tab saved a newer draft. Inspect it before reapplying your changes.' },
  invalidState: { ar: 'لم يعد التعديل متاحًا في حالة الطلب الحالية.', en: 'Editing is unavailable in the current application state.' },
  permissionDenied: { ar: 'هذا الإجراء غير متاح للهوية الحالية.', en: 'This action is unavailable to the current identity.' },
  uploadFailed: { ar: 'فشل تجهيز الملف. بقي اختيارك لإعادة المحاولة وبقي الملف المحفوظ دون تغيير.', en: 'File preparation failed. Your selection remains for retry and the saved file is unchanged.' },
  requestFailed: { ar: 'فشل الحفظ التجريبي. بقيت التغييرات والملفات الجاهزة دون حفظ. أعد المحاولة.', en: 'The simulated save failed. Your edits and ready files remain unsaved. Retry saving.' },
  outcomeUnknown: { ar: 'تعذر تأكيد نتيجة الحفظ. افحص النتيجة المحفوظة قبل إعادة المحاولة.', en: 'The save outcome could not be confirmed. Inspect the saved outcome before retrying.' },
  supersededSelection: { ar: 'تغير اختيار الملف. جُهّز الاختيار الأحدث فقط.', en: 'The file selection changed. Only the latest selection can become ready.' },
}
export function documentLabel(slot: DocumentSlot, product: ProductId): Bilingual {
  switch (slot) {
    case 'identity': return { ar: 'إثبات هوية المتقدم', en: 'Applicant identity evidence' }
    case 'business': return { ar: 'إثبات النشاط التجاري', en: 'Business evidence' }
    case 'financial': return { ar: 'ملخص الإيرادات والمصروفات', en: 'Revenue and expense summary' }
    case 'purchase': return product === 'inventory' ? { ar: 'خطة شراء المخزون', en: 'Stock purchase plan' } : { ar: 'عرض سعر المعدات', en: 'Supplier quotation' }
  }
}
export function money(raw: string | number, language: Language): string {
  const value = typeof raw === 'number' ? raw : parseWholeYER(raw)
  if (typeof raw === 'string' && !raw.trim()) return '—'
  return `${value === null ? raw : new Intl.NumberFormat('en-US').format(value)} ${language === 'ar' ? 'ر.ي.' : 'YER'}`
}
export function displayFieldValue(field: keyof Fields, value: string, language: Language): string {
  if (['amount', 'revenue', 'expenses', 'budget'].includes(field)) return money(value, language)
  if (['mobile', 'term', 'operatingSince'].includes(field)) return foldDigits(value) || '—'
  return value || '—'
}
export function date(raw: string, language: Language): string {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { year: 'numeric', month: 'long', ...(raw.length > 7 ? { day: 'numeric' as const } : {}), timeZone: 'UTC' }).format(new Date(`${raw.length === 7 ? `${raw}-01` : raw}T12:00:00Z`))
}
