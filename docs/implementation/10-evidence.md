# Slice 10 implementation evidence

Implemented [Assess evidence, record review checks and save internal notes](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review-implementation/issues/10-assess-evidence-checks-and-notes.md), stories 39 to 42.

## Review behavior

The staff workspace provides distinct submitted information, document assessments,
five fixed checks, correction verification context, notes, internal activity and
public history. Wide screens place information and evidence beside checks and
notes. Compact layouts stack sections. Section links move keyboard focus to the
matching heading. Staff preview dialogs display the translated document slot
label, expose it as their accessible description, support Escape and return focus
to the opener.

`assessDocument` accepts only the current supplied file identity in its slot. Needs
replacement requires nonempty reason text and retains the current file. Accepting
clears its replacement reason. These actions change the assessment, internal
activity and shared revision, while preserving the submitted snapshot, application
status and public history. An assessment change clears evidence consistency.

`recordCheck` names one of the five fixed checks. Evidence consistency cannot pass
before all four documents are Accepted; the reviewer explicitly confirms their
agreement with the current supported information. Product purpose fit requires a
reviewer judgment against the selected product and business activity. Numerical
Passed outcomes require six operating months, financing no greater than purchase
budget, or positive surplus with the largest installment no greater than 40% of
it, respectively. Review uses the initial submission month and the frozen product
rules. It never overwrites the historical repayment snapshot.

The pure helper handles Arabic-Indic digits and compares months by calendar
index. The capacity reference of 100,010 YER over six inventory months gives 5,001
YER markup, 105,011 total and a largest final installment of 17,506. A surplus of
43,765 passes exactly; 43,764 fails. Zero and negative surplus fail. Dependency
checks use normalized fields and document identities. Huda's changed amount and
plan affect Evidence consistency, Product purpose fit, Purchase budget coverage
and Repayment capacity while preserving Operating history.

Notes have an independent explicit save. Only the assigned reviewer can add them
in Under review, Corrections requested, Approved and Rejected. They add one note,
one internal activity item, one shared revision and one receipt. They never change
a final decision or appear in applicant records, print summaries, public history
or notifications. Assessments and checks require Under review. Colleague records
remain readable with their current permissions.

Correction targets show their verification status separately from the checks.
Accepting a requested document in a published response verifies its document
target. New correction requests, applicant responses, resubmission and field
verification controls remain with tickets 11 to 13.

## Transactions and recovery

All three commands use the existing application transaction and actor-scoped
receipt namespace. They capture payload and tab session before delay and check
dataset, reading access, exact receipt, shared revision, assignment and state
before writing. Invalid payloads and stale/unauthorized actions preserve the
armed application-storage failure. A final session check can abort after the
write request succeeds. Results, activity, version and receipt commit together.
Exact replay returns the receipt with a current permitted projection; changed
intent under the same identifier is refused.

A confirmed storage abort allows explicit retry. Unknown completion requires
Inspect review outcome before another save. Inspect latest review loads the
current record and establishes its revision without applying retained text.
Reassignment makes retained notes read-only. Reclaim and a fresh inspection are
explicit steps. No sign-in, notification or activation callback retries a command.

The App retains unsaved note and replacement-reason text privately by dataset,
identity and application. Expiry removes protected content and previews. The
same identity reauthorizes before returning to retained work; another identity
requires explicit discard. Refresh removes unsaved buffers. Departure combines
assignment and review work, waits for pending operations, and offers Save note
and leave only when the note is currently authorized and no other composer is
unfinished. A failed departure save keeps the user in the workspace with text
and feedback intact.

## Verification

Tests use the accepted pure-domain helper, public typed Demo interface with
actual IndexedDB, and production screens. Initial red checks reproduced missing
review operations and section navigation. A later red check caught Arabic month
normalization; keyboard checks caught missing preview focus restoration.

The focused API cases cover every seeded non-draft state/assignment combination,
all five check outcomes, current-file/reason validation, numerical Passed
refusals, all three commands' staged-write rollback and lost-acknowledgement
inspection/replay, changed identifiers, wrong dataset, unsigned/applicant access,
reassignment, private final-state notes and expiry at commit.

Screen cases cover both languages, section focus, preview Escape/focus,
replacement reasons, evidence prerequisites, explicit note saving, refresh,
expiry, identity discard guards, Save note and leave, failed departure saving,
unknown completion and colleague reassignment/reclaim.

Eight Chrome captures were visually inspected. The measured layout widths are 360,
390, 768 and 1440 CSS pixels in both languages, with no page-wide overflow or
uncaught page errors in the [capture checks](evidence/10/visual-checks.json).

