# Build RIFD's financing application and review platform

Status: ready-for-agent
Source: [Resolved planning map](map.md)

## Problem Statement

A small-business applicant needs to understand financing requirements, prepare an application over several visits, supply supporting documents, and follow the review without losing work or confusing a correction request with a rejection. A reviewer needs to find submitted applications, take responsibility for a review, assess evidence, request precise changes, and record an explained decision against the information actually submitted.

This portfolio project must demonstrate that complete experience in Arabic and English. It must make saved progress, private unfinished corrections, submitted information, and final decisions distinguishable, including when files fail, another tab changes a record, or a simulated session expires. A visitor must be able to inspect every journey and understand the breadth of the product within a three-to-five-minute demonstration.

## Solution

Build رِفد / RIFD, an original fictional financing application and review demo. Applicants compare Inventory and Equipment financing, complete a five-step application, save progress and files in their browser, submit, track progress, respond to targeted corrections, and print their application. Reviewers use a searchable assigned queue, examine documents and five fixed review checks, request corrections, and confirm approval or rejection with a reason. Approved applications display a read-only fictional repayment overview.

Use the accepted Guided A visual direction, Arabic initially, explicit English switching, responsive layouts for both roles, and keyboard-accessible interactions. Three applicant identities and one interactive reviewer share browser-local records through typed asynchronous demo operations. Prepared samples and deterministic controls demonstrate failures and recovery. Deliver the full agreed one-month scope, a hosted static demo, repository, focused tests, user-flow sketch, acceptance evidence, case study, and seven equally timed demo chapters.

## User Stories

1. As a visitor, I want to compare both fictional financing products and their purposes, limits, terms, markup, and required documents, so that I can choose an appropriate example.
2. As an applicant, I want my selected product to survive simulated sign-in, so that I can continue the application I intended to start.
3. As an applicant, I want to start a new application or resume an existing draft explicitly, so that starting again does not replace saved work.
4. As an applicant, I want personal, business, financing, document, and review steps, so that I can prepare the application in manageable sections.
5. As an applicant, I want to navigate incomplete steps without losing input, so that I can gather missing information in any order.
6. As an applicant, I want clear field requirements and linked validation errors, so that I can find and correct invalid input before submission.
7. As an applicant, I want Arabic-Indic numeric and phone input to work alongside Western digits, so that I can enter information naturally.
8. As an applicant, I want to save incomplete or invalid progress explicitly, so that unfinished information survives refresh without being submitted.
9. As an applicant, I want unsaved, saving, saved, and failed states with the last successful save time, so that I know what the browser has retained.
10. As an applicant, I want typing after a save begins to remain intact and marked unsaved, so that a delayed result cannot erase later edits.
11. As an applicant, I want to switch products while Draft with confirmation before losing an incompatible document, so that I can change my choice deliberately.
12. As an applicant, I want product switching to preserve shared information and expose incompatible amount or term values, so that I can correct them myself.
13. As an applicant, I want to review all entries before submission, so that I can inspect the application I am handing over.
14. As an applicant, I want incomplete fields, invalid values, and missing or unfinished required files to block submission, so that a failed attempt does not appear submitted.
15. As an applicant, I want successful submission to show a reference, confirmation, and history entry, so that I can find the submitted application again.
16. As an applicant, I want four clearly named document slots with their evidence requirements, so that I know which file belongs where.
17. As an applicant, I want to choose prepared fictional samples or local fictional PDF, JPEG, and PNG files, so that I can demonstrate document handling.
18. As an applicant, I want file type, MIME, empty-file, and size errors before preparation, so that unsuitable file envelopes do not appear ready.
19. As an applicant, I want preparation progress and Ready to save feedback distinct from saved and submitted documents, so that I understand when a file becomes durable and reviewer-visible.
20. As an applicant, I want saved file bytes and previews to survive refresh, so that I can resume with the actual evidence I saved.
21. As an applicant, I want a failed replacement to preserve the previous saved file, so that failure does not destroy existing evidence.
22. As an applicant, I want failed preparation to retain my selection and failed saving to retain prepared files, so that explicit retries do not require unnecessary reselection or preparation.
23. As an authorized viewer, I want readable previews and permitted open or download alternatives, so that a preview failure does not make a saved document inaccessible.
24. As an applicant, I want a list of my applications with status and next permitted action, so that I can find work that needs attention.
25. As an applicant, I want submitted information to remain distinguishable from unfinished correction work, so that I know what the reviewer can see.
26. As an applicant, I want public history containing submission, review start, correction requests, resubmissions, and final decisions, so that I can follow the application's progress.
27. As an applicant, I want correction reasons and final decision reasons in that history, so that I understand what to change and why a decision was made.
28. As an applicant, I want notifications for correction requests and final decisions that open the current permitted destination, so that I can act on them even after the application's state changes.
29. As an applicant, I want my notification read state to persist independently, so that reading a notice does not alter the application or another identity's notifications.
30. As an authorized viewer, I want a printable applicant-visible summary, so that either role can inspect the same public record without exposing staff information or unfinished corrections.
31. As a reviewer, I want a queue of all submitted applications with counts and readable identifying details, so that I can locate review work.
32. As a reviewer, I want search by reference, applicant, and business, so that I can find a known application.
33. As a reviewer, I want status, product, and assignment filters with stable date and amount sorting, so that I can organize the queue.
34. As a reviewer, I want five-row pages, saved filters and sort, and a return to my previous queue position, so that I can work through more than one page without losing context.
35. As a reviewer, I want equivalent queue cards on narrow screens and useful empty-result controls, so that the queue remains usable at every agreed width.
36. As a reviewer, I want claiming an application and starting its review to be separate actions, so that responsibility does not imply review has begun.
37. As a reviewer, I want confirmed transfers that retain review work and permitted unassignment only before review, so that assignment changes do not restart or damage the application.
38. As a reviewer, I want to read submitted applications regardless of assignment while review writes require my assignment, so that I can inspect work before taking responsibility.
39. As a reviewer, I want application information, document assessments, checks, correction verification, notes, and activity shown distinctly, so that each review result has a clear meaning.
40. As a reviewer, I want to accept a document or mark it Needs replacement with a reason, so that the evidence assessment is explicit.
41. As a reviewer, I want the five fixed checks to enforce the agreed numerical and evidence rules, so that an unsupported passing result cannot enable approval.
42. As a reviewer, I want to save internal notes in permitted states, so that staff context stays available without becoming an applicant message or decision reason.
43. As a reviewer, I want a correction request to name specific fields or document slots with a reason for each, so that the applicant knows exactly what to change.
44. As an applicant, I want only current correction targets editable while other information and the product remain locked, so that my response stays within the request.
45. As an applicant, I want to save unfinished corrections privately, so that the reviewer continues assessing the last submitted information until I resubmit.
46. As an applicant, I want unchanged normalized values and identical-content replacements to leave a target unsatisfied, so that formatting or renaming alone cannot appear to resolve a correction.
47. As an applicant, I want all completed requested changes to publish together on resubmission, so that the reviewer never sees a partial response.
48. As a reviewer, I want resubmission to return directly to Under review with the assignee preserved, so that corrections do not restart assignment or review.
49. As a reviewer, I want changed fields and added or replaced files highlighted against the request's fixed baseline, so that I can identify the response.
50. As a reviewer, I want only dependent checks reset and unchanged document assessments retained, so that I repeat the review affected by the response.
51. As a reviewer, I want to verify requested field changes and accept requested document replacements before approval, so that resubmission alone does not count as a satisfactory correction.
52. As a reviewer, I want repeat correction rounds with preserved earlier requests, responses, and assessments, so that an insufficient response can be corrected again.
53. As a reviewer, I want review during Corrections requested limited to reading and authorized notes, so that I do not decide against an unfinished response.
54. As a reviewer, I want approval to require accepted documents, all checks Passed, and outstanding corrections verified, so that approval reflects a complete review.
55. As a reviewer, I want rejection to require a failed substantive criterion, so that missing or unsuitable evidence alone leads to corrections.
56. As a reviewer, I want an applicant-visible reason and fresh explicit confirmation for either decision, so that the final action is deliberate and explained.
57. As an applicant, I want approval to accept my submitted terms and final decisions to lock the application, so that the recorded outcome cannot silently change.
58. As an authorized viewer, I want Approved applications to show a frozen repayment illustration with separate amount, markup, total, completed, and remaining figures, so that the fictional calculation is understandable.
59. As an authorized viewer, I want historical completed entries and newly approved upcoming entries to remain read-only, so that the demo does not imply payment processing.
60. As a reviewer, I want an outside reassignment to refuse my stale write without applying it, so that I can demonstrate a real conflict and its consequences.
61. As a reviewer, I want Load latest to preserve unapplied text, reveal the new assignment, and invalidate confirmation, so that I can inspect, reclaim, and explicitly retry against current information.
62. As a demo user, I want committed records shared across tabs with independent tab identities and sessions, so that applicant and reviewer views can demonstrate the same application.
63. As a demo user, I want clean views to refresh and dirty views to retain input with a newer-data notice, so that another tab's changes do not silently overwrite my work.
64. As a demo user, I want duplicate unchanged operations to avoid duplicate effects and uncertain outcomes to be inspected, so that retrying cannot create repeated history, notifications, or decisions.
65. As a demo user, I want navigation, sign-out, and identity switching to resolve unfinished work explicitly, so that leaving does not silently save, publish, or discard it.
66. As a demo user, I want expiry after fifteen minutes of inactivity to cover protected content, so that session interruptions are visible and consistent.
67. As a demo user, I want same-identity sign-in to recover permitted current-tab input without replaying actions, so that I can decide how to continue after expiry.
68. As a demo user, I want selecting another identity to require discarding the previous identity's unfinished work, so that it cannot appear under the new identity.
69. As a visitor, I want protected deep links to resume after permitted sign-in and unavailable records to reveal no details, so that access behavior is coherent.
70. As a visitor, I want Arabic-first screens, explicit English switching, readable RTL/LTR content, and preserved entered text, so that language changes do not interrupt work.
71. As a keyboard or screen-reader user, I want labelled controls, visible focus, linked errors, usable dialogs, and announced save feedback, so that I can complete the required journeys.
72. As a mobile applicant or reviewer, I want layouts and primary actions usable at the agreed narrow and wide widths, so that screen size does not block a journey.
73. As a visitor, I want a public gallery of the actual production components and their states, so that I can inspect the interface's consistency.
74. As a demo user, I want labelled slow and one-shot failure controls with predictable recovery, so that I can reproduce failure behavior without random interruptions.
75. As a demo user, I want startup failures to preserve saved data and offer retry or confirmed recovery, so that a storage problem does not silently erase progress or claim an unsaved success.
76. As a demo user, I want the already-ready demo to keep using local data and prepared samples offline, so that network loss does not prevent browser-local work.
77. As a demo user, I want a confirmed browser-wide reset that restores the complete seeds and defaults atomically, so that I can restart the demonstration reliably.
78. As a demo user, I want reset failure to preserve the previous dataset and reset success to invalidate old tabs and pending work, so that delayed operations cannot corrupt the new demonstration.
79. As a visitor, I want clear fictional-demo and browser-storage explanations, so that I understand the identities, products, decisions, and permissions are simulations.
80. As a portfolio reviewer, I want all seven journeys given equal time in a chaptered four-and-a-half-minute demonstration, so that I can assess the complete scope quickly.
81. As a portfolio reviewer, I want a live static demo with working direct links, responsive feedback, and recorded performance evidence, so that I can inspect the implementation myself.
82. As a maintainer, I want reproducible setup, tests, seed/reset guidance, architectural notes, a user-flow sketch, and a case study linked to actual evidence, so that I can run, evaluate, and extend the delivered application.

