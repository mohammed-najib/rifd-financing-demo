import { chooseOption } from '../support/select'
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
  await expect(page.locator('html')).toHaveAttribute('lang', language)
  if (chapter.identity) {
    await page.getByRole('button', { name: identities[chapter.identity][language === 'ar' ? 0 : 1], exact: true }).click()
    await expect(page.locator('main h1')).toHaveText(chapter.identity === 'salma' ? language === 'ar' ? 'قائمة الطلبات' : 'Application queue' : language === 'ar' ? 'طلباتي' : 'My applications')
  }
  const results = []
  for (const [index, route] of chapter.routes.entries()) {
    await page.goto(route)
    await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 60_000 })
    await expect(page.locator('html')).toHaveAttribute('lang', language)
    await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
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
  for (const slot of ['identity', 'business', 'purchase'] as const) {
    const section = page.locator(`section[aria-labelledby="${slot}-heading"]`)
    const opener = section.getByRole('button', { name: ar ? 'معاينة الملف المحفوظ' : 'Preview saved file', exact: true })
    await opener.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: ar ? 'معاينة المستند' : 'Document preview', exact: true })
    await expect(dialog).toBeVisible()
    const labels = { identity: ar ? 'إثبات هوية المتقدم' : 'Applicant identity evidence', business: ar ? 'إثبات النشاط التجاري' : 'Business evidence', purchase: ar ? 'خطة شراء المخزون' : 'Stock purchase plan' }
    await expect(dialog).toHaveAccessibleDescription(labels[slot])
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
  await page.goto('/applications/RIFD-2026-001')
  await page.getByRole('button', { name: ar ? 'معاينة إثبات النشاط التجاري' : 'Preview Business evidence', exact: true }).click()
  await expect(page.getByRole('dialog', { name: ar ? 'معاينة المستند' : 'Document preview', exact: true })).toHaveAccessibleDescription(ar ? 'إثبات النشاط التجاري' : 'Business evidence')
})

for (const language of ['ar', 'en'] as const) test(`${language} applicant-to-reviewer identity switch focuses the settled queue heading`, async ({ page }) => {
  const ar = language === 'ar'
  await page.setViewportSize({ width: 360, height: 950 })
  await page.goto('/sign-in')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 60_000 })
  if (!ar) {
    await page.getByRole('button', { name: 'English', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  }
  await page.getByRole('button', { name: ar ? 'مريم سالم' : 'Mariam Salem', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: ar ? 'طلباتي' : 'My applications', exact: true })).toBeFocused()
  await page.getByRole('button', { name: ar ? 'تغيير الهوية' : 'Switch identity', exact: true }).focus()
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: ar ? 'سلمى ناصر' : 'Salma Nasser', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('main [data-application]')).toHaveCount(5)
  await expect.poll(() => new URL(page.url()).searchParams.get('page')).toBe('1')
  await expect(page.getByRole('heading', { name: ar ? 'قائمة الطلبات' : 'Application queue', exact: true })).toBeFocused()
})

