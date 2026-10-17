# 06: Find supporting evidence during reviewer examination

**What to build:** A reviewer requests supporting evidence for the authorized submitted snapshot, examines source and findings beside assessment controls, and records their own judgment after current-context source inspection.

**Blocked by:** [01: Require source inspection before document assessment](01-require-source-inspection-before-document-assessment.md); [04: Retain and clear applicable analysis](04-retain-and-clear-applicable-analysis.md).

**Status:** ready-for-agent

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Connected workflows and presentation](../../jev-evidence-assistance/spec.md#connected-workflows-and-presentation); [Inspection and command compatibility](../../jev-evidence-assistance/spec.md#inspection-and-command-compatibility); [Applicability, visibility and local retention](../../jev-evidence-assistance/spec.md#applicability-visibility-and-local-retention).

User stories: 3, 5, 7, 9, 11, 13, 16, 31, 32, 33, 34, 35, 36, 37, 39, 56.

- [ ] Add Find supporting evidence through the public demo interface on authorized submitted documents, using submitted details and actual bytes. Never analyze or expose the applicant's unfinished correction workspace.
- [ ] Use the common task/context contract, initially verifiable with identity evidence. Business, purchase and financial tasks must appear here when their definitions land without a separate reviewer implementation.
- [ ] Implement accepted reviewer layout B with source, plain-language findings and assessment controls side by side on desktop and stacked on narrow screens. Provide Arabic/English, keyboard/screen-reader feedback, page navigation, source open/download and optional provenance.
- [ ] Keep results staff-only on readable submitted evidence. Reading permission and assigned-reviewer write authority remain separate; assistance grants neither assessment permission nor an assignment change.
- [ ] Use the assessment confirmation contract from ticket 01. Neither a finding, overlay nor source-open action confirms inspection, writes an assessment/review check, authors correction prose or changes application status.
- [ ] Revalidate source/context and authority before using findings and before assessment writes. Source changes, resubmission and assignment transitions invalidate the applicable inspection state; stale results retain only clearly old scope.
- [ ] Keep ordinary manual assessment and Saved demonstrations usable after cancellation, offline use, service limits or unavailable analysis, including the explained unable-to-open Needs replacement path.
- [ ] Test public reads/operations with real IndexedDB for private-workspace exclusion, staff visibility, assignment, confirmation bypass, relevant invalidation and unchanged financing effects. Exercise the responsive reviewer journey with fake provider transport.
