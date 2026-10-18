import { expect, test } from 'vitest'
import { createJevWorkflow } from '../../src/live-assistance/jev'
import { createLiveService } from '../../src/live-assistance/service'
import { createAdmission } from '../../src/live-assistance/admission'
import { input, memoryStore } from './fixtures'
import { nativeIdentity } from '../browser/evidence-transport'
import { locatedIdentity, providerRequest, verifiedBounds } from './provider'
import { interpret } from '../../src/evidence-assistance/policy'
import { validateRequest } from '../../src/live-assistance/request'
import { stageRequest } from './fixtures'

const serviceWith = (fetch: (url: string, init?: RequestInit) => Promise<Response>) => createLiveService({
  admission: createAdmission(memoryStore(), 'dummy-key-with-at-least-thirty-two-bytes'), authorize: async () => 'guest', execute: createJevWorkflow({ apiKey: 'dummy-no-provider-access', fetch }),
})

test('an admitted request reaches the real SDK and retains native and mapped judgments', async () => {
  let calls = 0
  let transportError: unknown
  const service = createLiveService({
    admission: createAdmission(memoryStore(), 'dummy-key-with-at-least-thirty-two-bytes'), authorize: async () => 'guest',
    execute: createJevWorkflow({ apiKey: 'dummy-no-provider-access', fetch: async (url, init) => {
      calls++
      try {
      expect(url).toBe('https://api.typesafe.ai/v1/systemone')
      expect(new Headers(init?.headers).get('TypeSafe-Danger-Zone-Images')).toBe('true')
      expect(new Headers(init?.headers).has('TypeSafe-Danger-Zone-Long-Context')).toBe(false)
      const form = await new Response(init?.body, { headers: init?.headers }).formData()
      const request = JSON.parse(form.get('request') as string)
      expect(request.model).toBe('jev-1.14.0')
      expect(request.questions.fullNameBox.type).toBe('box')
      expect(request.questions.namePresence.type).toBe('noul')
      expect(Object.keys(request.assets)).toHaveLength(1)
      expect(request.state.declaredApplicantName).toBe('Fictional Person')
      return Response.json(nativeIdentity(), { headers: { 'x-typesafe-request-id': 'fake-response-1' } })
      } catch (error) { transportError = error; throw error }
    } }),
  })
  const reply = await service({ body: Buffer.from(JSON.stringify(input())), network: '192.0.2.1' })
  expect(calls, JSON.stringify(reply.body)).toBe(1)
  expect(transportError).toBeUndefined()
  expect(reply.body).toMatchObject({ status: 'completed', stages: [{ answer: {
    answers: { readability: { score: 1.995 }, namePresence: { noul: 0.999 } },
    responseId: 'fake-response-1', usage: { input_tokens: 2500, output_tokens: 40 },
    bridge: { requestedModel: 'jev-1.14.0', mapped: { namePresence: { type: 'boolean', value: true, probability: 0.999 }, readability: { value: 'Relevant text and digits clearly readable', score: 1.995 } } },
  } }] })
  expect(calls).toBe(1)
})

test('native Box capture stays outside the mapped answers and binds one verification request', async () => {
  const sent: Awaited<ReturnType<typeof providerRequest>>[] = []
  const service = createLiveService({ admission: createAdmission(memoryStore(), 'dummy-key-with-at-least-thirty-two-bytes'), authorize: async () => 'guest',
    execute: createJevWorkflow({ apiKey: 'dummy-no-provider-access', fetch: async (_url, init) => {
      const request = await providerRequest(init); sent.push(request)
      return Response.json(sent.length === 1 ? { ...nativeIdentity(), answers: { ...nativeIdentity().answers, ...locatedIdentity() } } : verifiedBounds(request))
    } }),
  })
  const reply = await service({ body: Buffer.from(JSON.stringify(input())), network: '192.0.2.1' })
  expect(reply.body.status).toBe('completed')
  if (reply.body.status !== 'completed') throw Error('missing stages')
  expect(reply.body.stages.map(stage => stage.stage)).toEqual(['combined-page-declaration', 'bound-verification'])
  expect(reply.body.stages[0].answer).toMatchObject({ answers: { fullNameBox: { confidence: null } } })
  const first = reply.body.stages[0].answer as { bridge: { mapped: Record<string, unknown> } }
  expect(first.bridge.mapped).not.toHaveProperty('fullNameBox')
  expect(Object.keys(sent[1].assets)).toHaveLength(2)
  expect(Object.keys(sent[1].questions)).toHaveLength(6)
  expect(sent[1].state.regions).toMatchObject([{ target: 'fullName', cropHash: expect.stringMatching(/^[a-f0-9]{64}$/), originalBoundary: { left: 28.42, right: 84.14, top: 56.14, bottom: 70.14 } }])
})

