# 17: Recover startup failures and keep loaded work usable offline

**What to build:** Storage/resource failures offer safe recovery, and a fully ready demo can keep using saved files and prepared samples without a connection.

**Blocked by:** [02: Save and restore a draft with a real attachment](02-save-and-restore-draft-with-attachment.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 75, 76 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Browser persistence and simulated failures](../../financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Validate schema, seed/calculation metadata, shapes and file references without treating invalid raw drafts or the incomplete Submitted seed as corruption.
- [x] Seed only empty storage; migrate explicitly supported formats; show neutral retry/recovery for unsupported or damaged storage without silent reset or memory-only saved claims.
- [x] Handle denial, failed open/write, quota, unexpected closure, session-storage unavailability, versionchange and blocked upgrades with preserved data.
- [x] Load and retain required canonical/replacement sample bytes and current journey assets before readiness; resource loading failure offers explicit retry.
- [x] Verify loaded offline draft/file reads and saves plus prepared sample selection with no server queue; subsequent product and review routes must extend the same readiness contract.
- [x] Use isolated damaged-data fixtures for failure cases, exercise public recovery navigation and preserve existing records until an explicitly confirmed reset.

## Implementation evidence

Implemented on 2026-10-15. See [startup and offline evidence](../../../docs/implementation/17-evidence.md),
the [browser architecture](../../../docs/implementation/architecture.md) and the
[setup guide](../../../README.md). Typecheck, lint, package skill checks and build
pass. All 105 domain and 140 public-interface cases pass. All 402 unique production
screen cases have passing results across Chrome, Firefox and WebKit. Nine WebKit
startup timeouts in the six-worker sweep passed unchanged serial rechecks.
Standards review has no findings; both spec findings were fixed and accepted.
Confirmed browser-wide reset remains with slice 18.