## Implementation Decisions

### Scope, architecture, and interface

- Implement the full source brief with all seven journeys given equal emphasis. The accepted decisions linked in Further Notes supply the detailed contracts. They take precedence over the source brief where they refine its correction-first emphasis or optional extras.
- Use pnpm, React, TypeScript, TanStack Start in SPA mode, and classic Firebase Hosting. All required behavior runs in the browser through typed mocked asynchronous APIs and fictional data. Select compatible dependency versions during implementation and pin them in the lockfile. The current repository contains planning documents and archived prototypes, with no application, manifest, test suite, or ADRs to extend.
- Build one pure domain module for input shape and submission validation, normalization, transitions, correction targets and dependencies, decision prerequisites, and whole-rial calculations. Pass domain date and frozen product rules explicitly. Keep storage, timers, navigation, and presentation outside it.
- Build one public typed demo module for startup, public and role-filtered reads, complete operations, and committed-change subscriptions. It owns sessions, permissions, storage, versions, receipts, deterministic failures, latency, and preparation progress. Screens and integration tests use this same interface. Keep storage transactions and tab messaging private to the module.
- Screens own unfinished input, selections, dialogs, navigation, and accessible feedback. They invoke complete operations and do not assemble database mutations. Helpful frontend validation does not replace validation at the operation boundary.
- Use a discriminated union of operations with the relevant payload, dataset identifier, operation identifier, expected revisions, and round or document references. Capture the actor from the current tab session. Return committed revisions, affected identifiers, outcome, and a current permitted projection on success. Return finite error kinds, stable translation keys, and field or slot issues on failure. Do not expose an unrestricted application patch or whole-database replacement API.

### Products, information, and documents

Both fictional products serve an individual owner applying for an established small business. Product terms and review criteria are portfolio inventions.

| Product | Purpose | Inclusive financing amount | Repayment term | One-time illustrative markup | Fourth required document |
| --- | --- | --- | --- | --- | --- |
| Inventory financing / تمويل المخزون | Replenish stock | 100,000 to 1,000,000 whole YER | 6 or 12 months | 5% | Stock purchase plan |
| Equipment financing / تمويل المعدات | Purchase productive equipment | 500,000 to 3,000,000 whole YER | 12, 18, or 24 months | 8% | Supplier quotation |

Both products also require applicant identity evidence, business evidence, and a revenue and expense summary. There are four required slots per application, one current attachment per slot, and no other illustrated charges. Comparison shows purpose, limits, terms, documents, and markup. Use the accepted bilingual field and document labels from the product contract.

| Information | Submission requirement |
| --- | --- |
| Product | Inventory or Equipment |
| Applicant full name; business name | Each 2 to 100 trimmed Unicode code points |
| Mobile | Optional leading plus and 9 to 15 digits; spaces and hyphens permitted as separators |
| City | 2 to 60 trimmed Unicode code points |
| Email | Optional; at most 254 characters; simple ASCII local part, one at-sign, dotted domain, no whitespace, nonempty alphanumeric/hyphen domain labels with alphanumeric ends |
| Business activity | Retail, Services, or Small production |
| Business address | 5 to 250 trimmed Unicode code points |
| Operating since | Valid Gregorian year-month no later than initial submission month |
| Average monthly revenue; average monthly operating expenses | Each 0 to 50,000,000 whole YER |
| Requested amount; repayment term | Within the selected product's allowed values |
| Purchase budget | 1 to 50,000,000 whole YER |
| Purchase explanation | 20 to 500 trimmed Unicode code points |

