# 21: Verify bilingual layouts, keyboard flows, previews and print

**What to build:** Recorded manual evidence and fixes for the accepted responsive, accessibility, file-preview and print requirements.

**Blocked by:** [19: Expose the production component gallery](19-production-component-gallery.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 70, 71, 72, 82 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Acceptance and implementation handoff](../../financing-application-and-review/issues/07-acceptance-and-implementation-handoff.md#answer); [Applicant and staff screen flows](../../financing-application-and-review/issues/06-applicant-and-staff-screen-flows.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Walk seven journeys in both languages at 360/390/768/1440 CSS pixels and 200% zoom; inspect long/mixed-direction content and action/error visibility.
- [x] Verify actual ordinary Chrome/Firefox keyboard navigation, focus/error links, modal behavior, departure/recovery feedback and screen-reader smoke with recorded pairing.
- [x] Preview real stored multipage PDF/JPEG/PNG after refresh, inspect mobile/fallback behavior and closure on expiry/switch/reset.
- [x] Inspect saved Arabic/English print output for Draft, correction and final records, long history, pagination and public-only policy for both roles.
- [x] Verify the public gallery and record screenshots/results against release commit, versions, viewport and language; resolve findings without claiming unperformed physical-device or full conformance checks.
- [x] Extend the [Tailwind migration visual evidence](../../../docs/implementation/tailwind-v4.md) for later UI changes; check 767/768 and 1199/1200 boundaries, shared statuses, lists, controls and focus indicators.
- [x] Inspect pointer activation of correction-workspace Demo controls and Retry preparation while prepared samples appear. [Slice 20](../../../docs/implementation/20-evidence.md) retained two traces of interaction during that layout change; its corrected keyboard tests do not establish pointer reliability.

Implementation and evidence are recorded in [slice 21](../../../docs/implementation/21-evidence.md).
The completed follow-up records ten ordinary-browser walks, 390 primary scenes,
43 supplemental scenes, 38 scene rechecks and 30 final focus rechecks. Final
source is `9783563`; earlier captures retain their separate source bindings.
Arabic uses ordinary Firefox; English uses ordinary Chrome. Both cover the four widths
and native 200% zoom. Saved print inspection and the four user-assisted Orca
scenes retain their historical source bindings and exact scope.

Acceptance fixes cover stable sample pickers, labelled previews, dialog Tab
containment, settled-route focus, save and queue focus, visible validation
links, mixed-direction money and accurate empty/departure copy. Final rechecks
also keep paged queue controls visible and retain reviewer assessment, check
and verification focus. Actual stored PDF/JPEG/PNG previews, separate viewers/downloads and unreadable-image fallback
have recorded ordinary-browser results.

The complete automated invocation against `7c2fc95` passed 158 API cases and
559 screen cases, with five Firefox startup failures. An unchanged-source recheck passed
all six cases in the affected file, including those five. The full invocation
remains failed in the evidence; consolidated results cover every required
case. The final focus changes pass all 165 cases in the five complete affected
screen files across three engines, plus ordinary-browser rechecks. Both review axes have no outstanding findings. No physical-device,
Safari or full accessibility-conformance result is claimed.
