import { chooseOption } from './select'
import { expect, test } from '@playwright/test'

test.setTimeout(120_000)

test('the static production stylesheet supplies Tailwind layout, tokens and invalid field borders', async ({ page, request }) => {
  await page.goto('/components')
  await expect(page.getByRole('heading', { name: 'مكونات الواجهة', exact: true })).toBeVisible({ timeout: 90_000 })
  const href = await page.locator('link[rel="stylesheet"][href^="/assets/"]').first().getAttribute('href')
  if (!href) throw new Error('No production stylesheet')
  const css = await request.get(href)
  expect(css.headers()['content-type']).toContain('text/css')
  expect(await css.text()).toContain('tailwindcss v4.3.3')
  for (const language of ['ar', 'en'] as const) {
    if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click()
    const amount = page.getByRole('textbox', { name: language === 'ar' ? 'مبلغ التمويل' : 'Financing amount', exact: true })
    await amount.fill('1,00,000')
    await expect(amount).toHaveCSS('border-top-color', 'rgb(196, 107, 91)')
    const grid = page.getByRole('region', { name: language === 'ar' ? 'الحقول والتحقق' : 'Fields and validation', exact: true }).locator('.grid')
    for (const width of [767, 768]) {
      await page.setViewportSize({ width, height: 900 })
      await expect(grid).toHaveCSS('display', 'grid')
      expect(await grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(width === 767 ? 1 : 2)
      await expect(page.locator('html')).toHaveCSS('color', 'rgb(50, 46, 40)')
    }
  }
})

test('unsigned visitors can enter and refresh the bilingual production gallery', async ({ page }) => {
  await page.goto('/components')
  await expect(page.getByRole('heading', { name: 'مكونات الواجهة', exact: true })).toBeVisible({ timeout: 90_000 })
  await expect(page.getByRole('heading', { name: 'اختر هوية تجريبية' })).toHaveCount(0)
  await expect(page.getByText('مطلوب تصحيح', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Interface components', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Interface components', exact: true })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  await page.getByRole('link', { name: 'Financing products', exact: true }).first().click()
  await page.getByRole('link', { name: 'Interface components', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Interface components', exact: true })).toBeVisible()
})

test('attachment examples distinguish selection, preparation, saving and failed replacements', async ({ page }) => {
  await page.goto('/components')
  await expect(page.getByRole('heading', { name: 'مكونات الواجهة', exact: true })).toBeVisible({ timeout: 90_000 })
  await page.getByRole('button', { name: 'English', exact: true }).click()
  const attachments = page.getByRole('region', { name: 'Attachment preparation and save', exact: true })
  for (const label of ['Selected file, unsaved', 'Preparing file', 'Ready to save', 'Preparation failed']) await expect(attachments.getByText(label, { exact: true })).toBeVisible()
  await expect(attachments.getByRole('progressbar', { name: 'Preparing file' })).toHaveAttribute('value', '50')
  await attachments.getByRole('button', { name: 'Discard unsaved selection', exact: true }).first().click()
  await expect(attachments.getByText('Selected file, unsaved', { exact: true })).toHaveCount(0)
  await expect(attachments.getByText('Preparation failed', { exact: true })).toBeVisible()
  await attachments.getByRole('button', { name: 'Retry preparation', exact: true }).click()
  await expect(attachments.getByText('Preparation failed', { exact: true })).toHaveCount(0)
  await expect(attachments.getByText('Ready to save', { exact: true })).toHaveCount(2)
  await expect(attachments.getByRole('button', { name: 'Preview saved file', exact: true })).toBeVisible()
})

test('gallery fields, feedback, queue views and keyboard dialog work in both directions', async ({ page }, info) => {
  await page.goto('/components')
  await expect(page.getByRole('heading', { name: 'مكونات الواجهة', exact: true })).toBeVisible({ timeout: 90_000 })
  for (const language of ['ar', 'en'] as const) {
    if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click()
    const states = page.getByRole('region', { name: language === 'ar' ? 'حالات الطلب والمراجعة' : 'Application and review states', exact: true })
    const labels = language === 'ar'
      ? ['مسودة', 'مقدم', 'قيد المراجعة', 'مطلوب تصحيح', 'موافق عليه', 'مرفوض', 'لم يُرفق مستند', 'بانتظار التقييم', 'مقبول', 'يحتاج إلى استبدال', 'لم يُفحص', 'اجتاز', 'لم يجتز']
      : ['Draft', 'Submitted', 'Under review', 'Corrections requested', 'Approved', 'Rejected', 'No document supplied', 'Awaiting review', 'Accepted', 'Needs replacement', 'Unchecked', 'Passed', 'Failed']
    for (const label of labels) await expect(states.getByText(label, { exact: true })).toBeVisible()
    const name = page.getByRole('textbox', { name: language === 'ar' ? 'اسم المتقدم الكامل' : 'Applicant full name', exact: true })
    const amount = page.getByRole('textbox', { name: language === 'ar' ? 'مبلغ التمويل' : 'Financing amount', exact: true })
    if (language === 'en') await amount.fill('1,00,000')
    await expect(amount).toHaveAttribute('aria-invalid', 'true')
    await expect(amount).toHaveAccessibleDescription(/100,000.*1,000,000/)
    if (info.project.name === 'chrome') {
      await page.setViewportSize({ width: 390, height: 900 })
      await amount.focus()
      await page.getByRole('region', { name: language === 'ar' ? 'الحقول والتحقق' : 'Fields and validation', exact: true }).screenshot({ path: `docs/implementation/evidence/19/field-error-${language}-390.png` })
    }
    await amount.fill('١٠٠٬٠٠٠')
    await expect(amount).toHaveAttribute('aria-invalid', 'false')
    if (language === 'ar') await name.fill('مريم سالم Mariam Salem، مثال طويل لفحص الاتجاه')
    await expect(amount).toHaveValue('١٠٠٬٠٠٠')
    await expect(name).toHaveValue('مريم سالم Mariam Salem، مثال طويل لفحص الاتجاه')
    await name.focus()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('textbox', { name: language === 'ar' ? 'رقم الجوال' : 'Mobile', exact: true })).toBeFocused()
    expect(await page.locator(':focus').evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid')
    const saves = page.getByRole('region', { name: language === 'ar' ? 'الحفظ والاسترداد' : 'Save and recovery', exact: true })
    await chooseOption(saves.getByRole('combobox'), 'saving')
    await expect(saves.getByRole('button')).toBeDisabled()
    await expect(saves.getByRole('status')).toHaveText(language === 'ar' ? 'جارٍ الحفظ' : 'Saving')
    await chooseOption(saves.getByRole('combobox'), 'unknown')
    await expect(saves.getByRole('alert')).toContainText(language === 'ar' ? 'افحص' : 'Inspect')
    await saves.getByRole('button', { name: language === 'ar' ? 'فحص نتيجة الحفظ' : 'Inspect save outcome', exact: true }).click()
    await expect(saves.getByRole('status')).toHaveText(language === 'ar' ? 'محفوظ' : 'Saved')
    const queue = page.getByRole('region', { name: language === 'ar' ? 'قائمة الطلبات' : 'Queue views', exact: true })
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await expect(queue.getByRole('table')).toHaveCount(width >= 1200 ? 1 : 0)
      await expect(queue.getByRole('article')).toHaveCount(width < 1200 ? 2 : 0)
      if (info.project.name === 'chrome' && [390, 1440].includes(width)) await page.screenshot({ path: `docs/implementation/evidence/19/gallery-${language}-${width}.png`, fullPage: true })
    }
    await queue.getByRole('link', { name: language === 'ar' ? 'فتح الطلب RIFD-2026-EXAMPLE-001' : 'Open application RIFD-2026-EXAMPLE-001', exact: true }).click()
    await expect(queue.getByRole('status')).toContainText('RIFD-2026-EXAMPLE-001')
    const opener = page.getByRole('button', { name: language === 'ar' ? 'فتح حوار العمل غير المحفوظ' : 'Open unsaved-work dialog', exact: true })
    await opener.focus()
    await opener.press('Enter')
    const dialog = page.getByRole('dialog', { name: language === 'ar' ? 'لديك عمل غير محفوظ' : 'You have unsaved work', exact: true })
    const stay = dialog.getByRole('button', { name: language === 'ar' ? 'البقاء' : 'Stay', exact: true })
    const save = dialog.getByRole('button', { name: language === 'ar' ? 'الحفظ والمغادرة' : 'Save and leave', exact: true })
    await expect(stay).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(save).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(stay).toBeFocused()
    if (info.project.name === 'chrome') for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.screenshot({ path: `docs/implementation/evidence/19/dialog-${language}-${width}.png` })
    }
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(opener).toBeFocused()
    await opener.press('Enter')
    await save.click()
    await expect(dialog).toHaveCount(0)
    await expect(opener).toBeFocused()
  }
})

test('the public gallery remains usable during storage recovery in both languages', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'indexedDB', { get() { throw new DOMException('Fixture denial', 'SecurityError') } }))
  await page.goto('/components')
  await expect(page.getByRole('heading', { name: 'مكونات الواجهة', exact: true })).toBeVisible({ timeout: 90_000 })
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Interface components', exact: true })).toBeVisible()
  const loading = page.getByRole('region', { name: 'Loading and read failure', exact: true })
  await loading.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(loading.getByText('Example retry completed.', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'مكونات الواجهة', exact: true })).toBeVisible({ timeout: 90_000 })
})
