import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useRouter, useRouterState } from '@tanstack/react-router'
import { createDemo, demoIdentities, type ApplicationSummary, type ApplicationView, type Context, type ErrorKind } from '../demo'
import { products } from '../domain'
import type { ActorId, ApplicationStatus, Language } from '../domain/model'
import { date, documentLabel, errors, events, fieldLabels, money, outcomes, reviewChecks, statuses, text } from './i18n'

type Screen = { kind: 'home' | 'chooser' | 'products' | 'applicantList' | 'staffList' | 'unavailable' } | { kind: 'applicantDetail' | 'staffDetail'; id: string }
function resolveScreen(path: string): Screen {
  if (path === '/') return { kind: 'home' }
  if (path === '/sign-in') return { kind: 'chooser' }
  if (path === '/products') return { kind: 'products' }
  if (path === '/applications') return { kind: 'applicantList' }
  if (path === '/staff/applications') return { kind: 'staffList' }
  const applicant = /^\/applications\/(RIFD-2026-\d{3})$/.exec(path)
  if (applicant) return { kind: 'applicantDetail', id: applicant[1] }
  const staff = /^\/staff\/applications\/(RIFD-2026-\d{3})$/.exec(path)
  if (staff) return { kind: 'staffDetail', id: staff[1] }
  return { kind: 'unavailable' }
}

export function NeutralStartup() {
  return <main className="startup" aria-busy="true"><div className="brand"><Mark /> <span>رِفد / RIFD</span></div><h1>{text.loading.ar}</h1><p>{text.loading.en}</p></main>
}
function Mark() { return <span className="mark" aria-hidden="true"><i /><i /><i /></span> }
function Heading({ children }: { children: React.ReactNode }) { return <h1 tabIndex={-1}>{children}</h1> }
function Status({ status, language }: { status: ApplicationStatus; language: Language }) { return <span className={`status status-${status}`}>{statuses[status][language]}</span> }

