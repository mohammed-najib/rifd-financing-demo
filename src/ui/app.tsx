import { useEffect, useMemo, useRef, useState } from 'react'
import { useBlocker, useNavigate, useRouter, useRouterState } from '@tanstack/react-router'
import { createDemo, demoIdentities, type ApplicationSummary, type ApplicationView, type Context, type ErrorKind, type LanguageOperation } from '../demo'
import { products, resolveStep } from '../domain'
import type { ActorId, ApplicationStatus, Language, ProductId } from '../domain/model'
import { date, displayFieldValue, documentLabel, errors, events, fieldLabels, money, outcomes, reviewChecks, statuses, text } from './i18n'
import { DraftEditor, draftDirty, type DraftBuffer } from './draft'
import { DepartureDialog, type Departure, type DepartureRequest } from './departure'
import { DocumentPreview } from './preview'
import { applicationText } from './application-copy'

type Screen = { kind: 'home' | 'chooser' | 'products' | 'applicantList' | 'staffList' | 'newDraft' | 'unavailable' } | { kind: 'applicantDetail' | 'staffDetail'; id: string }
function resolveScreen(path: string): Screen {
  if (path === '/') return { kind: 'home' }
  if (path === '/sign-in') return { kind: 'chooser' }
  if (path === '/products') return { kind: 'products' }
  if (path === '/applications') return { kind: 'applicantList' }
  if (path === '/staff/applications') return { kind: 'staffList' }
  if (path === '/applications/new') return { kind: 'newDraft' }
  const applicant = /^\/applications\/(RIFD-2026-[a-zA-Z0-9-]+)(?:\/edit)?$/.exec(path)
  if (applicant) return { kind: 'applicantDetail', id: applicant[1] }
  const staff = /^\/staff\/applications\/(RIFD-2026-\d{3})$/.exec(path)
  if (staff) return { kind: 'staffDetail', id: staff[1] }
  return { kind: 'unavailable' }
}

export function NeutralStartup() {
  return <main className="startup mx-auto my-[14vh] max-w-[620px] p-[35px] text-center" aria-busy="true"><div className="brand"><Mark /> <span>رِفد / RIFD</span></div><h1>{text.loading.ar}</h1><p>{text.loading.en}</p></main>
}
function Mark() { return <span className="flex h-[35px] items-end gap-1 [direction:ltr]" aria-hidden="true"><i className="block h-[17px] w-2 rounded-[2px] bg-accent" /><i className="block h-[25px] w-2 rounded-[2px] bg-accent" /><i className="block h-[35px] w-2 rounded-[2px] bg-accent" /></span> }
function Heading({ children }: { children: React.ReactNode }) { return <h1 tabIndex={-1}>{children}</h1> }
const statusColors: Record<ApplicationStatus, string> = {
  draft: 'bg-status-draft text-status-draft-text',
  submitted: 'bg-status-submitted text-status-submitted-text',
  underReview: 'bg-status-review text-status-review-text',
  correctionsRequested: 'bg-status-corrections text-status-corrections-text',
  approved: 'bg-status-approved text-status-approved-text',
  rejected: 'bg-status-rejected text-status-rejected-text',
}
const eventDateClassName = 'mt-[3px] mb-2 block text-[11px] text-muted'
function Status({ status, language }: { status: ApplicationStatus; language: Language }) { return <span className={`status ${statusColors[status]}`}>{statuses[status][language]}</span> }

