import type { PrintSummary } from '../demo'
import type { Language } from '../domain/model'
import { date, displayFieldValue, documentLabel, events, fieldLabels, money, text } from './i18n'

type PublicRecord = Pick<PrintSummary, 'product' | 'snapshot' | 'evidenceMonths' | 'history' | 'rounds'>

export function ApplicationInformation({ record, language }: { record: Pick<PublicRecord, 'snapshot' | 'evidenceMonths'>; language: Language }) {
  const fields = record.snapshot.fields
  const t = (key: keyof typeof text) => text[key][language]
  return <><dl className="facts information">{Object.entries(fields).map(([key, value]) => <div key={key} className={key === 'explanation' || key === 'address' ? 'col-span-full narrow:col-auto' : ''}>
    <dt>{fieldLabels[key as keyof typeof fields][language]}</dt><dd>{['revenue', 'expenses', 'amount', 'budget'].includes(key) ? <bdi dir="ltr">{money(value, language)}</bdi>
      : ['mobile', 'email', 'operatingSince'].includes(key) ? <bdi dir="ltr">{displayFieldValue(key as keyof typeof fields, value, language)}</bdi>
      : key === 'term' ? <><bdi>{displayFieldValue('term', value, language)}</bdi> {t('months')}</>
      : key === 'activity' ? ({ retail: { ar: 'تجارة تجزئة', en: 'Retail' }, services: { ar: 'خدمات', en: 'Services' }, production: { ar: 'إنتاج صغير', en: 'Small production' } }[fields.activity][language])
      : value || t('emptyExplanation')}</dd>
  </div>)}</dl><p>{t('financialWindow')}: {record.evidenceMonths.map(month => <bdi key={month}>{date(month, language)} </bdi>)}</p></>
}

export function PublicCorrections({ record, language }: { record: Pick<PublicRecord, 'product' | 'rounds'>; language: Language }) {
  return record.rounds.map(round => <section className="panel" key={round.id}><h2>{text.corrections[language]}</h2><p>{text.baseline[language]}: <bdi>{date(round.requestedAt, language)}</bdi></p><ul>{round.targets.map((target, index) => <li key={index}><strong>{target.kind === 'field' ? fieldLabels[target.field][language] : documentLabel(target.slot, record.product)[language]}</strong><p>{target.reason[language]}</p></li>)}</ul></section>)
}

export function PublicHistory({ history, language }: { history: PublicRecord['history']; language: Language }) {
  return <section className="panel"><h2>{text.history[language]}</h2>{history.length ? <ol className="timeline">{history.map(event => <li key={event.id}><strong>{events[event.kind][language]}</strong><bdi className="mt-[3px] mb-2 block text-[11px] text-muted">{date(event.date, language)}</bdi>{event.reason && <p>{event.reason[language]}</p>}</li>)}</ol> : <p>{text.noHistory[language]}</p>}</section>
}
