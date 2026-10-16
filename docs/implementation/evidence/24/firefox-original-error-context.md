# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: application.screens.spec.ts >> cancel and confirm switching retain raw amount and term and stage document removal until saving
- Location: tests/browser/application.screens.spec.ts:67:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Prepare draft', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Prepare draft', exact: true }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Prepare draft', exact: true })

```

```yaml
- banner:
  - link "رِفد عرض تمويل تجريبي":
    - /url: /
  - navigation "التنقل الرئيسي":
    - button "إعادة ضبط العرض"
    - link "مكونات الواجهة":
      - /url: /components
    - link "منتجات التمويل":
      - /url: /products
    - link "طلباتي":
      - /url: /applications
    - link "الإشعارات":
      - /url: /notifications
  - text: مريم سالم متقدم
  - button "English"
  - button "تغيير الهوية"
  - button "تسجيل الخروج"
  - button "إنهاء الجلسة"
- main:
  - paragraph: تمويل المخزون
  - heading "RIFD-2026-001" [level=1]
  - text: مسودة
  - paragraph: مريم سالم · متجر السهل التجريبي
  - heading "الخطوة التالية" [level=2]
  - paragraph: أكمل الخطوات الخمس واحفظ بياناتك ومستنداتك في هذا المتصفح. يمكن حفظ الإدخال غير المكتمل أو غير الصالح. المسودة لم تُقدّم للمراجعة.
  - link "طباعة الملخص":
    - /url: /applications/RIFD-2026-001/print
  - region "إعداد المسودة":
    - heading "إعداد المسودة" [level=2]
    - navigation "خطوات الطلب":
      - link "1. البيانات الشخصية":
        - /url: "?step=personal"
      - link "2. النشاط التجاري":
        - /url: "?step=business"
      - link "3. التمويل":
        - /url: "?step=financing"
      - link "4. المستندات":
        - /url: "?step=documents"
      - link "5. المراجعة":
        - /url: "?step=review"
    - heading "التمويل" [level=2]
    - text: منتج التمويل
    - combobox "منتج التمويل":
      - option "تمويل المخزون" [selected]
      - option "تمويل المعدات"
    - text: مبلغ التمويل
    - paragraph: مبلغ صحيح بالريال اليمني. تقبل الأرقام العربية والفواصل الصحيحة.
    - textbox "مبلغ التمويل": "200000"
    - text: مدة السداد
    - paragraph: 6 / 12
    - textbox "مدة السداد": "6"
    - text: تكلفة الشراء
    - paragraph: مبلغ صحيح بالريال اليمني. تقبل الأرقام العربية والفواصل الصحيحة.
    - textbox "تكلفة الشراء": "250000"
    - text: شرح الشراء
    - paragraph: يلزم 20 إلى 500 حرف عند التقديم. يمكنك حفظ النص كما أدخلته الآن.
    - textbox "شرح الشراء"
    - button "الخطوة السابقة"
    - button "الخطوة التالية"
    - complementary:
      - heading "تمويل المخزون" [level=2]
      - paragraph: تجديد مخزون نشاط تجاري صغير قائم.
      - paragraph: 100,000 ر.ي. / 1,000,000 ر.ي.
      - paragraph: 6 / 12 شهرًا
      - paragraph: "الزيادة التوضيحية: 5%. تُضاف مرة واحدة. لا رسوم توضيحية أخرى."
      - paragraph: "معايير مراجعة افتراضية: مزاولة النشاط ستة أشهر، وملاءمة الغرض، وتغطية تكلفة الشراء، وألا يتجاوز أكبر قسط 40% من فائض شهري موجب."
    - status: محفوظ
    - paragraph: "آخر حفظ ناجح: 14‏/10‏/2026، 3:00:00 ص"
    - button "حفظ التقدم"
    - group: أدوات العرض التجريبي
  - heading "المعلومات المحفوظة في المسودة" [level=2]
  - term: اسم المتقدم الكامل
  - definition: مريم سالم
  - term: رقم الجوال
  - definition: "+000000000001"
  - term: المدينة
  - definition: عدن
  - term: البريد الإلكتروني
  - definition: mariam@example.test
  - term: اسم النشاط التجاري
  - definition: متجر السهل التجريبي
  - term: نوع النشاط
  - definition: تجارة تجزئة
  - term: عنوان النشاط
  - definition: شارع السوق، موقع تجريبي، عدن
  - term: بداية النشاط
  - definition: 2025-01
  - term: متوسط الإيرادات الشهرية
  - definition: 700,000 ر.ي.
  - term: متوسط المصروفات الشهرية
  - definition: 500,000 ر.ي.
  - term: مبلغ التمويل
  - definition: 200,000 ر.ي.
  - term: مدة السداد
  - definition: 6 شهرًا
  - term: تكلفة الشراء
  - definition: 250,000 ر.ي.
  - term: شرح الشراء
  - definition: لم يُكتب شرح الشراء بعد
  - paragraph: "أشهر الأدلة المالية: يوليو 2026 أغسطس 2026 سبتمبر 2026"
  - heading "المستندات" [level=2]
  - list:
    - listitem:
      - strong: إثبات هوية المتقدم
      - paragraph: DEMO-RIFD-2026-001-identity-original.png image/png · 53,157 B محفوظ في المسودة
      - button "معاينة إثبات هوية المتقدم"
    - listitem:
      - strong: إثبات النشاط التجاري
      - paragraph: DEMO-RIFD-2026-001-business-original.pdf application/pdf · 177,657 B محفوظ في المسودة
      - button "معاينة إثبات النشاط التجاري"
    - listitem:
      - strong: ملخص الإيرادات والمصروفات
      - paragraph: DEMO-RIFD-2026-001-financial-original.pdf application/pdf · 233,544 B محفوظ في المسودة
      - button "معاينة ملخص الإيرادات والمصروفات"
    - listitem:
      - strong: خطة شراء المخزون
      - paragraph: DEMO-RIFD-2026-001-purchase-original.jpg image/jpeg · 95,989 B محفوظ في المسودة
      - button "معاينة خطة شراء المخزون"
  - heading "سجل الطلب" [level=2]
  - paragraph: لم يُقدّم هذا الطلب بعد. لا توجد أحداث مراجعة.
  - heading "تمويل المخزون" [level=2]
  - term: مبلغ التمويل
  - definition: 200,000 ر.ي.
  - term: مدة السداد
  - definition: 6 شهرًا
  - term: تاريخ التقديم
  - definition: لم يُقدّم بعد
