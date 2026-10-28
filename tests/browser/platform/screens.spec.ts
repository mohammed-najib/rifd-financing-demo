import { expect, test } from '@playwright/test'

test('Arabic startup, identity home, language and protected direct links survive refresh', async ({ page }) => {
  await page.goto('/applications/RIFD-2026-002')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByRole('heading', { name: 'اختر هوية تجريبية' })).toBeVisible()
  await page.getByRole('button', { name: 'مريم سالم' }).click()
  await expect(page.getByRole('heading', { name: 'RIFD-2026-002' })).toBeVisible()
  await expect(page.getByText('1,200,000 ر.ي.', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'RIFD-2026-002' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  await page.getByRole('link', { name: 'My applications', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'My applications', exact: true })).toBeVisible()
  await expect(page.locator('[data-application]')).toHaveCount(5)
  await expect(page.getByText('Draft', { exact: true })).toBeVisible()
  await page.goto('/applications/RIFD-2026-004')
  await expect(page.getByRole('heading', { name: 'Application unavailable' })).toBeVisible()
  await expect(page.getByText('متجر الندى التجريبي')).toHaveCount(0)
})

test('staff inspects all submitted records and never sees a draft or private response', async ({ page }) => {
  await page.goto('/staff/applications')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'سلمى ناصر', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'قائمة الطلبات', exact: true })).toBeVisible()
  await expect(page.locator('[data-application]')).toHaveCount(5)
  await page.goto('/staff/applications/RIFD-2026-004')
  await expect(page.getByRole('heading', { name: 'RIFD-2026-004' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'ملاحظات داخلية' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'رد خاص محفوظ' })).toHaveCount(0)
  await expect(page.getByText('600,000 ر.ي.', { exact: true }).first()).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'RIFD-2026-004' })).toBeVisible()
  await page.goto('/staff/applications/RIFD-2026-001')
  await expect(page.getByRole('heading', { name: 'الطلب غير متاح' })).toBeVisible()
  await expect(page.getByText('متجر السهل التجريبي')).toHaveCount(0)
})

test('both languages fit applicant and staff views at agreed widths and keep focus on language switching', async ({ page }, info) => {
  await page.goto('/')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'هدى علي', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'طلباتي', exact: true })).toBeVisible()
  await page.goto('/applications/RIFD-2026-004')
  await expect(page.getByRole('heading', { name: 'رد خاص محفوظ' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'ملاحظات داخلية' })).toHaveCount(0)
  for (const language of ['ar', 'en'] as const) {
    if (language === 'en') {
      const control = page.getByRole('button', { name: 'English', exact: true })
      await control.focus()
      await control.press('Enter')
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      await expect(page.getByRole('button', { name: 'العربية', exact: true })).toBeFocused()
    }
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }
  }
  await page.screenshot({ path: info.outputPath('applicant-correction-en-1440.png'), fullPage: true })
  await page.getByRole('button', { name: 'Switch identity', exact: true }).click()
  await page.getByRole('button', { name: 'Salma Nasser', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Application queue', exact: true })).toBeVisible()
  await expect(page.locator('[data-application]')).toHaveCount(5)
  for (const language of ['en', 'ar'] as const) {
    if (language === 'ar') await page.getByRole('button', { name: 'العربية', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', language)
    for (const width of [360, 390, 767, 768, 1199, 1200, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      await expect(page.getByRole('table')).toHaveCount(width >= 1200 ? 1 : 0)
      await expect(page.getByRole('article')).toHaveCount(width < 1200 ? 5 : 0)
    }
  }
  await page.screenshot({ path: info.outputPath('staff-queue-ar-1440.png'), fullPage: true })
  await page.goto('/staff/applications/RIFD-2026-005')
  await expect(page.getByRole('heading', { name: 'جدول سداد توضيحي افتراضي' })).toBeVisible()
  await expect(page.getByText('144,000 ر.ي.', { exact: true })).toBeVisible()
  await expect(page.getByText('1,152,000 ر.ي.', { exact: true })).toBeVisible()
  await page.setViewportSize({ width: 360, height: 900 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('static assets have their own MIME and the generated shell reveals no protected records', async ({ request }) => {
  const shell = await request.get('/staff/applications/RIFD-2026-005')
  expect(shell.status()).toBe(200)
  const html = await shell.text()
  expect(html).toContain('جارٍ تجهيز العرض التجريبي')
  expect(html).not.toContain('ورشة المدار التجريبية')
  const harness = await request.get('/tests/browser/support/api.html')
  expect(await harness.text()).toBe(html)
  expect(html).not.toContain('/tests/browser/support/api.ts')
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^" ]+)"/g)].map(match => match[1])
  expect(assets.length).toBeGreaterThan(0)
  for (const asset of assets) {
    const response = await request.get(asset)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain(asset.endsWith('.css') ? 'text/css' : 'javascript')
  }
  for (const font of ['NotoSans-Regular.woff2', 'NotoSansArabic-Regular.woff2']) {
    const response = await request.get(`/fonts/${font}`)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).not.toContain('text/html')
  }
  for (const license of ['LICENSE.txt', 'OFL-NotoSans.txt', 'OFL-NotoSansArabic.txt']) {
    expect((await request.get(`/fonts/${license}`)).status()).toBe(200)
  }
})

test('ready main-journey routes and seed resources work offline', async ({ page, context }) => {
  await page.goto('/')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 30_000 })
  await context.setOffline(true)
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'طلباتي', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'الاطلاع على المسودة المحفوظة', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'RIFD-2026-001' })).toBeVisible()
})

test('storage denial shows recovery while public product information remains available', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'indexedDB', { get() { throw new DOMException('Fixture denial', 'SecurityError') } }))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'تعذر تجهيز العرض التجريبي' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'إعادة المحاولة' })).toBeVisible()
  await page.getByRole('link', { name: 'منتجات التمويل', exact: true }).first().click()
  await expect(page.getByRole('heading', { name: /مشروعك\./ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'تمويل المخزون' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'تمويل المعدات' })).toBeVisible()
})

test('an unauthorized unsigned pending link opens the selected identity home', async ({ page }) => {
  await page.goto('/staff/applications')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'طلباتي', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'تسجيل الخروج', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'اختر هوية تجريبية' })).toBeVisible()
  await page.goto('/applications/RIFD-2026-004')
  await expect(page.getByRole('heading', { name: 'اختر هوية تجريبية' })).toBeVisible()
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'طلباتي', exact: true })).toBeVisible()
  await expect(page.getByText('متجر الندى التجريبي')).toHaveCount(0)
})
