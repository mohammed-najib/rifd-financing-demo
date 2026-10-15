# 11: Request targeted corrections

**What to build:** A reviewer sends specific field/document targets and reasons; the applicant sees the request while staff review pauses.

**Blocked by:** [06: Submit applications and track their public history](06-submit-and-track-applications.md); [10: Assess evidence, record review checks and save internal notes](10-assess-evidence-checks-and-notes.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 43, 53 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Application states and correction rules](../../financing-application-and-review/issues/01-application-states-and-corrections.md#answer); [Products and application requirements](../../financing-application-and-review/issues/02-products-and-application-requirements.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Compose, inspect and explicitly confirm a nonempty target set with individual reasons in assigned Under review.
- [x] Permit only meaningful editable fields/slots, never product or automatic dependency-group unlocking.
- [x] Atomically capture immutable baseline/round, open a private workspace, enter Corrections requested and append one public event/notification with receipt.
- [x] Expose targets/reasons in applicant detail/history and staff context while allowing only staff reading and authorized notes until resubmission.
- [x] Preserve unsent composer text through recoverable errors and use discard/stay departure behavior without sending implicitly.
- [x] Verify prepared missing-evidence request, field/document targets, invalid/state/assignment refusal, atomic failures/replay and public-versus-internal visibility.

## Implementation

Completed on 2026-10-15. See the [implementation and verification evidence](../../../docs/implementation/11-evidence.md) for target validation, atomic request creation, public/private projections, bilingual confirmation, retained composer work, recovery and screenshots.

All 103 domain tests and 88 public-interface cases pass. Focused production-screen checks pass all 18 correction cases across Chrome, Firefox and WebKit, plus 11 existing Chrome review/departure regressions. Typecheck, lint, package-skill checks, packed-package consumer verification and the final static build pass. Separate Standards and Spec reviews have no outstanding findings.
