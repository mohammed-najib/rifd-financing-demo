# Browser demo architecture

The [specification](../../.scratch/financing-application-and-review/spec.md) and [accepted browser contract](../../.scratch/financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer) govern the implementation. The first fifteen slices provide startup, authorized reads, canonical field validation, five-step drafts, session and tab recovery, atomic first submission, notifications, printing, the staff queue, assignment, review start, document assessments, checks, internal notes targeted correction requests and private correction responses, atomic resubmission and correction verification. Final decisions use the same transaction, authority and receipt boundaries.

## Modules

| Module | Responsibility |
| --- | --- |
| `packages/rifd-domain/src`, re-exported through `src/domain` | Typed stored shapes, fictional product rules, read and review permissions, exact review criteria/dependencies and explicit-date whole-rial repayment calculation. The npm package ships versioned Agent Skills beside their source guides. No browser storage, timers or navigation. |
| `src/demo/index.ts` | Public asynchronous startup, context, sign-in/out, language, draft and submission operations, preparation, receipt inspection, role-filtered reads, deterministic controls and subscriptions. |
| `src/demo/commands.ts` | Private runtime command shapes and stable intent fingerprints. |
| `src/demo/review.ts` | Private validation and complete effects for document assessments, fixed checks and notes, called inside the existing application transaction. |
| `src/demo/storage.ts` | Private IndexedDB opening, validation, reads and transaction completion. Product screens never import this module. |
| `src/demo/seed-manifest.ts`, `seed.ts`, `evidence.ts` | Canonical scenario facts and preparation of locally rendered, hashed PNG, JPEG and multipage PDF bytes and catalog variants. |
| `src/ui` | Screen loading, navigation, feedback, bilingual read presentation, responsive table/card views and identity controls. |
| `src/routes`, `router.tsx` | Start SPA shell and normal browser paths. The current slice validates supported paths within the shared read screen. |

`claimApplication`, `transferApplication`, `unassignApplication` and `startReview`
are explicit staff commands carrying the application, dataset, operation identifier
and expected shared revision. Transfer also binds confirmation to the outgoing and
incoming reviewer. The transaction checks captured session, dataset and reading
access, then receipt, shared revision, reviewer assignment and permitted state.
Readable stale records therefore report `staleRecord` before a lost-assignment
denial. Session validity is checked again after the staged write.

Assignment changes increment the shared revision and add one internal `assigned`
event. They preserve status, snapshots, workspaces, all review work, public history
and notifications. Start review requires Salma's assignment on Submitted, changes
status to Under review and adds one `reviewStarted` event to both public history
and internal activity with the same identifier and sequence. Neither creates a
notification. Staff receipts share the existing actor-scoped mutation namespace
and store the shared revision without an unrelated workspace revision. Existing
draft/submission receipts retain their original schema and remain readable.

Staff reads project current permissions through the pure `reviewPermissions`
rule. Screens refresh them on committed notices and activation. Open transfer
confirmations bind to the inspected revision and close when it changes. Refused
or uncertain actions disable further writes until explicit receipt/current-record
inspection. Confirmed aborts also allow an explicit retry of the retained intent.
The protected screen's session key clears assignment confirmations on expiry.

Document assessment also requires an explicit `inspection` input. Staff reads
return a versioned context token for each supplied source. The token binds the
reviewer, dataset, application, slot, stored file identity and SHA-256 hash,
relevant declarations, publication events and assignment events. The review
transaction compares it with the current authorized state. Reassignment away and
back and resubmission invalidate it; an unrelated note does not. Expected shared
revisions still apply. Source preview never confirms inspection. The alternate
`unableToOpen` input permits only Needs replacement with a nonempty explanation
in both languages. Screens collect this separately from inspection and assessment.

Assessment fingerprints include the inspection input. Commands without it are
parsed only for exact replay or inspection of an existing historical receipt.
They cannot create a new assessment. Reusing an operation identifier across old
and new intents fails without effects. Stored assessments and receipts retain
their existing financing schema; historical assessments acquire no inspection
claim.

The public `Demo` interface returns `Result<T>` with finite error kinds and translation keys. `setLanguage` and reviewer-only `setQueuePreferences` carry the dataset, operation identifier, preference revision and desired values. `inspectPreferenceOperation` checks the actor-scoped receipt and reads the current committed context. `newDraft` creates a tab-local, owner-scoped in-memory draft and performs no durable write. Its UUID-based application reference stays stable after saving, while the seed references retain their short numeric suffixes. Workspace revision zero identifies unsaved creation. `saveDraft` carries the dataset, application, operation identifier, workspace revision, raw form/product and saved or prepared document choices. It has no database replacement, arbitrary patch, caller-supplied actor or submission bypass. Session operations capture identity in the current tab. Future applicant and reviewer mutations must add their own typed commands and complete effects here.

