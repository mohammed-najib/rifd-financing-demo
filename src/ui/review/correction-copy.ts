export const correctionText = {
  request: { ar: 'طلب تصحيحات', en: 'Request corrections' },
  back: { ar: 'العودة إلى المراجعة', en: 'Back to review' },
  instruction: {
    ar: 'اختر فقط الحقول والمستندات التي تحتاج إلى تغيير، واكتب سببًا لكل منها. يبقى المنتج وباقي المعلومات مقفلة.',
    en: 'Select only fields and documents that need changing, with a reason for each. The product and other information stay locked.',
  },
  fields: { ar: 'حقول الطلب', en: 'Application fields' },
  documents: { ar: 'المستندات المطلوبة', en: 'Document slots' },
  reason: { ar: 'سبب التصحيح', en: 'Correction reason' },
  inspect: { ar: 'فحص طلب التصحيح', en: 'Inspect correction request' },
  confirmHeading: { ar: 'تأكيد طلب التصحيح', en: 'Confirm correction request' },
  confirm: { ar: 'تأكيد وإرسال الطلب', en: 'Confirm and send request' },
  cancel: { ar: 'العودة إلى التحرير', en: 'Return to editing' },
  pause: {
    ar: 'سيُخطر المتقدم بهذه الأسباب. تتوقف التقييمات والفحوص والقرارات حتى إعادة التقديم، مع السماح بالقراءة والملاحظات المصرح بها.',
    en: 'The applicant will receive these reasons. Assessments, checks and decisions pause until resubmission. Reading and authorized notes remain available.',
  },
  readOnly: {
    ar: 'إرسال طلب تصحيح يتطلب إسناد الطلب إليك وأن يكون قيد المراجعة. يبقى النص غير المرسل هنا حتى تتخلص منه.',
    en: 'Sending requires assignment to you and Under review. Unsent text stays here until discarded.',
  },
  sent: { ar: 'أُرسل طلب التصحيح.', en: 'Correction request sent.' },
  working: { ar: 'جارٍ إرسال الطلب…', en: 'Sending request…' },
  changed: {
    ar: 'تغير الطلب. افحص أحدث المعلومات ثم افحص طلب التصحيح وأكد إرساله من جديد.',
    en: 'The application changed. Inspect the latest information, then inspect and confirm the request again.',
  },
  latest: { ar: 'فحص أحدث طلب', en: 'Inspect latest application' },
  outcome: { ar: 'فحص نتيجة طلب التصحيح', en: 'Inspect correction request outcome' },
  retry: {
    ar: 'لم يُرسل الطلب. راجع النص المحفوظ هنا وأكد الإرسال من جديد.',
    en: 'The request was not sent. Review the retained text and confirm sending again.',
  },
} as const;
