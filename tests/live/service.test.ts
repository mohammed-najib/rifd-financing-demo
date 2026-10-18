import { expect, test } from 'vitest'
import { createLiveService } from '../../src/live-assistance/service'
import { createAdmission, type MetadataStore } from '../../src/live-assistance/admission'
import { memoryStore, input, stageRequest, native } from './fixtures'

test('direct and routed requests require guest Auth and App Check before reserving work', async () => {
  let calls = 0
  const service = createLiveService({
    admission: createAdmission(memoryStore(), 'dummy-key-with-at-least-thirty-two-bytes'),
    authorize: async (auth, app) => { if (auth !== 'Bearer dummy-auth' || app !== 'dummy-app') throw Error(); return 'guest' },
    execute: async () => { calls++ },
  })
  for (const path of ['/liveAnalysis', '/api/evidence-analysis']) {
    for (const tokens of [{}, { authorization: 'Bearer dummy-auth' }, { appCheck: 'dummy-app' }]) {
      const reply = await service({ body: Buffer.from(JSON.stringify(input())), network: '192.0.2.1', path, ...tokens })
      expect(reply.body).toEqual({ status: 'unavailable', reason: 'access-denied' })
      expect(reply.headers['Cache-Control']).toBe('private, no-store, max-age=0')
    }
  }
  expect(calls).toBe(0)
})

test('concurrent duplicate input dispatches once and completed duplicates return only status', async () => {
  let dispatches = 0
  let release: () => void = () => undefined
  const waiting = new Promise<void>(resolve => { release = resolve })
  let arrived: () => void = () => undefined
  const entered = new Promise<void>(resolve => { arrived = resolve })
  const service = createLiveService({ admission: createAdmission(memoryStore(), 'dummy-key-with-at-least-thirty-two-bytes'), authorize: async () => 'guest',
    execute: async (request, work) => {
      await work.evaluate(stageRequest(request), async () => async () => { dispatches++; arrived(); await waiting; return native })
    },
  })
  const request = { body: Buffer.from(JSON.stringify(input())), network: '192.0.2.1' }
  const first = service(request)
  await entered
  expect((await service(request)).body).toEqual({ status: 'duplicate', completion: 'active' })
  release()
  expect((await first).body).toMatchObject({ status: 'completed', stages: [{ answer: native }] })
  expect((await service(request)).body).toEqual({ status: 'duplicate', completion: 'completed' })
  expect(dispatches).toBe(1)
  expect((await service({ ...request, body: Buffer.from(JSON.stringify({ ...input(), declaration: { fullName: 'Changed Fictional', status: 'valid' } })) })).body).toEqual({ status: 'unavailable', reason: 'run-conflict' })
})

test('deadline supervision includes provider preprocessing and prevents a late dispatch', async () => {
  let dispatches = 0, finish: () => void = () => undefined
  const pending = new Promise<void>(resolve => { finish = resolve })
  const service = createLiveService({ admission: createAdmission(memoryStore(), 'dummy-key-with-at-least-thirty-two-bytes'), authorize: async () => 'guest', serverMilliseconds: 100, attemptMilliseconds: 20,
    execute: async (request, work) => { await work.evaluate(stageRequest(request), async () => { await pending; return async () => { dispatches++; return native } }) },
  })
  const reply = await service({ body: Buffer.from(JSON.stringify(input())), network: '192.0.2.1' })
  expect(reply.body).toEqual({ status: 'unavailable', reason: 'deadline' })
  finish(); await Promise.resolve()
  expect(dispatches).toBe(0)
})

test('unknown usage halts later stages even if the workflow catches the failure', async () => {
  let dispatches = 0
  const service = createLiveService({ admission: createAdmission(memoryStore(), 'dummy-key-with-at-least-thirty-two-bytes'), authorize: async () => 'guest',
    execute: async (request, work) => {
      const page = stageRequest(request)
      await work.evaluate(page, async () => async () => { dispatches++; return { ...native, usage: undefined } }).catch(() => undefined)
      await work.evaluate({ ...page, stage: 'bound-verification' }, async () => async () => { dispatches++; return native }).catch(() => undefined)
    },
  })
  expect((await service({ body: Buffer.from(JSON.stringify(input())), network: '192.0.2.1' })).body).toEqual({ status: 'unavailable', reason: 'run-stopped', dispatched: [{ stage: 'combined-page-declaration', page: 1 }] })
  expect(dispatches).toBe(1)
})

