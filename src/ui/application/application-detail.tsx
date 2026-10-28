import { useEffect, useState } from 'react'
import type { ApplicationSummary, ApplicationView } from '../../demo'
import { createDemo } from '../../demo'
import { products } from '../../domain'
import type { Language } from '../../domain/model'
import { date, displayFieldValue, documentLabel, money, text } from '../i18n'
import { DocumentPreview } from '../shared/preview'
import { Heading } from '../shared/heading'
import { ApplicationRows, Status } from './application-rows'
import { applicationText } from './application-copy'
import { responseText } from './correction-response'
import { ApplicationInformation, PublicCorrections, PublicHistory } from './public-record'
import { queueText } from '../queue/queue-copy'
import { correctionText } from '../review/correction-copy'
import { decisionText } from '../review/decision-copy'
import { RepaymentSummary, repaymentText } from '../screens/repayment'
import { printText } from '../screens/print'

export function ApplicationList({ list, language, go }: { list: ApplicationSummary[]; language: Language; go: (path: string) => void }) {
  const t = (key: keyof typeof text) => text[key][language]
  return <>
    <p className="eyebrow">{language === 'ar' ? 'مساحة العمل' : 'Workspace'}</p><Heading>{t('applications')}</Heading><p className="intro">{t('ownIntro')}</p>
    <a className="button secondary mb-5" href="/products" onClick={event => { event.preventDefault(); go('/products') }}>{applicationText.new[language]}</a>
    <ApplicationRows list={list} language={language} staff={false} go={go} />
  </>
}

