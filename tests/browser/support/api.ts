import { createDemo } from '../../../src/demo'
import type { ApplicationIntent, ApplicationView, AttemptIntent, AttemptResult, Demo, Result } from '../../../src/demo/types'
import { installAttemptClient } from './attempt-client'
import type { Inspection, NotificationInspection, PreferenceInspection, ResetInspection } from './attempt-client'

declare global {
  interface Window {
    demo: Demo; datasetId: string; draftCommand: ApplicationIntent; submitCommand: ApplicationIntent
    commit<T extends AttemptIntent>(intent: T, view?: ApplicationView): Promise<Result<AttemptResult<T>>>
    commitOn<T extends AttemptIntent>(demo: Demo, intent: T, view?: ApplicationView): Promise<Result<AttemptResult<T>>>
    inspect(intent: AttemptIntent, view?: ApplicationView): Promise<Result<Inspection>>
    inspectOn(demo: Demo, intent: AttemptIntent, view?: ApplicationView): Promise<Result<Inspection>>
    inspectPreference(intent: AttemptIntent): Promise<Result<PreferenceInspection>>
    inspectOnPreference(demo: Demo, intent: AttemptIntent): Promise<Result<PreferenceInspection>>
    inspectNotification(intent: AttemptIntent): Promise<Result<NotificationInspection>>
    inspectOnNotification(demo: Demo, intent: AttemptIntent): Promise<Result<NotificationInspection>>
    inspectReset(intent: AttemptIntent): Promise<Result<ResetInspection>>
    inspectOnReset(demo: Demo, intent: AttemptIntent): Promise<Result<ResetInspection>>
  }
}

const params = new URLSearchParams(location.search)
const strict = params.has('strict')
window.demo = createDemo({
  latency: strict ? 400 : 0,
  verifyStoredFiles: strict,
  loadFonts: strict || params.has('fonts'),
  includeOversizedSample: params.has('full'),
  compactEvidence: !params.has('full'),
})
installAttemptClient()