export function App() {
  const demo = useMemo(() => createDemo(), [])
  const path = useRouterState({ select: state => state.location.pathname })
  const navigate = useNavigate()
  const router = useRouter()
  const screen = resolveScreen(path)
  const [context, setContext] = useState<Context | null>(null)
  const [startupError, setStartupError] = useState<ErrorKind | null>(null)
  const [error, setError] = useState<ErrorKind | null>(null)
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)
  const [list, setList] = useState<ApplicationSummary[] | null>(null)
  const [view, setView] = useState<ApplicationView | null>(null)
  const [loadedPath, setLoadedPath] = useState<string | null>(null)
  const alive = useRef(true)
  const identitySelection = useRef(false)
  const language = context?.preferences.language ?? 'ar'
  const t = (key: keyof typeof text) => text[key][language]
  const go = (to: string) => {
    setError(null)
    return to === '/' ? navigate({ to: '/' }) : navigate({ to: '/$', params: { _splat: to.slice(1) } })
  }
  const home = context?.identity?.role === 'reviewer' ? '/staff/applications' : '/applications'

  useEffect(() => {
    alive.current = true
    let active = true
    // Load the protected route component before Ready, including when starting at the chooser.
    void router.preloadRoute({ to: '/$', params: { _splat: 'applications' } }).then(() => demo.startup()).then(result => {
      if (!active) return
      if (result.ok) setContext(result.value)
      else setStartupError(result.error.kind)
    }).catch(() => { if (active) setStartupError('resources') })
    const unsubscribe = demo.subscribe(() => {
      if (identitySelection.current) return
      void demo.context().then(result => {
        if (!active || identitySelection.current) return
        if (result.ok) setContext(result.value)
        else { setContext(null); setStartupError(result.error.kind) }
      })
    })
    return () => { active = false; alive.current = false; unsubscribe(); demo.dispose() }
  }, [demo, router])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  const identity = context?.identity
  const identityId = identity?.id
  const sessionId = context?.session?.sessionId
  useEffect(() => {
    let active = true
    const current = resolveScreen(path)
    setError(null)
    setLoadedPath(null)
    setView(null)
    setList(null)
    if (!context || !identityId) return
    if (current.kind === 'home') { void navigate({ to: '/$', params: { _splat: identity?.role === 'reviewer' ? 'staff/applications' : 'applications' }, replace: true }); return }
    const staff = current.kind === 'staffList' || current.kind === 'staffDetail'
    const applicant = current.kind === 'applicantList' || current.kind === 'applicantDetail'
    if ((staff && identityId !== 'salma') || (applicant && identityId === 'salma')) { setError('unavailable'); setLoadedPath(path); return }
    if (current.kind === 'staffList' || current.kind === 'applicantList') {
      void demo.listApplications().then(result => {
        if (!active) return
        if (result.ok) setList(result.value)
        else setError(result.error.kind)
        setLoadedPath(path)
      })
    } else if (current.kind === 'staffDetail' || current.kind === 'applicantDetail') {
      void demo.readApplication(current.id).then(result => {
        if (!active) return
        if (result.ok) setView(result.value)
        else setError(result.error.kind)
        setLoadedPath(path)
      })
    } else setLoadedPath(path)
    return () => { active = false }
    // Preferences do not change the record read or revoke the current identity.
  }, [path, sessionId, identityId, reload, demo, navigate])

  const routeReady = !!context && (screen.kind === 'chooser' || screen.kind === 'products' || !identity || loadedPath === path)
  useEffect(() => {
    if (routeReady) document.querySelector<HTMLElement>('main h1')?.focus()
  }, [path, routeReady])

  const selectIdentity = async (id: ActorId) => {
    setBusy(true); setError(null); setView(null); setList(null)
    identitySelection.current = true
    const result = await demo.signIn(id)
    try {
      if (!alive.current) return
      if (!result.ok) { setError(result.error.kind); return }
      let permitted = screen.kind === 'applicantList' && id !== 'salma' || screen.kind === 'staffList' && id === 'salma'
      if (screen.kind === 'applicantDetail' && id !== 'salma' || screen.kind === 'staffDetail' && id === 'salma') {
        const access = await demo.readApplication(screen.id)
        permitted = access.ok
      }
      if (!alive.current) return
      const latest = await demo.context()
      if (!latest.ok) { setError(latest.error.kind); return }
      if (!latest.value.session) { setContext(latest.value); setError('sessionExpired'); return }
      if (!permitted) await go(id === 'salma' ? '/staff/applications' : '/applications')
      if (alive.current) setContext(latest.value)
    } catch { if (alive.current) setError('resources') }
    finally { identitySelection.current = false; if (alive.current) setBusy(false) }
  }
  const changeLanguage = async () => {
    if (!context) return
    setBusy(true); setError(null)
    const result = await demo.execute({ kind: 'setLanguage', datasetId: context.datasetId, operationId: crypto.randomUUID(), expectedRevision: context.preferences.revision, language: language === 'ar' ? 'en' : 'ar' })
    if (!alive.current) return
    setBusy(false)
    if (result.ok) setContext(result.value)
    else {
      setError(result.error.kind)
      if (result.error.kind === 'stalePreference') { const latest = await demo.context(); if (latest.ok) setContext(latest.value) }
    }
  }
  const signOut = async () => {
    setBusy(true); setView(null); setList(null)
    const result = await demo.signOut()
    if (!alive.current) return
    setBusy(false)
    if (result.ok) { setContext(result.value); go('/sign-in') } else setError(result.error.kind)
  }
  const retryStartup = async () => {
    setStartupError(null)
    try {
      await router.preloadRoute({ to: '/$', params: { _splat: 'applications' } })
      const result = await demo.startup()
      if (result.ok) setContext(result.value); else setStartupError(result.error.kind)
    } catch { setStartupError('resources') }
  }

  if (!context && !startupError) return <NeutralStartup />
  const isChooser = screen.kind === 'chooser' || screen.kind !== 'products' && screen.kind !== 'unavailable' && !identity
  const isStaff = identity?.role === 'reviewer' && !isChooser && screen.kind !== 'products'
  const unavailable = screen.kind === 'unavailable' || error === 'unavailable'
  return <div data-workspace-ready={routeReady ? 'true' : undefined}>
    <header className="header">
      <a className="brand" href="/" onClick={event => { event.preventDefault(); go('/') }}><Mark /><span>{language === 'ar' ? 'رِفد' : 'RIFD'}<small>{language === 'ar' ? 'عرض تمويل تجريبي' : 'Financing demo'}</small></span></a>
      <nav aria-label={language === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}>
        <a href="/products" onClick={event => { event.preventDefault(); go('/products') }}>{t('products')}</a>
        {identity && <a href={home} onClick={event => { event.preventDefault(); go(home) }}>{identity.role === 'reviewer' ? t('staffApplications') : t('applications')}</a>}
      </nav>
      <div className="session-controls">
        {identity && <span className="identity-name">{identity.name[language]}<small>{identity.role === 'reviewer' ? t('reviewer') : t('applicant')}</small></span>}
        <button aria-disabled={busy || !context} onClick={() => { if (!busy && context) void changeLanguage() }} lang={language === 'ar' ? 'en' : 'ar'}>{language === 'ar' ? 'English' : 'العربية'}</button>
        {identity && <><button disabled={busy} onClick={() => go('/sign-in')}>{t('switchIdentity')}</button><button disabled={busy} onClick={() => void signOut()}>{t('signOut')}</button></>}
      </div>
    </header>
    <div className={isStaff ? 'workspace staff-workspace' : 'workspace'}>
      {isStaff && <aside className="sidebar"><p className="eyebrow">{t('reviewer')}</p><nav aria-label={t('staffApplications')}><a className="active" href="/staff/applications" onClick={event => { event.preventDefault(); go('/staff/applications') }}>{t('staffApplications')}</a></nav><p>{t('staffIntro')}</p></aside>}
      <main aria-busy={busy || !routeReady}>
        {screen.kind === 'products' ? <Products language={language} />
          : startupError ? <section className="panel"><Heading>{t('startupError')}</Heading><p role="alert">{errors[startupError][language]}</p><button onClick={() => void retryStartup()}>{t('retry')}</button><a className="button secondary" href="/products" onClick={event => { event.preventDefault(); go('/products') }}>{t('products')}</a></section>
          : unavailable ? <section className="panel"><Heading>{t('unavailable')}</Heading><p>{t('unavailableDescription')}</p><a className="button" href={home} onClick={event => { event.preventDefault(); go(home) }}>{t('home')}</a><button onClick={() => go('/sign-in')}>{t('switchIdentity')}</button></section>
          : isChooser ? <section className="chooser">
            <p className="eyebrow">{language === 'ar' ? 'ابدأ الاستكشاف' : 'Explore the demo'}</p><Heading>{t('chooseIdentity')}</Heading><p className="intro">{t('chooserIntro')}</p>
            <div className="identity-grid">{demoIdentities.map(person => <button className="identity-card" key={person.id} disabled={busy} onClick={() => void selectIdentity(person.id as ActorId)} aria-label={person.name[language]}><span className="avatar" aria-hidden="true">{person.name[language].slice(0, 1)}</span><strong>{person.name[language]}</strong><span>{person.role === 'reviewer' ? t('reviewer') : t('applicant')}</span><span className="identity-arrow" aria-hidden="true">{language === 'ar' ? '←' : '→'}</span></button>)}</div>
            <p className="slice-notice">{t('sliceNotice')}</p>
          </section>
          : !routeReady ? <section className="panel loading" role="status">{t('readLoading')}</section>
          : list ? <ApplicationList list={list} language={language} staff={screen.kind === 'staffList'} go={go} />
          : view ? <ApplicationDetail view={view} language={language} /> : null}
        {error && error !== 'unavailable' && <div className="error" role="alert">{errors[error][language]}<button disabled={busy} onClick={() => setReload(value => value + 1)}>{t('retry')}</button></div>}
      </main>
    </div>
    <footer className="disclosure"><p>{t('notice')}</p><p>{t('storageNotice')}</p></footer>
  </div>
}

