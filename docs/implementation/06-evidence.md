# Submit applications and track public history

> Dated implementation record. For current setup and behavior, start with the [documentation index](../README.md). Test counts, release identifiers and operational decisions below apply to the work recorded here.

Implementation of [ticket 06](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review-implementation/issues/06-submit-and-track-applications.md), checked on 2026-10-15. The domain date remains 2026-10-14.

## Delivered behavior

Review can submit the complete current form, including a new application without a preceding progress save. Linked validation errors open and focus the required field or document. The public operation validates every field and all four files, including active pending/failed replacements that still have an older saved file. The incomplete Submitted seed remains a fixture with no normal-operation bypass.

Submission checks the private and shared revisions, then commits the snapshot, bytes, frozen submission date/evidence months, initial assessments/checks, shared revision, one lifecycle event and receipt together. It retires the draft workspace and preserves the current stored assignment. Applicant history omits staff details; the staff projection includes internal activity. Submission creates no notification.

Success opens read-only detail with the reference and immediate confirmation. Own lists expose current status and the permitted next action. New UUID references work on both applicant and staff routes. The seeded correction baselines, public reasons, final decisions and historical financial window remain intact.

The next-submission failure consumes only an eligible nonduplicate attempt. Failure retains the form and ready bytes. Storage abort, session expiry, dataset replacement and stale revisions cannot publish partial effects. Unknown completion requires receipt inspection before retry. If editing ends during expiry or another tab's submission, the permitted detail shows retained work separately with explicit inspection/discard.

## Verification

Tests use the accepted domain, public demo interface with actual IndexedDB, and production browser-screen seams. The complete domain run passed 84 tests and the complete public-interface run passed 40 tests. Red/green checks preceded the first API/UI implementation and the review regressions. The replacement-dataset interruption uses an isolated storage fixture until ticket 18 supplies the public reset operation; assertions use the public interface.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:browser:api --workers=3
pnpm build
RIFD_HOSTING=1 RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser --workers=3
```

The browser checks run on Linux with stable Chrome 155.0.8059.39, pinned Playwright Firefox 157.0 revision 1555 and WebKit revision 2370. Node is 26.7.0 and pnpm is 11.24.0. The temporary WebKit launcher/library arrangement is documented in [slice 01 evidence](01-evidence.md). The static build retains the existing large-chunk warning.

Typecheck, lint and the static build passed. The full production screen run passed 147 of 153 cases and found six earlier assertions that expected retained input absent from the DOM. The new separate unapplied-work panel preserves that input inside closed details. Those tests now assert its presence, hidden state and exclusion from submitted information, and use an actual submission in another tab instead of a database patch. All six updated cases passed in a focused rerun across both languages and all three browsers. No product code changed after the full run. Together these runs verify all 277 current cases: 84 domain, 40 public-interface and 153 production screens.

The full browser report is retained locally under `test-results/06-full-report`; the successful focused report is under `playwright-report`. Reproduce the focused run with the same Hosting/WebKit environment and `pnpm test:browser tests/browser/sessions.screens.spec.ts --grep='same-identity recovery uses the permitted read-only record' --workers=3`.

Submission coverage includes both languages, a complete new Equipment application, Arabic-Indic values, format refusal, missing/pending/failed files, linked focus, failure/retry, duplicate suppression, refresh and actual bytes, role filtering, no submission notification, both revisions, same-day event ordering, fixed financial windows under a 2032 browser clock, dataset replacement, expiry before and after staging, unknown outcomes, failed post-commit observers, cross-tab publication and committed new-application recovery after expiry. Responsive overflow assertions cover 360, 390, 768 and 1440 CSS pixels.

Visual inspection covers [Arabic submitted detail at 390 pixels](evidence/06/submitted-ar-390.png) and [English at 1440 pixels](evidence/06/submitted-en-1440.png). References and filenames wrap within their blocks. Both directions distinguish confirmation, next action, submitted information, included files and public history.

These checks do not establish full screen-reader, physical-device, ordinary Firefox manual or branded Safari acceptance. Those remain with the final acceptance tickets. Notifications, print, correction submission and staff review mutations retain their owning tickets.

## Standards

No outstanding findings. The review identified duplicated retry matching and completion handling in progress saving and submission. Both now share helpers while keeping their different preparation and validation behavior.

## Spec

No outstanding findings. Review reproduced a real pending-replacement bypass using old saved references, missing field diagnostics, and loss of receipt recovery when a new application committed before expiry. The operation now tracks active selections and returns field issues; recovery opens canonical read-only detail with the retained inspector. Authority-driven redirects also preserve input without opening a departure blocker. Public-interface and real-screen regressions cover these failures.

Both axes reviewed the work against starting commit `8b998b15020d67cd21e8be58c1db537ca48b4594`. Review totals: Standards 0 outstanding; Spec 0 outstanding.
