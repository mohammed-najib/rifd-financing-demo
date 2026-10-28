import { expect, test } from '@playwright/test'
import { loseNextWriteCompletion, refuseCommitNotices } from '../support/storage-faults'

test('the separate API harness compiles the production Tailwind theme, logical spacing and breakpoint utilities', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.evaluate(() => {
    const probe = document.createElement('div')
    probe.id = 'style-probe'
    probe.className = 'grid grid-cols-2 gap-6 narrow:grid-cols-1 ms-3'
    probe.style.width = '200px'
    probe.textContent = 'Shared production styles'
    document.body.append(probe)
  })
  for (const direction of ['rtl', 'ltr']) {
    await page.locator('html').evaluate((element, direction) => { element.setAttribute('dir', direction) }, direction)
    for (const width of [767, 768]) {
      await page.setViewportSize({ width, height: 900 })
      const style = await page.locator('#style-probe').evaluate(element => {
        const style = getComputedStyle(element)
        return { display: style.display, columns: style.gridTemplateColumns.split(' ').length, gap: style.gap, margin: style.marginInlineStart, color: style.color, font: getComputedStyle(document.documentElement).fontSize }
      })
      expect(style).toEqual({ display: 'grid', columns: width === 767 ? 1 : 2, gap: '24px', margin: '12px', color: 'rgb(50, 46, 40)', font: '15px' })
    }
  }
})

test('language writes abort without a receipt, inspect uncertainty and survive failed notices', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  const startup = await page.evaluate(() => window.demo.startup())
  if (!startup.ok) throw new Error('No startup')
  const command = { kind: 'setLanguage' as const, datasetId: startup.value.datasetId, operationId: 'language-recovery', expectedRevision: 1, language: 'en' as const }
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
      IDBObjectStore.prototype.put = put
      const request = put.apply(this, args)
      request.addEventListener('success', () => this.transaction.abort(), { once: true })
      return request
    }
  })
  expect(await page.evaluate(command => window.demo.execute(command), command)).toMatchObject({ error: { kind: 'storage' } })
  expect(await page.evaluate(command => window.demo.inspectPreferenceOperation(command), command)).toMatchObject({ value: { status: 'notCommitted', context: { preferences: startup.value.preferences } } })
  await page.evaluate(loseNextWriteCompletion)
  expect(await page.evaluate(command => window.demo.execute(command), command)).toMatchObject({ error: { kind: 'outcomeUnknown' } })
  const recovered = await page.evaluate(async command => ({ inspection: await window.demo.inspectPreferenceOperation(command), replay: await window.demo.execute(command), misuse: await window.demo.execute({ ...command, language: 'ar' }) }), command)
  expect(recovered.replay).toMatchObject({ ok: true, value: { preferences: { revision: 2, language: 'en' } } })
  expect(recovered.inspection).toMatchObject({ value: { status: 'committed', context: recovered.replay.ok ? recovered.replay.value : null } })
  expect(recovered.misuse).toMatchObject({ error: { kind: 'identifierMisuse' } })
  await page.evaluate(refuseCommitNotices)
  const next = { ...command, operationId: 'language-notices', expectedRevision: 2, language: 'ar' as const }
  const committed = await page.evaluate(command => window.demo.execute(command), next)
  expect(committed).toMatchObject({ ok: true, value: { preferences: { revision: 3, language: 'ar' } } })
  expect(await page.evaluate(command => window.demo.execute(command), next)).toEqual(committed)
})

