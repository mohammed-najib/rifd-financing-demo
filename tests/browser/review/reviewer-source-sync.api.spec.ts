import { expect, test } from '@playwright/test'
import { nativeIdentity } from '../support/evidence-transport'

test('a held reviewer screen removes its old source after another session publishes a replacement', async ({ page }) => {
  await page.route('**/fake-provider/systemone', route => route.fulfill({ json: nativeIdentity() }))
  await page.goto('/tests/browser/support/evidence-screen.html?reviewer')
  await page.getByRole('button', { name: 'English', exact: true }).click()
  const document = page.getByRole('region', { name: 'Applicant identity evidence', exact: true })
  await document.getByRole('button', { name: 'Find supporting evidence', exact: true }).click()
  const assistance = document.getByRole('region', { name: 'Experimental assistance', exact: true })
  await assistance.getByRole('button', { name: 'Run check', exact: true }).click()
  await expect(assistance.getByText('Printed name appears different from the declared name', { exact: true })).toBeVisible()
  await expect(assistance.getByRole('img')).toBeVisible()
  await page.evaluate(async () => {
    const demoPath = '/src/demo/index.ts', fixturePath = '/tests/browser/support/evidence-fixtures.ts', correctionPath = '/tests/browser/support/correction-evidence-fixtures.ts'
    const { createDemo } = await import(demoPath) as typeof import('../../../src/demo')
    const { imageFile } = await import(fixturePath) as typeof import('../support/evidence-fixtures')
    const { requestIdentityCorrection, prepareCorrectionIdentity, correctionCommand } = await import(correctionPath) as typeof import('../support/correction-evidence-fixtures')
    const other = createDemo({ latency: 50, verifyStoredFiles: false, loadFonts: false, includeOversizedSample: false, compactEvidence: true }); await other.startup()
    await requestIdentityCorrection(other)
    const attachment = await prepareCorrectionIdentity(other, await imageFile('image/png'))
    const result = await other.execute(await correctionCommand(other, {}, attachment, 'resubmit'))
    if (!result.ok) throw new Error(result.error.kind)
    other.dispose()
  })
  await expect(assistance.getByText('The source or context changed. Run a fresh check for current suggestions.', { exact: true })).toBeVisible()
  await expect(assistance.getByRole('img')).toHaveCount(0)
  await expect(assistance.getByText('Printed name appears different from the declared name', { exact: true })).toHaveCount(0)
  await expect(assistance.getByText(/Previous analysis scope only/)).toBeVisible()
})
