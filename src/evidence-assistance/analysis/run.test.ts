import { describe, expect, test } from 'vitest';
import {
  versions,
  type Coverage,
  type Findings,
  type NativeCapture,
  type PageAnalysis,
  type PreparedPage,
  type RasterManifest,
  type SelectedEvidence,
} from '../contract';
import { attemptPlan, recordRequest } from './policy';
import { comparePages, pageAnalysis, runPages, verificationPlan } from './run';

const manifest = (page: number): RasterManifest => ({
  page,
  sourceHash: 'a'.repeat(64),
  rasterHash: 'b'.repeat(64),
  width: 280,
  height: 280,
  sourceWidth: 280,
  sourceHeight: 280,
  uprightWidth: 280,
  uprightHeight: 280,
  orientation: 1,
  rotation: 0,
  scale: 1,
  padding: { left: 0, top: 0, right: 0, bottom: 0 },
  viewport: [1, 0, 0, 1, 0, 0],
  orientationTransform: [1, 0, 0, 1, 0, 0],
  transform: [1, 0, 0, 1, 0, 0],
  renderer: 'test',
  worker: 'test',
  resources: 'test',
  preparation: versions.preparation,
});

const selection: SelectedEvidence = {
  source: {
    id: 'local',
    name: 'local',
    mime: 'image/png',
    hash: 'a'.repeat(64),
    bytes: new ArrayBuffer(0),
  },
  declaration: { fullName: 'Fictional Person', status: 'valid' },
  binding: {
    datasetId: 'local',
    applicationId: 'local',
    slot: 'identity',
    audience: 'applicant',
    context: 'draft',
    contextId: 'local',
    roundId: null,
    authorityGeneration: 0,
    sharedRevision: 0,
    workspaceRevision: 0,
    dependencyKey: 'local',
    durable: false,
  },
};

const prepared = (totalPages: number) =>
  Array.from({ length: totalPages }, (_, index): PreparedPage => ({
    bytes: new ArrayBuffer(0),
    manifest: manifest(index + 1),
    totalPages,
  }));

const coverage = (totalPages: number): Coverage => ({
  totalPages,
  selected: [1],
  prepared: [1],
  dispatched: [1],
  successful: [1],
  failed: [],
  unreadable: [],
  unchecked: [],
  uncheckedCount: 0,
});

const clear: Findings = {
  category: 'identity',
  readability: 'clear',
  namePresence: 'present',
  nameSupport: 'consistent',
};

function analysis(page: number, findings: Findings = clear): PageAnalysis {
  const native: NativeCapture = {
    model: versions.model,
    answers: { namePresence: { type: 'noul', noul: 0.999 } },
    receivedAnswers: { namePresence: { type: 'noul', noul: 0.999 } },
    usage: { input_tokens: 1, output_tokens: 1 },
    locations: {
      fullName: {
        box: {
          type: 'box',
          box: { left: 0.1, top: 0.2, right: 0.3, bottom: 0.25 },
          confidence: 0.9,
        },
        multiplicity: {
          type: 'choice',
          choice: 'single',
          confidence: 0.9,
          probabilities: { absent: 0.01, single: 0.99, repeated: 0, uncertain: 0 },
        },
      },
    },
  };
  return {
    page,
    request: {
      runId: '6a1c9f45-3c62-4f0e-a1d0-25b8a2fd9a1e',
      stage: 'page',
      model: versions.model,
      plan: attemptPlan(1, [1]),
      state: { page: 'original-page-1' },
      questions: {},
      versions,
      dependencies: {},
    },
    raster: manifest(page),
    native,
    findings,
    partial: false,
  };
}

