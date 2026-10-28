import type { PreparedAttachment, Result } from '../demo/types';
import type { CorrectionTarget, DocumentSlot, ProductId } from '../domain/model';
import type { LiveReason } from '../live-assistance/wire';
import type { RunInput } from '../live-assistance/client';

export const versions = {
  questions: 'evidence-questions-v4',
  preparation: 'full-page-pdfjs-5.4.296-v1',
  mapping: 'evidence-mapping-v3',
  display: 'release-display-v2-experimental',
  defaults: 'provisional-display-defaults-v1',
  model: 'jev-1.14.0',
  bridge: 'tanstack-0.69.0-native-v1',
  sdk: 'typesafe-0.7.0',
} as const;

export const bounds = {
  sourceBytes: 5_000_000,
  sourcePixels: 20_000_000,
  decodedSide: 8192,
  pdfPages: 100,
  minimumSide: 280,
  maximumSide: 1568,
  imageBytes: 2 * 1024 * 1024,
  combinedBytes: 8 * 1024 * 1024,
  combinedPixels: 8_000_000,
  bodyBytes: 10 * 1024 * 1024,
  contextBytes: 16 * 1024,
  pageMilliseconds: 8000,
  preparationMilliseconds: 20_000,
} as const;

export type EvidenceAudience = 'applicant' | 'reviewer';
export type EvidenceContext = 'draft' | 'correction-workspace' | 'submitted';
export type EvidenceAction = 'check-document' | 'find-supporting-evidence';
// Both audiences use the same implemented tasks. Add new document definitions here.
export const evidenceTaskSlots: readonly DocumentSlot[] = [
  'identity',
  'business',
  'financial',
  'purchase',
];
export type BusinessField = 'businessName' | 'address' | 'operatingSince';
export type PurchaseField = 'explanation' | 'budget';
export type PurchaseDeclaration = { product: ProductId } & Record<PurchaseField, DeclaredDetail>;
export type FinancialField = 'revenue' | 'expenses';
export type FinancialDeclaration = {
  initialSubmissionMonth: string;
  expectedMonths: string[];
  revenue: DeclaredDetail;
  expenses: DeclaredDetail;
};
export type DeclaredDetail = { value: string | null; status: 'valid' | 'missing' | 'invalid' };
export type EvidenceDeclaration =
  | {
      fullName: string | null;
      status: DeclaredDetail['status'];
      business?: never;
      purchase?: never;
      financial?: never;
    }
  | {
      fullName?: never;
      status?: never;
      business: Record<BusinessField, DeclaredDetail>;
      purchase?: never;
      financial?: never;
    }
  | {
      fullName?: never;
      status?: never;
      business?: never;
      purchase: PurchaseDeclaration;
      financial?: never;
    }
  | {
      fullName?: never;
      status?: never;
      business?: never;
      purchase?: never;
      financial: FinancialDeclaration;
    };
export type FinancialPresenceKey =
  | 'periodPresence'
  | 'month1RevenuePresence'
  | 'month1ExpensesPresence'
  | 'month2RevenuePresence'
  | 'month2ExpensesPresence'
  | 'month3RevenuePresence'
  | 'month3ExpensesPresence'
  | 'revenuePresence'
  | 'expensesPresence';
export type PresenceKey =
  | FinancialPresenceKey
  | 'namePresence'
  | 'businessNamePresence'
  | 'addressPresence'
  | 'operatingSincePresence'
  | 'descriptionPresence'
  | 'budgetPresence';
export type SupportKey =
  | 'periodSupport'
  | 'revenueSupport'
  | 'expensesSupport'
  | 'nameSupport'
  | 'businessNameSupport'
  | 'addressSupport'
  | 'operatingSinceSupport'
  | 'descriptionSupport'
  | 'budgetSupport';
