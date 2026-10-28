import { expect, test, type Page } from '@playwright/test'
import { loseNextWriteCompletion } from '../support/storage-faults'

test.describe.configure({ mode: 'parallel' })

async function start(page: Page) {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(async () => { await window.demo.startup(); await window.demo.signIn('salma') })
}

test('staff search, filters and five-row pages expose only submitted information', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => ({
    first: await window.demo.readStaffQueue(),
    last: await window.demo.readStaffQueue({ page: '99' }),
    reference: await window.demo.readStaffQueue({ search: 'rifd-2026-004' }),
    applicant: await window.demo.readStaffQueue({ search: 'هدى', status: 'submitted', product: 'inventory', assignment: 'you' }),
    business: await window.demo.readStaffQueue({ search: 'المدار' }),
    empty: await window.demo.readStaffQueue({ search: 'no such business', page: '3' }),
    privateDraft: await window.demo.readStaffQueue({ search: 'RIFD-2026-001' }),
  }))
  expect(result.first).toMatchObject({ ok: true, value: { total: 12, matched: 12, pages: 3, query: { page: 1, search: '' }, counts: { submitted: 4, underReview: 3, correctionsRequested: 3, approved: 1, rejected: 1 }, assignments: { you: 7, colleague: 3, unassigned: 2 } } })
  expect(result.first.ok && result.first.value.rows.map(row => row.id)).toEqual(['RIFD-2026-011', 'RIFD-2026-012', 'RIFD-2026-013', 'RIFD-2026-010', 'RIFD-2026-009'])
  expect(result.last).toMatchObject({ ok: true, value: { query: { page: 3 }, rows: [{ id: 'RIFD-2026-006' }, { id: 'RIFD-2026-005' }] } })
  expect(result.reference).toMatchObject({ ok: true, value: { rows: [{ id: 'RIFD-2026-004', amount: '600000' }] } })
  expect(result.applicant).toMatchObject({ ok: true, value: { matched: 1, rows: [{ id: 'RIFD-2026-003' }] } })
  expect(result.business).toMatchObject({ ok: true, value: { matched: 3 } })
  for (const empty of [result.empty, result.privateDraft]) expect(empty).toMatchObject({ ok: true, value: { matched: 0, pages: 1, query: { page: 1 }, rows: [] } })
})

test('queue preferences are versioned, durable and independent of applications and language', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.context()
    if (!context.ok) throw new Error('No context')
    const application = await demo.readApplication('RIFD-2026-004')
    demo.setControls({ slow: false, failure: 'storage' })
    const command = { kind: 'setQueuePreferences' as const, datasetId: context.value.datasetId, operationId: 'queue-choice', expectedRevision: 1, queue: { status: 'underReview' as const, product: 'equipment' as const, assignment: 'you' as const, sort: 'amountAsc' as const } }
    const saved = await window.commitOn(demo, command)
    // Preference intents carry their revision, so an old one is stale whatever the payload.
    const replay = await window.commitOn(demo, command)
    const changedQueue = await window.commitOn(demo, { ...command, queue: { ...command.queue, sort: 'dateAsc' } })
    const stale = await window.commitOn(demo, { ...command, queue: { ...command.queue, status: 'all' } })
    const inspected = await window.inspectOnPreference(demo, command)
    const language = await window.commitOn(demo, { kind: 'setLanguage', expectedRevision: 2, language: 'en' })
    return { saved, replay, changedQueue, stale, inspected, language, before: application, after: await demo.readApplication('RIFD-2026-004'), controls: demo.controls() }
  })
  expect(result.saved).toMatchObject({ ok: true, value: { preferences: { revision: 2, language: 'ar', queue: { status: 'underReview', product: 'equipment', assignment: 'you', sort: 'amountAsc' } } } })
  expect(result.replay).toMatchObject({ ok: false, error: { kind: 'stalePreference' } })
  expect(result.changedQueue).toMatchObject({ ok: false, error: { kind: 'stalePreference' } })
  expect(result.stale).toMatchObject({ ok: false, error: { kind: 'stalePreference' } })
  // Nothing is pending after a committed preference, so inspection reports the saved context.
  expect(result.inspected).toMatchObject({ ok: true, value: { status: 'notCommitted', context: { preferences: { revision: 2 } } } })
  expect(result.language).toMatchObject({ ok: true, value: { preferences: { language: 'en', queue: { sort: 'amountAsc' } } } })
  expect(result.after).toEqual(result.before)
  expect(result.controls.failure).toBe('storage')
  await page.reload()
  await page.waitForFunction(() => window.demo)
  const fresh = await page.evaluate(async () => { await window.demo.startup(); return window.demo.readStaffQueue() })
  expect(fresh).toMatchObject({ ok: true, value: { query: { search: '', page: 1, sort: 'amountAsc' }, rows: [{ id: 'RIFD-2026-009' }, { id: 'RIFD-2026-007' }] } })
})

