import { expect, test } from '@playwright/test'

test('runtime reports live unavailability and keeps ordinary source and saved examples accessible', async ({ page }) => {
  const paidRequests: string[] = []
  page.on('request', request => { if (/typesafe|identitytoolkit|fake-provider|\/analysis/.test(request.url())) paidRequests.push(request.url()) })
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/applications/RIFD-2026-001/edit?step=documents')
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'RIFD-2026-001', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.getByRole('button', { name: 'Check document', exact: true }).click()
  const assistance = page.getByRole('region', { name: 'Experimental assistance', exact: true })
  await expect(assistance.getByRole('button', { name: 'Run check', exact: true })).toBeEnabled()
  await assistance.getByRole('button', { name: 'Run check', exact: true }).click()
  await expect(assistance.getByRole('status')).toHaveText('Live analysis unavailable until the service is connected. Saved demonstrations remain available.')
  await assistance.getByRole('button', { name: 'Show current source', exact: true }).click()
  await expect(assistance.getByRole('img')).toBeVisible()
  await expect(assistance.getByRole('link', { name: 'Download file', exact: true })).toHaveAttribute('href', /^blob:/)
  await expect(page.getByRole('button', { name: 'Save progress', exact: true })).toBeEnabled()
  await expect(page.getByText('Choose a Saved demonstration', { exact: true }).first()).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(paidRequests).toEqual([])
})
