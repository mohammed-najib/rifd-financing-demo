# 14: Confirm final decisions and freeze approved terms

**What to build:** Approval or rejection with enforced prerequisites, applicant-visible reasons, fresh confirmation, final locks and atomic approved repayment data.

**Blocked by:** [13: Resubmit, verify and repeat correction rounds](13-resubmit-and-verify-corrections.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 54, 55, 56, 57, 64 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Application states and correction rules](../../financing-application-and-review/issues/01-application-states-and-corrections.md#answer); [Products and application requirements](../../financing-application-and-review/issues/02-products-and-application-requirements.md#answer); [Browser persistence and simulated failures](../../financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer).

- [ ] Require assigned Under review, reason and current explicit confirmation for both outcomes; show unmet prerequisites and current identity/reference/terms.
- [ ] Approve only with all documents Accepted, five checks Passed and current targets verified. Reject only for a failed substantive criterion; evidence deficiency alone is insufficient.
- [ ] Atomically record final state/reason/history/notification/receipt and freeze approved terms, rule version, markup, total and schedule rows; newly approved installments start Upcoming.
- [ ] Lock final fields/files/checks/assignment while preserving permitted reads, printing and assigned internal notes.
- [ ] Invalidate confirmation on expiry, stale state or reassignment; uncertain completion/replay cannot create duplicate decisions or notifications.
- [ ] Verify complete initial-submission approval, corrected approval, actual new young-business rejection, incomplete-review rejection on an independent criterion, terminal refusals and exact schedule arithmetic/dates.
