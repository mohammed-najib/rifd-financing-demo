# 21: Verify bilingual layouts, keyboard flows, previews and print

**What to build:** Recorded manual evidence and fixes for the accepted responsive, accessibility, file-preview and print requirements.

**Blocked by:** [19: Expose the production component gallery](19-production-component-gallery.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 70, 71, 72, 82 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Acceptance and implementation handoff](../../financing-application-and-review/issues/07-acceptance-and-implementation-handoff.md#answer); [Applicant and staff screen flows](../../financing-application-and-review/issues/06-applicant-and-staff-screen-flows.md#answer).

- [ ] Walk seven journeys in both languages at 360/390/768/1440 CSS pixels and 200% zoom; inspect long/mixed-direction content and action/error visibility.
- [ ] Verify actual ordinary Chrome/Firefox keyboard navigation, focus/error links, modal behavior, departure/recovery feedback and screen-reader smoke with recorded pairing.
- [ ] Preview real stored multipage PDF/JPEG/PNG after refresh, inspect mobile/fallback behavior and closure on expiry/switch/reset.
- [ ] Inspect saved Arabic/English print output for Draft, correction and final records, long history, pagination and public-only policy for both roles.
- [ ] Verify the public gallery and record screenshots/results against release commit, versions, viewport and language; resolve findings without claiming unperformed physical-device or full conformance checks.
