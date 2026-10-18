# Tailwind v4 migration evidence

> Dated implementation record. For current setup and behavior, start with the [documentation index](../README.md). Test counts, release identifiers and operational decisions below apply to the work recorded here.

The user approved adoption of Tailwind CSS v4 and updates to unresolved implementation tickets. The starting commit was `daf5b4170c4bb72db1d0d81b4b328e14907338e6`. This change preserves the current Guided A UI and the behavior implemented by slices 01 and 02.

Checked on 2026-10-14 on Omarchy Linux, x86_64, with Node 26.7.0, pnpm 11.24.0 and Playwright 1.64.1. Browser versions are installed stable Chrome 155.0.8059.39, pinned Playwright Firefox 157.0 revision 1555 and pinned Playwright WebKit 27.2 revision 2370. WebKit uses the existing temporary compatibility launcher described in [slice 01 evidence](01-evidence.md).

## Implementation

`tailwindcss` and `@tailwindcss/vite` are pinned to 4.3.3. Both application and browser API Vite configurations compile the shared stylesheet. The root route retains its stylesheet URL, and production assets remain static files under `dist/client`.

The stylesheet imports theme and utilities without Preflight. Its CSS-first theme preserves the existing colors, local Noto fonts, 15px root size and 4px spacing unit. Component skins and descendant rules use `@apply` in the components layer; JSX utilities own layouts. Explicit status-class maps make every status detectable. The compact and narrow custom variants preserve inclusive 1199px and 767px cutoffs, with narrow declared last. Source detection covers `src` only.

Initial visual checks found extra border edges without Preflight and the wrong order for overlapping variants. Partial borders now clear other edge widths explicitly. The mobile loading panel retains its original 20px top padding. No domain, storage, session, authorization or seed-generation code changed.

## Visual comparison

Before and after captures used installed Chrome on the same Linux host, fresh browser contexts, locally served production builds, the same viewport heights and loaded local fonts. The baseline covers chooser, products, applicant list, saved draft, applicant corrections, staff queue, historical review, unavailable entry, saved image preview and departure dialog in Arabic and English.

There are 84 paired captures at 360, 390, 768 and 1440 CSS pixels, with 767, 1199 and 1200 additionally checked for queue and review layouts. ImageMagick's absolute-error comparison found 46 identical images. The other 38 differ only in generated PDF byte-count digits. Fresh seed generation uses PDF metadata timestamps, changing the compressed file length by a few bytes between contexts. Enlarged inspection confirmed the differing digits; layout and styles match. The [comparison results](evidence/tailwind-v4/comparison.json) retain all capture names and raw metrics.

Retained pairs were visually inspected for fonts, mixed-direction content, colors, spacing, lists, statuses, controls and preview recovery actions:

| Screen | Before | After |
| --- | --- | --- |
| Arabic chooser, 390px | [Baseline](evidence/tailwind-v4/before-chooser-ar-390.png) | [Tailwind](evidence/tailwind-v4/after-chooser-ar-390.png) |
| Arabic staff queue, 1440px | [Baseline](evidence/tailwind-v4/before-queue-ar-1440.png) | [Tailwind](evidence/tailwind-v4/after-queue-ar-1440.png) |
| English applicant corrections, 1440px | [Baseline](evidence/tailwind-v4/before-correction-en-1440.png) | [Tailwind](evidence/tailwind-v4/after-correction-en-1440.png) |
| English saved-file preview, 1440px | [Baseline](evidence/tailwind-v4/before-preview-en-1440.png) | [Tailwind](evidence/tailwind-v4/after-preview-en-1440.png) |

Review requested explicit visible-focus evidence and additional browser comparisons. A rebuilt original baseline and the final production build supplied 12 further paired captures across Chrome, Firefox and WebKit. Each browser covers Arabic chooser focus at 390px, English chooser focus at 1440px, Arabic queue table at 1440px and English queue cards at 390px. All 12 pairs are pixel-identical. Keyboard Tab enters the first identity button; computed focus indicators match the baseline's solid 3px gold outline with 4px offset in both languages and every engine. The [browser and focus comparison](evidence/tailwind-v4/browser-visual-comparison.json) records actual engine versions, outline values, overflow and image metrics.

The additional retained images include [WebKit Arabic keyboard focus](evidence/tailwind-v4/after-focus-webkit-ar-390.png), [Firefox English keyboard focus](evidence/tailwind-v4/after-focus-firefox-en-1440.png) and [Firefox English queue cards](evidence/tailwind-v4/after-queue-firefox-en-390.png). Together the two comparison sets cover 96 pairs, with 58 identical and the remaining 38 limited to the PDF byte-count digits described above.

One temporary Chrome capture process closed before the final scenario. The remaining scenario passed on retry. This did not change the application or the retained comparison images.

## Verification

A clean temporary checkout installed all dependencies offline from the local pnpm store with `--frozen-lockfile` and built successfully. The focused API browser file passed 6 tests. The focused bilingual screen check passed, including table/card visibility at 767/768 and 1199/1200px. Assertions use visible table and article roles at the existing screen seam.

