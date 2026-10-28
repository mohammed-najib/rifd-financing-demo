import { chooseOption } from '../support/select'
import { expect, test, type Page } from '@playwright/test'

test.describe.configure({ mode: 'parallel' })

test('a new draft keeps later input through its first save and same-identity recovery', async ({ page }) => {
  await page.goto('/applications/new?product=inventory&step=financing')
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).waitFor({ timeout: 30_000 })
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: 'Mariam Salem', exact: true }).click()
  await page.getByRole('button', { name: 'New application', exact: true }).click()
  const input = page.getByLabel('Purchase explanation', { exact: true })
  await input.fill('captured input')
  await page.locator('.demo-controls summary').click()
  await page.locator('.demo-controls input[type=checkbox]').check()
  await page.getByRole('button', { name: 'Save progress', exact: true }).click()
  await input.fill('later private input')
  await expect(page).toHaveURL(/RIFD-2026-.*\/edit\?step=financing$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(input).toHaveValue('later private input')
  await page.getByRole('button', { name: 'Expire session', exact: true }).click()
  await page.getByRole('button', { name: 'Mariam Salem', exact: true }).click()
  await expect(input).toHaveValue('later private input', { timeout: 10_000 })
  await expect(page.getByRole('definition').filter({ hasText: 'captured input' })).toBeVisible()
})

const copy = {
  en: { identity: 'Mariam Salem', other: 'Huda Ali', products: 'Financing products', explanation: 'Purchase explanation', documents: 'Documents', financing: 'Financing', preview: 'Preview saved file', savedDocument: 'Saved document', switchIdentity: 'Switch identity', signOut: 'Sign out', expire: 'Expire session', stay: 'Stay', discard: 'Discard changes', saveLeave: 'Save and leave', leave: 'You have unsaved work', home: 'My applications' },
  ar: { identity: 'مريم سالم', other: 'هدى علي', products: 'منتجات التمويل', explanation: 'شرح الشراء', documents: 'المستندات', financing: 'التمويل', preview: 'معاينة الملف المحفوظ', savedDocument: 'المستند المحفوظ', switchIdentity: 'تغيير الهوية', signOut: 'تسجيل الخروج', expire: 'إنهاء الجلسة', stay: 'البقاء', discard: 'تجاهل التغييرات', saveLeave: 'الحفظ والمغادرة', leave: 'لديك عمل غير محفوظ', home: 'طلباتي' },
}

async function openDraft(page: Page, language: keyof typeof copy) {
  await page.goto('/applications/RIFD-2026-001/edit?step=financing')
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).waitFor({ timeout: 30_000 })
  if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: copy[language].identity, exact: true }).click()
  await expect(page.getByLabel(copy[language].explanation, { exact: true })).toBeVisible()
}

for (const language of ['ar', 'en'] as const) test(`${language}: expiry closes a protected preview and explicitly recovers the previous screen after a public visit`, async ({ page }, info) => {
  const c = copy[language]
  await page.clock.install()
  await openDraft(page, language)
  await page.getByLabel(c.explanation, { exact: true }).fill('private unfinished input')
  await page.getByRole('link', { name: `4. ${c.documents}`, exact: true }).click()
  await page.getByRole('button', { name: c.preview, exact: true }).first().click()
  await expect(page.getByAltText(c.savedDocument, { exact: true })).toBeVisible()
  const url = await page.getByAltText(c.savedDocument, { exact: true }).getAttribute('src')
  await page.clock.runFor(15 * 60 * 1000 + 1)
  await expect(page.getByRole('button', { name: c.identity, exact: true })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByText('RIFD-2026-001', { exact: true })).toHaveCount(0)
  expect(await page.evaluate(async url => { try { await fetch(url!); return true } catch { return false } }, url)).toBe(false)
  await page.setViewportSize({ width: language === 'ar' ? 390 : 1440, height: 900 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: info.outputPath(`session-expired-${language}.png`), fullPage: true })
  await page.getByRole('link', { name: c.products, exact: true }).click()
  await page.locator('a.brand').click()
  await page.getByRole('button', { name: c.identity, exact: true }).click()
  await expect(page).toHaveURL(/001\/edit\?step=documents$/)
  await page.getByRole('link', { name: `3. ${c.financing}`, exact: true }).click()
  await expect(page.getByLabel(c.explanation, { exact: true })).toHaveValue('private unfinished input')
  await expect(page.getByRole('definition').filter({ hasText: 'private unfinished input' })).toHaveCount(0)
})

