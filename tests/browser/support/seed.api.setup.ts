import { mkdir } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

test.setTimeout(180_000)
test('seed the API browser storage', async ({ page, context }) => {
  await page.goto('/tests/browser/support/api.html?fonts=1')
  await page.waitForFunction(() => window.demo)
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true })
  await page.close()
  await mkdir('test-results/seed', { recursive: true })
  await context.storageState({ path: 'test-results/seed/api.json', indexedDB: true })
})