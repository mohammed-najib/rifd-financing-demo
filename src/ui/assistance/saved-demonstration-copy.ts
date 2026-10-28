export const savedText = {
  title: { en: 'Saved demonstrations', ar: 'عروض توضيحية محفوظة' },
  choose: { en: 'Choose a Saved demonstration', ar: 'اختيار عرض توضيحي محفوظ' },
  open: { en: 'Open saved example', ar: 'فتح المثال المحفوظ' },
  experimental: { en: 'Experimental assistance', ar: 'مساعدة تجريبية' },
  notice: {
    en: 'Suggestions may be wrong. Check the original document.',
    ar: 'قد تكون الاقتراحات غير صحيحة. راجع المستند الأصلي.',
  },
  mode: { en: 'Saved demonstration', ar: 'عرض توضيحي محفوظ' },
  date: { en: 'Analyzed on 2026-10-17', ar: 'حُلّل بتاريخ 2026-10-17' },
  separate: {
    en: 'Separate read-only example. These findings describe its original fictional source and declarations.',
    ar: 'مثال مستقل للقراءة فقط. تصف هذه النتائج مصدره الافتراضي وبياناته الأصلية.',
  },
  attached: {
    en: 'Saved demonstration on the current document. The source and analysis context match the checked example.',
    ar: 'عرض توضيحي محفوظ على المستند الحالي. يطابق المصدر وسياق التحليل المثال الذي تمت مراجعته.',
  },
  show: { en: 'Show example source', ar: 'عرض مصدر المثال' },
  hide: { en: 'Hide example source', ar: 'إخفاء مصدر المثال' },
  source: { en: 'Example source, page', ar: 'مصدر المثال، الصفحة' },
  previous: { en: 'Previous page', ar: 'الصفحة السابقة' },
  next: { en: 'Next page', ar: 'الصفحة التالية' },
  page: { en: 'Page', ar: 'الصفحة' },
  available: { en: 'Analysis available', ar: 'التحليل متاح' },
  unavailable: { en: 'Analysis unavailable', ar: 'التحليل غير متاح' },
  readable: {
    en: 'Relevant text and digits appear clearly readable.',
    ar: 'يبدو النص والأرقام ذات الصلة واضحين للقراءة.',
  },
  consistent: {
    en: 'Appears to agree with the original declaration.',
    ar: 'يبدو متوافقاً مع البيان الأصلي.',
  },
  different: {
    en: 'Appears different from the original declaration.',
    ar: 'يبدو مختلفاً عن البيان الأصلي.',
  },
  not_found: { en: 'Not found in the checked pages.', ar: 'لم يُعثر عليه في الصفحات المفحوصة.' },
  suppressed: {
    en: 'Comparison withheld. Inspect the source.',
    ar: 'لم تُعرض المقارنة. راجع المصدر.',
  },
  openSource: { en: 'Open original source', ar: 'فتح المصدر الأصلي' },
  download: { en: 'Download source', ar: 'تنزيل المصدر' },
  provenance: { en: 'Analysis provenance', ar: 'مصدر التحليل وتفاصيله' },
  assessment: { en: 'Assessment of your supplied document', ar: 'تقييم مستندك المرفق' },
  assessmentHelp: {
    en: 'Open your supplied document and inspect it before confirming. The separate example does not confirm inspection.',
    ar: 'افتح مستندك المرفق وافحصه قبل التأكيد. لا يؤكد المثال المستقل فحص مستندك.',
  },
  context: { en: 'Original declarations', ar: 'البيانات الأصلية' },
  coverage: { en: 'Analysis coverage', ar: 'نطاق التحليل' },
  loading: { en: 'Opening checked example', ar: 'جارٍ فتح المثال المفحوص' },
  close: { en: 'Close saved example', ar: 'إغلاق المثال المحفوظ' },
  imageFailed: {
    en: 'Page image unavailable. Open or download the original source.',
    ar: 'صورة الصفحة غير متاحة. افتح المصدر الأصلي أو نزّله.',
  },
} as const;
export const savedNames = {
  'ar-financial-01': { en: 'Arabic financial summary', ar: 'ملخص مالي بالعربية' },
  'en-business-02': { en: 'English business evidence', ar: 'إثبات النشاط التجاري بالإنجليزية' },
  'en-purchase-03': { en: 'English stock purchase plan', ar: 'خطة شراء مخزون بالإنجليزية' },
  'en-identity-10': { en: 'English identity evidence', ar: 'إثبات الهوية بالإنجليزية' },
  'en-financial-10': { en: 'English financial summary', ar: 'ملخص مالي بالإنجليزية' },
} as const;
export const savedTargets: Record<string, { en: string; ar: string }> = {
  name: { en: 'Applicant name', ar: 'اسم المتقدم' },
  businessName: { en: 'Business name', ar: 'اسم النشاط' },
  address: { en: 'Business address', ar: 'عنوان النشاط' },
  startMonth: { en: 'Operating since', ar: 'بداية النشاط' },
  description: { en: 'Purchase description', ar: 'وصف الشراء' },
  budget: { en: 'Purchase budget', ar: 'تكلفة الشراء' },
  period: { en: 'Reporting period', ar: 'الفترة المالية' },
  averageRevenue: { en: 'Average revenue', ar: 'متوسط الإيرادات' },
  averageExpenses: { en: 'Average expenses', ar: 'متوسط المصروفات' },
  identity: { en: 'Appears to be identity evidence.', ar: 'يبدو أنه إثبات هوية.' },
  business: { en: 'Appears to be business evidence.', ar: 'يبدو أنه إثبات نشاط تجاري.' },
  financial: { en: 'Appears to be a financial summary.', ar: 'يبدو أنه ملخص مالي.' },
  stock: { en: 'Appears to be a stock purchase plan.', ar: 'يبدو أنه خطة شراء مخزون.' },
};
export const savedLimitations = {
  'ar-financial-01': {
    en: 'Only pages 1 and 2 have usable analysis. Pages 3 and 4 are unavailable. The comparison saw only pages 1 and 2. All comparisons are withheld. The full-document revenue conflict was not tested.',
    ar: 'التحليل قابل للاستخدام للصفحتين 1 و2 فقط. تحليل الصفحتين 3 و4 غير متاح. شملت المقارنة الصفحتين 1 و2 فقط. حُجبت كل المقارنات. لم يُفحص تعارض الإيرادات في المستند الكامل.',
  },
  'en-business-02': {
    en: 'The printed business name received low presence support and has no highlight. The operating-since boundary is uncertified and has no highlight. Only the address has a checked highlight.',
    ar: 'حصل اسم النشاط المطبوع على دعم منخفض لوجوده ولا تظليل له. حدود بداية النشاط غير معتمدة ولا تظليل لها. تظليل العنوان فقط مفحوص.',
  },
  'en-purchase-03': {
    en: 'The purchase description is absent. Only the budget has a checked highlight. This example does not establish supplier-quotation behavior for equipment.',
    ar: 'وصف الشراء غير موجود. تظليل التكلفة فقط مفحوص. لا يثبت هذا المثال سلوك تحليل عروض أسعار المعدات.',
  },
  'en-identity-10': {
    en: 'The name boundary is uncertified and has no highlight. Agreement with this fictional name is not identity authentication.',
    ar: 'حدود الاسم غير معتمدة ولا تظليل له. توافق هذا الاسم الافتراضي ليس توثيقاً للهوية.',
  },
  'en-financial-10': {
    en: 'The printed period is April to June, while July to September is required. All comparisons are withheld, including incorrect average-absence findings. The period highlight does not mean the periods agree.',
    ar: 'الفترة المطبوعة من أبريل إلى يونيو، والمطلوب من يوليو إلى سبتمبر. حُجبت كل المقارنات، بما فيها نتائج غياب المتوسطات غير الصحيحة. لا يعني تظليل الفترة توافقها مع المطلوب.',
  },
} as const;
