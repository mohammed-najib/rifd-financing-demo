import { expect, test } from '@playwright/test';
import { nativeIdentity } from '../support/evidence-transport';
import { identityReason } from '../support/correction-evidence-fixtures';

test.use({ storageState: 'test-results/seed/api-full.json' });

for (const language of ['ar', 'en'] as const)
  test(`${language} correction assistance shows the reviewer reason beside permitted actions and never replaces a required change`, async ({
    page,
  }, info) => {
    const ar = language === 'ar';
    let requests = 0;
    await page.route('**/fake-provider/systemone', async route => {
      requests++;
      const native = nativeIdentity();
      await route.fulfill({
        json: { ...native, answers: { ...native.answers, nameSupport: null } },
      });
    });
    await page.setViewportSize({ width: ar ? 390 : 1440, height: 950 });
    await page.goto('/tests/browser/support/evidence-screen.html?corrections=document&full=1');
    if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click();
    const editor = page.getByRole('region', {
      name: ar ? 'الرد على التصحيحات' : 'Respond to corrections',
      exact: true,
    });
    await expect(editor.getByRole('textbox')).toHaveCount(0);
    await editor
      .getByRole('button', { name: ar ? 'فحص المستند' : 'Check document', exact: true })
      .click();
    const assistance = page.getByRole('region', {
      name: ar ? 'مساعدة تجريبية' : 'Experimental assistance',
      exact: true,
    });
    await expect(assistance.getByText(identityReason[language], { exact: true })).toBeVisible();
    await expect(
      assistance.getByRole('button', {
        name: ar ? 'تعديل الاسم المعلن' : 'Edit declared name',
        exact: true,
      }),
    ).toHaveCount(0);
    await assistance
      .getByRole('button', { name: ar ? 'بدء الفحص' : 'Run check', exact: true })
      .focus();
    await page.keyboard.press('Enter');
    await expect(
      assistance.getByText(
        ar
          ? 'بعض النتائج غير متاحة. راجع نطاق التحليل والمصدر.'
          : 'Some findings are unavailable. Check the coverage and original source.',
        { exact: true },
      ),
    ).toBeVisible();
    await assistance
      .getByRole('button', { name: ar ? 'عرض المصدر الحالي' : 'Show current source', exact: true })
      .click();
    await expect(assistance.getByRole('img')).toBeVisible();
    await expect(
      assistance.getByRole('link', { name: ar ? 'فتح الملف' : 'Open file', exact: true }),
    ).toBeVisible();
    await assistance
      .getByRole('button', { name: ar ? 'الاحتفاظ بالمستند' : 'Retain document', exact: true })
      .click();
    await editor
      .getByRole('button', {
        name: ar ? 'إعادة تقديم التصحيحات' : 'Resubmit corrections',
        exact: true,
      })
      .click();
    await expect(editor.getByRole('alert')).toContainText(
      ar ? 'يلزم تغيير صالح' : 'Supply a valid change',
    );
    await assistance
      .getByRole('button', { name: ar ? 'اختيار مستند بديل' : 'Choose replacement', exact: true })
      .click();
    await expect(editor.locator('#identity-file')).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await assistance.screenshot({ path: info.outputPath(`correction-${language}.png`) });
    expect(requests).toBe(1);
  });

test('an unsaved correction check survives matching Save, reopens without inference and resubmits when analysis is unavailable', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/fake-provider/systemone', async route => {
    requests++;
    await route.fulfill({ json: nativeIdentity() });
  });
  await page.goto('/tests/browser/support/evidence-screen.html?corrections=name');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  const editor = page.getByRole('region', { name: 'Respond to corrections', exact: true });
  await editor.getByRole('button', { name: 'Check document', exact: true }).click();
  const assistance = page.getByRole('region', { name: 'Experimental assistance', exact: true });
  await assistance.getByRole('button', { name: 'Edit declared name', exact: true }).click();
  const name = editor.getByRole('textbox', { name: 'Applicant full name', exact: true });
  await expect(name).toBeFocused();
  await name.fill('Private Fictional Name');
  const bytes = await page.evaluate(async () => {
    const path = '/tests/browser/support/evidence-fixtures.ts';
    const { imageFile } = (await import(path)) as typeof import('../support/evidence-fixtures');
    return [...new Uint8Array(await (await imageFile('image/png')).arrayBuffer())];
  });
  await editor.locator('#identity-file').setInputFiles({
    name: 'private-identity.png',
    mimeType: 'image/png',
    buffer: Buffer.from(bytes),
  });
  await expect(
    editor.getByRole('button', { name: 'Preview ready file', exact: true }),
  ).toBeVisible();
  await editor.getByRole('button', { name: 'Check document', exact: true }).click();
  await assistance.getByRole('button', { name: 'Run check', exact: true }).click();
  await assistance.getByText('Check details', { exact: true }).click();
  await expect(
    assistance.getByText('Temporary result for this view only.', { exact: true }),
  ).toBeVisible();
  await editor.getByRole('button', { name: 'Save progress', exact: true }).click();
  await expect(
    assistance.getByText('Saved in this browser for seven days after completion.', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await editor.getByRole('button', { name: 'Check document', exact: true }).click();
  await assistance.getByText('Check details', { exact: true }).click();
  await expect(assistance.getByText('Previous live analysis', { exact: true })).toBeVisible();
  expect(requests).toBe(1);
  await assistance.getByRole('button', { name: 'Clear saved analysis', exact: true }).click();
  await expect(
    assistance.getByText('Analysis cleared. Financing data retained.', { exact: true }),
  ).toBeVisible();
  await page.route('**/fake-provider/systemone', route => route.fulfill({ status: 503 }));
  await assistance.getByRole('button', { name: 'Run check', exact: true }).click();
  await expect(
    assistance.getByText('The analysis service is unavailable. Retry explicitly if needed.', {
      exact: true,
    }),
  ).toBeVisible();
  await editor.getByRole('button', { name: 'Resubmit corrections', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Corrections resubmitted.', exact: true }),
  ).toBeVisible();
  await expect(assistance).toHaveCount(0);
});
