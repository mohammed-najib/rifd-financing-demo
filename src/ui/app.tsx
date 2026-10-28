import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { defaultParseSearch, useBlocker, useNavigate, useRouter, useRouterState } from '@tanstack/react-router'
import { createDemo, demoIdentities, type ApplicationSummary, type ApplicationView, type AttemptIntent, type Context, type ErrorKind, type PrintSummary } from '../demo'
import { configuredLiveTransport } from '../live-assistance/client'
import { products, resolveStep } from '../domain'
import type { ActorId, Language, ProductId } from '../domain/model'
import { errors, text } from './i18n'
import { prepareStylesheet } from './styles/resources'
import { DraftEditor, RetainedDraft, draftDirty, type DraftBuffer } from './application/draft'
import { combineDeparture, DepartureDialog, type Departure, type DepartureRequest } from './shared/departure'
import { applicationText } from './application/application-copy'
import { ApplicationDetail, ApplicationList } from './application/application-detail'
import { Notifications } from './screens/notifications'
import { notificationText } from './screens/notification-copy'
import { PrintApplication } from './screens/print'
import { StaffApplicationQueue } from './queue/queue'
import { ReviewWorkspace, reviewDirty, type ReviewBuffer } from './review/review'
import { Decision, decisionDirty, type DecisionBuffer } from './review/decision'
import { CorrectionRequest, correctionDirty, type CorrectionBuffer } from './review/correction-request'
import { RepaymentOverview } from './screens/repayment'
import { StaleWriteControl } from './review/stale-write-control'
import { ResetDialog, resetText } from './screens/reset'
import { ComponentGallery } from './screens/gallery'
import { galleryText } from './screens/gallery-copy'
import { LoadingPanel } from './shared/feedback'
import { Products } from './screens/products'
import { IdentityCard } from './shared/identity-card'
import { Heading } from './shared/heading'

type LanguageIntent = Extract<AttemptIntent, { kind: 'setLanguage' }>

type Screen = { kind: 'home' | 'chooser' | 'products' | 'applicantList' | 'staffList' | 'newDraft' | 'reset' | 'gallery' | 'unavailable' | 'notifications' } | { kind: 'applicantDetail' | 'staffDetail' | 'staffRequest' | 'staffDecision' | 'applicantPrint' | 'staffPrint' | 'applicantRepayment' | 'staffRepayment'; id: string }
function resolveScreen(path: string): Screen {
  if (path === '/demo/reset') return { kind: 'reset' }
  if (path === '/') return { kind: 'home' }
  if (path === '/sign-in') return { kind: 'chooser' }
  if (path === '/components') return { kind: 'gallery' }
  if (path === '/products') return { kind: 'products' }
  if (path === '/notifications') return { kind: 'notifications' }
  const print = /^(\/staff)?\/applications\/(RIFD-2026-[a-zA-Z0-9-]+)\/print$/.exec(path)
  if (print) return { kind: print[1] ? 'staffPrint' : 'applicantPrint', id: print[2] }
  const repayment = /^(\/staff)?\/applications\/(RIFD-2026-[a-zA-Z0-9-]+)\/repayment$/.exec(path)
  if (repayment) return { kind: repayment[1] ? 'staffRepayment' : 'applicantRepayment', id: repayment[2] }
  if (path === '/applications') return { kind: 'applicantList' }
  if (path === '/staff/applications') return { kind: 'staffList' }
  if (path === '/applications/new') return { kind: 'newDraft' }
  const applicant = /^\/applications\/(RIFD-2026-[a-zA-Z0-9-]+)(?:\/edit|\/corrections\/current|\/history)?$/.exec(path)
  if (applicant) return { kind: 'applicantDetail', id: applicant[1] }
  const decision = /^\/staff\/applications\/(RIFD-2026-[a-zA-Z0-9-]+)\/decision$/.exec(path)
  if (decision) return { kind: 'staffDecision', id: decision[1] }
  const request = /^\/staff\/applications\/(RIFD-2026-[a-zA-Z0-9-]+)\/correction-request$/.exec(path)
  if (request) return { kind: 'staffRequest', id: request[1] }
  const staff = /^\/staff\/applications\/(RIFD-2026-[a-zA-Z0-9-]+)$/.exec(path)
  if (staff) return { kind: 'staffDetail', id: staff[1] }
  return { kind: 'unavailable' }
}

export function NeutralStartup() {
  return <main className="startup mx-auto my-[14vh] max-w-[620px] p-[35px] text-center" aria-busy="true"><div className="brand"><Mark /> <span>رِفد / RIFD</span></div><h1>{text.loading.ar}</h1><p>{text.loading.en}</p></main>
}
function Mark() { return <span className="flex h-[35px] items-end gap-1 [direction:ltr]" aria-hidden="true"><i className="block h-[17px] w-2 rounded-[2px] bg-accent" /><i className="block h-[25px] w-2 rounded-[2px] bg-accent" /><i className="block h-[35px] w-2 rounded-[2px] bg-accent" /></span> }