test('startup seeds the canonical own-applicant and staff projections', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const demo = window.demo
    const startup = await demo.startup()
    await demo.signIn('mariam')
    const own = await demo.listApplications()
    await demo.signIn('salma')
    const staff = await demo.listApplications()
    const draft = await demo.readApplication('RIFD-2026-001')
    await demo.signIn('huda')
    const huda = await demo.listApplications()
    const hudaNotices = await demo.readNotifications()
    await demo.signIn('omar')
    const omar = await demo.listApplications()
    const omarNotices = await demo.readNotifications()
    return { startup, own, staff, draft, huda, omar, hudaNotices, omarNotices }
  })
  expect(result.startup).toMatchObject({ ok: true, value: { preferences: { language: 'ar' }, session: null } })
  expect(result.own.ok && result.own.value).toHaveLength(5)
  expect(result.staff.ok && result.staff.value).toHaveLength(12)
  expect(result.huda.ok && result.huda.value).toHaveLength(5)
  expect(result.omar.ok && result.omar.value).toHaveLength(3)
  expect(result.hudaNotices.ok && result.hudaNotices.value.map(notice => [notice.kind, notice.read])).toEqual([['correctionsRequested', false], ['correctionsRequested', false]])
  expect(result.omarNotices.ok && result.omarNotices.value.map(notice => [notice.kind, notice.read])).toEqual([['rejected', false], ['correctionsRequested', false]])
  if (!result.staff.ok) throw new Error('Staff read failed')
  const counts: Record<string, number> = {}
  for (const item of result.staff.value) counts[item.status] = (counts[item.status] ?? 0) + 1
  expect(counts).toEqual({ submitted: 4, underReview: 3, correctionsRequested: 3, approved: 1, rejected: 1 })
  expect(result.staff.value.filter(application => application.assignedToYou)).toHaveLength(7)
  expect(result.staff.value.filter(application => application.assignment?.en === 'Khaled Ali')).toHaveLength(3)
  expect(result.staff.value.filter(application => application.assignment === null)).toHaveLength(2)
  expect(result.staff.value.map(application => [application.id, application.amount, application.term, application.submittedAt])).toEqual([
    ['RIFD-2026-011', '800000', '18', '2026-10-09'],
    ['RIFD-2026-012', '350000', '6', '2026-10-09'],
    ['RIFD-2026-013', '1000000', '24', '2026-10-09'],
    ['RIFD-2026-010', '400000', '12', '2026-10-08'],
    ['RIFD-2026-009', '700000', '18', '2026-10-07'],
    ['RIFD-2026-007', '900000', '12', '2026-10-06'],
    ['RIFD-2026-008', '500000', '12', '2026-10-06'],
    ['RIFD-2026-003', '300000', '6', '2026-10-05'],
    ['RIFD-2026-002', '1200000', '18', '2026-10-02'],
    ['RIFD-2026-004', '600000', '6', '2026-10-02'],
    ['RIFD-2026-006', '200000', '6', '2026-10-02'],
    ['RIFD-2026-005', '1200000', '18', '2026-07-03'],
  ])
  expect(result.draft).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
})

