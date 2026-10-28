import { queuePreferencesSchema, type ApplicationStatus, type Language } from '../../domain/model'
import { statuses, text } from '../i18n'

export function QueueCounts({ total, counts, language, busy = false }: {
  total?: number; counts?: Partial<Record<ApplicationStatus, number>>; language: Language; busy?: boolean;
}) {
  return <div className="queue-counts mb-5 grid grid-cols-6 gap-[15px] compact:grid-cols-3 narrow:grid-cols-2 narrow:gap-2.5" aria-label={text.all[language]} aria-busy={busy}>
    <div><strong>{total ?? '…'}</strong><span>{text.all[language]}</span></div>
    {queuePreferencesSchema.shape.status.options.filter(status => status !== 'all').map(status => <div key={status}><strong>{counts?.[status] ?? '…'}</strong><span>{statuses[status][language]}</span></div>)}
  </div>
}