- contentinfo:
  - paragraph: عرض تجريبي. الأشخاص والمنتجات وشروط التمويل افتراضية. لا يُرسل أي طلب إلى بنك، ولا تُتحقق هوية، ولا تُعالج مدفوعات.
  - paragraph: قد يبدأ التبويب المكرر أو المفتوح من تبويب آخر للعرض بالهوية نفسها. يظل النشاط وتسجيل الخروج وتغيير الهوية مستقلًا في كل تبويب.
  - paragraph: تظل البيانات والملفات في ملف هذا المتصفح ويمكن فحصها محليًا. لا تتزامن بين الأجهزة أو المتصفحات، وقد تختفي بمسح البيانات أو التصفح الخاص أو إخلاء التخزين. استخدم بيانات ومستندات افتراضية فقط.
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test'
  2   |
  3   | async function openEditor(page: Page, step = 'personal') {
  4   |   await page.goto(`/applications/RIFD-2026-001/edit?step=${step}`)
  5   |   await expect(page.getByRole('button', { name: 'مريم سالم', exact: true })).toBeVisible({ timeout: 30_000 })
  6   |   await page.getByRole('button', { name: 'مريم سالم', exact: true }).click()
  7   |   await page.getByRole('button', { name: 'English', exact: true }).click()
> 8   |   await expect(page.getByRole('heading', { name: 'Prepare draft', exact: true })).toBeVisible()
      |                                                                                   ^ Error: expect(locator).toBeVisible() failed
  9   | }
  10  |
  11  | test('product choice survives sign-in and offers explicit new or resume without changing the saved draft', async ({ page }) => {
  12  |   await page.goto('/products')
  13  |   await page.getByRole('button', { name: 'English', exact: true }).click()
  14  |   const equipment = page.getByRole('heading', { name: 'Equipment financing', exact: true }).locator('..')
  15  |   await expect(equipment).toContainText('500,000')
  16  |   await expect(equipment).toContainText('3,000,000')
  17  |   await expect(equipment).toContainText('12 / 18 / 24')
  18  |   await expect(equipment).toContainText('8%')
  19  |   await equipment.getByRole('button', { name: 'Choose this product', exact: true }).click()
  20  |   await page.getByRole('button', { name: 'Mariam Salem', exact: true }).click()
  21  |   await expect(page.getByRole('heading', { name: 'Start new or resume a draft?', exact: true })).toBeVisible()
  22  |   await page.getByRole('button', { name: 'New application', exact: true }).click()
  23  |   await expect(page.getByRole('heading', { name: 'Personal', exact: true })).toBeVisible()
  24  |   await page.getByLabel('Applicant full name', { exact: true }).fill('  raw x  ')
  25  |   await page.getByRole('link', { name: '3. Financing', exact: true }).click()
  26  |   await expect(page.getByLabel('Financing product', { exact: true })).toHaveValue('equipment')
  27  |   await page.getByLabel('Financing amount', { exact: true }).fill('١,٠٠')
  28  |   await page.getByRole('button', { name: 'Save progress', exact: true }).click()
  29  |   await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  30  |   await expect(page).toHaveURL(/\/applications\/RIFD-2026-.*\/edit\?step=financing/)
  31  |   await page.reload()
  32  |   await expect(page.getByLabel('Financing amount', { exact: true })).toHaveValue('١,٠٠')
  33  |   await page.getByRole('link', { name: '1. Personal', exact: true }).click()
  34  |   await expect(page.getByLabel('Applicant full name', { exact: true })).toHaveValue('  raw x  ')
  35  | })
  36  |
  37  | test('linked bilingual errors open incomplete steps, while language and step changes preserve raw input and preparation', async ({ page }) => {
  38  |   await openEditor(page, 'invalid')
  39  |   await expect(page.getByRole('heading', { name: 'Personal', exact: true })).toBeVisible()
  40  |   const name = page.locator('#field-fullName')
  41  |   await name.fill('Name preserving caret')
  42  |   await name.focus()
  43  |   await name.evaluate((element: HTMLInputElement) => element.setSelectionRange(5, 5))
  44  |   await page.getByRole('button', { name: 'العربية', exact: true }).click()
  45  |   await expect(page.getByLabel('اسم المتقدم الكامل', { exact: true })).toHaveValue('Name preserving caret')
  46  |   expect(await name.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe(5)
  47  |   await page.getByRole('button', { name: 'English', exact: true }).click()
  48  |   await page.getByRole('link', { name: '4. Documents', exact: true }).click()
  49  |   const purchase = page.getByRole('heading', { name: 'Stock purchase plan', exact: true }).locator('..')
  50  |   await purchase.getByRole('button', { name: 'Use sample', exact: true }).click()
  51  |   await page.getByRole('link', { name: '2. Business', exact: true }).click()
  52  |   await page.getByLabel('Average monthly revenue', { exact: true }).fill('٥٠٬٠٠٠٬٠٠٠')
  53  |   await page.getByRole('link', { name: '5. Review', exact: true }).click()
  54  |   await page.getByRole('button', { name: 'Check application', exact: true }).click()
  55  |   await expect(page.locator('#validation-summary')).toBeFocused()
  56  |   await page.locator('#validation-summary').getByRole('link', { name: /Purchase explanation/ }).click()
  57  |   await expect(page.getByLabel('Purchase explanation', { exact: true })).toBeFocused()
  58  |   await page.getByRole('link', { name: '4. Documents', exact: true }).click()
  59  |   await expect(purchase.getByText('Ready to save', { exact: true })).toBeVisible()
  60  |   await expect(page.getByText('Unsaved changes', { exact: true })).toBeVisible()
  61  |   for (const width of [360, 390, 768, 1440]) {
  62  |     await page.setViewportSize({ width, height: 900 })
  63  |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  64  |   }
  65  | })
  66  |
  67  | test('cancel and confirm switching retain raw amount and term and stage document removal until saving', async ({ page }) => {
  68  |   await openEditor(page, 'financing')
  69  |   await page.getByLabel('Financing amount', { exact: true }).fill('١٠٠٬٠٠٠')
  70  |   await page.getByLabel('Repayment term', { exact: true }).fill('٦')
  71  |   await page.getByLabel('Financing product', { exact: true }).selectOption('equipment')
  72  |   await expect(page.getByRole('dialog', { name: 'Remove the previous product document?' })).toBeVisible()
  73  |   await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  74  |   await expect(page.getByLabel('Financing product', { exact: true })).toHaveValue('inventory')
  75  |   await expect(page.getByLabel('Financing product', { exact: true })).toBeFocused()
  76  |   await page.getByLabel('Financing product', { exact: true }).selectOption('equipment')
  77  |   await page.keyboard.press('Escape')
  78  |   await expect(page.getByLabel('Financing product', { exact: true })).toBeFocused()
  79  |   await expect(page.getByLabel('Financing product', { exact: true })).toHaveValue('inventory')
  80  |   await page.getByLabel('Financing product', { exact: true }).selectOption('equipment')
  81  |   await page.getByRole('button', { name: 'Switch product and remove document', exact: true }).click()
  82  |   await expect(page.getByLabel('Financing product', { exact: true })).toBeFocused()
  83  |   await expect(page.getByLabel('Financing amount', { exact: true })).toHaveValue('١٠٠٬٠٠٠')
  84  |   await expect(page.getByLabel('Financing amount', { exact: true })).toHaveAttribute('aria-invalid', 'true')
  85  |   await expect(page.getByLabel('Repayment term', { exact: true })).toHaveValue('٦')
  86  |   await expect(page.getByText('Removal of the previous document is unsaved.', { exact: true })).toBeVisible()
  87  |   await page.getByRole('button', { name: 'Save progress', exact: true }).click()
  88  |   await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  89  |   await page.reload()
  90  |   await expect(page.getByLabel('Financing product', { exact: true })).toHaveValue('equipment')
  91  |   await expect(page.getByLabel('Repayment term', { exact: true })).toHaveValue('٦')
  92  |   await page.getByRole('link', { name: '4. Documents', exact: true }).click()
  93  |   await expect(page.getByRole('heading', { name: 'Supplier quotation', exact: true })).toBeVisible()
  94  |   const purchase = page.getByRole('heading', { name: 'Supplier quotation', exact: true }).locator('..')
  95  |   await expect(purchase.getByText('No document supplied', { exact: true })).toBeVisible()
  96  | })
  97  |
  98  | test('all five steps support a complete Equipment draft, four sample files and keyboard review in both directions', async ({ page }, info) => {
  99  |   await page.goto('/applications/new?product=equipment')
  100 |   await expect(page.getByRole('button', { name: 'عمر حسن', exact: true })).toBeVisible({ timeout: 30_000 })
  101 |   await page.getByRole('button', { name: 'عمر حسن', exact: true }).click()
  102 |   await page.getByRole('button', { name: 'طلب جديد', exact: true }).click()
  103 |   await page.getByRole('link', { name: '2. النشاط التجاري', exact: true }).focus()
  104 |   await page.keyboard.press('Enter')
  105 |   await expect(page.getByRole('heading', { name: 'النشاط التجاري', exact: true })).toBeFocused()
  106 |   await page.getByLabel('اسم النشاط التجاري', { exact: true }).fill('نشاط عمر الافتراضي')
  107 |   await page.getByLabel('نوع النشاط', { exact: true }).selectOption('production')
  108 |   await page.getByLabel('عنوان النشاط', { exact: true }).fill('شارع السوق، تعز')
```
