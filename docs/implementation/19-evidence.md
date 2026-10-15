# Slice 19 implementation evidence

Implemented [Expose the production component gallery](../../.scratch/financing-application-and-review-implementation/issues/19-production-component-gallery.md)
against starting commit `230936d099a7d39eb33814889312ac2fbd36d875`.
The verified implementation is `5375e74ffaf2b7450ebefb6442888f64321cbeb9`.

## Public gallery

`/components` opens without an identity, survives refresh and is linked from the
main demo navigation. The language control uses the existing shared preference.
During startup recovery it uses the same temporary language choice as public
products. The gallery remains available when browser storage is denied.

The examples contain fictional fields, filenames and queue summaries. Editing,
retrying, discarding and inspecting examples changes only gallery state. File
preview controls explain where a visitor can inspect a real saved document after
sign-in. The gallery performs no protected reads or application/file mutations.

## Shared production components

| Component | Journey usage | Gallery evidence |
| --- | --- | --- |
| `ApplicationField` | Draft and correction editors | Labelled input, select and textarea, raw Arabic digits, range error and keyboard focus |
| `Status` | Applicant cards, staff rows, detail and repayment | All six written application statuses |
| `AttachmentPreparation`, `SavedAttachment` | Draft and correction document slots | Selected, preparing at 50%, ready, failed replacement, saved and missing |
| `DraftSaveFeedback` | Draft, correction and publication feedback | Unsaved, saving, saved, failed and unknown outcomes with existing recovery copy |
| `LoadingPanel`, `ReadFailure`, `EmptyQueue` | Route loading and staff queue results | Loading, storage failure, retry and empty results |
| `ApplicationRows` | Staff queue | The same table/card breakpoint, assignments, dates and amounts |
| `DepartureDialog` | Unsaved-work navigation guard | Focus containment, Escape, cancel, save and focus return |

The gallery also names document outcomes and review-check outcomes using the
journeys' shared bilingual copy, alongside an explanation of their distinction
from application status. Long mixed-direction names, purchase explanation,
business names, references and filenames exercise wrapping and isolation.

The existing shared field skin now also applies to `ApplicationField` outside
the draft editor. Visual inspection found that the input skin overrode invalid
borders. A Chrome read confirmed the normal `rgb(151, 170, 162)` border on an
invalid input. The shared invalid selector now matches the control selector's
specificity. A read against the final build confirms the intended
`rgb(196, 107, 91)` danger border.

Layout uses the established Tailwind utilities, logical spacing and theme tokens.
There is no gallery stylesheet or additional reset.

## Verification

The browser checks use the accepted production-screen seam and the static SPA
fallback. The initial public-route check failed before `/components` existed.
A discard regression also failed before each attachment example received its
own state. The keyboard test reproduced a reverse-Tab failure in the shared
departure dialog. The dialog now cycles between its first and last enabled
buttons. The default domain suite passes all 105 cases. Typecheck, lint, both
package-skill tests and packaged guidance checks pass.

Browser checks cover unsigned direct entry and refresh, persisted language,
startup recovery, all written status distinctions, field validation and raw input
preservation, attachment preparation and retry, save feedback, queue table/card
parity, narrow/wide wrapping and keyboard dialog containment/return.

All 26 final Chrome/Firefox cases pass without retries. These comprise eight
gallery cases and eighteen journey regressions for draft save/restore and real
previews, Arabic failure recovery, private correction responses, failed
replacements, departure focus/expiry and searchable responsive queues. The two
Chrome departure cases that initially timed out during startup pass in this run.
The final WebKit run passes all four gallery cases. The final build therefore
has thirty passing browser cases, including all twelve gallery cases across
Chrome, Firefox and WebKit.

## Standards review

The independent reviewer found no documented-standard violations or actionable
baseline smells. Shared components follow the README's styling rules and glossary
vocabulary. Browser tests use the agreed screen seam. The reviewer also accepted
the later invalid-border selector correction in the shared components layer.

Standards: zero findings.

## Spec review

The independent reviewer found no missing requirement, unrequested scope or
incorrect implementation in the source review. The gallery and journeys share
production components for the required states. Public routing, startup recovery,
bilingual examples and keyboard behavior match issue 19. The reviewer also
accepted the invalid-border selector correction.

Spec: zero findings.

## Visual inspection

Chrome captures cover both languages at 390 and 1440 CSS pixels. Automated
overflow checks also cover 360 and 768 pixels. These are emulated viewports.
The gallery uses the production queue's table at 1440 pixels and cards at the
narrower widths. Dialog controls wrap within the narrow viewport, and written
errors and keyboard focus remain visible.

| View | Arabic | English |
| --- | --- | --- |
| Gallery at 390 pixels | [Capture](evidence/19/gallery-ar-390.png) | [Capture](evidence/19/gallery-en-390.png) |
| Gallery at 1440 pixels | [Capture](evidence/19/gallery-ar-1440.png) | [Capture](evidence/19/gallery-en-1440.png) |
| Validation and focus at 390 pixels | [Capture](evidence/19/field-error-ar-390.png) | [Capture](evidence/19/field-error-en-390.png) |
| Dialog at 390 pixels | [Capture](evidence/19/dialog-ar-390.png) | [Capture](evidence/19/dialog-en-390.png) |
| Dialog at 1440 pixels | [Capture](evidence/19/dialog-ar-1440.png) | [Capture](evidence/19/dialog-en-1440.png) |

## Reproduction

Verified on Omarchy Linux x86_64 with Node 26.7.0, Playwright 1.64.1, installed
Chrome 155.0.8059.39, pinned Firefox 157.0 and WebKit 27.2. WebKit uses the compatible
launcher documented in [slice 01](01-evidence.md). The production build retains
its existing large-client-chunk warning.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:skills
pnpm skills:check
pnpm build
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser tests/browser/gallery.screens.spec.ts --workers=1 --timeout=180000
```

The machine was running other workloads during verification. Initial Chrome
startup checks with a 30-second readiness limit timed out while the neutral
startup or chooser was still rendering. Gallery checks permit up to 90 seconds
for actual startup readiness and run one browser worker at a time. This evidence
does not measure startup performance.

The final Chrome/Firefox log is `/tmp/rifd-19-final-regressions.log`, with its
report at `/tmp/rifd-19-regression-report-5375e74`. Domain output is retained at
`/tmp/rifd-19-final-domain.log`, package guidance output at
`/tmp/rifd-19-skills.log`, and build output at `/tmp/rifd-19-final-build.log`.
The final WebKit log is `/tmp/rifd-19-final-webkit.log`; its HTML report is at
`playwright-report/`.
