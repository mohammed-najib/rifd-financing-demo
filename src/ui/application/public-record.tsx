import { useState } from 'react'
import type { Demo, PrintSummary } from '../../demo'
import { normalizeField } from '../../domain'
import type { DocumentSlot, Language, Snapshot } from '../../domain/model'
import { date, displayFieldValue, documentLabel, events, fieldLabels, money, text } from '../i18n'
import { DocumentPreview } from '../shared/preview'
import { activities } from './application-copy'

type PublicRecord = Pick<PrintSummary, 'product' | 'snapshot' | 'evidenceMonths' | 'history' | 'rounds'>

export function ApplicationInformation({ record, language, baseline }: { record: Pick<PublicRecord, 'snapshot' | 'evidenceMonths'>; language: Language; baseline?: Snapshot }) {
  const fields = record.snapshot.fields
  const t = (key: keyof typeof text) => text[key][language]
  return <><dl className="facts information">{Object.entries(fields).map(([key, value]) => <div key={key} className={key === 'explanation' || key === 'address' ? 'col-span-full narrow:col-auto' : ''}>
    <dt>{fieldLabels[key as keyof typeof fields][language]}{baseline && normalizeField(key as keyof typeof fields, value) !== normalizeField(key as keyof typeof fields, baseline.fields[key as keyof typeof fields]) && <span className="status ms-2">{language === 'ar' ? 'تغير عن المرجع' : 'Changed from baseline'}</span>}</dt><dd>{['revenue', 'expenses', 'amount', 'budget'].includes(key) ? <bdi dir="ltr">{money(value, language)}</bdi>
      : ['mobile', 'email', 'operatingSince'].includes(key) ? <bdi dir="ltr">{displayFieldValue(key as keyof typeof fields, value, language)}</bdi>
      : key === 'term' ? <><bdi>{displayFieldValue('term', value, language)}</bdi> {t('months')}</>
      : key === 'activity' ? ({ retail: { ar: 'تجارة تجزئة', en: 'Retail' }, services: { ar: 'خدمات', en: 'Services' }, production: { ar: 'إنتاج صغير', en: 'Small production' } }[fields.activity][language])
      : key === 'explanation' ? value || t('emptyExplanation') : displayFieldValue(key as keyof typeof fields, value, language)}</dd>
  </div>)}</dl><p>{t('financialWindow')}: {record.evidenceMonths.map(month => <bdi key={month}>{date(month, language)} </bdi>)}</p></>
}

export function PublicCorrections({ record, language, preview }: {
  record: Pick<PublicRecord, 'product'> & { rounds: Array<PrintSummary['rounds'][number] & { response?: Snapshot | null }> };
  language: Language; preview?: { demo: Demo; applicationId: string };
}) {
  const [file, setFile] = useState<{ id: string; slot: DocumentSlot } | null>(null)
  const published = language === 'ar' ? 'الرد المقدّم' : 'Published response'
  const previewLabel = language === 'ar' ? 'معاينة المستند المقدّم' : 'Preview published document'
  return <>{record.rounds.map((round, number) => <section className="panel" key={round.id}><h2>{text.corrections[language]}</h2><p>{text.baseline[language]}: <bdi>{date(round.requestedAt, language)}</bdi></p><ul>{round.targets.map((target, index) => <li key={index}><strong>{target.kind === 'field' ? fieldLabels[target.field][language] : documentLabel(target.slot, record.product)[language]}</strong><p>{target.reason[language]}</p></li>)}</ul>
    {round.response && <section className="summary mt-4 wrap-anywhere" aria-label={`${published} ${number + 1}`}><h3>{published} {number + 1}</h3><ul>{round.targets.map((target, index) => <li key={index} className="mb-3"><strong>{target.kind === 'field' ? fieldLabels[target.field][language] : documentLabel(target.slot, record.product)[language]}</strong>
      {target.kind === 'field' ? <p><bdi>{target.field === 'activity' ? activities[round.response!.fields.activity][language] : displayFieldValue(target.field, round.response!.fields[target.field], language)}</bdi></p> : <><p>{text.included[language]}</p>{preview && round.response!.documents[target.slot] && <button className="secondary" onClick={() => setFile({ id: round.response!.documents[target.slot]!, slot: target.slot })}>{previewLabel}: {documentLabel(target.slot, record.product)[language]}</button>}</>}
    </li>)}</ul></section>}
  </section>)}{file && preview && <DocumentPreview demo={preview.demo} applicationId={preview.applicationId} fileId={file.id} label={documentLabel(file.slot, record.product)} language={language} close={() => setFile(null)} />}</>
}

export function PublicHistory({ history, language }: { history: PublicRecord['history']; language: Language }) {
  return <section className="panel"><h2>{text.history[language]}</h2>{history.length ? <ol className="timeline">{history.map(event => <li key={event.id}><strong>{events[event.kind][language]}</strong><bdi className="mt-[3px] mb-2 block text-[11px] text-muted">{date(event.date, language)}</bdi>{event.reason && <p>{event.reason[language]}</p>}</li>)}</ol> : <p>{text.noHistory[language]}</p>}</section>
}
