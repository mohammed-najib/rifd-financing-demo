import { expect, test } from '@playwright/test'
import { extendPrintHistory } from './acceptance-fixtures'

const samples = [
  { id: '001', identity: 'مريم سالم', state: 'draft' },
  { id: '004', identity: 'هدى علي', state: 'correction' },
  { id: '005', identity: 'مريم سالم', state: 'approved' },
  { id: '006', identity: 'عمر حسن', state: 'rejected' },
]

for (const language of ['ar', 'en'] as const) for (const sample of samples.filter(value => value.state !== 'draft')) test(`${language} ${sample.state} print matches applicant and staff public policy`, async ({ page, context }, info) => {
  const ar = language === 'ar'
  const route = `/applications/RIFD-2026-${sample.id}/print`
  await page.goto(route)
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 60_000 })
  await page.getByRole('button', { name: sample.identity, exact: true }).click()
  await expect(page.locator('.print-summary')).toBeVisible()
  if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', language)
  if (sample.state === 'approved') {
    await page.evaluate(extendPrintHistory)
    await page.reload()
    await expect(page.locator('.print-summary .timeline > li')).toHaveCount(27)
  }
  const applicantText = await page.locator('.print-summary').innerText()
  const staff = await context.newPage()
  await staff.goto(`/staff${route}`)
  await expect(staff.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 60_000 })
  await staff.getByRole('button', { name: ar ? 'سلمى ناصر' : 'Salma Nasser', exact: true }).click()
  const summary = staff.locator('.print-summary')
  await expect(summary).toBeVisible()
  expect(await summary.innerText()).toBe(applicantText)
  await expect(summary).not.toContainText(/Salma|Khaled|سلمى|خالد|Internal notes|Review checks|Internal activity/)
  await staff.emulateMedia({ media: 'print' })
  await expect(staff.locator('.print-controls')).toBeHidden()
  await staff.evaluate(() => document.fonts.ready)
  if (info.project.name === 'chrome') await staff.pdf({ path: info.outputPath(`staff-${sample.state}-${language}.pdf`), preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false })
  await staff.screenshot({ path: info.outputPath(`staff-${sample.state}-${language}.png`), fullPage: true })
})

for (const language of ['ar', 'en'] as const) for (const sample of samples) test(`print ${sample.state} public summary in ${language}`, async ({ page }, info) => {
  const ar = language === 'ar'
  await page.goto(`/applications/RIFD-2026-${sample.id}/print`)
  await page.getByRole('button', { name: sample.identity, exact: true }).click()
  if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click()
  const summary = page.locator('.print-summary')
  await expect(summary.getByRole('heading', { name: ar ? 'ملخص الطلب للطباعة' : 'Printable application summary', exact: true })).toBeVisible()
  await expect(summary).toContainText(`RIFD-2026-${sample.id}`)
  await expect(summary.locator('.document-list li')).toHaveCount(4)
  await expect(summary).not.toContainText(/Salma|Khaled|سلمى|خالد/)
  await expect(summary.getByRole('heading', { name: ar ? 'ملاحظات داخلية' : 'Internal notes', exact: true })).toHaveCount(0)
  await page.evaluate(() => { window.print = () => { document.body.dataset.printInvoked = 'true' } })
  const print = page.getByRole('button', { name: ar ? 'طباعة الملخص' : 'Print summary', exact: true })
  await print.focus(); await page.keyboard.press('Enter')
  await expect(page.locator('body')).toHaveAttribute('data-print-invoked', 'true')
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.header')).toBeHidden()
  await expect(page.locator('.disclosure')).toBeHidden()
  await expect(print).toBeHidden()
  await expect(summary).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  if (info.project.name === 'chrome') await page.pdf({ path: info.outputPath(`${sample.state}-${language}.pdf`), preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false })
  await page.screenshot({ path: info.outputPath(`${sample.state}-${language}.png`), fullPage: true })
})

test('draft print uses an actual saved revision and excludes later unfinished input', async ({ page }) => {
  await page.goto('/applications/RIFD-2026-001/edit?step=financing')
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).click()
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.locator('#purchase-explanation').fill('Saved fictional purchase for printing.')
  await page.getByRole('button', { name: 'Save progress', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Saved')
  await page.locator('#purchase-explanation').fill('UNFINISHED PRIVATE TYPING')
  await page.getByRole('link', { name: 'Print summary', exact: true }).click()
  await page.getByRole('button', { name: 'Discard changes', exact: true }).click()
  await expect(page.locator('.print-summary')).toContainText('Saved fictional purchase for printing.')
  await expect(page.locator('.print-summary')).not.toContainText('UNFINISHED PRIVATE TYPING')
})

test('staff prints public information, closes previews on departure and loses print content on expiry', async ({ page }) => {
  await page.goto('/staff/applications/RIFD-2026-005')
  await page.getByRole('button', { name: 'سلمى ناصر', exact: true }).click()
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: 'Preview Applicant identity evidence', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await page.getByRole('link', { name: 'Print summary', exact: true }).click()
  await expect(page.locator('main h1')).toBeFocused()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.print-summary')).not.toContainText(/Salma|Khaled|Internal notes|Review checks|Internal activity|Assigned reviewer/)
  await page.getByRole('button', { name: 'Expire session', exact: true }).click()
  await expect(page.locator('.print-summary')).toHaveCount(0)
  await page.getByRole('button', { name: 'Salma Nasser', exact: true }).click()
  await expect(page).toHaveURL('/staff/applications/RIFD-2026-005/print')
  await expect(page.locator('.print-summary')).toBeVisible()
  await page.goto('/staff/applications/RIFD-2026-001/print')
  await expect(page.getByRole('heading', { name: 'Application unavailable', exact: true })).toBeVisible()
  await expect(page.locator('main')).not.toContainText('RIFD-2026-001')
  await page.goto('/notifications')
  await expect(page.getByRole('heading', { name: 'Application unavailable', exact: true })).toBeVisible()
  await expect(page.locator('[data-notification]')).toHaveCount(0)
})

test('forbidden applicant print entry stays neutral and a protected print link resumes only for its owner', async ({ page }) => {
  await page.goto('/applications/RIFD-2026-004/print')
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).click()
  await expect(page).toHaveURL('/applications')
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await expect(page.getByRole('button', { name: 'العربية', exact: true })).toBeVisible()
  await page.goto('/applications/RIFD-2026-004/print')
  await expect(page.getByRole('heading', { name: 'Application unavailable', exact: true })).toBeVisible()
  await expect(page.locator('.print-summary')).toHaveCount(0)
  await expect(page.locator('main')).not.toContainText('600,000')
})
