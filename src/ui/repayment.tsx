import type { ApplicationView } from '../demo'
import type { Language, Repayment } from '../domain/model'
import { products } from '../domain'
import { Status } from './application-rows'
import { date, money, text } from './i18n'

export const repaymentText = {
  open: { ar: 'عرض جدول السداد', en: 'View repayment overview' },
  back: { ar: 'العودة إلى الطلب', en: 'Back to application' },
  unavailable: { ar: 'يظهر جدول السداد التوضيحي للطلبات الموافق عليها فقط. تظهر معلومات الطلب الحالية.', en: 'The repayment illustration is available only for Approved applications. The current application is shown.' },
  notice: { ar: 'هذا مثال افتراضي للقراءة فقط. لا تُعالج أي مدفوعات، ولا يغيّر مرور التاريخ حالة الأقساط.', en: 'This is a read-only fictional illustration. No payments are processed, and passing dates do not change installments.' },
  frozen: { ar: 'شروط التمويل المقبولة ثابتة منذ الموافقة.', en: 'Accepted financing terms are fixed at approval.' },
  approvedAt: { ar: 'تاريخ الموافقة', en: 'Approval date' },
  installments: { ar: 'أقساط السداد التوضيحية', en: 'Illustrated installments' },
  next: { ar: 'القسط القادم في المثال', en: 'Next installment in the example' },
  noUpcoming: { ar: 'لا توجد أقساط قادمة في المثال.', en: 'There are no upcoming installments in the example.' },
}

export function RepaymentSummary({ repayment, language }: { repayment: Repayment; language: Language }) {
  const completed = repayment.rows.filter(row => row.status === 'completed').reduce((sum, row) => sum + row.amount, 0)
  const remaining = repayment.rows.filter(row => row.status === 'upcoming').reduce((sum, row) => sum + row.amount, 0)
  const totals = { amount: repayment.amount, markup: repayment.markup, total: repayment.total, completed, remaining }
  return <section className="summary" aria-labelledby="repayment-totals"><h2 id="repayment-totals">{text.repayment[language]}</h2><p>{repaymentText.frozen[language]}</p><dl className="facts">{(['amount', 'markup', 'total', 'completed', 'remaining'] as const).map(key => <div key={key}><dt>{text[key][language]}</dt><dd><bdi dir="ltr">{money(totals[key], language)}</bdi></dd></div>)}</dl></section>
}

export function RepaymentOverview({ view, language, queueSearch, go }: { view: ApplicationView; language: Language; queueSearch: string; go: (path: string) => void }) {
  if (view.status !== 'approved' || !view.repayment) return null
  const repayment = view.repayment
  const next = repayment.rows.find(row => row.status === 'upcoming')
  const back = `${view.role === 'reviewer' ? '/staff' : ''}/applications/${view.id}${queueSearch}`
  return <>
    <a className="button secondary mb-5" href={back} onClick={event => { event.preventDefault(); go(back) }}>{repaymentText.back[language]}</a>
    <section aria-labelledby="repayment-heading">
      <p className="eyebrow"><bdi>{view.id}</bdi> · {products[repayment.product].name[language]}</p>
      <h1 id="repayment-heading" tabIndex={-1}>{text.repayment[language]}</h1>
      <p className="intro">{view.snapshot.fields.fullName} · {view.snapshot.fields.businessName}</p>
      <Status status={view.status} language={language} />
      <p>{repaymentText.notice[language]}</p>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-start gap-[25px] compact:grid-cols-1">
        <div>
          <RepaymentSummary repayment={repayment} language={language} />
          <section className="panel mt-6"><h2>{repaymentText.next[language]}</h2>{next ? <><p><time dateTime={next.due}>{date(next.due, language)}</time></p><p className="text-[24px] font-semibold text-accent"><bdi dir="ltr">{money(next.amount, language)}</bdi></p><span>{text.upcoming[language]}</span></> : <p>{repaymentText.noUpcoming[language]}</p>}<dl className="facts"><div><dt>{repaymentText.approvedAt[language]}</dt><dd><time dateTime={repayment.approvedAt}>{date(repayment.approvedAt, language)}</time></dd></div><div><dt>{text.term[language]}</dt><dd>{repayment.term} {text.months[language]}</dd></div></dl></section>
        </div>
        <section className="panel"><h2 id="repayment-installments">{repaymentText.installments[language]}</h2><ol role="list" className="m-0 list-none p-0" aria-labelledby="repayment-installments">{repayment.rows.map(row => <li key={row.due} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 gap-y-2 border-0 border-b border-solid border-border py-4 last:border-b-0 narrow:gap-x-3">
          <time dateTime={row.due}>{date(row.due, language)}</time><bdi dir="ltr" className="font-semibold">{money(row.amount, language)}</bdi><span className={`status col-span-full justify-self-start ${row.status === 'completed' ? 'bg-status-approved text-status-approved-text' : 'bg-summary text-accent'}`}>{text[row.status === 'completed' ? 'completedRow' : 'upcoming'][language]}</span>
        </li>)}</ol></section>
      </div>
    </section>
  </>
}
