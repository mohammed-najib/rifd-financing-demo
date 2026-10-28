import { useEffect, useId, useRef, useState } from 'react'
import type { Language } from '../../domain/model'
import type { EvidenceRun, EvidenceSource } from '../../evidence-assistance/contract'
import { containDialogFocus } from '../shared/dialog'
import { assistanceText } from './evidence-assistance-copy'
import { draftText } from '../i18n'
import { SourcePages } from './source-pages'

export function SourceRegionDialog({ source, run, region, label, language, close }: {
  source: EvidenceSource; run: EvidenceRun; region: { page: number; target: string; serial: number };
  label: string; language: Language; close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const headingId = useId(), labelId = useId()
  const [file, setFile] = useState<{ url: string; mime: string; name: string } | null>(null)
  const t = (key: keyof typeof assistanceText) => assistanceText[key][language]
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.current?.showModal()
    return () => { requestAnimationFrame(() => { if (opener?.isConnected) opener.focus() }) }
  }, [])
  useEffect(() => {
    const url = URL.createObjectURL(new Blob([source.bytes], { type: source.mime }))
    setFile({ url, mime: source.mime, name: source.name })
    return () => URL.revokeObjectURL(url)
  }, [source])
  return <dialog ref={dialog} className="source-region-dialog" dir={language === 'ar' ? 'rtl' : 'ltr'} aria-labelledby={headingId} aria-describedby={labelId} onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); close() }} onClose={close}>
    <div className="source-region-heading">
      <div><h2 id={headingId}>{t('inspectRegion')}</h2><p id={labelId}>{label}</p></div>
      <button type="button" className="secondary" onClick={close}>{draftText.closePreview[language]}</button>
    </div>
    <div className="source-region-content">
      {run.locations?.find(location => location.page === region.page && location.target === region.target)?.status !== 'shown' && <p role="status">{t('highlightSuppressed')}</p>}
      {file ? <SourcePages source={source} file={file} language={language} run={run} focus={region} /> : <p role="status">{t('loadingSource')}</p>}
    </div>
  </dialog>
}
