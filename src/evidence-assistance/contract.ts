import type { PreparedAttachment, Result } from '../demo/types'
import type { CorrectionTarget, DocumentSlot, ProductId } from '../domain/model'

export const versions = {
  questions: 'evidence-questions-v2', preparation: 'full-page-pdfjs-5.4.296-v1',
  mapping: 'evidence-mapping-v2', display: 'release-display-v2-experimental',
  defaults: 'provisional-display-defaults-v1', model: 'jev-1.14.0',
  bridge: 'fixed-evaluation-v1', sdk: 'not-connected',
} as const

export const bounds = {
  sourceBytes: 5_000_000, sourcePixels: 20_000_000, decodedSide: 8192, pdfPages: 100,
  minimumSide: 280, maximumSide: 1568, imageBytes: 2 * 1024 * 1024,
  combinedBytes: 8 * 1024 * 1024, combinedPixels: 8_000_000,
  bodyBytes: 10 * 1024 * 1024, contextBytes: 16 * 1024,
  pageMilliseconds: 8000, preparationMilliseconds: 20_000,
} as const

export type EvidenceAudience = 'applicant' | 'reviewer'
export type EvidenceContext = 'draft' | 'correction-workspace' | 'submitted'
export type EvidenceAction = 'check-document' | 'find-supporting-evidence'
// Both audiences use the same implemented tasks. Add new document definitions here.
export const evidenceTaskSlots: readonly DocumentSlot[] = ['identity', 'business', 'purchase']
export type BusinessField = 'businessName' | 'address' | 'operatingSince'
export type PurchaseField = 'explanation' | 'budget'
export type PurchaseDeclaration = { product: ProductId } & Record<PurchaseField, DeclaredDetail>
export type DeclaredDetail = { value: string | null; status: 'valid' | 'missing' | 'invalid' }
export type EvidenceDeclaration = { fullName: string | null; status: DeclaredDetail['status']; business?: never; purchase?: never }
  | { fullName?: never; status?: never; business: Record<BusinessField, DeclaredDetail>; purchase?: never }
  | { fullName?: never; status?: never; business?: never; purchase: PurchaseDeclaration }
export type PresenceKey = 'namePresence' | 'businessNamePresence' | 'addressPresence' | 'operatingSincePresence' | 'descriptionPresence' | 'budgetPresence'
export type SupportKey = 'nameSupport' | 'businessNameSupport' | 'addressSupport' | 'operatingSinceSupport' | 'descriptionSupport' | 'budgetSupport'
// These named targets also identify the regions to locate when highlights are enabled.
export type EvidenceTarget = { field: 'fullName' | BusinessField | PurchaseField; name: string; presence: PresenceKey; support: SupportKey; statePath: string }
const identityTargets: readonly EvidenceTarget[] = [{ field: 'fullName', name: 'applicant name', presence: 'namePresence', support: 'nameSupport', statePath: 'declaredApplicantName' }]
const businessTargets: readonly EvidenceTarget[] = [
  { field: 'businessName', name: 'business name', presence: 'businessNamePresence', support: 'businessNameSupport', statePath: 'declaredBusiness.businessName' },
  { field: 'address', name: 'business address', presence: 'addressPresence', support: 'addressSupport', statePath: 'declaredBusiness.address' },
  { field: 'operatingSince', name: 'business operating-since month', presence: 'operatingSincePresence', support: 'operatingSinceSupport', statePath: 'declaredBusiness.operatingSince' },
]
const purchaseTargets: readonly EvidenceTarget[] = [
  { field: 'explanation', name: 'purchase description', presence: 'descriptionPresence', support: 'descriptionSupport', statePath: 'declaredPurchase.explanation' },
  { field: 'budget', name: 'purchase total budget in whole Yemeni rials', presence: 'budgetPresence', support: 'budgetSupport', statePath: 'declaredPurchase.budget' },
]
export const evidenceTargets = (slot: DocumentSlot): readonly EvidenceTarget[] => slot === 'identity' ? identityTargets : slot === 'business' ? businessTargets : slot === 'purchase' ? purchaseTargets : []
export const declaredDetail = (declaration: EvidenceDeclaration, target: EvidenceTarget): DeclaredDetail => target.field === 'fullName'
  ? { value: declaration.fullName ?? null, status: declaration.status ?? 'missing' }
  : (target.field === 'explanation' || target.field === 'budget' ? declaration.purchase?.[target.field] : declaration.business?.[target.field]) ?? { value: null, status: 'missing' }