function Products({ language }: { language: Language }) {
  const t = (key: keyof typeof text) => text[key][language]
  return <><Heading>{t('products')}</Heading><p className="intro">{t('productIntro')}</p><div className="product-grid">{Object.values(products).map(product => <section className="panel" key={product.id}><h2>{product.name[language]}</h2><p>{product.purpose[language]}</p><dl className="facts"><div><dt>{t('minimum')}</dt><dd><bdi dir="ltr">{money(product.minimum, language)}</bdi></dd></div><div><dt>{t('maximum')}</dt><dd><bdi dir="ltr">{money(product.maximum, language)}</bdi></dd></div><div><dt>{t('term')}</dt><dd><bdi>{product.terms.join(' / ')}</bdi> {t('months')}</dd></div><div><dt>{t('markup')}</dt><dd><bdi>{product.markupPercent}%</bdi></dd></div></dl><h3>{t('documents')}</h3><ul>{(['identity', 'business', 'financial', 'purchase'] as const).map(slot => <li key={slot}>{documentLabel(slot, product.id)[language]}</li>)}</ul></section>)}</div></>
}

function ApplicationList({ list, language, staff, go }: { list: ApplicationSummary[]; language: Language; staff: boolean; go: (path: string) => void }) {
  const t = (key: keyof typeof text) => text[key][language]
  const destination = (application: ApplicationSummary) => `${staff ? '/staff' : ''}/applications/${application.id}`
  return <>
    <p className="eyebrow">{language === 'ar' ? 'مساحة العمل' : 'Workspace'}</p><Heading>{staff ? t('staffApplications') : t('applications')}</Heading><p className="intro">{staff ? t('staffIntro') : t('ownIntro')}</p>
    {staff && <div className="queue-counts" aria-label={t('all')}><div><strong>{list.length}</strong><span>{t('all')}</span></div>{(['submitted', 'underReview', 'correctionsRequested'] as const).map(status => <div key={status}><strong>{list.filter(application => application.status === status).length}</strong><span>{statuses[status][language]}</span></div>)}</div>}
    <p className="slice-notice">{t('sliceNotice')}</p>
    {staff ? <div className="panel queue-table"><table><thead><tr><th>{t('reference')}</th><th>{fieldLabels.fullName[language]} / {fieldLabels.businessName[language]}</th><th>{t('products')}</th><th>{t('amount')}</th><th>{t('status')}</th><th>{t('assignment')}</th><th>{t('submittedAt')}</th><th><span className="sr-only">{t('open')}</span></th></tr></thead><tbody>{list.map(application => <tr key={application.id}><td><bdi>{application.id}</bdi></td><td>{application.fullName}<small>{application.businessName}</small></td><td>{products[application.product].name[language]}</td><td><bdi dir="ltr">{money(application.amount, language)}</bdi></td><td><Status status={application.status} language={language} /></td><td>{application.assignedToYou ? t('assignedToYou') : application.assignment?.[language] ?? t('unassigned')}</td><td><bdi>{application.submittedAt ? date(application.submittedAt, language) : t('notSubmitted')}</bdi></td><td><a href={destination(application)} onClick={event => { event.preventDefault(); go(destination(application)) }} aria-label={`${t('open')} ${application.id}`}>{t('open')}</a></td></tr>)}</tbody></table></div> : null}
    <div className={`application-cards ${staff ? 'queue-cards' : ''}`}>{list.map(application => <article className="panel application-card" key={application.id} data-application={application.id}>
      <div className="card-heading"><bdi className="reference">{application.id}</bdi><Status status={application.status} language={language} /></div><h2>{application.businessName}</h2><p>{application.fullName} · {products[application.product].name[language]}</p>
      <dl className="facts"><div><dt>{t('amount')}</dt><dd><bdi dir="ltr">{money(application.amount, language)}</bdi></dd></div><div><dt>{t('term')}</dt><dd><bdi>{application.term}</bdi> {t('months')}</dd></div>{staff && <div><dt>{t('assignment')}</dt><dd>{application.assignedToYou ? t('assignedToYou') : application.assignment?.[language] ?? t('unassigned')}</dd></div>}<div><dt>{t('submittedAt')}</dt><dd><bdi>{application.submittedAt ? date(application.submittedAt, language) : t('notSubmitted')}</bdi></dd></div></dl>
      <a className="button secondary" href={destination(application)} onClick={event => { event.preventDefault(); go(destination(application)) }}>{staff ? t('open') : t(application.nextAction)}</a>
    </article>)}</div>
  </>
}

