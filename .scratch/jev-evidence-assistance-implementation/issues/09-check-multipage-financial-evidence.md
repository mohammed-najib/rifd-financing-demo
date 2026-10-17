# 09: Check multipage financial evidence

**What to build:** An applicant checks a revenue and expense summary, explicitly selects pages when necessary, and sees reporting-period and amount findings with honest analysis coverage across the original document.

**Blocked by:** [03: Check one-page applicant identity evidence](03-check-one-page-applicant-identity-evidence.md).

**Status:** ready-for-agent

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Preparation, geometry and request bounds](../../jev-evidence-assistance/spec.md#preparation-geometry-and-request-bounds); [Provisional experimental display contract](../../jev-evidence-assistance/spec.md#provisional-experimental-display-contract); [User tasks and capability traceability](../../jev-evidence-assistance/spec.md#user-tasks-and-capability-traceability).

User stories: 12, 13, 14, 17, 19, 20, 21, 22, 23.

- [ ] Extend preparation and the common controller to explicitly selected multipage evidence for all slot tasks. Select all pages when they fit the limits; otherwise require a narrower explicit selection. Preserve original page count and ordered selected, prepared, dispatched, successful, failed, unreadable and unchecked scope.
- [ ] Enforce at most 100 original PDF pages and four selected full pages, one page/worker at a time, eight seconds per page and 20 seconds cumulative preparation. Preserve the per-image and combined byte/pixel bounds, orientation, exact manifests and temporary-resource cleanup.
- [ ] Add the financial task for reporting period, three monthly revenue/expense figures, printed averages and declared averages. Keep at most nine named page targets, 32 page questions and four document comparisons under the accepted fixed question definitions.
- [ ] Derive the expected three completed months in code. Drafts use their effective submission month; submitted, historical and correction contexts retain actual initial submission month. Preserve code-owned normalization, averages and whole-rial arithmetic.
- [ ] Compose financial period findings before amount findings regardless of answer serialization. Retain relevant witnessed conflicts; missing/invalid declarations disable only dependent work.
- [ ] Dispatch ascending page stages followed by at most one comparison over usable pages. Plan at most one later bound-verification stage per page, giving a complete four-page plan of at most nine attempts once ticket 10 is integrated. A single selected page from a longer source keeps multipage semantics.
- [ ] Require complete usable original-source coverage for agreement, absence and highlights. A witnessed conflict may remain a warning scoped to usable checked pages, subject to period guards. Never merge runs to manufacture coverage or silently drop, split, resize or narrow failed work.
- [ ] Show page selection, coverage and financial findings in Arabic/English through the existing task workflow and source viewer. Keep manual source inspection and ordinary financing work available on partial preparation, context overflow or stage failure.
- [ ] Verify the complete draft journey with actual multipage fictional PDFs and fake transport, including wrong period, partial pages, conflicting amounts, missing context and unavailable comparison. Check the four-page stage plan deterministically; do not claim native context fit or representative reliability.
