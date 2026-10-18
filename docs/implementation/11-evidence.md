# Slice 11 implementation evidence

> Dated implementation record. For current setup and behavior, start with the [documentation index](../README.md). Test counts, release identifiers and operational decisions below apply to the work recorded here.

Implemented [Request targeted corrections](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review-implementation/issues/11-request-targeted-corrections.md), stories 43 and 53, against starting commit `2dea7a8132f073e99f97a67d12cda2143b440611`.

## Request behavior

Assigned Under review applications expose Request corrections. Its separate
composer accepts specific application fields and document slots, with a reason
for every selected target. Inspect correction request presents the captured set
and reasons beside the reference, applicant and financing terms. Confirm and send
request is the only sending action. Escape returns to editing and restores focus.
Language changes preserve entered explanations. Product and derived values are
absent from the target choices, and selecting a target never selects dependencies.

The public `requestCorrections` operation checks runtime shape, nonempty targets,
distinct field/slot identities, individual nonblank reasons and explicit
confirmation. It requires the current assigned reviewer and Under review. The
existing transaction checks session, dataset, read access, receipt, shared revision,
assignment and state before mutation, then checks authority again before commit.

The round, cloned submitted baseline, unchanged private workspace, new status,
public history event, internal activity, applicant notification and receipt commit
together. Assignment, submitted information, assessments, checks and the initial
evidence window remain intact. A new workspace starts at revision one and names
its round. Targets start unverified. Exact replay returns the original receipt
with the latest permitted projection and adds no effects. Changed intent under
the same operation identifier is refused.

Applicant detail, the history route, notification destinations and print expose
the public targets and reasons. Verification, staff assessments, activity and notes
remain internal. Staff reads continue showing the submitted snapshot, with no
private workspace. During Corrections requested, assessments, checks and further
requests are refused; assigned-reviewer notes remain available. Applicant response
editing and resubmission remain with ticket 12.

## Retained work and recovery

The composer retains target choices and reasons privately by dataset, identity
and application. Unsent requests offer Stay and Discard changes on departure.
Neither action sends a request. Pending or uncertain operations require their
outcome to be resolved before discarding. Refresh removes unsaved composer work.

A confirmed write abort preserves text and target choices. Outcome inspection
confirms the absence of a receipt before the reviewer edits or confirms again.
Unknown completion requires inspection, which recognizes a committed request
without a duplicate round or notification. Expiry covers protected content and
clears confirmation. The same identity reauthorizes before restoring retained
text; another identity requires explicit discard.

Shared changes invalidate confirmation and preserve unsent reasons. The composer
shows current assignment, submitted information, document presence and internal
activity. It supports confirmed reclaiming after a transfer to Khaled. Inspection
after reclaiming establishes the new revision; sending still requires renewed
inspection of the target set and explicit confirmation. The shared departure
helper combines assignment and composer work, retaining the existing note-saving
policy in the review workspace.

## Verification

Tests use the agreed public typed Demo interface with actual IndexedDB and the
production static screens. The first API red run reproduced the missing operation.
The first screen red run reproduced the missing route. A review-driven red test
reproduced missing assignment context and reclaim controls in the composer.

Five API cases cover the prepared missing-financial-evidence request, mixed
field/document targets, invalid and duplicate targets, product refusal, empty
reasons, confirmation, state and assignment refusals, wrong dataset, applicant
access, staged rollback, uncertain completion, exact replay, identifier misuse,
paused review, authorized notes, private/public projections, refresh, expiry at
commit and a competing-tab transfer.

Six screen cases cover Arabic and English confirmation, unrelated targets staying
unselected, applicant history visibility, paused review, keyboard Escape and focus,
language preservation, discard/stay, expiry and identity recovery, failed sending,
unknown completion and reassignment followed by confirmed reclaim and a fresh send.

The complete domain suite passes all 103 tests. Typecheck, lint, packaged-skill
source checks, both skill test files and tarball verification pass. The tarball
contains nineteen expected files, and an isolated consumer verifies ESM exports,
TypeScript declarations and permitted skill loading. Domain guidance remains
accurate; reviewed hashes accompany the additive target, permission and receipt
changes. The static build passes with the existing large-client-chunk warning.

```sh
pnpm test
pnpm typecheck
pnpm lint
pnpm skills:check
pnpm test:skills
pnpm pack:domain
pnpm build
pnpm test:browser:api --workers=3 --timeout=120000
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser tests/browser/corrections.screens.spec.ts --workers=2 --timeout=120000
pnpm test:browser tests/browser/review.screens.spec.ts tests/browser/departure.screens.spec.ts --project=chrome --workers=2 --timeout=120000
```

WebKit uses the compatible-library launcher described in [slice 01 evidence](01-evidence.md).

The full public-interface sweep passes all 88 cases. Focused production screens
pass all 18 correction cases across Chrome, Firefox and WebKit, plus 11 existing
Chrome review/departure regressions. Together with the 103 domain tests, these
checks cover 220 domain/browser cases. The complete interface log is
`/tmp/rifd-11-full-api.log`; screen logs are `/tmp/rifd-11-focused-screens.log`
and `/tmp/rifd-11-shared-screen-regressions.log`. All pass without reruns in
these final runs.

## Visual checks

Chrome captures were inspected in both directions. Layout measurements at 360,
390, 768 and 1440 CSS pixels found no page overflow, and 390-pixel confirmation
dialogs had no horizontal overflow. There were no uncaught page errors in the
[recorded checks](evidence/11/visual-checks.json). These checks emulate viewports.

- [Arabic composer](evidence/11/composer-ar-1440.png)
- [English composer](evidence/11/composer-en-1440.png)
- [Arabic confirmation](evidence/11/confirmation-ar-390.png)
- [English confirmation](evidence/11/confirmation-en-390.png)

## Standards

The initial review found a curly apostrophe and missing comma in README prose.
Both were corrected. Its optional duplicated-buffer-clearing concern was resolved
with one shared clear function. The follow-up found no outstanding findings.

## Spec

The initial review found that reclaiming after reassignment required leaving the
composer and discarding the unsent request. The composer now exposes assignment,
submitted information and activity, supports confirmed reclaiming, and retains
reasons through explicit inspection and renewed confirmation. The expanded browser
case reproduces the original gap and verifies recovery. The follow-up found no
outstanding findings.

Final review counts: Standards 0 outstanding findings; Spec 0 outstanding findings.
