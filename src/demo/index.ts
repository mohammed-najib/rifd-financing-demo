import { z } from 'zod'
import { canReadApplication } from '../domain'
import { actorIdSchema, languageSchema, slots, type ActorId, type Application, type Dataset, type StoredFile } from '../domain/model'
import { prepareFonts } from './evidence'
import { identities } from './seed-manifest'
import { prepareSeed } from './seed'
import { DemoError, openStorage, readStored, transact, validateDataset } from './storage'
import type { ApplicationView, Context, Demo, ErrorKind, Result, Session } from './types'
export type { ApplicationSummary, ApplicationView, Context, Demo, DemoOperation, ErrorKind, Result } from './types'

const sessionSchema = z.object({ identity: actorIdSchema, datasetId: z.string().uuid(), sessionId: z.string().uuid(), lastActivity: z.number(), expiresAt: z.number() })
const sessionKey = 'rifd.session.v1'
const inactivity = 15 * 60 * 1000
const delay = () => new Promise(resolve => setTimeout(resolve, 400))
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
  const subscribers = new Set<() => void>()
  const emit = () => { for (const listener of subscribers) { try { listener() } catch { /* Observers cannot change committed outcomes. */ } } }
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
  const expire = () => {
    if (session && Date.now() >= session.expiresAt) {
      try { writeSession(null) } catch { session = null; generation++; }
      emit()
    }
  }
  const activity = () => {
    if (!session) return
    if (Date.now() >= session.expiresAt) { expire(); return }
    const now = Date.now()
    try { session = { ...session, lastActivity: now, expiresAt: now + inactivity }; sessionStorage.setItem(sessionKey, JSON.stringify(session)); armExpiry() }
    catch { session = null; generation++; emit() }
  }
  const attempt = async <T>(run: () => Promise<T>): Promise<Result<T>> => {
    try { return success(await run()) }
    catch (error) { return failure(error instanceof DemoError ? error.kind : 'storage') }
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
    const application = data.applications.find(application => application.id === id)
    if (!application || !canReadApplication(who, application)) throw new DemoError('unavailable')
    return application
  }
  const fileResult = (file: StoredFile | undefined) => {
    if (!file) throw new DemoError('unavailable')
    return { bytes: file.bytes, name: file.name, mime: file.mime, hash: file.hash }
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
    try { channel = new BroadcastChannel('rifd.commit.v1'); channel.onmessage = hint } catch { window.addEventListener('storage', hint) }
  }
  const announce = () => {
    emit()
    try { if (channel) channel.postMessage({ datasetId, kind: 'preferences' }); else localStorage.setItem('rifd.commit.v1', crypto.randomUUID()) }
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
  return {
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
    execute: operation => attempt(async () => {
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
    }),
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
      const application = permitted(data, who, id)
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
      window.removeEventListener('storage', hint)
      listening = false
      subscribers.clear()
    },
  }
}

export const demoIdentities = identities.filter(identity => identity.selectable)
