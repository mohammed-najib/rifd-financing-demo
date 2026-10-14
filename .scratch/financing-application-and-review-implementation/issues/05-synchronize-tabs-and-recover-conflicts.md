# 05: Synchronize tabs and recover conflicting saved progress

**What to build:** Two tabs share committed data while retaining separate sessions; clean views refresh and dirty drafts or preferences require explicit conflict recovery.

**Blocked by:** [02: Save and restore a draft with a real attachment](02-save-and-restore-draft-with-attachment.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 62, 63, 64 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Browser persistence and simulated failures](../../financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [ ] Send dataset/identifier/revision hints only after commit; reread authorized storage on hints and activation, including missed-notice recovery.
- [ ] Keep independent tab sessions, explain inherited initial identity where applicable, and never transmit protected record contents in change hints.
- [ ] Refresh clean views and permissions; retain dirty input with a newer-data notice. Refuse conflicting workspace/preference revisions without automatic merging or replacing expected versions.
- [ ] Allow inspection of latest saved state with retained unapplied values and explicit reapplication under a new intent.
- [ ] Keep private and shared revision scopes distinct and make the contract available to subsequent correction, queue and review operations.
- [ ] Use same-context browser pages for competing saves, missed broadcasts, preference races and independent identity behavior; confirm post-commit notice failure cannot duplicate a save.
