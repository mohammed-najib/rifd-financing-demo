import { chooseOption } from '../support/select'
import { expect, test } from '@playwright/test'
import { damageDataset } from '../support/startup-fixtures'

test.describe.configure({ mode: 'parallel' })

test('storage recovery stays usable in both languages and retries without replacing saved work', async ({ page }) => {
  await page.goto('/applications/RIFD-2026-001/edit?step=financing')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: 'Mariam Salem', exact: true }).click()
  await page.getByLabel('Purchase explanation', { exact: true }).fill('Retain my saved explanation')
  await page.getByRole('button', { name: 'Save progress', exact: true }).click()
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  await page.evaluate(damageDataset, 'schema' as const)
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.getByRole('heading', { name: 'The demo could not start', exact: true })).toBeVisible()
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false')
  await expect(page.locator('[data-workspace-ready="true"]')).toHaveCount(0)
  await expect(page.getByLabel('Purchase explanation', { exact: true })).toHaveCount(0)
  if (test.info().project.name === 'chrome') for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `artifacts/browser-evidence/17/recovery-en-${width}.png`, fullPage: true })
  }
  await page.getByRole('button', { name: 'العربية', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'تعذر تجهيز العرض التجريبي', exact: true })).toBeVisible()
  if (test.info().project.name === 'chrome') for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `artifacts/browser-evidence/17/recovery-ar-${width}.png`, fullPage: true })
  }
  await page.getByRole('link', { name: 'منتجات التمويل', exact: true }).first().click()
  await expect(page.getByRole('heading', { name: /مشروعك\./ })).toBeVisible()
  await page.getByRole('link', { name: 'رِفد', exact: false }).first().click()
  await page.evaluate(() => window.repairStartupFixture())
  await page.getByRole('button', { name: 'إعادة المحاولة', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'My applications', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Inspect saved draft', exact: true }).click()
  await page.locator('a[href="?step=financing"]').click()
  await expect(page.getByLabel('Purchase explanation', { exact: true })).toHaveValue('Retain my saved explanation')
})

for (const resource of ['**/fonts/NotoSansArabic-Regular.woff2', '**/assets/*.css*']) test(`${resource} failure offers explicit retry before readiness`, async ({ page }) => {
  await page.route(resource, route => route.abort())
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'تعذر تجهيز العرض التجريبي', exact: true })).toBeVisible()
  await expect(page.locator('[data-workspace-ready="true"]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'مريم سالم', exact: true })).toHaveCount(0)
  await page.unroute(resource)
  await page.getByRole('button', { name: 'إعادة المحاولة', exact: true }).click()
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'طلباتي', exact: true })).toBeVisible()
})

test('route resources arrive with the entry script before readiness', async ({ page, request }) => {
  const shell = await (await request.get('/')).text()
  const entry = shell.match(/<script[^>]*src="([^" ]+)"/)?.[1]
  expect(entry).toBeTruthy()
  const extraScripts: string[] = []
  await page.route('**/assets/*.js', route => {
    if (new URL(route.request().url()).pathname === entry) return route.continue()
    extraScripts.push(route.request().url())
    return route.abort()
  })
  await page.goto('/')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).click()
  await page.getByRole('link', { name: 'الاطلاع على المسودة المحفوظة', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'RIFD-2026-001', exact: true })).toBeVisible()
  expect(extraScripts).toEqual([])
})

test('session storage lost after readiness offers startup recovery at sign-in', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 30_000 })
  await page.evaluate(() => {
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (this === sessionStorage) throw new DOMException('Fixture denial', 'SecurityError')
      return setItem.call(this, key, value)
    }
    window.repairStartupFixture = async () => { Storage.prototype.setItem = setItem }
  })
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'تعذر تجهيز العرض التجريبي', exact: true })).toBeVisible()
  await page.evaluate(() => window.repairStartupFixture())
  await page.getByRole('button', { name: 'إعادة المحاولة', exact: true }).click()
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible()
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'طلباتي', exact: true })).toBeVisible()
})

