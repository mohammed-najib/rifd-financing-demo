# Browser demo architecture

The [specification](../../.scratch/financing-application-and-review/spec.md) and [accepted browser contract](../../.scratch/financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer) govern the implementation. The first six slices provide startup, authorized reads, canonical field validation, five-step drafts, session and tab recovery, and atomic first submission. Later tickets extend the same boundaries for corrections and review.

## Modules

| Module | Responsibility |
| --- | --- |
| `src/domain` | Typed stored shapes, fictional product rules, read permission rule and explicit-date whole-rial repayment calculation. No browser storage, timers or navigation. |
| `src/demo/index.ts` | Public asynchronous startup, context, sign-in/out, language, draft and submission operations, preparation, receipt inspection, role-filtered reads, deterministic controls and subscriptions. |
| `src/demo/commands.ts` | Private runtime command shapes and stable intent fingerprints. |
| `src/demo/storage.ts` | Private IndexedDB opening, validation, reads and transaction completion. Product screens never import this module. |
| `src/demo/seed-manifest.ts`, `seed.ts`, `evidence.ts` | Canonical scenario facts and preparation of locally rendered, hashed PNG, JPEG and multipage PDF bytes and catalog variants. |
| `src/ui` | Screen loading, navigation, feedback, bilingual read presentation, responsive table/card views and identity controls. |
| `src/routes`, `router.tsx` | Start SPA shell and normal browser paths. The current slice validates supported paths within the shared read screen. |

The public `Demo` interface returns `Result<T>` with finite error kinds and translation keys. `setLanguage` carries the dataset, operation identifier, preference revision and desired language. `newDraft` creates a tab-local, owner-scoped in-memory draft and performs no durable write. Its UUID-based application reference stays stable after saving, while the seed references retain their short numeric suffixes. Workspace revision zero identifies unsaved creation. `saveDraft` carries the dataset, application, operation identifier, workspace revision, raw form/product and saved or prepared document choices. It has no database replacement, arbitrary patch, caller-supplied actor or submission bypass. Session operations capture identity in the current tab. Future applicant and reviewer mutations must add their own typed commands and complete effects here.

## Styling

Tailwind CSS 4.3.3 runs through the dedicated Vite plugin in the application and browser API harness. The shared stylesheet defines Guided A theme tokens, retained base defaults and reusable component skins. Screen layouts use utilities with explicit status-class maps. Source detection covers `src`; archived prototypes and documentation do not contribute utilities.

