import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';

async function pendingPaint(
  page: Page,
  info: TestInfo,
  name: string,
  trigger: Locator,
  feedback: string,
  action: () => Promise<unknown>,
  event = 'click',
) {
  await trigger.scrollIntoViewIfNeeded();
  await trigger.evaluate(element => element.scrollIntoView({ block: 'center' }));
  await page.evaluate(
    ({ feedback, event }) => {
      Object.assign(window, { pendingPaint: null });
      document.addEventListener(
        event,
        () => {
          const start = performance.now();
          const inspect = () => {
            const element = document.querySelector(feedback);
            const rect = element?.getBoundingClientRect();
            if (element && rect && rect.height > 0 && rect.top < innerHeight && rect.bottom > 0) {
              // The next frame bounds the first paint containing this feedback.
              requestAnimationFrame(() =>
                Object.assign(window, {
                  pendingPaint: {
                    triggerMs: start,
                    paintedByMs: performance.now(),
                    elapsedMs: performance.now() - start,
                    text: element.textContent,
                    viewport: { width: innerWidth, height: innerHeight },
                  },
                }),
              );
            } else if (performance.now() - start < 3000) requestAnimationFrame(inspect);
          };
          requestAnimationFrame(inspect);
        },
        { capture: true, once: true },
      );
    },
    { feedback, event },
  );
  await action();
  await page.waitForFunction(
    () => !!(window as unknown as { pendingPaint: unknown }).pendingPaint,
    undefined,
    { timeout: 5000 },
  );
  const timing = await page.evaluate(
    () => (window as unknown as { pendingPaint: { elapsedMs: number } }).pendingPaint,
  );
  await info.attach(`${name}-paint.json`, {
    body: JSON.stringify(timing),
    contentType: 'application/json',
  });
  await info.attach(`${name}-pending.png`, {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  expect(timing.elapsedMs, `${name} pending feedback painted within 100ms`).toBeLessThanOrEqual(
    100,
  );
}

for (const language of ['ar', 'en'] as const)
  test(`${language} slow save, upload, submission and decision paint pending feedback within 100ms`, async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'chrome', 'Paint timing uses the fixed Chrome host');
    const ar = language === 'ar';
    await page.setViewportSize({ width: 390, height: 950 });
    await page.goto('/applications/RIFD-2026-001/edit?step=financing');
    await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 120_000 });
    if (!ar) await page.getByRole('button', { name: 'English', exact: true }).click();
    await page
      .getByRole('button', { name: ar ? 'مريم سالم' : 'Mariam Salem', exact: true })
      .click();
    await page
      .locator('#purchase-explanation')
      .fill('Fictional stock for this established small business.');
    await page.locator('.demo-controls summary').click();
    await page.getByLabel(ar ? 'طلبات بطيئة' : 'Slow requests', { exact: true }).check();
    const save = page.getByRole('button', {
      name: ar ? 'حفظ التقدم' : 'Save progress',
      exact: true,
    });
    await pendingPaint(
      page,
      info,
      'save',
      save,
      '.draft-editor > .draft-feedback[aria-busy=true]',
      () => save.click(),
    );
    await expect(page.locator('.draft-editor > div.draft-feedback')).toHaveAttribute(
      'aria-busy',
      'false',
    );
    await page
      .getByRole('link', { name: ar ? '4. المستندات' : '4. Documents', exact: true })
      .click();
    const upload = page.locator('#identity-file');
    await pendingPaint(
      page,
      info,
      'upload',
      upload,
      'section[aria-labelledby="identity-heading"] progress',
      () =>
        upload.setInputFiles({
          name: 'DEMO-timing.png',
          mimeType: 'image/png',
          buffer: Buffer.from('fictional pending upload evidence'),
        }),
      'change',
    );
    await expect(
      page.getByRole('button', {
        name: ar ? 'معاينة الملف الجاهز' : 'Preview ready file',
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole('link', { name: ar ? '5. المراجعة' : '5. Review', exact: true }).click();
    const submit = page.getByRole('button', {
      name: ar ? 'تقديم الطلب' : 'Submit application',
      exact: true,
    });
    await pendingPaint(
      page,
      info,
      'submission',
      submit,
      '.draft-editor button[aria-busy=true]',
      () => submit.click(),
    );
    await expect(
      page
        .getByRole('status')
        .filter({ hasText: ar ? 'قُدم طلبك' : 'Your application was submitted' }),
    ).toBeVisible();
    // Stay in this tab and navigate through the UI so Slow requests remains active.
    await page
      .getByRole('button', { name: ar ? 'تغيير الهوية' : 'Switch identity', exact: true })
      .click();
    await page
      .getByRole('button', { name: ar ? 'سلمى ناصر' : 'Salma Nasser', exact: true })
      .click();
    await page.locator('#queue-search').fill('RIFD-2026-007');
    await page.locator('[data-application="RIFD-2026-007"] a').first().click();
    const purpose = page.getByRole('group', {
      name: ar ? 'ملاءمة الغرض لمنتج التمويل' : 'Product purpose fit',
      exact: true,
    });
    await purpose.getByRole('button', { name: ar ? 'لم يجتز' : 'Failed', exact: true }).click();
    await expect(
      purpose.getByRole('button', { name: ar ? 'لم يجتز' : 'Failed', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await page
      .getByRole('link', {
        name: ar ? 'تسجيل القرار النهائي' : 'Record final decision',
        exact: true,
      })
      .click();
    await page
      .locator('#decision-reason')
      .fill(ar ? 'الغرض لا يطابق المنتج.' : 'The purpose does not match this product.');
    await page
      .getByRole('button', { name: ar ? 'فحص الرفض' : 'Inspect rejection', exact: true })
      .click();
    const confirm = page.getByRole('dialog').getByRole('button', {
      name: ar ? 'تأكيد القرار النهائي' : 'Confirm final decision',
      exact: true,
    });
    await pendingPaint(
      page,
      info,
      'decision',
      confirm,
      'section[aria-labelledby="decision-heading"][aria-busy=true] [role=status]',
      () => confirm.click(),
    );
    await expect(
      page
        .getByRole('status')
        .filter({ hasText: ar ? 'حُفظ القرار النهائي.' : 'Final decision saved.' }),
    ).toBeVisible();
  });

for (const language of ['ar', 'en'] as const)
  for (const width of [390, 1440])
    test(`${language} ${width} correction samples keep their loading and recovery positions`, async ({
      page,
    }, info) => {
      test.skip(info.project.name !== 'chrome', 'Layout Shift API measurement uses Chrome');
      await page.setViewportSize({ width, height: 950 });
      await page.addInitScript(() => {
        const frames: {
          time: number;
          busy: boolean;
          x: number;
          y: number;
          width: number;
          height: number;
          buttonX: number;
        }[] = [];
        const shifts: {
          value: number;
          time: number;
          recentInput: boolean;
          afterFirstSampleFrame: boolean;
          nodes: string[];
        }[] = [];
        Object.assign(window, { sampleFrames: frames, sampleShifts: shifts });
        new PerformanceObserver(list => {
          if (!frames.length) return;
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & {
              value: number;
              hadRecentInput: boolean;
              sources?: { node?: Element }[];
            };
            // Entries can arrive after the first frame even when recorded before it.
            // Retain those route/focus transitions, but measure loading from the
            // picker's first frame rather than the observer callback's delivery time.
            shifts.push({
              value: shift.value,
              time: shift.startTime,
              recentInput: shift.hadRecentInput,
              afterFirstSampleFrame: shift.startTime >= frames[0].time,
              nodes:
                shift.sources?.map(
                  source => source.node?.id || source.node?.tagName || 'removed',
                ) ?? [],
            });
          }
        }).observe({ type: 'layout-shift', buffered: false });
        const observe = () => {
          const picker = document.querySelector('.sample-picker');
          if (picker) {
            // Only shifts from the first sample frame onward belong to this check.
            if (!frames.length) shifts.length = 0;
            const rect = picker.getBoundingClientRect();
            frames.push({
              time: performance.now(),
              busy: picker.getAttribute('aria-busy') === 'true',
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              buttonX:
                picker.querySelector('button:not(.select-trigger)')!.getBoundingClientRect().x -
                rect.x,
            });
          }
          requestAnimationFrame(observe);
        };
        requestAnimationFrame(observe);
      });
      await page.goto('/applications/RIFD-2026-004/corrections/current');
      await expect(page.locator('[data-workspace-ready="true"]')).toBeVisible({ timeout: 120_000 });
      if (language === 'en')
        await page.getByRole('button', { name: 'English', exact: true }).click();
      const identity = language === 'ar' ? 'هدى علي' : 'Huda Ali';
      await page.getByRole('button', { name: identity, exact: true }).click();
      const picker = page.locator('.sample-picker');
      await expect(picker).toHaveAttribute('aria-busy', 'false');
      const frames = () =>
        page.evaluate(
          () =>
            (
              window as unknown as {
                sampleFrames: { busy: boolean; height: number; buttonX: number }[];
              }
            ).sampleFrames,
        );
      const stability = () =>
        page.evaluate(() => {
          const shifts = (
            window as unknown as {
              sampleShifts: {
                value: number;
                time: number;
                recentInput: boolean;
                afterFirstSampleFrame: boolean;
                nodes: string[];
              }[];
            }
          ).sampleShifts;
          let cls = 0,
            sum = 0,
            start = 0,
            last = 0;
          // The footer is replaced during the initial shell transition; this check owns the sample picker, whose geometry is asserted below.
          for (const shift of shifts.filter(
            shift =>
              !shift.recentInput &&
              shift.afterFirstSampleFrame &&
              shift.nodes.some(node => node !== 'FOOTER'),
          )) {
            if (shift.time - last > 1000 || shift.time - start > 5000) {
              sum = 0;
              start = shift.time;
            }
            sum += shift.value;
            last = shift.time;
            cls = Math.max(cls, sum);
          }
          return { cls, shifts };
        });
      await page.evaluate(
        () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      const initial = await frames();
      const initialStability = await stability();
      expect(initial.some(frame => frame.busy)).toBe(true);
      await info.attach('initial-sample-layout.json', {
        body: JSON.stringify(initial),
        contentType: 'application/json',
      });
      await info.attach('initial-layout-shifts.json', {
        body: JSON.stringify(initialStability),
        contentType: 'application/json',
      });
      expect(initialStability.cls).toBeLessThanOrEqual(0.1);
      expect(
        Math.max(...initial.map(frame => frame.height)) -
          Math.min(...initial.map(frame => frame.height)),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.max(...initial.map(frame => frame.buttonX)) -
          Math.min(...initial.map(frame => frame.buttonX)),
      ).toBeLessThanOrEqual(1);
      await page
        .getByRole('button', {
          name: language === 'ar' ? 'إنهاء الجلسة' : 'Expire session',
          exact: true,
        })
        .click();
      await page.evaluate(() => {
        const state = window as unknown as { sampleFrames: unknown[]; sampleShifts: unknown[] };
        state.sampleFrames.length = 0;
        state.sampleShifts.length = 0;
      });
      await page.getByRole('button', { name: identity, exact: true }).click();
      await expect(picker).toHaveAttribute('aria-busy', 'false');
      await page.evaluate(
        () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      const recovery = await frames();
      const recoveryStability = await stability();
      await info.attach('recovery-sample-layout.json', {
        body: JSON.stringify(recovery),
        contentType: 'application/json',
      });
      await info.attach('recovery-layout-shifts.json', {
        body: JSON.stringify(recoveryStability),
        contentType: 'application/json',
      });
      expect(recoveryStability.cls).toBeLessThanOrEqual(0.1);
      expect(recovery.some(frame => frame.busy)).toBe(true);
      expect(
        Math.max(...recovery.map(frame => frame.height)) -
          Math.min(...recovery.map(frame => frame.height)),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.max(...recovery.map(frame => frame.buttonX)) -
          Math.min(...recovery.map(frame => frame.buttonX)),
      ).toBeLessThanOrEqual(1);
    });
