import type { ActorId, Application, ApplicationStatus, Bilingual, CorrectionTarget, DocumentSlot, Fields, Identity, Language, MutationReceipt, Notification, Preferences, ProductId, QueuePreferences, Repayment, Sample, Snapshot } from '../domain/model'
import type { FieldIssue, ReviewCheck, reviewPermissions } from '../domain'
import type { ResetContext } from '../domain/model'
export type { ResetContext } from '../domain/model'
export type ResetOperation = { kind: 'resetDemo'; context: ResetContext; operationId: string; confirmed: true }
export type ResetResult = { datasetId: string; replay: boolean }
export type ResetInspection = { status: 'committed'; result: ResetResult } | { status: 'notCommitted' }

export type ErrorKind = 'unavailable' | 'sessionExpired' | 'storage' | 'startup' | 'resources' | 'blocked' | 'unsupported' | 'damaged' | 'stalePreference' | 'staleNotification' | 'supersededDataset' | 'identifierMisuse' | 'validation' | 'staleWorkspace' | 'staleRecord' | 'invalidState' | 'permissionDenied' | 'uploadFailed' | 'requestFailed' | 'outcomeUnknown' | 'supersededSelection'
export type Result<T> = { ok: true; value: T } | { ok: false; error: { kind: ErrorKind; key: `error.${ErrorKind}`; slot?: DocumentSlot; fieldIssues?: FieldIssue[] } }
export type Session = { identity: ActorId; datasetId: string; sessionId: string; lastActivity: number; expiresAt: number }
export type Context = { datasetId: string; preferences: Preferences; session: Session | null; identity: Identity | null }
export type CommitHint = { datasetId: string; kind: 'preferences'; revision: number }
  | { datasetId: string; kind: 'workspace' | 'application'; applicationId: string; revision: number }
  | { datasetId: string; kind: 'notification'; notificationId: string; revision: number }
  | { datasetId: string; kind: 'reset' | 'analysis' }
export type DocumentView = { slot: DocumentSlot; file: { id: string; name: string; mime: string; size: number; hash: string } | null }
export type ApplicationSummary = {
  id: string; product: ProductId; status: ApplicationStatus; fullName: string; businessName: string;
  amount: string; term: string; submittedAt: string | null;
  nextAction: 'inspectDraft' | 'inspectCorrections' | 'viewApplication';
  assignment?: Bilingual | null;
  assignedToYou?: boolean;
}
export type QueueQuery = QueuePreferences & { search: string; page: number }
export type StaffQueue = {
  rows: ApplicationSummary[]; query: QueueQuery; total: number; matched: number; pages: number;
  counts: Record<Exclude<ApplicationStatus, 'draft'>, number>;
  assignments: Record<Exclude<QueuePreferences['assignment'], 'all'>, number>;
}
export type CommonView = {
  id: string; product: ProductId; status: ApplicationStatus; sharedRevision: number;
  snapshot: Snapshot; documents: DocumentView[]; submittedAt: string | null; evidenceMonths: string[];
  history: Application['history'];
  repayment: Repayment | null;
}
export type PublicRound = Omit<Application['rounds'][number], 'targets' | 'responseAssessments'> & {
  targets: CorrectionTarget[];
}
export type ApplicantView = CommonView & { role: 'applicant'; workspace: Application['workspace']; workspaceDocuments: DocumentView[]; rounds: PublicRound[] }
export type StaffView = CommonView & {
  role: 'reviewer'; assignment: Bilingual | null; assignedToYou: boolean;
  inspectionContexts: Record<DocumentSlot, string | null>;
  permissions: ReturnType<typeof reviewPermissions>;
  rounds: Application['rounds'];
  assessments: Application['assessments']; checks: Application['checks'];
  notes: Application['notes']; activity: Application['activity'];
}
export type ApplicationView = ApplicantView | StaffView
export type PrintSummary = Pick<CommonView, 'id' | 'product' | 'status' | 'snapshot' | 'documents' | 'submittedAt' | 'evidenceMonths' | 'history'> & {
  savedAt: string | null;
  rounds: Array<Pick<PublicRound, 'id' | 'requestedAt' | 'targets'>>;
}
export type NotificationDestination = { notification: Notification; destination: string }
export type NotificationReadOperation = {
  kind: 'markNotificationRead'; datasetId: string; operationId: string; notificationId: string; expectedRevision: number;
}
export type NotificationReadResult = NotificationDestination & { receipt: { operationId: string; revision: number } }
export type NotificationInspection = { status: 'committed'; result: NotificationReadResult } | { status: 'notCommitted'; current: NotificationDestination }
export type LanguageOperation = {
  kind: 'setLanguage'; datasetId: string; operationId: string; expectedRevision: number; language: Language;
}
export type QueuePreferenceOperation = {
  kind: 'setQueuePreferences'; datasetId: string; operationId: string; expectedRevision: number; queue: QueuePreferences;
}
export type PreferenceOperation = LanguageOperation | QueuePreferenceOperation
export type PreferenceInspection = { status: 'committed' | 'notCommitted'; context: Context }
export type PreparedAttachment = { id: string; name: string; mime: string; size: number; hash: string; source: 'local' | 'sample' }
export type DraftDocuments = Record<DocumentSlot, { kind: 'saved'; fileId: string | null } | { kind: 'prepared'; attachment: PreparedAttachment }>
export type SaveDraftOperation = {
  kind: 'saveDraft'; datasetId: string; operationId: string; applicationId: string;
  expectedWorkspaceRevision: number; product: ProductId; fields: Fields; documents: DraftDocuments;
}
export type SubmitOperation = Omit<SaveDraftOperation, 'kind'> & { kind: 'submit'; expectedSharedRevision: number }
export type SaveCorrectionsOperation = Omit<SaveDraftOperation, 'kind'> & { kind: 'saveCorrections'; roundId: string }
export type ResubmitOperation = Omit<SaveCorrectionsOperation, 'kind'> & { kind: 'resubmit'; expectedSharedRevision: number }
export type InspectionConfirmation = { kind: 'inspected'; contextToken: string; confirmed: true }
  | { kind: 'unableToOpen'; contextToken: string }