test('nullable and malformed answers preserve independent findings and never borrow mapped display policy', async () => {
  const service = serviceWith(async () => Response.json({ ...nativeIdentity(), answers: {
    ...nativeIdentity().answers, category: null, namePresence: { type: 'noul', noul: 0.6 },
    readability: { type: 'score', score: 1, confidence: 0, legend: nativeIdentity().answers.readability.legend, probabilities: { '0': 0.5, '1': 0, '2': 0.5 } },
    fullNameBox: { type: 'box', box: { left: 0.8, right: 0.2, top: 0.1, bottom: 0.3 }, confidence: null },
  } }))
  const body = input(), reply = await service({ body: Buffer.from(JSON.stringify(body)), network: '192.0.2.1' })
  expect(reply.body.status).toBe('completed')
  if (reply.body.status !== 'completed') throw Error('missing result')
  const validated = await validateRequest(Buffer.from(JSON.stringify(body)), new AbortController().signal)
  const stage = stageRequest(validated)
  const selection = { source: { id: '', name: '', mime: 'image/png', hash: '', bytes: stage.image.bytes }, binding: { datasetId: '', applicationId: '', slot: 'identity' as const, audience: 'applicant' as const, context: 'draft' as const, contextId: '', roundId: null, authorityGeneration: 0, sharedRevision: 0, workspaceRevision: 0, dependencyKey: '', durable: false }, declaration: { fullName: 'Fictional Person', status: 'valid' as const } }
  const result = interpret(reply.body.stages[0].answer, selection)
  expect(result.findings).toMatchObject({ category: 'unavailable', readability: 'undetermined', namePresence: 'undetermined' })
  expect(result.native.bridge?.mapped).toMatchObject({ namePresence: { value: true, probability: 0.6 }, readability: { value: 'Partly readable with obscured details', probability: 0 } })
  expect(result.native.bridge?.invalidAnswers).toContain('fullNameBox')
  expect(result.native.answers.nameSupport?.choice).toBe('different')
})

test('unreported verification usage consumes dispatch, stops work and returns the earlier page', async () => {
  let calls = 0
  const service = serviceWith(async () => {
    calls++
    return Response.json(calls === 1 ? { ...nativeIdentity(), answers: { ...nativeIdentity().answers, ...locatedIdentity() } } : { ...nativeIdentity(), usage: { input_tokens: null, output_tokens: 1 } })
  })
  const reply = await service({ body: Buffer.from(JSON.stringify(input())), network: '192.0.2.1' })
  expect(reply.body).toMatchObject({ status: 'completed', stoppedReason: 'accounting-unavailable', stages: [{ stage: 'combined-page-declaration' }] })
  if (reply.body.status === 'completed') expect(reply.body.stages).toHaveLength(1)
  expect(calls).toBe(2)
})

test('provider failures and context overflow cannot trigger SDK retries, splitting or fallback', async () => {
  for (const status of [400, 503]) {
    let calls = 0
    const service = serviceWith(async () => { calls++; return Response.json({ error: { message: 'context length exceeded' } }, { status }) })
    const reply = await service({ body: Buffer.from(JSON.stringify(input())), network: '192.0.2.1' })
    expect(reply.body).toEqual({ status: 'unavailable', reason: status === 400 ? 'context-limit' : 'service-unavailable', dispatched: [{ stage: 'combined-page-declaration', page: 1 }] })
    expect(calls).toBe(1)
  }
})

