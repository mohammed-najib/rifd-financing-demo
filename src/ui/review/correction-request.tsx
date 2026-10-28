import { assignmentText } from './assignment-copy'
import { useEffect, useRef, useState } from 'react'
import type { Demo, ErrorKind, ReviewIntent } from '../../demo'
import type { StaffView } from '../../demo/types'
import { correctionTargetsSchema, fieldsSchema, slots, type CorrectionTarget, type Language } from '../../domain/model'
import { products } from '../../domain'
import { combineDeparture, type Departure } from '../shared/departure'
import { AssignmentActions } from './assignment'
import { correctionText } from './correction-copy'
import { date, documentLabel, errors, fieldLabels, money, text } from '../i18n'
import { ApplicationInformation, PublicCorrections } from '../application/public-record'
import { activityDescription } from './review-copy'
import { containDialogFocus } from '../shared/dialog'

type RequestIntent = Extract<ReviewIntent, { kind: 'requestCorrections' }>
export type CorrectionBuffer = { targets: CorrectionTarget[]; base: StaffView; intent: RequestIntent | null; error: ErrorKind | null }
export const correctionDirty = (buffer: CorrectionBuffer) => !!buffer.targets.length || !!buffer.intent

export function CorrectionRequest({ demo, view, language, retained, remember, changed, departure, go, queueSearch }: {
  demo: Demo; view: StaffView; language: Language; retained?: CorrectionBuffer;
  remember: (buffer: CorrectionBuffer) => void; changed: (view: StaffView) => void; departure: (work: Departure | null) => void;
  go: (path: string) => void; queueSearch: string;
}) {
  const [buffer] = useState<CorrectionBuffer>(() => retained ?? { targets: [], base: view, intent: null, error: null })
  const [, render] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<'sent' | 'retry' | null>(null)
  const [confirmation, setConfirmation] = useState<{ intent: RequestIntent; base: StaffView } | null>(null)
  const alive = useRef(true)
  const assignmentWork = useRef<Departure | null>(null)
  const requestWork = useRef<Departure | null>(null)
  const departureRef = useRef(departure)
  departureRef.current = departure
  const t = (key: keyof typeof correctionText) => correctionText[key][language]
  const update = () => { remember(buffer); render(value => value + 1) }
  const publishDeparture = () => { if (alive.current) departureRef.current(combineDeparture(assignmentWork.current, requestWork.current)) }
  const stale = correctionDirty(buffer) && buffer.base.sharedRevision !== view.sharedRevision
  const allowed = view.permissions.requestCorrections
  const blocked = busy || !!buffer.intent || stale || !allowed
  useEffect(() => {
    alive.current = true
    if (buffer.intent && !buffer.error) { buffer.error = 'outcomeUnknown'; update() }
    return () => { alive.current = false; assignmentWork.current = null; requestWork.current = null; departureRef.current(null) }
  }, [])
  useEffect(() => {
    if (!correctionDirty(buffer)) buffer.base = view
    requestWork.current = { dirty: correctionDirty(buffer), pending: busy || buffer.error === 'outcomeUnknown', discard: () => {
      buffer.targets = []; buffer.intent = null; buffer.error = null; buffer.base = view; setConfirmation(null); update()
    } }
    publishDeparture()
  }, [buffer.targets, buffer.intent, buffer.error, busy, view.sharedRevision])
  useEffect(() => { if (confirmation && (confirmation.base.sharedRevision !== view.sharedRevision || !allowed)) setConfirmation(null) }, [confirmation, view.sharedRevision, allowed])
  const complete = (intent: RequestIntent) => {
    if (JSON.stringify(buffer.targets) === JSON.stringify(intent.targets)) buffer.targets = []
    setMessage('sent')
  }
  const send = async (intent: RequestIntent, base: StaffView) => {
    setConfirmation(null); buffer.intent = intent; buffer.error = null; setMessage(null); setBusy(true); update()
    const result = await demo.attempt(intent, base)
    if (!alive.current) return
    setBusy(false)
    if (!result.ok) { buffer.error = result.error.kind; update(); return }
    const outcome = result.value
    if (outcome.status === 'unknown') { buffer.error = 'outcomeUnknown'; update(); return }
    if (outcome.status !== 'committed') {
      buffer.intent = null
      buffer.error = outcome.status === 'stale' ? outcome.cause : 'requestFailed'
      update(); return
    }
    complete(intent)
    buffer.intent = null; buffer.error = null; buffer.base = outcome.result.application as StaffView
    if (outcome.result.application.role === 'reviewer') changed(outcome.result.application)
    update()
  }
  const inspect = async () => {
    setConfirmation(null); setBusy(true)
    const result = buffer.intent ? await demo.inspectAttempt(buffer.intent, buffer.base) : await demo.readApplication(view.id)
    if (!alive.current) return
    setBusy(false)
    if (!result.ok) { buffer.error = result.error.kind; update(); return }
    const value = result.value
    const application = ('role' in value ? value : value.status === 'committed' ? value.result.application : 'latest' in value ? value.latest : undefined) as StaffView | undefined
    if (!application) { buffer.error = 'requestFailed'; update(); return }
    if ('status' in value && value.status === 'committed' && buffer.intent) complete(buffer.intent)
    else if (buffer.intent) setMessage('retry')
    buffer.intent = null; buffer.error = null; buffer.base = application
    if (application.role === 'reviewer') changed(application)
    update()
  }
  const label = (target: CorrectionTarget) => target.kind === 'field' ? fieldLabels[target.field][language] : documentLabel(target.slot, view.product)[language]
  const options: CorrectionTarget[] = [...fieldsSchema.keyof().options.map(field => ({ kind: 'field' as const, field, reason: { ar: '', en: '' } })), ...slots.map(slot => ({ kind: 'document' as const, slot, reason: { ar: '', en: '' } }))]
  const key = (target: CorrectionTarget) => target.kind === 'field' ? `field-${target.field}` : `document-${target.slot}`
  return <>
    <a className="button secondary ms-3 mb-6" href={`/staff/applications/${view.id}${queueSearch}`} onClick={event => { event.preventDefault(); go(`/staff/applications/${view.id}${queueSearch}`) }}>{t('back')}</a>
    <div className="mb-6"><AssignmentActions demo={demo} view={view} language={language} changed={changed} departure={work => { assignmentWork.current = work; publishDeparture() }} /></div>
    <details className="panel mb-6"><summary>{text.submittedInformation[language]}</summary><ApplicationInformation record={view} language={language} /><ul>{view.documents.map(document => <li key={document.slot}>{documentLabel(document.slot, view.product)[language]}: {document.file ? <bdi dir="ltr" className="wrap-anywhere">{document.file.name}</bdi> : text.missing[language]}</li>)}</ul></details>
    <details className="panel mb-6"><summary>{text.activity[language]}</summary><ol className="timeline">{view.activity.map(event => <li key={event.id}><bdi>{date(event.date, language)}</bdi><p className="whitespace-pre-wrap wrap-anywhere">{activityDescription(event, view.product, language)}</p></li>)}</ol></details>
    <section className="panel" aria-labelledby="correction-heading" aria-busy={busy}>
      <h2 id="correction-heading">{t('request')}</h2><p>{t('instruction')}</p><p>{t('pause')}</p>
      {!allowed && <p>{t('readOnly')}</p>}
      <p role="status" aria-live="polite">{busy ? t('working') : message ? t(message) : ''}</p>
      {stale && <p role="alert">{t('changed')}</p>}
      {buffer.error && <p role="alert">{errors[buffer.error][language]}</p>}
      {(stale || buffer.intent || buffer.error) && <button disabled={busy} onClick={() => void inspect()}>{buffer.error === 'staleRecord' ? assignmentText.latest[language] : t(buffer.intent ? 'outcome' : 'latest')}</button>}
      {(allowed || correctionDirty(buffer)) && <>
        {(['field', 'document'] as const).map(kind => <fieldset key={kind} className="m-0 my-5 min-w-0 rounded-card border border-solid border-border p-4"><legend>{t(kind === 'field' ? 'fields' : 'documents')}</legend>
          {options.filter(option => option.kind === kind).map(option => {
            const target = buffer.targets.find(target => key(target) === key(option))
            return <div className="mb-4" key={key(option)}><label className="flex items-center gap-3"><input type="checkbox" checked={!!target} disabled={blocked} onChange={event => {
              buffer.targets = event.target.checked ? [...buffer.targets, option] : buffer.targets.filter(target => key(target) !== key(option)); setMessage(null); update()
            }} />{label(option)}</label>
              {target && <><label className="mt-3 mb-1.5 block font-semibold" htmlFor={`reason-${key(option)}`}>{t('reason')}: {label(option)}</label><textarea id={`reason-${key(option)}`} className="review-textarea" value={target.reason[language]} disabled={busy || !!buffer.intent} readOnly={!allowed} onChange={event => {
                const value = event.target.value
                buffer.targets = buffer.targets.map(current => key(current) === key(option) ? { ...current, reason: { ar: value, en: value } } : current); setMessage(null); update()
              }} /></>}
            </div>
          })}
        </fieldset>)}
        <button disabled={blocked || !correctionTargetsSchema.safeParse(buffer.targets).success} onClick={() => setConfirmation({ base: view, intent: { kind: 'requestCorrections', applicationId: view.id, targets: structuredClone(buffer.targets), confirmed: true } })}>{t('inspect')}</button>
      </>}
    </section>
    {!allowed && <PublicCorrections record={view} language={language} />}
    {confirmation && <RequestConfirmation command={confirmation.intent} view={view} language={language} cancel={() => setConfirmation(null)} confirm={() => void send(confirmation.intent, confirmation.base)} />}
  </>
}

