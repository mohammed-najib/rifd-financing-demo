import { changedReviewChecks, domainDate, emptyDocuments, initialEvidenceMonths, foldDigits, freezeRepayment, parseWholeYER, products, reviewPermissions, submissionMonth, validateFields, validateFileEnvelope } from '../domain'
import { actorIdSchema, fieldsSchema, productIdSchema, slots, type ActorId, type Application, type Dataset, type Fields, type StoredFile } from '../domain/model'
import { fileFromBytes, makeFile, prepareFonts, yieldToInput } from './documents/evidence'
import { applicationMutationSchema, applicationOperationSchema, commitHintSchema, applicationFingerprint, operationFingerprint, notificationReadSchema, preferenceOperationSchema, preparationSchema, reviewOperationSchema, resetOperationSchema } from './operations/commands'
import { createResetStorage } from './operations/reset'
import { identities } from './seed/manifest'
import { prepareSeed } from './seed'
import { DemoError, openStorage, readStored, transact, validateDataset } from './storage'
import { projectQueue } from './operations/queue'
import { applyReviewCommand, validateReviewCommand } from './operations/review'
import { inspectionContext } from './operations/inspection'
import { activeCorrection, correctionDocument, validateCorrectionSave, validateResubmission } from './operations/corrections'
import { createAssistance } from '../evidence-assistance/analysis/controller'
import { createAnalysisStorage, withAnalysisAuthority } from '../evidence-assistance/analysis/storage'
import type { EvidenceTransport } from '../evidence-assistance/contract'
import { createAccess } from './access'
import { createAssistanceOperations } from './assistance-operations'
import { project, summaries } from './projection'
import { applicationReceipt, notificationReceipt, preferenceReceipt } from './receipts'
import { inactivity, persistSession, readStoredSession } from './session'
import type { ApplicantView, ApplicationMutation, ApplicationView, AttemptIntent, AttemptOutcome, AttemptResult, CommitHint, Context, Controls, Demo, DemoOperation, ErrorKind, MutationResult, NotificationDestination, NotificationReadOperation, NotificationReadResult, PreferenceOperation, PreparedAttachment, Result, Session, StaleCause, ResetOperation, ResetResult } from './types'
export type { ApplicationIntent, ApplicationOperation, ApplicationSummary, ApplicationView, AttemptIntent, AttemptOutcome, AttemptResult, CommitHint, Context, Controls, Demo, DemoOperation, DraftDocuments, ErrorKind, LanguageOperation, MutationResult, NotificationDestination, NotificationReadOperation, NotificationReadResult, OperationInspection, PreferenceInspection, PreferenceOperation, PreparedAttachment, Preparation, PrintSummary, QueuePreferenceOperation, QueueQuery, ReviewIntent, StaffQueue, Result, ReviewOperation, SaveCorrectionsOperation, SaveDraftOperation, StaleCause, SubmitOperation, ResubmitOperation, ResetContext, ResetOperation, ResetResult, ResetInspection } from './types'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const success = <T>(value: T): Result<T> => ({ ok: true, value })
const failure = <T>(kind: ErrorKind): Result<T> => ({ ok: false, error: { kind, key: `error.${kind}` } })

type DemoOptions = {
  evidenceTransport?: EvidenceTransport
  latency?: number
  slowLatency?: number
  verifyStoredFiles?: boolean
  loadFonts?: boolean
  includeOversizedSample?: boolean
  compactEvidence?: boolean
}