test('saved language and tab-local identity restore while unauthorized reads stay neutral', async ({ page, context }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  const start = await page.evaluate(() => window.demo.startup())
  expect(start.ok).toBe(true)
  const first = await page.evaluate(async () => {
    const demo = window.demo
    await demo.signIn('huda')
    const ctx = await demo.context()
    if (!ctx.ok) throw new Error('No context')
    const language = await demo.execute({ kind: 'setLanguage', datasetId: ctx.value.datasetId, operationId: 'language-1', expectedRevision: ctx.value.preferences.revision, language: 'en' })
    const correction = await demo.readApplication('RIFD-2026-004')
    const other = await demo.readApplication('RIFD-2026-002')
    const missing = await demo.readApplication('missing')
    const notices = await demo.readNotifications()
    return { language, correction, other, missing, notices, restarted: await demo.startup() }
  })
  expect(first.language).toMatchObject({ ok: true, value: { preferences: { language: 'en' } } })
  expect(first.restarted).toMatchObject({ ok: true, value: { session: { identity: 'huda' }, preferences: { language: 'en' } } })
  expect(first.other).toEqual(first.missing)
  expect(first.correction).toMatchObject({ ok: true, value: { role: 'applicant', snapshot: { fields: { amount: '600000' } }, workspace: { snapshot: { fields: { amount: '600000' } } } } })
  if (!first.correction.ok) throw new Error('No own application')
  expect(first.correction.value).not.toHaveProperty('notes')
  expect(first.correction.value).not.toHaveProperty('assessments')
  expect(first.correction.value).not.toHaveProperty('assignment')
  for (const round of first.correction.value.rounds) {
    for (const target of round.targets) expect(target).not.toHaveProperty('verified')
  }
  expect(first.notices.ok && first.notices.value).toHaveLength(2)
  await page.reload()
  await page.waitForFunction(() => window.demo)
  const restored = await page.evaluate(() => window.demo.startup())
  expect(restored).toMatchObject({ ok: true, value: { session: { identity: 'huda' }, preferences: { language: 'en' } } })
  const second = await context.newPage()
  await second.goto('/tests/browser/support/api.html')
  await second.waitForFunction(() => window.demo)
  const otherTab = await second.evaluate(async () => {
    await window.demo.startup()
    await window.demo.signIn('salma')
    return { application: await window.demo.readApplication('RIFD-2026-004'), notifications: await window.demo.readNotifications(), samples: await window.demo.listSamples('RIFD-2026-004') }
  })
  expect(otherTab.application).toMatchObject({ ok: true, value: { role: 'reviewer', snapshot: { fields: { amount: '600000' } } } })
  if (!otherTab.application.ok) throw new Error('No submitted application')
  expect(otherTab.application.value).not.toHaveProperty('workspace')
  expect(otherTab.notifications).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
  expect(otherTab.samples).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
  expect(await page.evaluate(() => window.demo.context())).toMatchObject({ ok: true, value: { session: { identity: 'huda' } } })
})

test('actual saved PNG, JPEG and multipage PDF bytes survive refresh and remain authorized', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  const files = await page.evaluate(async () => {
    const demo = window.demo
    await demo.startup()
    await demo.signIn('mariam')
    const draft = await demo.readApplication('RIFD-2026-001')
    if (!draft.ok) throw new Error('No draft')
    return Promise.all(draft.value.documents.map(async document => {
      const file = await demo.readFile('RIFD-2026-001', document.file!.id)
      if (!file.ok) throw new Error('No file')
      return { id: document.file!.id, hash: file.value.hash, mime: file.value.mime, bytes: Array.from(new Uint8Array(file.value.bytes)) }
    }))
  })
  expect(files.map(file => file.mime)).toEqual(['image/png', 'application/pdf', 'application/pdf', 'image/jpeg'])
  expect(files[0].bytes.slice(0, 8)).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
  expect(files[3].bytes.slice(0, 2)).toEqual([255, 216])
  const { PDFDocument } = await import('pdf-lib')
  expect((await PDFDocument.load(new Uint8Array(files[1].bytes))).getPageCount()).toBe(2)
  await page.reload()
  await page.waitForFunction(() => window.demo)
  const restored = await page.evaluate(async refs => {
    await window.demo.startup()
    const reads = await Promise.all(refs.map(ref => window.demo.readFile('RIFD-2026-001', ref)))
    await window.demo.signIn('salma')
    const forbidden = await window.demo.readFile('RIFD-2026-001', refs[0])
    return { reads: reads.map(read => read.ok ? { hash: read.value.hash, size: read.value.bytes.byteLength } : null), forbidden }
  }, files.map(file => file.id))
  expect(restored.reads).toEqual(files.map(file => ({ hash: file.hash, size: file.bytes.length })))
  expect(restored.forbidden).toMatchObject({ ok: false, error: { kind: 'unavailable' } })
})

