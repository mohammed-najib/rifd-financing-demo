import {
  type Coverage,
  type PageAnalysis,
  type PreparedPage,
  type SelectedEvidence,
  type StageRequest,
} from '../../evidence-assistance/contract';
import {
  attemptPlan,
  composeFindings,
  interpret,
  recordRequest,
} from '../../evidence-assistance/analysis/policy';
import {
  comparePages,
  pageAnalysis,
  runPages,
  verificationPlan,
} from '../../evidence-assistance/analysis/run';
import { makeVerificationRequest } from '../../evidence-assistance/analysis/verification';
import { LiveStop } from './admission';
import { jevBridge } from './jev-bridge';
import { serverCrops } from './crops';
import type { FixedWorkflow } from './service';

export function createJevWorkflow(options: Parameters<typeof jevBridge>[0]): FixedWorkflow {
  const invoke = jevBridge(options);
  return async (request, work) => {
    const images: PreparedPage[] = request.pages.map(page => ({
      bytes: Uint8Array.from(page.bytes).buffer,
      manifest: page.manifest,
      totalPages: request.totalPages,
    }));
    const selection: SelectedEvidence = {
      source: {
        id: 'received-png',
        name: '',
        mime: 'image/png',
        hash: images[0].manifest.sourceHash,
        bytes: new ArrayBuffer(0),
      },
      declaration: request.declaration,
      correction: request.correction,
      // Server-side composition has no financing authority or storage access.
      binding: {
        datasetId: '',
        applicationId: '',
        slot: request.slot,
        audience: request.audience,
        context: request.context,
        contextId: '',
        roundId: null,
        authorityGeneration: 0,
        sharedRevision: 0,
        workspaceRevision: 0,
        dependencyKey: '',
        durable: false,
      },
    };
    const plan = attemptPlan(request.totalPages, request.selectedPages),
      pages: PageAnalysis[] = [];
    const coverage: Coverage = {
      totalPages: request.totalPages,
      selected: request.selectedPages,
      prepared: images.map(page => page.manifest.page),
      dispatched: [],
      successful: [],
      failed: [],
      unreadable: [],
      unchecked: [],
      uncheckedCount: request.totalPages,
    };
    const evaluate = (stage: StageRequest) =>
      work.evaluate(stage, async signal => {
        signal.throwIfAborted();
        return () => invoke(stage, signal);
      });
    for (const step of runPages({ selection, pages: images, runId: request.runId, plan })) {
      work.check();
      const raw = await evaluate(step.request);
      try {
        pages.push(pageAnalysis(selection, step, raw));
        coverage.successful.push(step.image.manifest.page);
      } catch {
        /* Accounted but wholly malformed judgments cannot supply scope. */
      }
    }
    const comparisonPlan = comparePages({
      selection,
      pages: images,
      runId: request.runId,
      plan,
      coverage,
      analyses: pages,
    });
    let comparison;
    if (comparisonPlan.status === 'ready') {
      const raw = await evaluate(comparisonPlan.request);
      try {
        comparison = {
          request: recordRequest(comparisonPlan.request),
          ...interpret(raw, selection, comparisonPlan.basis),
        };
      } catch {
        /* Preserve independent pages. */
      }
    }
    const findings =
      request.totalPages === 1
        ? pages[0]?.findings
        : composeFindings(selection, coverage, pages, comparison);
    if (!findings) return;
    const planned = new Map(
      verificationPlan({ selection, coverage, findings, analyses: pages, prepared: images }).map(
        step => [step.page, step],
      ),
    );
    for (const page of pages) {
      work.check();
      const step = planned.get(page.page);
      if (!step) continue;
      const regions = step.regions.map(region => ({ ...region.geometry, target: region.target }));
      try {
        const crops = await serverCrops(step.image, regions, work.signal);
        work.check();
        await evaluate(makeVerificationRequest(page, step.image, crops));
      } catch (error) {
        if (error instanceof LiveStop) throw error;
        throw new LiveStop(
          error instanceof Error && error.message === 'context-limit'
            ? 'context-limit'
            : 'prepared-limit',
        );
      }
    }
  };
}
