import { assignmentText } from './assignment-copy'
import { useEffect, useRef, useState } from 'react'
import type { Demo, ErrorKind, ReviewOperation } from '../demo'
import type { StaffView } from '../demo/types'
import { changedReviewChecks, currentCorrectionTargets, products, reviewDependencies, reviewRules, type ReviewCheck } from '../domain'
import type { DocumentSlot, Language } from '../domain/model'
import { AssignmentActions } from './assignment'
import { combineDeparture, type Departure } from './departure'
import { DocumentPreview } from './preview'
import { ApplicationInformation, PublicCorrections, PublicHistory } from './public-record'
import { date, documentLabel, errors, events, fieldLabels, money, outcomes, reviewChecks, text } from './i18n'
import { demoIdentities } from '../demo'
import { activityDescription, reviewText } from './review-copy'

export type ReviewBuffer = {
  note: string; replacement: { slot: DocumentSlot; text: string } | null;
  revision: number; intent: ReviewOperation | null; error: ErrorKind | null;
  inspectAfterReclaim?: boolean;
}
export const reviewDirty = (buffer: ReviewBuffer) => !!buffer.note || !!buffer.replacement || !!buffer.intent

export function ReviewWorkspace({ demo, datasetId, view, language, retained, remember, changed, departure }: {
  demo: Demo; datasetId: string; view: StaffView; language: Language; retained?: ReviewBuffer;
  remember: (buffer: ReviewBuffer) => void; changed: (view: StaffView) => void; departure: (work: Departure | null) => void;
}) {
  const [buffer] = useState<ReviewBuffer>(() => retained ?? { note: '', replacement: null, revision: view.sharedRevision, intent: null, error: null })
  const [, render] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const alive = useRef(true)
  const assignmentWork = useRef<Departure | null>(null)
  const reviewWork = useRef<Departure | null>(null)
  const departureRef = useRef(departure)
  departureRef.current = departure
  const t = (key: keyof typeof reviewText) => reviewText[key][language]
  const update = () => { remember(buffer); render(value => value + 1) }
  const publishDeparture = () => {
    if (!alive.current) return
    departureRef.current(combineDeparture(assignmentWork.current, reviewWork.current))
  }
  useEffect(() => {
    alive.current = true
    if (buffer.intent && !buffer.error) { buffer.error = 'outcomeUnknown'; update() }
    return () => { alive.current = false; reviewWork.current = null; assignmentWork.current = null; departureRef.current(null) }
  }, [])
  useEffect(() => { remember(buffer) }, [buffer, remember])
  const stale = buffer.revision !== view.sharedRevision && (reviewDirty(buffer) || buffer.inspectAfterReclaim)
  const blocked = busy || !!buffer.intent || stale
  const completed = (command: ReviewOperation) => {
    if (command.kind === 'saveNote' && buffer.note === command.text.ar) buffer.note = ''
    if (command.kind === 'assessDocument' && command.status === 'needsReplacement' && buffer.replacement?.slot === command.slot && buffer.replacement.text === command.reason?.ar) buffer.replacement = null
  }
  const run = async (command: ReviewOperation): Promise<boolean> => {
    buffer.intent = command; buffer.error = null; update(); setBusy(true); setMessage(false)
    const result = await demo.execute(command)
    if (!alive.current) return false
    setBusy(false)
    if (!result.ok) { buffer.error = result.error.kind; update(); return false }
    completed(command)
    buffer.intent = null; buffer.error = null; buffer.revision = result.value.application.sharedRevision
    if (result.value.application.role === 'reviewer') changed(result.value.application)
    update(); setMessage(true)
    return true
  }
  const base = () => ({ datasetId, applicationId: view.id, operationId: crypto.randomUUID(), expectedSharedRevision: view.sharedRevision })
  const saveNote = () => run({ ...base(), kind: 'saveNote', text: { ar: buffer.note, en: buffer.note } })
  const inspect = async () => {
    setBusy(true)
    const result = buffer.intent ? await demo.inspectOperation(buffer.intent) : await demo.readApplication(view.id)
    if (!alive.current) return
    setBusy(false)
    if (!result.ok) { buffer.error = result.error.kind; update(); return }
    const value = result.value
    const application = 'role' in value ? value : value.status === 'committed' ? value.result.application : value.application
    if ('status' in value && value.status === 'committed' && buffer.intent) { completed(buffer.intent); setMessage(true) }
    buffer.intent = null; buffer.error = null; buffer.revision = application.sharedRevision
    buffer.inspectAfterReclaim = application.role === 'reviewer' && !application.assignedToYou && application.status === 'underReview'
    if (application.role === 'reviewer') changed(application)
    update()
  }
  const canSave = view.permissions.saveNote && !!buffer.note.trim() && !buffer.replacement && !blocked
  useEffect(() => {
    if (!view.assignedToYou && view.status === 'underReview') buffer.inspectAfterReclaim = true
    if (!reviewDirty(buffer) && !buffer.inspectAfterReclaim) buffer.revision = view.sharedRevision
    reviewWork.current = {
      dirty: reviewDirty(buffer), pending: busy || buffer.error === 'outcomeUnknown',
      discard: () => { buffer.note = ''; buffer.replacement = null; buffer.intent = null; buffer.error = null; buffer.inspectAfterReclaim = false; buffer.revision = view.sharedRevision; update() },
      ...(view.permissions.saveNote && buffer.note && !buffer.replacement ? { canSave, save: saveNote, saveLabel: reviewText.saveLeave } : {}),
    }
    publishDeparture()
  }, [buffer.note, buffer.replacement?.slot, buffer.replacement?.text, buffer.intent, buffer.error, busy, view.sharedRevision, view.permissions.saveNote, canSave])
  const reviewerName = (actor: string) => demoIdentities.find(identity => identity.id === actor)?.name[language] ?? (language === 'ar' ? 'خالد علي' : 'Khaled Ali')
  useEffect(() => { if (preview && !view.documents.some(document => document.file?.id === preview)) setPreview(null) }, [preview, view.documents])
  const rules = reviewRules(view.snapshot.fields, view.product, view.submittedAt!)
  const latestRound = view.rounds.at(-1)
  const baseline = latestRound?.response ? latestRound.baseline : undefined
  const currentTargets = currentCorrectionTargets(view.rounds)
  const allAccepted = view.assessments && Object.values(view.assessments).every(assessment => assessment.status === 'accepted')
  const previewDocument = view.documents.find(document => document.file?.id === preview)
  const sections = [
    ['information', text.submittedInformation], ['documents', text.documents], ['checks', text.checks],
    ['verification', reviewText.verification], ['notes', text.notes], ['activity', text.activity],
  ] as const
  return <>
    <AssignmentActions demo={demo} datasetId={datasetId} view={view} language={language} changed={changed} departure={work => { assignmentWork.current = work; publishDeparture() }} />
    <nav aria-label={t('sections')} className="mb-6 flex flex-wrap gap-3">{sections.map(([id, label]) => <a key={id} href={`#review-${id}`} onClick={event => { event.preventDefault(); document.getElementById(`review-${id}`)?.focus(); document.getElementById(`review-${id}`)?.scrollIntoView({ block: 'start' }) }}>{label[language]}</a>)}</nav>
    <div className="summary mb-6" aria-busy={busy}>
      <p>{t('fictional')}</p><p>{t('readOnly')}</p>
      <p role="status" aria-live="polite">{busy ? t('working') : message ? t('saved') : ''}</p>
      {stale && <p>{t('changed')}</p>}
      {buffer.error && <p role="alert">{errors[buffer.error][language]}</p>}
      {(stale || buffer.error || buffer.intent) && <div className="actions"><button disabled={busy} onClick={() => void inspect()}>{buffer.error === 'staleRecord' ? assignmentText.latest[language] : t(buffer.intent ? 'inspect' : 'latest')}</button>
        {buffer.intent && ['storage', 'requestFailed'].includes(buffer.error ?? '') && !stale && <button disabled={busy} onClick={() => void run(buffer.intent!)}>{t('retry')}</button>}
      </div>}
    </div>
    <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(290px,1fr)] items-start gap-6 compact:grid-cols-1">
      <div className="flex min-w-0 flex-col gap-6">
        <section className="panel"><h2 id="review-information" tabIndex={-1}>{text.submittedInformation[language]}</h2><ApplicationInformation record={view} language={language} baseline={baseline} /></section>
        <section className="panel"><h2 id="review-documents" tabIndex={-1}>{text.documents[language]}</h2>{view.documents.map(document => <section key={document.slot} aria-labelledby={`document-${document.slot}`} className="border-0 border-b border-solid border-border py-4 last:border-b-0">
          <h3 id={`document-${document.slot}`}>{documentLabel(document.slot, view.product)[language]}</h3>{baseline && document.file && baseline.documents[document.slot] !== document.file.id && <p className="status">{t(baseline.documents[document.slot] ? 'replaced' : 'added')}</p>}
          <p>{document.file ? <><bdi dir="ltr" className="wrap-anywhere">{document.file.name}</bdi><br /><bdi>{document.file.mime} · {document.file.size} B</bdi><br />{text.included[language]}</> : text.missing[language]}</p>
          <p>{outcomes[view.assessments![document.slot].status][language]}{view.assessments![document.slot].reason && <span> · {view.assessments![document.slot].reason![language]}</span>}</p>
          {document.file && <div className="actions"><button className="secondary" onClick={() => setPreview(document.file!.id)}>{language === 'ar' ? 'معاينة' : 'Preview'} {documentLabel(document.slot, view.product)[language]}</button>
            {view.permissions.assessDocument && <><button disabled={blocked || !!buffer.replacement} onClick={() => void run({ ...base(), kind: 'assessDocument', slot: document.slot, fileId: document.file!.id, status: 'accepted', reason: null })}>{t('accept')}</button>
              <button className="secondary" disabled={blocked || !!buffer.replacement} onClick={() => { buffer.replacement = { slot: document.slot, text: '' }; update() }}>{t('replace')}</button></>}
          </div>}
          {buffer.replacement?.slot === document.slot && <div className="mt-4"><label className="mb-1.5 block font-semibold" htmlFor="replacement-reason">{t('reason')}</label><textarea className="review-textarea" id="replacement-reason" value={buffer.replacement.text} disabled={busy} readOnly={!view.permissions.assessDocument} onChange={event => { buffer.replacement!.text = event.target.value; update() }} />
            <div className="actions"><button disabled={blocked || !view.permissions.assessDocument || !buffer.replacement.text.trim()} onClick={() => void run({ ...base(), kind: 'assessDocument', slot: document.slot, fileId: document.file!.id, status: 'needsReplacement', reason: { ar: buffer.replacement!.text, en: buffer.replacement!.text } })}>{t('saveAssessment')}</button><button className="secondary" disabled={busy || !!buffer.intent} onClick={() => { buffer.replacement = null; update() }}>{t('cancel')}</button></div>
          </div>}
        </section>)}</section>
        <PublicCorrections record={view} language={language} preview={{ demo, applicationId: view.id }} />
        <PublicHistory history={view.history} language={language} />
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        <section className="panel"><h2 id="review-checks" tabIndex={-1}>{text.checks[language]}</h2>{baseline && <p>{t('resetChecks')}: {changedReviewChecks(baseline, view.snapshot).map(check => reviewChecks[check][language]).join('، ') || '0'}</p>}{(Object.keys(reviewDependencies) as ReviewCheck[]).map(check => {
          const canPass = check === 'evidence' ? allAccepted : check === 'purpose' || rules[check].passes
          const dependencies = reviewDependencies[check]
          return <fieldset key={check} className="m-0 mb-5 min-w-0 rounded-[10px] border border-solid border-border p-4"><legend>{reviewChecks[check][language]}</legend><strong>{outcomes[view.checks![check]][language]}</strong>
            <p>{t(check === 'operatingHistory' ? 'operating' : check)}</p>
            {check === 'operatingHistory' && <p>{t('months')}: <bdi>{rules.operatingHistory.months}</bdi></p>}
            {check === 'purpose' && <p>{products[view.product].purpose[language]}</p>}
            {check === 'budget' && <p><bdi dir="ltr"><bdi dir="ltr">{money(rules.budget.amount, language)}</bdi> ≤ <bdi dir="ltr">{money(rules.budget.budget, language)}</bdi></bdi></p>}
            {check === 'capacity' && <><p>{t('surplus')}: <bdi dir="ltr">{money(rules.capacity.surplus, language)}</bdi></p><p>{t('largest')}: <bdi dir="ltr">{money(rules.capacity.largestInstallment, language)}</bdi></p><p><bdi dir="ltr">5 × {rules.capacity.largestInstallment} ≤ 2 × {rules.capacity.surplus}</bdi></p></>}
            <p className="text-[12px] text-muted">{t('dependencies')}: {[...dependencies.fields.map(field => fieldLabels[field][language]), ...dependencies.documents.map(slot => documentLabel(slot, view.product)[language])].join('، ')}</p>
            {view.permissions.recordCheck && <div className="actions">{(['unchecked', 'passed', 'failed'] as const).map(outcome => <button className="secondary" key={outcome} disabled={blocked || !!buffer.replacement || outcome === 'passed' && !canPass} aria-pressed={view.checks![check] === outcome} onClick={() => void run({ ...base(), kind: 'recordCheck', check, outcome })}>{outcomes[outcome][language]}</button>)}</div>}
          </fieldset>
        })}</section>
        <section className="panel"><h2 id="review-verification" tabIndex={-1}>{t('verification')}</h2>{!view.rounds.length && <p>{t('noCorrections')}</p>}{view.rounds.map(round => <div key={round.id}><p><bdi>{date(round.requestedAt, language)}</bdi></p>{!round.response && <p>{t('waiting')}</p>}<ul>{round.targets.map((target, index) => <li key={index} className="mb-4"><strong>{target.kind === 'field' ? fieldLabels[target.field][language] : documentLabel(target.slot, view.product)[language]}</strong><p>{target.reason[language]}</p><span>{t(target.verified ? 'verified' : 'unverified')}</span>{round.response && <p>{t('changedTarget')}</p>}{!currentTargets.some(item => item.roundId === round.id && item.target === target) ? <p>{t('historical')}</p> : round.response && target.kind === 'field' && view.permissions.verifyCorrection && <div className="actions"><button disabled={blocked || !!buffer.replacement} onClick={() => void run({ ...base(), kind: 'verifyCorrection', roundId: round.id, field: target.field, verified: !target.verified })}>{t(target.verified ? 'undoField' : 'verifyField')}</button></div>}</li>)}</ul>{round.responseAssessments && <details><summary>{t('previousAssessments')}</summary><ul>{Object.entries(round.responseAssessments).map(([slot, assessment]) => <li key={slot}>{documentLabel(slot as DocumentSlot, view.product)[language]} · {outcomes[assessment.status][language]}{assessment.reason && <p>{assessment.reason[language]}</p>}</li>)}</ul></details>}</div>)}</section>
        <section className="panel"><h2 id="review-notes" tabIndex={-1}>{text.notes[language]}</h2><p>{t('private')}</p>{view.notes.length ? view.notes.map(note => <div key={note.id}><p className="whitespace-pre-wrap wrap-anywhere">{note.text[language]}</p><small>{reviewerName(note.actor)} · <bdi>{date(note.date, language)}</bdi></small></div>) : <p>{text.noNotes[language]}</p>}
          {(view.permissions.saveNote || buffer.note) && <><label className="mt-4 mb-1.5 block font-semibold" htmlFor="internal-note">{t('note')}</label><textarea className="review-textarea mb-3" id="internal-note" value={buffer.note} disabled={busy} readOnly={!view.permissions.saveNote} onChange={event => { buffer.note = event.target.value; update() }} /><button disabled={!canSave} onClick={() => void saveNote()}>{t('saveNote')}</button></>}
        </section>
        <section className="panel" aria-labelledby="review-activity"><h2 id="review-activity" tabIndex={-1}>{text.activity[language]}</h2><ol className="timeline">{view.activity.map(event => <li key={event.id}><strong>{events[event.kind][language]}</strong><bdi className="mt-[3px] mb-2 block text-[11px] text-muted">{date(event.date, language)}</bdi><span>{reviewerName(event.actor)}</span><p>{activityDescription(event, view.product, language)}</p></li>)}</ol></section>
      </div>
    </div>
    {preview && previewDocument && <DocumentPreview demo={demo} applicationId={view.id} fileId={preview} label={documentLabel(previewDocument.slot, view.product)} language={language} close={() => setPreview(null)} />}
  </>
}
