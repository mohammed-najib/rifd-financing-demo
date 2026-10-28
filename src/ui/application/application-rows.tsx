import type { ApplicationSummary } from '../../demo'
import { products } from '../../domain'
import type { ApplicationStatus, Language } from '../../domain/model'
import { date, displayFieldValue, fieldLabels, money, statuses, text } from '../i18n'

const statusColors: Record<ApplicationStatus, string> = {
  draft: 'bg-status-draft text-status-draft-text',
  submitted: 'bg-status-submitted text-status-submitted-text',
  underReview: 'bg-status-review text-status-review-text',
  correctionsRequested: 'bg-status-corrections text-status-corrections-text',
  approved: 'bg-status-approved text-status-approved-text',
  rejected: 'bg-status-rejected text-status-rejected-text',
}
export function Status({ status, language }: { status: ApplicationStatus; language: Language }) { return <span className={`status ${statusColors[status]}`}>{statuses[status][language]}</span> }

export function ApplicationRows({ list, language, staff, go, query = '' }: { list: ApplicationSummary[]; language: Language; staff: boolean; go: (path: string) => void; query?: string }) {
  const t = (key: keyof typeof text) => text[key][language]
  const destination = (application: ApplicationSummary) => `${staff ? '/staff' : ''}/applications/${application.id}${application.status === 'draft' ? '/edit?step=personal' : staff ? query : ''}`
  return <>
    {staff ? <div className="panel overflow-hidden p-0 compact:hidden"><table><thead><tr><th>{t('reference')}</th><th>{fieldLabels.fullName[language]} / {fieldLabels.businessName[language]}</th><th>{t('products')}</th><th>{t('amount')}</th><th>{t('status')}</th><th>{t('assignment')}</th><th>{t('submittedAt')}</th><th><span className="sr-only">{t('open')}</span></th></tr></thead><tbody>{list.map(application => <tr key={application.id}><td><bdi>{application.id}</bdi></td><td>{application.fullName}<small>{application.businessName}</small></td><td>{products[application.product].name[language]}</td><td><bdi dir="ltr">{money(application.amount, language)}</bdi></td><td><Status status={application.status} language={language} /></td><td>{application.assignedToYou ? t('assignedToYou') : application.assignment?.[language] ?? t('unassigned')}</td><td><bdi>{application.submittedAt ? date(application.submittedAt, language) : t('notSubmitted')}</bdi></td><td><a href={destination(application)} onClick={event => { event.preventDefault(); go(destination(application)) }} aria-label={`${t('open')} ${application.id}`}>{t('open')}</a></td></tr>)}</tbody></table></div> : null}
    <div className={`grid-cols-2 gap-[22px] narrow:grid-cols-1 ${staff ? 'hidden compact:grid' : 'grid'}`}>{list.map(application => <article className="panel application-card" key={application.id} data-application={application.id}>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3"><bdi className="font-latin text-[13px] text-muted">{application.id}</bdi><Status status={application.status} language={language} /></div><h2>{application.businessName}</h2><p>{application.fullName} · {products[application.product].name[language]}</p>
      <dl className="facts"><div><dt>{t('amount')}</dt><dd><bdi dir="ltr">{money(application.amount, language)}</bdi></dd></div><div><dt>{t('term')}</dt><dd><bdi>{displayFieldValue('term', application.term, language)}</bdi> {t('months')}</dd></div>{staff && <div><dt>{t('assignment')}</dt><dd>{application.assignedToYou ? t('assignedToYou') : application.assignment?.[language] ?? t('unassigned')}</dd></div>}<div><dt>{t('submittedAt')}</dt><dd><bdi>{application.submittedAt ? date(application.submittedAt, language) : t('notSubmitted')}</bdi></dd></div></dl>
      <a className="button secondary" aria-label={staff ? `${t('open')} ${application.id}` : undefined} href={destination(application)} onClick={event => { event.preventDefault(); go(destination(application)) }}>{staff ? t('open') : t(application.nextAction)}</a>
    </article>)}</div>
  </>
}
