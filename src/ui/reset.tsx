import { useEffect, useRef, useState } from 'react'
import type { Demo, ErrorKind, ResetContext, ResetOperation, ResetResult } from '../demo'
import type { Language } from '../domain/model'
import { errors, text } from './i18n'
import { containDialogFocus } from './dialog'

export const resetText = {
  title: { ar: 'إعادة ضبط العرض', en: 'Reset demo' },
  heading: { ar: 'إعادة ضبط جميع تبويبات العرض؟', en: 'Reset every demo tab?' },
  warning: {
    ar: 'سيستبدل هذا الإجراء جميع الطلبات والملفات والسجل والإشعارات وإيصالات العمليات والتفضيلات والجلسات والعمل غير المكتمل في جميع تبويبات العرض في ملف هذا المتصفح. ستعود الطلبات الثلاثة عشر الأصلية واللغة العربية والتفضيلات الافتراضية، وسيُطلب اختيار هوية من جديد.',
    en: 'This replaces all applications, files, history, notifications, receipts, preferences, sessions and unfinished work across every demo tab in this browser profile. It restores the thirteen original applications, Arabic and default preferences. Every tab must choose an identity again.',
  },
  confirm: { ar: 'استبدال جميع بيانات العرض', en: 'Replace all demo data' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  inspect: { ar: 'فحص حالة العرض الحالية', en: 'Inspect current demo' },
  inspectOutcome: { ar: 'فحص نتيجة إعادة الضبط', en: 'Inspect reset outcome' },
  changed: { ar: 'تغيرت البيانات منذ الفحص. افحص الحالة الحالية وأكد إعادة الضبط من جديد.', en: 'The saved demo changed after inspection. Inspect the current demo and confirm again.' },
  failed: { ar: 'لم تكتمل إعادة الضبط. احتُفظ بالبيانات السابقة والعمل غير المكتمل. يمكنك الإلغاء أو إعادة المحاولة.', en: 'Reset did not complete. Previous data and unfinished work are retained. Cancel or retry.' },
  pending: { ar: 'جارٍ تجهيز البيانات الأصلية وإعادة الضبط', en: 'Preparing original data and resetting' },
}

export function ResetDialog({ demo, language, prepare, pending, completed, close }: {
  demo: Demo; language: Language; prepare: () => Promise<void>; pending: (value: boolean) => void;
  completed: (result: ResetResult) => Promise<void>; close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const alive = useRef(true)
  const [observed, setObserved] = useState<ResetContext | null>(null)
  const command = useRef<ResetOperation | null>(null)
  const [busy, setBusy] = useState(false)
  const [inspecting, setInspecting] = useState(true)
  const [error, setError] = useState<ErrorKind | null>(null)
  const t = (key: keyof typeof resetText) => resetText[key][language]
  const inspect = async () => {
    setInspecting(true); setObserved(null); setError(null); command.current = null
    const result = await demo.inspectReset()
    if (!alive.current) return
    setInspecting(false)
    if (result.ok) setObserved(result.value); else setError(result.error.kind)
  }
  useEffect(() => {
    alive.current = true
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.current?.showModal()
    void inspect()
    return () => { alive.current = false; requestAnimationFrame(() => { if (opener?.isConnected) opener.focus() }) }
  }, [])
  const reset = async () => {
    if (!observed || busy) return
    command.current ??= { kind: 'resetDemo', context: observed, operationId: crypto.randomUUID(), confirmed: true }
    setBusy(true); setError(null); pending(true)
    try {
      await prepare()
      const result = await demo.execute(command.current)
      if (!alive.current) return
      if (result.ok) { await completed(result.value); return }
      setError(result.error.kind)
      if (result.error.kind === 'supersededDataset' || result.error.kind === 'identifierMisuse') { setObserved(null); command.current = null }
    } catch { if (alive.current) setError('resources') }
    finally { if (alive.current) { setBusy(false); pending(false) } }
  }
  const inspectOutcome = async () => {
    if (!command.current) return
    setBusy(true); pending(true)
    try {
      const result = await demo.inspectResetOperation(command.current)
      if (!alive.current) return
      if (result.ok) {
        if (result.value.status === 'committed') { await completed(result.value.result); return }
        setError(null)
      } else {
        setError(result.error.kind)
        if (result.error.kind === 'supersededDataset') { setObserved(null); command.current = null }
      }
    } finally { if (alive.current) { setBusy(false); pending(false) } }
  }
  return <dialog ref={dialog} className="w-[650px]" aria-labelledby="reset-heading" aria-describedby="reset-warning" aria-busy={busy || inspecting} onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); if (!busy) close() }}>
    <h2 id="reset-heading">{t('heading')}</h2><p id="reset-warning">{t('warning')}</p>
    {busy && <p role="status">{t('pending')}</p>}
    {inspecting && <p role="status">{text.readLoading[language]}</p>}
    {error && <div role="alert"><p>{error === 'supersededDataset' ? t('changed') : errors[error][language]}</p>{error !== 'outcomeUnknown' && error !== 'supersededDataset' && <p>{t('failed')}</p>}</div>}
    <div className="actions">
      <button className="secondary" disabled={busy} onClick={close}>{t('cancel')}</button>
      {error === 'outcomeUnknown' ? <button disabled={busy} onClick={() => void inspectOutcome()}>{t('inspectOutcome')}</button>
        : observed ? <button disabled={busy || inspecting} onClick={() => void reset()}>{t('confirm')}</button>
        : <button disabled={busy || inspecting} onClick={() => void inspect()}>{t('inspect')}</button>}
    </div>
  </dialog>
}
