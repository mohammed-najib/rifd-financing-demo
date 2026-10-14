# Validate applicant and staff screen flows

Type: prototype
Labels: wayfinder:prototype
Status: resolved
Parent: [Plan the financing application and review platform](../map.md)
Blocked by: 04, 05

## Question

What routes, screen structure, and interactions let applicants and reviewers complete every agreed journey without losing their place or misunderstanding the shared application state?

The prerequisites are [Define browser persistence and simulated failures](04-browser-state-and-simulated-failures.md#answer), including its domain and access dependencies, and [Choose the bilingual visual direction](05-bilingual-visual-direction.md#answer). Use its accepted A, Guided, visual baseline and archived comparison as the starting point for this walkthrough.

Validate the persistence contract's distinction between prepared, saved, and published attachments; independent tab sessions and newer-data notices; explicit conflict inspection and renewed confirmation; startup recovery; and reset with unfinished work. Use its full seed set and failure table rather than silently choosing different operation behavior in the prototype.

Use a rough navigable prototype or guided walkthrough to review the agreed domain, access, persistence, failure behavior, and visual direction together. Give all journeys equal emphasis:

- Compare products, create or restore a draft, move through form steps, review entries, and submit.
- Add and preview documents, respond to validation, replace a document, and recover from a failed save or upload.
- Find submitted applications, follow history and notifications, complete corrections, and print an application summary.
- Search, filter, sort, paginate, and assign the staff queue while preserving preferences.
- Inspect the application and documents, use the checklist and internal notes, request corrections, and inspect revised information.
- Approve or reject with a reason and confirmation, recover from a stale-record conflict, and view the fictional repayment overview.
- Switch language or demo role, encounter session expiry or forbidden access, and reset the demo.

Resolve navigation and deep links, save feedback, unsaved-change warnings, loading and empty states, error recovery, focus movement, accessible validation, and responsive alternatives to dense staff layouts. Include the small component gallery and printable summary in the route and layout decisions. Apply the Gregorian dates, Western display digits, Arabic-Indic input support, currency labels, and preservation of entered text agreed in [Define fictional products and application requirements](02-products-and-application-requirements.md#answer). Validate mixed-direction positioning and legibility, the fixed checklist and its recheck behavior, and the read-only repayment illustration.

The answer should link the prototype and capture the user's agreed route map and screen behaviors. If the walkthrough exposes a new domain decision, create the specific follow-up ticket instead of silently deciding it in the UI.

## Comments

### Guided walkthrough prepared on 2026-10-14

Claimed for Mohammed Najib's screen-flow review. A throwaway walkthrough carries forward the accepted Guided A identity and layout. It provides a seven-stop overview and seven detailed journey chapters, with all thirteen seed records, the twelve-record staff queue, bilingual copy, document previews, correction and decision scenes, recovery states, a component gallery, and a print view.

- [Open the Arabic short tour](http://127.0.0.1:4176/#/walk/tour/1?lang=ar) while the local preview server is running.
- [Open the standalone HTML file](/tmp/project-impress-bank-screen-flows/.scratch/financing-application-and-review/prototypes/applicant-and-staff-screen-flows/index.html).
- [Read the review guide and run instructions](/tmp/project-impress-bank-screen-flows/.scratch/financing-application-and-review/prototypes/applicant-and-staff-screen-flows/README.md).
- [Read the proposed routes and screen behavior](/tmp/project-impress-bank-screen-flows/.scratch/financing-application-and-review/prototypes/applicant-and-staff-screen-flows/screen-contract.md).

The prototype is preserved on local throwaway branch `prototype/applicant-and-staff-screen-flows`, commit `b9e4f0d63c0cfa85d8a991b4947a49b3e7014b75`. Its directory is `.scratch/financing-application-and-review/prototypes/applicant-and-staff-screen-flows`. Recreate the evidence checkout if the temporary directory is removed:

```sh
git worktree add --detach /tmp/rifd-screen-flow-evidence b9e4f0d63c0cfa85d8a991b4947a49b3e7014b75
```

The HTML is self-contained, including fonts. Guided buttons load planned states. Queue controls, field editing across language changes, modal previews, and print invocation are interactive. Persistence, files, asynchronous operations, sessions, cross-tab changes, and reset are depicted rather than implemented. The full recovery matrix remains aligned with the browser-persistence resolution. No application implementation is added to the planning branch.

JavaScript syntax checks passed. No automated tests were added or run. The browser inventory was empty and opening the in-app browser returned unavailable, so this session has not visually verified desktop/mobile rendering, keyboard behavior, or print pagination. These limits are also recorded in the prototype guide.

The user was asked to review the seven-stop tour and accept or revise the proposed flows. At that point the ticket remained claimed, with the route contract pending review.

### Flows accepted on 2026-10-14

The user replied, "I accept the proposed flows". No changes were requested. This accepts the proposed routes and screen behavior, including the five-step applicant form, separate correction workspace, staff queue and review layout, and explicit recovery steps. It does not establish that the simulated operations or rendered layouts have passed implementation verification.

## Answer

Resolved on 2026-10-14 after the user's explicit acceptance. Use the routes and screen behavior below with the accepted Guided A visual direction. The domain, product, access and persistence rules remain those of the prerequisite resolutions. The archived walkthrough is the reviewed evidence; this answer is the canonical screen-flow decision.

### Agreed route map

The application uses normal paths. The standalone walkthrough's hash links identify illustrative scenes and do not prescribe production routing mechanics.

| Route | Purpose and entry behavior |
| --- | --- |
| `/` | Neutral startup, then the current identity's home or unsigned chooser once storage, session and required resources are ready. |
| `/products` | Public comparison. Preserve the selected product through sign-in; offer a new application or an existing draft without replacing saved work silently. |
| `/sign-in` | The three applicant identities and selectable reviewer. Resume an allowed pending protected destination after sign-in. Otherwise open the identity's home. |
| `/applications` | Current applicant's applications, status and next permitted action. |
| `/applications/new?product=inventory` | New in-memory draft for a supported product. Durable progress starts with a successful save or publication. |
| `/applications/:id/edit?step=personal` | Own Draft with `personal`, `business`, `financing`, `documents` and `review` steps. Invalid step values fall back to the first step. |
| `/applications/:id` | Applicant detail, submitted information, status, documents, required next action, reasons and public history. |
| `/applications/:id/corrections/current` | Own private response, restricted to current correction targets. A completed or superseded round returns to the current permitted detail with an explanation. |
| `/applications/:id/history` | Public lifecycle events and correction rounds, including target reasons and published responses. |
| `/notifications` | Own correction-request and final-decision notifications, with independent read state and links that resolve the application's current state. |
| `/staff/applications` | Queue with validated search, status, product, assignment, sort and page query parameters. |
| `/staff/applications/:id` | Submitted information, documents, assignment, fixed checks, correction verification, internal notes and activity. Section anchors provide direct navigation within the review. |
| `/staff/applications/:id/correction-request` | Compose specific targets and individual reasons, review them, then confirm sending. Editable only by the assigned reviewer in Under review. |
| `/staff/applications/:id/decision` | Compose an applicant-visible reason, inspect prerequisites and terms, then explicitly confirm the final outcome. A deep link never restores an earlier confirmation. |
| `/applications/:id/repayment` and `/staff/applications/:id/repayment` | Accessible Approved applications only. Other states return to their permitted detail with an explanation. |
| `/applications/:id/print` and `/staff/applications/:id/print` | Applicant-visible printable summary for either role. |
| `/components` | Public component gallery. |
| `/demo/reset` | Confirmed browser-wide reset, also reachable unsigned and during startup recovery. |
| Unavailable route result | One neutral result for missing or forbidden records, without record details, offering the current identity's home or an explicit identity switch. |

Keep editable field values, reasons, notes and file content out of URLs. References, step, queue parameters and section anchors can appear there. Recheck current access and application state on every protected entry and refresh. Intentional identity switching opens the new identity's home after resolving unfinished work.

### Applicant forms, documents and corrections

- Use the Guided A header and horizontal five-step navigation. Wide screens place the financing summary beside the form; narrow screens stack it after the form. Steps remain reachable with incomplete fields. Moving steps or changing language preserves input without saving it.
- Show Unsaved changes, Saving, last successful save time and Save failed separately. Save progress accepts incomplete or invalid raw input. A save captures input at its start; later typing remains unsaved and is never overwritten by that save's response.
- Product switching in Draft confirms the incompatible fourth-slot document's removal. Keep common fields and documents, retain invalid amount/term values for correction, and commit staged removal with the next successful save or submission. Product choice is fixed after submission.
- Submission validates all sections and required files. Focus a linked error summary; each link opens the relevant step and focuses its field or document control. Successful submission opens detail with a reference, immediate confirmation and history event, without a notification-list item.
- Name each document requirement and show filename, type, size, preview and replacement. Applicant copy distinguishes Preparing, Ready to save, Saved in draft or correction workspace, and Included in submitted information. Staff assessment statuses remain hidden from applicants.
- Preparation and save failures retain the selection or ready file for explicit recovery. A failed replacement preserves the previously saved file. Saving waits for active preparation; other progress can be saved around a failed selection under the persistence contract, but Save and leave requires completing or explicitly discarding unfinished selections. Preview failure does not remove a file.
- Previews use a focused modal, nearly full-screen on mobile, with a visible document label and Close control. Large content scrolls inside it. Support Escape and return focus to the opener; the implementation manages disposable preview URLs under the persistence contract.
- Applicant detail groups current action, submitted information, documents and public history. Notifications announce correction requests and final decisions only. Reading a notification changes no application state.
- The correction workspace shows each target and reason, its fixed baseline/date, response progress and a review summary. Unrequested information is read-only. Partial saves remain private. Formatting-only field changes and identical-content files cannot fulfill targets.
- Resubmission publishes the complete response atomically and returns directly to Under review with assignment preserved. Show immediate confirmation and history; verification remains pending. Preserve earlier rounds without adding the excluded general side-by-side version comparison.

### Staff queue, review and decisions

Use a labelled sidebar, counts and a readable table on wide screens. Narrow screens use application cards with the same reference, applicant, business, product, amount, status, assignee, submission date and Open action. Compact staff navigation wraps above the content.

Search matches reference, applicant and business. Filters are status, product and assignment. Sort choices are submission date newest/oldest and amount highest/lowest, with a stable application-reference tie-breaker. Use five rows per page. Search/filter changes start at page one; clamp pages invalidated by filtering or committed changes. A fresh entry restores saved filters and sort, clears search and starts at page one. Explicit valid URL parameters take precedence. Back to queue restores its previous query and page. Empty results retain controls and offer Clear search and Reset filters; announce counts without moving focus.

Show Unassigned, Assigned to you or the colleague's name in the row and workspace header. Claiming and starting review are separate actions. Confirm transfers by naming both reviewers; unassign only in Submitted. Preserve completed review work and lock final assignment.

Wide review screens place information and documents beside checks and notes. Narrow screens stack these sections and provide links to information, documents, checks and activity. Keep primary actions reachable without horizontal scrolling or an action bar covering errors or content.

Document assessment, the five fixed checks and correction verification remain separate. Mark revised fields and replaced files against the current round's baseline, explain affected checks, and preserve unaffected results. In Huda's amount-and-plan response, four checks reset while Operating history remains Passed. The reviewer verifies the amount separately and verifies the document target by accepting its replacement.

While Corrections requested, permit reading and authorized notes only. Notes have an independent explicit save and never appear to applicants or in print. The correction composer reviews targets and individual reasons before send confirmation. Further rounds capture a new baseline and retain earlier rounds.

The decision screen names applicant, reference, product, amount, term, prerequisites and the applicant-visible reason. Explain unmet prerequisites beside unavailable actions. Confirmation accepts the current submitted terms and chosen final outcome. Expiry, stale data and reassignment invalidate prior confirmation. Final records lock data and review outcomes while retaining authorized internal notes.

Repayment is a separate read-only illustration showing financing amount, markup, total, completed/remaining amounts and dated entries. Preserve the agreed historical and newly approved schedules. No payment or mark-completed control is included.

### Recovery and navigation

Use the complete [browser persistence and failure contract](04-browser-state-and-simulated-failures.md#answer), including its thirteen-record seed set, independent tab sessions, operation timing and one-shot failure rules. The walkthrough does not substitute alternate operation semantics. The accepted screen presentations are:

| Interruption | User-facing behavior |
| --- | --- |
| In-app departure, sign-out or identity switch | Applicant work offers Save and leave, Discard changes and Stay. Navigate only after a successful save. Authorized unfinished notes may offer Save note and leave. Unsent correction requests and decisions offer Discard and Stay. Wait for pending operations before switching. Browser departure warnings remain best effort. |
| Validation, preparation, save or publication failure | Keep input and eligible prepared files. Show persistent field/slot or action feedback and explicit recovery. Never imply a completed transition or erase the previous saved file. |
| Stale shared record | Refuse the write, require Load latest, retain unapplied text and invalidate confirmation. No force-save or automatic retry. |
| Simulated colleague reassignment | Load latest shows Khaled and the transfer, then read-only review controls. Require confirmed reclaiming, inspection of current information and a new permitted action with renewed final confirmation. |
| Stale private workspace or preferences | Keep the desired values separately, show the latest saved state, and require explicit use of latest or reapplication after inspection. No automatic merge or overwrite. |
| Relevant change in another tab | Update clean views. Preserve dirty buffers with a newer-data notice while refreshing permissions and assignment. Private correction saves do not stale the reviewer's submitted snapshot. Identity changes in another tab do not change this tab's session. |
| Session expiry | Cover protected content and previews. Retain current-tab input privately; same-identity sign-in checks access/state before restoring it. Another identity requires explicit discard. Earlier committed work stays saved; uncommitted actions and earlier confirmations do not replay. |
| Uncertain completion or missed post-commit notice | Inspect current state and receipt before asserting success/failure or offering a retry. Never repeat a committed mutation to repair notification delivery. |
| Preview failure | Preserve the file and offer retry plus permitted open/download alternatives. |
| Startup failure, blocked upgrade, damaged or unsupported data | Preserve existing data; offer retry, blocking-tab coordination and confirmed recovery/reset. No silent reseed or memory-only save. Public products/gallery remain available when their assets are available. |
| Offline after readiness | Local data and prepared samples continue working. Do not imply a server queue or treat offline status itself as a failed local save. |
| Reset | Warn that all demo applications, files, preferences, sessions and unfinished work across tabs will be replaced. Require explicit confirmation for the observed dataset. Failure keeps the prior dataset and valid buffers. Success restores seeds/defaults and clears old contexts only after the new dataset is confirmed. Changed reset context requires inspection and fresh confirmation. |

### Language, focus, loading and print

Arabic is initial, with explicit English switching. Retain Guided A typography, colors and grouping. Use logical start/end positioning and isolate identifiers, filenames, phones, amounts and fractions. Display Western digits and Gregorian dates with translated month/currency labels. Accept Arabic-Indic numeric and phone input; preserve entered names, explanations and invalid raw input when switching language.

Route navigation focuses the new heading; step navigation focuses the section heading. Validation focuses its linked summary. Dialogs contain keyboard focus, close with Escape where safe and return focus to the opener. Language changes preserve the active control and caret where possible. Save feedback uses a polite live region without moving focus. Errors remain visible near the relevant action until addressed.

Use neutral route-loading placeholders without stale protected content. Keep relevant input visible while actions are pending, mark busy state and prevent duplicate commits. Read failures offer retry and safe navigation. Empty applicant lists offer a new application; empty notifications explain what appears there; empty queue results preserve their filters. The public gallery demonstrates these components, written status labels, focus, errors and mixed-direction content.

Printing uses a dedicated route and print stylesheet. Include fictional identification, reference, status, applicant/business details, financing terms, document presence/labels, public reasons and history. Hide navigation, controls and every staff-only field. Drafts print their last saved progress with a Draft label. During corrections, print the last submitted information and exclude private unfinished corrections. Apply the same content policy for either role. Keep headings with their content and avoid splitting short metadata blocks where possible.

### Evidence and remaining work

The reviewed prototype is archived at `b9e4f0d63c0cfa85d8a991b4947a49b3e7014b75` on `prototype/applicant-and-staff-screen-flows`. The [standalone walkthrough](/tmp/project-impress-bank-screen-flows/.scratch/financing-application-and-review/prototypes/applicant-and-staff-screen-flows/index.html), [guide](/tmp/project-impress-bank-screen-flows/.scratch/financing-application-and-review/prototypes/applicant-and-staff-screen-flows/README.md) and [reviewed proposal](/tmp/project-impress-bank-screen-flows/.scratch/financing-application-and-review/prototypes/applicant-and-staff-screen-flows/screen-contract.md) are available in the temporary evidence worktree. The earlier comment records how to recreate it from the immutable commit. Preserve this code as throwaway evidence and do not merge it into the application.

Archive commit `498d045c1158413560865520ce7f1f6b68473a74` records the user's acceptance in the guide and proposal, with a pointer back to this resolution. It changes documentation only; the reviewed prototype code remains unchanged.

The user's acceptance establishes the design decision. Syntax checks passed during preparation, but actual storage, file bytes, authorization, timers and multi-tab behavior were simulated. Browser control was unavailable, so rendered responsive layouts, mixed-direction legibility, keyboard behavior and print pagination were not visually verified in that session. These remain implementation acceptance checks, not claims established by the prototype.

[Define acceptance evidence and the implementation handoff](07-acceptance-and-implementation-handoff.md) is now unblocked. It owns the concrete verification plan, requirement-to-evidence matrix, implementation order and final three-to-five-minute delivery demonstration. The prototype's seven-stop tour is evidence for this screen discussion, not proof of the eventual demo's duration or completeness.

No new domain ambiguity or glossary term arose from the accepted flows, so no follow-up domain ticket is needed. The prototype exploration surfaced no additional decision to keep in the map's fog. The map remains open for the existing acceptance and handoff decision; this session resolves only the screen-flow ticket.
