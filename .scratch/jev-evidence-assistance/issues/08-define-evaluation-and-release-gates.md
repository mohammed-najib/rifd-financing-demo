# Define evidence quality and workflow acceptance gates

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Assignee: the operator
Parent: [Plan thoughtful Jev evidence assistance](../map.md)
Blocked by: 01, 05, 07

## Question

What evidence will establish that each requested capability helps its chosen task, and which failures should block the demo's release or require a narrower behavior?

Define the fictional Arabic/English evaluation corpus, independent expected answers, document categories and negative cases, page coverage, absent targets, unreadable images, wrong or conflicting evidence and misleading document text. Choose task-specific quality measures, harmful false-positive treatment and human usability checks. Validate the category outcomes, readability levels, per-field comparison outcomes and presence/location safeguards agreed in [Define useful applicant and reviewer assistance](04-define-assistance-tasks-and-workflows.md#answer). Separate model accuracy from deterministic integration tests, UI tests and saved-demonstration coverage. Decide how thresholds will be measured, how source and question versions make results reproducible, and what latency and cost budgets are acceptable. Include freshness, privacy, access limits, service failure and offline acceptance. Determine which empirical experiment must happen before the specification is ready, with explicit scope and cost, rather than assuming published example performance transfers to this model and corpus.

Resolve with the user using grilling and domain-modeling. If missing measurement prevents a decision, create a bounded research or task ticket and keep unresolved claims explicit.

Validate the [selected service contract](05-choose-live-service-and-spending-policy.md#answer), including the TanStack AI/TypeSafe SDK bridge, native and mapped probability semantics, request-local Box capture, numeric-versus-unknown usage, nullable confidence, one-call batching and invocation isolation. Check four-page/five-attempt bounds, actual context fit with fixed questions and images, eight-second provider and 45-second server deadlines, browser preparation/decoded-resource bounds, and actual cost against the spending targets. Separate proposed timeout ceilings from measured latency goals.

Cover server admission and direct endpoint verification, recreated guest identities, trustworthy network keys, transactional quota races, full-run reservations, duplicate suppression, lease expiry and cancellation without assumed remote cancellation. Verify the no-archive retention contract, cleanup behavior and absence of evidence in application logs, lifecycle events or production devtools/telemetry. Model/image access, billing/refill settings and account-specific terms remain launch prerequisites, not established facts. Scope any paid measurement or human-only account setup as a separate bounded task when needed to settle this decision.

Validate the [result lifecycle and provenance contract](06-define-result-lifecycle-and-provenance.md#answer), including dependencies on all model-visible context, missing-to-complete edits, effective-period changes, partial-run replacement without merging and restored-raster checks. Cover applicant/staff separation, private-workspace publication, unsaved-result persistence, seven-day expiry, clear/reset and late-result races, cross-tab revalidation and interrupted recovery without automatic dispatch. Verify source-inspection confirmation at the review-operation boundary and the unopenable-source exception. Define the bounded capture and checking work needed for real saved demonstrations, their exact-match and mismatch behavior, and the separate labelling of illustrative fixtures.

Use the limits from [Verify the Jev model and SDK contract](01-verify-jev-model-and-sdk-contract.md) and the accepted behavior from [Validate the applicant and reviewer assistance experience](07-prototype-evidence-assistance-experience.md).

Evaluate the [accepted interface](07-prototype-evidence-assistance-experience.md#answer): A for applicants, B for reviewers, plain-language findings and model details only in explicitly opened provenance. Test whether applicants understand the next permitted correction and whether reviewers reach the relevant source, recognize partial or uncertain evidence and retain control of their own assessment. Include Arabic/English, narrow screens, keyboard and screen-reader use. Do not treat the prototype's scripted outputs, browser checks or invented confidence numbers as model-quality or measured usability evidence.

## Comments

### Round 1 confirmed on 2026-10-17

The user answered "Yes to all" to these starting decisions. The ticket remains claimed while experiment scope, budgets, numerical acceptance targets and human usability checks are settled.

- Require zero observed falsely reassuring matches, misleading highlights, concealed conflicts or claims beyond checked pages in the release set. A failure blocks the affected behavior until corrected or narrowed and retested. Privacy leaks, unauthorized actions and quota bypasses block release outright. Zero observed errors describes the evaluated set and is not a guarantee about future accuracy.
- Start with 80 fictional document cases, 40 primarily Arabic and 40 primarily English, balanced across the four document slots. Include clear evidence, wrong categories, unreadability, absent targets, repeated values, conflicting pages and misleading instructions inside documents. Expected answers are human-checked before viewing model outputs. Use 40 development cases and 40 held-out cases, keeping related document variants in the same split. Report results separately by task and language.
- Require a bounded real-model experiment before specification handoff. It must demonstrate useful roles for image input, Choice, Score, Noul and Box, verify the TanStack bridge and actual image/context fit, and measure latency and cost. Display thresholds come from those results. This round establishes the prerequisite; its execution scope and spending limit remain undecided.

### Round 2 decisions on 2026-10-17

The user accepted the recommended model-quality and performance targets, replaced the proposed 500-attempt scope with "only 10 attempts for the 80 cases plus 10 development probes", and declined the observed participant study.

- Proposed model-quality gates are accepted, separately for Arabic and English: at least 95% correctness among displayed category and per-field findings, at least 85% correct three-level readability findings, useful findings on at least 70% of clear answerable cases, and useful highlights on at least 60% of clear uniquely located targets. The previously accepted zero-harm rules override these percentages. Report denominators, errors and abstentions. A useful highlight identifies the correct page and target, contains the relevant detail and avoids a competing value.
- The paid experiment has a hard maximum of 20 dispatched provider attempts, partitioned into at most 10 evaluation attempts and at most 10 development probes. Failed or uncertain dispatches count. The proposed 500-attempt scope is rejected. Retain the proposed US$2 spending target alongside the much tighter attempt bound. No inference has been executed.
- Performance goals are accepted: 95th-percentile completion within 12 seconds for one page and 35 seconds for four pages, including preparation and result presentation; provider cost below US$0.01 and US$0.02 respectively. Cold/warm behavior must be distinguished. Existing timeout ceilings remain unchanged. Production latency and Google costs remain launch checks, and local measurements cannot establish them.
- No observed participant study is required. Remove the proposed six-person study, five-of-six task-success criterion and 20% reviewer speed-improvement gate. The accepted interface still requires functional bilingual, responsive, keyboard and screen-reader verification. Do not claim measured human task success or faster review without evidence.

The reduced paid budget cannot evaluate all 80 distinct document cases under the accepted one-page-call plus optional document-comparison plan. A single-page document with both stages requires two attempts, and a four-page run can require five. The next round must settle which corpus subset is measured and which quality, threshold and performance claims remain unestablished. Never compress unrelated document cases into a request to imply coverage that did not occur.

### Capped experiment and completed decision confirmed on 2026-10-17

The user answered "I accept your recommendation" to the revised feasibility experiment: ten development attempts for one four-page run, two single-page runs and one extra probe; ten evaluation attempts for five held-out single-page runs; coverage of all four slots and both languages across the planned sample; an 80-case corpus with unrun cases marked; a US$2 spending target; and no claim that the small sample establishes full-corpus quality or representative p95 performance. The user accepted a follow-up decision on release scope and display thresholds after the experiment. This completes the evaluation-policy decision. No participant study is required.

## Answer

Resolved on 2026-10-17 through live grilling with the user, using wayfinder, TypeSafe, domain-modeling and unslop. The final capped plan supersedes the proposed 500-attempt experiment and participant-study requirements. This answer defines the evaluation policy and prerequisites. It does not report measured model quality or approve release.

### Corpus and independent expectations

Prepare 80 fictional document cases, 40 primarily Arabic and 40 primarily English, with ten cases per document slot per primary language. Include both stock plans and equipment quotations within purchase evidence, and mixed-script text and digit styles where relevant. Use the actual frozen evidence bytes and declared context, not evidence regenerated from the current declaration.

Split 40 development and 40 held-out cases, balancing slots and languages and keeping related source families, translations and altered variants together. Write independent expected answers and have them human-checked before viewing model outputs. Record apparent category, per-page readability, each relevant field's evidence-support outcome, target presence/multiplicity, page scope and expected evidence regions. The [workflow criteria](04-define-assistance-tasks-and-workflows.md#capability-roles-and-result-criteria) remain authoritative, including all eight category outcomes, all three readability levels and all five support outcomes.

The corpus includes clear evidence, wrong-slot and unrelated documents, mixed content, blank or unreadable images, absent targets, a different printed value, repeated and conflicting entries, unexpected financial periods, misleading instructions embedded in evidence, rotated/padded pages and multipage evidence with failed or unchecked scope. Expected outcomes distinguish unreadable evidence, unavailable analysis and absence. A different printed name can establish a mismatch while the name region is present.

The corpus is a versioned test asset, not a statement that every case was run through Jev. Keep a per-case manifest distinguishing development, held-out, dispatched, successful, failed and unrun work. Multiple judgments on one document are not independent document cases. Related variants cannot be split to inflate apparent generalization.

### Quality targets and harmful findings

| Measure | Accepted target |
| --- | --- |
| Correct displayed category findings | At least 95%, separately by language |
| Correct displayed per-field support findings | At least 95%, separately by language and reported separately from category |
| Correct three-level readability findings | At least 85%, separately by language |
| Clear, answerable cases receiving a useful finding | At least 70%, separately by language and task |
| Clear, uniquely located targets receiving a useful highlight | At least 60%, separately by language |

Report actual numerators and denominators, raw judgment errors, displayed errors, uncertainty/abstentions, unavailable stages and useful coverage. Compare outcomes against the independent expectations, not the model's confidence. A fallback earns no correct decisive answer on a clear answerable case; valid uncertainty on an ambiguous case is reported separately. Suppressing all outputs cannot satisfy useful coverage. Readability accuracy compares the displayed descriptive level with its independent label; retain the native fractional Score and distribution in provenance.

A useful highlight identifies the correct page and target, contains the relevant detail and avoids a competing value. Measure target presence separately from location. Report correct target/page association, region containment and suppressed or misleading overlays; coordinates alone are never a positive finding. Repeated or ambiguous targets, invalid geometry, padding or an unverified restored raster cannot justify an overlay. Box confidence is nullable and is not an independent presence test.

Require zero observed falsely reassuring matches, misleading highlights, concealed conflicts or claims beyond checked pages in the applicable release set. A falsely reassuring readability result belongs to this rule too. A failure blocks the affected behavior until corrected or narrowed and retested. Privacy leaks, unauthorized actions and quota bypasses block release outright. Zero observed failures describes the tested set and is not a guarantee about future evidence.

Numerical probability/confidence cutoffs and the exact Score-to-wording policy are not yet established. Select candidate rules from development results and freeze questions and policy versions before held-out evaluation. Do not tune on held-out failures and call the same set fresh validation. The follow-up decision must settle display rules or preserve the affected behavior as unverified. Small or empty cells cannot pass a gate by omission.

### Bounded experiment before specification handoff

The user requires a feasibility experiment before handoff, with at most 20 dispatched provider attempts, split into ten development and ten evaluation attempts. Keep the US$2 TypeSafe spending target. Every dispatched failure or uncertain outcome consumes an attempt. Unknown accounting stops further paid work; retries, repair calls and saved-example captures receive no extra allowance.

| Phase | Planned work | Maximum attempts |
| --- | --- | --- |
| Development | One four-page run, including its comparison stage | 5 |
| Development | Two single-page runs, each including its comparison stage | 4 |
| Development | One extra development page probe | 1 |
| Evaluation | Five held-out single-page runs, each including its comparison stage | 10 |

Use an isolated local experiment with the accepted model, SDK and TanStack bridge. Exercise all four slots and both languages across eight complete planned runs and one probe. The task roster covers each slot/language pairing across development and evaluation, without implying held-out coverage for every pairing. The remaining corpus cases stay explicitly unrun. Failure, unavailable access or a budget stop can leave fewer completed observations; the plan never authorizes replacement calls beyond the caps.

Verify actual image/context fit with the fixed questions and allowed full-page images, including the four-page comparison and maximum actual target/question composition. Pixel limits alone cannot establish token fit. Do not enable long context, combine unrelated documents into a request, silently crop, omit failed pages or shrink the task to claim success. Account/model/image access, terms, credits and disabled refill must be checked before execution. No new top-up, account purchase, cloud provisioning or deployed integration is included.

Record source-byte and raster hashes, page/preparation manifests, actual supplied context, expected answers, split and roster, question definitions and model/SDK/TanStack/mapping/display-policy versions. Preserve requested and returned model, real timestamps, available response identifiers, native and mapped outputs, usage and stage failures. Pin the manifest and candidate policy before revealing held-out results. Reproducibility means recoverable inputs and definitions, not guaranteed identical future inference.

### Timing and cost

| Run size | Accepted p95 completion goal | Provider-cost target per run |
| --- | --- | --- |
| One page | Within 12 seconds | Below US$0.01 |
| Four pages | Within 35 seconds | Below US$0.02 |

Completion timing includes preparation through result presentation. Record preparation, provider and run timings, page count, environment and cold/warm behavior separately. The existing ceilings remain eight seconds per provider attempt, 45 seconds per server run, 50 seconds per browser request and 55 seconds per function, with separate preparation bounds. Deadline enforcement is a deterministic contract, not proof that a latency goal passed.

The small pilot cannot establish representative p95 performance, especially with one planned four-page run. Report individual observations and any descriptive percentile with its sample size. Local timing does not establish deployed or mobile performance. Use numeric reported usage and current account pricing for observed provider cost, reconcile available billing evidence and retain uncertainty for failed or unreported charges. Never count unknown usage as zero. The existing US$5 TypeSafe and US$5 Google monthly operating targets remain launch checks, not guaranteed bill caps. Google and production performance are not measured by this local task.

### Separate verification layers

Model-quality evidence comes only from actual inference over independently labelled evidence. Fake transport, scripted interface fixtures and saved-demonstration replay cannot establish it. Required deterministic checks enforce the already accepted contracts below; they are implementation and launch work, not additional paid calls in the feasibility experiment.

| Layer | Required passing behavior |
| --- | --- |
| Bridge and parsing | One native request per adapter invocation; supported TanStack mappings plus isolated request-local Box capture; concurrent calls cannot mix outputs. Preserve native distributions, fractional Scores, Noul probability and nullable confidence. Unknown usage makes the affected stage unavailable without fabricating zero. Validate malformed answers and geometry. No SDK retries, content-bearing lifecycle events or production devtools transport. |
| Preparation and scope | Enforce compressed-byte, decoded-pixel, side, PDF-page, selected-page, PNG, combined-image, body/context, question/target and time bounds from the service contract. Check source orientation, full-page rendering, padding, disposal and mobile resource behavior. Four selected pages require at most five attempts. Context overflow is unavailable work, not a silent scope change. |
| Admission and spending | Verify Auth and App Check on both routed and direct endpoints; role/browser state grants no quota. Test recreated guests, trustworthy ingress-derived network keys, transactional races and full-run reservations. Duplicates, changed-input ID reuse, lease expiry, unknown dispatch, cancellation and disconnects cannot cause double dispatch or assumed refunds. Missing accounting/admission fails closed; the disable switch works. |
| Applicability and retention | Check all actual model-visible dependencies, including missing-to-complete edits and shared comparison context; effective reporting periods; source/revision/version changes; and exact restored rasters. Replace partial runs atomically without merging. Enforce applicant/staff separation, private correction handoff, unsaved-result persistence, seven-day expiry, clear/reset, late-result suppression, reassignment, cross-tab revalidation and interrupted recovery without automatic inference or server answer replay. |
| Source inspection and interface | Verify applicant layout A and reviewer layout B, plain-language findings and explicitly opened provenance in both languages, narrow screens, keyboard and screen-reader operation. Assessment writes require current explicit inspection confirmation at the review-operation boundary, independent of AI. An unopenable source permits explained replacement, never acceptance from AI. Correction locks, manual work, failure/offline states and limited coverage remain usable. |
| Privacy and operations | Inspect requests, errors, logs, lifecycle events, telemetry and stored records for forbidden evidence content and credentials. The server retains no source/context/answer archive. Check metadata expiry and actual cleanup against the service contract, distinguishing application logs from platform/provider retention. Account access, billing/refill terms, alerts, cleanup, deployed quotas, production cost and operational readiness remain launch prerequisites. |

Use fake provider transport and dummy credentials for ordinary local/CI checks, with external inference prevented. Check the real deployed authorization and ingress boundary before public live release; emulator success alone is insufficient. Every required check remains pending until its evidence exists. Do not treat this planning resolution or the earlier prototype browser checks as implementation verification.

### Saved demonstrations and usability

Capture only real outputs already produced within the twenty-attempt experiment. Check them against frozen fictional sources and independent expectations; retain actual failures and limitations. Saved demonstrations need recoverable source/context/preparation/question/model/native/mapped provenance and original dates. Capture/checking failures authorize no extra inference. Missing real captures remain a missing prerequisite; fixtures retain the label Illustrative example.

Verify explicit example choice and exact matching before attaching a capture to current evidence. Source, context, page/preparation or version mismatch must show a separate example with its own evidence and no overlay on the upload. Test unavailable reconstructed rasters, offline replay and original partial scope. Bundled fictional captures are versioned example assets, distinct from visitor analysis storage and a production answer archive.

The user declined an observed participant study. No participant-count, five-of-six success or 20% review-speed gate remains. Functional bilingual, responsive, keyboard and screen-reader checks still apply. Applicant correction speed, reviewer time savings and human task success remain intended benefits rather than measured claims.

### Remaining route

- [Run capped Jev feasibility evaluation](10-run-capped-jev-feasibility-evaluation.md) records the bounded empirical work and checked captures. It is a task, not release approval.
- [Choose release scope and measured display rules](11-choose-release-scope-and-display-rules.md) uses those observations with the user to settle final display policy, supported release scope and any necessary additional bounded work. The budget reduction does not silently waive unmeasured quality or performance gates or the requirement for all five capabilities to earn useful evaluated roles.
- [Confirm the specification and implementation handoff](09-confirm-specification-and-implementation-handoff.md) remains blocked by that work. It must distinguish accepted targets, actual observations and implementation/launch checks still pending. This map is not complete merely because this policy ticket is resolved.

No inference call, experiment execution, application implementation, dependency change, provisioning or deployment was performed in this session.
