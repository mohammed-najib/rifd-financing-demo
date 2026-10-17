# Experimental Jev evidence assistance

Status: ready-for-agent
Decision: accepted on 2026-10-17
Date: 2026-10-17
Map: [Plan thoughtful Jev evidence assistance](map.md)
Handoff: [Confirm the specification and implementation handoff](issues/09-confirm-specification-and-implementation-handoff.md)

## Problem Statement

Applicants in the fictional RIFD financing demo must supply identity evidence, business evidence, a revenue and expense summary, and a stock purchase plan or supplier quotation. They can submit evidence whose relevant details are hard to read, belong to the wrong document category, cover the wrong financial period or disagree with their declarations. During corrections, they need to address the reviewer's reason within the permitted targets while their unfinished work stays private.

Reviewers must find and inspect supporting names, dates, figures and purchase details before recording document assessments and completing the five review checks. Image files, scans and multipage PDFs make that work slower when the relevant details are difficult to locate. Applicants and reviewers need useful guidance tied to the actual supplied evidence, with clear coverage and uncertainty, while retaining their existing decisions and ordinary workflow.

## Solution

Add on-demand experimental evidence assistance to the existing applicant and reviewer workflows in Arabic and English. Applicants choose "Check document" in a draft or permitted correction workspace. Reviewers choose "Find supporting evidence" on submitted evidence. Show plain-language suggestions about document category, readability and support for declared details, with source navigation and highlights that pass the accepted display checks.

Use actual page images with Jev's Choice, Score, Noul and Box capabilities. Keep every finding associated with its document, page, named target and analysis coverage. Applicants decide whether to edit, replace or retain their evidence. Reviewers inspect the source, confirm that inspection and record their own assessments, correction reasons and financing decisions. Code retains exact calculations, permissions and financing rules.

Provide five clearly labelled, checked Saved demonstrations when live analysis is unavailable, and preserve ordinary loaded-app offline work. Explain that suggestions may be wrong. The accepted experimental scope uses provisional display defaults and one focused ten-minute acceptance batch; it makes no claim of calibrated accuracy or measured human time savings.

## User Stories

