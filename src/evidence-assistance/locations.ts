import { z } from 'zod'
import { bounds, locationTargets, type BoxAnswer, type CropBinding, type NativeCapture, type Rectangle, type RasterManifest, type StageRequest, type EvidenceRun, type SelectedEvidence, type EvidenceLocation } from './contract'
import type { DocumentSlot } from '../domain/model'
import blockedRegions from './misleading-regions.json'

export const rectangleSchema = z.object({ left: z.number().min(0).max(1), top: z.number().min(0).max(1), right: z.number().min(0).max(1), bottom: z.number().min(0).max(1) }).strict().refine(box => box.left < box.right && box.top < box.bottom)
const probability = z.number().min(0).max(1)
export const boxSchema = z.object({ type: z.literal('box'), box: rectangleSchema, confidence: probability.nullable() }).strict()
const multiplicitySchema = z.object({ type: z.literal('choice'), choice: z.enum(['absent', 'single', 'repeated', 'uncertain']), confidence: probability, probabilities: z.object({ absent: probability, single: probability, repeated: probability, uncertain: probability }).strict() }).strict().refine(answer => Math.abs(Object.values(answer.probabilities).reduce((a, b) => a + b, 0) - 1) < 0.0001 && answer.probabilities[answer.choice] === Math.max(...Object.values(answer.probabilities)))
export const same = (a: unknown, b: unknown): boolean => {
  const ordered = (value: unknown): unknown => Array.isArray(value) ? value.map(ordered) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, ordered(value)])) : value
  return JSON.stringify(ordered(a)) === JSON.stringify(ordered(b))
}

export function addLocationQuestions(slot: DocumentSlot, questions: StageRequest['questions'], dependencies: StageRequest['dependencies'], common: string[]) {
  for (const target of locationTargets(slot)) {
    questions[`${target.id}Box`] = { type: 'box', instructions: `The complete printed ${target.name} in \`page\`, including every glyph.` }
    questions[`${target.id}Multiplicity`] = { type: 'choice', instructions: `Count printed occurrences of ${target.name} in \`page\`.`, criteria: { absent: 'None', single: 'One unambiguous occurrence', repeated: 'Multiple, even identical values', uncertain: 'Count or field association unclear' } }
    dependencies[`${target.id}Box`] = [...common]; dependencies[`${target.id}Multiplicity`] = [...common]
  }
}

// Bad Box output is isolated from every independently valid page judgment.
export function readLocations(answers: Record<string, unknown>, slot: DocumentSlot): NonNullable<NativeCapture['locations']> {
  return Object.fromEntries(locationTargets(slot).map(target => {
    const box = boxSchema.safeParse(answers[`${target.id}Box`]), multiplicity = multiplicitySchema.safeParse(answers[`${target.id}Multiplicity`])
    return [target.id, { ...(box.success ? { box: box.data as BoxAnswer } : {}), ...(multiplicity.success ? { multiplicity: multiplicity.data } : {}) }]
  }))
}

export function cropGeometry(box: Rectangle, raster: RasterManifest): Omit<CropBinding, 'target' | 'cropHash'> | null {
  if (!rectangleSchema.safeParse(box).success) return null
  const originalBoundary = { left: box.left * raster.width, right: box.right * raster.width, top: box.top * raster.height, bottom: box.bottom * raster.height }
  const b = originalBoundary, p = raster.padding
  // A mark must be on actual page content. White preparation padding is not evidence.
  if (b.left < p.left || b.top < p.top || b.right > raster.width - p.right || b.bottom > raster.height - p.bottom) return null
  const enclosure = { left: Math.floor(b.left), top: Math.floor(b.top), right: Math.ceil(b.right), bottom: Math.ceil(b.bottom) }
  const w = enclosure.right - enclosure.left, h = enclosure.bottom - enclosure.top
  const width = Math.max(bounds.minimumSide, w), height = Math.max(bounds.minimumSide, h)
  const left = Math.floor((width - w) / 2), top = Math.floor((height - h) / 2)
  return { method: 'lossless-boundary-pad-v1', sourceHash: raster.sourceHash, rasterHash: raster.rasterHash, page: raster.page, box, originalBoundary, enclosure, width, height, padding: { left, top, right: width - w - left, bottom: height - h - top }, transform: [1, 0, 0, 1, left - enclosure.left, top - enclosure.top] }
}