test('concurrent startup seeds once and competing language writes require inspection', async ({ page, context }) => {
  const second = await context.newPage()
  await Promise.all([page.goto('/tests/browser/support/api.html'), second.goto('/tests/browser/support/api.html')])
  await Promise.all([page.waitForFunction(() => window.demo), second.waitForFunction(() => window.demo)])
  const starts = await Promise.all([page.evaluate(() => window.demo.startup()), second.evaluate(() => window.demo.startup())])
  if (!starts[0].ok || !starts[1].ok) throw new Error('Startup failed')
  expect(starts[0].value.datasetId).toBe(starts[1].value.datasetId)
  const operation = { kind: 'setLanguage' as const, datasetId: starts[0].value.datasetId, operationId: 'same-intent', expectedRevision: 1, language: 'en' as const }
  const writes = await Promise.all([
    page.evaluate(input => window.demo.execute(input), operation),
    second.evaluate(input => window.demo.execute(input), { ...operation, operationId: 'competing-intent' }),
  ])
  expect(writes.filter(write => write.ok)).toHaveLength(1)
  expect(writes.filter(write => !write.ok)).toEqual([{ ok: false, error: { kind: 'stalePreference', key: 'error.stalePreference' } }])
  const winner = writes[0].ok ? page : second
  const intent = writes[0].ok ? operation : { ...operation, operationId: 'competing-intent' }
  const replay = await winner.evaluate(input => window.demo.execute(input), intent)
  expect(replay).toMatchObject({ ok: true, value: { preferences: { revision: 2, language: 'en' } } })
  const misuse = await winner.evaluate(input => window.demo.execute({ ...input, language: 'ar' }), intent)
  expect(misuse).toMatchObject({ ok: false, error: { kind: 'identifierMisuse' } })
  const records = await page.evaluate(async () => { await window.demo.signIn('salma'); return window.demo.listApplications() })
  expect(records.ok && records.value).toHaveLength(12)
})

test('fifteen minutes of actual inactivity expires reads and the restored session', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  await page.evaluate(async () => { await window.demo.startup(); await window.demo.signIn('mariam') })
  await page.clock.install()
  await page.clock.runFor(15 * 60 * 1000 + 1)
  expect(await page.evaluate(() => window.demo.listApplications())).toMatchObject({ ok: false, error: { kind: 'sessionExpired' } })
  expect(await page.evaluate(() => window.demo.context())).toMatchObject({ ok: true, value: { session: null } })
  await page.reload()
  await page.waitForFunction(() => window.demo)
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true, value: { session: null } })
})

test('damaged referenced evidence fails startup without silently replacing the dataset', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  const original = await page.evaluate(() => window.demo.startup())
  if (!original.ok) throw new Error('Startup failed')
  // Isolated corruption fixture. Product screens have no access to storage or this helper.
  const removed = await page.evaluate(() => new Promise<{ id: string; applicationId: string; slot: 'identity'; name: string; mime: string; size: number; hash: string; bytes: number[] }>((resolve, reject) => {
    const open = indexedDB.open('rifd-demo', 1)
    open.onsuccess = () => {
      const db = open.result
      const tx = db.transaction('state', 'readwrite')
      const store = tx.objectStore('state')
      const request = store.get('dataset')
      let removed: { id: string; applicationId: string; slot: 'identity'; name: string; mime: string; size: number; hash: string; bytes: ArrayBuffer }
      request.onsuccess = () => { const data = request.result; removed = data.files.shift(); store.put(data, 'dataset') }
      tx.oncomplete = () => { db.close(); resolve({ ...removed, bytes: Array.from(new Uint8Array(removed.bytes)) }) }
      tx.onabort = () => { db.close(); reject(tx.error) }
    }
    open.onerror = () => reject(open.error)
  }))
  await page.reload()
  await page.waitForFunction(() => window.demo)
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: false, error: { kind: 'damaged' } })
  await page.evaluate(file => new Promise<void>((resolve, reject) => {
    const open = indexedDB.open('rifd-demo', 1)
    open.onsuccess = () => {
      const db = open.result
      const tx = db.transaction('state', 'readwrite')
      const store = tx.objectStore('state')
      const request = store.get('dataset')
      request.onsuccess = () => { const data = request.result; data.files.unshift({ ...file, bytes: new Uint8Array(file.bytes).buffer }); store.put(data, 'dataset') }
      tx.oncomplete = () => { db.close(); resolve() }
      tx.onabort = () => { db.close(); reject(tx.error) }
    }
    open.onerror = () => reject(open.error)
  }), removed)
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true, value: { datasetId: original.value.datasetId } })
})
