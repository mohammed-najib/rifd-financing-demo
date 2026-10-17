import { chooseOption } from './select'
import { expect, test } from '@playwright/test'

async function completeSavedDraft(page: import('@playwright/test').Page, explanation = 'Fictional stock for this established small business.') {
  await page.goto('/applications/RIFD-2026-001/edit?step=financing')
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).click()
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.locator('#purchase-explanation').fill(explanation)
  await page.getByRole('link', { name: '5. Review', exact: true }).click()
}

for (const language of ['ar', 'en'] as const) test(`complete first submission, linked validation, failure and read-only tracking in ${language}`, async ({ page }, info) => {
  const ar = language === 'ar'
  await page.goto('/applications/new?product=equipment')
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).click()
  if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: ar ? 'طلب جديد' : 'New application', exact: true }).click()
  await page.getByRole('link', { name: ar ? '5. المراجعة' : '5. Review', exact: true }).click()
  const submit = page.getByRole('button', { name: ar ? 'تقديم الطلب' : 'Submit application', exact: true })
  await submit.click()
  await expect(page.locator('#validation-summary')).toBeFocused()
  await page.locator('#validation-summary').getByRole('link', { name: ar ? /اسم النشاط التجاري/ : /Business name/ }).click()
  await expect(page.locator('#field-businessName')).toBeFocused()
  await page.locator('#field-businessName').fill('نشاط مريم DEMO')
  await chooseOption(page.locator('#field-activity'), 'production')
  await page.locator('#field-address').fill('Fictional Market Street, Taiz')
  await page.locator('#field-operatingSince').fill('٢٠٢٦-٠٨')
  await page.locator('#field-revenue').fill('٩٠٠٬٠٠٠')
  await page.locator('#field-expenses').fill('٦٠٠٬٠٠٠')
  await page.getByRole('link', { name: ar ? '3. التمويل' : '3. Financing', exact: true }).click()
  await page.locator('#field-amount').fill('١٬٢٠٠٬٠٠٠')
  await page.locator('#field-term').fill('١٨')
  await page.locator('#field-budget').fill('١٬٣٠٠٬٠٠٠')
  await page.locator('#purchase-explanation').fill('Fictional productive equipment for this small business.')
  await page.getByRole('link', { name: ar ? '4. المستندات' : '4. Documents', exact: true }).click()
  for (const slot of ['identity', 'business', 'financial', 'purchase']) {
    const section = page.locator(`section[aria-labelledby="${slot}-heading"]`)
    await section.getByRole('button', { name: ar ? 'استخدام النموذج' : 'Use sample', exact: true }).click()
    await expect(section.getByText(ar ? 'جاهز للحفظ' : 'Ready to save', { exact: true })).toBeVisible()
  }
  await page.locator('.demo-controls summary').click()
  await chooseOption(page.locator('#next-failure'), 'submission')
  await page.getByRole('link', { name: ar ? '5. المراجعة' : '5. Review', exact: true }).click()
  await submit.click()
  await expect(page.getByRole('alert')).toContainText(ar ? 'فشل' : 'failed')
  await expect(page.getByRole('heading', { name: ar ? 'إعداد المسودة' : 'Prepare draft', exact: true })).toBeVisible()
  await expect(page.getByText('Fictional productive equipment for this small business.', { exact: true })).toBeVisible()
  await chooseOption(page.locator('#next-failure'), '')
  await page.getByLabel(ar ? 'طلبات بطيئة' : 'Slow requests', { exact: true }).check()
  await submit.click()
  await expect(submit).toBeDisabled()
  await expect(page.getByText(ar ? 'جارٍ تقديم الطلب' : 'Submitting application', { exact: true })).toBeVisible()
  await expect(page).toHaveURL(/\/applications\/RIFD-2026-[a-z0-9-]+$/)
  await expect(page.getByRole('status')).toContainText(ar ? 'قُدم طلبك' : 'Your application was submitted')
  const reference = await page.locator('main h1').innerText()
  await expect(page.getByRole('heading', { name: ar ? 'المعلومات المقدمة' : 'Submitted information', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: ar ? 'سجل الطلب' : 'Application history', exact: true })).toBeVisible()
  await expect(page.locator('.timeline li')).toHaveCount(1)
  await expect(page.locator('input, textarea, select')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: ar ? 'فحوص المراجعة' : 'Review checks', exact: true })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: ar ? 'ملاحظات داخلية' : 'Internal notes', exact: true })).toHaveCount(0)
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.setViewportSize({ width: ar ? 390 : 1440, height: 900 })
  await page.screenshot({ path: info.outputPath(`submitted-${language}.png`), fullPage: true })
  await page.reload()
  await expect(page.getByRole('heading', { name: reference, exact: true })).toBeVisible()
  await expect(page.locator('.timeline li')).toHaveCount(1)
  await page.getByRole('link', { name: ar ? 'طلباتي' : 'My applications', exact: true }).click()
  const card = page.locator(`[data-application="${reference}"]`)
  await expect(card).toContainText(ar ? 'مقدم' : 'Submitted')
  await card.getByRole('link', { name: ar ? 'الاطلاع على الطلب' : 'View application', exact: true }).click()
  await expect(page.getByRole('heading', { name: reference, exact: true })).toBeVisible()
  await expect(page.locator('.timeline li')).toHaveCount(1)
})