export const boundChecks = ['LeftClipping', 'TopClipping', 'RightClipping', 'BottomClipping', 'Association', 'CompetingValue'] as const
export function locationCandidates(run: Pick<EvidenceRun, 'coverage' | 'pages' | 'findings' | 'stale'>, selection: SelectedEvidence): EvidenceLocation[] {
  const pages = run.pages ?? [], category = selection.declaration.purchase ? selection.declaration.purchase.product === 'inventory' ? 'stock' : 'equipment' : selection.binding.slot
  const complete = !run.stale && run.coverage.totalPages !== null && pages.length === run.coverage.totalPages && run.coverage.successful.length === run.coverage.totalPages && pages.every(page => page.findings.category === category && page.findings.readability === 'clear')
  return pages.flatMap(page => locationTargets(selection.binding.slot).map(target => {
    const native = page.native.locations?.[target.id], box = native?.box?.box
    let reason: string | undefined
    if (!complete) reason = 'incomplete-or-stale'
    else if (!box || !cropGeometry(box, page.raster)) reason = 'invalid-geometry'
    // These observed target failures remain unsafe on the same original source.
    // A shifted rectangle plus new probabilities is not independent certification.
    else if (blockedRegions.some(region => region.sourceHash === page.raster.sourceHash && region.page === page.page && region.target === target.id)) reason = 'known-misleading-region'
    else if (page.native.answers[target.presence]?.noul === undefined || page.native.answers[target.presence]!.noul < 0.99) reason = 'presence'
    else if (native?.multiplicity?.choice !== 'single' || native.multiplicity.probabilities.single < 0.99) reason = 'multiplicity'
    else if (pages.some(other => other.page !== page.page && (other.native.answers[target.presence]?.noul === undefined || other.native.answers[target.presence]!.noul > 0.01 || other.native.locations?.[target.id]?.multiplicity?.choice !== 'absent' || (other.native.locations[target.id].multiplicity?.probabilities.absent ?? 0) < 0.99))) reason = 'repeated-or-uncertain'
    else if (target.support && !['consistent', 'different', 'missing-context'].includes(run.findings[target.support] ?? '')) reason = 'conflict-or-uncertain'
    else if (selection.declaration.financial && target.id !== 'period' && run.findings.periodSupport !== 'consistent') reason = 'period'
    return { page: page.page, target: target.id, ...(box ? { box } : {}), status: 'suppressed' as const, ...(reason ? { reason } : {}) }
  }))
}

export function composeLocations(run: EvidenceRun, selection: SelectedEvidence): EvidenceLocation[] {
  return locationCandidates(run, selection).map(location => {
    if (location.reason) return location
    const page = run.pages!.find(page => page.page === location.page)!
    const verification = run.verifications?.find(stage => stage.page === location.page)
    const region = verification?.request.state.regions?.find(region => region.target === location.target)
    const expected = cropGeometry(location.box!, page.raster)
    // The captured request binds all six answers to context and definitions, while
    // its named region binds the exact fractional boundary and lossless transform.
    if (!verification || !region || !same({ ...expected, target: location.target, cropHash: region.cropHash }, region) || !same(verification.request.versions, page.request.versions) || !same({ ...verification.request.state, regions: undefined, cropImages: undefined, verificationPolicy: undefined }, page.request.state)) return { ...location, reason: 'binding-mismatch' }
    const raw = verification.native.receivedAnswers
    const passes = boundChecks.every(check => {
      const answer = z.object({ type: z.literal('noul'), noul: probability }).safeParse(raw[`${location.target}${check}`])
      return answer.success && (check === 'Association' ? answer.data.noul >= 0.99 : answer.data.noul <= 0.01)
    })
    return passes ? { ...location, status: 'shown' } : { ...location, reason: 'verification' }
  })
}
