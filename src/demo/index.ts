import { z } from 'zod'
import { canReadApplication, emptyDocuments, validateFileEnvelope } from '../domain'
import { actorIdSchema, languageSchema, productIdSchema, slots, type ActorId, type Application, type Dataset, type StoredFile } from '../domain/model'
import { fileFromBytes, makeFile, prepareFonts } from './evidence'
import { draftFingerprint, preparationSchema, saveDraftSchema } from './commands'
import { identities } from './seed-manifest'
import { prepareSeed } from './seed'
import { DemoError, openStorage, readStored, transact, validateDataset } from './storage'
import type { ApplicantView, ApplicationView, Context, Controls, Demo, ErrorKind, LanguageOperation, MutationResult, PreparedAttachment, Result, SaveDraftOperation, Session } from './types'
export type { ApplicationSummary, ApplicationView, Context, Demo, DemoOperation, DraftDocuments, ErrorKind, MutationResult, OperationInspection, PreparedAttachment, Preparation, Result, SaveDraftOperation } from './types'

const sessionSchema = z.object({ identity: actorIdSchema, datasetId: z.string().uuid(), sessionId: z.string().uuid(), lastActivity: z.number(), expiresAt: z.number() })
const sessionKey = 'rifd.session.v1'
const inactivity = 15 * 60 * 1000
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const success = <T>(value: T): Result<T> => ({ ok: true, value })
const failure = <T>(kind: ErrorKind): Result<T> => ({ ok: false, error: { kind, key: `error.${kind}` } })

