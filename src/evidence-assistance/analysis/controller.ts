import { bounds, type BoundVerification } from '../contract';
import { composeLocations, same } from '../preparation/locations';
import { makeVerificationRequest, interpretVerification } from './verification';
import { comparePages, pageAnalysis, runPages, verificationPlan } from './run';
import type { Result } from '../../demo/types';
import {
  declaredDetail,
  evidenceTargets,
  type AssistanceState,
  type EvidenceAssistance,
  type EvidenceRun,
  type EvidenceTransport,
  type SelectedEvidence,
  type PageAnalysis,
  type ComparisonAnalysis,
  type StageRequest,
} from '../contract';
import {
  prepareEvidence,
  prepareCrops,
  inspectSource,
  emptyCoverage,
  sourcePages,
  PreparationError,
} from '../preparation/prepare';
import {
  interpret,
  recordRequest,
  attemptPlan,
  composeFindings,
  usablePage,
  envelope,
  reportedUsage,
} from './policy';
import { retentionMilliseconds } from './record';
import type { AnalysisStorage, AnalysisTicket } from './storage';
import { LiveAccessError } from '../../live-assistance/client';

const coverage = emptyCoverage;
const initialScope = (totalPages: number) => ({
  ...coverage(),
  totalPages,
  selected: totalPages <= 4 ? sourcePages(totalPages) : [],
  unchecked: sourcePages(totalPages),
  uncheckedCount: totalPages,
});

