# Slice 14 implementation evidence

Implemented [Confirm final decisions and freeze approved terms](../../.scratch/financing-application-and-review-implementation/issues/14-confirm-decisions-and-freeze-terms.md) against starting commit `bfcf1da000b1fefb526452e6d3c2d1eb71ccf38f`.

## Decisions and frozen terms

The public `approve` and `reject` commands require the assigned reviewer in Under
review, an applicant-visible reason and explicit confirmation bound to the current
session and inspected shared revision. Approval needs four Accepted documents,
five Passed checks and verified current correction targets. Rejection needs a
failed substantive check. Evidence deficiency alone cannot justify rejection;
unrelated incomplete review does not block an independent failed criterion.

One IndexedDB transaction saves final state, reason, history, internal activity,
notification and receipt. Approval also freezes submitted amount, term, product,
rule version, approval date, markup, total and monthly installment rows. All new
installments start Upcoming. The 100,010 YER example produces 5,001 markup,
105,011 total, five rows of 17,501 and a final row of 17,506, dated November 2026
through April 2027. Huda's corrected 450,000 YER response produces six rows of
78,750. Authorized reads return the stored repayment snapshot after refresh.

Terminal permissions lock fields, files, assessments, checks, verification and
assignment. Assigned internal notes, authorized previews and public printing
remain available. Notes preserve the decision, history and repayment snapshot.

## Confirmation and recovery

The Arabic and English decision route shows current applicant, reference,
submitted product, amount and term alongside unmet prerequisites. Confirmation
also names Salma and the selected outcome and reason. Escape closes the dialog
and returns focus. No confirmation survives expiry, reassignment, changed shared
state or a new sign-in. Reasons remain private unfinished input until the
reviewer explicitly inspects and confirms again.

Departure offers Stay or Discard changes. Storage abort and unknown completion
retain the reason and command for explicit receipt inspection. Exact committed
replay returns the saved receipt without another history entry or notification.
Changed intent under an existing identifier fails. Two tabs deciding from one
revision cannot both commit.

## Verification

Tests use the accepted pure-domain, public Demo with real IndexedDB, and
production-screen seams. Red runs reproduced absent decision readiness, commands
and route before implementation. Focused cases cover initial submission through
approval, corrected approval, an actual new two-month business rejection,
evidence-only refusal, every document/check prerequisite, terminal locks,
permitted notes, rollback, uncertain completion, replay, concurrent decisions,
expiry and reassignment recovery.

The complete pure-domain suite passes 105 cases, and the complete public-interface
suite passes all 110 cases. Typecheck, lint, packaged-skill validation and both
skill test files pass. The nineteen-file archive passes its isolated ESM,
declaration and permitted-skill consumer checks. The final static build passes
with the existing large-client-chunk warning.

The complete production-screen sweep ran all 336 cases across Chrome, Firefox
and WebKit, with 331 passing in that run. All five remaining entries pass their
focused rechecks, verifying all 336 cases with no unresolved failures. All 21
new decision-screen runs pass in the full sweep.

The screen sweep encountered two five-second Firefox assertion timeouts and
three trace-file cleanup errors after an isolated retry initially reused its
output directory. All five affected cases pass focused rechecks with separate
output directories. Application and existing test sources needed no changes.
The recheck logs are `/tmp/rifd-14-recovery-recheck.log`,
`/tmp/rifd-14-firefox-submission-recheck.log` and
`/tmp/rifd-14-webkit-recheck.log`.

Reproduce the checks with:

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm skills:check
pnpm test:skills
pnpm pack:domain
pnpm build
pnpm test:browser:api --workers=3 --timeout=120000
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser --workers=3 --timeout=120000
```

## Standards

The review found one mismatch between the decision fingerprint and the documented
stable-intent rule. The fingerprint now excludes the transient session identifier;
new commits still check that confirmation belongs to the active session.
The follow-up review found no remaining documented-standard breaches.

The reviewer also noted optional duplication between the decision and correction
composers' retained-command recovery. Both follow the established App-owned
buffer pattern. A shared hook remains a possible maintenance follow-up; this
review found no concrete correctness risk requiring it in this slice.

## Spec

The review found one issue with same-identity session renewal: including the
session identifier in the fingerprint made an unchanged committed decision look
like identifier misuse. A failing public-interface regression reproduced this.
The corrected fingerprint recognizes its original receipt after renewal. New,
noncommitted decisions still require current-session confirmation. The follow-up
review found no remaining Spec issues.

Review counts: Standards one resolved mismatch and one optional maintenance
follow-up; Spec one resolved finding. No required fixes remain on either axis.

## Visual checks

Chrome captures of the decision page were inspected in Arabic and English at
390 and 1440 CSS pixels. The page also passed overflow checks at 360 and 768
pixels in both languages. These are emulated viewports. Captures wait for font
readiness and scrolling through the page to finish painting.

- [Arabic at 390 pixels](evidence/14/decision-ar-390.png)
- [Arabic at 1440 pixels](evidence/14/decision-ar-1440.png)
- [English at 390 pixels](evidence/14/decision-en-390.png)
- [English at 1440 pixels](evidence/14/decision-en-1440.png)


Checks run on Linux 7.2.5-3-omarchy with Node 26.7.0, pnpm 11.24.0 and
Playwright 1.64.1. Chrome reports 155.0.8059.39; the pinned browser manifest
specifies Firefox 157.0 and WebKit 27.2. WebKit uses the compatible-library
launcher documented in [slice 01](01-evidence.md). The visual capture script
and result are `/tmp/rifd-14-visual.mjs` and `/tmp/rifd-14-visual.log`.


The full-suite logs are `/tmp/rifd-14-full-domain.log`,
`/tmp/rifd-14-full-api.log` and `/tmp/rifd-14-full-screens.log`. The full screen
HTML report is `/tmp/rifd-14-full-screen-report`. Focused final API evidence is
`/tmp/rifd-14-api-final.log`. Build and package logs are
`/tmp/rifd-14-build-final.log` and `/tmp/rifd-14-package.log`.
