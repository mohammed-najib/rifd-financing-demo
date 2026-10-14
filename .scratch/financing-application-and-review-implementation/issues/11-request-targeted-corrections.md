# 11: Request targeted corrections

**What to build:** A reviewer sends specific field/document targets and reasons; the applicant sees the request while staff review pauses.

**Blocked by:** [06: Submit applications and track their public history](06-submit-and-track-applications.md); [10: Assess evidence, record review checks and save internal notes](10-assess-evidence-checks-and-notes.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 43, 53 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Application states and correction rules](../../financing-application-and-review/issues/01-application-states-and-corrections.md#answer); [Products and application requirements](../../financing-application-and-review/issues/02-products-and-application-requirements.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [ ] Compose, inspect and explicitly confirm a nonempty target set with individual reasons in assigned Under review.
- [ ] Permit only meaningful editable fields/slots, never product or automatic dependency-group unlocking.
- [ ] Atomically capture immutable baseline/round, open a private workspace, enter Corrections requested and append one public event/notification with receipt.
- [ ] Expose targets/reasons in applicant detail/history and staff context while allowing only staff reading and authorized notes until resubmission.
- [ ] Preserve unsent composer text through recoverable errors and use discard/stay departure behavior without sending implicitly.
- [ ] Verify prepared missing-evidence request, field/document targets, invalid/state/assignment refusal, atomic failures/replay and public-versus-internal visibility.