export function createAssistance(
  resolve: () => Promise<Result<SelectedEvidence>>,
  transport: EvidenceTransport | undefined,
  storage: AnalysisStorage,
  authorizeClear: () => Promise<Result<SelectedEvidence['binding']>>,
  onDispose: () => void,
) {
  let state: AssistanceState = {
    status: 'idle',
    result: null,
    coverage: coverage(),
    storage: 'available',
  };
  let generation = 0;
  let abort: AbortController | null = null;
  let inspectedScope: { hash: string; totalPages: number } | null = null;
  let dependencyKey: string | null = null;
  let record: EvidenceRun | null = null;
  let ticket: AnalysisTicket | null = null;
  let clearGeneration: string | null = null;
  let observedAuthority: Pick<AnalysisTicket, 'generation' | 'clearGeneration'> | null = null;
  let refreshing: Promise<void> | null = null;
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) {
      try {
        listener();
      } catch {
        /* Presentation cannot change a run. */
      }
    }
  };
  const stop = () => {
    generation++;
    abort?.abort();
    abort = null;
  };
  const display = (selected?: SelectedEvidence) => {
    if (!record) {
      state.result = null;
      return;
    }
    const stale =
      !selected || record.provenance.binding.dependencyKey !== selected.binding.dependencyKey;
    state.result = {
      ...record,
      stale,
      locations: stale
        ? record.locations?.map(location => ({
            ...location,
            status: 'suppressed',
            reason: 'stale',
          }))
        : record.locations,
      findings: stale
        ? (Object.fromEntries(
            Object.keys(record.findings).map(key => [key, 'unavailable']),
          ) as EvidenceRun['findings'])
        : record.findings,
    };
    if (stale && state.status !== 'preparing' && state.status !== 'running') {
      state.status = 'unavailable';
      state.reason = 'stale';
    }
  };
  const invalidate = (reason: 'stale' | 'unauthorized') => {
    if (state.status === 'disposed') return;
    stop();
    dependencyKey = null;
    ticket = null;
    if (reason === 'unauthorized') record = null;
    state = { ...state, status: 'unavailable', reason, coverage: record?.coverage ?? coverage() };
    display();
    notify();
  };
  const refresh = (): Promise<void> => {
    if (state.status === 'disposed') return Promise.resolve();
    if (refreshing) return refreshing;
    refreshing = (async () => {
      let captured = generation;
      const selected = await resolve();
      if (captured !== generation || state.status === 'disposed') return;
      if (!selected.ok) {
        invalidate(
          selected.error.kind === 'supersededSelection' || selected.error.kind === 'staleWorkspace'
            ? 'stale'
            : 'unauthorized',
        );
        return;
      }
      const selection = selected.value;
      if (dependencyKey && selection.binding.dependencyKey !== dependencyKey) {
        stop();
        captured = generation;
        ticket = null;
        dependencyKey = null;
        state.status = 'unavailable';
        state.reason = 'stale';
      }
      try {
        const saved = await storage.read(selection);
        if (captured !== generation) return;
        state.storage = saved.incompatible ? 'incompatible' : 'available';
        if (clearGeneration !== null && saved.clearGeneration !== clearGeneration) {
          stop();
          captured = generation;
          ticket = null;
          record = null;
          state = { ...state, status: 'idle', reason: undefined, coverage: coverage() };
        } else if (ticket && saved.generation !== ticket.generation) {
          stop();
          captured = generation;
          ticket = null;
          state = {
            ...state,
            status: record ? 'completed' : 'idle',
            reason: undefined,
            coverage: record?.coverage ?? coverage(),
          };
        }
        clearGeneration = saved.clearGeneration;
        observedAuthority = {
          generation: saved.generation,
          clearGeneration: saved.clearGeneration,
        };
        if (
          record?.temporary &&
          ticket &&
          record.provenance.binding.dependencyKey === selection.binding.dependencyKey &&
          selection.binding.durable
        ) {
          const retained = await storage.retain(
            selection,
            ticket,
            record,
            () => captured === generation,
            resolve,
          );
          if (captured !== generation) return;
          if (retained) {
            record = { ...record, temporary: false };
            saved.latest = record;
          }
        }
        if (!record?.temporary && state.status !== 'preparing' && state.status !== 'running') {
          if (saved.latest) {
            const restored = record?.id !== saved.latest.id || record.restored;
            record = { ...saved.latest, temporary: false, restored };
            state.status = 'completed';
            state.reason = undefined;
            state.coverage = record.coverage;
          } else if (record && !ticket) {
            record = null;
            state.status = 'idle';
            state.reason = undefined;
            state.coverage = coverage();
          }
        }
      } catch {
        if (captured !== generation) return;
        state.storage = 'temporary-only';
        if (record) record = { ...record, temporary: true };
      }
      if (record && Date.parse(record.expiresAt) <= Date.now()) {
        record = null;
        state.status = 'idle';
        state.reason = undefined;
        state.coverage = coverage();
      }
      if (record) display(selection);
      else {
        state.result = null;
        if (
          inspectedScope?.hash === selection.source.hash &&
          state.coverage.totalPages === null &&
          !['preparing', 'running'].includes(state.status)
        )
          state.coverage = initialScope(inspectedScope.totalPages);
      }
      notify();
    })().finally(() => {
      refreshing = null;
    });
    return refreshing;
  };
  const api: EvidenceAssistance = {
    read: () => {
      if (record && Date.parse(record.expiresAt) <= Date.now()) {
        stop();
        record = null;
        ticket = null;
        state = { ...state, status: 'idle', result: null, reason: undefined, coverage: coverage() };
        void refresh();
      }
      return structuredClone(state);
    },
    refresh,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    inspect: async () => {
      if (state.status === 'disposed')
        return { ok: false, error: { kind: 'unavailable', key: 'error.unavailable' } };
      await refresh();
      const selection = await resolve();
      if (
        selection.ok &&
        !abort &&
        !['running', 'preparing'].includes(state.status) &&
        inspectedScope?.hash !== selection.value.source.hash
      ) {
        const captured = generation,
          inspection = new AbortController();
        abort = inspection;
        try {
          const totalPages = await inspectSource(selection.value.source, inspection.signal);
          if (captured === generation && !inspection.signal.aborted) {
            inspectedScope = { hash: selection.value.source.hash, totalPages };
            if (!record) state.coverage = initialScope(totalPages);
            notify();
          }
        } catch (error) {
          if (captured === generation && error instanceof PreparationError) {
            state.reason = error.reason;
            state.coverage.totalPages = error.totalPages;
            notify();
          }
        } finally {
          if (abort === inspection) abort = null;
        }
      }
      return selection;
    },
    async clear() {
      const refused = (): Result<void> => ({
        ok: false,
        error: { kind: 'unavailable', key: 'error.unavailable' },
      });
      if (state.status === 'disposed') return refused();
      stop();
      record = null;
      ticket = null;
      clearGeneration = null;
      dependencyKey = null;
      state = { status: 'idle', result: null, coverage: coverage(), storage: state.storage };
      notify();
      const captured = generation;
      const authorized = await authorizeClear();
      if (captured !== generation) return refused();
      if (!authorized.ok) {
        invalidate('unauthorized');
        return { ok: false, error: authorized.error };
      }
      try {
        await storage.clear({ binding: authorized.value }, () => captured === generation);
        if (captured !== generation) return refused();
        state.storage = 'available';
        notify();
        return { ok: true, value: undefined };
      } catch {
        if (captured === generation) {
          state.storage = 'temporary-only';
          notify();
        }
        return { ok: false, error: { kind: 'storage', key: 'error.storage' } };
      }
    },
    cancel() {
      if (state.status === 'disposed') return;
      stop();
      state = { ...state, status: 'cancelled', reason: undefined };
      notify();
    },
    dispose() {
      if (state.status === 'disposed') return;
      stop();
      record = null;
      ticket = null;
      state = { status: 'disposed', result: null, coverage: coverage(), storage: state.storage };
      listeners.clear();
      onDispose();
    },
    async run(selectedPages) {
      if (state.status === 'disposed' || state.status === 'preparing' || state.status === 'running')
        return;
      await refresh();
      if (api.read().status === 'disposed') return;
      let runAuthority = observedAuthority;
      stop();
      const captured = generation,
        cancellation = new AbortController();
      abort = cancellation;
      const current = () => captured === generation && !cancellation.signal.aborted;
      const startedAt = new Date().toISOString(),
        id = crypto.randomUUID();
      state = {
        ...state,
        status: 'preparing',
        reason: undefined,
        coverage: record?.coverage ?? coverage(),
      };
      notify();
      const deadline = performance.now() + 50_000;
      const runTimer = setTimeout(() => {
        cancellation.abort();
        if (captured === generation) {
          state = {
            ...state,
            status: 'unavailable',
            reason: transport?.begin ? 'deadline' : 'preparation-timeout',
          };
          notify();
        }
      }, 50_000);
      let runCoverage = coverage();
      try {
        const selected = await resolve();
        if (!current()) return;
        if (!selected.ok) {
          invalidate('unauthorized');
          return;
        }
        const selection = selected.value;
        dependencyKey = selection.binding.dependencyKey;
        // Inspection knows source scope even when admission cannot start. Keep
        // that knowledge separate from work performed by this new attempt.
        if (inspectedScope?.hash === selection.source.hash) {
          const { totalPages } = inspectedScope;
          runCoverage = initialScope(totalPages);
          if (selectedPages)
            runCoverage.selected =
              selectedPages.length <= 4 &&
              new Set(selectedPages).size === selectedPages.length &&
              selectedPages.every(page => Number.isInteger(page) && page >= 1 && page <= totalPages)
                ? [...selectedPages].sort((a, b) => a - b)
                : [];
        }
        if (!transport) {
          state = {
            ...state,
            status: 'unavailable',
            reason: 'live-unavailable',
            coverage: runCoverage,
          };
          notify();
          return;
        }
        if (transport.begin && !navigator.onLine) throw new LiveAccessError('service-unavailable');
        try {
          ticket = await storage.begin(selection, current);
          runAuthority = ticket;
          clearGeneration = ticket.clearGeneration;
          state.storage = 'available';
        } catch {
          ticket = null;
          state.storage = 'temporary-only';
        }
        if (!current()) return;
        const prepared = await prepareEvidence(
          selection.source,
          cancellation.signal,
          selectedPages,
          next => {
            runCoverage = next;
            if (current()) {
              state = { ...state, coverage: next };
              notify();
            }
          },
        );
        if (!current()) return;
        runCoverage = prepared.coverage;
        let evaluator = transport;
        if (transport.begin) {
          state = { ...state, status: 'running', coverage: runCoverage };
          notify();
          evaluator = await transport.begin(
            {
              runId: id,
              selection,
              pages: prepared.pages,
              selectedPages: runCoverage.selected,
              totalPages: runCoverage.totalPages!,
            },
            cancellation.signal,
          );
          if (!current()) return;
        }
        const plan = attemptPlan(runCoverage.totalPages!, runCoverage.selected);
        let accounting = evaluator.accounting ?? 'reported';
        const verifications: BoundVerification[] = [];
        const pages: PageAnalysis[] = [],
          stages: EvidenceRun['stages'] = prepared.failures.map(failure => ({
            page: failure.page,
            stage: 'preparation',
            outcome: 'unavailable',
            reason: failure.reason,
          }));
        let comparison: ComparisonAnalysis | undefined,
          lastReason = prepared.failures[0]?.reason ?? 'provider-unavailable';
        let halted = false;
        let dispatchedAt = startedAt,
          answeredAt = startedAt;
        const evaluate = async (request: StageRequest) => {
          if (halted) throw new Error('invalid-response');
          const latest = await resolve();
          if (!current()) throw new DOMException('Cancelled', 'AbortError');
          if (!latest.ok || latest.value.binding.dependencyKey !== dependencyKey) {
            invalidate(latest.ok ? 'stale' : 'unauthorized');
            throw new Error('stale');
          }
          if (deadline - performance.now() < (transport.begin ? 0 : 8000))
            throw new PreparationError('preparation-timeout');
          const stageAbort = new AbortController();
          let timer: ReturnType<typeof setTimeout> | undefined;
          const abortStage = () => stageAbort.abort();
          cancellation.signal.addEventListener('abort', abortStage, { once: true });
          state = { ...state, status: 'running', coverage: runCoverage };
          notify();
          if (!current()) throw new DOMException('Cancelled', 'AbortError');
          if (
            !['document-comparison', 'bound-verification'].includes(request.stage) &&
            (!evaluator.wasDispatched || evaluator.wasDispatched(request))
          )
            runCoverage.dispatched.push(request.image.manifest.page);
          const sent = new Date().toISOString();
          const firstAttempt = dispatchedAt === startedAt;
          if (firstAttempt) dispatchedAt = sent;
          let accounted = false;
          try {
            const expired = new Promise<never>((_, reject) => {
              stageAbort.signal.addEventListener(
                'abort',
                () => reject(new Error('provider-unavailable')),
                { once: true },
              );
              timer = setTimeout(() => {
                reject(new Error('provider-unavailable'));
                stageAbort.abort();
              }, 8000);
            });
            const raw = await Promise.race([
              evaluator.evaluate(request, stageAbort.signal),
              expired,
            ]);
            accounted = reportedUsage.safeParse(
              raw && typeof raw === 'object' && 'usage' in raw ? raw.usage : undefined,
            ).success;
            answeredAt = new Date().toISOString();
            const parsed = envelope.safeParse(raw);
            if (!parsed.success) {
              halted = true;
              throw new Error('invalid-response');
            }
            if (parsed.data.bridge) {
              if (firstAttempt) dispatchedAt = parsed.data.bridge.dispatchedAt;
              answeredAt = parsed.data.bridge.answeredAt;
            }
            return raw;
          } catch (error) {
            if (!accounted && (!evaluator.wasDispatched || evaluator.wasDispatched(request)))
              accounting = 'unresolved';
            throw error;
          } finally {
            clearTimeout(timer);
            cancellation.signal.removeEventListener('abort', abortStage);
          }
        };
        for (const step of runPages({ selection, pages: prepared.pages, runId: id, plan })) {
          if (halted) break;
          const page = step.image;
          try {
            const request = step.request;
            const raw = await evaluate(request);
            if (!current()) return;
            const result = pageAnalysis(selection, step, raw);
            pages.push(result);
            runCoverage.successful.push(page.manifest.page);
            if (['unreadable', 'partial'].includes(result.findings.readability))
              runCoverage.unreadable.push(page.manifest.page);
            stages.push({
              page: page.manifest.page,
              stage: request.stage,
              outcome: result.partial ? 'partial' : 'successful',
            });
          } catch (error) {
            if (!current()) return;
            if (error instanceof LiveAccessError) {
              halted = true;
              throw error;
            }
            if (error instanceof Error && error.message === 'accounting-unavailable') halted = true;
            lastReason =
              error instanceof Error &&
              ['invalid-response', 'context-limit', 'accounting-unavailable'].includes(
                error.message,
              )
                ? (error.message as typeof lastReason)
                : 'provider-unavailable';
            if (runCoverage.dispatched.includes(page.manifest.page))
              runCoverage.failed.push(page.manifest.page);
            stages.push({
              page: page.manifest.page,
              stage: 'page',
              outcome: 'unavailable',
              reason: lastReason,
            });
          }
          runCoverage.failed.sort((a, b) => a - b);
          runCoverage.unchecked = sourcePages(runCoverage.totalPages!).filter(
            page => !runCoverage.successful.includes(page),
          );
          runCoverage.uncheckedCount = runCoverage.unchecked.length;
          state.coverage = structuredClone(runCoverage);
          notify();
        }
        const usable = pages.filter(page => usablePage(selection, page.findings));
        if (runCoverage.totalPages! > 1) {
          if (usable.length && !halted) {
            const comparisonPlan = comparePages({
              selection,
              pages: prepared.pages,
              runId: id,
              plan,
              coverage: runCoverage,
              analyses: pages,
            });
            try {
              if (comparisonPlan.status === 'ready') {
                const result = interpret(
                  await evaluate(comparisonPlan.request),
                  selection,
                  comparisonPlan.basis,
                );
                if (!current()) return;
                comparison = { request: recordRequest(comparisonPlan.request), ...result };
                stages.push({
                  stage: 'document-comparison',
                  outcome: result.partial ? 'partial' : 'successful',
                });
              } else
                stages.push({
                  stage: 'document-comparison',
                  outcome: 'skipped',
                  reason: 'missing-context',
                });
            } catch (error) {
              if (!current()) return;
              if (error instanceof LiveAccessError) {
                halted = true;
                throw error;
              }
              stages.push({
                stage: 'document-comparison',
                outcome: 'unavailable',
                reason: error instanceof Error ? error.message : 'provider-unavailable',
              });
            }
          } else
            stages.push({
              stage: 'document-comparison',
              outcome: 'skipped',
              reason: halted ? 'run-stopped' : 'no-usable-pages',
            });
        }
        const findings =
          runCoverage.totalPages === 1
            ? pages[0]?.findings
            : composeFindings(selection, runCoverage, pages, comparison);
        if (findings) {
          const planned = new Map(
            verificationPlan({
              selection,
              coverage: runCoverage,
              findings,
              analyses: pages,
              prepared: prepared.pages,
              enabled: !halted,
            }).map(step => [step.page, step]),
          );
          let cropBytes = prepared.pages.reduce((sum, page) => sum + page.bytes.byteLength, 0);
          let cropPixels = prepared.pages.reduce(
            (sum, page) => sum + page.manifest.width * page.manifest.height,
            0,
          );
          for (const page of pages) {
            const step = planned.get(page.page);
            if (!step) {
              stages.push({
                page: page.page,
                stage: 'bound-verification',
                outcome: 'skipped',
                reason: 'no-eligible-regions',
              });
              continue;
            }
            try {
              if (!current()) return;
              if (deadline - performance.now() < 8000)
                throw new PreparationError('preparation-timeout');
              const image = step.image;
              const regions = step.regions.map(region => ({
                ...region.geometry,
                target: region.target,
              }));
              const capturedState = evaluator.verificationState?.(page.page);
              if (evaluator.verificationState && !capturedState?.regions)
                throw new Error('provider-unavailable');
              const crops = capturedState?.regions
                ? capturedState.regions.map(binding => ({ binding, bytes: new ArrayBuffer(0) }))
                : await prepareCrops(
                    image,
                    regions,
                    cancellation.signal,
                    Math.min(8000, deadline - performance.now()),
                  );
              if (!current()) return;
              cropBytes += crops.reduce((sum, crop) => sum + crop.bytes.byteLength, 0);
              cropPixels += crops.reduce(
                (sum, crop) => sum + crop.binding.width * crop.binding.height,
                0,
              );
              if (cropBytes > bounds.combinedBytes || cropPixels > bounds.combinedPixels)
                throw new PreparationError('prepared-limit');
              const request = makeVerificationRequest(page, image, crops);
              if (capturedState && !same(request.state, capturedState))
                throw new Error('invalid-response');
              const native = interpretVerification(await evaluate(request));
              if (!current()) return;
              verifications.push({ page: page.page, request: recordRequest(request), native });
              stages.push({ page: page.page, stage: 'bound-verification', outcome: 'successful' });
            } catch (error) {
              if (!current()) return;
              if (error instanceof LiveAccessError) {
                halted = true;
                throw error;
              }
              const reason = error instanceof Error ? error.message : 'provider-unavailable';
              stages.push({
                page: page.page,
                stage: 'bound-verification',
                outcome: 'unavailable',
                reason,
              });
              // Uncertain judgments are ordinary suppression. Unaccounted usage,
              // resource or deadline failures stop all further verification work.
              if (
                [
                  'invalid-response',
                  'accounting-unavailable',
                  'prepared-limit',
                  'context-limit',
                  'preparation-timeout',
                  'provider-unavailable',
                ].includes(reason)
              )
                break;
            }
          }
        }
        if (!pages.length) throw new PreparationError(lastReason, runCoverage.totalPages);
        if (!current()) return;
        const final = await resolve();
        if (!current()) return;
        if (!final.ok || final.value.binding.dependencyKey !== dependencyKey) {
          invalidate(final.ok ? 'stale' : 'unauthorized');
          return;
        }
        // Use the pre-run observation if a generation write failed. A transient
        // storage failure cannot make a later clear or newer run invisible.
        try {
          const saved = await storage.read(final.value);
          if (!current()) return;
          const changed = runAuthority
            ? saved.generation !== runAuthority.generation ||
              saved.clearGeneration !== runAuthority.clearGeneration
            : !!saved.generation || !!saved.clearGeneration;
          if (changed) {
            stop();
            ticket = null;
            state = { ...state, status: record ? 'completed' : 'idle', reason: undefined };
            await refresh();
            return;
          }
        } catch {
          if (!current()) return;
          state.storage = 'temporary-only';
          if (runAuthority) {
            state = { ...state, status: 'unavailable', reason: 'analysis-storage', result: null };
            notify();
            return;
          }
          // When storage was unavailable throughout, the run has only its local
          // cancellation authority and is explicitly temporary-only.
        }
        const first = pages[0];
        const source = {
          id: selection.source.id,
          name: selection.source.name,
          mime: selection.source.mime,
          hash: selection.source.hash,
        };
        if (runCoverage.totalPages === 1)
          stages.push(
            ...evidenceTargets(selection.binding.slot).map(target => ({
              stage: `${target.field === 'fullName' ? 'name' : target.field}-comparison`,
              outcome: (declaredDetail(selection.declaration, target).status === 'valid'
                ? first.native.answers[target.support]
                  ? 'successful'
                  : 'unavailable'
                : 'skipped') as EvidenceRun['stages'][number]['outcome'],
              ...(declaredDetail(selection.declaration, target).status === 'valid'
                ? {}
                : { reason: 'missing-context' }),
            })),
          );
        const completedAt = new Date().toISOString();
        const completed: EvidenceRun = {
          schemaVersion: 1,
          id,
          provenanceKind: 'live-analysis',
          temporary: true,
          restored: false,
          stale: false,
          expiresAt: new Date(Date.parse(completedAt) + retentionMilliseconds).toISOString(),
          coverage: runCoverage,
          findings: findings!,
          pages,
          verifications,
          ...(comparison ? { comparison } : {}),
          stages,
          provenance: {
            source,
            binding: selection.binding,
            context: selection.declaration,
            ...(selection.correction ? { correction: selection.correction } : {}),
            versions: first.request.versions,
            plan,
            request: first.request,
            raster: first.raster,
            native: first.native,
            accounting,
            startedAt,
            dispatchedAt,
            answeredAt,
            completedAt,
          },
        };
        completed.locations = composeLocations(completed, selection);
        if (ticket && final.value.binding.durable) {
          try {
            if (await storage.retain(final.value, ticket, completed, current, resolve))
              completed.temporary = false;
            else {
              await refresh();
              return;
            }
          } catch {
            state.storage = 'temporary-only';
          }
        }
        if (!current()) return;
        record = completed;
        state = {
          ...state,
          status: 'completed',
          reason: undefined,
          result: completed,
          coverage: runCoverage,
        };
        notify();
      } catch (error) {
        if (captured !== generation) return;
        if (error instanceof LiveAccessError && error.dispatched)
          runCoverage.dispatched = error.dispatched
            .filter(stage => stage.stage === 'page' || stage.stage === 'combined-page-declaration')
            .map(stage => stage.page);
        const reason =
          error instanceof LiveAccessError
            ? error.reason
            : error instanceof PreparationError
              ? error.reason
              : error instanceof Error &&
                  ['context-limit', 'invalid-response'].includes(error.message)
                ? (error.message as 'context-limit' | 'invalid-response')
                : 'provider-unavailable';
        const total = error instanceof PreparationError ? error.totalPages : runCoverage.totalPages;
        state = {
          ...state,
          status: 'unavailable',
          reason,
          coverage: {
            ...runCoverage,
            totalPages: total,
            uncheckedCount: total === null ? null : total - runCoverage.successful.length,
            unchecked: total
              ? sourcePages(total).filter(page => !runCoverage.successful.includes(page))
              : [],
          },
        };
        notify();
      } finally {
        clearTimeout(runTimer);
        if (captured === generation) abort = null;
      }
    },
  };
  return { api, invalidate, revalidate: refresh };
}
