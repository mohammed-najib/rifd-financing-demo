# 07: Read notifications and print applicant-visible summaries

**What to build:** Persistent owner-only notifications with current-state links and actual printable summaries for either permitted role.

**Blocked by:** [06: Submit applications and track their public history](06-submit-and-track-applications.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 28, 29, 30 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Demo access and reviewer assignment](../../financing-application-and-review/issues/03-demo-access-and-reviewer-assignment.md#answer); [Applicant and staff screen flows](../../financing-application-and-review/issues/06-applicant-and-staff-screen-flows.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Read canonical correction/decision notifications, persist owner-only read flags independently and resolve old links to the current permitted destination.
- [x] For permitted records, print saved Draft progress, last submitted correction information and final public records using the same applicant-visible projection. Staff still cannot access applicant drafts.
- [x] Exclude staff identities, assignment, assessments, notes, controls and private unfinished corrections; include public reasons/history and document presence.
- [x] Handle forbidden direct entry, preview/session closure and responsive keyboard navigation without leaking content.
- [x] Verify notification revision/idempotency/access behavior and print projections through public operations; inspect actual Arabic/English print output for draft, correction and final samples.
- [x] Later request/decision tickets must produce notifications and public history consumed here without introducing separate read or print paths.
- [x] Add print styling to the production stylesheet using print variants or layered CSS; preserve Arabic/English fonts and public-only content in actual print output.

## Implementation

Completed on 2026-10-15. See the [implementation and verification evidence](../../../docs/implementation/07-evidence.md) for notification behavior, public print policy, actual bilingual PDFs, test results and review findings.

All 329 current test cases are verified, including the three corrected timing-test reruns. Typecheck, lint, package-skill checks and the static build passed. Standards and specification reviews have no outstanding findings.
