# 06: Find supporting evidence during reviewer examination

**What to build:** A reviewer requests supporting evidence for the authorized submitted snapshot, examines source and findings beside assessment controls, and records their own judgment after current-context source inspection.

**Blocked by:** [01: Require source inspection before document assessment](01-require-source-inspection-before-document-assessment.md); [04: Retain and clear applicable analysis](04-retain-and-clear-applicable-analysis.md).

**Status:** implemented

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Connected workflows and presentation](../../jev-evidence-assistance/spec.md#connected-workflows-and-presentation); [Inspection and command compatibility](../../jev-evidence-assistance/spec.md#inspection-and-command-compatibility); [Applicability, visibility and local retention](../../jev-evidence-assistance/spec.md#applicability-visibility-and-local-retention).

User stories: 3, 5, 7, 9, 11, 13, 16, 31, 32, 33, 34, 35, 36, 37, 39, 56.

- [x] Add Find supporting evidence through the public demo interface on authorized submitted documents, using submitted details and actual bytes. Never analyze or expose the applicant's unfinished correction workspace.
- [x] Use the common task/context contract, initially verifiable with identity evidence. Business, purchase and financial tasks must appear here when their definitions land without a separate reviewer implementation.
- [x] Implement accepted reviewer layout B with source, plain-language findings and assessment controls side by side on desktop and stacked on narrow screens. Provide Arabic/English, keyboard/screen-reader feedback, page navigation, source open/download and optional provenance.
- [x] Keep results staff-only on readable submitted evidence. Reading permission and assigned-reviewer write authority remain separate; assistance grants neither assessment permission nor an assignment change.
- [x] Use the assessment confirmation contract from ticket 01. Neither a finding, overlay nor source-open action confirms inspection, writes an assessment/review check, authors correction prose or changes application status.
- [x] Revalidate source/context and authority before using findings and before assessment writes. Source changes, resubmission and assignment transitions invalidate the applicable inspection state; stale results retain only clearly old scope.
- [x] Keep ordinary manual assessment and Saved demonstrations usable after cancellation, offline use, service limits or unavailable analysis, including the explained unable-to-open Needs replacement path.
- [x] Test public reads/operations with real IndexedDB for private-workspace exclusion, staff visibility, assignment, confirmation bypass, relevant invalidation and unchanged financing effects. Exercise the responsive reviewer journey with fake provider transport.

Implementation notes:

- `Demo.createEvidenceAssistance` accepts a strict reviewer/submitted action using
  the same task selector and lifecycle as applicant checks. It reads submitted
  bytes and declarations, rejects caller overrides and never reads private
  correction workspace context. Shared task availability enables later slot
  definitions in the reviewer panel.
- Reviewer retention binds the existing inspection context, including source,
  relevant declarations, publication and assignment history. Notes preserve
  otherwise applicable findings. Reassignment away and back and resubmission
  make retained findings stale without publishing applicant analysis history.
- The shared Arabic/English panel places source, findings and assessment controls
  together. Ordinary PDF page navigation, opening and downloading remain separate
  from one-page analysis limits. Cancellation, unavailable service and loaded-app
  offline work preserve Saved demonstrations and manual assessment, including the
  explained unable-to-open replacement exception.
- Independent review found and resolved a held-screen source issue. A stale
  notification now removes the displayed source before fresh authorization. A
  regression reproduces replacement publication through another public session.
  Rendered PDF images also retain their page identity during navigation.
- Runtime still has no live transport. Tests use fake provider transport without
  paid inference. Later document tasks, live service and automatic highlights
  remain separate tickets.

Verification:

- Typecheck, lint, production build, all 105 unit tests and packaged-skill checks
  passed.
- The complete public-interface suite passed all 225 tests with real browser
  IndexedDB.
- All nine focused reviewer tests passed with real browser IndexedDB, including
  both languages, private-workspace exclusion, read/write authority, direct
  confirmation bypass, publication/assignment invalidation, PDF navigation,
  cancellation, unavailable service, offline Saved demonstrations and manual
  replacement.
- All 16 affected Chrome production-screen tests passed for reviewer controls,
  Saved demonstrations and existing applicant assistance. English desktop and
  Arabic narrow-screen reviewer captures were visually inspected.
- All ten reviewer journey checks passed across Firefox and WebKit with fake
  provider transport. WebKit used the existing compatibility wrapper at
  `/tmp/rifd-webkit-run.sh`.
- Independent Standards and Spec reviews report no remaining findings after the
  stale-source fix.
