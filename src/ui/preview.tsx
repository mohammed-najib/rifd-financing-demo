import { useEffect, useRef, useState } from 'react'
import type { Demo, ErrorKind, PreparedAttachment } from '../demo'
import type { Bilingual, Language } from '../domain/model'
import { draftText, errors, text } from './i18n'
import { containDialogFocus } from './dialog'

const filePreviewClassName = 'block h-[55vh] w-full border border-solid border-border bg-white object-contain'

export function DocumentPreview({ demo, applicationId, fileId, attachment, label, language, close }: {
  demo: Demo; applicationId: string; fileId?: string; attachment?: PreparedAttachment; label: Bilingual; language: Language; close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [file, setFile] = useState<{ url: string; mime: string; name: string } | null>(null)
  const [error, setError] = useState<ErrorKind | 'render' | null>(null)
  const [retry, setRetry] = useState(0)
  const t = (key: keyof typeof draftText) => draftText[key][language]
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.current?.showModal()
    return () => { requestAnimationFrame(() => { if (opener?.isConnected) opener.focus() }) }
  }, [])
  useEffect(() => {
    let active = true
    let url: string | null = null
    setFile(null); setError(null)
    const read = attachment ? demo.readPrepared(applicationId, attachment) : demo.readFile(applicationId, fileId!)
    void read.then(result => {
      if (!active) return
      if (!result.ok) { setError(result.error.kind); return }
      try {
        url = URL.createObjectURL(new Blob([result.value.bytes], { type: result.value.mime }))
        setFile({ url, mime: result.value.mime, name: result.value.name })
      } catch { setError('resources') }
    })
    return () => { active = false; if (url) URL.revokeObjectURL(url) }
  }, [demo, applicationId, fileId, attachment, retry])
  return <dialog ref={dialog} className="w-[900px]" aria-labelledby="preview-heading" aria-describedby="preview-document-label" onKeyDown={containDialogFocus} onCancel={close} onClose={close}>
    <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3"><h2 id="preview-heading">{t('preview')}</h2><button onClick={close}>{t('closePreview')}</button></div>
    <p id="preview-document-label" className="font-semibold">{label[language]}</p>
    {file ? <>
      <p><bdi dir="ltr" className="wrap-anywhere">{file.name}</bdi></p><p>{attachment ? t('readyDocument') : t('savedDocument')}</p>
      {error !== 'render' && (file.mime === 'application/pdf'
        ? <object className={filePreviewClassName} data={file.url} type="application/pdf" aria-label={t('savedDocument')} onError={() => setError('render')}><p>{t('previewFailed')}</p></object>
        : <img className={filePreviewClassName} src={file.url} alt={attachment ? t('readyDocument') : t('savedDocument')} onError={() => setError('render')} />)}
      <div className="actions"><a className="button secondary" href={file.url} target="_blank" rel="noopener noreferrer">{t('openFile')}</a><a className="button secondary" href={file.url} download={file.name}>{t('download')}</a></div>
    </> : !error && <p role="status">{text.readLoading[language]}</p>}
    {error && <p role="alert">{error === 'render' ? t('previewFailed') : errors[error][language]}</p>}
    {error && <button onClick={() => setRetry(value => value + 1)}>{text.retry[language]}</button>}
  </dialog>
}
