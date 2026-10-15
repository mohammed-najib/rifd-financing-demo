# Slice 09 implementation evidence

Implemented [Assign applications and start review](../../.scratch/financing-application-and-review-implementation/issues/09-assign-applications-and-start-review.md) for stories 36 to 38.

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
