# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: performance.gates.spec.ts >> en 390 correction samples keep their loading and recovery positions
- Location: tests/browser/performance.gates.spec.ts:67:80

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 0.1
Received:    0.29578947368421055
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link "RIFD Financing demo" [ref=e4] [cursor=pointer]:
      - /url: /
      - generic [ref=e9]:
        - text: RIFD
        - generic [ref=e10]: Financing demo
    - navigation "Main navigation" [ref=e11]:
      - button "Reset demo" [ref=e12] [cursor=pointer]
      - link "Interface components" [ref=e13] [cursor=pointer]:
        - /url: /components
      - link "Financing products" [ref=e14] [cursor=pointer]:
        - /url: /products
      - link "My applications" [ref=e15] [cursor=pointer]:
        - /url: /applications
      - link "Notifications" [ref=e16] [cursor=pointer]:
        - /url: /notifications
    - generic [ref=e17]:
      - generic [ref=e18]:
        - text: Huda Ali
        - generic [ref=e19]: Applicant
      - button "العربية" [ref=e20] [cursor=pointer]
      - button "Switch identity" [ref=e21] [cursor=pointer]
      - button "Sign out" [ref=e22] [cursor=pointer]
      - button "Expire session" [ref=e23] [cursor=pointer]
  - main [ref=e25]:
    - paragraph [ref=e26]: Inventory financing
    - generic [ref=e27]:
      - heading "RIFD-2026-004" [active] [level=1] [ref=e28]
      - generic [ref=e29]: Corrections requested
    - paragraph [ref=e30]: هدى علي · متجر الندى التجريبي
    - generic [ref=e31]:
      - heading "Next step" [level=2] [ref=e32]
      - paragraph [ref=e33]: The reviewer requested the changes below. Submitted information remains visible to staff until resubmission.
    - link "Print summary" [ref=e34] [cursor=pointer]:
      - /url: /applications/RIFD-2026-004/print
    - region [ref=e35]:
      - heading "Respond to corrections" [level=2] [ref=e36]
      - region [ref=e37]:
        - heading "Response progress" [level=3] [ref=e38]
        - paragraph [ref=e39]: Edit only the requested targets and save even incomplete input. The product and other information are read-only. Staff see the submitted information until resubmission.
        - paragraph [ref=e40]: "Fixed request baseline: 4 October 2026"
        - paragraph [ref=e41]: 0 / 2 Changed from baseline; validation required before resubmission
        - list [ref=e42]:
          - listitem [ref=e43]:
            - strong [ref=e44]: Financing amount
            - paragraph [ref=e45]: The illustrated installment of 105,000 YER exceeds the fictional capacity limit of 80,000 YER. Please reduce the financing request.
            - paragraph [ref=e46]: "Fixed request baseline: 600,000 YER"
            - paragraph [ref=e47]: Not changed from baseline yet
          - listitem [ref=e48]:
            - strong [ref=e49]: Stock purchase plan
            - paragraph [ref=e50]: Please provide a readable purchase plan showing the intended purchases and total cost.
            - paragraph [ref=e51]: Not changed from baseline yet
      - generic [ref=e52]:
        - generic [ref=e53]:
          - heading "Requested changes" [level=2] [ref=e54]
          - generic [ref=e55]:
            - generic [ref=e56]: Financing amount
            - paragraph [ref=e57]: Whole YER. Arabic-Indic digits and valid thousands grouping are accepted.
            - textbox "Financing amount" [ref=e58]: "600000"
          - region [ref=e59]:
            - heading "Stock purchase plan" [level=3] [ref=e60]
            - paragraph [ref=e61]: A fictional stock purchase plan consistent with the purchase explanation and total purchase budget.
            - paragraph [ref=e62]: PDF, JPEG or PNG, greater than zero and up to 5,000,000 bytes. MIME must match the extension.
            - generic [ref=e63]: Choose a local fictional document
            - button "Choose a local fictional document" [ref=e64]
            - generic [ref=e65]:
              - generic [ref=e66]: Prepared sample
              - combobox "Prepared sample" [ref=e67]:
                - option "Stock purchase plan" [selected]
                - option "replacement"
                - option "Identical content, another name"
              - button "Use sample" [ref=e68] [cursor=pointer]
            - generic [ref=e69]:
              - paragraph [ref=e70]:
                - text: "Saved in correction workspace: DEMO-RIFD-2026-004-purchase-original.jpg"
                - generic [ref=e71]: image/jpeg · 41992 B
              - button "Preview saved file" [ref=e73] [cursor=pointer]
          - heading "Private response summary" [level=3] [ref=e74]
          - paragraph [ref=e75]: This is your current information, including unsaved changes. Valid formats do not establish review eligibility.
          - heading "Inventory financing" [level=3] [ref=e76]
          - generic [ref=e77]:
            - generic [ref=e78]:
              - term [ref=e79]: Applicant full name
              - definition [ref=e80]: هدى علي
            - generic [ref=e81]:
              - term [ref=e82]: Mobile
              - definition [ref=e83]: "+000000000002"
            - generic [ref=e84]:
              - term [ref=e85]: City
              - definition [ref=e86]: عدن
            - generic [ref=e87]:
              - term [ref=e88]: Email
              - definition [ref=e89]: huda@example.test
            - generic [ref=e90]:
              - term [ref=e91]: Business name
              - definition [ref=e92]: متجر الندى التجريبي
            - generic [ref=e93]:
              - term [ref=e94]: Business activity
              - definition [ref=e95]: Retail
            - generic [ref=e96]:
              - term [ref=e97]: Business address
              - definition [ref=e98]: شارع السوق، موقع تجريبي، عدن
            - generic [ref=e99]:
              - term [ref=e100]: Operating since
              - definition [ref=e101]: 2025-01
            - generic [ref=e102]:
              - term [ref=e103]: Average monthly revenue
              - definition [ref=e104]: 700,000 YER
            - generic [ref=e105]:
              - term [ref=e106]: Average monthly operating expenses
              - definition [ref=e107]: 500,000 YER
            - generic [ref=e108]:
              - term [ref=e109]: Financing amount
              - definition [ref=e110]: 600,000 YER
            - generic [ref=e111]:
              - term [ref=e112]: Repayment term
              - definition [ref=e113]: "6"
            - generic [ref=e114]:
              - term [ref=e115]: Purchase budget
              - definition [ref=e116]: 650,000 YER
            - generic [ref=e117]:
              - term [ref=e118]: Purchase explanation
              - definition [ref=e119]: شراء مخزون من المستلزمات المنزلية لتجديد البضائع في المتجر.
          - list [ref=e120]:
            - listitem [ref=e121]: "Applicant identity evidence: DEMO-RIFD-2026-004-identity-original.png"
            - listitem [ref=e122]: "Business evidence: DEMO-RIFD-2026-004-business-original.pdf"
            - listitem [ref=e123]: "Revenue and expense summary: DEMO-RIFD-2026-004-financial-original.pdf"
            - listitem [ref=e124]: "Stock purchase plan: DEMO-RIFD-2026-004-purchase-original.jpg"
          - button "Check application" [ref=e125] [cursor=pointer]
          - button "Resubmit corrections" [ref=e126] [cursor=pointer]
        - complementary [ref=e127]:
          - heading "Inventory financing" [level=2] [ref=e128]
          - paragraph [ref=e129]: Replenish stock for an established small business.
          - paragraph [ref=e130]:
            - generic [ref=e131]: 100,000 YER / 1,000,000 YER
          - paragraph [ref=e132]: 6 / 12 months
          - paragraph [ref=e133]:
            - text: "Illustrative markup:"
            - generic [ref=e134]: 5%
            - text: . Added once. No other illustrated charges.
          - paragraph [ref=e135]: "Fictional review criteria: six operating months, suitable purpose, purchase budget coverage, and a largest installment no greater than 40% of positive monthly surplus."
      - generic [ref=e136]:
        - status [ref=e137]: Saved
        - paragraph [ref=e138]: "Last successful save: 4 Oct 2026, 03:00:00"
      - button "Save progress" [ref=e139] [cursor=pointer]
      - group [ref=e140]:
        - generic "Demo controls" [ref=e141] [cursor=pointer]
        - option "No failure armed" [selected]
        - option "Fail next valid preparation at 50%"
        - option "Fail next progress save"
        - option "Fail next submission"
        - option "Abort next eligible application or reset storage write"
    - generic [ref=e142]:
      - generic [ref=e143]:
        - generic [ref=e144]:
          - heading "Submitted information" [level=2] [ref=e145]
          - generic [ref=e146]:
            - generic [ref=e147]:
              - term [ref=e148]: Applicant full name
              - definition [ref=e149]: هدى علي
            - generic [ref=e150]:
              - term [ref=e151]: Mobile
              - definition [ref=e152]: "+000000000002"
            - generic [ref=e153]:
              - term [ref=e154]: City
              - definition [ref=e155]: عدن
            - generic [ref=e156]:
              - term [ref=e157]: Email
              - definition [ref=e158]: huda@example.test
            - generic [ref=e159]:
              - term [ref=e160]: Business name
              - definition [ref=e161]: متجر الندى التجريبي
            - generic [ref=e162]:
              - term [ref=e163]: Business activity
              - definition [ref=e164]: Retail
            - generic [ref=e165]:
              - term [ref=e166]: Business address
              - definition [ref=e167]: شارع السوق، موقع تجريبي، عدن
            - generic [ref=e168]:
              - term [ref=e169]: Operating since
              - definition [ref=e170]: 2025-01
            - generic [ref=e171]:
              - term [ref=e172]: Average monthly revenue
              - definition [ref=e173]: 700,000 YER
            - generic [ref=e174]:
              - term [ref=e175]: Average monthly operating expenses
              - definition [ref=e176]: 500,000 YER
            - generic [ref=e177]:
              - term [ref=e178]: Financing amount
              - definition [ref=e179]: 600,000 YER
            - generic [ref=e180]:
              - term [ref=e181]: Repayment term
              - definition [ref=e182]: 6 months
            - generic [ref=e183]:
              - term [ref=e184]: Purchase budget
              - definition [ref=e185]: 650,000 YER
            - generic [ref=e186]:
              - term [ref=e187]: Purchase explanation
              - definition [ref=e188]: شراء مخزون من المستلزمات المنزلية لتجديد البضائع في المتجر.
          - paragraph [ref=e189]:
            - text: "Financial evidence months:"
            - generic [ref=e190]: July 2026
            - generic [ref=e191]: August 2026
            - generic [ref=e192]: September 2026
        - generic [ref=e193]:
          - heading "Documents" [level=2] [ref=e194]
          - list [ref=e195]:
            - listitem [ref=e196]:
              - strong [ref=e197]: Applicant identity evidence
              - paragraph [ref=e198]:
                - text: DEMO-RIFD-2026-004-identity-original.png
                - generic [ref=e199]: image/png · 80,192 B
                - generic [ref=e201]: Included in submitted information
              - button "Preview Applicant identity evidence" [ref=e202] [cursor=pointer]
            - listitem [ref=e203]:
              - strong [ref=e204]: Business evidence
              - paragraph [ref=e205]:
                - text: DEMO-RIFD-2026-004-business-original.pdf
                - generic [ref=e206]: application/pdf · 111,729 B
                - generic [ref=e208]: Included in submitted information
              - button "Preview Business evidence" [ref=e209] [cursor=pointer]
            - listitem [ref=e210]:
              - strong [ref=e211]: Revenue and expense summary
              - paragraph [ref=e212]:
                - text: DEMO-RIFD-2026-004-financial-original.pdf
                - generic [ref=e213]: application/pdf · 162,727 B
                - generic [ref=e215]: Included in submitted information
              - button "Preview Revenue and expense summary" [ref=e216] [cursor=pointer]
            - listitem [ref=e217]:
              - strong [ref=e218]: Stock purchase plan
              - paragraph [ref=e219]:
                - text: DEMO-RIFD-2026-004-purchase-original.jpg
                - generic [ref=e220]: image/jpeg · 41,992 B
                - generic [ref=e222]: Included in submitted information
              - button "Preview Stock purchase plan" [ref=e223] [cursor=pointer]
        - generic [ref=e224]:
          - heading "Requested changes" [level=2] [ref=e225]
          - paragraph [ref=e226]: "Fixed request baseline: 4 October 2026"
          - list [ref=e227]:
            - listitem [ref=e228]:
              - strong [ref=e229]: Financing amount
              - paragraph [ref=e230]: The illustrated installment of 105,000 YER exceeds the fictional capacity limit of 80,000 YER. Please reduce the financing request.
            - listitem [ref=e231]:
              - strong [ref=e232]: Stock purchase plan
              - paragraph [ref=e233]: Please provide a readable purchase plan showing the intended purchases and total cost.
        - generic [ref=e234]:
          - heading "Private saved response" [level=2] [ref=e235]
          - paragraph [ref=e236]: This is privately saved progress. Submitted information stays unchanged until resubmission.
          - link "Open correction workspace" [ref=e237] [cursor=pointer]:
            - /url: /applications/RIFD-2026-004/corrections/current?round=RIFD-2026-004-round-1
          - paragraph [ref=e238]: "Financing amount: 600,000 YER"
        - generic [ref=e239]:
          - heading "Application history" [level=2] [ref=e240]
          - list [ref=e241]:
            - listitem [ref=e242]:
              - strong [ref=e243]: Application submitted
              - generic [ref=e244]: 2 October 2026
            - listitem [ref=e245]:
              - strong [ref=e246]: Review started
              - generic [ref=e247]: 3 October 2026
            - listitem [ref=e248]:
              - strong [ref=e249]: Corrections requested
              - generic [ref=e250]: 4 October 2026
              - paragraph [ref=e251]: The illustrated installment of 105,000 YER exceeds the fictional capacity limit of 80,000 YER. Please reduce the financing request. Please provide a readable purchase plan showing the intended purchases and total cost.
      - generic [ref=e253]:
        - heading "Inventory financing" [level=2] [ref=e254]
        - generic [ref=e255]:
          - generic [ref=e256]:
            - term [ref=e257]: Financing amount
            - definition [ref=e258]: 600,000 YER
          - generic [ref=e259]:
            - term [ref=e260]: Repayment term
            - definition [ref=e261]: 6 months
          - generic [ref=e262]:
            - term [ref=e263]: Submitted on
            - definition [ref=e264]: 2 October 2026
  - contentinfo [ref=e265]:
    - paragraph [ref=e266]: Demo. People, products, and financing terms are fictional. No request reaches a bank, no identity is verified, and no payment is processed.
    - paragraph [ref=e267]: A duplicated tab or one opened from another demo tab may start with the same identity. Activity, sign-out and identity changes are independent in each tab.
    - paragraph [ref=e268]: Data and files stay in this browser profile and can be inspected locally. They do not sync across devices or browsers and may disappear through clearing, private browsing, or eviction. Use fictional data and documents only.
