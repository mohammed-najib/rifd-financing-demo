import { z } from 'zod'
import { bounds, versions, evidenceTargets, declaredDetail, type EvidenceTarget, type Findings, type NativeCapture, type SelectedEvidence, type StageRequest, type PreparedPage } from './contract'

const categories = {
  identity: 'Applicant identity evidence naming a person', business: 'Business registration or business evidence',
  financial: 'Revenue and expense summary', stock: 'Stock purchase plan', equipment: 'Equipment supplier quotation',
  other: 'Another document category', mixed: 'Mixed document categories', uncertain: 'Cannot determine',
}
const support = (target: EvidenceTarget) => ({
  consistent: `All readable printed ${target.name} entries appear consistent with the declaration, with no incompatible entry`,
  different: `A readable printed ${target.name} appears different from the declaration, with no incompatible printed entries`,
  not_found: `The printed ${target.name} is not found anywhere in the checked original page`,
  conflict: `Incompatible ${target.name} entries are printed in the checked original page, including when one matches the declaration`,
  uncertain: 'Cannot determine, including repeated entries with ambiguous field associations',
})
export const readabilityLevels = ['Relevant text unreadable', 'Partly readable with obscured details', 'Relevant text and digits clearly readable']

export function makeRequest(selection: SelectedEvidence, image: PreparedPage, runId: string): StageRequest {
  const common = ['source.hash', 'raster.rasterHash', 'selectedPages', 'versions']
  const targets = evidenceTargets(selection.binding.slot)
  const dependencies: StageRequest['dependencies'] = { category: [...common], readability: [...common] }
  const questions: StageRequest['questions'] = {
    category: { type: 'choice', instructions: 'What is the apparent document category of the complete original page in `page`?', criteria: categories },
    readability: { type: 'score', instructions: `How readable are the relevant text and digits, especially the printed ${targets.map(target => target.name).join(', ')}, on the complete original page in \`page\`?`, criteria: readabilityLevels },
  }
  for (const target of targets) {
    questions[target.presence] = { type: 'noul', instructions: `Does the complete original page in \`page\` contain a printed ${target.name}, regardless of agreement with \`${target.statePath}\`? A different value still counts as present.` }
    dependencies[target.presence] = [...common]
    if (declaredDetail(selection.declaration, target).status === 'valid') {
      questions[target.support] = { type: 'choice', instructions: `How does the printed ${target.name} on the complete original page in \`page\` support \`${target.statePath}\`? Inspect all occurrences, retaining repeated or incompatible entries. Do not select a matching entry while ignoring another, transcribe values, authenticate identity or determine operating history or eligibility.`, criteria: support(target) }
      dependencies[target.support] = [...common]
    }
  }
  // Every question sees the shared declarations, even source-only judgments.
  for (const question of Object.keys(dependencies)) {
    for (const target of targets) dependencies[question].push(...(target.field === 'fullName' ? ['declaration.fullName', 'declaration.status'] : [`declaration.business.${target.field}.value`, `declaration.business.${target.field}.status`]))
    if (selection.correction) dependencies[question].push('correction')
  }
  const state: StageRequest['state'] = { page: 'original-page-1', ...(selection.correction ? { correction: selection.correction } : {}) }
  if (selection.declaration.business) state.declaredBusiness = { businessName: selection.declaration.business.businessName.value, address: selection.declaration.business.address.value, operatingSince: selection.declaration.business.operatingSince.value }
  else state.declaredApplicantName = selection.declaration.fullName
  const request: StageRequest = {
    runId, stage: 'combined-page-declaration', model: versions.model,
    plan: { maximumAttempts: 2, stages: ['combined-page-declaration', 'bound-verification'], verification: 'reserved-not-enabled' },
    state, image, questions, versions, dependencies,
  }
  const metadata = new TextEncoder().encode(JSON.stringify({ ...request, image: { ...image, bytes: undefined } })).byteLength
  if (metadata > bounds.contextBytes || metadata + Math.ceil(image.bytes.byteLength / 3) * 4 > bounds.bodyBytes) throw new Error('context-limit')
  return request
}

export function recordRequest(request: StageRequest): Omit<StageRequest, 'image'> {
  return { runId: request.runId, stage: request.stage, model: request.model, plan: request.plan, state: request.state, questions: request.questions, versions: request.versions, dependencies: request.dependencies }
}