`requestCorrections` carries a nonempty set of distinct field/document targets,
individual reasons and explicit confirmation with the expected shared revision.
The pure target schema permits only `Fields` keys and the four document slots.
Product and derived values are excluded. Requesting one target never expands
its dependencies. The application transaction appends a round with a cloned
submitted baseline and unverified targets, creates an unchanged private workspace,
enters Corrections requested and commits one public history event, internal
activity item, applicant notification and staff receipt. Review outcomes,
assignment and the initial evidence window stay intact. Exact replay produces no
additional effects. Assigned staff can read and save notes while review is paused.

`src/ui/correction-request.tsx` owns inspection and confirmation separately from
its retained target/reason buffer. The App scopes that buffer by dataset, identity
and application. Expiry or a newer shared revision invalidates confirmation.
Inspection resolves uncertain outcomes or establishes a fresh revision without
sending. Departure never sends or saves a request. Applicant detail, history and
print reuse the public target projection and exclude verification and notes.

`saveCorrections` carries the application, active round, private workspace revision,
raw fields, fixed product and saved/prepared document choices. It shares the atomic
progress-save transaction, failure controls and receipt inspection with drafts.
The transaction checks current ownership, active state/round and target permissions.
Unrequested raw fields and document references must match the fixed round baseline.
Private saves update only workspace revision/time, its snapshot, ready file bytes
and the receipt. They do not compare or increment the shared revision, so notes
and reassignment cannot invalidate an otherwise current private save.

Applicant projections expose private workspace document metadata separately from
submitted documents. Staff and print projections omit it. The shared editor uses
that explicit workspace projection for correction edits, saved previews, reload,
conflict inspection and retained input. Its correction mode shows only requested
controls and a read-only response summary beside the public submitted record.
Round-bound links and retained buffers cannot reopen an obsolete workspace.

## Styling

Tailwind CSS 4.3.3 runs through the dedicated Vite plugin in the application and browser API harness. The shared stylesheet defines Guided A theme tokens, retained base defaults and reusable component skins. Screen layouts use utilities with explicit status-class maps. Source detection covers `src`; archived prototypes and documentation do not contribute utilities.

