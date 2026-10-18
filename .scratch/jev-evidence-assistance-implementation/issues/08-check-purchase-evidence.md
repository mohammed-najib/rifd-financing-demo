# 08: Check purchase evidence

**What to build:** An applicant checks a stock purchase plan or supplier quotation and sees evidence findings about the purchase description and total budget for the selected financing product.

**Blocked by:** [03: Check one-page applicant identity evidence](03-check-one-page-applicant-identity-evidence.md).

**Status:** implemented

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [User tasks and capability traceability](../../jev-evidence-assistance/spec.md#user-tasks-and-capability-traceability); [Provisional experimental display contract](../../jev-evidence-assistance/spec.md#provisional-experimental-display-contract).

User stories: 4, 6, 15, 16, 17, 18, 19, 23.

- [x] Add fixed purchase tasks that use the selected product, purchase explanation and total budget, with stock-plan expectations for Inventory financing and supplier-quotation expectations for Equipment financing.
- [x] Create separate description and budget support findings and named presence/location targets. Preserve apparent document category as a finding distinct from document suitability.
- [x] Apply the accepted provisional defaults, complete usable source coverage and readability/category/presence/conflict/freshness guards. Missing or invalid declarations skip only dependent comparisons; a missing description and an unrelated quotation remain explicit.
- [x] Keep whole-rial normalization, product limits, product purpose fit and purchase budget coverage in their existing deterministic or human review responsibilities. Add no itemized quotation analysis, form filling or automatic review checks.
- [x] Bind findings to actual evidence and every model-visible product/detail dependency. Product or relevant declaration/source changes cannot leave prior agreement or locations applicable.
- [x] Render plain-language Arabic/English findings with source/page/target and accessible manual actions through the shared task interface, ready for correction/reviewer workflows and later highlights without another UI path.
- [x] Verify an end-to-end draft check for each product using fake transport, including absent description, wrong category, budget disagreement, missing context, repeated/conflicting values and unavailable analysis. Preserve ordinary Save and submission behavior.


## Implementation

Purchase assistance uses the shared `Demo.createEvidenceAssistance` task for
drafts, private corrections and submitted reviewer evidence. Named description
and total-budget targets provide separate presence and support findings. Inventory
financing expects stock-plan evidence; Equipment financing expects a supplier
quotation. Apparent category remains separate from document suitability.

The model receives the selected product, relevant valid declarations and actual
page pixels. Missing or invalid declarations skip only their comparisons.
Existing whole-rial parsing normalizes the declared budget. Every question binds
both details and the selected product, plus source/raster hashes and any permitted
correction context. Complete one-page coverage and category/readability/presence
and confidence guards control support findings. Repeated, conflicting and
undetermined entries retain their distinct outcomes.

The Arabic/English panel shows source, page and named findings with ordinary
inspect, permitted edit, replace and retain controls. Assistance never fills
fields, saves financing edits, accepts evidence or completes review checks.
Matching ordinary Save retains temporary results; relevant declaration, product
or source changes cannot keep prior findings applicable. Product purpose fit,
purchase budget coverage, product limits and financing arithmetic retain their
existing deterministic or human review responsibilities.

The inherited one-page limit remains explicit. Multipage sources stay inspectable
without producing whole-source agreement or absence. Ticket 09 owns multipage
analysis and ticket 10 owns automatic highlights using these named targets.
Runtime reports live analysis unavailable until the separate service integration.
No paid inference, cloud provisioning or deployment was performed.

## Verification

- All 13 focused purchase API/UI tests passed using actual fictional evidence,
  real browser IndexedDB and fake transport. They cover both products, absent
  description, unrelated quotation, budget disagreement, missing/invalid context,
  repeated/conflicting values, uncertain or unavailable answers, complete-source
  guards, source binding, freshness, matching Save/restoration, correction
  permissions, reviewer privacy and ordinary submission.
- Typecheck, lint, all 105 domain tests and both packaged-skill test files passed.
- The production build and CSS source-isolation check passed.
- All nine production assistance checks passed across Chrome, Firefox and WebKit,
  including purchase sources, unavailable live analysis, ordinary source access
  and Saved demonstrations. Checks used isolated port 4180 and the existing
  WebKit compatibility wrapper.
- The complete public-interface suite passed all 249 tests with real browser
  IndexedDB and no skips or failures.
- Arabic and English 390px captures were visually inspected. Keyboard activation,
  source access, edit focus and absence of horizontal overflow were checked.
- Independent Standards review reported zero findings. Independent Spec review
  reported zero findings.
