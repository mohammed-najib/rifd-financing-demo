import { products, type FieldIssue } from '../../domain'
import type { Fields, Language, ProductId } from '../../domain/model'
import { activities, issueMessage } from './application-copy'
import { draftText, fieldLabels } from '../i18n'
import { Select } from '../shared/select'

export function ApplicationField({ field, id, value, product, language, issue, disabled, change }: {
  field: keyof Fields; id: string; value: string; product: ProductId; language: Language;
  issue?: FieldIssue; disabled?: boolean; change: (value: string) => void;
}) {
  const numeric = ['revenue', 'expenses', 'amount', 'budget', 'term'].includes(field)
  const hint = field === 'operatingSince' ? 'YYYY-MM' : field === 'term' ? products[product].terms.join(' / ') : field === 'explanation' ? draftText.rawHint[language] : numeric ? language === 'ar' ? 'مبلغ صحيح بالريال اليمني. تقبل الأرقام العربية والفواصل الصحيحة.' : 'Whole YER. Arabic-Indic digits and valid thousands grouping are accepted.' : field === 'email' ? language === 'ar' ? 'اختياري' : 'Optional' : ''
  const props = { id, value, disabled, 'aria-invalid': !!issue, 'aria-describedby': `${id}-hint${issue ? ` ${id}-error` : ''}`, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => change(event.target.value) }
  return <div className="application-field">
    <label htmlFor={id}>{fieldLabels[field][language]}</label><p id={`${id}-hint`} className="text-[13px] text-muted">{hint}</p>
    {field === 'activity' ? <Select id={id} label={fieldLabels[field][language]} value={value} disabled={disabled} aria-invalid={!!issue} aria-describedby={props['aria-describedby']} options={Object.entries(activities).map(([value, label]) => ({ value, label: label[language] }))} onValueChange={change} />
      : field === 'explanation' || field === 'address' ? <textarea {...props} />
      : <input {...props} type="text" dir={numeric || ['mobile', 'email', 'operatingSince'].includes(field) ? 'ltr' : undefined} inputMode={numeric ? 'numeric' : field === 'mobile' ? 'tel' : field === 'email' ? 'email' : 'text'} />}
    {issue && <p id={`${id}-error`} className="text-danger-text">{issueMessage(issue)[language]}</p>}
  </div>
}