const probability = z.number().min(0).max(1)
const choice = z.object({ type: z.literal('choice'), choice: z.string(), confidence: probability, probabilities: z.record(z.string(), probability) })
const score = z.object({ type: z.literal('score'), score: z.number().min(0).max(2), confidence: probability, probabilities: z.record(z.string(), probability), legend: z.record(z.string(), z.string()) })
const noul = z.object({ type: z.literal('noul'), noul: probability })
const envelope = z.object({ model: z.literal(versions.model), answers: z.record(z.string(), z.unknown()), usage: z.object({ input_tokens: z.number().int().nonnegative(), output_tokens: z.number().int().nonnegative() }), responseId: z.string().optional() })
const distribution = (probabilities: Record<string, number>, keys: string[]) => Object.keys(probabilities).length === keys.length && keys.every(key => key in probabilities) && Math.abs(Object.values(probabilities).reduce((a, b) => a + b, 0) - 1) < 0.0001

export function interpret(raw: unknown, selection: SelectedEvidence): { native: NativeCapture; findings: Findings; partial: boolean } {
  const parsed = envelope.safeParse(raw)
  if (!parsed.success) throw new Error('invalid-response')
  const native: NativeCapture = { ...parsed.data, receivedAnswers: parsed.data.answers, answers: {} }
  const findings: Findings = { category: 'unavailable', readability: 'unavailable' }
  const targets = evidenceTargets(selection.binding.slot)
  const readChoice = (key: 'category' | EvidenceTarget['support'], criteria: Record<string, string>) => {
    const answer = choice.safeParse(parsed.data.answers[key])
    if (answer.success && distribution(answer.data.probabilities, Object.keys(criteria)) && answer.data.choice in criteria && answer.data.probabilities[answer.data.choice] === Math.max(...Object.values(answer.data.probabilities))) native.answers[key] = answer.data
  }
  readChoice('category', categories)
  for (const target of targets) {
    findings[target.presence] = 'unavailable'
    const applicable = declaredDetail(selection.declaration, target).status === 'valid'
    findings[target.support] = applicable ? 'unavailable' : 'missing-context'
    if (applicable) readChoice(target.support, support(target))
    const presence = noul.safeParse(parsed.data.answers[target.presence])
    if (presence.success) native.answers[target.presence] = presence.data
  }
  const readable = score.safeParse(parsed.data.answers.readability)
  if (readable.success && distribution(readable.data.probabilities, ['0', '1', '2']) && readabilityLevels.every((level, i) => readable.data.legend[i] === level) && Math.abs(readable.data.score - Object.entries(readable.data.probabilities).reduce((sum, [level, probability]) => sum + Number(level) * probability, 0)) < 0.0001) native.answers.readability = readable.data
  if (!Object.keys(native.answers).length) throw new Error('invalid-response')
  const category = native.answers.category
  if (category) findings.category = category.confidence >= 0.99 && category.choice !== 'uncertain' ? category.choice as Findings['category'] : 'undetermined'
  const readability = native.answers.readability
  if (readability) {
    const levels = Object.entries(readability.probabilities).sort((a, b) => b[1] - a[1])
    findings.readability = levels[0][1] >= 0.99 && levels[0][1] > levels[1][1] ? (['unreadable', 'partial', 'clear'] as const)[Number(levels[0][0])] : 'undetermined'
  }
  const usable = findings.category === selection.binding.slot && findings.readability === 'clear'
  for (const target of targets) {
    const presence = native.answers[target.presence]
    if (presence) findings[target.presence] = presence.noul >= 0.99 ? 'present' : presence.noul <= 0.01 && usable ? 'absent' : 'undetermined'
    const comparison = native.answers[target.support]
    if (comparison) {
      findings[target.support] = 'undetermined'
      if (usable && comparison.confidence >= 0.99 && comparison.choice !== 'uncertain') {
        if (comparison.choice === 'not_found' && findings[target.presence] === 'absent') findings[target.support] = 'not_found'
        else if (comparison.choice !== 'not_found' && findings[target.presence] === 'present') findings[target.support] = comparison.choice as Findings[typeof target.support]
      }
    }
  }
  return { native, findings, partial: Object.values(findings).includes('unavailable') }
}
