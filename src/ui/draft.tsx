import { useEffect, useRef, useState } from 'react'
import type { ApplicationView, Context, Demo, DraftDocuments, ErrorKind, PreparedAttachment, Preparation, Result, SaveDraftOperation } from '../demo'
import { applicationSteps, products, stepFields, validateFields, type ApplicationStep } from '../domain'
import { slots, type DocumentSlot, type Fields, type Language, type ProductId, type Sample } from '../domain/model'
import { DocumentPreview } from './preview'
import { displayFieldValue, documentLabel, draftText, errors, fieldLabels, money, text } from './i18n'
import { activities, applicationText, documentRequirement, issueMessage } from './application-copy'

type Selection = { id: string; source: Preparation['source']; name: string; status: 'preparing' | 'ready' | 'failed'; progress: number; attachment?: PreparedAttachment; error?: ErrorKind }
type Selections = Partial<Record<DocumentSlot, Selection>>
export type DraftBuffer = {
  fields: Fields; product: ProductId; baseline: ApplicationView; selections: Selections; purchaseRemoved: boolean;
  status: 'unsaved' | 'saving' | 'saved' | 'failed' | 'unknown'; error: ErrorKind | null;
  pending: SaveDraftOperation | null; capturedSelections: Partial<Record<DocumentSlot, string>>;
}
export type Departure = { dirty: boolean; pending: boolean; canSave: boolean; save: () => Promise<boolean>; discard: () => void }
const savedTime = (view: ApplicationView) => view.role === 'applicant' ? view.workspace?.savedAt : null
const initialBuffer = (view: ApplicationView): DraftBuffer => ({ fields: { ...view.snapshot.fields }, product: view.product, baseline: view, selections: {}, purchaseRemoved: false, status: savedTime(view) ? 'saved' : 'unsaved', error: null, pending: null, capturedSelections: {} })
export const draftDirty = (buffer: DraftBuffer) => !savedTime(buffer.baseline) || JSON.stringify(buffer.fields) !== JSON.stringify(buffer.baseline.snapshot.fields) || buffer.product !== buffer.baseline.product || buffer.purchaseRemoved || Object.keys(buffer.selections).length > 0 || buffer.status === 'unknown'
const fieldId = (field: keyof Fields) => field === 'explanation' ? 'purchase-explanation' : `field-${field}`