function ApplicationDetail({ view, language }: { view: ApplicationView; language: Language }) {
  const t = (key: keyof typeof text) => text[key][language]
  const fields = view.snapshot.fields
  const numeric = ['revenue', 'expenses', 'amount', 'budget']
  return <>
    <p className="eyebrow">{products[view.product].name[language]}</p><div className="detail-heading"><Heading><bdi>{view.id}</bdi></Heading><Status status={view.status} language={language} /></div>
    <p className="intro">{fields.fullName} · {fields.businessName}</p>
    {view.role === 'reviewer' && <p className="assignment">{t('assignment')}: {view.assignedToYou ? t('assignedToYou') : view.assignment?.[language] ?? t('unassigned')}</p>}
    <section className="summary"><h2>{t('nextAction')}</h2><p>{t(view.status === 'draft' ? 'draftNext' : view.status === 'correctionsRequested' ? 'correctionNext' : ['approved', 'rejected'].includes(view.status) ? 'finalNext' : 'waitingNext')}</p></section>
    <div className="detail-grid"><div>
      <section className="panel"><h2>{view.status === 'draft' ? t('savedInformation') : t('submittedInformation')}</h2><dl className="facts information">{Object.entries(fields).map(([key, value]) => <div key={key} className={key === 'explanation' || key === 'address' ? 'full-width' : ''}><dt>{fieldLabels[key as keyof typeof fields][language]}</dt><dd>{numeric.includes(key) ? <bdi dir="ltr">{money(value, language)}</bdi> : key === 'mobile' || key === 'email' || key === 'operatingSince' ? <bdi dir="ltr">{value}</bdi> : key === 'term' ? <><bdi>{value}</bdi> {t('months')}</> : key === 'activity' ? ({ retail: { ar: 'تجارة تجزئة', en: 'Retail' }, services: { ar: 'خدمات', en: 'Services' }, production: { ar: 'إنتاج صغير', en: 'Small production' } }[fields.activity][language]) : value || t('emptyExplanation')}</dd></div>)}</dl><p>{t('financialWindow')}: {view.evidenceMonths.map(month => <bdi key={month}>{date(month, language)} </bdi>)}</p></section>
      <section className="panel"><h2>{t('documents')}</h2><ul className="document-list">{view.documents.map(document => <li key={document.slot}><strong>{documentLabel(document.slot, view.product)[language]}</strong><p>{document.file ? <><bdi dir="ltr" className="filename">{document.file.name}</bdi><span className="file-meta"><bdi>{document.file.mime} · {new Intl.NumberFormat('en-US').format(document.file.size)} B</bdi></span><span>{view.status === 'draft' ? t('savedInDraft') : t('included')}</span></> : t('missing')}</p>{view.role === 'reviewer' && view.assessments && <p className="assessment">{outcomes[view.assessments[document.slot].status][language]}{view.assessments[document.slot].reason && <span> · {view.assessments[document.slot].reason?.[language]}</span>}</p>}</li>)}</ul></section>
      {view.rounds.map(round => <section className="panel" key={round.id}><h2>{t('corrections')}</h2><p>{t('baseline')}: <bdi>{date(round.requestedAt, language)}</bdi></p><ul>{round.targets.map((target, index) => <li key={index}><strong>{target.kind === 'field' ? fieldLabels[target.field][language] : documentLabel(target.slot, view.product)[language]}</strong><p>{target.reason[language]}</p></li>)}</ul></section>)}
      {view.role === 'applicant' && view.status === 'correctionsRequested' && view.workspace && <section className="summary"><h2>{t('privateWorkspace')}</h2><p>{t('privateUnchanged')}</p><p>{t('amount')}: <bdi dir="ltr">{money(view.workspace.snapshot.fields.amount, language)}</bdi></p></section>}
      <section className="panel"><h2>{t('history')}</h2>{view.history.length ? <ol className="timeline">{view.history.map(event => <li key={event.id}><strong>{events[event.kind][language]}</strong><bdi className="event-date">{date(event.date, language)}</bdi>{event.reason && <p>{event.reason[language]}</p>}</li>)}</ol> : <p>{t('noHistory')}</p>}</section>
    </div><div>
      <section className="summary"><h2>{products[view.product].name[language]}</h2><dl className="facts"><div><dt>{t('amount')}</dt><dd><bdi dir="ltr">{money(fields.amount, language)}</bdi></dd></div><div><dt>{t('term')}</dt><dd><bdi>{fields.term}</bdi> {t('months')}</dd></div><div><dt>{t('submittedAt')}</dt><dd><bdi>{view.submittedAt ? date(view.submittedAt, language) : t('notSubmitted')}</bdi></dd></div></dl></section>
      {view.role === 'reviewer' && <><section className="panel"><h2>{t('checks')}</h2><ul className="review-list">{Object.entries(view.checks ?? {}).map(([key, outcome]) => <li key={key}><span>{reviewChecks[key][language]}</span><strong>{outcomes[outcome][language]}</strong></li>)}</ul></section><section className="panel"><h2>{t('notes')}</h2>{view.notes.length ? view.notes.map(note => <p key={note.id}>{note.text[language]}<bdi className="event-date">{date(note.date, language)}</bdi></p>) : <p>{t('noNotes')}</p>}</section><section className="panel"><h2>{t('activity')}</h2><ol className="timeline">{view.activity.map(event => <li key={event.id}><strong>{events[event.kind][language]}</strong><bdi className="event-date">{date(event.date, language)}</bdi><span>{demoIdentities.find(identity => identity.id === event.actor)?.name[language] ?? (language === 'ar' ? 'خالد علي' : 'Khaled Ali')}</span></li>)}</ol></section></>}
      {view.repayment && <section className="panel"><h2>{t('repayment')}</h2><p>{t('notice')}</p><dl className="facts">{(['amount', 'markup', 'total', 'completed', 'remaining'] as const).map(key => <div key={key}><dt>{t(key)}</dt><dd><bdi dir="ltr">{money(view.repayment![key], language)}</bdi></dd></div>)}</dl><ol className="repayment-list">{view.repayment.rows.map(row => <li key={row.due}><bdi>{date(row.due, language)}</bdi><bdi dir="ltr">{money(row.amount, language)}</bdi><span>{t(row.status === 'completed' ? 'completedRow' : 'upcoming')}</span></li>)}</ol></section>}
    </div></div>
  </>
}
