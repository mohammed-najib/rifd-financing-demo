# Plan thoughtful Jev evidence assistance

Labels: wayfinder:map
Status: resolved

## Destination

Settle the decisions needed for an implementation-ready specification of Jev-assisted document preparation and review in the fictional RIFD financing demo. Vision, Box, Choice, Score and Noul must each have a useful role in an explicitly experimental demo, checked through focused smoke work within the accepted ten-minute limit; the map is complete when the applicant and reviewer workflows, architecture, interface behavior and acceptance criteria leave no in-scope implementation decision open.

## Notes

- Planning is complete. The user accepted [Confirm the specification and implementation handoff](issues/09-confirm-specification-and-implementation-handoff.md#answer) and the [implementation specification](spec.md) on 2026-10-17, then requested closure of the handoff and map. Implementation starts as a separate effort.
- Current release and validation direction is [Decide release from selection-bound validation results](issues/23-decide-release-from-selection-bound-validation-results.md#answer). The user accepted an experimental live demo with focused checks capped at ten minutes total, replacing full calibration and statistical validation. That resolution holds provisional display defaults, the small smoke batch and explicit unverified claims. It supersedes contrary earlier full-validation requirements while preserving both audiences, both languages and all requested capabilities.
- This is a planning effort. Build the decision map and research its unknowns before implementing the integration. Resolve at most one non-research ticket per session, through the live human exchange required by its type. Charting does not resolve human decision tickets.
- Preserve the accepted [final preparation-cycle limit](issues/19-review-corrected-validation-package-and-paid-execution.md#final-preparation-cycle). The execution/results route and final handoff have concluded under the changed validation requirement. Do not create a successor preparation/review chain or reconstruct the abandoned full experiment through short batches.
- The [stopped native execution](issues/22-run-capped-selection-bound-jev-validation.md#answer) remains preserved historical evidence, including two counted unreconciled calls and a halted controller. The experimental direction does not turn that partial result into passed validation or permit restarting it. Actual accounting must be reconciled before further paid dispatch.
- The user confirmed the destination and these starting constraints on 2026-10-17: serve both applicants preparing documents and reviewers examining evidence; use every requested capability where it contributes to those workflows; make real `jev-1.14.0` requests on demand; provide clearly labelled saved demonstrations when live analysis is unavailable.
- AI findings are advisory. Reviewers explicitly record document assessments, request corrections and make final financing decisions. Confidence alone cannot change application status. Keep exact calculations and existing financing rules in code.
- The user explicitly requires TanStack AI for the integration, confirmed on 2026-10-17. Follow the selected bridge and bounded service contract in [Choose live access, deployment and spending policy](issues/05-choose-live-service-and-spending-policy.md#answer).
- The experimental policy in [Decide release from selection-bound validation results](issues/23-decide-release-from-selection-bound-validation-results.md#answer) supersedes the earlier Saved-only planning restriction for future live mode. The current application is not enabled or deployed by this decision. Existing checked Saved demonstrations remain the fallback. Earlier correction and review tickets preserve the technical history; their full collection/selection/freezing protocol is retired.
- Keep automatic assistance without an extra per-highlight human-confirmation step. Preserve the US$1 cumulative actual pre-feature validation ceiling and US$4 protected reconciled credit. The earlier 200/100 attempt envelope is historical capacity, not a requirement or permission to complete the retired roster. The current small check scope is defined in the results resolution.
- Applicants correcting unusable evidence earlier and reviewers finding evidence faster remain intended benefits. Check focused Arabic and English examples under the accepted small scope; do not claim representative accuracy, calibrated thresholds or measured human time savings.
- Preserve the existing fictional-data context, Arabic-first and English experiences, responsive and accessible interaction, private correction workspace, and loaded-app offline behavior. The current browser-only architecture is a starting fact, not a requirement to expose API credentials in the client. The selected server boundary is recorded in [Choose live access, deployment and spending policy](issues/05-choose-live-service-and-spending-policy.md#answer).
- The [current architecture](../../docs/architecture.md), [glossary](../../GLOSSARY.md) and [original platform map](../financing-application-and-review/map.md) provide context. The app currently has four document slots, image and multipage PDF evidence, human document assessments, five review checks and revisioned writes. Old notes about an absent Git remote are historical; `origin` now points to the existing RIFD repository.
- Consult [wayfinder](../../.agents/skills/wayfinder/SKILL.md), [TypeSafe](../../.agents/skills/typesafe-ai/SKILL.md), [domain-modeling](../../.agents/skills/domain-modeling/SKILL.md) and [unslop](../../.agents/skills/unslop/SKILL.md) each session. Use [grilling](../../.agents/skills/grilling/SKILL.md) for human decisions, [prototype](../../.agents/skills/prototype/SKILL.md) for the interface ticket, and [research](../../.agents/skills/research/SKILL.md) for external facts. Follow the repository's package-skill policy when a task uses installed libraries.
- Use the existing [local Markdown tracker](../../.agents/skills/setup-matt-pocock-skills/issue-tracker-local.md). Each child lives in `issues/`. `Status: open` is unclaimed; claim by saving `Status: claimed` and `Assignee: the operator` before work. A ticket is unblocked when all IDs in `Blocked by` refer to resolved tickets; `none` means no prerequisite. Select the first open, unblocked, unclaimed child by filename number. Record a resolution under `## Answer`, set `Status: resolved`, and append a named context pointer below. Use only `wayfinder:` labels.
- Research agents work in isolated worktrees. Preserve each report on its own throwaway `research/` branch and push that branch to the existing `origin`, as the invoked wayfinder workflow requires. Open no PR and do not merge research branches. Link the branch and commit from its ticket and retain an identical readable report in `docs/research/`. If publication is blocked, record the exact limitation and preserve the local evidence.
- Research publication is pending explicit approval. Automatic approval review rejected the report-only branch push because project details would leave the local workspace for an unverified destination. The local commits and matching workspace reports are preserved. Do not retry publication without approval for the destination and action.
- Research uses official documentation and public source code. No paid inference, cloud provisioning, credential changes or deployment is part of charting. Distinguish documented capability, verified local behavior and performance that still needs measurement. Vision and Box have been described as experimental; establish the pinned model's current contract in research before relying on it.

## Decisions so far

<!-- One named link and a short gist per resolved child. Detail lives in its ticket. -->

- [Verify the Jev model and SDK contract](issues/01-verify-jev-model-and-sdk-contract.md#answer): Pinned-model and published SDK contracts established, with experimental vision/Box, nullable fields and unmeasured behavior identified.
- [Verify document preparation and highlight coordinates](issues/02-verify-document-image-preparation.md#answer): Document rendering options, source/page geometry and partial-coverage limits established; proposed transforms still need testing.
- [Verify live service access and cost controls](issues/03-verify-live-service-access-and-cost.md#answer): Function/container options, access boundaries, published pricing and limits of spend and retention guarantees documented.
- [Define useful applicant and reviewer assistance](issues/04-define-assistance-tasks-and-workflows.md#answer): Per-slot applicant and reviewer tasks, capability roles, scoped findings and manual correction workflows agreed.
- [Choose live access, deployment and spending policy](issues/05-choose-live-service-and-spending-policy.md#answer): Bounded public live access, Firebase deployment, browser preparation, TanStack AI bridge, spending and retention policy agreed, with validation required before launch.
- [Define result freshness, visibility and saved demonstrations](issues/06-define-result-lifecycle-and-provenance.md#answer): Input-bound applicability, private visibility, seven-day browser retention, inspection confirmation and saved-demonstration provenance agreed.
- [Validate the applicant and reviewer assistance experience](issues/07-prototype-evidence-assistance-experience.md#answer): Applicant layout A, reviewer layout B and plain-language findings accepted; model details stay in provenance, with fixture verification limits recorded.
- [Define evidence quality and workflow acceptance gates](issues/08-define-evaluation-and-release-gates.md#answer): Quality/performance targets and a 20-attempt feasibility experiment agreed; participant study waived, with unmeasured release scope and display rules deferred to a follow-up decision.
- [Run capped Jev feasibility evaluation](issues/10-run-capped-jev-feasibility-evaluation.md#answer): Twenty attempts and checked captures recorded; candidate highlights failed the safety gate, and partial financial coverage leaves four-page comparison fit unmeasured.
- [Choose release scope and measured display rules](issues/11-choose-release-scope-and-display-rules.md#answer): Full destination retained, live release gated and five fixed Saved demonstrations accepted; offline repair and a separate policy/budget decision precede handoff.
- [Repair evidence assistance offline](issues/12-repair-evidence-assistance-offline.md#answer): Isolated Box-failure repair, full four-page fake transport and versioned inspection-policy candidate preserved; fresh semantic evaluation and policy/budget approval remain pending.
- [Choose the repaired display policy and revalidation budget](issues/13-choose-repaired-policy-and-revalidation-budget.md#answer): Bounded automatic-verification preparation and finding rules accepted under a protected 200/100-attempt budget; exact candidate and paid authorization require follow-ups.
- [Prepare automatic verification and expanded evaluation offline](issues/14-prepare-automatic-verification-and-expanded-evaluation-offline.md#answer): Isolated zero-call automatic candidate, exact draft roster, fixtures and durable reservation checks preserved; coverage gaps and final method/authorization remain for the next decision.
- [Choose the automatic candidate and authorize exact validation](issues/15-choose-automatic-candidate-and-authorize-exact-validation.md#answer): Crop method accepted subject to three repairs, corrected gap-filling preparation and development rules; exact package review and paid authorization remain separate.

- [Repair the automatic validation package offline](issues/16-repair-automatic-validation-package-offline.md#answer): Exact target binding, period ordering and deadlines repaired; zero-call selector/runner, audits and a pending 200/78 roster proposal preserved for live review.
- [Review the repaired package and decide paid validation](issues/17-review-repaired-package-and-decide-paid-validation.md#answer): Five control corrections, practical selection and two independent fresh four-page families required before exact review; zero-call preparation accepted, paid dispatch unauthorized.

- [Correct validation controls and prepare fresh four-page evaluation offline](issues/18-correct-validation-controls-and-prepare-fresh-four-page-evaluation-offline.md#answer): Five control corrections, exact bounded selector and two named four-page drafts preserved with zero calls; exact 200/96 proposal and independent/account prerequisites await live review.

- [Review the corrected validation package and decide paid execution](issues/19-review-corrected-validation-package-and-paid-execution.md#answer): Remaining controls/capacity require zero-call correction with exact numerical semantics retained; this is the final preparation cycle, paid dispatch unauthorized.


- [Bind validation freezes and improve selector capacity offline](issues/20-bind-validation-freezes-and-improve-selector-capacity-offline.md#answer): Fixed-bootstrap identity and audited controller/worker loading corrected; 62 offline regressions and exact selector replays pass, with genuine source/account confirmations carried forward and corrected executable-package acceptance pending in the existing review.

- [Review selection-bound validation and decide paid execution](issues/21-review-selection-bound-validation-and-decide-paid-execution.md#answer): Corrected exact package/procedure/roster accepted and protected 200/96-attempt experiment explicitly authorized; the two bounded execution/results tickets now block handoff.

- [Run capped selection-bound Jev validation](issues/22-run-capped-selection-bound-jev-validation.md#answer): User time limit ended collection after one run and two successful native calls; the controller is stopped, billing remains unreconciled, and full validation/release are unestablished.

- [Decide release from selection-bound validation results](issues/23-decide-release-from-selection-bound-validation-results.md#answer): Experimental live demo accepted with provisional display rules and a ten-minute smoke limit; full calibration retired and broader quality/performance explicitly unverified.

- [Confirm the specification and implementation handoff](issues/09-confirm-specification-and-implementation-handoff.md#answer): Final specification accepted, including module responsibilities, browser compatibility, inspection enforcement and delivery order; implementation proceeds separately.

## Not yet specified

None. Final specification review is complete and all child tickets are resolved. Implementation and its bounded checks proceed separately from the accepted specification.

## Out of scope

- Implementing or deploying the application integration during charting, or treating prototype code as production implementation.
- Real lending, identity verification, credit scoring, bank integrations, payment processing or production use of real applicant documents. This effort remains a fictional financing demo.
- Autonomous document acceptance, correction issuance or final financing decisions by the model.
- Replacing deterministic calculations or existing product rules with model judgments.
- A separate AI playground disconnected from applicant preparation and reviewer evidence handling.