export type EvidenceInput = {
  action: EvidenceAction; applicationId: string; slot: DocumentSlot; audience: EvidenceAudience; context: EvidenceContext;
  fileId?: string | null; attachment?: PreparedAttachment; declaredName?: string; declaredBusiness?: Record<BusinessField, string>; declaredPurchase?: { product: ProductId; explanation: string; budget: string }; roundId?: string;
}
export type CorrectionEvidenceContext = { targets: CorrectionTarget[]; initialSubmissionMonth: string }
export type EvidenceSource = { id: string; bytes: ArrayBuffer; name: string; mime: string; hash: string }
export type SelectedEvidence = {
  source: EvidenceSource;
  declaration: EvidenceDeclaration;
  correction?: CorrectionEvidenceContext;
  binding: { datasetId: string; applicationId: string; slot: DocumentSlot; audience: EvidenceAudience; context: EvidenceContext; contextId: string; roundId: string | null; authorityGeneration: number; sharedRevision: number; workspaceRevision: number; dependencyKey: string; durable: boolean; reviewContext?: string };
}
export type RasterManifest = {
  page: number; sourceHash: string; rasterHash: string; width: number; height: number;
  sourceWidth: number; sourceHeight: number; uprightWidth: number; uprightHeight: number;
  orientation: number; rotation: number; scale: number; padding: { left: number; top: number; right: number; bottom: number };
  viewport: number[]; orientationTransform: number[]; transform: number[];
  renderer: string; worker: string; resources: string; preparation: string;
}
export type PreparedPage = { bytes: ArrayBuffer; manifest: RasterManifest; totalPages: number }
export type AttemptPlan = { maximumAttempts: 2; stages: readonly ['combined-page-declaration', 'bound-verification']; verification: 'reserved-not-enabled' }
export type FixedQuestion = { type: 'choice'; instructions: string; criteria: Record<string, string> }
  | { type: 'score'; instructions: string; criteria: string[] }
  | { type: 'noul'; instructions: string }
export type StageRequest = {
  runId: string; stage: 'combined-page-declaration'; model: typeof versions.model; plan: AttemptPlan;
  state: { page: string; declaredApplicantName?: string | null; declaredBusiness?: Record<BusinessField, string | null>; declaredPurchase?: { product: ProductId; explanation: string | null; budget: string | null }; correction?: CorrectionEvidenceContext };
  image: PreparedPage;
  questions: Record<string, FixedQuestion>; versions: typeof versions;
  dependencies: Record<string, string[]>;
}
// The later service bridge implements this fixed evaluation boundary. Runtime has no transport yet.
export type EvidenceTransport = { evaluate(request: StageRequest, signal: AbortSignal): Promise<unknown> }
export type ChoiceAnswer = { type: 'choice'; choice: string; confidence: number; probabilities: Record<string, number> }
export type ScoreAnswer = { type: 'score'; score: number; confidence: number; probabilities: Record<string, number>; legend: Record<string, string> }
export type NoulAnswer = { type: 'noul'; noul: number }
export type NativeAnswers = { category?: ChoiceAnswer; readability?: ScoreAnswer } & Partial<Record<PresenceKey, NoulAnswer>> & Partial<Record<SupportKey, ChoiceAnswer>>
export type NativeCapture = { model: string; answers: NativeAnswers; receivedAnswers: Record<string, unknown>; usage: { input_tokens: number; output_tokens: number }; responseId?: string }
export type Findings = {
  category: 'identity' | 'business' | 'financial' | 'stock' | 'equipment' | 'other' | 'mixed' | 'undetermined' | 'unavailable';
  readability: 'clear' | 'partial' | 'unreadable' | 'undetermined' | 'unavailable';
} & Partial<Record<PresenceKey, 'present' | 'absent' | 'undetermined' | 'unavailable'>>
  & Partial<Record<SupportKey, 'consistent' | 'different' | 'not_found' | 'conflict' | 'undetermined' | 'missing-context' | 'unavailable'>>
export type Coverage = { totalPages: number | null; selected: number[]; prepared: number[]; dispatched: number[]; successful: number[]; failed: number[]; unreadable: number[]; unchecked: number[]; uncheckedCount: number | null }
export type EvidenceRun = {
  schemaVersion: 1; id: string; provenanceKind: 'live-analysis'; temporary: boolean; restored: boolean; stale: boolean; expiresAt: string; coverage: Coverage; findings: Findings;
  stages: { stage: string; outcome: 'successful' | 'partial' | 'unavailable' | 'skipped'; reason?: string }[];
  provenance: { source: Omit<EvidenceSource, 'bytes'>; binding: SelectedEvidence['binding']; context: SelectedEvidence['declaration']; correction?: CorrectionEvidenceContext; versions: typeof versions; plan: AttemptPlan; request: Omit<StageRequest, 'image'>; raster: RasterManifest; native: NativeCapture; accounting: 'reported'; startedAt: string; dispatchedAt: string; answeredAt: string; completedAt: string };
}
export type AssistanceReason = 'live-unavailable' | 'source-limit' | 'invalid-source' | 'multipage' | 'preparation-timeout' | 'prepared-limit' | 'context-limit' | 'provider-unavailable' | 'analysis-storage' | 'invalid-response' | 'stale' | 'unauthorized'
export type AssistanceState = {
  status: 'idle' | 'preparing' | 'running' | 'completed' | 'unavailable' | 'cancelled' | 'disposed';
  result: EvidenceRun | null; reason?: AssistanceReason; coverage: Coverage;
  storage: 'available' | 'temporary-only' | 'incompatible';
}
export type EvidenceAssistance = {
  inspect(): Promise<Result<SelectedEvidence>>;
  read(): AssistanceState;
  subscribe(listener: () => void): () => void;
  run(): Promise<void>;
  refresh(): Promise<void>;
  clear(): Promise<Result<void>>;
  cancel(): void;
  dispose(): void;
}
