window.PROTO = (function () {
  const S = {
    appTitle: { ar: 'مسار', en: 'Masar' },
    appTag: {
      ar: 'عرض تجريبي. البيانات والمنتجات وشروط التمويل افتراضية.',
      en: 'Demo. Data, products, and financing terms are fictional.'
    },
    demoBadge: { ar: 'عرض تجريبي · محفوظ في هذا المتصفح', en: 'Fictional demo · saved in this browser' },
    switchLang: { ar: 'English', en: 'العربية' },
    roleApplicant: { ar: 'المتقدم', en: 'Applicant' },
    roleReviewer: { ar: 'المراجع', en: 'Reviewer' },
    signInAs: { ar: 'الدخول بهوية تجريبية', en: 'Sign in with a demo identity' },

    navProducts: { ar: 'المنتجات', en: 'Products' },
    navApply: { ar: 'طلب جديد', en: 'New application' },
    navDocs: { ar: 'المستندات', en: 'Documents' },
    navApplications: { ar: 'طلباتي', en: 'My applications' },
    navNotifications: { ar: 'الإشعارات', en: 'Notifications' },
    navRepayment: { ar: 'السداد', en: 'Repayment' },
    navQueue: { ar: 'قيد المراجعة', en: 'Queue' },
    navReview: { ar: 'ملف الطلب', en: 'Review workspace' },
    navDecisions: { ar: 'القرارات', en: 'Decisions' },
    navGallery: { ar: 'معرض المكونات', en: 'Component gallery' },
    navReset: { ar: 'إعادة ضبط العرض', en: 'Reset demo' },

    screenProducts: { ar: 'مقارنة المنتجات', en: 'Product comparison' },
    screenForm: { ar: 'خطوات الطلب', en: 'Application steps' },
    screenDocs: { ar: 'المستندات المطلوبة', en: 'Required documents' },
    screenApplications: { ar: 'طلباتي وإشعاراتي', en: 'My applications and notifications' },
    screenCorrection: { ar: 'مساحة التصحيح', en: 'Correction workspace' },
    screenRepayment: { ar: 'جدول السداد التوضيحي', en: 'Fictional repayment illustration' },
    screenQueue: { ar: 'قائمة الطلبات', en: 'Staff queue' },
    screenReview: { ar: 'مساحة المراجعة', en: 'Review workspace' },
    screenDecisions: { ar: 'التصحيح والقرار', en: 'Corrections and decision' },

    applicantView: { ar: 'شاشات المتقدم (جوال)', en: 'Applicant screens (mobile)' },
    staffView: { ar: 'شاشات المراجع (سطح المكتب)', en: 'Reviewer screens (desktop)' },

    compare: { ar: 'قارن المنتجين', en: 'Compare the two products' },
    purpose: { ar: 'الغرض', en: 'Purpose' },
    amountRange: { ar: 'مبلغ التمويل', en: 'Financing amount' },
    terms: { ar: 'مدة السداد', en: 'Repayment term' },
    markup: { ar: 'الزيادة التوضيحية', en: 'Illustrative markup' },
    requiredDocs: { ar: 'المستندات المطلوبة', en: 'Required documents' },
    months: { ar: 'شهرًا', en: 'months' },
    month: { ar: 'شهر', en: 'month' },
    choose: { ar: 'اختر هذا المنتج', en: 'Choose this product' },
    selected: { ar: 'المنتج المختار', en: 'Selected' },
    fixedAfterSubmit: {
      ar: 'لا يمكن تغيير المنتج بعد أول تقديم.',
      en: 'The product cannot change after first submission.'
    },
    wholeRial: { ar: 'مبلغ صحيح بالريال اليمني', en: 'Whole Yemeni rial' },

    stepPersonal: { ar: 'البيانات الشخصية', en: 'Personal details' },
    stepBusiness: { ar: 'بيانات النشاط', en: 'Business information' },
    stepFinancing: { ar: 'احتياج التمويل', en: 'Financing needs' },
    stepDocs: { ar: 'المستندات', en: 'Attachments' },
    stepReview: { ar: 'المراجعة والتقديم', en: 'Review and submit' },
    stepOf: { ar: 'من', en: 'of' },
    saveDraft: { ar: 'حفظ المسودة', en: 'Save draft' },
    savedAt: { ar: 'آخر حفظ ناجح', en: 'Last successful save' },
    next: { ar: 'التالي', en: 'Next' },
    back: { ar: 'السابق', en: 'Back' },
    submit: { ar: 'تقديم الطلب', en: 'Submit application' },
    optional: { ar: 'اختياري', en: 'Optional' },
    required: { ar: 'مطلوب', en: 'Required' },
    focusFirstField: { ar: 'إظهار حالة التركيز', en: 'Show focus state' },
    showErrors: { ar: 'إظهار أخطاء التحقق', en: 'Show validation errors' },
    arabicIndicNote: {
      ar: 'يقبل الحقل الأرقام العربية واللاتينية.',
      en: 'Accepts Arabic-Indic and Western digits.'
    },
    financialWindow: {
      ar: 'الأشهر الثلاثة المكتملة قبل شهر التقديم: يوليو وأغسطس وسبتمبر 2026.',
      en: 'The three completed months before submission: July, August, and September 2026.'
    },
    errAmountMin: {
      ar: 'المبلغ أقل من الحد الأدنى لتمويل المعدات (500,000 ر.ي.).',
      en: 'Below the Equipment financing minimum of 500,000 YER.'
    },
    errTerm: {
      ar: 'مدة 6 أشهر غير متاحة لهذا المنتج. المدد المتاحة: 12 أو 18 أو 24 شهرًا.',
      en: 'Six months is unavailable for this product. Choose 12, 18, or 24 months.'
    },
    errExplanation: {
      ar: 'الوصف مطلوب، من 20 إلى 500 حرف.',
      en: 'An explanation is required, between 20 and 500 characters.'
    },
    errSummary: {
      ar: 'ثلاث مشكلات تمنع التقديم. التصحيح لا يلغي قيمك المحفوظة.',
      en: 'Three problems block submission. Corrections keep your saved values.'
    },
    switchedProduct: {
      ar: 'غيّرت المنتج إلى تمويل المعدات. بقيت المدة والمبلغ كما أدخلتهما وهما غير صالحين الآن.',
      en: 'You switched to Equipment financing. Your amount and term stayed as entered and are now invalid.'
    },

    slotIdentity: { ar: 'إثبات هوية المتقدم', en: 'Applicant identity evidence' },
    slotBusiness: { ar: 'إثبات النشاط التجاري', en: 'Business evidence' },
    slotFinance: { ar: 'ملخص الإيرادات والمصروفات', en: 'Revenue and expense summary' },
    slotPlan: { ar: 'خطة شراء المخزون', en: 'Stock purchase plan' },
    slotQuote: { ar: 'عرض سعر المعدات', en: 'Supplier quotation' },
    preview: { ar: 'معاينة', en: 'Preview' },
    replace: { ar: 'استبدال', en: 'Replace' },
    addFile: { ar: 'إضافة ملف', en: 'Add file' },
    retry: { ar: 'إعادة المحاولة', en: 'Retry' },
    remove: { ar: 'إزالة', en: 'Remove' },
    uploading: { ar: 'جارٍ الرفع', en: 'Uploading' },
    uploadFailed: { ar: 'فشل الرفع', en: 'Upload failed' },
    uploadFailedWhy: {
      ar: 'انتهت مهلة الرفع المحاكي. الملف لم يُحفظ.',
      en: 'The simulated upload timed out. Nothing was saved.'
    },
    readyNotSaved: { ar: 'جاهز للرفع', en: 'Ready to upload' },
    savedNotPublished: { ar: 'محفوظ في مساحتك الخاصة', en: 'Saved in your private workspace' },
    maxFile: { ar: 'PDF أو JPEG أو PNG، بحد أقصى 5 ميغابايت', en: 'PDF, JPEG, or PNG, at most 5 MB' },
    demoFile: { ar: 'ملف تجريبي', en: 'DEMO file' },

    stDraft: { ar: 'مسودة', en: 'Draft' },
    stSubmitted: { ar: 'مقدم', en: 'Submitted' },
    stReview: { ar: 'قيد المراجعة', en: 'Under review' },
    stCorrections: { ar: 'تصحيح مطلوب', en: 'Corrections requested' },
    stApproved: { ar: 'موافق عليه', en: 'Approved' },
    stRejected: { ar: 'مرفوض', en: 'Rejected' },
    dMissing: { ar: 'ناقص', en: 'Missing' },
    dAwaiting: { ar: 'بانتظار المراجعة', en: 'Awaiting review' },
    dAccepted: { ar: 'مقبول', en: 'Accepted' },
    dReplace: { ar: 'يحتاج استبدالًا', en: 'Needs replacement' },
    cUnchecked: { ar: 'لم يُفحص', en: 'Unchecked' },
    cPassed: { ar: 'مستوفٍ', en: 'Passed' },
    cFailed: { ar: 'غير مستوفٍ', en: 'Failed' },

    outstanding: { ar: 'إجراء مطلوب منك', en: 'Action needed from you' },
    viewHistory: { ar: 'سجل الحالة', en: 'Status history' },
    printSummary: { ar: 'طباعة ملخص الطلب', en: 'Print application summary' },
    markRead: { ar: 'تعليم كمقروء', en: 'Mark read' },
    unread: { ar: 'غير مقروء', en: 'Unread' },
    openApplication: { ar: 'فتح الطلب', en: 'Open application' },
    submittedOn: { ar: 'تاريخ التقديم', en: 'Submitted' },
    product: { ar: 'المنتج', en: 'Product' },
    amount: { ar: 'مبلغ التمويل', en: 'Financing amount' },
    term: { ar: 'المدة', en: 'Term' },
    applicant: { ar: 'المتقدم', en: 'Applicant' },
    business: { ar: 'النشاط التجاري', en: 'Business' },
    reference: { ar: 'المرجع', en: 'Reference' },
    status: { ar: 'الحالة', en: 'Status' },
    assignedTo: { ar: 'المسند إليه', en: 'Assigned to' },
    assignedYou: { ar: 'مسند إليك', en: 'Assigned to you' },
    unassigned: { ar: 'غير مسند', en: 'Unassigned' },

    correctionTargets: { ar: 'المطلوب تصحيحه', en: 'Requested corrections' },
    targetAmount: {
      ar: 'القسط التوضيحي 105,000 ر.ي. يتجاوز الحد الافتراضي للقدرة على السداد (80,000 ر.ي.). خفّض مبلغ التمويل المطلوب.',
      en: 'The illustrated installment of 105,000 YER exceeds the fictional capacity limit of 80,000 YER. Reduce the requested financing amount.'
    },
    targetPlan: {
      ar: 'خطة الشراء المرفقة غير مقروءة. أرفق خطة واضحة تبين المشتريات وإجمالي التكلفة.',
      en: 'The attached purchase plan is unreadable. Supply a clear plan showing intended purchases and total cost.'
    },
    lockedFields: {
      ar: 'بقية الحقول والمنتج مقفلة حتى تقديم التصحيح.',
      en: 'Other fields and the product stay locked until you resubmit.'
    },
    locked: { ar: 'مقفل', en: 'Locked' },
    baseline: { ar: 'قيمة الطلب عند صدور التصحيح', en: 'Value when the correction was requested' },
    yourResponse: { ar: 'استجابتك', en: 'Your response' },
    changed: { ar: 'تغيّر', en: 'Changed' },
    resubmit: { ar: 'إعادة تقديم التصحيح', en: 'Resubmit corrections' },
    saveProgress: { ar: 'حفظ التقدم', en: 'Save progress' },
    resubmitRules: {
      ar: 'يجب تغيير كل حقل مطلوب واستبدال كل مستند مطلوب بنجاح قبل إعادة التقديم.',
      en: 'Every requested field must change and every requested document must upload successfully before resubmission.'
    },

    financingAmount: { ar: 'مبلغ التمويل', en: 'Financing amount' },
    illustrativeMarkup: { ar: 'الزيادة التوضيحية', en: 'Illustrative markup' },
    repaymentTotal: { ar: 'إجمالي السداد التوضيحي', en: 'Illustrated repayment total' },
    completedAmount: { ar: 'المبلغ المكتمل في المثال', en: 'Completed amount in the example' },
    remainingAmount: { ar: 'المبلغ المتبقي في المثال', en: 'Remaining amount in the example' },
    dueDate: { ar: 'تاريخ الاستحقاق', en: 'Due date' },
    installment: { ar: 'القسط', en: 'Installment' },
    upcoming: { ar: 'قادم', en: 'Upcoming' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    readOnlyNote: {
      ar: 'عرض توضيحي للقراءة فقط. لا توجد مدفوعات حقيقية، ومرور تاريخ الاستحقاق لا يغيّر حالة الطلب.',
      en: 'Read-only illustration. No real payments; a passing due date changes nothing.'
    },
    showRemaining: { ar: 'عرض بقية الأقساط', en: 'Show remaining installments' },
    approvedOn: { ar: 'تاريخ الموافقة', en: 'Approved' },

    search: { ar: 'بحث بالمرجع أو اسم النشاط', en: 'Search reference or business' },
    filterStatus: { ar: 'الحالة', en: 'Status' },
    allStatuses: { ar: 'كل الحالات', en: 'All statuses' },
    sortBy: { ar: 'ترتيب حسب', en: 'Sort by' },
    sortSubmitted: { ar: 'تاريخ التقديم', en: 'Submission date' },
    sortAmount: { ar: 'مبلغ التمويل', en: 'Financing amount' },
    sortStatus: { ar: 'الحالة', en: 'Status' },
    descending: { ar: 'تنازلي', en: 'Descending' },
    ascending: { ar: 'تصاعدي', en: 'Ascending' },
    page: { ar: 'صفحة', en: 'Page' },
    ofPages: { ar: 'من', en: 'of' },
    perPage: { ar: 'خمسة صفوف في الصفحة', en: 'Five rows per page' },
    savedPrefs: { ar: 'تفضيلات محفوظة في هذا المتصفح', en: 'Preferences saved in this browser' },
    claim: { ar: 'إسناد إليّ', en: 'Assign to me' },
    transfer: { ar: 'تحويل', en: 'Transfer' },
    startReview: { ar: 'بدء المراجعة', en: 'Start review' },
    openFile: { ar: 'فتح الملف', en: 'Open' },
    queueCount: { ar: 'طلبًا في القائمة', en: 'applications in the queue' },

    reviewChecks: { ar: 'قائمة الفحص المطلوبة', en: 'Required review checklist' },
    criteriaNote: { ar: 'معايير مراجعة افتراضية لهذا العرض التجريبي.', en: 'Review criteria invented for this demo.' },
    dependsOn: { ar: 'يعاد الفحص عند تغيير', en: 'Rechecks when changed' },
    internalNotes: { ar: 'ملاحظات داخلية', en: 'Internal notes' },
    addNote: { ar: 'إضافة ملاحظة', en: 'Add note' },
    notePlaceholder: { ar: 'ملاحظة داخلية لا يراها المتقدم…', en: 'Internal note, never shown to the applicant…' },
    internalOnly: { ar: 'داخلي فقط', en: 'Internal only' },
    activity: { ar: 'النشاط', en: 'Activity' },
    applicantHistory: { ar: 'سجل يرى المتقدم مثله', en: 'Applicant-visible history' },
    documents: { ar: 'المستندات', en: 'Documents' },
    accept: { ar: 'قبول', en: 'Accept' },
    needReplace: { ar: 'يحتاج استبدالًا', en: 'Needs replacement' },
    reason: { ar: 'السبب', en: 'Reason' },
    reasonRequired: { ar: 'السبب مطلوب ويظهر للمتقدم.', en: 'A reason is required and is shown to the applicant.' },
    applicantInfo: { ar: 'بيانات الطلب', en: 'Application information' },
    snapshotNote: {
      ar: 'ترى آخر لقطة مقدمة فقط. مسودات المتقدم وتصحيحه غير المقدم غير ظاهرة.',
      en: 'You see the last submitted snapshot only. Drafts and unpublished corrections are hidden.'
    },
    changedSinceBaseline: { ar: 'تغيّر منذ طلب التصحيح', en: 'Changed since the correction request' },
    verifyTarget: { ar: 'التحقق من التصحيح', en: 'Verify correction' },
    verified: { ar: 'تم التحقق', en: 'Verified' },
    pendingVerify: { ar: 'بانتظار التحقق', en: 'Pending verification' },
    readOnlyLostAssignment: {
      ar: 'التطبيق تغيّر في مكان آخر: أُسند إلى خالد علي. أدوات المراجعة للقراءة فقط حتى تحميل أحدث نسخة.',
      en: 'This application changed elsewhere: Khaled Ali now owns it. Review controls are read-only until you load the latest.'
    },
    loadLatest: { ar: 'تحميل أحدث نسخة', en: 'Load latest' },
    reclaim: { ar: 'استعادة الإسناد', en: 'Reclaim assignment' },

    requestCorrections: { ar: 'طلب تصحيح', en: 'Request corrections' },
    approve: { ar: 'موافقة', en: 'Approve' },
    reject: { ar: 'رفض', en: 'Reject' },
    decisionReason: { ar: 'السبب الظاهر للمتقدم', en: 'Applicant-visible reason' },
    confirmApprove: { ar: 'تأكيد الموافقة', en: 'Confirm approval' },
    confirmReject: { ar: 'تأكيد الرفض', en: 'Confirm rejection' },
    approveBlocked: {
      ar: 'الموافقة تتطلب قبول كل المستندات واستيفاء الفحوص الخمسة والتحقق من التصحيحات.',
      en: 'Approval requires every document accepted, all five checks passed, and corrections verified.'
    },
    rejectNeedsCriterion: {
      ar: 'الرفض يتطلب معيارًا جوهريًا غير مستوفٍ. نقص المستندات وحده يستدعي طلب تصحيح.',
      en: 'Rejection needs a failed substantive criterion. A document deficiency alone calls for corrections.'
    },
    approveReasonSample: {
      ar: 'استوفى الطلب معايير المراجعة الافتراضية: المستندات مقبولة، ومدة النشاط كافية، والقدرة التوضيحية على السداد ضمن الحد.',
      en: 'The application meets the fictional review criteria: documents accepted, sufficient operating history, and illustrated repayment capacity within the limit.'
    },
    rejectReasonSample: {
      ar: 'معيار مدة النشاط غير مستوفٍ: بدأ النشاط في أغسطس 2026 وقُدّم الطلب في أكتوبر 2026، أي شهران فقط، والحد الافتراضي ستة أشهر.',
      en: 'The operating-history criterion fails: the business started in August 2026 and applied in October 2026, only two months against the fictional six-month minimum.'
    },
    confirmRequired: { ar: 'التأكيد الصريح مطلوب قبل التنفيذ.', en: 'Explicit confirmation is required.' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    dialogTargets: { ar: 'أضف الأهداف مع سبب لكل منها', en: 'Add targets, each with a reason' },
    addTarget: { ar: 'إضافة هدف', en: 'Add target' },
    staleConflict: { ar: 'تعارض نسخة قديمة', en: 'Stale-record conflict' },
    expireSession: { ar: 'إنهاء الجلسة (تجريبي)', en: 'Expire session (demo)' },

    historySubmitted: { ar: 'تم تقديم الطلب', en: 'Application submitted' },
    historyReviewStart: { ar: 'بدأت المراجعة', en: 'Review started' },
    historyRequest: { ar: 'طلب تصحيح', en: 'Corrections requested' },
    historyResubmit: { ar: 'أعيد تقديم التصحيح', en: 'Corrections resubmitted' },
    historyApprove: { ar: 'قرار الموافقة', en: 'Approved' },
    historyReject: { ar: 'قرار الرفض', en: 'Rejected' },
    historyNote: { ar: 'ملاحظة داخلية', en: 'Internal note added' },
    historyTransfer: { ar: 'تغيير الإسناد', en: 'Assignment changed' },
    historyAssess: { ar: 'تقييم مستند', en: 'Document assessed' },
    historyCheck: { ar: 'تحديث قائمة الفحص', en: 'Checklist updated' },

    keyboardHint: { ar: 'تنقّل بمفتاح Tab، وEnter للتفعيل', en: 'Tab to move, Enter to activate' },
    skipToContent: { ar: 'تخطّ إلى المحتوى', en: 'Skip to content' },
    close: { ar: 'إغلاق', en: 'Close' },
    variantLabel: { ar: 'الاتجاه', en: 'Variant' },
    screenLabel: { ar: 'الشاشة', en: 'Screen' },
    widthMobile: { ar: 'جوال', en: 'Mobile' },
    widthDesktop: { ar: 'سطح المكتب', en: 'Desktop' },
    widthFull: { ar: 'عرض كامل', en: 'Full width' }
  };

  const PRODUCTS = [
    {
      id: 'inventory',
      name: { ar: 'تمويل المخزون', en: 'Inventory financing' },
      purpose: { ar: 'تجديد مخزون النشاط', en: 'Replenish business stock' },
      min: 100000,
      max: 1000000,
      terms: [6, 12],
      markup: 5,
      fourth: 'slotPlan'
    },
    {
      id: 'equipment',
      name: { ar: 'تمويل المعدات', en: 'Equipment financing' },
      purpose: { ar: 'شراء معدات إنتاجية للنشاط', en: 'Purchase productive business equipment' },
      min: 500000,
      max: 3000000,
      terms: [12, 18, 24],
      markup: 8,
      fourth: 'slotQuote'
    }
  ];

  const SHARED_DOCS = ['slotIdentity', 'slotBusiness', 'slotFinance'];

  const FIELDS = [
    {
      group: 'stepPersonal',
      key: 'fullName',
      label: { ar: 'الاسم الكامل', en: 'Full name' },
      value: 'مريم سالم',
      hint: { ar: '2–100 حرف', en: '2–100 characters' }
    },
    {
      group: 'stepPersonal',
      key: 'mobile',
      label: { ar: 'رقم الجوال', en: 'Mobile number' },
      value: '+000000000001',
      ltr: true,
      hintKey: 'arabicIndicNote'
    },
    {
      group: 'stepPersonal',
      key: 'city',
      label: { ar: 'المدينة', en: 'City' },
      value: 'عدن'
    },
    {
      group: 'stepPersonal',
      key: 'email',
      label: { ar: 'البريد الإلكتروني', en: 'Email' },
      value: 'mariam@example.test',
      ltr: true,
      optional: true
    },
    {
      group: 'stepBusiness',
      key: 'businessName',
      label: { ar: 'اسم النشاط التجاري', en: 'Business name' },
      value: 'متجر السهل التجريبي'
    },
    {
      group: 'stepBusiness',
      key: 'activity',
      label: { ar: 'نوع النشاط', en: 'Business activity' },
      value: { ar: 'التجزئة', en: 'Retail' },
      choices: [
        { ar: 'التجزئة', en: 'Retail' },
        { ar: 'الخدمات', en: 'Services' },
        { ar: 'إنتاج صغير', en: 'Small production' }
      ]
    },
    {
      group: 'stepBusiness',
      key: 'address',
      label: { ar: 'عنوان النشاط التجاري', en: 'Business address' },
      value: 'شارع السوق، موقع تجريبي، عدن'
    },
    {
      group: 'stepBusiness',
      key: 'since',
      label: { ar: 'شهر بدء النشاط', en: 'Operating since' },
      value: { ar: 'يناير 2025', en: 'January 2025' },
      ltrValue: '2025-01'
    },
    {
      group: 'stepBusiness',
      key: 'revenue',
      label: { ar: 'متوسط الإيرادات الشهرية', en: 'Average monthly revenue' },
      value: 700000,
      money: true
    },
    {
      group: 'stepBusiness',
      key: 'expenses',
      label: { ar: 'متوسط مصروفات التشغيل الشهرية', en: 'Average monthly operating expenses' },
      value: 500000,
      money: true
    },
    {
      group: 'stepFinancing',
      key: 'amount',
      label: { ar: 'مبلغ التمويل المطلوب', en: 'Requested amount' },
      value: 200000,
      money: true,
      error: 'errAmountMin'
    },
    {
      group: 'stepFinancing',
      key: 'term',
      label: { ar: 'مدة السداد', en: 'Repayment term' },
      value: { ar: '6 أشهر', en: '6 months' },
      error: 'errTerm'
    },
    {
      group: 'stepFinancing',
      key: 'budget',
      label: { ar: 'تكلفة الشراء المتوقعة', en: 'Purchase budget' },
      value: 250000,
      money: true
    },
    {
      group: 'stepFinancing',
      key: 'explanation',
      label: { ar: 'وصف الشراء والغرض منه', en: 'Purchase explanation' },
      value: '',
      placeholder: {
        ar: 'مثال: شراء مخزون جديد من المواد الغذائية لتجديد البضائع في المتجر.',
        en: 'Example: purchase new grocery stock to replenish the shop.'
      },
      textarea: true,
      error: 'errExplanation'
    }
  ];

  const RECORDS = [
    {
      ref: 'MSR-26-101',
      applicant: 'Mariam',
      business: { ar: 'ورشة المدار التجريبية', en: 'Al-Madar Demo Workshop' },
      activity: 'services',
      product: 'equipment',
      amount: 1200000,
      budget: 1500000,
      term: 18,
      revenue: 900000,
      expenses: 650000,
      status: 'approved',
      assignee: 'R',
      submitted: '2026-07-03',
      decided: '2026-07-10',
      since: '2024-03',
      label: { ar: 'موافقة معدات سابقة', en: 'Historical equipment approval' }
    },
    {
      ref: 'MSR-26-102',
      applicant: 'Mariam',
      business: { ar: 'ورشة المدار التجريبية', en: 'Al-Madar Demo Workshop' },
      activity: 'services',
      product: 'equipment',
      amount: 1200000,
      budget: 1500000,
      term: 18,
      revenue: 900000,
      expenses: 650000,
      status: 'submitted',
      assignee: null,
      submitted: '2026-10-02',
      since: '2024-03',
      label: { ar: 'طلب معدات مكتمل', en: 'Complete equipment application' }
    },
    {
      ref: 'MSR-26-103',
      applicant: 'Huda',
      business: { ar: 'متجر الندى التجريبي', en: 'Al-Nada Demo Store' },
      activity: 'retail',
      product: 'inventory',
      amount: 450000,
      baselineAmount: 600000,
      budget: 650000,
      term: 6,
      revenue: 700000,
      expenses: 500000,
      status: 'review',
      assignee: 'R',
      submitted: '2026-10-02',
      requested: '2026-10-04',
      resubmitted: '2026-10-08',
      since: '2025-01',
      label: { ar: 'تصحيح طلب مخزون', en: 'Inventory correction response' }
    },
    {
      ref: 'MSR-26-104',
      applicant: 'Omar',
      business: { ar: 'ورشة البداية التجريبية', en: 'Al-Bidaya Demo Workshop' },
      activity: 'production',
      product: 'inventory',
      amount: 200000,
      budget: 240000,
      term: 6,
      revenue: 600000,
      expenses: 400000,
      status: 'rejected',
      assignee: 'R',
      submitted: '2026-10-02',
      decided: '2026-10-03',
      since: '2026-08',
      label: { ar: 'رفض طلب مخزون لنشاط حديث', en: 'Young-business inventory rejection' }
    },
    {
      ref: 'MSR-26-105',
      applicant: 'Huda',
      business: { ar: 'متجر النخيل التجريبي', en: 'Al-Nakheel Demo Store' },
      activity: 'retail',
      product: 'inventory',
      amount: 300000,
      budget: 350000,
      term: 6,
      revenue: 700000,
      expenses: 500000,
      status: 'submitted',
      assignee: 'R',
      submitted: '2026-10-05',
      since: '2025-01',
      label: { ar: 'طلب مخزون ينقصه الملخص المالي', en: 'Inventory application missing financial evidence' }
    },
    {
      ref: 'MSR-26-106',
      applicant: 'Mariam',
      business: { ar: 'ورشة المدار التجريبية', en: 'Al-Madar Demo Workshop' },
      activity: 'services',
      product: 'equipment',
      amount: 900000,
      budget: 1100000,
      term: 12,
      revenue: 900000,
      expenses: 650000,
      status: 'review',
      assignee: 'R',
      submitted: '2026-10-06',
      since: '2024-03',
      label: { ar: 'مراجعة معدات جارية', en: 'Equipment review in progress' }
    },
    {
      ref: 'MSR-26-107',
      applicant: 'Huda',
      business: { ar: 'متجر النخيل التجريبي', en: 'Al-Nakheel Demo Store' },
      activity: 'retail',
      product: 'inventory',
      amount: 500000,
      budget: 650000,
      term: 12,
      revenue: 700000,
      expenses: 500000,
      status: 'review',
      assignee: 'K',
      submitted: '2026-10-06',
      since: '2025-01',
      label: { ar: 'مراجعة مخزون مع زميل', en: 'Inventory review with colleague' }
    },
    {
      ref: 'MSR-26-108',
      applicant: 'Omar',
      business: { ar: 'ورشة الأفق التجريبية', en: 'Al-Ufuq Demo Workshop' },
      activity: 'production',
      product: 'equipment',
      amount: 700000,
      budget: 900000,
      term: 18,
      revenue: 900000,
      expenses: 650000,
      status: 'review',
      assignee: 'R',
      submitted: '2026-10-07',
      since: '2024-02',
      label: { ar: 'مراجعة معدات لإنتاج صغير', en: 'Equipment review for production' }
    },
    {
      ref: 'MSR-26-109',
      applicant: 'Mariam',
      business: { ar: 'متجر السهل التجريبي', en: 'Al-Sahl Demo Store' },
      activity: 'retail',
      product: 'inventory',
      amount: 400000,
      budget: 500000,
      term: 12,
      revenue: 700000,
      expenses: 500000,
      status: 'submitted',
      assignee: null,
      submitted: '2026-10-08',
      since: '2025-01',
      label: { ar: 'طلب مخزون بانتظار الإسناد', en: 'Inventory awaiting assignment' }
    },
    {
      ref: 'MSR-26-110',
      applicant: 'Huda',
      business: { ar: 'مطبعة البيان التجريبية', en: 'Al-Bayan Demo Press' },
      activity: 'services',
      product: 'equipment',
      amount: 800000,
      budget: 1000000,
      term: 18,
      revenue: 900000,
      expenses: 650000,
      status: 'submitted',
      assignee: 'K',
      submitted: '2026-10-09',
      since: '2024-01',
      label: { ar: 'طلب معدات مسند إلى زميل', en: 'Equipment submitted to colleague' }
    },
    {
      ref: 'MSR-26-111',
      applicant: 'Huda',
      business: { ar: 'متجر الندى التجريبي', en: 'Al-Nada Demo Store' },
      activity: 'retail',
      product: 'inventory',
      amount: 350000,
      budget: 450000,
      term: 6,
      revenue: 700000,
      expenses: 500000,
      status: 'corrections',
      assignee: 'R',
      submitted: '2026-10-09',
      requested: '2026-10-10',
      since: '2025-01',
      label: { ar: 'استبدال الملخص المالي', en: 'Financial evidence replacement' }
    },
    {
      ref: 'MSR-26-112',
      applicant: 'Omar',
      business: { ar: 'ورشة الأفق التجريبية', en: 'Al-Ufuq Demo Workshop' },
      activity: 'production',
      product: 'equipment',
      amount: 1000000,
      budget: 1200000,
      term: 24,
      revenue: 900000,
      expenses: 650000,
      status: 'corrections',
      assignee: 'K',
      submitted: '2026-10-09',
      requested: '2026-10-11',
      since: '2024-02',
      label: { ar: 'استبدال عرض سعر المعدات', en: 'Supplier quotation replacement' }
    }
  ];

  const PEOPLE = {
    Mariam: { ar: 'مريم سالم', en: 'Mariam Salem' },
    Huda: { ar: 'هدى علي', en: 'Huda Ali' },
    Omar: { ar: 'عمر حسن', en: 'Omar Hassan' },
    R: { ar: 'سلمى ناصر', en: 'Salma Nasser' },
    K: { ar: 'خالد علي', en: 'Khaled Ali' }
  };

  const ACTIVITIES = {
    retail: { ar: 'التجزئة', en: 'Retail' },
    services: { ar: 'الخدمات', en: 'Services' },
    production: { ar: 'إنتاج صغير', en: 'Small production' }
  };

  const DOC_SET = [
    { slot: 'slotIdentity', status: 'accepted', file: 'identity-mariam-demo.pdf', size: '412 KB', pages: 1 },
    { slot: 'slotBusiness', status: 'accepted', file: 'business-record-demo.pdf', size: '688 KB', pages: 2 },
    { slot: 'slotFinance', status: 'accepted', file: 'revenue-summary-jul-sep-demo.pdf', size: '530 KB', pages: 3 },
    {
      slot: 'slotPlan',
      status: 'replace',
      file: 'stock-plan-unreadable-demo.jpg',
      size: '1.9 MB',
      pages: 0,
      reason: {
        ar: 'الصورة غير مقروءة ولا تبين المشتريات أو إجمالي التكلفة.',
        en: 'The image is unreadable and shows neither purchases nor total cost.'
      },
      replacement: 'stock-plan-readable-demo.pdf',
      upload: 'failed'
    }
  ];

  const CHECKS = [
    {
      key: 'evidence',
      label: { ar: 'اتساق المستندات والبيانات', en: 'Evidence consistency' },
      state: 'unchecked',
      deps: {
        ar: 'الاسم، النشاط، شهر البدء، الإيراد والمصروفات، وصف الشراء، أي مستند مستبدل',
        en: 'Name, business, start month, revenue and expenses, purchase explanation, any replaced document'
      },
      note: {
        ar: 'أُعيد إلى غير مفحوص بعد استبدال خطة الشراء.',
        en: 'Returned to Unchecked after the purchase-plan replacement.'
      }
    },
    {
      key: 'history',
      label: { ar: 'مدة مزاولة النشاط', en: 'Operating history' },
      state: 'passed',
      deps: { ar: 'شهر بدء النشاط أو إثبات النشاط', en: 'Operating-since month or business evidence' },
      detail: { ar: 'يناير 2025 ← أكتوبر 2026 = 21 شهرًا', en: 'January 2025 → October 2026 = 21 months' }
    },
    {
      key: 'fit',
      label: { ar: 'ملاءمة الغرض لمنتج التمويل', en: 'Product purpose fit' },
      state: 'unchecked',
      deps: {
        ar: 'نوع النشاط، وصف الشراء، خطة الشراء أو عرض السعر',
        en: 'Business activity, purchase explanation, purchase plan or quotation'
      }
    },
    {
      key: 'coverage',
      label: { ar: 'توافق مبلغ التمويل مع تكلفة الشراء', en: 'Purchase budget coverage' },
      state: 'unchecked',
      deps: { ar: 'مبلغ التمويل، تكلفة الشراء، المستند الداعم', en: 'Financing amount, purchase budget, supporting document' },
      detail: { ar: '450,000 ≤ 650,000 ر.ي. بعد التصحيح', en: '450,000 ≤ 650,000 YER after the correction' }
    },
    {
      key: 'capacity',
      label: { ar: 'القدرة التوضيحية على السداد', en: 'Repayment capacity' },
      state: 'unchecked',
      deps: {
        ar: 'المبلغ، المدة، الإيراد، المصروفات، الملخص المالي',
        en: 'Amount, term, revenue, expenses, financial summary'
      },
      detail: {
        ar: 'القسط 78,750 ر.ي. ≤ 80,000 ر.ي. (40% من الفائض 200,000)',
        en: 'Installment 78,750 YER ≤ 80,000 YER (40% of the 200,000 surplus)'
      },
      previous: { ar: 'غير مستوفٍ عند 600,000 ر.ي.', en: 'Failed at 600,000 YER' }
    }
  ];

  const CORRECTION_TARGETS = [
    {
      kind: 'field',
      label: { ar: 'مبلغ التمويل المطلوب', en: 'Requested amount' },
      reason: 'targetAmount',
      baseline: 600000,
      response: 450000,
      money: true,
      verified: 'pending'
    },
    {
      kind: 'doc',
      label: { ar: 'خطة شراء المخزون', en: 'Stock purchase plan' },
      reason: 'targetPlan',
      baselineFile: 'stock-plan-unreadable-demo.jpg',
      responseFile: 'stock-plan-readable-demo.pdf',
      verified: 'pending'
    }
  ];

  const HISTORY = [
    { at: '2026-10-02', key: 'historySubmitted', detail: { ar: 'تقديم أول، لقطة ثابتة', en: 'First submission, fixed snapshot' } },
    { at: '2026-10-03', key: 'historyReviewStart', detail: { ar: 'بدأت المراجعة الداخلية', en: 'Internal review began' } },
    {
      at: '2026-10-04',
      key: 'historyRequest',
      detail: { ar: 'هدفان: مبلغ التمويل وخطة الشراء', en: 'Two targets: financing amount and purchase plan' }
    },
    { at: '2026-10-08', key: 'historyResubmit', detail: { ar: 'نُشرت الاستجابة كاملة', en: 'The whole response was published' } }
  ];

  const INTERNAL_ACTIVITY = [
    { at: '2026-10-03', key: 'historyTransfer', detail: { ar: 'إسناد إلى سلمى ناصر', en: 'Assigned to Salma Nasser' }, internal: true },
    { at: '2026-10-04', key: 'historyAssess', detail: { ar: 'خطة الشراء: تحتاج استبدالًا', en: 'Purchase plan: needs replacement' }, internal: true },
    { at: '2026-10-04', key: 'historyCheck', detail: { ar: 'القدرة على السداد: غير مستوفٍ', en: 'Repayment capacity: Failed' }, internal: true },
    { at: '2026-10-04', key: 'historyRequest', detail: { ar: 'طلب تصحيح بجولة أولى', en: 'First correction round requested' } },
    { at: '2026-10-06', key: 'historyNote', detail: { ar: 'الفائض الشهري 200,000 ر.ي. يكفي بعد تخفيض المبلغ.', en: 'The 200,000 YER monthly surplus is enough once the amount drops.' }, internal: true },
    { at: '2026-10-08', key: 'historyResubmit', detail: { ar: 'عادت إلى قيد المراجعة، وتصفّرت الفحوص المتأثرة', en: 'Back to Under review; affected checks reset' } }
  ];

  const NOTIFICATIONS = [
    {
      ref: 'MSR-26-103',
      kind: 'historyRequest',
      at: '2026-10-04',
      unread: false,
      body: {
        ar: 'طلب تصحيح: خفّض مبلغ التمويل وأرفق خطة شراء مقروءة.',
        en: 'Corrections requested: reduce the financing amount and attach a readable purchase plan.'
      }
    },
    {
      ref: 'MSR-26-111',
      kind: 'historyRequest',
      at: '2026-10-10',
      unread: true,
      body: {
        ar: 'طلب تصحيح: أرفق ملخص إيرادات ومصروفات مقروءًا للأشهر يوليو–سبتمبر 2026.',
        en: 'Corrections requested: attach a readable July–September 2026 revenue and expense summary.'
      }
    },
    {
      ref: 'MSR-26-101',
      kind: 'historyApprove',
      at: '2026-07-10',
      unread: false,
      body: {
        ar: 'موافقة على تمويل المعدات بمبلغ 1,200,000 ر.ي. لمدة 18 شهرًا.',
        en: 'Equipment financing of 1,200,000 YER approved over 18 months.'
      }
    }
  ];

  const REPAYMENT = {
    amount: 1200000,
    markup: 96000,
    total: 1296000,
    installment: 72000,
    count: 18,
    completedCount: 2,
    completedAmount: 144000,
    remainingAmount: 1152000,
    approvedOn: '2026-07-10',
    entries: [
      { at: '2026-08-15', state: 'completed' },
      { at: '2026-09-15', state: 'completed' },
      { at: '2026-10-15', state: 'upcoming', next: true },
      { at: '2026-11-15', state: 'upcoming' },
      { at: '2026-12-15', state: 'upcoming' },
      { at: '2027-01-15', state: 'upcoming' }
    ],
    lastEntry: '2028-01-15'
  };

  const MONTHS = {
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  const SCREENS = [
    { key: 'products', role: 'applicant', label: 'screenProducts' },
    { key: 'form', role: 'applicant', label: 'screenForm' },
    { key: 'documents', role: 'applicant', label: 'screenDocs' },
    { key: 'applications', role: 'applicant', label: 'screenApplications' },
    { key: 'correction', role: 'applicant', label: 'screenCorrection' },
    { key: 'repayment', role: 'applicant', label: 'screenRepayment' },
    { key: 'queue', role: 'staff', label: 'screenQueue' },
    { key: 'review', role: 'staff', label: 'screenReview' },
    { key: 'decisions', role: 'staff', label: 'screenDecisions' }
  ];

  function n(x) {
    return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function fmt(lang, key) {
    const entry = S[key];
    return entry ? entry[lang] : key;
  }

  function monthName(lang, iso) {
    const parts = String(iso).split('-');
    return `${MONTHS[lang][Number(parts[1]) - 1]} ${parts[0]}`;
  }

  function date(lang, iso) {
    const parts = String(iso).split('-');
    if (parts.length === 2) return monthName(lang, iso);
    return `${Number(parts[2])} ${MONTHS[lang][Number(parts[1]) - 1]} ${parts[0]}`;
  }

  function money(lang, x) {
    return { value: n(x), currency: lang === 'ar' ? 'ر.ي.' : 'YER' };
  }

  function label(lang, v) {
    if (v === null || v === undefined) return '';
    return typeof v === 'object' ? v[lang] : v;
  }

  return {
    S,
    PRODUCTS,
    SHARED_DOCS,
    FIELDS,
    RECORDS,
    PEOPLE,
    ACTIVITIES,
    DOC_SET,
    CHECKS,
    CORRECTION_TARGETS,
    HISTORY,
    INTERNAL_ACTIVITY,
    NOTIFICATIONS,
    REPAYMENT,
    SCREENS,
    n,
    fmt,
    date,
    monthName,
    money,
    label,
    record(ref) {
      return RECORDS.find((r) => r.ref === ref);
    }
  };
})();
