# Notifications and public print summaries

Implementation of [ticket 07](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review-implementation/issues/07-notifications-and-print-summaries.md), checked on 2026-10-15. The domain date remains 2026-10-14.

## Delivered behavior

The applicant header opens `/notifications`. The list reads the five canonical seeded correction and final-decision notices through the public demo interface. Mark as read persists one owner's flag and notification revision, independently of application, workspace, preference and lifecycle state. Opening an unread notice saves its flag before navigation. Old notice links and receipt replays resolve current access and application state. Active requests open `/applications/:id/corrections/current`; completed requests open current detail. Until ticket 12, the active route shows the submitted baseline and requested changes. The response editor remains in that ticket.

`markNotificationRead` commits its flag and receipt together, checks ownership, captured session, dataset and expected notification revision, and uses the existing actor-scoped operation identifier namespace. Exact retries do not repeat effects. Changed intent or a reused language/application operation identifier is refused. Already-read notices retain their revision. Uncertain completion requires explicit state/receipt inspection before retry. Safe identifier/revision hints refresh other tabs; failed observers or broadcasts cannot change a committed result. Application storage-failure controls remain armed because notification reads do not consume them.

`readPrintSummary` provides one explicit applicant-visible projection for either permitted role. Saved Drafts print last saved raw progress and the saved date. Corrections print the last submitted fields and document presence, public target reasons and history. Final records include their decision reason and public history. The result excludes private response work, staff identities, assignment, assessments, verification, checks, notes and internal activity. Staff cannot read or print applicant Drafts. Unsaved new drafts have no printable saved record.

Dedicated applicant and staff print routes share information, correction and history renderers with detail. The Print summary button invokes the browser print dialog. Production layered CSS preserves the local Arabic and English fonts, hides navigation, controls and previews, uses A4 margins, keeps headings with content and avoids breaking short metadata blocks. Forbidden entry stays neutral; expiry removes protected summaries and notices immediately. Draft departure guards still resolve unsaved changes before opening print.

## Verification

The user confirmed both testing boundaries: the public demo interface with actual IndexedDB and production browser screens. Focused red/green checks cover the initial read operation, notification screens and printing after an actual saved draft. The latter exposed and fixed an ISO save-timestamp formatting crash. Later-state notification resolution and private saved correction isolation use explicit storage fixtures because tickets 12 to 14 own those mutations; assertions use the public interface.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:skills
pnpm skills:check
pnpm test:browser:api --workers=3
pnpm build
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser --workers=4
```

All 84 domain tests, 47 public-interface tests and both package-skill test files pass. Typecheck, lint and packaged guidance validation pass. The full production screen run passed 195 of 198 cases. Its three failures were the same new forbidden-entry test, which reloaded before the asynchronous language change completed and then expected English copy from an Arabic page. The test now waits for the completed language switch. The corrected case passed in Chrome, Firefox and WebKit in a focused run using the same static server and separate output. No production code changed after the full run began. Together these runs verify all 329 cases: 84 domain, 47 public-interface and 198 production screens. The static build passes with the existing large-chunk warning. The host used Node 26.7.0, pnpm 11.24.0 and Playwright 1.64.1. The temporary WebKit launcher uses the compatible libraries described in [slice 01 evidence](01-evidence.md). These runs use the production static server rather than Firebase Hosting; earlier Hosting evidence remains separate. An initial screen process ended with SIGTERM and left its static server running. Only that identified leftover server was stopped before restarting the full run. The full HTML report is retained locally in `test-results/07-full-report`; the successful focused report is in `test-results/07-focused-report`.

Reproduce the focused case with the same WebKit environment and `pnpm test:browser tests/browser/print.screens.spec.ts --grep='forbidden applicant print entry' --workers=3`. The recorded focused run used a temporary config to reuse the already running server and preserve both reports.

API coverage includes read persistence, independent revisions, owner/staff/unsigned refusal, exact replay after refresh, stale revisions, identifier collisions, changed-state link resolution, expiry before and after staging a write, rollback, uncertain completion inspection, failed post-commit observers, public print equality for both roles, private correction exclusion, final public reasons and saved versus unsaved Drafts.

Screen coverage includes Arabic/English read/open/refresh flows, keyboard activation and route focus, cross-tab read flags, identity changes, expiry, outcome inspection, direct-entry guards, preview closure, last saved Draft content, four responsive widths and print-media exclusion of controls. Browser-generated PDF captures supplement screen checks with actual pagination.

## Print evidence

Chrome printed each canonical sample to an A4 PDF with browser headers/footers disabled. Poppler renders of every page were visually inspected for readable mixed-direction text, wrapping, metadata blocks, public reasons/history and exclusion of private content. Each PDF has two pages. The committed evidence includes PDFs, 120-DPI page PNGs and a [font/page/hash report](evidence/07/print-verification.json). All eight final files embed only Noto Sans Arabic and Noto Sans.

| Sample | Arabic | English |
| --- | --- | --- |
| Saved Draft | [PDF](evidence/07/draft-ar.pdf), [page 1](evidence/07/draft-ar-1.png), [page 2](evidence/07/draft-ar-2.png) | [PDF](evidence/07/draft-en.pdf), [page 1](evidence/07/draft-en-1.png), [page 2](evidence/07/draft-en-2.png) |
| Correction baseline | [PDF](evidence/07/correction-ar.pdf), [page 1](evidence/07/correction-ar-1.png), [page 2](evidence/07/correction-ar-2.png) | [PDF](evidence/07/correction-en.pdf), [page 1](evidence/07/correction-en-1.png), [page 2](evidence/07/correction-en-2.png) |
| Final approval | [PDF](evidence/07/approved-ar.pdf), [page 1](evidence/07/approved-ar-1.png), [page 2](evidence/07/approved-ar-2.png) | [PDF](evidence/07/approved-en.pdf), [page 1](evidence/07/approved-en-1.png), [page 2](evidence/07/approved-en-2.png) |
| Final rejection | [PDF](evidence/07/rejected-ar.pdf), [page 1](evidence/07/rejected-ar-1.png), [page 2](evidence/07/rejected-ar-2.png) | [PDF](evidence/07/rejected-en.pdf), [page 1](evidence/07/rejected-en-1.png), [page 2](evidence/07/rejected-en-2.png) |

These checks do not establish physical printer, physical device or screen-reader acceptance. The final accessibility and print acceptance ticket retains that broader scope.

## Standards

No outstanding findings. The separate Standards review found one P3 issue: print CSS repeated the ink color value. It now uses the shared `--color-ink` token. The reviewer verified the fix.

## Spec

No outstanding findings. The separate Spec review found one P3 issue: the reference/status paragraph applied the Latin font to Arabic status text, introducing an unbundled fallback. Only the reference now uses the Latin font; status inherits Noto Sans Arabic. The reviewer verified the fix, and final PDFs are checked for bundled fonts.

Both axes reviewed the implementation against starting commit `ba8d1cb8aeaa7986d7c5b3943e19abf13f89032f`. The staged precommit diff included new files. Review totals: Standards 0 outstanding; Spec 0 outstanding.