- Require every field except email at submission. Freeze the initial submission month and the preceding three completed months as the financial evidence window. Corrections retain this window. Expenses exclude the illustrated repayments.
- Preserve raw incomplete and invalid values in saved drafts and correction workspaces. Submission requires valid fields and all required files successfully prepared or already saved, with no pending or failed required selection. Submission persists the current form and ready files together, without requiring a separate preliminary save.
- Keep eligibility separate from structural validation. Fewer than six operating months, financing above purchase budget, nonpositive surplus, or an unsuitable purpose can pass field validation and fail substantive review.
- Permit draft product switching only before first submission. Preserve common information and the three shared documents. Confirm removal of a supplied incompatible fourth-slot document, stage that removal until save or submission, and preserve invalid amount and term values for explicit correction. Cancelling leaves the draft unchanged. Product is fixed after submission.
- Accept Western and Arabic-Indic digits. Monetary input accepts plain whole digits or correctly grouped comma/Arabic-thousands separators, with an initial group of one to three digits and subsequent groups of three. Reject signs, decimals, exponents, and malformed grouping at submission.
- Compare text after NFC normalization, collapsed whitespace, lowercasing, and Arabic-Indic digit folding while preserving entered text for display. Punctuation, wording, accents, and Arabic diacritics remain meaningful. Normalize phones by removing separators while retaining an optional plus, compare emails lowercase, and compare valid monetary, term, and month values canonically. Formatting alone cannot fulfill a correction target.
- Accept nonempty files up to 5,000,000 bytes with case-insensitive PDF, JPG/JPEG, or PNG extensions. Supplied MIME must match application/pdf, image/jpeg, or image/png for that extension family. Empty MIME falls back to the allowed extension. Envelope validation does not establish readable or suitable evidence.
- Support prepared samples and locally selected fictional files. Each prepared evidence preview visibly says DEMO / تجريبي and matches its application, document purpose, figures, and financial window. Provide genuinely different replacement bytes and invalid, empty, oversized, and identical-content examples.
- Preparation reads and hashes bytes with SHA-256, reports deterministic progress, and returns an opaque reference scoped to the tab, dataset, applicant, application, and slot. Success means Ready to save. It changes no durable document or submitted snapshot. Save, Submit, or Resubmit commits prepared bytes and the corresponding values atomically.
- Saving waits for active preparation. A failed preparation retains its selection; saving other progress can retain the old file for that slot while leaving the failed selection unsaved. Save and leave requires completing or explicitly discarding unfinished selections. A failed save retains ready files for retry without preparation again. A failed replacement preserves the previous saved attachment.
- Store file bytes and metadata, recreate preview URLs after authorized reads, and revoke them when access or preview lifetime ends. Preserve evidence referenced by snapshots, baselines, historical rounds, and the offline sample catalog. Preview failure offers retry and permitted open/download alternatives without deleting the file.

### Lifecycle, visibility, and correction rounds

Use exactly six application states. Assignment, document review status, correction verification, and upload progress remain separate concepts.

| Action | Actor and current state | Required result |
| --- | --- | --- |
| Save progress | Own applicant, Draft or active Corrections requested workspace | Save private raw progress; no lifecycle transition or applicant notification |
| Submit | Own applicant, Draft | Validate and publish all required data; enter Submitted; record submission and immediate confirmation |
| Start review | Assigned reviewer, Submitted | Enter Under review; record applicant-visible review start |
| Assess documents, record checks, verify corrections | Assigned reviewer, Under review | Record internal outcomes against current submitted information |
| Request corrections | Assigned reviewer, Under review | Require specific nonempty targets and individual reasons; capture baseline and round; enter Corrections requested; record history and one notification |
| Resubmit | Own applicant, Corrections requested | Publish the complete valid response; enter Under review; retain assignee; record history and immediate confirmation |
| Approve | Assigned reviewer, Under review | Require all documents Accepted, all five checks Passed, outstanding corrections verified, reason, and explicit confirmation; enter Approved |
| Reject | Assigned reviewer, Under review | Require a failed substantive criterion, reason, and explicit confirmation; enter Rejected |
| Add internal note | Assigned reviewer, Under review, Corrections requested, Approved, or Rejected | Append internal note/activity without changing application status or decision |

- Document review statuses are Missing, Awaiting review, Accepted, and Needs replacement. Needs replacement retains the file and requires a reason. A published added or replaced file becomes Awaiting review. Applicants see presence, preparation, save state, and requested changes, without staff assessments or their private reasons.
- A correction request identifies only fields or document slots that actually need changing, each with a reason. Do not unlock dependency groups. Request both a field and its supporting document only when both need correction. Product cannot be a target.
- Capture a fixed correction baseline from the current submitted snapshot. Save partial applicant responses in a separate private workspace. Staff reads continue returning the submitted snapshot. During Corrections requested, staff can read and add authorized notes; assessments, checks, further requests, and decisions wait for resubmission.
- Resubmission requires every requested field valid and canonically changed, every missing document added, every replacement different in byte content from its baseline, and the entire resulting application valid. Reject unrequested edits. Publish the response and files together, retain the current assignment and evidence window, and retire the private workspace.
- Reset only checks dependent on changed fields or added/replaced files. Preserve unaffected results and unchanged document assessments. Each requested field needs reviewer verification. Accepting the published requested document verifies that target. Resubmission itself verifies nothing.
- Highlight changed fields and added/replaced documents against the current fixed baseline. A further request creates a new baseline and workspace while retaining earlier rounds and assessments. Earlier insufficient responses become history once carried-forward targets are satisfied in a later round.
- Approval accepts the submitted financing terms. A reviewer needing different terms must request corrections first. Rejection can proceed on an independent failed substantive criterion even when unrelated document review or correction verification is unfinished. Evidence deficiency alone cannot justify rejection.
- Approved and Rejected are terminal. Lock fields, files, checklist outcomes, and final assignment. Retain authorized viewing, printing, notification reading, and assigned-reviewer internal notes. Notes cannot change the decision.
- Applicant history contains submission, review start, correction requests and their reasons, resubmissions, and final decisions and reasons. Staff identity, assignment, document assessments, checks, verification, and notes remain internal. Staff activity includes public lifecycle and internal events.
- Create one applicant notification per successful correction request or final decision. Submission and resubmission use immediate confirmation and history instead. Notification reading affects only the owner's read state.

### Review checks and repayment

Each check is Unchecked, Passed, or Failed. The assigned reviewer records outcomes. Numeric checks cannot be marked Passed when their rules fail. The last four checks are substantive criteria that can support rejection; Evidence consistency alone cannot.

| Check | Passing condition | Changes that require rechecking |
| --- | --- | --- |
| Evidence consistency | All four required documents Accepted and consistent with current supported information | Full name; business name/address; operating-since; revenue/expenses; purchase explanation/budget; any required document added or replaced |
| Operating history | At least six months between start month and frozen initial submission month | Operating-since or business evidence |
| Product purpose fit | Purchase serves selected product's purpose in the declared business activity | Business activity, purchase explanation, or purchase document |
| Purchase budget coverage | Financing amount does not exceed purchase budget | Financing amount, purchase budget, or purchase document |
| Repayment capacity | Positive monthly surplus; largest installment no greater than 40% of surplus | Financing amount, term, revenue, expenses, or revenue and expense summary |