test('a pending or failed replacement blocks submission even when the slot has a saved file', async ({ page }) => {
  await completeSavedDraft(page)
  await page.getByRole('link', { name: '4. Documents', exact: true }).click()
  await page.locator('.demo-controls summary').click()
  await chooseOption(page.locator('#next-failure'), 'upload')
  await page.getByLabel('Slow requests', { exact: true }).check()
  const slot = page.locator('section[aria-labelledby="purchase-heading"]')
  await slot.getByRole('button', { name: 'Use sample', exact: true }).click()
  await page.getByRole('link', { name: '5. Review', exact: true }).click()
  await page.getByRole('button', { name: 'Submit application', exact: true }).click()
  await expect(page.locator('#validation-summary')).toBeFocused()
  await expect(page.locator('#validation-summary')).toContainText('Stock purchase plan')
  await page.locator('#validation-summary').getByRole('link', { name: /Stock purchase plan/ }).click()
  await expect(page.locator('#purchase-file')).toBeFocused()
  await expect(slot.getByText('Preparation failed', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: '5. Review', exact: true }).click()
  await page.getByRole('button', { name: 'Submit application', exact: true }).click()
  await expect(page.locator('#validation-summary')).toBeFocused()
  await page.getByRole('link', { name: '4. Documents', exact: true }).click()
  await slot.getByRole('button', { name: 'Discard unsaved selection', exact: true }).click()
  await page.getByRole('link', { name: '5. Review', exact: true }).click()
  await page.getByRole('button', { name: 'Submit application', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Submitted information', exact: true })).toBeVisible()
})

test('expiry retains a pending submission for inspection and explicit retry after the same identity returns', async ({ page }) => {
  await completeSavedDraft(page)
  await page.locator('.demo-controls summary').click()
  await page.getByLabel('Slow requests', { exact: true }).check()
  await page.getByRole('button', { name: 'Submit application', exact: true }).click()
  await page.getByRole('button', { name: 'Expire session', exact: true }).click()
  await page.getByRole('button', { name: 'Mariam Salem', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Inspect submission outcome', exact: true })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('heading', { name: 'Prepare draft', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Inspect submission outcome', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Submit application', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Submit application', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Your application was submitted' })).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.timeline li')).toHaveCount(1)
})

test('unknown publication completion is inspected before success and never repeats the submission', async ({ page }) => {
  await completeSavedDraft(page)
  await page.evaluate(() => {
    const transaction = IDBDatabase.prototype.transaction
    let loseNext = true
    IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase['transaction']>) {
      const tx = transaction.apply(this, args)
      if (args[1] === 'readwrite' && loseNext) {
        loseNext = false
        Object.defineProperty(tx, 'oncomplete', { configurable: true, set() { /* Lost final observation at the storage boundary. */ } })
      }
      return tx
    }
  })
  await page.getByRole('button', { name: 'Submit application', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Inspect submission outcome', exact: true })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('button', { name: 'Submit application', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Inspect submission outcome', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Your application was submitted' })).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.timeline li')).toHaveCount(1)
})

test('publication in another tab refreshes authority and keeps unapplied input separate from submitted information', async ({ page, context }) => {
  await completeSavedDraft(page, 'My unapplied text must stay private in this tab.')
  const other = await context.newPage()
  await other.goto('/applications/RIFD-2026-001/edit?step=financing')
  await other.getByRole('button', { name: 'Mariam Salem', exact: true }).click()
  await other.locator('#purchase-explanation').fill('The other tab publishes this fictional stock purchase.')
  await other.getByRole('link', { name: '5. Review', exact: true }).click()
  await other.getByRole('button', { name: 'Submit application', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Submitted information', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Your unapplied changes', exact: true })).toBeVisible()
  await page.locator('section[aria-labelledby="retained-heading"] summary').click()
  await expect(page.getByText('My unapplied text must stay private in this tab.', { exact: true })).toBeVisible()
  await expect(page.getByText('The other tab publishes this fictional stock purchase.', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Submit application', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Discard changes', exact: true }).click()
  await page.getByRole('link', { name: 'My applications', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('[data-application="RIFD-2026-001"]')).toContainText('View application')
})

test('an unsaved new application committed before expiry returns to read-only detail with receipt inspection', async ({ page }) => {
  test.setTimeout(90_000)
  await page.goto('/applications/new?product=equipment')
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).click()
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: 'New application', exact: true }).click()
  await page.getByRole('link', { name: '2. Business', exact: true }).click()
  for (const [field, value] of Object.entries({ businessName: 'Fictional workshop', address: 'Fictional Market Street', operatingSince: '2025-01', revenue: '900000', expenses: '600000' })) await page.locator(`#field-${field}`).fill(value)
  await page.getByRole('link', { name: '3. Financing', exact: true }).click()
  for (const [field, value] of Object.entries({ amount: '1200000', term: '18', budget: '1300000' })) await page.locator(`#field-${field}`).fill(value)
  await page.locator('#purchase-explanation').fill('Fictional productive equipment for this workshop.')
  await page.getByRole('link', { name: '4. Documents', exact: true }).click()
  for (const slot of ['identity', 'business', 'financial', 'purchase']) {
    const section = page.locator(`section[aria-labelledby="${slot}-heading"]`)
    await section.getByRole('button', { name: 'Use sample', exact: true }).click()
    await expect(section.getByText('Ready to save', { exact: true })).toBeVisible()
  }
  await page.getByRole('link', { name: '5. Review', exact: true }).click()
  await page.evaluate(() => {
    const transaction = IDBDatabase.prototype.transaction
    let loseNext = true
    IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase['transaction']>) {
      const tx = transaction.apply(this, args)
      if (args[1] === 'readwrite' && loseNext) {
        loseNext = false
        Object.defineProperty(tx, 'oncomplete', { configurable: true, set() { /* Lost completion after a committed new application. */ } })
      }
      return tx
    }
  })
  await page.getByRole('button', { name: 'Submit application', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Inspect submission outcome', exact: true })).toBeVisible({ timeout: 15_000 })
  await page.getByRole('button', { name: 'Expire session', exact: true }).click()
  await page.getByRole('button', { name: 'Mariam Salem', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Submitted information', exact: true })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('heading', { name: 'Your unapplied changes', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Inspect submission outcome', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Your application was submitted' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Your unapplied changes', exact: true })).toHaveCount(0)
  await expect(page.locator('.timeline li')).toHaveCount(1)
  await page.getByRole('link', { name: 'My applications', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