test('all four sorts retain ascending reference ties across pages and invalid queries fall back', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const sorts: Record<string, string[]> = {}
    for (const sort of ['dateDesc', 'dateAsc', 'amountDesc', 'amountAsc']) {
      sorts[sort] = []
      for (const page of [1, 2, 3]) {
        const result = await window.demo.readStaffQueue({ sort, page })
        if (!result.ok) throw new Error(result.error.kind)
        sorts[sort].push(...result.value.rows.map(row => row.id.slice(-3)))
      }
    }
    const context = await window.demo.context()
    if (!context.ok) throw new Error('No context')
    await window.commit({ kind: 'setQueuePreferences', expectedRevision: 1, queue: { status: 'submitted', product: 'equipment', assignment: 'colleague', sort: 'amountAsc' } })
    const invalid = await window.demo.readStaffQueue({ status: 'draft', product: ['inventory'], assignment: null, sort: 'bogus', page: '1.5', search: 77 })
    const explicit = await window.demo.readStaffQueue({ status: 'all', product: 'inventory', assignment: 'unassigned', sort: 'dateDesc', page: -1, search: '  RIFD-٢٠٢٦-٠١٠  ' })
    return { sorts, invalid, explicit }
  })
  expect(result.sorts).toEqual({
    dateDesc: ['011', '012', '013', '010', '009', '007', '008', '003', '002', '004', '006', '005'],
    dateAsc: ['005', '002', '004', '006', '003', '007', '008', '009', '010', '011', '012', '013'],
    amountDesc: ['002', '005', '013', '007', '011', '009', '004', '008', '010', '012', '003', '006'],
    amountAsc: ['006', '003', '012', '010', '008', '004', '009', '011', '007', '013', '002', '005'],
  })
  expect(result.invalid).toMatchObject({ ok: true, value: { query: { status: 'submitted', product: 'equipment', assignment: 'colleague', sort: 'amountAsc', search: '', page: 1 }, rows: [{ id: 'RIFD-2026-011' }] } })
  expect(result.explicit).toMatchObject({ ok: true, value: { rows: [{ id: 'RIFD-2026-010' }], query: { page: 1 } } })
})

test('queue writes refuse invalid, stale, unauthorized and expired intents without saving', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const initial = await demo.context()
    if (!initial.ok) throw new Error('No context')
    const command = { kind: 'setQueuePreferences' as const, datasetId: initial.value.datasetId, operationId: 'refused', expectedRevision: 1, queue: { status: 'approved' as const, product: 'all' as const, assignment: 'all' as const, sort: 'dateAsc' as const } }
    const invalid = await window.commitOn(demo, { ...command, queue: { ...command.queue, search: 'private search' } } as typeof command)
    const stale = await window.commitOn(demo, { ...command, expectedRevision: 99 })
    await demo.signOut()
    const unsigned = await demo.readStaffQueue()
    const unsignedWrite = await window.commitOn(demo, command)
    await demo.signIn('mariam')
    const applicant = await demo.readStaffQueue()
    const applicantWrite = await window.commitOn(demo, command)
    await demo.signIn('salma')
    demo.setControls({ slow: true, failure: null })
    const pending = window.commitOn(demo, command)
    demo.expireSession()
    const expired = await pending
    demo.setControls({ slow: false, failure: null })
    await demo.signIn('salma')
    return { invalid, stale, unsigned, unsignedWrite, applicant, applicantWrite, expired, inspection: await window.inspectOnPreference(demo, command), initial: initial.value.preferences, current: await demo.context() }
  })
  expect(result.invalid).toMatchObject({ ok: false, error: { kind: 'validation' } })
  expect(result.stale).toMatchObject({ ok: false, error: { kind: 'stalePreference' } })
  for (const expired of [result.unsigned, result.unsignedWrite, result.expired]) expect(expired).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } })
  for (const unavailable of [result.applicant, result.applicantWrite]) expect(unavailable).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted' } })
  expect(result.current.ok && result.current.value.preferences).toEqual(result.initial)
})

test('missed post-commit notices can be inspected without repeating a preference save', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.context()
    if (!context.ok) throw new Error('No context')
    const command = { kind: 'setQueuePreferences' as const, datasetId: context.value.datasetId, operationId: 'notice-lost', expectedRevision: 1, queue: { status: 'all' as const, product: 'inventory' as const, assignment: 'you' as const, sort: 'amountDesc' as const } }
    const hints: unknown[] = []
    const post = BroadcastChannel.prototype.postMessage
    const store = Storage.prototype.setItem
    BroadcastChannel.prototype.postMessage = message => { hints.push(message); throw new Error('Missed broadcast') }
    Storage.prototype.setItem = function (key, value) { if (key === 'rifd.commit.v1') throw new Error('Missed storage notice'); store.call(this, key, value) }
    const unsubscribe = demo.subscribe(() => { throw new Error('Failed observer') })
    const saved = await window.commitOn(demo, command)
    unsubscribe(); BroadcastChannel.prototype.postMessage = post; Storage.prototype.setItem = store
    const inspected = await window.inspectOnPreference(demo, command)
    await window.commitOn(demo, { kind: 'setLanguage', expectedRevision: 2, language: 'en' })
    // The saved queue intent carries the old revision, so repeating it cannot save again.
    const replay = await window.commitOn(demo, command)
    // Language is its own preference family and advances the shared revision.
    const crossFamily = await window.commitOn(demo, { kind: 'setLanguage', expectedRevision: 3, language: 'ar' })
    return { datasetId: command.datasetId, saved, inspected, replay, crossFamily, hints }
  })
  expect(result.saved).toMatchObject({ ok: true, value: { preferences: { revision: 2 } } })
  expect(result.hints).toEqual([{ kind: 'preferences', datasetId: result.datasetId, revision: 2 }])
  expect(result.inspected).toMatchObject({ ok: true, value: { status: 'notCommitted', context: { preferences: { revision: 2, queue: { product: 'inventory' } } } } })
  expect(result.replay).toMatchObject({ ok: false, error: { kind: 'stalePreference' } })
  expect(result.crossFamily).toMatchObject({ ok: true, value: { preferences: { revision: 4, language: 'ar', queue: { product: 'inventory', sort: 'amountDesc' } } } })
})

