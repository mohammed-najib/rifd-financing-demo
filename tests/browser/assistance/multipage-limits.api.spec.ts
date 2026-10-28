import { expect, test } from '@playwright/test'

test('combined raster limits require explicit narrower work without dispatching a subset', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/financial-evidence-fixtures.ts', identity = '/tests/browser/support/evidence-fixtures.ts'
    const { financialInput, financialFile, attachFinancial } = await import(fixtures) as typeof import('../support/financial-evidence-fixtures')
    const { identityDemo } = await import(identity) as typeof import('../support/evidence-fixtures')
    let attempts = 0
    const { demo } = await identityDemo({ async evaluate() { attempts++; throw new Error('must not dispatch') } })
    const attachment = await attachFinancial(await financialFile(4, { large: true }))
    const handle = demo.createEvidenceAssistance({ ...financialInput, attachment })
    await handle.run()
    return { state: handle.read(), attempts, readable: (await demo.readPrepared(financialInput.applicationId, attachment)).ok }
  })
  expect(result).toMatchObject({ attempts: 0, readable: true, state: { status: 'unavailable', reason: 'prepared-limit', coverage: { totalPages: 4, selected: [1, 2, 3, 4], prepared: [1, 2, 3], failed: [4], dispatched: [], unchecked: [1, 2, 3, 4] } } })
})

test('preparation shares a twenty-second deadline and terminates every sequential worker', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html'); await page.waitForFunction(() => window.demo)
  let maximumWorkers = 0
  page.on('worker', () => { maximumWorkers = Math.max(maximumWorkers, page.workers().length) })
  await page.route('**/pdfjs/5.4.296/standard_fonts/**', async route => {
    await new Promise(resolve => setTimeout(resolve, 6500))
    await route.continue().catch(() => {})
  })
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/evidence-fixtures.ts', preparation = '/src/evidence-assistance/preparation/prepare.ts', saved = '/src/demo/saved-demonstrations/index.ts'
    const { pdfFile } = await import(fixtures) as typeof import('../support/evidence-fixtures')
    const { prepareEvidence } = await import(preparation) as typeof import('../../../src/evidence-assistance/preparation/prepare')
    const { hashBytes } = await import(saved) as typeof import('../../../src/demo/saved-demonstrations')
    const file = await pdfFile(4), bytes = await file.arrayBuffer()
    const started = performance.now()
    const result = await prepareEvidence({ id: 'deadline', bytes, name: file.name, mime: file.type, hash: await hashBytes(bytes) }, new AbortController().signal)
    return { elapsed: performance.now() - started, coverage: result.coverage, failures: result.failures }
  })
  expect(result.elapsed).toBeGreaterThanOrEqual(19_500)
  expect(result.elapsed).toBeLessThan(24_000)
  expect(maximumWorkers).toBe(1)
  await expect.poll(() => page.workers().length).toBe(0)
  expect(result.coverage.selected).toEqual([1, 2, 3, 4])
  expect(result.failures.some(failure => failure.reason === 'preparation-timeout')).toBe(true)
  expect(result.coverage.prepared.length).toBeLessThan(4)
})

test('a failed preparation page remains failed and unchecked while independent pages can be checked', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html'); await page.waitForFunction(() => window.demo)
  await page.route('**/pdfjs/5.4.296/standard_fonts/**', route => route.fulfill({ status: 404 }))
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/financial-evidence-fixtures.ts', identity = '/tests/browser/support/evidence-fixtures.ts'
    const { financialInput, partialFinancialFile, attachFinancial, nativeFinancial } = await import(fixtures) as typeof import('../support/financial-evidence-fixtures')
    const { identityDemo } = await import(identity) as typeof import('../support/evidence-fixtures')
    const checked: string[] = []
    const { demo } = await identityDemo({ async evaluate(request) { checked.push(`${request.stage}:${request.image.manifest.page}`); return nativeFinancial(request, { revenue: 'conflict' }) } })
    const attachment = await attachFinancial(await partialFinancialFile())
    const handle = demo.createEvidenceAssistance({ ...financialInput, attachment }); await handle.run()
    return { state: handle.read(), checked }
  })
  expect(result.checked).toEqual(['page:1', 'document-comparison:1'])
  expect(result.state.coverage).toEqual({ totalPages: 2, selected: [1, 2], prepared: [1], dispatched: [1], successful: [1], failed: [2], unreadable: [], unchecked: [2], uncheckedCount: 1 })
  expect(result.state.result?.findings).toMatchObject({ periodSupport: 'undetermined', revenueSupport: 'conflict', expensesSupport: 'undetermined' })
})
