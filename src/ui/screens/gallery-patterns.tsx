import { useEffect, useRef, useState } from 'react'
import { products, type ApplicationStep } from '../../domain'
import type { Language } from '../../domain/model'
import { ApplicationSteps } from '../application/application-steps'
import { ApplicationRows } from '../application/application-rows'
import { containDialogFocus } from '../shared/dialog'
import { exampleHistory, exampleNotice, examplePreview, exampleRepayment, exampleRows } from './gallery-examples'
import { galleryText } from './gallery-copy'
import { IdentityCard } from '../shared/identity-card'
import { outcomes, text } from '../i18n'
import { NotificationCard } from './notifications'
import { DocumentPreviewContent } from '../shared/preview'
import { GrowthArt, Icon, ProductCard } from './products'
import { PublicHistory } from '../application/public-record'
import { QueueCounts } from '../queue/queue-counts'
import { RepaymentSchedule, RepaymentSummary } from './repayment'
import { Select } from '../shared/select'
import { FilePicker } from '../shared/file-picker'

const labels = {
  foundations: { ar: 'الهوية والألوان', en: 'Identity and colors' },
  buttons: { ar: 'الأزرار والإجراءات', en: 'Buttons and actions' },
  cards: { ar: 'البطاقات والملخصات', en: 'Cards and summaries' },
  products: { ar: 'بطاقات التمويل والرسم', en: 'Financing cards and illustration' },
  controls: { ar: 'الاختيار ورفع الملفات', en: 'Selection and file controls' },
  navigation: { ar: 'الخطوات والتنقل', en: 'Steps and navigation' },
  notifications: { ar: 'بطاقات الإشعارات', en: 'Notification cards' },
  repayment: { ar: 'ملخص السداد والأقساط', en: 'Repayment summary and installments' },
  history: { ar: 'السجل الزمني', en: 'History timeline' },
}
export const gallerySections = [
  ['gallery-foundations', labels.foundations], ['gallery-buttons', labels.buttons],
  ['gallery-cards', labels.cards], ['gallery-products', labels.products],
  ['gallery-fields', galleryText.fields], ['gallery-controls', labels.controls],
  ['gallery-navigation', labels.navigation], ['gallery-statuses', galleryText.statuses],
  ['gallery-attachments', galleryText.attachments], ['gallery-saves', galleryText.saves],
  ['gallery-queue', galleryText.queue], ['gallery-notifications', labels.notifications],
  ['gallery-repayment', labels.repayment], ['gallery-history', labels.history],
  ['gallery-loading', galleryText.loading], ['gallery-dialogs', galleryText.dialogs],
] as const

