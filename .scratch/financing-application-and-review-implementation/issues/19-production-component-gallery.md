# 19: Expose the production component gallery

**What to build:** A public bilingual gallery showing the actual fields, status labels, dialogs, queue views and attachment/recovery states used by the finished journeys.

**Blocked by:** [07: Read notifications and print applicant-visible summaries](07-notifications-and-print-summaries.md); [15: Show the frozen repayment overview](15-show-frozen-repayment-overview.md); [16: Demonstrate stale staff writes and explicit recovery](16-recover-stale-staff-writes.md); [18: Reset the browser-wide demo atomically](18-reset-demo-atomically.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 73 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Bilingual visual direction](../../financing-application-and-review/issues/05-bilingual-visual-direction.md#answer); [Applicant and staff screen flows](../../financing-application-and-review/issues/06-applicant-and-staff-screen-flows.md#answer).

- [ ] Render production components rather than a separate imitation set, covering default/focus/error/busy/empty and file preparation/save states.
- [ ] Show both directions, long mixed-direction content, written status distinctions and accessible labels.
- [ ] Allow unsigned entry and refresh, with narrow/wide and keyboard interaction including dialogs.
- [ ] Verify shared component use, bilingual route access and visible state copy; link the gallery from the demo navigation.
