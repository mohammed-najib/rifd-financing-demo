# Browser demo architecture

The [specification](../../.scratch/financing-application-and-review/spec.md) and [accepted browser contract](../../.scratch/financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer) govern the implementation. This slice establishes the read and startup boundaries. Later tickets add complete operations through those same boundaries.

## Modules

| Module | Responsibility |
| --- | --- |
| `src/domain` | Typed stored shapes, fictional product rules, read permission rule and explicit-date whole-rial repayment calculation. No browser storage, timers or navigation. |
| `src/demo/index.ts` | Public asynchronous startup, context, sign-in/out, language operation, role-filtered application/file/sample/notification reads and subscriptions. |
| `src/demo/storage.ts` | Private IndexedDB opening, validation, reads and transaction completion. Product screens never import this module. |
| `src/demo/seed-manifest.ts`, `seed.ts`, `evidence.ts` | Canonical scenario facts and preparation of locally rendered, hashed PNG, JPEG and multipage PDF bytes and catalog variants. |
| `src/ui` | Screen loading, navigation, feedback, bilingual read presentation, responsive table/card views and identity controls. |
| `src/routes`, `router.tsx` | Start SPA shell and normal browser paths. The current slice validates supported paths within the shared read screen. |

The public `Demo` interface returns `Result<T>` with finite error kinds and translation keys. Its current durable operation is `setLanguage`, with dataset identifier, operation identifier, expected preference revision and desired language. It has no database replacement, arbitrary patch, caller-supplied actor or submission bypass. Session operations capture identity in the current tab. Future applicant and reviewer mutations must add their own typed commands and complete effects here.

## Storage and authority

IndexedDB database `rifd-demo`, physical version 1, contains a private `state` store with one dataset record. The logical metadata fixes schema, seed and product/calculation rules to version 1, and carries the dataset UUID and durable event sequence. The record contains applications, immutable correction baselines, private saved workspaces, internal/public events, notifications, file bytes and catalog, identities, independent preferences and language receipts.

A single short read/write transaction seeds the complete record only when it is absent. Resource generation and hashing finish first. Concurrent empty startups reread within the write transaction and retain the first committed dataset. Language writes compare dataset and preference revision within that transaction, record their receipt with the preference, and resolve on transaction completion. An exact receipt replay returns current context; changed intent under the same identifier is refused. No application revision changes when language changes.

Session storage key `rifd.session.v1` holds only identity, dataset/session identifiers, last qualifying activity and expiry. Keyboard and pointer interactions renew activity only before expiry. Timers and activation checks cover protected content after fifteen minutes. Runtime generations prevent old reads and delayed sign-in results from clearing or exposing a newer screen's session. Imports and root-shell rendering perform no storage, session restoration, seeding or messaging.

Applicants receive their own saved draft or submitted snapshot, public history/reasons and correction rounds. Only their own projection includes a private workspace. Applicant correction rounds omit internal verification flags. Staff receive submitted snapshots plus assignment, assessments, checks, notes and internal activity. They receive neither drafts nor private correction workspaces, catalog samples or applicant notifications. File reads require both a readable application and a reference from a permitted snapshot or baseline. Missing and forbidden records use the same unavailable error.

Committed-change broadcasts contain only a dataset/kind hint. Receivers reread storage. Language and session feedback do not reroute or steal focus. Activation rereads durable context. Future mutation slices must extend hints and clean/dirty record refresh as their operations are added.

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

Unsupported or damaged storage is preserved. Resource/storage failure returns a stable error and retry. Recovery/reset operations and deliberate failure controls are separate later tickets. No memory-only saved success or silent reseeding occurs. Extend runtime validation as new record shapes arrive, with an explicit migration for a new format. Keep file bytes referenced by baselines and history.

The current storage layout favors a simple atomic initial dataset and preference operation. Later commands can change the private layout while public interface and real-browser tests remain the same. Public interface integration tests use actual IndexedDB. Only an isolated corruption fixture accesses the private layout to prepare damage; its assertions use startup results and the preserved dataset identifier.
