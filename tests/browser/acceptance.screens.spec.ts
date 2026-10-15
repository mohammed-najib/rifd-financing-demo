import { readFile, writeFile } from 'node:fs/promises'
import { PDFDocument } from 'pdf-lib'
import { expect, test, type Page, type TestInfo } from '@playwright/test'

test.describe.configure({ mode: 'parallel' })
test.setTimeout(180_000)

// These are layout checkpoints, not a substitute for completing the journeys
// or for ordinary-browser keyboard, native zoom and screen-reader acceptance.
const chapters = [
  { name: 'products and application', identity: 'mariam', routes: ['/products', '/applications/RIFD-2026-001/edit?step=personal', '/applications/RIFD-2026-001/edit?step=review'] },
  { name: 'documents and recovery', identity: 'mariam', routes: ['/applications/RIFD-2026-001/edit?step=documents'] },
  { name: 'tracking notifications and print', identity: 'mariam', routes: ['/applications', '/notifications', '/applications/RIFD-2026-005/history', '/applications/RIFD-2026-005/print'] },
  { name: 'queue and assignment', identity: 'salma', routes: ['/staff/applications', '/staff/applications/RIFD-2026-003'] },
  { name: 'review and corrections', identity: 'huda', routes: ['/applications/RIFD-2026-004/corrections/current'] },
  { name: 'decisions and repayment', identity: 'salma', routes: ['/staff/applications/RIFD-2026-007', '/staff/applications/RIFD-2026-007/decision', '/staff/applications/RIFD-2026-005/repayment'] },
  { name: 'access sessions and reset', identity: null, routes: ['/components', '/demo/reset', '/sign-in'] },
] as const
const identities = { mariam: ['مريم سالم', 'Mariam Salem'], huda: ['هدى علي', 'Huda Ali'], salma: ['سلمى ناصر', 'Salma Nasser'] } as const

async function capture(page: Page, info: TestInfo, name: string, widths: number[]) {
  const results = []
  await page.evaluate(() => document.fonts.ready)
  for (const width of widths) {
    await page.setViewportSize({ width, height: 950 })
    const layout = await page.evaluate(() => ({
      width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      language: document.documentElement.lang, direction: document.documentElement.dir,
      clippedControls: [...document.querySelectorAll('main button, main input, main select, main textarea, main a.button')].filter(element => {
        const box = element.getBoundingClientRect()
        return box.width > 0 && box.height > 0 && (box.left < -1 || box.right > innerWidth + 1)
      }).map(element => element.textContent || element.getAttribute('aria-label') || element.id),
    }))
    expect(layout.scrollWidth, `${name}, ${width}px page overflow`).toBeLessThanOrEqual(width)
    expect(layout.clippedControls, `${name}, ${width}px clipped actions`).toEqual([])
    const screenshot = `${name}-${width}.png`
    await page.screenshot({ path: info.outputPath(screenshot), fullPage: true })
    results.push({ route: new URL(page.url()).pathname + new URL(page.url()).search, ...layout, screenshot })
  }
  return results
}

for (const language of ['ar', 'en'] as const) for (const chapter of chapters) test(`${language} layout checkpoints: ${chapter.name}`, async ({ page, browser }, info) => {
  await page.goto('/sign-in')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 60_000 })
  if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click()
  if (chapter.identity) {
    await page.getByRole('button', { name: identities[chapter.identity][language === 'ar' ? 0 : 1], exact: true }).click()
    await expect(page.locator('main h1')).toHaveText(chapter.identity === 'salma' ? language === 'ar' ? 'قائمة الطلبات' : 'Application queue' : language === 'ar' ? 'طلباتي' : 'My applications')
  }
  const results = []
  for (const [index, route] of chapter.routes.entries()) {
    await page.goto(route)
    await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 60_000 })
    await expect(page.locator('main h1')).toBeVisible({ timeout: 60_000 })
    // The gallery intentionally includes a permanent busy example.
    if (route !== '/components') await expect(page.locator('main [aria-busy="true"]')).toHaveCount(0, { timeout: 30_000 })
    const widths = route === '/staff/applications' || route === '/components' || route.includes('/decision') || route.endsWith('007')
      ? [360, 390, 767, 768, 1199, 1200, 1440] : [360, 390, 768, 1440]
    results.push(...await capture(page, info, `stop-${index}-${language}`, widths))
    if (route === '/staff/applications') {
      await expect(page.getByRole('table')).toBeVisible()
      await page.setViewportSize({ width: 1199, height: 950 })
      await expect(page.getByRole('table')).toHaveCount(0)
      await expect(page.locator('main article')).toHaveCount(5)
    }
  }
  await writeFile(info.outputPath('checkpoints.json'), JSON.stringify({ browser: info.project.name, version: browser.version(), capturedAt: new Date().toISOString(), chapter: chapter.name, language, results }, null, 2) + '\n')
})

for (const language of ['ar', 'en'] as const) test(`${language} real saved PDF JPEG and PNG preview after refresh`, async ({ page }, info) => {
  const ar = language === 'ar'
  await page.goto('/applications/RIFD-2026-001/edit?step=documents')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 60_000 })
  if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: ar ? 'مريم سالم' : 'Mariam Salem', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'RIFD-2026-001', exact: true })).toBeVisible()
  await page.reload()
  for (const slot of ['identity', 'business', 'purchase']) {
    const section = page.locator(`section[aria-labelledby="${slot}-heading"]`)
    const opener = section.getByRole('button', { name: ar ? 'معاينة الملف المحفوظ' : 'Preview saved file', exact: true })
    await opener.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: ar ? 'معاينة المستند' : 'Document preview', exact: true })
    await expect(dialog).toBeVisible()
    const download = dialog.getByRole('link', { name: ar ? 'تنزيل الملف' : 'Download file', exact: true })
    await expect(download).toBeVisible()
    if (slot === 'business') await expect(dialog.locator('object[type="application/pdf"]')).toBeVisible()
    else {
      const image = dialog.getByRole('img')
      await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBe(1000)
      expect(await image.evaluate(element => (element as HTMLImageElement).naturalHeight)).toBe(1320)
    }
    const received = page.waitForEvent('download')
    await download.click()
    const file = await received
    const bytes = await readFile((await file.path())!)
    if (slot === 'business') expect((await PDFDocument.load(bytes)).getPageCount()).toBe(2)
    else if (slot === 'identity') expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
    else expect(bytes.subarray(0, 3).toString('hex')).toBe('ffd8ff')
    await file.saveAs(info.outputPath(file.suggestedFilename()))
    for (const width of [360, 1440]) {
      await page.setViewportSize({ width, height: 950 })
      const bounds = await dialog.boundingBox()
      expect(bounds).not.toBeNull()
      expect(bounds!.width).toBeLessThanOrEqual(width)
      await page.screenshot({ path: info.outputPath(`preview-${slot}-${language}-${width}.png`) })
    }
    await download.focus()
    await page.keyboard.press('Tab')
    await expect(dialog.getByRole('button', { name: ar ? 'إغلاق المعاينة' : 'Close preview', exact: true })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(download).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(opener).toBeFocused()
  }
})