function RequestConfirmation({ command, view, language, cancel, confirm }: { command: RequestIntent; view: StaffView; language: Language; cancel: () => void; confirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const t = (key: keyof typeof correctionText) => correctionText[key][language]
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.current?.showModal()
    return () => { requestAnimationFrame(() => { if (opener?.isConnected) opener.focus() }) }
  }, [])
  return <dialog ref={dialog} className="w-[650px]" aria-labelledby="request-confirm-heading" onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); cancel() }}>
    <h2 id="request-confirm-heading">{t('confirmHeading')}</h2><p><bdi>{view.id}</bdi> · {view.snapshot.fields.fullName} · {products[view.product].name[language]}</p>
    <p><bdi dir="ltr">{money(view.snapshot.fields.amount, language)}</bdi> · <bdi>{view.snapshot.fields.term}</bdi> {text.months[language]}</p>
    <ul>{command.targets.map((target, index) => <li key={index}><strong>{target.kind === 'field' ? fieldLabels[target.field][language] : documentLabel(target.slot, view.product)[language]}</strong><p className="whitespace-pre-wrap wrap-anywhere">{target.reason[language]}</p></li>)}</ul>
    <p>{t('pause')}</p><div className="actions"><button className="secondary" onClick={cancel}>{t('cancel')}</button><button onClick={confirm}>{t('confirm')}</button></div>
  </dialog>
}
