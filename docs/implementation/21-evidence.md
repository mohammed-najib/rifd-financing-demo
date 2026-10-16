# Slice 21 bilingual, accessibility, preview and print acceptance

[Issue 21](../../.scratch/financing-application-and-review-implementation/issues/21-bilingual-accessibility-preview-and-print-acceptance.md)
is **partial**. The implementation and automated checks are committed; the full
manual journey matrix, native 200% browser zoom, screen-reader smoke and visible
native multipage PDF preview still need completed evidence. Responsive
screenshots and accessibility-tree reads do not close those requirements.

The implementation started at `4ba0547e76d23fdfe2b291153d5dbd454cfba5e2`.
The final UI source is `a3d0610e159dc1d95143988f660c38a7a56d219e`.
The later reset test corrections are `c364706` and `9472adf`; production source
files match `a3d0610` exactly.
No hosted release or physical-device result is claimed.

## Findings and fixes

The prepared-sample read previously replaced a single Use sample button with a
label, select and button after the correction editor appeared. That moved Retry
preparation and Demo controls during pointer interaction. A screen regression
held the pointer down on Retry, allowed the sample read to finish, then released
the pointer. Preparation failed to start in Arabic and English in installed
Chrome. The failing screenshots and traces remain under
`artifacts/acceptance/21/pointer-red/`.

The picker now occupies the same layout while its read is pending. It exposes
`aria-busy`, disables unavailable sample actions, then enables the saved sample
choices. A failed or empty catalog read retains the existing generated-sample
fallback. It changes neither the stored file nor the correction response. The full screen
run then caught a stale catalog ID after switching products. The picker now
resolves its selection from the current product's available choices, falling
back to generated evidence when none exist. The existing cross-tab product
reapplication case reproduced this regression before the fix; all three engines
passed its focused recheck afterward.

[Pointer regressions](../../tests/browser/correction-response.screens.spec.ts)
activate Demo controls at 1440px and Retry at 390px in both languages. They use
real pointer down/up across sample readiness, rather than substituting keyboard
activation. The earlier focused run passed all twelve cases across Chrome,
pinned Firefox and WebKit at 390px before the desktop variant was added.

A direct keyboard save also exposed lost focus. Natively disabling Save progress
during its pending state blurred the active button to the document. A bilingual
screen regression failed before the fix. The button now keeps focus and exposes
`aria-disabled` while saving; the existing synchronous save guard rejects repeat
activation. Conflict and inspection still use native disabling. The regression
checks pending and saved feedback, a repeated Enter, retained focus and the next
Tab destination. Its red traces remain under
`artifacts/acceptance/21/focus-red/`.

A later ordinary Chrome MCP check found that Shift+Tab from the decision
confirmation's first button moved focus to the document body. Arabic and English
screen regressions reproduced the failure. The production dialogs now share
[Tab containment](../../src/ui/dialog.ts), including previews with links and
confirmations with buttons. This replaces the departure dialog's separate
buttons-only handler. Existing Escape and opener-return behavior stays in each
dialog. Preview regressions also check download-to-Close wrapping. They do not
establish keyboard behavior inside the native embedded PDF viewer.

## Automated evidence

The final validation reran the fast checks and all 528 production screen cases
against `a3d0610`. Its API result is the completed 158-case run against
`55aec6f`. Before reusing it, a source-manifest guard verifies that only
`src/ui/draft.tsx` and `tests/browser/acceptance.screens.spec.ts` changed. The
other 127 recorded files, including the domain, Demo operations, API tests,
styles, dependencies and configuration, match. Both source bindings remain in
the retained run metadata, alongside an exact
[rerun-script snapshot](evidence/21/screen-rerun.mjs.txt). This is a screen rerun
with an unchanged API result,
not a claim that the interrupted complete invocation passed.

The retained [run record](evidence/21/run.json), [source manifest](evidence/21/source.json)
and [case results](evidence/21/results.json) record these outcomes:

| Check | Result |
| --- | --- |
| Typecheck, lint, skill policy and build | Passed |
| Domain tests | 105 passed |
| Skill tests | 11 passed |
| Unchanged API suite | 158 passed, with the earlier source binding above |
| Production screens | 527 passed, one Chrome reset assertion timeout; no skips or flaky retries |
| Ticket-specific cases in that screen run | All 90 passed |
| Layout captures | 480 across 42 bilingual chapter/browser records |

Chrome passed 175 of 176 cases. Firefox and WebKit each passed all 176.
The affected reset case then passed in Chrome, Firefox and WebKit against
`9472adf`, with no skips or retries. Its [run record](evidence/21/reset-verified-run.json),
[source manifest](evidence/21/reset-verified-source.json) and
[results](evidence/21/reset-verified-results.json) are separate from the failed
invocations. Together with eleven passing reset-file cases, all twelve unique
reset cases have passing results. The original full screen run remains failed
at 527/1; the earlier reset-file recheck remains failed at 11/1.

