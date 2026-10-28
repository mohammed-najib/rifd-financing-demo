import { readLocations, addLocationQuestions, boxSchema } from '../preparation/locations'
import { bridgeSchema } from '../preparation/capture'
import { z } from 'zod'
import { bounds, versions, evidenceTargets, financialPageTargets, declaredDetail, type Findings, type NativeCapture, type SelectedEvidence, type StageRequest, type PreparedPage, type AttemptPlan, type Coverage, type PageAnalysis, type ComparisonAnalysis, type SupportKey, type PresenceKey } from '../contract'

const categories = {
  identity: 'Applicant identity evidence naming a person', business: 'Business registration or business evidence',
  financial: 'Revenue and expense summary', stock: 'Stock purchase plan', equipment: 'Equipment supplier quotation',
  other: 'Another document category', mixed: 'Mixed document categories', uncertain: 'Cannot determine',
}
// The question names the field once. Repeating its long name in every choice
// wastes the bounded metadata budget, especially with correction context.
const support = {
  consistent: 'Every readable printed value for this field agrees with the declaration, with no conflicting entries',
  different: 'A readable printed value differs from the declaration, with no conflicting printed entries',
  not_found: 'This field is not printed anywhere in the checked original pages',
  conflict: 'Incompatible printed values for this field, including when one agrees with the declaration',
  uncertain: 'Cannot determine, including ambiguous repeated-field associations',
}
export const readabilityLevels = ['Relevant text unreadable', 'Partly readable with obscured details', 'Relevant text and digits clearly readable']

export function attemptPlan(totalPages: number, selected: number[]): AttemptPlan {
  const stages = totalPages === 1 ? ['combined-page-declaration', 'bound-verification'] : [...selected.map(page => `page:${page}`), 'document-comparison', ...selected.map(page => `bound-verification:${page}`)]
  return { maximumAttempts: stages.length, stages, verification: 'lossless-boundary-pad-v1' }
}

export function makeRequest(selection: SelectedEvidence, image: PreparedPage, runId: string, plan = attemptPlan(image.totalPages, [image.manifest.page]), images?: PreparedPage[]): StageRequest {
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
      questions[target.support] = { type: 'choice', instructions: `How does the printed ${target.name} on the complete original page in \`page\` support \`${target.statePath}\`? Inspect all occurrences, retaining repeated or incompatible entries. Do not select a matching entry while ignoring another, transcribe values, authenticate identity or determine operating history or eligibility.${selection.declaration.purchase ? ' Use `declaredPurchase.product`: inventory expects a stock purchase plan, equipment expects an equipment supplier quotation. Compare only the description or printed total budget, without itemized analysis, arithmetic, product purpose fit or financing budget coverage decisions.' : ''}`, criteria: support }
      dependencies[target.support] = [...common]
    }
  }
  if (selection.declaration.financial) {
    for (const target of financialPageTargets) {
      questions[target.presence] = { type: 'noul', instructions: `Does the original page in \`page\` contain the printed ${target.name}? The three expected months in order are in \`declaredFinancial.expectedMonths\`. A different value counts as present. Do not calculate or transcribe figures.` }
      dependencies[target.presence] = [...common]
    }
    questions.periodSupport = { type: 'choice', instructions: 'How does the printed reporting period support the three completed months in `declaredFinancial.expectedMonths`? Inspect all printed periods and retain incompatible entries.' + (image.totalPages > 1 && !images ? ' This page may contain only a subset of the expected months. A table for one expected month is compatible, not a different reporting period. Consider only dates associated with the financial figures.' : ''), criteria: image.totalPages > 1 && !images ? pagePeriodCriteria : periodCriteria }
    dependencies.periodSupport = [...common]
    for (const target of targets) if (questions[target.support]) questions[target.support].instructions += ' Compare only explicitly printed averages associated with `declaredFinancial.expectedMonths`. If only monthly figures appear, choose uncertain. Do not calculate averages, transcribe figures or infer arithmetic.'
  }
  addLocationQuestions(selection.binding.slot, questions, dependencies, common)
  // Every question sees the shared declarations, even source-only judgments.
  for (const question of Object.keys(dependencies)) {
    for (const target of targets) {
      const path = `declaration.${selection.declaration.purchase ? 'purchase' : selection.declaration.financial ? 'financial' : 'business'}.${target.field}`
      dependencies[question].push(...(target.field === 'fullName' ? ['declaration.fullName', 'declaration.status'] : [`${path}.value`, `${path}.status`]))
    }
    if (selection.declaration.financial) dependencies[question] = ['source', 'raster', 'coverage', 'versions', 'declaration']
    if (selection.declaration.purchase) dependencies[question].push('declaration.purchase.product')
    if (selection.correction) dependencies[question].push('correction')
  }
  const state: StageRequest['state'] = { page: `original-page-${image.manifest.page}`, ...(selection.correction ? { correction: selection.correction } : {}) }
  if (selection.declaration.purchase) state.declaredPurchase = { product: selection.declaration.purchase.product, explanation: selection.declaration.purchase.explanation.value, budget: selection.declaration.purchase.budget.value }
  else if (selection.declaration.business) state.declaredBusiness = { businessName: selection.declaration.business.businessName.value, address: selection.declaration.business.address.value, operatingSince: selection.declaration.business.operatingSince.value }
  else if (selection.declaration.financial) { const financial = selection.declaration.financial; state.declaredFinancial = { initialSubmissionMonth: financial.initialSubmissionMonth, expectedMonths: financial.expectedMonths, revenue: financial.revenue.value, expenses: financial.expenses.value } }
  else state.declaredApplicantName = selection.declaration.fullName
  const request: StageRequest = {
    runId, stage: images ? 'document-comparison' : image.totalPages === 1 ? 'combined-page-declaration' : 'page', model: versions.model,
    plan,
    state, image, ...(images ? { images: images.slice(1) } : {}), questions, versions, dependencies,
  }
  if (images) {
    state.page = 'pages[0]'
    state.pages = images.map(page => `original-page-${page.manifest.page}`)
    for (const key of Object.keys(questions)) if (!key.endsWith('Support')) { delete questions[key]; delete dependencies[key] }
    for (const question of Object.values(questions)) question.instructions = question.instructions.replaceAll('on the complete original page in `page`', 'across all original pages in `pages`').replaceAll('checked original page', 'checked original pages').replaceAll('printed reporting period', 'reporting periods across all original pages in `pages`')
  }
  if (Object.keys(questions).length > (images ? 4 : 32)) throw new Error('context-limit')
  const assets = images ?? [image]
  const totalBytes = assets.reduce((sum, page) => sum + page.bytes.byteLength, 0), pixels = assets.reduce((sum, page) => sum + page.manifest.width * page.manifest.height, 0)
  if (totalBytes > bounds.combinedBytes || pixels > bounds.combinedPixels) throw new Error('context-limit')
  const metadata = new TextEncoder().encode(JSON.stringify({ ...request, image: undefined, images: undefined, rasters: assets.map(page => page.manifest) })).byteLength
  if (metadata > bounds.contextBytes || metadata + assets.reduce((sum, page) => sum + Math.ceil(page.bytes.byteLength / 3) * 4, 0) > bounds.bodyBytes) throw new Error('context-limit')
  return request
}

