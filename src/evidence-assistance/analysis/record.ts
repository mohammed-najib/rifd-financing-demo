import { boxSchema, composeLocations, same } from '../preparation/locations'
import { makeVerificationRequest, interpretVerification } from './verification'
import { z } from 'zod'
import { bridgeSchema } from '../preparation/capture'
import { completedFinancialMonths } from './financial'
import { correctionTargetsSchema } from '../../domain/model'
import { bounds, versions, financialPageTargets, type EvidenceRun, type SelectedEvidence } from '../contract'
import { makeRequest, interpret, recordRequest, attemptPlan, composeFindings, usablePage } from './policy'

export const retentionMilliseconds = 7 * 24 * 60 * 60 * 1000
const hash = z.string().regex(/^[a-f0-9]{64}$/)
const date = z.iso.datetime()
const pages = z.array(z.number().int().min(1).max(100)).max(100)
const dimensions = z.number().positive().finite()
const matrix = z.array(z.number().finite()).max(9)
const binding = z.object({
  datasetId: z.string().uuid(), applicationId: z.string().min(1), slot: z.enum(['identity', 'business', 'financial', 'purchase']),
  audience: z.enum(['applicant', 'reviewer']), context: z.enum(['draft', 'correction-workspace', 'submitted']), contextId: z.string().min(1), roundId: z.string().nullable(),
  authorityGeneration: z.number().int().nonnegative(), sharedRevision: z.number().int().nonnegative(), workspaceRevision: z.number().int().nonnegative(), dependencyKey: z.string(), durable: z.boolean(), reviewContext: z.string().min(1).optional(),
}).strict()
const detail = z.object({ value: z.string().nullable(), status: z.enum(['valid', 'missing', 'invalid']) }).strict()
const business = z.object({ businessName: detail, address: detail, operatingSince: detail }).strict()
const purchase = z.object({ product: z.enum(['inventory', 'equipment']), explanation: detail, budget: detail }).strict()
const financial = z.object({ initialSubmissionMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), expectedMonths: z.array(z.string()).length(3), revenue: detail, expenses: detail }).strict()
const declaration = z.union([z.object({ fullName: z.string().nullable(), status: z.enum(['valid', 'missing', 'invalid']) }).strict(), z.object({ business }).strict(), z.object({ purchase }).strict(), z.object({ financial }).strict()])
const presenceFinding = z.enum(['present', 'absent', 'undetermined', 'unavailable'])
const supportFinding = z.enum(['consistent', 'different', 'not_found', 'conflict', 'undetermined', 'missing-context', 'unavailable'])
const presence = z.object({ type: z.literal('noul'), noul: z.number().min(0).max(1) }).strict()
const correction = z.object({ targets: correctionTargetsSchema, initialSubmissionMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/) }).strict()
const versionRecord = z.object({
  questions: z.literal(versions.questions), preparation: z.literal(versions.preparation), mapping: z.literal(versions.mapping),
  display: z.literal(versions.display), defaults: z.literal(versions.defaults), model: z.literal(versions.model), bridge: z.literal(versions.bridge), sdk: z.literal(versions.sdk),
}).strict()
const plan = z.object({ maximumAttempts: z.number().int().min(2).max(9), stages: z.array(z.string()).min(2).max(9), verification: z.literal('lossless-boundary-pad-v1') }).strict()
const question = z.discriminatedUnion('type', [
  z.object({ type: z.literal('choice'), instructions: z.string(), criteria: z.record(z.string(), z.string()) }).strict(),
  z.object({ type: z.literal('score'), instructions: z.string(), criteria: z.array(z.string()) }).strict(),
  z.object({ type: z.literal('noul'), instructions: z.string() }).strict(),
  z.object({ type: z.literal('box'), instructions: z.string() }).strict(),
])
const probability = z.number().min(0).max(1)
const choice = z.object({ type: z.literal('choice'), choice: z.string(), confidence: probability, probabilities: z.record(z.string(), probability) }).strict()
const score = z.object({ type: z.literal('score'), score: z.number(), confidence: probability, probabilities: z.record(z.string(), probability), legend: z.record(z.string(), z.string()) }).strict()
const findingsSchema = z.object({
    category: z.enum(['identity', 'business', 'financial', 'stock', 'equipment', 'other', 'mixed', 'undetermined', 'unavailable']),
    readability: z.enum(['clear', 'partial', 'unreadable', 'undetermined', 'unavailable']), namePresence: presenceFinding.optional(), ...Object.fromEntries(financialPageTargets.map(target => [target.presence, presenceFinding.optional()])), periodSupport: supportFinding.optional(), revenueSupport: supportFinding.optional(), expensesSupport: supportFinding.optional(), nameSupport: supportFinding.optional(),
    businessNamePresence: presenceFinding.optional(), businessNameSupport: supportFinding.optional(), addressPresence: presenceFinding.optional(), addressSupport: supportFinding.optional(), operatingSincePresence: presenceFinding.optional(), operatingSinceSupport: supportFinding.optional(), descriptionPresence: presenceFinding.optional(), descriptionSupport: supportFinding.optional(), budgetPresence: presenceFinding.optional(), budgetSupport: supportFinding.optional(),
  }).strict()
