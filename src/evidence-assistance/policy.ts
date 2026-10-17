import { z } from 'zod'
import { bounds, versions, type Findings, type NativeCapture, type SelectedEvidence, type StageRequest, type PreparedPage } from './contract'

const categories = {
  identity: 'Applicant identity evidence naming a person', business: 'Business registration or business evidence',
  financial: 'Revenue and expense summary', stock: 'Stock purchase plan', equipment: 'Equipment supplier quotation',
  other: 'Another document category', mixed: 'Mixed document categories', uncertain: 'Cannot determine',
}
const support = {
  consistent: 'The printed applicant name appears consistent with the declaration',
  different: 'A readable printed applicant name appears different from the declaration',
  not_found: 'Applicant name not found anywhere in the checked original page',
  conflict: 'Conflicting applicant name entries are printed in the checked original page', uncertain: 'Cannot determine',
}
export const readabilityLevels = ['Relevant text unreadable', 'Partly readable with obscured details', 'Relevant text and digits clearly readable']

export function makeRequest(selection: SelectedEvidence, image: PreparedPage, runId: string): StageRequest {
  const common = ['source.hash', 'raster.rasterHash', 'selectedPages', 'versions']
  const dependencies: StageRequest['dependencies'] = {
    category: [...common], readability: [...common], namePresence: [...common],
  }
  const questions: StageRequest['questions'] = {
    category: { type: 'choice', instructions: 'What is the apparent document category of the complete original page in `page`?', criteria: categories },
    readability: { type: 'score', instructions: 'How readable are the relevant text and digits, especially the printed applicant name, on the complete original page in `page`?', criteria: readabilityLevels },
    namePresence: { type: 'noul', instructions: 'Does the complete original page in `page` contain a printed applicant name, regardless of agreement with `declaredApplicantName`? A different name still counts as present.' },
  }
  if (selection.declaration.status === 'valid') {
    questions.nameSupport = { type: 'choice', instructions: 'How does the printed applicant name on the complete original page in `page` support `declaredApplicantName`? Inspect all name occurrences, retaining conflicting entries. Do not authenticate identity or transcribe the name.', criteria: support }
    // Shared state is visible to every question, so all answers depend on the declaration.
    dependencies.nameSupport = [...common]
  }
  for (const question of Object.keys(dependencies)) dependencies[question].push('declaration.fullName', 'declaration.status')
  const request: StageRequest = {
    runId, stage: 'combined-page-declaration', model: versions.model,
    plan: { maximumAttempts: 2, stages: ['combined-page-declaration', 'bound-verification'], verification: 'reserved-not-enabled' },
    state: { page: 'original-page-1', declaredApplicantName: selection.declaration.fullName },
    image, questions, versions, dependencies,
  }
  const metadata = new TextEncoder().encode(JSON.stringify({ ...request, image: { ...image, bytes: undefined } })).byteLength
  if (metadata > bounds.contextBytes || metadata + Math.ceil(image.bytes.byteLength / 3) * 4 > bounds.bodyBytes) throw new Error('context-limit')
  return request
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
  const findings: Findings = { category: 'unavailable', readability: 'unavailable', namePresence: 'unavailable', nameSupport: selection.declaration.status === 'valid' ? 'unavailable' : 'missing-context' }
  for (const [key, criteria] of [['category', categories], ['nameSupport', support]] as const) {
    if (key === 'nameSupport' && selection.declaration.status !== 'valid') continue
    const answer = choice.safeParse(parsed.data.answers[key])
    if (answer.success && distribution(answer.data.probabilities, Object.keys(criteria)) && answer.data.choice in criteria && answer.data.probabilities[answer.data.choice] === Math.max(...Object.values(answer.data.probabilities))) {
      native.answers[key] = answer.data
    }
  }
  const readable = score.safeParse(parsed.data.answers.readability)
  if (readable.success && distribution(readable.data.probabilities, ['0', '1', '2']) && readabilityLevels.every((level, i) => readable.data.legend[i] === level) && Math.abs(readable.data.score - Object.entries(readable.data.probabilities).reduce((sum, [level, probability]) => sum + Number(level) * probability, 0)) < 0.0001) native.answers.readability = readable.data
  const presence = noul.safeParse(parsed.data.answers.namePresence)
  if (presence.success) native.answers.namePresence = presence.data
  if (!Object.keys(native.answers).length) throw new Error('invalid-response')
  const category = native.answers.category
  if (category) findings.category = category.confidence >= 0.99 && category.choice !== 'uncertain' ? category.choice as Findings['category'] : 'undetermined'
  const readability = native.answers.readability
  if (readability) {
    const levels = Object.entries(readability.probabilities).sort((a, b) => b[1] - a[1])
    findings.readability = levels[0][1] >= 0.99 && levels[0][1] > levels[1][1] ? (['unreadable', 'partial', 'clear'] as const)[Number(levels[0][0])] : 'undetermined'
  }
  const usable = findings.category === 'identity' && findings.readability === 'clear'
  if (native.answers.namePresence) findings.namePresence = native.answers.namePresence.noul >= 0.99 ? 'present' : native.answers.namePresence.noul <= 0.01 && usable ? 'absent' : 'undetermined'
  const comparison = native.answers.nameSupport
  if (comparison) {
    findings.nameSupport = 'undetermined'
    if (usable && comparison.confidence >= 0.99 && comparison.choice !== 'uncertain') {
      if (comparison.choice === 'not_found' && findings.namePresence === 'absent') findings.nameSupport = 'not_found'
      else if (comparison.choice !== 'not_found' && findings.namePresence === 'present') findings.nameSupport = comparison.choice as Findings['nameSupport']
    }
  }
  return { native, findings, partial: Object.values(findings).includes('unavailable') }
}
