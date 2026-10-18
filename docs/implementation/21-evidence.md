# Slice 21 bilingual, accessibility, preview and print acceptance

[Issue 21](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review-implementation/issues/21-bilingual-accessibility-preview-and-print-acceptance.md)
is complete. The 16 October follow-up records ten ordinary-browser walkthroughs,
supplemental correction and recovery flows, final control rechecks, native PDF
and image-fallback checks, and the four-scene user-assisted reader pass.
The complete automated invocation failed five Firefox startup waits; all five
passed in an unchanged-source file recheck. Both results are retained.

The implementation started at `4ba0547e76d23fdfe2b291153d5dbd454cfba5e2`.
The UI source for the earlier evidence below is `a3d0610e159dc1d95143988f660c38a7a56d219e`.
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

The earlier ordinary Firefox PDF viewer exposed two pages but the captured embedded
viewer remained blank at page 0. Later inspection reported the Firefox document
as hidden despite a focus request; a requestAnimationFrame read also timed out.
Stored/downloaded PDF bytes and Poppler renders are valid. This does not confirm
a product defect or establish successful native multipage preview rendering;
the ordinary-browser preview check remained open at that stage. The follow-up
below records later visible native rendering.

## Follow-up acceptance on 16 October

This pass starts at `522fc0f2224564ad92692d8f146673da3e09aab4`.
Commits `df4eda1` and `4950b07` fix missing document-slot labels in applicant
previews. The draft and correction editor previously opened a generic dialog
without identifying its document requirement. Review found the same omission in
read-only applicant detail. Every preview now requires a bilingual label, renders
it visibly and uses it as the dialog's accessible description. Staff review and
public correction-history previews already supplied their labels.

Each missing entry point failed a screen regression before its fix. The final
[preview results](evidence/21/followup-2026-10-16/preview-results.json) contain six
passing Arabic/English cases across Chrome 155.0.8059.39, pinned Firefox 157.0 and
WebKit 27.2. They inspect the saved PNG, JPEG and multipage PDF after refresh,
then open the separate applicant-detail preview. Typecheck, lint and all 105
domain tests also passed. These assertions use the accepted production-screen
seam and literal document names from the screen contract.

The [capture record](evidence/21/followup-2026-10-16/captures.json) and retained
images extend the direct ordinary-browser evidence. Chrome displays both PDF
pages at a measured 1441 CSS pixels and scrolls to page two at 390px. Firefox
155.0.1 also visibly renders page two. Its native zoom manager reports `2`, and a
floating test window measures 390 by 473 CSS pixels at that setting. The narrow
Firefox captures show the document label, saved PNG and JPEG, keyboard-reachable
Open file and Download file links, and a decision confirmation with its reason
and two actions. Activating the explicit Expire session demo control while a
preview is open closes protected content and shows the recovery chooser. That
control was invoked programmatically because the modal makes the header inert.
This is a simulated expiry observation, not a fifteen-minute idle-timer test.

These native captures use the editor-label build at `df4eda1`. Their loaded
script was `index-QBNcnFOq.js`. The
[editor source manifest](evidence/21/followup-2026-10-16/editor-source.json)
was captured with the equivalent uncommitted source before that commit. Its
129 source hashes match `df4eda1`. The
[applicant-detail source manifest](evidence/21/followup-2026-10-16/final-source.json)
pins `4950b07` and `index-BffC_UcS.js`. Only the applicant-detail caller, required
label prop and additional detail assertion differ between those manifests.
The full stylesheet hash stays
`7cdf6b5894543437ca5c964660faa44fb8dff2359df2ac168ebcf40f66710345`.
The native editor captures do not claim to retest the later detail caller.

The `4950b07` [native preview observations](evidence/21/followup-2026-10-16/native-preview-observations.json)
add ordinary Firefox applicant-detail captures at 795 by 965 CSS pixels. The
native page-number field navigates to visibly rendered pages one and two. The
Download file link saves the actual 97,887-byte PDF, retained with its hash.
Open file creates a separate viewer that parses two pages, but its capture still
shows loading. A diagnostic in the background test window receives no animation
frame within two seconds despite reporting `visibilityState: visible`. Pointer
closure also leaves its deferred focus return unobserved. These background
attempts establish neither successful separate-viewer painting nor a new product
defect. They remain distinct from the user-operated foreground reader scenes.