const rectangle = z.object({ left: z.number().finite(), top: z.number().finite(), right: z.number().finite(), bottom: z.number().finite() }).strict()
const cropBinding = z.object({ method: z.literal('lossless-boundary-pad-v1'), sourceHash: hash, rasterHash: hash, page: z.number().int().min(1).max(100), target: z.string(), box: rectangle, originalBoundary: rectangle, enclosure: rectangle, width: dimensions.min(280).max(1568), height: dimensions.min(280).max(1568), padding: rectangle, transform: matrix, cropHash: hash }).strict()
const requestSchema = z.object({ runId: z.string().uuid(), stage: z.enum(['combined-page-declaration', 'page', 'document-comparison', 'bound-verification']), model: z.literal(versions.model), plan, state: z.object({ cropImages: z.array(z.string()).max(9).optional(), regions: z.array(cropBinding).min(1).max(9).optional(), verificationPolicy: z.string().optional(), page: z.string(), pages: z.array(z.string()).max(4).optional(), declaredFinancial: z.object({ initialSubmissionMonth: z.string(), expectedMonths: z.array(z.string()).length(3), revenue: z.string().nullable(), expenses: z.string().nullable() }).strict().optional(), declaredApplicantName: z.string().nullable().optional(), declaredBusiness: z.object({ businessName: z.string().nullable(), address: z.string().nullable(), operatingSince: z.string().nullable() }).strict().optional(), declaredPurchase: z.object({ product: z.enum(['inventory', 'equipment']), explanation: z.string().nullable(), budget: z.string().nullable() }).strict().optional(), correction: correction.optional() }).strict(), questions: z.record(z.string(), question), versions: versionRecord, dependencies: z.record(z.string(), z.array(z.string())) }).strict()
export const rasterSchema = z.object({ page: z.number().int().min(1).max(100), sourceHash: hash, rasterHash: hash, width: dimensions.min(bounds.minimumSide).max(bounds.maximumSide), height: dimensions.min(bounds.minimumSide).max(bounds.maximumSide), sourceWidth: dimensions, sourceHeight: dimensions, uprightWidth: dimensions, uprightHeight: dimensions, orientation: z.number().int().min(1).max(8), rotation: z.number().multipleOf(90), scale: dimensions.max(1), padding: z.object({ left: z.number(), top: z.number(), right: z.number(), bottom: z.number() }).strict(), viewport: matrix, orientationTransform: matrix, transform: matrix, renderer: z.string(), worker: z.string(), resources: z.string(), preparation: z.literal(versions.preparation) }).strict()
const nativeSchema = z.object({ locations: z.record(z.string(), z.object({ box: boxSchema.optional(), multiplicity: choice.optional() }).strict()).optional(), model: z.literal(versions.model), answers: z.object({ category: choice.optional(), ...Object.fromEntries(financialPageTargets.map(target => [target.presence, presence.optional()])), periodSupport: choice.optional(), revenueSupport: choice.optional(), expensesSupport: choice.optional(), readability: score.optional(), namePresence: presence.optional(), nameSupport: choice.optional(), businessNamePresence: presence.optional(), businessNameSupport: choice.optional(), addressPresence: presence.optional(), addressSupport: choice.optional(), operatingSincePresence: presence.optional(), operatingSinceSupport: choice.optional(), descriptionPresence: presence.optional(), descriptionSupport: choice.optional(), budgetPresence: presence.optional(), budgetSupport: choice.optional() }).strict(), receivedAnswers: z.record(z.string(), z.json()), usage: z.object({ input_tokens: z.number().int().nonnegative(), output_tokens: z.number().int().nonnegative() }).strict(), responseId: z.string().optional(), bridge: bridgeSchema.optional() }).strict()
const pageAnalysis = z.object({ page: z.number().int().min(1).max(100), request: requestSchema, raster: rasterSchema, native: nativeSchema, findings: findingsSchema, partial: z.boolean() }).strict()
const comparisonAnalysis = z.object({ request: requestSchema, native: nativeSchema, findings: findingsSchema, partial: z.boolean() }).strict()
const schema = z.object({
  schemaVersion: z.literal(1), id: z.string().uuid(), provenanceKind: z.literal('live-analysis'), temporary: z.boolean(), restored: z.boolean(), stale: z.boolean(), expiresAt: date,
  coverage: z.object({ totalPages: z.number().int().min(1).max(100), selected: pages.min(1).max(4), prepared: pages.max(4), dispatched: pages.max(4), successful: pages.max(4), failed: pages.max(4), unreadable: pages.max(4), unchecked: pages, uncheckedCount: z.number().int().nonnegative() }).strict(),
  findings: findingsSchema, pages: z.array(pageAnalysis).min(1).max(4), comparison: comparisonAnalysis.optional(), verifications: z.array(z.object({ page: z.number().int().min(1).max(100), request: requestSchema, native: nativeSchema }).strict()).max(4).optional(), locations: z.array(z.object({ page: z.number().int().min(1).max(100), target: z.string(), box: rectangle.optional(), status: z.enum(['shown', 'suppressed']), reason: z.string().optional() }).strict()).max(36).optional(),
  stages: z.array(z.object({ page: z.number().int().min(1).max(100).optional(), stage: z.string(), outcome: z.enum(['successful', 'partial', 'unavailable', 'skipped']), reason: z.string().optional() }).strict()).max(16),
  provenance: z.object({
    source: z.object({ id: z.string(), name: z.string(), mime: z.string(), hash }).strict(), binding, context: declaration, correction: correction.optional(), versions: versionRecord, plan,
    request: requestSchema, raster: rasterSchema, native: nativeSchema,
    accounting: z.enum(['reported', 'unresolved']), startedAt: date, dispatchedAt: date, answeredAt: date, completedAt: date,
  }).strict(),
}).strict()

