import { useEffect, useRef, useState } from 'react'
import type { Demo, ErrorKind, PreparedAttachment } from '../demo'
import type { Language } from '../domain/model'
import { draftText, errors, text } from './i18n'

export function DocumentPreview({ demo, applicationId, fileId, attachment, language, close }: {
  demo: Demo; applicationId: string; fileId?: string; attachment?: PreparedAttachment; language: Language; close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [file, setFile] = useState<{ url: string; mime: string; name: string } | null>(null)
  const [error, setError] = useState<ErrorKind | 'render' | null>(null)
  const [retry, setRetry] = useState(0)
  const t = (key: keyof typeof draftText) => draftText[key][language]
  useEffect(() => { dialog.current?.showModal() }, [])
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
  return <dialog ref={dialog} className="preview-dialog" aria-labelledby="preview-heading" onCancel={close} onClose={close}>
    <div className="card-heading"><h2 id="preview-heading">{t('preview')}</h2><button onClick={close}>{t('closePreview')}</button></div>
    {file ? <>
      <p><bdi dir="ltr" className="filename">{file.name}</bdi></p><p>{attachment ? t('readyDocument') : t('savedDocument')}</p>
      {error !== 'render' && (file.mime === 'application/pdf'
        ? <object className="file-preview" data={file.url} type="application/pdf" aria-label={t('savedDocument')} onError={() => setError('render')}><p>{t('previewFailed')}</p></object>
        : <img className="file-preview" src={file.url} alt={attachment ? t('readyDocument') : t('savedDocument')} onError={() => setError('render')} />)}
      <div className="actions"><a className="button secondary" href={file.url} target="_blank" rel="noopener noreferrer">{t('openFile')}</a><a className="button secondary" href={file.url} download={file.name}>{t('download')}</a></div>
    </> : !error && <p role="status">{text.readLoading[language]}</p>}
    {error && <p role="alert">{error === 'render' ? t('previewFailed') : errors[error][language]}</p>}
    {error && <button onClick={() => setRetry(value => value + 1)}>{text.retry[language]}</button>}
  </dialog>
}
