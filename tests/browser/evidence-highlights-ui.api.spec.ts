import { expect, test } from '@playwright/test'
import { nativeLocatedIdentity } from './evidence-transport'
import type { StageRequest } from '../../src/evidence-assistance/contract'

test('named findings open aligned regions through resize, RTL and restored analysis', async ({ page }, info) => {
  let requests = 0, suppress = false
  await page.route('**/fake-provider/systemone', async route => { requests++; const request = route.request().postDataJSON() as StageRequest, raw = nativeLocatedIdentity(request) as { answers: Record<string, unknown> }; if (suppress && request.stage === 'bound-verification') raw.answers.fullNameLeftClipping = { type: 'noul', noul: 0.1 }; await route.fulfill({ json: raw }) })
  await page.goto('/tests/browser/evidence-screen.html')
  await page.getByRole('button', { name: 'English', exact: true }).click()
  const panel = page.locator('section[aria-labelledby="identity-heading"]').locator('.evidence-assistance')
  await panel.getByRole('button', { name: 'Check document', exact: true }).click()
  await panel.getByRole('button', { name: 'Run check', exact: true }).click()
  const inspect = panel.getByRole('button', { name: /Inspect field region/ })
  await expect(inspect).toBeVisible(); await inspect.click()
  const overlay = panel.locator('[data-evidence-highlight="fullName"]'), raster = panel.locator('[data-evidence-raster]')
  await expect(overlay).toBeVisible()
  const assertAligned = async () => {
    await expect.poll(async () => raster.evaluate(image => {
      const mark = image.parentElement!.querySelector('[data-evidence-highlight]')!.getBoundingClientRect(), rect = image.getBoundingClientRect()
      return Math.max(Math.abs(mark.x - rect.x - rect.width * 0.1015), Math.abs(mark.y - rect.y - rect.height * 0.2005), Math.abs(mark.width - rect.width * 0.199))
    })).toBeLessThan(0.1)
  }
  await assertAligned()
  await page.setViewportSize({ width: 390, height: 900 }); await assertAligned()
  await page.getByRole('button', { name: 'العربية', exact: true }).click(); await assertAligned()
  await panel.screenshot({ path: info.outputPath('highlight-ar-390.png') })
  expect(requests).toBe(2)
  await page.reload()
  await page.locator('section[aria-labelledby="identity-heading"]').getByRole('button', { name: 'فحص المستند', exact: true }).click()
  await page.getByRole('button', { name: /فحص موضع الحقل/ }).click()
  await expect(page.locator('[data-evidence-highlight="fullName"]')).toBeVisible()
  expect(requests).toBe(2)
  suppress = true
  await panel.getByRole('button', { name: 'إعادة الفحص', exact: true }).click()
  await expect(panel.getByText('تحديد الموضع غير متاح. يمكنك فحص الحقل المسمى في المصدر.', { exact: true })).toBeVisible()
  await panel.getByRole('button', { name: /فحص موضع الحقل/ }).click()
  await expect(panel.locator('[data-evidence-highlight]')).toHaveCount(0)
  await expect(panel.getByRole('link', { name: 'فتح الملف', exact: true })).toBeVisible()
  expect(requests).toBe(4)
})
