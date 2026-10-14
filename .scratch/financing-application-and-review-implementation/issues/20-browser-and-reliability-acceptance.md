# 20: Complete browser and reliability acceptance evidence

**What to build:** A passing production-build acceptance report covering every transition, permission, mutation, recovery and complete journey.

**Blocked by:** [19: Expose the production component gallery](19-production-component-gallery.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 64, 74, 82 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Acceptance and implementation handoff](../../financing-application-and-review/issues/07-acceptance-and-implementation-handoff.md#answer); [Acceptance tooling facts](../../financing-application-and-review/issues/09-acceptance-tooling-facts.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [ ] Close the functional coverage matrix through the existing public interface and screens, extending tests from feature tickets rather than creating internal seams.
- [ ] Verify all mutation families for transaction abort, receipt replay, changed intent, unknown outcome and failed post-commit notice; close cross-tab/session/reset race gaps.
- [ ] Complete first submission/approval, missing evidence, field/file/repeated corrections, actual rejection, controls, notification/print projections and loaded-offline journeys in both languages.
- [ ] Run installed Chrome and pinned Playwright Firefox plus required WebKit smoke; record actual versions and fix failures.
- [ ] Retain reports/traces, run typecheck/lint/build, and link each functional acceptance requirement to evidence with accurate emulation/browser claims.
- [ ] Verify the Tailwind-generated stylesheet on the production static build and the separate API harness; keep assertions at the existing public interface and screen seams.
