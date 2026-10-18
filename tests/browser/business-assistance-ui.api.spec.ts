import { expect, test, type Page } from '@playwright/test'
import { nativeBusiness } from './evidence-transport'

async function uploadBusiness(page: Page, lines?: string[]) {
  const bytes = await page.evaluate(async lines => {
    const path = '/tests/browser/business-evidence-fixtures.ts'
    const { businessFile } = await import(path) as typeof import('./business-evidence-fixtures')
    return Array.from(new Uint8Array(await (await businessFile(lines)).arrayBuffer()))
  }, lines)
  await page.locator('#business-file').setInputFiles({ name: 'fictional-business.png', mimeType: 'image/png', buffer: Buffer.from(bytes) })
}

test('an applicant checks, inspects, retains and edits business evidence in Arabic and English', async ({ page }, info) => {
  const requests: Record<string, unknown>[] = []
  await page.route('**/fake-provider/systemone', async route => {
    requests.push(route.request().postDataJSON())
    await route.fulfill({ json: nativeBusiness() })
  })
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/tests/browser/evidence-screen.html')
  const business = page.locator('section[aria-labelledby="business-heading"]')
  await uploadBusiness(page)
  await business.getByRole('button', { name: 'فحص المستند', exact: true }).click()
  let assistance = business.getByRole('region', { name: 'مساعدة تجريبية', exact: true })
  expect(requests).toHaveLength(0)
  await expect(assistance.getByRole('button', { name: 'بدء الفحص', exact: true })).toBeEnabled()
  await assistance.getByRole('button', { name: 'بدء الفحص', exact: true }).focus(); await page.keyboard.press('Enter')
  await expect(assistance.getByText('يبدو أن القيمة المطبوعة مختلفة عن هذه المعلومة المعلنة', { exact: true })).toBeVisible()
  await expect(assistance.getByText('توجد قيم مطبوعة متعارضة لهذا الحقل', { exact: true })).toBeVisible()
  await assistance.getByRole('button', { name: 'عرض المصدر الحالي', exact: true }).click()
  await expect(assistance.locator('object, img')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await assistance.screenshot({ path: info.outputPath('business-ar-390.png') })
  await page.getByRole('button', { name: 'English', exact: true }).click()
  assistance = business.getByRole('region', { name: 'Experimental assistance', exact: true })
  await expect(assistance.getByText('Business address', { exact: true })).toBeVisible()
  await expect(assistance.getByText('Printed value appears different from this declaration', { exact: true })).toBeVisible()
  await assistance.getByRole('button', { name: 'Retain document', exact: true }).click()
  await expect(assistance.getByText('You can retain this document. Use the ordinary Save action for any edits.', { exact: true })).toBeVisible()
  await assistance.screenshot({ path: info.outputPath('business-en-390.png') })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await assistance.screenshot({ path: info.outputPath('business-en-1440.png') })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(requests).toHaveLength(1)
  expect(requests[0].state).toHaveProperty('declaredBusiness')
  expect(requests[0].state).not.toHaveProperty('declaredApplicantName')
  await assistance.getByRole('button', { name: 'Edit business address', exact: true }).click()
  await page.getByRole('textbox', { name: 'Business address', exact: true }).fill('Changed fictional address, Aden')
  await page.locator('a[href="?step=documents"]').click()
  await business.getByRole('button', { name: 'Check document', exact: true }).click()
  await business.getByText('Check details', { exact: true }).click()
  await expect(business.getByText('Changed fictional address, Aden', { exact: true })).toBeVisible()
  expect(requests).toHaveLength(1)
  await business.getByRole('button', { name: 'Choose replacement', exact: true }).click()
  await expect(page.locator('#business-file')).toBeFocused()
  await uploadBusiness(page, ['Fictional business evidence', 'Business name: Revised Harbor Shop', 'Address: Changed fictional address, Aden', 'Operating since: 2025-01'])
  await page.getByRole('button', { name: 'Save progress', exact: true }).click()
  await expect.poll(async () => {
    const view = await page.evaluate(() => window.demo.readApplication('RIFD-2026-001'))
    return view.ok && view.value.documents.find(document => document.slot === 'business')?.file?.name
  }).toBe('fictional-business.png')
  await page.locator('a[href="?step=financing"]').click()
  await page.locator('#purchase-explanation').fill('Purchase fictional supplies for the shop shelves.')
  await page.locator('a[href="?step=review"]').click()
  await page.getByRole('button', { name: 'Submit application', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Application submitted.', exact: true })).toBeVisible()
  const submitted = await page.evaluate(() => window.demo.readApplication('RIFD-2026-001'))
  expect(submitted.ok && submitted.value.status).toBe('submitted')
  expect(requests).toHaveLength(1)
})

for (const scenario of ['missing declarations', 'unrelated document', 'ambiguous entries', 'unavailable service'] as const) test(`the business screen supports ordinary work with ${scenario}`, async ({ page }) => {
  const native = nativeBusiness()
  let response: unknown = native
  let lines: string[] | undefined
  if (scenario === 'unrelated document') {
    response = { ...native, answers: { ...native.answers, category: { type: 'choice', choice: 'other', confidence: 0.999, probabilities: { identity: 0, business: 0, financial: 0, stock: 0, equipment: 0, other: 1, mixed: 0, uncertain: 0 } } } }
    lines = ['Fictional picnic invitation', 'Meet at the park']
  }
  if (scenario === 'ambiguous entries') {
    response = { ...native, answers: { ...native.answers, businessNameSupport: { type: 'choice', choice: 'uncertain', confidence: 0.999, probabilities: { consistent: 0, different: 0, not_found: 0, conflict: 0, uncertain: 1 } } } }
    lines = ['Fictional business evidence', 'Harbor Supplies / Harbor Services', 'Address: 12 Market Street, Aden', 'Address: 90 Port Street, Aden', 'Operating since: 2025-01']
  }
  const requests: Record<string, unknown>[] = []
  await page.route('**/fake-provider/systemone', async route => {
    requests.push(route.request().postDataJSON())
    await route.fulfill(scenario === 'unavailable service' ? { status: 503 } : { json: response })
  })
  await page.goto('/tests/browser/evidence-screen.html')
  await page.getByRole('button', { name: 'English', exact: true }).click()
  if (scenario === 'missing declarations') {
    await page.locator('a[href="?step=business"]').click()
    await page.locator('#field-businessName').fill('')
    await page.locator('#field-operatingSince').fill('2030-01')
    await page.locator('a[href="?step=documents"]').click()
  }
  await uploadBusiness(page, lines)
  const business = page.locator('section[aria-labelledby="business-heading"]')
  await business.getByRole('button', { name: 'Check document', exact: true }).click()
  const assistance = business.getByRole('region', { name: 'Experimental assistance', exact: true })
  await assistance.getByRole('button', { name: 'Run check', exact: true }).click()
  if (scenario === 'missing declarations') {
    await expect(assistance.getByText('Detail missing or invalid. Only its comparison will be skipped.', { exact: true })).toHaveCount(4)
    expect(requests[0].questions).not.toHaveProperty('businessNameSupport')
    expect(requests[0].questions).not.toHaveProperty('operatingSinceSupport')
    await expect(assistance.getByText('Appears to be business evidence', { exact: true })).toBeVisible()
  } else if (scenario === 'unrelated document') {
    await expect(assistance.getByText('Appears to be another document category', { exact: true })).toBeVisible()
    await expect(assistance.getByText('Could not determine. Inspect the source.', { exact: true })).toHaveCount(3)
  } else if (scenario === 'ambiguous entries') {
    await expect(assistance.getByText('Could not determine. Inspect the source.', { exact: true })).toBeVisible()
    await expect(assistance.getByText('Conflicting printed entries for this field', { exact: true })).toBeVisible()
  } else await expect(assistance.getByText('The analysis service is unavailable. Retry explicitly if needed.', { exact: true })).toBeVisible()
  await assistance.getByRole('button', { name: 'Show current source', exact: true }).click()
  await expect(assistance.getByRole('img')).toBeVisible()
  await expect(assistance.getByRole('button', { name: 'Choose replacement', exact: true })).toBeEnabled()
  await expect(assistance.getByRole('button', { name: 'Retain document', exact: true })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Save progress', exact: true })).toBeEnabled()
  expect(requests).toHaveLength(1)
})

test('business correction advice offers only the requested field edit', async ({ page }) => {
  await page.route('**/fake-provider/systemone', route => route.fulfill({ json: nativeBusiness() }))
  await page.goto('/tests/browser/evidence-screen.html?corrections=business')
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await uploadBusiness(page, ['Fictional business evidence', 'Business name: Harbor Supplies', 'Address: 12 Market Street, Aden', 'Address: 90 Port Street, Aden', 'Operating since: 2024-03'])
  const business = page.locator('section[aria-labelledby="business-heading"]')
  await business.getByRole('button', { name: 'Check document', exact: true }).click()
  const assistance = business.getByRole('region', { name: 'Experimental assistance', exact: true })
  const before = await page.evaluate(() => window.demo.readApplication('RIFD-2026-007'))
  await assistance.getByRole('button', { name: 'Run check', exact: true }).click()
  await expect(assistance.getByText('Conflicting printed entries for this field', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => window.demo.readApplication('RIFD-2026-007'))).toEqual(before)
  await expect(assistance.getByRole('button', { name: 'Edit business name', exact: true })).toHaveCount(0)
  await expect(assistance.getByRole('button', { name: 'Edit operating-since month', exact: true })).toHaveCount(0)
  await assistance.getByRole('button', { name: 'Edit business address', exact: true }).click()
  await expect(page.locator('#field-address')).toBeFocused()
  await expect(page.getByRole('button', { name: 'Save progress', exact: true })).toBeEnabled()
})
