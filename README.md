# RIFD / رِفد

A fictional, Arabic-first financing demo that saves records and evidence in the browser. The first sixteen slices provide the complete seeded dataset, product comparison, [five-step saveable drafts](.scratch/financing-application-and-review-implementation/issues/03-compare-products-and-complete-drafts.md), session recovery, tab synchronization, conflict recovery, [submission with public history](.scratch/financing-application-and-review-implementation/issues/06-submit-and-track-applications.md), notifications, printing, a searchable staff queue, reviewer assignment, the staff review workspace, targeted correction requests and private correction responses in Arabic and English.

Mariam, Huda and Omar can read their own applications. Salma can read all submitted applications, including colleague assignments. Khaled is a simulated colleague and cannot sign in. Applicants can create drafts, edit all personal, business and financing fields, switch products, prepare four supporting documents, review completeness and submit. Submission opens read-only detail with a reference, immediate confirmation and public history. Authorized viewers can preview saved evidence. Applicants can read persistent notifications and follow links to the current application state. Both roles can print the same public summary. Staff can search, filter, sort and page through the queue, claim unassigned submissions, confirm reviewer transfers and start review explicitly. Assigned reviewers can assess evidence, record the five fixed checks and explicitly save internal notes. Assigned reviewers can request specific field and document corrections with individual reasons, inspect the request and confirm sending. Applicants can edit requested targets and save incomplete responses privately. Applicants can resubmit complete corrections; reviewers verify targets and repeat correction rounds. Final approval or rejection requires an applicant-visible reason and fresh confirmation. Approval freezes the submitted terms and repayment data atomically. Approved applications open a read-only repayment overview with stored installment dates, progress totals and the next Upcoming entry.

Startup validates saved records, file references, file hashes and the required
offline sample catalog before showing Ready. Storage and resource failures keep
existing data and offer explicit Retry. Recovery and public products work in
either language. Close other demo tabs when an upgrade is blocked, allow browser
storage when access is denied, then retry. After readiness, saved file previews,
draft saves, prepared replacements and the loaded product and review routes work
without a connection. There is no server queue. A fresh offline launch is outside
this contract. See [startup and offline evidence](docs/implementation/17-evidence.md).

## Run

Use Node 22.12 or newer and pnpm 11.24.0. This slice was checked with Node 26.7.0 on Linux. The manifest pins React 19.3.1, TypeScript 5.9.3, TanStack Start 1.169.2, Router 1.170.44 and Tailwind CSS 4.3.3. The lockfile pins transitive packages.

```sh
npm install --global pnpm@11.24.0
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` uses Vite's development server. To inspect production files:

```sh
pnpm build
pnpm preview
```

Open <http://127.0.0.1:4173>. The preview serves `dist/client` and rewrites missing paths to its generated `/_shell.html`. It runs a static Node file server. The generated `dist/server` is used by Start during prerendering and is not part of the Hosting directory. The build itself needs permission to open a temporary local prerender server.

The chooser starts in Arabic. Choose English explicitly to persist it independently of the tab's identity. Sign-in is passwordless and fictional. Sessions last fifteen minutes of inactivity and survive refresh while valid. Other tabs share committed data and language, with independent identities.

A duplicated tab or one opened from another demo tab may inherit its initial identity. Its subsequent activity, identity changes, sign-out and expiry stay independent. The current identity remains visible in the header.

On an Under review application assigned to Salma, Simulate reassignment to Khaled commits an identified internal transfer while holding that screen stale. The next staff write is refused. Load latest reveals Khaled and retains unapplied text as read-only. Confirm reclaim, inspect the current record and choose a new action. A final decision requires a new confirmation. Other tabs receive the transfer normally.