export function GalleryBasics({ language }: { language: Language }) {
  const t = (ar: string, en: string) => language === 'ar' ? ar : en
  const [pressed, setPressed] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [identityMessage, setIdentityMessage] = useState('')
  const [productMessage, setProductMessage] = useState('')
  return <>
    <section className="gallery-section" aria-labelledby="gallery-foundations">
      <h2 id="gallery-foundations">{labels.foundations[language]}</h2>
      <p>{t('الخطوط والألوان والزوايا نفسها المستخدمة في بقية الصفحات.', 'The same typefaces, colors, and corners used throughout the site.')}</p>
      <ul className="gallery-palette">{([
        ['canvas', t('الخلفية', 'Background')], ['surface', t('سطح البطاقة', 'Card surface')],
        ['accent', t('الأخضر الأساسي', 'Brand green')], ['ink', t('النص', 'Text')],
        ['muted', t('النص الثانوي', 'Secondary text')], ['border', t('الحدود', 'Borders')],
      ] as const).map(([token, label]) => <li key={token}><span className="gallery-swatch" style={{ background: `var(--color-${token})` }} /><span>{label}</span></li>)}</ul>
      <p lang="ar" dir="rtl" style={{ fontFamily: 'var(--font-sans)' }}>مشروعك. وخطوته القادمة.</p>
      <p lang="en" dir="ltr" style={{ fontFamily: 'var(--font-latin)' }}>Your business. Its next chapter.</p>
      <div className="flex flex-wrap gap-6" aria-label={t('الأيقونات', 'Icons')}>{(['arrow', 'box', 'equipment', 'check', 'spark'] as const).map(name => <span className="text-accent" key={name}><Icon name={name} /></span>)}</div>
    </section>

    <section className="gallery-section" aria-labelledby="gallery-buttons">
      <h2 id="gallery-buttons">{labels.buttons[language]}</h2>
      <div className="actions">
        <button onClick={() => setActionMessage(t('تم تفعيل الإجراء الأساسي.', 'Primary action activated.'))}>{t('متابعة', 'Continue')}</button>
        <button className="secondary" onClick={() => setActionMessage(t('تم تفعيل الإجراء الثانوي.', 'Secondary action activated.'))}>{t('رجوع', 'Back')}</button>
        <a className="button secondary" href="#gallery-cards">{t('زر رابط', 'Link action')}</a>
        <button disabled>{t('غير متاح', 'Unavailable')}</button>
        <button aria-disabled="true" aria-busy="true"><span className="button-spinner" aria-hidden="true" />{t('جارٍ المعالجة', 'Processing')}</button>
        <button className="secondary" aria-pressed={pressed} onClick={() => setPressed(!pressed)}>{t('تحديد الخيار', 'Select option')}</button>
        <button className="secondary" aria-label={t('إجراء بأيقونة', 'Icon action')} onClick={() => setActionMessage(t('تم تفعيل إجراء الأيقونة.', 'Icon action activated.'))}><Icon name="arrow" size={18} /></button>
      </div>
      <p role="status">{actionMessage}</p>
    </section>

    <section className="gallery-section" aria-labelledby="gallery-cards">
      <h2 id="gallery-cards">{labels.cards[language]}</h2>
      <div className="grid grid-cols-2 items-start gap-6 narrow:grid-cols-1">
        <section className="panel"><h3 className="mt-0">{t('البطاقة الأساسية', 'Standard card')}</h3><p>{t('للمعلومات والمستندات ونماذج المراجعة.', 'For information, documents, and review forms.')}</p></section>
        <aside className="summary mb-0"><h3 className="mt-0">{t('بطاقة الملخص', 'Summary card')}</h3><p>{t('للشروط والخطوة التالية وملخصات السداد.', 'For terms, next steps, and repayment summaries.')}</p></aside>
        <div className="summary border-danger-border bg-danger-surface text-danger-text" role="alert"><strong>{t('رسالة التحقق', 'Validation notice')}</strong><p>{t('تحتفظ رسائل الأخطاء بألوانها أثناء التفاعل.', 'Errors retain their semantic colors during interaction.')}</p></div>
        <div className="draft-feedback m-0"><strong>{t('بطاقة الحالة', 'Feedback card')}</strong><p>{t('لتجهيز الملفات وحالة الحفظ.', 'For file preparation and save status.')}</p></div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-5 narrow:grid-cols-1">
        <IdentityCard name={t('مريم سالم', 'Mariam Salem')} role={text.applicant[language]} language={language} onClick={() => setIdentityMessage(t('تم اختيار مثال المتقدم.', 'Applicant example selected.'))} />
        <IdentityCard name={t('سلمى ناصر', 'Salma Nasser')} role={text.reviewer[language]} language={language} onClick={() => setIdentityMessage(t('تم اختيار مثال المراجعة.', 'Reviewer example selected.'))} />
      </div>
      <p role="status">{identityMessage}</p>
      <h3>{t('بطاقات طلبات المتقدم', 'Applicant application cards')}</h3>
      <ApplicationRows list={exampleRows} language={language} staff={false} go={path => setIdentityMessage(`${t('تم اختيار الطلب', 'Application selected')}: ${path.split('/').at(-1)}`)} />
      <p className="mt-5 text-muted">{t('بطاقات إحصاءات قائمة المراجعة', 'Staff queue count cards')}</p>
      <QueueCounts total={13} counts={{ submitted: 5, underReview: 3, correctionsRequested: 3, approved: 1, rejected: 1 }} language={language} />
    </section>

    <section className="gallery-section" aria-labelledby="gallery-products">
      <h2 id="gallery-products">{labels.products[language]}</h2>
      <div className="grid grid-cols-2 gap-6 narrow:grid-cols-1">{(['inventory', 'equipment'] as const).map(productId => <ProductCard key={productId} productId={productId} language={language} choose={(product, term) => setProductMessage(`${products[product].name[language]} · ${term} ${text.months[language]}`)} />)}</div>
      <p role="status">{productMessage}</p>
      <div className="mt-6 max-w-[520px]"><GrowthArt language={language} /></div>
    </section>
  </>
}