test('status, product and assignment combinations select the accepted seed records', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const queries = [
      { status: 'submitted', assignment: 'unassigned' },
      { status: 'submitted', product: 'equipment', assignment: 'colleague' },
      { status: 'underReview', product: 'inventory', assignment: 'colleague' },
      { status: 'underReview', product: 'equipment', assignment: 'you' },
      { status: 'correctionsRequested', product: 'inventory', assignment: 'you' },
      { status: 'correctionsRequested', product: 'equipment', assignment: 'colleague' },
      { status: 'approved', assignment: 'you' },
      { status: 'rejected', product: 'inventory' },
      { status: 'approved', assignment: 'unassigned' },
    ]
    const ids: string[][] = []
    for (const query of queries) {
      const result = await window.demo.readStaffQueue(query)
      if (!result.ok) throw new Error(result.error.kind)
      ids.push(result.value.rows.map(row => row.id.slice(-3)))
    }
    return ids
  })
  expect(result).toEqual([['010', '002'], ['011'], ['008'], ['009', '007'], ['012', '004'], ['013'], ['005'], ['006'], []])
})

test('a queue preference write abort rolls back both the values and receipt before explicit retry', async ({ page }) => {
  await start(page)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const initial = await demo.context()
    if (!initial.ok) throw new Error('No context')
    const command = { kind: 'setQueuePreferences' as const, datasetId: initial.value.datasetId, operationId: 'queue-abort', expectedRevision: 1, queue: { status: 'submitted' as const, product: 'all' as const, assignment: 'unassigned' as const, sort: 'dateAsc' as const } }
    const put = IDBObjectStore.prototype.put
    let abortNext = true
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
      const request = put.apply(this, args)
      if (abortNext) { abortNext = false; request.addEventListener('success', () => this.transaction.abort()) }
      return request
    }
    const aborted = await window.commitOn(demo, command)
    IDBObjectStore.prototype.put = put
    const inspection = await window.inspectOnPreference(demo, command)
    const retry = await window.commitOn(demo, command)
    // The retry advanced the revision, so the same prepared intent cannot save twice.
    const replay = await window.commitOn(demo, command)
    return { initial: initial.value.preferences, aborted, inspection, retry, replay }
  })
  expect(result.aborted).toMatchObject({ ok: false, error: { kind: 'storage' } })
  expect(result.inspection).toMatchObject({ ok: true, value: { status: 'notCommitted', context: { preferences: result.initial } } })
  expect(result.retry).toMatchObject({ ok: true, value: { preferences: { revision: 2, queue: { assignment: 'unassigned' } } } })
  expect(result.replay).toMatchObject({ ok: false, error: { kind: 'stalePreference' } })
})

test('lost queue write completion stays unknown until receipt inspection proves the saved result', async ({ page }) => {
  await start(page)
  await page.evaluate(loseNextWriteCompletion)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const context = await demo.context()
    if (!context.ok) throw new Error('No context')
    const command = { kind: 'setQueuePreferences' as const, datasetId: context.value.datasetId, operationId: 'queue-unknown', expectedRevision: 1, queue: { status: 'underReview' as const, product: 'all' as const, assignment: 'you' as const, sort: 'amountAsc' as const } }
    const unknown = await window.commitOn(demo, command)
    return { unknown, inspected: await window.inspectOnPreference(demo, command), replay: await window.commitOn(demo, command) }
  })
  expect(result.unknown).toMatchObject({ ok: false, error: { kind: 'outcomeUnknown' } })
  expect(result.inspected).toMatchObject({ ok: true, value: { status: 'committed', context: { preferences: { revision: 2, queue: { status: 'underReview', assignment: 'you' } } } } })
  // Inspecting resolved the attempt, so repeating the prepared intent is stale rather than a second save.
  expect(result.replay).toMatchObject({ ok: false, error: { kind: 'stalePreference' } })
  await page.reload()
  await page.waitForFunction(() => window.demo)
  const fresh = await page.evaluate(async () => { await window.demo.startup(); return window.demo.readStaffQueue() })
  expect(fresh).toMatchObject({ ok: true, value: { rows: [{ id: 'RIFD-2026-009' }, { id: 'RIFD-2026-007' }] } })
})
