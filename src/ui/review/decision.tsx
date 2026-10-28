import { assignmentText } from './assignment-copy'
import { useEffect, useRef, useState } from 'react'
import { demoIdentities, type Demo, type ErrorKind, type ReviewOperation } from '../../demo'
import type { StaffView } from '../../demo/types'
import { decisionReadiness, products } from '../../domain'
import type { Language } from '../../domain/model'
import { AssignmentActions } from './assignment'
import { combineDeparture, type Departure } from '../shared/departure'
import { decisionText } from './decision-copy'
import { documentLabel, errors, fieldLabels, money, reviewChecks, text } from '../i18n'
import { PublicHistory } from '../application/public-record'
import { containDialogFocus } from '../shared/dialog'

type DecisionCommand = Extract<ReviewOperation, { kind: 'approve' | 'reject' }>
export type DecisionBuffer = { reason: string; revision: number; intent: DecisionCommand | null; retry: DecisionCommand | null; error: ErrorKind | null }
export const decisionDirty = (buffer: DecisionBuffer) => !!buffer.reason || !!buffer.intent

export function Decision({ demo, datasetId, sessionId, view, language, retained, remember, changed, departure, go, queueSearch }: {
  demo: Demo; datasetId: string; sessionId: string; view: StaffView; language: Language; retained?: DecisionBuffer;
  remember: (buffer: DecisionBuffer) => void; changed: (view: StaffView) => void; departure: (work: Departure | null) => void;
  go: (path: string) => void; queueSearch: string;
}) {
  const [buffer] = useState<DecisionBuffer>(() => retained ?? { reason: '', revision: view.sharedRevision, intent: null, retry: null, error: null })
  const [, render] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<'saved' | 'retry' | null>(null)
  const [confirmation, setConfirmation] = useState<DecisionCommand | null>(null)
  const alive = useRef(true)
  const assignmentWork = useRef<Departure | null>(null)
  const decisionWork = useRef<Departure | null>(null)
  const departureRef = useRef(departure)
  departureRef.current = departure
  const t = (key: keyof typeof decisionText) => decisionText[key][language]
  const update = () => { remember(buffer); render(value => value + 1) }
  const publishDeparture = () => { if (alive.current) departureRef.current(combineDeparture(assignmentWork.current, decisionWork.current)) }
  const stale = decisionDirty(buffer) && buffer.revision !== view.sharedRevision
  const allowed = view.permissions.approve
  const blocked = busy || !!buffer.intent || stale || !allowed || !buffer.reason.trim()
  const readiness = decisionReadiness({ ...view, submitted: view.snapshot })
  useEffect(() => {
    alive.current = true
    if (buffer.intent && !buffer.error) { buffer.error = 'outcomeUnknown'; update() }
    return () => { alive.current = false; assignmentWork.current = null; decisionWork.current = null; departureRef.current(null) }
  }, [])
  useEffect(() => {
    if (!decisionDirty(buffer)) buffer.revision = view.sharedRevision
    decisionWork.current = { dirty: decisionDirty(buffer), pending: busy || buffer.error === 'outcomeUnknown', discard: () => {
      buffer.reason = ''; buffer.intent = null; buffer.retry = null; buffer.error = null; buffer.revision = view.sharedRevision; setConfirmation(null); update()
    } }
    publishDeparture()
  }, [buffer.reason, buffer.intent, buffer.error, busy, view.sharedRevision])
  useEffect(() => { if (confirmation && (confirmation.expectedSharedRevision !== view.sharedRevision || confirmation.confirmationSessionId !== sessionId || !allowed)) setConfirmation(null) }, [confirmation, view.sharedRevision, sessionId, allowed])
  const complete = (command: DecisionCommand) => {
    if (buffer.reason === command.reason.ar) buffer.reason = ''
    buffer.retry = null
    setMessage('saved')
  }
  const send = async (command: DecisionCommand) => {
    setConfirmation(null); buffer.intent = command; buffer.error = null; setMessage(null); setBusy(true); update()
    const result = await demo.execute(command)
    if (!alive.current) return
    setBusy(false)
    if (!result.ok) { buffer.error = result.error.kind; update(); return }
    complete(command)
    buffer.intent = null; buffer.error = null; buffer.revision = result.value.application.sharedRevision
    if (result.value.application.role === 'reviewer') changed(result.value.application)
    update()
  }
  const inspect = async () => {
    setConfirmation(null); setBusy(true)
    const result = buffer.intent ? await demo.inspectOperation(buffer.intent) : await demo.readApplication(view.id)
    if (!alive.current) return
    setBusy(false)
    if (!result.ok) { buffer.error = result.error.kind; update(); return }
    const value = result.value
    const application = 'role' in value ? value : value.status === 'committed' ? value.result.application : value.application
    if ('status' in value && value.status === 'committed' && buffer.intent) complete(buffer.intent)
    else if (buffer.intent) { buffer.retry = buffer.intent; setMessage('retry') }
    buffer.intent = null; buffer.error = null; buffer.revision = application.sharedRevision
    if (application.role === 'reviewer') changed(application)
    update()
  }
  const prepare = (kind: 'approve' | 'reject') => setConfirmation({ kind, datasetId, operationId: buffer.retry?.kind === kind && buffer.retry.reason.ar === buffer.reason && buffer.retry.reason.en === buffer.reason && buffer.retry.expectedSharedRevision === view.sharedRevision ? buffer.retry.operationId : crypto.randomUUID(), applicationId: view.id, expectedSharedRevision: view.sharedRevision, confirmationSessionId: sessionId, confirmed: true, reason: { ar: buffer.reason, en: buffer.reason } })
  return <>
    <a className="button secondary mb-6" href={`/staff/applications/${view.id}${queueSearch}`} onClick={event => { event.preventDefault(); go(`/staff/applications/${view.id}${queueSearch}`) }}>{t('back')}</a>
    <div className="mb-6"><AssignmentActions demo={demo} datasetId={datasetId} view={view} language={language} changed={changed} departure={work => { assignmentWork.current = work; publishDeparture() }} /></div>
    <section className="summary mb-6"><h2>{t('terms')}</h2><DecisionTerms view={view} language={language} /><p>{t('lock')}</p></section>
    <div className="grid grid-cols-2 gap-6 narrow:grid-cols-1">
      <section className="panel"><h2>{t('approval')}</h2>
        {readiness.canApprove ? <p>{t('ready')}</p> : <>
          {!!readiness.documents.length && <><h3>{t('documents')}</h3><ul>{readiness.documents.map(slot => <li key={slot}>{documentLabel(slot, view.product)[language]}</li>)}</ul></>}
          {!!readiness.checks.length && <><h3>{t('checks')}</h3><ul>{readiness.checks.map(check => <li key={check}>{reviewChecks[check][language]}</li>)}</ul></>}
          {!!readiness.corrections.length && <><h3>{t('corrections')}</h3><ul>{readiness.corrections.map(({ roundId, target }, index) => <li key={`${roundId}/${index}`}>{target.kind === 'field' ? fieldLabels[target.field][language] : documentLabel(target.slot, view.product)[language]}</li>)}</ul></>}
        </>}
      </section>
      <section className="panel"><h2>{t('rejection')}</h2><p>{t('rejectionRule')}</p>{readiness.canReject && <p>{t('failed')}</p>}</section>
    </div>
    <section className="panel mt-6" aria-labelledby="decision-heading" aria-busy={busy}>
      <h2 id="decision-heading">{t('title')}</h2><p>{t('instruction')}</p>
      {!allowed && <p>{t('readOnly')}</p>}
      <p role="status" aria-live="polite">{busy ? t('working') : message ? t(message) : ''}</p>
      {stale && <p role="alert">{t('changed')}</p>}
      {buffer.error && <p role="alert">{errors[buffer.error][language]}</p>}
      {(stale || buffer.intent || buffer.error) && <button disabled={busy} onClick={() => void inspect()}>{buffer.error === 'staleRecord' ? assignmentText.latest[language] : t(buffer.intent ? 'outcome' : 'latest')}</button>}
      <label className="mt-4 mb-1.5 block font-semibold" htmlFor="decision-reason">{t('reason')}</label>
      <textarea id="decision-reason" className="review-textarea" value={buffer.reason} disabled={busy || !!buffer.intent} readOnly={!allowed} onChange={event => { buffer.reason = event.target.value; setMessage(null); update() }} />
      <div className="actions"><button disabled={blocked || !readiness.canApprove} onClick={() => prepare('approve')}>{t('inspectApprove')}</button><button className="secondary" disabled={blocked || !readiness.canReject} onClick={() => prepare('reject')}>{t('inspectReject')}</button></div>
    </section>
    <div className="mt-6"><PublicHistory history={view.history} language={language} /></div>
    {confirmation && <DecisionConfirmation command={confirmation} view={view} language={language} cancel={() => setConfirmation(null)} confirm={() => void send(confirmation)} />}
  </>
}

