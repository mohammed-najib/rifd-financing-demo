# 08: Search and organize the staff queue

**What to build:** A twelve-record queue with search, filters, stable sorting, five-row pages, saved preferences and equivalent narrow-screen cards.

**Blocked by:** [01: Open the bilingual demo and inspect seeded applications](01-open-bilingual-seeded-demo.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 31, 32, 33, 34, 35 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Demo access and reviewer assignment](../../financing-application-and-review/issues/03-demo-access-and-reviewer-assignment.md#answer); [Applicant and staff screen flows](../../financing-application-and-review/issues/06-applicant-and-staff-screen-flows.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Search reference/applicant/business; filter status/product/assignment; implement four stable date/amount sorts and reference tie ordering.
- [x] Use five-row pages, reset page on search/filter changes, clamp invalid pages and preserve controls for empty results.
- [x] Persist filters/sort independently, restore fresh visits with empty search/page one, honor valid explicit URL state and restore Back to queue position.
- [x] Show exact seed counts and assignments with equivalent desktop rows/mobile cards and no Draft or private-workspace content.
- [x] Use versioned preference operations and explicit stale-preference recovery; later change-subscription integration follows the same committed-storage contract.
- [x] Verify queue combinations, query fallback, history navigation, preference restoration, counts, keyboard use and both-language responsive layouts.
- [x] Preserve the table/card transition at 1199/1200 CSS pixels and the single-column layout at 767/768 pixels while adding queue controls.

## Implementation

Completed on 2026-10-15. See the [implementation and verification evidence](../../../docs/implementation/08-evidence.md) for queue behavior, versioned preference recovery, responsive screenshots, test results and separate Standards/Spec reviews.

All 355 current domain/browser cases have passing evidence across the broad and focused runs. The broad screen sweep's eleven intermittent failures passed in focused reruns; that timing limitation is recorded in the evidence. Typecheck, lint, package-skill checks, package/consumer verification and the final static build passed. No review findings remain outstanding.