// These named targets also identify the regions to locate when highlights are enabled.
export type EvidenceTarget = {
  field: 'fullName' | BusinessField | PurchaseField | FinancialField;
  name: string;
  presence: PresenceKey;
  support: SupportKey;
  statePath: string;
};
const identityTargets: readonly EvidenceTarget[] = [
  {
    field: 'fullName',
    name: 'applicant name',
    presence: 'namePresence',
    support: 'nameSupport',
    statePath: 'declaredApplicantName',
  },
];
const businessTargets: readonly EvidenceTarget[] = [
  {
    field: 'businessName',
    name: 'business name',
    presence: 'businessNamePresence',
    support: 'businessNameSupport',
    statePath: 'declaredBusiness.businessName',
  },
  {
    field: 'address',
    name: 'business address',
    presence: 'addressPresence',
    support: 'addressSupport',
    statePath: 'declaredBusiness.address',
  },
  {
    field: 'operatingSince',
    name: 'business operating-since month',
    presence: 'operatingSincePresence',
    support: 'operatingSinceSupport',
    statePath: 'declaredBusiness.operatingSince',
  },
];
const purchaseTargets: readonly EvidenceTarget[] = [
  {
    field: 'explanation',
    name: 'purchase description',
    presence: 'descriptionPresence',
    support: 'descriptionSupport',
    statePath: 'declaredPurchase.explanation',
  },
  {
    field: 'budget',
    name: 'purchase total budget in whole Yemeni rials',
    presence: 'budgetPresence',
    support: 'budgetSupport',
    statePath: 'declaredPurchase.budget',
  },
];
const financialTargets = [
  {
    field: 'revenue',
    name: 'printed average monthly revenue in whole Yemeni rials',
    presence: 'revenuePresence',
    support: 'revenueSupport',
    statePath: 'declaredFinancial.revenue',
  },
  {
    field: 'expenses',
    name: 'printed average monthly operating expenses in whole Yemeni rials',
    presence: 'expensesPresence',
    support: 'expensesSupport',
    statePath: 'declaredFinancial.expenses',
  },
] as const satisfies readonly EvidenceTarget[];
export const financialPageTargets: readonly { name: string; presence: FinancialPresenceKey }[] = [
  { name: 'reporting period', presence: 'periodPresence' },
  ...[1, 2, 3].flatMap(month => [
    {
      name: `revenue for expected month ${month}`,
      presence: `month${month}RevenuePresence` as FinancialPresenceKey,
    },
    {
      name: `operating expenses for expected month ${month}`,
      presence: `month${month}ExpensesPresence` as FinancialPresenceKey,
    },
  ]),
  ...financialTargets,
];
export const evidenceTargets = (slot: DocumentSlot): readonly EvidenceTarget[] =>
  slot === 'identity'
    ? identityTargets
    : slot === 'business'
      ? businessTargets
      : slot === 'purchase'
        ? purchaseTargets
        : slot === 'financial'
          ? financialTargets
          : [];
export const declaredDetail = (
  declaration: EvidenceDeclaration,
  target: EvidenceTarget,
): DeclaredDetail =>
  target.field === 'fullName'
    ? { value: declaration.fullName ?? null, status: declaration.status ?? 'missing' }
    : ((target.field === 'explanation' || target.field === 'budget'
        ? declaration.purchase?.[target.field]
        : target.field === 'revenue' || target.field === 'expenses'
          ? declaration.financial?.[target.field]
          : declaration.business?.[target.field]) ?? { value: null, status: 'missing' });
export type EvidenceInput = {
  action: EvidenceAction;
  applicationId: string;
  slot: DocumentSlot;
  audience: EvidenceAudience;
  context: EvidenceContext;
  fileId?: string | null;
  attachment?: PreparedAttachment;
  declaredName?: string;
  declaredBusiness?: Record<BusinessField, string>;
  declaredPurchase?: { product: ProductId; explanation: string; budget: string };
  declaredFinancial?: Record<FinancialField, string>;
  roundId?: string;
};
export type CorrectionEvidenceContext = {
  targets: CorrectionTarget[];
  initialSubmissionMonth: string;
};
export type EvidenceSource = {
  id: string;
  bytes: ArrayBuffer;
  name: string;
  mime: string;
  hash: string;
};
export type SelectedEvidence = {
  source: EvidenceSource;
  declaration: EvidenceDeclaration;
  correction?: CorrectionEvidenceContext;
  binding: {
    datasetId: string;
    applicationId: string;
    slot: DocumentSlot;
    audience: EvidenceAudience;
    context: EvidenceContext;
    contextId: string;
    roundId: string | null;
    authorityGeneration: number;
    sharedRevision: number;
    workspaceRevision: number;
    dependencyKey: string;
    durable: boolean;
    reviewContext?: string;
  };
};
export type RasterManifest = {
  page: number;
  sourceHash: string;
  rasterHash: string;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
  uprightWidth: number;
  uprightHeight: number;
  orientation: number;
  rotation: number;
  scale: number;
  padding: { left: number; top: number; right: number; bottom: number };
  viewport: number[];
  orientationTransform: number[];
  transform: number[];
  renderer: string;
  worker: string;
  resources: string;
  preparation: string;
};
export type PreparedPage = { bytes: ArrayBuffer; manifest: RasterManifest; totalPages: number };
export type AttemptPlan = {
  maximumAttempts: number;
  stages: readonly string[];
  verification: 'lossless-boundary-pad-v1';
};
export type FixedQuestion =
  | { type: 'choice'; instructions: string; criteria: Record<string, string> }
  | { type: 'score'; instructions: string; criteria: string[] }
  | { type: 'noul'; instructions: string }
  | { type: 'box'; instructions: string };