for (const language of ['ar', 'en'] as const) test(`${language}: another identity receives control only after explicit discard`, async ({ page }) => {
  const c = copy[language]
  await openDraft(page, language)
  await page.getByLabel(c.explanation, { exact: true }).fill('private unfinished input')
  await page.getByRole('button', { name: c.expire, exact: true }).click()
  await page.getByRole('button', { name: c.other, exact: true }).click()
  await expect(page.getByRole('dialog', { name: c.leave })).toBeVisible()
  await expect(page.getByRole('button', { name: c.saveLeave, exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: c.identity, exact: true }).click()
  await expect(page.getByLabel(c.explanation, { exact: true })).toHaveValue('private unfinished input')
  await page.getByRole('button', { name: c.expire, exact: true }).click()
  await page.getByRole('button', { name: c.other, exact: true }).click()
  await page.getByRole('button', { name: c.discard, exact: true }).click()
  await expect(page.getByRole('heading', { name: c.home, exact: true })).toBeVisible()
  await expect(page.getByText('private unfinished input', { exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: c.switchIdentity, exact: true }).click()
  await page.getByRole('button', { name: c.identity, exact: true }).click()
  await expect(page).toHaveURL('/applications')
  await page.goto('/applications/RIFD-2026-001/edit?step=financing')
  await expect(page.getByLabel(c.explanation, { exact: true })).toHaveValue('')
})

for (const language of ['ar', 'en'] as const) test(`${language}: pending preparation and a failed Save and leave retain input and identity until an explicit successful save`, async ({ page }) => {
  const c = copy[language]
  await openDraft(page, language)
  await page.getByLabel(c.explanation, { exact: true }).fill('save before sign-out')
  await page.locator('.demo-controls summary').click()
  await page.locator('.demo-controls input[type=checkbox]').check()
  await chooseOption(page.locator('#next-failure'), 'save')
  await page.getByRole('link', { name: `4. ${c.documents}`, exact: true }).click()
  const purchase = page.locator('section[aria-labelledby=purchase-heading]')
  await purchase.getByRole('button', { name: language === 'ar' ? 'استخدام النموذج' : 'Use sample', exact: true }).click()
  await page.getByRole('button', { name: c.switchIdentity, exact: true }).click()
  await expect(page.getByRole('button', { name: c.discard, exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: c.saveLeave, exact: true })).toBeDisabled()
  await page.getByRole('button', { name: c.stay, exact: true }).click()
  await expect(purchase.getByText(language === 'ar' ? 'جاهز للحفظ' : 'Ready to save', { exact: true })).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: c.signOut, exact: true }).click()
  await page.getByRole('button', { name: c.saveLeave, exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByText(language === 'ar' ? 'لم يُحفظ' : 'Save failed', { exact: true })).toBeVisible()
  await expect(purchase.getByText(language === 'ar' ? 'جاهز للحفظ' : 'Ready to save', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: `3. ${c.financing}`, exact: true }).click()
  await expect(page.getByLabel(c.explanation, { exact: true })).toHaveValue('save before sign-out')
  await page.getByRole('button', { name: c.signOut, exact: true }).click()
  await page.getByRole('button', { name: c.saveLeave, exact: true }).click()
  await expect(page.getByRole('button', { name: c.identity, exact: true })).toBeVisible()
  await page.getByRole('button', { name: c.identity, exact: true }).click()
  await expect(page).toHaveURL('/applications')
  await page.goto('/applications/RIFD-2026-001/edit?step=financing')
  await expect(page.getByLabel(c.explanation, { exact: true })).toHaveValue('save before sign-out')
})

for (const language of ['ar', 'en'] as const) test(`${language}: expiry invalidates product confirmation and retains interrupted preparation for explicit retry`, async ({ page }) => {
  const c = copy[language]
  await page.clock.install()
  await openDraft(page, language)
  await chooseOption(page.locator('#draft-product'), 'equipment')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.clock.runFor(15 * 60 * 1000 + 1)
  await page.getByRole('button', { name: c.identity, exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('#draft-product')).toHaveAttribute('data-value', 'inventory')
  await page.locator('.demo-controls summary').click()
  await page.locator('.demo-controls input[type=checkbox]').check()
  await page.getByRole('link', { name: `4. ${c.documents}`, exact: true }).click()
  const purchase = page.locator('section[aria-labelledby=purchase-heading]')
  await purchase.getByRole('button', { name: language === 'ar' ? 'استخدام النموذج' : 'Use sample', exact: true }).click()
  await expect(purchase.getByRole('progressbar')).toBeVisible()
  await page.getByRole('button', { name: c.expire, exact: true }).click()
  await page.getByRole('button', { name: c.identity, exact: true }).click()
  const retry = purchase.getByRole('button', { name: language === 'ar' ? 'إعادة تجهيز الاختيار' : 'Retry preparation', exact: true })
  // Slow sign-in, access inspection and editor reload take at least 4.5 seconds.
  await expect(retry).toBeVisible({ timeout: 10_000 })
  await page.clock.runFor(5_000)
  await expect(purchase.getByRole('progressbar')).toHaveCount(0)
  await expect(purchase.getByText(language === 'ar' ? 'جاهز للحفظ' : 'Ready to save', { exact: true })).toHaveCount(0)
  await retry.click()
  await expect(purchase.getByText(language === 'ar' ? 'جاهز للحفظ' : 'Ready to save', { exact: true })).toBeVisible({ timeout: 10_000 })
})

for (const language of ['ar', 'en'] as const) for (const phase of ['beforeCommit', 'afterCommit'] as const) test(`${language}: ${phase} expiry requires outcome inspection and never replays a save`, async ({ page }) => {
  const c = copy[language]
  await openDraft(page, language)
  await page.getByLabel(c.explanation, { exact: true }).fill('interrupted save input')
  await page.evaluate(({ phase, label }) => {
    const expire = () => [...document.querySelectorAll('button')].find(button => button.textContent === label)!.click()
    if (phase === 'beforeCommit') {
      const put = IDBObjectStore.prototype.put
      IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
        IDBObjectStore.prototype.put = put
        const request = put.apply(this, args)
        request.addEventListener('success', expire, { once: true })
        return request
      }
    }
    // Delay only the completion observer, leaving real commit/rollback intact.
    const transaction = IDBDatabase.prototype.transaction
    IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase['transaction']>) {
      const tx = transaction.apply(this, args)
      if (args[1] === 'readwrite') {
        IDBDatabase.prototype.transaction = transaction
        const eventName = phase === 'beforeCommit' ? 'abort' : 'complete'
        Object.defineProperty(tx, `on${eventName}`, { set(listener: (event: Event) => void) {
          tx.addEventListener(eventName, event => { if (phase === 'afterCommit') expire(); setTimeout(() => listener.call(tx, event), 200) }, { once: true })
        } })
      }
      return tx
    }
  }, { phase, label: c.expire })
  await page.getByRole('button', { name: language === 'ar' ? 'حفظ التقدم' : 'Save progress', exact: true }).click()
  await page.getByRole('button', { name: c.identity, exact: true }).click()
  await expect(page.getByLabel(c.explanation, { exact: true })).toHaveValue('interrupted save input')
  await page.getByRole('button', { name: language === 'ar' ? 'فحص نتيجة الحفظ' : 'Inspect save outcome', exact: true }).click()
  const savedValue = page.getByRole('definition').filter({ hasText: 'interrupted save input' })
  if (phase === 'beforeCommit') {
    await expect(savedValue).toHaveCount(0)
    await expect(page.getByText(language === 'ar' ? 'لم يُحفظ' : 'Save failed', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: language === 'ar' ? 'حفظ التقدم' : 'Save progress', exact: true }).click()
  }
  await expect(savedValue).toBeVisible()
})

