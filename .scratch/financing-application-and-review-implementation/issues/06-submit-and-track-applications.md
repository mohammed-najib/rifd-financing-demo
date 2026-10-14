# 06: Submit applications and track their public history

**What to build:** A complete normal first submission, durable submitted snapshot, applicant detail/history and clear next actions.

**Blocked by:** [03: Compare products and complete five-step drafts](03-compare-products-and-complete-drafts.md); [04: Recover sessions and resolve unfinished work before leaving](04-recover-sessions-and-unfinished-work.md); [05: Synchronize tabs and recover conflicting saved progress](05-synchronize-tabs-and-recover-conflicts.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 14, 15, 24, 25, 26, 27 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Application states and correction rules](../../financing-application-and-review/issues/01-application-states-and-corrections.md#answer); [Products and application requirements](../../financing-application-and-review/issues/02-products-and-application-requirements.md#answer); [Browser persistence and simulated failures](../../financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer).

- [ ] Validate all fields and four required files at the operation boundary, reject missing/pending/failed selections and retain the seed-only incomplete submission exception.
- [ ] Publish form/files atomically with both private/shared revision checks, initial financial window, status, one lifecycle event and receipt; retire the draft workspace.
- [ ] Show reference and immediate confirmation, own list/detail/history and read-only submitted data; do not add a submission notification.
- [ ] Use the fixed domain date/event order, current assignee rules and role-filtered projections for seeded and newly submitted applications.
- [ ] Add next-submission failure and extend expiry, conflict, reset-dataset, unknown-outcome and atomic-abort protections to publication.
- [ ] Verify full first submission, invalid refusal, failure/retry, no duplicate history, refresh, financial-window freezing and permitted next actions in both languages.