- Compute operating history by year-month index difference. August to October 2026 is two months. Monthly surplus is revenue less operating expenses.
- Round the one-time markup to the nearest whole YER with halves upward. Add it to financing amount for the repayment total. Round the first term-minus-one installments down to whole YER and put the remaining balance in the final installment. Capacity uses the largest actual installment. Compare five times that installment with two times the positive monthly surplus to enforce the 40% threshold exactly.
- Keep the domain date fixed at 2026-10-14. Preserve historical seed dates and order same-date events with a durable sequence. Sessions, request delays, and relative save feedback use actual elapsed time.
- At approval, freeze amount, term, product/calculation rule version, markup, total, approval date, and installment rows in the same transaction. Due dates are the 15th, beginning in the month after approval. New approvals have all entries Upcoming. Later browser dates or product-rule changes cannot regenerate or complete the schedule.
- Derive completed and remaining amounts from stored rows. Only Approved applications expose the dated repayment overview. The historical Equipment approval has eighteen installments of 72,000 YER from 15 August 2026 to 15 January 2028, two Completed entries totalling 144,000 YER, 1,152,000 YER remaining, and 15 October next.
- Preserve arithmetic references. Equipment at 1,200,000 YER over eighteen months produces 96,000 markup and 1,296,000 total. Huda's correction from 600,000 to 450,000 over six months changes installments from 105,000 to 78,750 against an 80,000 capacity limit. Inventory at 100,010 over six months produces 5,001 markup, five installments of 17,501, and a final installment of 17,506.

### Identities, assignment, and access

- Provide applicant identities مريم سالم / Mariam Salem, هدى علي / Huda Ali, and عمر حسن / Omar Hassan, and selectable reviewer سلمى ناصر / Salma Nasser. خالد علي / Khaled Ali is a simulated colleague who supplies assignments and outside activity, never a sign-in option. There is no administrator role. Identity ownership uses stable references independent of editable application names.
- Products and the component gallery are public. Records, previews, notifications, staff screens, and print summaries require simulated sign-in through the explicit passwordless identity chooser. Reset also works unsigned and through startup recovery.
- Applicants can read only their own applications, documents, workspaces, public history, reasons, notifications, and Approved repayment overview. Staff can read every submitted application and its internal review history regardless of assignment, but cannot access drafts, private correction workspaces, or applicant notification lists/read flags. Resolve access before returning record details or file bytes. Forbidden and missing records share neutral unavailable copy.
- Salma can claim unassigned Submitted records, transfer records between herself and Khaled in Submitted, Under review, or Corrections requested, and unassign only in Submitted. Confirm transfers by naming both reviewers. Under review and Corrections requested retain an assignee. Final assignment is locked.
- Assignment changes preserve status, submitted information, document outcomes, checks, correction requests/baselines, and notes. Record internal activity without applicant history or notifications. Review writes require the current assigned reviewer and permitted state. Staff never directly edit applicant fields or replace their documents.
- Print the same applicant-visible projection for either role. Include fictional identification, reference, status, personal/business details, financing terms, document presence/labels, public reasons, and history. Draft uses last saved progress with a Draft label; Corrections requested uses last submitted information. Exclude private correction work, reviewer identity, assignment, assessments, checks, notes, internal activity, navigation, and controls.

### Durable state and atomic operations

Use one IndexedDB database for durable demo data. Browser session storage holds only the tab's simulated session. A database metadata record contains logical schema version, seed version, product/calculation rule version, dataset identifier, and event sequence.

| State | Lifetime and revision boundary |
| --- | --- |
| Application identity, ownership, state, assignee, submitted snapshot, assessments, checks, verification | Durable shared application revision |
| Saved raw Draft progress or active correction workspace and file references | Durable private workspace revision; corrections also identify their round |
| Correction targets/reasons, immutable baselines, published responses, historical rounds | Durable records preserved across later rounds |
| Saved file bytes/metadata and prepared sample catalog | Durable referenced evidence and offline resources |
| Notes, internal activity, public history, notifications, frozen repayment | Durable records with role-filtered reads |
| Notification read state; language and queue preferences | Independent notification/preference revisions |
| Operation receipts | Durable, scoped to dataset and actor, committed with the mutation |
| Identity, expiry, last qualifying activity | Tab-local session storage, valid only for current dataset/session |
| Application reference, form step, queue queries and section anchors | Validated URL state |
| Unfinished input, selections/ready files, reasons, notes, confirmations, progress, failure controls, preview URLs | Current-tab memory; no promise of recovery after refresh |

- Shared revisions change on publication, assignment, review start, assessments, checklist or verification edits, correction requests, decisions, and notes. Private progress saves change only their workspace revision. They check current ownership, state, and round atomically without being blocked by unrelated assignment or note revisions.
- Submit and Resubmit check both workspace and shared revisions. Staff writes check the shared revision. Notification and preference changes cannot stale a review. Never copy an old assignee from form state into a publication.
- Complete mock delays, file reads, fetching, and hashing before opening a short write transaction. Read expected versions and write all affected data, files, outcomes, history, notifications, and the receipt within that transaction. Success means transaction completion, not a successful individual request or finished preparation animation.
- For protected commands, check the captured session, dataset, and reading access before exposing details. Look up a matching receipt, then compare expected versions, then check assignment, state, targets, and domain prerequisites. A readable stale record reports staleness before lost-assignment write denial. Recheck session validity immediately before mutation and abort uncommitted work when authority expires or changes.
- An identical operation identifier and intent returns the recorded outcome and a current permitted projection without duplicate effects. Changing the kind or payload requires a new identifier. Fingerprints include stable raw payload and file hashes/metadata, excluding preview URLs and transient progress/session tokens. A changed intent or inspected stale recovery uses a new identifier; an unchanged uncertain retry retains its identifier.
- Distinguish confirmed abort from unknown completion. Inspect the latest permitted state and retained receipt before reporting the outcome or offering retry. Post-commit rendering or broadcast failure cannot turn a committed operation into a failed save. Startup and sign-in never resend pending commands automatically.
- A save persists its captured payload. Later typing remains unfinished and survives the result. Ignore late preparation/results for superseded selections, identities, sessions, or datasets. Prevent duplicate submission and decision actions while pending.
- Provide typed errors for unavailable/expired session, forbidden/not found, stale shared/workspace/preference revisions, superseded dataset, validation and identifier misuse, invalid state/permission, upload/request/storage/startup failure, and unknown outcome. Keep permitted input and files recoverable, associate field/slot errors with controls, and never imply successful effects after refusal.

### Sessions, cross-tab updates, and conflicts

