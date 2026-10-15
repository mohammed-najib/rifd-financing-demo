# 18: Reset the browser-wide demo atomically

**What to build:** A confirmed reset restores every seed and default, survives retry safely, and invalidates old sessions, tabs and delayed requests only after success.

**Blocked by:** [04: Recover sessions and resolve unfinished work before leaving](04-recover-sessions-and-unfinished-work.md); [05: Synchronize tabs and recover conflicting saved progress](05-synchronize-tabs-and-recover-conflicts.md); [17: Recover startup failures and keep loaded work usable offline](17-recover-startup-and-use-offline.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 77, 78 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Browser persistence and simulated failures](../../financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Provide public/unsigned/startup-recovery reset with a warning naming browser-wide data, files, preferences, sessions and unfinished work.
- [x] Bind confirmation to observed dataset/recovery context; prepare resources then replace all durable data and defaults atomically with new dataset and reset receipt.
- [x] Implement exact immediate reset-replay recognition before ordinary session/dataset checks; changed context requires fresh inspection/confirmation and old intents cannot erase later work.
- [x] Retain previous dataset/buffers on abort; clear sessions, files, previews, caches, dialogs and controls only after confirmed success/new-dataset observation.
- [x] Use rollback-capable schema recovery and explain blocked/denied reset without destructive delete/reseed shortcuts.
- [x] Verify cancel, injected failure, success/replay, changed contexts, same-context tabs and delayed old requests, including exact thirteen-record and notification restoration.

## Implementation evidence

See [reset evidence](../../../docs/implementation/18-evidence.md), the
[browser architecture](../../../docs/implementation/architecture.md) and the
[setup guide](../../../README.md). Typecheck, lint, package skill checks, archive
verification and production build pass. All 105 domain tests, both package-skill
tests, 150 unique public-interface cases and 414 unique production screen cases
have passing results. The final 284-case screen batch passed without failures,
including all twelve reset screen cases across Chrome, Firefox and WebKit.
Standards and Spec reviews have no open findings.