export function recordRequest(request: StageRequest): Omit<StageRequest, 'image' | 'images' | 'crops'> {
  return { runId: request.runId, stage: request.stage, model: request.model, plan: request.plan, state: request.state, questions: request.questions, versions: request.versions, dependencies: request.dependencies }
}

const pagePeriodCriteria = { consistent: 'The printed reporting period or monthly table covers only expected months; other expected months may appear on other original pages', different: 'The printed reporting period or monthly table includes a month outside the expected period', not_found: 'No printed reporting period or month associated with the financial figures on this original page', conflict: 'Incompatible reporting periods are printed on this original page', uncertain: 'Cannot determine the reporting period or its association with the figures' }

const periodCriteria = { consistent: 'All readable printed reporting periods cover exactly the expected three completed months', different: 'A readable printed reporting period covers different months', not_found: 'No printed reporting period in the checked original pages', conflict: 'Incompatible reporting periods in the checked original pages', uncertain: 'Cannot determine the reporting period' }

const probability = z.number().min(0).max(1)
const choice = z.object({ type: z.literal('choice'), choice: z.string(), confidence: probability, probabilities: z.record(z.string(), probability) })
const score = z.object({ type: z.literal('score'), score: z.number().min(0).max(2), confidence: probability, probabilities: z.record(z.string(), probability), legend: z.record(z.string(), z.string()) })
const noul = z.object({ type: z.literal('noul'), noul: probability })
export const reportedUsage = z.object({ input_tokens: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), output_tokens: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER) })
export const envelope = z.object({ model: z.literal(versions.model), answers: z.record(z.string(), z.unknown()), usage: reportedUsage, responseId: z.string().optional(), bridge: bridgeSchema.optional() })
const distribution = (probabilities: Record<string, number>, keys: string[]) => Object.keys(probabilities).length === keys.length && keys.every(key => key in probabilities) && Math.abs(Object.values(probabilities).reduce((a, b) => a + b, 0) - 1) < 0.0001
function validChoice(raw: unknown, criteria: Record<string, string>) {
  const answer = choice.safeParse(raw).data
  return answer && distribution(answer.probabilities, Object.keys(criteria)) && Object.hasOwn(criteria, answer.choice) && answer.probabilities[answer.choice] === Math.max(...Object.values(answer.probabilities)) ? answer : undefined
}
function validScore(raw: unknown, levels: string[]) {
  const answer = score.safeParse(raw).data
  return answer && distribution(answer.probabilities, levels.map((_, index) => String(index))) && levels.every((level, index) => answer.legend[index] === level) && Math.abs(answer.score - Object.entries(answer.probabilities).reduce((sum, [level, probability]) => sum + Number(level) * probability, 0)) < 0.0001 ? answer : undefined
}

