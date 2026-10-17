import { z } from 'zod'
import { correctionTargetsSchema } from '../domain/model'
import { versions, type EvidenceRun, type SelectedEvidence } from './contract'
import { makeRequest, interpret, recordRequest } from './policy'

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
const declaration = z.object({ fullName: z.string().nullable(), status: z.enum(['valid', 'missing', 'invalid']) }).strict()
const correction = z.object({ targets: correctionTargetsSchema, initialSubmissionMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/) }).strict()
const versionRecord = z.object({
  questions: z.literal(versions.questions), preparation: z.literal(versions.preparation), mapping: z.literal(versions.mapping),
  display: z.literal(versions.display), defaults: z.literal(versions.defaults), model: z.literal(versions.model), bridge: z.literal(versions.bridge), sdk: z.literal(versions.sdk),
}).strict()
const plan = z.object({ maximumAttempts: z.literal(2), stages: z.tuple([z.literal('combined-page-declaration'), z.literal('bound-verification')]), verification: z.literal('reserved-not-enabled') }).strict()
const question = z.discriminatedUnion('type', [
  z.object({ type: z.literal('choice'), instructions: z.string(), criteria: z.record(z.string(), z.string()) }).strict(),
  z.object({ type: z.literal('score'), instructions: z.string(), criteria: z.array(z.string()) }).strict(),
  z.object({ type: z.literal('noul'), instructions: z.string() }).strict(),
])
const probability = z.number().min(0).max(1)
const choice = z.object({ type: z.literal('choice'), choice: z.string(), confidence: probability, probabilities: z.record(z.string(), probability) }).strict()
const score = z.object({ type: z.literal('score'), score: z.number(), confidence: probability, probabilities: z.record(z.string(), probability), legend: z.record(z.string(), z.string()) }).strict()
const schema = z.object({
  schemaVersion: z.literal(1), id: z.string().uuid(), provenanceKind: z.literal('live-analysis'), temporary: z.boolean(), restored: z.boolean(), stale: z.boolean(), expiresAt: date,
  coverage: z.object({ totalPages: z.number().int().min(1).max(100).nullable(), selected: pages, prepared: pages, dispatched: pages, successful: pages, failed: pages, unreadable: pages, unchecked: pages, uncheckedCount: z.number().int().nonnegative().nullable() }).strict(),
  findings: z.object({
    category: z.enum(['identity', 'business', 'financial', 'stock', 'equipment', 'other', 'mixed', 'undetermined', 'unavailable']),
    readability: z.enum(['clear', 'partial', 'unreadable', 'undetermined', 'unavailable']), namePresence: z.enum(['present', 'absent', 'undetermined', 'unavailable']),
    nameSupport: z.enum(['consistent', 'different', 'not_found', 'conflict', 'undetermined', 'missing-context', 'unavailable']),
  }).strict(),
  stages: z.array(z.object({ stage: z.string(), outcome: z.enum(['successful', 'partial', 'unavailable', 'skipped']), reason: z.string().optional() }).strict()).max(4),
  provenance: z.object({
    source: z.object({ id: z.string(), name: z.string(), mime: z.string(), hash }).strict(), binding, context: declaration, correction: correction.optional(), versions: versionRecord, plan,
    request: z.object({ runId: z.string().uuid(), stage: z.literal('combined-page-declaration'), model: z.literal(versions.model), plan, state: z.object({ page: z.string(), declaredApplicantName: z.string().nullable(), correction: correction.optional() }).strict(), questions: z.record(z.string(), question), versions: versionRecord, dependencies: z.record(z.string(), z.array(z.string())) }).strict(),
    raster: z.object({ page: z.literal(1), sourceHash: hash, rasterHash: hash, width: dimensions, height: dimensions, sourceWidth: dimensions, sourceHeight: dimensions, uprightWidth: dimensions, uprightHeight: dimensions, orientation: z.number(), rotation: z.number(), scale: dimensions, padding: z.object({ left: z.number(), top: z.number(), right: z.number(), bottom: z.number() }).strict(), viewport: matrix, orientationTransform: matrix, transform: matrix, renderer: z.string(), worker: z.string(), resources: z.string(), preparation: z.literal(versions.preparation) }).strict(),
    native: z.object({ model: z.literal(versions.model), answers: z.object({ category: choice.optional(), readability: score.optional(), namePresence: z.object({ type: z.literal('noul'), noul: probability }).strict().optional(), nameSupport: choice.optional() }).strict(), receivedAnswers: z.record(z.string(), z.json()), usage: z.object({ input_tokens: z.number().int().nonnegative(), output_tokens: z.number().int().nonnegative() }).strict(), responseId: z.string().optional() }).strict(),
    accounting: z.literal('reported'), startedAt: date, dispatchedAt: date, answeredAt: date, completedAt: date,
  }).strict(),
}).strict()

