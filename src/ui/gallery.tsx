import { useRef, useState } from 'react'
import type { ApplicationSummary } from '../demo'
import { products, submissionMonth, validateFields } from '../domain'
import type { Fields, Language } from '../domain/model'
import { ApplicationField } from './application-field'
import { ApplicationRows, Status } from './application-rows'
import { AttachmentPreparation, SavedAttachment, type AttachmentSelection } from './attachment-feedback'
import { DepartureDialog } from './departure'
import { DraftSaveFeedback, EmptyQueue, LoadingPanel, ReadFailure, type SaveStatus } from './feedback'
import { galleryText } from './gallery-copy'
import { draftText, outcomes, statuses } from './i18n'
import { Select } from './select'

const initialFields: Fields = {
  fullName: 'مريم سالم Mariam Salem', mobile: '+967 777 123 456', city: 'صنعاء', email: 'mariam@example.test',
  businessName: 'متجر الأقمشة Textile supplies', activity: 'retail', address: 'شارع الزبيري Al Zubairi Street، مبنى 12، صنعاء',
  operatingSince: '2025-01', revenue: '600000', expenses: '200000', amount: '1,00,000', term: '6', budget: '400000',
  explanation: 'شراء مخزون من الأقمشة واللوازم لموسم جديد. Textile supplies, batch RIFD-2026-EXAMPLE-001, for the fictional shop in صنعاء. هذا نص طويل لفحص التفاف السطور في الاتجاهين.',
}
const exampleFile = { name: 'خطة-الشراء-purchase-plan-RIFD-2026-EXAMPLE-001.pdf', mime: 'application/pdf', size: 24800 }
const exampleRows: ApplicationSummary[] = [
  { id: 'RIFD-2026-EXAMPLE-001', product: 'inventory', status: 'submitted', fullName: initialFields.fullName, businessName: 'متجر الأقمشة واللوازم المنزلية Textile supplies in صنعاء', amount: '300000', term: '6', submittedAt: '2026-10-14', nextAction: 'viewApplication', assignment: null },
  { id: 'RIFD-2026-EXAMPLE-002', product: 'equipment', status: 'underReview', fullName: 'هدى علي Huda Ali', businessName: 'ورشة المعدات Equipment workshop', amount: '1200000', term: '12', submittedAt: '2026-10-13', nextAction: 'viewApplication', assignedToYou: true },
]

function AttachmentExample({ initial, language }: { initial: AttachmentSelection; language: Language }) {
  const [selection, setSelection] = useState<AttachmentSelection | null>(initial)
  const [previewHint, setPreviewHint] = useState(false)
  return <div>
    {selection && <AttachmentPreparation selection={selection} language={language} errorId={`gallery-${initial.status}-error`}
      retry={() => setSelection({ name: initial.name, status: 'ready', progress: 100, attachment: exampleFile })}
      preview={() => setPreviewHint(true)} discard={() => { setSelection(null); setPreviewHint(false) }} />}
    {!selection && <button onClick={() => setSelection(initial)}>{galleryText.restore[language]}</button>}
    {previewHint && <p role="status">{galleryText.previewHint[language]}</p>}
  </div>
}

