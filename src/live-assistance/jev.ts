import { type Coverage, type PageAnalysis, type PreparedPage, type SelectedEvidence, type StageRequest } from '../evidence-assistance/contract'
import { attemptPlan, composeFindings, interpret, makeRequest, recordRequest, usablePage } from '../evidence-assistance/policy'
import { cropGeometry, locationCandidates } from '../evidence-assistance/locations'
import { makeVerificationRequest } from '../evidence-assistance/verification'
import { LiveStop } from './admission'
import { jevBridge } from './jev-bridge'
import { serverCrops } from './crops'
import type { FixedWorkflow } from './service'

export function createJevWorkflow(options: Parameters<typeof jevBridge>[0]): FixedWorkflow {
  const invoke = jevBridge(options)
  return async (request, work) => {
    const images: PreparedPage[] = request.pages.map(page => ({ bytes: Uint8Array.from(page.bytes).buffer, manifest: page.manifest, totalPages: request.totalPages }))
    const selection: SelectedEvidence = {
      source: { id: 'received-png', name: '', mime: 'image/png', hash: images[0].manifest.sourceHash, bytes: new ArrayBuffer(0) },
      declaration: request.declaration, correction: request.correction,
      // Server-side composition has no financing authority or storage access.
      binding: { datasetId: '', applicationId: '', slot: request.slot, audience: request.audience, context: request.context, contextId: '', roundId: null, authorityGeneration: 0, sharedRevision: 0, workspaceRevision: 0, dependencyKey: '', durable: false },
    }
    const plan = attemptPlan(request.totalPages, request.selectedPages), pages: PageAnalysis[] = []
    const coverage: Coverage = { totalPages: request.totalPages, selected: request.selectedPages, prepared: images.map(page => page.manifest.page), dispatched: [], successful: [], failed: [], unreadable: [], unchecked: [], uncheckedCount: request.totalPages }
    const evaluate = (stage: StageRequest) => work.evaluate(stage, async signal => {
      signal.throwIfAborted()
      return () => invoke(stage, signal)
    })
    for (const image of images) {
      work.check()
      const stage = makeRequest(selection, image, request.runId, plan)
      const raw = await evaluate(stage)
      try {
        const interpreted = interpret(raw, selection)
        pages.push({ page: image.manifest.page, request: recordRequest(stage), raster: image.manifest, ...interpreted })
        coverage.successful.push(image.manifest.page)
      } catch { /* Accounted but wholly malformed judgments cannot supply scope. */ }
    }
    const usable = pages.filter(page => usablePage(selection, page.findings))
    let comparison
    if (request.totalPages > 1 && usable.length) {
      const checked = images.filter(image => usable.some(page => page.page === image.manifest.page))
      const stage = makeRequest(selection, checked[0], request.runId, plan, checked)
      if (Object.keys(stage.questions).length) {
        const raw = await evaluate(stage)
        const basis = composeFindings(selection, { ...coverage, totalPages: usable.length, successful: usable.map(page => page.page) }, usable)
        try { comparison = { request: recordRequest(stage), ...interpret(raw, selection, basis) } } catch { /* Preserve independent pages. */ }
      }
    }
    const findings = request.totalPages === 1 ? pages[0]?.findings : composeFindings(selection, coverage, pages, comparison)
    if (!findings) return
    const candidates = locationCandidates({ coverage, pages, findings, stale: false }, selection)
    for (const page of pages) {
      work.check()
      const eligible = candidates.filter(candidate => candidate.page === page.page && !candidate.reason)
      if (!eligible.length) continue
      const image = images.find(image => image.manifest.page === page.page)!
      const regions = eligible.map(candidate => ({ ...cropGeometry(candidate.box!, page.raster)!, target: candidate.target }))
      try {
        const crops = await serverCrops(image, regions, work.signal)
        work.check()
        await evaluate(makeVerificationRequest(page, image, crops))
      } catch (error) {
        if (error instanceof LiveStop) throw error
        throw new LiveStop(error instanceof Error && error.message === 'context-limit' ? 'context-limit' : 'prepared-limit')
      }
    }
  }
}
