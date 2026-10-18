# Slice 13 implementation evidence

Implemented [Resubmit, verify and repeat correction rounds](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review-implementation/issues/13-resubmit-and-verify-corrections.md), stories 46 through 52, against starting commit `fc5d970ab03c02dcf54a27842a3e360c018105b1`.

## Publication

The public `resubmit` command validates the complete response, requested-target
permissions and both revisions inside the publication transaction. Requested
fields must be valid and canonically changed. Missing evidence must be added;
replacement SHA-256 hashes must differ from the fixed baseline. Unrequested
fields, files and product changes are refused. Pending or failed selections block
publication. Saving progress remains private and accepts unfinished input.

Publication stores fields, file bytes, round response, history, internal activity
and receipt together. It retires the workspace and returns directly to Under
review, retaining the current assignee, initial submission date and financial
window. Resubmission creates no notification. The receipt retains both completed
revisions, so replay succeeds after workspace retirement without another event.

Huda's amount-and-plan response resets Evidence consistency, Product purpose fit,
Purchase budget coverage and Repayment capacity. Operating history remains Passed.
Unchanged assessments survive; added or replaced files become Awaiting review.
No correction is verified by publication alone.

## Verification and later rounds

Reviewer screens highlight changed fields and added or replaced files against the
latest fixed baseline, and list checks affected by the response. Field targets
have separate Verify field change and Undo field verification actions. Accepting
a requested document verifies its target; Needs replacement clears that result.
These writes require the current assignee, Under review, current shared revision
and a published current target. Verification activity stays internal.

A new request captures a new baseline and workspace. Previous requests,
responses and verification flags remain intact. Applicant and reviewer history
also show each published round's requested field values and permitted historical
document previews. The previous response's document
assessments and reasons remain available to staff under Previous response
assessments. Applicant and print projections exclude those internal assessments.
The pure `currentCorrectionTargets` helper selects the latest request per field
or document slot, retaining unrelated outstanding targets. Historical insufficient
responses therefore do not permanently block a carried-forward target.

## Verification evidence

Tests use the accepted public Demo interface with real IndexedDB and production
screens. The domain red run reproduced missing current-target selection. Browser
red runs reproduced absent field verification, assessment history and resubmission
controls. Focused green runs cover canonical changes, missing evidence, exact
dependency reset, private-save isolation, repeated unsuitable evidence, publication
abort, unknown completion, receipt replay, expiry at commit, competing private
revisions, reassignment and simultaneous same-context resubmissions.

The complete pure-domain suite passes 104 cases. Typecheck and lint pass.
Packaged-skill validation and both skill test files pass. The nineteen-file archive
passes its isolated ESM, declaration and permitted-skill consumer checks. The
static production build passes with the existing large-client-chunk warning.

The focused interface run passes all eight new cases. Four distinct production
screen cases pass in all three browsers, twelve runs
covering both languages, explicit verification, publication failure/outcome
inspection, a second correction round and previews of both published responses.
The final history changes use an isolated production build on port 4183 so the
full sweep retains its original static assets. The focused log is
`/tmp/rifd-13-history-screens.log`, and its build log is
`/tmp/rifd-13-next-build.log`.
The complete public-interface suite passes all 101 cases. The full screen sweep
ran all 315 cases across Chrome, Firefox and WebKit, with 312 passing. Two failed
entries used the original ambiguous heading selector. The third used the new
history assertion against the preserved earlier static build. All twelve focused
checks pass against the updated production build. All three failed entries pass the final workspace-build recheck, so all 315
screen cases are verified with no unresolved failures. The full HTML report is preserved under
`/tmp/rifd-13-full-screen-report`; the final recheck log is
`/tmp/rifd-13-final-recheck.log`.

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

Checks run on Linux 7.2.5-3-omarchy with Node 26.7.0, pnpm 11.24.0 and
Playwright 1.64.1. Chrome reports 155.0.8059.39. The pinned Playwright browser
manifest specifies Firefox 157.0 and WebKit 27.2.
WebKit uses the compatible-library launcher described in [slice 01](01-evidence.md).
The focused logs are `/tmp/rifd-13-api.log` and `/tmp/rifd-13-screen.log`.
The full-suite logs are `/tmp/rifd-13-domain.log`, `/tmp/rifd-13-full-api.log`
and `/tmp/rifd-13-full-screens.log`. Package and build logs are
`/tmp/rifd-13-package.log` and `/tmp/rifd-13-build.log`.

The full screen sweep exposed an existing ambiguous draft-review locator:
`Review` names both a level-two step heading and a level-three subsection.
The assertion now selects the level-two heading. Focused Chrome, Firefox and
WebKit rechecks all pass. The sweep collected the earlier test version before
this adjustment. Recheck logs are `/tmp/rifd-13-heading-recheck.log` and
`/tmp/rifd-13-heading-cross-recheck.log`. The Standards reviewer checked this
one-line adjustment and found no issues with it.

## Visual checks

Chrome captures were inspected in Arabic and English at 390 and 1440 CSS pixels.
The checks found no horizontal page overflow. These are emulated viewports.

- [Arabic review at 390 pixels](evidence/13/review-ar-390.png)
- [Arabic review at 1440 pixels](evidence/13/review-ar-1440.png)
- [English review at 390 pixels](evidence/13/review-en-390.png)
- [English review at 1440 pixels](evidence/13/review-en-1440.png)

## Standards

The final UI review found that published business-activity values would display
raw enum identifiers in Arabic. Published responses now use the existing
bilingual activity labels. Other checks confirmed domain/browser boundaries,
public projection privacy, transaction and receipt rules, logical styling, and
the accepted public-interface test seam. The draft heading-selector adjustment
also passed review.

## Spec

The final audit found a history-screen gap. The route contract includes
"published responses", but the screen originally displayed only requests and
reasons, despite preserving response snapshots. Each published round now displays
its requested field values and offers authorized previews of its requested
documents. The repeated-round screen regression reproduced the missing summary
before implementation. The follow-up review confirmed that applicant history
still excludes private workspace values, verification and staff assessments.
Print's explicit projection stays unchanged.

Review counts: Standards 1 resolved finding; Spec 1 resolved finding;
0 outstanding findings on either axis.
