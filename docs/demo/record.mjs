import { chromium, expect as playwrightExpect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { performance } from 'node:perf_hooks'

// Records the real hosted UI. No test API, fixture injection or storage editing.
const expect = playwrightExpect.configure({ timeout: 60_000 })
const origin = process.env.RIFD_DEMO_ORIGIN ?? 'https://rifd-portfolio-mdnb.web.app'
const directory = resolve(process.env.RIFD_DEMO_OUTPUT ?? `artifacts/demo/24/${new Date().toISOString().replaceAll(':', '-')}`)
await mkdir(directory, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext({ baseURL: origin, viewport: { width: 1440, height: 950 }, recordVideo: { dir: directory, size: { width: 1440, height: 950 } } })
await context.tracing.start({ screenshots: true, snapshots: true, sources: true })
const page = await context.newPage()
const started = performance.now()
page.setDefaultTimeout(60_000)
const scenes = []
const b = name => page.getByRole('button', { name, exact: true })
const l = name => page.getByRole('link', { name, exact: true })
const go = async path => { await page.goto(path); await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible() }
const switchTo = async name => { await b('تغيير الهوية').click(); await b(name).click(); await expect(page).toHaveURL(name === 'سلمى ناصر' ? /\/staff\/applications$/ : /\/applications$/) }
const save = async () => { await b('حفظ التقدم').click(); await expect(page.getByText('محفوظ', { exact: true })).toBeVisible() }
const controls = async failure => {
  const details = page.locator('details.demo-controls')
  if (!await details.evaluate(element => element.open)) await details.locator('summary').click()
  await page.locator('#next-failure').selectOption(failure)
}
async function passChecks(labels) {
  for (const label of labels) {
    const passed = page.getByRole('group', { name: label, exact: true }).getByRole('button', { name: 'اجتاز', exact: true })
    await passed.click()
    await expect(passed).toHaveAttribute('aria-pressed', 'true')
  }
}
async function scene(chapter, key, duration, ar, en, identity, record, action) {
  console.log(`Recording ${key}`)
  const start = (performance.now() - started) / 1000
  await action()
  await page.evaluate(() => globalThis.document.fonts.ready)
  await page.waitForTimeout(1400)
  await page.screenshot({ path: `${directory}/${key}.png` })
  const end = (performance.now() - started) / 1000
  scenes.push({ chapter, key, duration, ar, en, identity, record, start, end, url: page.url() })
  await writeFile(`${directory}/scenes.json`, JSON.stringify(scenes, null, 2) + '\n')
}
try {
  await go('/products')
  await scene(1, 'products', 6, 'قارن المنتجين وحدودهما قبل البدء', 'Compare both fictional products and their limits', 'زائر / Visitor', 'Products', async () => { await expect(page.locator('main')).toContainText('تمويل المخزون') })
  await go('/applications/RIFD-2026-001/edit?step=financing'); await b('مريم سالم').click(); await expect(page.locator('#field-amount')).toBeVisible()
  await scene(1, 'draft', 5, 'استعد المسودة المحفوظة ومستنداتها', 'Restore the saved draft and its four documents', 'مريم / Mariam', '001', async () => { await page.reload(); await expect(page.locator('#field-amount')).toBeVisible() })
  await scene(1, 'validation', 6, 'التحقق يرفض التقديم ويحفظ المسودة', 'Validation refuses submission and retains the draft', 'مريم / Mariam', '001', async () => {
    await page.locator('#field-amount').fill('12'); await l('5. المراجعة').click(); await b('تقديم الطلب').click(); await expect(page.getByRole('alert').first()).toBeVisible()
  })
  await scene(1, 'complete', 7, 'أكمل البيانات وراجع قبل التقديم', 'Complete the fields and inspect the review step', 'مريم / Mariam', '001', async () => {
    await l('3. التمويل').click(); await page.locator('#field-amount').fill('100010'); await page.locator('#field-term').fill('6'); await page.locator('#purchase-explanation').fill('شراء مخزون تجريبي للنشاط القائم.'); await save(); await l('5. المراجعة').click()
  })
  await l('4. المستندات').click()
  const purchase = page.locator('section[aria-labelledby="purchase-heading"]')
  await scene(2, 'invalid-file', 6, 'الملف الفارغ لا يصبح جاهزا للحفظ', 'An empty file fails before preparation', 'مريم / Mariam', '001', async () => {
    await purchase.locator('input[type=file]').setInputFiles({ name: 'DEMO-empty.png', mimeType: 'image/png', buffer: Buffer.alloc(0) }); await expect(purchase.getByRole('alert')).toBeVisible()
  })
  await scene(2, 'prepared', 7, 'تجهيز الملف يختلف عن حفظه', 'Prepared bytes are Ready to save, still unsaved', 'مريم / Mariam', '001', async () => {
    await purchase.getByRole('button', { name: 'استخدام النموذج', exact: true }).click(); await expect(purchase.getByText('جاهز للحفظ', { exact: true })).toBeVisible()
  })
  await scene(2, 'saved', 7, 'الحفظ ثم التحديث يعيدان الملف الحقيقي', 'Save and reload restore the actual document', 'مريم / Mariam', '001', async () => { await save(); await page.reload(); await expect(purchase.getByRole('button', { name: 'معاينة الملف المحفوظ', exact: true })).toBeVisible() })
  await scene(2, 'preview', 7, 'معاينة المستند المحفوظ', 'Preview the saved evidence', 'مريم / Mariam', '001', async () => { await purchase.getByRole('button', { name: 'معاينة الملف المحفوظ', exact: true }).click(); await expect(page.getByRole('dialog')).toBeVisible() })
  await b('إغلاق المعاينة').click()
  await scene(2, 'failed-save', 8, 'فشل الاستبدال يبقي السابق ثم تنجح الإعادة', 'Failed replacement preserves the saved file; explicit retry succeeds', 'مريم / Mariam', '001', async () => {
    await purchase.getByRole('button', { name: 'استخدام النموذج', exact: true }).click(); await expect(purchase.getByText('جاهز للحفظ', { exact: true })).toBeVisible(); await controls('save'); await b('حفظ التقدم').click(); await expect(page.getByText('لم يُحفظ', { exact: true })).toBeVisible(); await page.waitForTimeout(1400); await save()
  })
  await scene(1, 'submitted', 11, 'تقديم فعلي مع مرجع وسجل عام', 'Actual submission creates a reference and public history', 'مريم / Mariam', '001', async () => { await l('5. المراجعة').click(); await b('تقديم الطلب').click(); await expect(page.getByRole('status').filter({ hasText: 'قُدم طلبك' })).toBeVisible() })
  await scene(3, 'applicant-list', 6, 'الطلبات الخاصة بهذه الهوية فقط', 'This identity sees only her own applications', 'مريم / Mariam', '001,005', async () => { await go('/applications') })
  await scene(3, 'detail', 7, 'الحالة والخطوة التالية والمعلومات المقدمة', 'Status, permitted next action and submitted information', 'مريم / Mariam', '001', async () => { await go('/applications/RIFD-2026-001') })
  await scene(3, 'history', 7, 'سجل المتقدم لا يعرض ملاحظات الموظفين', 'Public history excludes internal staff notes', 'مريم / Mariam', '001', async () => { await go('/applications/RIFD-2026-001/history') })
  await scene(3, 'notification', 7, 'إشعار محفوظ يفتح الحالة الحالية', 'A saved notification opens the current permitted record', 'مريم / Mariam', '005', async () => { await go('/notifications'); await page.locator('[data-notification]').filter({ hasText: 'RIFD-2026-005' }).getByRole('link', { name: 'فتح الطلب الحالي', exact: true }).click() })
  await scene(3, 'print', 8, 'ملخص الطباعة يشترك في سياسة عرض المتقدم', 'Both roles print the same applicant-visible summary', 'مريم / Mariam', '005', async () => { await l('طباعة الملخص').click(); await expect(page.locator('.print-summary')).toBeVisible() })
  await page.pdf({ path: `${directory}/approved-ar.pdf`, printBackground: true, format: 'A4' })
  await switchTo('سلمى ناصر')
  await scene(4, 'queue-search', 9, 'بحث وتصفيات وفرز محفوظ', 'Search, filter and save the queue sort', 'سلمى / Salma', 'Staff queue', async () => {
    await page.getByRole('searchbox').fill('٠٠٤'); await expect(page.getByRole('link', { name: /RIFD-2026-004/ })).toBeVisible(); await page.getByRole('searchbox').fill(''); await page.locator('#queue-status').selectOption('submitted'); await page.locator('#queue-sort').selectOption('amountAsc')
  })
  await scene(4, 'queue-page', 6, 'الصفحات تعرض المجموعة نفسها', 'Five rows per page with stable ordering', 'سلمى / Salma', 'Staff queue', async () => { await page.locator('#queue-status').selectOption('all'); await b('الصفحة التالية').click() })
  await scene(4, 'queue-restored', 6, 'زيارة جديدة تستعيد الفرز المحفوظ', 'A fresh queue visit restores the saved sort', 'سلمى / Salma', 'Staff queue', async () => { await go('/products'); await go('/staff/applications'); await expect(page.locator('#queue-sort')).toHaveValue('amountAsc') })
  await scene(4, 'claim', 7, 'الاستلام لا يبدأ المراجعة', 'Claiming preserves Submitted status', 'سلمى / Salma', '001', async () => { await go('/staff/applications/RIFD-2026-001'); await b('استلام الطلب').click(); await expect(b('بدء المراجعة')).toBeEnabled() })
  await scene(4, 'start-review', 7, 'بدء المراجعة فعل مستقل', 'Start review is a separate explicit action', 'سلمى / Salma', '001', async () => { await b('بدء المراجعة').click(); await expect(b('قبول المستند').first()).toBeVisible() })
  // Prepare approval through the actual review controls, retained in the long take.
  for (const label of ['إثبات هوية المتقدم', 'إثبات النشاط التجاري', 'ملخص الإيرادات والمصروفات', 'خطة شراء المخزون']) {
    const document = page.getByRole('region', { name: label, exact: true })
    await document.getByRole('checkbox', { name: 'أؤكد أنني فحصت المستند الحالي', exact: true }).check()
    await document.getByRole('button', { name: 'قبول المستند', exact: true }).click()
  }
  await passChecks(['اتساق المستندات والبيانات', 'مدة مزاولة النشاط', 'ملاءمة الغرض لمنتج التمويل', 'توافق مبلغ التمويل مع تكلفة الشراء', 'القدرة التوضيحية على السداد'])
  await scene(5, 'internal-note', 4, 'ملاحظات داخلية محفوظة لا تظهر للمتقدم', 'Saved internal notes stay private to staff', 'سلمى / Salma', '007', async () => {
    await go('/staff/applications/RIFD-2026-007'); await page.getByLabel('ملاحظة داخلية', { exact: true }).fill('ملاحظة داخلية تجريبية لا تظهر للمتقدم.'); await b('حفظ الملاحظة').click(); await expect(page.getByText('ملاحظة داخلية تجريبية لا تظهر للمتقدم.', { exact: true })).toBeVisible()
  })
  await scene(5, 'target-request', 5, 'هدف محدد وسبب مستقل قبل التأكيد', 'Inspect a targeted correction and its individual reason', 'سلمى / Salma', '007', async () => {
    await go('/staff/applications/RIFD-2026-007/correction-request'); await page.getByRole('checkbox', { name: 'اسم المتقدم الكامل', exact: true }).check(); await page.getByRole('textbox', { name: 'سبب التصحيح: اسم المتقدم الكامل', exact: true }).fill('طابق الاسم مع مستند الهوية التجريبي.'); await b('فحص طلب التصحيح').click(); await expect(page.getByRole('dialog')).toBeVisible()
  })
  await page.keyboard.press('Escape'); await go('/staff/applications/RIFD-2026-004')
  await switchTo('هدى علي'); await go('/applications/RIFD-2026-004/corrections/current')
  const editor = page.getByRole('region', { name: 'الرد على التصحيحات', exact: true })
  await scene(5, 'private-response', 5, 'الاستجابة الخاصة بجانب مبلغ مقدم قدره 600000', 'Private response stays beside the submitted 600,000 baseline', 'هدى / Huda', '004', async () => {
    await editor.getByRole('textbox').fill('٤٥٠٬٠٠٠'); const select = editor.locator('select').first(); await select.selectOption({ label: 'replacement' }); await editor.getByRole('button', { name: 'استخدام النموذج', exact: true }).click(); await expect(editor.getByRole('button', { name: 'معاينة الملف الجاهز', exact: true })).toBeVisible(); await save()
  })
  await page.setViewportSize({ width: 390, height: 950 }); await page.screenshot({ path: `${directory}/applicant-ar-390.png`, fullPage: true }); await page.setViewportSize({ width: 1440, height: 950 })
  await scene(5, 'resubmit', 7, 'نشر التغييرات المطلوبة معا', 'Resubmission publishes all requested changes together', 'هدى / Huda', '004', async () => { await editor.getByRole('button', { name: 'إعادة تقديم التصحيحات', exact: true }).click(); await expect(page.getByRole('status').filter({ hasText: 'أُعيد تقديم التصحيحات' })).toBeVisible() })
  await switchTo('سلمى ناصر')
  await scene(5, 'changed-targets', 8, 'تغير المبلغ والملف عن المرجع الثابت', 'Changed amount and plan are compared with the fixed baseline', 'سلمى / Salma', '004', async () => { await go('/staff/applications/RIFD-2026-004'); const heading = page.getByRole('heading', { name: 'التحقق من التصحيحات', exact: true }); await heading.scrollIntoViewIfNeeded(); await expect(heading.locator('..')).toContainText('تغير عن المرجع') })
  await scene(5, 'rechecks', 6, 'تحقق من التغييرات ثم أعد الفحوص التابعة', 'Verify the changes, then repeat the affected checks', 'سلمى / Salma', '004', async () => { await b('التحقق من تغيير الحقل').click(); await page.getByRole('region', { name: 'خطة شراء المخزون', exact: true }).getByRole('checkbox', { name: 'أؤكد أنني فحصت المستند الحالي', exact: true }).check(); await page.getByRole('region', { name: 'خطة شراء المخزون', exact: true }).getByRole('button', { name: 'قبول المستند', exact: true }).click(); await passChecks(['اتساق المستندات والبيانات', 'ملاءمة الغرض لمنتج التمويل', 'توافق مبلغ التمويل مع تكلفة الشراء', 'القدرة التوضيحية على السداد']) })
  await go('/staff/applications/RIFD-2026-001/decision')
  const reason = page.getByLabel('سبب القرار الظاهر للمتقدم', { exact: true })
  await reason.fill('استوفى الطلب جميع المعايير المطلوبة.')
  await scene(6, 'stale-decision', 9, 'إسناد خارجي يرفض قرارا من عرض قديم', 'Outside reassignment refuses the stale decision', 'سلمى / Salma', '001', async () => { await b('محاكاة إسناد الطلب إلى خالد').click(); await b('فحص الموافقة').click(); await page.getByRole('dialog').getByRole('button', { name: 'تأكيد القرار النهائي', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('تغير الطلب') })
  await scene(6, 'recovery', 7, 'تحميل الأحدث واسترداد مؤكد وفحص جديد', 'Load latest, confirm reclaim, then inspect again', 'سلمى / Salma', '001', async () => { await b('تحميل الأحدث').click(); await expect(reason).toHaveJSProperty('readOnly', true); await b('استرداد من خالد علي').click(); await page.getByRole('dialog').getByRole('button', { name: 'تأكيد النقل', exact: true }).click(); await b('فحص أحدث نسخة من الطلب').click(); await b('فحص الموافقة').click() })
  await scene(6, 'approval', 6, 'تأكيد جديد يحفظ الموافقة وشروطها', 'Fresh confirmation commits approval and freezes its terms', 'سلمى / Salma', '001', async () => { await page.getByRole('dialog').getByRole('button', { name: 'تأكيد القرار النهائي', exact: true }).click(); await expect(page.getByRole('status').filter({ hasText: 'حُفظ القرار النهائي.' })).toBeVisible() })
  await switchTo('عمر حسن'); await go('/applications/new?product=inventory'); await b('طلب جديد').click(); await l('2. النشاط التجاري').click()
  for (const [field, value] of Object.entries({ businessName: 'DEMO متجر جديد', address: 'سوق تجريبي، عدن', operatingSince: '2026-08', revenue: '700000', expenses: '500000' })) await page.locator(`#field-${field}`).fill(value)
  await l('3. التمويل').click()
  for (const [field, value] of Object.entries({ amount: '100010', term: '6', budget: '250000' })) await page.locator(`#field-${field}`).fill(value)
  await page.locator('#purchase-explanation').fill('مخزون تجريبي لمتجر جديد.'); await l('4. المستندات').click()
  for (const slot of ['identity', 'business', 'financial', 'purchase']) { const section = page.locator(`section[aria-labelledby="${slot}-heading"]`); await section.getByRole('button', { name: 'استخدام النموذج', exact: true }).click(); await expect(section.getByText('جاهز للحفظ', { exact: true })).toBeVisible() }
  await l('5. المراجعة').click(); await b('تقديم الطلب').click(); await expect(page.getByRole('status').filter({ hasText: 'قُدم طلبك' })).toBeVisible()
  const rejectionId = await page.locator('main h1').innerText()
  await switchTo('سلمى ناصر'); await go(`/staff/applications/${rejectionId}`); await b('استلام الطلب').click(); await b('بدء المراجعة').click()
  await scene(6, 'new-rejection', 7, 'رفض جديد بعد تقديم فعلي لنشاط عمره شهران', 'New rejection after normal submission: two operating months', 'سلمى / Salma', rejectionId, async () => {
    const failed = page.getByRole('group', { name: 'مدة مزاولة النشاط', exact: true }).getByRole('button', { name: 'لم يجتز', exact: true }); await failed.click(); await expect(failed).toHaveAttribute('aria-pressed', 'true'); await l('تسجيل القرار النهائي').click(); await reason.fill('مدة النشاط شهران، والحد الأدنى ستة أشهر.'); await b('فحص الرفض').click(); await page.getByRole('dialog').getByRole('button', { name: 'تأكيد القرار النهائي', exact: true }).click(); await expect(page.getByRole('status').filter({ hasText: 'حُفظ القرار النهائي.' })).toBeVisible()
  })
  await scene(6, 'repayment', 6, 'مثال تاريخي ثابت بقسطين مكتملين', 'Historical frozen illustration with two completed entries', 'سلمى / Salma', '005', async () => { await go('/staff/applications/RIFD-2026-005/repayment'); await expect(page.getByText('144,000 ر.ي.', { exact: true })).toBeVisible() })
  await scene(7, 'english', 5, 'تبديل اللغة يحفظ السياق والاتجاه', 'Explicit English switch preserves the current record', 'سلمى / Salma', '005', async () => { await b('English').click(); await expect(page.locator('html')).toHaveAttribute('lang', 'en'); await page.waitForTimeout(1000); await b('العربية').click() })
  await scene(7, 'expiry', 7, 'انتهاء الجلسة ثم استعادة الهوية نفسها', 'Expiry covers protected content; same-identity sign-in recovers', 'سلمى / Salma', '005', async () => { await b('إنهاء الجلسة').click(); await expect(b('سلمى ناصر')).toBeVisible(); await page.waitForTimeout(1700); await b('سلمى ناصر').click() })
  await switchTo('مريم سالم')
  await scene(7, 'forbidden', 5, 'الرابط غير المسموح لا يكشف تفاصيل الطلب', 'Forbidden access reveals no application details', 'مريم / Mariam', '004 forbidden', async () => { await go('/applications/RIFD-2026-004'); await expect(page.locator('main')).not.toContainText('600,000') })
  await scene(7, 'gallery', 5, 'معرض المكونات المستخدمة في الرحلات', 'Public gallery uses the production components', 'مريم / Mariam', 'Components', async () => { await go('/components') })
  await scene(7, 'reset', 8, 'تأكيد إعادة الضبط يستبدل بيانات هذا المتصفح', 'Confirm browser-wide reset after reading the warning', 'مريم / Mariam', 'Reset', async () => { await go('/demo/reset'); await b('إعادة ضبط العرض').last().click(); await page.getByRole('dialog').getByRole('button', { name: 'استبدال جميع بيانات العرض', exact: true }).click(); await expect(b('مريم سالم')).toBeVisible() })
  await scene(7, 'restored', 5, 'عادت العربية والهويات والبيانات الأصلية', 'Arabic, identities and the original dataset are restored', 'زائر / Visitor', 'Canonical seeds', async () => { await expect(page.locator('html')).toHaveAttribute('lang', 'ar') })
  await writeFile(`${directory}/result.json`, JSON.stringify({ outcome: 'passed', origin, browser: browser.version(), recordedAt: new Date().toISOString(), rejectionId, scenes: scenes.length }, null, 2) + '\n')
} finally {
  await context.tracing.stop({ path: `${directory}/trace.zip` })
  await page.close()
  const raw = await page.video().path()
  await writeFile(`${directory}/recording.json`, JSON.stringify({ raw, elapsed: (performance.now() - started) / 1000, origin, browser: browser.version() }, null, 2) + '\n')
  await context.close(); await browser.close()
  console.log(`Recording retained at ${directory}`)
}