- Restore a tab session after refresh only while its dataset and actual expiry remain valid. A duplicated or opener-created tab may initially inherit an identity, then has independent activity and switching. Show the current identity prominently. Protect delayed results with a runtime/session generation.
- Expire after fifteen minutes of inactivity or the explicit Expire session control. Keyboard and pointer interaction renew activity; mouse movement, request completion, broadcasts, and background polling do not. Check expiry before renewal on return, on protected operations, and before mutation. Timers provide immediate feedback while activation checks catch background delays.
- On expiry, cover protected content and previews, invalidate confirmations, and retain unfinished input privately in the current tab. Same-identity sign-in rereads access, state, and versions before restoring the permitted view. If editing is no longer allowed, show the permitted read-only view and preserve unapplied work separately. Another identity requires explicit discard. Nothing saves, submits, retries, or confirms automatically. An operation committed before expiry remains committed even if its response arrives later.
- Fresh sign-in opens the applicant list or staff queue. An unsigned protected deep link resumes only if permitted. Intentional switching resolves unfinished work, then opens the new identity's home. Unavailable destinations reveal no record details and offer home or explicit switching.
- Applicant departure guards offer Save and leave, Discard changes, and Stay. An authorized unfinished note may offer Save note and leave. Unsent requests and decisions offer Discard and Stay. Save and leave navigates only after success; wait for pending saves/preparation before switching. Browser departure warnings are best effort and do not make unsaved input durable.
- Broadcast committed dataset and identifier/revision hints, then reread storage. Do not broadcast record content, files, or notes. Reread on startup and tab activation to catch missed notices. BroadcastChannel or a safe storage-event hint cannot replace transactional version checks.
- Refresh clean views. Preserve dirty input with a newer-data notice while updating permissions/assignment. Conflicting private saves and preference writes require inspection of latest saved values and explicit reapplication. Never merge automatically or silently refresh the expected revision. Private correction saves do not stale the reviewer's snapshot.
- The stale-record demo transfers an eligible Under review application from Salma to Khaled, records the internal transfer, and deliberately holds only the initiating workspace stale. Other tabs update normally. Refuse its next staff write without effects. Load latest reveals Khaled, retains unapplied text and prior review work, invalidates confirmation, and makes review controls read-only. Recovery requires confirmed reclaim, inspection, and a new permitted action. A final decision needs fresh confirmation.

### Startup, failures, offline behavior, and reset

- Keep storage opening, seeding, session restoration, and messaging outside imports and build-time SPA-shell rendering. Browser startup validates schema, shapes, and references, loads preferences and valid session, and prepares required samples and main-journey assets behind a neutral startup state. Never flash stale protected content.
- Seed genuinely empty storage atomically. Migrate only explicitly supported formats. Invalid raw draft values and the prepared incomplete Submitted seed are valid stored shapes. Damaged data, missing referenced files, or unsupported formats require recovery, not silent erasure/reseeding or memory-only saving. Handle storage denial, failed opens/writes, quota, unexpected closure, and unavailable session storage. Close connections on version change and explain blocked upgrades.
- Prepare and store required sample bytes, replacement variants, and main-journey resources before declaring readiness. Resource failure offers retry. Once ready, browser-local reads, saves, selection, and previews continue offline. Network loss alone neither fails a local save nor queues a server request. Public products/gallery remain accessible during recovery where their assets are available.
- Label demo controls and their scope. Normal mocked requests take 400 ms and slow requests 1,500 ms; preparation progress takes 1,200 ms or 4,000 ms, plus actual work/storage cost. No random failure occurs in normal use. Only one targeted one-shot failure is armed at a time; slow mode is independent.
- Controls cover next progress-save failure, next submission/resubmission failure, next valid preparation failure, next eligible application/reset storage-write abort, immediate expiry, a forbidden example through ordinary departure guards, and the colleague reassignment conflict. Consume a one-shot only after relevant access, validation, and version checks on an eligible nonduplicate attempt. Preference changes do not consume a storage-write failure. Retry runs normally unless rearmed.
- Reset requires explicit confirmation warning that applications, files, history, notifications, receipts, preferences, sessions, and unfinished work across all demo tabs will be replaced. Bind confirmation to the observed dataset or a module-issued startup recovery context. Prepare all seed resources first, then atomically restore the complete dataset with a new identifier, Arabic, and default preferences. If schema rebuilding is needed, use a rollback-capable version-change transaction rather than destructive deletion followed by separate seeding.
- A failed reset retains the previous dataset and still-valid buffers/session. Successful reset clears tab buffers, prepared references, preview URLs, caches, dialogs, confirmations, failure controls, and sessions only after commit/new-dataset observation. Old delayed requests cannot write into the new dataset; other tabs notice through a hint or activation reread.
- Reset is the public exception to ordinary session/dataset-first receipt lookup. First recognize an exact match to the current metadata's last reset receipt, including original context, identifier, and intent. Return its completed outcome without resetting again or requiring the expired prior session. Otherwise recheck the captured dataset/recovery context before mutation. A changed context requires inspection and new confirmation; an older superseded intent cannot erase subsequent work. Commit the new dataset and minimal reset receipt together.

### Canonical seeds

Use the complete accepted seed manifest, including ownership, business facts, evidence windows, notes/activity, correction reasons, file variants, dates, and unread flags. The six core scenarios are:

| Scenario | Applicant | Starting state and assignment | Required demonstration |
| --- | --- | --- | --- |
| Incomplete Inventory draft | Mariam | Draft, unassigned | Four privately saved files; empty explanation; save/restore and incompatible-document product switch |
| Complete Equipment submission | Mariam | Submitted, unassigned | 1,200,000 YER over eighteen months; claim, start, review, approve |
| Inventory missing financial evidence | Huda | Submitted, Salma | 300,000 YER over six months; deliberate seed-only missing required document; no normal API bypass |
| Inventory amount and stock-plan correction | Huda | Corrections requested, Salma | Fixed 600,000 baseline, response 450,000, readable different-content plan, private response, dependent rechecks |
| Historical Equipment approval | Mariam | Approved, Salma | Approved 10 July 2026; frozen schedule with two completed entries |
| Young-business Inventory rejection | Omar | Rejected, Salma | August 2026 start and October submission; failed Operating history and explained final rejection |

Seven further records supply the accepted Equipment review, colleague Inventory review, production Equipment review, unassigned Inventory submission, colleague Equipment submission, financial-summary replacement, and colleague quotation-replacement scenarios. Preserve their exact accepted manifest rather than generating substitutes.

The dataset totals thirteen applications: five Mariam, five Huda, three Omar. Excluding Draft leaves twelve queue records: four Submitted, three Under review, three Corrections requested, one Approved, and one Rejected. Seven are assigned to Salma, three to Khaled, and two are unassigned. Initial notifications are unread: Mariam's approval, Huda's two correction requests, and Omar's rejection and quotation request. Active correction workspaces initially copy submitted values and references without satisfying targets.

### Routes and screen behavior

Use normal application paths. Archived prototype hash routes describe scenes, not production routing.

| Route | Behavior |
| --- | --- |
| `/` | Neutral startup, then current identity home or chooser |
| `/products` | Public comparison; retain product through sign-in and explicit draft/new choice |
| `/sign-in` | Three applicants and Salma; permitted pending link or identity home |
| `/applications` | Own applications and next actions |
| `/applications/new?product=inventory` | New in-memory application for a supported product; durability begins on save/publication |
| `/applications/:id/edit?step=personal` | Own Draft; personal, business, financing, documents, review; invalid step falls back to first |
| `/applications/:id` | Own application detail, submitted information, next action, reasons, public history |
| `/applications/:id/corrections/current` | Current private correction workspace; stale/completed round returns to permitted detail with explanation |
| `/applications/:id/history` | Public events, correction rounds, reasons, published responses |
| `/notifications` | Own notification list and read state; links resolve current permitted state |
| `/staff/applications` | Search/filter/sort/page queue |
| `/staff/applications/:id` | Review workspace with section anchors |
| `/staff/applications/:id/correction-request` | Assigned Under review composer; inspect targets/reasons and confirm sending |
| `/staff/applications/:id/decision` | Assigned Under review reason/prerequisite/terms review and fresh confirmation |
| `/applications/:id/repayment`; `/staff/applications/:id/repayment` | Authorized Approved overview; other states return to permitted detail with explanation |
| `/applications/:id/print`; `/staff/applications/:id/print` | Shared applicant-visible print policy |
| `/components` | Public gallery of production components |
| `/demo/reset` | Explicit reset, also unsigned and during startup recovery |
| Missing or forbidden destination | Neutral unavailable result, safe home or identity-switch action |