export type ReviewOperation = {
  datasetId: string; operationId: string; applicationId: string; expectedSharedRevision: number;
} & ({ kind: 'claimApplication' | 'startReview' | 'unassignApplication' } | { kind: 'transferApplication'; from: 'salma' | 'khaled'; to: 'salma' | 'khaled'; confirmed: true; simulated?: true }
  | { kind: 'assessDocument'; slot: DocumentSlot; fileId: string; status: 'accepted' | 'needsReplacement'; reason: Bilingual | null; inspection: InspectionConfirmation }
  | { kind: 'recordCheck'; check: ReviewCheck; outcome: 'unchecked' | 'passed' | 'failed' }
  | { kind: 'saveNote'; text: Bilingual }
  | { kind: 'verifyCorrection'; roundId: string; field: keyof Fields; verified: boolean }
  | { kind: 'approve' | 'reject'; reason: Bilingual; confirmed: true; confirmationSessionId: string }
  | { kind: 'requestCorrections'; targets: CorrectionTarget[]; confirmed: true })
export type ApplicationOperation = SaveDraftOperation | SubmitOperation | SaveCorrectionsOperation | ResubmitOperation
export type ApplicationMutation = ApplicationOperation | ReviewOperation
export type DemoOperation = PreferenceOperation | ApplicationMutation | NotificationReadOperation | ResetOperation
// An attempt supplies the record it was prepared from. The envelope — dataset,
// operation identity, revisions and confirmation session — belongs to the store.
type StoreSupplied = 'datasetId' | 'operationId' | 'confirmationSessionId' | 'expectedSharedRevision' | 'expectedWorkspaceRevision'
type IntentOf<T> = T extends unknown ? Omit<T, StoreSupplied> : never
export type AttemptIntent = IntentOf<DemoOperation>
export type ApplicationIntent = Extract<AttemptIntent, { kind: 'saveDraft' | 'saveCorrections' | 'submit' | 'resubmit' }>
export type ReviewIntent = Extract<AttemptIntent, { kind: ReviewOperation['kind'] }>
export type AttemptResult<T> =
  T extends { kind: 'resetDemo' } ? ResetResult
  : T extends { kind: 'markNotificationRead' } ? NotificationReadResult
  : T extends { kind: 'setLanguage' | 'setQueuePreferences' } ? Context
  : MutationResult
