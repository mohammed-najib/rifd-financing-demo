import { expect, test } from '@playwright/test';

test.use({ storageState: 'test-results/seed/api-full.json' });

for (const language of ['ar', 'en'] as const)
  test(`${language} a failed sample read can recover instead of leaving an empty disabled dropdown`, async ({
    page,
  }, info) => {
    const ar = language === 'ar';
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/tests/browser/support/evidence-screen.html?samples-fail-once&full=1');
    if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click();
    const error = page.getByRole('alert').filter({
      hasText: ar ? 'تعذر تحميل المستندات التجريبية' : 'Sample documents could not be loaded',
    });
    await expect(error).toBeVisible();
    await error.getByRole('button', { name: ar ? 'إعادة المحاولة' : 'Retry', exact: true }).click();
    const section = page.locator('section[aria-labelledby="identity-heading"]');
    const control = section.getByRole('combobox', {
      name: ar ? 'المستند التجريبي' : 'Prepared sample',
      exact: true,
    });
    await expect(control).toBeEnabled();
    await control.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page.getByRole('option')).toHaveCount(4);
    expect(
      await page.getByRole('listbox').evaluate(menu => {
        const box = menu.getBoundingClientRect();
        return (
          box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight
        );
      }),
    ).toBe(true);
    await page.screenshot({ path: info.outputPath(`sample-picker-${language}-390.png`) });
    await page.keyboard.press('Home');
    await page.keyboard.press('Enter');
    await section
      .getByRole('button', { name: ar ? 'استخدام النموذج' : 'Use sample', exact: true })
      .click();
    await expect(
      section.getByText(ar ? 'جاهز للحفظ' : 'Ready to save', { exact: true }),
    ).toBeVisible();
  });

test('a new draft explains generated samples instead of showing an empty disabled selector', async ({
  page,
}) => {
  await page.goto('/tests/browser/support/evidence-screen.html?new-draft&full=1');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  const section = page.locator('section[aria-labelledby="identity-heading"]');
  await expect(
    section.getByText('A sample document will be created from the current application details.', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(section.getByRole('combobox')).toHaveCount(0);
  await section.getByRole('button', { name: 'Use sample', exact: true }).click();
  await expect(section.getByText('Ready to save', { exact: true })).toBeVisible();
});