for (const language of ['ar', 'en'] as const) test(`${language} amount separators stay between their displayed operands`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 950 })
  await page.goto('/staff/applications/RIFD-2026-007')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 60_000 })
  if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: language === 'ar' ? 'سلمى ناصر' : 'Salma Nasser', exact: true }).click()
  const comparison = page.getByRole('group', { name: language === 'ar' ? 'توافق مبلغ التمويل مع تكلفة الشراء' : 'Purchase budget coverage', exact: true }).locator('p').filter({ hasText: '≤' })
  const amountCharacterPositions = (element: Element) => {
    const content = element.textContent!
    const separator = content.search(/[≤/]/)
    const first = content.search(/\d/)
    const second = separator + 1 + content.slice(separator + 1).search(/\d/)
    const left = (index: number) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
      let node: Node | null
      while ((node = walker.nextNode())) {
        const length = node.textContent!.length
        if (index < length) {
          const range = document.createRange()
          range.setStart(node, index); range.setEnd(node, index + 1)
          return range.getBoundingClientRect().left
        }
        index -= length
      }
      throw new Error('Displayed amount character missing')
    }
    return { first: left(first), separator: left(separator), second: left(second) }
  }
  await expect(comparison).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const budget = await comparison.evaluate(amountCharacterPositions)
  expect(budget.first).toBeLessThan(budget.separator)
  expect(budget.separator).toBeLessThan(budget.second)
  await page.getByRole('button', { name: language === 'ar' ? 'تغيير الهوية' : 'Switch identity', exact: true }).click()
  await page.getByRole('button', { name: language === 'ar' ? 'مريم سالم' : 'Mariam Salem', exact: true }).click()
  await expect(page.getByRole('heading', { name: language === 'ar' ? 'طلباتي' : 'My applications', exact: true })).toBeVisible()
  await page.goto('/applications/RIFD-2026-001/edit?step=review')
  await expect(page.getByRole('heading', { name: 'RIFD-2026-001', exact: true })).toBeVisible()
  const range = page.locator('aside p').filter({ hasText: language === 'ar' ? '100,000 ر.ي.' : '100,000 YER' })
  await expect(range).toBeVisible()
  const limits = await range.evaluate(amountCharacterPositions)
  expect(limits.first).toBeLessThan(limits.separator)
  expect(limits.separator).toBeLessThan(limits.second)
})

for (const language of ['ar', 'en'] as const) test(`${language} saving a staff note keeps focus on its save button`, async ({ page }) => {
  await page.goto('/staff/applications/RIFD-2026-007')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 60_000 })
  if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: language === 'ar' ? 'سلمى ناصر' : 'Salma Nasser', exact: true }).click()
  const note = page.getByRole('textbox', { name: language === 'ar' ? 'ملاحظة داخلية' : 'Internal note', exact: true })
  await note.fill('Fictional note with keyboard save focus.')
  const save = page.getByRole('button', { name: language === 'ar' ? 'حفظ الملاحظة' : 'Save note', exact: true })
  await save.focus(); await page.keyboard.press('Enter')
  await expect(note).toHaveValue('')
  await expect(save).toBeFocused()
  await expect(page.getByRole('status').filter({ hasText: language === 'ar' ? 'حُفظت نتيجة المراجعة.' : 'Review change saved.' })).toBeVisible()
})

for (const language of ['ar', 'en'] as const) test(`${language} a validation link keeps its focused field visible after step navigation`, async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 950 })
  await page.goto('/applications/RIFD-2026-001/edit?step=review')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 60_000 })
  if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: language === 'ar' ? 'مريم سالم' : 'Mariam Salem', exact: true }).click()
  await page.getByRole('button', { name: language === 'ar' ? 'فحص اكتمال الطلب' : 'Check application', exact: true }).click()
  await expect(page.locator('#validation-summary')).toBeFocused()
  const error = page.locator('#validation-summary a[href="?step=financing#purchase-explanation"]')
  await error.focus(); await page.keyboard.press('Enter')
  const field = page.locator('#purchase-explanation')
  await expect(field).toBeFocused()
  await expect(field).toBeInViewport({ ratio: 1 })
  await expect(page.locator('#purchase-explanation-error')).toBeInViewport()
  await error.focus(); await page.keyboard.press('Enter')
  await expect(field).toBeFocused()
  await expect(field).toBeInViewport({ ratio: 1 })
  await page.getByRole('button', { name: language === 'ar' ? 'تغيير الهوية' : 'Switch identity', exact: true }).click()
  await page.getByRole('button', { name: language === 'ar' ? 'هدى علي' : 'Huda Ali', exact: true }).click()
  await expect(page.getByRole('heading', { name: language === 'ar' ? 'طلباتي' : 'My applications', exact: true })).toBeVisible()
  await page.goto('/applications/RIFD-2026-004/corrections/current')
  await page.getByRole('button', { name: language === 'ar' ? 'إعادة تقديم التصحيحات' : 'Resubmit corrections', exact: true }).click()
  await expect(page.locator('#validation-summary')).toBeFocused()
  for (const id of ['field-amount', 'purchase-file']) {
    await page.locator(`#validation-summary a[href="#${id}"]`).focus(); await page.keyboard.press('Enter')
    await expect(page.locator(`#${id}`)).toBeFocused()
    await expect(page.locator(`#${id}`)).toBeInViewport({ ratio: 1 })
  }
})

