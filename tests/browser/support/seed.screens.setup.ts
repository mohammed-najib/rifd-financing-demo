import { mkdir } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

test.setTimeout(180_000)
test('seed the screen browser storage', async ({ page, context }) => {
  await page.goto('/')
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 60_000 })
  await page.close()
  await mkdir('test-results/seed', { recursive: true })
  const browser = test.info().project.name.replace('seed-', '')
  await context.storageState({ path: `test-results/seed/screens-${browser}.json`, indexedDB: true })
})