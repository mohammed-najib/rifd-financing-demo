import { cropGeometry, locationCandidates } from '../preparation/locations';
import { composeFindings, interpret, makeRequest, recordRequest, usablePage } from './policy';
import type {
  AttemptPlan,
  Coverage,
  CropBinding,
  Findings,
  PageAnalysis,
  PreparedPage,
  SelectedEvidence,
  StageRequest,
} from '../contract';

export type RunInput = {
  selection: SelectedEvidence;
  pages: PreparedPage[];
  runId: string;
  plan: AttemptPlan;
};
export type PageStep = { image: PreparedPage; request: StageRequest };

// One page stage per prepared page, in preparation order. The caller owns
// evaluation, accounting and what a failed stage means for the rest of the run.
export function runPages(input: RunInput): PageStep[] {
  return input.pages.map(image => ({
    image,
    request: makeRequest(input.selection, image, input.runId, input.plan),
  }));
}

// The recorded request and displayed findings for one answered page.
export function pageAnalysis(
  selection: SelectedEvidence,
  step: PageStep,
  raw: unknown,
): PageAnalysis {
  return {
    page: step.image.manifest.page,
    request: recordRequest(step.request),
    raster: step.image.manifest,
    ...interpret(raw, selection),
  };
}

export type ComparisonPlan =
  | { status: 'single-page' }
  | { status: 'skipped'; reason: 'missing-context' | 'no-usable-pages' }
  | { status: 'ready'; request: StageRequest; basis: Findings; image: PreparedPage };

// The one multi-page comparison request, built from the pages that answered.
// A single page never compares; a comparison without questions is skipped.
export function comparePages(
  input: RunInput & { coverage: Coverage; analyses: PageAnalysis[] },
): ComparisonPlan {
  const totalPages = input.pages[0]?.totalPages ?? input.analyses.length;
  if (totalPages === 1) return { status: 'single-page' };
  const usable = input.analyses.filter(page => usablePage(input.selection, page.findings));
  if (!usable.length) return { status: 'skipped', reason: 'no-usable-pages' };
  const images = input.pages.filter(page =>
    usable.some(result => result.page === page.manifest.page),
  );
  const request = makeRequest(input.selection, images[0], input.runId, input.plan, images);
  if (!Object.keys(request.questions).length)
    return { status: 'skipped', reason: 'missing-context' };
  const basis = composeFindings(
    input.selection,
    { ...input.coverage, totalPages: usable.length, successful: usable.map(page => page.page) },
    usable,
  );
  return { status: 'ready', request, basis, image: images[0] };
}

export type VerificationStep = {
  page: number;
  image: PreparedPage;
  regions: { target: string; geometry: Omit<CropBinding, 'target' | 'cropHash'> }[];
};

// Bound-verification work per analysed page: the eligible regions and their
// crop boxes. Pages without eligible regions are reported so the caller can
// record the skip. Crop bytes and limits remain the caller's responsibility.
export function verificationPlan(input: {
  selection: SelectedEvidence;
  coverage: Coverage;
  findings: Findings;
  analyses: PageAnalysis[];
  prepared: PreparedPage[];
  enabled?: boolean;
}): VerificationStep[] {
  if (input.enabled === false) return [];
  const candidates = locationCandidates(
    { coverage: input.coverage, pages: input.analyses, findings: input.findings, stale: false },
    input.selection,
  );
  return input.analyses.flatMap(page => {
    const eligible = candidates.filter(
      candidate => candidate.page === page.page && !candidate.reason,
    );
    if (!eligible.length) return [];
    const image = input.prepared.find(image => image.manifest.page === page.page);
    if (!image) return [];
    return [
      {
        page: page.page,
        image,
        regions: eligible.map(candidate => ({
          target: candidate.target,
          geometry: cropGeometry(candidate.box!, page.raster)!,
        })),
      },
    ];
  });
}