- [Arabic desktop workspace](evidence/10/review-ar-1440.png)
- [English desktop workspace](evidence/10/review-en-1440.png)
- [Arabic mobile checks](evidence/10/checks-ar-390.png)
- [English mobile checks](evidence/10/checks-en-390.png)
- [Arabic mobile notes](evidence/10/notes-ar-390.png)
- [English mobile notes](evidence/10/notes-en-390.png)
- [Arabic mobile preview](evidence/10/preview-ar-390.png)
- [English mobile preview](evidence/10/preview-en-390.png)

These are viewport emulations, not physical device checks. Complete visual,
accessibility and print acceptance remains with ticket 21.

## Standards

The initial review found one documented guidance violation: numeric month and
term interpretation used `normalizeField`, which the package skill reserves for
comparison. They now use `foldDigits` and trimming. It also found a minor possible
Duplicated Code smell in reviewer-name lookup. A shared local helper resolves it.
The follow-up review found no outstanding Standards findings.

## Spec

The initial review found two issues. Completing a captured command could clear
newer note or replacement text entered after a failed save. Completion now clears
only text matching the captured payload. Parent/child cleanup could also restore
a stale departure save action after expiry. Cleanup now clears both work refs and
prevents publication after unmount. Browser checks reproduced both failures and
verify the fixes. New tests also cover later text on an explicit retry and in a
replacement-reason composer. The follow-up review found no outstanding Spec
findings. A final targeted check found the translated document slot label was
missing inside the shared preview. The staff caller now passes its current slot
label, and the modal displays and describes it accessibly. The Spec reviewer
confirmed the fix.

Final review counts: Standards 0 outstanding findings; Spec 0 outstanding findings.

The final domain run passes all 103 tests. Typecheck, lint, both package-skill test
files, source-review checks and packed-package verification pass. The package
archive contains nineteen expected files; an isolated consumer verifies ESM
imports, TypeScript declarations and permitted skill loading. The static build
passes with the existing large-client-chunk warning.

All 83 public-interface cases pass across the complete sweep and a three-case
recheck. The sweep passed 80 and reported two 60-second host deadlines plus one
incorrect transfer fixture. Both deadline cases passed unchanged with one worker
and a 120-second allowance. The fixture had spread a note payload into the strict
transfer command; it now sends only transfer fields and asserts setup success.
The corrected case passes. Initial failure traces remain under
`/tmp/rifd-10-initial-api-results`, with run logs in `/tmp/rifd-10-final-api.log`
and `/tmp/rifd-10-api-recheck.log`.

Visual review found legacy seed descriptions containing raw enum names. The UI
now translates those exact labels without rewriting stored history or arbitrary
note text. New textareas share the token-based `.review-textarea` skin; column
gaps keep neighboring panels distinct. The last Standards follow-up caught and
resolved the shared-skin duplication and a legacy note-text edge case.

```sh
pnpm test
pnpm typecheck
pnpm lint
pnpm skills:check
pnpm test:skills
pnpm pack:domain
pnpm test:browser:api --workers=3
pnpm test:browser:api --last-failed --workers=1 --timeout=120000
pnpm build
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser --workers=4 --timeout=120000
```

The WebKit command uses the existing compatible-library launcher described in
[slice 01 evidence](01-evidence.md). Browser suites run sequentially on this host.

The complete production-screen sweep ran all 258 cases, passing 234. Twenty-four
Firefox/WebKit cases exceeded their existing 30-second startup/chooser wait before
any feature assertion. Their failure selectors and snapshots were inspected. The
initial results and HTML report are retained at
`/tmp/rifd-10-initial-screen-results` and `/tmp/rifd-10-initial-screen-report`; the
log is `/tmp/rifd-10-final-screens.log`. A one-worker recheck preserves the original
readiness and feature assertions.

All 24 startup cases passed in the one-worker recheck, which completed in 11.0
minutes. This verifies all 258 screen cases across the full sweep and unchanged
isolated assertions. The rebuilt app also includes the final preview-label fix;
its affected Arabic/English keyboard journeys passed a separate final check in
each browser: six passed in 2.5 minutes, including the visible translated slot
label assertion inside the preview. Its run log is
`/tmp/rifd-10-preview-check.log`. Recheck output is retained at
`/tmp/rifd-10-rechecked-screen-results` and `/tmp/rifd-10-rechecked-screen-report`,
with `/tmp/rifd-10-screen-recheck.log` as the run log.

All 444 unique domain/browser cases pass across the complete sweeps and focused
rechecks: 103 domain, 83 public-interface and 258 production-screen cases.

```sh
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser --last-failed --workers=1 --timeout=120000
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser tests/browser/review.screens.spec.ts --grep keyboard --workers=1 --timeout=120000
```
