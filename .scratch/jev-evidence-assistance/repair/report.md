# Offline evidence-assistance repair

The isolated candidate fixes the observed whole-page loss from invalid Boxes. All 20 retained HTTP responses pass through the revised SDK bridge with their native answers unchanged; the three formerly unavailable stages retain their independently valid judgments. This is regression evidence with the original questions, not a new model evaluation.

No provider attempts were made and no operator credential file was read. Live dispatch remains disabled. The candidate neither establishes safe model locations nor satisfies the existing release or specification-handoff gates.

## Candidate and provenance

- Branch `experiment/jev-offline-repair`, worktree [.scratch/worktrees/jev-offline-repair](../../worktrees/jev-offline-repair/experiment/README.md).
- Exact code and verification commit: `2929d96f6ce761076c31b451d27b72650256a1ee`.
- Parent experiment commit `93ffb208ce37ac1d159cf8db2b68fcdb5dbd128a`. The original branch and all historical inputs, captures, scores and Saved demonstrations are preserved.
- Experiment package 0.2.0; mapping `native-bridge-v2-location-isolation`; questions `evidence-questions-v2-repair`; policy `candidate-display-v2-inspection`.
- Unchanged dependencies: TanStack AI 0.69.0, TypeSafe SDK 0.7.0, T3 Env 0.13.11, Zod 4.3.6, PDF.js 5.4.296 and Puppeteer Core 25.9.0. Model remains jev-1.14.0; preparation remains `full-page-pdfjs-5.4.296-v1`.
- [Original integrity checks](../../worktrees/jev-offline-repair/offline-artifacts/original-artifact-integrity.json) verified all 397 sealed files before and after. The exhausted original ledger digest remains `534e21fed72ac421bb20a7013dbd21ad8bef4e17cc939bb46032bfc57f878e88`.

Wayfinder, TypeSafe, domain-modeling, diagnosing-bugs, TanStack AI and unslop guidance was consulted. The permitted package catalog was listed; `@rifd/domain#validate-application` and its field guide were loaded for declaration-comparison constraints. No package-skill policy changed and no hidden package skill was loaded. The installed TanStack evaluation source and TypeSafe SDK contract were inspected.