export function App() {
  const demo = useMemo(() => createDemo({
    evidenceTransport: configuredLiveTransport(),
    ...(import.meta.env.VITE_TEST_FAST === '1' ? { latency: 150, verifyStoredFiles: false, includeOversizedSample: false, compactEvidence: true } : {}),
  }), [])
  // Fast Refresh can retain the old context while replacing the service instance.
  const [initializedDemo, setInitializedDemo] = useState<typeof demo | null>(null)
  const search = useRouterState({ select: state => state.location.search }) as Record<string, unknown>
  const step = resolveStep(typeof search.step === 'string' ? search.step : undefined)
  const chosenProduct: ProductId = search.product === 'equipment' ? 'equipment' : 'inventory'
  const chosenTerm = products[chosenProduct].terms.includes(Number(search.term)) ? Number(search.term) : undefined
  const path = useRouterState({ select: state => state.location.pathname })
  const href = useRouterState({ select: state => state.location.href })
  const searchStr = useRouterState({ select: state => state.location.searchStr })
  const navigate = useNavigate()
  const router = useRouter()
  const screen = resolveScreen(path)
  const [context, setContext] = useState<Context | null>(null)
  const [recoveryLanguage, setRecoveryLanguage] = useState<Language>('ar')
  const [startupError, setStartupError] = useState<ErrorKind | null>(null)
  const [error, setError] = useState<ErrorKind | null>(null)
  const [busy, setBusy] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const resetting = useRef(false)
  const lastDataset = useRef<string | null>(null)
  const [languageConflict, setLanguageConflict] = useState<{ intent: LanguageIntent; latest: Context | null } | null>(null)
  const [reload, setReload] = useState(0)
  const [list, setList] = useState<ApplicationSummary[] | null>(null)
  const [printSummary, setPrintSummary] = useState<PrintSummary | null>(null)
  const [view, setView] = useState<ApplicationView | null>(null)
  const [loadedRead, setLoadedRead] = useState<string | null>(null)
  const [resolvedCorrectionId, setResolvedCorrectionId] = useState<string | null>(null)
  const [resolvedRepaymentId, setResolvedRepaymentId] = useState<string | null>(null)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const alive = useRef(true)
  const identitySelection = useRef(false)
  const contextRequest = useRef(0)
  const newDraftId = useRef<string | null>(null)
  const draftBuffers = useRef(new Map<string, DraftBuffer>())
  const decisionBuffers = useRef(new Map<string, DecisionBuffer>())
  const reviewBuffers = useRef(new Map<string, ReviewBuffer>())
  const correctionBuffers = useRef(new Map<string, CorrectionBuffer>())
  const departure = useRef<Departure | null>(null)
  const staffWork = useRef<Departure | null>(null)
  const simulationWork = useRef<Departure | null>(null)
  const heldStaffView = useRef<{ path: string; sessionId: string | undefined } | null>(null)
  const [, refreshDeparture] = useState(0)
  const [leaving, setLeaving] = useState<DepartureRequest | null>(null)
  const currentContext = useRef(context)
  const lastProtected = useRef<string | null>(null)
  const recovery = useRef<{ identity: ActorId; datasetId: string; href: string } | null>(null)
  currentContext.current = context
  if (context?.session && !['home', 'chooser', 'products', 'gallery', 'reset', 'unavailable'].includes(screen.kind)) lastProtected.current = href
  const clearBuffers = () => { draftBuffers.current.clear(); reviewBuffers.current.clear(); correctionBuffers.current.clear(); decisionBuffers.current.clear() }
  const rememberBuffer = <T,>(buffers: Map<string, T>, captured: Context, applicationId: string, buffer: T) => {
    if (lastDataset.current === captured.datasetId && captured.session) buffers.set(`${captured.datasetId}/${captured.session.identity}/${applicationId}`, buffer)
  }
  const clearDatasetView = () => {
    contextRequest.current++
    clearBuffers(); recovery.current = null; newDraftId.current = null; lastProtected.current = null
    departure.current = null; staffWork.current = null; simulationWork.current = null; heldStaffView.current = null
    setLeaving(current => { current?.cancel?.(); return null })
    setError(null); setLanguageConflict(null); setView(null); setList(null); setPrintSummary(null); setSubmittedId(null); setResolvedCorrectionId(null); setResolvedRepaymentId(null)
    loadedContext.current = ''; setLoadedRead(null); setResetOpen(false)
  }
  const acceptContext = (next: Context) => {
    const previous = currentContext.current
    if (lastDataset.current && lastDataset.current !== next.datasetId) {
      clearDatasetView(); setBusy(false)
      void navigate({ to: '/$', params: { _splat: 'sign-in' }, search: {}, ignoreBlocker: true, replace: true })
    } else if (previous?.session && !next.session) {
      recovery.current = { identity: previous.session.identity, datasetId: previous.datasetId, href: lastProtected.current ?? (previous.identity?.role === 'reviewer' ? '/staff/applications' : '/applications') }
    }
    lastDataset.current = next.datasetId
    currentContext.current = next
    setRecoveryLanguage(next.preferences.language)
    setStartupError(null)
    setContext(next)
  }
  const loadedContext = useRef('')
  const language = context?.preferences.language ?? recoveryLanguage
  const t = (key: keyof typeof text) => text[key][language]
  const navigateTo = (to: string, replace = false) => {
    setError(null)
    const target = new URL(to, window.location.origin)
    return to === '/' ? navigate({ to: '/', replace, resetScroll: target.pathname !== path }) : navigate({ to: '/$', params: { _splat: target.pathname.slice(1) }, search: defaultParseSearch(target.search), replace, resetScroll: target.pathname !== path })
  }
  const needsDeparture = () => !!departure.current?.dirty || !!departure.current?.pending || !!currentContext.current?.session && [...draftBuffers.current.values()].some(draftDirty) || !!currentContext.current?.session && [...reviewBuffers.current.values()].some(reviewDirty) || !!currentContext.current?.session && [...correctionBuffers.current.values()].some(correctionDirty) || !!currentContext.current?.session && [...decisionBuffers.current.values()].some(decisionDirty)
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
    enableBeforeUnload: () => !!departure.current?.dirty || !!departure.current?.pending || [...draftBuffers.current.values()].some(draftDirty) || [...reviewBuffers.current.values()].some(reviewDirty) || [...correctionBuffers.current.values()].some(correctionDirty) || [...decisionBuffers.current.values()].some(decisionDirty),
  })
  const home = context?.identity?.role === 'reviewer' ? '/staff/applications' : '/applications'
  const prepareJourney = async () => {
    await prepareStylesheet()
    const matches = await router.preloadRoute({ to: '/$', params: { _splat: 'applications' } }).catch(() => undefined)
    if (!matches?.length || matches.some(match => match.status !== 'success')) {
      throw new Error('resources')
    }
  }

  useEffect(() => {
    alive.current = true
    let active = true
    // Load the protected route component before Ready, including when starting at the chooser.
    void prepareJourney().then(() => demo.startup()).then(result => {
      if (!active) return
      if (result.ok) { acceptContext(result.value); setInitializedDemo(demo) }
      else setStartupError(result.error.kind)
    }).catch(() => { if (active) setStartupError('resources') })
    const unsubscribe = demo.subscribe(currentSession => {
      if (!active || resetting.current) return
      const request = ++contextRequest.current
      // Authority loss covers protected content without waiting for busy storage.
      if (!currentSession && currentContext.current?.session) {
        acceptContext({ ...currentContext.current, session: null, identity: null })
        setView(null); setList(null); setPrintSummary(null)
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

  useLayoutEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  const identity = context?.identity
  const identityId = identity?.id
  const sessionId = context?.session?.sessionId
  const staffDeparture = (work: Departure | null, simulation = false) => {
    if (simulation) simulationWork.current = work
    else staffWork.current = work
    departure.current = combineDeparture(simulationWork.current, staffWork.current)
    refreshDeparture(value => value + 1)
  }
  const changeStaffView = (application: ApplicationView) => { heldStaffView.current = null; setView(application) }
  useEffect(() => {
    let active = true
    const current = resolveScreen(path)
    if (heldStaffView.current && (heldStaffView.current.path !== path || heldStaffView.current.sessionId !== sessionId)) heldStaffView.current = null
    setError(null)
    const readContext = `${path}/${identityId}/${sessionId}`
    if (loadedContext.current !== readContext) {
      loadedContext.current = readContext
      setLoadedRead(null); setView(null); setList(null); setPrintSummary(null)
    }
    if (initializedDemo !== demo || !context || !identityId) return
    if (current.kind === 'home') { void navigate({ to: '/$', params: { _splat: identity?.role === 'reviewer' ? 'staff/applications' : 'applications' }, replace: true }); return }
    const staff = current.kind === 'staffList' || current.kind === 'staffDetail' || current.kind === 'staffRequest' || current.kind === 'staffDecision' || current.kind === 'staffPrint' || current.kind === 'staffRepayment'
    const applicant = current.kind === 'applicantList' || current.kind === 'applicantDetail' || current.kind === 'applicantPrint' || current.kind === 'notifications' || current.kind === 'newDraft' || current.kind === 'applicantRepayment'
    if ((staff && identityId !== 'salma') || (applicant && identityId === 'salma')) { setError('unavailable'); setLoadedRead(readContext); return }
    const retainedNew = current.kind === 'newDraft' && newDraftId.current ? draftBuffers.current.get(`${context.datasetId}/${identityId}/${newDraftId.current}`) : undefined
    if (retainedNew) {
      void demo.readApplication(retainedNew.baseline.id).then(result => {
        if (!active) return
        if (result.ok) {
          setList(null); setView(result.value)
          if (result.value.status !== 'draft') {
            departure.current = null; newDraftId.current = null
            void navigate({ to: '/$', params: { _splat: `applications/${result.value.id}` }, search: {}, ignoreBlocker: true })
          }
        } else setError(result.error.kind)
        setLoadedRead(readContext)
      })
      return () => { active = false }
    }
    if (current.kind === 'staffList') setLoadedRead(readContext)
    else if (current.kind === 'applicantList' || current.kind === 'newDraft') {
      void demo.listApplications().then(result => {
        if (!active) return
        if (result.ok) setList(result.value)
        else setError(result.error.kind)
        setLoadedRead(readContext)
      })
    } else if (current.kind === 'staffPrint' || current.kind === 'applicantPrint') {
      void demo.readPrintSummary(current.id).then(result => {
        if (!active) return
        if (result.ok) setPrintSummary(result.value)
        else setError(result.error.kind)
        setLoadedRead(readContext)
      })
    } else if (current.kind === 'staffDetail' || current.kind === 'staffRequest' || current.kind === 'staffDecision' || current.kind === 'applicantDetail' || current.kind === 'staffRepayment' || current.kind === 'applicantRepayment') {
      void demo.readApplication(current.id).then(result => {
        if (!active) return
        if (result.ok) {
          if (current.kind === 'staffRepayment' || current.kind === 'applicantRepayment') {
            if (result.value.status !== 'approved') {
              setResolvedRepaymentId(result.value.id)
              void navigate({ to: '/$', params: { _splat: `${current.kind === 'staffRepayment' ? 'staff/' : ''}applications/${result.value.id}` }, search: current.kind === 'staffRepayment' ? search : {}, replace: true })
              return
            }
          }
          // Only the initiating screen is held. Explicit inspection uses changeStaffView.
          if (!heldStaffView.current) setView(result.value)
          const retained = draftBuffers.current.get(`${context.datasetId}/${identityId}/${result.value.id}`)
          const retainedRound = retained && draftDirty(retained) ? retained.baseline : undefined
          const currentRound = result.value.role === 'applicant' ? result.value.workspace?.roundId : null
          const obsoleteRound = typeof search.round === 'string' && search.round !== currentRound || retainedRound?.role === 'applicant' && retainedRound.workspace?.roundId && retainedRound.workspace.roundId !== currentRound
          if (path.endsWith('/corrections/current') && (result.value.status !== 'correctionsRequested' || obsoleteRound)) {
            departure.current = null
            setResolvedCorrectionId(result.value.id)
            void navigate({ to: '/$', params: { _splat: `applications/${result.value.id}` }, search: {}, ignoreBlocker: true })
          }
          if (path.endsWith('/edit') && result.value.status !== 'draft') {
            departure.current = null
            void navigate({ to: '/$', params: { _splat: path.slice(1, -5) }, search: {}, ignoreBlocker: true })
          }
        }
        else setError(result.error.kind)
        setLoadedRead(readContext)
      })
    } else setLoadedRead(readContext)
    return () => { active = false }
    // Preferences do not change the record read or revoke the current identity.
  }, [path, search.round, sessionId, identityId, reload, demo, initializedDemo, navigate])

  const routeReady = initializedDemo === demo && !startupError && !!context && !identitySelection.current && (screen.kind === 'chooser' || screen.kind === 'gallery' || screen.kind === 'products' || screen.kind === 'reset' || !identity || loadedRead === `${path}/${identityId}/${sessionId}`)
  useEffect(() => {
    if (routeReady || startupError) document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
  }, [path, routeReady, sessionId, startupError])

  const selectIdentity = async (id: ActorId, intentional = false) => {
    if ([...decisionBuffers.current.entries()].some(([key, buffer]) => !key.startsWith(`${context?.datasetId}/${id}/`) && decisionDirty(buffer)) || [...draftBuffers.current.entries()].some(([key, buffer]) => !key.startsWith(`${context?.datasetId}/${id}/`) && draftDirty(buffer)) || [...reviewBuffers.current.entries()].some(([key, buffer]) => !key.startsWith(`${context?.datasetId}/${id}/`) && reviewDirty(buffer)) || [...correctionBuffers.current.entries()].some(([key, buffer]) => !key.startsWith(`${context?.datasetId}/${id}/`) && correctionDirty(buffer))) {
      setLeaving({ action: () => { clearBuffers(); newDraftId.current = null; void selectIdentity(id, true) }, discardOnly: true })
      return
    }
    setBusy(true); setError(null); setView(null); setList(null); setPrintSummary(null)
    contextRequest.current++
    identitySelection.current = true
    const result = await demo.signIn(id)
    try {
      if (!alive.current) return
      if (!result.ok) {
        if (['storage', 'startup', 'blocked', 'unsupported', 'damaged'].includes(result.error.kind)) {
          setContext(null); setStartupError(result.error.kind)
        } else if (result.error.kind === 'sessionExpired' || result.error.kind === 'supersededDataset') {
          const latest = await demo.context()
          if (alive.current && latest.ok && latest.value.datasetId !== currentContext.current?.datasetId) acceptContext(latest.value)
          else setError(result.error.kind)
        } else setError(result.error.kind)
        return
      }
      const interrupted = recovery.current
      const ownRecovery = interrupted?.identity === id && interrupted.datasetId === result.value.datasetId
      let target = intentional || interrupted && !ownRecovery ? (id === 'salma' ? '/staff/applications' : '/applications') : ownRecovery ? interrupted.href : href
      const destination = resolveScreen(new URL(target, window.location.origin).pathname)
      let permitted = destination.kind === 'newDraft' && id !== 'salma' || destination.kind === 'applicantList' && id !== 'salma' || destination.kind === 'notifications' && id !== 'salma' || destination.kind === 'staffList' && id === 'salma'
      if ('id' in destination && (['applicantDetail', 'applicantPrint', 'applicantRepayment'].includes(destination.kind) && id !== 'salma' || ['staffDetail', 'staffRequest', 'staffDecision', 'staffPrint', 'staffRepayment'].includes(destination.kind) && id === 'salma')) {
        const access = await (destination.kind.endsWith('Print') ? demo.readPrintSummary(destination.id) : demo.readApplication(destination.id))
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
  const changeLanguage = async (intent?: LanguageIntent) => {
    if (!context) return
    const capturedSession = context.session?.sessionId
    const capturedDataset = context.datasetId
    const change: LanguageIntent = intent ?? { kind: 'setLanguage', expectedRevision: context.preferences.revision, language: language === 'ar' ? 'en' : 'ar' }
    setBusy(true); setError(null)
    const result = await demo.attempt(change)
    if (!alive.current) return
    setBusy(false)
    if (capturedSession !== currentContext.current?.session?.sessionId || capturedDataset !== currentContext.current?.datasetId) return
    if (!result.ok) { setError(result.error.kind); return }
    const outcome = result.value
    if (outcome.status === 'committed') { flushSync(() => { setLanguageConflict(null); acceptContext(outcome.result) }); return }
    setLanguageConflict({ intent: change, latest: null })
  }
  const inspectLanguage = async () => {
    if (!languageConflict) return
    const intent = languageConflict.intent
    setBusy(true)
    const result = await demo.context()
    if (!alive.current) return
    setBusy(false)
    if (result.ok) {
      setLanguageConflict(current => current?.intent === intent ? { intent, latest: result.value } : current)
      acceptContext(result.value)
    } else setError(result.error.kind)
  }
  const signOut = async () => {
    setBusy(true); setView(null); setList(null); setPrintSummary(null)
    const result = await demo.signOut()
    if (!alive.current) return
    setBusy(false)
    if (result.ok) { clearBuffers(); newDraftId.current = null; acceptContext(result.value); recovery.current = null; void navigateTo('/sign-in') } else setError(result.error.kind)
  }

  useEffect(() => { setLeaving(current => { current?.cancel?.(); return null }) }, [sessionId])
  useEffect(() => { setLanguageConflict(null); setSubmittedId(null); setResolvedCorrectionId(null) }, [sessionId, context?.datasetId])
  const retryStartup = async () => {
    setStartupError(null)
    try {
      await prepareJourney()
      const result = await demo.startup()
      if (result.ok) { acceptContext(result.value); setInitializedDemo(demo) } else setStartupError(result.error.kind)
    } catch { setStartupError('resources') }
  }

  if ((!context || initializedDemo !== demo) && !startupError) return <NeutralStartup />
  const isChooser = screen.kind === 'chooser' || screen.kind !== 'products' && screen.kind !== 'gallery' && screen.kind !== 'unavailable' && screen.kind !== 'reset' && !identity
  const isStaff = identity?.role === 'reviewer' && !isChooser && screen.kind !== 'products' && screen.kind !== 'gallery' && screen.kind !== 'reset'
  const unavailable = screen.kind === 'unavailable' || error === 'unavailable'
  return <div data-workspace-ready={routeReady ? 'true' : undefined}>
    <header className="header site-header">
      <a className="brand" href="/" onClick={event => { event.preventDefault(); go('/') }}><Mark /><span>{language === 'ar' ? 'رِفد' : 'RIFD'}<small>{language === 'ar' ? 'عرض تمويل تجريبي' : 'Financing demo'}</small></span></a>
      <nav aria-label={language === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}>
        <button disabled={busy} onClick={() => setResetOpen(true)}>{resetText.title[language]}</button>
        <a href="/components" aria-current={screen.kind === 'gallery' ? 'page' : undefined} onClick={event => { event.preventDefault(); go('/components') }}>{galleryText.title[language]}</a>
        <a href="/products" aria-current={screen.kind === 'products' ? 'page' : undefined} onClick={event => { event.preventDefault(); go('/products') }}>{t('products')}</a>
        {identity && <a href={home} onClick={event => { event.preventDefault(); go(home) }}>{identity.role === 'reviewer' ? t('staffApplications') : t('applications')}</a>}
        {identity?.role === 'applicant' && <a href="/notifications" onClick={event => { event.preventDefault(); go('/notifications') }}>{notificationText.title[language]}</a>}
      </nav>
      {demo.analysisAvailability().cleanup === 'unavailable' && <p role="status">{resetText.analysisCleanup[language]}</p>}
      <div className="session-controls">
        {identity && <span className="identity-name font-semibold leading-[1.6] narrow:me-auto narrow:text-[13px]">{identity.name[language]}<small>{identity.role === 'reviewer' ? t('reviewer') : t('applicant')}</small></span>}
        <button aria-disabled={busy || !!languageConflict || !context && !startupError} onClick={() => {
          if (busy || languageConflict || !context && !startupError) return
          if (context) void changeLanguage()
          else setRecoveryLanguage(language === 'ar' ? 'en' : 'ar')
        }} lang={language === 'ar' ? 'en' : 'ar'}>{language === 'ar' ? 'English' : 'العربية'}</button>
        {identity && <><button disabled={busy} onClick={() => go('/sign-in')}>{t('switchIdentity')}</button><button disabled={busy} onClick={() => guard(() => { void signOut() })}>{t('signOut')}</button><button onClick={() => demo.expireSession()}>{t('expireSession')}</button></>}
      </div>
    </header>
    <div className={`site-workspace ${screen.kind === 'products' ? 'site-workspace-products' : ''} ${isStaff ? 'grid content-start grid-cols-[190px_minmax(0,1fr)] gap-8 compact:grid-cols-1' : ''}`}>
      {isStaff && <aside className="sidebar py-5 compact:flex compact:flex-wrap compact:items-center compact:gap-5 compact:p-0 narrow:gap-3"><p className="eyebrow">{t('reviewer')}</p><nav aria-label={t('staffApplications')}><a className="active" href="/staff/applications" onClick={event => { event.preventDefault(); go('/staff/applications') }}>{t('staffApplications')}</a></nav><p>{t('staffIntro')}</p></aside>}
      <main aria-busy={busy || !routeReady && !startupError}>
        {languageConflict && <section className="summary mb-6" aria-label={t('preferenceConflict')}>
          <p role="status">{errors.stalePreference[language]}</p>
          <p>{t('unappliedLanguage')}: {text[languageConflict.intent.language === 'ar' ? 'arabic' : 'english'][language]}</p>
          <button disabled={busy} onClick={() => void inspectLanguage()}>{t('inspectPreference')}</button>
          {languageConflict.latest && <><p>{t('latestLanguage')}: {text[languageConflict.latest.preferences.language === 'ar' ? 'arabic' : 'english'][language]}</p><button disabled={busy} onClick={() => void changeLanguage({ ...languageConflict.intent, expectedRevision: languageConflict.latest!.preferences.revision })}>{t('reapplyPreference')}</button></>}
          <button disabled={busy} onClick={() => setLanguageConflict(null)}>{t('discardPreference')}</button>
        </section>}
        {screen.kind === 'reset' ? <section className="panel"><Heading>{resetText.title[language]}</Heading><p>{resetText.warning[language]}</p><button disabled={busy} onClick={() => setResetOpen(true)}>{resetText.title[language]}</button></section>
          : screen.kind === 'gallery' ? <ComponentGallery language={language} />
          : screen.kind === 'products' ? <Products language={language} choose={(product, term) => void go(`/applications/new?product=${product}&term=${term}`)} />
          : startupError ? <section className="panel"><Heading>{t('startupError')}</Heading><p role="alert">{errors[startupError][language]}</p><button onClick={() => void retryStartup()}>{t('retry')}</button><button onClick={() => setResetOpen(true)}>{resetText.title[language]}</button><a className="button secondary" href="/products" onClick={event => { event.preventDefault(); go('/products') }}>{t('products')}</a></section>
          : unavailable ? <section className="panel"><Heading>{t('unavailable')}</Heading><p>{t('unavailableDescription')}</p><a className="button" href={home} onClick={event => { event.preventDefault(); go(home) }}>{t('home')}</a><button onClick={() => go('/sign-in')}>{t('switchIdentity')}</button></section>
          : isChooser ? <section className="mx-auto mt-[15px] mb-10 max-w-[970px] narrow:mt-[5px] narrow:mb-5">
            <Heading>{t('chooseIdentity')}</Heading><p className="intro">{t('chooserIntro')}</p>
            {recovery.current && <p className="summary" role="status">{t('recoverSession')}</p>}
            <div className="grid grid-cols-2 gap-5 narrow:grid-cols-1 narrow:gap-3.5">{demoIdentities.map(person => <IdentityCard key={person.id} name={person.name[language]} role={person.role === 'reviewer' ? t('reviewer') : t('applicant')} language={language} disabled={busy} onClick={() => void selectIdentity(person.id as ActorId)} />)}</div>
            <p className="my-[22px] text-[13px] text-muted">{t('sliceNotice')}</p>
          </section>
          : !routeReady ? <LoadingPanel language={language} />
          : screen.kind === 'newDraft' && !view ? <section className="panel"><Heading>{applicationText.chooseDraft[language]}</Heading><h2>{products[chosenProduct].name[language]}</h2><p>{applicationText.choiceHint[language]}</p><button disabled={busy} onClick={async () => {
            setBusy(true)
            const result = await demo.newDraft(chosenProduct)
            if (result.ok) { newDraftId.current = result.value.id; setList(null); setView(result.value) } else setError(result.error.kind)
            setBusy(false)
          }}>{applicationText.new[language]}</button><div className="actions">{list?.filter(application => application.status === 'draft').map(application => <a className="button secondary" key={application.id} href={`/applications/${application.id}/edit?step=personal`} onClick={event => { event.preventDefault(); void go(`/applications/${application.id}/edit?step=personal`) }}>{applicationText.resume[language]} <bdi>{application.id}</bdi> · {products[application.product].name[language]}</a>)}</div></section>
          : screen.kind === 'notifications' && context ? <Notifications key={`${context.datasetId}/${identityId}/${sessionId}`} demo={demo} language={language} reload={reload} go={go} />
          : printSummary ? <PrintApplication summary={printSummary} language={language} staff={screen.kind === 'staffPrint'} queueSearch={screen.kind === 'staffPrint' ? searchStr : ''} go={go} />
          : screen.kind === 'staffList' && context ? <StaffApplicationQueue key={`${context.datasetId}/${identityId}/${sessionId}`} demo={demo} context={context} language={language} input={search} href={href} reload={reload} go={go} acceptContext={acceptContext} />
          : list ? <ApplicationList list={list} language={language} go={go} />
          : view && (screen.kind === 'staffRepayment' || screen.kind === 'applicantRepayment') ? <RepaymentOverview view={view} language={language} queueSearch={screen.kind === 'staffRepayment' ? searchStr : ''} go={go} />
          : view ? <ApplicationDetail key={`${context?.datasetId}/${identityId}/${sessionId}/${view.id}`} demo={demo} view={view} language={language} queueSearch={['staffDetail', 'staffRequest', 'staffDecision'].includes(screen.kind) ? searchStr : ''} requesting={screen.kind === 'staffRequest' || screen.kind === 'staffDecision'} confirmed={submittedId === view.id} redirectedCorrection={resolvedCorrectionId === view.id} redirectedRepayment={resolvedRepaymentId === view.id} go={go}>{view.role === 'reviewer' && context?.session && <StaleWriteControl demo={demo} view={view} language={language} hold={() => { heldStaffView.current = { path, sessionId } }} release={() => { heldStaffView.current = null }} changed={changeStaffView} departure={value => staffDeparture(value, true)} />}{view.role === 'reviewer' && context?.session && screen.kind === 'staffDecision' && <Decision demo={demo} view={view} language={language} queueSearch={searchStr} go={go} retained={decisionBuffers.current.get(`${context.datasetId}/${identityId}/${view.id}`)} remember={buffer => rememberBuffer(decisionBuffers.current, context, view.id, buffer)} changed={changeStaffView} departure={staffDeparture} />}{view.role === 'reviewer' && context && screen.kind === 'staffRequest' && <CorrectionRequest demo={demo} view={view} language={language} queueSearch={searchStr} go={go} retained={correctionBuffers.current.get(`${context.datasetId}/${identityId}/${view.id}`)} remember={buffer => rememberBuffer(correctionBuffers.current, context, view.id, buffer)} changed={changeStaffView} departure={staffDeparture} />}{view.role === 'reviewer' && context && screen.kind !== 'staffRequest' && screen.kind !== 'staffDecision' && <ReviewWorkspace demo={demo} view={view} language={language} retained={reviewBuffers.current.get(`${context.datasetId}/${identityId}/${view.id}`)} remember={buffer => rememberBuffer(reviewBuffers.current, context, view.id, buffer)} changed={changeStaffView} departure={staffDeparture} />}{view.role === 'applicant' && (view.status === 'draft' || view.status === 'correctionsRequested' && path.endsWith('/corrections/current')) && context && <DraftEditor initialTerm={screen.kind === 'newDraft' ? chosenTerm : undefined} demo={demo} view={view} context={context} language={language} step={step} changeStep={step => { void go(`${path}?${screen.kind === 'newDraft' ? `product=${chosenProduct}${chosenTerm === undefined ? '' : `&term=${chosenTerm}`}&` : ''}step=${step}`) }} retained={draftBuffers.current.get(`${context.datasetId}/${identityId}/${view.id}`)} remember={buffer => rememberBuffer(draftBuffers.current, context, view.id, buffer)} savedView={application => {
            setView(application)
            if (application.status !== 'draft' && application.status !== 'correctionsRequested') {
              draftBuffers.current.delete(`${context.datasetId}/${identityId}/${application.id}`)
              departure.current = null; newDraftId.current = null
              setSubmittedId(application.id)
              void navigate({ to: '/$', params: { _splat: `applications/${application.id}` }, search: {}, ignoreBlocker: true })
              return
            }
            // Saving names the same editor's durable route; it does not leave its buffer.
            if (screen.kind === 'newDraft') void navigate({ to: '/$', params: { _splat: `applications/${application.id}/edit` }, search: { step }, ignoreBlocker: true })
          }} departure={value => { departure.current = value; refreshDeparture(value => value + 1) }} />}{view.role === 'applicant' && view.status !== 'draft' && !path.endsWith('/corrections/current') && context && (() => {
            const key = `${context.datasetId}/${identityId}/${view.id}`
            const buffer = draftBuffers.current.get(key)
            return buffer && draftDirty(buffer) ? <RetainedDraft demo={demo} buffer={buffer} language={language} discard={() => { draftBuffers.current.delete(key); refreshDeparture(value => value + 1) }} confirmed={() => { draftBuffers.current.delete(key); setSubmittedId(view.id); refreshDeparture(value => value + 1) }} /> : null
          })()}</ApplicationDetail> : null}
        {error && error !== 'unavailable' && <div className="my-5 rounded-card border border-solid border-danger-border bg-danger-surface px-5 py-4 text-danger-text [&_button]:mt-[15px] [&_button]:block" role="alert">{errors[error][language]}<button disabled={busy} onClick={() => setReload(value => value + 1)}>{t('retry')}</button></div>}
      </main>
    </div>
    <footer className="disclosure site-footer"><p>{t('notice')}</p><p>{t('tabSessions')}</p><p>{t('storageNotice')}</p></footer>
    {resetOpen && <ResetDialog demo={demo} language={language} prepare={prepareJourney} pending={value => { resetting.current = value; if (value) contextRequest.current++; setBusy(value) }} close={() => setResetOpen(false)} completed={async result => {
      clearDatasetView(); lastDataset.current = result.datasetId
      setContext(null); setStartupError(null); setRecoveryLanguage('ar')
      await navigate({ to: '/$', params: { _splat: 'sign-in' }, search: {}, ignoreBlocker: true, replace: true })
      const started = await demo.startup()
      if (alive.current) {
        if (started.ok) { acceptContext(started.value); setInitializedDemo(demo) } else setStartupError(started.error.kind)
        resetting.current = false; setBusy(false)
      }
    }} />}
    {leaving && <DepartureDialog request={leaving} work={departure.current} language={language}
      cancel={() => { leaving.cancel?.(); setLeaving(null) }}
      discard={() => { departure.current?.discard(); departure.current = null; clearBuffers(); newDraftId.current = null; setLeaving(null); leaving.action() }}
      finish={() => { departure.current = null; setLeaving(null); leaving.action() }} />}
  </div>
}
