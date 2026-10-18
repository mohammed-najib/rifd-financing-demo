# Slice 09 implementation evidence

Implemented [Assign applications and start review](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review-implementation/issues/09-assign-applications-and-start-review.md) for stories 36 to 38.

## Assignment and review start

Staff detail provides Claim application for unassigned Submitted records. Transfers
between Salma and Khaled require a dialog naming both reviewers. Unassignment is
available only while Submitted. Under review and Corrections requested keep an
assignee; final assignments are locked. Start review is a separate action available
only to the assigned reviewer on Submitted.

The four explicit Demo commands validate their complete payload and capture the
current tab session before delay. Their transaction checks dataset and reading
access, existing receipt, shared revision, reviewer authority and state in that
order. A stale readable record reports `staleRecord` before lost-assignment denial.
The authority check after the staged write can still abort the transaction.

Assignment changes preserve status, supplied fields/files, assessments, checks,
correction rounds and baselines, private workspaces, notes and repayment. They add
one internal assignment event, advance the shared revision and commit a receipt.
Public history and applicant notifications stay unchanged. Start review advances
Submitted to Under review and writes one shared event identifier/sequence into
public history and internal activity. It creates no notification.

Receipts share the existing actor-scoped identifier namespace. Exact replay ignores
obsolete expected revisions and returns the original receipt with a current
permitted record. Changed intent and cross-family identifier reuse are refused.
Staff receipts omit unrelated workspace revisions. Earlier draft/submission
receipts remain compatible with the expanded discriminated schema.

## Screen recovery and presentation

The staff projection includes current assignment permissions from the pure domain
rule. Clean views refresh after notices and activation. A revision change clears
an open transfer confirmation. Assignment loss removes Start review while keeping
submitted information, documents and review work readable. A missed notice still
results in transaction-level refusal. Load latest inspects the receipt and current
record before a new confirmed reclaim and explicit action.

Unknown completion disables new actions until Inspect action outcome. Confirmed
storage aborts permit explicit retry. Unresolved actions and pending work use the
existing departure guard. The protected screen's session key removes confirmations
on expiry, with no automatic replay after sign-in.

Both languages use the existing Guided A tokens, logical spacing and responsive
layout. Native dialogs label the confirmation, support Escape and restore focus to
the connected opener. Four Chrome captures were visually inspected:

- [Arabic mobile assignment](evidence/09/assignment-ar-390.png)
- [Arabic mobile confirmation](evidence/09/transfer-ar-390.png)
- [English desktop assignment](evidence/09/assignment-en-1440.png)
- [English desktop confirmation](evidence/09/transfer-en-1440.png)

[Capture checks](evidence/09/visual-checks.json) report no page overflow at 390 and
1440 CSS pixels and no uncaught page errors.

## Verification

Tests use the accepted public Demo interface with actual IndexedDB and production
screens. Red checks reproduced missing claim, transfer, unassignment and screen
controls before implementation. The focused suite covers all valid seeded state
and assignment combinations, terminal colleague fixtures, retained correction work,
new submission through review start, unchanged applicant history/notifications,
changed-intent refusal, authorization, replacement datasets, expiry during commit,
simultaneous claims, stale starts, transaction rollback and uncertain completion.

Every new mutation has a staged-write abort and lost-completion/receipt-replay
case. Screen journeys cover both languages, cancellation/focus, durable refresh,
confirmation invalidation, live permission refresh, missed notices, Load latest,
confirmed reclaim, and explicit review start.

Focused verification passed 16 API cases and 18 screen cases across Chrome,
Firefox and WebKit. Typecheck, lint, all 84 domain tests, both package-skill test
files, skill validation/source reviews and packed-package consumer checks passed.
The static build passed with the existing large-chunk warning. The host uses Node
26.7.0 and Playwright 1.64.1. WebKit uses the existing compatible-library launcher
documented in [slice 01 evidence](01-evidence.md).

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:skills
pnpm skills:check
pnpm pack:domain
pnpm test:browser:api tests/browser/assignment.api.spec.ts --workers=3
pnpm build
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser tests/browser/assignment.screens.spec.ts --workers=3
```

The full public-interface suite passed all 71 cases. The review's helper naming
change also passed focused claim/review-start and transfer/receipt regressions,
typecheck, lint and the rebuilt static application. The production client asset
hash remained identical after that rename.

The final standalone production-screen sweep passed all 234 cases in Chrome,
Firefox and WebKit. Together with 84 domain and 71 API cases, all 389 current
domain/browser cases pass. This includes every new assignment scenario in each
browser. The final screen run completed in 28.4 minutes.

An earlier screen sweep ran alongside the API suite and was stopped after eight
30-second startup timeouts, with 40 cases passed and three interrupted. All eight
timed-out cases passed unchanged in the complete standalone run. Run these two
browser suites sequentially on this host to avoid that contention. The interrupted
report is retained locally under `test-results/09-overloaded-screen-report`; the
successful final report is under `test-results/09-final-screen-report`.

```sh
pnpm test:browser:api --workers=3
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser --workers=4
```

## Standards

No documented-standard violations were found. The initial review identified one
possible Mysterious Name: `draftFingerprint` and `draftReceipt` also handled staff
commands. Both now use application-wide names. Follow-up review confirmed that
the naming finding is resolved and found no new Standards findings.

## Spec

No material Spec findings. Review checked claim, confirmed transfer/reclaim,
Submitted-only unassignment, final locks, explicit review start, preserved work,
internal/public event separation, receipt/version ordering and screen recovery.
The naming-only follow-up did not change that result.

Final review counts: Standards 0 outstanding findings; Spec 0 outstanding findings.