1. As an applicant, I want to check a document in my draft before submission, so that I can find evidence problems while I can still change it.
2. As an applicant, I want to check a replacement in my private correction workspace, so that I can address the reviewer's reason within the permitted correction targets.
3. As a reviewer, I want to find supporting evidence in the current submitted snapshot, so that I can examine the evidence the applicant handed over.
4. As an applicant, I want to see whether a document appears to fit its document slot, so that I can inspect or replace evidence supplied in the wrong place.
5. As a reviewer, I want to see apparent document category separately from document assessment, so that I retain responsibility for deciding whether the document is suitable.
6. As an applicant, I want to see whether relevant text and digits are readable, so that I can replace evidence that is difficult to inspect.
7. As a reviewer, I want to see reading limitations for each checked page, so that I know which details still need manual examination.
8. As an applicant, I want to compare the printed applicant name with my declaration, so that I can notice a disagreement without mistaking the result for identity authentication.
9. As a reviewer, I want to locate the applicant-name region in identity evidence, so that I can inspect the printed name myself.
10. As an applicant, I want to check the business name, address and operating-since month separately, so that I can identify which declared detail may need attention.
11. As a reviewer, I want to locate the business details in their source pages, so that I can inspect their support before recording my review.
12. As an applicant, I want to check the financial reporting period before the figures, so that I can recognize evidence for the wrong three completed months.
13. As a reviewer, I want to locate monthly revenue, operating expenses and printed averages, so that I can verify the figures against the expected reporting period.
14. As an applicant, I want to compare declared revenue and expense averages with readable evidence, so that I can inspect a disagreement before handing over the application.
15. As an applicant, I want to check the description and total budget in the appropriate stock purchase plan or supplier quotation, so that I can notice evidence problems for the selected financing product.
16. As a reviewer, I want to locate the purchase description and budget, so that I can make my own product purpose fit and purchase budget coverage assessments.
17. As an applicant, I want to run useful source checks while some declarations are incomplete, so that I can prepare documents without filling unrelated fields first.
18. As a demo visitor, I want to see presence separately from agreement, so that I can distinguish a printed different value from a missing field.
19. As a demo visitor, I want to see conflicting and repeated entries, so that I am not directed only to the occurrence that happens to match a declaration.
20. As a demo visitor, I want to see which pages will be checked and explicitly select a narrower scope when necessary, so that I control the evidence sent for analysis.
21. As a demo visitor, I want to see successful, failed, unreadable and unchecked pages separately, so that I understand the actual analysis coverage.
22. As a demo visitor, I want to see undetermined findings, unavailable analysis and information not found as distinct outcomes, so that I can decide whether to inspect, retry or replace the source.
23. As a demo visitor, I want to receive findings tied to the actual supplied file, page and named target, so that I can trace each suggestion to the evidence I supplied.
24. As a demo visitor, I want to see a highlight only when its source, target, geometry and verification checks pass, so that I am directed to a region the application can bind to the current source.
25. As a demo visitor, I want to retain named findings and source access when a highlight is suppressed, so that I can continue inspection without relying on an uncertain region.
26. As a demo visitor, I want to see highlights stay aligned when a page is resized or the language changes, so that I can inspect the intended physical region in either layout.
27. As an applicant, I want to inspect advice beside the document task and open its source inline, so that I can decide whether to edit, replace or retain the evidence.
28. As an applicant, I want to edit only the fields and documents permitted by the current correction request, so that assistance does not expand the requested correction.
29. As an applicant, I want to ignore advice without explaining my choice when ordinary submission requirements pass, so that experimental suggestions do not become an extra submission prerequisite.
30. As an applicant, I want to save my edits through the ordinary Save action, so that running assistance does not publish or persist unfinished financing changes.
31. As a reviewer, I want to inspect source, findings and assessment controls together, so that I can move between evidence and my own judgment.
32. As a reviewer, I want to explicitly confirm inspection of the current source before assessing it, so that my recorded assessment reflects my own examination.
33. As a reviewer, I want to renew inspection confirmation after relevant source, submission or assignment changes, so that an older confirmation cannot authorize assessment of a changed context.
34. As a reviewer, I want to record an explained Needs replacement assessment when a source cannot be opened, so that I can request usable evidence without falsely claiming inspection.
35. As a reviewer, I want to author document assessments, correction reasons, review checks and financing decisions myself, so that model suggestions cannot take those actions for me.
36. As a demo visitor, I want to use Arabic-first and English assistance with the same task meanings, so that I can understand findings in my selected language.
37. As a demo visitor, I want to use the document workflow on narrow screens, by keyboard and with a screen reader, so that I can inspect findings and reach the source through accessible controls.
38. As a demo visitor, I want to see plain-language findings and an experimental-assistance notice, so that I understand that suggestions may be wrong.
39. As a demo visitor, I want to open provenance for the original context, coverage, model answers and versions, so that I can inspect how a finding was produced without numeric model detail crowding the task.
40. As a demo visitor, I want to read the fictional-data and transmission notice before a live guest session and see the context before each submission, so that I know what will be sent for analysis.
41. As a demo visitor, I want to start analysis explicitly and cancel local work, so that I control when assistance runs.
42. As a demo visitor, I want to retry explicitly after failure with a fresh run and allowance check, so that reloads, navigation and language changes do not silently repeat paid work.
43. As a demo visitor, I want to continue ordinary work when analysis fails, is unavailable or reaches a limit, so that assistance availability does not block the financing demonstration.
44. As a demo visitor, I want to continue the already-loaded application offline, so that I can still inspect evidence, use applicable saved results and complete permitted local work.
45. As a demo visitor, I want to choose a clearly labelled Saved demonstration when live analysis is unavailable, so that I can inspect a checked example with its original evidence and limitations.
46. As a demo visitor, I want to see a Saved demonstration on my document only when its actual source and analysis context match, so that an unrelated example is not presented as a finding about my evidence.
47. As a demo visitor, I want to distinguish new live results, previous live analysis, Saved demonstrations and illustrative examples, so that I understand the provenance and date of what I see.
48. As a demo visitor, I want to restore the latest applicable completed analysis for up to seven days, so that I can revisit findings without a new provider request.
49. As a demo visitor, I want to retain an earlier applicable result after a failed or cancelled run, so that an unsuccessful attempt does not erase useful analysis.
50. As a demo visitor, I want to see results over unsaved edits remain temporary until a matching ordinary Save, so that restored findings match durable application context.
51. As a demo visitor, I want to see changed-source or changed-context findings marked stale, so that I do not rely on an old agreement or absence claim.
52. As a demo visitor, I want to have changes from another tab rechecked without overwriting my unsaved edits, so that assistance stays tied to the document I am examining.
53. As a demo visitor, I want to clear saved analysis independently of financing data, so that I can remove assistance history without losing my application.
54. As a demo visitor, I want to have late analysis completions ignored after clear, reset, sign-out or departure, so that old work cannot restore removed or unauthorized findings.
55. As an applicant, I want to keep draft and correction assistance owner-only even after resubmission, so that staff do not receive my private assistance history.
56. As a reviewer, I want to keep reviewer assistance staff-only on authorized submitted evidence, so that private applicant work and staff findings remain separate.
57. As a demo visitor, I want to continue using valid financing data if assistance storage is corrupt or unavailable, so that an optional analysis record cannot force a financing-data reset.
58. As a demo operator, I want to keep provider credentials and fixed analysis questions on the server, so that visitors can request bounded assistance without receiving the secret or choosing arbitrary provider work.
59. As a demo operator, I want to verify guest authentication and App Check on both direct and routed endpoints, so that live allowance does not depend on the selected fictional role.
60. As a demo operator, I want to reserve the complete run plan transactionally and deduplicate concurrent requests, so that quota races or repeated requests cannot dispatch unaccounted work.
61. As a demo operator, I want to enforce attempt, resource, concurrency and deadline limits and an operator disable switch, so that I can bound the live service's work.
62. As a demo operator, I want to reconcile actual charges and protect the accepted validation balance before more paid calls, so that unknown or failed work cannot spend protected credit.
63. As a demo operator, I want to retain only the agreed metadata and expire it under the retention policy, so that operation of assistance does not create a server archive of documents or answers.
64. As a demo operator, I want to receive a bounded acceptance report that identifies failures, skips and unverified claims, so that I can decide whether concrete behavior is ready to activate without treating a smoke check as statistical validation.

## Implementation Decisions

### User tasks and capability traceability

