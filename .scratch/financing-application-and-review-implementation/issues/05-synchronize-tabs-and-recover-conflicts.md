# 05: Synchronize tabs and recover conflicting saved progress

**What to build:** Two tabs share committed data while retaining separate sessions; clean views refresh and dirty drafts or preferences require explicit conflict recovery.

**Blocked by:** [02: Save and restore a draft with a real attachment](02-save-and-restore-draft-with-attachment.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 62, 63, 64 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Browser persistence and simulated failures](../../financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Send dataset/identifier/revision hints only after commit; reread authorized storage on hints and activation, including missed-notice recovery.
- [x] Keep independent tab sessions, explain inherited initial identity where applicable, and never transmit protected record contents in change hints.
- [x] Refresh clean views and permissions; retain dirty input with a newer-data notice. Refuse conflicting workspace/preference revisions without automatic merging or replacing expected versions.
- [x] Allow inspection of latest saved state with retained unapplied values and explicit reapplication under a new intent.
- [x] Keep private and shared revision scopes distinct and make the contract available to subsequent correction, queue and review operations.
- [x] Use same-context browser pages for competing saves, missed broadcasts, preference races and independent identity behavior; confirm post-commit notice failure cannot duplicate a save.

## Implementation

Implemented and verified on 2026-10-15 against baseline `d31901a72e9eb82d53e66f4eedd63b3cb3d28238`.

Both hint transports now carry only the dataset, revision scope, affected identifier and committed revision. Malformed hints and unrelated storage events are ignored. Broadcast failure attempts the safe storage fallback, and failure of both transports leaves a completed save successful. Receipt replays do not emit repeated notices. The public `CommitHint` contract distinguishes private workspace, shared application and independent preference revisions for subsequent operations.

Clean screens reread authorized storage on committed notices and activation. Dirty drafts keep their raw input, product and ready bytes until explicit inspection and reapplication. Refused language changes retain the intended language independently of the current display language. Inspect latest saved preference reveals the saved value; Reapply my preference uses a new identifier against that inspected revision. Another competing change requires inspection again. Discard my choice dismisses the refused preference without writing.

The bilingual disclosure explains that an opener-created or duplicated tab can inherit its initial identity, then has independent activity, switching, sign-out and expiry. The header continues to show the current identity.

## Verification

Typecheck, lint and the static build pass. All 84 domain tests and 27 public-interface tests using real IndexedDB pass. Nine focused synchronization screen checks pass across Chrome, Firefox and WebKit.

The complete production Hosting screen run passed 130 of 132 checks and exposed two Firefox recovery timeouts. Slow sign-in, access inspection and editor reload require at least 4.5 seconds; one traced recovery took 4.99 seconds against the existing five-second assertion. The recovery wait now allows ten seconds. The interrupted-preparation and explicit-retry assertions remain intact. Both complete Firefox scenarios passed twice on the rebuilt, clean Hosting output. Temporary diagnosis files and instrumentation were removed. The full run report is retained locally under `test-results/05-full-report`, and repeated recovery results under `test-results/05-recovery-final`.

The standard configuration's last-failed rerun also passed both cases. No failures remain. In total, 243 distinct tests are verified: 84 domain cases, 27 public-interface cases and 132 production screen checks. The successful final rerun report is under `playwright-report`.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:browser:api --workers=3
pnpm build
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser tests/browser/sync.screens.spec.ts --workers=3
RIFD_HOSTING=1 RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser --workers=3
RIFD_HOSTING=1 RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser --last-failed --workers=1
```

Coverage includes same-context competing saves, native broadcasts and the storage fallback, missed-notice activation, raw invalid input and ready-byte retention, actual restored download bytes, repeated preference races, opener-created identity inheritance and independent sign-out/switching/expiry. Notification failure and receipt replay leave the original save and revision intact. Reviewer subscriptions reread their own authorized projection and cannot expose the private draft.

The WebKit host launcher follows [slice 01 evidence](../../../docs/implementation/01-evidence.md). Responsive viewports are emulation and WebKit checks provide compatibility evidence.

Visual inspection covers [Arabic preference recovery at 390 CSS pixels](../../../docs/implementation/evidence/05/preference-conflict-ar-390.png) and [English preference recovery at 1440 pixels](../../../docs/implementation/evidence/05/preference-conflict-en-1440.png). The recovery panel keeps its inspection/reapplication choices visible in both directions. The [English draft conflict at 390 pixels](../../../docs/implementation/evidence/05/draft-conflict-en-390.png) records retained invalid input alongside the latest saved state. Narrow-width checks report no horizontal overflow.

## Standards

No findings. The staged changes follow the documented module boundaries, separate revision scopes, hint-only messaging, retained-input conflict recovery, bilingual vocabulary and Tailwind conventions. Tests exercise the public demo interface and rendered screens, with messaging failures injected at browser boundaries. The review found no material baseline smells or documented-standard violations.

## Spec

No findings. The change satisfies this ticket's scope: safe post-commit hints, activation recovery, independent tab sessions, retained draft/preference conflicts, explicit inspection and reapplication with new intents, and distinct workspace/shared revision contracts. Existing competing-save and receipt tests complement the new same-context synchronization journeys. No missing requirements, incorrect behavior or unrequested scope creep were identified within this slice.

Both axes reviewed the staged diff against the pinned baseline. They also rechecked the recovery assertion adjustment and found no new issues. Future correction, queue, review and reset operations remain with their owning tickets.

Review totals: Standards 0 findings; Spec 0 findings.
