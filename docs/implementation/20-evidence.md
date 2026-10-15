# Slice 20 browser and reliability acceptance

[Issue 20](../../.scratch/financing-application-and-review-implementation/issues/20-browser-and-reliability-acceptance.md)
implements the functional part of the [accepted handoff](../../.scratch/financing-application-and-review/issues/07-acceptance-and-implementation-handoff.md#answer).
The starting commit is `85f096a52fcb0cbc709a433bf7cf858aaaca26ec`.
Assertions use the accepted public `Demo` interface with actual IndexedDB and
the production static screens. No production testing interface was added.

## Final run

Final acceptance execution is pending. This section will record the completed
run, counts, versions, source digest and retained reports before issue completion.

Run the complete gate with:

```sh
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:acceptance
```

On a supported Playwright host, omit the WebKit override. The compatible launcher
on this Arch host preserves the pinned browser and uses the libraries documented
in [slice 01](01-evidence.md). The runner launches each engine to obtain its actual
version. Chrome uses the installed `chrome` channel. Firefox and WebKit use
Playwright's patched browsers. Browser viewports are CSS emulation. These results
do not establish ordinary Firefox manual acceptance, Safari or physical-device
support.

Every run has its own `artifacts/acceptance/20/<UTC timestamp>/` directory:

- `run.json` records commands, exit codes, durations, versions and generated shell/CSS hashes.
- `source.json` records the starting HEAD, working changes and SHA-256 hashes of source, tests, scripts, configuration and lockfile.
- `api/report.json`, `api/html/` and `api/results/` retain the separate Vite harness evidence.
- `screens/report.json`, `screens/html/` and `screens/results/` retain the production static evidence.
- Logs retain the typecheck, lint, domain, skill, build and browser output. Failures keep traces and screen screenshots; correction and decision screen files also retain successful traces.

The two suites run sequentially, with three browser workers each. A focused
recheck uses a separate `RIFD_ACCEPTANCE_DIR` and cannot erase a complete run.
No retries or browser exclusions are configured by the acceptance command.

## Functional requirement matrix

These rows map the functional requirements in the handoff and the specification's
[automated coverage table](../../.scratch/financing-application-and-review/spec.md#required-automated-coverage)
to executable evidence. Each linked file supplies named cases in the retained
JSON and HTML reports. Domain cases are recorded in `test.log`.

| Functional requirement | Evidence |
| --- | --- |
| Both product purposes, ranges, terms, markup, document requirements; selection through sign-in; confirmed/cancelled switching | [Domain boundaries](../../src/domain/application.test.ts), [product screens](../../tests/browser/application.screens.spec.ts), [atomic switching](../../tests/browser/application.api.spec.ts) |
| Five navigable steps, review, invalid submission, linked errors and complete normal submission | [Form screens](../../tests/browser/application.screens.spec.ts), [submission screens](../../tests/browser/submission.screens.spec.ts), [invalid public commands](../../tests/browser/submission.api.spec.ts) |
| Incomplete/raw saves, captured payload, later typing, durable restoration and failed replacement | [Draft API](../../tests/browser/drafts.api.spec.ts), [draft screens](../../tests/browser/drafts.screens.spec.ts), [session/captured-save screens](../../tests/browser/sessions.screens.spec.ts) |
| PDF/JPEG/PNG envelope boundaries, hashes/bytes after reload, prepared/saved/published distinctions and authorized reads | [Envelopes and preparations](../../tests/browser/drafts.api.spec.ts), [actual saved bytes](../../tests/browser/api.spec.ts), [preview screens](../../tests/browser/drafts.screens.spec.ts), [publication](../../tests/browser/submission.api.spec.ts) |
| Own applicant lists, read-only submitted detail, history, public reasons and private/public separation | [Identity projections](../../tests/browser/api.spec.ts), [tracking](../../tests/browser/submission.screens.spec.ts), [private responses](../../tests/browser/correction-response.api.spec.ts) |
| Identical public print policy for both roles, saved Draft, submitted correction baseline, final reasons and excluded internal data | [Print projections using a real private save](../../tests/browser/print.api.spec.ts), [print-route content/media](../../tests/browser/print.screens.spec.ts), [new rejection print](../../tests/browser/decisions.screens.spec.ts) |
| Search, filters, four stable sorts, five-row pages, preference/URL precedence, empty results and Back to queue | [Queue API](../../tests/browser/queue.api.spec.ts), [queue screens](../../tests/browser/queue.screens.spec.ts) |
| Separate claim/start; confirmed transfer, permitted unassignment, assignment checks and terminal locks | [All seeded states and assignments](../../tests/browser/assignment.api.spec.ts), [assignment screens](../../tests/browser/assignment.screens.spec.ts), [domain read permissions](../../src/domain/index.test.ts) |
| Distinct evidence/check/verification/note/activity sections; five criteria; unsupported Passed results refused | [Pure review rules](../../src/domain/review.test.ts), [review API](../../tests/browser/review.api.spec.ts), [review screens](../../tests/browser/review.screens.spec.ts) |
| Target-specific requests, fixed baseline, private incomplete progress, only requested changes and paused review | [Request API](../../tests/browser/corrections.api.spec.ts), [response API](../../tests/browser/correction-response.api.spec.ts), [bilingual missing-evidence journey](../../tests/browser/corrections.screens.spec.ts) |
| Formatting-only/identical-byte refusal, atomic resubmission, exact dependent-check reset and preserved assignee | [Resubmission API](../../tests/browser/resubmission.api.spec.ts), [comparison rules](../../src/domain/application.test.ts), [dependency rules](../../src/domain/review.test.ts), [bilingual field/file response](../../tests/browser/resubmission.screens.spec.ts) |
| Added/replaced/changed target highlighting, separate verification and repeated unsuitable/satisfactory responses | [Resubmission API](../../tests/browser/resubmission.api.spec.ts), [bilingual repeat-round screens](../../tests/browser/resubmission.screens.spec.ts), [new-round tab race](../../tests/browser/correction-response.screens.spec.ts) |
| Every approval prerequisite, failed substantive criterion for rejection, reason, fresh confirmation and final locks | [Decision API](../../tests/browser/decisions.api.spec.ts), [approval and actual new rejection in both languages](../../tests/browser/decisions.screens.spec.ts) |
| Frozen terms, half-up markup, final remainder, date rollover, completed/remaining totals and read-only repayment | [Arithmetic examples](../../src/domain/index.test.ts), [frozen persistence](../../tests/browser/repayment.api.spec.ts), [repayment screens](../../tests/browser/repayment.screens.spec.ts) |
| One correction/decision notification, read ownership, replay and current destination after resubmission | [Notification API using real resubmission](../../tests/browser/notifications.api.spec.ts), [notification screens](../../tests/browser/notifications.screens.spec.ts), [decision API](../../tests/browser/decisions.api.spec.ts) |
| All state/action permissions, unsigned/wrong owner/unassigned/colleague contexts and neutral forbidden projections/previews | [Read permission matrix](../../src/domain/index.test.ts), [public projections](../../tests/browser/api.spec.ts), [assignment](../../tests/browser/assignment.api.spec.ts), [review](../../tests/browser/review.api.spec.ts), [corrections](../../tests/browser/corrections.api.spec.ts), [decisions](../../tests/browser/decisions.api.spec.ts), [protected links](../../tests/browser/screens.spec.ts) |
| Transaction abort, exact replay, changed intent, unknown outcome and failed post-commit notices | All nineteen command kinds in the mutation matrix below |
| Shared data with independent sessions, private/shared races, dirty notices, missed broadcasts and preference conflicts | [Session API](../../tests/browser/sessions.api.spec.ts), [sync API](../../tests/browser/sync.api.spec.ts), [sync screens](../../tests/browser/sync.screens.spec.ts), [assignment races](../../tests/browser/assignment.api.spec.ts), [resubmission races](../../tests/browser/resubmission.api.spec.ts) |
| Real fifteen-minute expiry, activity/nonactivity, pending operations, same-identity recovery and isolation from another identity | [Session API](../../tests/browser/sessions.api.spec.ts), [inactivity clock](../../tests/browser/api.spec.ts), [session screens](../../tests/browser/sessions.screens.spec.ts), [departure screens](../../tests/browser/departure.screens.spec.ts) |
| Simulated reassignment and simultaneous tabs; retained text, invalid confirmation, explicit reclaim/inspect/reconfirmation | [Stale-write API](../../tests/browser/stale-writes.api.spec.ts), [bilingual stale recovery](../../tests/browser/stale-writes.screens.spec.ts), [decision expiry](../../tests/browser/decisions.screens.spec.ts) |
| Startup denial, blocked upgrade, unsupported/damaged storage, missing/corrupt bytes, resource failures and explicit retry | [Startup API](../../tests/browser/startup.api.spec.ts), [startup screens](../../tests/browser/startup.screens.spec.ts) |
| Confirmed reset cancellation/abort/success/replay; changed context, old delayed writes, session/buffer/file retirement and missed notices | [Reset API](../../tests/browser/reset.api.spec.ts), [reset screens](../../tests/browser/reset.screens.spec.ts) |
| Complete thirteen-record seed, ownership/state/assignment counts, saved notice flags and historical schedule | [Canonical seed API](../../tests/browser/api.spec.ts), [reset restoration](../../tests/browser/reset.api.spec.ts), [historical repayment](../../tests/browser/repayment.api.spec.ts) |
| Bilingual editing preservation, responsive functional controls, busy/failure feedback, departure guards and public gallery | [Application screens](../../tests/browser/application.screens.spec.ts), [sessions](../../tests/browser/sessions.screens.spec.ts), [gallery](../../tests/browser/gallery.screens.spec.ts), [review](../../tests/browser/review.screens.spec.ts) |
| Loaded offline local documents, prepared replacements, draft saves, products and staff routes in both languages | [Loaded-offline journeys](../../tests/browser/startup.screens.spec.ts) |
| Static production shell, asset MIME, test harness exclusion and no Start runtime server | [Static HTTP assertions](../../tests/browser/screens.spec.ts), [resource loading](../../tests/browser/startup.screens.spec.ts), `build.log` and generated shell/CSS hashes |
| Tailwind-generated styles in both servers, Guided A tokens, invalid borders, logical spacing and inclusive 767/768 boundary | [Production stylesheet screen](../../tests/browser/gallery.screens.spec.ts), [separate API stylesheet](../../tests/browser/api.spec.ts) |
| Reproducible commands, typed asynchronous operations, finite failure controls and browser-local disclosure | [README](../../README.md#check), [architecture](architecture.md), [controls and recovery](../../tests/browser/drafts.api.spec.ts), [product/repayment screens](../../tests/browser/repayment.screens.spec.ts) |

## Mutation reliability matrix

Each row covers abort without partial durable effects, receipt replay, changed
intent refusal, unknown-completion inspection and failed notice delivery. Related
cases in a file divide those conditions. Application assertions read current
projections, files, history, notices and receipt inspections through `Demo`.
Browser IndexedDB faults inject abort or lost completion at the storage boundary.
`refuseCommitNotices` refuses BroadcastChannel, storage-event fallback and a local
subscriber. It changes no product module or stored record.

| Command | Abort, replay, changed intent, uncertainty | Failed post-commit notice evidence |
| --- | --- | --- |
| `setLanguage` | [Language recovery](../../tests/browser/api.spec.ts) | Same case, a second explicit language operation |
| `setQueuePreferences` | [Preference rollback/unknown/replay](../../tests/browser/queue.api.spec.ts) | Missed post-commit notices case |
| `markNotificationRead` | [Read rollback/unknown/ownership](../../tests/browser/notifications.api.spec.ts) | Expiry-after-staging and failed-broadcast case |
| `saveDraft` | [Raw/file atomicity](../../tests/browser/drafts.api.spec.ts) | Failed commit announcements case |
| `submit` | [Publication](../../tests/browser/submission.api.spec.ts) | Failed post-commit observers case |
| `saveCorrections` | [Private response](../../tests/browser/correction-response.api.spec.ts) | Private invalid corrections/bytes/reload case |
| `resubmit` | [Atomic publication](../../tests/browser/resubmission.api.spec.ts) | Huda complete response case |
| `claimApplication` | [Assignment matrix](../../tests/browser/assignment.api.spec.ts) | Claim and review start case |
| `startReview` | [Assignment matrix](../../tests/browser/assignment.api.spec.ts) | Claim and review start case |
| `transferApplication` | [Assignment matrix](../../tests/browser/assignment.api.spec.ts), [simulated transfer](../../tests/browser/stale-writes.api.spec.ts) | Confirmed transfers case |
| `unassignApplication` | [Assignment matrix](../../tests/browser/assignment.api.spec.ts) | Unassignment survives failed change notices case |
| `assessDocument` | [Review rollback/unknown](../../tests/browser/review.api.spec.ts) | Assessments and all five checks case |
| `recordCheck` | [Review rollback/unknown](../../tests/browser/review.api.spec.ts) | Assessments and all five checks case |
| `saveNote` | [Review rollback/unknown](../../tests/browser/review.api.spec.ts) | Notes excluded from applicant/print/notifications case |
| `verifyCorrection` | [Field verification abort/unknown/replay/changed intent](../../tests/browser/resubmission.api.spec.ts) | Same case, an explicit undo operation |
| `requestCorrections` | [Request rollback/unknown/replay](../../tests/browser/corrections.api.spec.ts) | Missing document and field request case |
| `approve` | [Decision rollback/unknown/replay](../../tests/browser/decisions.api.spec.ts) | Complete initial submission/approval case |
| `reject` | [Decision rollback/unknown/replay](../../tests/browser/decisions.api.spec.ts) | New young business/rejection case |
| `resetDemo` | [Reset abort/unknown/exact replay/changed context](../../tests/browser/reset.api.spec.ts) | Failed reset notices and other-tab recovery case |

## Complete journeys and changes in this slice

The bilingual decision screens retain first submission through approval and the
frozen repayment overview. They now also create Omar's new Inventory application,
prepare all four documents, submit, claim/start review, fail Operating history
and confirm a new rejection. The applicant opens the resulting single notice,
reads the reason and reloads its public print summary.

The bilingual missing-evidence journey starts with Huda's incomplete Submitted
seed, requests its missing financial summary, saves an incomplete response, then
saves real sample evidence. A second page keeps Salma signed in and confirms the
file remains absent from the submitted snapshot until resubmission. Salma then
accepts the published evidence and verifies the target. The old notice resolves
to current detail afterward.

The existing field/file journey and repeated unsuitable replacement journey now
both run in Arabic and English. Earlier responses and their previews survive the
second round. A separate current-round race now uses real resubmission and a new
correction request from another tab, replacing its temporary database patch.
Notification and print projection tests likewise use public resubmission/private
save operations instead of the temporary fixtures from earlier tickets.

New reliability cases close language abort/uncertainty, field-verification
abort/uncertainty/intent reuse, unassignment notice failure and reset notice
failure with other-tab recovery. Existing feature cases now also refuse all
post-commit notification channels across the remaining mutation families.

## Acceptance boundaries

This report covers functional browser and transaction acceptance for issue 20.
The following handoff evidence belongs to its explicit later tickets and is not
claimed here:

- [21](../../.scratch/financing-application-and-review-implementation/issues/21-bilingual-accessibility-preview-and-print-acceptance.md) owns ordinary Chrome/Firefox manual passes, 200% zoom, screen-reader pairing, mixed-direction visual inspection and actual preview/print pagination inspection.
- [22](../../.scratch/financing-application-and-review-implementation/issues/22-performance-and-static-route-gates.md) owns Lighthouse, feedback timing, the full static route/emulator gate and performance conditions.
- [23](../../.scratch/financing-application-and-review-implementation/issues/23-release-to-firebase-hosting.md) owns hosted preview/live evidence.
- [24](../../.scratch/financing-application-and-review-implementation/issues/24-repository-case-study-and-timed-demo.md) owns release documentation, flow sketch, case study, repository publication and the timed film.

## Standards review

Pending independent review of the implementation diff and final evidence.

## Spec review

Pending independent review of the implementation diff and final evidence.