export function GalleryControls({ language }: { language: Language }) {
  const t = (ar: string, en: string) => language === 'ar' ? ar : en
  const [value, setValue] = useState('inventory')
  const [invalidValue, setInvalidValue] = useState('')
  const [longValue, setLongValue] = useState('1')
  const [checked, setChecked] = useState(true)
  const [review, setReview] = useState('unchecked')
  const [step, setStep] = useState<ApplicationStep>('personal')
  const [page, setPage] = useState(1)
  const [file, setFile] = useState('')
  const options = [{ value: 'inventory', label: t('تمويل المخزون', 'Inventory financing') }, { value: 'equipment', label: t('تمويل المعدات', 'Equipment financing') }, { value: 'unavailable', label: t('خيار غير متاح', 'Unavailable option'), disabled: true }]
  return <>
    <section className="gallery-section" aria-labelledby="gallery-controls">
      <h2 id="gallery-controls">{labels.controls[language]}</h2>
      <div className="grid grid-cols-2 items-start gap-6 narrow:grid-cols-1">
        <div><label htmlFor="gallery-select">{t('قائمة اختيار', 'Example dropdown')}</label><Select id="gallery-select" label={t('قائمة اختيار', 'Example dropdown')} value={value} options={options} onValueChange={setValue} /></div>
        <div><label htmlFor="gallery-select-invalid">{t('اختيار مطلوب', 'Required dropdown')}</label><Select id="gallery-select-invalid" label={t('اختيار مطلوب', 'Required dropdown')} value={invalidValue} options={[{ value: '', label: t('اختر قيمة', 'Choose a value') }, ...options]} onValueChange={setInvalidValue} aria-invalid={!invalidValue} aria-describedby="gallery-select-error" />{!invalidValue && <p id="gallery-select-error" className="text-danger-text">{t('اختر قيمة للمتابعة.', 'Choose a value to continue.')}</p>}</div>
        <div><label htmlFor="gallery-select-disabled">{t('قائمة غير متاحة', 'Disabled dropdown')}</label><Select id="gallery-select-disabled" label={t('قائمة غير متاحة', 'Disabled dropdown')} value="inventory" options={options} onValueChange={() => {}} disabled /></div>
        <div><label htmlFor="gallery-select-long">{t('قائمة طويلة', 'Long dropdown')}</label><Select id="gallery-select-long" label={t('قائمة طويلة', 'Long dropdown')} value={longValue} options={Array.from({ length: 24 }, (_, index) => ({ value: String(index + 1), label: `${t('الخيار', 'Option')} ${index + 1}` }))} onValueChange={setLongValue} /></div>
        <div className="application-field"><label htmlFor="gallery-readonly">{t('حقل للقراءة فقط', 'Read-only field')}</label><input id="gallery-readonly" type="text" value="RIFD-2026-EXAMPLE-001" dir="ltr" readOnly /></div>
        <div className="application-field"><label htmlFor="gallery-disabled">{t('حقل غير متاح', 'Disabled field')}</label><input id="gallery-disabled" type="text" value={t('غير متاح', 'Unavailable')} disabled /></div>
      </div>
      <div className="draft-editor grid grid-cols-2 items-start gap-6 narrow:grid-cols-1">
        <div><label htmlFor="gallery-file">{t('رفع ملف', 'File upload')}</label><FilePicker id="gallery-file" language={language} name={file || undefined} choose={file => setFile(file.name)} /></div>
        <div><label htmlFor="gallery-file-disabled">{t('رفع ملف غير متاح', 'Disabled file upload')}</label><FilePicker id="gallery-file-disabled" language={language} disabled choose={() => {}} /></div>
      </div>
      <fieldset className="m-0 mt-6 min-w-0 rounded-card border border-solid border-border p-4">
        <legend>{t('أدوات الاختيار والمراجعة', 'Choice and review controls')}</legend>
        <label className="me-6 inline-flex items-center gap-2"><input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} />{t('خيار مفعّل', 'Enabled choice')}</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" disabled />{t('خيار غير متاح', 'Disabled choice')}</label>
        <div className="actions">{(['unchecked', 'passed', 'failed'] as const).map(outcome => <button className="secondary" key={outcome} aria-pressed={review === outcome} onClick={() => setReview(outcome)}>{outcomes[outcome][language]}</button>)}</div>
      </fieldset>
      <details className="draft-feedback demo-controls"><summary>{t('خيارات إضافية', 'Additional options')}</summary><p>{t('نفس مكوّن التوسيع المستخدم في إعدادات العرض وتفاصيل المستندات.', 'The disclosure used in demo controls and document details.')}</p></details>
    </section>

    <section className="gallery-section" aria-labelledby="gallery-navigation">
      <h2 id="gallery-navigation">{labels.navigation[language]}</h2>
      <ApplicationSteps current={step} language={language} changeStep={setStep} />
      <nav className="actions" aria-label={t('مثال ترقيم الصفحات', 'Example pagination')}>
        <button aria-disabled={page === 1} onClick={() => { if (page > 1) setPage(page - 1) }}>{t('السابق', 'Previous')}</button>
        <span role="status">{page} / 3</span>
        <button aria-disabled={page === 3} onClick={() => { if (page < 3) setPage(page + 1) }}>{t('التالي', 'Next')}</button>
      </nav>
    </section>
  </>
}

