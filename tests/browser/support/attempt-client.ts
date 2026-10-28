import type {
  ApplicationView, AttemptIntent, AttemptResult, Context, Demo, MutationResult,
  NotificationDestination, NotificationReadResult, ResetResult, Result,
} from '../../../src/demo/types'

export type Inspection = { status: 'committed'; result: MutationResult } | { status: 'notCommitted'; application: ApplicationView }
export type PreferenceInspection = { status: 'committed' | 'notCommitted'; context: Context }
export type NotificationInspection = { status: 'committed'; result: NotificationReadResult } | { status: 'notCommitted'; current: NotificationDestination }
export type ResetInspection = { status: 'committed'; result: ResetResult } | { status: 'notCommitted' }

function refused(cause: string): { ok: false; error: { kind: import('../../../src/demo/types').ErrorKind; key: `error.${import('../../../src/demo/types').ErrorKind}` } } {
  const kind = cause as import('../../../src/demo/types').ErrorKind
  return { ok: false, error: { kind, key: `error.${kind}` } }
}

// Tests speak intents. These helpers unwrap the outcome into the shape the existing
// assertions use, and read the base view when a test does not hold one.
async function attemptResult<T extends AttemptIntent>(target: Demo, input: T, view?: ApplicationView | Context): Promise<Result<AttemptResult<T>>> {
  const intent = structuredClone(input)
  let base = view
  if (!base && 'applicationId' in intent) {
    const read = await target.readApplication(intent.applicationId)
    if (!read.ok) return read
    base = read.value
  } else if (!base && (intent.kind === 'setLanguage' || intent.kind === 'setQueuePreferences')) {
    const read = await target.context()
    if (!read.ok) return read
    base = read.value
  }
  const result = await target.attempt(intent, base)
  if (!result.ok) return result
  const outcome = result.value
  if (outcome.status === 'committed') return { ok: true, value: outcome.result }
  const kind = outcome.status === 'stale' ? outcome.cause : outcome.status === 'unknown' ? 'outcomeUnknown' : 'requestFailed'
  return { ok: false, error: { kind, key: `error.${kind}` } }
}

async function inspection<T extends AttemptIntent>(target: Demo, input: T, view?: ApplicationView | Context): Promise<Result<Inspection>> {
  const intent = structuredClone(input)
  let base = view
  if (!base && 'applicationId' in intent) {
    const read = await target.readApplication(intent.applicationId)
    if (!read.ok) return read
    base = read.value
  } else if (!base && (intent.kind === 'setLanguage' || intent.kind === 'setQueuePreferences')) {
    const read = await target.context()
    if (!read.ok) return read
    base = read.value
  }
  const result = await target.inspectAttempt(intent, base)
  if (!result.ok) return result
  const outcome = result.value
  if (outcome.status === 'stale') return refused(outcome.cause)
  if (outcome.status === 'unknown') return refused('outcomeUnknown')
  return outcome.status === 'committed'
    ? { ok: true, value: { status: 'committed', result: outcome.result as MutationResult } }
    : { ok: true, value: { status: 'notCommitted', application: outcome.latest as ApplicationView } }
}

async function preferenceInspection(target: Demo, intent: AttemptIntent, context?: Context): Promise<Result<PreferenceInspection>> {
  const read = context ? { ok: true as const, value: context } : await target.context()
  if (!read.ok) return read
  const result = await target.inspectAttempt(intent, read.value)
  if (!result.ok) return result
  const outcome = result.value
  if (outcome.status === 'stale') return refused(outcome.cause)
  if (outcome.status === 'unknown') return refused('outcomeUnknown')
  return { ok: true, value: { status: outcome.status === 'committed' ? 'committed' : 'notCommitted', context: (outcome.status === 'committed' ? outcome.result : outcome.latest) as Context } }
}

async function notificationInspection(target: Demo, intent: AttemptIntent): Promise<Result<NotificationInspection>> {
  const result = await target.inspectAttempt(intent)
  if (!result.ok) return result
  const outcome = result.value
  if (outcome.status === 'stale') return refused(outcome.cause)
  if (outcome.status === 'unknown') return refused('outcomeUnknown')
  return outcome.status === 'committed'
    ? { ok: true, value: { status: 'committed', result: outcome.result as NotificationReadResult } }
    : { ok: true, value: { status: 'notCommitted', current: outcome.latest as NotificationDestination } }
}

async function resetInspection(target: Demo, intent: AttemptIntent): Promise<Result<ResetInspection>> {
  const result = await target.inspectAttempt(intent)
  if (!result.ok) return result
  const outcome = result.value
  if (outcome.status === 'stale') return refused(outcome.cause)
  if (outcome.status === 'unknown') return refused('outcomeUnknown')
  return { ok: true, value: outcome.status === 'committed' ? { status: 'committed', result: outcome.result as ResetResult } : { status: 'notCommitted' } }
}

export function installAttemptClient() {
  const current = () => window.demo
  window.commit = (intent, view) => attemptResult(current(), intent, view)
  window.commitOn = (target, intent, view) => attemptResult(target, intent, view)
  window.inspect = (intent, view) => inspection(current(), intent, view)
  window.inspectOn = (target, intent, view) => inspection(target, intent, view)
  window.inspectPreference = (intent, context) => preferenceInspection(current(), intent, context)
  window.inspectOnPreference = (target, intent, context) => preferenceInspection(target, intent, context)
  window.inspectNotification = intent => notificationInspection(current(), intent)
  window.inspectOnNotification = (target, intent) => notificationInspection(target, intent)
  window.inspectReset = intent => resetInspection(current(), intent)
  window.inspectOnReset = (target, intent) => resetInspection(target, intent)
}