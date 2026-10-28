import { expect, test } from '@playwright/test';
import { nativeIdentity } from '../support/evidence-transport';

for (const language of ['en', 'ar'] as const)
  test(`${language} reviewer examines source and findings beside explicit assessment controls`, async ({
    page,
  }, info) => {
    const ar = language === 'ar';
    let requests = 0;
    await page.route('**/fake-provider/systemone', async route => {
      requests++;
      await route.fulfill({ json: nativeIdentity() });
    });
    await page.setViewportSize({ width: ar ? 390 : 1440, height: 950 });
    await page.goto('/tests/browser/support/evidence-screen.html?reviewer');
    if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click();
    const document = page.getByRole('region', {
      name: ar ? 'إثبات هوية المتقدم' : 'Applicant identity evidence',
      exact: true,
    });
    await document
      .getByRole('button', {
        name: ar ? 'البحث عن الأدلة الداعمة' : 'Find supporting evidence',
        exact: true,
      })
      .focus();
    await page.keyboard.press('Enter');
    const assistance = document.getByRole('region', {
      name: ar ? 'مساعدة تجريبية' : 'Experimental assistance',
      exact: true,
    });
    await expect(assistance.getByRole('img')).toBeVisible();
    await expect(
      assistance.getByRole('link', { name: ar ? 'فتح الملف' : 'Open file', exact: true }),
    ).toBeVisible();
    await expect(
      assistance.getByRole('link', { name: ar ? 'تنزيل الملف' : 'Download file', exact: true }),
    ).toBeVisible();
    const confirm = document.getByRole('checkbox', {
      name: ar ? 'أؤكد أنني فحصت المستند الحالي' : 'I confirm I inspected the current source',
      exact: true,
    });
    const accept = document.getByRole('button', {
      name: ar ? 'قبول المستند' : 'Accept document',
      exact: true,
    });
    await expect(confirm).not.toBeChecked();
    await assistance
      .getByRole('button', { name: ar ? 'بدء الفحص' : 'Run check', exact: true })
      .click();
    await expect(
      assistance.getByText(
        ar
          ? 'يبدو الاسم المطبوع مختلفًا عن الاسم المعلن'
          : 'Printed name appears different from the declared name',
        { exact: true },
      ),
    ).toBeVisible();
    await expect(confirm).not.toBeChecked();
    await expect(accept).toHaveAttribute('aria-disabled', 'true');
    expect(requests).toBe(1);
    expect(
      await page.evaluate(() => globalThis.document.documentElement.scrollWidth <= innerWidth),
    ).toBe(true);
    const source = assistance.getByRole('img'),
      controls = confirm;
    const sourceBox = await source.boundingBox(),
      controlsBox = await controls.boundingBox();
    expect(
      sourceBox &&
        controlsBox &&
        (ar ? sourceBox.y < controlsBox.y : Math.abs(sourceBox.y - controlsBox.y) < 300),
    ).toBe(true);
    await assistance.screenshot({ path: info.outputPath(`reviewer-${language}.png`) });
    await confirm.check();
    await accept.click();
    await expect(
      page.getByText(ar ? 'حُفظت نتيجة المراجعة.' : 'Review change saved.', { exact: true }),
    ).toBeVisible();
    await expect(document.getByText(ar ? 'مقبول' : 'Accepted', { exact: true })).toBeVisible();
  });

test('multipage source navigation and document comparison preserve human inspection', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/fake-provider/systemone', async route => {
    requests++;
    await route.fulfill({ json: nativeIdentity() });
  });
  await page.goto('/tests/browser/support/evidence-screen.html?reviewer=pdf');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  const document = page.getByRole('region', { name: 'Applicant identity evidence', exact: true });
  await document.getByRole('button', { name: 'Find supporting evidence', exact: true }).click();
  const assistance = document.getByRole('region', { name: 'Experimental assistance', exact: true });
  await expect(assistance.getByRole('img', { name: 'Source page 1', exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await assistance.getByRole('button', { name: 'Next page', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(assistance.getByRole('img', { name: 'Source page 2', exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await assistance.getByRole('button', { name: 'Previous page', exact: true }).click();
  await expect(assistance.getByRole('img', { name: 'Source page 1', exact: true })).toBeVisible();
  await assistance.getByRole('button', { name: 'Run check', exact: true }).click();
  await expect(
    assistance.getByText('Printed name appears different from the declared name', { exact: true }),
  ).toBeVisible({ timeout: 20_000 });
  expect(requests).toBe(3);
  await document
    .getByRole('checkbox', { name: 'I confirm I inspected the current source', exact: true })
    .check();
  await document.getByRole('button', { name: 'Accept document', exact: true }).click();
  await expect(document.getByText('Accepted', { exact: true })).toBeVisible();
});

test('cancelled and offline analysis leave Saved demonstrations and explained replacement usable', async ({
  page,
}) => {
  let release = () => {};
  const held = new Promise<void>(resolve => {
    release = resolve;
  });
  let requests = 0;
  await page.route('**/fake-provider/systemone', async route => {
    requests++;
    if (requests === 1) {
      await held;
      await route.fulfill({ json: nativeIdentity() }).catch(() => {});
    } else await route.abort('internetdisconnected');
  });
  await page.goto('/tests/browser/support/evidence-screen.html?reviewer');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  const document = page.getByRole('region', { name: 'Applicant identity evidence', exact: true });
  await document.getByRole('button', { name: 'Find supporting evidence', exact: true }).click();
  const assistance = document.getByRole('region', { name: 'Experimental assistance', exact: true });
  const sent = page.waitForRequest('**/fake-provider/systemone');
  await assistance.getByRole('button', { name: 'Run check', exact: true }).click();
  await sent;
  await assistance.getByRole('button', { name: 'Cancel check', exact: true }).click();
  release();
  await expect(assistance.getByText(/Local work cancelled/)).toBeVisible();
  await assistance.getByRole('button', { name: 'Retry check', exact: true }).click();
  await expect(
    assistance.getByText('The analysis service is unavailable. Retry explicitly if needed.', {
      exact: true,
    }),
  ).toBeVisible();
  await page.context().setOffline(true);
  const saved = document.getByRole('region', { name: 'Saved demonstrations', exact: true });
  await saved.getByText('Choose a Saved demonstration', { exact: true }).click();
  await saved
    .getByRole('button', { name: 'Open saved example English identity evidence', exact: true })
    .click();
  await expect(
    saved.getByRole('img', { name: 'Example source, page 1', exact: true }),
  ).toBeVisible();
  await expect(
    document.getByRole('checkbox', {
      name: 'I confirm I inspected the current source',
      exact: true,
    }),
  ).not.toBeChecked();
  await saved.getByRole('button', { name: 'Close saved example', exact: true }).click();
  await document.getByRole('button', { name: 'Needs replacement', exact: true }).click();
  await document
    .getByRole('textbox', { name: 'Replacement reason', exact: true })
    .fill('I could not open the source in my document reader. Supply a readable replacement.');
  await document
    .getByRole('checkbox', { name: 'I could not open the current source', exact: true })
    .check();
  await expect(
    document.getByRole('button', { name: 'Accept document', exact: true }),
  ).toHaveAttribute('aria-disabled', 'true');
  await document.getByRole('button', { name: 'Save assessment', exact: true }).click();
  await expect(
    document.getByRole('textbox', { name: 'Replacement reason', exact: true }),
  ).toHaveCount(0);
  await expect(document.getByText(/Supply a readable replacement/)).toBeVisible();
});
