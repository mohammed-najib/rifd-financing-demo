# Product comparison and five-step drafts

Implementation of [ticket 03](../../.scratch/financing-application-and-review-implementation/issues/03-compare-products-and-complete-drafts.md), checked on 2026-10-15. The domain demonstration date remains 2026-10-14.

## Delivered behavior

Public comparison shows both fictional products, exact inclusive limits, term choices, one-time markup, purposes, shared requirements and distinct fourth documents. Selection survives sign-in. The applicant explicitly chooses a new application or an existing saved draft; choosing a product never silently overwrites saved progress.

New applications remain in tab memory until the first successful atomic save. Personal, Business, Financing, Documents and Review expose all accepted fields and four file slots. Incomplete steps remain reachable. Step URLs fall back to Personal for unsupported values, and language/step changes preserve raw input and preparation without saving. Review validates the current buffer with linked errors that open and focus the relevant control.

The domain interface checks trimmed Unicode code-point boundaries, ASCII email shape, phone separators, Gregorian month input, whole-YER grouping and per-product limits. Arabic-Indic digits normalize canonically. Draft saves retain raw invalid input. Short operating history, financing above purchase budget and nonpositive surplus remain substantive review concerns rather than format blockers.

Product switching confirms removal of a supplied fourth document, preserves shared fields/documents and invalid amount/term values, and commits staged removal only with a successful save. Prepared purchase evidence and catalog samples retain product provenance. New applications and newly exposed requirements can generate clearly fictional samples from current fields.

## Verification

The tests use the accepted pure-domain seam, public demo interface with real IndexedDB, and production browser screens. Focused red/green checks preceded the implementation and review fixes. Earlier draft tests now navigate the five-step form and scope file actions to their document requirement.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:browser:api --workers=3
pnpm build
RIFD_HOSTING=1 RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser --workers=3
```

The complete suite passed 168 tests: 84 pure-domain tests, 21 public-interface tests using real IndexedDB in Chrome, and 63 production screen checks across Chrome, Firefox and WebKit. The full browser run used the Firebase Hosting emulator without a Start runtime server. Typecheck, lint and the static build passed.

The browser versions were stable Chrome 155.0.8059.39, pinned Playwright Firefox 157.0 revision 1555 and pinned Playwright WebKit 27.2 revision 2370. The temporary WebKit host launcher and Linux library arrangement are documented in [slice 01 evidence](01-evidence.md). Vite retains the existing large-chunk warning for bundled PDF/startup code.

After the final focus correction, the product-switch keyboard and complete five-step review cases were rerun on the rebuilt Hosting output in all three browsers: six further checks passed. These checks assert focus after Cancel, Escape and confirmation, Western-digit review amounts, all four sample documents, and reload restoration.

Visual inspection covers [Arabic review at 390 CSS pixels](evidence/03/review-ar-390.png) and [English review at 1440 pixels](evidence/03/review-en-1440.png). The form stacks its summary at narrow widths, keeps mixed-direction values readable, wraps filenames and omits nonexistent saved information for new applications. Overflow checks cover 360, 390, 768 and 1440 pixels. The full run's local HTML report is retained under `test-results/03-full-report`; the subsequent focused report is under `playwright-report`.

Automated coverage includes field boundaries, Unicode code points, normalized comparison, Arabic-Indic input, malformed grouping, separate review criteria, raw creation/save/restoration, actual bytes in all four slots, storage abort/retry, receipt replay after refresh, staff refusal of drafts, product switching cancellation/confirmation, staged removal, incompatible sample refusal, sample generation, linked validation, step fallback, responsive overflow, caret preservation, keyboard step navigation, expiry recovery and explicit cross-tab reapplication.

Submission and staff review mutations remain with their owning tickets. This evidence does not establish full ordinary Firefox manual acceptance, screen-reader conformance, 200% zoom, physical-device or branded Safari support. Those checks remain with the final acceptance tickets.

## Standards

No outstanding findings. Review caught that a caller could tag an Inventory catalog sample as Equipment evidence, including after a saved product switch exposed the original catalog again. Catalog metadata now retains its original product, a supported additive migration restores older metadata from the immutable seed manifest, and both UI selection and API preparation enforce compatibility. Public-interface regressions reproduce both cases.

## Spec

No outstanding findings. Review also caught loss of access to an unsaved new application after same-identity recovery and incompatible evidence when reapplying stale input across another tab's product change. Protected reads now reauthorize memory-only drafts before restoring retained input and ready files. Stale reapplication confirms and stages removal of an incompatible latest document. Real-screen regressions reproduced both defects before the fixes.

A final keyboard check caught synchronous focus restoration while the closing confirmation still made the form inert. Focus now returns after dialog removal. Cancellation, Escape and confirmation return to the product control; stale reapplication returns to its connected opener or a safe product/heading fallback.

Review totals: Standards 0 outstanding; Spec 0 outstanding.