for (const language of ['ar', 'en'] as const) test(`${language}: same-identity recovery uses the permitted read-only record when editing has ended`, async ({ page, context }) => {
  const c = copy[language]
  await openDraft(page, language)
  await page.getByLabel(c.explanation, { exact: true }).fill('unapplied private input')
  await page.getByRole('button', { name: c.expire, exact: true }).click()
  await expect(page.getByRole('button', { name: c.identity, exact: true })).toBeVisible()
  const publisher = await context.newPage()
  await publisher.goto('/applications/RIFD-2026-001/edit?step=financing')
  await publisher.getByRole('button', { name: c.identity, exact: true }).click()
  await publisher.getByLabel(c.explanation, { exact: true }).fill('Published stock purchase from the other applicant tab.')
  await publisher.getByRole('link', { name: language === 'ar' ? '5. المراجعة' : '5. Review', exact: true }).click()
  await publisher.getByRole('button', { name: language === 'ar' ? 'تقديم الطلب' : 'Submit application', exact: true }).click()
  await expect(publisher.getByRole('heading', { name: language === 'ar' ? 'المعلومات المقدمة' : 'Submitted information', exact: true })).toBeVisible()
  await page.getByRole('button', { name: c.identity, exact: true }).click()
  await expect(page).toHaveURL('/applications/RIFD-2026-001')
  await expect(page.getByRole('heading', { name: 'RIFD-2026-001', exact: true })).toBeVisible()
  await expect(page.getByLabel(c.explanation, { exact: true })).toHaveCount(0)
  await expect(page.getByText('unapplied private input', { exact: true })).toHaveCount(1)
  await expect(page.getByText('unapplied private input', { exact: true })).toBeHidden()
  const submitted = page.getByRole('heading', { name: language === 'ar' ? 'المعلومات المقدمة' : 'Submitted information', exact: true }).locator('..')
  await expect(submitted).not.toContainText('unapplied private input')
  await expect(page.getByRole('heading', { name: language === 'ar' ? 'تغييراتك غير المطبقة' : 'Your unapplied changes', exact: true })).toBeVisible()
  await page.getByRole('button', { name: c.signOut, exact: true }).click()
  await expect(page.getByRole('dialog', { name: c.leave })).toBeVisible()
  await expect(page.getByRole('button', { name: c.saveLeave, exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: c.stay, exact: true }).click()
  await page.getByRole('button', { name: c.expire, exact: true }).click()
  await page.getByRole('button', { name: c.other, exact: true }).click()
  await expect(page.getByRole('dialog', { name: c.leave })).toBeVisible()
  await page.getByRole('button', { name: c.discard, exact: true }).click()
  await expect(page).toHaveURL('/applications')
})

for (const language of ['ar', 'en'] as const) test(`${language}: an unsigned staff link resumes only for a permitted identity and staff expiry covers its preview`, async ({ page }) => {
  const c = copy[language]
  await page.clock.install()
  await page.goto('/staff/applications/RIFD-2026-005')
  await page.getByRole('button', { name: 'سلمى ناصر', exact: true }).waitFor({ timeout: 30_000 })
  if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click()
  await expect(page.getByText('RIFD-2026-005', { exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: language === 'ar' ? 'سلمى ناصر' : 'Salma Nasser', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'RIFD-2026-005', exact: true })).toBeVisible()
  await page.getByRole('button', { name: language === 'ar' ? 'معاينة إثبات هوية المتقدم' : 'Preview Applicant identity evidence', exact: true }).click()
  await expect(page.getByAltText(c.savedDocument)).toBeVisible()
  await page.clock.runFor(15 * 60 * 1000 + 1)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByText('RIFD-2026-005', { exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: c.identity, exact: true }).click()
  await expect(page).toHaveURL('/applications')
  await expect(page.getByRole('heading', { name: c.home, exact: true })).toBeVisible()
})