test('cancellation after durable marking prevents transport and consumes the marked entry', async () => {
  const store = memoryStore(), abort = new AbortController()
  const delayed: MetadataStore = { async transaction(keys, update) {
    let dispatched = false
    const value = await store.transaction(keys, records => {
      const result = update(records)
      dispatched = Object.values(result.writes).some(record => typeof record === 'object' && record !== null && 'dispatched' in record && Array.isArray(record.dispatched) && record.dispatched.length === 1)
      return result
    })
    if (dispatched) abort.abort()
    return value
  } }
  let dispatches = 0
  const service = createLiveService({ admission: createAdmission(delayed, 'dummy-key-with-at-least-thirty-two-bytes'), authorize: async () => 'guest',
    execute: async (request, work) => { await work.evaluate(stageRequest(request), async () => async () => { dispatches++; return native }) },
  })
  const request = { body: Buffer.from(JSON.stringify(input())), network: '192.0.2.1', signal: abort.signal }
  expect((await service(request)).body).toEqual({ status: 'unavailable', reason: 'run-stopped' })
  expect(dispatches).toBe(0)
  // A repeated request cannot dispatch the durably marked work.
  expect((await service({ ...request, signal: undefined })).body.status).toBe('duplicate')
  expect(dispatches).toBe(0)
})

test('an operator disablement between marking and transport stops dispatch', async () => {
  const store = memoryStore()
  let marked = false, dispatches = 0
  const operatorStore: MetadataStore = { async transaction(keys, update) {
    const result = await store.transaction(keys, records => {
      const next = update(records)
      marked ||= Object.values(next.writes).some(record => typeof record === 'object' && record !== null && 'dispatched' in record && Array.isArray(record.dispatched) && record.dispatched.length === 1)
      return next
    })
    if (marked) await store.transaction(['control'], records => ({ value: undefined, writes: { control: { ...records.control as object, enabled: false } } }))
    return result
  } }
  const service = createLiveService({ admission: createAdmission(operatorStore, 'dummy-key-with-at-least-thirty-two-bytes'), authorize: async () => 'guest', execute: async (request, work) => { await work.evaluate(stageRequest(request), async () => async () => { dispatches++; return native }) } })
  expect((await service({ body: Buffer.from(JSON.stringify(input())), network: '192.0.2.1' })).body).toEqual({ status: 'unavailable', reason: 'service-disabled' })
  expect(dispatches).toBe(0)
})

test('a four-page run can dispatch only its reserved nine stages', async () => {
  let dispatches = 0
  const service = createLiveService({ admission: createAdmission(memoryStore(), 'dummy-key-with-at-least-thirty-two-bytes'), authorize: async () => 'guest',
    execute: async (request, work) => {
      const pages = request.pages.map(page => stageRequest(request, page))
      const stages = [...pages, { ...pages[0], stage: 'document-comparison' as const }, ...pages.map(page => ({ ...page, stage: 'bound-verification' as const, questions: { clipping: { type: 'noul' as const, instructions: 'Fixed test boundary question' } } }))]
      for (const stage of stages) await work.evaluate(stage, async () => async () => { dispatches++; return native })
    },
  })
  const body = { ...input(), totalPages: 4, selectedPages: [1, 2, 3, 4], pages: [1, 2, 3, 4].map(page => ({ ...input().pages[0], page })) }
  expect((await service({ body: Buffer.from(JSON.stringify(body)), network: '192.0.2.1' })).body).toMatchObject({ status: 'completed', stages: expect.arrayContaining([{ stage: 'document-comparison', page: 1, answer: native }]) })
  expect(dispatches).toBe(9)
})
