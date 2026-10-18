# Slice 08 implementation evidence

> Dated implementation record. For current setup and behavior, start with the [documentation index](../README.md). Test counts, release identifiers and operational decisions below apply to the work recorded here.

Implemented [Search and organize the staff queue](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review-implementation/issues/08-search-and-organize-staff-queue.md) against the accepted stories 31 to 35 and existing Guided A styling.

## Queue behavior

`Demo.readStaffQueue` reads the current committed dataset under Salma's session. It projects submitted information, searches reference/applicant/business, combines status/product/assignment filters and returns five records per page. The four date/amount sorts use ascending references for ties, including across page boundaries. Search accepts Arabic-Indic reference digits without changing displayed names or business information.

The initial permitted queue has twelve records. Status counts are four Submitted, three Under review, three Corrections requested, one Approved and one Rejected. Assignment counts are seven Salma, three Khaled and two unassigned. Search and filters change the matched count while preserving these queue totals. Draft and private correction content remain absent; Huda's 004 queue amount stays 600,000 YER.

Valid explicit query values take precedence over saved filters and sort. Invalid fields fall back individually. Fresh visits have empty search and page one. Search/filter changes reset the page; unavailable pages clamp to the last page, including the empty-result page one. Empty results keep controls and offer Clear search and Reset filters. Result counts use a polite live region without refocusing the heading.

Opening an application carries the queue query through the detail and print URLs. Back to queue therefore restores search, filters, sort and page after refreshing either screen or returning from print. Browser Back/Forward restores earlier queue entries. The router's own parser and serializer preserve numeric search strings as text.

## Preferences and recovery

`setQueuePreferences` saves only the validated filter/sort object with a captured dataset, operation identifier and expected preference revision. It shares the actor-scoped receipt namespace with language and other commands. The transaction preserves language, application/workspace revisions and armed application-write failures. Exact replay returns the latest context without saving again. Invalid, unauthorized, expired, superseded and stale attempts cannot save preferences.

The screen keeps a refused intent apart from refreshed committed preferences. Inspect saved queue preferences reads its receipt and current state. Reapply my choice uses a new operation identifier against the inspected revision; another competing save requires inspection again. Use latest preferences explicitly adopts the inspected state. Unknown outcomes require the same receipt inspection, and a confirmed receipt cannot offer reapplication. Broadcast and observer failures cannot turn a committed save into a failed or duplicate save.

## Verification

The accepted public Demo interface and production screens remain the test seams. Red/green checks first demonstrated the missing queue read, preference inspection and search control. Subsequent checks cover queue combinations, every sort over all three pages, explicit/invalid query state, preference reload, authorization, expiry, lost notices, keyboard focus/order, Back/Forward, refreshed detail/print return and repeated two-tab conflicts. Actual IndexedDB faults verify staged-write rollback and lost completion observation, with receipt inspection before retry or confirmation. A shared one-shot browser fault supports the API and screen unknown-outcome checks.

The production table/card boundary remains 1199/1200 CSS pixels, and the card/control single-column boundary remains 767/768. Chrome, Firefox and WebKit checks exercise 360, 390, 767, 768, 1199, 1200 and 1440 pixels in Arabic and English, with no horizontal page overflow. Four Chrome screenshots were visually inspected for identifying details, mixed-direction text, counts, controls and layout:

- [Arabic mobile](evidence/08/queue-ar-390.png)
- [Arabic desktop](evidence/08/queue-ar-1440.png)
- [English mobile](evidence/08/queue-en-390.png)
- [English desktop](evidence/08/queue-en-1440.png)

The host uses Node 26.7.0, pnpm 11.24.0 and Playwright 1.64.1. WebKit uses the existing temporary compatible-library launcher documented in [slice 01 evidence](01-evidence.md). These checks use the production static server. Hosting release, Lighthouse and final manual acceptance remain with their owning tickets.

Checks completed:

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm skills:check
pnpm test:skills
pnpm pack:domain
pnpm test:browser:api --workers=3
pnpm test:browser:api tests/browser/queue.api.spec.ts --grep 'write abort|lost queue' --workers=2
pnpm build
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser --workers=4
```

All 84 domain tests, 53 full public-interface cases and two additional preference transaction cases passed. The shared fault-helper refactor also passed its focused unknown-completion rerun. Both package-skill test files, source validation/reviews, archive contents and isolated packed-package consumer checks passed. Typecheck, lint and the final static build passed. The build retains the existing large-chunk warning.

The full production run passed 199 of 210 cases. Ten WebKit cases exceeded their 30-second startup deadline, and one Firefox interrupted-preparation recovery check failed to reach Ready to save. Focused diagnosis showed that recovery case was intermittent; waiting for the screen's ready state did not consistently remove it. All eleven original failed cases then passed on the final build with a single worker, without changing session code or relaxing assertions. These intermittent timing failures remain a verification limitation.

After the print-return review fix, all 21 final queue and staff-print checks passed in Chrome, Firefox and WebKit with two workers. They include six queue journeys per browser and the existing staff-print privacy/expiry journey. Together the broad and focused runs provide passing evidence for all 355 current domain/browser cases, including the six newly added screen cases and two additional transaction cases after the broad sweep.

The final focused runs used temporary copies of the normal Playwright config, separate reports and the same manually served final static build. Reports remain locally under `test-results/08-full-report`, `test-results/08-final-report` and `test-results/08-rerun-report`. To reproduce the final feature checks after stopping any manually served instance:

```sh
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser tests/browser/queue.screens.spec.ts tests/browser/print.screens.spec.ts --grep 'queue.screens|staff prints public information' --workers=2
```

## Standards

No documented-standard violations were found. The review confirmed the public Demo boundary, transaction checks, glossary terms, Tailwind conventions and accepted test seams. An optional duplication finding in the two unknown-completion fixtures was resolved by sharing `loseNextWriteCompletion`. Follow-up review found no remaining Standards findings.

## Spec

The initial review found one P2: Print summary and Back to application dropped the queue query, so Back to queue lost its prior position. Detail and print now carry the router's search string through both links. A failing real-screen regression first reproduced the loss; the final build passes that complete path, including refresh, in all three browsers. Follow-up review found no remaining material Spec findings.

Final review counts: Standards 0 outstanding findings; Spec 0 outstanding findings.
