import type { ErrorKind } from '../../demo'
import type { Language } from '../../domain/model'
import { draftText, errors, text } from '../i18n'

type FileDetails = { name: string; mime: string; size: number }
export type AttachmentSelection = {
  name: string; status: 'selected' | 'preparing' | 'ready' | 'failed'; progress: number;
  attachment?: FileDetails; error?: ErrorKind;
}

export function AttachmentPreparation({ selection, language, errorId, locked, retry, preview, discard }: {
  selection: AttachmentSelection; language: Language; errorId: string; locked?: boolean;
  retry: () => void; preview: () => void; discard: () => void;
}) {
  const t = (key: keyof typeof draftText) => draftText[key][language]
  return <div className="draft-feedback" aria-busy={selection.status === 'preparing'}>
    <p><bdi dir="ltr" className="wrap-anywhere">{selection.name}</bdi>{selection.attachment && <small><bdi dir="ltr">{selection.attachment.mime} · {selection.attachment.size} B</bdi></small>}</p>
    <p role="status">{t(selection.status === 'ready' ? 'ready' : selection.status === 'failed' ? 'preparationFailed' : selection.status === 'selected' ? 'selected' : 'preparing')}</p>
    {selection.status === 'preparing' && <progress max={100} value={selection.progress} aria-label={t('preparing')}>{selection.progress}%</progress>}
    {selection.error && <p id={errorId} role="alert">{errors[selection.error][language]}</p>}
    <div className="actions">
      {selection.status === 'failed' && <button disabled={locked} onClick={retry}>{t('retryPreparation')}</button>}
      {selection.status === 'ready' && <button onClick={preview}>{t('previewReady')}</button>}
      <button disabled={locked} onClick={discard}>{t('discardSelection')}</button>
    </div>
  </div>
}

export function SavedAttachment({ file, language, label, preview }: { file: FileDetails | null | undefined; language: Language; label?: string; preview: () => void }) {
  return file ? <div className="draft-feedback"><p>{label ?? text.savedInDraft[language]}: <bdi dir="ltr" className="wrap-anywhere">{file.name}</bdi><small><bdi dir="ltr">{file.mime} · {file.size} B</bdi></small></p><button onClick={preview}>{draftText.previewSaved[language]}</button></div> : <p>{text.missing[language]}</p>
}