Preflight is omitted. The local fonts, 15px root typography, logical RTL/LTR spacing and inclusive 767px/1199px responsive cutoffs remain the design contract. The root route retains its compiled stylesheet URL in the static shell. See [styling conventions](../../README.md#styling) and [migration evidence](tailwind-v4.md) before extending the UI.

## Storage and authority

Startup accepts physical IndexedDB version 1, or a higher version with the
canonical store layout and a committed reset marker, and logical schema, seed and
rule versions 1. It checks shapes, ownership, file references, byte lengths and hashes,
event-sequence bounds and every canonical/replacement catalog entry. Raw invalid
draft strings and the explicitly incomplete Submitted seed remain valid stored
records. The supported additive transformations supply absent mutation receipts
and restore absent catalog product labels from the original seed manifest.
Storage also supports lossless `rifd-zero-v1` byte descriptors for all-zero
buffers from 65,536 through 5,000,001 bytes. The encoder checks every word and
trailing byte. Decoding checks the exact keys, version and bounded integer length
before allocating real bytes, then performs the existing validation and startup
hash checks. Legacy raw ArrayBuffers remain supported. Reset writes use the same
encoder; recovery observations still compare the actual stored representation.
Unknown or malformed descriptors require recovery. No other format is migrated
or silently reset.

Only a missing dataset in an empty state store can be seeded. Both the initial
read and the seed transaction check emptiness. Unexpected stores or nonempty
unrecognized records require recovery. A blocked open is refused promptly; if
the blocker later closes, that already-refused request aborts its upgrade.
Version changes close the connection and report coordination, while unexpected
closure reports unavailable storage. Tab sessions must support reading, writing
and removal before readiness. Connection or session-storage loss hides protected
content and requires explicit startup retry, preserving durable records and
retained work. A normal quota/write abort keeps prepared bytes for explicit save
retry, without claiming a successful save or replacing old files.

The static shell loads the shared stylesheet and eager application imports.
The App checks that the stylesheet is applied and preloads the catch-all route,
requiring successful route matches before calling demo startup. The two empty
route components explicitly disable splitting, so route resources arrive with
the entry script. This avoids the router's swallowed lazy-import errors. A failed
stylesheet can load again through a fresh URL on Retry. Empty or inaccessible
stylesheet rules cannot establish readiness. The root stylesheet link
has no React precedence, so a failed load cannot suspend the recovery screen.
No protected work is available before this resource gate succeeds. Startup
loads and retains both local font faces, and prepares or validates durable seed
and sample bytes before exposing context. Prepared canonical and replacement
samples are read from IndexedDB; generated samples use the retained fonts and
loaded PDF code. Product and review routes share this readiness contract. Future
routes and assets must be loaded before Ready if their journeys are expected to
work offline. There is no service worker, fresh offline launch or server queue.

The PDF code is a small writer for our own two-page RGB JPEG canvases. The
general PDF editor remains a development dependency for independent format
validation. Each seed preparation reuses identical rendered content locally,
while retaining every application's file IDs, ownership, bytes and hashes.
Canvas work and startup hash validation yield between short batches. Readiness
still waits for all resources, sample bytes and validation. The dataset validator
uses Zod's interpreted path to avoid compiling the large schema on a cold load.
Language selection updates the display after its preference operation commits.
Language and direction apply together before the workspace paints.

Recovery uses the last selected display language and permits a temporary language
switch without storage. Only a successful preference operation claims a persisted
language. Explicit retry restores the saved preference. Public products remain
accessible while protected startup requires recovery. Public confirmed reset is
available in recovery, unsigned and during protected work. See
[reset evidence](18-evidence.md) for the transaction, replay and tab behavior.

IndexedDB database `rifd-demo`, initially physical version 1, contains a private `state` store with one dataset record. The logical metadata fixes schema, seed and product/calculation rules to version 1, and carries the dataset UUID and durable event sequence. The record contains applications, immutable correction baselines, private saved workspaces, internal/public events, notifications, file bytes and catalog, identities, independent preferences and operation receipts.

`src/demo/reset.ts` owns reset inspection and replacement. A valid dataset context
binds confirmation to its identifier. An opaque module-issued recovery context
captures the physical version, stores, keys, record values and opaque browser-value
metadata; transaction-time comparison rejects a repaired or replaced observation.
Recognized RIFD file buffers compare exact bytes, while legacy Blob/File values
compare their metadata. Resource preparation finishes first.
The replacement commits all seeds, default preferences, a new dataset identifier
and a minimal `meta.lastReset` receipt together. Noncanonical stores are rebuilt
inside a rollback-capable version-change transaction. There is no delete/reseed
sequence. Blocked requests abort any subsequently granted upgrade.

Exact reset replay checks the current metadata's original context, operation
identifier and confirmed intent before ordinary authority checks or resource
preparation. Known receipt recognition checks only the minimal receipt and current
dataset identifier; unsupported metadata still refuses normal startup and reads.
It returns only the completed reset identifier, without repeating
replacement. An older intent cannot erase a later dataset. `inspectResetOperation`
resolves uncertain completion without sending another mutation. Reset aborts
preserve still-valid sessions and buffers; commit or a validated new-dataset read
clears tab state. A closed old connection may reopen to recognize a committed
reset. Other closure recovery still requires explicit retry.
An unmarked dataset replacement invalidates old authority and returns
`supersededDataset` until explicit startup recovery.

A single short read/write transaction seeds the complete record only when it is absent. Resource generation and hashing finish first. Concurrent empty startups reread within the write transaction and retain the first committed dataset. Preference writes compare dataset and preference revision within that transaction, record their receipt with the preference, and resolve on transaction completion. An exact receipt replay returns current context; changed intent or cross-family use of the same actor's identifier is refused. Queue writes require the captured Salma session through commit and preserve language. Language writes preserve queue preferences. Neither changes application revisions or consumes an application-storage failure. Commit hints carry only dataset, kind and revision; missed notices never require repeating a committed write.

Draft writes capture the raw payload before delay. In the write transaction they check captured session, dataset, reading access, receipt, workspace revision and current ownership/state. Ready references must match the module's tab-local prepared bytes and intended applicant/application/slot. The workspace, new bytes and mutation receipt commit together. Private saves increment only the workspace revision. They add no history, staff activity or applicant notification. A second authority check can abort the staged write before completion.

Mutation receipts retain kind, actor, dataset, operation identifier, stable raw intent, application, resulting shared/workspace revisions and save time. Exact replay returns the original receipt plus the current permitted projection, even after refresh when the original prepared token no longer exists. Changed kind/payload under the same actor's identifier is refused across language and application operations. Workspace revision and transient prepared/session identifiers do not enter the intent fingerprint. A supported additive schema-1 migration supplies an empty `mutationReceipts` array for slice-01 datasets; validation checks its dataset, ownership, identifiers and cross-family uniqueness.

Confirmed transaction abort returns a failed save with no receipt or partial bytes. If no final transaction event is observable within ten seconds, the operation returns `outcomeUnknown`; `inspectOperation` reads the receipt and latest permitted projection before an explicit retry. No startup or sign-in resends commands. Commit observers and messaging run after completion and cannot turn it into failure. Hints contain only dataset, kind and affected identifier/revision.

Preparation validates the file envelope, reads and hashes real bytes before any transaction, and returns an opaque tab-local reference. MIME falls back only from an allowed extension. Normal requests delay 400 ms and preparation 1,200 ms; slow requests delay 1,500 ms and preparation 4,000 ms, plus actual work. One eligible failure is armed at a time. Invalid, unauthorized, stale and duplicate operations do not consume it; preference writes cannot consume an application-write abort. Upload failure occurs at 50%. The storage failure aborts after the put request succeeds to prove transaction rollback.

Screens retain raw edits, selections and ready references privately in tab memory. Saving captures input before waiting for active preparation; later typing stays unsaved. Failed preparation retains its selection, and a progress save can preserve the previous saved slot while saving other input. Failed saving retains ready bytes. Superseded preparation callbacks and results from unmounted editing contexts cannot replace newer work. Same-identity recovery reads current versions before restoring a retained buffer; another identity requires discard. Clean views reread committed hints; dirty views keep input and require latest-value inspection and explicit reapplication.

The router's navigation blocker covers links and Back/Forward with the same departure dialog. Its asynchronous resolution waits for Stay, Discard changes or a successful Save and leave. Pending preparation/saving disables departure, while browser unload uses the native best-effort warning. The implementation follows the installed Router hook and its [navigation blocking documentation](https://tanstack.com/router/latest/docs/framework/react/guide/navigation-blocking).

`src/ui/departure.tsx` supplies the shared `Departure` contract and dialog. Editors register dirty/pending state and a discard callback. Applicant editors supply their explicit progress-save callback and current save eligibility. The internal-note composer supplies its authorized callback and bilingual `saveLabel`; request/decision composers and unauthorized notes omit `save` to offer only Discard and Stay. The dialog never calls save as a side effect of navigation or expiry. The review workspace combines assignment and note departure state and retains unsaved notes and replacement reasons under the same tab/session boundary.

Authorized saved/prepared reads return copies of bytes. Preview dialogs create temporary Blob URLs and revoke them on closure, replacement or loss of their protected screen. Native PDF and image previews always provide open/download alternatives. Preview failure never removes a saved file.

Session storage key `rifd.session.v1` holds only identity, dataset/session identifiers, last qualifying activity and expiry. Keyboard and pointer interactions renew activity only before expiry. Timers and activation checks cover protected content after fifteen minutes. Runtime generations prevent old reads and delayed sign-in results from clearing or exposing a newer screen's session. Imports and root-shell rendering perform no storage, session restoration, seeding or messaging.

Subscription callbacks receive a copy of the current tab session synchronously with each notification. Loss of authority covers protected content immediately, even while an IndexedDB transaction delays the subsequent context read. Subscribers still reread durable preferences and records asynchronously. A discarded editor suppresses retention during its unmount, and completed departure leaves focus to the destination heading; Stay restores the connected opener.

The root layout owns one mounted `App` and `Demo` across both `/` and splat routes, preserving tab-memory work during in-app visits. Expiry retains the interrupted identity, dataset and destination in memory. Same-identity sign-in rereads permissions and state before returning, redirects finished editing to the permitted read-only route and remounts editors with a fresh session key. Preparations become explicitly retryable selections; unobserved saves retain their command for receipt inspection. Confirmation dialogs and Blob URLs disappear with the old protected screen. Superseded context refreshes cannot turn a successful departure into startup recovery. Neither retained input nor prepared bytes enter session storage.

Applicants receive their own saved draft or submitted snapshot, public history/reasons and correction rounds. Only their own projection includes a private workspace. Applicant correction rounds omit internal verification flags. Staff receive submitted snapshots plus assignment, assessments, checks, notes and internal activity. They receive neither drafts nor private correction workspaces, catalog samples or applicant notifications. File reads require both a readable application and a reference from a permitted snapshot or baseline. Missing and forbidden records use the same unavailable error.

Committed-change broadcasts and the storage-event fallback use the same public `CommitHint` contract. A hint contains only its dataset, scope, affected application identifier where applicable, and committed revision. Runtime validation ignores malformed hints and unrelated storage events. Broadcast failure attempts the safe storage fallback; failure of both leaves the committed outcome successful. Receipt replays send no repeated notice. Subscribers reread context and authorized projections, never treating a hint as record data or authority. Focus, pageshow and visible-tab activation also trigger these reads to recover missed notices. Language and session feedback do not reroute or steal focus.

| Hint kind | Revision scope | Operations using that scope |
| --- | --- | --- |
| `workspace` | Private workspace revision | Draft and correction progress saves; correction saves validate the active round |
| `application` | Shared application revision | Submission now; subsequent assignment, queue and review operations |
| `preferences` | Independent preference revision | Language and saved queue filters/sort |

Private saves leave shared revisions, lifecycle history, staff activity and applicant notifications unchanged. Language changes leave application and workspace revisions unchanged. Hints cannot replace transaction checks, including after activation or reapplication. Later correction publication and review operations must retain the separate expected revision inputs described in the accepted browser contract.

Clean editors adopt refreshed committed workspaces. Dirty editors retain their old expected workspace revision, raw input, product and prepared bytes while the surrounding permitted projection refreshes. Inspect latest draft reveals current saved fields and documents without applying retained values. Explicit reapplication establishes the inspected baseline and clears the refused intent; the next save creates a new operation identifier. A later competing save still refuses the captured revision. Language conflict recovery similarly retains the intended language independently of the refreshed display language, requires explicit saved-preference inspection, and submits a new identifier against the inspected preference revision. No callback silently replaces an outstanding command's expected revision.

An opener-created or duplicated tab may receive a browser copy of session storage at creation. Its runtime, activity clock, sign-out, switching and expiry then remain local to that tab. The header shows the current identity and the bilingual disclosure explains initial inheritance. Sessions and protected values are never sent through either hint transport.

## Seed inventory

| Reference | Owner | Product | Initial state | Assignment |
| --- | --- | --- | --- | --- |
| 001 | Mariam | Inventory | Draft | Unassigned |
| 002 | Mariam | Equipment | Submitted | Unassigned |
| 003 | Huda | Inventory | Submitted, financial evidence missing | Salma |
| 004 | Huda | Inventory | Corrections requested, amount and plan | Salma |
| 005 | Mariam | Equipment | Approved 10 July 2026 | Salma |
| 006 | Omar | Inventory | Rejected, two operating months | Salma |
| 007 | Mariam | Equipment | Under review | Salma |
| 008 | Huda | Inventory | Under review | Khaled |
| 009 | Omar | Equipment | Under review | Salma |
| 010 | Mariam | Inventory | Submitted | Unassigned |
| 011 | Huda | Equipment | Submitted | Khaled |
| 012 | Huda | Inventory | Corrections requested, financial summary | Salma |
| 013 | Omar | Equipment | Corrections requested, quotation | Khaled |

All references begin `RIFD-2026-`. Ownership totals are five Mariam, five Huda, three Omar. The twelve-record staff queue contains four Submitted, three Under review, three Corrections requested, one Approved and one Rejected. Seven records are assigned to Salma, three to Khaled and two are unassigned. The draft has four privately saved files and an empty purchase explanation. Only the prepared 003 submission omits a required file.

Active workspaces copy their submitted snapshots and references without satisfying targets. Record 004 preserves its 600,000 YER baseline and provides a distinct readable plan sample reflecting the proposed 450,000 response. The July historical approval keeps April to June evidence and eighteen 72,000 YER rows, August 2026 to January 2028. Its first two rows are completed, totalling 144,000 YER, with 1,152,000 remaining. Other records use July to September evidence. Omar's young business has zero July activity and 900,000 / 600,000 revenue/expenses in each of August and September.

Five notifications start unread: Mariam's approval, Huda's amount/plan and financial-summary requests, Omar's rejection and quotation request. Submission adds no notification. Catalog entries include all matching originals, readable replacements for requested/missing evidence, identical bytes under different names and invalid-type, empty and 5,000,001-byte examples.

## Readiness and extension

Startup loads local fonts, prepares all seeded and catalog bytes, validates stored shapes and referenced file hashes, restores only a valid session, and establishes messaging. The screen preloads its main protected route component before showing Ready. Fonts already prepared in the current document can be reused across route mounts. A ready read journey works offline. Fresh offline launch is outside the specification.

Unsupported or damaged storage is preserved. Resource/storage failure returns a stable error and retry. Recovery/reset operations and the remaining failure controls belong to later tickets. No memory-only saved success or silent reseeding occurs. Extend runtime validation as new record shapes arrive, with an explicit migration for a new format. Keep file bytes referenced by baselines and history.

The current storage layout favors a simple atomic initial dataset and preference operation. Later commands can change the private layout while public interface and real-browser tests remain the same. Public interface integration tests use actual IndexedDB. Isolated corruption and replacement-dataset fixtures access the private layout to prepare interruptions; its assertions use startup results and the preserved dataset identifier.

## Five-step drafts

The pure domain interface validates Unicode code-point text limits, contacts, Gregorian months, whole-YER grouping and product boundaries. Normalized comparison folds Arabic-Indic digits, NFC and whitespace without overwriting raw input. Format validation deliberately permits short operating history, insufficient surplus and financing above budget. The domain caller supplies product rules and the initial submission month explicitly.

`saveDraft` revision zero atomically creates a registered memory-only draft with its first workspace and prepared bytes. Receipt replay works after reload. Later saves compare workspace revisions as before. Product switching changes the product and workspace together; it cannot retain a saved incompatible purchase reference or a prepared purchase reference for the wrong product. Shared documents remain authorized. Removed bytes can remain in the private store for references in the sample catalog, but unreferenced files cannot be previewed through application reads.

The editor retains every raw field, product, per-slot selection and staged purchase removal in one tab-local buffer. Step query changes preserve the component and pending preparation; language changes retain mounted controls and caret positions. Saves capture all current fields and selection identifiers before awaiting preparations. Later typing stays unsaved, and failed selections keep the old slot while other progress saves. Review validates the current buffer and links errors to a step and focused control. New-vs-resume is an explicit choice and never rewrites an existing draft.

## First submission

`submit` accepts the complete current form/product and saved or prepared document references, with both expected workspace and shared revisions. It uses the same transaction, receipt inspection, authority checks and prepared-byte validation as progress saving. Validation errors identify field issues or a document slot. Active selections are tracked by actor, application and slot, so a pending or failed replacement cannot fall back to the old saved file until explicitly cancelled. Publication also validates every field against the chosen product and all four file envelopes. Pending/failed document descriptors, missing files and extra bypass flags are refused. The incomplete Submitted seed remains a stored fixture, never an operation option.

The transaction publishes the snapshot and bytes, freezes the fixed domain date of 2026-10-14 and July to September evidence, initializes document assessments and checks, advances the shared revision, retires the workspace and commits a receipt. One durable sequence identifies the submission in public history and internal activity. The current assignee comes from storage. Publication creates no applicant notification. Actual receipt save timestamps use the browser clock independently of the domain date.

The Review step submits directly, including an unsaved new application. Missing/invalid requirements focus the linked summary. Pending and uncertain submissions disable duplicate actions. Failure retains the complete form and ready files; only an eligible submission consumes its one-shot submission failure. Storage abort rolls back files, state, history and receipt together. Receipt inspection resolves an unknown completion before retry. Successful publication routes to the read-only detail and clears the retired editor buffer.

If publication in another tab or a committed operation during expiry removes editing permission, the permitted detail shows retained input in a separate unapplied-work panel. It supports explicit receipt inspection and discard without republishing. New UUID references resolve through both applicant and staff routes. Observing a replacement dataset also clears module-local drafts, preparations and failure controls.

Saved catalog samples retain their original fictional facts and product provenance. A supported additive migration recovers the product of older catalog entries from the immutable seed manifest. Product-specific sample reads/preparations cannot relabel stock plans as quotations after a switch. New applications and newly exposed product-specific requirements can generate sample bytes from the current draft fields through the same preparation interface. This generation happens outside storage transactions and commits no catalog or application data. Local fictional files remain available for every slot.

Same-identity recovery reauthorizes memory-only new drafts through the public read interface before restoring their retained buffer. A stale draft reapplication that keeps a different product from the latest saved workspace confirms removal of its incompatible fourth document before staging the reapplication.

## Notifications and print summaries

The canonical notification rows remain the source for correction and decision notices. `markNotificationRead` validates its own expected notification revision, captured session, dataset and ownership in a short transaction. It changes only that notice and a durable operation receipt. It uses the existing actor-scoped receipt namespace, so changed intents and cross-family identifier reuse are refused. Exact replay and `inspectNotificationOperation` return the saved receipt and a freshly resolved permitted destination. No application, workspace, preference or lifecycle revision changes. Already-read notices retain their revision.

Notification commit hints carry only dataset, notification identifier and revision. Screens reread storage, including after tab activation. The notification screen supports explicit outcome inspection and retry, and removes protected rows when authority ends. `resolveNotification` checks current access and state. Active requests open the current correction route; completed requests open application detail. Until ticket 12, the active route displays the existing submitted record and targets.

`readPrintSummary` checks normal record access and returns an explicit public projection for either role. It uses the same submitted-or-saved snapshot selection as detail, strips private workspaces, staff fields and target verification, and rejects new unsaved drafts. Draft summaries include their last saved date. Dedicated routes share public information, correction reason and history renderers with detail. Production layered print CSS hides application chrome, dialogs and controls, preserves local fonts, and prevents splitting short metadata blocks. The print route never receives staff-only data.

## Evidence review and notes

`assessDocument` carries the current file identity, slot, Accepted or Needs replacement outcome and a required replacement reason. It cannot add files or assess Missing slots. `recordCheck` names exactly one of the five fixed checks and its outcome. `saveNote` carries nonempty text. These commands share the staff transaction and receipt namespace, including shared revision, current assignment/state, captured session and dataset guards. All effects, internal events, resulting revision and receipt commit atomically. No command changes the submitted snapshot, application status, public history, notifications or frozen repayment.

Only the assigned reviewer in Under review can assess or record checks. Notes also allow Corrections requested and both terminal states for the final assignee. Staff projection permissions control the screens, and the transaction independently enforces the same rules. Colleague reads remain permitted. Staff-only fields never enter the applicant or print projection.

The pure `reviewRules` helper uses normalized month/digit inputs, initial submission month, product markup and the largest whole-rial installment. Positive surplus and `5 * largest <= 2 * surplus` enforce the exact capacity threshold. Evidence Passed requires all four current documents Accepted; the reviewer explicitly attests consistency, while Product purpose fit remains a reviewer assessment. Changing a document assessment clears evidence consistency. Accepting a requested document in a published correction response verifies that document target separately from the five checks.

`reviewDependencies` and `changedReviewChecks` identify exact field and document-identity dependencies for correction publication. Formatting-only differences use the existing canonical comparison and leave checks intact. The complete dependency table and Huda's amount-plus-plan example are tested through the exported helper. Publication and field verification controls are still owned by ticket 13.

`ReviewWorkspace` keeps unsaved note/replacement text, expected revision and unresolved command in an App-owned map keyed by dataset, identity and application. Same-identity recovery reauthorizes access before remounting it. A newer shared revision requires explicit inspection before the retained text can save. Lost acknowledgements require receipt inspection; sign-in never resends a command. Another identity requires explicit discard. Refresh removes the map. Departure combines assignment and review work, offering Save note and leave only for an authorized note without another unsent composer. The dialog navigates only after confirmed success.

## Resubmission and verification

`resubmit` carries the current raw response, fixed product, round identifier,
prepared or saved file choices and both expected revisions. It uses the same
short publication transaction as first submission. It checks the session,
dataset, readable record, receipt, workspace/shared versions, applicant ownership,
active round and target permissions before validating the full application.
Every requested field must differ canonically from its fixed baseline. Missing
evidence must be supplied; replacement hashes must differ from baseline bytes.
Pending or failed selections block publication even when an older file exists.

The transaction publishes all fields and bytes, stores the round response,
retires the workspace, enters Under review, increments the shared revision and
records one resubmission event and receipt. The receipt also retains the completed
workspace revision. Current assignment, initial submission month and financial
window survive. No notification is created. An abort rolls back every effect;
unknown completion requires receipt inspection. Exact replay returns the receipt
before considering the retired workspace.

`changedReviewChecks` resets only dependencies of the published changes. Other
checks and unchanged document assessments survive. Requested new/replaced files
become Awaiting review and the round's targets start unverified. Screens highlight
field and file changes against the fixed baseline and explain the affected checks.

`verifyCorrection` binds a field target to its round, desired verification value
and expected shared revision. Only the current assignee in Under review can
verify it. Accepting a requested document verifies its target; marking it Needs
replacement clears verification. Both actions remain separate from checklist
outcomes. They add internal activity and never change applicant history or notices.

`currentCorrectionTargets` selects the latest request for each field or slot.
A later request supersedes only targets it includes, so unrelated outstanding
verification survives. Historical insufficient responses keep their actual flags
and do not block the carried-forward target after its later response is verified.
Applicant and reviewer history render each published round's requested field
values and permit previews of its requested documents through authorized
`readFile` calls. The shared print projection stays unchanged.
When requesting another round, the transaction retains the preceding response's
assessments, including reasons, in `responseAssessments`. This optional additive
field is staff-only; applicant and print projections exclude it. Each new round
captures its own submitted baseline and fresh private workspace.

## Final decisions

`approve` and `reject` carry the applicant-visible reason, explicit confirmation,
confirming session identifier and inspected shared revision. The existing staff
transaction checks authority, receipt, revision, assignment and Under review state
before validating the decision. A noncommitted confirmation from an earlier
sign-in fails even if the application revision is unchanged. Committed receipt
replay remains available after sign-in without another decision or notification.

The pure `decisionReadiness` helper identifies unaccepted or missing documents,
checks without a Passed outcome and unverified current correction targets.
Approval requires all three lists to be empty. Rejection requires a Failed
Operating history, Product purpose fit, Purchase budget coverage or Repayment
capacity check. Incomplete unrelated review does not block that rejection.

The transaction records final status, reason in public history, internal activity,
one applicant notification, shared revision and receipt. Approval also stores
`freezeRepayment` using the submitted amount and term, selected product rules and
fixed domain date. All new rows start Upcoming. Reads return the saved repayment
snapshot; notes cannot recalculate or change it. Existing terminal permissions
lock fields, evidence, review checks, verification and assignment while preserving
assigned notes, authorized previews and public print projections.

The decision screen retains the unsent reason and unresolved intent in the same
App-owned, dataset/identity/application keyed maps as other unfinished work.
Confirmation stays local to the mounted screen and closes on session or revision
change. Stale and uncertain results require explicit inspection. A confirmed
abort retains the reason and requires a new inspection and confirmation before
retry. An unchanged retry keeps its operation identifier; changed intent or a
newer inspected revision gets a new identifier. Departure offers Stay or Discard changes, never implicit publication.

## Repayment reads

`src/ui/repayment.tsx` presents the saved approval snapshot through the existing
role-filtered `readApplication` operation. The applicant and staff repayment
routes resolve access before showing terms. Other states replace the route with
permitted detail and an explanation. Staff navigation preserves the queue query.
The shared summary sums Completed and Upcoming stored rows for progress amounts.
The next entry is the first Upcoming row in schedule order, independent of the
browser clock. Amount, markup, total, term and all dates come from the frozen
snapshot. The overview adds no commands or persistence schema changes.

## Stale staff writes

`transferApplication` accepts an explicit `simulated: true` flag only for an
Under review record assigned to Salma, transferring from Salma to Khaled. The
flag belongs to the receipt fingerprint, so a normal transfer cannot replay a
simulation's identifier. The existing transaction commits assignment, one
identified simulated internal event, shared revision and receipt together.
Review results and applicant-visible information remain unchanged.

The initiating screen holds its displayed projection before dispatching the
simulation. Background hints and activation still reread current context, but
cannot replace that screen's projection until explicit inspection. Other tabs
and all public reads receive current data. Navigation, dataset/session changes
and explicit action inspection release the hold. Pending simulations join the
departure guard; uncertain completion requires receipt inspection.

Every staff write still uses the captured shared revision. Session and readable
access checks precede revision comparison; a readable stale record takes
precedence over lost-assignment denial. Refused writes commit no effects or
receipt. Load latest keeps note, replacement, correction and decision text,
updates permissions and invalidates confirmations. Confirmed reclaim changes
the revision again, requiring inspection before retained work can be applied.
Decisions require a newly prepared final confirmation.


## Checked Saved demonstrations

`Demo.listSavedDemonstrations` and `Demo.selectSavedDemonstration` expose the five
accepted captures through the document workflow. `src/demo/saved-demonstrations/`
retains byte-for-byte copies of their checked bundles, original fictional sources
and recorded full-page rasters. Eager inline assets keep all five available after
the application loads, including when the visitor goes offline before choosing
an example. This adds about 1.1 MB of compressed evidence to the initial bundle.

Selection hashes the actual authorized source bytes and each bundled raster.
The static preparation path uses those exact recorded rasters. Current-document
attachment also requires the slot, ordered page scope, actual declarations,
language, product, expected months and frozen model/question/preparation/display
versions to match. The demo interface rereads current source authority after
asynchronous work. Historical files, superseded preparations and unauthorized
workspaces cannot authorize attachment. A mismatch opens the original read-only
example with its own context. The capture's retained findings and four certified
overlays never pass through the provisional live display policy.

Screens keep findings in plain language and expose native/mapped answers and
versions only in provenance. Applicant sources open inline on request. Reviewer
sources sit beside findings and human assessment controls on wide screens.
Opening an example performs no financing write, inference request or guest
sign-in. Local context changes, commit hints and activation invalidate the open
selection. These assets are checked Saved demonstrations, distinct from live
analysis, previous live analysis and scripted Illustrative examples.
