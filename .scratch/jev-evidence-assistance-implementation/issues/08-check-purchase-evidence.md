# 08: Check purchase evidence

**What to build:** An applicant checks a stock purchase plan or supplier quotation and sees evidence findings about the purchase description and total budget for the selected financing product.

**Blocked by:** [03: Check one-page applicant identity evidence](03-check-one-page-applicant-identity-evidence.md).

**Status:** ready-for-agent

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [User tasks and capability traceability](../../jev-evidence-assistance/spec.md#user-tasks-and-capability-traceability); [Provisional experimental display contract](../../jev-evidence-assistance/spec.md#provisional-experimental-display-contract).

User stories: 4, 6, 15, 16, 17, 18, 19, 23.

- [ ] Add fixed purchase tasks that use the selected product, purchase explanation and total budget, with stock-plan expectations for Inventory financing and supplier-quotation expectations for Equipment financing.
- [ ] Create separate description and budget support findings and named presence/location targets. Preserve apparent document category as a finding distinct from document suitability.
- [ ] Apply the accepted provisional defaults, complete usable source coverage and readability/category/presence/conflict/freshness guards. Missing or invalid declarations skip only dependent comparisons; a missing description and an unrelated quotation remain explicit.
- [ ] Keep whole-rial normalization, product limits, product purpose fit and purchase budget coverage in their existing deterministic or human review responsibilities. Add no itemized quotation analysis, form filling or automatic review checks.
- [ ] Bind findings to actual evidence and every model-visible product/detail dependency. Product or relevant declaration/source changes cannot leave prior agreement or locations applicable.
- [ ] Render plain-language Arabic/English findings with source/page/target and accessible manual actions through the shared task interface, ready for correction/reviewer workflows and later highlights without another UI path.
- [ ] Verify an end-to-end draft check for each product using fake transport, including absent description, wrong category, budget disagreement, missing context, repeated/conflicting values and unavailable analysis. Preserve ordinary Save and submission behavior.