for (const language of ['ar', 'en'] as const) test(`${language} queue preference and page feedback keep focus on the active control`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 950 })
  await page.goto('/staff/applications')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 60_000 })
  if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: language === 'ar' ? 'سلمى ناصر' : 'Salma Nasser', exact: true }).click()
  await expect(page.locator('[data-application]')).toHaveCount(5)
  for (const [id, value] of [['queue-product', 'inventory'], ['queue-status', 'submitted'], ['queue-assignment', 'unassigned'], ['queue-sort', 'amountDesc']]) {
    const control = page.locator(`#${id}`)
    await control.focus(); await chooseOption(control, value)
    await expect(page.getByRole('status').filter({ hasText: language === 'ar' ? 'حُفظت عوامل التصفية والترتيب.' : 'Filters and sort saved.' })).toBeVisible()
    await expect(control).toBeFocused()
  }
  const reset = page.getByRole('button', { name: language === 'ar' ? 'إعادة ضبط عوامل التصفية' : 'Reset filters', exact: true })
  await reset.focus(); await page.keyboard.press('Enter')
  await expect(page.getByRole('status').filter({ hasText: language === 'ar' ? 'حُفظت عوامل التصفية والترتيب.' : 'Filters and sort saved.' })).toBeVisible()
  await expect(reset).toBeFocused()
  const next = page.getByRole('button', { name: language === 'ar' ? 'الصفحة التالية' : 'Next page', exact: true })
  for (const number of [2, 3]) {
    await expect(next).toBeEnabled()
    await next.focus(); await page.keyboard.press('Enter')
    await expect(page.getByText(language === 'ar' ? `الصفحة ${number} من 3` : `Page ${number} of 3`, { exact: true })).toBeVisible()
    await expect(page.locator('main [aria-busy="true"]')).toHaveCount(0)
    await expect(next).toBeFocused()
    await expect(next).toBeInViewport({ ratio: 1 })
  }
  const previous = page.getByRole('button', { name: language === 'ar' ? 'الصفحة السابقة' : 'Previous page', exact: true })
  for (const number of [2, 1]) {
    await expect(previous).toBeEnabled()
    await previous.focus(); await page.keyboard.press('Enter')
    await expect(page.getByText(language === 'ar' ? `الصفحة ${number} من 3` : `Page ${number} of 3`, { exact: true })).toBeVisible()
    await expect(page.locator('main [aria-busy="true"]')).toHaveCount(0)
    await expect(previous).toBeFocused()
    await expect(previous).toBeInViewport({ ratio: 1 })
  }
})

for (const language of ['ar', 'en'] as const) test(`${language} empty saved draft fields keep their own public meaning`, async ({ page }) => {
  const ar = language === 'ar'
  await page.goto('/applications/new?product=inventory')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 60_000 })
  if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: ar ? 'عمر حسن' : 'Omar Hassan', exact: true }).click()
  await page.getByRole('button', { name: ar ? 'طلب جديد' : 'New application', exact: true }).click()
  await page.getByRole('button', { name: ar ? 'حفظ التقدم' : 'Save progress', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: ar ? /^محفوظ$/ : /^Saved$/ })).toBeVisible()
  const detail = new URL(page.url()).pathname.replace(/\/edit$/, '')
  for (const route of [detail, `${detail}/print`]) {
    await page.goto(route)
    for (const label of ar ? ['اسم النشاط التجاري', 'عنوان النشاط'] : ['Business name', 'Business address']) {
      const field = page.locator('.information > div').filter({ has: page.getByText(label, { exact: true }) })
      await expect(field.locator('dd')).toHaveText('—')
    }
    const explanation = page.locator('.information > div').filter({ has: page.getByText(ar ? 'شرح الشراء' : 'Purchase explanation', { exact: true }) })
    await expect(explanation.locator('dd')).toHaveText(ar ? 'لم يُكتب شرح الشراء بعد' : 'Purchase explanation not entered yet')
  }
})