- Recheck access and state on protected entry and refresh. Keep field values, notes, reasons, and file content out of URLs. Language and step changes preserve in-memory input without saving. A decision deep link cannot restore an earlier confirmation.
- Queue search matches reference, applicant, and business. Filters cover status, product, and assignment. Sort by submission date newest/oldest or amount highest/lowest, always with a stable reference tie-breaker. Use five rows per page. Search/filter changes return to page one; clamp invalidated pages.
- Fresh queue visits restore filters and sort with empty search and page one. Default is all statuses, products, and assignments, submission date descending. Valid explicit query values take precedence. Back to queue restores the previous query/page. Empty results retain controls and offer clearing search/resetting filters; announce counts without moving focus.
- Use a five-step horizontal applicant form with spacious sections and an adjacent financing summary on wide screens, stacked on narrow screens. Keep incomplete steps reachable. Successful submission/resubmission opens detail with immediate confirmation and history. Validation focuses a linked summary whose links open the appropriate step and control.
- Keep current action, submitted data, documents, and public history distinct in applicant detail. Correction workspaces expose targets, reasons, baseline/date, response progress, and review summary. Label Preparing, Ready to save, Saved in draft/correction workspace, and Included in submitted information accurately.
- Use a labelled staff sidebar, counts/filters and readable table on wide screens. Narrow screens use equivalent cards with reference, applicant, business, product, amount, status, assignee, submission date, and Open. Compact navigation wraps. Review information/documents sit beside checks/notes on wide screens and stack with section links on narrow screens.
- Keep assessments, checks, and correction verification distinct. Explain which checks changed. Huda's amount-and-plan response resets four checks while retaining Operating history Passed. Notes save independently. Decision confirmation names applicant, reference, product, amount, term, reason, and outcome, with unmet prerequisites explained beside unavailable actions.
- Previews use a focused modal, nearly full-screen on mobile, with document label, visible Close, internal scrolling, Escape, and return focus. Printing uses a dedicated layout with appropriate pagination, readable long history, and headings kept with content where possible.

### Visual language, accessibility, and disclosure

- Carry forward Guided A and the رِفد / RIFD identity with its ascending three-bar mark. Use locally available Noto Sans Arabic and Noto Sans with bundled licenses, spacious Arabic line spacing, teal primary actions, pale green summaries, white panels, neutral background, dark text, muted borders, and rounded controls. Accepted reference tokens are accent #0b6458, page #f5f7f4, summary #e4efea, text #192f2c, and 15px panel radius. Refine sizing within that direction.
- Arabic is initial and persisted language can switch explicitly to English. Use logical start/end layouts and isolate identifiers, filenames, phones, amounts, and fractions. Display Western digits, Gregorian dates, translated month labels, and ر.ي. or YER. Preserve entered spelling, raw invalid input, active control, and caret where possible when switching.
- Both roles must work at 360, 390, 768, and 1440 CSS pixels, with 200% zoom checks, no page-wide overflow, and no primary action or error obscured by fixed UI. Written labels accompany statuses and errors; color is supplementary.
- Route and step changes focus headings. Validation focuses its linked summary. Dialogs contain focus, close with Escape where safe, and return focus. Save feedback uses a polite live region without stealing focus. Keep errors visible until addressed, mark busy states, and expose loading, empty, and recovery states accessibly.
- Build reusable fields, statuses, dialogs, tables/cards, and attachments as production components. The public gallery uses those same components and bilingual default, focus, error, busy, empty, and progress states.
- Keep a small bilingual fictional-demo/browser-save notice on application screens. The chooser explains simulated identities and permissions. Entry, product, and repayment views make the fictional scope visible. Explain that data and files stay in this site's browser profile, do not synchronize across devices/browsers, can disappear through clearing/private browsing/eviction, and can be inspected locally. Ask visitors to use fictional samples. No request reaches a bank, no identity is verified, and no payment is processed.

## Testing Decisions

### Accepted seams and prior art

The user accepted the complete test setup and requirement-to-evidence matrix in the [final implementation handoff][acceptance]. This spec carries that agreement forward. The primary integration seam is the public typed demo interface, exercising complete reads and operations against actual browser storage. Full browser journeys use the same operations through the real screens. Focused pure-domain tests cover rule boundaries and arithmetic without duplicating complete browser journeys.

There is no existing application or test suite whose seam can be reused. The resolved transition, access, dependency, operation, seed, and acceptance tables are the prior specification examples. The archived visual comparison and screen walkthrough supply design evidence, not storage, session, transaction, or final accessibility test results. Their code remains throwaway evidence and is not merged into the application.

A good test asserts externally observable behavior: the permitted projection, saved byte content after refresh, allowed state change, retained input after failure, or absence of duplicate effects. Avoid private storage-layout assertions, hook/component internals, broad snapshots, and tests that merely repeat implementation branches. Do not add separate seams for persistence or messaging. Browser integration may use a test-only entry point importing the same public interface; it must not ship as a product route or replace IndexedDB with mocks. Isolated corruption fixtures may prepare damaged storage without adding a production database-patch API.

