# 03: Compare products and complete five-step drafts

**What to build:** Product comparison and a complete saveable application form, including all four document slots, product switching, bilingual validation and a review step.

**Blocked by:** [02: Save and restore a draft with a real attachment](02-save-and-restore-draft-with-attachment.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 1, 2, 3, 4, 5, 6, 7, 11, 12, 13 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Products and application requirements](../../financing-application-and-review/issues/02-products-and-application-requirements.md#answer); [Applicant and staff screen flows](../../financing-application-and-review/issues/06-applicant-and-staff-screen-flows.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Show both fictional products with exact limits, terms, markup, purposes and requirements; preserve the selection through sign-in and explicit new-or-resume choice.
- [x] Complete personal/business/financing/documents/review steps with all accepted fields and four document slots, raw invalid saves and URL step fallback.
- [x] Implement canonical input normalization and field boundaries while keeping substantive review criteria separate from format validation.
- [x] Keep incomplete steps reachable and preserve input, caret where possible and file preparation across step/language changes without implicitly saving.
- [x] Confirm incompatible fourth-document removal on draft product switch, preserve shared data, stage removal until save and retain invalid amount/term values.
- [x] Verify creation/save/restoration, field boundaries, linked errors, product-switch cancellation/confirmation, Arabic-Indic input and responsive keyboard use.
- [x] Reuse the Tailwind form/control and feedback styles for every step; preserve the local fonts, logical spacing, focus indicators and responsive cutoffs.

## Implementation evidence

Implemented and verified on 2026-10-15. See the [setup guide](../../../README.md), [browser architecture](../../../docs/implementation/architecture.md), and [verification and two-axis review](../../../docs/implementation/03-evidence.md). Typecheck, lint and the static build pass. All 168 domain, public-interface and production Hosting screen tests pass, with six final keyboard/review checks repeated against the rebuilt output. Standards and spec reviews have no outstanding findings. Evidence screenshots cover Arabic review at 390 CSS pixels and English review at 1440 pixels. Submission remains with ticket 06.