export type StageRequest = {
  runId: string;
  stage: 'combined-page-declaration' | 'page' | 'document-comparison' | 'bound-verification';
  model: typeof versions.model;
  plan: AttemptPlan;
  state: {
    regions?: CropBinding[];
    cropImages?: string[];
    verificationPolicy?: string;
    page: string;
    pages?: string[];
    declaredFinancial?: {
      initialSubmissionMonth: string;
      expectedMonths: string[];
      revenue: string | null;
      expenses: string | null;
    };
    declaredApplicantName?: string | null;
    declaredBusiness?: Record<BusinessField, string | null>;
    declaredPurchase?: { product: ProductId; explanation: string | null; budget: string | null };
    correction?: CorrectionEvidenceContext;
  };
  image: PreparedPage;
  images?: PreparedPage[];
  crops?: PreparedCrop[];
  questions: Record<string, FixedQuestion>;
  versions: typeof versions;
  dependencies: Record<string, string[]>;
};
export type StageDispatch = { stage: StageRequest['stage']; page: number };
export type EvidenceTransport = {
  evaluate(request: StageRequest, signal: AbortSignal): Promise<unknown>;
  begin?(input: RunInput, signal: AbortSignal): Promise<EvidenceTransport>;
  verificationState?(page: number): StageRequest['state'] | undefined;
  wasDispatched?(request: StageRequest): boolean;
  accounting?: 'reported' | 'unresolved';
};
export type ChoiceAnswer = {
  type: 'choice';
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
};
export type ScoreAnswer = {
  type: 'score';
  score: number;
  confidence: number;
  probabilities: Record<string, number>;
  legend: Record<string, string>;
};
export type NoulAnswer = { type: 'noul'; noul: number };
export type NativeAnswers = { category?: ChoiceAnswer; readability?: ScoreAnswer } & Partial<
  Record<PresenceKey, NoulAnswer>
> &
  Partial<Record<SupportKey, ChoiceAnswer>>;
export type BridgeCapture = {
  requestedModel: string;
  dispatchedAt: string;
  answeredAt: string;
  mapped: Record<string, unknown>;
  invalidAnswers: string[];
  state: StageRequest['state'];
};
export type NativeCapture = {
  locations?: Record<string, { box?: BoxAnswer; multiplicity?: ChoiceAnswer }>;
  model: string;
  answers: NativeAnswers;
  receivedAnswers: Record<string, unknown>;
  usage: { input_tokens: number; output_tokens: number };
  responseId?: string;
  bridge?: BridgeCapture;
};
export type Findings = {
  category:
    | 'identity'
    | 'business'
    | 'financial'
    | 'stock'
    | 'equipment'
    | 'other'
    | 'mixed'
    | 'undetermined'
    | 'unavailable';
  readability: 'clear' | 'partial' | 'unreadable' | 'undetermined' | 'unavailable';
} & Partial<Record<PresenceKey, 'present' | 'absent' | 'undetermined' | 'unavailable'>> &
  Partial<
    Record<
      SupportKey,
      | 'consistent'
      | 'different'
      | 'not_found'
      | 'conflict'
      | 'undetermined'
      | 'missing-context'
      | 'unavailable'
    >
  >;
