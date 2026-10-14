# Define browser persistence and simulated failures

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Parent: [Plan the financing application and review platform](../map.md)
Blocked by: 02, 03, 08

## Question

What state ownership, persistence model, and typed asynchronous API contract make the whole demo resumable and keep applicant and staff views consistent?

Use the agreed workflow together with [Define fictional products and application requirements](02-products-and-application-requirements.md#answer) and [Define demo access and reviewer assignment](03-demo-access-and-reviewer-assignment.md#answer).

Translate the access ticket's identity, initial queue, assignment, unsaved-work, session, and conflict policies into the state and operation contract. Define inactivity detection, authorization checks for pending operations, and stale-versus-forbidden error handling without changing its agreed recovery behavior. Distinguish successful saved work from recoverable but unapplied input, and never replay a pending action automatically on sign-in or reload.

The resolved prerequisite [Verify browser storage and client initialization facts](08-browser-storage-and-client-boundary-facts.md#answer) supplies technical facts behind durable files, transactions, per-tab sessions, cross-tab notices, and SPA initialization. Its linked [research report](../../../docs/research/browser-persistence-contract.md) records primary sources and implementation traps.

Decide what lives in durable browser storage, the URL, or the current session. Cover drafts, submitted application snapshots, separate saved correction workspaces, document data and previews, fixed correction baselines, assignment, notes, activity, notification read state, repayment examples, language, and saved queue preferences. Resolve whether real local files are accepted or only sample attachments are used, and what survives refresh in either case.

Successful correction resubmission must publish corrected fields and attachments together, preserve assignment and unaffected review results, and require fresh verification of changed targets and dependent checks. Partial correction saves remain outside the reviewer-visible submitted snapshot. Define the operation contract that preserves these agreed workflow boundaries through failures and retries.

Use the product ticket's whole-rial arithmetic, five-check dependency map, four document slots per product, 5,000,000-byte file limit, read-only historical completion examples, and fixed domain demonstration date of 2026-10-14. Define how initial submission month and financial evidence windows remain stable, how field values normalize for meaningful-change comparison, and how the fixed domain date relates to activity timestamps and simulated session timers. Resolve stored versus derived repayment data while preserving the agreed calculated schedule.

Specify the boundaries between domain rules, mock operations, persistence, and UI state. Define operation inputs, outputs, validation errors, record versions, and the point at which a save or simulated upload counts as successful. Decide whether multiple tabs synchronize, how stale versions are detected, and how a partial or repeated operation avoids inconsistent status, history, and notifications.

Which deterministic controls reproduce latency, upload progress, failed draft saves, failed submissions, storage failure, session expiry, forbidden access, and the agreed stale-record conflict? Define recovery behavior and what the user retains after each failure. Decide whether offline behavior is supported and how the interface represents it.

Define seed data, reset scope, storage schema changes, and startup behavior for missing, outdated, or damaged saved data. Respect the existing research note's static hosting constraints, including build-time rendering of the SPA shell and client boundaries for browser storage. If a technical fact is still unknown, identify a focused research prerequisite before closing this ticket.

The answer should supply an operation and persistence contract plus a failure-and-recovery table that later implementation can follow.

## Comments

### Round one, accepted on 2026-10-14

The user answered "Yes to all" to these five recommendations:

- Accept both locally selected fictional test files and prepared sample attachments. Preserve PDF/JPEG/PNG and the 5,000,000-byte limit. Successfully saved attachments remain available for preview after refresh.
- Form progress saves explicitly through Save progress. Form-step navigation retains input in memory without saving it. Draft and partial-correction saves can retain incomplete or invalid input, with saving, saved, and failed feedback. Submission is separate and requires full validation.
- Saved changes synchronize across tabs, with independent demo identity and session per tab. Screens without unfinished work refresh after another tab commits. Screens with unfinished work retain that input and show that newer data exists. Conflicting writes are refused; there is no automatic merge or overwrite.
- An already-loaded demo continues browser-local reads and saves without a network connection. Fresh offline launches and queued server synchronization are outside scope. A failed simulated request never appears completed.
- A clearly labelled demo-controls panel supplies deterministic failures. Normal use has short delays and no random failures. Controls cover slower requests, the next failed save, submission or upload, storage failure, session expiry, forbidden access, and the agreed reassignment conflict. One-shot failures clear after the targeted attempt so retrying is predictable.

### Round two, accepted on 2026-10-14

The user answered "Yes to all" to these five recommendations:

- Successful simulated upload prepares a selected file in memory, ready to save. Save progress or Submit persists files and form values together. Before that the file is unsaved and the interface says so. Failed saves or replacements retain the previously saved attachment. Saving waits for pending uploads to finish.
- The URL holds application reference, form step, and queue search, filters, sort, and page. Entered fields, files, notes, and decision reasons never enter it. Browser preferences remember language and the reviewer's last filters and sort. Fresh queue visits restore those preferences with an empty search and page one.
- New submissions, decisions, and lifecycle events use the fixed domain date of 2026-10-14 and a stored event order. Historical seed dates remain intact. Session expiry, request delays, and relative save feedback use actual elapsed time. Refreshing on another date cannot change eligibility calculations or repayment dates.
- Correction comparison uses canonical numeric values after Arabic-Indic digit conversion and phone numbers without spaces or hyphens. Text comparison normalizes Unicode, whitespace, and letter case while preserving entered text for display. Formatting alone cannot satisfy a correction target; punctuation and wording changes count.
- Requested document replacement requires different file content. Reuploading identical bytes, including under a different filename, cannot satisfy the replacement target. A different prepared sample counts as replacement. Content difference proves change, not suitability; reviewer assessment remains required.

### Round three, accepted on 2026-10-14

The user answered "Yes to all" to these five recommendations:

- One IndexedDB database holds all durable demo data: saved forms, submitted snapshots, correction baselines, file bytes, review results, assignment, notes, history, notifications, preferences, and operation receipts. Preview URLs are recreated from stored files. Browser-only initialization shows a neutral startup screen until storage is ready.
- Saved drafts and correction workspaces have versions separate from the shared application record. Staff assignment and note changes do not block private correction saves. Submission and resubmission check the current shared record before publication. Staff writes check its version. Partial applicant saves do not make reviewer snapshots stale.
- A write commits its data change, saved files, affected review results, history, notifications, and operation receipt together. Success requires transaction completion. Repeating an operation identifier with the same payload returns its recorded outcome without duplicate effects; a changed payload requires a new identifier.
- Broadcast committed changes, then reread the database. Check for missed changes when a tab becomes active. Retain unfinished input with a newer-data notice, and update assignment permissions immediately. The deliberate stale-record demo temporarily retains its old workspace so the next write demonstrates refusal.
- Valid simulated sessions survive refresh through tab-local session storage. Keyboard or pointer interaction renews each tab's fifteen-minute timeout; background requests do not. A duplicated tab may initially inherit the identity and then operate independently. Check expiry and permission again before a write commits; refuse uncommitted interrupted work and never replay it automatically.

### Round four, accepted on 2026-10-14

The user answered "Yes to all" to the final six recommendations and confirmed the complete agreement needed to resolve this ticket:

- A pure domain module owns validation, transitions, comparisons, and calculations. One typed demo module owns asynchronous operations, permissions, persistence, versions, receipts, and role-filtered reads. Screens own navigation and unfinished input. Errors identify fields or slots. Handle expired sessions first, hide inaccessible record details, and report staleness before lost assignment for a reviewer who can still read the record.
- Count Unicode code points after trimming for text limits. Monetary input accepts plain digits or correctly grouped whole numbers using comma or Arabic thousands separator; reject decimals and malformed grouping. Optional email uses a simple ASCII check with one at-sign, a dotted domain, no whitespace, and maximum 254 characters. Files are nonempty, within the agreed size limit, and have an allowed extension. Supplied MIME must agree; empty MIME falls back to extension. Reviewer judgment determines content suitability.
- Freeze accepted terms and the generated repayment schedule together at approval. Derive completed, remaining, and upcoming totals from stored entries. Historical completion flags are prepared read-only data. Later dates and changed product definitions cannot rewrite an approved illustration.
- Seed empty storage, migrate only explicitly supported formats, and show recovery for damaged or unsupported data. Never silently erase it or use memory-only saving. Failed writes retain unfinished input and leave saved data unchanged. Offer retry and confirmed reset. Blocked upgrades ask other demo tabs to close their connection.
- Reset clears all applications, files, activity, notifications, receipts, preferences, and sessions, then restores the thirteen seed applications and Arabic default. Warn that unfinished work in every demo tab is discarded. A new dataset identifier prevents old requests from writing into reset data. A failed reset preserves the previous dataset.
- Load required sample files and main-journey assets before declaring readiness. Failed uploads retain their selected file; failed saves retain prepared files without another upload. Saving other form progress is allowed while an upload has failed, but that file stays unsaved and submission remains blocked. Save and leave requires unfinished uploads to be resolved or explicitly discarded. Arm one targeted failure at a time; slower latency is independent. Failed cross-tab notification does not turn a committed save into failure.

## Answer

Resolved on 2026-10-14 after the user accepted all twenty-one recommendations across four rounds. This is the persistence, typed-operation, and recovery contract for the fictional demo. It preserves [Define application states and correction rules](01-application-states-and-corrections.md#answer), [Define fictional products and application requirements](02-products-and-application-requirements.md#answer), and [Define demo access and reviewer assignment](03-demo-access-and-reviewer-assignment.md#answer).

[Verify browser storage and client initialization facts](08-browser-storage-and-client-boundary-facts.md#answer) supplies the primary-source prerequisite. Its [research report](../../../docs/research/browser-persistence-contract.md) documents transaction, file, session, messaging, and client-initialization facts. This resolution chooses application behavior; it does not implement it or select a storage wrapper.

### Modules and typed interface

- The domain module is pure. It validates saved-input shape and submission data, normalizes comparison values, enforces state and target rules, evaluates review prerequisites, determines changed dependencies, and calculates whole-rial schedules. It accepts the fixed domain date and frozen product rules explicitly and has no browser storage, timers, or UI effects.
- The demo module is the interface used by screens and integration tests. It supplies browser startup, typed reads, typed operations, and change subscription. It owns session context, simulated delays and upload progress, deterministic failures, persistence, version checks, operation receipts, and role-filtered results. Storage transactions and messaging remain inside its implementation.
- Typed operations form a discriminated union. Each variant requires its relevant payload, expected versions, and round or document identifiers. There is no public whole-database replacement or unrestricted application patch.
- Screens own unfinished form values, pending file selections, note and reason text, dialogs, navigation, and accessible presentation. They call complete operations rather than assembling storage writes or deciding permissions. Frontend validation can assist input, but the demo module checks the same rules before mutation.
- Reads return applicant, reviewer, or public projections and the versions needed by subsequent operations. The module resolves record and attachment access before returning content. Staff reads omit drafts and private correction work; applicant reads omit staff-only information. These are simulated permissions, not security guarantees against inspecting browser-local storage.

Each protected operation carries an operation identifier, dataset identifier, relevant expected revisions, and a typed payload. The module captures the current tab session and actor, rather than trusting a role supplied by a screen. Success returns the committed revisions, affected identifiers, save or lifecycle outcome, and a current permitted projection. Failures return a finite error kind, stable message key, and field or document-slot issues where applicable. UI copy is translated outside the domain module.

### State ownership

Use one IndexedDB database for all durable demo records. A logical schema version, seed version, product/calculation rule version, dataset identifier, and event sequence live in database metadata. Tab session storage contains only that tab's simulated session. The URL and in-memory buffers have the following roles.

| State | Owner and lifetime |
| --- | --- |
| Application identity, applicant relationship, status, current assignee, submitted snapshot, review outcomes, and verification | Durable database; shared application revision protects changes |
| Saved raw Draft input and its document references | Durable private workspace with its own revision; incomplete and invalid field input is allowed |
| Saved correction input and documents | Durable private workspace tied to its current correction round, separate from the submitted snapshot |
| Correction targets, reasons, fixed baseline, published response, and earlier rounds | Durable database; preserve immutable baseline and response records for history |
| Successfully saved attachment bytes and metadata | Durable database; snapshots, workspaces, and historical rounds refer to immutable files |
| Internal notes, internal activity, applicant lifecycle history | Durable database; visibility follows the access resolution |
| Applicant notifications and read flags | Durable database; own-applicant access and notification revision |
| Approved terms, frozen schedule, and prepared completion flags | Durable database; read-only illustration |
| Language and reviewer filters and sort | Durable preferences; default language Arabic, with versioned preference writes |
| Operation receipts | Durable database, scoped to dataset and actor, committed with the operation |
| Current identity, expiry, and last qualifying activity | Tab-local session storage; restore only a still-valid session for the current dataset |
| Application reference, form step, queue search, filters, sort, and page | Validated URL state; invalid values fall back to safe defaults |
| Unfinished input, selected or prepared unsaved files, notes and reasons, confirmations, upload progress, and failure controls | Current-tab memory; retain during recoverable errors, without promising survival of refresh |
| Blob preview URLs and read caches | Disposable memory; recreate from permitted stored bytes and invalidate from committed revisions |

Moving form steps changes URL and in-memory state, not saved progress. A fresh queue entry restores persisted filters and sort, clears search, and starts at page one. Explicit valid query parameters take precedence. The queue uses five rows per page; clamp a page that becomes invalid after filtering or committed changes. Exact routes, sort controls, and form-step presentation remain with the screen-flow prototype.

Keep field values, file bytes, notes, correction reasons, and decision reasons out of the URL. Restore saved form input and files after refresh; unfinished buffers and prepared-but-unsaved files are not restored automatically. Browser-level departure warnings are best-effort protection and do not turn unsaved input into durable state.

### Versions and protected records

- Every dataset has a new opaque identifier. Requests, sessions, prepared attachments, views, and receipts identify their dataset. A request from an earlier dataset cannot modify the current one.
- Shared application revision changes for publication, assignment, review start, document assessment, checklist or verification changes, correction requests, final decisions, and internal notes.
- Private workspace revision changes for saved draft or correction progress. Correction saves also identify the active round. Check current ownership, status, and round in the same transaction, but do not require an unchanged shared revision merely because assignment or notes changed.
- Submission and resubmission check both the private workspace and shared application revisions. Publication preserves the current assignee; it never writes an old assignment from form state.
- Notification read state and preferences have their own revisions. Reading a notification or changing language does not invalidate review work.
- A private save does not increment the shared application revision, add lifecycle activity, notify the applicant, or make a reviewer's submitted snapshot stale.

On conflicting private saves, retain the current unsaved input and require inspection of the latest saved workspace before retrying. Do not replace a stale expected revision silently or merge another tab's edits. Loading latest can show the new saved information while keeping the user's unapplied buffer separately; a subsequent replacement of saved progress is an explicit user action.

### Input validation and comparison

Preserve raw field input for Draft and correction saves, including incomplete or invalid values. Store the original entered spelling of names, addresses, and explanations for display. Validate submission according to the product ticket's ranges, text limits, required fields, and document requirements. Substantive financing concerns remain review criteria rather than extra submission-format blockers.

Use these deterministic normalization rules:

| Input | Validation and canonical comparison |
| --- | --- |
| Names, city, address, and purchase explanation | Count Unicode code points after surrounding whitespace trimming for limits. Compare NFC-normalized text with collapsed whitespace and lowercased letters. Fold Arabic-Indic digit spelling for comparison where text contains digits. Preserve punctuation, wording, accents, and Arabic diacritics; preserve entered text for display |
| Monetary input | Convert Arabic-Indic digits, trim outer whitespace, and accept plain digits or groups of exactly three digits following an initial group of one to three. Comma and Arabic thousands separator are equivalent. Remove valid grouping and compare whole-number values. Reject decimal separators, signs, exponent notation, and malformed groups at submission |
| Repayment term and month inputs | Normalize digits and parse the allowed integer term or valid Gregorian year-month. Compare parsed values, preserving raw invalid draft input |
| Mobile | Normalize digits; remove whitespace and hyphens; retain the optional leading plus. Apply the agreed nine-to-fifteen-digit rule and compare the canonical string |
| Optional email | Trim and require a simple ASCII local part, one at-sign, and a dotted domain of nonempty alphanumeric/hyphen labels, with alphanumeric label ends. No whitespace; maximum 254 characters. Empty is allowed. Compare lowercase values; deliverability is not checked |
| Document response | Compare actual byte-content hashes with the fixed target baseline, not filename, upload time, or preview URL |

Use canonical differences both for satisfying requested fields and for the product ticket's recheck dependency map. Formatting changes alone do not satisfy a target or reset checks. A requested field must be valid and canonically different. A requested missing file needs a successful addition; a requested replacement needs different content. Nonrequested fields and document slots remain locked, and product cannot change after first submission.

### Attachment preparation, save, and preview

Accept locally selected fictional test files and prepared demo samples. Each product has four slots and one current file per slot. Validate before simulated upload:

- File size is greater than zero and no more than 5,000,000 bytes.
- Extensions are .pdf, .jpg, .jpeg, or .png, case-insensitively.
- Supplied MIME agrees with the extension family: application/pdf, image/jpeg, or image/png. An empty MIME derives from the allowed extension. Unknown or mismatched MIME fails validation.
- The file can be read and prepared. Compute SHA-256 over the bytes before any storage transaction. This establishes content identity, not readability, authenticity, or suitability.

A successful simulated upload returns an opaque prepared-attachment reference held in the current tab, with bytes, content hash, filename, MIME, size, source, and the intended applicant/application/slot. It means Ready to save. It does not change a saved slot, reviewer assessment, or submitted snapshot.

Save progress, Submit, or Resubmit commits prepared files and the appropriate form values together. Saving waits for active uploads to finish. A failed upload retains its selection for explicit retry; it cannot satisfy a required slot. Other form progress and ready files can still be saved, retaining the old saved reference for the failed slot. The failed selection stays unsaved and keeps the departure warning active. Save and leave is available only after unfinished uploads are completed or explicitly discarded.

A failed save retains prepared files for retry without repeating upload preparation. Replacing a file retains the previous saved file until commit. A failed replacement does not delete it. Draft product switching confirms removal of an incompatible fourth-slot document and commits that removal with the next save or submission; common data and the three shared slots remain.

Persist bytes and metadata, not Blob URL strings. Recreate a preview URL after reading an authorized file; revoke it when the preview closes, the file changes, the identity leaves, or the dataset resets. Preserve file references used by submitted snapshots, correction baselines, responses, and historical rounds. A cleanup must not remove referenced evidence or offline sample-catalog assets.

Prepared samples visibly contain DEMO / تجريبي and the fictional information appropriate to their application. Distinct replacement samples have distinct bytes. An unreadable or unsuitable prepared sample may pass envelope checks and lead to reviewer corrections. Preview failure is separate from upload validity and save success; it does not silently delete the saved attachment.

### Domain dates and repayment storage

The domain date is always 2026-10-14. New submissions, decisions, and lifecycle events use that date, with a durable sequence to order same-date events. Preserve seed history dates. Use explicit domain dates and sequences rather than substituting the browser's current calendar date.

Initial submission freezes its year-month and the three preceding completed months. New submissions use October 2026 and July, August, and September evidence. The historical equipment record retains July submission and April, May, and June evidence. Corrections do not advance those windows.

Request delays, session expiry, and relative save feedback use real time, separate from domain dates. Record an actual successful-save timestamp for feedback. Changing the browser date or revisiting later does not alter eligibility periods, installment dates, application status, or completion flags.

Use the product ticket's whole-rial formula for review calculations. On approval, commit accepted amount, term, product and calculation rule version, markup, total, approval date, and generated installment rows together. Each row stores its amount, due date, and Upcoming or prepared Completed status. New approvals have all rows Upcoming; approval on 14 October starts installments on 15 November.

Freeze these rows. Derive completed amount, remaining amount, and upcoming/completed lists from the stored schedule. Do not recalculate an approved record from a subsequently changed product definition. The historical example retains eighteen installments of 72,000 YER, its first two Completed entries, completed total 144,000, and remaining total 1,152,000. No payment or completion mutation is exposed.

### Operation inputs and committed effects

The following names describe typed operation variants, not a chosen library. All protected operations use current session, dataset, access, and state checks. Relevant reads expose the expected revisions. A document reference always resolves through the permitted application's slot, workspace, or historical round rather than an unrestricted hash lookup.

| Operation family | Required input and version | Successful effect |
| --- | --- | --- |
| Prepare attachment | Applicant context, intended application/slot, local file or sample identifier | Progress followed by a memory-only prepared reference; no database mutation |
| Save Draft | Application identifier, raw form/product, saved document references and ready replacements, expected workspace revision | Atomically create or replace its private saved workspace and files; incomplete or invalid fields are allowed; no lifecycle event |
| Save corrections | Application and round identifiers, requested raw field changes and ready document changes, expected workspace revision | Save permitted targets privately; preserve submitted snapshot, baseline, shared revision, and reviewer outcomes |
| Submit | Current complete form and document selection, expected workspace and shared revisions | Save/publish together; freeze first-submission month and evidence window; enter Submitted; supplied documents start Awaiting review; create one submission history event and receipt |
| Resubmit | Round identifier, complete requested response, expected workspace and shared revisions | Publish fields and files together; enter Under review; preserve assignment and unaffected assessments/checks; reset affected checks and verification; create one resubmission history event and receipt |
| Assign or unassign | Target reviewer or no reviewer, expected shared revision, confirmed transfer where needed | Apply the access ticket's state rules; preserve status and existing review work; create internal assignment activity |
| Start review | Expected shared revision | Assigned reviewer changes Submitted to Under review and records review-start history |
| Assess document | Slot and current document reference, Accepted or Needs replacement, replacement reason where required, expected shared revision | Update the current assessment and internal activity; acceptance of a requested published replacement verifies its document target |
| Record check or field verification | Check or requested field identifier, result, current round where applicable, expected shared revision | Enforce the product rules and current response; update result and internal activity; cannot override a failing numeric criterion to Passed |
| Request corrections | Nonempty specific field/document targets with individual reasons, expected shared revision | Capture fixed baseline and round, open private response workspace, enter Corrections requested, append history and one applicant notification |
| Approve or reject | Decision reason, renewed explicit confirmation, expected shared revision | Enforce all decision prerequisites; record final state, reason, history, notification, and immutable repayment data for approval |
| Add internal note | Nonempty note and expected shared revision | Assigned reviewer appends one internal note/activity item in an allowed state without changing a final decision |
| Mark notification read | Applicant's notification identifier and expected notification revision | Update only its read state; no application revision or lifecycle change |
| Save preferences | Supported language or queue preference change and expected preference revision | Versioned durable preference change; no application revision |
| Simulate colleague reassignment | Selectable reviewer context, eligible Under review application, expected shared revision | Assign to colleague and append identified simulated internal transfer; deliberately retain the initiating workspace's stale view |
| Reset demo | Current dataset identifier or module-issued startup recovery context, operation identifier, and explicit reset confirmation | Atomically replace demo data with seed data and a new dataset identifier; expire tab contexts after success; no signed-in identity is required |

Retire a private workspace when its information is published. Preserve the submitted response and earlier round records, rather than exposing a now-editable copy as though corrections were still open. A later request creates a fresh workspace and baseline.

On correction publication:

1. Build the response from the current submitted snapshot plus only requested changes. Reject attempts to change unrequested fields, documents, or product.
2. Require valid, canonically changed requested fields and successfully prepared additions or different-content replacements. Validate the whole resulting application.
3. Publish all changed fields and documents in the same transaction. Added/replaced files become Awaiting review; untouched assessments remain.
4. Reset affected checks to Unchecked using the product ticket's exact dependency map. Keep unaffected results. Requested field changes require fresh verification; requested document acceptance verifies the document target later.
5. Preserve current assignment and initial financial window. Return directly to Under review and write one resubmission event. Do not mark the correction response automatically verified.

### Transaction and retry contract

One command either commits its complete effects or commits none of them. Complete artificial latency, sample fetching, file reads, and hashing before opening a short IndexedDB transaction. Include metadata, relevant records, files, activity, notifications, and receipt stores in the transaction scope needed by the command.

Inside the transaction:

1. For protected commands, check the captured session first, then the current dataset. Check permitted reading access before exposing record details. Public preferences and the reset recovery action use their own context checks; the reset/replay exception is specified below.
2. Look for a receipt belonging to this dataset, actor, and operation identifier. Identical intent returns the recorded outcome and a current permitted view without repeating its effects. Reusing an identifier for a different command or payload is a typed error.
3. Read and compare expected versions in this transaction. For readable records, report stale versions before the lost-assignment write denial. Then check current assignment, state, targets, and domain prerequisites.
4. Recheck session validity immediately before applying the mutation. An expiry or identity change invalidates pending authority and aborts an uncommitted transaction where it is still active.
5. Apply all planned changes, allocate event order, and record the successful operation receipt together. Resolve saved or completed feedback only on transaction completion.
6. Update the initiating tab and announce changed identifiers/revisions after commit. A notification failure does not undo or misreport the committed operation.

An operation receipt contains the operation kind, actor, dataset, intent fingerprint, affected identifiers, and resulting revisions. Fingerprints use stable raw payload values and file hashes/metadata, not Blob URLs, upload progress, or a session's transient token. A changed intent or an explicit retry after inspecting a newer record uses a new operation identifier. An unchanged retry of an uncertain or failed attempt retains its identifier.

Distinguish confirmed abort from an unknown outcome. When completion could not be observed, inspect the latest permitted state and any retained receipt before claiming failure or retrying. Never claim that an already committed save failed because its view update or broadcast failed. Startup and sign-in do not automatically resend pending commands.

A save commits the captured payload. Input typed after the user starts saving remains unfinished; success updates its saved baseline without overwriting those later edits. Ignore late attachment results for a selection, slot, identity, or dataset that has since changed. Disable duplicate submission and decision actions while pending, while preserving recoverable input.

### Error precedence and recovery

Use typed error kinds, with no successful state change implied by rejection:

- SessionExpired or SessionUnavailable blocks protected access and requires session recovery.
- Forbidden and NotFound have the same user-facing unavailable result when revealing details would expose another applicant's record or a staff-inaccessible draft.
- StaleRecord, StaleWorkspace, StalePreferences, and SupersededDataset identify the relevant reload or reset recovery. Only authorized readers receive current record/version information.
- Validation identifies stable fields or document slots, including invalid input, unchanged targets, unsupported files, and duplicate-operation misuse.
- InvalidState or PermissionDenied refuses an otherwise readable action whose current state, assignment, or target permissions do not allow it.
- UploadFailed, RequestFailed, StorageFailure, and StartupUnavailable describe failed preparation or confirmed noncommitted operations. An uncertain completion uses OutcomeUnknown and receipt/state inspection.

For the agreed reassignment demonstration, a readable stale application returns StaleRecord rather than concealing the conflict behind a generic write denial. Load latest shows the new assignee and transfer, makes review controls read-only, retains unapplied text, and invalidates earlier decision confirmation. Explicit reclaiming, inspection, and a permitted retry follow the access resolution.

| Failure or interruption | Saved-state effect | Retained work and next action |
| --- | --- | --- |
| Field, target, or file-envelope validation fails | No publication or mutation | Keep input/selection; show field or slot issues; correct them before retry |
| Simulated upload fails | Saved slot unchanged | Retain selection and mark failed; retry explicitly or discard; no submission while a required selection is failed |
| Progress save fails | Prior workspace and files unchanged | Keep input and ready files; retry saving without another upload |
| Submission or resubmission fails | Prior status, submitted snapshot, workspace, history, and notifications unchanged by this attempt | Keep full response and ready files; retry explicitly after required corrections |
| Native or simulated storage write failure | Confirmed abort commits no partial effects | Keep unfinished input, report not saved, and offer retry; storage capacity or access may need recovery |
| Shared record becomes stale | This attempt commits nothing; outside changes remain | Load latest permitted record, preserve unapplied text, inspect state/assignment, and retry with a new intent where allowed |
| Private workspace or preference becomes stale | This attempt commits nothing | Keep desired values; inspect latest saved state; explicitly apply a new intent rather than merge automatically |
| Session expires before commit | Uncommitted work is refused/aborted; earlier committed work remains saved | Cover protected content; same identity can recover current-tab input after sign-in; another identity requires explicit discard |
| Record is forbidden or unavailable | No mutation or protected record content | Offer current identity's home or explicit identity switch |
| Preview cannot render | Stored file remains intact | Show preview recovery and permitted open/download alternative; reviewer can still request a suitable replacement |
| Cross-tab notification fails after commit | Operation remains successful | Reread on activation or explicit refresh; do not repeat the mutation to repair notification |
| Completion is unknown | Do not assert either rollback or success without checking | Inspect latest state/receipt; explicitly retry the same unchanged intent only when appropriate |
| Database is blocked, unavailable, damaged, or unsupported at startup | Preserve existing data | Show neutral recovery, retry, or confirmed reset; no silent memory-only save |
| Reset fails | Previous dataset remains intact | Keep previous buffers/session context where still valid; report failure and retry after recovery |
| Another tab successfully resets | New seed dataset is authoritative | Discard old buffers, files, caches, confirmations, failure controls, and sessions once observed; old requests are refused |

### Tab sessions and synchronization

Restore the tab's identity only if its dataset matches and the actual expiry has not passed. Session storage can initially be copied into an opener-created or duplicated tab; show the selected identity prominently, and maintain independent subsequent session activity. A browser runtime/session generation prevents a delayed result from an earlier sign-in from affecting a newer identity.

Keyboard and pointer interaction within the application renew the fifteen-minute timeout. Mouse movement, request completion, broadcasts, and background polling do not. Check expiry before renewing on return to a tab, on each protected operation, and before mutation. A timer provides prompt visual expiry; activation checks catch background timer delays. Never use the fixed financial date as the session clock.

On expiry, protect the current screen and preview entry points, retain unfinished buffers privately in current-tab memory, and invalidate pending confirmations. Saved data stays durable. After the same identity signs in, reread current versions and permissions before restoring the permitted screen. Do not auto-save, publish, or retry. An operation that committed before expiry remains committed even if its response arrives after the screen locks.

Use BroadcastChannel for committed-change hints. Messages contain dataset and affected identifiers/revisions, not applicant fields, file bytes, internal notes, or role-projected records. Reread IndexedDB on a relevant hint, browser startup, and tab activation. A safe storage-event hint can be a fallback; neither mechanism replaces transaction version checks.

Clean views update from the new permitted projection. Dirty views retain their buffers with a newer-data notice while refreshing permission and assignment information. Reviewer reads remain on shared snapshots; private correction saves do not invalidate them. The explicit stale-record control holds only its initiating application view until the rejected attempt and Load latest; other tabs receive the committed change normally.

### Deterministic controls

Expose a labelled demo-controls panel with current mode and clear scope. Keep controls in current-tab memory. Defaults have no random failures. Use implementation presets of 400 ms for normal mocked requests and 1,500 ms for slow requests; uploads use 1,200 ms or 4,000 ms simulated progress before preparation completes. Actual storage time is additional, and progress reaches Ready to save only after preparation succeeds.

| Control | Target and consumption |
| --- | --- |
| Slow requests | Independent preset until changed, refresh, or reset; delays occur before transactions |
| Fail next progress save | Next eligible Draft or correction-workspace save |
| Fail next submission | Next eligible initial submission or correction resubmission |
| Fail next upload | Next valid attachment preparation; fail at a fixed progress point, retaining selection |
| Fail next storage write | Next eligible application mutation or reset; abort before committing effects; preference changes do not consume it |
| Expire session | Immediately invalidate current session and uncommitted authority; exercise agreed recovery |
| Forbidden example | Navigate through the normal unsaved-work guard to another applicant's record, or a staff-inaccessible draft; reveal no details |
| Simulate colleague reassignment | Eligible Under review application assigned to the selectable reviewer; execute the agreed internal transfer while retaining its stale initiating view |

Arm only one targeted one-shot failure at a time. Consume it on the next eligible, authorized, nonduplicate attempt in its category, after required validation/version checks. Invalid input, an idempotent replay, and unrelated operations do not consume it. After the failed attempt, an explicit retry runs normally unless the user arms another failure. Reset restores normal controls.

### Startup, offline behavior, and reset

Start SPA shell rendering must not open storage, restore a session, seed records, or initialize messaging at module import or during prerendering. Browser startup opens storage, checks the schema and record shapes/references, loads preferences, restores a valid tab session, and prepares required resources behind a neutral loading screen.

Version one has one documented seed format and calculation rule set. Seed a genuinely empty database atomically. Run migrations only for formats with an explicit supported transformation. A damaged shape, missing referenced file, or unsupported format shows recovery without silently deleting or reseeding existing data. Invalid but well-shaped draft input and the explicitly incomplete submitted seed are allowed records, not corruption.

Close connections on versionchange and show upgrade coordination when another tab blocks opening or changing the schema. Handle synchronous storage denial, failed opens, transaction aborts, unexpected closure, and unavailable session storage. Protected flows require recovery when the necessary storage is unavailable; public products and gallery remain accessible where their assets are available.

Load prepared sample bytes, replacement variants, and required main-journey assets before declaring readiness. Store the sample catalog and seeded document bytes locally so later selection and preview do not fetch missing files during an offline journey. Startup resource failure offers retry rather than a misleading Ready state.

After readiness, local reads and writes do not depend on network availability. Going offline does not by itself mark a local operation failed or queue a server action. Fresh offline launches, service-worker provisioning, and background server synchronization are outside this effort. Cache or browser storage can be deleted or evicted; local persistence is not a permanent-retention guarantee.

Reset is an explicit, confirmed browser-wide demo action, available from the unsigned chooser and startup recovery as well as the signed-in demo. It does not require or grant a protected session. Its warning names all applications and files, preferences, sessions, and unfinished work in every open demo tab. Prepare complete seed bytes before mutation. Use an atomic reset transaction; if schema rebuilding is needed, use a version-change transaction that can roll back, rather than a standalone destructive delete followed by nontransactional reseeding.

Clear the previous dataset's domain records, files, catalog, activity, notifications, read flags, receipts, and preferences, then seed all thirteen applications, sample assets, Arabic language, and default queue preferences with a new dataset identifier. A new reset receipt records its outcome. The current metadata can recognize an immediate repeat of that same reset intent without resetting again; an older superseded intent cannot erase later work.

Reset is the explicit exception to normal session/dataset-first receipt lookup. The module binds confirmation to the captured dataset, or to a startup recovery context identifying the observed database version and metadata state when no valid dataset identifier can be read. Inside the reset transaction, first recognize an exact match with the current metadata's last reset receipt, including operation identifier, original context, and intent fingerprint. Return that already-completed reset outcome without requiring the expired previous session or matching the old identifier to the new dataset. This public outcome contains no application details.

If no matching receipt exists, recheck the captured dataset or recovery context before resetting. A changed dataset or repaired/replaced recovery context requires a new inspection and confirmation, rather than clearing newer data. Commit the new seed dataset and minimal last-reset receipt together. Storage denial or a blocked schema change still prevents reset and offers recovery; no destructive step occurs outside the rollback-capable transaction.

Only after reset commits should tabs clear their buffers, preview URLs, cached projections, dialogs, confirmations, failure controls, and session storage, then show the identity chooser. Other tabs act on the confirmed new identifier after a hint or activation check. Every operation checks dataset identity in its transaction, and every late response is ignored if its dataset/session no longer matches.

### Seed identities and complete initial queue

These fictional labels complete the previously agreed identity relationships. Applicant record ownership is its stable identity reference, independent of editable application name text. Changing a name on one application does not rename the profile or another application.

| Identity reference | Arabic / English chooser or staff label | Profile defaults |
| --- | --- | --- |
| Applicant A | مريم سالم / Mariam Salem | +000000000001; mariam@example.test; عدن |
| Applicant B | هدى علي / Huda Ali | +000000000002; huda@example.test; عدن |
| Applicant C | عمر حسن / Omar Hassan | +000000000003; omar@example.test; عدن |
| Reviewer R | سلمى ناصر / Salma Nasser | The selectable reviewer |
| Colleague K | خالد علي / Khaled Ali | Internal simulated reviewer, omitted from identity chooser |

Preserve the six core records and business facts from the product ticket, with applicant fields and identity evidence reflecting these ownership relationships. Mariam owns the Draft, complete equipment submission, and historical approval. Huda owns the missing-financial-evidence submission and amount/stock-plan correction response. Omar owns the young-business rejection.

Seed the incomplete Draft with its four prepared files privately saved and the purchase explanation still empty, supporting restoration and the confirmed fourth-document product-switch warning. It has no submitted snapshot or reviewer-visible assessments. The missing-financial Submitted record is the one explicit prepared incomplete-submission exception; normal operations cannot request that bypass.

The seven additional records are as follows. Amount and budget are whole YER. All use October submission and July–September financial evidence. Inventory defaults are revenue 700,000 and expenses 500,000; Equipment defaults are revenue 900,000 and expenses 650,000. Use the relevant product purpose text and document templates, with the actual applicant, business, budget, and financial figures in their fictional content.

| Additional record | Applicant / business | Product; amount / budget; term | Initial state / assignee | Submission and review context |
| --- | --- | --- | --- | --- |
| Equipment review in progress | Mariam; ورشة المدار التجريبية; Services; operating since 2024-03 | Equipment; 900,000 / 1,100,000; 12 months | Under review / R | Submit 2026-10-06, start review 2026-10-07; identity/business Accepted, other documents Awaiting review; Operating history Passed, others Unchecked |
| Inventory review with colleague | Huda; متجر النخيل التجريبي; Retail; since 2025-01 | Inventory; 500,000 / 650,000; 12 months | Under review / K | Submit 2026-10-06, start 2026-10-07; business evidence Accepted, other documents Awaiting review; Operating history Passed, others Unchecked |
| Equipment review for production | Omar; ورشة الأفق التجريبية; Small production; since 2024-02 | Equipment; 700,000 / 900,000; 18 months | Under review / R | Submit 2026-10-07, start 2026-10-08; four documents Awaiting review; checks Unchecked |
| Inventory awaiting assignment | Mariam; متجر السهل التجريبي; Retail; since 2025-01 | Inventory; 400,000 / 500,000; 12 months | Submitted / Unassigned | Submit 2026-10-08; four documents Awaiting review; checks Unchecked |
| Equipment submitted to colleague | Huda; مطبعة البيان التجريبية; Services; since 2024-01 | Equipment; 800,000 / 1,000,000; 18 months | Submitted / K | Submit 2026-10-09; four documents Awaiting review; checks Unchecked |
| Financial evidence replacement | Huda; متجر الندى التجريبي; Retail; since 2025-01 | Inventory; 350,000 / 450,000; 6 months | Corrections requested / R | Submit 2026-10-09, review and request 2026-10-10; unreadable financial summary Needs replacement, others Accepted; Operating history Passed, others Unchecked |
| Supplier quotation replacement | Omar; ورشة الأفق التجريبية; Small production; since 2024-02 | Equipment; 1,000,000 / 1,200,000; 24 months | Corrections requested / K | Submit 2026-10-09, review and request 2026-10-11; unreadable quotation Needs replacement, others Accepted; Operating history Passed, others Unchecked |

The financial-summary request asks for a readable July–September summary supporting the declared averages. The quotation request asks for readable equipment and total-cost evidence. Both target only that document, retain a fixed baseline, and start with no changed private response. Provide appropriate distinct readable replacement samples. Neither record requires an incomplete-submission exception.

Seed submission, assignment, review, assessment, checklist, request, and decision activity consistently with each state and date. Keep the core correction reasons, 600,000-to-450,000 response, historical installment completion, and two-month rejection intact. Shared lifecycle entries omit staff identities; assignment and assessment details remain internal.

Initial applicant notifications are unread: Mariam has the historical approval, Huda has the two active correction requests, and Omar has the rejection and active quotation request. Submission/resubmission do not add notification-list items. Initial active correction workspaces copy their submitted values and references without satisfying any target.

The result is thirteen applications, with applicant totals five, five, and three. The staff queue excludes the Draft and has twelve records: four Submitted, three Under review, three Corrections requested, one Approved, and one Rejected. Assignments are seven R, three K, and two unassigned, exactly as settled in the access ticket. Default queue preferences are all statuses and submission date descending, with a stable application-reference tie-breaker, empty search, and page one.

Prepared sample catalog entries cover required valid files, unreadable originals, matching readable replacements, invalid-type, empty, oversized, and identical-content examples. Rejection examples fail before file preparation as appropriate. Keep all sample evidence fictional and visibly identified; no real bank documents or uploads are required.

### Remaining prototype and handoff checks

The research prerequisite is resolved, and no new in-scope decision needs a ticket from this answer. The existing bilingual prototype fog remains until the walkthrough exposes concrete issues.

- [Choose the bilingual visual direction](05-bilingual-visual-direction.md) remains the next open, unblocked decision. This contract supplies states and copy distinctions, not a visual design.
- [Validate applicant and staff screen flows](06-applicant-and-staff-screen-flows.md) validates ready-versus-saved upload feedback, preserved invalid input, multi-tab changes, assignment permission changes, expiry recovery, final confirmation renewal, reset, offline readiness, accessible errors, and previews in both languages.
- [Define acceptance evidence and the implementation handoff](07-acceptance-and-implementation-handoff.md) chooses the focused test setup and delivery evidence. Cover file-byte restoration, failed replacement, private-save isolation, atomic correction publication, dependency reset, stale writes, receipt replay, expiry during a pending write, reset with old requests, schema/storage recovery, and notification failure after commit through the agreed interface.
- The eventual implementation verifies the selected Start build's shell and output directory, supported browser storage and hashing, simultaneous-tab transactions, preview fallbacks, and static deep-link refresh. Keep browser initialization outside prerendering and preserve classic static Hosting compatibility.

No application code, dependency installation, deployment, or actual financing action was performed during this resolution.
