# Transaction reconciliation workspace | مطابقة العمليات

Scope: one month for this project alone.

## Concept

Build a workspace that helps a finance employee compare two transaction files, review suggested matches, investigate discrepancies, and produce a reconciliation report. Make dense financial records easy to navigate and explain every result.

This is a proposed banking operations tool. The bank's public payment and statement services provide context, but the research does not establish its internal reconciliation process.

## Users and main journey

- Analyst: import records, review matches, investigate exceptions, and prepare a reconciliation session.
- Supervisor: inspect unresolved items, review the analyst's explanations, and record a simulated sign-off.

The main demo compares two sample files containing an exact match, a missing entry, an amount mismatch, and a duplicate. The analyst resolves the explainable differences and leaves the remaining exception visible in the final report.

## Expanded one-month scope

1. **Session dashboard.** List reconciliation sessions with their date range, source files, progress, unmatched counts, and status.
2. **Two-source import.** Import two CSV files, map reference, date, amount, and currency columns, preview normalized values, and report malformed rows.
3. **Transparent matching.** Suggest matches using exact reference, amount, and currency. Explain why each suggestion was made and flag ambiguous results for manual review.
4. **Comparison workspace.** Show source records side by side with filters for matched, unmatched, mismatched, and duplicate records.
5. **Manual matching.** Select a record from each source, inspect the difference, confirm a match, and undo an accidental match.
6. **Discrepancy detail.** Show original and normalized values, linked records, notes, and a reason for each resolution.
7. **Exception classification.** Mark differences as a duplicate, timing difference, incorrect amount, or unresolved issue using fictional operating rules.
8. **Review workflow.** Submit a session for supervisor review, return it with comments, and record a simulated sign-off. Make unresolved items explicit.
9. **Change history.** Keep a chronological record of imports, matches, reversals, comments, and review decisions.
10. **Reports.** Export matched and unmatched records, show totals separately by currency, and create a printable session summary.
11. **Larger datasets.** Provide generated sample files with up to 10,000 records and use pagination or virtualization where measurements justify it. Measure filtering and matching time and document results.

## Frontend quality and technical scope

Use pnpm, React, TypeScript, and TanStack Start in SPA mode, deployed on Firebase Hosting. Process fictional files in the demo and use mocked requests for session saving and review. Include local persistence and reset controls.

Provide Arabic/English and RTL/LTR support, keyboard navigation, readable references and amounts, accessible tables, and clear import progress. Keep totals within each currency and use an explicit amount representation that avoids floating-point rounding errors.

Include simulated session expiry, role restrictions, failed saves, and stale-session conflicts. Demo roles are presentation behavior, not secure authorization. Test amount parsing, duplicates, ambiguous matches, undo, and totals against hand-checked fixtures. Explain matching rules and limitations in the repository.

## Four-week plan

- **Week 1:** Define records, sessions, and match rules; prepare sample fixtures; design the comparison screen; build CSV mapping and validation.
- **Week 2:** Implement exact matching, side-by-side comparison, filtering, manual matches, and undo.
- **Week 3:** Add exception explanations, review decisions, history, exports, and the session dashboard.
- **Week 4:** Validate matching against fixtures, measure larger datasets, refine accessibility and responsive layouts, deploy, and record the walkthrough.

## Optional extras after the main scope works

- Suggest one-to-many matches for split transactions, with explicit manual confirmation.
- Add a configurable date-window rule for otherwise identical records.
- Move expensive matching to a Web Worker if profiling identifies a responsiveness problem.

## Demo and delivery target

Show how the tool explains a discrepancy and produces a report that preserves unresolved issues. Deliver the hosted demo, repository, sample CSVs, matching-rule documentation, correctness tests, measured performance notes, and a short case study. Real accounting entries, external ledger integrations, and exchange-rate conversion are outside scope.

## Sources

- [Al-Amal PYes payment and statement services](https://alamalbank.com/service/19)
- [Job requirements](https://yemenhr.com/jobs/front-end-developer-react-typescript-confidential-sanaa-56d029c6)
- [Research and hosting constraints](../research/bank-portfolio-context.md)
