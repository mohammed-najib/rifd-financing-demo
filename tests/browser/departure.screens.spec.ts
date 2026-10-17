import { expect, test, type Page } from '@playwright/test'

test.describe.configure({ mode: 'parallel' })

async function open(page: Page, isNew = false) {
  await page.goto(isNew ? '/applications/new?product=inventory&step=financing' : '/applications/RIFD-2026-001/edit?step=financing')
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).waitFor({ timeout: 30_000 })
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: 'Mariam Salem', exact: true }).click()
  if (isNew) await page.getByRole('button', { name: 'New application', exact: true }).click()
  await page.getByLabel('Purchase explanation', { exact: true }).fill('unfinished input')
}

test('discarded memory-only drafts do not reappear as unfinished work on later navigation', async ({ page }) => {
  await open(page, true)
  await page.getByRole('link', { name: 'Financing products', exact: true }).click()
  await page.getByRole('button', { name: 'Discard changes', exact: true }).click()
  await expect(page.getByRole('heading', { name: /Your business\./ })).toBeVisible()
  await page.getByRole('link', { name: 'My applications', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'My applications', exact: true })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('link', { name: 'New application', exact: true }).click()
  await page.getByRole('article', { name: 'Inventory financing', exact: true }).getByRole('button', { name: 'Choose this product', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Start new or resume a draft?', exact: true })).toBeVisible()
  await expect(page.getByLabel('Purchase explanation', { exact: true })).toHaveCount(0)
})

test('Stay restores its opener and a completed departure leaves focus on the destination heading', async ({ page }) => {
  await open(page)
  const link = page.getByRole('link', { name: 'Financing products', exact: true })
  await link.click()
  await page.getByRole('button', { name: 'Stay', exact: true }).click()
  await expect(link).toBeFocused()
  await link.click()
  await page.getByRole('button', { name: 'Discard changes', exact: true }).click()
  const heading = page.getByRole('heading', { name: /Your business\./ })
  await expect(heading).toBeVisible()
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  await expect(heading).toBeFocused()
})

test('expiry covers protected input immediately even while IndexedDB is busy', async ({ page }) => {
  await open(page)
  // Keep a real write transaction active. Expiry presentation must not wait for it.
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const open = indexedDB.open('rifd-demo', 1)
    open.onsuccess = () => {
      const db = open.result
      const tx = db.transaction('state', 'readwrite')
      const store = tx.objectStore('state')
      const until = Date.now() + 4_000
      const hold = () => { store.get('dataset').onsuccess = () => { if (Date.now() < until) hold() } }
      hold(); resolve()
      tx.oncomplete = () => db.close()
    }
    open.onerror = () => reject(open.error)
  }))
  await page.getByRole('button', { name: 'Expire session', exact: true }).click()
  await expect(page.getByLabel('Purchase explanation', { exact: true })).toHaveCount(0, { timeout: 500 })
  await expect(page.getByRole('button', { name: 'Mariam Salem', exact: true })).toBeVisible({ timeout: 500 })
  await page.getByRole('button', { name: 'Mariam Salem', exact: true }).click()
  await expect(page.getByLabel('Purchase explanation', { exact: true })).toHaveValue('unfinished input', { timeout: 10_000 })
})