export function ComponentGallery({ language }: { language: Language }) {
  const g = (key: keyof typeof galleryText) => galleryText[key][language]
  const [fields, setFields] = useState(initialFields)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('failed')
  const [readFailed, setReadFailed] = useState(true)
  const [previewHint, setPreviewHint] = useState(false)
  const [selectedRow, setSelectedRow] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const dialogOpener = useRef<HTMLButtonElement>(null)
  const closeDialog = () => { setDialogOpen(false); requestAnimationFrame(() => dialogOpener.current?.focus()) }
  const issues = validateFields(fields, products.inventory, submissionMonth)
  return <>
    <h1 tabIndex={-1}>{g('title')}</h1><p className="intro">{g('intro')}</p>
    <div className="grid gap-6">
      <section className="panel" aria-labelledby="gallery-fields"><h2 id="gallery-fields">{g('fields')}</h2><p>{g('focus')}</p>
        <div className="grid grid-cols-2 gap-x-6 narrow:grid-cols-1">{(['fullName', 'mobile', 'amount', 'activity', 'explanation'] as const).map(field => <ApplicationField key={field} field={field} id={`gallery-${field}`} value={fields[field]} product="inventory" language={language} issue={issues.find(issue => issue.field === field)} change={value => setFields(current => ({ ...current, [field]: value }))} />)}</div>
      </section>
      <section className="panel" aria-labelledby="gallery-statuses"><h2 id="gallery-statuses">{g('statuses')}</h2><p>{g('distinctions')}</p>
        <h3>{g('applicationStatus')}</h3><div className="flex flex-wrap gap-3">{(Object.keys(statuses) as Array<keyof typeof statuses>).map(status => <Status key={status} status={status} language={language} />)}</div>
        <h3>{g('documentStatus')}</h3><ul>{(['missing', 'awaitingReview', 'accepted', 'needsReplacement'] as const).map(status => <li key={status}>{outcomes[status][language]}</li>)}</ul>
        <h3>{g('checkStatus')}</h3><ul>{(['unchecked', 'passed', 'failed'] as const).map(status => <li key={status}>{outcomes[status][language]}</li>)}</ul>
      </section>
      <section className="panel" aria-labelledby="gallery-attachments"><h2 id="gallery-attachments">{g('attachments')}</h2><p>{g('attachmentHint')}</p>
        <div className="grid grid-cols-2 gap-6 narrow:grid-cols-1">
          <AttachmentExample initial={{ name: exampleFile.name, status: 'selected', progress: 0 }} language={language} />
          <AttachmentExample initial={{ name: exampleFile.name, status: 'preparing', progress: 50 }} language={language} />
          <AttachmentExample initial={{ name: exampleFile.name, status: 'ready', progress: 100, attachment: exampleFile }} language={language} />
          <AttachmentExample initial={{ name: exampleFile.name, status: 'failed', progress: 50, error: 'uploadFailed' }} language={language} />
          <div>
            <SavedAttachment file={exampleFile} language={language} preview={() => setPreviewHint(true)} />
            <SavedAttachment file={null} language={language} preview={() => setPreviewHint(true)} />
            {previewHint && <p role="status">{g('previewHint')}</p>}
          </div>
        </div>
      </section>
      <section className="panel" aria-labelledby="gallery-saves"><h2 id="gallery-saves">{g('saves')}</h2>
        <label htmlFor="gallery-save-state">{g('saveState')}</label><Select className="my-3" label={g('saveState')} id="gallery-save-state" value={saveStatus} onValueChange={value => setSaveStatus(value as SaveStatus)} options={(['unsaved', 'saving', 'saved', 'failed', 'unknown'] as const).map(status => ({ value: status, label: draftText[status][language] }))} />
        <DraftSaveFeedback status={saveStatus} savedAt={saveStatus === 'unsaved' ? null : '2026-10-14T10:00:00Z'} error={saveStatus === 'failed' ? 'requestFailed' : saveStatus === 'unknown' ? 'outcomeUnknown' : null} language={language} />
        <button disabled={saveStatus === 'saving'} onClick={() => setSaveStatus('saved')}>{draftText[saveStatus === 'unknown' ? 'inspectOutcome' : 'save'][language]}</button>
      </section>
      <section aria-labelledby="gallery-loading"><h2 id="gallery-loading">{g('loading')}</h2><LoadingPanel language={language} />
        {readFailed ? <ReadFailure error="storage" language={language} retry={() => setReadFailed(false)} /> : <p role="status">{g('retryDone')}</p>}
        {!readFailed && <button onClick={() => setReadFailed(true)}>{g('retry')}</button>}
      </section>
      <section aria-labelledby="gallery-queue"><h2 id="gallery-queue">{g('queue')}</h2><p>{g('queueHint')}</p>
        <ApplicationRows list={exampleRows} language={language} staff go={path => setSelectedRow(path.split('/').at(-1) ?? '')} />
        <p role="status">{selectedRow && <>{g('selected')}: <bdi>{selectedRow}</bdi></>}</p><EmptyQueue language={language} />
      </section>
      <section className="panel" aria-labelledby="gallery-dialogs"><h2 id="gallery-dialogs">{g('dialogs')}</h2><p>{g('dialogHint')}</p><button ref={dialogOpener} onClick={() => setDialogOpen(true)}>{g('openDialog')}</button></section>
    </div>
    {dialogOpen && <DepartureDialog request={{ action: closeDialog }} work={{ dirty: true, pending: false, canSave: true, save: async () => true, discard: closeDialog }} language={language} cancel={closeDialog} discard={closeDialog} finish={closeDialog} />}
  </>
}
