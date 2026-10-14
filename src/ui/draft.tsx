import { useEffect, useRef, useState } from 'react'
import type { ApplicationView, Context, Demo, DraftDocuments, ErrorKind, PreparedAttachment, Preparation, Result, SaveDraftOperation } from '../demo'
import type { Language, Sample } from '../domain/model'
import { DocumentPreview } from './preview'
import { documentLabel, draftText, errors, fieldLabels, text } from './i18n'

type Selection = { id: string; source: Preparation['source']; name: string; status: 'preparing' | 'ready' | 'failed'; progress: number; attachment?: PreparedAttachment; error?: ErrorKind }
export type DraftBuffer = {
  explanation: string; baseline: ApplicationView; selection: Selection | null;
  status: 'unsaved' | 'saving' | 'saved' | 'failed' | 'unknown'; error: ErrorKind | null;
  pending: SaveDraftOperation | null; capturedSelection: string | null;
}
export type Departure = { dirty: boolean; pending: boolean; canSave: boolean; save: () => Promise<boolean>; discard: () => void }
const savedTime = (view: ApplicationView) => view.role === 'applicant' ? view.workspace?.savedAt : null
export const draftDirty = (buffer: DraftBuffer) => buffer.explanation !== buffer.baseline.snapshot.fields.explanation || !!buffer.selection || buffer.status === 'unknown'