function DecisionTerms({ view, language }: { view: StaffView; language: Language }) {
  return <><p><bdi>{view.id}</bdi> · {view.snapshot.fields.fullName} · {products[view.product].name[language]}</p><p><bdi dir="ltr">{money(view.snapshot.fields.amount, language)}</bdi> · <bdi>{view.snapshot.fields.term}</bdi> {text.months[language]}</p></>
}
function DecisionConfirmation({ command, view, language, cancel, confirm }: { command: DecisionCommand; view: StaffView; language: Language; cancel: () => void; confirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.current?.showModal()
    return () => { requestAnimationFrame(() => { if (opener?.isConnected) opener.focus() }) }
  }, [])
  return <dialog ref={dialog} className="w-[650px]" aria-labelledby="decision-confirm-heading" onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); cancel() }}>
    <h2 id="decision-confirm-heading">{decisionText[command.kind === 'approve' ? 'confirmApprove' : 'confirmReject'][language]}</h2>
    <p>{text.reviewer[language]}: {demoIdentities.find(identity => identity.id === 'salma')!.name[language]}</p>
    <DecisionTerms view={view} language={language} /><p className="whitespace-pre-wrap wrap-anywhere">{command.reason[language]}</p><p>{decisionText.lock[language]}</p>
    <div className="actions"><button className="secondary" onClick={cancel}>{decisionText.cancel[language]}</button><button onClick={confirm}>{decisionText.confirm[language]}</button></div>
  </dialog>
}