export function evidenceDependencyKey(selection: Pick<SelectedEvidence, 'binding' | 'source' | 'declaration' | 'correction'>): string {
  const { binding: b, source, declaration, correction } = selection
  return JSON.stringify([b.datasetId, b.applicationId, b.slot, b.audience, b.context, b.contextId, b.roundId, source.id, source.hash, declaration, ...(correction ? [correction] : []), ...(b.reviewContext ? [b.reviewContext] : [])])
}

export function contextKey(binding: SelectedEvidence['binding']): string {
  return JSON.stringify([binding.datasetId, binding.applicationId, binding.slot, binding.audience, binding.context, binding.contextId, binding.roundId])
}

const same = (a: unknown, b: unknown): boolean => {
  const ordered = (value: unknown): unknown => Array.isArray(value) ? value.map(ordered) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, ordered(item)])) : value
  return JSON.stringify(ordered(a)) === JSON.stringify(ordered(b))
}

// Stored answers are untrusted input. Validate structure, bounds, definitions and
// native-to-display mapping before they can supply any current finding.
export function readRecord(raw: unknown): EvidenceRun | null {
  try {
    const serialized = JSON.stringify(raw)
    if (new TextEncoder().encode(serialized).byteLength > 128 * 1024) return null
    const parsed = schema.safeParse(raw)
    if (!parsed.success) return null
    const run = parsed.data
    const p = run.provenance
    if ((p.binding.context === 'submitted') !== !!p.binding.reviewContext || (p.binding.audience === 'reviewer') !== (p.binding.context === 'submitted')) return null
    if (Date.parse(run.expiresAt) !== Date.parse(p.completedAt) + retentionMilliseconds || Date.parse(p.completedAt) > Date.now() || !(p.startedAt <= p.dispatchedAt && p.dispatchedAt <= p.answeredAt && p.answeredAt <= p.completedAt)) return null
    if (run.id !== p.request.runId || p.source.hash !== p.raster.sourceHash || run.coverage.totalPages !== 1 || JSON.stringify(run.coverage.selected) !== '[1]' || JSON.stringify(run.coverage.successful) !== '[1]' || JSON.stringify(run.coverage.prepared) !== '[1]' || JSON.stringify(run.coverage.dispatched) !== '[1]' || run.coverage.failed.length || run.coverage.unchecked.length || run.coverage.uncheckedCount !== 0) return null
    if ((p.binding.context === 'correction-workspace') !== !!p.correction || p.correction && (!p.binding.roundId || p.binding.contextId !== p.binding.roundId)) return null
    const selection: SelectedEvidence = { source: { ...p.source, bytes: new ArrayBuffer(0) }, declaration: p.context, ...(p.correction ? { correction: p.correction } : {}), binding: p.binding }
    if (p.binding.dependencyKey !== evidenceDependencyKey(selection)) return null
    const preparedRequest = makeRequest(selection, { bytes: new ArrayBuffer(0), manifest: p.raster, totalPages: 1 }, run.id)
    const request = recordRequest(preparedRequest)
    if (!same(request, p.request)) return null
    const mapped = interpret({ ...p.native, answers: p.native.receivedAnswers }, selection)
    if (!same(mapped.native, p.native) || !same(mapped.findings, run.findings)) return null
    return run
  } catch { return null }
}