The [reset diagnosis](evidence/21/reset-diagnosis.json) preserves the shorter
waits and temporary probes. The unchanged Chrome case passed once and timed out
twice at 30 seconds. A 60-second diagnostic also timed out twice. The final
bounded probes completed normally, with chooser waits of 94.232, 95.055 and
95.028 seconds. This single recovery case now has a 180-second test budget and a
120-second chooser wait. It retains every bilingual action, schema recovery,
real file generation and the final chooser assertion, with no retries, skips or
storage shortcuts. This is functional completion under slow encoding on this
host, not a performance pass.

Boundary logs showed continued seed-image encoding at roughly one callback per
second in affected runs, before the durable reset write. Foregrounding made
three instrumented probes pass quickly, but the clean recheck timed out again;
foregrounding alone was insufficient. The test still brings its page forward
before explicit confirmation. These observations do not establish background
completion timing. Temporary production logs were removed. Typecheck, lint and
the restored production build passed, and production source files match
`a3d0610` exactly.

[Layout checkpoints](../../tests/browser/acceptance.screens.spec.ts) cover the
seven chapters below in Arabic and English at 360, 390, 768 and 1440 CSS pixels.
Queue, gallery, staff review and decision views also include 767/768 and
1199/1200 boundaries. Each capture records its actual route, language, direction,
viewport, browser version, page width and any horizontally clipped controls in
`checkpoints.json`. These are layout checkpoints, not completed manual journeys.
Visual inspection found a setup race in the unsigned English chapter: navigation
could begin before the language write completed, producing Arabic captures.
Those captures record their actual language and do not count as English evidence.
The setup now awaits the committed language change and checks language/direction
after every navigation. All three affected browser cases passed a focused
recheck. Replacement captures come from the final screen rerun.

| Chapter | Checkpoints |
| --- | --- |
| Products and application | Comparison, saved personal step, review |
| Documents and recovery | Saved draft documents and sample picker |
| Tracking, notifications and print | Own list, notices, public history, final print route |
| Queue and assignment | Queue cards/table and submitted record |
| Review and corrections | Applicant correction workspace |
| Decisions and repayment | Staff review, decision form, frozen repayment |
| Access, sessions and reset | Unsigned production gallery, reset warning, chooser |

The preview cases reload a saved draft, open its real PNG, JPEG and multipage
PDF, then download the stored bytes. They check image decoding at 1000 by 1320,
file signatures, the PDF's two pages, modal bounds at 360/1440px, Escape and focus
return. Existing draft, session and reset journeys cover unreadable-image
fallback and protected-preview closure on expiry, identity change and reset.

[Print checks](../../tests/browser/print.screens.spec.ts) compare the complete
public summary between applicant and staff for correction, Approved and Rejected
records in each language. Staff cannot read the Draft. Existing checks retain
last-saved Draft input and exclude unfinished private input. The long-history
case uses an explicitly synthetic, persisted display fixture with 27 public
events. It tests pagination, not twelve real correction rounds.

## Direct browser and PDF inspection

The browser MCP checks used ordinary Chrome 155.0.8059.39 and ordinary Firefox
155.0.1 on Omarchy Linux, kernel `7.2.5-3-omarchy`. Pinned Playwright Firefox
157.0 and WebKit 27.2 are separate automation builds. Node is 26.7.0, pnpm
11.24.0 and Playwright 1.64.1.

The default Firefox MCP failed to launch. Its geckodriver log identified a
missing `DISPLAY`. An isolated instance of the installed official Mozilla
`@mozilla/firefox-devtools-mcp` 0.10.5 used `/usr/bin/firefox`, a temporary
profile and the existing display environment. No global MCP configuration was
changed. The launcher and JSONL interaction log are retained locally under
`artifacts/acceptance/21/manual/`. The gallery's numeric progress value breaks
this MCP version's full snapshot formatter; scoped control/dialog snapshots and
targeted reads worked.

Direct checks observed labelled invalid fields, Arabic-Indic correction,
preserved mixed-language text, visible focus, linked validation focusing Purchase
explanation, save feedback, and gallery dialog containment/Escape/return. These
checks cover selected interactions, not the complete seven-journey matrix.
The retained [observations and browser logs](evidence/21/manual/observations.json)
identify their scope and limitations. Those historical manual captures came from
working builds during implementation; they do not have a complete per-capture
source manifest. The later decision-dialog recheck records its tested source
commit, `55aec6f`, and built JavaScript hash. Ordinary Chrome now wraps Tab/Shift+Tab within
that dialog at measured Arabic 390px and English 1440px widths, then returns
focus to Inspect rejection on Escape. The final automated run pins its complete
source separately.

