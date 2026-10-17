import type { PreparedAttachment, Result } from '../demo/types'
import type { DocumentSlot } from '../domain/model'

export const versions = {
  questions: 'identity-questions-v1', preparation: 'full-page-pdfjs-5.4.296-v1',
  mapping: 'identity-mapping-v1', display: 'release-display-v2-experimental',
  defaults: 'provisional-display-defaults-v1', model: 'jev-1.14.0',
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
export type EvidenceInput = {
  action: EvidenceAction; applicationId: string; slot: DocumentSlot; audience: EvidenceAudience; context: EvidenceContext;
  fileId?: string | null; attachment?: PreparedAttachment; declaredName?: string;
}
export type EvidenceSource = { id: string; bytes: ArrayBuffer; name: string; mime: string; hash: string }
export type SelectedEvidence = {
  source: EvidenceSource;
  declaration: { fullName: string | null; status: 'valid' | 'missing' | 'invalid' };
  binding: { datasetId: string; applicationId: string; slot: DocumentSlot; audience: EvidenceAudience; context: EvidenceContext; authorityGeneration: number; workspaceRevision: number; dependencyKey: string };
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
  state: { page: string; declaredApplicantName: string | null };
  image: PreparedPage;
  questions: Record<string, FixedQuestion>; versions: typeof versions;
  dependencies: Record<string, string[]>;
}
// The later service bridge implements this fixed evaluation boundary. Runtime has no transport yet.
export type EvidenceTransport = { evaluate(request: StageRequest, signal: AbortSignal): Promise<unknown> }
export type ChoiceAnswer = { type: 'choice'; choice: string; confidence: number; probabilities: Record<string, number> }
export type ScoreAnswer = { type: 'score'; score: number; confidence: number; probabilities: Record<string, number>; legend: Record<string, string> }
export type NoulAnswer = { type: 'noul'; noul: number }
export type NativeAnswers = { category?: ChoiceAnswer; readability?: ScoreAnswer; namePresence?: NoulAnswer; nameSupport?: ChoiceAnswer }
export type NativeCapture = { model: string; answers: NativeAnswers; receivedAnswers: Record<string, unknown>; usage: { input_tokens: number; output_tokens: number }; responseId?: string }
export type Findings = {
  category: 'identity' | 'business' | 'financial' | 'stock' | 'equipment' | 'other' | 'mixed' | 'undetermined' | 'unavailable';
  readability: 'clear' | 'partial' | 'unreadable' | 'undetermined' | 'unavailable';
  namePresence: 'present' | 'absent' | 'undetermined' | 'unavailable';
  nameSupport: 'consistent' | 'different' | 'not_found' | 'conflict' | 'undetermined' | 'missing-context' | 'unavailable';
}
export type Coverage = { totalPages: number | null; selected: number[]; prepared: number[]; dispatched: number[]; successful: number[]; failed: number[]; unreadable: number[]; unchecked: number[]; uncheckedCount: number | null }
export type EvidenceRun = {
  id: string; provenanceKind: 'live-analysis'; temporary: true; coverage: Coverage; findings: Findings;
  stages: { stage: string; outcome: 'successful' | 'partial' | 'unavailable' | 'skipped'; reason?: string }[];
  provenance: { source: Omit<EvidenceSource, 'bytes'>; binding: SelectedEvidence['binding']; context: SelectedEvidence['declaration']; versions: typeof versions; plan: AttemptPlan; request: Omit<StageRequest, 'image'>; raster: RasterManifest; native: NativeCapture; startedAt: string; dispatchedAt: string; answeredAt: string; completedAt: string };
}
export type AssistanceReason = 'live-unavailable' | 'source-limit' | 'invalid-source' | 'multipage' | 'preparation-timeout' | 'prepared-limit' | 'context-limit' | 'provider-unavailable' | 'invalid-response' | 'stale' | 'unauthorized'
export type AssistanceState = {
  status: 'idle' | 'preparing' | 'running' | 'completed' | 'unavailable' | 'cancelled' | 'disposed';
  result: EvidenceRun | null; reason?: AssistanceReason; coverage: Coverage;
}
export type EvidenceAssistance = {
  inspect(): Promise<Result<SelectedEvidence>>;
  read(): AssistanceState;
  subscribe(listener: () => void): () => void;
  run(): Promise<void>;
  cancel(): void;
  dispose(): void;
}
