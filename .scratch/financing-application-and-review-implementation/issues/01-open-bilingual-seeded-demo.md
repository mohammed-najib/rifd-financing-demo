# 01: Open the bilingual demo and inspect seeded applications

**What to build:** A static SPA with the complete canonical dataset, Guided A styling, identity chooser, permitted applicant/staff read views, saved language, and working direct-link refresh.

**Blocked by:** None (can start immediately).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 24, 38, 69, 70, 72, 79 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Browser persistence and simulated failures](../../financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer); [Bilingual visual direction](../../financing-application-and-review/issues/05-bilingual-visual-direction.md#answer); [Applicant and staff screen flows](../../financing-application-and-review/issues/06-applicant-and-staff-screen-flows.md#answer).

- [x] Pin the compatible pnpm, React, TypeScript and Start SPA setup; serve its actual generated static output with the inspected Hosting fallback and no running Start server.
- [x] Implement browser-only neutral startup and atomically seed the thirteen canonical applications, identities, history, correction baselines, frozen schedules, notifications, file bytes and sample catalog. Preserve exact seed ownership, counts, dates and scenario facts.
- [x] Use the pure domain/public typed demo boundary from the spec. Provide authorized reads, dataset/session context and versioned durable language preferences without exposing unrestricted storage access.
- [x] Show Arabic-first Guided A identity, English switching, tab-local identity chooser, applicant homes and a basic staff list/detail. Hide inaccessible drafts, private corrections, staff information and other applicants' records as required.
- [x] Restore valid sessions and language after refresh, resume only permitted protected links, show neutral unavailable results, and keep unimplemented actions out of the runnable slice.
- [x] Establish documented typecheck/lint/build, domain and real-browser checks. Verify both-language startup, seed projections, asset readiness and direct-link refresh in the production build; preserve local font licenses and demo disclosure.

## Implementation evidence

Implemented on 2026-10-14. See the [setup guide](../../../README.md), [architecture and canonical seed contract](../../../docs/implementation/architecture.md), and [verification and two-axis review](../../../docs/implementation/01-evidence.md). Typecheck, lint and static build pass. All 37 domain, real-browser API and production Hosting checks pass. Standards and spec reviews have no outstanding findings. Editing and review operations remain with the subsequent slices.