Preflight is omitted. The local fonts, 15px root typography, logical RTL/LTR spacing and inclusive 767px/1199px responsive cutoffs remain the design contract. The root route retains its compiled stylesheet URL in the static shell. See [styling conventions](../../README.md#styling) and [migration evidence](tailwind-v4.md) before extending the UI.

## Storage and authority

IndexedDB database `rifd-demo`, physical version 1, contains a private `state` store with one dataset record. The logical metadata fixes schema, seed and product/calculation rules to version 1, and carries the dataset UUID and durable event sequence. The record contains applications, immutable correction baselines, private saved workspaces, internal/public events, notifications, file bytes and catalog, identities, independent preferences and language receipts.

A single short read/write transaction seeds the complete record only when it is absent. Resource generation and hashing finish first. Concurrent empty startups reread within the write transaction and retain the first committed dataset. Language writes compare dataset and preference revision within that transaction, record their receipt with the preference, and resolve on transaction completion. An exact receipt replay returns current context; changed intent under the same identifier is refused. No application revision changes when language changes.

Draft writes capture the raw payload before delay. In the write transaction they check captured session, dataset, reading access, receipt, workspace revision and current ownership/state. Ready references must match the module's tab-local prepared bytes and intended applicant/application/slot. The workspace, new bytes and mutation receipt commit together. Private saves increment only the workspace revision. They add no history, staff activity or applicant notification. A second authority check can abort the staged write before completion.

Mutation receipts retain kind, actor, dataset, operation identifier, stable raw intent, application, resulting shared/workspace revisions and save time. Exact replay returns the original receipt plus the current permitted projection, even after refresh when the original prepared token no longer exists. Changed kind/payload under the same actor's identifier is refused across language and application operations. Workspace revision and transient prepared/session identifiers do not enter the intent fingerprint. A supported additive schema-1 migration supplies an empty `mutationReceipts` array for slice-01 datasets; validation checks its dataset, ownership, identifiers and cross-family uniqueness.

Confirmed transaction abort returns a failed save with no receipt or partial bytes. If no final transaction event is observable within ten seconds, the operation returns `outcomeUnknown`; `inspectOperation` reads the receipt and latest permitted projection before an explicit retry. No startup or sign-in resends commands. Commit observers and messaging run after completion and cannot turn it into failure. Hints contain only dataset, kind and affected identifier/revision.

Preparation validates the file envelope, reads and hashes real bytes before any transaction, and returns an opaque tab-local reference. MIME falls back only from an allowed extension. Normal requests delay 400 ms and preparation 1,200 ms; slow requests delay 1,500 ms and preparation 4,000 ms, plus actual work. One eligible failure is armed at a time. Invalid, unauthorized, stale and duplicate operations do not consume it; preference writes cannot consume an application-write abort. Upload failure occurs at 50%. The storage failure aborts after the put request succeeds to prove transaction rollback.

Screens retain raw edits, selections and ready references privately in tab memory. Saving captures input before waiting for active preparation; later typing stays unsaved. Failed preparation retains its selection, and a progress save can preserve the previous saved slot while saving other input. Failed saving retains ready bytes. Superseded preparation callbacks and results from unmounted editing contexts cannot replace newer work. Same-identity recovery reads current versions before restoring a retained buffer; another identity requires discard. Clean views reread committed hints; dirty views keep input and require latest-value inspection and explicit reapplication.

The router's navigation blocker covers links and Back/Forward with the same departure dialog. Its asynchronous resolution waits for Stay, Discard changes or a successful Save and leave. Pending preparation/saving disables departure, while browser unload uses the native best-effort warning. The implementation follows the installed Router hook and its [navigation blocking documentation](https://tanstack.com/router/latest/docs/framework/react/guide/navigation-blocking).

`src/ui/departure.tsx` supplies the shared `Departure` contract and dialog. Editors register dirty/pending state and a discard callback. Applicant editors supply their explicit progress-save callback and current save eligibility. Later internal-note composers can supply an authorized callback and bilingual `saveLabel`; request/decision composers and unauthorized notes omit `save` to offer only Discard and Stay. The dialog never calls save as a side effect of navigation or expiry. Later staff tickets connect their actual operations and retain their text under the same tab/session boundary.

Authorized saved/prepared reads return copies of bytes. Preview dialogs create temporary Blob URLs and revoke them on closure, replacement or loss of their protected screen. Native PDF and image previews always provide open/download alternatives. Preview failure never removes a saved file.

Session storage key `rifd.session.v1` holds only identity, dataset/session identifiers, last qualifying activity and expiry. Keyboard and pointer interactions renew activity only before expiry. Timers and activation checks cover protected content after fifteen minutes. Runtime generations prevent old reads and delayed sign-in results from clearing or exposing a newer screen's session. Imports and root-shell rendering perform no storage, session restoration, seeding or messaging.

Subscription callbacks receive a copy of the current tab session synchronously with each notification. Loss of authority covers protected content immediately, even while an IndexedDB transaction delays the subsequent context read. Subscribers still reread durable preferences and records asynchronously. A discarded editor suppresses retention during its unmount, and completed departure leaves focus to the destination heading; Stay restores the connected opener.

The root layout owns one mounted `App` and `Demo` across both `/` and splat routes, preserving tab-memory work during in-app visits. Expiry retains the interrupted identity, dataset and destination in memory. Same-identity sign-in rereads permissions and state before returning, redirects finished editing to the permitted read-only route and remounts editors with a fresh session key. Preparations become explicitly retryable selections; unobserved saves retain their command for receipt inspection. Confirmation dialogs and Blob URLs disappear with the old protected screen. Superseded context refreshes cannot turn a successful departure into startup recovery. Neither retained input nor prepared bytes enter session storage.

Applicants receive their own saved draft or submitted snapshot, public history/reasons and correction rounds. Only their own projection includes a private workspace. Applicant correction rounds omit internal verification flags. Staff receive submitted snapshots plus assignment, assessments, checks, notes and internal activity. They receive neither drafts nor private correction workspaces, catalog samples or applicant notifications. File reads require both a readable application and a reference from a permitted snapshot or baseline. Missing and forbidden records use the same unavailable error.

Committed-change broadcasts and the storage-event fallback use the same public `CommitHint` contract. A hint contains only its dataset, scope, affected application identifier where applicable, and committed revision. Runtime validation ignores malformed hints and unrelated storage events. Broadcast failure attempts the safe storage fallback; failure of both leaves the committed outcome successful. Receipt replays send no repeated notice. Subscribers reread context and authorized projections, never treating a hint as record data or authority. Focus, pageshow and visible-tab activation also trigger these reads to recover missed notices. Language and session feedback do not reroute or steal focus.

| Hint kind | Revision scope | Operations using that scope |
| --- | --- | --- |
| `workspace` | Private workspace revision | Draft saves now; correction progress saves extend the same scope with active-round validation |
| `application` | Shared application revision | Submission now; subsequent assignment, queue and review operations |
| `preferences` | Independent preference revision | Language now; subsequent saved queue preferences |

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
