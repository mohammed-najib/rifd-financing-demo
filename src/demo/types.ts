import type { ActorId, Application, ApplicationStatus, Bilingual, DocumentSlot, Fields, Identity, Language, MutationReceipt, Notification, Preferences, ProductId, Repayment, Sample, Snapshot } from '../domain/model'

export type ErrorKind = 'unavailable' | 'sessionExpired' | 'storage' | 'startup' | 'resources' | 'blocked' | 'unsupported' | 'damaged' | 'stalePreference' | 'supersededDataset' | 'identifierMisuse' | 'validation' | 'staleWorkspace' | 'invalidState' | 'permissionDenied' | 'uploadFailed' | 'requestFailed' | 'outcomeUnknown' | 'supersededSelection'
export type Result<T> = { ok: true; value: T } | { ok: false; error: { kind: ErrorKind; key: `error.${ErrorKind}`; slot?: DocumentSlot } }
export type Session = { identity: ActorId; datasetId: string; sessionId: string; lastActivity: number; expiresAt: number }
export type Context = { datasetId: string; preferences: Preferences; session: Session | null; identity: Identity | null }
export type DocumentView = { slot: DocumentSlot; file: { id: string; name: string; mime: string; size: number; hash: string } | null }
export type ApplicationSummary = {
  id: string; product: ProductId; status: ApplicationStatus; fullName: string; businessName: string;
  amount: string; term: string; submittedAt: string | null;
  nextAction: 'inspectDraft' | 'inspectCorrections' | 'viewApplication';
  assignment?: Bilingual | null;
  assignedToYou?: boolean;
}
export type CommonView = {
  id: string; product: ProductId; status: ApplicationStatus; sharedRevision: number;
  snapshot: Snapshot; documents: DocumentView[]; submittedAt: string | null; evidenceMonths: string[];
  history: Application['history'];
  repayment: Repayment | null;
}
export type PublicRound = Omit<Application['rounds'][number], 'targets'> & {
  targets: Array<{ kind: 'field'; field: 'amount'; reason: Bilingual } | { kind: 'document'; slot: DocumentSlot; reason: Bilingual }>;
}
export type ApplicantView = CommonView & { role: 'applicant'; workspace: Application['workspace']; rounds: PublicRound[] }
export type StaffView = CommonView & {
  role: 'reviewer'; assignment: Bilingual | null; assignedToYou: boolean;
  rounds: Application['rounds'];
  assessments: Application['assessments']; checks: Application['checks'];
  notes: Application['notes']; activity: Application['activity'];
}
export type ApplicationView = ApplicantView | StaffView
export type LanguageOperation = {
  kind: 'setLanguage'; datasetId: string; operationId: string; expectedRevision: number; language: Language;
}
export type PreparedAttachment = { id: string; name: string; mime: string; size: number; hash: string; source: 'local' | 'sample' }
export type DraftDocuments = Record<DocumentSlot, { kind: 'saved'; fileId: string | null } | { kind: 'prepared'; attachment: PreparedAttachment }>
export type SaveDraftOperation = {
  kind: 'saveDraft'; datasetId: string; operationId: string; applicationId: string;
  expectedWorkspaceRevision: number; product: ProductId; fields: Fields; documents: DraftDocuments;
}
export type DemoOperation = LanguageOperation | SaveDraftOperation
export type MutationResult = { receipt: MutationReceipt; application: ApplicationView }
export type OperationInspection = { status: 'committed'; result: MutationResult } | { status: 'notCommitted'; application: ApplicationView }
export type Preparation = {
  datasetId: string; applicationId: string; slot: DocumentSlot; selectionId: string;
  product?: ProductId;
  source: { kind: 'local'; file: File } | { kind: 'sample'; sampleId: string } | { kind: 'generated'; fields: Fields };
}
export type Controls = { slow: boolean; failure: 'upload' | 'save' | 'storage' | null }
export type Demo = {
  startup(): Promise<Result<Context>>;
  context(): Promise<Result<Context>>;
  signIn(identity: ActorId): Promise<Result<Context>>;
  signOut(): Promise<Result<Context>>;
  expireSession(): void;
  newDraft(product: ProductId): Promise<Result<ApplicantView>>;
  execute(operation: LanguageOperation): Promise<Result<Context>>;
  execute(operation: SaveDraftOperation): Promise<Result<MutationResult>>;
  inspectOperation(operation: SaveDraftOperation): Promise<Result<OperationInspection>>;
  prepareAttachment(input: Preparation, onProgress?: (percent: number) => void): Promise<Result<PreparedAttachment>>;
  cancelPreparation(applicationId: string, slot: DocumentSlot): void;
  readPrepared(applicationId: string, attachment: PreparedAttachment): Promise<Result<{ bytes: ArrayBuffer; name: string; mime: string; hash: string }>>;
  controls(): Controls;
  setControls(controls: Controls): void;
  listApplications(): Promise<Result<ApplicationSummary[]>>;
  readApplication(id: string): Promise<Result<ApplicationView>>;
  readFile(applicationId: string, fileId: string): Promise<Result<{ bytes: ArrayBuffer; name: string; mime: string; hash: string }>>;
  readNotifications(): Promise<Result<Notification[]>>;
  listSamples(applicationId: string): Promise<Result<Sample[]>>;
  readSample(applicationId: string, sampleId: string): Promise<Result<{ bytes: ArrayBuffer; name: string; mime: string; hash: string }>>;
  subscribe(listener: (session: Session | null) => void): () => void;
  dispose(): void;
}
