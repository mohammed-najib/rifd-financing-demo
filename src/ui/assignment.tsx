import { useEffect, useRef, useState } from 'react'
import type { Demo, ErrorKind, ReviewOperation } from '../demo'
import type { StaffView } from '../demo/types'
import type { Language } from '../domain/model'
import type { Departure } from './departure'
import { assignmentText } from './assignment-copy'
import { errors, text } from './i18n'
import { containDialogFocus } from './dialog'

type Transfer = Extract<ReviewOperation, { kind: 'transferApplication' }>

export function AssignmentActions({ demo, datasetId, view, language, changed, departure }: {
  demo: Demo; datasetId: string; view: StaffView; language: Language;
  changed: (view: StaffView) => void; departure: (work: Departure | null) => void;
}) {
  const [transfer, setTransfer] = useState<Transfer | null>(null)
  const [intent, setIntent] = useState<ReviewOperation | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ErrorKind | null>(null)
  const [message, setMessage] = useState<keyof typeof assignmentText | null>(null)
  const alive = useRef(true)
  const departureRef = useRef(departure)
  departureRef.current = departure
  const t = (key: keyof typeof assignmentText) => assignmentText[key][language]
  useEffect(() => () => { alive.current = false; departureRef.current(null) }, [])
  useEffect(() => {
    departureRef.current({ dirty: !!transfer || !!intent, pending: busy || error === 'outcomeUnknown', discard: () => { setTransfer(null); setIntent(null); setError(null) } })
  }, [transfer, intent, busy, error])
  useEffect(() => {
    if (transfer && transfer.expectedSharedRevision !== view.sharedRevision) {
      setTransfer(null); setMessage('changed')
    }
  }, [transfer, view.sharedRevision])
  const run = async (command: ReviewOperation) => {
    setTransfer(null); setIntent(command); setBusy(true); setError(null); setMessage(null)
    const result = await demo.execute(command)
    if (!alive.current) return
    setBusy(false)
    if (!result.ok) { setError(result.error.kind); return }
    if (result.value.application.role === 'reviewer') changed(result.value.application)
    setIntent(null); setMessage('completed')
  }
  const inspect = async () => {
    if (!intent) return
    setBusy(true)
    const result = await demo.inspectOperation(intent)
    if (!alive.current) return
    setBusy(false)
    if (!result.ok) { setError(result.error.kind); return }
    const application = result.value.status === 'committed' ? result.value.result.application : result.value.application
    if (application.role === 'reviewer') changed(application)
    setIntent(null); setError(null); setMessage(result.value.status === 'committed' ? 'completed' : 'loaded')
  }
  const command = (kind: 'claimApplication' | 'unassignApplication' | 'startReview'): ReviewOperation => ({ kind, datasetId, operationId: crypto.randomUUID(), applicationId: view.id, expectedSharedRevision: view.sharedRevision })
  const blocked = busy || !!intent
  const permissions = view.permissions
  const final = view.status === 'approved' || view.status === 'rejected'
  return <section className="panel" aria-labelledby="assignment-heading" aria-busy={busy}>
    <h2 id="assignment-heading">{t('heading')}</h2>
    <p>{text.assignment[language]}: <span>{view.assignedToYou ? text.assignedToYou[language] : view.assignment?.[language] ?? text.unassigned[language]}</span></p>
    <p>{t(final ? 'locked' : view.status === 'submitted' ? 'separate' : view.status === 'correctionsRequested' ? 'corrections' : 'reviewing')}</p>
    {!view.assignedToYou && !final && <p>{t('readOnly')}</p>}
    <div className="actions">
      {permissions.claimApplication && <button disabled={blocked} onClick={() => void run(command('claimApplication'))}>{t('claim')}</button>}
      {permissions.transferApplication && <button className="secondary" disabled={blocked} onClick={() => setTransfer({ kind: 'transferApplication', datasetId, operationId: crypto.randomUUID(), applicationId: view.id, expectedSharedRevision: view.sharedRevision, from: view.assignedToYou ? 'salma' : 'khaled', to: view.assignedToYou ? 'khaled' : 'salma', confirmed: true })}>{t(view.assignedToYou ? 'transfer' : 'reclaim')}</button>}
      {permissions.unassignApplication && <button className="secondary" disabled={blocked} onClick={() => void run(command('unassignApplication'))}>{t('unassign')}</button>}
      {permissions.startReview && <button disabled={blocked} onClick={() => void run(command('startReview'))}>{t('start')}</button>}
    </div>
    <p role="status" aria-live="polite">{busy ? t('working') : message ? t(message) : ''}</p>
    {error && <div role="alert"><p>{errors[error][language]}</p>{intent && <div className="actions">
      <button disabled={busy} onClick={() => void inspect()}>{t(error === 'outcomeUnknown' ? 'inspect' : 'latest')}</button>
      {['storage', 'requestFailed'].includes(error) && intent.expectedSharedRevision === view.sharedRevision && <button disabled={busy} onClick={() => void run(intent)}>{t('retry')}</button>}
    </div>}</div>}
    {transfer && <TransferDialog command={transfer} language={language} cancel={() => setTransfer(null)} confirm={() => void run(transfer)} />}
  </section>
}

function TransferDialog({ command, language, cancel, confirm }: { command: Transfer; language: Language; cancel: () => void; confirm: () => void }) {
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