test('concurrent requests keep response IDs, judgments and usage in their own invocation', async () => {
  let release: () => void = () => undefined, arrived: () => void = () => undefined
  const waiting = new Promise<void>(resolve => { release = resolve }), entered = new Promise<void>(resolve => { arrived = resolve })
  const store = memoryStore()
  const service = createLiveService({ admission: createAdmission(store, 'dummy-key-with-at-least-thirty-two-bytes'), authorize: async authorization => authorization!, execute: createJevWorkflow({ apiKey: 'dummy-no-provider-access', fetch: async (_url, init) => {
    const body = await providerRequest(init), first = body.state.declaredApplicantName === 'First Fictional'
    if (first) { arrived(); await waiting }
    return Response.json({ ...nativeIdentity(), usage: { input_tokens: first ? 101 : 202, output_tokens: 3 }, answers: { namePresence: { type: 'noul', noul: first ? 0.2 : 0.8 } } }, { headers: { 'x-typesafe-request-id': first ? 'first' : 'second' } })
  } }) })
  const call = (fullName: string, authorization: string) => service({ body: Buffer.from(JSON.stringify({ ...input(), declaration: { fullName, status: 'valid' }, runId: `${new Date().toISOString().slice(0, 10)}.${crypto.randomUUID()}` })), network: '192.0.2.1', authorization })
  const first = call('First Fictional', 'first-guest'); await entered
  const second = await call('Second Fictional', 'second-guest'); release()
  const replies = [await first, second]
  expect(replies.map(reply => reply.body.status === 'completed' ? reply.body.stages[0].answer : null)).toMatchObject([
    { responseId: 'first', answers: { namePresence: { noul: 0.2 } }, usage: { input_tokens: 101 }, bridge: { mapped: { namePresence: { probability: 0.2 } } } },
    { responseId: 'second', answers: { namePresence: { noul: 0.8 } }, usage: { input_tokens: 202 }, bridge: { mapped: { namePresence: { probability: 0.8 } } } },
  ])
})

test('cancellation during crop preprocessing prevents a late verification dispatch', async () => {
  let calls = 0
  const abort = new AbortController()
  const service = serviceWith(async () => {
    calls++
    setTimeout(() => abort.abort(), 5)
    return Response.json({ ...nativeIdentity(), answers: { ...nativeIdentity().answers, ...locatedIdentity() } })
  })
  const reply = await service({ body: Buffer.from(JSON.stringify(input())), network: '192.0.2.1', signal: abort.signal })
  expect(reply.body).toMatchObject({ status: 'completed', stoppedReason: 'run-stopped', stages: [{ stage: 'combined-page-declaration' }] })
  await new Promise(resolve => setTimeout(resolve, 50))
  expect(calls).toBe(1)
})

test('unknown usage blocks fresh guests and revisions after leases expire until accounting is reconciled', async () => {
  const store = memoryStore()
  let now = Date.now(), calls = 0
  const workflow = createJevWorkflow({ apiKey: 'dummy-no-provider-access', fetch: async () => { calls++; return Response.json({ ...nativeIdentity(), usage: null }) } })
  const makeService = () => createLiveService({ admission: createAdmission(store, 'dummy-key-with-at-least-thirty-two-bytes'), authorize: async auth => auth!, now: () => now, execute: workflow })
  const body = Buffer.from(JSON.stringify(input()))
  expect((await makeService()({ body, network: '192.0.2.1', authorization: 'first' })).body).toMatchObject({ status: 'unavailable', reason: 'accounting-unavailable' })
  now += 120_000
  expect((await makeService()({ body, network: '192.0.2.2', authorization: 'fresh' })).body).toEqual({ status: 'unavailable', reason: 'accounting-unavailable' })
  expect(calls).toBe(1)
})

test('a transport failure blocks a different guest immediately while its connection lease is still live', async () => {
  const store = memoryStore()
  let calls = 0
  const workflow = createJevWorkflow({ apiKey: 'dummy-no-provider-access', fetch: async () => { calls++; throw new Error('Unknown remote outcome') } })
  const service = createLiveService({ admission: createAdmission(store, 'dummy-key-with-at-least-thirty-two-bytes'), authorize: async auth => auth!, execute: workflow })
  const body = Buffer.from(JSON.stringify(input()))
  expect((await service({ body, network: '192.0.2.1', authorization: 'first' })).body).toMatchObject({ status: 'unavailable', reason: 'service-unavailable' })
  expect((await service({ body, network: '192.0.2.2', authorization: 'fresh' })).body).toEqual({ status: 'unavailable', reason: 'accounting-unavailable' })
  expect(calls).toBe(1)
})

test('the same PNG and run ID cannot reuse analysis after its admitted manifest changes', async () => {
  let calls = 0
  const service = serviceWith(async () => { calls++; return Response.json(nativeIdentity()) })
  const body = input(), validated = await validateRequest(Buffer.from(JSON.stringify(body)), new AbortController().signal)
  const pages = [{ ...body.pages[0], manifest: validated.pages[0].manifest }]
  expect((await service({ body: Buffer.from(JSON.stringify({ ...body, pages })), network: '192.0.2.1' })).body.status).toBe('completed')
  pages[0].manifest = { ...pages[0].manifest, sourceHash: 'f'.repeat(64) }
  expect((await service({ body: Buffer.from(JSON.stringify({ ...body, pages })), network: '192.0.2.1' })).body).toEqual({ status: 'unavailable', reason: 'run-conflict' })
  expect(calls).toBe(1)
})
