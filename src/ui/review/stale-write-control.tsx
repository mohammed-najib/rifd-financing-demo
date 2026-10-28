import { useEffect, useRef, useState } from 'react'
import type { Demo, ErrorKind, ReviewOperation } from '../../demo'
import type { StaffView } from '../../demo/types'
import type { Language } from '../../domain/model'
import type { Departure } from '../shared/departure'
import { assignmentText } from './assignment-copy'
import { errors } from '../i18n'

type Transfer = Extract<ReviewOperation, { kind: 'transferApplication' }>
const copy = {
  heading: { ar: 'تجربة تعارض المراجعة', en: 'Review conflict demo' },
  simulate: { ar: 'محاكاة إسناد الطلب إلى خالد', en: 'Simulate reassignment to Khaled' },
  explanation: { ar: 'ينقل هذا التحكم التجريبي الطلب إلى خالد مع إبقاء هذا العرض قديمًا لتجربة رفض الحفظ.', en: 'This demo control transfers the application to Khaled and holds this view stale to demonstrate a refused write.' },
  held: { ar: 'بقي هذا العرض قديمًا. جرّب إجراء مراجعة، ثم حمّل الأحدث. سيبقى النص غير المطبق. استرد الطلب بتأكيد النقل وافحصه قبل اختيار إجراء جديد.', en: 'This view is held stale. Try a staff action, then Load latest. Unapplied text will remain. Confirm reclaim and inspect the current record before choosing a new action.' },
} as const

export function StaleWriteControl({ demo, datasetId, view, language, hold, release, changed, departure }: {
  demo: Demo; datasetId: string; view: StaffView; language: Language;
  hold: () => void; release: () => void; changed: (view: StaffView) => void; departure: (work: Departure | null) => void;
}) {
  const [command, setCommand] = useState<Transfer | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ErrorKind | null>(null)
  const alive = useRef(true)
  const departureRef = useRef(departure)
  departureRef.current = departure
  useEffect(() => () => { alive.current = false; departureRef.current(null) }, [])
  useEffect(() => {
    departureRef.current({ dirty: false, pending: busy || error === 'outcomeUnknown', discard: () => {} })
  }, [busy, error])
  useEffect(() => {
    if (command && command.expectedSharedRevision !== view.sharedRevision) { setCommand(null); setError(null) }
  }, [command, view.sharedRevision])
  const simulate = async () => {
    const intent: Transfer = { kind: 'transferApplication', datasetId, applicationId: view.id, expectedSharedRevision: view.sharedRevision, operationId: crypto.randomUUID(), from: 'salma', to: 'khaled', confirmed: true, simulated: true }
    hold(); setCommand(intent); setBusy(true); setError(null)
    const result = await demo.execute(intent)
    if (!alive.current) return
    setBusy(false)
    if (!result.ok) {
      setError(result.error.kind)
      if (result.error.kind !== 'outcomeUnknown') release()
    }
  }
  const inspect = async () => {
    if (!command) return
    setBusy(true)
    const result = await demo.inspectOperation(command)
    if (!alive.current) return
    setBusy(false)
    if (!result.ok) { setError(result.error.kind); return }
    setError(null)
    if (result.value.status === 'notCommitted' && result.value.application.role === 'reviewer') { setCommand(null); changed(result.value.application) }
  }
  if (!command && !(view.status === 'underReview' && view.assignedToYou)) return null
  return <section className="summary mb-6" aria-labelledby="conflict-demo-heading" aria-busy={busy}>
    <h2 id="conflict-demo-heading">{copy.heading[language]}</h2><p>{copy.explanation[language]}</p>
    <button className="secondary" disabled={busy || !!command} onClick={() => void simulate()}>{copy.simulate[language]}</button>
    {command && !error && <p role="status">{busy ? assignmentText.working[language] : copy.held[language]}</p>}
    {error && <div role="alert"><p>{errors[error][language]}</p><button disabled={busy} onClick={() => void inspect()}>{assignmentText[error === 'outcomeUnknown' ? 'inspect' : 'latest'][language]}</button></div>}
  </section>
}
