import { useEffect, useRef, useState } from 'react'
import type { Bilingual, Language } from '../../domain/model'
import { draftText } from '../i18n'
import { containDialogFocus } from './dialog'

// Omit save for request/decision composers or an unauthorized note.
export type Departure = {
  dirty: boolean; pending: boolean; discard: () => void;
  canSave?: boolean; save?: () => Promise<boolean>; saveLabel?: Bilingual;
}
export type DepartureRequest = { action: () => void; cancel?: () => void; discardOnly?: boolean }

export function combineDeparture(primary: Departure | null, secondary: Departure | null): Departure {
  return {
    dirty: !!primary?.dirty || !!secondary?.dirty, pending: !!primary?.pending || !!secondary?.pending,
    discard: () => { primary?.discard(); secondary?.discard() },
    ...(!primary?.dirty && secondary?.save ? { canSave: secondary.canSave, save: secondary.save, saveLabel: secondary.saveLabel } : {}),
  }
}

export function DepartureDialog({ request, work, language, discard, finish, cancel }: {
  request: DepartureRequest; work: Departure | null; language: Language;
  discard: () => void; finish: () => void; cancel: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const active = useRef(true)
  const restoreFocus = useRef(false)
  const [saving, setSaving] = useState(false)
  const t = (key: keyof typeof draftText) => draftText[key][language]
  useEffect(() => {
    active.current = true
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.current?.showModal()
    return () => {
      active.current = false
      if (restoreFocus.current) requestAnimationFrame(() => { if (opener?.isConnected) opener.focus() })
    }
  }, [])
  const stay = () => { restoreFocus.current = true; cancel() }
  return <dialog ref={dialog} className="w-[650px]" aria-labelledby="leave-heading" onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); if (!saving) stay() }}>
    <h2 id="leave-heading">{t('leave')}</h2><p>{t(saving || work?.pending || work?.save && !work.canSave ? 'waitLeave' : 'leaveHint')}</p>
    <div className="actions">
      <button disabled={saving} onClick={stay}>{t('stay')}</button>
      <button disabled={saving || work?.pending} onClick={discard}>{t('discard')}</button>
      {!request.discardOnly && work?.save && <button disabled={saving || !work.canSave || work.pending} onClick={async () => {
        setSaving(true)
        const saved = await work.save!()
        if (!active.current) return
        setSaving(false)
        if (saved) finish(); else stay()
      }}>{work.saveLabel?.[language] ?? t('saveLeave')}</button>}
    </div>
  </dialog>
}