export function ApplicationDetail({ demo, view, language, queueSearch, children, confirmed, redirectedCorrection, redirectedRepayment, requesting, go }: { demo: ReturnType<typeof createDemo>; view: ApplicationView; language: Language; queueSearch: string; children?: React.ReactNode; confirmed?: boolean; redirectedCorrection?: boolean; redirectedRepayment?: boolean; requesting?: boolean; go: (path: string) => void }) {
  const [previewFileId, setPreviewFileId] = useState<string | null>(null)
  const previewDocument = view.documents.find(document => document.file?.id === previewFileId)
  useEffect(() => { if (previewFileId && !previewDocument) setPreviewFileId(null) }, [view, previewFileId])
  const t = (key: keyof typeof text) => text[key][language]
  const fields = view.snapshot.fields
  const printHref = `${view.role === 'reviewer' ? '/staff' : ''}/applications/${view.id}/print${queueSearch}`
  return <>
    {view.role === 'reviewer' && <a className="button secondary mb-5" href={`/staff/applications${queueSearch}`} onClick={event => { event.preventDefault(); go(`/staff/applications${queueSearch}`) }}>{queueText.back[language]}</a>}
    <p className="eyebrow">{products[view.product].name[language]}</p><div className="detail-heading mb-2.5 flex flex-wrap items-center gap-5 narrow:gap-3"><Heading>{view.status === 'draft' && view.role === 'applicant' && !view.workspace?.savedAt ? applicationText.new[language] : <bdi>{view.id}</bdi>}</Heading><Status status={view.status} language={language} /></div>
    <p className="intro">{fields.fullName} · {fields.businessName}</p>
    {redirectedCorrection && <p className="summary" role="status">{language === 'ar' ? 'لم يعد طلب التصحيح هذا نشطًا. تظهر معلومات الطلب الحالية.' : 'This correction request is no longer active. The current application is shown.'}</p>}
    {redirectedRepayment && view.status !== 'approved' && <p className="summary" role="status">{repaymentText.unavailable[language]}</p>}
    {confirmed && <p className="summary" role="status">{view.history.at(-1)?.kind === 'resubmitted' ? responseText.resubmitted[language] : applicationText.submitted[language]} <bdi>{view.id}</bdi></p>}
    {view.role === 'applicant' && <section className="summary"><h2>{t('nextAction')}</h2><p>{t(view.status === 'draft' ? 'draftNext' : view.status === 'correctionsRequested' ? 'correctionNext' : ['approved', 'rejected'].includes(view.status) ? 'finalNext' : 'waitingNext')}</p></section>}
    {(view.status !== 'draft' || view.role === 'applicant' && !!view.workspace?.savedAt) && <a className="button secondary mb-6" href={printHref} onClick={event => { event.preventDefault(); go(printHref) }}>{printText.print[language]}</a>}
    {view.role === 'reviewer' && view.permissions.requestCorrections && !requesting && <a className="button mb-6" href={`/staff/applications/${view.id}/correction-request${queueSearch}`} onClick={event => { event.preventDefault(); go(`/staff/applications/${view.id}/correction-request${queueSearch}`) }}>{correctionText.request[language]}</a>}
    {view.role === 'reviewer' && view.status === 'underReview' && !requesting && <a className="button secondary ms-3 mb-6" href={`/staff/applications/${view.id}/decision${queueSearch}`} onClick={event => { event.preventDefault(); go(`/staff/applications/${view.id}/decision${queueSearch}`) }}>{decisionText.title[language]}</a>}
    {view.status === 'approved' && view.repayment && <a className="button mb-6" href={`${view.role === 'reviewer' ? '/staff' : ''}/applications/${view.id}/repayment${queueSearch}`} onClick={event => { event.preventDefault(); go(`${view.role === 'reviewer' ? '/staff' : ''}/applications/${view.id}/repayment${queueSearch}`) }}>{repaymentText.open[language]}</a>}
    {children}
    {view.role === 'applicant' && (view.status !== 'draft' || !!view.workspace?.savedAt) && <div className="detail-grid grid grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)] gap-[25px] compact:grid-cols-[minmax(0,1.4fr)_minmax(240px,1fr)] narrow:grid-cols-1"><div>
      <section className="panel"><h2>{view.status === 'draft' ? t('savedInformation') : t('submittedInformation')}</h2><ApplicationInformation record={view} language={language} /></section>
      <section className="panel"><h2>{t('documents')}</h2><ul className="document-list">{view.documents.map(document => <li key={document.slot}><strong>{documentLabel(document.slot, view.product)[language]}</strong><p>{document.file ? <><bdi dir="ltr" className="wrap-anywhere">{document.file.name}</bdi><span className="text-[11px]"><bdi>{document.file.mime} · {new Intl.NumberFormat('en-US').format(document.file.size)} B</bdi></span><span>{view.status === 'draft' ? t('savedInDraft') : t('included')}</span></> : t('missing')}</p>{document.file && <button className="secondary" onClick={() => setPreviewFileId(document.file!.id)}>{language === 'ar' ? 'معاينة' : 'Preview'} {documentLabel(document.slot, view.product)[language]}</button>}</li>)}</ul></section>
      <PublicCorrections record={view} language={language} preview={{ demo, applicationId: view.id }} />
      {view.role === 'applicant' && view.status === 'correctionsRequested' && view.workspace && <section className="summary"><h2>{t('privateWorkspace')}</h2><p>{responseText.private[language]}</p><a className="button" href={`/applications/${view.id}/corrections/current?round=${view.workspace.roundId}`} onClick={event => { event.preventDefault(); go(`/applications/${view.id}/corrections/current?round=${view.workspace!.roundId}`) }}>{responseText.open[language]}</a><p>{t('amount')}: <bdi dir="ltr">{money(view.workspace.snapshot.fields.amount, language)}</bdi></p></section>}
      <PublicHistory history={view.history} language={language} />
    </div><div>
      <section className="summary"><h2>{products[view.product].name[language]}</h2><dl className="facts"><div><dt>{t('amount')}</dt><dd><bdi dir="ltr">{money(fields.amount, language)}</bdi></dd></div><div><dt>{t('term')}</dt><dd><bdi>{displayFieldValue('term', fields.term, language)}</bdi> {t('months')}</dd></div><div><dt>{t('submittedAt')}</dt><dd><bdi>{view.submittedAt ? date(view.submittedAt, language) : t('notSubmitted')}</bdi></dd></div></dl></section>
      {view.repayment && <RepaymentSummary repayment={view.repayment} language={language} />}
    </div></div>}
    {view.role === 'reviewer' && view.repayment && <RepaymentSummary repayment={view.repayment} language={language} />}
    {previewFileId && previewDocument && <DocumentPreview demo={demo} applicationId={view.id} fileId={previewFileId} label={documentLabel(previewDocument.slot, view.product)} language={language} close={() => setPreviewFileId(null)} />}
  </>
}