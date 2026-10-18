import { expect, test } from '@playwright/test'
import { nativeIdentity } from './evidence-transport'

test('checking one document leaves the other document sections usable and explains missing uploads', async ({ page }) => {
  await page.goto('/tests/browser/evidence-screen.html?new-draft')
  await page.getByRole('button', { name: 'English', exact: true }).click()
  const identity = page.locator('section[aria-labelledby="identity-heading"]')
  const business = page.locator('section[aria-labelledby="business-heading"]')
  await identity.getByRole('button', { name: 'Use sample', exact: true }).click()
  await expect(identity.getByText('Ready to save', { exact: true })).toBeVisible()
  await identity.getByRole('button', { name: 'Check document', exact: true }).click()
  await expect(business.getByRole('button', { name: 'Check document', exact: true })).toBeEnabled()
  await business.getByRole('button', { name: 'Check document', exact: true }).click()
  await expect(business.getByText('Choose a document first, then check it.', { exact: true })).toBeVisible()
  await business.getByRole('button', { name: 'Choose document', exact: true }).click()
  await expect(business.locator('#business-file')).toBeFocused()
})

test('another attached document can be opened while the first provider request is pending', async ({ page }) => {
  let release!: () => void
  const response = new Promise<void>(resolve => { release = resolve })
  let requests = 0
  await page.route('**/fake-provider/systemone', async route => { requests++; await response; await route.fulfill({ json: nativeIdentity() }) })
  try {
    await page.goto('/tests/browser/evidence-screen.html')
    await page.getByRole('button', { name: 'English', exact: true }).click()
    const identity = page.locator('section[aria-labelledby="identity-heading"]')
    const business = page.locator('section[aria-labelledby="business-heading"]')
    await identity.getByRole('button', { name: 'Check document', exact: true }).click()
    await identity.getByRole('button', { name: 'Run check', exact: true }).click()
    await expect.poll(() => requests).toBe(1)
    await business.getByRole('button', { name: 'Check document', exact: true }).click()
    await expect(business.getByRole('button', { name: 'Run check', exact: true })).toBeEnabled()
    await expect(identity.getByRole('button', { name: 'Cancel check', exact: true })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Save progress', exact: true })).toBeEnabled()
    expect(requests).toBe(1)
  } finally { release() }
})

for (const language of ['ar', 'en'] as const) test(`${language} document checks show simple controls and keep process details collapsed`, async ({ page }, info) => {
  const ar = language === 'ar'
  await page.route('**/fake-provider/systemone', route => route.fulfill({ json: nativeIdentity() }))
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/tests/browser/evidence-screen.html')
  if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click()
  const identity = page.locator('section[aria-labelledby="identity-heading"]')
  await identity.getByRole('button', { name: ar ? 'فحص المستند' : 'Check document', exact: true }).click()
  const check = identity.getByRole('region', { name: ar ? 'مساعدة تجريبية' : 'Experimental assistance', exact: true })
  await expect(check.getByText(ar ? 'نطاق التحليل' : 'Analysis coverage', { exact: true })).not.toBeVisible()
  await expect(check.getByText(ar ? 'المصدر والسياق المحددان للفحص' : 'Selected source and context', { exact: true })).not.toBeVisible()
  await expect(check.getByRole('checkbox')).toHaveCount(0)
  await check.getByRole('button', { name: ar ? 'بدء الفحص' : 'Run check', exact: true }).click()
  await expect(check.getByText(ar ? 'يبدو الاسم المطبوع مختلفًا عن الاسم المعلن' : 'Printed name appears different from the declared name', { exact: true })).toBeVisible()
  await expect(check.locator('pre')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await identity.screenshot({ path: info.outputPath(`document-card-${language}-390.png`) })
})
