# Reviewed routes and screen behavior proposal

Prepared and accepted on 2026-10-14. This file preserves the proposal the user accepted with "I accept the proposed flows". The canonical agreement is recorded in [Validate applicant and staff screen flows](/home/mdnb/Dev/Projects/project_impress_bank/.scratch/financing-application-and-review/issues/06-applicant-and-staff-screen-flows.md#answer). The wording below is retained as reviewed evidence.

## Route map

The eventual application uses normal paths. The standalone prototype uses hash links to its guided scenes, so a file opened from disk remains shareable.

| Route | Screen and entry behavior |
| --- | --- |
| `/` | Neutral startup. When ready, open the current identity's home or the unsigned chooser. Never flash protected information. |
| `/products` | Public product comparison. Preserve the selected product through sign-in; offer starting a new application and resuming an existing draft without silently replacing it. |
| `/sign-in` | Three applicant identities and Salma, the reviewer. No passwords or interactive Khaled identity. Resume an allowed pending protected destination after sign-in. |
| `/applications` | Current applicant's applications, with status, product, amount, reference, last submitted date where applicable, and the next permitted action. |
| `/applications/new?product=inventory` | Prepare a new in-memory draft. First successful save creates durable progress. Accept only supported product parameters. |
| `/applications/:id/edit?step=personal` | Applicant's Draft, with `personal`, `business`, `financing`, `documents`, and `review` steps. Invalid steps fall back to the first step. |
| `/applications/:id` | Status, submitted information, current action, documents, public history, and applicant-visible reasons. Final states are read-only. |
| `/applications/:id/corrections/current` | Private correction workspace, limited to current targets. A completed or superseded round directs to the current permitted application view with an explanation. |
| `/applications/:id/history` | Public lifecycle events and correction rounds, with target reasons and published responses. No staff identities or internal activity. |
| `/notifications` | Own correction and final-decision notifications. Separate read state and links to the relevant current application. Historical links resolve current state without reopening a completed action. |
| `/staff/applications` | Queue, with validated query parameters for search, status, product, assignment, sort and page. |
| `/staff/applications/:id` | Submitted information and documents, current assignment, fixed checks, correction verification, notes and activity. Section anchors navigate within the page. |
| `/staff/applications/:id/correction-request` | Compose targets and individual reasons, review them, then explicitly confirm sending. Only the assigned reviewer in Under review can enter this editable screen. |
| `/staff/applications/:id/decision` | Applicant-visible reason, prerequisites and terms, followed by an explicit final confirmation. Loading a link never restores a previous confirmation. |
| `/applications/:id/repayment` and `/staff/applications/:id/repayment` | Same read-only fictional schedule, available only for an accessible Approved application. Other states return to the permitted application detail with an explanation. |
| `/applications/:id/print` and `/staff/applications/:id/print` | Applicant-visible summary only. Staff printing never includes reviewer identity, assignment, assessments, checks, internal notes or internal activity. |
| `/components` | Public, small gallery of fields, errors, status labels, buttons, dialogs, typography, direction handling and document rows. |
| `/demo/reset` | Explicit browser-wide reset confirmation, also reachable unsigned or during startup recovery. |
| Unavailable route result | One neutral result for missing or forbidden records, with current identity's home and an explicit identity switch. Reveal no record details. |

Reference, form step, queue parameters and section anchors can appear in URLs. Names entered in fields, amounts being edited, reasons, notes and file content do not. Validate all parameters and permission/state checks on every entry and refresh. A new sign-in without a pending link opens the applicant list or staff queue. Intentional identity switching also goes to that identity's home.

## Applicant forms and saved work

Use the Guided A header and horizontal five-step navigation. Wide screens place a financing summary beside the current section; narrow screens stack it after the form. Each step is reachable without forcing incomplete fields to be valid. Changing steps or language preserves the current in-memory buffer and does not save it.

Personal and business data remain spacious, with labels above controls. Monetary and phone fields accept Arabic-Indic digits. Business financial figures explain the fixed three-month evidence window. The financing section names financing amount, markup, repayment total, purchase budget and repayment term separately. The review section links back to each section needing edits.

Save progress is explicit and permits incomplete or invalid raw field input. Show Unsaved changes, Saving, the last successful save time, and Save failed as distinct states. If typing continues after a save starts, show that the captured input was saved and that newer edits remain unsaved. Do not change newer input when the response arrives. Disable duplicate publication and decision actions while pending.

Draft product switching names the incompatible fourth-slot document in its confirmation. Cancelling changes nothing. Confirming keeps shared fields and the three common documents, stages removal of the incompatible document, and shows invalid amount/term values without clamping them. Commit removal on the next save or submission. Product switching is absent after initial submission.

On Submit, validate all sections and files. Focus a summary of errors before the form; its links navigate to the appropriate step and focus the field or document control. Each field has a label and associated error description. Success opens application detail with a confirmation and reference. It records a history event and does not create an applicant notification-list item.

## Documents

Keep one current file per required slot and name the requirement. Show filename, type, size, preview and replacement controls. Applicant copy reports presence, preparation and save state, without exposing reviewer assessments.

Use these distinct messages:

| Situation | Applicant-facing meaning |
| --- | --- |
| Preparing, with progress | The selected file is still being prepared. |
| Ready to save | Prepared in this tab; not saved and not sent. |
| Saved in draft or correction workspace | Durable private progress; not yet published to the reviewer. |
| Included in submitted information | Available in the published snapshot. |
| Preparation failed | The selection remains available for explicit retry or discard; prior saved file remains. |
| Save failed | The prepared file remains ready for another save; no repeat upload is required. |

Apply the exact envelope and same-content rules from the persistence ticket. The examples cover allowed PDFs/JPEGs/PNGs, invalid type, empty file, oversized file, MIME mismatch, unreadable valid envelopes, identical-content replacement and different-content readable replacement. No arbitrary local file upload is implemented in this walkthrough.

Saving waits for active uploads. A failed selection cannot fulfill submission and keeps a departure warning active. Other progress and ready files can still be saved, retaining the old saved reference for that failed slot. Save and leave requires completing or explicitly discarding unfinished selections. Preview failure leaves the attachment intact and offers retry plus permitted open/download alternatives.

Previews use a focused modal on wide screens and a nearly full-screen modal on mobile. Keep the document label and Close control visible. Trap keyboard focus with a native modal, support Escape, and restore focus to the opener. Large evidence scrolls inside the preview. The eventual implementation revokes disposable preview URLs on closure, file/identity change and reset.

## Tracking and corrections

Applicant lists show the required next action beside status. Detail groups submitted information, documents, current correction targets and public history. Notifications include correction requests and final decisions only. Marking read changes no application state.

The correction workspace is a separate route with a clear explanation that saves are private. Every requested field and slot has its reason next to it. Other information is read-only, including product. Show the fixed request date/baseline, completion progress, and a review summary before resubmission. Formatting-only field changes and identical-content files do not satisfy targets.

Partial saves keep the reviewer on the submitted snapshot. Successful resubmission publishes all targets together, returns directly to Under review and preserves assignment. The applicant sees immediate confirmation and a history event. Verification remains pending. Earlier rounds stay readable in chronological history; omit optional side-by-side version comparison.

## Queue and reviewer workspace

Use the Guided A labelled sidebar, counts and a readable table. At narrow widths, show application cards with the same reference, applicant, business, product, amount, status, assignee, submission date and Open action. Compact staff navigation wraps above the page. Do not require horizontal scrolling to reach the main action.

Search matches reference, applicant name and business name. Proposed filters are status, product and assignment. Proposed sort choices are submission date newest/oldest and amount highest/lowest, with an application-reference tie-breaker. Use five rows per page. Search/filter changes start at page one; clamp a page invalidated by filtering or committed changes.

A fresh queue entry restores saved filters and sort, clears search and starts at page one. Explicit valid URL values take precedence. Back to queue from a record restores the previous URL and page. Empty results retain controls and offer Clear search and Reset filters. Announce counts without stealing input focus.

Staff can read all non-Draft submitted records. Show Unassigned, Assigned to you or Khaled in the row and workspace header. Claiming does not start review. Starting review is separate. Transfers require confirmation naming both reviewers. Unassign exists only in Submitted. Final assignment is locked.

Wide review screens place information and documents beside checks and notes. On narrow screens use a single column with section links for information, documents, checks and activity. Each section remains directly reachable. Avoid a permanently fixed action bar that covers form errors or document content.

Document assessment, five fixed checks and correction verification have separate labels. A requested document's acceptance verifies that target; requested field changes need separate verification. Show changed fields and replacement markers against the current round's fixed baseline. Explain which checks reset and preserve unaffected results.

For Huda's amount and stock-plan response, amount becomes 450,000; the plan becomes Awaiting review. Evidence consistency, Product purpose fit, Purchase budget coverage and Repayment capacity become Unchecked. Operating history stays Passed. The reviewer must verify the amount, accept the replacement, and complete the affected checks before approving.

While Corrections requested, permit reading and authorized notes only. Final records lock applicant data and review outcomes but retain authorized internal notes. Internal notes have their own save button, never appear in applicant views or print, and never submit on navigation. A correction composer accepts specific targets and individual reasons, then shows a send confirmation. A subsequent round captures a new baseline and preserves earlier rounds.

## Decisions and repayment

The decision screen shows applicant, reference, product, amount, term, prerequisites and an applicant-visible reason. Approval requires all accepted documents, five passed checks and current correction verification. Rejection requires a failed substantive criterion; missing or unsuitable evidence alone is insufficient. Present disabled actions with a readable explanation of missing prerequisites.

After composing a reason, confirm the chosen final outcome and terms. Never reuse a confirmation after expiry, stale data or assignment change. Final screens show the result and reason, and an applicant notification is created. Final states are not reopened.

A read-only repayment route shows financing amount, markup, total, completed and remaining amounts, and dated entries. All display digits are Western; dates are Gregorian with translated month names. Labels use ر.ي. in Arabic and YER in English. There is no payment or mark-completed control.

Keep the historical Equipment example at eighteen installments of 72,000, two Completed entries, 144,000 completed and 1,152,000 remaining. Its next entry is 15 October 2026. New approval on 14 October starts on 15 November and has all entries Upcoming. The schedule is frozen; revisiting later changes no dates or completion flags.

## Interruption and recovery matrix

These behaviors preserve the full failure contract. Guided chapters depict the principal screens; this table covers the other operation categories without inventing different persistence semantics.

| Trigger | Screen behavior and next step |
| --- | --- |
| Invalid fields, targets or file envelope | Keep raw input and selection. Show linked issues. Do not mutate or publish. Invalid attempts do not consume an armed operation failure. |
| Failed preparation | Retain selection and prior saved file. Offer Retry or Discard. A required failed selection blocks publication. |
| Failed progress save | Show not saved; retain input and prepared files. Retry without preparing them again. |
| Failed submission or resubmission | Retain all input; prior workspace, snapshot, state, history and notifications remain unchanged by the attempt. Retry explicitly. |
| Confirmed storage abort | Show not saved and keep work. No partial effects. Explain that storage access or capacity may need recovery before retry. |
| Stale shared record | Refuse the write, offer Load latest, preserve unapplied text, and invalidate confirmation. No force-save or automatic retry. |
| Simulated colleague transfer | Deliberately retain the initiating stale view until its write is refused. Load latest shows Khaled and the internal transfer; review controls become read-only. Explicitly reclaim with confirmation, inspect the latest record, then begin a new permitted action and confirmation. |
| Stale private workspace | Keep the user's buffer separately, show latest saved input for inspection, and require explicit replacement or use of latest. Do not merge automatically. This temporary recovery presentation does not add general version comparison. |
| Stale preferences | Retain desired filter/language choices, inspect latest preferences and explicitly reapply if wanted. Do not silently overwrite another tab's preference changes. |
| Session expiry before commit | Cover protected content and previews, invalidate confirmation, and refuse uncommitted operations. Same identity may recover current-tab input after rereading permission/state. Another identity requires explicit discard. |
| A write committed before expiry | Keep the committed result. Signing in inspects current state; do not claim rollback because a response arrived late. |
| Forbidden or unavailable record | Show the same neutral screen without record details. Offer home or identity switch. |
| Preview cannot render | Keep the file. Offer retry and permitted open/download alternatives. |
| Post-commit tab notification fails | Keep successful feedback. Reread on activation or explicit refresh; never repeat the mutation to repair a notification. |
| Unknown completion | Say the result is unconfirmed. Inspect current state and receipt before claiming success or failure. An explicit unchanged retry retains its operation identity where appropriate. |
| Startup unavailable, blocked, damaged or unsupported | Preserve data. Offer retry, coordination with a blocking tab, and confirmed reset where possible. No silent reseed or memory-only saves. Public products/gallery remain available when assets are available. |
| Another tab changes data | Refresh clean views. Dirty views keep buffers and show Newer data available while updating permission/assignment information. A private correction save does not invalidate a reviewer's submitted snapshot. |
| Another tab changes identity | Keep this tab's session independent. The selected identity is always visible. |
| Offline after readiness | Local reads, saved files and prepared samples continue without a server queue or false network-failure message. Fresh offline launches are excluded. |
| Reset with unfinished work | Explain the browser-wide effect on every record, file, preference, session and tab buffer. Require explicit confirmation bound to the observed dataset. Prepare seeds before mutation. |
| Reset fails | Keep previous dataset and still-valid context/buffers. Show failure and retry after recovery. |
| Reset succeeds here or in another tab | Once the new dataset is confirmed, clear old buffers, previews, confirmations, failure controls and sessions. Show the chooser in Arabic. Old operations cannot modify the new dataset. |
| Dataset changed before reset confirmation is used | Inspect the new state and ask for a fresh reset confirmation. An immediate identical successful reset retry only reports its recorded result. |

In-app departure, identity switching and sign-out use Save and leave, Discard changes and Stay for applicant work. Save and leave navigates only after successful saving. An internal note offers Save note and leave only while authorized. Unsent correction requests and decisions offer Discard and Stay. Wait for pending operations before switching. Browser-level departure warnings are best effort and do not promise unsaved-input restoration after refresh.

The eventual demo controls expose slow requests, fail-next-save, fail-next-submission, fail-next-upload, fail-next-storage-write, immediate expiry, forbidden example, simulated reassignment and reset. One targeted one-shot failure is armed at a time. Keep the agreed normal/slow timing presets of 400/1,500 ms and preparation presets of 1,200/4,000 ms. None are random.

## Bilingual, focus, loading and print behavior

Arabic is initial. Use the accepted Noto Sans Arabic/Noto Sans typography, teal actions, pale green summaries, neutral background and 15px panels. Use logical start/end for layout and isolate references, phones, filenames, amounts and fractions. Preserve entered spelling, explanation text and invalid raw input across language changes. UI translations do not translate applicants' supplied names or business text.

Route navigation focuses the new heading. Step changes focus the section heading; validation focuses its summary. Dialogs focus their heading or first useful control, contain Tab navigation, close with Escape where safe, and return to their opener. Language switching preserves the active control and caret where possible. Saving feedback uses a polite live region and does not move focus. Action failures stay visible near the action until addressed.

On initial route loading, show the page title and neutral placeholders without stale protected content. During a pending action keep relevant input visible, mark the action busy and prevent duplicate commits. Route read failures show retry and safe navigation. Empty notifications explain that correction requests and final decisions appear there; empty applicant lists offer a new application. Empty queue results preserve filters and provide clear recovery. Narrow layouts retain accessible labels and do not rely on color alone.

Print uses a dedicated route and print stylesheet. Hide navigation, demo controls, buttons and private staff data. Show fictional identification, reference, status, applicant/business information, terms, document presence and labels, public reasons and history. Drafts print the last saved progress with a Draft label. Applications in corrections print the last submitted information, excluding private unfinished corrections. The same rule applies for either role. Keep headings with the following content and avoid splitting short metadata blocks where possible.

## Review status

Accepted on 2026-10-14 with no requested changes. The screen-flow ticket is resolved. No new domain ambiguity arose. The existing acceptance and implementation-handoff ticket owns the remaining verification plan and delivery decisions. Browser, layout, keyboard and print verification limits remain as recorded in the guide.