export function DraftEditor({ demo, view, context, language, retained, remember, departure, savedView, step, changeStep }: {
  demo: Demo; view: ApplicationView; context: Context; language: Language; step: ApplicationStep; changeStep: (step: ApplicationStep) => void;
  retained?: DraftBuffer; remember: (value: DraftBuffer) => void; departure: (value: Departure | null) => void;
  savedView: (value: ApplicationView) => void;
}) {
  const initial = retained ?? initialBuffer(view)
  const [buffer, render] = useState(initial)
  const state = useRef(initial)
  const mounted = useRef(true)
  const preparations = useRef<Partial<Record<DocumentSlot, Promise<Result<PreparedAttachment>>>>>({})
  const [samples, setSamples] = useState<Sample[]>([])
  const [sampleIds, setSampleIds] = useState<Partial<Record<DocumentSlot, string>>>({})
  const [preview, setPreview] = useState<{ slot: DocumentSlot; kind: 'saved' | 'ready' } | null>(null)
  const [latest, setLatest] = useState<ApplicationView | null>(null)
  const [inspecting, setInspecting] = useState(false)
  const [checked, setChecked] = useState(false)
  const [reapplyConfirmation, setReapplyConfirmation] = useState<ApplicationView | null>(null)
  const reapplyControl = useRef<HTMLButtonElement>(null)
  const [switchTo, setSwitchTo] = useState<ProductId | null>(null)
  const switchDialog = useRef<HTMLDialogElement>(null)
  const productControl = useRef<HTMLSelectElement>(null)
  const confirmationWasOpen = useRef(false)
  const confirmationOpener = useRef<HTMLElement | null>(null)
  const focusTarget = useRef<string | null>(null)
  const [, redrawControls] = useState(0)
  const controls = demo.controls()
  const t = (key: keyof typeof draftText) => draftText[key][language]
  const a = (key: keyof typeof applicationText) => applicationText[key][language]
  const update = (next: DraftBuffer) => { state.current = next; remember(next); if (mounted.current) render(next) }
  const dirty = draftDirty(buffer)
  const locked = buffer.status === 'saving' || buffer.status === 'unknown'
  const newer = view.role === 'applicant' && buffer.baseline.role === 'applicant' && !!view.workspace && !!buffer.baseline.workspace && view.workspace.revision > buffer.baseline.workspace.revision
  const fieldIssues = validateFields(buffer.fields, products[buffer.product], '2026-10')
  const effectiveSaved = (slot: DocumentSlot) => slot === 'purchase' && buffer.purchaseRemoved ? null : buffer.baseline.documents.find(document => document.slot === slot)?.file
  const missingSlots = slots.filter(slot => buffer.selections[slot] ? buffer.selections[slot]?.status !== 'ready' : !effectiveSaved(slot))
  useEffect(() => {
    if (preview?.kind === 'saved') {
      const file = effectiveSaved(preview.slot)
      if (!file || !view.documents.some(document => document.file?.id === file.id)) setPreview(null)
    }
  }, [preview, view])
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      for (const slot of slots) demo.cancelPreparation(view.id, slot)
      const current = state.current
      const selections = Object.fromEntries(Object.entries(current.selections).map(([slot, selection]) => [slot, selection.status === 'preparing' ? { ...selection, status: 'failed', error: 'sessionExpired' } : selection])) as Selections
      remember({ ...current, selections, status: current.status === 'saving' ? current.pending ? 'unknown' : 'failed' : current.status })
      departure(null)
    }
  }, [])
  useEffect(() => {
    let active = true
    void demo.listSamples(view.id).then(result => {
      if (!active || !result.ok) return
      setSamples(result.value)
      setSampleIds(Object.fromEntries(slots.map(slot => [slot, result.value.find(sample => sample.slot === slot)?.id ?? ''])))
    })
    return () => { active = false }
  }, [demo, view.id])
  useEffect(() => {
    if (newer && !draftDirty(state.current) && view.status === 'draft') update(initialBuffer(view))
  }, [view])
  useEffect(() => {
    document.getElementById(focusTarget.current ?? 'step-heading')?.focus()
    focusTarget.current = null
  }, [step])
  useEffect(() => {
    if (switchTo || reapplyConfirmation) {
      confirmationOpener.current = reapplyConfirmation ? reapplyControl.current : productControl.current
      confirmationWasOpen.current = true
      switchDialog.current?.showModal()
    } else if (confirmationWasOpen.current) {
      confirmationWasOpen.current = false
      const opener = confirmationOpener.current
      const target = opener?.isConnected ? opener : productControl.current ?? document.getElementById('step-heading')
      target?.focus()
    }
  }, [switchTo, reapplyConfirmation])
  const prepare = (slot: DocumentSlot, source: Preparation['source'], name: string) => {
    if (state.current.status === 'saving' || state.current.status === 'unknown') return
    setPreview(null)
    const id = crypto.randomUUID()
    update({ ...state.current, selections: { ...state.current.selections, [slot]: { id, source, name, status: 'preparing', progress: 0 } }, status: 'unsaved', error: null, pending: null })
    const promise = demo.prepareAttachment({ datasetId: context.datasetId, applicationId: view.id, slot, product: state.current.product, selectionId: id, source }, progress => {
      const selection = state.current.selections[slot]
      if (mounted.current && selection?.id === id) update({ ...state.current, selections: { ...state.current.selections, [slot]: { ...selection, progress } } })
    })
    preparations.current[slot] = promise
    void promise.then(result => {
      const selection = state.current.selections[slot]
      if (!mounted.current || selection?.id !== id) return
      update({ ...state.current, selections: { ...state.current.selections, [slot]: result.ok ? { ...selection, status: 'ready', progress: 100, name: result.value.name, attachment: result.value } : { ...selection, status: 'failed', error: result.error.kind } } })
    })
  }
  const acceptSaved = (application: ApplicationView, command: SaveDraftOperation, captured: DraftBuffer['capturedSelections']) => {
    const current = state.current
    const selections = { ...current.selections }
    for (const slot of slots) {
      const document = command.documents[slot]
      if (document.kind === 'prepared' && selections[slot]?.id === captured[slot] && application.snapshot.documents[slot] === document.attachment.id) delete selections[slot]
    }
    const next = { ...current, baseline: application, selections, purchaseRemoved: false, status: 'saved' as const, error: null, pending: null }
    update({ ...next, status: draftDirty(next) ? 'unsaved' : 'saved' })
    savedView(application)
    setLatest(null)
  }
  const save = async (): Promise<boolean> => {
    const current = state.current
    if (current.status === 'saving' || current.status === 'unknown' || newer || current.baseline.role !== 'applicant' || !current.baseline.workspace) return false
    const fields = { ...current.fields }
    const captured = Object.fromEntries(Object.entries(current.selections).map(([slot, selection]) => [slot, selection.id]))
    update({ ...current, status: 'saving', error: null })
    await Promise.all(slots.filter(slot => current.selections[slot]?.status === 'preparing').map(slot => preparations.current[slot]))
    if (!mounted.current) return false
    const documents = Object.fromEntries(slots.map(slot => [slot, { kind: 'saved', fileId: slot === 'purchase' && current.purchaseRemoved ? null : current.baseline.snapshot.documents[slot] }])) as DraftDocuments
    for (const slot of slots) {
      const selection = state.current.selections[slot]
      if (selection && selection.id === captured[slot] && selection.status === 'ready' && selection.attachment) documents[slot] = { kind: 'prepared', attachment: selection.attachment }
    }
    const command: SaveDraftOperation = current.pending && JSON.stringify(current.pending.fields) === JSON.stringify(fields) && current.pending.product === current.product && JSON.stringify(current.pending.documents) === JSON.stringify(documents) ? current.pending : {
      kind: 'saveDraft', datasetId: context.datasetId, applicationId: view.id, operationId: crypto.randomUUID(),
      expectedWorkspaceRevision: current.baseline.workspace.revision, product: current.product, fields, documents,
    }
    update({ ...state.current, pending: command, capturedSelections: captured })
    const result = await demo.execute(command)
    if (!mounted.current) return false
    if (result.ok) { acceptSaved(result.value.application, command, captured); return !draftDirty(state.current) }
    update({ ...state.current, status: result.error.kind === 'outcomeUnknown' ? 'unknown' : 'failed', error: result.error.kind })
    return false
  }
  const discardSelection = (slot: DocumentSlot) => {
    demo.cancelPreparation(view.id, slot); setPreview(null)
    const selections = { ...state.current.selections }; delete selections[slot]
    update({ ...state.current, selections, status: 'unsaved', error: null, pending: null })
  }
  const discard = () => {
    for (const slot of slots) demo.cancelPreparation(view.id, slot)
    setPreview(null); update(initialBuffer(view))
  }
  useEffect(() => {
    departure({ dirty, pending: buffer.status === 'saving' || Object.values(buffer.selections).some(selection => selection.status === 'preparing'), canSave: Object.values(buffer.selections).every(selection => selection.status === 'ready'), save, discard })
  }, [buffer, view, latest])
  const inspectOutcome = async () => {
    if (!state.current.pending) return
    setInspecting(true)
    const command = state.current.pending
    const result = await demo.inspectOperation(command)
    if (!mounted.current) return
    setInspecting(false)
    if (!result.ok) { update({ ...state.current, error: result.error.kind }); return }
    if (result.value.status === 'committed') acceptSaved(result.value.result.application, command, state.current.capturedSelections)
    else update({ ...state.current, status: 'failed', error: 'requestFailed' })
  }
  const inspectLatest = async () => {
    setInspecting(true)
    const result = await demo.readApplication(view.id)
    if (!mounted.current) return
    setInspecting(false)
    if (result.ok) setLatest(result.value)
    else update({ ...state.current, error: result.error.kind })
  }
  const switchProduct = (product: ProductId) => {
    const current = state.current
    if (product === current.product) return
    demo.cancelPreparation(view.id, 'purchase'); setPreview(null)
    const selections = { ...current.selections }; delete selections.purchase
    update({ ...current, product, selections, purchaseRemoved: current.purchaseRemoved || !!current.baseline.snapshot.documents.purchase, status: 'unsaved', pending: null, error: null })
    setChecked(true); setSwitchTo(null)
  }
  const applyLatest = (application: ApplicationView) => {
    const current = state.current
    update({ ...current, baseline: application, purchaseRemoved: current.purchaseRemoved || application.product !== current.product && !!application.snapshot.documents.purchase, status: 'unsaved', error: null, pending: null })
    setLatest(null); setReapplyConfirmation(null)
  }
  const cancelSwitch = () => {
    setSwitchTo(null); setReapplyConfirmation(null)
  }
  const openIssue = (target: ApplicationStep, id: string) => {
    if (target === step) document.getElementById(id)?.focus()
    else { focusTarget.current = id; changeStep(target) }
  }
  const renderField = (field: keyof Fields) => {
    const issue = checked ? fieldIssues.find(issue => issue.field === field) : undefined
    const id = fieldId(field)
    const props = { id, value: buffer.fields[field], 'aria-invalid': !!issue, 'aria-describedby': `${id}-hint${issue ? ` ${id}-error` : ''}`, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => update({ ...state.current, fields: { ...state.current.fields, [field]: event.target.value }, status: locked ? state.current.status : 'unsaved', pending: locked ? state.current.pending : null }) }
    const numeric = ['revenue', 'expenses', 'amount', 'budget', 'term'].includes(field)
    const hint = field === 'operatingSince' ? 'YYYY-MM' : field === 'term' ? products[buffer.product].terms.join(' / ') : field === 'explanation' ? t('rawHint') : numeric ? language === 'ar' ? 'مبلغ صحيح بالريال اليمني. تقبل الأرقام العربية والفواصل الصحيحة.' : 'Whole YER. Arabic-Indic digits and valid thousands grouping are accepted.' : field === 'email' ? language === 'ar' ? 'اختياري' : 'Optional' : ''
    return <div key={field}><label htmlFor={id}>{fieldLabels[field][language]}</label><p id={`${id}-hint`} className="text-[13px] text-muted">{hint}</p>
      {field === 'activity' ? <select {...props}>{Object.entries(activities).map(([value, label]) => <option value={value} key={value}>{label[language]}</option>)}</select>
        : field === 'explanation' || field === 'address' ? <textarea {...props} />
        : <input {...props} type="text" dir={numeric || ['mobile', 'email', 'operatingSince'].includes(field) ? 'ltr' : undefined} inputMode={numeric ? 'numeric' : field === 'mobile' ? 'tel' : field === 'email' ? 'email' : 'text'} />}
      {issue && <p id={`${id}-error`} className="text-danger-text">{issueMessage(issue)[language]}</p>}
    </div>
  }
  const shownIssues = checked && (fieldIssues.length > 0 || missingSlots.length > 0)
  const savedAt = savedTime(buffer.baseline)
  return <section className="draft-editor my-6" aria-labelledby="draft-heading">
    <h2 id="draft-heading">{t('edit')}</h2>
    {!savedAt && <p className="summary">{a('newHint')}</p>}
    <nav className="actions" aria-label={a('steps')}>{applicationSteps.map((item, index) => <a className="button secondary" key={item} href={`?step=${item}`} aria-current={step === item ? 'step' : undefined} onClick={event => { event.preventDefault(); changeStep(item) }}>{index + 1}. {a(item)}</a>)}</nav>
    <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(240px,1fr)] gap-6 narrow:grid-cols-1"><div className="panel">
      <h2 id="step-heading" tabIndex={-1}>{a(step)}</h2>
      {shownIssues && <div className="summary border-danger-border bg-danger-surface text-danger-text" id="validation-summary" role="alert" tabIndex={-1}><h3>{a('errors')}</h3><ul>{fieldIssues.map(issue => {
        const target = (Object.keys(stepFields) as Array<keyof typeof stepFields>).find(group => stepFields[group].includes(issue.field))!
        return <li key={issue.field}><a href={`?step=${target}#${fieldId(issue.field)}`} onClick={event => { event.preventDefault(); openIssue(target, fieldId(issue.field)) }}>{fieldLabels[issue.field][language]}: {issueMessage(issue)[language]}</a></li>
      })}{missingSlots.map(slot => <li key={slot}><a href={`?step=documents#${slot}-file`} onClick={event => { event.preventDefault(); openIssue('documents', `${slot}-file`) }}>{documentLabel(slot, buffer.product)[language]}: {a('missing')}</a></li>)}</ul></div>}
      {step === 'business' && <p className="text-[13px] text-muted">{a('financialHint')}</p>}
      {step === 'financing' && <><label htmlFor="draft-product">{a('product')}</label><select id="draft-product" ref={productControl} value={buffer.product} disabled={locked} onChange={event => {
        const product = event.target.value as ProductId
        if (product === buffer.product) return
        if (effectiveSaved('purchase') || buffer.selections.purchase) setSwitchTo(product)
        else switchProduct(product)
      }}>{Object.values(products).map(product => <option key={product.id} value={product.id}>{product.name[language]}</option>)}</select>{buffer.purchaseRemoved && <p role="status">{a('stagedRemoval')}</p>}</>}
      {step !== 'documents' && step !== 'review' && stepFields[step].map(renderField)}
      {step === 'documents' && slots.map(slot => {
        const selection = buffer.selections[slot]
        const savedFile = effectiveSaved(slot)
        const available = samples.filter(sample => sample.slot === slot && (slot !== 'purchase' || sample.product === buffer.product))
        const sampleId = sampleIds[slot] ?? ''
        return <section key={slot} aria-labelledby={`${slot}-heading`} className="mb-6 border-0 border-b border-solid border-border pb-6"><h3 id={`${slot}-heading`}>{documentLabel(slot, buffer.product)[language]}</h3><p>{documentRequirement(slot, buffer.product)[language]}</p><p id={`${slot}-hint`} className="text-[13px] text-muted">{t('fileHint')}</p>
          <label htmlFor={`${slot}-file`}>{t('chooseFile')}</label><input id={`${slot}-file`} type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={locked} aria-describedby={`${slot}-hint${selection?.error ? ` ${slot}-preparation-error` : ''}`} aria-invalid={!!selection?.error || checked && missingSlots.includes(slot)} onChange={event => { const file = event.target.files?.[0]; if (file) prepare(slot, { kind: 'local', file }, file.name); event.target.value = '' }} />
          {available.length === 0 && <button disabled={locked} onClick={() => prepare(slot, { kind: 'generated', fields: { ...buffer.fields } }, documentLabel(slot, buffer.product)[language])}>{t('useSample')}</button>}
          {available.length > 0 && <div className="sample-picker my-4 flex flex-wrap items-center gap-3"><label htmlFor={`${slot}-sample`}>{t('sample')}</label><select id={`${slot}-sample`} value={sampleId} onChange={event => setSampleIds({ ...sampleIds, [slot]: event.target.value })}>{available.map(sample => <option key={sample.id} value={sample.id}>{sample.variant === 'identical' ? language === 'ar' ? 'محتوى مطابق باسم آخر' : 'Identical content, another name' : sample.variant === 'original' ? documentLabel(slot, buffer.product)[language] : sample.variant}</option>)}</select><button disabled={!sampleId || locked} onClick={() => prepare(slot, { kind: 'sample', sampleId }, documentLabel(slot, buffer.product)[language])}>{t('useSample')}</button></div>}
          {selection && <div className="draft-feedback"><p><bdi dir="ltr" className="wrap-anywhere">{selection.name}</bdi>{selection.attachment && <small><bdi dir="ltr">{selection.attachment.mime} · {selection.attachment.size} B</bdi></small>}</p><p role="status">{t(selection.status === 'ready' ? 'ready' : selection.status === 'failed' ? 'preparationFailed' : 'preparing')}</p>{selection.status === 'preparing' && <progress max={100} value={selection.progress} aria-label={t('preparing')}>{selection.progress}%</progress>}{selection.error && <p id={`${slot}-preparation-error`} role="alert">{errors[selection.error][language]}</p>}<div className="actions">{selection.status === 'failed' && <button disabled={locked} onClick={() => prepare(slot, selection.source, selection.name)}>{t('retryPreparation')}</button>}{selection.status === 'ready' && <button onClick={() => setPreview({ slot, kind: 'ready' })}>{t('previewReady')}</button>}<button disabled={locked} onClick={() => discardSelection(slot)}>{t('discardSelection')}</button></div></div>}
          {savedFile ? <div className="draft-feedback"><p>{text.savedInDraft[language]}: <bdi dir="ltr" className="wrap-anywhere">{savedFile.name}</bdi><small><bdi dir="ltr">{savedFile.mime} · {savedFile.size} B</bdi></small></p><button onClick={() => setPreview({ slot, kind: 'saved' })}>{t('previewSaved')}</button></div> : <p>{text.missing[language]}</p>}
        </section>
      })}
      {step === 'review' && <><p>{a('reviewHint')}</p><h3>{products[buffer.product].name[language]}</h3><dl className="facts information">{Object.entries(buffer.fields).map(([key, value]) => <div key={key}><dt>{fieldLabels[key as keyof Fields][language]}</dt><dd><bdi dir={['mobile', 'email', 'operatingSince', 'amount', 'term', 'revenue', 'expenses', 'budget'].includes(key) ? 'ltr' : undefined}>{key === 'activity' ? activities[buffer.fields.activity]?.[language] : displayFieldValue(key as keyof Fields, value, language)}</bdi></dd></div>)}</dl><ul>{slots.map(slot => <li key={slot}>{documentLabel(slot, buffer.product)[language]}: <bdi dir="ltr">{buffer.selections[slot]?.name ?? effectiveSaved(slot)?.name ?? text.missing[language]}</bdi>{buffer.selections[slot] && <span> · {t(buffer.selections[slot]?.status === 'ready' ? 'ready' : buffer.selections[slot]?.status === 'preparing' ? 'preparing' : 'preparationFailed')}</span>}</li>)}</ul><button onClick={() => { setChecked(true); requestAnimationFrame(() => document.getElementById('validation-summary')?.focus()) }}>{a('check')}</button>{checked && !shownIssues && <p role="status">{a('valid')}</p>}</>}
      <div className="actions">{step !== 'personal' && <button onClick={() => changeStep(applicationSteps[applicationSteps.indexOf(step) - 1])}>{a('previous')}</button>}{step !== 'review' && <button onClick={() => changeStep(applicationSteps[applicationSteps.indexOf(step) + 1])}>{a('next')}</button>}</div>
    </div><aside className="summary self-start"><h2>{products[buffer.product].name[language]}</h2><p>{products[buffer.product].purpose[language]}</p><p><bdi dir="ltr">{money(products[buffer.product].minimum, language)} / {money(products[buffer.product].maximum, language)}</bdi></p><p><bdi dir="ltr">{products[buffer.product].terms.join(' / ')}</bdi> {text.months[language]}</p><p>{text.markup[language]}: <bdi dir="ltr">{products[buffer.product].markupPercent}%</bdi>. {a('once')}</p><p>{a('eligibility')}</p></aside></div>
    <div className="draft-feedback"><p role="status">{t(buffer.status)}</p><p>{t('lastSave')}: <bdi>{savedAt ? new Intl.DateTimeFormat(language === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(savedAt)) : a('noSave')}</bdi></p></div>
    {buffer.error && <p role="alert">{errors[buffer.error][language]}</p>}
    {buffer.status === 'unknown' ? <button disabled={inspecting} onClick={() => void inspectOutcome()}>{t('inspectOutcome')}</button> : <button disabled={buffer.status === 'saving' || inspecting || newer || buffer.error === 'staleWorkspace'} onClick={() => void save()}>{t('save')}</button>}
    {(newer || buffer.error === 'staleWorkspace') && <div className="summary"><p role="status">{t('newer')}</p><button disabled={inspecting || buffer.status === 'saving'} onClick={() => void inspectLatest()}>{t('loadLatest')}</button>{latest && <><p>{t('latestExplanation')}: {latest.snapshot.fields.explanation || text.emptyExplanation[language]}</p><dl className="facts">{Object.entries(latest.snapshot.fields).map(([field, value]) => <div key={field}><dt>{fieldLabels[field as keyof Fields][language]}</dt><dd>{value}</dd></div>)}</dl><p>{products[latest.product].name[language]}</p>{latest.documents.map(document => <p key={document.slot}>{documentLabel(document.slot, latest.product)[language]}: {document.file?.name ?? text.missing[language]}</p>)}<button ref={reapplyControl} onClick={() => { if (latest.product !== state.current.product && latest.snapshot.documents.purchase) setReapplyConfirmation(latest); else applyLatest(latest) }}>{t('reapply')}</button></>}</div>}
    <details className="draft-feedback demo-controls"><summary>{t('controls')}</summary><p>{t('controlScope')}</p><label><input type="checkbox" checked={controls.slow} onChange={event => { demo.setControls({ ...controls, slow: event.target.checked }); redrawControls(value => value + 1) }} />{t('slow')}</label><p>{t(controls.slow ? 'slowTiming' : 'normalTiming')}</p><label htmlFor="next-failure">{t('nextFailure')}</label><select id="next-failure" value={controls.failure ?? ''} onChange={event => { demo.setControls({ ...controls, failure: event.target.value ? event.target.value as 'upload' | 'save' | 'storage' : null }); redrawControls(value => value + 1) }}><option value="">{t('none')}</option><option value="upload">{t('uploadFailure')}</option><option value="save">{t('saveFailure')}</option><option value="storage">{t('storageFailure')}</option></select></details>
    {preview && <DocumentPreview demo={demo} applicationId={view.id} fileId={preview.kind === 'saved' ? effectiveSaved(preview.slot)?.id : undefined} attachment={preview.kind === 'ready' ? buffer.selections[preview.slot]?.attachment : undefined} language={language} close={() => setPreview(null)} />}
    {(switchTo || reapplyConfirmation) && <dialog ref={switchDialog} className="w-[650px]" aria-labelledby="switch-heading" onCancel={cancelSwitch}><h2 id="switch-heading">{a('switchTitle')}</h2><p>{documentLabel('purchase', reapplyConfirmation?.product ?? buffer.product)[language]}</p><p>{a('switchHint')}</p><div className="actions"><button onClick={cancelSwitch}>{a('cancel')}</button><button onClick={() => { if (reapplyConfirmation) applyLatest(reapplyConfirmation); else if (switchTo) switchProduct(switchTo) }}>{a('confirmSwitch')}</button></div></dialog>}
  </section>
}