// Validate against the actual fixed question before TanStack maps an answer.
// Invalid answers remain in the native capture for provenance, never policy.
export function validatedAnswer(question: StageRequest['questions'][string], raw: unknown) {
  if (question.type === 'box') return boxSchema.safeParse(raw).data
  if (question.type === 'noul') return noul.safeParse(raw).data
  if (question.type === 'choice') return validChoice(raw, question.criteria)
  return validScore(raw, question.criteria)
}

export function interpret(raw: unknown, selection: SelectedEvidence, basis?: Findings): { native: NativeCapture; findings: Findings; partial: boolean } {
  const parsed = envelope.safeParse(raw)
  if (!parsed.success) throw new Error('invalid-response')
  const native: NativeCapture = { ...parsed.data, receivedAnswers: parsed.data.answers, answers: {}, ...(!basis ? { locations: readLocations(parsed.data.answers, selection.binding.slot) } : {}) }
  const findings: Findings = { category: basis?.category ?? 'unavailable', readability: basis?.readability ?? 'unavailable' }
  const targets = evidenceTargets(selection.binding.slot)
  const readChoice = (key: 'category' | SupportKey, criteria: Record<string, string>) => {
    const answer = validChoice(parsed.data.answers[key], criteria)
    if (answer) native.answers[key] = answer
  }
  if (!basis) readChoice('category', categories)
  for (const target of targets) {
    findings[target.presence] = basis?.[target.presence] ?? 'unavailable'
    const applicable = declaredDetail(selection.declaration, target).status === 'valid'
    findings[target.support] = applicable ? 'unavailable' : 'missing-context'
    if (applicable) readChoice(target.support, support)
    const presence = noul.safeParse(basis ? undefined : parsed.data.answers[target.presence])
    if (presence.success) native.answers[target.presence] = presence.data
  }
  if (selection.declaration.financial) {
    readChoice('periodSupport', periodCriteria)
    for (const target of financialPageTargets) {
      findings[target.presence] ??= basis?.[target.presence] ?? 'unavailable'
      const presence = noul.safeParse(basis ? undefined : parsed.data.answers[target.presence])
      if (presence.success) native.answers[target.presence] = presence.data
    }
    findings.periodSupport = 'unavailable'
  }
  const readable = validScore(basis ? undefined : parsed.data.answers.readability, readabilityLevels)
  if (readable) native.answers.readability = readable
  if (!Object.keys(native.answers).length) throw new Error('invalid-response')
  const category = native.answers.category
  if (category) findings.category = category.confidence >= 0.99 && category.choice !== 'uncertain' ? category.choice as Findings['category'] : 'undetermined'
  const readability = native.answers.readability
  if (readability) {
    const levels = Object.entries(readability.probabilities).sort((a, b) => b[1] - a[1])
    findings.readability = levels[0][1] >= 0.99 && levels[0][1] > levels[1][1] ? (['unreadable', 'partial', 'clear'] as const)[Number(levels[0][0])] : 'undetermined'
  }
  const expectedCategory = selection.declaration.purchase ? selection.declaration.purchase.product === 'inventory' ? 'stock' : 'equipment' : selection.binding.slot
  const usable = findings.category === expectedCategory && findings.readability === 'clear'
  if (selection.declaration.financial) {
    for (const target of financialPageTargets) {
      const presence = native.answers[target.presence]
      if (presence) findings[target.presence] = presence.noul >= 0.99 ? 'present' : presence.noul <= 0.01 && usable ? 'absent' : 'undetermined'
    }
    const period = native.answers.periodSupport
    if (period) findings.periodSupport = usable && period.confidence >= 0.99 && period.choice !== 'uncertain' && (period.choice === 'not_found' ? findings.periodPresence === 'absent' : findings.periodPresence === 'present') ? period.choice as Findings['periodSupport'] : 'undetermined'
  }
  // Period guards are applied before any amount answer, independent of JSON order.
  for (const target of targets) {
    const presence = native.answers[target.presence]
    if (presence) findings[target.presence] = presence.noul >= 0.99 ? 'present' : presence.noul <= 0.01 && usable ? 'absent' : 'undetermined'
    const comparison = native.answers[target.support]
    if (comparison) {
      findings[target.support] = 'undetermined'
      if (usable && (!selection.declaration.financial || findings.periodSupport === 'consistent') && comparison.confidence >= 0.99 && comparison.choice !== 'uncertain') {
        if (comparison.choice === 'not_found' && findings[target.presence] === 'absent') findings[target.support] = 'not_found'
        else if (comparison.choice !== 'not_found' && findings[target.presence] === 'present') findings[target.support] = comparison.choice as Findings[typeof target.support]
      }
    }
  }
  if (selection.declaration.financial && findings.periodSupport !== 'consistent') {
    for (const target of financialPageTargets) if (target.presence !== 'periodPresence' && findings[target.presence] === 'absent') findings[target.presence] = 'undetermined'
  }
  return { native, findings: orderFinancialFindings(findings), partial: Object.values(findings).includes('unavailable') }
}

