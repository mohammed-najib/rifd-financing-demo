import { boolean, choice, decide, score, type EvaluateAdapter, type WireAnswer, type WireQuestion } from '@tanstack/ai'
import { APIError, TypeSafeClient, box, image, choice as nativeChoice, score as nativeScore, noul, type Questions, type ScoreCriteria } from '@typesafe-ai/sdk'
import { z } from 'zod'
import { bounds, versions, type StageRequest } from '../evidence-assistance/contract'
import { envelope, reportedUsage, validatedAnswer } from '../evidence-assistance/policy'
import { LiveStop } from './admission'

export function jevBridge(options: { apiKey: string; fetch?: (url: string, init?: RequestInit) => Promise<Response> }) {
  const client = new TypeSafeClient({
    apiKey: options.apiKey, baseURL: 'https://api.typesafe.ai', defaultModel: versions.model,
    logLevel: 'off', compression: false, retry: { maxRetries: 0 }, timeout: bounds.pageMilliseconds,
    defaultHeaders: { 'TypeSafe-Danger-Zone-Images': 'true' }, fetch: options.fetch,
  })
  return async (request: StageRequest, signal: AbortSignal) => {
    signal.throwIfAborted()
    const questions: Record<string, WireQuestion> = {}, nativeQuestions: Questions = {}
    for (const [key, question] of Object.entries(request.questions)) {
      if (question.type === 'box') nativeQuestions[key] = box(question.instructions)
      else if (question.type === 'choice') {
        questions[key] = choice({ instructions: question.instructions, options: question.criteria })
        nativeQuestions[key] = nativeChoice(question.instructions, question.criteria)
      } else if (question.type === 'score') {
        questions[key] = score({ instructions: question.instructions, levels: question.criteria })
        nativeQuestions[key] = nativeScore(question.instructions, question.criteria as unknown as ScoreCriteria)
      } else {
        questions[key] = boolean({ instructions: question.instructions })
        nativeQuestions[key] = noul(question.instructions)
      }
    }
    const assets = new Map<string, ReturnType<typeof image>>()
    for (const page of [request.image, ...(request.images ?? [])]) assets.set(`original-page-${page.manifest.page}`, image(page.bytes))
    for (const crop of request.crops ?? []) assets.set(`bound-crop-${crop.binding.target}`, image(crop.bytes))
    // Each image occurs once in shared state. Instructions use the named path.
    const state = { ...request.state, page: assets.get(request.state.page)!,
      ...(request.state.pages ? { pages: request.state.pages.map(path => assets.get(path)!) } : {}),
      ...(request.state.cropImages ? { cropImages: request.state.cropImages.map(path => assets.get(path)!) } : {}),
    }
    // Comparison's parent page already occurs in pages. Reference it by path.
    if (request.state.pages) Object.assign(state, { page: 'pages[0]' })
    let capture: ReturnType<typeof envelope.parse> | undefined
    const invalidAnswers: string[] = []
    const adapter: EvaluateAdapter = {
      kind: 'evaluate', name: 'rifd-fixed-jev', model: versions.model, '~types': { providerOptions: {} },
      async evaluate(evaluation) {
        evaluation.logger.request('Fixed evidence evaluation')
        try {
          signal.throwIfAborted()
          const dispatchedAt = new Date().toISOString()
          const response = await client.systemOne({ model: versions.model, state, questions: nativeQuestions }, { signal, retry: { maxRetries: 0 }, timeout: bounds.pageMilliseconds }).withResponse()
          if (!reportedUsage.safeParse(response.data?.usage).success) throw new LiveStop('accounting-unavailable')
          const parsed = envelope.safeParse(response.data)
          if (!parsed.success) throw new LiveStop('invalid-response')
          capture = { ...parsed.data, ...(response.requestId ? { responseId: response.requestId } : {}), bridge: { requestedModel: versions.model, dispatchedAt, answeredAt: new Date().toISOString(), mapped: {}, invalidAnswers, state: request.state } }
          const answers: Record<string, WireAnswer> = {}
          for (const [key, question] of Object.entries(request.questions)) {
            const answer = validatedAnswer(question, capture.answers[key])
            if (!answer) invalidAnswers.push(key)
            // Mapping supports only independently valid Choice/Score/Noul answers.
            // This question map belongs to this invocation, never another request.
            if (question.type !== 'box') {
              if (answer && answer.type !== 'box') answers[key] = answer
              else delete questions[key]
            }
          }
          const { input_tokens: inputTokens, output_tokens: outputTokens } = capture.usage
          return { model: capture.model, answers, usage: { promptTokens: inputTokens, completionTokens: outputTokens, totalTokens: inputTokens + outputTokens }, ...(capture.responseId ? { id: capture.responseId } : {}) }
        } catch (error) {
          evaluation.logger.errors('Fixed evidence evaluation unavailable')
          if (error instanceof LiveStop) throw error
          if (error instanceof APIError && error.status === 400 && /context/i.test(JSON.stringify(error.body))) throw new LiveStop('context-limit')
          throw new LiveStop('service-unavailable')
        }
      },
    }
    const mapped = await decide({ adapter, state: request.state, questions, abortSignal: signal, debug: false })
    signal.throwIfAborted()
    if (!capture?.bridge) throw new LiveStop('invalid-response')
    capture.bridge.mapped = z.record(z.string(), z.json()).parse(Object.fromEntries(Object.entries(mapped).filter(([key]) => key !== 'meta')))
    return capture
  }
}
