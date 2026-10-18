# 09: Check multipage financial evidence

**What to build:** An applicant checks a revenue and expense summary, explicitly selects pages when necessary, and sees reporting-period and amount findings with honest analysis coverage across the original document.

**Blocked by:** [03: Check one-page applicant identity evidence](03-check-one-page-applicant-identity-evidence.md).

**Status:** implemented

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Preparation, geometry and request bounds](../../jev-evidence-assistance/spec.md#preparation-geometry-and-request-bounds); [Provisional experimental display contract](../../jev-evidence-assistance/spec.md#provisional-experimental-display-contract); [User tasks and capability traceability](../../jev-evidence-assistance/spec.md#user-tasks-and-capability-traceability).

User stories: 12, 13, 14, 17, 19, 20, 21, 22, 23.

- [x] Extend preparation and the common controller to explicitly selected multipage evidence for all slot tasks. Select all pages when they fit the limits; otherwise require a narrower explicit selection. Preserve original page count and ordered selected, prepared, dispatched, successful, failed, unreadable and unchecked scope.
- [x] Enforce at most 100 original PDF pages and four selected full pages, one page/worker at a time, eight seconds per page and 20 seconds cumulative preparation. Preserve the per-image and combined byte/pixel bounds, orientation, exact manifests and temporary-resource cleanup.
- [x] Add the financial task for reporting period, three monthly revenue/expense figures, printed averages and declared averages. Keep at most nine named page targets, 32 page questions and four document comparisons under the accepted fixed question definitions.
- [x] Derive the expected three completed months in code. Drafts use their effective submission month; submitted, historical and correction contexts retain actual initial submission month. Preserve code-owned normalization, averages and whole-rial arithmetic.
- [x] Compose financial period findings before amount findings regardless of answer serialization. Retain relevant witnessed conflicts; missing/invalid declarations disable only dependent work.
- [x] Dispatch ascending page stages followed by at most one comparison over usable pages. Plan at most one later bound-verification stage per page, giving a complete four-page plan of at most nine attempts once ticket 10 is integrated. A single selected page from a longer source keeps multipage semantics.
- [x] Require complete usable original-source coverage for agreement, absence and highlights. A witnessed conflict may remain a warning scoped to usable checked pages, subject to period guards. Never merge runs to manufacture coverage or silently drop, split, resize or narrow failed work.
- [x] Show page selection, coverage and financial findings in Arabic/English through the existing task workflow and source viewer. Keep manual source inspection and ordinary financing work available on partial preparation, context overflow or stage failure.
- [x] Verify the complete draft journey with actual multipage fictional PDFs and fake transport, including wrong period, partial pages, conflicting amounts, missing context and unavailable comparison. Check the four-page stage plan deterministically; do not claim native context fit or representative reliability.

## Implementation

The shared controller prepares selected full pages sequentially and preserves the
original page count and ordered scope. Four-page plans reserve nine attempts,
including one later bound-verification stage per page. Automatic verification
remains reserved for ticket 10. A selected page from a longer document keeps the
multipage workflow and cannot support whole-source agreement or absence.

Financial source targets cover the period, all six monthly figures and both
printed averages. The fixed comparisons use code-derived completed months and
normalized whole-rial declarations. Period findings precede amounts, and partial
coverage preserves only appropriately scoped conflicts. The existing domain
helpers retain normalization, arithmetic and financing rules. No values are
transcribed or filled automatically.

The Arabic/English panel provides page selection, coverage and ordinary source
navigation. Retained records validate per-page requests, manifests and composition
before restoration. Tests use actual fictional multipage PDFs and fake transport,
including preparation and comparison failures. Native four-page context fit and
representative model reliability remain unverified. Runtime remains unavailable
until the separate service integration. No paid inference or deployment occurred.

## Verification

- All 15 new browser regressions passed with actual fictional multipage PDFs and
  fake transport. They cover distributed monthly evidence, wrong periods,
  missing declarations, conflicting amounts, partial preparation, failed pages,
  unavailable comparisons, context overflow, exact selection, retained coverage,
  historical/correction months and clear/retry before ordinary submission.
- The complete public-interface suite ran all 264 tests. It passed 262 and exposed
  two obsolete assertions about retained-result coverage and singular page
  wording. Both assertions were corrected and passed a focused recheck without
  changing application code. The full and focused JSON reports are retained in
  `artifacts/jev-multipage-financial/` in the working environment.
- Typecheck, lint, all 105 domain tests, both packaged-skill test files and the
  packaged-skill checks passed. The production build and CSS source-isolation
  check passed.
- All 12 production assistance checks passed across Chrome, Firefox and WebKit,
  including financial PDFs, unavailable live analysis, ordinary source access and
  Saved demonstrations. The local static preview now serves PDF.js `.mjs`
  workers as JavaScript. Checks used isolated port 4180 and the existing WebKit
  compatibility wrapper.
- The shared 20-second preparation deadline, eight-second page deadline and
  sequential worker cleanup passed using real PDF font-resource delays. A
  missing page-specific font resource preserved the other usable page and exact
  failed/unchecked scope. Four-page plans reserve nine attempts deterministically.
- Arabic and English 390px financial captures were visually inspected. The
  browser journey checks source navigation, page selection, no horizontal
  overflow, explicit retry after clearing and ordinary Save/submission.
- Independent Standards and Spec reviews each reported zero outstanding findings
  after their fixes were rechecked. Native four-page context fit and representative
  Jev reliability remain unverified.
