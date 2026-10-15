import { expect, test, type Page } from '@playwright/test'

test.describe.configure({ mode: 'parallel' })

async function signIn(page: Page, path: string, name: string, language: 'ar' | 'en' = 'en') {
  await page.goto(path)
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 30_000 })
  if (await page.locator('html').getAttribute('lang') !== language) await page.getByRole('button', { name: language === 'en' ? 'English' : 'العربية', exact: true }).click()
  await page.getByRole('button', { name, exact: true }).click()
  await expect(page.locator('.identity-name')).toContainText(name)
}

for (const language of ['ar', 'en'] as const) test(`${language} historical repayment preserves dated rows and totals through refresh and a later browser date`, async ({ page }) => {
  const ar = language === 'ar'
  await page.clock.install()
  await signIn(page, '/applications/RIFD-2026-005/repayment', ar ? 'مريم سالم' : 'Mariam Salem', language)
  const heading = page.getByRole('heading', { level: 1, name: ar ? 'جدول سداد توضيحي افتراضي' : 'Fictional repayment illustration', exact: true })
  await expect(heading).toBeFocused()
  const overview = page.getByRole('region', { name: ar ? 'جدول سداد توضيحي افتراضي' : 'Fictional repayment illustration', exact: true })
  for (const amount of ar ? ['1,200,000 ر.ي.', '96,000 ر.ي.', '1,296,000 ر.ي.', '144,000 ر.ي.', '1,152,000 ر.ي.'] : ['1,200,000 YER', '96,000 YER', '1,296,000 YER', '144,000 YER', '1,152,000 YER']) await expect(overview.getByText(amount, { exact: true }).first()).toBeVisible()
  const rows = overview.getByRole('list', { name: ar ? 'أقساط السداد التوضيحية' : 'Illustrated installments' }).getByRole('listitem')
  await expect(rows).toHaveCount(18)
  await expect(rows.filter({ hasText: ar ? 'مكتمل' : 'Completed' })).toHaveCount(2)
  await expect(rows.filter({ hasText: ar ? 'قادم' : 'Upcoming' })).toHaveCount(16)
  await expect(rows.first()).toContainText(ar ? '15 أغسطس 2026' : '15 August 2026')
  await expect(rows.last()).toContainText(ar ? '15 يناير 2028' : '15 January 2028')
  await expect(overview.getByText(ar ? '15 أكتوبر 2026' : '15 October 2026', { exact: true })).toHaveCount(2)
  await expect(overview.getByText(ar ? '72,000 ر.ي.' : '72,000 YER', { exact: true })).toHaveCount(19)
  await expect(overview.getByText(ar ? 'هذا مثال افتراضي للقراءة فقط. لا تُعالج أي مدفوعات، ولا يغيّر مرور التاريخ حالة الأقساط.' : 'This is a read-only fictional illustration. No payments are processed, and passing dates do not change installments.', { exact: true })).toBeVisible()
  await expect(overview.getByRole('button')).toHaveCount(0)
  await expect(overview.getByRole('textbox')).toHaveCount(0)
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.reload()
  await expect(rows).toHaveCount(18)
  await page.clock.setSystemTime(new Date('2035-06-20T12:00:00Z'))
  await page.reload()
  await page.getByRole('button', { name: ar ? 'مريم سالم' : 'Mariam Salem', exact: true }).click()
  await expect(rows.filter({ hasText: ar ? 'مكتمل' : 'Completed' })).toHaveCount(2)
  await expect(overview.getByText(ar ? '1,152,000 ر.ي.' : '1,152,000 YER', { exact: true })).toBeVisible()
  const back = page.getByRole('link', { name: ar ? 'العودة إلى الطلب' : 'Back to application', exact: true })
  await back.focus(); await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/applications\/RIFD-2026-005$/)
  const open = page.getByRole('link', { name: ar ? 'عرض جدول السداد' : 'View repayment overview', exact: true })
  await open.focus(); await page.keyboard.press('Enter')
  await expect(heading).toBeFocused()
})

for (const [name, ids] of [
  ['Mariam Salem', ['001', '002', '007']],
  ['Huda Ali', ['004']],
  ['Omar Hassan', ['006']],
] as const) test(`${name} returns non-approved repayment links to own permitted detail`, async ({ page }) => {
  await signIn(page, `/applications/RIFD-2026-${ids[0]}/repayment`, name)
  for (const id of ids) {
    await page.goto(`/applications/RIFD-2026-${id}/repayment`)
    await expect(page).toHaveURL(new RegExp(`/applications/RIFD-2026-${id}$`))
    await expect(page.getByRole('status').filter({ hasText: 'The repayment illustration is available only for Approved applications.' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Illustrated installments', exact: true })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'View repayment overview', exact: true })).toHaveCount(0)
  }
})

test('staff can read approved repayment and preserve the queue query while other submitted states return to detail', async ({ page }) => {
  const query = '?status=approved&page=2'
  await signIn(page, `/staff/applications/RIFD-2026-005/repayment${query}`, 'سلمى ناصر', 'ar')
  await expect(page.getByRole('list', { name: 'أقساط السداد التوضيحية', exact: true }).getByRole('listitem')).toHaveCount(18)
  await expect(page.getByRole('heading', { name: 'ملاحظات داخلية', exact: true })).toHaveCount(0)
  await page.reload()
  await page.getByRole('link', { name: 'العودة إلى الطلب', exact: true }).click()
  await expect(page).toHaveURL(`/staff/applications/RIFD-2026-005${query}`)
  await expect(page.getByRole('link', { name: 'عرض جدول السداد', exact: true })).toHaveAttribute('href', `/staff/applications/RIFD-2026-005/repayment${query}`)
  await page.getByRole('link', { name: 'العودة إلى القائمة', exact: true }).click()
  await expect(page).toHaveURL(new RegExp('/staff/applications\\?'))
  for (const id of ['002', '004', '006', '007']) {
    await page.goto(`/staff/applications/RIFD-2026-${id}/repayment${query}`)
    await expect(page).toHaveURL(`/staff/applications/RIFD-2026-${id}${query}`)
    await expect(page.getByRole('status').filter({ hasText: 'يظهر جدول السداد التوضيحي للطلبات الموافق عليها فقط.' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'أقساط السداد التوضيحية', exact: true })).toHaveCount(0)
  }
})

test('forbidden repayment destinations stay neutral and sign-in resumes only permitted records', async ({ page }) => {
  await signIn(page, '/applications/RIFD-2026-005/repayment', 'Huda Ali')
  await expect(page).toHaveURL(/\/applications$/)
  for (const path of ['/applications/RIFD-2026-005/repayment', '/staff/applications/RIFD-2026-005/repayment', '/applications/RIFD-2026-missing/repayment']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: 'Application unavailable', exact: true })).toBeVisible()
    await expect(page.getByText('1,296,000 YER', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Fictional repayment illustration', exact: true })).toHaveCount(0)
  }
  await page.getByRole('banner').getByRole('button', { name: 'Switch identity', exact: true }).click()
  await page.getByRole('button', { name: 'Salma Nasser', exact: true }).click()
  await expect(page.locator('.identity-name')).toContainText('Salma Nasser')
  for (const path of ['/staff/applications/RIFD-2026-001/repayment', '/applications/RIFD-2026-005/repayment']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: 'Application unavailable', exact: true })).toBeVisible()
  }
})
