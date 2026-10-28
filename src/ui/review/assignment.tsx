import { useEffect, useRef, useState } from 'react'
import type { Demo, ErrorKind, ReviewIntent } from '../../demo'
import type { StaffView } from '../../demo/types'
import type { Language } from '../../domain/model'
import type { Departure } from '../shared/departure'
import { assignmentText } from './assignment-copy'
import { errors, text } from '../i18n'
import { containDialogFocus } from '../shared/dialog'

type TransferIntent = Extract<ReviewIntent, { kind: 'transferApplication' }>
type Pending = { intent: ReviewIntent; base: StaffView }

export function AssignmentActions({ demo, view, language, changed, departure }: {
  demo: Demo; view: StaffView; language: Language;
  changed: (view: StaffView) => void; departure: (work: Departure | null) => void;
}) {
  const [transfer, setTransfer] = useState<{ intent: TransferIntent; base: StaffView } | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ErrorKind | null>(null)
  const [message, setMessage] = useState<keyof typeof assignmentText | null>(null)
  const alive = useRef(true)
  const departureRef = useRef(departure)
  departureRef.current = departure
  const t = (key: keyof typeof assignmentText) => assignmentText[key][language]
  useEffect(() => () => { alive.current = false; departureRef.current(null) }, [])
  useEffect(() => {
    departureRef.current({ dirty: !!transfer || !!pending, pending: busy || error === 'outcomeUnknown', discard: () => { setTransfer(null); setPending(null); setError(null) } })
  }, [transfer, pending, busy, error])
  useEffect(() => {
    if (transfer && transfer.base.sharedRevision !== view.sharedRevision) {
      setTransfer(null); setMessage('changed')
    }
  }, [transfer, view.sharedRevision])
  const run = async (intent: ReviewIntent, base: StaffView = view) => {
    setTransfer(null); setPending({ intent, base }); setBusy(true); setError(null); setMessage(null)
    const result = await demo.attempt(intent, base)
    if (!alive.current) return
    setBusy(false)
    if (!result.ok) { setError(result.error.kind); return }
    const outcome = result.value
    if (outcome.status === 'committed') {
      if (outcome.result.application.role === 'reviewer') changed(outcome.result.application)
      setPending(null); setMessage('completed')
      return
    }
    if (outcome.status === 'unknown') { setError('outcomeUnknown'); return }
    setError(outcome.status === 'stale' ? outcome.cause : 'requestFailed')
  }
  const inspect = async () => {
    if (!pending) {
      setBusy(true)
      const result = await demo.readApplication(view.id)
      if (!alive.current) return
      setBusy(false)
      if (!result.ok) { setError(result.error.kind); return }
      if (result.value.role === 'reviewer') changed(result.value)
      setError(null); setMessage('loaded')
      return
    }
    setBusy(true)
    const result = await demo.inspectAttempt(pending.intent, pending.base)
    if (!alive.current) return
    setBusy(false)
    if (!result.ok) { setError(result.error.kind); return }
    const outcome = result.value
    const application = (outcome.status === 'committed' ? outcome.result.application : 'latest' in outcome ? outcome.latest : undefined) as StaffView | undefined
    if (application?.role === 'reviewer') changed(application)
    setPending(null); setError(null); setMessage(outcome.status === 'committed' ? 'completed' : 'loaded')
  }
  const command = (kind: 'claimApplication' | 'unassignApplication' | 'startReview'): ReviewIntent => ({ kind, applicationId: view.id })
  const blocked = busy || !!pending
  const permissions = view.permissions
  const final = view.status === 'approved' || view.status === 'rejected'
  return <section className="panel" aria-labelledby="assignment-heading" aria-busy={busy}>
    <h2 id="assignment-heading">{t('heading')}</h2>
    <p>{text.assignment[language]}: <span>{view.assignedToYou ? text.assignedToYou[language] : view.assignment?.[language] ?? text.unassigned[language]}</span></p>
    <p>{t(final ? 'locked' : view.status === 'submitted' ? 'separate' : view.status === 'correctionsRequested' ? 'corrections' : 'reviewing')}</p>
    {!view.assignedToYou && !final && <p>{t('readOnly')}</p>}
    <div className="actions">
      {permissions.claimApplication && <button disabled={blocked} onClick={() => void run(command('claimApplication'))}>{t('claim')}</button>}
      {permissions.transferApplication && <button className="secondary" disabled={blocked} onClick={() => setTransfer({ base: view, intent: { kind: 'transferApplication', applicationId: view.id, from: view.assignedToYou ? 'salma' : 'khaled', to: view.assignedToYou ? 'khaled' : 'salma', confirmed: true } })}>{t(view.assignedToYou ? 'transfer' : 'reclaim')}</button>}
      {permissions.unassignApplication && <button className="secondary" disabled={blocked} onClick={() => void run(command('unassignApplication'))}>{t('unassign')}</button>}
      {permissions.startReview && <button disabled={blocked} onClick={() => void run(command('startReview'))}>{t('start')}</button>}
    </div>
    <p role="status" aria-live="polite">{busy ? t('working') : message ? t(message) : ''}</p>
    {error && <div role="alert"><p>{errors[error][language]}</p>{pending && <div className="actions">
      <button disabled={busy} onClick={() => void inspect()}>{t(error === 'outcomeUnknown' ? 'inspect' : 'latest')}</button>
      {['storage', 'requestFailed'].includes(error) && <button disabled={busy} onClick={() => void run(pending.intent, pending.base)}>{t('retry')}</button>}
    </div>}</div>}
    {transfer && <TransferDialog command={transfer.intent} language={language} cancel={() => setTransfer(null)} confirm={() => void run(transfer.intent, transfer.base)} />}
  </section>
}

function TransferDialog({ command, language, cancel, confirm }: { command: TransferIntent; language: Language; cancel: () => void; confirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const t = (key: keyof typeof assignmentText) => assignmentText[key][language]
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.current?.showModal()
    return () => { requestAnimationFrame(() => { if (opener?.isConnected) opener.focus() }) }
  }, [])
  const names = { salma: { ar: 'سلمى ناصر', en: 'Salma Nasser' }, khaled: { ar: 'خالد علي', en: 'Khaled Ali' } }
  return <dialog ref={dialog} className="w-[650px]" aria-labelledby="transfer-heading" onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); cancel() }}>
    <h2 id="transfer-heading">{t('confirmHeading')}</h2>
    <p>{language === 'ar' ? `نقل المسؤولية من ${names[command.from].ar} إلى ${names[command.to].ar}؟` : `Transfer responsibility from ${names[command.from].en} to ${names[command.to].en}?`}</p>
    <p>{t('keepWork')}</p><div className="actions"><button className="secondary" onClick={cancel}>{t('cancel')}</button><button onClick={confirm}>{t('confirm')}</button></div>
  </dialog>
}