The [reader observations](evidence/21/followup-2026-10-16/reader-observations.json)
record a user-assisted smoke pass with Orca 50.2, ordinary Firefox 155.0.1,
AT-SPI2 2.60.6 and Speech Dispatcher on Omarchy Linux. The user supplied physical
keyboard input and confirmed all four selected scenes. Arabic validation
announces the business-address field and its error. Arabic Save progress
announces the saved state while keeping focus. The English identity preview
announces its title, document label and Close control. The English decision
confirmation announces its content/actions, and Escape returns focus to Inspect
rejection. A post-check read confirms the decision dialog closed and the opener
has focus. No final decision was committed.

The reader scenes loaded `index-BffC_UcS.js` from `4950b07`. Two `4950b07`
captures retain the preview and decision scenes. Filtered speech excerpts retain
only relevant fictional UI announcements. The saved-state announcement is a
user observation, without a claimed matching speech excerpt. Earlier attempts
were interrupted by other browser accessibility activity or unreliable synthetic
input into Orca's navigation context. They do not count as passes. This smoke
does not repeat every scene in both languages or establish full conformance.

An ordinary Firefox role switch exposed a separate focus race. The queue briefly
focused an unavailable heading read for the previous identity, then removed it.
Commit `30cc416` makes route readiness wait for the captured path, identity and
session to match the completed read. Re-selecting the same identity alone had
missed this defect. The guard-only attempt still failed all six role-switch
cases. The corrected [focused results](evidence/21/followup-2026-10-16/focus-results.json)
contain 18 passes, without skipped or flaky cases. They cover role-switch heading
focus, saved preview labels and retained Save progress focus in both languages
and all three acceptance engines. The separate
[focus source manifest](evidence/21/followup-2026-10-16/identity-focus-source.json)
pins `30cc416` and `index-DnvbKOzo.js`. It does not relabel the earlier reader run.

Visual review then found Arabic currency runs reordering a shared separator in
the editor minimum/maximum range and staff budget comparison. Commit `47121d2`
isolates each formatted operand inside the LTR expression. A public-screen
regression measures the rendered character positions at both locations. Before
the fix, the three Arabic cases failed and the three English cases passed.
Afterward all six passed. Typecheck, lint and build also passed. The bundle is
`index-BDM__Rll.js`, SHA-256
`6381673d50b8af12c990a526a8332a44b4d1cb7f5190c2e2b93e3d9fe3d8c1d4`.

Commit `787fa2f` keeps the reviewer note Save button focused during saving and
after clearing the saved note. It exposes its unavailable state with
`aria-disabled` and guards repeat activation; permission loss still disables it.
All six bilingual regressions failed before the fix. The final completed engine
rechecks pass. Earlier attempts include temporary Firefox storage exhaustion and
Chrome socket-path failures, retained separately in the
[additional regression reports](evidence/21/followup-2026-10-16/additional-regressions.json).
Those environmental failures are not passing runs.

Commit `b04763b` keeps validation-linked fields visible. Same-path query changes
preserve the field's focus scroll, and structural and unchanged-correction error
links center their target. The first fix still left WebKit targets partly off
screen. The final six cases pass with the entire field in the viewport, including
repeated same-step links and unchanged correction field/file targets. An earlier
extended WebKit attempt did not wait for the validation summary's intended
initial focus; the settled-summary recheck is the passing report.

Commit `36deb6f` preserves focus on queue preference selects and Reset filters
while saving. Pending and refused operations expose `aria-disabled`, retain their
visible unavailable state and reject further changes through guarded handlers.
The six select cases fail before the fix; a separate Reset filters regression
also fails before its fix. The final 12 cases pass in three engines, including
existing missed-notice conflict and uncertain-save recovery. The
[queue source manifest](evidence/21/followup-2026-10-16/queue-source.json)
pins 129 source files, `index-HebM4UWC.js` and `styles-C1VBoyd-.css`. The added
unavailable-select Tailwind variants change the stylesheet SHA-256 to
`7aed7a781e86e538f77967a65696ba473cb680f1f658575c53effaaded9a0a39`.