The final commands are:

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:browser:api
pnpm build
RIFD_HOSTING=1 RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser
```

The full suite passed all 82 tests: 19 pure-domain, 18 browser API and 45 production screen checks across Chrome, Firefox and WebKit. Screen checks ran against the Hosting emulator with no Start runtime server. Typecheck, lint and the production build passed.

The review cleanup shares repeated preview and event-date class strings in local constants. The rebuilt stylesheet retains the exact `styles-DomIambh.css` hash from the passing full suite. Typecheck and lint passed again. Both focused post-cleanup Chrome screen checks passed, covering saved draft previews, dated details, both languages and responsive table/card boundaries.

The final stylesheet is 19.42 kB, 4.36 kB gzip, compared with 10.98 kB, 3.10 kB gzip before adoption. The main JavaScript bundle is 921.85 kB, 330.03 kB gzip, compared with 919.21 kB, 329.09 kB gzip. Vite retains the existing large-chunk warning. This is a build-size comparison, not a Lighthouse performance result.

## Standards

The first review found two low-priority duplication suggestions and no documented-standard violations. Repeated preview and event-date class strings now share local constants, preserving static class detection and the generated CSS. Follow-up review confirms both resolved and no new material findings.

## Spec

The first review found one partial verification requirement and no implementation or scope findings. The additional visible-focus and cross-browser comparisons above address that gap. Follow-up review confirms it resolved and no new material findings.

Review totals: Standards 0 outstanding; Spec 0 outstanding.

## Ticket handoff and limits

All 22 unresolved implementation tickets link to the styling conventions. Form, print, queue, gallery, browser acceptance, visual acceptance, performance, Hosting release and repository-delivery tickets also carry specific checks. Their statuses, functional scope and dependency graph remain unchanged. Completed tickets and their historical evidence were not rewritten.

These checks cover the current UI. They do not complete later feature journeys, screen-reader checks, actual print acceptance, 200% zoom acceptance, Lighthouse gates or Hosting release. Playwright WebKit and responsive viewport checks do not establish branded Safari or physical-device support. See [styling conventions](../development.md#styling) before extending the UI.

## Ticket 21 acceptance extension

The [slice 21 evidence](21-evidence.md) extends this baseline to the implemented
application, correction, review, decision, repayment, print and public gallery
screens. Its production-screen checkpoints cover Arabic and English at
360/390/768/1440px, plus 767/768 and 1199/1200 boundaries for gallery, queue,
staff review and decision views. Captures and measured page/control bounds are
retained with browser versions and the tested source manifest.

The gallery includes the shared written statuses, long mixed-direction text,
filenames, lists, controls, invalid fields, save/recovery states and dialog focus.
The correction picker now reserves its existing flex layout while samples load;
it keeps the same tokens, logical layout and spacing. Pointer regressions cover
the resulting control stability. The compiled stylesheet hash remains
`7cdf6b5894543437ca5c964660faa44fb8dff2359df2ac168ebcf40f66710345`.
The production dialogs now share Tab containment while keeping their existing
focus indicators, Escape handling and opener return.

These additions are acceptance evidence for the current production components.
The earlier pixel-comparison results remain historical. The later slice 21
follow-up records completed ordinary-browser journeys, keyboard and native
preview checks with their own source bindings.

### Applicant preview label follow-up

The 16 October [ticket 21 follow-up](21-evidence.md#follow-up-acceptance-on-16-october)
adds the existing bold document label to applicant editor and detail previews.
It uses the shared dialog layout and `font-semibold` token. No stylesheet or
breakpoint changed. The retained native Firefox captures include the labelled
preview and decision controls at 200% browser zoom and a measured 390px viewport.
Chrome captures include the saved PDF's first and second pages and 390px scrolling.
These selected inspections retain their historical source; the completed
ordinary-browser matrix below supplies the broader journey evidence.

The later `36deb6f` queue focus fix adds complete `aria-disabled:cursor-wait`
and `aria-disabled:opacity-65` utilities to selects. Reset filters uses the
existing unavailable-button rule. The stylesheet is now `styles-C1VBoyd-.css`,
SHA-256 `7aed7a781e86e538f77967a65696ba473cb680f1f658575c53effaaded9a0a39`.
Money operand isolation, note focus and validation scroll changes precede that
build. The later pagination controls reuse the existing unavailable-button
rule. No breakpoint changed.

The completed slice 21 follow-up contains ten ordinary-browser walks and 390
viewport scenes, with Arabic Firefox and English Chrome at 360/390/768/1440px
and native 200% zoom. Visual review covers all 390 scenes and selected full-page
captures. Final-source rechecks cover page-button focus, accurate departure
feedback and empty saved fields at every size. Supplemental composer,
confirmation and storage-recovery scenes cover the same five sizes. The Arabic
reset chooser has a separate corrected 200% capture. Review records and hashes
are linked from the slice evidence. The full screen invocation passed 559 cases
and failed five Firefox startup waits; all six cases in the affected file passed
an unchanged-source recheck. Earlier 767/768 and 1199/1200 boundary checks remain
part of the complete screen suite. These results do not claim a new pixel
comparison with the original pre-Tailwind baseline.

The final `9783563` focus corrections keep the current page control visible after
queue reads and preserve reviewer assessment/check/verification focus during
saving. Replacement-editor closure returns focus after the DOM update. They
reuse existing focus and unavailable styles; `styles-C1VBoyd-.css` and its hash
remain unchanged. Ordinary-browser paging rechecks cover all five sizes, and
final review-action captures cover Arabic/English 390px. Their distinct source
phases and the final affected-file results are recorded in slice 21.

The final five-file screen recheck passes all 165 cases on `9783563`, 55 per
engine, without skips or flaky retries. Historical complete-run failures and
the unchanged-source assignment recheck remain separate in the evidence.
