import { chromium, expect as playwrightExpect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

// One explicit real Jev run. Saved examples retain their visible provenance.
// Never intercept provider responses, inject findings, or retry native calls.
const expect = playwrightExpect.configure({ timeout: 60_000 });
const origin = process.env.RIFD_DEMO_ORIGIN ?? 'http://127.0.0.1:5174';
const directory = resolve(process.env.RIFD_DEMO_OUTPUT ?? 'artifacts/demo/current/ai');
const reviewerOnly = process.argv.includes('--reviewer-only');
const captureDirectory = reviewerOnly ? `${directory}/reviewer` : directory;
await mkdir(captureDirectory, { recursive: true });
const previousScenes = reviewerOnly
  ? JSON.parse(await readFile(`${directory}/scenes.json`, 'utf8'))
  : [];
if (reviewerOnly) {
  const previousRun = JSON.parse(await readFile(`${directory}/native-run.json`, 'utf8'));
  if (
    previousRun.status !== 'completed' ||
    previousRun.analysisRequests !== 1 ||
    previousScenes.length !== 7
  )
    throw Error(
      'Reviewer continuation requires exactly seven completed AI scenes and one successful native run',
    );
  const recording = JSON.parse(await readFile(`${directory}/recording.json`, 'utf8'));
  for (const scene of previousScenes) scene.raw = recording.raw;
} else if (
  await access(`${directory}/native-run-started.json`).then(
    () => true,
    () => false,
  )
)
  throw Error(
    'This take already started its native run. Retain it; do not redispatch to repair filming.',
  );
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({
  baseURL: origin,
  viewport: { width: 1440, height: 950 },
  recordVideo: { dir: captureDirectory, size: { width: 1440, height: 950 } },
});
await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
const page = await context.newPage();
page.setDefaultTimeout(60_000);
const started = performance.now(),
  scenes = [...previousScenes];
const b = name => page.getByRole('button', { name, exact: true });
const go = async path => {
  await page.goto(path);
  await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible();
};
async function scene(key, duration, ar, en, identity, record, action) {
  console.log(`Recording ${key}`);
  const start = (performance.now() - started) / 1000;
  await action();
  await page.evaluate(() => globalThis.document.fonts.ready);
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${captureDirectory}/${key}.png` });
  scenes.push({
    chapter: 3,
    key,
    duration,
    ar,
    en,
    identity,
    record,
    start,
    end: (performance.now() - started) / 1000,
    url: page.url(),
    raw: await page.video().path(),
  });
  await writeFile(`${directory}/scenes.json`, JSON.stringify(scenes, null, 2) + '\n');
}
const source = JSON.parse(
  await readFile('src/demo/saved-demonstrations/en-identity-10.json', 'utf8'),
);
let analysisRequests = reviewerOnly ? 1 : 0;
page.on('request', request => {
  if (new URL(request.url()).pathname === '/api/evidence-analysis' && request.method() === 'POST')
    analysisRequests++;
});
try {
  if (!reviewerOnly) {
    await go('/applications/RIFD-2026-001/edit?step=personal');
    await b('مريم سالم').click();
    await page.locator('#field-fullName').fill(source.context.comparisons.name);
    await page.getByRole('link', { name: '4. المستندات', exact: true }).click();
    const identity = page.locator('section[aria-labelledby="identity-heading"]');
    const check = identity.locator('.evidence-assistance');
    await scene(
      'ai-file-selection',
      6,
      'مستندات منظمة واسم الملف المختار ظاهر',
      'Grouped documents and a clear selected filename',
      'مريم / Mariam',
      '001 · Local build',
      async () => {
        await identity.locator('input[type=file]').setInputFiles({
          name: 'DEMO-identity-English.png',
          mimeType: 'image/png',
          buffer: await readFile(`src/demo/saved-demonstrations/assets/${source.source.path}`),
        });
        await expect(identity.getByText('جاهز للحفظ', { exact: true })).toBeVisible();
        await identity.scrollIntoViewIfNeeded();
      },
    );
    await scene(
      'ai-live-check',
      12,
      'فحص Jev فعلي لوضوح المستند وتوافق الاسم',
      'A real Jev check of readability and the declared name',
      'مريم / Mariam',
      '001 · Live Jev',
      async () => {
        await check.getByRole('button', { name: 'فحص المستند', exact: true }).click();
        await expect(check.getByRole('button', { name: 'بدء الفحص', exact: true })).toBeEnabled();
        await page.waitForTimeout(1800);
        await writeFile(
          `${directory}/native-run-started.json`,
          JSON.stringify({
            startedAt: new Date().toISOString(),
            sourceSha256: source.source.sha256,
          }) + '\n',
        );
        const response = page.waitForResponse(
          response =>
            new URL(response.url()).pathname === '/api/evidence-analysis' &&
            response.request().method() === 'POST',
        );
        await check.getByRole('button', { name: 'بدء الفحص', exact: true }).click();
        const completed = await response,
          answer = await completed.json();
        await writeFile(
          `${directory}/native-run.json`,
          JSON.stringify(
            {
              httpStatus: completed.status(),
              status: answer.status,
              stages: answer.stages?.map(stage => ({
                stage: stage.stage,
                page: stage.page,
                model: stage.answer?.model,
              })),
              analysisRequests,
            },
            null,
            2,
          ) + '\n',
        );
        if (answer.status !== 'completed')
          throw Error(
            `Native run did not complete: ${answer.reason ?? answer.status}. No retry was attempted.`,
          );
        await expect(check.locator('.check-result')).toBeVisible();
        await check.locator('.check-result').scrollIntoViewIfNeeded();
      },
    );
    await scene(
      'ai-field-popup',
      10,
      'افحص الحقل في نافذة واضحة؛ يُحجب التظليل غير الموثوق',
      'Inspect the field in a popup; uncertain highlights stay hidden',
      'مريم / Mariam',
      '001 · Live Jev',
      async () => {
        await check.locator('.check-inspection > summary').click();
        await check.getByRole('button', { name: /فحص موضع الحقل/ }).click();
        const dialog = page.getByRole('dialog', { name: 'فحص موضع الحقل', exact: true });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('img').first()).toBeVisible();
      },
    );
    await page.keyboard.press('Escape');
    await b('حفظ التقدم').click();
    await expect(page.getByText('محفوظ', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible();
    await b('English').click();
    await scene(
      'ai-restored',
      8,
      'احفظ التحليل واستعده دون فحص جديد',
      'Save and reopen the findings without another AI request',
      'مريم / Mariam',
      '001 · Previous live analysis',
      async () => {
        await check.getByRole('button', { name: 'Check document', exact: true }).click();
        await expect(check.getByText('Previous live analysis', { exact: true })).toBeVisible();
        await check.locator('.check-result').scrollIntoViewIfNeeded();
        if (analysisRequests !== 1) throw Error('Reopening must not start another analysis');
      },
    );
    async function savedExample(slot, name) {
      const document = page.locator(`section[aria-labelledby="${slot}-heading"]`);
      const saved = document.getByRole('region', { name: 'Saved demonstrations', exact: true });
      await saved.locator('details > summary').first().click();
      await saved.getByRole('button', { name: `Open saved example ${name}`, exact: true }).click();
      await saved.getByRole('button', { name: 'Show example source', exact: true }).click();
      await expect(
        saved.getByRole('img', { name: 'Example source, page 1', exact: true }),
      ).toBeVisible();
      return saved;
    }
    let example;
    await scene(
      'ai-business-example',
      8,
      'مثال Jev محفوظ يحدد العنوان في مستند النشاط',
      'Saved Jev example: inspect the business address',
      'مريم / Mariam',
      'Saved demonstration · Business',
      async () => {
        example = await savedExample('business', 'English business evidence');
        await expect(example.locator('[data-evidence-highlight="address"]')).toBeVisible();
        await example.getByRole('img').scrollIntoViewIfNeeded();
      },
    );
    await example.getByRole('button', { name: 'Close saved example', exact: true }).click();
    await scene(
      'ai-financial-example',
      10,
      'التغطية الجزئية واضحة؛ راجع الصفحات غير المفحوصة',
      'Saved Jev example: partial coverage stays explicit',
      'مريم / Mariam',
      'Saved demonstration · Financial',
      async () => {
        example = await savedExample('financial', 'Arabic financial summary');
        await example.getByRole('button', { name: 'Next page', exact: true }).click();
        await expect(
          example.getByRole('img', { name: 'Example source, page 2', exact: true }),
        ).toBeVisible();
        await example.getByRole('img').scrollIntoViewIfNeeded();
      },
    );
    await example.getByRole('button', { name: 'Close saved example', exact: true }).click();
    await scene(
      'ai-purchase-example',
      8,
      'مثال Jev محفوظ يفصل التكلفة عن الوصف الغائب',
      'Saved Jev example: budget support and a missing description',
      'مريم / Mariam',
      'Saved demonstration · Purchase',
      async () => {
        example = await savedExample('purchase', 'English stock purchase plan');
        await expect(example.locator('[data-evidence-highlight="budget"]')).toBeVisible();
        await example.getByRole('img').scrollIntoViewIfNeeded();
      },
    );
    await b('Switch identity').click();
    await b('Salma Nasser').click();
    await go('/staff/applications/RIFD-2026-007');
    await b('العربية').click();
  } else {
    await go('/staff/applications/RIFD-2026-007');
    await b('سلمى ناصر').click();
  }
  await scene(
    'ai-human-review',
    8,
    'المساعدة لا تقبل المستند؛ التأكيد بيد المراجع',
    'AI assistance leaves document acceptance with the reviewer',
    'سلمى / Salma',
    '007 · Human assessment',
    async () => {
      const document = page.getByRole('region', { name: 'إثبات هوية المتقدم', exact: true });
      await document.getByRole('button', { name: 'البحث عن الأدلة الداعمة', exact: true }).click();
      await expect(document.locator('.evidence-assistance img')).toBeVisible();
      await expect(
        document.getByRole('checkbox', { name: 'أؤكد أنني فحصت المستند الحالي', exact: true }),
      ).not.toBeChecked();
      await document.locator('.evidence-assistance').scrollIntoViewIfNeeded();
    },
  );
  await writeFile(
    `${directory}/result.json`,
    JSON.stringify(
      {
        outcome: 'passed',
        origin,
        browser: browser.version(),
        recordedAt: new Date().toISOString(),
        sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
        analysisRequests,
        scenes: scenes.length,
      },
      null,
      2,
    ) + '\n',
  );
} finally {
  await context.tracing.stop({ path: `${captureDirectory}/trace.zip` });
  await page.close();
  const recording = {
    raw: await page.video().path(),
    elapsed: (performance.now() - started) / 1000,
    origin,
    browser: browser.version(),
  };
  await writeFile(`${captureDirectory}/recording.json`, JSON.stringify(recording, null, 2) + '\n');
  await context.close();
  await browser.close();
  await writeFile(`${directory}/scenes.json`, JSON.stringify(scenes, null, 2) + '\n');
  console.log(`AI take retained at ${directory}`);
}
