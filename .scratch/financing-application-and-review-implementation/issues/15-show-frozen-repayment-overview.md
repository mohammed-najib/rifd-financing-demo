# 15: Show the frozen repayment overview

**What to build:** An Approved-only read-only repayment view with dated upcoming/completed entries and durable totals.

**Blocked by:** [14: Confirm final decisions and freeze approved terms](14-confirm-decisions-and-freeze-terms.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 58, 59 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Products and application requirements](../../financing-application-and-review/issues/02-products-and-application-requirements.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Read frozen accepted terms/rows and derive completed, remaining and upcoming totals without recalculating from changed product definitions or current date.
- [x] Show financing amount, markup and total separately, with translated whole-YER and Gregorian date display and visible fictional-illustration copy.
- [x] Preserve the historical eighteen 72,000-YER rows, two completed entries and exact totals; new approval rows remain Upcoming.
- [x] Support own-applicant and submitted staff routes; return other states to permitted detail and expose no payment/completion mutation.
- [x] Verify new approval and historical refresh, changed browser date/rules, role access, totals and responsive keyboard presentation in both languages.

Implementation and validation: [slice 15 evidence](../../../docs/implementation/15-evidence.md).