// Composition uses only the current run. A comparison never fills missing pages.
export function composeFindings(selection: SelectedEvidence, coverage: Coverage, pages: PageAnalysis[], comparison?: ComparisonAnalysis): Findings {
  const complete = coverage.totalPages !== null && coverage.successful.length === coverage.totalPages && pages.length === coverage.totalPages && pages.every(page => usablePage(selection, page.findings))
  const findings: Findings = { category: pages[0]?.findings.category ?? 'unavailable', readability: pages[0]?.findings.readability ?? 'unavailable' }
  const keys = new Set(pages.flatMap(page => Object.keys(page.findings)))
  for (const key of keys) {
    if (key === 'category' || key === 'readability') continue
    const values = pages.map(page => page.findings[key as keyof Findings])
    if (key.endsWith('Presence')) findings[key as PresenceKey] = values.includes('present') ? 'present' : complete && values.every(value => value === 'absent') ? 'absent' : 'undetermined'
  }
  const supports: SupportKey[] = [...(selection.declaration.financial ? ['periodSupport' as const] : []), ...evidenceTargets(selection.binding.slot).map(target => target.support)]
  for (const key of supports) {
    const target = evidenceTargets(selection.binding.slot).find(target => target.support === key)
    if (target && declaredDetail(selection.declaration, target).status !== 'valid') { findings[key] = 'missing-context'; continue }
    const witnesses = pages.filter(page => usablePage(selection, page.findings) && page.findings[key] === 'conflict')
    const compared = comparison?.findings[key]
    const periodAllowed = !selection.declaration.financial || key === 'periodSupport' || findings.periodSupport === 'consistent'
    const periodRejected = !!selection.declaration.financial && key !== 'periodSupport' && (pages.some(page => usablePage(selection, page.findings) && ['different', 'conflict'].includes(page.findings.periodSupport ?? '')) || ['different', 'conflict'].includes(comparison?.findings.periodSupport ?? ''))
    const scopedWitness = witnesses.some(page => !selection.declaration.financial || key === 'periodSupport' || page.findings.periodSupport === 'consistent')
    if (periodRejected) findings[key] = 'undetermined'
    else if (scopedWitness || compared === 'conflict' && periodAllowed) findings[key] = 'conflict'
    else if (!complete) findings[key] = 'undetermined'
    else if (periodAllowed) findings[key] = compared ?? (coverage.totalPages === 1 ? pages[0]?.findings[key] : 'unavailable') ?? 'unavailable'
    else findings[key] = comparison ? 'undetermined' : 'unavailable'

  }
  if (pages.some(page => page.findings.category !== findings.category)) findings.category = 'mixed'
  findings.readability = (['unavailable', 'undetermined', 'unreadable', 'partial', 'clear'] as const).find(level => pages.some(page => page.findings.readability === level)) ?? 'unavailable'
  return orderFinancialFindings(findings)
}

function orderFinancialFindings(findings: Findings): Findings {
  const { category, readability, periodPresence, periodSupport, ...amounts } = findings
  return { category, readability, ...(periodPresence ? { periodPresence } : {}), ...(periodSupport ? { periodSupport } : {}), ...amounts }
}

export function usablePage(selection: SelectedEvidence, findings: Findings) {
  const category = selection.declaration.purchase ? selection.declaration.purchase.product === 'inventory' ? 'stock' : 'equipment' : selection.binding.slot
  return findings.category === category && findings.readability === 'clear'
}
