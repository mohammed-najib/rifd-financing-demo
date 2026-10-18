import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

const name = 'fictional-identity-document-with-a-long-filename-2026.png'
const file = async () => ({ name, mimeType: 'image/png', buffer: await readFile('tests/browser/fixtures/highlights/ar-identity-06.png') })

for (const language of ['ar', 'en'] as const) test(`${language} document picker keeps the selected filename through cancel, reselect, save and reload`, async ({ page }, info) => {
  const ar = language === 'ar'
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/tests/browser/evidence-screen.html')
  if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click()
  const section = page.locator('section[aria-labelledby="identity-heading"]')
  const input = section.getByLabel(ar ? 'اختر مستندًا افتراضيًا محليًا' : 'Choose a local fictional document', { exact: true })
  await input.setInputFiles(await file())
  await expect(section.getByText(ar ? 'جاهز للحفظ' : 'Ready to save', { exact: true })).toBeVisible()
  await expect(input).toHaveAccessibleDescription(new RegExp(name))
  const picker = section.locator('.file-picker')
  await expect(picker.getByText(name, { exact: true })).toBeVisible()

  // A cancelled native chooser must keep the application selection.
  await input.focus()
  const chooser = page.waitForEvent('filechooser')
  await page.keyboard.press('Enter')
  await chooser
  await input.dispatchEvent('cancel')
  await expect(picker.getByText(name, { exact: true })).toBeVisible()
  await expect(input).toBeFocused()

  // The same local file can be selected again after preparation.
  await input.setInputFiles(await file())
  await expect(section.getByRole('progressbar')).toBeVisible()
  await expect(section.getByText(ar ? 'جاهز للحفظ' : 'Ready to save', { exact: true })).toBeVisible()
  await expect(picker.getByText(name, { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await picker.screenshot({ path: info.outputPath(`file-picker-${language}-390.png`) })

  await page.getByRole('button', { name: ar ? 'حفظ التقدم' : 'Save progress', exact: true }).click()
  await expect(page.getByText(ar ? 'محفوظ' : 'Saved', { exact: true })).toBeVisible()
  await expect(picker.getByText(name, { exact: true })).toBeVisible()
  await page.reload()
  if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click()
  await expect(input).toHaveAccessibleDescription(new RegExp(name))
  await expect(picker.getByText(name, { exact: true })).toBeVisible()
})

test('failed replacements keep their filename and errors, while discard restores the saved document', async ({ page }) => {
  await page.goto('/tests/browser/evidence-screen.html')
  await page.getByRole('button', { name: 'English', exact: true }).click()
  const section = page.locator('section[aria-labelledby="identity-heading"]')
  const input = section.getByLabel('Choose a local fictional document', { exact: true })
  const picker = section.locator('.file-picker')
  const savedName = 'DEMO-RIFD-2026-001-identity-original.png'
  await input.setInputFiles({ name: 'unsupported-file.txt', mimeType: 'text/plain', buffer: Buffer.from('fictional document') })
  await expect(section.getByText('Preparation failed', { exact: true })).toBeVisible()
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  await expect(input).toHaveAccessibleDescription(/unsupported-file\.txt/)
  await expect(picker.getByText('unsupported-file.txt', { exact: true })).toBeVisible()
  await expect(section.getByRole('button', { name: 'Preview saved file', exact: true })).toBeVisible()
  await expect(picker).toHaveCSS('border-top-color', 'rgb(196, 107, 91)')
  await section.getByRole('button', { name: 'Discard unsaved selection', exact: true }).click()
  await expect(picker.getByText(savedName, { exact: true })).toBeVisible()
  await expect(input).toHaveAttribute('aria-invalid', 'false')

  await section.getByRole('button', { name: 'Use sample', exact: true }).click()
  await expect(section.getByText('Ready to save', { exact: true })).toBeVisible()
  const preparedName = await section.locator('.draft-feedback').first().locator('bdi').first().innerText()
  await expect(picker.getByText(preparedName, { exact: true })).toBeVisible()
})

for (const language of ['ar', 'en'] as const) for (const source of ['local', 'sample'] as const) test(`${language} ${source} selection replaces the empty attachment message in a new draft`, async ({ page }) => {
  const ar = language === 'ar'
  await page.goto('/tests/browser/evidence-screen.html?new-draft')
  if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click()
  const section = page.locator('section[aria-labelledby="identity-heading"]')
  const missing = section.getByText(ar ? 'لم يُرفق مستند' : 'No document supplied', { exact: true })
  await expect(missing).toBeVisible()
  const choose = async () => {
    if (source === 'local') await section.locator('#identity-file').setInputFiles(await file())
    else await section.getByRole('button', { name: ar ? 'استخدام النموذج' : 'Use sample', exact: true }).click()
  }
  await choose()
  await expect(section.getByRole('progressbar')).toBeVisible()
  await expect(missing).toHaveCount(0)
  await expect(section.getByText(ar ? 'جاهز للحفظ' : 'Ready to save', { exact: true })).toBeVisible()
  await expect(missing).toHaveCount(0)
  await expect(section.getByRole('button', { name: ar ? 'فحص المستند' : 'Check document', exact: true })).toBeEnabled()
  await section.getByRole('button', { name: ar ? 'تجاهل الاختيار غير المحفوظ' : 'Discard unsaved selection', exact: true }).click()
  await expect(missing).toBeVisible()

  await choose()
  await expect(section.getByText(ar ? 'جاهز للحفظ' : 'Ready to save', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: ar ? 'حفظ التقدم' : 'Save progress', exact: true }).click()
  await expect(page.getByText(ar ? 'محفوظ' : 'Saved', { exact: true })).toBeVisible()
  await expect(missing).toHaveCount(0)
  await expect(section.getByRole('button', { name: ar ? 'معاينة الملف المحفوظ' : 'Preview saved file', exact: true })).toBeVisible()
})