Use Vitest for pure TypeScript domain tests and Playwright for real-browser interface integration and end-to-end journeys. Expose documented domain and browser commands alongside typecheck, lint, and build. Suggested commands are `pnpm test`, `pnpm test:browser`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`. Verify package compatibility, pin dependencies/browser revisions, document installation prerequisites, and retain failure traces/screenshots and final reports. Run browser journeys against the production static build with Hosting's fallback behavior.

### Required automated coverage

| Area | Required observable evidence |
| --- | --- |
| Transitions and access | Parameterize six states and supported actions with unsigned, wrong applicant, assigned, unassigned, and colleague-owned contexts. Verify refused writes have no successful version/file/history/notification/receipt effects and forbidden projections/previews expose no protected content. |
| Validation and comparison | Field/product boundaries, Unicode code-point limits, Arabic-Indic input, grouping, email/phone rules, frozen evidence month, normalized text changes, and identical bytes under another filename. Separate structural validation from substantive criteria. |
| Arithmetic and dependencies | Six-month boundary, positive surplus and exact 40% inequality, half-up markup, final-installment remainder, due dates, frozen schedule, and exact dependency reset. Use the accepted examples, including 100,010 YER rounding and Huda's amount-and-plan response. |
| Drafts and product switching | Restore invalid/incomplete raw input and actual saved file bytes after reload. Exercise cancel/confirm switch, invalid retained amount/term, captured save followed by more typing, failed save, and failed replacement retaining the old file. |
| Files | Check zero, 5,000,000, and 5,000,001 bytes, extension/MIME mismatch and empty MIME fallback. Distinguish selected, prepared, saved, and submitted references. Verify hashes/bytes after reload and authorization on preview reads. |
| Corrections | Request missing evidence on the prepared incomplete seed. Save privately while a reviewer retains the old snapshot. Reject unrequested or unchanged responses. Publish fields/files atomically, preserve assignee/unchanged outcomes, reset dependent checks, verify targets, and complete a repeated correction round. |
| Decision prerequisites | Refuse approval with any missing prerequisite and rejection without a failed substantive criterion. Require reason and confirmation in Under review. Cover terminal locks, permitted final notes, and approval's frozen terms/schedule. |
| Atomicity and retry | Inject a write abort into each atomic mutation family and prove no partial effects through public results. Check exact receipt replay, changed-intent identifier misuse, unknown-outcome inspection, and notification failure after successful commit without repeating the operation. |
| Concurrent tabs | Use two pages in the same browser context for shared records and independent tab sessions. Exercise shared/private revision races, private-save isolation, dirty newer-data notices, missed-broadcast activation refresh, preference conflicts, and stale permissions. Separate contexts isolate datasets and cannot stand in for the shared-tab journey. |
| Sessions | Use a controlled clock for actual fifteen-minute expiry, qualifying activity/nonactivity, expiry during preparation and pending mutation, committed-before-expiry response, same-identity recovery, explicit other-identity discard, and confirmation invalidation. No interrupted action replays. |
| Stale reassignment | Trigger Khaled's transfer, refuse the pending write, load latest, retain text, show read-only controls, reclaim through confirmation, inspect, and reconfirm the action. Also test a real simultaneous-tab race without the deliberate stale control. |
| Startup and reset | Test denied/unavailable storage, blocked upgrades, unsupported schema, damaged shapes/missing files, failed resource loading, and explicit retry. Test reset cancel/abort/success/replay, changed reset confirmation context, another tab's observation, and delayed old-dataset writes. |
| Queue, notifications, print, routing | Search/filter/sort/page behavior, stable ties, preference/query precedence, Back to queue, read-state ownership, old-notification links, applicant-visible print projection, stale-round/invalid-step/nonapproved-repayment fallbacks, forbidden neutral results, and gallery access. |
| Complete journeys | Complete first submission through approval, missing-document correction, field/file correction and repeat round, an actual new rejection, failure recovery, and loaded-demo offline use. Cover the required journeys in both languages. |

Run required journeys in installed stable Chrome through the `chrome` channel and pinned Playwright Firefox, with manual verification in current ordinary Chrome and Firefox. Run WebKit smoke checks for startup, save/restore, previews, corrections, decisions, and print-route content, and resolve failures in those required checks. Record versions and platform. Playwright Firefox/WebKit evidence does not establish ordinary Firefox automation or branded Safari support; mobile emulation does not establish physical-device support.

For an actual rejection demonstration, create a structurally valid Inventory application as Omar with an August 2026 operating-start month, supply all documents, submit normally, claim/start review, record Operating history Failed, and confirm rejection with a reason. The seeded historical rejection alone does not prove the action. Tests may prepare an equivalent isolated fixture, but the visitor UI gets no submission bypass.

### Manual and visual evidence

- Walk all seven journeys in Arabic and English for both roles at 360, 390, 768, and 1440 CSS pixels. Check mixed-direction names, long text, identifiers, phones, filenames, dates, amounts, table/card parity, loading, empty, and error states, plus 200% zoom.
- Perform keyboard-only application, correction, review, and decision flows. Inspect focus, error-summary links, dialog containment/Escape/return, departure guards, and live feedback. Record a screen-reader smoke pass for validation, saves, previews, and decisions with the actual browser/platform pairing. Do not infer full accessibility conformance from a score.
- Preview a real stored multipage PDF, JPEG, and PNG after refresh. Inspect mobile scrolling, labels, fallback, and protected-preview closure on expiry, identity change, and reset.
- Save and inspect print output for a saved Draft, active correction, and final application in both directions. Check clipping, pagination, long history, document labels, and exclusion of staff/private content. Compare both roles against the same policy.
- Exercise the slow/failure controls, two-tab private work, reassignment/reclaim, expiry, loaded-demo offline behavior, storage recovery, and reset with unfinished work. Verify retained buffers and files match the allowed recovery.
- Inspect the production component gallery in both languages, at narrow/wide widths, and by keyboard. Record each finding with release commit, browser version, viewport, language, result, and screenshot/report.

The accepted screen-flow walkthrough simulated files, persistence, sessions, and races. Its responsive rendering, mixed-direction legibility, keyboard behavior, and print pagination were not visually verified. These checks must be completed on the implemented build.

### Performance and static delivery gates

- Use a production build with recorded Node, dependency, browser, and Lighthouse versions and the documented mobile preset. Audit public products, applicant list, staff queue, and staff review detail in both languages, three runs per route/language. The median performance score for each combination must be at least 90, and CLS at most 0.1 in every run.
- Public product first-visit runs start with empty application storage. Protected routes use a prepared dataset and permitted active session, explicitly labelled prepared-session loads. Follow the accepted measurement protocol with the same signed-in Chrome tab, a hard-navigation Lighthouse user flow, storage reset disabled, and HTTP disk/memory caches cleared separately. Await the real workspace readiness marker and retain identity/route checks and screenshot with each report. Reject chooser, expired, wrong-screen, or misleading-ready measurements.
- Record fresh startup/resource preparation separately from prepared-session scores, along with hardware, network, and throttling conditions. Measure triggering input to rendered pending feedback for slow save, upload, submission, and decision examples. Feedback must appear within 100 ms. Mock completion delay remains separate from startup and feedback measurements.
- Build early and inspect the chosen Start version's actual static directory, assets, and generated shell. Configure classic Hosting from those outputs. Existing research's default shell name is not evidence for the eventual build. Required journeys must work with no running Start server, runtime server functions/routes, or eager browser initialization during shell generation.
- Check the production output with the Firebase Hosting emulator before preview deployment. Repeat direct entry and refresh on public products/gallery, applicant list/edit/correction/history/print/repayment, staff queue/review/request/decision/print/repayment, reset, root, and unavailable routes. Use relevant identities/states in both languages. Check sign-in return destinations, safe fallbacks, asset status/MIME, query behavior, language restoration, and absence of protected-data flashes.
- Use the accepted dedicated Firebase portfolio project, `rifd-review` preview channel, then its default live `web.app` site. Obtain account access, an available project identifier, site, and permissions when implementation reaches hosting. Record actual IDs, preview URL/expiry, live URL, release commit, and build directory. Repeat smoke checks on preview and live origins. This spec does not assume those resources or credentials already exist.

## Out of Scope

- Real financing decisions, actual bank product terms or staff procedures, identity verification, bank integrations, production authentication/authorization, server-backed persistence, and payment processing.
- Applicant withdrawal, reopening final decisions, direct reviewer edits to applicant data, and installment payment/completion controls.
- General side-by-side application version comparison, a second interactive reviewer, configurable review checklists, applicant-facing conversations, and an administrator role. Changed-target highlighting and the simulated colleague conflict remain required.
- Fresh offline launches, service-worker provisioning, background server synchronization, cross-device data sharing, and permanent browser-storage retention guarantees.
- Promoting prototype code into the application or treating simulated prototype behavior as verified implementation.
- Claiming Android, iPhone, Safari, or full accessibility conformance without the corresponding actual checks. Required responsive emulation and WebKit checks remain in scope.
- Building, provisioning, deploying, or publishing the application as part of this spec-writing task. Those are deliverables of implementing this spec. Implementation ticket slicing is a separate step.

## Further Notes

### Decision authority and readiness

The [planning map][map] is resolved and records no remaining in-scope decision. This spec synthesizes that accepted work without another interview. The user explicitly accepted the complete testing and delivery handoff on 2026-10-14, including the seams used here. Concrete dependency versions, generated build paths, account access, project-name availability, hosted URLs, and final measured results remain implementation facts to obtain, not unresolved product choices.

Use the [domain glossary][glossary] throughout implementation. The linked resolved Answers and accepted requirement-to-evidence matrix remain normative detail for this spec, including bilingual labels, exact fixture contents, dependency tables, error precedence, and reset receipt semantics. Earlier comments that defer to another ticket describe planning history; the final resolved decisions govern.

| Accepted source | Contract retained |
| --- | --- |
| [Application states and correction rules][workflow] | Transitions, private correction workspace, fixed baseline, verification, finality, public/internal history |
| [Products and application requirements][products] | Bilingual fields/documents, validation, fictional terms, review dependencies, arithmetic and core samples |
| [Demo access and reviewer assignment][access] | Role visibility, assignment, navigation guards, expiry, and stale recovery |
| [Browser persistence and simulated failures][persistence] | Complete operation, transaction, retry, storage, seed, session, reset, and failure contracts |
| [Bilingual visual direction][visual] | Guided A identity, typography, colors, responsive structure and preserved comparison |
| [Applicant and staff screen flows][screens] | Accepted routes, screen behavior, focus, printing, and recovery presentations |
| [Acceptance and implementation handoff][acceptance] | Full requirement-to-evidence matrix, checks, delivery destinations, order, and timed demo |
| [Browser-storage research decision][storage-research] and [research note][storage-note] | Recorded primary-source persistence and client-initialization facts |
| [Acceptance-tooling research decision][tooling-research] and [research note][tooling-note] | Browser/tool distinctions, measurement protocol, static delivery checks |
| [Original project brief][brief] and [portfolio context][context] | Full source scope and its researched public-service context |

Preserve these immutable local evidence pointers. They establish the reviewed artifacts; temporary worktree paths are only conveniences.

| Evidence | Local branch | Commit |
| --- | --- | --- |
| Visual comparison | `prototype/bilingual-visual-direction` | `37e6dbaf98d6f7084c5ebe14f08336689238f3af` |
| Reviewed screen walkthrough | `prototype/applicant-and-staff-screen-flows` | `b9e4f0d63c0cfa85d8a991b4947a49b3e7014b75` |
| Walkthrough acceptance documentation | `prototype/applicant-and-staff-screen-flows` | `498d045c1158413560865520ce7f1f6b68473a74` |
| Browser persistence research | `research/browser-persistence-contract` | `f9c1162449b0889f26532f1ba5df4fa4ebcc5f15` |
| Acceptance tooling research | `research/acceptance-tooling` | `942fd5298b87782dead0de73fe71d0eaeb8cfe8d` |

### Implementation order and completion

| Period | Work and exit evidence |
| --- | --- |
| Week 1 | Establish SPA, bilingual tokens/routes, and static build/fallback. Build pure domain and typed demo interface, seed files, startup, storage, revisions, and receipts. Complete a save/reload slice proving byte restoration, invalid-publication refusal, atomic failure, and browser initialization outside shell rendering. |
| Week 2 | Complete product comparison, five-step drafts/submission/documents/recovery, applicant detail/history/notifications/print, and independent sessions. Expand production components/gallery. Exit with first submission, bilingual applicant checks, and actual saved-file/print evidence. |
| Week 3 | Complete queue/preferences/assignment, assessments/checks/notes, missing-document and field/file corrections, repeated rounds, changed-target highlighting, decisions, stale conflict, expiry, and frozen repayment. Exit with all seven journeys and same-context two-tab tests. |
| Week 4 | Close remaining startup/schema/reset/unknown-outcome/offline coverage, resolve responsive/keyboard/preview/print findings, pass performance/static-hosting gates, release preview/live demo, and finish evidence, chaptered film, documentation, and case study. |

Storage, sessions, races, bilingual behavior, responsiveness, and keyboard checks begin with their implementation slices. Week 4 closes gaps. If a required gate fails, fix it or explicitly renegotiate the delivery schedule. Do not silently cut scope or label simulations as verified behavior.

Deliver the existing Git repository with a public GitHub remote connected during delivery if still absent. Check account access and record the actual repository URL at that stage. Include prerequisites and install/run/check/build instructions; architecture explaining domain, demo interface, browser persistence, and startup; identities, sample selection, controls, and reset guide; a user-flow sketch of states, role boundaries, corrections, assignment, and recovery; and an acceptance checklist linking every accepted matrix row to actual evidence.

The case study explains the fictional brief, Guided A bilingual choice, equal journey coverage, state/correction boundaries, browser-local reliability tradeoffs, measured results, and limitations. Include narrow applicant/wide staff screenshots, changed-target and conflict recovery examples, print evidence, and actual hosted/repository/demo links. Record device checks actually performed. A fresh browser profile can reproduce an independent dataset, but the documented normal recovery is explicit retry or confirmed demo reset.

### Equal journey demonstration

Export and time a 4:30 film with Arabic-first screens, an English switch, and bilingual chapter captions. Label moves between prepared records and identities. Editing may condense typing, delays, and setup while preserving intelligible before/after evidence. Never substitute staged success for an implemented action. The linked chapter guide covers longer paths and exact identities, records, samples, controls, and expected results.

| Time | Chapter and visible evidence |
| --- | --- |
| 0:00 to 0:10 | Introduce RIFD as a fictional bilingual browser-local portfolio demo |
| 0:10 to 0:45 | Products and application: comparison, restored draft, validation, review, valid submission |
| 0:45 to 1:20 | Documents and recovery: preparation versus save, preview, invalid file, failed replacement/save recovery |
| 1:20 to 1:55 | Tracking, notifications and print: own applications/action/history, linked read notification, print summary |
| 1:55 to 2:30 | Queue and assignment: search/filter/sort/page, saved preferences, claim or confirmed transfer without status change |
| 2:30 to 3:05 | Review and corrections: assessments/checks/notes, targeted reasons, private versus submitted response, resubmission, highlighting and rechecks |
| 3:05 to 3:40 | Decisions and repayment: stale refusal/recovery/reconfirmation, approval, actual rejection evidence, frozen upcoming/completed illustration |
| 3:40 to 4:15 | Access, sessions and reset: language/identity switching, expiry recovery, neutral forbidden view, gallery, confirmed browser-wide reset |
| 4:15 to 4:30 | Live demo, chapter guide, acceptance evidence, repository, and case study links |

The seven journey chapters receive thirty-five seconds each. The live demo, chapter guide, and evidence checklist provide fuller inspection. The accepted prototype tour does not prove the final film's duration or coverage. Completion requires linked evidence for every required acceptance row and the actual release/delivery artifacts.

[map]: map.md
[glossary]: ../../GLOSSARY.md
[workflow]: issues/01-application-states-and-corrections.md#answer
[products]: issues/02-products-and-application-requirements.md#answer
[access]: issues/03-demo-access-and-reviewer-assignment.md#answer
[persistence]: issues/04-browser-state-and-simulated-failures.md#answer
[visual]: issues/05-bilingual-visual-direction.md#answer
[screens]: issues/06-applicant-and-staff-screen-flows.md#answer
[acceptance]: issues/07-acceptance-and-implementation-handoff.md#answer
[storage-research]: issues/08-browser-storage-and-client-boundary-facts.md#answer
[tooling-research]: issues/09-acceptance-tooling-facts.md#answer
[storage-note]: ../../docs/research/browser-persistence-contract.md
[tooling-note]: ../../docs/research/acceptance-tooling.md
[brief]: ../../docs/project-options/01-financing-application-and-review.md
[context]: ../../docs/research/bank-portfolio-context.md
