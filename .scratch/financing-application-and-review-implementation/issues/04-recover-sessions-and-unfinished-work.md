# 04: Recover sessions and resolve unfinished work before leaving

**What to build:** Safe departure and identity switching, fifteen-minute expiry, protected-content coverage and explicit same-identity recovery.

**Blocked by:** [02: Save and restore a draft with a real attachment](02-save-and-restore-draft-with-attachment.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 65, 66, 67, 68, 69 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Demo access and reviewer assignment](../../financing-application-and-review/issues/03-demo-access-and-reviewer-assignment.md#answer); [Browser persistence and simulated failures](../../financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Implement Save and leave, Discard and Stay for applicant buffers, pending-preparation handling, failed-save retention and best-effort browser departure warnings.
- [x] Expire on the real fifteen-minute inactivity clock or explicit control; count qualifying pointer/keyboard events and reject expired authority before renewal and commit.
- [x] Cover protected screens and previews, retain current-tab input privately, invalidate confirmations and check current state/access before same-identity recovery.
- [x] Require explicit discard before another identity receives control; prevent old-session results and automatic save, replay or retry.
- [x] Provide reusable departure behavior for authorized notes and discard/stay composers, with later staff tickets integrating their actual actions.
- [x] Verify controlled-clock expiry, activity/nonactivity, before/after-commit interruption, sign-out/switch and pending deep-link recovery in both languages.

## Implementation evidence

Implemented on 2026-10-15. The header exposes Expire session alongside the real fifteen-minute inactivity clock. Expiry immediately covers protected screens and previews, revokes pending authority, invalidates confirmations and retains unfinished input only in current-tab memory. Same-identity sign-in checks current access and application state before returning to the interrupted screen, including after public navigation. A record that no longer permits editing opens read-only without applying retained input. Interrupted preparations require explicit retry; unobserved saves require receipt inspection. No action replays automatically.

Departure handles pending preparation, failed saves, explicit discard, sign-out, switching, Back/Forward and best-effort browser unload warnings. The root layout preserves the tab's runtime across `/` and application routes. The shared `Departure` contract supports an authorized save callback and bilingual label, or Discard and Stay without a save action. Actual staff mutations remain with their owning tickets. See the [setup guide](../../../README.md) and [browser architecture](../../../docs/implementation/architecture.md).

Visual inspection covers the expired chooser in [Arabic at 390 CSS pixels](../../../docs/implementation/evidence/04/session-expired-ar-390.png) and [English at 1440 pixels](../../../docs/implementation/evidence/04/session-expired-en-1440.png). Protected previews close and their Blob URLs are revoked. Tests use the accepted public demo interface with actual IndexedDB and production browser screens, including controlled clocks, transaction-boundary interruption and a busy-storage expiry case.

## Verification

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:browser:api --workers=3
pnpm build
RIFD_HOSTING=1 RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser --workers=3
RIFD_HOSTING=1 RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser --last-failed --workers=1
```

Verified 232 distinct tests: 84 pure-domain cases, 25 public-interface cases using real IndexedDB, and 123 production screen checks across Chrome, Firefox and WebKit. Typecheck, lint and the static build pass.

The complete screen run passed 122 checks and exposed a Firefox recovery assertion whose default five-second window was too short after the fixture deliberately held storage for four seconds. Recovery now allows ten seconds, while immediate protected-content coverage retains its 500 ms deadline. The corrected case passed both a focused rerun and the standard configuration's last-failed rerun. No failures remain. The complete run report is retained locally under `test-results/04-full-report`; the successful standard rerun report is under `playwright-report`.

The WebKit launcher and Linux browser arrangement follow [slice 01 evidence](../../../docs/implementation/01-evidence.md). Responsive viewports are emulation, and Playwright WebKit is compatibility evidence rather than branded Safari or a physical-device check.

## Standards

No outstanding findings. Review found that an explicitly discarded new draft could return through editor cleanup, and a surviving header opener could take focus after successful navigation. Discard now suppresses cleanup retention and clears its recovery identifier. Stay restores opener focus; completed departure leaves focus to the destination heading. Regression tests reproduced both defects before the fixes.

## Spec

No outstanding findings. Review independently found the discarded-draft issue and confirmed that busy IndexedDB could delay expiry coverage. Subscription notifications now deliver a copied tab session synchronously, allowing the UI to cover protected content before reading storage. The busy-storage regression reproduced the delay before this fix. Both review axes rechecked the final source and tests.

Review totals: Standards 0 outstanding; Spec 0 outstanding.
