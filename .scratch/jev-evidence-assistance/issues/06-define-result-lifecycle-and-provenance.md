# Define result freshness, visibility and saved demonstrations

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Assignee: the operator
Parent: [Plan thoughtful Jev evidence assistance](../map.md)
Blocked by: 02, 04, 05

## Question

What makes an evidence suggestion applicable to the document and application currently on screen, who can see it, and how should its lifecycle differ from a saved demonstration?

Decide the relationship between results and source file hashes, page or crop coverage, application and correction revisions, question definitions, model versions and preprocessing versions. Define invalidation after edits, document replacement, resubmission, reviewer reassignment and demo reset; treatment of in-flight or late results; cancellation, retry, persistence and cross-tab behavior. Preserve applicant/private-correction and reviewer visibility boundaries. Define what reviewers must inspect before recording an assessment. Specify live and saved-example provenance, replay matching, visible labelling and behavior when a saved example does not match the current evidence. Avoid presenting a saved result as a new analysis.

Apply the per-field findings and explicit page scope agreed in [Define useful applicant and reviewer assistance](04-define-assistance-tasks-and-workflows.md#answer). Include missing-to-complete field edits, draft submission-month rollover and partial page failures when deciding result applicability. Preserve conflicting page findings and distinguish unavailable analysis from absent evidence. Source-inspection behavior must leave ordinary manual assessment available when AI analysis or highlighting is unavailable.

Apply the accepted [service and retention policy](05-choose-live-service-and-spending-policy.md#answer): the server keeps no answer archive, completed duplicate runs cannot replay a retained response, and explicit reruns consume fresh allowance. Distinguish the local source-file association from the server's fingerprint of submitted page images and context. Include TanStack-mapped and native Jev provenance, unavailable comparisons or pages due to unknown usage, and the selected page/preparation manifest. Decide browser-result persistence and recovery within the existing private-correction boundaries; do not introduce a server content archive.

Resolve with the user using grilling and domain-modeling. Record the domain distinctions in the glossary as they become agreed; keep storage and API details in the ticket resolution.

Use [Verify document preparation and highlight coordinates](02-verify-document-image-preparation.md), [Define useful applicant and reviewer assistance](04-define-assistance-tasks-and-workflows.md) and [Choose live access, deployment and spending policy](05-choose-live-service-and-spending-policy.md).

## Comments

### Round 1 confirmed on 2026-10-17

The user answered "I accept your recommendations" to these four starting decisions. This ticket remains claimed while visibility, cleanup, interrupted work and provenance details are discussed.

- Bind findings to the source file, checked pages, context actually supplied, question definitions, model and preparation version. Changed inputs make affected findings stale; unrelated edits preserve independent findings. Completing a previously missing declaration requires a new dependent comparison. A draft reporting-period rollover invalidates comparisons that used the provisional period.
- Completed live results may persist in this browser within existing applicant, private-correction and reviewer visibility boundaries. Reopening, including offline, requires checking applicability. The server has no answer archive, so a lost local result requires an explicit new run and fresh allowance.
- A saved demonstration can attach to current evidence only when its recorded source, checked pages, relevant context and analysis versions match exactly. Keep a permanent "Saved demonstration" label and original analysis date. Otherwise show a separate example with its own fictional evidence, with no findings or overlays attributed to the current upload.
- Before recording a document assessment, the reviewer must inspect the current source and explicitly confirm that inspection, covering all supplied pages relevant to the assessment. An AI highlight alone is insufficient. Ordinary viewing remains available without AI analysis or overlays; running AI is not a prerequisite.

### Round 2 confirmed on 2026-10-17

The user answered "I accept your recommendations" to these visibility, retention, interruption and inspection rules. Provenance, coverage, recovery and saved-example details remain to be discussed.

- Applicant results remain private to that applicant, including after submission or resubmission. Reviewer results remain staff-only under existing submitted-record permissions. Never publish private correction findings during handoff. Reassignment preserves applicable staff findings, but the newly assigned reviewer must inspect the current source. After resubmission, independently unchanged reviewer findings may remain; changed comparisons become stale.
- Keep one latest completed run per document slot and visibility context in browser storage for seven days after completion, without extending expiry on viewing. Results from unsaved evidence or edits remain in memory until matching evidence and context are saved. Mark stale findings and disable their overlays. Sign-out hides protected results and clears temporary images. Reset deletes the old dataset's results. Provide "Clear saved analysis" independently of financing records.
- Cancel affected work after relevant edits, document replacement, leaving the view, sign-out or reset. Discard late responses from cancelled or superseded runs; an older run cannot overwrite a newer one. Previously completed, applicable results may remain. No automatic retry or rerun. Cancellation promises neither remote termination nor allowance refunds.
- Permit source inspection through the normal viewer, opening or downloading the file, followed by explicit reviewer confirmation. A highlight click or page-open event is not proof of reading. If the source cannot be opened, permit "Needs replacement" with a reason explaining the problem, without accepting the document based on AI. Reset inspection confirmation after source changes, resubmission, reassignment or changes to details on which the assessment depends.

### Round 3 confirmed on 2026-10-17

The user answered "I accept your recommendations" to these provenance, coverage, recovery and demonstration rules. The consolidated resolution below awaits confirmation before this ticket is closed.

- Retain local provenance identifying the original source, selected and prepared pages, actual supplied context, question/model/preparation/mapping/display-policy versions, timestamps, native Jev answers and TanStack mappings, usage and failures. The local original-file association is distinct from the server fingerprint of received images and context. Every model-visible input is a dependency, including shared context that can invalidate several comparisons together. Restored overlays require matching page images.
- Keep partial runs visibly scoped. Distinguish selected, successful, failed and unchecked pages, as well as unavailable and skipped comparisons. Retain successful page findings and conflicts. Unknown usage makes the affected stage unavailable. Never silently merge runs. A failed or cancelled rerun leaves the prior result; a usable complete or partial replacement is a distinct run with its own coverage.
- Cross-tab notifications carry identifiers and revision hints only. Reread authorized local state and validate identity, source, context and expiry before showing results. Unsaved tab contexts stay separate. Reloaded unfinished work is interrupted, never automatically restarted. Server completion metadata cannot recover missing local answers.
- Saved demonstrations use frozen fictional evidence bytes and captured, checked real Jev outputs with their provenance. Regenerated samples are not assumed byte-identical. Replays retain their original date and model and never describe mismatched uploads. Scripted fixtures say "Illustrative example" and cannot claim prior Jev analysis. Period applicability follows the application's effective submission month, currently fixed, without adding a wall-clock financing rule.

### Completed decision confirmed on 2026-10-17

The user answered "Yes, record and close this decision" after reviewing the consolidated lifecycle. The answer below is authoritative; earlier comments preserve the decision rounds.

## Answer

Resolved on 2026-10-17 through three live grilling rounds and final confirmation with the user, using wayfinder, TypeSafe, grilling, domain-modeling and unslop. This is the authoritative lifecycle and provenance contract for dependent tickets. It is a planning decision, not an implemented result store, inspection gate or model-quality claim.

### Applicability and revisions

An evidence suggestion describes a particular source, page scope, task and supplied context. Applicability requires a currently authorized source association and matching inputs and analysis definitions. It does not establish correctness or document suitability.

Record the dataset, application, document slot, audience, snapshot/workspace and correction round where applicable; the file ID and hash of its actual bytes; and observed shared/workspace revisions. A file hash alone cannot authorize reading a result or attach it to another application. Revision changes trigger a fresh read and dependency check, rather than invalidating every finding indiscriminately.

Compare the context actually supplied to each provider attempt, including missing or invalid declarations, product, slot requirement, relevant correction reasons/targets and expected reporting period where supplied. Every field visible to the model is a dependency, even if only one question names it. The bounded document-wide call may therefore have several field comparisons invalidated together. Keep per-field findings separate without claiming that shared model context is irrelevant. Source-only findings remain independent only when their actual state and questions excluded the changed declaration.

| Change | Result behavior |
| --- | --- |
| Declaration edited, cleared or completed after being missing | Invalidate every comparison that received the changed context. Do not infer a newly available comparison from an old skipped one. Independent page findings may remain. |
| File replaced or removed | Cancel affected work and invalidate that slot's old source association and overlays. A matching filename or sample ID is insufficient. |
| Selected pages or preparation changed | The old run retains its original scope; it cannot claim the newly selected coverage. Do not combine it with another run. |
| Draft effective submission month changed | Invalidate findings that used the provisional period. Use the application's effective month, not elapsed wall-clock time alone. |
| Submission or resubmission | Recheck the newly submitted source/context. Never publish applicant results into staff results. Preserve independently unchanged reviewer findings, while changed comparisons become stale. Reset inspection confirmation. |
| Reviewer reassignment, staff note or unrelated review update | Recheck current read/write permissions. Preserve findings whose inputs remain unchanged. Reassignment resets inspection confirmation and stops the former assignee from assessing. |
| Correction round or permitted targets changed | Recheck the workspace/round association and any supplied reasons or targets. A prior result cannot unlock fields or satisfy a correction target. |
| Question, model, preparation, mapping or display-policy version changed | The old version is explicit; it cannot silently become a current result under the new contract. Disable affected current findings/overlays and require an explicit fresh run or a matching saved demonstration. |
| Demo reset | Delete old-dataset results and invalidate all pending work and inspection confirmations. Late work cannot repopulate the new dataset. |

The current domain uses a fixed submission month, as defined in [the domain entry point](../../../packages/rifd-domain/src/index.ts). This decision introduces no new financing clock. Once initially submitted, historical and correction comparisons keep the actual initial submission month under the accepted workflow.

Stale findings show an explicit out-of-date state and their original scope, never a current consistency/absence claim or active overlay. An inability to verify source, context or versions is an availability problem, not permission to assume a match.

### Run provenance and page scope

Keep a bounded local record for each retained run. The [service decision](05-choose-live-service-and-spending-policy.md#answer) remains authoritative for numerical limits, request composition and provider transport.

| Record | Required content |
| --- | --- |
| Local association | Run identity, dataset/application/slot, applicant or staff audience, snapshot/workspace/round, file ID, actual source-byte hash, MIME and observed revisions |
| Input manifest | Total source pages; explicitly selected page numbers in order; prepared, dispatched, successful, failed and unchecked pages; per-stage unavailable or skipped comparisons and reasons |
| Preparation manifest | Hash and dimensions of each submitted PNG; source page, orientation/rotation, viewport/upright dimensions, actual scale and padding; renderer, worker/resources and preparation-contract versions |
| Context and questions | Actual allowed context sent to each attempt, question definitions/criteria or their recoverable versioned definition, IDs and declared dependency sets; expected reporting period where used |
| Analysis provenance | Requested and returned model, SDK/bridge/TanStack mapping versions, display-policy version, real run/attempt timestamps and available provider response identifiers |
| Outcomes | Validated native judgments and their TanStack mappings, native distributions/probabilities/fractional Scores/Box data and nullable confidence, usage/accounting status, stage failures and final coverage |

Only the selected full-page images allowed by the preparation policy are inputs. There is no hidden crop, tile or regenerated evidence. The manifest records the full-page transform and padding. Prepared PNGs remain temporary; the record keeps hashes and geometry rather than a durable image archive.

The browser associates results with the authorized original bytes. The server computes its keyed fingerprint from the page bytes, allowed context and question versions it receives. That fingerprint prevents duplicate dispatch; it does not prove those pixels came from the claimed original file. Do not describe the two identities as equivalent or expose a duplicate-protection key as an authorization token.

Keep native Jev semantics authoritative beside TanStack's mapped answers. Preserve unknown usage as unknown and nullable Box confidence as null. Unknown usage makes its affected stage unavailable under the selected bridge contract; a captured native value cannot bypass that outcome. Null Box confidence alone does not fail unrelated judgments. Malformed or unavailable stages contribute no usable evidence-support or absence finding.

Restore overlays only after recreating and verifying the recorded submitted raster and its geometry. A missing or mismatched raster leaves highlighting unavailable and ordinary source inspection available. Never draw a recorded box on a differently rendered image by assuming the coordinates still fit. Resize through the current content rectangle; RTL layout does not reverse image axes.

Every finding names its source page and target or field. Show selected and successful coverage separately, with failed, unreadable and unchecked pages visible. A successful readability judgment can report unreadable evidence; that page still cannot establish absence. Missing declarations are skipped comparisons, not model failures.

Preserve conflicting page findings. A failed document-wide comparison does not erase usable page findings. Partial conclusions concern only their actual successful scope and retain warnings; failed or unchecked pages cannot establish agreement or absence. Use "Not found in the checked pages" only when the usable checked evidence supports that scoped finding.

### Visibility, persistence and cleanup

Applicant results remain available only to their owner through existing authorized reads. Draft and private-correction results never enter reviewer projections, submitted records, staff activity or applicant-visible review decisions automatically. Publishing a correction publishes its normal response, not its private assistance history. Results retained from a finished workspace remain labelled with that prior scope and cannot attach to a new round without matching authorization and inputs.

Reviewer results remain staff-only and concern authorized submitted evidence. Existing submitted-record read permissions govern their visibility, independently of assignment. Current assignment and status still govern assessment writes. Reassignment does not make unchanged evidence findings false, and does not transfer an inspection confirmation. Applicant views do not receive staff findings.

Keep one latest completed run that had usable findings at completion per dataset, application, slot and visibility context in browser storage. Expire it seven days after actual completion, without extending expiry on reads. "Completed" includes a terminal partial run with usable findings. A replacement is an atomic new run record with its own coverage, not an appended answer history. A total failure or cancellation leaves the prior record and its original expiry, if it remains applicable.

Persist a result only when its source bytes and checked context have a matching authorized saved snapshot/workspace. Results concerning unsaved edits or prepared attachments remain in the originating view's memory until a matching ordinary Save. Saving cannot revive a result that was cancelled or whose inputs changed. Assistance does not save financing edits implicitly. Storage failure leaves the result temporary and reports that it cannot be recovered after closing; it does not affect ordinary saved records.

Reopening, including offline, requires current authorized local reads, expiry checking and dependency validation. Show restored results as previous live analysis with their original completion date, not a new request. Loading or switching languages does not run inference. Expired, unreadable or incompatible stored records cannot supply current findings.

Provide "Clear saved analysis" within the authorized context, separately from financing-record deletion. Clear retained results, temporary images and related pending work so a late response cannot restore cleared analysis. Reset deletes the old dataset's analysis records and pending authority. Enforce expiry on reads and clean expired records during active use; do not promise deletion by a background process while the browser is closed.

Sign-out/session expiry hides protected results, cancels work and disposes temporary images and unsaved result state. Eligible completed records may remain until expiry for the same authorized identity. Prepared images, object URLs and renderer resources are disposed on cancellation, replacement or view disposal. No result content is sent through logs, lifecycle telemetry or cross-tab hints.

The server retains no source, context or answer archive. Browser clearing, quota eviction or lost storage is not recoverable from server completion metadata. Resetting the fictional dataset or changing roles does not reset live-service allowances.

### Cancellation, retries and cross-tab recovery

Capture current dataset, authority generation, source/context and run generation before starting. Relevant edits or replacement cancel affected work. Leaving the view, sign-out, reset or clearing analysis cancels its pending work. Never accept a response from cancelled/superseded work merely because it eventually succeeded.

Before displaying, persisting or replacing a result, validate the current association and run generation again. An older run cannot overwrite a newer accepted run, including through another tab. Keep the prior applicable completed result visible during a rerun. A usable terminal replacement carries only its own page scope; never silently merge results across runs.

Abort local preparation/transport and stop dispatching new stages where possible. Cancellation or timeout proves neither remote termination nor non-billing. Dispatched/uncertain attempts retain their allowance charges. Follow the accepted reservation, duplicate-ID and deadline policy; do not invent a refund or automatic retry.

Cross-tab messages carry dataset/run identifiers and revision hints only. They cause fresh authorized reads, not transfer of answers, declarations or images. Each tab checks against its own current editor context, so another tab's unsaved edits or newly completed run cannot replace the meaning of the document on screen. Revalidate on commits, activation/focus and before using a finding or recording an assessment; missed hints cannot authorize stale use.

A reload makes unfinished local work interrupted. Do not resume, resubmit or start another paid request automatically. The same run ID may identify status/duplicate metadata but cannot replay a retained server answer. If no usable local completed result exists, offer manual work, a labelled saved example or an explicit new run after admission/cooldown with fresh allowance.

### Source inspection and assessment

Before recording an assessment, the reviewer examines the current supplied source and explicitly confirms inspection of all supplied pages relevant to that assessment. An AI-selected subset does not define the entire assessment scope or justify ignoring conflicting pages. Opening a page or selecting a highlight does not automatically record confirmation or prove reading.

Permit ordinary viewing, opening or downloading the source. Neither live inference, a prepared AI preview, a successful Box nor an overlay is a prerequisite for manual assessment. The confirmation belongs to the reviewer and current assessment context, distinct from the document assessment and AI finding.

Validate confirmation against the current file, relevant application details, submission and assignment when recording the assessment. Source changes, dependent-detail changes, resubmission or reassignment require renewed inspection and confirmation. Unrelated staff notes need not invalidate it. A saved AI result or saved demonstration cannot provide confirmation.

If the source cannot be opened, allow "Needs replacement" with the reviewer's explanation of that problem. Never require a false claim of successful inspection or permit acceptance based on AI alone. An AI service, renderer or highlight failure leaves ordinary source inspection available through the existing file access routes.

This changes the current behavior: [review validation](../../../src/demo/review.ts) and [review controls](../../../src/ui/review.tsx) currently allow assessment independently of previewing. Implementation must enforce the agreed confirmation at the review-operation boundary as well as in the interface. The glossary distinguishes source inspection, inspection confirmation and document assessment.

### Saved demonstrations and illustrative examples

A saved demonstration is a checked capture of a real Jev run over frozen fictional evidence. Bundle its exact source bytes, input/preparation manifest, supplied context, versioned analysis definitions and captured native/mapped outcomes. Browser-generated samples are not assumed byte-identical across browsers or rendering versions; sample names or seed IDs never substitute for actual matching.

The seven-day retention policy applies to per-application live-result records. Bundled demonstration assets are versioned examples, not an archive of visitors' analyses.

Allow replay against current evidence only after an explicit example choice and exact matching of source bytes, task/slot, selected pages and prepared input, supplied context and applicable analysis versions. Bind the matched fixture to the currently authorized local source; it does not grant access to another application or workspace. Keep "Saved demonstration", the original analysis date/model and original partial-coverage limitations visible. Replay is not a live dispatch or a new analysis and consumes no provider attempt.

If anything does not match, offer a separate read-only example with its own evidence and context. Do not replace the user's upload, copy example declarations into a correction, show the example's boxes on that upload or imply it was analyzed. An old-version example may remain an example of that recorded version, without becoming a current finding. Offline behavior follows the same matching rules.

Scripted prototype fixtures say "Illustrative example" and cannot fabricate a provider/model response identifier or claim that Jev produced them. Until real captures have been obtained and checked, illustrative examples may demonstrate the interface with that label. Capturing real outputs requires the later bounded evaluation/setup work; this resolution authorizes no inference call.

### Handoff and verification

This planning decision is complete. Existing tickets cover the remaining route:

- [Validate the applicant and reviewer assistance experience](07-prototype-evidence-assistance-experience.md): Present stale and partial results, saved versus illustrative labels, seven-day local storage/clear controls, unsaved checks, manual inspection confirmation and the unopenable-source exception in both languages with keyboard access.
- [Define evidence quality and workflow acceptance gates](08-define-evaluation-and-release-gates.md): Verify actual-input dependencies, hashes/geometry and restored overlays, private-result projections, workspace handoff, expiry/cleanup, reset and late-result races, cross-tab conflicts, no answer replay, unknown usage and native/mapped semantics. Include captured-fixture provenance/mismatch checks and inspection enforcement. Any paid capture or experiment remains a separately bounded task when needed.
- [Confirm the specification and implementation handoff](09-confirm-specification-and-implementation-handoff.md): Carry this contract into the implementation specification, including browser-result compatibility and the new assessment confirmation requirement.

No application implementation, dependency change, cloud provisioning or paid inference is part of this resolution.
