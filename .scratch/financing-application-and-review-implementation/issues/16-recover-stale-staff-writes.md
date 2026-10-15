# 16: Demonstrate stale staff writes and explicit recovery

**What to build:** Khaled's simulated reassignment makes one view stale; writes are refused, text retained, and reclaiming plus fresh confirmation is required.

**Blocked by:** [14: Confirm final decisions and freeze approved terms](14-confirm-decisions-and-freeze-terms.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 60, 61 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Demo access and reviewer assignment](../../financing-application-and-review/issues/03-demo-access-and-reviewer-assignment.md#answer); [Browser persistence and simulated failures](../../financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Offer the control only for an eligible Under review record assigned to Salma, commit the transfer/internal event and hold only the initiating view stale.
- [x] Reject all stale staff write families without their effects, while other tabs receive the transfer normally.
- [x] Load latest reveals Khaled/activity, preserves review results and unapplied text, changes write controls to read-only and invalidates confirmations.
- [x] Require a normal confirmed reclaim, current-record inspection and a new permitted action, including new final confirmation.
- [x] Verify deterministic conflict and a separate real same-context race, stale-versus-forbidden precedence, expiry during recovery and no duplicate or lost effects.

Implementation and validation: [slice 16 evidence](../../../docs/implementation/16-evidence.md).