Use the existing [glossary](../../GLOSSARY.md), especially evidence suggestion, evidence support, evidence highlight, applicable and stale suggestions, source inspection, inspection confirmation and document assessment. These remain distinct concepts. The [workflow resolution](issues/04-define-assistance-tasks-and-workflows.md#answer) defines the task meanings.

| Slot | Inputs and bounded work | User benefit | Acceptance evidence to produce |
| --- | --- | --- | --- |
| Identity | Actual name-bearing evidence and declared applicant name | Applicant spots reading limitations or possible disagreement; reviewer locates the printed name | Named name finding, current source/page association, disagreement and absent/repeated-name regressions; no identity authentication claim |
| Business | Business name, address and operating-since month | Applicant checks the supplied details; reviewer reaches their supporting regions | Separate comparisons and locations, missing-context behavior, permitted-edit enforcement; operating-history arithmetic stays in code |
| Financial | Reporting period, three monthly revenue and expense figures, printed averages and declared averages | Applicant sees period or figure problems; reviewer locates the dates and amounts | Period-first composition, retained conflicts and complete-source guards; fake four-page request evidence; actual native four-page reliability remains unverified |
| Purchase | Product, explanation and total budget, with stock plan or equipment quotation evidence | Applicant checks description/budget; reviewer finds their source | Product-appropriate category, description/budget findings and source locations; no itemized quotation analysis or automatic purpose/budget review check |

| Requested capability | Role | Evidence and limitation |
| --- | --- | --- |
| Vision/image input | Inspect the actual supplied page pixels, including scans and image-only PDFs | Checked historical captures establish transport on specific examples; production rendering/source binding still needs implementation checks |
| Choice | Eight category outcomes, five per-field support outcomes and target multiplicity | Preserve explicit uncertain/other/mixed outcomes and native distributions; historical examples do not establish general correctness |
| Score | Relevant-text readability at three descriptive levels | Preserve fractional Score and distribution; only the historical clear-level examples were checked |
| Noul | Independent named-target presence and six bound-crop checks | Presence is separate from agreement; the new crop judgments have only a stopped transport observation, without independent outcome adjudication |
| Box | Locate one named target on an identified raster | Four static overlays were individually certified; automatic unseen-region safety remains unverified and needs the focused regressions and source inspection below |

All capabilities must remain available in the implemented workflows. A particular action asks only useful questions. Suppressing an unsafe or uncertain location is required behavior, but does not count as successfully testing Box usefulness.

### Connected workflows and presentation

1. An applicant selects "Check document" in a draft or the current private correction workspace. A reviewer selects "Find supporting evidence" on authorized submitted evidence. Read actual supplied bytes through the demo interface. Never regenerate evidence from current declarations as a substitute.
2. Before creating a live Firebase guest session, show the fictional-data and transmission notice. Before each submission show selected pages and the minimum relevant context. Missing or invalid declarations disable their dependent comparisons, while useful source-only work remains possible. A live limit never invalidates an otherwise permitted attachment or adds a financing-submission prerequisite.
3. Show plain-language findings with the document, page, named field/target and actual coverage. Keep selected, successful, failed, unreadable and unchecked scope distinct. Unavailable analysis, undetermined evidence and information not found are separate outcomes. A failed comparison preserves independently valid page findings.
4. Applicants may inspect, retain or replace evidence and edit only permitted fields. Advice neither saves edits nor satisfies correction targets. Reviewers inspect the ordinary source, explicitly confirm inspection, then author assessments or correction reasons through existing controls. Advice never prefills a decision, authors correction prose, transcribes a field or changes status.
5. Cancellation, failure, exhausted allowance and offline use leave ordinary work and the labelled Saved demonstrations accessible. Explicit retries use a new run and fresh allowance. Reload, language changes and returning to a screen never start inference automatically.

Implement applicant layout A and reviewer layout B from the [accepted interface](issues/07-prototype-evidence-assistance-experience.md#answer). Applicants see advice beside the document task, an inline source viewer when requested and their actions. Reviewers see source, findings and assessment controls side by side on desktop, stacked on narrow screens. Preserve keyboard access, accessible text findings, page navigation, source open/download routes and screen-reader feedback. RTL changes reading layout, never physical image axes.

Label live mode "Experimental assistance" and "Suggestions may be wrong. Check the original document." Arabic wording is "مساعدة تجريبية" and "قد تكون الاقتراحات غير صحيحة. راجع المستند الأصلي." Model terminology, numbers, distributions, versions and native/mapped results appear only in explicitly opened provenance. Add no per-highlight human-confirmation step.

The [preserved prototype](prototype-review.md) is the design source, including its four screenshots and checked fixture scenarios. Implement the accepted behavior in the real application. Do not merge its throwaway variant code, layout chooser or review-only numeric-display experiment. Fixtures remain "Illustrative example" and cannot claim provider output.

### Modules and integration seams

The existing [architecture](../../docs/architecture.md) stays the starting structure. The domain package owns financing rules, the public demo module owns authorized reads and complete operations, and screens own unfinished interaction. The responsibilities below define the accepted boundaries; private filenames remain implementation choices.

| Module | Small caller-facing interface and responsibility | Existing integration and real variation |
| --- | --- | --- |
| Evidence definitions and display policy | Typed action/input/result records, versioned fixed questions, dependency manifests, pure finding/region composition | Shared browser/server definitions; policy can consume real validated native captures or deterministic regression fixtures without network access |
| Browser preparation and source geometry | Prepare explicitly selected full pages with cancellation; return exact PNGs and transform/hash manifests; recreate a recorded raster before restoring an overlay | A browser preparation module encapsulates PDF.js and image decoding. The ordinary source-preview route remains usable independently |
| Browser assistance lifecycle | Explicit run/cancel, authorized latest-result read, clear and Saved-example selection; owns authority generations, applicability, persistence and cross-tab revalidation | Extend the public `Demo` interface and its implementation. Use existing `readFile`/`readPrepared`, snapshot/workspace reads, sessions and commit hints. Screens never query analysis storage directly |
| Live analysis controller | One fixed applicant/reviewer request in, terminal or partial result out; validates limits, reserves the complete plan, enforces deadlines and accounts for every dispatch | New HTTPS function behind Hosting. Transactional Firestore admission and disable state are internal. This module is not authority for browser financing records |
| Native evaluation bridge and bound verification | Evaluate an admitted fixed stage with an abort deadline; return validated native/mapped answers, usage and provenance | Invocation-local TanStack adapter backed by TypeSafe SDK; real and fake transports satisfy the same internal seam. Native Box/crop handling stays internal rather than becoming a new general-purpose model interface |
| Assistance presentation and reviewer inspection | Render localized findings, coverage and provenance; collect explicit human inspection in the current context | The applicant editor, private corrections and reviewer screen use the public demo interface. Assessment enforcement also changes the authorized review transaction, command validation and operation fingerprinting |

Keep geometry, policy and lifecycle decisions out of screen event handlers. Keep model calls out of pure financing helpers. A live result and a Saved demonstration retain distinct provenance and behavior even when they share rendering. Do not add an interface solely for a hypothetical future provider.

#### Browser-result compatibility

Use a separate, versioned IndexedDB database for assistance records, behind the public demo interface. Preserve the financing database's existing store layout and logical financing schema. Its current validator requires exactly one `state` store and version-1 financing records; adding a store there without migration would break startup. Analysis records must not be silently inserted into a schema that strips them.

An analysis record has its own schema and question/model/preparation/mapping/display versions. Reject incompatible or corrupt records for current use, report analysis availability and preserve financing data. This first delivery has no legacy production analysis data to migrate. Do not import old experiment ledgers or prototype fixtures into visitor-result storage. Bundled checked demonstrations remain separately versioned assets.

Create the analysis store only after financing startup establishes the current dataset. Key records by dataset, application, slot, audience and authorized snapshot/workspace/round context. A transaction atomically replaces one latest usable completed run and records a generation preventing an older completion from overwriting it. A clear operation invalidates pending generations before deleting records. Cross-tab commits require rereading current authority and generations.

Separate databases do not offer a joint reset transaction. Reset first invalidates the old dataset's authority and all in-memory work, so its results cannot be read, displayed or persisted as current. Delete old-dataset analysis records as part of reset cleanup and active-use startup cleanup, including after an interrupted reset. Report analysis-cleanup failure without corrupting or resetting valid financing records. Tests must prove that pending work cannot repopulate old or new dataset results after reset. Finance reads never wait for an unavailable analysis store to become healthy.

#### Inspection and command compatibility

Extend `assessDocument` through the public operation type, runtime command validation, operation fingerprinting and authorized review transaction. Require explicit inspection confirmation bound to the current reviewer, dataset/application/slot, supplied file/hash, relevant submitted details, submission/correction publication and assignment history. Derive a versioned inspection-context token from the authorized submitted state and relevant committed events. Compare it again inside the assessment transaction; a UI checkbox alone is insufficient.

Bind submission and assignment transitions, including reassignment away and back, rather than just the current reviewer name. Do not bind unrelated staff notes. Existing expected shared revisions still prevent stale writes; a fresh read after an unrelated note may retain otherwise valid inspection confirmation. Resubmission, source or dependent-detail changes, reset and reassignment require a new confirmation. No source opening or AI result can supply it automatically.

For an unopenable source, permit only an explained "Needs replacement" assessment through an explicit unable-to-open path. Do not require a false inspection assertion or permit acceptance. UI and operation validation must enforce the same exception. Existing valid assessment callers/tests must supply the new confirmation or exception. Existing financing records and historical mutation receipts remain readable, and committed-operation replay retains existing idempotency semantics without duplicating a write. New command fingerprints include the inspection input; ambiguous old/new reuse cannot bypass validation. No historical assessment is relabelled as newly inspected.

### Preparation, geometry and request bounds

The [service resolution](issues/05-choose-live-service-and-spending-policy.md#answer) owns the base limits. The [automatic design](issues/13-choose-repaired-policy-and-revalidation-budget.md#answer) and [accepted repaired crop method](issues/15-choose-automatic-candidate-and-authorize-exact-validation.md#answer) explicitly amend composition to include verification. They supersede the old five-attempt and no-derived-crop descriptions only where stated here.

| Resource | Bound |
| --- | --- |
| Original PDF/PNG/JPEG | 1 through 5,000,000 bytes |
| Source image before decoding | At most 20,000,000 pixels, at most 8,192 pixels per side |
| PDF | At most 100 pages; encrypted/unparseable PDFs unavailable for live analysis |
| Selected full pages | At most four; normally every page when the document fits all limits, otherwise explicit narrower selection |
| Prepared full-page PNG | 280 through 1568 pixels per side, at most 2 MiB each |
| Combined prepared images/request assets | At most 8 MiB and 8,000,000 pixels; derived verification assets also fit existing resource bounds |
| Public request body / metadata and allowed context | At most 10 MiB / 16 KiB |
| Page questions / named targets | At most 32 / nine |
| Document comparison | At most four declared-detail comparisons |
| Verification per page | At most one stage, nine candidate crops, 54 planned Nouls under a 64-question ceiling; at most ten assets including the unchanged parent page |
| Preparation | One page/worker at a time, eight seconds per page and 20 seconds cumulative preparation; server crop work also remains inside the server deadline |

Use a pinned PDF.js renderer with exactly matching worker/resources. Normalize image orientation once. Preserve complete page proportions, padding, viewport/rotation, upright size and actual scale. Reject incomplete rendering and resource-guard omissions. Never silently drop a page, crop the source, lower quality after failure or expand limits to obtain a response. Offer explicit narrower selection or manual inspection. Dispose workers, bitmaps, temporary PNGs and object URLs on cancellation, replacement and view disposal.

The current official [image documentation](https://docs.typesafe.ai/images) was rechecked for upright pixel preparation, explicit experimental opt-in, image limits and token/context handling. The [Box documentation](https://docs.typesafe.ai/primitives/box) confirms normalized geometry and provides no recommended confidence cutoff. These facts support the retained design; they do not establish its semantic safety or loosen the stricter application bounds above. The [citation-checking cookbook](https://docs.typesafe.ai/cookbooks/citation_check) illustrates source-support judgments, not accepted thresholds or a required extra model workflow here.

For an original source proven to have exactly one page, combine its page judgments and declared-detail comparisons in the first call. One selected page from a longer source does not qualify. For multipage evidence dispatch ascending page calls, then at most one comparison over successfully usable pages, then at most one bound verification call per page. This is at most two provider attempts for a true one-page source and nine for four pages. Reserve that whole planned maximum before starting. There are no hidden repair calls, automatic retries, fallback inference or model-directed loops. Partial success never silently becomes complete-source agreement or absence.

Within a request include a given image once in shared state and reference it by its named path. Use the default model context limit, not visitor-controlled long context. Pixel/body admission does not establish native image-token fit. Context overflow is unavailable work; never split or narrow the scope silently.

Use `lossless-boundary-pad-v1` for derived verification assets. Copy the integer enclosure of the exact fractional returned Box without scaling, then pad white to the minimum 280-pixel sides. Retain the fractional original boundary separately from enclosure and padding. Keep the unchanged full-page parent context. Bind every verification answer to source/raster/context/policy/question versions, page, target, exact rectangle, crop hash and transform. A mismatch suppresses that location. Padding never restores clipped glyphs or proves containment. Resource failures stop the affected work rather than resizing or adding calls.

Draw only against the exact submitted raster and its verified manifest. Transform normalized top-left coordinates using actual scale, padding and the current image-content rectangle. Invalid, degenerate or padding-only geometry produces no overlay. Resize changes display geometry only; RTL never mirrors image axes. Reopening must reproduce and hash-check the raster before drawing a recorded location. Ordinary source viewing remains available when reconstruction fails.

### Provisional experimental display contract

Use `release-display-v2-experimental` with `provisional-display-defaults-v1`. These fixed defaults are identical initially for Arabic and English. They are design heuristics, not calibrated cutoffs or 99% correctness claims. They were not produced by the stopped numerical selector.

| Judgment | Initial display rule |
| --- | --- |
| Category Choice | Specific non-uncertain answer only with native confidence at least 0.99; otherwise undetermined |
| Readability Score | Unique most likely descriptive level only with native probability at least 0.99; retain the fractional Score and all levels in provenance |
| Per-field support Choice | Decisive answer requires native confidence at least 0.99 and applicable declaration, readable/category-compatible source, field-presence, period and scope guards; uncertain remains undetermined |
| Presence Noul | Present at probability at least 0.99; absent at most 0.01; otherwise undetermined |
| Multiplicity Choice | Highlight requires selected single occurrence with P(single) at least 0.99, with no repeated or ambiguous occurrence across checked original evidence |
| Bound verification Nouls | Each original-edge clipping probability at most 0.01, field/period association at least 0.99, competing-value probability at most 0.01; all six must pass for the exact bound target and rectangle |

Category outcomes are identity, business, financial summary, stock purchase plan, equipment quotation, other, mixed content and cannot determine. Readability levels are relevant text unreadable, partly readable with obscured details, and relevant text/digits clearly readable. Per-field outcomes are appears consistent, appears different, not found in the checked pages, conflicting entries and cannot determine. Use fixed localized wording, not generated prose.

A printed field's presence is independent of agreement with its declared value. Evaluate financial period findings before amount findings regardless of serialization order. Missing/invalid declarations skip only dependent comparisons; a missing declaration becoming complete requires fresh work. Code supplies the expected three completed months before initial submission. Drafts use the existing effective submission month; historical and correction comparisons keep the actual initial submission month. Code owns normalization, averages, whole-rial arithmetic and product limits.

Agreement, absence and highlights require complete usable original-source coverage and the retained readability, category, presence, repetition, conflict and freshness guards. A witnessed conflict on usable checked pages may remain a scoped warning when other pages are unavailable, subject to applicable financial-period guards. Partial or failed pages cannot support a negative/consistency inference. Do not merge separate runs to manufacture coverage.

Verification uncertainty/failure suppresses the affected overlay and leaves a named finding/source route. Malformed Box output cannot erase independently valid non-Box judgments. Nullable Box confidence stays null and is not an overlay gate. Missing/invalid usage or broader stage failures still make their affected stage unavailable. Keep known misleading pilot locations as regressions; passing numeric heuristics alone cannot justify displaying a region already found misleading.

### Applicability, visibility and local retention

The [lifecycle resolution](issues/06-define-result-lifecycle-and-provenance.md#answer) is authoritative except for the explicitly accepted bound-crop addition and new experimental policy. Persist a bounded run record containing:

- Local run/dataset/application/slot/audience/snapshot/workspace/round association, file ID and actual source-byte hash, observed revisions and authority generation.
- Total original pages; ordered selected pages; prepared, dispatched, successful, failed, unreadable and unchecked scope; skipped/unavailable stages and reasons.
- Actual submitted raster hashes/dimensions and full-page/crop transforms, orientation, renderer/worker/resources and preparation versions. Visitor prepared images remain temporary, not a durable archive.
- Actual context sent to each attempt, including missing values and correction reasons/targets where supplied; recoverable fixed questions/criteria, dependency sets and expected period.
- Requested/returned model, SDK/bridge/mapping/display versions, actual completion/attempt times, available response IDs, native and mapped judgments, distributions, nullable values, usage and accounting state.

Every model-visible field is a dependency, including shared comparison context. Revisions trigger fresh authorized dependency checks rather than blanket invalidation. Source replacement, changed actual context, page/preparation changes or changed analysis definitions invalidate affected findings and active overlays. Stale records show their old scope explicitly without a current agreement/absence claim. A server request fingerprint identifies supplied pixels/context for deduplication; it does not prove that those pixels came from the browser's claimed original or authorize reading that original.

Applicant records remain owner-only, including private drafts and correction workspaces. Publishing a correction never publishes its assistance history. Reviewer results remain staff-only on authorized submitted evidence; assignment controls writes separately. Applicant/staff projections, print, notifications and review activity do not accidentally receive assistance records.

Retain one latest completed run with usable findings per authorized context, expiring seven days after actual completion. A terminal partial run may replace it atomically with its own scope. Failure/cancellation preserves the previous applicable run and expiry. Runs over unsaved edits/prepared files stay in view memory until a matching ordinary Save; assistance never saves financing edits. Persistence failure reports temporary-only availability.

On reopening, including offline, recheck authorization, expiry, source/context and versions. Label a restored record previous live analysis with its original date. Enforce expiry on reads and clean during active use; make no closed-browser background-deletion promise. Clear saved analysis independently of financing data. Clear/reset/relevant edits/sign-out/view exit invalidate pending generations, cancel local work and release temporary resources; late responses cannot restore cleared, superseded or unauthorized records.

Cross-tab messages contain identifiers/revision hints only. Revalidate on commits, activation/focus, use of findings and assessment writes. Preserve unsaved edits and do not let another tab's run redefine the document on screen. An interrupted reload neither resumes nor repeats paid work. Completion metadata cannot replay a lost server answer. Reset or fictional role switching never resets live-service allowance.

### Fixed Saved demonstrations

Bundle only the five accepted [checked captures](evaluation/saved-demonstrations/index.json), analyzed on 2026-10-17 and checked at 2026-10-17T05:01:38.245Z. Preserve `checked-static-capture-v1`, original `candidate-display-v1-dev10`, `evidence-questions-v1`, `full-page-pdfjs-5.4.296-v1`, `jev-1.14.0`, exact bytes/context/manifests, real timestamps and native/mapped outputs. Do not rescore or relabel them with the new provisional defaults.

| Example | Permitted overlay and retained limitation |
| --- | --- |
| Arabic financial summary | Page-1 period only; only pages 1 and 2 usable, pages 3 and 4 unavailable, comparisons suppressed |
| English business evidence | Address only; low printed-name presence and uncertified start-month region remain explicit |
| English stock purchase plan | Budget only; description absent, no equipment-quotation claim |
| English identity evidence | No overlay; name boundary uncertified, no identity-authentication claim |
| English financial summary | Period only; wrong period does not become agreement, incorrect native average/absence findings remain suppressed |

These are four certified static overlays across five examples. Preserve the exact retained finding selection in [Choose release scope and measured display rules](issues/11-choose-release-scope-and-display-rules.md#accepted-saved-demonstrations). An explicit example choice may attach a capture only after matching actual source bytes, task/slot, selected/prepared pages, actual context and applicable versions within the current authorized source context. Otherwise open its own read-only evidence/context, with no findings or boxes on the upload. Preserve original partial coverage, date and Saved demonstration labeling. Offline replay obeys identical rules. Illustrative prototype fixtures cannot substitute for a checked capture.

### Server, accounts, spending and privacy

Keep classic Firebase Hosting and add a second-generation Node 22 HTTPS function in `europe-west1`, 512 MiB, one CPU, zero minimum/one maximum instance, concurrency two and a 55-second timeout. Route the narrow analysis endpoint before the SPA fallback with private, non-cacheable responses. The operator owns a dedicated TypeSafe secret in Secret Manager. Visitors supply neither credentials nor arbitrary questions, prompts, model flags, remote image URLs or provider options.

Verify anonymous Firebase Auth and App Check with reCAPTCHA Enterprise on both routed and direct endpoints before admission. A guest identity is an allowance key, not a verified unique visitor or financing role. Fictional role selection and CORS grant no inference allowance. Maintain operator controls through IAM, with no public quota bypass. Configure Identity Platform anonymous-account cleanup, checking actual terms/quotas; eligibility after 30 days is not guaranteed deletion on that day.

Use the selected `@tanstack/ai@0.69.0` evaluation interface and application-owned adapter over `@typesafe-ai/sdk@0.7.0`, pinned to `jev-1.14.0`. Verify the exact combination before changing versions. Set the server-owned `TypeSafe-Danger-Zone-Images: true` header. TanStack's `decide` interface maps Choice, Score and boolean questions while the isolated adapter adds fixed native Box questions to the same SDK request. Combine native Box capture outside the TanStack-supported answer map; never invent a core Box type. The built-in older TypeSafe adapter is not the selected image/Box integration. Set the SDK retry policy maximum retries to zero. Disable content/debug logging and production devtools transport.

Native answers are authoritative. Preserve fractional Scores, native distributions/Noul probabilities, usage, requested/returned model and nullable Box confidence. TanStack's boolean 0.5 split and rounded Score levels never supply display policy. Invocation captures cannot mix concurrent calls. Unknown required usage fails the affected stage, consumes dispatched allowance and stops further work until accounting is resolved; never manufacture zero.

| Admission control | Limit |
| --- | --- |
| Per guest | One active analysis, one new start per minute, 20 attempts per UTC day |
| Per network address | 60 attempts per UTC day, using trusted ingress and daily keyed identifiers |
| Shared | 100 attempts per UTC day, 1,000 per UTC month |
| Active provider connections / work lease | Two locally across the service / 60 seconds |
| Deadlines | Eight seconds per attempt, 45 seconds server total, 50 seconds browser request, 55 seconds function |

Use server-only transactional Firestore reservations across instances and revisions. Reserve the complete amended run plan, up to nine attempts, atomically. Bind a random run ID to a keyed fingerprint of the actual received images, allowed context and question versions. Concurrent duplicates dispatch once; changed-input ID reuse fails; completed duplicates disclose status without archived-answer replay. Release only definitely unsent reservations. Failed, uncertain, timed-out or malformed dispatched outcomes consume allowance. Expiring a lease or cancelling cannot permit duplicate dispatch or assume a refund. Missing admission/accounting state and the operator disable switch prevent dispatch.

Start cancellation/deadline supervision before copying, hashing, crop work and SDK preprocessing. Cover admission, encoding, durable dispatch marking, transport, mapping and result composition. Refuse new stages without time; recheck cancellation after durable marking and immediately before transport. Keep synchronous crop/encoding work bounded and terminable. Cancellation stops local work where possible, not necessarily remote inference or billing. Distinguish ordinary uncertain verification suppression from stronger access/accounting/resource/deadline stops.

Before any future paid call reconcile the stopped run's two attempts and actual available credit. Enforce cumulative actual pre-feature validation charges plus pessimistic outstanding reservations at most US$1, and reconciled available credit minus reservations at least US$4. Unknown billing prevents new dispatch. Count all failures and unknown outcomes. No purchase, refill, protected-credit use, historical-attempt reset or restart of the halted controller is authorized. The old 200/96 plan grants no remaining collection permission.

For the deployed feature retain the US$5/month TypeSafe and US$5/month Google operating targets, alerts, transactional allowances and disable switch. These are not account-wide guaranteed bill caps. Verify current pinned-model/image access, pricing and actual terms, dedicated-key custody, refill disabled and account cleanup before activation. Use metadata-only operational events. Server source images/context/answers live only in request-local memory, with no archive/cache or object storage.

Retain daily allowance metadata for two UTC days, monthly aggregates until 35 days after that month ends and sanitized application logs for seven days. Expire reads and verify actual cleanup. No filenames, document/application IDs, declarations, answers, images, names, credentials or raw addresses enter allowance records or logs. Provider/platform/auth retention follows its own terms. Explain that Google and TypeSafe process transmitted fictional data; promise neither account-specific zero retention nor processing solely within the function region.

### Dependency order of implementation slices

Create implementation tickets in a separate effort from this accepted planning handoff. These are ordered delivery slices, not new Wayfinder decisions. Ordinary development and CI use dummy credentials and fake transport, preventing external inference.

| Order | Slice and dependencies | Reviewable completion |
| --- | --- | --- |
| 1 | Shared evidence definitions, fixed questions, versioned provisional policy and regression inputs | Capability/task traceability, period-first guards, malformed/null Box isolation and exact source/crop binding exercised with deterministic fixtures; preserve known pilot failures |
| 2 | Browser preparation, resource/cancellation guards and source viewer integration, after 1 | Actual authorized files render to bounded full-page manifests; geometry/orientation/padding and failed preparation cannot misrepresent coverage; ordinary source viewing still works |
| 3 | Browser lifecycle and separate analysis store, after 1 and using 2 | Authorized saved/temporary behavior, expiry/clear/reset, stale/cross-tab/late completions and restored-raster checks pass through the public demo interface with real IndexedDB; finance records survive analysis incompatibility |
| 4 | Reviewer inspection-operation change, independently after 1 | UI and direct operation calls enforce current confirmation or explained unopenable-source replacement; source/resubmission/reassignment invalidation and receipt replay are checked |
| 5 | Server controller, transactional admission, TanStack/native bridge and bound-crop verification, after 1 and 2 | Fake one-page/two-call and four-page/nine-call plans; invocation isolation, native semantics, limits/deadlines, quota races, duplicate handling and stronger stops; no provider secret in client output |
| 6 | Applicant A/reviewer B interaction, provenance, exact Saved-example replay and offline fallback, after 2 through 5 | Functional Arabic/English, narrow-screen, keyboard/screen-reader and private-correction behavior; examples stay distinct from live findings; existing loaded-app offline journey makes zero unintended network requests |
| 7 | Account/deployment setup, focused acceptance and operational activation evidence, after implemented checks above | Reconciled accounting and configured controls, deployed routed/direct authorization and no-content telemetry verified; one bounded smoke report; unresolved/failed behavior disclosed before activation |

Provisioning, operator console steps and credentials remain concrete implementation prerequisites. Complete agent-accessible preparation first, then ask the operator only for actions that require their account access. Passing local/emulator checks does not prove deployed ingress, cleanup or billing behavior. Keep live dispatch disabled while required concrete controls or checks are incomplete.

## Testing Decisions

Use the existing public asynchronous `Demo` interface, constructed by `createDemo`, with real browser IndexedDB as the primary integration seam. The accepted handoff already confirms this boundary. Exercise assistance lifecycle and reviewer operations through that interface, including direct operation calls that bypass screen controls. Keep storage layout and private helper structure out of assertions except where testing compatibility or injecting a deliberate storage fault.

Good tests assert observable findings, source association, allowed actions, persisted results and refused effects. They distinguish deterministic application behavior from provider quality. Use dummy credentials and a fake transport for ordinary development and CI. Do not add a separate seam for each helper or tests that merely reproduce implementation details.

1. Test assistance authorization and lifecycle through the public demo interface. Cover draft and private correction work, staff-only submitted evidence, temporary unsaved runs, matching Save, seven-day expiry, clear, reset, cancellation, changed dependencies, cross-tab refresh and late completions. Verify that assistance does not alter financing records or leak through print, notifications or review activity. Reuse the existing correction, print, session, reset, stale-write and cross-tab API suites.
2. Test inspection enforcement through the existing review-operation seam. Reject absent or stale confirmation, source/detail changes, resubmission and reassignment away and back. Preserve confirmation across unrelated notes after a fresh revision read. Permit the explained unable-to-open Needs replacement exception, reject acceptance through that exception, and preserve receipt replay without duplicate effects. Update valid assessment callers. The [review API suite](../../tests/browser/review.api.spec.ts) already covers permissions, refused effects, revisions, rollback and idempotent receipts.
3. Test assistance-store compatibility through startup and public reads. Corrupt, unavailable or incompatible analysis data must leave valid financing data usable. Interrupted reset cleanup and pending generations must not repopulate results for either dataset. Reuse the [startup screen suite](../../tests/browser/startup.screens.spec.ts) and existing startup/storage fault fixtures.
4. Test browser preparation and source viewing with actual fictional PNG, JPEG and PDF bytes. Assert page coverage, orientation, source/raster hashes, exact geometry, padding exclusion, resize/RTL alignment and reconstruction before restored overlays. Resource failures and cancellation must leave the ordinary source route available and release temporary work. Use focused geometry checks only where they give clearer coverage than the public workflow.
5. Test the fixed display policy with deterministic native-answer fixtures through result composition. Preserve fractional Scores, native distributions, nullable Box confidence and independently valid findings after malformed Box output. Exercise complete-source guards, period-first ordering, missing declarations, conflicts, repetition, exact crop binding and the known misleading pilot regions. Threshold tests establish application behavior, not empirical model accuracy.
6. Test the live controller through its fixed request/result interface, using fake provider transport and transactional admission storage. Cover the true one-page/two-attempt plan and four-page/nine-attempt plan, duplicate and changed-input run IDs, concurrent quota reservations, invocation isolation, usage failures, cancellation/deadline races and release of only definitely unsent reservations. Test stronger authorization, accounting and resource stops separately from ordinary uncertain-highlight suppression.
7. Test applicant layout A and reviewer layout B through the browser. Cover Arabic and English, narrow screens, keyboard operation, screen-reader feedback, source navigation, plain-language findings, optional provenance and exact Saved-demonstration matching. Extend the existing loaded-app offline journey to prove that offline navigation and fallback cause no unintended network requests. Prototype fixture checks provide design evidence only.
8. Verify deployed direct and routed endpoint authorization, App Check, secret isolation, non-cacheable responses, metadata-only telemetry, cleanup and operational controls during the separate implementation effort. Local or emulator success does not establish deployed ingress, provider billing or retention behavior. Run the type, lint, build, API/browser and hosted checks appropriate to the changed code; keep the work focused.

### Focused acceptance and honest limits

The accepted small batch has one shared ten-minute elapsed deadline covering preparation, checks, inspection and reporting. Reserve the final minute for shutdown/reporting; do not start work that cannot finish. Updating this specification consumes zero provider attempts and performs none of that future acceptance batch.

1. Run focused existing offline regressions for malformed/null Box, clipping at the original boundary, competing/repeated values, target/crop mismatch, partial coverage, period ordering, stale results and unavailable stages. Include fake four-page composition and spending/admission stops. Keep ordinary implementation checks focused; do not substitute broad combinatorial testing or synthetic calibration.
2. Only if actual accounting is reconciled and time permits, check at most two known fictional one-page examples, one Arabic and one English. Use at most one combined request plus one bound verification per example, at most four new attempts total including failures/unknowns/captures. No replacements or automatic retries. These are exposed smoke/regression cases, not fresh held-out evaluation. A skipped native check remains skipped.
3. Inspect displayed findings and regions against those actual sources. Record counts of outputs/suppression/failures and preparation/provider/end-to-end timings. Report passes, failures, skips and incomplete work, including zero output. Stop at the deadline. Never chain batches into the retired experiment or restart its controller.

A concrete misleading finding, unsafe region, broken binding, permission leak or spending-control failure blocks that behavior until fixed or explicitly suppressed. Suppression must stay visible and does not prove useful capability coverage. If a problem cannot be addressed within the accepted small scope, report it for a human decision; do not extend collection or silently remove a requested capability.

Desired 95% category/support correctness, 85% readability correctness, 70% useful findings, 60% useful highlights, provider cost below US$0.01/US$0.02 per one/four-page run and 12/35-second p95 remain unverified goals. This handoff requires no full statistical benchmark, calibration selection or participant study. Broad bilingual accuracy, calibration, harm frequency, all slot/outcome behavior, native four-page reliability, deployed/mobile p95 and measured human speed/success remain unverified. Concrete authorization, privacy, retention, spending, resource, freshness and operational controls still require implementation and focused checking.

## Out of Scope

- Application implementation, new implementation tickets, paid inference, account changes, provisioning, deployment or live activation during this specification update. Those belong to the separate implementation effort.
- Real lending, identity authentication, credit scoring, bank integrations, payment processing or production use of real applicant documents. This remains a fictional financing demo.
- Identity-number or expiry checks, itemized quotation analysis and new document tasks beyond the accepted four slots.
- Autonomous document acceptance, completed review checks, correction requests or final financing decisions. Assistance does not author reviewer reasons, transcribe fields or fill forms.
- Replacing deterministic normalization, reporting periods, averages, whole-rial arithmetic, product rules or permission checks with model judgments.
- A separate AI playground, arbitrary visitor prompts/questions/models, visitor-supplied provider credentials or a general-purpose provider abstraction.
- Automatic inference on upload, reload, navigation or language change; automatic retries, hidden repair calls, fallback models or model-directed loops.
- A per-highlight human-confirmation step. Ordinary source inspection and assessment-bound inspection confirmation remain required.
- Expanding correction permissions, publishing private assistance history or making assistance a prerequisite for otherwise permitted financing work.
- A server archive of visitor documents, context or answers; durable storage of prepared visitor images; or promises of closed-browser deletion, fresh offline startup, account-specific zero retention or processing solely within the function region.
- Rescoring the five checked Saved demonstrations, passing illustrative fixtures off as provider captures, or drawing an unmatched example on a visitor's evidence.
- Restarting the halted controller, completing the retired 200/96 proposal, selecting calibrated thresholds, recreating the 296-attempt experiment through short batches, or adding full statistical validation or a participant study.
- Claims of representative bilingual accuracy, calibrated confidence, broad highlight safety, native four-page reliability, deployed/mobile p95 or measured human time savings without evidence.
- Purchasing or refilling credit, using protected credit, resetting historical attempts or treating operating targets as guaranteed account-wide bill caps.

## Further Notes

### Authority and handoff

This file restates the accepted implementation contract in the to-spec format. The linked decision answers hold the rationale. [Decide release from selection-bound validation results](issues/23-decide-release-from-selection-bound-validation-results.md#answer) takes precedence over earlier statistical-validation and Saved-only requirements. It accepts `release-display-v2-experimental`, `provisional-display-defaults-v1` and one ten-minute smoke batch. The retired 296-attempt protocol, numerical selector, five-family eligibility and signed experiment freezes are historical artifacts. Do not recreate them as feature prerequisites or user flows.

The user accepted this specification and requested closure of the handoff and map on 2026-10-17. That acceptance settles this planning effort. It does not establish implemented behavior, enable live dispatch or authorize deployment. Implementation belongs to a separate effort using the accepted module organization, browser compatibility approach and delivery order in Implementation Decisions.

### What has been measured

| Evidence | Observation | What it does not establish |
| --- | --- | --- |
| [Interface prototype](prototype-review.md) | Fixture checks in both languages, all 31 scenarios/all layouts at 390px applicant and 1440px reviewer, keyboard checks, four inspected screenshots; prototype TypeScript/ESLint passed | Real inference, source geometry, persistence, authority, screen-reader behavior or human time savings |
| [Original capped pilot](evaluation/report.md) | 20 attempts across eight source documents and a repeated probe; 17 mapped stages, three unavailable from invalid Box geometry; 12 admitted regions included four certified, five visibly misleading and three uncertified boundary cases | Safe automatic highlights, representative bilingual quality, full four-image comparison fit or production behavior |
| [Stopped later native run](selection-bound-execution/results/report.md) | One Arabic identity case, two successful pinned-model calls, combined page plus bound verification; total local time 4.535 seconds | Independently adjudicated correctness or containment, English performance, representative p95 or reconciled charges |
| [Offline repairs and controls](issues/20-bind-validation-freezes-and-improve-selector-capacity-offline.md#answer) | Recorded zero-call regression and exact algorithm replay evidence; useful source/crop/deadline/financial control references | Production implementation or model-quality evidence; the retired selector/freezes are not feature requirements |
| [Checked Saved demonstrations](evaluation/saved-demonstrations/index.json) | Five fixed real captures, four individually checked static overlays and explicit limitations | New live analysis, matching an arbitrary upload or broad quality claims |

The stopped ledger preserves two completed unreconciled attempts and 294 unrun proposal slots; all 568 historical numerical cells remain unset, without completed development selection or final evaluation freeze. Exact usage, account balance, and billing details remain in local-only records and are omitted from this repository. Do not infer current balance or actual charges from token estimates. Preserve all captures, ledgers, failures, and historical policy versions.

### Handoff completion

The final review accepted this specification's module responsibilities, separate analysis-store compatibility approach, inspection-operation change, delivery order and traceability under the already accepted experimental scope. No additional in-scope planning decision remains.

The resolution is recorded in [Confirm the specification and implementation handoff](issues/09-confirm-specification-and-implementation-handoff.md#answer). All child tickets are resolved and the map is closed. Implementation, the bounded acceptance batch and activation evidence remain the separate effort described above.
