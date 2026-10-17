# 07: Check business evidence

**What to build:** An applicant checks business evidence and sees which printed business name, address or operating-since month may be unreadable, absent, different or conflicting.

**Blocked by:** [03: Check one-page applicant identity evidence](03-check-one-page-applicant-identity-evidence.md).

**Status:** ready-for-agent

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [User tasks and capability traceability](../../jev-evidence-assistance/spec.md#user-tasks-and-capability-traceability); [Provisional experimental display contract](../../jev-evidence-assistance/spec.md#provisional-experimental-display-contract).

User stories: 4, 6, 10, 11, 17, 18, 19, 23.

- [ ] Add the fixed business task to the shared analysis contract with separate declared-detail comparisons and named presence/location targets for business name, address and operating-since month.
- [ ] Use the actual supplied source and minimum applicable context. Missing or invalid declarations skip only their dependent comparisons; retain useful source-only category, readability and presence work.
- [ ] Apply the accepted provisional defaults and category/readability, presence, complete-source, conflict and freshness guards. Distinguish a different value from an absent field and preserve repeated or incompatible entries.
- [ ] Keep operating-history arithmetic, normalization and eligibility in existing deterministic rules. Findings do not transcribe values, change fields, accept the document or complete a review check.
- [ ] Show separate localized findings with source/page/target and ordinary inspect/edit/replace/retain choices. Use the shared task interface so correction/reviewer workflows and later highlight support consume the same definitions when available.
- [ ] Include every model-visible business field in the dependency manifest so later edits invalidate affected findings without blanket invalidation from unrelated notes.
- [ ] Demonstrate the complete draft journey using actual fictional evidence and fake provider transport. Cover missing declarations, unrelated documents, readable disagreements, ambiguous/repeated entries and unavailable stages through the public interface and browser.
