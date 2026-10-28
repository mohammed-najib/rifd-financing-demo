import { expect, test } from '@playwright/test';

test('@smoke startup, sign-in, saved draft and language switch work', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'مريم سالم', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'طلباتي', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'الاطلاع على المسودة المحفوظة', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'RIFD-2026-001', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'RIFD-2026-001', exact: true })).toBeVisible();
});