export function DraftEditor({ demo, view, context, language, retained, remember, departure, savedView }: {
  demo: Demo; view: ApplicationView; context: Context; language: Language;
  retained?: DraftBuffer; remember: (value: DraftBuffer) => void; departure: (value: Departure | null) => void;
  savedView: (value: ApplicationView) => void;
}) {
  const initial: DraftBuffer = retained ?? { explanation: view.snapshot.fields.explanation, baseline: view, selection: null, status: 'saved', error: null, pending: null, capturedSelection: null }
  const [buffer, render] = useState(initial)
  const state = useRef(initial)
  const mounted = useRef(true)
  const pendingPreparation = useRef<Promise<Result<PreparedAttachment>> | null>(null)
  const [samples, setSamples] = useState<Sample[]>([])
  const [sampleId, setSampleId] = useState('')
  const [preview, setPreview] = useState<'saved' | 'ready' | null>(null)
  const [latest, setLatest] = useState<ApplicationView | null>(null)
  const [inspecting, setInspecting] = useState(false)
  const [, redrawControls] = useState(0)
  const controls = demo.controls()
  const t = (key: keyof typeof draftText) => draftText[key][language]
  const update = (next: DraftBuffer) => { state.current = next; remember(next); if (mounted.current) render(next) }
  const dirty = draftDirty(buffer)
  const savedFile = buffer.baseline.documents.find(document => document.slot === 'purchase')?.file
  const newer = view.role === 'applicant' && buffer.baseline.role === 'applicant' && !!view.workspace && !!buffer.baseline.workspace && view.workspace.revision > buffer.baseline.workspace.revision
  useEffect(() => {
    if (preview === 'saved' && savedFile && !view.documents.some(document => document.file?.id === savedFile.id)) setPreview(null)
  }, [preview, savedFile, view])
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      demo.cancelPreparation(view.id, 'purchase')
      const current = state.current
      const selection = current.selection?.status === 'preparing' ? { ...current.selection, status: 'failed' as const, error: 'sessionExpired' as const } : current.selection
      remember({ ...current, selection, status: current.status === 'saving' ? current.pending ? 'unknown' : 'failed' : current.status })
      departure(null)
    }
    // Only the mounted editing context owns pending results.
  }, [])
  useEffect(() => {
    let active = true
    void demo.listSamples(view.id).then(result => {
      if (!active || !result.ok) return
      const available = result.value.filter(sample => sample.slot === 'purchase')
      setSamples(available); setSampleId(available[0]?.id ?? '')
    })
    return () => { active = false }
  }, [demo, view.id])
  useEffect(() => {
    if (newer && !draftDirty(state.current) && view.status === 'draft') update({ ...state.current, baseline: view, explanation: view.snapshot.fields.explanation, status: 'saved', error: null, pending: null })
    // A changed saved view must not replace a dirty buffer.
  }, [view])

  const prepare = (source: Preparation['source'], name: string) => {
    if (state.current.status === 'saving' || state.current.status === 'unknown') return
    setPreview(null)
    const id = crypto.randomUUID()
    update({ ...state.current, selection: { id, source, name, status: 'preparing', progress: 0 }, status: 'unsaved', error: null, pending: null })
    const promise = demo.prepareAttachment({ datasetId: context.datasetId, applicationId: view.id, slot: 'purchase', selectionId: id, source }, progress => {
      if (mounted.current && state.current.selection?.id === id) update({ ...state.current, selection: { ...state.current.selection, progress } })
    })
    pendingPreparation.current = promise
    void promise.then(result => {
      if (!mounted.current || state.current.selection?.id !== id) return
      const selection = state.current.selection
      update({ ...state.current, selection: result.ok ? { ...selection, status: 'ready', progress: 100, name: result.value.name, attachment: result.value } : { ...selection, status: 'failed', error: result.error.kind } })
    })
  }
  const acceptSaved = (application: ApplicationView, command: SaveDraftOperation, capturedSelection: string | null) => {
    const current = state.current
    const selection = command.documents.purchase.kind === 'prepared' && current.selection?.id === capturedSelection && application.snapshot.documents.purchase === command.documents.purchase.attachment.id ? null : current.selection
    const remaining = current.explanation !== application.snapshot.fields.explanation || !!selection
    update({ ...current, baseline: application, selection, status: remaining ? 'unsaved' : 'saved', error: null, pending: null })
    savedView(application)
    setLatest(null)
  }
  const save = async (): Promise<boolean> => {
    const current = state.current
    if (current.status === 'saving' || current.status === 'unknown' || newer || current.baseline.role !== 'applicant' || !current.baseline.workspace) return false
    const explanation = current.explanation
    const selectionId = current.selection?.id ?? null
    update({ ...current, status: 'saving', error: null })
    if (current.selection?.status === 'preparing') await pendingPreparation.current
    if (!mounted.current) return false
    const ready = state.current.selection?.id === selectionId && state.current.selection.status === 'ready' ? state.current.selection.attachment : null
    const baseline = current.baseline
    const documents = Object.fromEntries(Object.entries(baseline.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as DraftDocuments
    if (ready) documents.purchase = { kind: 'prepared', attachment: ready }
    const command: SaveDraftOperation = current.pending && current.pending.fields.explanation === explanation && current.capturedSelection === selectionId ? current.pending : {
      kind: 'saveDraft', datasetId: context.datasetId, applicationId: view.id, operationId: crypto.randomUUID(),
      expectedWorkspaceRevision: baseline.workspace!.revision, product: baseline.product,
      fields: { ...baseline.snapshot.fields, explanation }, documents,
    }
    update({ ...state.current, pending: command, capturedSelection: selectionId })
    const result = await demo.execute(command)
    if (!mounted.current) return false
    if (result.ok) { acceptSaved(result.value.application, command, selectionId); return !draftDirty(state.current) }
    update({ ...state.current, status: result.error.kind === 'outcomeUnknown' ? 'unknown' : 'failed', error: result.error.kind })
    return false
  }
  const discardSelection = () => {
    demo.cancelPreparation(view.id, 'purchase'); setPreview(null)
    update({ ...state.current, selection: null, status: state.current.explanation === state.current.baseline.snapshot.fields.explanation ? 'saved' : 'unsaved', error: null, pending: null })
  }
  const discard = () => {
    demo.cancelPreparation(view.id, 'purchase'); setPreview(null)
    update({ ...state.current, explanation: view.snapshot.fields.explanation, baseline: view, selection: null, status: 'saved', error: null, pending: null })
  }
  useEffect(() => {
    departure({ dirty, pending: buffer.status === 'saving' || buffer.selection?.status === 'preparing', canSave: !buffer.selection || buffer.selection.status === 'ready', save, discard })
    // Publish the current editing state to the application's departure guard.
  }, [buffer, view, latest])

  const inspectOutcome = async () => {
    if (!state.current.pending) return
    setInspecting(true)
    const command = state.current.pending
    const result = await demo.inspectOperation(command)
    if (!mounted.current) return
    setInspecting(false)
    if (!result.ok) { update({ ...state.current, error: result.error.kind }); return }
    if (result.value.status === 'committed') acceptSaved(result.value.result.application, command, state.current.capturedSelection)
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

  return <section className="panel draft-editor" aria-labelledby="draft-heading">
    <h2 id="draft-heading">{t('edit')}</h2>
    <label htmlFor="purchase-explanation">{fieldLabels.explanation[language]}</label>
    <p id="explanation-hint" className="input-hint">{t('rawHint')}</p>
    <textarea id="purchase-explanation" aria-describedby="explanation-hint" value={buffer.explanation} onChange={event => update({ ...state.current, explanation: event.target.value, status: state.current.status === 'saving' || state.current.status === 'unknown' ? state.current.status : 'unsaved', pending: state.current.status === 'unknown' || state.current.status === 'saving' ? state.current.pending : null })} />
    <h3>{documentLabel('purchase', view.product)[language]}</h3><p>{t('requirement')}</p>
    <p id="file-hint" className="input-hint">{t('fileHint')}</p>
    <label htmlFor="purchase-file">{t('chooseFile')}</label>
    <input id="purchase-file" type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={buffer.status === 'saving' || buffer.status === 'unknown'} aria-describedby={`file-hint${buffer.selection?.error ? ' preparation-error' : ''}`} aria-invalid={!!buffer.selection?.error} onChange={event => { const file = event.target.files?.[0]; if (file) prepare({ kind: 'local', file }, file.name); event.target.value = '' }} />
    <div className="sample-picker"><label htmlFor="purchase-sample">{t('sample')}</label><select id="purchase-sample" value={sampleId} onChange={event => setSampleId(event.target.value)}>{samples.map(sample => <option key={sample.id} value={sample.id}>{sample.variant === 'identical' ? language === 'ar' ? 'محتوى مطابق باسم آخر' : 'Identical content, another name' : language === 'ar' ? 'نموذج افتراضي لخطة المخزون' : 'Fictional stock plan'}</option>)}</select><button disabled={!sampleId || buffer.status === 'saving' || buffer.status === 'unknown'} onClick={() => prepare({ kind: 'sample', sampleId }, documentLabel('purchase', view.product)[language])}>{t('useSample')}</button></div>
    {buffer.selection && <div className="selection-state">
      <p><bdi dir="ltr" className="filename">{buffer.selection.name}</bdi></p>
      <p role="status">{t(buffer.selection.status === 'ready' ? 'ready' : buffer.selection.status === 'failed' ? 'preparationFailed' : 'preparing')}</p>
      {buffer.selection.status === 'preparing' && <progress max={100} value={buffer.selection.progress} aria-label={t('preparing')}>{buffer.selection.progress}%</progress>}
      {buffer.selection.error && <p id="preparation-error" role="alert">{errors[buffer.selection.error][language]}</p>}
      <div className="actions">{buffer.selection.status === 'failed' && <button disabled={buffer.status === 'saving' || buffer.status === 'unknown'} onClick={() => prepare(buffer.selection!.source, buffer.selection!.name)}>{t('retryPreparation')}</button>}
        {buffer.selection.status === 'ready' && <button onClick={() => setPreview('ready')}>{t('previewReady')}</button>}
        <button disabled={buffer.status === 'saving' || buffer.status === 'unknown'} onClick={discardSelection}>{t('discardSelection')}</button></div>
    </div>}
    {savedFile && <div className="saved-file"><p>{text.savedInDraft[language]}: <bdi dir="ltr" className="filename">{savedFile.name}</bdi></p><button onClick={() => setPreview('saved')}>{t('previewSaved')}</button></div>}
    <div className="save-feedback"><p role="status">{t(buffer.status)}</p><p>{t('lastSave')}: <bdi>{new Intl.DateTimeFormat(language === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(savedTime(buffer.baseline)!))}</bdi></p></div>
    {buffer.error && <p role="alert">{errors[buffer.error][language]}</p>}
    {buffer.status === 'unknown' ? <button disabled={inspecting} onClick={() => void inspectOutcome()}>{t('inspectOutcome')}</button> : <button disabled={buffer.status === 'saving' || inspecting || newer || buffer.error === 'staleWorkspace'} onClick={() => void save()}>{t('save')}</button>}
    {(newer || buffer.error === 'staleWorkspace') && <div className="summary"><p role="status">{t('newer')}</p><button disabled={inspecting || buffer.status === 'saving'} onClick={() => void inspectLatest()}>{t('loadLatest')}</button>
      {latest && <><p>{t('latestExplanation')}: {latest.snapshot.fields.explanation || text.emptyExplanation[language]}</p><p>{latest.documents.find(document => document.slot === 'purchase')?.file?.name}</p><button onClick={() => { update({ ...state.current, baseline: latest, status: 'unsaved', error: null, pending: null }); setLatest(null) }}>{t('reapply')}</button></>}
    </div>}
    <details className="demo-controls"><summary>{t('controls')}</summary><p>{t('controlScope')}</p><label><input type="checkbox" checked={controls.slow} onChange={event => { demo.setControls({ ...controls, slow: event.target.checked }); redrawControls(value => value + 1) }} />{t('slow')}</label><p>{t(controls.slow ? 'slowTiming' : 'normalTiming')}</p><label htmlFor="next-failure">{t('nextFailure')}</label><select id="next-failure" value={controls.failure ?? ''} onChange={event => { demo.setControls({ ...controls, failure: event.target.value ? event.target.value as 'upload' | 'save' | 'storage' : null }); redrawControls(value => value + 1) }}><option value="">{t('none')}</option><option value="upload">{t('uploadFailure')}</option><option value="save">{t('saveFailure')}</option><option value="storage">{t('storageFailure')}</option></select></details>
    {preview && <DocumentPreview demo={demo} applicationId={view.id} fileId={preview === 'saved' ? savedFile?.id : undefined} attachment={preview === 'ready' ? buffer.selection?.attachment : undefined} language={language} close={() => setPreview(null)} />}
  </section>
}