export function evidenceDependencyKey(selection: Pick<SelectedEvidence, 'binding' | 'source' | 'declaration' | 'correction'>): string {
  const { binding: b, source, declaration, correction } = selection
  return JSON.stringify([b.datasetId, b.applicationId, b.slot, b.audience, b.context, b.contextId, b.roundId, source.id, source.hash, declaration, ...(correction ? [correction] : []), ...(b.reviewContext ? [b.reviewContext] : [])])
}

export function contextKey(binding: SelectedEvidence['binding']): string {
  return JSON.stringify([binding.datasetId, binding.applicationId, binding.slot, binding.audience, binding.context, binding.contextId, binding.roundId])
}

// Stored answers are untrusted input. Validate structure, bounds, definitions and
// native-to-display mapping before they can supply any current finding.
export function readRecord(raw: unknown): EvidenceRun | null {
  try {
    const serialized = JSON.stringify(raw)
    if (new TextEncoder().encode(serialized).byteLength > 512 * 1024) return null
    const parsed = schema.safeParse(raw)
    if (!parsed.success) return null
    const run = parsed.data as EvidenceRun & { pages: NonNullable<EvidenceRun['pages']> }
    const p = run.provenance
    if ((p.binding.context === 'submitted') !== !!p.binding.reviewContext || (p.binding.audience === 'reviewer') !== (p.binding.context === 'submitted')) return null
    if (Date.parse(run.expiresAt) !== Date.parse(p.completedAt) + retentionMilliseconds || Date.parse(p.completedAt) > Date.now() || !(p.startedAt <= p.dispatchedAt && p.dispatchedAt <= p.answeredAt && p.answeredAt <= p.completedAt)) return null
    const c = run.coverage, total = c.totalPages!
    const ordered = (values: number[]) => values.every((page, i) => page <= total && (!i || page > values[i - 1]))
    if (![c.selected, c.prepared, c.dispatched, c.successful, c.failed, c.unreadable, c.unchecked].every(ordered)) return null
    if (!c.prepared.every(page => c.selected.includes(page)) || !c.dispatched.every(page => c.prepared.includes(page)) || !c.successful.every(page => c.dispatched.includes(page)) || !c.failed.every(page => c.selected.includes(page) && !c.successful.includes(page))) return null
    const all = Array.from({ length: total }, (_, i) => i + 1)
    if (!same(c.unchecked, all.filter(page => !c.successful.includes(page))) || c.uncheckedCount !== c.unchecked.length || !same(c.failed, c.selected.filter(page => !c.successful.includes(page) && (!c.prepared.includes(page) || c.dispatched.includes(page))))) return null
    if (!same(c.successful, run.pages.map(page => page.page)) || !same(c.unreadable, run.pages.filter(page => ['unreadable', 'partial'].includes(page.findings.readability)).map(page => page.page))) return null
    const expectedPlan = attemptPlan(total, c.selected)
    if (!same(p.plan, expectedPlan) || !same(p.request, run.pages[0].request) || !same(p.raster, run.pages[0].raster) || !same(p.native, run.pages[0].native)) return null
    if ((p.binding.context === 'correction-workspace') !== !!p.correction || p.correction && (!p.binding.roundId || p.binding.contextId !== p.binding.roundId)) return null
    const selection: SelectedEvidence = { source: { ...p.source, bytes: new ArrayBuffer(0) }, declaration: p.context, ...(p.correction ? { correction: p.correction } : {}), binding: p.binding }
    if (p.context.financial && !same(p.context.financial.expectedMonths, completedFinancialMonths(p.context.financial.initialSubmissionMonth))) return null
    if (p.binding.dependencyKey !== evidenceDependencyKey(selection)) return null
    for (const page of run.pages) {
      if (page.page !== page.raster.page || p.source.hash !== page.raster.sourceHash || !c.selected.includes(page.page)) return null
      const preparedRequest = makeRequest(selection, { bytes: new ArrayBuffer(0), manifest: page.raster, totalPages: total }, run.id, expectedPlan)
      if (!same(recordRequest(preparedRequest), page.request)) return null
      if (page.native.bridge && !same(page.native.bridge.state, page.request.state)) return null
      const mapped = interpret({ ...page.native, answers: page.native.receivedAnswers }, selection)
      if (!same(mapped.native, page.native) || !same(mapped.findings, page.findings) || mapped.partial !== page.partial) return null
    }
    if (run.comparison) {
      if (total === 1) return null
      const usable = run.pages.filter(page => usablePage(selection, page.findings))
      if (!usable.length) return null
      const images = usable.map(page => ({ bytes: new ArrayBuffer(0), manifest: page.raster, totalPages: total }))
      if (!same(recordRequest(makeRequest(selection, images[0], run.id, expectedPlan, images)), run.comparison.request)) return null
      if (run.comparison.native.bridge && !same(run.comparison.native.bridge.state, run.comparison.request.state)) return null
      const basis = composeFindings(selection, { ...c, totalPages: usable.length, successful: usable.map(page => page.page) }, usable)
      const mapped = interpret({ ...run.comparison.native, answers: run.comparison.native.receivedAnswers }, selection, basis)
      if (!same(mapped.native, run.comparison.native) || !same(mapped.findings, run.comparison.findings) || mapped.partial !== run.comparison.partial) return null
    }
    const findings = total === 1 ? run.pages[0].findings : composeFindings(selection, c, run.pages, run.comparison)
    if (!same(findings, run.findings)) return null
    run.verifications = (run.verifications ?? []).filter((verification, index, all) => {
      const page = run.pages.find(page => page.page === verification.page)
      if (!page || all.filter(stage => stage.page === verification.page).length !== 1) return false
      try {
        const crops = (verification.request.state.regions ?? []).map(binding => ({ bytes: new ArrayBuffer(0), binding }))
        if (new Set(crops.map(crop => crop.binding.target)).size !== crops.length) return false
        const request = makeVerificationRequest(page, { bytes: new ArrayBuffer(0), manifest: page.raster, totalPages: total }, crops)
        return same(recordRequest(request), verification.request) && (!verification.native.bridge || same(verification.native.bridge.state, verification.request.state)) && same(interpretVerification({ ...verification.native, answers: verification.native.receivedAnswers }), verification.native)
      } catch { return false }
    })
    run.locations = composeLocations(run, selection)

    return run
  } catch { return null }
}