describe('runPages', () => {
  test('orders one request per prepared page', () => {
    const pages = prepared(2);
    const plan = attemptPlan(2, [1, 2]);
    const steps = runPages({ selection, pages, runId: 'run', plan });
    expect(steps.map(step => step.image.manifest.page)).toEqual([1, 2]);
    expect(steps.map(step => step.request.stage)).toEqual(['page', 'page']);
    expect(steps.every(step => step.request.runId === 'run' && step.request.plan === plan)).toBe(
      true,
    );
  });

  test('a single page uses the combined declaration stage', () => {
    const [step] = runPages({
      selection,
      pages: prepared(1),
      runId: 'run',
      plan: attemptPlan(1, [1]),
    });
    expect(step.request.stage).toBe('combined-page-declaration');
  });

  test('pageAnalysis records the request and keeps the page raster', () => {
    const [step] = runPages({
      selection,
      pages: prepared(1),
      runId: 'run',
      plan: attemptPlan(1, [1]),
    });
    const result = pageAnalysis(selection, step, {
      model: versions.model,
      answers: {
        category: {
          type: 'choice',
          choice: 'identity',
          confidence: 0.99,
          probabilities: {
            identity: 0.99,
            business: 0.001,
            financial: 0.001,
            stock: 0.001,
            equipment: 0.001,
            other: 0.001,
            mixed: 0.004,
            uncertain: 0.001,
          },
        },
      },
      usage: { input_tokens: 1, output_tokens: 1 },
    });
    expect(result.request).toEqual(recordRequest(step.request));
    expect(result.page).toBe(1);
    expect(result.raster).toEqual(step.image.manifest);
  });
});

describe('comparePages', () => {
  test('a single page never compares', () => {
    const pages = prepared(1);
    expect(
      comparePages({
        selection,
        pages,
        runId: 'run',
        plan: attemptPlan(1, [1]),
        coverage: coverage(1),
        analyses: [analysis(1)],
      }),
    ).toEqual({ status: 'single-page' });
  });

  test('no usable page skips the comparison', () => {
    const pages = prepared(2);
    const unusable = { ...clear, readability: 'unreadable' as const };
    expect(
      comparePages({
        selection,
        pages,
        runId: 'run',
        plan: attemptPlan(2, [1, 2]),
        coverage: coverage(2),
        analyses: [analysis(1, unusable), analysis(2, unusable)],
      }),
    ).toEqual({ status: 'skipped', reason: 'no-usable-pages' });
  });

  test('usable pages build one comparison request with a basis', () => {
    const pages = prepared(2);
    const result = comparePages({
      selection,
      pages,
      runId: 'run',
      plan: attemptPlan(2, [1, 2]),
      coverage: coverage(2),
      analyses: [analysis(1), analysis(2)],
    });
    expect(result.status).toBe('ready');
    if (result.status !== 'ready') throw new Error('comparison missing');
    expect(result.request.stage).toBe('document-comparison');
    expect([result.request.image, ...(result.request.images ?? [])]).toHaveLength(2);
    expect(result.basis.category).toBe('identity');
    expect(result.basis.readability).toBe('clear');
  });
});

describe('verificationPlan', () => {
  test('disabled planning does no work', () => {
    expect(
      verificationPlan({
        selection,
        coverage: coverage(1),
        findings: clear,
        analyses: [analysis(1)],
        prepared: prepared(1),
        enabled: false,
      }),
    ).toEqual([]);
  });

  test('incomplete coverage suppresses every region', () => {
    const incomplete = { ...coverage(1), successful: [] };
    expect(
      verificationPlan({
        selection,
        coverage: incomplete,
        findings: clear,
        analyses: [analysis(1)],
        prepared: prepared(1),
      }),
    ).toEqual([]);
  });

  test('a complete clear page yields its eligible region', () => {
    const steps = verificationPlan({
      selection,
      coverage: coverage(1),
      findings: clear,
      analyses: [analysis(1)],
      prepared: prepared(1),
    });
    expect(steps).toHaveLength(1);
    expect(steps[0].page).toBe(1);
    expect(steps[0].regions.map(region => region.target)).toEqual(['fullName']);
    expect(steps[0].regions[0].geometry.width).toBeGreaterThan(0);
  });
});
