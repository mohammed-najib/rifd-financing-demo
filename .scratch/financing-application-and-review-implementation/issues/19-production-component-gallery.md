# 19: Expose the production component gallery

**What to build:** A public bilingual gallery showing the actual fields, status labels, dialogs, queue views and attachment/recovery states used by the finished journeys.

**Blocked by:** [07: Read notifications and print applicant-visible summaries](07-notifications-and-print-summaries.md); [15: Show the frozen repayment overview](15-show-frozen-repayment-overview.md); [16: Demonstrate stale staff writes and explicit recovery](16-recover-stale-staff-writes.md); [18: Reset the browser-wide demo atomically](18-reset-demo-atomically.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 73 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Bilingual visual direction](../../financing-application-and-review/issues/05-bilingual-visual-direction.md#answer); [Applicant and staff screen flows](../../financing-application-and-review/issues/06-applicant-and-staff-screen-flows.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Render production components rather than a separate imitation set, covering default/focus/error/busy/empty and file preparation/save states.
- [x] Show both directions, long mixed-direction content, written status distinctions and accessible labels.
- [x] Allow unsigned entry and refresh, with narrow/wide and keyboard interaction including dialogs.
- [x] Verify shared component use, bilingual route access and visible state copy; link the gallery from the demo navigation.
- [x] Use the same Tailwind utilities, shared component-layer skins and theme tokens as the journeys; do not add a separate reset or duplicate gallery-only styles.


## Implementation evidence

See [gallery verification](../../../docs/implementation/19-evidence.md) and the
[setup guide](../../../README.md). The public `/components` route uses production
fields, statuses, attachment/save/recovery feedback, queue rows/cards and the
unsaved-work dialog. Shared validation borders and dialog focus wrapping are
verified in both directions.

Typecheck, lint, production build, all 105 domain tests, both package-skill tests
and packaged guidance checks pass. All thirty final browser cases pass, including
twelve gallery cases across Chrome, Firefox and WebKit and eighteen existing
journey regressions in Chrome and Firefox. Ten inspected captures record the
gallery, validation and dialogs. Standards and Spec reviews have no open findings.