export type StaleCause = 'staleRecord' | 'staleWorkspace' | 'stalePreference' | 'staleNotification'
export type AttemptOutcome<T> =
  | { status: 'committed'; result: T }
  | { status: 'notCommitted'; latest?: ApplicationView | Context | NotificationDestination }
  | { status: 'stale'; cause: StaleCause }
  | { status: 'unknown'; resolve(): Promise<Result<AttemptOutcome<T>>>; discard(): void }
export type MutationResult = { receipt: MutationReceipt; application: ApplicationView }
export type OperationInspection = { status: 'committed'; result: MutationResult } | { status: 'notCommitted'; application: ApplicationView }
export type Preparation = {
  datasetId: string; applicationId: string; slot: DocumentSlot; selectionId: string;
  product?: ProductId;
  source: { kind: 'local'; file: File } | { kind: 'sample'; sampleId: string } | { kind: 'generated'; fields: Fields };
}
export type Controls = { slow: boolean; failure: 'upload' | 'save' | 'submission' | 'storage' | null }
export type Demo = {
  analysisAvailability(): { cleanup: 'pending' | 'complete' | 'unavailable' };
  createEvidenceAssistance(input: import('../evidence-assistance/contract').EvidenceInput): import('../evidence-assistance/contract').EvidenceAssistance;
  listSavedDemonstrations(): Promise<Result<import('./saved-demonstrations').SavedExample[]>>;
  selectSavedDemonstration(input: import('./saved-demonstrations').SavedSelection): Promise<Result<import('./saved-demonstrations').OpenedSavedDemonstration>>;
  // One write protocol: intent plus the record it was prepared from. Revisions,
  // operation identity, retry and outcome inspection stay behind the seam.
  attempt<T extends AttemptIntent>(intent: T, view?: ApplicationView): Promise<Result<AttemptOutcome<AttemptResult<T>>>>;
  inspectAttempt<T extends AttemptIntent>(intent: T, view?: ApplicationView): Promise<Result<AttemptOutcome<AttemptResult<T>>>>;
  inspectReset(): Promise<Result<ResetContext>>;
  startup(): Promise<Result<Context>>;
  context(): Promise<Result<Context>>;
  signIn(identity: ActorId): Promise<Result<Context>>;
  signOut(): Promise<Result<Context>>;
  expireSession(): void;
  newDraft(product: ProductId): Promise<Result<ApplicantView>>;
  prepareAttachment(input: Preparation, onProgress?: (percent: number) => void): Promise<Result<PreparedAttachment>>;
  cancelPreparation(applicationId: string, slot: DocumentSlot): void;
  readPrepared(applicationId: string, attachment: PreparedAttachment): Promise<Result<{ bytes: ArrayBuffer; name: string; mime: string; hash: string }>>;
  controls(): Controls;
  setControls(controls: Controls): void;
  listApplications(): Promise<Result<ApplicationSummary[]>>;
  readStaffQueue(query?: Record<string, unknown>): Promise<Result<StaffQueue>>;
  readApplication(id: string): Promise<Result<ApplicationView>>;
  readPrintSummary(id: string): Promise<Result<PrintSummary>>;
  readFile(applicationId: string, fileId: string): Promise<Result<{ bytes: ArrayBuffer; name: string; mime: string; hash: string }>>;
  readNotifications(): Promise<Result<Notification[]>>;
  resolveNotification(id: string): Promise<Result<NotificationDestination>>;
  listSamples(applicationId: string): Promise<Result<Sample[]>>;
  readSample(applicationId: string, sampleId: string): Promise<Result<{ bytes: ArrayBuffer; name: string; mime: string; hash: string }>>;
  subscribe(listener: (session: Session | null) => void): () => void;
  dispose(): void;
}