Commit `43bde54` corrects empty saved-draft fields in detail and print. Blank
business name and address now use the shared empty marker; only the purchase
explanation uses its specific message. All six bilingual cases pass. The first
red run confirms the English defect; its Arabic cases used a shortened label,
so those failures are excluded as product evidence.

Commit `7c2fc95` keeps queue page buttons focused during reading and at page
boundaries, with guarded `aria-disabled` controls. It also shows waiting and
preparation instructions only when work is pending or cannot yet be saved.
Ordinary unsaved work has accurate departure guidance. Corrected public-screen
regressions fail before these fixes and all nine cases pass afterward. The first
pagination attempt pressed Next while it was still unavailable after Reset;
that setup failure is retained separately from the confirmed focus defect.

The [complete-gate source manifest](evidence/21/followup-2026-10-16/gate-source.json)
pins `7c2fc951b8a2ec62675380f6faa4be3844a12d7c`, 129 source files and
`index-DspimcEY.js`, SHA-256
`dafc403575a77c4fe8264d1c8b69796561932b68c075d7f5c61e7fbf867c2cb4`.
The stylesheet remains `styles-C1VBoyd-.css` with the hash above.

### Complete ordinary-browser journeys

The [journey record](evidence/21/followup-2026-10-16/journey-results.json)
contains ten completed walks with 390 captured scenes. Arabic uses ordinary
Firefox 155.0.1; English uses installed Chrome 155.0.8059.39. Both run headless.
Each pairing completes all seven journeys at 360, 390, 768 and 1440 CSS pixels,
then at native browser zoom 2, measured as 720 by 475 CSS pixels and DPR 2.
The Arabic walkthrough's final reset chooser was actually captured at 100%;
a separate final-build reset chooser recapture supplies the missing 200% scene.
These are UI-driven walks with visual screenshot review, distinct from the
production-screen checkpoint suite. The record retains scene metadata, source
bindings and hashes, plus 43 supplemental scenes, 38 scene rechecks and 30 final
focus rechecks. The 188 selected unaltered screenshots are committed under
`evidence/21/followup-2026-10-16/journeys/`; the manifest records their count,
pixel dimensions and hashes.
Full viewport/full-page captures and keyboard/event logs remain in the ignored
`artifacts/acceptance/21/followup-v2/matrix` directory.

The walks exercise validation/error links, long mixed text, real saves and hard
refresh, preparation/save failure and retry, saved PNG/JPEG/PDF previews,
notifications, tracking and schedules, queue pages and durable preferences,
review checks and notes, departure guards, stale decision refusal and fresh
confirmation, approval and rejection, private corrections and publication,
loaded-demo offline behavior, recovery and protected-preview closure. The
correction case compares separate applicant/staff tabs before publication.
Browser setup uses direct route entry and genuine hard refresh. Product actions
use Tab/Shift+Tab, Enter/Escape, text input and native select typeahead.

Most walks use `36deb6f`. Their known empty-field, departure-copy and pagination
findings are corrected by the later commits, with 38 targeted scene rechecks
bound to `7c2fc95`. Both ordinary browsers recheck pagination focus, idle
departure guidance and empty fields at every width and native 200% zoom. The
English 360px secondary staff tab initially measured 1440px after helper
reinitialization; a separate both-tabs 360px privacy recheck passes.

The original Chrome native200 viewport images were cropped by the capture API.
They are excluded. A complete repeat uses CDP capture without a clip and retains
1440 by 950 physical-pixel images for the measured 720 by 475 CSS viewport.
Firefox's native200 viewport captures render the complete visible viewport.
Each explicit reset intentionally restores Arabic. Expire/switch demo controls
are invoked programmatically while the modal makes the header inert; this does
not claim a fifteen-minute idle-expiry test.