// Construction has no browser side effects. startup is called only after client mounting.
export function createDemo(): Demo {
  let db: IDBDatabase | null = null
  let datasetId: string | null = null
  let session: Session | null = null
  let generation = 0
  let channel: BroadcastChannel | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let startupPromise: Promise<Result<Context>> | null = null
  let listening = false
  const subscribers = new Set<(session: Session | null) => void>()
  const newDrafts = new Map<string, Application>()
  let controls: Controls = { slow: false, failure: null }
  const delay = () => sleep(controls.slow ? 1500 : 400)
  const consume = (kind: Controls['failure']) => {
    if (controls.failure !== kind) return false
    controls = { ...controls, failure: null }
    return true
  }
  const preparations = new Map<string, { actor: ActorId; datasetId: string; file: StoredFile; product: Application['product']; reference: PreparedAttachment }>()
  const selections = new Map<string, string>()
  const emit = () => { for (const listener of subscribers) { try { listener(session ? { ...session } : null) } catch { /* Observers cannot change committed outcomes. */ } } }
  const storedSession = () => {
    try {
      const raw = sessionStorage.getItem(sessionKey)
      if (!raw) return null
      const parsed = sessionSchema.safeParse(JSON.parse(raw))
      return parsed.success ? parsed.data : null
    } catch (error) {
      if (error instanceof SyntaxError) return null
      throw new DemoError('storage')
    }
  }
  const writeSession = (next: Session | null) => {
    try { if (next) sessionStorage.setItem(sessionKey, JSON.stringify(next)); else sessionStorage.removeItem(sessionKey) }
    catch { throw new DemoError('storage') }
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
    try { session = { ...session, lastActivity: now, expiresAt: now + inactivity }; sessionStorage.setItem(sessionKey, JSON.stringify(session)); armExpiry() }
    catch { session = null; generation++; emit() }
  }
  const attempt = async <T>(run: () => Promise<T>): Promise<Result<T>> => {
    try { return success(await run()) }
    catch (error) {
      const result = failure<T>(error instanceof DemoError ? error.kind : 'storage')
      if (!result.ok && error instanceof DemoError && error.slot) result.error.slot = error.slot
      return result
    }
  }
  const read = async (): Promise<Dataset> => {
    if (!db || !datasetId) throw new DemoError('startup')
    const connection = db
    const observedDataset = datasetId
    const captured = generation
    const data = validateDataset(await readStored(connection))
    // A disposed screen's late read must never clear a newer screen's tab session.
    if (captured !== generation || db !== connection) throw new DemoError('sessionExpired')
    if (data.meta.datasetId !== observedDataset) {
      newDrafts.clear(); preparations.clear(); selections.clear()
      try { writeSession(null) } catch { session = null; generation++ }
      throw new DemoError('supersededDataset')
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
  const protectedRead = async <T>(project: (data: Dataset, who: ActorId) => T): Promise<Result<T>> => attempt(async () => {
    const who = actor()
    const captured = generation
    await delay()
    const data = await read()
    if (captured !== generation || who !== actor()) throw new DemoError('sessionExpired')
    return project(data, who)
  })
  const permitted = (data: Dataset, who: ActorId, id: string): Application => {
    const application = data.applications.find(application => application.id === id) ?? newDrafts.get(id)
    if (!application || !canReadApplication(who, application)) throw new DemoError('unavailable')
    return application
  }
  const editable = (data: Dataset, who: ActorId, id: string): Application => {
    const application = data.applications.find(application => application.id === id) ?? newDrafts.get(id)
    if (!application || application.owner !== who) throw new DemoError('unavailable')
    return application
  }
  const fileResult = (file: StoredFile | undefined) => {
    if (!file) throw new DemoError('unavailable')
    return { bytes: file.bytes.slice(0), name: file.name, mime: file.mime, hash: file.hash }
  }
  const activate = () => { if (document.visibilityState === 'visible') { expire(); emit() } }
  const hint = () => emit()
  const connect = () => {
    if (listening) return
    listening = true
    document.addEventListener('pointerdown', activity)
    document.addEventListener('keydown', activity)
    document.addEventListener('visibilitychange', activate)
    window.addEventListener('pageshow', activate)
    window.addEventListener('focus', activate)
    try { channel = new BroadcastChannel('rifd.commit.v1'); channel.onmessage = hint } catch { window.addEventListener('storage', hint) }
  }
  const announce = (kind: 'preferences' | 'application' = 'preferences', applicationId?: string, revision?: number) => {
    emit()
    try { if (channel) channel.postMessage({ datasetId, kind, applicationId, revision }); else localStorage.setItem('rifd.commit.v1', crypto.randomUUID()) }
    catch { /* The transaction already committed. Activation rereads storage. */ }
  }
  const project = (data: Dataset, who: ActorId, application: Application): ApplicationView => {
    const snapshot = application.submitted ?? application.workspace!.snapshot
    const common = {
      id: application.id, product: application.product, status: application.status, sharedRevision: application.sharedRevision,
      snapshot, submittedAt: application.submittedAt, evidenceMonths: application.evidenceMonths,
      history: application.history, repayment: application.repayment,
      documents: slots.map(slot => {
        const file = data.files.find(file => file.id === snapshot.documents[slot])
        return { slot, file: file ? { id: file.id, name: file.name, mime: file.mime, size: file.size, hash: file.hash } : null }
      }),
    }
    return who === 'salma'
      ? { ...common, role: 'reviewer', rounds: application.rounds, assignment: data.identities.find(identity => identity.id === application.assignee)?.name ?? null, assignedToYou: application.assignee === who, assessments: application.assessments, checks: application.checks, notes: application.notes, activity: application.activity }
      : {
        ...common, role: 'applicant', workspace: application.workspace,
        rounds: application.rounds.map(round => ({
          ...round,
          targets: round.targets.map(target => target.kind === 'field'
            ? { kind: target.kind, field: target.field, reason: target.reason }
            : { kind: target.kind, slot: target.slot, reason: target.reason }),
        })),
      }
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
  const draftReceipt = (data: Dataset, who: ActorId, operation: SaveDraftOperation) => {
    const receipt = data.mutationReceipts.find(receipt => receipt.actor === who && receipt.operationId === operation.operationId)
    if (data.receipts.some(receipt => receipt.actor === who && receipt.operationId === operation.operationId) || receipt && receipt.fingerprint !== draftFingerprint(operation)) throw new DemoError('identifierMisuse')
    return receipt
  }
  async function execute(operation: LanguageOperation): Promise<Result<Context>>
  async function execute(operation: SaveDraftOperation): Promise<Result<MutationResult>>
  async function execute(input: LanguageOperation | SaveDraftOperation): Promise<Result<Context | MutationResult>> {
    // Capture raw payload and attachment descriptors before any delay.
    const operation = structuredClone(input)
    if (operation.kind === 'saveDraft') return attempt(async () => {
      const who = actor()
      const captured = generation
      const parsed = saveDraftSchema.safeParse(operation)
      if (!parsed.success) throw new DemoError('validation')
      const command = parsed.data
      await delay()
      if (!db) throw new DemoError('startup')
      let replay = false
      let abortStorage = false
      const data = await transact(db, raw => {
        if (captured !== generation || actor() !== who) throw new DemoError('sessionExpired')
        const current = validateDataset(raw)
        authority(captured, who, command.datasetId, current)
        const original = current.applications.find(application => application.id === command.applicationId)
        const application = original ? permitted(current, who, command.applicationId) : structuredClone(editable(current, who, command.applicationId))
        const receipt = draftReceipt(current, who, command)
        if (receipt) {
          replay = true
          return current
        }
        if (application.workspace?.revision !== command.expectedWorkspaceRevision) throw new DemoError('staleWorkspace')
        if (application.owner !== who) throw new DemoError('permissionDenied')
        if (application.status !== 'draft' || !application.workspace) throw new DemoError('invalidState')
        if (application.product !== command.product && command.documents.purchase.kind === 'saved' && command.documents.purchase.fileId !== null) throw new DemoError('validation', 'purchase')
        if (!original) current.applications.push(application)
        const documents = { ...application.workspace.snapshot.documents }
        for (const slot of slots) {
          const document = command.documents[slot]
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
        authority(captured, who, command.datasetId, current)
        if (consume('save')) throw new DemoError('requestFailed')
        abortStorage = consume('storage')
        const savedAt = new Date().toISOString()
        application.product = command.product
        application.workspace = { ...application.workspace, revision: application.workspace.revision + 1, savedAt, snapshot: { fields: command.fields, documents } }
        current.mutationReceipts.push({
          kind: command.kind, actor: who, datasetId: command.datasetId, operationId: command.operationId, fingerprint: draftFingerprint(command),
          applicationId: application.id, workspaceRevision: application.workspace.revision, sharedRevision: application.sharedRevision, savedAt,
        })
        return current
      }, () => {
        if (captured !== generation || session?.identity !== who || !session || Date.now() >= session.expiresAt) throw new DemoError('sessionExpired')
        return abortStorage
      })
      const receipt = data.mutationReceipts.find(receipt => receipt.actor === who && receipt.operationId === command.operationId)!
      if (!replay) announce('application', command.applicationId, receipt.workspaceRevision)
      return { receipt, application: project(data, who, permitted(data, who, command.applicationId)) }
    })
    return attempt(async () => {
      if (operation.kind !== 'setLanguage' || !languageSchema.safeParse(operation.language).success || !operation.operationId || !Number.isInteger(operation.expectedRevision)) throw new DemoError('validation')
      const captured = generation
      const by = session?.identity ?? 'unsigned'
      await delay()
      if (captured !== generation) throw new DemoError('sessionExpired')
      if (!db) throw new DemoError('startup')
      const fingerprint = JSON.stringify({ kind: operation.kind, language: operation.language })
      const data = await transact(db, raw => {
        const current = validateDataset(raw)
        if (current.meta.datasetId !== operation.datasetId || current.meta.datasetId !== datasetId) throw new DemoError('supersededDataset')
        if (current.mutationReceipts.some(receipt => receipt.actor === by && receipt.operationId === operation.operationId)) throw new DemoError('identifierMisuse')
        const receipt = current.receipts.find(receipt => receipt.actor === by && receipt.operationId === operation.operationId)
        if (receipt) {
          if (receipt.fingerprint !== fingerprint) throw new DemoError('identifierMisuse')
          return current
        }
        if (captured !== generation) throw new DemoError('sessionExpired')
        if (current.preferences.revision !== operation.expectedRevision) throw new DemoError('stalePreference')
        current.preferences = { ...current.preferences, language: operation.language, revision: current.preferences.revision + 1 }
        current.receipts.push({ actor: by, operationId: operation.operationId, fingerprint, revision: current.preferences.revision })
        return current
      })
      announce()
      return contextFrom(data)
    })
  }
  return {
    execute,
    expireSession,
    newDraft: product => protectedRead((data, who) => {
      if (who === 'salma' || !productIdSchema.safeParse(product).success) throw new DemoError('unavailable')
      const identity = data.identities.find(identity => identity.id === who)!
      const application: Application = {
        id: `RIFD-2026-${crypto.randomUUID()}`, owner: who, product, status: 'draft', assignee: null, sharedRevision: 1,
        submittedAt: null, evidenceMonths: ['2026-07', '2026-08', '2026-09'], submitted: null,
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
      if (typeof next.slow !== 'boolean' || ![null, 'upload', 'save', 'storage'].includes(next.failure)) return
      controls = { ...next }
    },
    prepareAttachment: (input, onProgress) => attempt(async () => {
      const who = actor()
      const captured = generation
      const parsed = preparationSchema.safeParse(input)
      if (!parsed.success) throw new DemoError('validation')
      const command = parsed.data
      const key = `${command.applicationId}/${command.slot}`
      const token = crypto.randomUUID()
      selections.set(key, token)
      const data = await read()
      authority(captured, who, command.datasetId, data)
      const application = editable(data, who, command.applicationId)
      if (application.owner !== who) throw new DemoError('permissionDenied')
      if (application.status !== 'draft') throw new DemoError('invalidState')
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
        if (selections.get(key) !== token) throw new DemoError('supersededSelection')
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
      if (allowed.status !== 'draft') throw new DemoError('invalidState')
      const reference: PreparedAttachment = { id: file.id, name: file.name, mime: file.mime, size: file.size, hash: file.hash, source: source.kind === 'local' ? 'local' : 'sample' }
      preparations.set(reference.id, { actor: who, datasetId: command.datasetId, file, product: command.product ?? application.product, reference })
      progress(100)
      return { ...reference }
    }),
    cancelPreparation: (id, slot) => { selections.delete(`${id}/${slot}`) },
    readPrepared: (id, reference) => protectedRead((data, who) => {
      const application = editable(data, who, id)
      const prepared = preparations.get(reference.id)
      if (!prepared || application.owner !== who) throw new DemoError('unavailable')
      return fileResult(preparedFile(who, id, prepared.file.slot, reference))
    }),
    inspectOperation: input => {
      const operation = structuredClone(input)
      return protectedRead((data, who) => {
        if (data.meta.datasetId !== operation.datasetId) throw new DemoError('supersededDataset')
        const application = editable(data, who, operation.applicationId)
        const parsed = saveDraftSchema.safeParse(operation)
        if (!parsed.success) throw new DemoError('validation')
        const receipt = draftReceipt(data, who, parsed.data)
        return receipt ? { status: 'committed', result: { receipt, application: project(data, who, application) } } : { status: 'notCommitted', application: project(data, who, application) }
      })
    },
    startup() {
      if (startupPromise) return startupPromise
      const captured = generation
      startupPromise = attempt(async () => {
        await delay()
        if (captured !== generation) throw new DemoError('sessionExpired')
        try { await prepareFonts() } catch { throw new DemoError('resources') }
        if (captured !== generation) throw new DemoError('sessionExpired')
        session = storedSession()
        if (!db) {
          const connection = await openStorage(() => { db = null; generation++; emit() })
          if (captured !== generation) { connection.close(); throw new DemoError('sessionExpired') }
          db = connection
        }
        let raw = await readStored(db)
        if (raw === undefined) {
          let seed: Dataset
          try { seed = await prepareSeed() } catch { throw new DemoError('resources') }
          if (captured !== generation) throw new DemoError('sessionExpired')
          raw = await transact(db, current => {
            if (captured !== generation) throw new DemoError('sessionExpired')
            return current === undefined ? seed : validateDataset(current)
          })
        }
        const data = validateDataset(raw)
        for (const file of data.files) {
          const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', file.bytes)), byte => byte.toString(16).padStart(2, '0')).join('')
          if (hash !== file.hash) throw new DemoError('damaged')
        }
        if (captured !== generation) throw new DemoError('sessionExpired')
        datasetId = data.meta.datasetId
        if (session && (session.datasetId !== datasetId || session.expiresAt <= Date.now())) writeSession(null)
        armExpiry()
        connect()
        return contextFrom(data)
      }).finally(() => { startupPromise = null })
      return startupPromise
    },
    context: () => attempt(async () => contextFrom(await read())),
    signIn: identity => attempt(async () => {
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
    signOut: () => attempt(async () => { writeSession(null); emit(); return contextFrom(await read()) }),
    listApplications: () => protectedRead((data, who) => data.applications.filter(application => canReadApplication(who, application)).map(application => {
      const fields = (application.submitted ?? application.workspace!.snapshot).fields
      return {
        id: application.id, product: application.product, status: application.status,
        fullName: fields.fullName, businessName: fields.businessName, amount: fields.amount, term: fields.term, submittedAt: application.submittedAt,
        nextAction: application.status === 'draft' ? 'inspectDraft' as const : application.status === 'correctionsRequested' ? 'inspectCorrections' as const : 'viewApplication' as const,
        ...(who === 'salma' ? { assignment: data.identities.find(identity => identity.id === application.assignee)?.name ?? null, assignedToYou: application.assignee === who } : {}),
      }
    }).sort((a, b) => (b.submittedAt ?? '').localeCompare(a.submittedAt ?? '') || a.id.localeCompare(b.id))),
    readApplication: id => protectedRead((data, who) => project(data, who, permitted(data, who, id))),
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
      generation++
      if (timer) clearTimeout(timer)
      db?.close(); db = null; datasetId = null; startupPromise = null
      channel?.close(); channel = null
      document.removeEventListener('pointerdown', activity)
      document.removeEventListener('keydown', activity)
      document.removeEventListener('visibilitychange', activate)
      window.removeEventListener('pageshow', activate)
      window.removeEventListener('focus', activate)
      window.removeEventListener('storage', hint)
      listening = false
      newDrafts.clear(); preparations.clear(); selections.clear(); controls = { slow: false, failure: null }
      subscribers.clear()
    },
  }
}

export const demoIdentities = identities.filter(identity => identity.selectable)