export type Coverage = {
  totalPages: number | null;
  selected: number[];
  prepared: number[];
  dispatched: number[];
  successful: number[];
  failed: number[];
  unreadable: number[];
  unchecked: number[];
  uncheckedCount: number | null;
};
export type EvidenceRun = {
  schemaVersion: 1;
  id: string;
  provenanceKind: 'live-analysis';
  temporary: boolean;
  restored: boolean;
  stale: boolean;
  expiresAt: string;
  coverage: Coverage;
  findings: Findings;
  pages?: PageAnalysis[];
  comparison?: ComparisonAnalysis;
  verifications?: BoundVerification[];
  locations?: EvidenceLocation[];
  stages: {
    page?: number;
    stage: string;
    outcome: 'successful' | 'partial' | 'unavailable' | 'skipped';
    reason?: string;
  }[];
  provenance: {
    source: Omit<EvidenceSource, 'bytes'>;
    binding: SelectedEvidence['binding'];
    context: SelectedEvidence['declaration'];
    correction?: CorrectionEvidenceContext;
    versions: typeof versions;
    plan: AttemptPlan;
    request: RecordedRequest;
    raster: RasterManifest;
    native: NativeCapture;
    accounting: 'reported' | 'unresolved';
    startedAt: string;
    dispatchedAt: string;
    answeredAt: string;
    completedAt: string;
  };
};
export type PageAnalysis = {
  page: number;
  request: RecordedRequest;
  raster: RasterManifest;
  native: NativeCapture;
  findings: Findings;
  partial: boolean;
};
export type ComparisonAnalysis = {
  request: RecordedRequest;
  native: NativeCapture;
  findings: Findings;
  partial: boolean;
};
export type AssistanceReason =
  | LiveReason
  | 'live-unavailable'
  | 'source-limit'
  | 'invalid-source'
  | 'multipage'
  | 'page-selection'
  | 'preparation-timeout'
  | 'prepared-limit'
  | 'context-limit'
  | 'provider-unavailable'
  | 'analysis-storage'
  | 'invalid-response'
  | 'stale'
  | 'unauthorized';
export type AssistanceState = {
  status: 'idle' | 'preparing' | 'running' | 'completed' | 'unavailable' | 'cancelled' | 'disposed';
  result: EvidenceRun | null;
  reason?: AssistanceReason;
  coverage: Coverage;
  storage: 'available' | 'temporary-only' | 'incompatible';
};
export type EvidenceAssistance = {
  inspect(): Promise<Result<SelectedEvidence>>;
  read(): AssistanceState;
  subscribe(listener: () => void): () => void;
  run(pages?: number[]): Promise<void>;
  refresh(): Promise<void>;
  clear(): Promise<Result<void>>;
  cancel(): void;
  dispose(): void;
};

export type Rectangle = { left: number; top: number; right: number; bottom: number };
export type BoxAnswer = { type: 'box'; box: Rectangle; confidence: number | null };
export type LocationTarget = {
  id: string;
  name: string;
  presence: PresenceKey;
  support?: SupportKey;
};
export const locationTargets = (slot: DocumentSlot): LocationTarget[] =>
  slot === 'financial'
    ? financialPageTargets.map(target => ({
        id: target.presence.replace('Presence', ''),
        ...target,
        support:
          target.presence === 'periodPresence'
            ? 'periodSupport'
            : target.presence === 'revenuePresence'
              ? 'revenueSupport'
              : target.presence === 'expensesPresence'
                ? 'expensesSupport'
                : undefined,
      }))
    : evidenceTargets(slot).map(target => ({ id: target.field, ...target }));
export type CropBinding = {
  method: 'lossless-boundary-pad-v1';
  sourceHash: string;
  rasterHash: string;
  page: number;
  target: string;
  box: Rectangle;
  originalBoundary: Rectangle;
  enclosure: Rectangle;
  width: number;
  height: number;
  padding: Rectangle;
  transform: number[];
  cropHash: string;
};
export type PreparedCrop = { bytes: ArrayBuffer; binding: CropBinding };
export type RecordedRequest = Omit<StageRequest, 'image' | 'images' | 'crops'>;
export type BoundVerification = { page: number; request: RecordedRequest; native: NativeCapture };
export type EvidenceLocation = {
  page: number;
  target: string;
  box?: Rectangle;
  status: 'shown' | 'suppressed';
  reason?: string;
};
