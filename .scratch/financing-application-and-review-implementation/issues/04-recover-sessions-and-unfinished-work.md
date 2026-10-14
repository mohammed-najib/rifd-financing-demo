# 04: Recover sessions and resolve unfinished work before leaving

**What to build:** Safe departure and identity switching, fifteen-minute expiry, protected-content coverage and explicit same-identity recovery.

**Blocked by:** [02: Save and restore a draft with a real attachment](02-save-and-restore-draft-with-attachment.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 65, 66, 67, 68, 69 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Demo access and reviewer assignment](../../financing-application-and-review/issues/03-demo-access-and-reviewer-assignment.md#answer); [Browser persistence and simulated failures](../../financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [ ] Implement Save and leave, Discard and Stay for applicant buffers, pending-preparation handling, failed-save retention and best-effort browser departure warnings.
- [ ] Expire on the real fifteen-minute inactivity clock or explicit control; count qualifying pointer/keyboard events and reject expired authority before renewal and commit.
- [ ] Cover protected screens and previews, retain current-tab input privately, invalidate confirmations and check current state/access before same-identity recovery.
- [ ] Require explicit discard before another identity receives control; prevent old-session results and automatic save, replay or retry.
- [ ] Provide reusable departure behavior for authorized notes and discard/stay composers, with later staff tickets integrating their actual actions.
- [ ] Verify controlled-clock expiry, activity/nonactivity, before/after-commit interruption, sign-out/switch and pending deep-link recovery in both languages.
