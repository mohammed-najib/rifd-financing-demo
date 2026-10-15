# 10: Assess evidence, record review checks and save internal notes

**What to build:** A working staff review workspace with document previews and assessments, all five checks, internal activity and explicit note saving.

**Blocked by:** [04: Recover sessions and resolve unfinished work before leaving](04-recover-sessions-and-unfinished-work.md); [09: Assign applications and start review](09-assign-applications-and-start-review.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 39, 40, 41, 42 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Products and application requirements](../../financing-application-and-review/issues/02-products-and-application-requirements.md#answer); [Demo access and reviewer assignment](../../financing-application-and-review/issues/03-demo-access-and-reviewer-assignment.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Present submitted information/documents beside five fixed checks, correction verification context, notes and activity, with responsive section navigation.
- [x] Accept or mark current documents Needs replacement with a reason, keeping assessment separate from upload and application status.
- [x] Implement exact evidence consistency and four substantive rules, dependency identities and whole-rial capacity arithmetic; prohibit numeric Passed overrides.
- [x] Save authorized notes in Under review, Corrections requested and final states; keep staff-only information absent from applicant projections and print.
- [x] Apply current version/assignment/state guards, atomic receipts, save-note departure behavior, expiry recovery and read-only colleague access.
- [x] Verify rule boundaries/arithmetic references, document access/status changes, note visibility, forbidden writes and bilingual keyboard review against the public interface.

## Implementation

Completed on 2026-10-15. See the [implementation and verification evidence](../../../docs/implementation/10-evidence.md) for the rules, transaction guarantees, bilingual workspace, recovery, screenshots and separate Standards/Spec reviews.

All 444 current domain/browser cases pass across complete sweeps and focused rechecks: 103 domain, 83 public-interface and 258 production-screen cases across Chrome, Firefox and WebKit. Typecheck, lint, package-skill checks, packed-package consumer verification and the final static build passed. The evidence records the startup timeouts, successful isolated reruns and final bilingual preview checks. No review findings remain outstanding.