for (const language of ['ar', 'en'] as const) test(`${language} loaded offline draft, prepared replacement, products and staff routes need no network`, async ({ page, context }) => {
  const ar = language === 'ar'
  await page.goto('/applications/RIFD-2026-001/edit?step=documents')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 30_000 })
  if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click()
  const network: string[] = []
  page.on('request', request => { if (request.url().startsWith('http')) network.push(request.url()) })
  await context.setOffline(true)
  await page.getByRole('button', { name: ar ? 'مريم سالم' : 'Mariam Salem', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'RIFD-2026-001', exact: true })).toBeVisible()
  const purchase = page.getByRole('heading', { name: ar ? 'خطة شراء المخزون' : 'Stock purchase plan', exact: true }).first().locator('..')
  await purchase.getByRole('button', { name: ar ? 'استخدام النموذج' : 'Use sample', exact: true }).click()
  await expect(page.getByText(ar ? 'جاهز للحفظ' : 'Ready to save', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: ar ? 'حفظ التقدم' : 'Save progress', exact: true }).click()
  await expect(page.getByText(ar ? 'محفوظ' : 'Saved', { exact: true })).toBeVisible()
  await purchase.getByRole('button', { name: ar ? 'معاينة الملف المحفوظ' : 'Preview saved file', exact: true }).click()
  await expect(page.getByAltText(ar ? 'المستند المحفوظ' : 'Saved document', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.getByRole('link', { name: ar ? 'طلباتي' : 'My applications', exact: true }).click()
  await page.getByRole('link', { name: ar ? 'الاطلاع على المسودة المحفوظة' : 'Inspect saved draft', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'RIFD-2026-001', exact: true })).toBeVisible()
  await page.getByRole('link', { name: ar ? 'منتجات التمويل' : 'Financing products', exact: true }).first().click()
  await expect(page.getByRole('heading', { name: ar ? 'تمويل المعدات' : 'Equipment financing', exact: true })).toBeVisible()
  await page.getByRole('button', { name: ar ? 'تغيير الهوية' : 'Switch identity', exact: true }).click()
  await page.getByRole('button', { name: ar ? 'هدى علي' : 'Huda Ali', exact: true }).click()
  await page.locator('[data-application="RIFD-2026-004"]').getByRole('link').click()
  await page.locator('a[href^="/applications/RIFD-2026-004/corrections/current"]').first().click()
  const editor = page.getByRole('region', { name: ar ? 'الرد على التصحيحات' : 'Respond to corrections', exact: true })
  await chooseOption(editor.locator('#purchase-sample'), { label: ar ? 'نسخة بديلة' : 'Replacement document' })
  await editor.getByRole('button', { name: ar ? 'استخدام النموذج' : 'Use sample', exact: true }).click()
  await expect(editor.getByText(ar ? 'جاهز للحفظ' : 'Ready to save', { exact: true })).toBeVisible()
  await editor.getByRole('button', { name: ar ? 'حفظ التقدم' : 'Save progress', exact: true }).click()
  await expect(editor.getByText(ar ? 'محفوظ' : 'Saved', { exact: true })).toBeVisible()
  await expect(editor.getByRole('button', { name: ar ? 'معاينة الملف المحفوظ' : 'Preview saved file', exact: true })).toBeVisible()
  await page.getByRole('button', { name: ar ? 'تغيير الهوية' : 'Switch identity', exact: true }).click()
  await page.getByRole('button', { name: ar ? 'سلمى ناصر' : 'Salma Nasser', exact: true }).click()
  await expect(page.getByRole('heading', { name: ar ? 'قائمة الطلبات' : 'Application queue', exact: true })).toBeVisible()
  await page.getByRole('link', { name: `${ar ? 'فتح الطلب' : 'Open application'} RIFD-2026-013`, exact: true }).click()
  await expect(page.getByRole('heading', { name: 'RIFD-2026-013', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: ar ? 'فحوص المراجعة' : 'Review checks', exact: true })).toBeVisible()
  expect(network).toEqual([])
})