// Construction has no browser side effects. startup is called only after client mounting.
export function createDemo(options: DemoOptions = {}): Demo {
  let db: IDBDatabase | null = null
  let datasetId: string | null = null
  let session: Session | null = null
  let generation = 0
  let channel: BroadcastChannel | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let startupPromise: Promise<Result<Context>> | null = null
  let storageFailure: ErrorKind | null = 'startup'
  let listening = false
  const subscribers = new Set<(session: Session | null) => void>()
  const assistance = new Set<ReturnType<typeof createAssistance>>()
  const invalidateAssistance = () => { for (const handle of assistance) handle.invalidate('unauthorized') }
  const analysisStorage = createAnalysisStorage(async () => {
    // Optional cleanup observes financing authority without adopting a dataset or
    // expiring a session during startup/recovery in another operation.
    const connection = db, expectedDataset = datasetId
    if (!connection || !expectedDataset || storageFailure) throw new Error('analysis-authority')
    const data = validateDataset(await readStored(connection))
    if (db !== connection || datasetId !== expectedDataset || storageFailure || data.meta.datasetId !== expectedDataset) throw new Error('analysis-authority')
    return expectedDataset
  }, id => announce({ datasetId: id, kind: 'analysis' }))
  let analysisCleanup: 'pending' | 'complete' | 'unavailable' = 'pending'
  let cleaningAnalysis: Promise<void> | null = null
  const cleanAnalysis = () => {
    cleaningAnalysis ??= analysisStorage.clean().then(() => { analysisCleanup = 'complete' }, () => { analysisCleanup = 'unavailable' }).finally(() => { cleaningAnalysis = null; emit() })
    return cleaningAnalysis
  }
  const newDrafts = new Map<string, Application>()
  // A committing operation whose outcome was not observed keeps its exact
  // command here until it is resolved or discarded. Reusing it is what makes a
  // retry replay the receipt instead of writing a second change.
  const pendingAttempts = new Map<string, DemoOperation>()
  const { permitted, editable } = createAccess(newDrafts)
  let controls: Controls = { slow: false, failure: null }
  const resetStorage = createResetStorage()
  const acceptDataset = (id: string) => {
    invalidateAssistance()
    newDrafts.clear(); preparations.clear(); selections.clear(); resetStorage.clear(); pendingAttempts.clear()
    controls = { slow: false, failure: null }
    datasetId = id; session = null; generation++; armExpiry()
    analysisCleanup = 'pending'; void cleanAnalysis()
    try { persistSession(null) } catch { /* Old sessions cannot match the new dataset. */ }
  }
  const delay = () => sleep(controls.slow ? options.slowLatency ?? 1500 : options.latency ?? 400)
  const transactFinancing = (...args: Parameters<typeof transact>) => withAnalysisAuthority(() => transact(...args))
  const consume = (kind: Controls['failure']) => {
    if (controls.failure !== kind) return false
    controls = { ...controls, failure: null }
    return true
  }
  const preparations = new Map<string, { actor: ActorId; datasetId: string; file: StoredFile; product: Application['product']; reference: PreparedAttachment }>()
  const selections = new Map<string, { token: string; status: 'preparing' | 'ready' | 'failed'; attachmentId?: string }>()
  const emit = () => {
    for (const handle of assistance) void handle.revalidate()
    for (const listener of subscribers) { try { listener(session ? { ...session } : null) } catch { /* Observers cannot change committed outcomes. */ } }
  }
  const loseStorage = (kind: ErrorKind) => {
    invalidateAssistance()
    storageFailure = kind
    db?.close(); db = null
    session = null; generation++; armExpiry(); emit()
  }
  const writeSession = (next: Session | null) => {
    invalidateAssistance()
    try { persistSession(next) } catch { loseStorage('storage'); throw new DemoError('storage') }
    session = next
    generation++
    armExpiry()
  }
  const armExpiry = () => {
    if (timer) clearTimeout(timer)
    timer = session ? setTimeout(expire, Math.max(0, session.expiresAt - Date.now())) : null
  }
  const expireSession = () => {
    if (!session) return
    try { writeSession(null) } catch { session = null; generation++; armExpiry() }
    emit()
  }
  const expire = () => { if (session && Date.now() >= session.expiresAt) expireSession() }
  const activity = () => {
    if (!session) return
    if (Date.now() >= session.expiresAt) { expire(); return }
    const now = Date.now()
    try { session = { ...session, lastActivity: now, expiresAt: now + inactivity }; persistSession(session); armExpiry() }
    catch { loseStorage('storage') }
  }
  const failureFrom = <T,>(error: unknown): Result<T> => {
    const result = failure<T>(error instanceof DemoError ? error.kind : 'storage')
    if (!result.ok && error instanceof DemoError && error.slot) result.error.slot = error.slot
    if (!result.ok && error instanceof DemoError && error.fieldIssues) result.error.fieldIssues = error.fieldIssues
    return result
  }
  const settle = async <T>(run: () => Promise<T>): Promise<Result<T>> => {
    try { return success(await run()) }
    catch (error) { return failureFrom<T>(error) }
  }
  const read = async (): Promise<Dataset> => {
    // An upgrade closes old connections before its outcome is known. Only a
    // readable, committed reset may take that tab out of recovery implicitly.
    if (!db && storageFailure && ['blocked', 'storage', 'unsupported', 'damaged'].includes(storageFailure)) {
      const captured = generation
      const connection = await openStorage(loseStorage)
      try {
        const data = validateDataset(await readStored(connection))
        if (captured !== generation) throw new DemoError('sessionExpired')
        if (data.meta.datasetId === datasetId || data.meta.lastReset?.datasetId !== data.meta.datasetId) throw new DemoError(storageFailure)
        readStoredSession()
        db = connection; storageFailure = null; acceptDataset(data.meta.datasetId); connect(); emit()
        return data
      } catch (error) { connection.close(); throw error }
    }
    if (!db || !datasetId || storageFailure) throw new DemoError(storageFailure ?? 'startup')
    const connection = db
    const observedDataset = datasetId
    const captured = generation
    const raw = await readStored(connection)
    // IndexedDB materializes the complete saved byte catalog on access. Give
    // input a turn before validation and projection add more work to that task.
    await yieldToInput()
    const data = validateDataset(raw)
    // A disposed screen's late read must never clear a newer screen's tab session.
    if (captured !== generation || db !== connection) throw new DemoError('sessionExpired')
    if (data.meta.datasetId !== observedDataset) {
      if (data.meta.lastReset?.datasetId !== data.meta.datasetId) {
        // An unmarked replacement still requires explicit startup recovery.
        acceptDataset(observedDataset)
        throw new DemoError('supersededDataset')
      }
      acceptDataset(data.meta.datasetId); emit()
    }
    return data
  }
  const contextFrom = (data: Dataset): Context => {
    expire()
    return { datasetId: data.meta.datasetId, preferences: data.preferences, session, identity: identities.find(identity => identity.id === session?.identity) ?? null }
  }
  const actor = (): ActorId => {
    if (session && Date.now() >= session.expiresAt) { expire(); throw new DemoError('sessionExpired') }
    if (!session) throw new DemoError('sessionExpired')
    return session.identity
  }
  const protectedRead = async <T>(project: (data: Dataset, who: ActorId) => T): Promise<Result<T>> => settle(async () => {
    const who = actor()
    const captured = generation
    await delay()
    const data = await read()
    if (captured !== generation || who !== actor()) throw new DemoError('sessionExpired')
    return project(data, who)
  })
  const fileResult = (file: StoredFile | undefined) => {
    if (!file) throw new DemoError('unavailable')
    return { bytes: file.bytes.slice(0), name: file.name, mime: file.mime, hash: file.hash }
  }
  const activate = () => { if (document.visibilityState === 'visible') { expire(); if (datasetId && !storageFailure) void cleanAnalysis(); emit() } }
  const hint = (event: MessageEvent<unknown>) => { if (commitHintSchema.safeParse(event.data).success) emit() }
  const storageHint = (event: StorageEvent) => {
    if (event.key !== 'rifd.commit.v1' || !event.newValue) return
    try { if (commitHintSchema.safeParse(JSON.parse(event.newValue)).success) emit() } catch { /* Ignore malformed hints. */ }
  }
  const connect = () => {
    if (listening) return
    listening = true
    document.addEventListener('pointerdown', activity)
    document.addEventListener('keydown', activity)
    document.addEventListener('visibilitychange', activate)
    window.addEventListener('pageshow', activate)
    window.addEventListener('focus', activate)
    window.addEventListener('storage', storageHint)
    try { channel = new BroadcastChannel('rifd.commit.v1'); channel.onmessage = hint } catch { /* Use storage-event hints. */ }
  }
  const announce = (change: CommitHint) => {
    emit()
    try { if (channel) { channel.postMessage(change); return } } catch { /* Try the same safe hint through storage. */ }
    try { localStorage.setItem('rifd.commit.v1', JSON.stringify(change)) }
    catch { /* The transaction already committed. Activation rereads storage. */ }
  }
  const authority = (captured: number, who: ActorId, expectedDataset: string, data: Dataset) => {
    if (captured !== generation || actor() !== who) throw new DemoError('sessionExpired')
    if (data.meta.datasetId !== expectedDataset || data.meta.datasetId !== datasetId || session?.datasetId !== expectedDataset) throw new DemoError('supersededDataset')
  }
  const preparedFile = (who: ActorId, id: string, slot: string, reference: PreparedAttachment) => {
    const prepared = preparations.get(reference.id)
    if (!prepared || prepared.actor !== who || prepared.datasetId !== datasetId || prepared.file.applicationId !== id || prepared.file.slot !== slot || JSON.stringify(reference) !== JSON.stringify(prepared.reference)) throw new DemoError('validation', slot as StoredFile['slot'])
    return prepared.file
  }
  const notificationDestination = (data: Dataset, who: ActorId, id: string) => {
    const notification = data.notifications.find(notice => notice.id === id && notice.owner === who)
    if (!notification) throw new DemoError('unavailable')
    const application = permitted(data, who, notification.applicationId)
    const suffix = application.status === 'correctionsRequested' ? '/corrections/current' : application.status === 'draft' ? '/edit?step=personal' : ''
    return { notification, destination: `/applications/${application.id}${suffix}` }
  }
  async function executeOperation(input: PreferenceOperation | ApplicationMutation | NotificationReadOperation | ResetOperation): Promise<Result<Context | MutationResult | NotificationReadResult | ResetResult>> {
    // Capture raw payload and attachment descriptors before any delay.
    const operation = structuredClone(input)
    if (operation.kind === 'resetDemo') return settle(async () => {
      const parsed = resetOperationSchema.safeParse(operation)
      if (!parsed.success) throw new DemoError('validation')
      const command = parsed.data
      const completed = await resetStorage.replay(command)
      if (completed) {
        if (datasetId && datasetId !== completed) { acceptDataset(completed); emit() }
        return { datasetId: completed, replay: true }
      }
      invalidateAssistance()
      await delay()
      let seed: Dataset
      try { if (options.loadFonts !== false) await prepareFonts(); seed = await prepareSeed({ includeOversizedSample: options.includeOversizedSample, compactEvidence: options.compactEvidence }) } catch { throw new DemoError('resources') }
      const result = await withAnalysisAuthority(() => resetStorage.replace(command, seed, () => consume('storage')))
      if (!result.replay || datasetId !== result.datasetId) { acceptDataset(result.datasetId); if (result.replay) emit() }
      if (!result.replay) announce({ datasetId: result.datasetId, kind: 'reset' })
      return result
    })
    if (operation.kind === 'claimApplication' || operation.kind === 'startReview' || operation.kind === 'transferApplication' || operation.kind === 'unassignApplication' || operation.kind === 'assessDocument' || operation.kind === 'recordCheck' || operation.kind === 'saveNote' || operation.kind === 'requestCorrections' || operation.kind === 'verifyCorrection' || operation.kind === 'approve' || operation.kind === 'reject') return settle(async () => {
      const who = actor()
      const captured = generation
      const parsed = reviewOperationSchema.safeParse(operation)
      if (!parsed.success) throw new DemoError('validation')
      const command = parsed.data
      await delay()
      if (!db) throw new DemoError('startup')
      let replay = false
      let abortStorage = false
      const data = await transactFinancing(db, raw => {
        const current = validateDataset(raw)
        authority(captured, who, command.datasetId, current)
        const application = permitted(current, who, command.applicationId)
        const receipt = applicationReceipt(current, who, command)
        if (receipt) { replay = true; return current }
        if (application.sharedRevision !== command.expectedSharedRevision) throw new DemoError('staleRecord')
        if (who !== 'salma' || ['startReview', 'assessDocument', 'recordCheck', 'saveNote', 'requestCorrections', 'verifyCorrection', 'approve', 'reject'].includes(command.kind) && application.assignee !== who) throw new DemoError('permissionDenied')
        if (!reviewPermissions(who, application)[command.kind]) throw new DemoError('invalidState')
        if (command.kind === 'assessDocument' && (!command.inspection || command.inspection.contextToken !== inspectionContext(current, who, application, command.slot))) throw new DemoError('validation')
        if (command.kind === 'transferApplication') {
          if (application.assignee !== command.from || command.from === command.to) throw new DemoError('invalidState')
          if (command.simulated && (application.status !== 'underReview' || command.from !== 'salma' || command.to !== 'khaled')) throw new DemoError('invalidState')
        }
        if ((command.kind === 'approve' || command.kind === 'reject') && command.confirmationSessionId !== session?.sessionId) throw new DemoError('validation')
        validateReviewCommand(application, command)
        authority(captured, who, command.datasetId, current)
        abortStorage = consume('storage')
        const entry = { id: crypto.randomUUID(), sequence: ++current.meta.eventSequence, date: domainDate }
        if (command.kind === 'claimApplication') {
          application.assignee = who
          application.activity.push({ ...entry, kind: 'assigned', actor: who, description: { ar: 'أُسند الطلب إلى سلمى ناصر.', en: 'Application assigned to Salma Nasser.' } })
        } else if (command.kind === 'transferApplication') {
          const from = current.identities.find(identity => identity.id === command.from)!.name
          const to = current.identities.find(identity => identity.id === command.to)!.name
          application.assignee = command.to
          application.activity.push({ ...entry, kind: 'assigned', actor: command.simulated ? 'khaled' : who, description: command.simulated
            ? { ar: `نقل تجريبي من ${from.ar} إلى ${to.ar}.`, en: `Simulated transfer from ${from.en} to ${to.en}.` }
            : { ar: `نُقل الطلب من ${from.ar} إلى ${to.ar}.`, en: `Application transferred from ${from.en} to ${to.en}.` } })
        } else if (command.kind === 'unassignApplication') {
          const from = current.identities.find(identity => identity.id === application.assignee)!.name
          application.assignee = null
          application.activity.push({ ...entry, kind: 'assigned', actor: who, description: { ar: `أُلغي إسناد الطلب إلى ${from.ar}.`, en: `Application unassigned from ${from.en}.` } })
        } else if (command.kind === 'approve' || command.kind === 'reject') {
          const approved = command.kind === 'approve'
          application.status = approved ? 'approved' : 'rejected'
          application.repayment = approved ? freezeRepayment(parseWholeYER(application.submitted!.fields.amount)!, Number(foldDigits(application.submitted!.fields.term).trim()), products[application.product], domainDate) : null
          application.history.push({ ...entry, kind: application.status, reason: command.reason })
          application.activity.push({ ...entry, kind: application.status, actor: who, description: command.reason })
          current.notifications.push({ id: crypto.randomUUID(), owner: application.owner, applicationId: application.id, kind: application.status, date: domainDate, read: false, revision: 1 })
        } else if (command.kind === 'requestCorrections') {
          const previousRound = application.rounds.at(-1)
          if (previousRound?.response) previousRound.responseAssessments = structuredClone(application.assessments!)
          const roundId = crypto.randomUUID()
          application.rounds.push({ id: roundId, requestedAt: domainDate, baseline: structuredClone(application.submitted!), targets: command.targets.map(target => ({ ...target, verified: false })), response: null })
          application.workspace = { revision: 1, roundId, savedAt: new Date().toISOString(), snapshot: structuredClone(application.submitted!) }
          application.status = 'correctionsRequested'
          const reason = { ar: command.targets.map(target => target.reason.ar).join('\n'), en: command.targets.map(target => target.reason.en).join('\n') }
          application.history.push({ ...entry, kind: 'correctionsRequested', reason })
          application.activity.push({ ...entry, kind: 'correctionsRequested', actor: who, description: { ar: 'أُرسلت تغييرات محددة إلى المتقدم.', en: 'Targeted corrections sent to the applicant.' } })
          current.notifications.push({ id: crypto.randomUUID(), owner: application.owner, applicationId: application.id, kind: 'correctionsRequested', date: domainDate, read: false, revision: 1 })
        } else if (command.kind === 'assessDocument' || command.kind === 'recordCheck' || command.kind === 'saveNote' || command.kind === 'verifyCorrection') {
          applyReviewCommand(application, command, { ...entry, actor: who })
        } else {
          application.status = 'underReview'
          application.history.push({ ...entry, kind: 'reviewStarted', reason: null })
          application.activity.push({ ...entry, kind: 'reviewStarted', actor: who, description: { ar: 'بدأت مراجعة الطلب.', en: 'Application review started.' } })
        }
        application.sharedRevision++
        current.mutationReceipts.push({ kind: command.kind, actor: who, datasetId: command.datasetId, operationId: command.operationId, fingerprint: applicationFingerprint(command), applicationId: application.id, sharedRevision: application.sharedRevision, savedAt: new Date().toISOString() })
        return current
      }, () => {
        if (captured !== generation || actor() !== who) throw new DemoError('sessionExpired')
        return abortStorage
      })
      const receipt = applicationReceipt(data, who, command)!
      if (!replay) announce({ datasetId: command.datasetId, kind: 'application', applicationId: command.applicationId, revision: receipt.sharedRevision })
      return { receipt, application: project(data, who, permitted(data, who, command.applicationId)) }
    })
    if (operation.kind === 'markNotificationRead') return settle(async () => {
      const who = actor()
      const captured = generation
      const parsed = notificationReadSchema.safeParse(operation)
      if (!parsed.success) throw new DemoError('validation')
      const command = parsed.data
      await delay()
      if (!db) throw new DemoError('startup')
      let changed = false
      const data = await transactFinancing(db, raw => {
        const current = validateDataset(raw)
        authority(captured, who, command.datasetId, current)
        const { notification } = notificationDestination(current, who, command.notificationId)
        const { receipt, fingerprint } = notificationReceipt(current, who, command)
        if (receipt) return current
        if (notification.revision !== command.expectedRevision) throw new DemoError('staleNotification')
        if (!notification.read) { notification.read = true; notification.revision++; changed = true }
        current.receipts.push({ actor: who, operationId: command.operationId, fingerprint, revision: notification.revision })
        return current
      }, () => {
        if (captured !== generation || actor() !== who) throw new DemoError('sessionExpired')
        return false
      })
      const current = notificationDestination(data, who, command.notificationId)
      const receipt = notificationReceipt(data, who, command).receipt!
      if (changed) announce({ datasetId: data.meta.datasetId, kind: 'notification', notificationId: current.notification.id, revision: current.notification.revision })
      return { ...current, receipt: { operationId: receipt.operationId, revision: receipt.revision } }
    })
    if (operation.kind === 'saveDraft' || operation.kind === 'submit' || operation.kind === 'saveCorrections' || operation.kind === 'resubmit') return settle(async () => {
      const who = actor()
      const captured = generation
      const parsed = applicationOperationSchema.safeParse(operation)
      if (!parsed.success) {
        const issues = parsed.error.issues.flatMap(issue => issue.path[0] === 'fields' && typeof issue.path[1] === 'string' && issue.path[1] in fieldsSchema.shape
          ? [{ field: issue.path[1] as keyof Fields, rule: 'type' as const }] : [])
        throw new DemoError('validation', undefined, issues.length ? issues : undefined)
      }
      const command = parsed.data
      await delay()
      if (!db) throw new DemoError('startup')
      let replay = false
      let abortStorage = false
      const data = await transactFinancing(db, raw => {
        if (captured !== generation || actor() !== who) throw new DemoError('sessionExpired')
        const current = validateDataset(raw)
        authority(captured, who, command.datasetId, current)
        const original = current.applications.find(application => application.id === command.applicationId)
        const application = original ? permitted(current, who, command.applicationId) : structuredClone(editable(current, who, command.applicationId))
        const receipt = applicationReceipt(current, who, command)
        if (receipt) {
          replay = true
          return current
        }
        if (application.workspace?.revision !== command.expectedWorkspaceRevision) throw new DemoError('staleWorkspace')
        if ((command.kind === 'submit' || command.kind === 'resubmit') && application.sharedRevision !== command.expectedSharedRevision) throw new DemoError('staleRecord')
        if (application.owner !== who) throw new DemoError('permissionDenied')
        if (command.kind === 'saveCorrections' || command.kind === 'resubmit') validateCorrectionSave(application, command)
        else if (application.status !== 'draft') throw new DemoError('invalidState')
        if (!application.workspace) throw new DemoError('invalidState')
        if (application.product !== command.product && command.documents.purchase.kind === 'saved' && command.documents.purchase.fileId !== null) throw new DemoError('validation', 'purchase')
        if (!original) current.applications.push(application)
        const documents = { ...application.workspace.snapshot.documents }
        for (const slot of slots) {
          const document = command.documents[slot]
          if (command.kind === 'submit' || command.kind === 'resubmit') {
            const selection = selections.get(`${who}/${application.id}/${slot}`)
            const selectedId = document.kind === 'saved' ? document.fileId : document.attachment.id
            if (selection && (selection.status !== 'ready' || selectedId !== selection.attachmentId)) throw new DemoError('validation', slot)
          }
          if (document.kind === 'saved') {
            if (document.fileId !== null && document.fileId !== application.workspace.snapshot.documents[slot]) throw new DemoError('validation', slot)
            documents[slot] = document.fileId
          } else {
            const file = preparedFile(who, application.id, slot, document.attachment)
            if (slot === 'purchase' && preparations.get(file.id)?.product !== command.product) throw new DemoError('validation', slot)
            if (!current.files.some(saved => saved.id === file.id)) current.files.push(file)
            documents[slot] = file.id
          }
        }
        if (command.kind === 'submit' || command.kind === 'resubmit') {
          const issues = validateFields(command.fields, products[command.product], command.kind === 'resubmit' ? application.submittedAt!.slice(0, 7) : submissionMonth)
          if (issues.length) throw new DemoError('validation', undefined, issues)
          for (const slot of slots) {
            const file = current.files.find(file => file.id === documents[slot] && file.applicationId === application.id && file.slot === slot)
            if (!file || !validateFileEnvelope({ name: file.name, type: file.mime, size: file.size })) throw new DemoError('validation', slot)
          }
        }
        if (command.kind === 'resubmit') validateResubmission(application, { fields: command.fields, documents }, current.files)
        authority(captured, who, command.datasetId, current)
        if (consume(command.kind === 'submit' || command.kind === 'resubmit' ? 'submission' : 'save')) throw new DemoError('requestFailed')
        abortStorage = consume('storage')
        const savedAt = new Date().toISOString()
        const workspaceRevision = application.workspace.revision + 1
        application.product = command.product
        const snapshot = { fields: command.fields, documents }
        if (command.kind === 'submit') {
          application.submitted = snapshot
          application.workspace = null
          application.status = 'submitted'
          application.submittedAt = domainDate
          application.evidenceMonths = [...initialEvidenceMonths]
          application.sharedRevision++
          application.assessments = Object.fromEntries(slots.map(slot => [slot, { status: 'awaitingReview', reason: null }])) as Application['assessments']
          application.checks = { evidence: 'unchecked', operatingHistory: 'unchecked', purpose: 'unchecked', budget: 'unchecked', capacity: 'unchecked' }
          const entry = { id: crypto.randomUUID(), sequence: ++current.meta.eventSequence, kind: 'submitted' as const, date: domainDate, reason: null }
          application.history.push(entry)
          application.activity.push({ ...entry, actor: who, description: { ar: 'قُدم الطلب.', en: 'Application submitted.' } })
        } else if (command.kind === 'resubmit') {
          const round = activeCorrection(application, command.roundId)
          for (const check of changedReviewChecks(round.baseline, snapshot)) application.checks![check] = 'unchecked'
          for (const target of round.targets) {
            target.verified = false
            if (target.kind === 'document') application.assessments![target.slot] = { status: 'awaitingReview', reason: null }
          }
          round.response = structuredClone(snapshot)
          application.submitted = snapshot
          application.workspace = null
          application.status = 'underReview'
          application.sharedRevision++
          const entry = { id: crypto.randomUUID(), sequence: ++current.meta.eventSequence, kind: 'resubmitted' as const, date: domainDate, reason: null }
          application.history.push(entry)
          application.activity.push({ ...entry, actor: who, description: { ar: 'أُعيد تقديم التصحيحات.', en: 'Corrections resubmitted.' } })
        } else application.workspace = { ...application.workspace, revision: workspaceRevision, savedAt, snapshot }
        current.mutationReceipts.push({
          kind: command.kind, actor: who, datasetId: command.datasetId, operationId: command.operationId, fingerprint: applicationFingerprint(command),
          applicationId: application.id, workspaceRevision, sharedRevision: application.sharedRevision, savedAt,
        })
        return current
      }, () => {
        if (captured !== generation || session?.identity !== who || !session || Date.now() >= session.expiresAt) throw new DemoError('sessionExpired')
        return abortStorage
      })
      const receipt = data.mutationReceipts.find(receipt => receipt.actor === who && receipt.operationId === command.operationId)!
      if (!replay) {
        newDrafts.delete(command.applicationId)
        announce({ datasetId: receipt.datasetId, kind: command.kind === 'submit' || command.kind === 'resubmit' ? 'application' : 'workspace', applicationId: command.applicationId, revision: 'workspaceRevision' in receipt && command.kind !== 'submit' && command.kind !== 'resubmit' ? receipt.workspaceRevision : receipt.sharedRevision })
      }
      return { receipt, application: project(data, who, permitted(data, who, command.applicationId)) }
    })
    return settle(async () => {
      const parsed = preferenceOperationSchema.safeParse(operation)
      if (!parsed.success) throw new DemoError('validation')
      const command = parsed.data
      const captured = generation
      const by = command.kind === 'setQueuePreferences' ? actor() : session?.identity ?? 'unsigned'
      if (command.kind === 'setQueuePreferences' && by !== 'salma') throw new DemoError('unavailable')
      await delay()
      if (captured !== generation) throw new DemoError('sessionExpired')
      if (!db) throw new DemoError('startup')
      let replay = false
      const data = await transactFinancing(db, raw => {
        const current = validateDataset(raw)
        if (command.kind === 'setQueuePreferences') authority(captured, 'salma', command.datasetId, current)
        if (current.meta.datasetId !== command.datasetId || current.meta.datasetId !== datasetId) throw new DemoError('supersededDataset')
        const { receipt, fingerprint } = preferenceReceipt(current, by, command)
        if (receipt) {
          replay = true
          return current
        }
        if (captured !== generation) throw new DemoError('sessionExpired')
        if (current.preferences.revision !== command.expectedRevision) throw new DemoError('stalePreference')
        current.preferences = { ...current.preferences, ...(command.kind === 'setLanguage' ? { language: command.language } : { queue: command.queue }), revision: current.preferences.revision + 1 }
        current.receipts.push({ actor: by, operationId: command.operationId, fingerprint, revision: current.preferences.revision })
        return current
      }, () => {
        if (captured !== generation || command.kind === 'setQueuePreferences' && actor() !== by) throw new DemoError('sessionExpired')
        return false
      })
      if (!replay) announce({ datasetId: data.meta.datasetId, kind: 'preferences', revision: data.preferences.revision })
      return contextFrom(data)
    })
  }
  type CommandInspection = { status: 'committed'; result: MutationResult | Context | NotificationReadResult | ResetResult } | { status: 'notCommitted'; latest?: ApplicationView | Context | NotificationDestination }

  const inspectApplicationCommand = (input: ApplicationMutation): Promise<Result<CommandInspection>> => {
    const operation = structuredClone(input)
    return protectedRead((data, who) => {
      if (data.meta.datasetId !== operation.datasetId) throw new DemoError('supersededDataset')
      const application = permitted(data, who, operation.applicationId)
      const parsed = applicationMutationSchema.safeParse(operation)
      if (!parsed.success) throw new DemoError('validation')
      const receipt = applicationReceipt(data, who, parsed.data)
      return receipt
        ? { status: 'committed' as const, result: { receipt, application: project(data, who, application) } }
        : { status: 'notCommitted' as const, latest: project(data, who, application) }
    })
  }
  const inspectPreferenceCommand = (input: PreferenceOperation): Promise<Result<CommandInspection>> => {
    const operation = structuredClone(input)
    return settle(async () => {
      const parsed = preferenceOperationSchema.safeParse(operation)
      if (!parsed.success) throw new DemoError('validation')
      const command = parsed.data
      const by = command.kind === 'setQueuePreferences' ? actor() : session?.identity ?? 'unsigned'
      if (command.kind === 'setQueuePreferences' && by !== 'salma') throw new DemoError('unavailable')
      const captured = generation
      await delay()
      const data = await read()
      if (captured !== generation) throw new DemoError('sessionExpired')
      if (command.kind === 'setQueuePreferences') authority(captured, 'salma', command.datasetId, data)
      if (data.meta.datasetId !== command.datasetId) throw new DemoError('supersededDataset')
      const { receipt } = preferenceReceipt(data, by, command)
      return receipt ? { status: 'committed' as const, result: contextFrom(data) } : { status: 'notCommitted' as const, latest: contextFrom(data) }
    })
  }
  const inspectNotificationCommand = (input: NotificationReadOperation): Promise<Result<CommandInspection>> => {
    const operation = structuredClone(input)
    return protectedRead((data, who) => {
      if (data.meta.datasetId !== operation.datasetId) throw new DemoError('supersededDataset')
      const parsed = notificationReadSchema.safeParse(operation)
      if (!parsed.success) throw new DemoError('validation')
      const current = notificationDestination(data, who, operation.notificationId)
      const receipt = notificationReceipt(data, who, operation).receipt
      return receipt
        ? { status: 'committed' as const, result: { ...current, receipt: { operationId: receipt.operationId, revision: receipt.revision } } }
        : { status: 'notCommitted' as const, latest: current }
    })
  }
  const inspectResetCommand = (input: ResetOperation): Promise<Result<CommandInspection>> => {
    const command = structuredClone(input)
    return settle(async () => {
      const parsed = resetOperationSchema.safeParse(command)
      if (!parsed.success) throw new DemoError('validation')
      const inspected = await resetStorage.inspectOperation(parsed.data)
      if (inspected.status === 'committed' && datasetId && datasetId !== inspected.result.datasetId) { acceptDataset(inspected.result.datasetId); emit() }
      return inspected.status === 'committed' ? { status: 'committed' as const, result: inspected.result } : { status: 'notCommitted' as const }
    })
  }
  const inspectCommand = (command: DemoOperation): Promise<Result<CommandInspection>> =>
    command.kind === 'resetDemo' ? inspectResetCommand(command)
      : command.kind === 'setLanguage' || command.kind === 'setQueuePreferences' ? inspectPreferenceCommand(command)
        : command.kind === 'markNotificationRead' ? inspectNotificationCommand(command)
          : inspectApplicationCommand(command)

  const staleCause = (kind: ErrorKind): StaleCause | null =>
    kind === 'staleRecord' || kind === 'staleWorkspace' || kind === 'stalePreference' || kind === 'staleNotification' ? kind : null
  const attemptActor = (intent: AttemptIntent): string =>
    intent.kind === 'resetDemo' ? 'reset'
      : intent.kind === 'setLanguage' || intent.kind === 'setQueuePreferences' ? session?.identity ?? 'unsigned'
        : actor()
  const attemptKey = (command: DemoOperation, who: string): string => {
    if (command.kind === 'resetDemo') return `reset/${command.context.kind === 'dataset' ? command.context.datasetId : command.context.token}`
    if (command.kind === 'markNotificationRead') return `${who}/notification/${command.notificationId}`
    if (command.kind === 'setLanguage' || command.kind === 'setQueuePreferences') return `${who}/preference/${command.kind}`
    return `${who}/${command.applicationId}/${command.kind}`
  }
  // The record a buffer was prepared from supplies the expected revisions, so
  // callers never construct or compare them.
  const buildCommand = (intent: AttemptIntent, view: ApplicationView | undefined, operationId: string): DemoOperation => {
    if (intent.kind === 'resetDemo') return { ...intent, operationId }
    if (!datasetId) throw new DemoError('startup')
    if (intent.kind === 'markNotificationRead') return { ...intent, datasetId, operationId }
    if (intent.kind === 'setLanguage' || intent.kind === 'setQueuePreferences') return { ...intent, datasetId, operationId }
    if (intent.kind === 'saveDraft' || intent.kind === 'saveCorrections' || intent.kind === 'submit' || intent.kind === 'resubmit') {
      if (!view || view.role !== 'applicant' || !view.workspace) throw new DemoError('invalidState')
      const expectedWorkspaceRevision = view.workspace.revision
      switch (intent.kind) {
        case 'saveDraft': return { ...intent, datasetId, operationId, expectedWorkspaceRevision }
        case 'saveCorrections': return { ...intent, datasetId, operationId, expectedWorkspaceRevision }
        case 'submit': return { ...intent, datasetId, operationId, expectedWorkspaceRevision, expectedSharedRevision: view.sharedRevision }
        case 'resubmit': return { ...intent, datasetId, operationId, expectedWorkspaceRevision, expectedSharedRevision: view.sharedRevision }
      }
    }
    if (!view || view.role !== 'reviewer' || !session) throw new DemoError('invalidState')
    const expectedSharedRevision = view.sharedRevision
    switch (intent.kind) {
      case 'approve': return { ...intent, datasetId, operationId, expectedSharedRevision, confirmationSessionId: session.sessionId }
      case 'reject': return { ...intent, datasetId, operationId, expectedSharedRevision, confirmationSessionId: session.sessionId }
      default: return { ...intent, datasetId, operationId, expectedSharedRevision }
    }
  }
  const resolveAttempt = async <T extends AttemptIntent>(key: string, command: DemoOperation): Promise<Result<AttemptOutcome<AttemptResult<T>>>> => {
    const inspected = await inspectCommand(command)
    if (!inspected.ok) return inspected as Result<AttemptOutcome<AttemptResult<T>>>
    pendingAttempts.delete(key)
    return inspected.value.status === 'committed'
      ? success({ status: 'committed' as const, result: inspected.value.result as AttemptResult<T> })
      : success({ status: 'notCommitted' as const, latest: inspected.value.latest })
  }
  const runAttempt = async <T extends AttemptIntent>(input: T, view: ApplicationView | undefined, inspectOnly: boolean): Promise<Result<AttemptOutcome<AttemptResult<T>>>> => {
    const intent = structuredClone(input)
    try {
      const who = attemptActor(intent)
      const drafted = buildCommand(intent, view, crypto.randomUUID())
      const key = attemptKey(drafted, who)
      const pending = pendingAttempts.get(key)
      const command = pending && operationFingerprint(pending) === operationFingerprint(drafted) ? pending : drafted
      if (inspectOnly) {
        // No outstanding attempt still means "inspect this intent": the answer
        // is either the receipt of an earlier commit or the current record.
        return await resolveAttempt<T>(key, command)
      }
      const result = await executeOperation(command)
      if (!result.ok) {
        if (result.error.kind === 'outcomeUnknown') {
          pendingAttempts.set(key, command)
          return success({
            status: 'unknown' as const,
            resolve: () => resolveAttempt<T>(key, command),
            discard: () => { pendingAttempts.delete(key) },
          })
        }
        pendingAttempts.delete(key)
        const cause = staleCause(result.error.kind)
        if (cause) return success({ status: 'stale' as const, cause })
        return result as Result<AttemptOutcome<AttemptResult<T>>>
      }
      pendingAttempts.delete(key)
      // Saving a draft or correction can change assistance dependencies; the
      // awaited ordering is part of the commit, not the caller's job.
      if (command.kind === 'saveDraft' || command.kind === 'saveCorrections') await Promise.all([...assistance].map(handle => handle.revalidate()))
      return success({ status: 'committed' as const, result: result.value as AttemptResult<T> })
    } catch (error) {
      return failureFrom<AttemptOutcome<AttemptResult<T>>>(error)
    }
  }

  const saved = createAssistanceOperations({
    read, attempt: settle, authority, permitted, editable, preparedFile, fileResult,
    selections, preparations, assistance, transport: options.evidenceTransport,
    analysisStorage, generation: () => generation, sessionIdentity: () => session?.identity, actor,
  })
  return {
    createEvidenceAssistance: saved.createEvidenceAssistance,
    analysisAvailability: () => ({ cleanup: analysisCleanup }),
    listSavedDemonstrations: saved.listSavedDemonstrations,
    selectSavedDemonstration: saved.selectSavedDemonstration,
    attempt: (intent, view) => runAttempt(intent, view, false),
    inspectAttempt: (intent, view) => runAttempt(intent, view, true),
    inspectReset: () => settle(() => resetStorage.inspect()),
    expireSession,
    newDraft: product => protectedRead((data, who) => {
      if (who === 'salma' || !productIdSchema.safeParse(product).success) throw new DemoError('unavailable')
      const identity = data.identities.find(identity => identity.id === who)!
      const application: Application = {
        id: `RIFD-2026-${crypto.randomUUID()}`, owner: who, product, status: 'draft', assignee: null, sharedRevision: 1,
        submittedAt: null, evidenceMonths: [...initialEvidenceMonths], submitted: null,
        workspace: { revision: 0, roundId: null, savedAt: '', snapshot: { fields: {
          fullName: identity.name[data.preferences.language], mobile: identity.mobile, city: identity.city, email: identity.email,
          businessName: '', activity: 'retail', address: '', operatingSince: '', revenue: '', expenses: '', amount: '', term: '', budget: '', explanation: '',
        }, documents: emptyDocuments() } },
        history: [], rounds: [], assessments: null, checks: null, notes: [], activity: [], repayment: null,
      }
      newDrafts.set(application.id, application)
      return project(data, who, application) as ApplicantView
    }),
    controls: () => ({ ...controls }),
    setControls: next => {
      if (typeof next.slow !== 'boolean' || ![null, 'upload', 'save', 'submission', 'storage'].includes(next.failure)) return
      controls = { ...next }
    },
    prepareAttachment: (input, onProgress) => settle(async () => {
      const who = actor()
      const captured = generation
      const parsed = preparationSchema.safeParse(input)
      if (!parsed.success) throw new DemoError('validation')
      const command = parsed.data
      const key = `${who}/${command.applicationId}/${command.slot}`
      const token = crypto.randomUUID()
      selections.set(key, { token, status: 'preparing' })
      for (const handle of assistance) void handle.revalidate()
      try {
        const data = await read()
        authority(captured, who, command.datasetId, data)
        const application = editable(data, who, command.applicationId)
        if (application.owner !== who) throw new DemoError('permissionDenied')
        const round = application.status === 'draft' ? null : correctionDocument(application, command.slot)
        if (round && command.product && command.product !== application.product) throw new DemoError('permissionDenied')
        const source = command.source
        const sample = source.kind === 'sample' ? data.catalog.find(sample => sample.applicationId === application.id && sample.slot === command.slot && sample.id === source.sampleId) : null
        if (sample && command.slot === 'purchase' && sample.product !== (command.product ?? application.product)) throw new DemoError('validation', command.slot)
        const sampleFile = sample ? data.files.find(file => file.id === sample.fileId) : null
        const generated = source.kind === 'generated' ? await makeFile(application.id, command.slot, source.fields, command.product ?? application.product, application.evidenceMonths, 'original', false, false) : null
        const sampleBytes = generated ?? sampleFile
        const selected = source.kind === 'local' ? source.file : sampleBytes ? new File([sampleBytes.bytes], sampleBytes.name, { type: sampleBytes.mime }) : null
        if (!selected) throw new DemoError('unavailable')
        const mime = validateFileEnvelope(selected)
        if (!mime) throw new DemoError('validation', command.slot)
        const failUpload = consume('upload')
        const duration = controls.slow ? 4000 : 1200
        const current = () => {
          if (captured !== generation || actor() !== who) throw new DemoError('sessionExpired')
          if (selections.get(key)?.token !== token) throw new DemoError('supersededSelection')
        }
        const progress = (percent: number) => { current(); try { onProgress?.(percent) } catch { /* Presentation cannot change preparation. */ } }
        progress(0)
        await sleep(duration / 4); progress(25)
        await sleep(duration / 4); progress(50)
        if (failUpload) throw new DemoError('uploadFailed', command.slot)
        await sleep(duration / 4); progress(75)
        let file: StoredFile
        try { file = await fileFromBytes(crypto.randomUUID(), application.id, command.slot, selected.name, mime, await selected.arrayBuffer()) }
        catch { throw new DemoError('uploadFailed', command.slot) }
        await sleep(duration / 4)
        const latest = await read()
        current(); authority(captured, who, command.datasetId, latest)
        const allowed = editable(latest, who, application.id)
        if (round) {
          if (correctionDocument(allowed, command.slot).id !== round.id) throw new DemoError('invalidState')
        } else if (allowed.status !== 'draft') throw new DemoError('invalidState')
        const reference: PreparedAttachment = { id: file.id, name: file.name, mime: file.mime, size: file.size, hash: file.hash, source: source.kind === 'local' ? 'local' : 'sample' }
        preparations.set(reference.id, { actor: who, datasetId: command.datasetId, file, product: command.product ?? application.product, reference })
        progress(100)
        selections.set(key, { token, status: 'ready', attachmentId: reference.id })
        return { ...reference }
      } catch (error) {
        if (selections.get(key)?.token === token) selections.set(key, { token, status: 'failed' })
        throw error
      }
    }),
    cancelPreparation: (id, slot) => {
      for (const key of selections.keys()) if (key.endsWith(`/${id}/${slot}`)) selections.delete(key)
      for (const handle of assistance) void handle.revalidate()
    },
    readPrepared: (id, reference) => protectedRead((data, who) => {
      const application = editable(data, who, id)
      const prepared = preparations.get(reference.id)
      if (!prepared || application.owner !== who) throw new DemoError('unavailable')
      if (application.status !== 'draft') correctionDocument(application, prepared.file.slot)
      return fileResult(preparedFile(who, id, prepared.file.slot, reference))
    }),
    startup() {
      if (startupPromise) return startupPromise
      const captured = generation
      startupPromise = settle(async () => {
        await delay()
        if (captured !== generation) throw new DemoError('sessionExpired')
        try { if (options.loadFonts !== false) await prepareFonts() } catch { throw new DemoError('resources') }
        if (captured !== generation) throw new DemoError('sessionExpired')
        session = readStoredSession()
        if (!db) {
          const connection = await openStorage(loseStorage)
          if (captured !== generation) { connection.close(); throw new DemoError('sessionExpired') }
          db = connection
        }
        let raw = await readStored(db)
        if (raw === undefined) {
          let seed: Dataset
          try { seed = await prepareSeed({ includeOversizedSample: options.includeOversizedSample, compactEvidence: options.compactEvidence }) } catch { throw new DemoError('resources') }
          if (captured !== generation) throw new DemoError('sessionExpired')
          raw = await transactFinancing(db, current => {
            if (captured !== generation) throw new DemoError('sessionExpired')
            return current === undefined ? seed : validateDataset(current)
          })
        }
        await yieldToInput()
        const data = validateDataset(raw)
        await yieldToInput()
        if (options.verifyStoredFiles !== false) {
          let validationSlice = performance.now()
          for (const file of data.files) {
            const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', file.bytes)), byte => byte.toString(16).padStart(2, '0')).join('')
            if (hash !== file.hash) throw new DemoError('damaged')
            if (performance.now() - validationSlice >= 2) { await yieldToInput(); validationSlice = performance.now() }
          }
        }
        await yieldToInput()
        if (captured !== generation) throw new DemoError('sessionExpired')
        if (datasetId && datasetId !== data.meta.datasetId) {
          newDrafts.clear(); preparations.clear(); selections.clear()
          controls = { slow: false, failure: null }
        }
        datasetId = data.meta.datasetId
        if (session && (session.datasetId !== datasetId || session.expiresAt <= Date.now())) writeSession(null)
        armExpiry()
        connect()
        storageFailure = null
        analysisStorage.start(); analysisCleanup = 'pending'; void cleanAnalysis()
        return contextFrom(data)
      }).then(result => {
        if (!result.ok && captured === generation) {
          storageFailure = result.error.kind
          db?.close(); db = null; session = null; armExpiry()
        }
        return result
      }).finally(() => { startupPromise = null })
      return startupPromise
    },
    context: () => settle(async () => {
      try { return contextFrom(await read()) }
      catch (error) {
        // Concurrent context reads can straddle the same new-dataset observation.
        // Protected reads still refuse their captured, expired authority.
        if (!(error instanceof DemoError) || error.kind !== 'sessionExpired') throw error
        return contextFrom(await read())
      }
    }),
    signIn: identity => settle(async () => {
      if (!actorIdSchema.safeParse(identity).success) throw new DemoError('unavailable')
      const captured = generation
      await delay()
      const data = await read()
      if (captured !== generation) throw new DemoError('sessionExpired')
      const now = Date.now()
      writeSession({ identity, datasetId: data.meta.datasetId, sessionId: crypto.randomUUID(), lastActivity: now, expiresAt: now + inactivity })
      emit()
      return contextFrom(data)
    }),
    signOut: () => settle(async () => { writeSession(null); emit(); return contextFrom(await read()) }),
    listApplications: () => protectedRead(summaries),
    readStaffQueue: (input = {}) => {
      const query = structuredClone(input)
      return protectedRead((data, who) => {
        if (who !== 'salma') throw new DemoError('unavailable')
        return projectQueue(summaries(data, who), query, data.preferences.queue)
      })
    },
    readApplication: id => protectedRead((data, who) => project(data, who, permitted(data, who, id))),
    readPrintSummary: id => protectedRead((data, who) => {
      const application = permitted(data, who, id)
      if (application.status === 'draft' && !application.workspace?.savedAt) throw new DemoError('unavailable')
      const view = project(data, application.owner, application)
      // Explicit public fields keep workspaces and staff data out of either role's print result.
      return {
        id: view.id, product: view.product, status: view.status, snapshot: view.snapshot, documents: view.documents,
        submittedAt: view.submittedAt, evidenceMonths: view.evidenceMonths, history: view.history,
        savedAt: application.status === 'draft' ? application.workspace!.savedAt : null,
        rounds: view.rounds.map(round => ({ id: round.id, requestedAt: round.requestedAt, targets: round.targets })),
      }
    }),
    readFile: (id, fileId) => protectedRead((data, who) => {
      const application = permitted(data, who, id)
      const snapshots = [application.submitted, ...application.rounds.flatMap(round => [round.baseline, round.response]), ...(who !== 'salma' ? [application.workspace?.snapshot] : [])]
      if (!snapshots.some(snapshot => snapshot && Object.values(snapshot.documents).includes(fileId))) throw new DemoError('unavailable')
      return fileResult(data.files.find(file => file.id === fileId && file.applicationId === id))
    }),
    readNotifications: () => protectedRead((data, who) => {
      if (who === 'salma') throw new DemoError('unavailable')
      return data.notifications.filter(notice => notice.owner === who)
    }),
    resolveNotification: id => protectedRead((data, who) => notificationDestination(data, who, id)),
    listSamples: id => protectedRead((data, who) => {
      const application = editable(data, who, id)
      if (who !== application.owner) throw new DemoError('unavailable')
      return data.catalog.filter(sample => sample.applicationId === id)
    }),
    readSample: (id, sampleId) => protectedRead((data, who) => {
      const application = permitted(data, who, id)
      if (who !== application.owner) throw new DemoError('unavailable')
      const sample = data.catalog.find(sample => sample.id === sampleId && sample.applicationId === id)
      return fileResult(data.files.find(file => file.id === sample?.fileId))
    }),
    subscribe(listener) { subscribers.add(listener); return () => { subscribers.delete(listener) } },
    dispose() {
      for (const handle of [...assistance]) handle.api.dispose()
      generation++
      if (timer) clearTimeout(timer)
      db?.close(); db = null; datasetId = null; startupPromise = null
      channel?.close(); channel = null
      document.removeEventListener('pointerdown', activity)
      document.removeEventListener('keydown', activity)
      document.removeEventListener('visibilitychange', activate)
      window.removeEventListener('pageshow', activate)
      window.removeEventListener('focus', activate)
      window.removeEventListener('storage', storageHint)
      listening = false
      newDrafts.clear(); preparations.clear(); selections.clear(); controls = { slow: false, failure: null }
      resetStorage.clear(); analysisStorage.close()
      subscribers.clear()
    },
  }
}

export type { SavedBasis, SavedCapture, SavedExample, SavedSelection, OpenedSavedDemonstration } from './saved-demonstrations'

export const demoIdentities = identities.filter(identity => identity.selectable)
