import { expect, test, type Page } from '@playwright/test'

async function ready(page: Page, language: 'ar' | 'en') {
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 120_000 })
  await expect(page.locator('html')).toHaveAttribute('lang', language)
  await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false')
}

test('HTML entry points revalidate before reusing a cached release', async ({ request }) => {
  for (const path of ['/', '/_shell.html', '/products', '/staff/applications/RIFD-2026-007?status=underReview']) {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/html')
    expect(response.headers()['cache-control'] ?? '', path).toMatch(/\bno-cache\b/)
    const html = await response.text()
    const scripts = [...html.matchAll(/<script\b[^>]*src="(\/assets\/[^" ]+\.js)"/g)].map(match => match[1])
    expect(scripts.length).toBeGreaterThan(0)
    for (const script of scripts) {
      const asset = await request.get(script)
      expect(asset.status()).toBe(200)
      expect(asset.headers()['content-type']).toMatch(/javascript/)
    }
  }
})

for (const language of ['ar', 'en'] as const) {
  const ar = language === 'ar'
  test(`${language} public static deep links, shell, assets and refresh`, async ({ page, request }, info) => {
    await page.goto('/products')
    await ready(page, 'ar')
    if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click()
    await ready(page, language)
    for (const [path, heading] of [
      ['/products', ar ? 'مشروعك.وخطوته القادمة.' : 'Your business.Its next chapter.'],
      ['/components', ar ? 'مكونات الواجهة' : 'Interface components'],
      ['/demo/reset', ar ? 'إعادة ضبط العرض' : 'Reset demo'],
      ['/unavailable-route?product=equipment', ar ? 'الطلب غير متاح' : 'Application unavailable'],
      ['/', ar ? 'اختر هوية تجريبية' : 'Choose a demo identity'],
    ]) {
      for (const refresh of [false, true]) {
        if (refresh) await page.reload(); else await page.goto(path)
        await ready(page, language)
        await expect(page.locator('main h1')).toHaveText(heading)
      }
    }
    const html = await (await request.get('/staff/applications/RIFD-2026-007?status=underReview')).text()
    expect(html).toContain('جارٍ تجهيز العرض التجريبي')
    expect(await page.evaluate(html => new DOMParser().parseFromString(html, 'text/html').querySelectorAll('main[aria-busy="true"]').length, html)).toBe(1)
    expect(html).not.toMatch(/متجر الندى|ورشة المدار|سلمى ناصر|\/tests\/browser\/api.ts/)
    expect(await (await request.get('/tests/browser/api.html')).text()).toBe(html)
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^" ]+)"/g)].map(match => match[1])
    expect(assets.length).toBeGreaterThan(1)
    for (const path of [...assets, '/fonts/NotoSans-Regular.woff2', '/fonts/NotoSansArabic-Regular.woff2']) {
      const response = await request.get(`${path}?delivery-gate=22`)
      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toMatch(path.endsWith('.css') ? /text\/css/ : path.endsWith('.js') ? /javascript/ : /font\/woff2/)
      expect(await response.text()).not.toBe(html)
    }
    await info.attach('static-shell.html', { body: html, contentType: 'text/html' })
  })

  for (const identity of ['mariam', 'huda', 'salma'] as const) test(`${language} ${identity} protected direct links, sign-in return, query and safe fallbacks refresh`, async ({ page }) => {
    const staff = identity === 'salma'
    const entry = staff ? '/staff/applications/RIFD-2026-007/decision' : identity === 'huda' ? '/applications/RIFD-2026-004/corrections/current' : '/applications/RIFD-2026-001/edit?step=business'
    await page.addInitScript(() => {
      const text: string[] = []
      Object.assign(window, { initialMainFrames: text })
      const observer = new MutationObserver(() => {
        if (!document.querySelector('[data-workspace-ready="true"]')) text.push(document.querySelector('main')?.textContent ?? '')
      })
      observer.observe(document, { childList: true, subtree: true })
    })
    await page.goto(entry)
    await ready(page, 'ar')
    await expect(page.locator('main h1')).toHaveText('اختر هوية تجريبية')
    expect(await page.evaluate(() => (window as unknown as { initialMainFrames: string[] }).initialMainFrames.join('\n'))).not.toMatch(/متجر الندى|ورشة المدار|متجر السهل/)
    if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click()
    const name = { mariam: ar ? 'مريم سالم' : 'Mariam Salem', huda: ar ? 'هدى علي' : 'Huda Ali', salma: ar ? 'سلمى ناصر' : 'Salma Nasser' }[identity]
    await page.getByRole('button', { name, exact: true }).click()
    await ready(page, language)
    await expect(page).toHaveURL(new RegExp(entry.replace(/[?]/g, '\\?') + '$'))
    const paths = staff ? [
      ['/staff/applications?status=underReview&sort=amountAsc&page=2', '#queue-sort'],
      ['/staff/applications/RIFD-2026-007', '#review-information'],
      ['/staff/applications/RIFD-2026-007/correction-request', '#correction-heading'],
      ['/staff/applications/RIFD-2026-007/decision', '#decision-heading'],
      ['/staff/applications/RIFD-2026-005/print', '.print-summary'],
      ['/staff/applications/RIFD-2026-005/repayment', '#repayment-totals'],
    ] : identity === 'huda' ? [
      ['/applications/RIFD-2026-004/corrections/current', '#purchase-sample'],
      ['/applications/RIFD-2026-004/history', '.timeline'],
      ['/applications/RIFD-2026-004/print', '.print-summary'],
    ] : [
      ['/applications', '[data-application="RIFD-2026-001"]'],
      ['/applications/RIFD-2026-001/edit?step=business', '#field-businessName'],
      ['/applications/RIFD-2026-002/history', '.timeline'],
      ['/applications/RIFD-2026-001/print', '.print-summary'],
      ['/applications/RIFD-2026-005/repayment', '#repayment-totals'],
      ['/applications/RIFD-2026-001/edit?step=invalid', '#field-fullName'],
    ]
    for (const [path, selector] of paths) for (const refresh of [false, true]) {
      if (refresh) await page.reload(); else await page.goto(path)
      await ready(page, language)
      await expect(page.locator('.identity-name')).toContainText(name)
      await expect(page.locator(selector)).toBeVisible()
      if (path.includes('step=business')) await expect(page.locator('#field-businessName')).toHaveValue('متجر السهل التجريبي')
      if (path.includes('sort=amountAsc')) {
        await expect(page.locator('#queue-sort')).toHaveAttribute('data-value', 'amountAsc')
        await expect(page).toHaveURL(/status=underReview.*sort=amountAsc/)
      }
    }
    if (identity === 'mariam') {
      await page.goto('/applications/RIFD-2026-002/repayment')
      await ready(page, language)
      await expect(page).toHaveURL(/\/applications\/RIFD-2026-002$/)
      await expect(page.getByRole('status').filter({ hasText: ar ? 'للطلبات الموافق عليها فقط' : 'only for Approved' })).toBeVisible()
    }
    if (identity === 'huda') {
      await page.goto('/applications/RIFD-2026-004/corrections/current?round=obsolete')
      await ready(page, language)
      await expect(page).toHaveURL(/\/applications\/RIFD-2026-004$/)
      await expect(page.getByRole('status').filter({ hasText: ar ? 'لم يعد طلب التصحيح' : 'no longer active' })).toBeVisible()
    }
    await page.goto(staff ? '/staff/applications/RIFD-2026-001' : '/applications/RIFD-2026-009')
    await ready(page, language)
    await expect(page.locator('main h1')).toHaveText(ar ? 'الطلب غير متاح' : 'Application unavailable')
    await expect(page.locator('main')).not.toContainText('متجر السهل التجريبي')
    await page.getByRole('button', { name: ar ? 'تسجيل الخروج' : 'Sign out', exact: true }).click()
    await page.goto(staff ? '/staff/applications' : '/applications/RIFD-2026-004')
    await ready(page, language)
    await page.getByRole('button', { name: ar ? 'عمر حسن' : 'Omar Hassan', exact: true }).click()
    await expect(page).toHaveURL(/\/applications$/)
    await expect(page.locator('main')).not.toContainText('متجر الندى التجريبي')
  })
}
