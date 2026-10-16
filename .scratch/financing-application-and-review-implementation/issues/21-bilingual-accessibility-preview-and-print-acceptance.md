# 21: Verify bilingual layouts, keyboard flows, previews and print

**What to build:** Recorded manual evidence and fixes for the accepted responsive, accessibility, file-preview and print requirements.

**Blocked by:** [19: Expose the production component gallery](19-production-component-gallery.md).

**Status:** partial; manual acceptance pending

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 70, 71, 72, 82 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Acceptance and implementation handoff](../../financing-application-and-review/issues/07-acceptance-and-implementation-handoff.md#answer); [Applicant and staff screen flows](../../financing-application-and-review/issues/06-applicant-and-staff-screen-flows.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [ ] Walk seven journeys in both languages at 360/390/768/1440 CSS pixels and 200% zoom; inspect long/mixed-direction content and action/error visibility.
- [ ] Verify actual ordinary Chrome/Firefox keyboard navigation, focus/error links, modal behavior, departure/recovery feedback and screen-reader smoke with recorded pairing.
- [ ] Preview real stored multipage PDF/JPEG/PNG after refresh, inspect mobile/fallback behavior and closure on expiry/switch/reset.
- [x] Inspect saved Arabic/English print output for Draft, correction and final records, long history, pagination and public-only policy for both roles.
- [x] Verify the public gallery and record screenshots/results against release commit, versions, viewport and language; resolve findings without claiming unperformed physical-device or full conformance checks.
- [x] Extend the [Tailwind migration visual evidence](../../../docs/implementation/tailwind-v4.md) for later UI changes; check 767/768 and 1199/1200 boundaries, shared statuses, lists, controls and focus indicators.
- [x] Inspect pointer activation of correction-workspace Demo controls and Retry preparation while prepared samples appear. [Slice 20](../../../docs/implementation/20-evidence.md) retained two traces of interaction during that layout change; its corrected keyboard tests do not establish pointer reliability.

Implementation and evidence are recorded in [slice 21](../../../docs/implementation/21-evidence.md).
The sample picker layout is stable during loading, with bilingual pointer
regressions, responsive checkpoint captures, real stored-file checks and expanded
public print comparisons. Keep this ticket open until the remaining manual
journeys, native 200% zoom, paired screen-reader smoke and native PDF rendering
checks have recorded passing results. Automated checkpoints are not a substitute
for those checks.

Save progress keeps keyboard focus during saving. The production dialogs share
Tab containment, with bilingual decision and preview regressions and a direct
ordinary Chrome decision-dialog recheck.