The public [component gallery](http://127.0.0.1:4173/components) uses the same
fields, application statuses, attachment feedback, save feedback, queue rows and
departure dialog as the journeys. It works unsigned and during startup recovery.
Switch languages, correct the example amount, inspect file and save states, or
use the dialog by keyboard. Gallery edits affect only its fictional examples.
See [gallery verification](docs/implementation/19-evidence.md) for shared component
usage, browser checks and captures.

## Styling

Tailwind CSS 4.3.3 compiles through `@tailwindcss/vite` in both the application and the separate browser API harness. The root route links the compiled `src/ui/styles.css` through its existing `?url` import. No Tailwind browser runtime or CDN is used. Tailwind's [browser requirements](https://tailwindcss.com/docs/upgrade-guide#browser-requirements) are Chrome 111+, Firefox 128+ and Safari 16.4+; the documented current Chrome/Firefox targets remain the acceptance scope.

`src/ui/styles.css` defines the Guided A colors and local Noto font stacks with `@theme`. Its spacing unit is 4px, preserving pixel dimensions with the existing 15px root font size. Use named colors and logical spacing such as `ms-*`, `me-*` and `ps-*` for both directions. Preserve exact nonstandard sizes with arbitrary values instead of substituting the default type or spacing scale.

The `compact:` variant applies through 1199px and `narrow:` through 767px, inclusive. Declare compact before narrow so narrow overrides apply where both match. Default breakpoint variants are disabled. JSX utilities own individual layouts; shared skins and descendant rules use `@apply` in the components layer, which utilities can override.

Preflight is omitted to preserve existing headings, lists and native controls. Base styles, keyboard focus and dialog backdrops remain explicit. Include `border-solid` with border utilities; for a border on one edge, also include `border-0` before that edge utility to clear browser-default widths on other edges.

Source detection is limited to `src` by the utilities import's `source('../')`. Keep complete utility names in source, including finite status-class maps. Add an explicit source only when production UI lives outside this directory. Follow Tailwind's [class detection guidance](https://tailwindcss.com/docs/detecting-classes-in-source-files) for variants. Keep any necessary complex CSS in the existing layers and avoid an additional reset.

See [migration verification](docs/implementation/tailwind-v4.md) for the baseline, visual comparison and checks. Later feature and acceptance tickets extend those checks; their statuses remain unchanged.

## Check

The pure helpers also ship as the `@rifd/domain` workspace package with versioned
Agent Skills. See [the package](packages/rifd-domain/README.md) for usage and
[the maintainer workflow](docs/implementation/agent-skills.md) for source review,
CI checks and `pnpm pack:domain`.

```sh
pnpm typecheck
pnpm lint
pnpm test                       # Pure domain
pnpm test:browser:api           # Public demo interface with actual IndexedDB in Chrome
pnpm build
pnpm test:browser               # Production static screens, Chrome / Firefox / WebKit
```

Install ordinary Google Chrome and the pinned Playwright Firefox and WebKit binaries. On a Playwright-supported Linux distribution:

```sh
pnpm exec playwright install --with-deps firefox webkit
```

Chrome tests use the installed `chrome` channel. Firefox and WebKit use Playwright's patched binaries. Responsive checks emulate CSS viewports, not physical devices. Read [slice 01 evidence](docs/implementation/01-evidence.md) for the actual tested versions and host arrangement.

The API harness runs only on a separate Vite test server at `/tests/browser/api.html`. It imports the same public module as the screens. It does not ship in the static build. API and screen reports use separate artifact directories so independent runs cannot erase each other's traces. Failures retain traces and screenshots under `test-results/`; the screen HTML report is under `playwright-report/`.

Install Firebase CLI 15.30.0 to reproduce the Hosting checks:

```sh
npm install --global firebase-tools@15.30.0
pnpm build
RIFD_HOSTING=1 pnpm test:browser
```

The emulator uses the local `demo-rifd` project identifier and the committed `firebase.json`. It serves only `dist/client`, preserves actual assets before the fallback, and runs without a Start runtime server. `pnpm emulators` starts it for manual inspection. No Firebase project has been provisioned or deployed. The SPA setup follows [Start's SPA guide](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode); the inspected output determines the [Hosting fallback](https://firebase.google.com/docs/hosting/full-config).

## Explore

| Path | Current behavior |
| --- | --- |
| `/`, `/sign-in` | Neutral startup followed by identity home or chooser |
| `/products` | Public fictional product comparison |
| `/components` | Public bilingual production component gallery |
| `/applications` | Current applicant's saved applications |
| `/applications/new?product=equipment` | Explicit new-or-resume choice, then a new unsaved Equipment draft |
| `/applications/RIFD-2026-001/edit?step=personal` | Mariam's five-step saved incomplete draft |
| `/applications/RIFD-2026-004/corrections/current` | Huda's target-only private response editor beside the unchanged submitted information |
| `/notifications` | Own correction and decision notices with independent saved read flags |
| `/applications/RIFD-2026-001/print` | Saved Draft progress in an applicant-visible print layout |
| `/staff/applications/RIFD-2026-005/print` | The same public print policy for staff, with no internal review data |
| `/staff/applications` | Salma's twelve-record queue with search, filters, four sorts and five-row pages |
| `/staff/applications/RIFD-2026-007/decision` | Current terms, unmet decision prerequisites, applicant-visible reason and fresh final confirmation |
| `/staff/applications/RIFD-2026-007/correction-request` | Salma's targeted correction composer with explicit inspection and confirmation |
| `/applications/RIFD-2026-007/history` | Current applicant-visible information, correction targets, reasons and history |
| `/applications/RIFD-2026-005/repayment` | Mariam's frozen historical illustration with two Completed and sixteen Upcoming installments |
| `/staff/applications/RIFD-2026-005/repayment` | The same illustration for submitted staff access; other states return to permitted detail |
| `/staff/applications/RIFD-2026-005` | Historical approval, internal review and frozen repayment data |
| Other paths or unauthorized records | Neutral unavailable result with safe navigation |

An unsigned supported protected link resumes after sign-in only if the chosen identity can read it. Other choices open the selected identity's home. A forbidden destination exposes no application details. Intentional identity switching opens the new identity's home. Applicant documents display saved presence. Staff document assessments, checks, verification context, notes and activity appear in distinct sections.

The staff workspace places submitted information and document previews beside the five review checks and internal notes on wide screens. Compact screens stack them with keyboard section links. In Under review, the assigned reviewer can accept the current file or mark it Needs replacement with a reason. This preserves the file and application status. Evidence consistency requires four Accepted documents and an explicit confirmation of their contents. Numerical checks prohibit unsupported Passed outcomes, using the initial submission month and whole-rial arithmetic including the final installment remainder. Changed assessments clear the prior evidence-consistency result.

Notes save independently for the assigned reviewer in Under review, Corrections requested, Approved and Rejected. They never enter applicant reads, notifications or print. Unfinished notes offer Save note and leave where authorized. Expiry hides protected content and retains text privately for the same identity; refresh discards unsaved text. Newer shared revisions require Inspect latest review, and an uncertain action requires Inspect review outcome before retry. Colleague records remain readable. See [review evidence](docs/implementation/10-evidence.md).

Request corrections opens a separate composer for assigned Under review applications. Select only the fields or document slots needing change and explain each one. Inspect correction request shows the exact targets and reasons before Confirm and send request. Sending captures a fixed baseline and private applicant workspace, changes status to Corrections requested and adds one history event and one notification. Staff assessments, checks and further requests pause until resubmission; authorized notes remain available. Unsent requests offer Stay or Discard changes on departure. Storage errors retain the composer; inspect the outcome before confirming again. Expiry clears confirmation and retains unsent text privately for the same reviewer. See [correction request evidence](docs/implementation/11-evidence.md).

Record final decision opens the decision screen from Under review. Approval requires four Accepted documents, five Passed checks and verification of every current correction target. Rejection requires a failed substantive check; missing or unsuitable evidence alone calls for corrections. Both outcomes require a reason and confirmation naming the reviewer, applicant, reference and submitted terms. Expiry and shared changes invalidate confirmation while retaining unsent text for explicit inspection. A successful decision saves final history, one notification and a receipt together. Approval also freezes amount, term, product rule version, markup, total and all Upcoming installments. Final fields, files, checks and assignment stay locked; authorized viewing, printing and assigned internal notes remain available. See [decision evidence](docs/implementation/14-evidence.md).

View repayment overview opens the dedicated Approved route for the owning applicant or staff. Financing amount, markup and total stay separate. Completed and remaining amounts sum the stored row statuses; the next installment is the first stored Upcoming row. Browser dates and current product rules never regenerate the snapshot or complete entries. Historical Equipment retains eighteen 72,000 YER rows, 144,000 completed and 1,152,000 remaining, with 15 October 2026 next. New approvals remain entirely Upcoming. Non-approved links return to permitted detail with an explanation. See [repayment evidence](docs/implementation/15-evidence.md).

The staff queue searches reference, applicant and business, including Arabic-Indic reference digits. Filter by status, product and assignment; sort by submission date or amount in either direction. Ties always follow ascending references. Counts describe the complete permitted queue, while the result count describes the current search and filters. Desktop tables and compact cards show the same five records per page.

Changing a filter or sort saves those preferences with a versioned operation. Fresh queue visits restore them with empty search and page one. Valid explicit URL values override the saved choice, and Back to queue preserves the previous query and page, including after refreshing detail. Search and filter changes reset the page; invalid pages clamp to the available results. Empty results retain Clear search and Reset filters. A refused preference write preserves the intended filters and requires Inspect saved queue preferences before Reapply my choice or Use latest preferences. See [queue evidence](docs/implementation/08-evidence.md).

Open Notifications to mark a notice read or open its current permitted destination. Active correction requests open `/applications/:id/corrections/current`, with the target-only private response editor, fixed baseline, reasons, progress and review summary. Completed requests resolve to current detail. Reading changes only that notice's read flag and revision. An uncertain write requires inspection before retry.

The current correction workspace permits only the requested fields and document slots. Product and other information stay read-only. Save progress accepts incomplete or invalid input and commits ready replacements privately. Staff and print continue showing the submitted snapshot. Assignment and internal-note changes do not block a current private save. Another applicant tab's private save preserves dirty input and requires Inspect latest correction workspace, then Reapply my edits. Preparation, failed saving, departure and session recovery use the same retained-work rules as drafts. Obsolete round links return to current permitted detail with an explanation. See [private correction evidence](docs/implementation/12-evidence.md).

Resubmit corrections validates every requested change against the fixed baseline and publishes the complete response and ready evidence together. It returns directly to Under review with the current assignee and financial window preserved. Formatting-only changes and renamed identical files do not complete a target. Changed files become Awaiting review; only dependent checks reset. Staff see changed-target labels and verify fields separately from accepting requested documents. A later request creates a new baseline and workspace, preserving prior requests, responses and assessments. See [resubmission evidence](docs/implementation/13-evidence.md).

Print summary opens a dedicated route and invokes the browser print dialog. Saved drafts print their last saved progress; corrections print the last submitted information. Both roles receive the same public fields, document presence, correction reasons and history. Staff identities, assignment, assessments, checks, notes, private response work and controls are excluded. See [notification and print evidence](docs/implementation/07-evidence.md).

Choose a product, sign in as an applicant and explicitly start a new application or resume a saved draft. The steps are Personal, Business, Financing, Documents and Review; incomplete steps remain reachable and invalid step queries fall back to Personal. Enter even incomplete or invalid values, then select prepared samples or local fictional PDF, JPEG or PNG files for the four requirements. New applications and a switched product's fourth slot generate fictional samples from the current input. Other sample choices retain the canonical seed evidence.

Review checks format and document completeness separately from substantive review criteria. Switching products confirms removal of a supplied fourth document, stages removal until saving, and preserves shared information and invalid amount/term values.

On Review, Submit application validates the complete current form and all four documents. Pending or failed selections require retry or explicit discard, even when an older file is saved. Successful submission publishes the form and files together, opens read-only detail, and adds one history entry with no notification. It freezes the demo submission date and financial evidence months. Own applications shows each record's status and permitted next action. Submission failures retain input and ready files for explicit retry.

Preparation reports progress and Ready to save. Save progress commits the captured raw input and ready bytes together. Refresh restores saved input and actual evidence; it discards unfinished edits and unsaved selections. Saved file previews include open/download alternatives. A failed replacement preserves the old saved file.

The draft's Demo controls panel sets normal or slow timing and one next-upload, next-save, next-submission or next-application-storage-write failure. Controls belong to the current tab and reset on refresh. Retry failed preparation without reselecting, or retry failed saving/submission without preparing again. An uncertain result requires Inspect save outcome or Inspect submission outcome before retry. Another tab's conflicting save requires inspection and explicit reapplication. In-app departure offers Stay, Discard changes or Save and leave; pending work must finish and failed selections must be completed or discarded before saving and leaving.

Committed notices and tab activation refresh clean screens from authorized storage. A newer saved draft preserves dirty raw input and prepared files, disables saving, and offers Inspect latest draft followed by Reapply my edits. A competing language save retains the intended language and requires Inspect latest saved preference before Reapply my preference. Each reapplication captures the inspected revision and uses a new intent; a further competing save requires inspection again. Discard my choice dismisses a refused language change. Missed notices are recovered on activation, and a failed notice cannot duplicate or misreport a committed save.

The header's Expire session control interrupts the current session immediately. Fifteen minutes without pointer or keyboard interaction does the same; mouse movement, completed requests and other tabs' activity do not renew it. Protected screens and previews close, and the tab retains unfinished input privately. Choose the same identity to inspect current access and return to the previous permitted screen, including after visiting public products. If editing has ended, recovery opens the current read-only record without applying the retained input. Choose another identity only after explicitly discarding unfinished work. Recovery never saves or retries an action automatically. A save interrupted before its outcome was observed requires Inspect save outcome; a save that committed before expiry remains saved. Refresh still removes unsaved tab-memory work.

## Data and architecture

See [architecture and seed contract](docs/implementation/architecture.md) and [submission evidence](docs/implementation/06-evidence.md). Browser startup creates all thirteen canonical applications, identities, histories, correction baselines and unchanged private workspaces, notifications, files, sample variants, frozen repayment and Arabic preferences in one IndexedDB transaction. It validates existing schema, shapes, references and SHA-256 bytes before readiness. Missing or damaged data offers retry and stays preserved.

Reset demo is available from the header, the unsigned `/demo/reset` route and startup recovery. Its bilingual confirmation names the browser-wide replacement. Cancel and failure retain unfinished work. A successful reset restores all thirteen canonical applications and unread notifications, Arabic and default queue preferences, then clears old tab sessions, files, previews and unfinished work. Exact retry recognizes the committed reset receipt; changed contexts require fresh inspection and confirmation. Schema rebuilding uses one rollback-capable upgrade transaction. See [reset evidence](docs/implementation/18-evidence.md).

A new browser profile or isolated Playwright context starts a fresh demo. For development, clearing this origin's site data in browser settings removes its saved dataset and sessions; the next startup seeds it again. The domain date is fixed at 2026-10-14. Session timing uses elapsed real time.

Local Noto Sans and Noto Sans Arabic fonts come from the archived Guided A evidence. The matching [Noto Sans OFL](public/fonts/OFL-NotoSans.txt) and [Noto Sans Arabic OFL](public/fonts/OFL-NotoSansArabic.txt) licenses accompany the unchanged font bytes. The prototype's [original license bundle](public/fonts/LICENSE.txt) is also preserved. Seed documents visibly identify their contents as DEMO / تجريبي. These are invented people, evidence, terms and outcomes. No application reaches a bank and no payment is processed.
