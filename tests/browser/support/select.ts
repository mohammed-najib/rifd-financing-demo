import type { Locator } from '@playwright/test';

export async function chooseOption(control: Locator, value: string | { label: string }) {
  await control.click();
  const list = control.page().getByRole('listbox');
  const option =
    typeof value === 'string'
      ? list.locator(`[role="option"][data-value=${JSON.stringify(value)}]`)
      : list.getByRole('option', { name: value.label, exact: true });
  await option.click();
}
