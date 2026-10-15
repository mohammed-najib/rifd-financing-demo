# 09: Assign applications and start review

**What to build:** Claiming, confirmed transfers, permitted unassignment and explicit review start without losing existing review work.

**Blocked by:** [02: Save and restore a draft with a real attachment](02-save-and-restore-draft-with-attachment.md); [08: Search and organize the staff queue](08-search-and-organize-staff-queue.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 36, 37, 38 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Application states and correction rules](../../financing-application-and-review/issues/01-application-states-and-corrections.md#answer); [Demo access and reviewer assignment](../../financing-application-and-review/issues/03-demo-access-and-reviewer-assignment.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Claim unassigned Submitted records; confirm reviewer transfers in allowed states; unassign only Submitted and lock final assignments.
- [x] Keep assignment and Start review separate; only assigned reviewer can start Submitted to Under review.
- [x] Commit assignment or review-start effects with current shared revision/session/dataset, receipts and exactly the appropriate internal/public events.
- [x] Preserve application state on assignment and all assessments, checks, correction rounds, notes and supplied data.
- [x] Refresh assignment permissions, refuse readable stale writes before lost-assignment denial and retain authorized read-only views.
- [x] Verify all state/assignment combinations, atomic failures/replays, newly submitted and seeded records, and unchanged applicant notification/history on transfers.

## Implementation

Completed on 2026-10-15. See the [implementation and verification evidence](../../../docs/implementation/09-evidence.md) for the operations, permission rules, transaction guarantees, bilingual controls, recovery, screenshots and separate Standards/Spec reviews.

All 389 current domain/browser cases pass: 84 domain, 71 public-interface and 234 production-screen cases across Chrome, Firefox and WebKit. Typecheck, lint, package-skill checks, packed-package consumer verification and the final static build passed. The evidence records the interrupted competing browser run and the successful complete standalone run. No review findings remain outstanding.