export function App() {
  const demo = useMemo(() => createDemo(), [])
  const search = useRouterState({ select: state => state.location.search }) as { product?: string; step?: string }
  const step = resolveStep(search.step)
  const chosenProduct: ProductId = search.product === 'equipment' ? 'equipment' : 'inventory'
  const path = useRouterState({ select: state => state.location.pathname })
  const href = useRouterState({ select: state => state.location.href })
  const navigate = useNavigate()
  const router = useRouter()
  const screen = resolveScreen(path)
  const [context, setContext] = useState<Context | null>(null)
  const [startupError, setStartupError] = useState<ErrorKind | null>(null)
  const [error, setError] = useState<ErrorKind | null>(null)
  const [busy, setBusy] = useState(false)
  const [languageConflict, setLanguageConflict] = useState<{ intent: LanguageOperation; latest: Context | null } | null>(null)
  const [reload, setReload] = useState(0)
  const [list, setList] = useState<ApplicationSummary[] | null>(null)
  const [view, setView] = useState<ApplicationView | null>(null)
  const [loadedPath, setLoadedPath] = useState<string | null>(null)
  const alive = useRef(true)
  const identitySelection = useRef(false)
  const contextRequest = useRef(0)
  const newDraftId = useRef<string | null>(null)
  const draftBuffers = useRef(new Map<string, DraftBuffer>())
  const departure = useRef<Departure | null>(null)
  const [, refreshDeparture] = useState(0)
  const [leaving, setLeaving] = useState<DepartureRequest | null>(null)
  const currentContext = useRef(context)
  const lastProtected = useRef<string | null>(null)
  const recovery = useRef<{ identity: ActorId; datasetId: string; href: string } | null>(null)
  currentContext.current = context
  if (context?.session && !['home', 'chooser', 'products', 'unavailable'].includes(screen.kind)) lastProtected.current = href
  const acceptContext = (next: Context) => {
    const previous = currentContext.current
    if (previous?.datasetId && previous.datasetId !== next.datasetId) {
      draftBuffers.current.clear(); recovery.current = null; newDraftId.current = null
    } else if (previous?.session && !next.session) {
      recovery.current = { identity: previous.session.identity, datasetId: previous.datasetId, href: lastProtected.current ?? (previous.identity?.role === 'reviewer' ? '/staff/applications' : '/applications') }
    }
    currentContext.current = next
    setContext(next)
  }
  const loadedContext = useRef('')
  const language = context?.preferences.language ?? 'ar'
  const t = (key: keyof typeof text) => text[key][language]
  const navigateTo = (to: string) => {
    setError(null)
    const target = new URL(to, window.location.origin)
    return to === '/' ? navigate({ to: '/' }) : navigate({ to: '/$', params: { _splat: target.pathname.slice(1) }, search: { product: target.searchParams.get('product') ?? undefined, step: target.searchParams.get('step') ?? undefined } })
  }
  const needsDeparture = () => !!departure.current?.dirty || !!departure.current?.pending || !!currentContext.current?.session && [...draftBuffers.current.values()].some(draftDirty)
  const guard = (action: () => void) => {
    if (needsDeparture()) setLeaving({ action, discardOnly: !departure.current?.save })
    else action()
  }
  const go = navigateTo
  useBlocker({
    shouldBlockFn: ({ current, next }) => {
      if (current.pathname === next.pathname || !needsDeparture()) return false
      return new Promise<boolean>(resolve => setLeaving({ action: () => resolve(false), cancel: () => resolve(true), discardOnly: !departure.current?.save }))
    },
    enableBeforeUnload: () => !!departure.current?.dirty || !!departure.current?.pending || [...draftBuffers.current.values()].some(draftDirty),
  })
  const home = context?.identity?.role === 'reviewer' ? '/staff/applications' : '/applications'

  useEffect(() => {
    alive.current = true
    let active = true
    // Load the protected route component before Ready, including when starting at the chooser.
    void router.preloadRoute({ to: '/$', params: { _splat: 'applications' } }).then(() => demo.startup()).then(result => {
      if (!active) return
      if (result.ok) acceptContext(result.value)
      else setStartupError(result.error.kind)
    }).catch(() => { if (active) setStartupError('resources') })
    const unsubscribe = demo.subscribe(currentSession => {
      if (!active) return
      const request = ++contextRequest.current
      // Authority loss covers protected content without waiting for busy storage.
      if (!currentSession && currentContext.current?.session) {
        acceptContext({ ...currentContext.current, session: null, identity: null })
        setView(null); setList(null)
      }
      if (identitySelection.current) return
      void demo.context().then(result => {
        if (!active || identitySelection.current || request !== contextRequest.current) return
        if (result.ok) { acceptContext(result.value); setReload(value => value + 1) }
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
    const readContext = `${path}/${identityId}/${sessionId}`
    if (loadedContext.current !== readContext) {
      loadedContext.current = readContext
      setLoadedPath(null); setView(null); setList(null)
    }
    if (!context || !identityId) return
    if (current.kind === 'home') { void navigate({ to: '/$', params: { _splat: identity?.role === 'reviewer' ? 'staff/applications' : 'applications' }, replace: true }); return }
    const staff = current.kind === 'staffList' || current.kind === 'staffDetail'
    const applicant = current.kind === 'applicantList' || current.kind === 'applicantDetail' || current.kind === 'newDraft'
    if ((staff && identityId !== 'salma') || (applicant && identityId === 'salma')) { setError('unavailable'); setLoadedPath(path); return }
    const retainedNew = current.kind === 'newDraft' && newDraftId.current ? draftBuffers.current.get(`${context.datasetId}/${identityId}/${newDraftId.current}`) : undefined
    if (retainedNew) {
      void demo.readApplication(retainedNew.baseline.id).then(result => {
        if (!active) return
        if (result.ok && result.value.status === 'draft') { setList(null); setView(result.value) }
        else setError(result.ok ? 'unavailable' : result.error.kind)
        setLoadedPath(path)
      })
      return () => { active = false }
    }
    if (current.kind === 'staffList' || current.kind === 'applicantList' || current.kind === 'newDraft') {
      void demo.listApplications().then(result => {
        if (!active) return
        if (result.ok) setList(result.value)
        else setError(result.error.kind)
        setLoadedPath(path)
      })
    } else if (current.kind === 'staffDetail' || current.kind === 'applicantDetail') {
      void demo.readApplication(current.id).then(result => {
        if (!active) return
        if (result.ok) {
          setView(result.value)
          if (path.endsWith('/edit') && result.value.status !== 'draft') { departure.current = null; void navigateTo(path.slice(0, -5)) }
        }
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
  }, [path, routeReady, sessionId])

  const selectIdentity = async (id: ActorId, intentional = false) => {
    if ([...draftBuffers.current.entries()].some(([key, buffer]) => !key.startsWith(`${context?.datasetId}/${id}/`) && draftDirty(buffer))) {
      setLeaving({ action: () => { draftBuffers.current.clear(); newDraftId.current = null; void selectIdentity(id, true) }, discardOnly: true })
      return
    }
    setBusy(true); setError(null); setView(null); setList(null)
    contextRequest.current++
    identitySelection.current = true
    const result = await demo.signIn(id)
    try {
      if (!alive.current) return
      if (!result.ok) { setError(result.error.kind); return }
      const interrupted = recovery.current
      const ownRecovery = interrupted?.identity === id && interrupted.datasetId === result.value.datasetId
      let target = intentional || interrupted && !ownRecovery ? (id === 'salma' ? '/staff/applications' : '/applications') : ownRecovery ? interrupted.href : href
      const destination = resolveScreen(new URL(target, window.location.origin).pathname)
      let permitted = destination.kind === 'newDraft' && id !== 'salma' || destination.kind === 'applicantList' && id !== 'salma' || destination.kind === 'staffList' && id === 'salma'
      if (destination.kind === 'applicantDetail' && id !== 'salma' || destination.kind === 'staffDetail' && id === 'salma') {
        const access = await demo.readApplication(destination.id)
        permitted = access.ok
        if (access.ok && access.value.status !== 'draft' && new URL(target, window.location.origin).pathname.endsWith('/edit')) target = `/applications/${destination.id}`
      }
      if (!alive.current) return
      const latest = await demo.context()
      if (!latest.ok) { setError(latest.error.kind); return }
      if (latest.value.session?.sessionId !== result.value.session?.sessionId) { acceptContext(latest.value); setError('sessionExpired'); return }
      if (!permitted) target = id === 'salma' ? '/staff/applications' : '/applications'
      if (target !== href) await go(target)
      if (alive.current) { recovery.current = null; acceptContext(latest.value) }
    } catch { if (alive.current) setError('resources') }
    finally { identitySelection.current = false; if (alive.current) setBusy(false) }
  }
  const changeLanguage = async (intent?: LanguageOperation) => {
    if (!context) return
    const capturedSession = context.session?.sessionId
    const command: LanguageOperation = intent ?? { kind: 'setLanguage', datasetId: context.datasetId, operationId: crypto.randomUUID(), expectedRevision: context.preferences.revision, language: language === 'ar' ? 'en' : 'ar' }
    setBusy(true); setError(null)
    const result = await demo.execute(command)
    if (!alive.current) return
    setBusy(false)
    if (capturedSession !== currentContext.current?.session?.sessionId || command.datasetId !== currentContext.current?.datasetId) return
    if (result.ok) { setLanguageConflict(null); acceptContext(result.value) }
    else {
      if (result.error.kind === 'stalePreference') setLanguageConflict({ intent: command, latest: null })
      else setError(result.error.kind)
    }
  }
  const inspectLanguage = async () => {
    if (!languageConflict) return
    const intent = languageConflict.intent
    setBusy(true)
    const result = await demo.context()
    if (!alive.current) return
    setBusy(false)
    if (result.ok && result.value.datasetId === intent.datasetId) {
      setLanguageConflict(current => current?.intent === intent ? { intent, latest: result.value } : current)
      acceptContext(result.value)
    } else if (!result.ok) setError(result.error.kind)
  }
  const signOut = async () => {
    setBusy(true); setView(null); setList(null)
    const result = await demo.signOut()
    if (!alive.current) return
    setBusy(false)
    if (result.ok) { draftBuffers.current.clear(); newDraftId.current = null; acceptContext(result.value); recovery.current = null; void navigateTo('/sign-in') } else setError(result.error.kind)
  }

  useEffect(() => { setLeaving(current => { current?.cancel?.(); return null }) }, [sessionId])
  useEffect(() => { setLanguageConflict(null) }, [sessionId, context?.datasetId])
  const retryStartup = async () => {
    setStartupError(null)
    try {
      await router.preloadRoute({ to: '/$', params: { _splat: 'applications' } })
      const result = await demo.startup()
      if (result.ok) acceptContext(result.value); else setStartupError(result.error.kind)
    } catch { setStartupError('resources') }
  }

  if (!context && !startupError) return <NeutralStartup />
  const isChooser = screen.kind === 'chooser' || screen.kind !== 'products' && screen.kind !== 'unavailable' && !identity
  const isStaff = identity?.role === 'reviewer' && !isChooser && screen.kind !== 'products'
  const unavailable = screen.kind === 'unavailable' || error === 'unavailable'
  return <div data-workspace-ready={routeReady ? 'true' : undefined}>
    <header className="header flex flex-wrap items-center gap-[30px] border-0 border-b border-solid border-border bg-white px-[4%] py-5 compact:gap-5 narrow:gap-[15px] narrow:px-[5%] narrow:py-4">
      <a className="brand" href="/" onClick={event => { event.preventDefault(); go('/') }}><Mark /><span>{language === 'ar' ? 'رِفد' : 'RIFD'}<small>{language === 'ar' ? 'عرض تمويل تجريبي' : 'Financing demo'}</small></span></a>
      <nav aria-label={language === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}>
        <a href="/products" onClick={event => { event.preventDefault(); go('/products') }}>{t('products')}</a>
        {identity && <a href={home} onClick={event => { event.preventDefault(); go(home) }}>{identity.role === 'reviewer' ? t('staffApplications') : t('applications')}</a>}
      </nav>
      <div className="session-controls ms-auto flex flex-wrap items-center gap-3 compact:ms-0 narrow:w-full narrow:gap-2.5">
        {identity && <span className="identity-name font-semibold leading-[1.6] narrow:me-auto narrow:text-[13px]">{identity.name[language]}<small>{identity.role === 'reviewer' ? t('reviewer') : t('applicant')}</small></span>}
        <button aria-disabled={busy || !context || !!languageConflict} onClick={() => { if (!busy && context && !languageConflict) void changeLanguage() }} lang={language === 'ar' ? 'en' : 'ar'}>{language === 'ar' ? 'English' : 'العربية'}</button>
        {identity && <><button disabled={busy} onClick={() => go('/sign-in')}>{t('switchIdentity')}</button><button disabled={busy} onClick={() => guard(() => { void signOut() })}>{t('signOut')}</button><button onClick={() => demo.expireSession()}>{t('expireSession')}</button></>}
      </div>
    </header>
    <div className={`mx-auto max-w-[1440px] px-[4%] pt-[42px] pb-[60px] narrow:px-[5%] narrow:pt-7 narrow:pb-10 ${isStaff ? 'grid grid-cols-[190px_minmax(0,1fr)] gap-8 compact:grid-cols-1' : ''}`}>
      {isStaff && <aside className="sidebar py-5 compact:flex compact:flex-wrap compact:items-center compact:gap-5 compact:p-0 narrow:gap-3"><p className="eyebrow">{t('reviewer')}</p><nav aria-label={t('staffApplications')}><a className="active" href="/staff/applications" onClick={event => { event.preventDefault(); go('/staff/applications') }}>{t('staffApplications')}</a></nav><p>{t('staffIntro')}</p></aside>}
      <main aria-busy={busy || !routeReady}>
        {languageConflict && <section className="summary mb-6" aria-label={t('preferenceConflict')}>
          <p role="status">{errors.stalePreference[language]}</p>
          <p>{t('unappliedLanguage')}: {text[languageConflict.intent.language === 'ar' ? 'arabic' : 'english'][language]}</p>
          <button disabled={busy} onClick={() => void inspectLanguage()}>{t('inspectPreference')}</button>
          {languageConflict.latest && <><p>{t('latestLanguage')}: {text[languageConflict.latest.preferences.language === 'ar' ? 'arabic' : 'english'][language]}</p><button disabled={busy} onClick={() => void changeLanguage({ ...languageConflict.intent, operationId: crypto.randomUUID(), expectedRevision: languageConflict.latest!.preferences.revision })}>{t('reapplyPreference')}</button></>}
          <button disabled={busy} onClick={() => setLanguageConflict(null)}>{t('discardPreference')}</button>
        </section>}
        {screen.kind === 'products' ? <Products language={language} choose={product => void go(`/applications/new?product=${product}`)} />
          : startupError ? <section className="panel"><Heading>{t('startupError')}</Heading><p role="alert">{errors[startupError][language]}</p><button onClick={() => void retryStartup()}>{t('retry')}</button><a className="button secondary" href="/products" onClick={event => { event.preventDefault(); go('/products') }}>{t('products')}</a></section>
          : unavailable ? <section className="panel"><Heading>{t('unavailable')}</Heading><p>{t('unavailableDescription')}</p><a className="button" href={home} onClick={event => { event.preventDefault(); go(home) }}>{t('home')}</a><button onClick={() => go('/sign-in')}>{t('switchIdentity')}</button></section>
          : isChooser ? <section className="mx-auto mt-[15px] mb-10 max-w-[970px] narrow:mt-[5px] narrow:mb-5">
            <p className="eyebrow">{language === 'ar' ? 'ابدأ الاستكشاف' : 'Explore the demo'}</p><Heading>{t('chooseIdentity')}</Heading><p className="intro">{t('chooserIntro')}</p>
            {recovery.current && <p className="summary" role="status">{t('recoverSession')}</p>}
            <div className="grid grid-cols-2 gap-5 narrow:grid-cols-1 narrow:gap-3.5">{demoIdentities.map(person => <button className="identity-card grid min-h-[140px] grid-cols-[52px_1fr_20px] items-center gap-x-[18px] gap-y-[2px] rounded-[15px] border-border bg-white p-[26px] text-start text-ink narrow:min-h-[110px] narrow:p-5" key={person.id} disabled={busy} onClick={() => void selectIdentity(person.id as ActorId)} aria-label={person.name[language]}><span className="row-[1/3] flex size-[52px] items-center justify-center rounded-[50%] bg-summary text-[22px] text-accent" aria-hidden="true">{person.name[language].slice(0, 1)}</span><strong>{person.name[language]}</strong><span>{person.role === 'reviewer' ? t('reviewer') : t('applicant')}</span><span className="col-start-3 row-[1/3] text-[24px] text-accent" aria-hidden="true">{language === 'ar' ? '←' : '→'}</span></button>)}</div>
            <p className="my-[22px] text-[13px] text-muted">{t('sliceNotice')}</p>
          </section>
          : !routeReady ? <section className="panel min-h-[250px] pt-[75px] text-center text-muted narrow:pt-5" role="status">{t('readLoading')}</section>
          : screen.kind === 'newDraft' && !view ? <section className="panel"><Heading>{applicationText.chooseDraft[language]}</Heading><h2>{products[chosenProduct].name[language]}</h2><p>{applicationText.choiceHint[language]}</p><button disabled={busy} onClick={async () => {
            setBusy(true)
            const result = await demo.newDraft(chosenProduct)
            if (result.ok) { newDraftId.current = result.value.id; setList(null); setView(result.value) } else setError(result.error.kind)
            setBusy(false)
          }}>{applicationText.new[language]}</button><div className="actions">{list?.filter(application => application.status === 'draft').map(application => <a className="button secondary" key={application.id} href={`/applications/${application.id}/edit?step=personal`} onClick={event => { event.preventDefault(); void go(`/applications/${application.id}/edit?step=personal`) }}>{applicationText.resume[language]} <bdi>{application.id}</bdi> · {products[application.product].name[language]}</a>)}</div></section>
          : list ? <ApplicationList list={list} language={language} staff={screen.kind === 'staffList'} go={go} />
          : view ? <ApplicationDetail key={`${context?.datasetId}/${identityId}/${sessionId}/${view.id}`} demo={demo} view={view} language={language}>{view.role === 'applicant' && view.status === 'draft' && context && <DraftEditor demo={demo} view={view} context={context} language={language} step={step} changeStep={step => { void go(`${path}?${screen.kind === 'newDraft' ? `product=${chosenProduct}&` : ''}step=${step}`) }} retained={draftBuffers.current.get(`${context.datasetId}/${identityId}/${view.id}`)} remember={buffer => draftBuffers.current.set(`${context.datasetId}/${identityId}/${view.id}`, buffer)} savedView={application => {
            setView(application)
            // Saving names the same editor's durable route; it does not leave its buffer.
            if (screen.kind === 'newDraft') void navigate({ to: '/$', params: { _splat: `applications/${application.id}/edit` }, search: { step }, ignoreBlocker: true })
          }} departure={value => { departure.current = value; refreshDeparture(value => value + 1) }} />}</ApplicationDetail> : null}
        {error && error !== 'unavailable' && <div className="my-5 rounded-[10px] border border-solid border-danger-border bg-danger-surface px-5 py-4 text-danger-text [&_button]:mt-[15px] [&_button]:block" role="alert">{errors[error][language]}<button disabled={busy} onClick={() => setReload(value => value + 1)}>{t('retry')}</button></div>}
      </main>
    </div>
    <footer className="disclosure border-0 border-t border-solid border-border bg-footer px-[4%] py-6 text-[12px] text-muted narrow:px-[5%] narrow:py-5"><p>{t('notice')}</p><p>{t('tabSessions')}</p><p>{t('storageNotice')}</p></footer>
    {leaving && <DepartureDialog request={leaving} work={departure.current} language={language}
      cancel={() => { leaving.cancel?.(); setLeaving(null) }}
      discard={() => { departure.current?.discard(); departure.current = null; draftBuffers.current.clear(); newDraftId.current = null; setLeaving(null); leaving.action() }}
      finish={() => { departure.current = null; setLeaving(null); leaving.action() }} />}
  </div>
}

function Products({ language, choose }: { language: Language; choose: (product: ProductId) => void }) {
  const t = (key: keyof typeof text) => text[key][language]
  return <><Heading>{t('products')}</Heading><p className="intro">{t('productIntro')}</p><div className="grid grid-cols-2 gap-[25px] narrow:grid-cols-1">{Object.values(products).map(product => <section className="panel" key={product.id}><h2>{product.name[language]}</h2><p>{product.purpose[language]}</p><dl className="facts"><div><dt>{t('minimum')}</dt><dd><bdi dir="ltr">{money(product.minimum, language)}</bdi></dd></div><div><dt>{t('maximum')}</dt><dd><bdi dir="ltr">{money(product.maximum, language)}</bdi></dd></div><div><dt>{t('term')}</dt><dd><bdi>{product.terms.join(' / ')}</bdi> {t('months')}</dd></div><div><dt>{t('markup')}</dt><dd><bdi>{product.markupPercent}%</bdi><small>{applicationText.once[language]}</small></dd></div></dl><h3>{t('documents')}</h3><ul>{(['identity', 'business', 'financial', 'purchase'] as const).map(slot => <li key={slot}>{documentLabel(slot, product.id)[language]}</li>)}</ul><p>{applicationText.eligibility[language]}</p><button onClick={() => choose(product.id)}>{applicationText.choose[language]}</button></section>)}</div></>
}

function ApplicationList({ list, language, staff, go }: { list: ApplicationSummary[]; language: Language; staff: boolean; go: (path: string) => void }) {
  const t = (key: keyof typeof text) => text[key][language]
  const destination = (application: ApplicationSummary) => `${staff ? '/staff' : ''}/applications/${application.id}${application.status === 'draft' ? '/edit?step=personal' : ''}`
  return <>
    <p className="eyebrow">{language === 'ar' ? 'مساحة العمل' : 'Workspace'}</p><Heading>{staff ? t('staffApplications') : t('applications')}</Heading><p className="intro">{staff ? t('staffIntro') : t('ownIntro')}</p>
    {!staff && <a className="button secondary mb-5" href="/products" onClick={event => { event.preventDefault(); go('/products') }}>{applicationText.new[language]}</a>}
    {staff && <div className="queue-counts grid grid-cols-4 gap-[15px] narrow:grid-cols-2 narrow:gap-2.5" aria-label={t('all')}><div><strong>{list.length}</strong><span>{t('all')}</span></div>{(['submitted', 'underReview', 'correctionsRequested'] as const).map(status => <div key={status}><strong>{list.filter(application => application.status === status).length}</strong><span>{statuses[status][language]}</span></div>)}</div>}
    <p className="my-[22px] text-[13px] text-muted">{t('sliceNotice')}</p>
    {staff ? <div className="panel overflow-hidden p-0 compact:hidden"><table><thead><tr><th>{t('reference')}</th><th>{fieldLabels.fullName[language]} / {fieldLabels.businessName[language]}</th><th>{t('products')}</th><th>{t('amount')}</th><th>{t('status')}</th><th>{t('assignment')}</th><th>{t('submittedAt')}</th><th><span className="sr-only">{t('open')}</span></th></tr></thead><tbody>{list.map(application => <tr key={application.id}><td><bdi>{application.id}</bdi></td><td>{application.fullName}<small>{application.businessName}</small></td><td>{products[application.product].name[language]}</td><td><bdi dir="ltr">{money(application.amount, language)}</bdi></td><td><Status status={application.status} language={language} /></td><td>{application.assignedToYou ? t('assignedToYou') : application.assignment?.[language] ?? t('unassigned')}</td><td><bdi>{application.submittedAt ? date(application.submittedAt, language) : t('notSubmitted')}</bdi></td><td><a href={destination(application)} onClick={event => { event.preventDefault(); go(destination(application)) }} aria-label={`${t('open')} ${application.id}`}>{t('open')}</a></td></tr>)}</tbody></table></div> : null}
    <div className={`grid-cols-2 gap-[22px] narrow:grid-cols-1 ${staff ? 'hidden compact:grid' : 'grid'}`}>{list.map(application => <article className="panel application-card" key={application.id} data-application={application.id}>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3"><bdi className="font-latin text-[13px] text-muted">{application.id}</bdi><Status status={application.status} language={language} /></div><h2>{application.businessName}</h2><p>{application.fullName} · {products[application.product].name[language]}</p>
      <dl className="facts"><div><dt>{t('amount')}</dt><dd><bdi dir="ltr">{money(application.amount, language)}</bdi></dd></div><div><dt>{t('term')}</dt><dd><bdi>{displayFieldValue('term', application.term, language)}</bdi> {t('months')}</dd></div>{staff && <div><dt>{t('assignment')}</dt><dd>{application.assignedToYou ? t('assignedToYou') : application.assignment?.[language] ?? t('unassigned')}</dd></div>}<div><dt>{t('submittedAt')}</dt><dd><bdi>{application.submittedAt ? date(application.submittedAt, language) : t('notSubmitted')}</bdi></dd></div></dl>
      <a className="button secondary" href={destination(application)} onClick={event => { event.preventDefault(); go(destination(application)) }}>{staff ? t('open') : t(application.nextAction)}</a>
    </article>)}</div>
  </>
}

function ApplicationDetail({ demo, view, language, children }: { demo: ReturnType<typeof createDemo>; view: ApplicationView; language: Language; children?: React.ReactNode }) {
  const [previewFileId, setPreviewFileId] = useState<string | null>(null)
  useEffect(() => { if (previewFileId && !view.documents.some(document => document.file?.id === previewFileId)) setPreviewFileId(null) }, [view, previewFileId])
  const t = (key: keyof typeof text) => text[key][language]
  const fields = view.snapshot.fields
  const numeric = ['revenue', 'expenses', 'amount', 'budget']
  return <>
    <p className="eyebrow">{products[view.product].name[language]}</p><div className="detail-heading mb-2.5 flex flex-wrap items-center gap-5 narrow:gap-3"><Heading>{view.status === 'draft' && view.role === 'applicant' && !view.workspace?.savedAt ? applicationText.new[language] : <bdi>{view.id}</bdi>}</Heading><Status status={view.status} language={language} /></div>
    <p className="intro">{fields.fullName} · {fields.businessName}</p>
    {view.role === 'reviewer' && <p className="mb-[25px] text-[14px] text-accent">{t('assignment')}: {view.assignedToYou ? t('assignedToYou') : view.assignment?.[language] ?? t('unassigned')}</p>}
    <section className="summary"><h2>{t('nextAction')}</h2><p>{t(view.status === 'draft' ? 'draftNext' : view.status === 'correctionsRequested' ? 'correctionNext' : ['approved', 'rejected'].includes(view.status) ? 'finalNext' : 'waitingNext')}</p></section>
    {children}
    {(view.status !== 'draft' || view.role === 'applicant' && !!view.workspace?.savedAt) && <div className="detail-grid grid grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)] gap-[25px] compact:grid-cols-[minmax(0,1.4fr)_minmax(240px,1fr)] narrow:grid-cols-1"><div>
      <section className="panel"><h2>{view.status === 'draft' ? t('savedInformation') : t('submittedInformation')}</h2><dl className="facts information">{Object.entries(fields).map(([key, value]) => <div key={key} className={key === 'explanation' || key === 'address' ? 'col-span-full narrow:col-auto' : ''}><dt>{fieldLabels[key as keyof typeof fields][language]}</dt><dd>{numeric.includes(key) ? <bdi dir="ltr">{money(value, language)}</bdi> : key === 'mobile' || key === 'email' || key === 'operatingSince' ? <bdi dir="ltr">{displayFieldValue(key as keyof typeof fields, value, language)}</bdi> : key === 'term' ? <><bdi>{displayFieldValue('term', value, language)}</bdi> {t('months')}</> : key === 'activity' ? ({ retail: { ar: 'تجارة تجزئة', en: 'Retail' }, services: { ar: 'خدمات', en: 'Services' }, production: { ar: 'إنتاج صغير', en: 'Small production' } }[fields.activity][language]) : value || t('emptyExplanation')}</dd></div>)}</dl><p>{t('financialWindow')}: {view.evidenceMonths.map(month => <bdi key={month}>{date(month, language)} </bdi>)}</p></section>
      <section className="panel"><h2>{t('documents')}</h2><ul className="document-list">{view.documents.map(document => <li key={document.slot}><strong>{documentLabel(document.slot, view.product)[language]}</strong><p>{document.file ? <><bdi dir="ltr" className="wrap-anywhere">{document.file.name}</bdi><span className="text-[11px]"><bdi>{document.file.mime} · {new Intl.NumberFormat('en-US').format(document.file.size)} B</bdi></span><span>{view.status === 'draft' ? t('savedInDraft') : t('included')}</span></> : t('missing')}</p>{document.file && <button className="secondary" onClick={() => setPreviewFileId(document.file!.id)}>{language === 'ar' ? 'معاينة' : 'Preview'} {documentLabel(document.slot, view.product)[language]}</button>}{view.role === 'reviewer' && view.assessments && <p className="rounded-[6px] bg-canvas px-3 py-2">{outcomes[view.assessments[document.slot].status][language]}{view.assessments[document.slot].reason && <span> · {view.assessments[document.slot].reason?.[language]}</span>}</p>}</li>)}</ul></section>
      {view.rounds.map(round => <section className="panel" key={round.id}><h2>{t('corrections')}</h2><p>{t('baseline')}: <bdi>{date(round.requestedAt, language)}</bdi></p><ul>{round.targets.map((target, index) => <li key={index}><strong>{target.kind === 'field' ? fieldLabels[target.field][language] : documentLabel(target.slot, view.product)[language]}</strong><p>{target.reason[language]}</p></li>)}</ul></section>)}
      {view.role === 'applicant' && view.status === 'correctionsRequested' && view.workspace && <section className="summary"><h2>{t('privateWorkspace')}</h2><p>{t('privateUnchanged')}</p><p>{t('amount')}: <bdi dir="ltr">{money(view.workspace.snapshot.fields.amount, language)}</bdi></p></section>}
      <section className="panel"><h2>{t('history')}</h2>{view.history.length ? <ol className="timeline">{view.history.map(event => <li key={event.id}><strong>{events[event.kind][language]}</strong><bdi className={eventDateClassName}>{date(event.date, language)}</bdi>{event.reason && <p>{event.reason[language]}</p>}</li>)}</ol> : <p>{t('noHistory')}</p>}</section>
    </div><div>
      <section className="summary"><h2>{products[view.product].name[language]}</h2><dl className="facts"><div><dt>{t('amount')}</dt><dd><bdi dir="ltr">{money(fields.amount, language)}</bdi></dd></div><div><dt>{t('term')}</dt><dd><bdi>{displayFieldValue('term', fields.term, language)}</bdi> {t('months')}</dd></div><div><dt>{t('submittedAt')}</dt><dd><bdi>{view.submittedAt ? date(view.submittedAt, language) : t('notSubmitted')}</bdi></dd></div></dl></section>
      {view.role === 'reviewer' && <><section className="panel"><h2>{t('checks')}</h2><ul className="review-list">{Object.entries(view.checks ?? {}).map(([key, outcome]) => <li key={key}><span>{reviewChecks[key][language]}</span><strong>{outcomes[outcome][language]}</strong></li>)}</ul></section><section className="panel"><h2>{t('notes')}</h2>{view.notes.length ? view.notes.map(note => <p key={note.id}>{note.text[language]}<bdi className={eventDateClassName}>{date(note.date, language)}</bdi></p>) : <p>{t('noNotes')}</p>}</section><section className="panel"><h2>{t('activity')}</h2><ol className="timeline">{view.activity.map(event => <li key={event.id}><strong>{events[event.kind][language]}</strong><bdi className={eventDateClassName}>{date(event.date, language)}</bdi><span>{demoIdentities.find(identity => identity.id === event.actor)?.name[language] ?? (language === 'ar' ? 'خالد علي' : 'Khaled Ali')}</span></li>)}</ol></section></>}
      {view.repayment && <section className="panel"><h2>{t('repayment')}</h2><p>{t('notice')}</p><dl className="facts">{(['amount', 'markup', 'total', 'completed', 'remaining'] as const).map(key => <div key={key}><dt>{t(key)}</dt><dd><bdi dir="ltr">{money(view.repayment![key], language)}</bdi></dd></div>)}</dl><ol className="repayment-list">{view.repayment.rows.map(row => <li key={row.due}><bdi>{date(row.due, language)}</bdi><bdi dir="ltr">{money(row.amount, language)}</bdi><span>{t(row.status === 'completed' ? 'completedRow' : 'upcoming')}</span></li>)}</ol></section>}
    </div></div>}
    {previewFileId && <DocumentPreview demo={demo} applicationId={view.id} fileId={previewFileId} language={language} close={() => setPreviewFileId(null)} />}
  </>
}
