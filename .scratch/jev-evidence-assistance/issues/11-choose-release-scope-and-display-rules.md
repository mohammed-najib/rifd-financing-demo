# Choose release scope and measured display rules

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Assignee: the operator
Parent: [Plan thoughtful Jev evidence assistance](../map.md)
Blocked by: 08, 10

## Question

Given the actual observations and unmeasured cases from [Run capped Jev feasibility evaluation](10-run-capped-jev-feasibility-evaluation.md), which evidence-assistance behaviors can the specification carry forward, and which display rules or narrower scope must be agreed before handoff?

Resolve with the user using grilling, domain-modeling and TypeSafe. Apply the quality, performance, zero-harm and evidence limits in [Define evidence quality and workflow acceptance gates](08-define-evaluation-and-release-gates.md#answer). Do not substitute desired thresholds for measured results or treat the 80-case corpus as evaluated.

- Decide task-specific category, readability, per-field comparison and presence/multiplicity/Box display rules using the native semantics and actual development observations. Preserve uncertainty, unavailable stages and partial coverage. Explain how nullable Box confidence affects overlay eligibility. Freeze explicit policy versions. Do not use TanStack's boolean split as a product threshold by default.
- Compare observed errors and useful coverage against the accepted targets by language and task. Report small or missing denominators, including the five-document held-out scope, rather than claiming calibrated or general reliability. Any harmful finding requires correction or a narrower behavior and retesting. No participant study, participant success percentage or reviewer speed-improvement requirement is to be reinstated.
- Decide what remaining evidence blocks release or requires narrower behavior. The current budget cannot establish full-corpus accuracy or representative p95 performance. Do not silently relax those gates, authorize more inference or count deterministic tests as model-quality evidence. A necessary additional experiment needs its own explicit bounded task and user decision.
- Establish a useful evaluated role for image input, Choice, Score, Noul and Box. If a role fails or remains unmeasured, decide a viable next step with the user. Permanently removing a required capability, either audience or either language changes the destination and cannot silently complete this map.
- Decide which checked real captures can be Saved demonstrations, with their actual scope, dates and matching conditions. Missing captures cannot be replaced by scripted outputs carrying that label.
- Carry forward the unchanged service, lifecycle and interface contracts and the required deterministic and launch checks. Local experiment success does not establish deployed authorization, retention, latency, Google costs or human task performance.

Resolve with explicit accepted behaviors and display-policy definitions, the evidence supporting them, any remaining blocked gates and newly necessary tickets. Specification handoff remains blocked until these decisions are settled. Keep empirical detail in the experiment's report and link it from the resolution.

## Comments

### Release direction and saved demonstrations accepted on 2026-10-17

The user answered "I accept your recommendations" to both opening decisions.

- Preserve the full live-assistance destination, including both audiences, Arabic and English, and useful roles for image input, Choice, Score, Noul and Box. Live release remains blocked under the existing quality, coverage, performance and launch gates. Define targeted repair and revalidation as separately bounded follow-up work. This acceptance authorizes no additional inference.
- Accept the five existing checked captures as Saved demonstrations: Arabic financial evidence and English business, purchase, identity and financial evidence. Only the four individually certified overlays may be displayed. Retain original analysis dates, suppressed findings and partial coverage. Changed inputs open a separate example under the existing exact-match rules.

The ticket remains claimed. Task-specific display policies, nullable Box confidence and the precise follow-up work still need decisions. The accepted direction is not approval to implement, deploy or enable live analysis.

### Display restrictions and offline follow-up accepted on 2026-10-17

The user again answered "I accept your recommendations", accepting the complete second round. Freeze release-display-v1 with live dispatch disabled, retain candidate thresholds as experimental, and accept only the existing checked-static-capture-v1 Saved demonstration selection. Preserve null Box confidence without using it to establish overlay eligibility or failing unrelated valid judgments. Unresolved Arabic comparisons and unreadable/partially readable wording remain undetermined. Model numbers stay in provenance.

The user accepted a separate offline repair task, followed by a dependent live decision on the revised candidate policy and a precisely bounded revalidation experiment. This completes the current scope/display decision. Specification handoff remains blocked by that follow-up, and no additional paid calls are authorized.

## Answer

Resolved on 2026-10-17 through live grilling with the user, using wayfinder, TypeSafe, domain-modeling and unslop. The user accepted both rounds. This is a planning resolution, not an implemented policy, deployment or live-release approval. Empirical detail remains in the [capped evaluation report](../evaluation/report.md).

### Destination and release boundary

Preserve applicants and reviewers, Arabic and English, on-demand live requests to jev-1.14.0 and useful evaluated roles for image input, Choice, Score, Noul and Box. Fixed Saved demonstrations are accepted as a fallback. They do not complete the destination or establish safe live behavior.

Live dispatch remains disabled. The existing model-quality, useful-coverage, zero-harm, performance, cost and operational gates remain release blockers. Failed or missing evidence is not a waiver. The original 20-attempt experiment is exhausted; no additional inference, automatic retry, capture, purchase or deployment is authorized here.

### Evidence supporting this boundary

The experiment used eight distinct source documents, including five held-out single-page documents, plus a repeated development probe. Seventy-two of the 80 corpus cases remain unrun. Multiple target judgments on one document are not independent document cases. The following descriptive counts exclude the repeated probe.

| Task | Arabic observation | English observation | Decision against the accepted target |
| --- | --- | --- | --- |
| Category | 2/2 displayed findings correct | 4/4 displayed findings correct | These tiny displayed sets do not establish the 95% gate or 70% useful coverage across answerable cases. |
| Readability | 4/4 displayed clear descriptions correct | 4/4 displayed clear descriptions correct | Only clear wording was admitted. The 85% three-level gate and 70% useful coverage remain unestablished. |
| Per-field support | No displayed comparisons | 6/6 displayed comparisons correct | Arabic usefulness is absent under this candidate. English has only one displayed held-out comparison. The 95% correctness and 70% useful-coverage gates remain unestablished. |
| Highlights | 1/16 clear unique targets certified useful | 3/8 clear unique targets certified useful | Both observations are below the 60% useful-highlight target. Five admitted proposals were visibly misleading, failing the overriding zero-harm gate. |

Twelve overlays were admitted in total: four certified useful, five visibly misleading and three uncertified boundary cases. Do not describe all eight uncertified proposals as visibly misleading. Held-out highlight coverage was 1/7 clear unique targets. The repeated-name failure passed presence and single-occurrence checks despite incompatible printed names. High confidence therefore did not establish safe location or uniqueness.

Raw comparison errors included incomplete-scope agreement, wrong-period averages labelled absent and absence claimed on unreadable evidence. The frozen scope, readability and reporting-period guards suppressed those findings. All 20 native responses returned, but three Box-validation failures made stages unavailable; the four-page financial comparison received only two images. Full four-image provider context fit remains unmeasured.

Local timing and low reported token cost do not establish representative p95 completion, deployed/mobile performance, reconciled billing or Google cost. Keep the accepted one-page/four-page p95 goals of 12/35 seconds and provider-cost targets below US$0.01/US$0.02. No participant study, participant success percentage or reviewer speed-improvement gate is reinstated.

### Frozen display policies

This answer defines release-display-v1. Its live mode is disabled. Its Saved demonstration mode uses only the fixed checked-static-capture-v1 selection described below. The original candidate-display-v1-dev10 and evidence-questions-v1 remain immutable historical experiment definitions. None of their thresholds is promoted to a validated live threshold.

| Judgment | Retained experimental rule | Current display restriction |
| --- | --- | --- |
| Category Choice | Available page, specific selected category and native confidence at least 0.99 in either language. Cannot determine is abstention. | Only checked findings already retained in the accepted Saved demonstrations. No new live category finding is authorized. |
| Readability Score | Clear wording requires P(level 2) at least 0.80 Arabic or 0.93 English. Other descriptive-level rules were not established. | Retain checked clear descriptions in the fixed examples. Unreadable/partially readable wording remains unverified. A suppressed finding does not assert that the evidence is unreadable. Preserve fractional Score, distribution and confidence in provenance; do not convert Score to a correctness percentage. |
| Per-field support Choice | English native confidence floors are 1.00 consistent, 0.92 different and 0.76 not found, with usable complete selected-page scope and category/period guards. Arabic comparisons and unobserved decisive outcomes have no established display rule. | Retain only the checked findings in the fixed examples. No new decisive Arabic comparisons or invented conflict/absence thresholds. Missing declarations, uncertainty and unavailable work remain distinct. Financial averages cannot establish agreement for a required period without a qualifying period finding. |
| Presence Noul | Candidate presence floors are 0.94 Arabic and 0.99 English. | Presence concerns a named field/target, independently of agreement with its declared value. Preserve native probability; TanStack's 0.5 boolean split is not a product threshold. Presence alone cannot authorize a highlight or support claim. |
| Multiplicity Choice and Box | Candidate single-occurrence floors are 0.83 Arabic and 0.84 English, alongside selected single, clear readability, compatible category and valid geometry. No numeric Box-confidence cutoff was established. | This gate failed. Only the four individually certified static overlays are accepted. The candidate cannot authorize a new overlay, including a high-confidence one. Revised containment, repetition and conflict safeguards require separate validation. |

All findings retain document, page, target/field and actual successful scope. Failed, unreadable or unchecked pages cannot establish agreement or absence. Keep conflicting entries and partial coverage visible; do not combine separate partial runs into apparent complete evidence. Uncertain results, unavailable analysis and not found in usable checked pages remain different outcomes. Plain-language findings belong in the workflow; model terminology and numeric judgments belong in explicitly opened provenance.

Preserve nullable Box confidence as null. Do not substitute zero, infer target absence or manufacture a confidence cutoff. Null alone cannot invalidate independently valid category, readability or presence findings. It supplies no positive evidence of containment or correctness. All current certified static boxes had numeric confidence; the experiment's synthetic null checks do not establish live null-confidence overlay safety. Any future numeric confidence gate must treat null as unknown, not as passing that gate.

An invalid Box must not discard otherwise valid judgments solely because location failed. That repair is accepted for the isolated follow-up, but its implementation and checks have not been completed. Stage-wide failures still follow the service contract. No broader replacement live policy or new empirical cutoff is approved by this resolution.

### Accepted Saved demonstrations

Accept the five [checked bundles](../evaluation/saved-demonstrations/index.json), all analyzed on 2026-10-17 and checked at 2026-10-17T05:01:38.245Z. Preserve each bundle's actual per-stage timestamps, source/raster/context hashes, requested and returned model, question/preparation/policy versions, raw captured outputs and limitations. Their source selection is checked-static-capture-v1 over candidate-display-v1-dev10, with evidence-questions-v1, full-page-pdfjs-5.4.296-v1 and jev-1.14.0.

| Fixed example | Retained findings and permitted overlay | Required limitation |
| --- | --- | --- |
| [Arabic financial summary](../evaluation/saved-demonstrations/ar-financial-01.json) | Page 1 financial category; pages 1 and 2 clear readability; page 1 reporting-period overlay only. | Pages 3 and 4 unavailable. Comparison saw only pages 1 and 2. All comparisons remain suppressed; no complete-document match or tested full-document conflict handling. |
| [English business evidence](../evaluation/saved-demonstrations/en-business-02.json) | Business category, clear readability, business name different, address/start month consistent; address overlay only. | Printed business-name presence was 0.41, so it has no overlay. Start-month overlay is uncertified and remains suppressed. |
| [English stock purchase plan](../evaluation/saved-demonstrations/en-purchase-03.json) | Stock category, clear readability, description not found and budget consistent; budget overlay only. | Description is absent. This example does not establish equipment-quotation behavior. |
| [English identity evidence](../evaluation/saved-demonstrations/en-identity-10.json) | Identity category, clear readability and name consistent; no overlay. | Name Box is uncertified. The finding is not identity authentication. |
| [English financial summary](../evaluation/saved-demonstrations/en-financial-10.json) | Financial category, clear readability and reporting-period overlay only. | Printed April-June differs from required July-September. All comparisons remain suppressed, including incorrect native not-found average outcomes. A period location does not assert period agreement. |

This is permission to carry these fixed examples into the specification, not a claim that they are installed or published. Apply the existing [lifecycle and exact-match contract](06-define-result-lifecycle-and-provenance.md#answer): replay requires an explicit choice and exact matching of evidence bytes, prepared input, task/slot, selected pages, model-visible context and applicable versions, within the current authorized workspace. Otherwise open the example separately with its own evidence and context. Never put its findings or boxes on a changed upload or claim fresh analysis. Keep Saved demonstration and its original analysis date visible. Scripted outputs remain Illustrative examples. Do not generate missing captures or substitute scripted success.

### Capability roles and unchanged contracts

Image input supplied the actual full-page evidence for real judgments. Choice produced checked category and per-field examples, including English disagreement and absence. Score produced the checked clear-readability descriptions. Noul supplied independent target-presence probabilities and withheld absent/uncertain locations in the fixed examples. Box supplied the four source-checked locations above. These are useful evaluated roles within those examples, not evidence that the broader live roles pass their gates. Missing Arabic comparison rules, non-clear readability rules and unsafe new highlights remain explicit work toward the unchanged destination.

Carry forward the [service contract](05-choose-live-service-and-spending-policy.md#answer), [lifecycle contract](06-define-result-lifecycle-and-provenance.md#answer), [accepted interface](07-prototype-evidence-assistance-experience.md#answer) and [acceptance gates](08-define-evaluation-and-release-gates.md#answer). Preserve the TanStack/TypeSafe bridge, server-owned fixed questions and credentials, preparation and attempt bounds, explicit retries, scoped partial results, private applicant correction workspace, reviewer visibility and source-inspection confirmation. Findings remain advisory and cannot change application status or record a human assessment.

The local experiment does not pass deployed Auth/App Check or direct-endpoint checks, transactional admission and quota races, permissions, freshness, persistence, cleanup, content-free logging/telemetry, browser resource/accessibility checks, retention, Google cost or deployed latency. Deterministic implementation checks and operational launch checks remain required in their own layers.

### Next decisions and handoff

Create [Repair evidence assistance offline](12-repair-evidence-assistance-offline.md) as a separate AFK prerequisite task with zero provider attempts. It prepares Box failure isolation, containment and repeated-value safeguards, missing comparison/readability candidate rules and the complete four-page request, using isolated code, dummy credentials, fake transport and disclosed regression evidence. Its result must distinguish checked mechanics from unmeasured model behavior.

Then work [Choose the repaired display policy and revalidation budget](13-choose-repaired-policy-and-revalidation-budget.md) through live human decisions. It must settle the revised candidate policy, clean development/held-out handling, exact roster, attempt/dollar/stop bounds and what the proposed measurements can establish. Any approved paid execution requires its own bounded task and later results decision. Previously exposed results cannot become fresh held-out validation after tuning.

[Confirm the specification and implementation handoff](09-confirm-specification-and-implementation-handoff.md) remains blocked by these follow-ups and any resulting required validation decision. Do not execute or resolve a second ticket in this session. No additional in-scope fog is currently identifiable beyond the now-explicit follow-up questions; revisit the frontier after their answers.