Chrome's emulated widths were measured. Firefox's headed window remained
1670 by 816 CSS pixels despite viewport-size requests from the MCP, so those
requests are not narrow-screen evidence. Browser shortcut requests also left
measured viewport/DPR unchanged; they do not establish native 200% zoom.
A temporary Firefox extension using the browser's
[native zoom API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/setZoom)
also failed to produce a measured change. The extension was removed from the
temporary profile. Its installation result is not a zoom pass.

The final [saved print files and inspection record](evidence/21/print-review.json)
cover 14 Chrome PDFs and 34 rendered pages. Poppler rendered them at 85 dpi.
Visual inspection covered 26 distinct pages; the other eight correction/rejection
pages matched their applicant/staff counterpart pixel for pixel in both languages.
Draft, correction, Approved and Rejected outputs use two pages per language.
Both synthetic long-history outputs use five. Document labels, public reasons
and history stay within their pages, with no staff controls or internal review
sections observed. The original PDFs are retained under `evidence/21/print/`;
rendered pages remain in the final run's `print-review/` directory.

The ordinary Firefox PDF viewer exposed two pages but the captured embedded
viewer remained blank at page 0. Later inspection reported the Firefox document
as hidden despite a focus request; a requestAnimationFrame read also timed out.
Stored/downloaded PDF bytes and Poppler renders are valid. This does not confirm
a product defect or establish successful native multipage preview rendering;
the ordinary-browser preview check remains open.

## Remaining manual acceptance

| Check | Required follow-up |
| --- | --- |
| Seven complete journeys | Walk both languages and roles at every agreed width, including long text, errors, recovery, transitions and primary actions. Record each result and capture against the tested commit. |
| Ordinary-browser keyboard flows | Complete keyboard-only application, correction, review and decision flows in ordinary Chrome and Firefox. Include departure guards and live feedback; selected gallery and validation checks do not close this row. |
| Native 200% zoom | Verify the browser's zoom value and actual CSS viewport. Check reflow, focus, errors and primary actions in both directions. |
| Screen reader | Complete validation, save, preview and decision-dialog smoke with an actual reader/browser pairing. Orca 50.2 with AT-SPI2 2.60.6 and Speech Dispatcher started, but concurrent automation took focus and prevented a reliable paired pass. Startup/output logs alone are not a pass. |
| Native PDF preview | Confirm visible first/second PDF pages, scrolling and open/download fallback in ordinary Chrome and Firefox, including a narrow viewport. |
| Manual image preview | Inspect JPEG/PNG mobile scrolling, labels and fallback, then verify closure on expiry, identity change and reset in ordinary Chrome and Firefox. Automated stored-byte and security checks do not establish this manual pass. |

The remaining checks do not require a conformance score. No full accessibility
conformance, Safari, Android or iPhone result is inferred from these artifacts.

## Review and reproduction

The required two-axis review compared `4ba0547...2453162`, then reviewed the
Save progress focus fix, final evidence, shared dialog containment, and sample-selection, language-setup, reset-foreground and measured reset-budget corrections.

### Standards

No outstanding findings. The UI follows the repository's Tailwind conventions. Tests observe
screen, file, pointer and print behavior at the accepted browser seam. The
synthetic history is fixture setup, not a private storage assertion. The focus
fix preserves disabled semantics and guards repeat activation synchronously.
The dialog helper serves seven existing callers and keeps their Escape and
opener-return handlers. Its browser tests cover controls and links; native PDF
viewer internals remain outside that evidence.

### Spec

No outstanding code or scope findings. The review identified unperformed
manual journeys, native zoom and screen-reader checks. The later native PDF
inspection also remains open. Layout checkpoints do not establish those passes,
and the synthetic history does not establish twelve real correction rounds.

Standards: 0 findings. Spec: 0 code findings; manual acceptance remains open.

Run the complete gate with the reviewed source:

```sh
RIFD_ACCEPTANCE_SLICE=21 \
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:acceptance
```

On a supported Playwright host, omit the WebKit override. Keep 4173 and 4174
free for the screen and API servers. A manual static preview must use another
port. Each invocation retains its own logs, source hashes, browser versions,
reports and traces. The [focused-run results](evidence/21/focused-runs.json) retain the red/green
checks and setup failures separately. The [prior complete-gate attempts](evidence/21/prior-full-runs.json)
record the port setup failure and runs interrupted after save, dialog and sample
selection defects were found. The first two interrupted runs passed 47 and 80
API cases. The later run completed all 158 API cases before its screen failure.
None is described as a completed passing gate.
