import { expect, test } from '@playwright/test';
import { nativeFinancial } from '../support/financial-evidence-fixtures';

test('a draft checks explicitly selected financial pages, inspects the source and continues to submission', async ({
  page,
}, info) => {
  const requests: import('../../../src/evidence-assistance/contract').StageRequest[] = [];
  await page.route('**/fake-provider/systemone', async route => {
    const request = route
      .request()
      .postDataJSON() as import('../../../src/evidence-assistance/contract').StageRequest;
    requests.push(request);
    await route.fulfill({ json: nativeFinancial(request, { revenue: 'conflict' }) });
  });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/tests/browser/support/evidence-screen.html');
  const bytes = await page.evaluate(async () => {
    const path = '/tests/browser/support/financial-evidence-fixtures.ts';
    const { financialFile } = (await import(
      path
    )) as typeof import('../support/financial-evidence-fixtures');
    return Array.from(
      new Uint8Array(await (await financialFile(5, { conflict: true })).arrayBuffer()),
    );
  });
  await page.locator('#financial-file').setInputFiles({
    name: 'fictional-financial.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(bytes),
  });
  const financial = page.locator('section[aria-labelledby="financial-heading"]');
  await financial.getByRole('button', { name: 'فحص المستند', exact: true }).click();
  let assistance = financial.getByRole('region', { name: 'مساعدة تجريبية', exact: true });
  await expect(assistance.getByRole('checkbox', { name: 'الصفحة 1', exact: true })).toBeVisible();
  await expect(assistance.getByRole('button', { name: 'بدء الفحص', exact: true })).toBeDisabled();
  await assistance.getByRole('checkbox', { name: 'الصفحة 2', exact: true }).check();
  await assistance.getByRole('checkbox', { name: 'الصفحة 4', exact: true }).check();
  expect(requests).toHaveLength(0);
  await assistance.getByRole('button', { name: 'بدء الفحص', exact: true }).click();
  await expect(
    assistance.getByText('توجد قيم مطبوعة متعارضة لهذا الحقل', { exact: true }).first(),
  ).toBeVisible({ timeout: 20_000 });
  await assistance.screenshot({ path: info.outputPath('financial-ar-390.png') });
  await assistance.getByRole('button', { name: 'عرض المصدر الحالي', exact: true }).click();
  await expect(
    assistance.getByRole('button', { name: 'الصفحة التالية', exact: true }),
  ).toBeEnabled();
  await assistance.getByRole('button', { name: 'الصفحة التالية', exact: true }).click();
  await expect(assistance.getByRole('img', { name: 'صفحة المصدر 2', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  assistance = financial.getByRole('region', { name: 'Experimental assistance', exact: true });
  await expect(
    assistance.getByText('Expected reporting period support', { exact: true }).first(),
  ).toBeVisible();
  await assistance.getByText('Check details', { exact: true }).click();
  await expect(assistance.getByText('Unchecked: 1, 3, 5', { exact: true })).toBeVisible();
  await assistance.screenshot({ path: info.outputPath('financial-en-390.png') });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(requests.map(request => request.stage)).toEqual(['page', 'page', 'document-comparison']);
  await assistance.getByRole('button', { name: 'Clear saved analysis', exact: true }).click();
  await expect(assistance.getByRole('button', { name: 'Run check', exact: true })).toBeEnabled();
  await expect(assistance.getByRole('checkbox', { name: 'Page 2', exact: true })).toBeChecked();
  await expect(assistance.getByRole('checkbox', { name: 'Page 4', exact: true })).toBeChecked();
  await assistance.getByRole('button', { name: 'Run check', exact: true }).click();
  await expect(
    assistance.getByText('Conflicting printed entries for this field', { exact: true }).first(),
  ).toBeVisible({ timeout: 20_000 });
  expect(requests).toHaveLength(6);
  await assistance.getByRole('button', { name: 'Retain document', exact: true }).click();
  await page.getByRole('button', { name: 'Save progress', exact: true }).click();
  await page.locator('a[href="?step=financing"]').click();
  await page
    .locator('#purchase-explanation')
    .fill('Purchase fictional supplies for the shop shelves.');
  await page.locator('a[href="?step=review"]').click();
  await page.getByRole('button', { name: 'Submit application', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Application submitted.', exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(6);
});