Supplemental `7c2fc95` walks create and send a new missing-financial-document
request, save its private applicant response, confirm staff still sees no
document, then publish and accept the replacement. English uses separate tabs;
Arabic uses explicit identity switches in one tab. The primary matrix already
checks simultaneous applicant/staff privacy in both languages. Composer and
confirmation captures cover all five sizes. After resizing or zooming, keyboard
refocus brings the reason into view before its capture.

Both supplemental walks enable the actual Slow demo control and observe
Saving followed by Saved while focus stays on Save progress. They then inject a
`SecurityError` at the native IndexedDB open boundary before a genuine reload.
The startup error hides the protected draft and offers Retry at all five sizes.
Restoring that boundary and activating Retry recovers the exact saved fictional
text. This is an injected platform fault, not a claim that the machine denied
storage permission. Earlier Firefox driver/protocol timeouts are excluded;
`coredumpctl` found no Firefox core dumps in the checked time range, so no crash
cause is inferred.

Visual review covers all 390 primary viewport scenes, selected readable
full-page captures, final control rechecks, supplemental scenes and final focus corrections.
Review records retain their source and image hashes. The known historical findings
above have passing final-source regressions and ordinary-browser rechecks.

### Final native preview checks

The [native observations](evidence/21/followup-2026-10-16/native-final-observations.json)
record the completed native checks against `7c2fc95`. Both ordinary browsers
visibly render PDF pages one and two after refresh, paint a separate Open file viewer, and download a PDF
that parses as two pages. The embedded previews use 390 CSS pixels. Chrome's
separate viewer is also 390px; Firefox's separate viewer measures 1366 by 682.
The actual files and their byte counts/hashes are retained.

Both languages also show the correct document label and render-error fallback
for a saved unreadable PNG after refresh. Retry preserves the error and file;
Download returns the exact 34 original bytes. Escape closes the dialog and
returns focus to its opener. The complete walks cover ordinary PNG/JPEG
painting and preview closure on simulated expiry, identity change and reset.

Chrome uses pointer wheel input inside the native PDF to reach page two. Open
and Download use explicit focus setup on the public link followed by keyboard
Enter after returning from the native viewer. This does not claim keyboard
traversal of every native PDF toolbar control. Earlier native-toolbar keyboard
targeting attempts, interrupted interactive controls and hibernation are not
passing results. The fresh sessions complete their checks independently.

### Final keyboard-focus corrections

The last screenshot review found that Firefox could keep Next focused while
list replacement left the control below the viewport. Two bilingual red cases
confirmed viewport ratio zero after a settled page update. Commit `9783563`
centers an already focused pagination button after a successful read. It keeps
focus in place and leaves other active controls alone. Ordinary Chrome and
Firefox verify Next and Previous at every width and native 200% zoom. Their
centered-paging captures use `index-XBvAwAew.js` from the uncommitted
[paging source](evidence/21/followup-2026-10-16/paging-source.json); the queue
file and stylesheet exactly match the final commit. A preliminary nearest-edge
scroll left a fractional edge at 950.2 CSS pixels; its interrupted run is retained.

Review also found BODY focus after accepting a document. A corrected settled-save
regression reproduced that loss in both languages. The first red attempt tried
Accept before the previous assessment finished, so it is excluded. The same
commit keeps assessment, check and field-verification actions focused through
pending saves, exposes `aria-disabled`, and guards repeated activation. A
synchronous pending-intent guard prevents distinct overlapping writes. When a
saved replacement editor disappears, a post-commit effect returns focus to its
opener only if the user kept focus on the initiating action and the removal
left BODY focused. Failed saves retain the editor. Cancel returns its opener.
The first animation-frame restoration failed two focused cases; those failures
remain separate from the passing post-commit recheck.

All six focused Firefox cases pass, covering both languages, pending feedback,
one assessment after repeated Enter, check/verification focus, replacement
opener return and complete page-button visibility. Both ordinary browsers also
complete the final review-action walkthrough, including field verification
after a real correction response. These final review captures use the final
`index-BlDMRUUu.js` bundle. Editor-only Slow controls were mistakenly requested
on a staff screen in an earlier setup; that attempt was stopped and excluded.
The separate supplemental editor Slow-save evidence above remains valid.
The [execution notes](evidence/21/followup-2026-10-16/browser-execution-notes.json)
retain setup failures, superseded captures and temporary-storage recovery with
raw log hashes.

