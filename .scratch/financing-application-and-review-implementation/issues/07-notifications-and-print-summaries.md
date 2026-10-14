# 07: Read notifications and print applicant-visible summaries

**What to build:** Persistent owner-only notifications with current-state links and actual printable summaries for either permitted role.

**Blocked by:** [06: Submit applications and track their public history](06-submit-and-track-applications.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 28, 29, 30 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Demo access and reviewer assignment](../../financing-application-and-review/issues/03-demo-access-and-reviewer-assignment.md#answer); [Applicant and staff screen flows](../../financing-application-and-review/issues/06-applicant-and-staff-screen-flows.md#answer).

- [ ] Read canonical correction/decision notifications, persist owner-only read flags independently and resolve old links to the current permitted destination.
- [ ] For permitted records, print saved Draft progress, last submitted correction information and final public records using the same applicant-visible projection. Staff still cannot access applicant drafts.
- [ ] Exclude staff identities, assignment, assessments, notes, controls and private unfinished corrections; include public reasons/history and document presence.
- [ ] Handle forbidden direct entry, preview/session closure and responsive keyboard navigation without leaking content.
- [ ] Verify notification revision/idempotency/access behavior and print projections through public operations; inspect actual Arabic/English print output for draft, correction and final samples.
- [ ] Later request/decision tickets must produce notifications and public history consumed here without introducing separate read or print paths.