export function GalleryRecords({ language }: { language: Language }) {
  const [notice, setNotice] = useState(exampleNotice)
  const [selected, setSelected] = useState(false)
  return <>
    <section className="gallery-section" aria-labelledby="gallery-notifications">
      <h2 id="gallery-notifications">{labels.notifications[language]}</h2>
      <NotificationCard notice={notice} language={language} open={() => setSelected(true)} markRead={() => setNotice(current => ({ ...current, read: true }))} />
      {selected && <p role="status">{notice.applicationId}</p>}
    </section>
    <section className="gallery-section" aria-labelledby="gallery-repayment">
      <h2 id="gallery-repayment">{labels.repayment[language]}</h2>
      <div className="grid grid-cols-2 items-start gap-6 narrow:grid-cols-1"><RepaymentSummary repayment={exampleRepayment} language={language} /><RepaymentSchedule repayment={exampleRepayment} language={language} /></div>
    </section>
    <section className="gallery-section" aria-labelledby="gallery-history">
      <h2 id="gallery-history">{labels.history[language]}</h2><PublicHistory history={exampleHistory} language={language} />
    </section>
  </>
}

function ExampleDialog({ kind, language, close }: { kind: 'confirmation' | 'preview'; language: Language; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [failed, setFailed] = useState(false)
  const t = (ar: string, en: string) => language === 'ar' ? ar : en
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.current?.showModal()
    return () => { requestAnimationFrame(() => { if (opener?.isConnected) opener.focus() }) }
  }, [])
  return <dialog ref={dialog} className={kind === 'preview' ? 'w-[900px]' : 'w-[650px]'} aria-labelledby="gallery-modal-title" onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); close() }}>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 id="gallery-modal-title">{kind === 'preview' ? t('معاينة المستند', 'Document preview') : t('تأكيد الإجراء', 'Confirm action')}</h2><button className="secondary" onClick={close}>{t('إغلاق', 'Close')}</button></div>
    {kind === 'preview' ? <DocumentPreviewContent file={examplePreview} language={language} renderFailed={failed} onRenderError={() => setFailed(true)} /> : <><p>{t('مثال لحوار تأكيد القرارات وتغيير المنتج وإعادة الضبط.', 'The confirmation pattern for decisions, product changes, and demo reset.')}</p><div className="actions"><button className="secondary" onClick={close}>{t('إلغاء', 'Cancel')}</button><button onClick={close}>{t('تأكيد', 'Confirm')}</button></div></>}
  </dialog>
}

export function GalleryDialogExamples({ language }: { language: Language }) {
  const [kind, setKind] = useState<'confirmation' | 'preview' | null>(null)
  return <>
    <div className="actions"><button className="secondary" onClick={() => setKind('confirmation')}>{language === 'ar' ? 'فتح حوار التأكيد' : 'Open confirmation dialog'}</button><button className="secondary" onClick={() => setKind('preview')}>{language === 'ar' ? 'فتح معاينة المستند' : 'Open document preview'}</button></div>
    {kind && <ExampleDialog kind={kind} language={language} close={() => setKind(null)} />}
  </>
}
