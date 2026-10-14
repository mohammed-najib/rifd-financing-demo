# 09: Assign applications and start review

**What to build:** Claiming, confirmed transfers, permitted unassignment and explicit review start without losing existing review work.

**Blocked by:** [02: Save and restore a draft with a real attachment](02-save-and-restore-draft-with-attachment.md); [08: Search and organize the staff queue](08-search-and-organize-staff-queue.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 36, 37, 38 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Application states and correction rules](../../financing-application-and-review/issues/01-application-states-and-corrections.md#answer); [Demo access and reviewer assignment](../../financing-application-and-review/issues/03-demo-access-and-reviewer-assignment.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [ ] Claim unassigned Submitted records; confirm reviewer transfers in allowed states; unassign only Submitted and lock final assignments.
- [ ] Keep assignment and Start review separate; only assigned reviewer can start Submitted to Under review.
- [ ] Commit assignment or review-start effects with current shared revision/session/dataset, receipts and exactly the appropriate internal/public events.
- [ ] Preserve application state on assignment and all assessments, checks, correction rounds, notes and supplied data.
- [ ] Refresh assignment permissions, refuse readable stale writes before lost-assignment denial and retain authorized read-only views.
- [ ] Verify all state/assignment combinations, atomic failures/replays, newly submitted and seeded records, and unchanged applicant notification/history on transfers.
