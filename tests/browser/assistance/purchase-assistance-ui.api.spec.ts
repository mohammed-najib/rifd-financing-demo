import { expect, test, type Page } from '@playwright/test';
import { nativePurchase } from '../support/evidence-transport';
import type { ProductId } from '../../../src/domain/model';

async function uploadPurchase(page: Page, product: ProductId, lines?: string[]) {
  const bytes = await page.evaluate(
    async ({ product, lines }) => {
      const path = '/tests/browser/support/purchase-evidence-fixtures.ts';
      const { purchaseFile } = (await import(
        path
      )) as typeof import('../support/purchase-evidence-fixtures');
      return Array.from(new Uint8Array(await (await purchaseFile(product, lines)).arrayBuffer()));
    },
    { product, lines },
  );
  await page.locator('#purchase-file').setInputFiles({
    name: 'fictional-purchase.png',
    mimeType: 'image/png',
    buffer: Buffer.from(bytes),
  });
}

for (const product of ['inventory', 'equipment'] as const)
  test(`an applicant checks ${product} purchase evidence in Arabic and English and submits through ordinary controls`, async ({
    page,
  }, info) => {
    const requests: Record<string, unknown>[] = [];
    await page.route('**/fake-provider/systemone', async route => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({ json: nativePurchase(product) });
    });
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/tests/browser/support/evidence-screen.html');
    await page.getByRole('button', { name: 'English', exact: true }).click();
    await page.locator('a[href="?step=financing"]').click();
    if (product === 'equipment') {
      await page.locator('#draft-product').click();
      await page.getByRole('option', { name: 'Equipment financing', exact: true }).click();
      await page
        .getByRole('button', { name: 'Switch product and remove document', exact: true })
        .click();
    }
    await page
      .locator('#purchase-explanation')
      .fill(
        product === 'inventory'
          ? 'Restock shop shelves with supplies'
          : 'Productive packing equipment',
      );
    await page.locator('#field-budget').fill('1,200,000');
    await page.locator('#field-amount').fill('500000');
    await page.locator('#field-term').fill('12');
    await page.locator('a[href="?step=documents"]').click();
    await uploadPurchase(page, product);
    await page.getByRole('button', { name: 'العربية', exact: true }).click();
    const purchase = page.locator('section[aria-labelledby="purchase-heading"]');
    await purchase.getByRole('button', { name: 'فحص المستند', exact: true }).click();
    let assistance = purchase.getByRole('region', { name: 'مساعدة تجريبية', exact: true });
    await expect(assistance.getByRole('button', { name: 'بدء الفحص', exact: true })).toBeEnabled();
    expect(requests).toHaveLength(0);
    const before = await page.evaluate(() => window.demo.readApplication('RIFD-2026-001'));
    await assistance.getByRole('button', { name: 'بدء الفحص', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(assistance.getByText('شرح الشراء', { exact: true })).toBeVisible();
    await expect(
      assistance.getByText('يبدو أن القيمة المطبوعة مختلفة عن هذه المعلومة المعلنة', {
        exact: true,
      }),
    ).toBeVisible();
    expect(await page.evaluate(() => window.demo.readApplication('RIFD-2026-001'))).toEqual(before);
    await assistance.getByRole('button', { name: 'عرض المصدر الحالي', exact: true }).click();
    await expect(assistance.getByRole('img')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await assistance.screenshot({ path: info.outputPath(`${product}-ar-390.png`) });
    await page.getByRole('button', { name: 'English', exact: true }).click();
    assistance = purchase.getByRole('region', { name: 'Experimental assistance', exact: true });
    await expect(assistance.getByText('Purchase budget', { exact: true })).toBeVisible();
    await expect(
      assistance.getByText(
        product === 'inventory'
          ? 'Appears to be a stock purchase plan'
          : 'Appears to be an equipment quotation',
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      assistance.getByText('Printed value appears consistent with this declaration', {
        exact: true,
      }),
    ).toBeVisible();
    await assistance.getByRole('button', { name: 'Retain document', exact: true }).click();
    await expect(
      assistance.getByText(
        'You can retain this document. Use the ordinary Save action for any edits.',
        { exact: true },
      ),
    ).toBeVisible();
    await assistance.screenshot({ path: info.outputPath(`${product}-en-390.png`) });
    expect(requests).toHaveLength(1);
    expect(requests[0].state).toMatchObject({ declaredPurchase: { product, budget: '1200000' } });
    await assistance
      .getByRole('button', { name: 'Edit purchase description', exact: true })
      .click();
    await expect(page.locator('#purchase-explanation')).toBeFocused();
    await page.locator('#purchase-explanation').fill('Changed fictional purchase for the business');
    await page.locator('a[href="?step=documents"]').click();
    await purchase.getByRole('button', { name: 'Check document', exact: true }).click();
    await purchase.getByText('Check details', { exact: true }).click();
    await expect(
      purchase.getByText('Changed fictional purchase for the business', { exact: true }),
    ).toBeVisible();
    await expect(
      purchase.getByText('Printed value appears consistent with this declaration', { exact: true }),
    ).toHaveCount(0);
    await purchase.getByRole('button', { name: 'Edit total budget', exact: true }).click();
    await expect(page.locator('#field-budget')).toBeFocused();
    await page.locator('a[href="?step=documents"]').click();
    await purchase.getByRole('button', { name: 'Check document', exact: true }).click();
    await purchase.getByRole('button', { name: 'Choose replacement', exact: true }).click();
    await expect(page.locator('#purchase-file')).toBeFocused();
    await page.getByRole('button', { name: 'Save progress', exact: true }).click();
    await expect
      .poll(async () => {
        const view = await page.evaluate(() => window.demo.readApplication('RIFD-2026-001'));
        return view.ok && view.value.snapshot.fields.explanation;
      })
      .toBe('Changed fictional purchase for the business');
    await page.locator('a[href="?step=review"]').click();
    await page.getByRole('button', { name: 'Submit application', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Application submitted.', exact: true }),
    ).toBeVisible();
    expect(requests).toHaveLength(1);
  });

for (const scenario of [
  'absent description',
  'unrelated quotation',
  'missing declarations',
  'conflicting values',
  'unavailable service',
] as const)
  test(`purchase assistance keeps source and manual actions available with ${scenario}`, async ({
    page,
  }) => {
    const native = nativePurchase();
    let response: unknown = native,
      lines: string[] | undefined;
    if (scenario === 'absent description') {
      response = {
        ...native,
        answers: {
          ...native.answers,
          descriptionPresence: { type: 'noul', noul: 0.01 },
          descriptionSupport: {
            type: 'choice',
            choice: 'not_found',
            confidence: 0.999,
            probabilities: { consistent: 0, different: 0, not_found: 1, conflict: 0, uncertain: 0 },
          },
        },
      };
      lines = ['Fictional stock purchase plan', 'Total budget: 900,000 YER'];
    } else if (scenario === 'unrelated quotation') {
      response = {
        ...native,
        answers: { ...native.answers, category: nativePurchase('equipment').answers.category },
      };
      lines = [
        'Fictional equipment supplier quotation',
        'Purchase: packing machine',
        'Total budget: 900,000 YER',
      ];
    } else if (scenario === 'conflicting values') {
      response = {
        ...native,
        answers: {
          ...native.answers,
          budgetSupport: {
            type: 'choice',
            choice: 'conflict',
            confidence: 0.999,
            probabilities: { consistent: 0, different: 0, not_found: 0, conflict: 1, uncertain: 0 },
          },
        },
      };
      lines = [
        'Fictional stock purchase plan',
        'Purchase: shop supplies',
        'Total budget: 1,200,000 YER',
        'Total budget: 900,000 YER',
      ];
    }
    await page.route('**/fake-provider/systemone', route =>
      route.fulfill(scenario === 'unavailable service' ? { status: 503 } : { json: response }),
    );
    await page.goto('/tests/browser/support/evidence-screen.html');
    await page.getByRole('button', { name: 'English', exact: true }).click();
    await page.locator('a[href="?step=financing"]').click();
    await page
      .locator('#purchase-explanation')
      .fill(scenario === 'missing declarations' ? '' : 'Restock shop shelves with supplies');
    await page
      .locator('#field-budget')
      .fill(scenario === 'missing declarations' ? '1,00,000' : '1200000');
    await page.locator('a[href="?step=documents"]').click();
    await uploadPurchase(page, 'inventory', lines);
    const purchase = page.locator('section[aria-labelledby="purchase-heading"]');
    await purchase.getByRole('button', { name: 'Check document', exact: true }).click();
    const assistance = purchase.getByRole('region', {
      name: 'Experimental assistance',
      exact: true,
    });
    await assistance.getByRole('button', { name: 'Run check', exact: true }).click();
    if (scenario === 'absent description')
      await expect(
        assistance.getByText('This detail was not found in the checked pages', { exact: true }),
      ).toBeVisible();
    else if (scenario === 'unrelated quotation') {
      await expect(
        assistance.getByText('Appears to be an equipment quotation', { exact: true }),
      ).toBeVisible();
      await expect(
        assistance.getByText('Could not determine. Inspect the source.', { exact: true }),
      ).toHaveCount(2);
    } else if (scenario === 'missing declarations')
      await expect(
        assistance.getByText('Detail missing or invalid. Only its comparison will be skipped.', {
          exact: true,
        }),
      ).toHaveCount(4);
    else if (scenario === 'conflicting values')
      await expect(
        assistance.getByText('Conflicting printed entries for this field', { exact: true }),
      ).toBeVisible();
    else
      await expect(
        assistance.getByText('The analysis service is unavailable. Retry explicitly if needed.', {
          exact: true,
        }),
      ).toBeVisible();
    await assistance.getByRole('button', { name: 'Show current source', exact: true }).click();
    await expect(assistance.getByRole('img')).toBeVisible();
    await expect(
      assistance.getByRole('button', { name: 'Choose replacement', exact: true }),
    ).toBeEnabled();
    await expect(
      assistance.getByRole('button', { name: 'Retain document', exact: true }),
    ).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Save progress', exact: true })).toBeEnabled();
  });

test('purchase correction advice offers only the permitted budget edit', async ({ page }) => {
  await page.route('**/fake-provider/systemone', route =>
    route.fulfill({ json: nativePurchase('equipment') }),
  );
  await page.goto('/tests/browser/support/evidence-screen.html?corrections=purchase');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await uploadPurchase(page, 'equipment');
  const purchase = page.locator('section[aria-labelledby="purchase-heading"]');
  await purchase.getByRole('button', { name: 'Check document', exact: true }).click();
  const assistance = purchase.getByRole('region', { name: 'Experimental assistance', exact: true });
  const before = await page.evaluate(() => window.demo.readApplication('RIFD-2026-007'));
  await assistance.getByRole('button', { name: 'Run check', exact: true }).click();
  await expect(
    assistance.getByText('Printed value appears different from this declaration', { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.demo.readApplication('RIFD-2026-007'))).toEqual(before);
  await expect(
    assistance.getByRole('button', { name: 'Edit purchase description', exact: true }),
  ).toHaveCount(0);
  await assistance.getByRole('button', { name: 'Edit total budget', exact: true }).click();
  await expect(page.locator('#field-budget')).toBeFocused();
  await expect(page.getByRole('button', { name: 'Save progress', exact: true })).toBeEnabled();
});