The [final source manifest](evidence/21/followup-2026-10-16/release-source.json)
pins `9783563`, source SHA-256
`b1da0583e187615428a923dd61d6c1a47317920616ed0b841c738e3f2903970b`,
and `index-BlDMRUUu.js`, SHA-256
`66acc0897d2a32d60c3747de56aebf4227248c141f9ed4c7c74ecc277c645051`.
The stylesheet remains `styles-C1VBoyd-.css`. Relative to the complete gate,
only two UI files and three screen-test files changed; all other 124 recorded
files, including the domain and browser API suite, match. Typecheck, lint and
build pass on the final source. The complete affected-file recheck is recorded
with its own result below.

### Final acceptance gate

The complete gate ran against `7c2fc95` in
`artifacts/acceptance/21/2026-10-16T13-38-57.906Z`. Typecheck, lint, all 105
domain tests, all 11 skill tests, packaged-guidance checks and build passed.
All 158 API cases passed. The screen suite passed 559 of 564 cases and failed
five Firefox workspace-startup waits. The full invocation remains **failed**.

All five failures stopped at the 30-second readiness assertion before their
assignment actions. An unchanged-source Firefox recheck of the entire affected
file passed all six cases, without skips, flaky retries or longer assertion
waits. The 129-file source guard found no changes. Resource contention is a
possible explanation, but these results do not establish its cause. Every
distinct required API/screen case has a passing result in this consolidated
verification; this is not a claim of one uninterrupted passing full run.
The [verification record](evidence/21/followup-2026-10-16/verification-results.json)
retains exact case names, report hashes, timings and source bindings.

The final affected-file run against `9783563` passed all 165 cases across the
complete acceptance, queue, review, correction-request and resubmission screen
files. Chrome, Firefox and WebKit each passed 55 cases, with no skips or flaky
retries. The [case record](evidence/21/followup-2026-10-16/affected-file-results.json)
retains every case, its source binding and the complete report hash. This final
recheck supplements the earlier full run and unchanged assignment recheck.

The copied runner executes the same checks, with independent API/screen servers
concurrently using two/four workers. The repository runner is unchanged; the
retained [complete run](evidence/21/followup-2026-10-16/complete-run.json)
records both runner hashes and this execution change, with the exact
[copied runner](evidence/21/followup-2026-10-16/acceptance-parallel.mjs.txt). Stopped
invocations remain in the
[interrupted run record](evidence/21/followup-2026-10-16/interrupted-runs.json).
The final source has the narrower affected-file and ordinary-browser rechecks
above. The unchanged domain/API results retain their `7c2fc95` binding. No claim
is made that every required case ran against `9783563`, or that either source
has one uninterrupted passing full-gate invocation. No full accessibility
conformance, Safari, Android or iPhone result is inferred.

## Review and reproduction

The earlier review compared `4ba0547...2453162` and its subsequent fixes.
The follow-up two-axis review compares
`522fc0f2224564ad92692d8f146673da3e09aab4` through
`7c2fc951b8a2ec62675380f6faa4be3844a12d7c`, then reviews `9783563` and the
final evidence.

Standards has no outstanding findings. Changes follow the repository's Tailwind
conventions and accepted screen seam. Pending controls preserve focus, expose
unavailable states and guard activation. Shared dialog containment keeps the
existing Escape and opener-return behavior. Native PDF toolbar internals have
the narrower input scope recorded above.

Spec has no outstanding findings. The completed ordinary-browser matrix,
supplemental recovery/correction flows, reader smoke, native preview checks and
saved print inspection close the previously unperformed manual work. Historical
source and failed attempts retain their own labels. The synthetic long print
history demonstrates pagination, not twelve actual correction rounds.

Standards: 0 outstanding findings. Spec: 0 outstanding findings.

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