```

# Test source

```ts
  29  | for (const language of ['ar', 'en'] as const) test(`${language} slow save, upload, submission and decision paint pending feedback within 100ms`, async ({ page }, info) => {
  30  |   test.skip(info.project.name !== 'chrome', 'Paint timing uses the fixed Chrome host')
  31  |   const ar = language === 'ar'
  32  |   await page.setViewportSize({ width: 390, height: 950 })
  33  |   await page.goto('/applications/RIFD-2026-001/edit?step=financing')
  34  |   await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 120_000 })
  35  |   if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click()
  36  |   await page.getByRole('button', { name: ar ? 'مريم سالم' : 'Mariam Salem', exact: true }).click()
  37  |   await page.locator('#purchase-explanation').fill('Fictional stock for this established small business.')
  38  |   await page.locator('.demo-controls summary').click()
  39  |   await page.getByLabel(ar ? 'طلبات بطيئة' : 'Slow requests', { exact: true }).check()
  40  |   const save = page.getByRole('button', { name: ar ? 'حفظ التقدم' : 'Save progress', exact: true })
  41  |   await pendingPaint(page, info, 'save', save, '.draft-editor > .draft-feedback[aria-busy=true]', () => save.click())
  42  |   await expect(page.locator('.draft-editor > div.draft-feedback')).toHaveAttribute('aria-busy', 'false')
  43  |   await page.getByRole('link', { name: ar ? '4. المستندات' : '4. Documents', exact: true }).click()
  44  |   const upload = page.locator('#identity-file')
  45  |   await pendingPaint(page, info, 'upload', upload, 'section[aria-labelledby="identity-heading"] progress', () => upload.setInputFiles({ name: 'DEMO-timing.png', mimeType: 'image/png', buffer: Buffer.from('fictional pending upload evidence') }), 'change')
  46  |   await expect(page.getByRole('button', { name: ar ? 'معاينة الملف الجاهز' : 'Preview ready file', exact: true })).toBeVisible()
  47  |   await page.getByRole('link', { name: ar ? '5. المراجعة' : '5. Review', exact: true }).click()
  48  |   const submit = page.getByRole('button', { name: ar ? 'تقديم الطلب' : 'Submit application', exact: true })
  49  |   await pendingPaint(page, info, 'submission', submit, '.draft-editor button[aria-busy=true]', () => submit.click())
  50  |   await expect(page.getByRole('status').filter({ hasText: ar ? 'قُدم طلبك' : 'Your application was submitted' })).toBeVisible()
  51  |   // Stay in this tab and navigate through the UI so Slow requests remains active.
  52  |   await page.getByRole('button', { name: ar ? 'تغيير الهوية' : 'Switch identity', exact: true }).click()
  53  |   await page.getByRole('button', { name: ar ? 'سلمى ناصر' : 'Salma Nasser', exact: true }).click()
  54  |   await page.locator('#queue-search').fill('RIFD-2026-007')
  55  |   await page.locator('[data-application="RIFD-2026-007"] a').first().click()
  56  |   const purpose = page.getByRole('group', { name: ar ? 'ملاءمة الغرض لمنتج التمويل' : 'Product purpose fit', exact: true })
  57  |   await purpose.getByRole('button', { name: ar ? 'لم يجتز' : 'Failed', exact: true }).click()
  58  |   await expect(purpose.getByRole('button', { name: ar ? 'لم يجتز' : 'Failed', exact: true })).toHaveAttribute('aria-pressed', 'true')
  59  |   await page.getByRole('link', { name: ar ? 'تسجيل القرار النهائي' : 'Record final decision', exact: true }).click()
  60  |   await page.locator('#decision-reason').fill(ar ? 'الغرض لا يطابق المنتج.' : 'The purpose does not match this product.')
  61  |   await page.getByRole('button', { name: ar ? 'فحص الرفض' : 'Inspect rejection', exact: true }).click()
  62  |   const confirm = page.getByRole('dialog').getByRole('button', { name: ar ? 'تأكيد القرار النهائي' : 'Confirm final decision', exact: true })
  63  |   await pendingPaint(page, info, 'decision', confirm, 'section[aria-labelledby="decision-heading"][aria-busy=true] [role=status]', () => confirm.click())
  64  |   await expect(page.getByRole('status').filter({ hasText: ar ? 'حُفظ القرار النهائي.' : 'Final decision saved.' })).toBeVisible()
  65  | })
  66  |
  67  | for (const language of ['ar', 'en'] as const) for (const width of [390, 1440]) test(`${language} ${width} correction samples keep their loading and recovery positions`, async ({ page }, info) => {
  68  |   test.skip(info.project.name !== 'chrome', 'Layout Shift API measurement uses Chrome')
  69  |   await page.setViewportSize({ width, height: 950 })
  70  |   await page.addInitScript(() => {
  71  |     const frames: { busy: boolean; x: number; y: number; width: number; height: number; buttonX: number }[] = []
  72  |     const shifts: { value: number; time: number; recentInput: boolean; nodes: string[] }[] = []
  73  |     Object.assign(window, { sampleFrames: frames, sampleShifts: shifts })
  74  |     new PerformanceObserver(list => {
  75  |       if (!frames.length) return
  76  |       for (const entry of list.getEntries()) {
  77  |         const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean; sources?: { node?: Element }[] }
  78  |         shifts.push({ value: shift.value, time: shift.startTime, recentInput: shift.hadRecentInput, nodes: shift.sources?.map(source => source.node?.id || source.node?.tagName || 'removed') ?? [] })
  79  |       }
  80  |     }).observe({ type: 'layout-shift', buffered: false })
  81  |     const observe = () => {
  82  |       const picker = document.querySelector('.sample-picker')
  83  |       if (picker) {
  84  |         const rect = picker.getBoundingClientRect()
  85  |         frames.push({ busy: picker.getAttribute('aria-busy') === 'true', x: rect.x, y: rect.y, width: rect.width, height: rect.height, buttonX: picker.querySelector('button')!.getBoundingClientRect().x - rect.x })
  86  |       }
  87  |       requestAnimationFrame(observe)
  88  |     }
  89  |     requestAnimationFrame(observe)
  90  |   })
  91  |   await page.goto('/applications/RIFD-2026-004/corrections/current')
  92  |   await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 120_000 })
  93  |   if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click()
  94  |   const identity = language === 'ar' ? 'هدى علي' : 'Huda Ali'
  95  |   await page.getByRole('button', { name: identity, exact: true }).click()
  96  |   const picker = page.locator('.sample-picker')
  97  |   await expect(picker).toHaveAttribute('aria-busy', 'false')
  98  |   const frames = () => page.evaluate(() => (window as unknown as { sampleFrames: { busy: boolean; height: number; buttonX: number }[] }).sampleFrames)
  99  |   const stability = () => page.evaluate(() => {
  100 |     const shifts = (window as unknown as { sampleShifts: { value: number; time: number; recentInput: boolean }[] }).sampleShifts
  101 |     let cls = 0, sum = 0, start = 0, last = 0
  102 |     for (const shift of shifts.filter(shift => !shift.recentInput)) {
  103 |       if (shift.time - last > 1000 || shift.time - start > 5000) { sum = 0; start = shift.time }
  104 |       sum += shift.value; last = shift.time; cls = Math.max(cls, sum)
  105 |     }
  106 |     return { cls, shifts }
  107 |   })
  108 |   await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  109 |   const initial = await frames()
  110 |   const initialStability = await stability()
  111 |   expect(initial.some(frame => frame.busy)).toBe(true)
  112 |   await info.attach('initial-sample-layout.json', { body: JSON.stringify(initial), contentType: 'application/json' })
  113 |   await info.attach('initial-layout-shifts.json', { body: JSON.stringify(initialStability), contentType: 'application/json' })
  114 |   expect(initialStability.cls).toBeLessThanOrEqual(0.1)
  115 |   expect(Math.max(...initial.map(frame => frame.height)) - Math.min(...initial.map(frame => frame.height))).toBeLessThanOrEqual(1)
  116 |   expect(Math.max(...initial.map(frame => frame.buttonX)) - Math.min(...initial.map(frame => frame.buttonX))).toBeLessThanOrEqual(1)
  117 |   await page.getByRole('button', { name: language === 'ar' ? 'إنهاء الجلسة' : 'Expire session', exact: true }).click()
  118 |   await page.evaluate(() => {
  119 |     const state = window as unknown as { sampleFrames: unknown[]; sampleShifts: unknown[] }
  120 |     state.sampleFrames.length = 0; state.sampleShifts.length = 0
  121 |   })
  122 |   await page.getByRole('button', { name: identity, exact: true }).click()
  123 |   await expect(picker).toHaveAttribute('aria-busy', 'false')
  124 |   await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  125 |   const recovery = await frames()
  126 |   const recoveryStability = await stability()
  127 |   await info.attach('recovery-sample-layout.json', { body: JSON.stringify(recovery), contentType: 'application/json' })
  128 |   await info.attach('recovery-layout-shifts.json', { body: JSON.stringify(recoveryStability), contentType: 'application/json' })
> 129 |   expect(recoveryStability.cls).toBeLessThanOrEqual(0.1)
      |                                 ^ Error: expect(received).toBeLessThanOrEqual(expected)
  130 |   expect(recovery.some(frame => frame.busy)).toBe(true)
  131 |   expect(Math.max(...recovery.map(frame => frame.height)) - Math.min(...recovery.map(frame => frame.height))).toBeLessThanOrEqual(1)
  132 |   expect(Math.max(...recovery.map(frame => frame.buttonX)) - Math.min(...recovery.map(frame => frame.buttonX))).toBeLessThanOrEqual(1)
  133 | })
  134 |
```
