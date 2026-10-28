import { expect, test } from '@playwright/test'

test('a four-page source is checked in order with one document comparison and a nine-attempt plan', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/business-evidence-fixtures.ts', identity = '/tests/browser/support/evidence-fixtures.ts', transport = '/tests/browser/support/evidence-transport.ts'
    const { businessInput, attachBusiness } = await import(fixtures) as typeof import('../support/business-evidence-fixtures')
    const { identityDemo, pdfFile } = await import(identity) as typeof import('../support/evidence-fixtures')
    const { nativeBusiness } = await import(transport) as typeof import('../support/evidence-transport')
    const requests: import('../../../src/evidence-assistance/contract').StageRequest[] = []
    const { demo } = await identityDemo({ async evaluate(request) { requests.push(request); return nativeBusiness() } })
    const attachment = await attachBusiness(await pdfFile(4, 90))
    const before = await demo.readApplication(businessInput.applicationId)
    const handle = demo.createEvidenceAssistance({ ...businessInput, attachment })
    await handle.run()
    return { state: handle.read(), before, after: await demo.readApplication(businessInput.applicationId), requests: requests.map(({ stage, plan, image, questions }) => ({ stage, plan, page: image.manifest.page, rotation: image.manifest.rotation, questions: Object.keys(questions) })) }
  })
  expect(result.state.status, JSON.stringify(result.state)).toBe('completed')
  expect(result.before).toEqual(result.after)
  expect(result.state.coverage).toEqual({ totalPages: 4, selected: [1, 2, 3, 4], prepared: [1, 2, 3, 4], dispatched: [1, 2, 3, 4], successful: [1, 2, 3, 4], failed: [], unreadable: [], unchecked: [], uncheckedCount: 0 })
  expect(result.requests.map(request => request.stage)).toEqual(['page', 'page', 'page', 'page', 'document-comparison'])
  expect(result.requests.slice(0, 4).map(request => request.page)).toEqual([1, 2, 3, 4])
  expect(result.requests.every(request => request.plan.maximumAttempts === 9)).toBe(true)
  expect(result.requests[0].plan.stages).toEqual(['page:1', 'page:2', 'page:3', 'page:4', 'document-comparison', 'bound-verification:1', 'bound-verification:2', 'bound-verification:3', 'bound-verification:4'])
  expect(result.requests.slice(0, 4).every(request => request.rotation === 90)).toBe(true)
  expect(result.state.result?.findings.addressSupport).toBe('conflict')
})

test('page selection is explicit, bounded and never changes longer-source semantics', async ({ page }) => {
  await page.goto('/tests/browser/support/api.html'); await page.waitForFunction(() => window.demo)
  const result = await page.evaluate(async () => {
    const fixtures = '/tests/browser/support/financial-evidence-fixtures.ts', identity = '/tests/browser/support/evidence-fixtures.ts'
    const { financialInput, financialFile, attachFinancial, nativeFinancial } = await import(fixtures) as typeof import('../support/financial-evidence-fixtures')
    const { identityDemo } = await import(identity) as typeof import('../support/evidence-fixtures')
    const requests: import('../../../src/evidence-assistance/contract').StageRequest[] = []
    const { demo } = await identityDemo({ async evaluate(request) { requests.push(request); return nativeFinancial(request) } })
    const attachment = await attachFinancial(await financialFile(5))
    const handle = demo.createEvidenceAssistance({ ...financialInput, attachment })
    await handle.inspect(); const inspected = handle.read()
    await handle.run(); const unselected = handle.read()
    const refused = []
    for (const pages of [[], [1, 1], [0], [1, 2, 3, 4, 5], [6]]) { await handle.run(pages); refused.push(handle.read()) }
    await handle.run([4]); const selected = handle.read()
    return { inspected, unselected, refused, selected, requests: requests.map(({ stage, plan }) => ({ stage, plan })) }
  })
  expect(result.inspected.coverage).toMatchObject({ totalPages: 5, selected: [], unchecked: [1, 2, 3, 4, 5] })
  expect(result.unselected).toMatchObject({ status: 'unavailable', reason: 'page-selection', result: null, coverage: { selected: [], dispatched: [] } })
  expect(result.refused.every(state => state.reason === 'page-selection' && !state.coverage.dispatched.length)).toBe(true)
  expect(result.selected.coverage).toEqual({ totalPages: 5, selected: [4], prepared: [4], dispatched: [4], successful: [4], failed: [], unreadable: [], unchecked: [1, 2, 3, 5], uncheckedCount: 4 })
  expect(result.selected.result?.findings).toMatchObject({ readability: 'clear', periodSupport: 'undetermined', revenueSupport: 'undetermined', expensesSupport: 'undetermined' })
  expect(result.requests.map(request => request.stage)).toEqual(['page', 'document-comparison'])
  expect(result.requests[0].plan).toMatchObject({ maximumAttempts: 3, stages: ['page:4', 'document-comparison', 'bound-verification:4'] })
})
