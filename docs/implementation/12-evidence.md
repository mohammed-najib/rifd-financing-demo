# Slice 12 implementation evidence

> Dated implementation record. For current setup and behavior, start with the [documentation index](../README.md). Test counts, release identifiers and operational decisions below apply to the work recorded here.

Implemented [Save a private correction response](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review-implementation/issues/12-save-private-correction-response.md), stories 25, 44 and 45, against starting commit `5cab564a352383dfe8898257effb4b99c6cb1940`.

## Private response

The current correction route opens only requested field and document controls.
It shows individual reasons, the fixed request date and baseline values, response
progress and a read-only summary. Product and all other information stay locked.
Submitted information and published files remain separately labelled below it.
Progress describes baseline-relative changes and does not claim reviewer approval.
Resubmission remains in ticket 13.

The typed `saveCorrections` command carries the application, round, workspace
revision, raw input, fixed product and saved/prepared file choices. Its transaction
checks session, dataset, permitted reading, receipt, workspace revision, ownership,
active state/round and target permissions. It accepts incomplete and invalid
requested values. Unrequested raw fields and documents must match the baseline.
File preparation checks requested-slot permission before preparation and again
before returning ready bytes.

Workspace fields, file references, new bytes and the receipt commit together.
Saving increments only the workspace revision. Shared revision, submitted
snapshot, fixed baseline, assignment, review outcomes, public history, activity
and notifications stay unchanged. Staff notes and reassignment can change the
shared revision without refusing a current private save. Staff cannot read private
replacement bytes, and print continues showing submitted information.

## Recovery

The existing editor retains raw input, selections, ready bytes and save intent
in tab memory. Failed preparation permits explicit retry without reselecting.
A failed save keeps the old saved file and prepared replacement. Unknown outcomes
require receipt inspection; replay does not duplicate effects. Input typed after
saving starts remains unsaved after that captured save completes.

Departure offers Stay, Discard changes and Save and leave. Pending work blocks
departure, and saving and leaving requires completed or discarded selections.
Expiry hides the editor and previews. The same identity can recover its unfinished
work after current access is checked. Another identity requires explicit discard.
Refresh restores only durable workspace input and actual saved file bytes.

A newer private workspace preserves dirty input, disables saving and requires
inspection before explicit reapplication. Clean editors adopt the saved workspace.
Obsolete round links and inactive correction routes return to permitted current
detail with an explanation. Retained work from an earlier round stays outside the
current editor.

## Verification

Tests use the agreed public typed Demo interface with actual IndexedDB and the
production static screens. The first interface red run reproduced correction
preparation being unavailable. The screen red run reproduced the absent editor.
The complete domain suite passes all 103 cases. Typecheck, lint, packaged-skill
validation and both skill test files pass. The receipt addition was reviewed
against both package guides; source review hashes accompany the change.

Five interface cases cover raw invalid input, private/submitted projections,
saved bytes after reload, receipt replay, forbidden field/document/product edits,
obsolete rounds, ownership, workspace versions, simultaneous saves, unrelated
notes and transfers, rollback, unknown completion and expiry at commit.

Nine screen cases cover both languages, target-only editing, saved-file reload,
preparation/save failures, departure choices, identity recovery, interrupted
preparation, stale-workspace inspection/reapplication, later input during an
unknown save, obsolete links and clean-buffer recovery after a new round.

The package archive contains nineteen expected files. An isolated consumer checks
its ESM imports, TypeScript declarations and permitted skill loading. The static
build passes with the existing large-client-chunk warning.

The complete public-interface suite passes all 93 cases. All 27 distinct correction
screen cases pass across Chrome, Firefox and WebKit. The latest full screen sweep
passed 26 cases; the preparation-expiry case then passed its focused WebKit recheck
after switching its simulated-clock timing control to keyboard activation and
asserting the checked state. Logs are `/tmp/rifd-12-full-api.log`,
`/tmp/rifd-12-response-screens-final.log` and `/tmp/rifd-12-webkit-recheck.log`.
The package log is `/tmp/rifd-12-pack.log`, and the static build log is
`/tmp/rifd-12-build.log`.

All 15 existing Chrome draft, departure and notification regressions pass in
`/tmp/rifd-12-regressions-final.log`. Together with the 103 domain cases, the
interface and screen checks cover 238 distinct domain/browser cases.

To reproduce the checks independently:

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm skills:check
pnpm test:skills
pnpm pack:domain
pnpm build
pnpm test:browser:api --workers=3 --timeout=120000
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser tests/browser/correction-response.screens.spec.ts --workers=2 --timeout=120000
pnpm test:browser tests/browser/drafts.screens.spec.ts tests/browser/departure.screens.spec.ts tests/browser/notifications.screens.spec.ts --project=chrome --workers=3 --timeout=120000
```

WebKit uses the compatible-library launcher described in
[slice 01 evidence](01-evidence.md). The initial run hit six WebKit startup
timeouts while the full API suite was running. The final screen run reduces
concurrency and allows sixty seconds for seed preparation, separately from
operation feedback and recovery assertions. The focused WebKit recheck uses a
temporary config with separate output under `/tmp`. The Chrome regression run
uses its own static server after an earlier shared-server attempt lost the server
before its final three navigations.

## Visual checks

Chrome captures were inspected in both directions at 390 and 1440 CSS pixels.
The same checks found no horizontal page overflow. These are emulated viewports,
not physical-device or full accessibility acceptance.

- [Arabic response at 390 pixels](evidence/12/response-ar-390.png)
- [Arabic response at 1440 pixels](evidence/12/response-ar-1440.png)
- [English response at 390 pixels](evidence/12/response-en-390.png)
- [English response at 1440 pixels](evidence/12/response-en-1440.png)

## Standards

No findings. The review checked module boundaries, raw input, workspace authority,
bilingual styling, test seams and the packaged source-review workflow.

## Spec

The review found that a clean retained buffer from an earlier round could redirect
a valid new-round workspace link repeatedly. Only dirty retained buffers now
participate in obsolete-round recovery. A screen regression reproduced the
original failure before the fix. The follow-up review confirmed resolution and
found no remaining issues.

Review counts: Standards 0 outstanding findings; Spec 0 outstanding findings.
