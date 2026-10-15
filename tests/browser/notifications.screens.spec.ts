import { expect, test } from '@playwright/test'

for (const language of ['ar', 'en'] as const) test(`notifications persist read state and open the current correction record in ${language}`, async ({ page }) => {
  const ar = language === 'ar'
  await page.goto('/notifications')
  await page.getByRole('button', { name: 'هدى علي', exact: true }).click()
  if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click()
  await expect(page.getByRole('heading', { name: ar ? 'الإشعارات' : 'Notifications', exact: true })).toBeVisible()
  const notice = page.locator('[data-notification="RIFD-2026-004-notice"]')
  await expect(notice).toContainText(ar ? 'غير مقروء' : 'Unread')
  await notice.getByRole('button', { name: ar ? 'تحديد كمقروء' : 'Mark as read', exact: true }).click()
  await expect(notice).toContainText(ar ? 'مقروء' : 'Read')
  await page.reload()
  await expect(notice.getByRole('button')).toHaveCount(0)
  const open = notice.getByRole('link', { name: ar ? 'فتح الطلب الحالي' : 'Open current application', exact: true })
  await open.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/applications/RIFD-2026-004/corrections/current')
  await expect(page.locator('main h1')).toBeFocused()
  await expect(page.getByText(ar ? 'المعلومات المقدمة' : 'Submitted information', { exact: true })).toBeVisible()
})

test('read flags synchronize across tabs while identity changes and expiry hide protected notices', async ({ page, context }) => {
  await page.goto('/notifications')
  await page.getByRole('button', { name: 'هدى علي', exact: true }).click()
  await page.getByRole('button', { name: 'English', exact: true }).click()
  const notice = page.locator('[data-notification="RIFD-2026-004-notice"]')
  await expect(notice.getByRole('button', { name: 'Mark as read', exact: true })).toBeVisible()
  const other = await context.newPage()
  await other.goto('/notifications')
  await other.getByRole('button', { name: 'Huda Ali', exact: true }).click()
  await other.locator('[data-notification="RIFD-2026-004-notice"]').getByRole('button', { name: 'Mark as read', exact: true }).click()
  await expect(notice.getByRole('button')).toHaveCount(0)
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.getByRole('button', { name: 'Expire session', exact: true }).click()
  await expect(page.locator('[data-notification]')).toHaveCount(0)
  await page.getByRole('button', { name: 'Mariam Salem', exact: true }).click()
  await expect(page).toHaveURL('/applications')
  await page.goto('/notifications')
  await expect(page.locator('[data-notification]')).toHaveCount(1)
  await expect(page.locator('main')).not.toContainText('RIFD-2026-004')
})

test('an uncertain read offers inspection before retry and inspection shows its committed flag', async ({ page }) => {
  await page.goto('/notifications')
  await page.getByRole('button', { name: 'هدى علي', exact: true }).click()
  await page.getByRole('button', { name: 'English', exact: true }).click()
  const notice = page.locator('[data-notification="RIFD-2026-004-notice"]')
  await expect(notice.getByRole('button', { name: 'Mark as read', exact: true })).toBeVisible()
  await page.evaluate(() => {
    const transaction = IDBDatabase.prototype.transaction
    let loseNext = true
    IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase['transaction']>) {
      const tx = transaction.apply(this, args)
      if (args[1] === 'readwrite' && loseNext) { loseNext = false; Object.defineProperty(tx, 'oncomplete', { configurable: true, set() { /* Lost completion. */ } }) }
      return tx
    }
  })
  await notice.getByRole('button', { name: 'Mark as read', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Inspect notification state', exact: true })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Inspect notification state', exact: true }).click()
  await expect(notice.getByRole('button')).toHaveCount(0)
  await expect(page.getByRole('alert')).toHaveCount(0)
})
