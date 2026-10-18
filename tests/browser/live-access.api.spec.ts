import { expect, test } from '@playwright/test'
import { nativeIdentity } from './evidence-transport'
import { validateRequest } from '../../src/live-assistance/request'

test('live access starts only after notice and explicit Run; allowance refusal preserves ordinary work', async ({ page }) => {
  let sessions = 0
  const requests: Record<string, unknown>[] = []
  await page.route('**/fake-guest-session', route => { sessions++; return route.fulfill({ json: { authorization: 'Bearer dummy-guest', appCheck: 'dummy-app-check' } }) })
  await page.route('**/api/evidence-analysis', async route => {
    const headers = route.request().headers()
    expect(headers.authorization).toBe('Bearer dummy-guest')
    expect(headers['x-firebase-appcheck']).toBe('dummy-app-check')
    requests.push(route.request().postDataJSON())
    expect((await validateRequest(Buffer.from(route.request().postData()!), new AbortController().signal)).maximumAttempts).toBe(2)
    return route.fulfill({ status: 503, json: { status: 'unavailable', reason: 'guest-allowance' }, headers: { 'Cache-Control': 'private, no-store' } })
  })
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/tests/browser/evidence-screen.html?live')
  await page.getByRole('button', { name: 'English', exact: true }).click()
  const slot = page.locator('section[aria-labelledby="identity-heading"]')
  await slot.getByRole('button', { name: 'Check document', exact: true }).click()
  const assistance = slot.getByRole('region', { name: 'Experimental assistance', exact: true })
  await expect(assistance.getByText(/Starting a check creates a Firebase guest session/)).toBeVisible()
  await expect(assistance.locator('p').filter({ hasText: /^Selected: 1$/ })).toBeVisible()
  expect(sessions).toBe(0); expect(requests).toHaveLength(0)
  await assistance.getByRole('button', { name: 'Run check', exact: true }).click()
  await expect(assistance.getByText(/used its analysis allowance/)).toBeVisible()
  expect(sessions).toBe(1); expect(requests).toHaveLength(1)
  expect(requests[0]).toMatchObject({ slot: 'identity', totalPages: 1, selectedPages: [1], pages: [{ page: 1, png: expect.any(String) }] })
  expect(Object.keys(requests[0])).not.toEqual(expect.arrayContaining(['applicationId', 'fileId', 'questions', 'model', 'prompt']))
  await assistance.getByRole('button', { name: 'Show current source', exact: true }).click()
  await expect(assistance.getByRole('img')).toBeVisible()
  await expect(assistance.getByRole('button', { name: 'Retain document', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'العربية', exact: true }).click()
  await expect(slot.getByText(/استهلكت جلسة الضيف/)).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(requests).toHaveLength(1)
})

test('the browser consumes request-local results once and offline retry creates no guest request', async ({ page, context }) => {
  let sessions = 0, submissions = 0
  await page.route('**/fake-guest-session', route => { sessions++; return route.fulfill({ json: { authorization: 'Bearer dummy-guest', appCheck: 'dummy-app-check' } }) })
  await page.route('**/api/evidence-analysis', route => { submissions++; return route.fulfill({ json: { status: 'completed', stages: [{ stage: 'combined-page-declaration', page: 1, answer: nativeIdentity() }] } }) })
  await page.goto('/tests/browser/evidence-screen.html?live')
  await page.getByRole('button', { name: 'English', exact: true }).click()
  const slot = page.locator('section[aria-labelledby="identity-heading"]')
  await slot.getByRole('button', { name: 'Check document', exact: true }).click()
  const assistance = slot.getByRole('region', { name: 'Experimental assistance', exact: true })
  await assistance.getByRole('button', { name: 'Run check', exact: true }).click()
  await expect(assistance.getByText('Printed name appears different from the declared name', { exact: true })).toBeVisible()
  expect(submissions).toBe(1)
  await context.setOffline(true)
  await assistance.getByRole('button', { name: 'Retry check', exact: true }).click()
  await expect(assistance.getByText(/Live analysis is currently unavailable/)).toBeVisible()
  expect(submissions).toBe(1); expect(sessions).toBe(1)
  await expect(assistance.getByRole('button', { name: 'Retain document', exact: true })).toBeEnabled()
})
