import type { Language } from '../../domain/model'
import { draftText } from '../i18n'

export function FilePicker({ id, language, name, saved = false, disabled, invalid, describedBy, choose }: {
  id: string; language: Language; name?: string; saved?: boolean; disabled?: boolean;
  invalid?: boolean; describedBy?: string; choose: (file: File) => void;
}) {
  const t = (key: keyof typeof draftText) => draftText[key][language]
  return <div className="file-picker">
    <input id={id} type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={disabled} aria-invalid={invalid} aria-describedby={[`${id}-name`, describedBy].filter(Boolean).join(' ')} onChange={event => {
      const file = event.currentTarget.files?.[0]
      // Keep same-file retries possible. The displayed name comes from draft state.
      event.currentTarget.value = ''
      if (file) choose(file)
    }} />
    <div className="file-picker-content">
      <span className="file-picker-action" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V3m-5 5 5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></svg>
        {t(name ? 'replaceFile' : 'browseFiles')}
      </span>
      <span id={`${id}-name`} className="file-picker-name" role="status" aria-atomic="true">
        {name ? <><bdi dir="auto">{name}</bdi><small>{t(saved ? 'savedDocument' : 'selected')}</small></> : t('noFileSelected')}
      </span>
    </div>
  </div>
}