The current [TypeSafe image documentation](https://docs.typesafe.ai/images) still marks image/Box behavior experimental. The [SDK guide](https://docs.typesafe.ai/sdk/javascript) documents multipart images and nullable Box confidence, while its Box example still names jev-preview. The pinned jev-1.14.0 contract and retained observations remain the experiment's reference. The [citation-check cookbook](https://docs.typesafe.ai/cookbooks/citation_check) informed the separation of exact checks from semantic judgments; its example thresholds were not imported.

## What the offline checks establish

| Check | Result and limit |
| --- | --- |
| Original failure | The [red replay](box-isolation-red.txt) fails with `Malformed Box` before the fix. The minimal cause is a degenerate target rectangle in otherwise valid native answers. |
| Full bridge replay | [Twenty retained stages](../../worktrees/jev-offline-repair/offline-artifacts/retained-response-replay.json) pass through the real SDK and TanStack mapping with injected responses. Three regain non-location answers. No original response or old score is rewritten. |
| Box isolation | Missing, wrong-type, degenerate, out-of-range and malformed-confidence Boxes lose only their target location. Raw native data remains intact. A valid Box with null confidence retains null. |
| Strict failures | Missing or malformed non-Box answers, distributions, Score legend, model, usage and unreadable responses still fail the stage. Invalid request scope is rejected. Unknown accounting stops subsequent stages. |
| Complete composition | Four 1120 × 1568 full-page PNGs, 401,391 image bytes and 7,024,640 pixels. Each page receives the maximum relevant financial suite, nine targets and 29 questions. The final comparison includes all four images and its three relevant declared fields, for 119 questions over five sequential fake attempts. Four comparison questions also pass a separate synthetic ceiling check. |
| Wire inspection | [Saved multipart](../../worktrees/jev-offline-repair/offline-artifacts/four-page-comparison.multipart), [decoded request](../../worktrees/jev-offline-repair/offline-artifacts/four-page-comparison.json) and [page associations](../../worktrees/jev-offline-repair/offline-artifacts/four-page-transport.json) preserve the complete request. Every uploaded part matches the frozen page hash. The comparison is 408,086 bytes. |
| Bounds and failures | [Nineteen checks](../../worktrees/jev-offline-repair/offline-artifacts/bound-checks.json) exercise page/attempt/question/target/context/body/resource bounds, association, partial failures and deadlines. Simulated context overflow stops after one attempt without fallback, crop, long context or verification dispatch. |
| Test suite | [Thirty-six tests passed](../../worktrees/jev-offline-repair/offline-artifacts/verification.txt), including retained ledger and environment tests with synthetic values. Global network fetch is disabled in bridge/replay checks; only fake transport is injected. |

The four rasters were visually inspected. They include July, August and September figures and a fourth-page average revenue that conflicts with the first-page average. The candidate carries that fourth page into comparison even when every page has a synthetic degenerate Box. Non-Box page failure instead yields explicit partial comparison scope, with the failed page identified.

The bound checks do not validate a new browser renderer, arbitrary PNG decoding, PDF source admission, mobile memory, deployment or production allowance storage. Existing source/preparation and launch gates still apply. Encoding fit is not provider context fit. Fake response timing is not model or application latency.

## Proposed display policy

The [versioned policy](../../worktrees/jev-offline-repair/offline-artifacts/candidate-display-policy.json) contains Arabic and English wording for all eight categories, three readability descriptions and five per-field outcomes. Every numerical cutoff remains null pending development measurement. Synthetic test floors never become policy values. Unmeasured cells produce undetermined findings; this is a configuration boundary, not useful-coverage evidence.

Readability wording uses the relevant level's native probability mass, without rounding the fractional Score or presenting it as a percentage. Missing declarations disable only dependent comparisons. Unavailable stages remain distinct from unreadability and absence. Incomplete/unusable selected scope cannot establish consistency or absence. Financial amount comparisons require an established reporting-period match. Findings must state selected-page scope and any unchecked pages in the original document.

Presence remains independent of value agreement. A different printed name is still present. A Noul below a product threshold does not automatically prove absence; both present and absent directions need measured rules. Native model numbers remain in provenance.

Location handling requires usable page judgments, complete selected scope, measured present/absent and multiplicity rules, one occurrence across that scope, and no known document-wide conflict. Repeated targets, uncertain other pages and incompatible entries block the overlay. All failures retain a named source/page/target inspection action.

The containment proposal requires a separate trusted human confirmation that the unchanged rectangle contains every glyph and relevant unit, excludes competing values, and has been checked against all selected pages. Its binding includes source, raster, scope, page, target, rectangle and versions. Changes invalidate the confirmation. Null Box confidence alone neither fails other judgments nor authorizes an overlay. Numeric confidence provides no exemption.

This adds a confirmation before displaying a highlight, beyond the existing confirmation before a reviewer assessment. It requires the next human decision and a future interface implementation. The candidate implements the decision function, not that interface. Automatic overlay safety remains unresolved. Suppressing every overlay cannot satisfy the 60% useful-highlight gate, and the confirmation proposal has no measured usefulness yet.

## Failure regressions and changed meanings

The [location regressions](../../worktrees/jev-offline-repair/offline-artifacts/observed-location-regressions.json) retain all eight uncertified old proposals, distinguishing the five misleading proposals from the three boundary cases. Explicit guard checks address the three clipped Arabic amounts, clipped English expenses, and repeated Arabic name. Containment tests use documented inspection failures with other gates made synthetic to isolate the guard. They do not show the model returning better rectangles.

The repeated-name regression retains presence 0.99, P(single) 0.90 and Box confidence 0.89. The conflicting document comparison blocks that proposal despite those values. A human could still misinspect a region; the new method is a hypothesis requiring fresh inference and source checking. Padding cannot repair this evidence. No automatic coordinate enlargement is introduced.

The [question definitions](../../worktrees/jev-offline-repair/offline-artifacts/candidate-question-definitions.json) change presence wording to emphasize differing printed values, multiplicity to include all duplicate and competing entries, Box wording to demand the complete value, and support/comparison criteria to distinguish wrong-period amounts, explicit period differences, absence and conflict. Category and readability meanings are retained. Their previous thresholds still cannot be assumed calibrated for this new workflow. No native answer to the revised questions exists.

Every originally dispatched source family is now exposed development/regression material: `ar-financial-01`, `en-business-02`, `en-purchase-03`, `ar-identity-06`, `en-identity-10`, `ar-business-08`, `en-financial-10`, `ar-purchase-04`, including the repeated financial probe and any related variants. The five original held-out documents cannot validate the repaired policy as fresh evidence.

## Remaining decision

The [revalidation proposal](revalidation-proposal.md) requests no dispatch. It gives the next decision a fixed 20-attempt repair-feasibility option and identifies its empty cells. It cannot establish the broader bilingual correctness, useful coverage or representative p95 gates. Full four-image provider fit, revised semantic behavior, real null-confidence observations, fresh family eligibility, human confirmation usefulness and production checks remain unavailable.

The current `release-display-v1` restrictions and five `checked-static-capture-v1` Saved demonstrations remain authoritative. This report approves no threshold, budget, live behavior or specification handoff.
