# 07: Check business evidence

**What to build:** An applicant checks business evidence and sees which printed business name, address or operating-since month may be unreadable, absent, different or conflicting.

**Blocked by:** [03: Check one-page applicant identity evidence](03-check-one-page-applicant-identity-evidence.md).

**Status:** implemented

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [User tasks and capability traceability](../../jev-evidence-assistance/spec.md#user-tasks-and-capability-traceability); [Provisional experimental display contract](../../jev-evidence-assistance/spec.md#provisional-experimental-display-contract).

User stories: 4, 6, 10, 11, 17, 18, 19, 23.

- [x] Add the fixed business task to the shared analysis contract with separate declared-detail comparisons and named presence/location targets for business name, address and operating-since month.
- [x] Use the actual supplied source and minimum applicable context. Missing or invalid declarations skip only their dependent comparisons; retain useful source-only category, readability and presence work.
- [x] Apply the accepted provisional defaults and category/readability, presence, complete-source, conflict and freshness guards. Distinguish a different value from an absent field and preserve repeated or incompatible entries.
- [x] Keep operating-history arithmetic, normalization and eligibility in existing deterministic rules. Findings do not transcribe values, change fields, accept the document or complete a review check.
- [x] Show separate localized findings with source/page/target and ordinary inspect/edit/replace/retain choices. Use the shared task interface so correction/reviewer workflows and later highlight support consume the same definitions when available.
- [x] Include every model-visible business field in the dependency manifest so later edits invalidate affected findings without blanket invalidation from unrelated notes.
- [x] Demonstrate the complete draft journey using actual fictional evidence and fake provider transport. Cover missing declarations, unrelated documents, readable disagreements, ambiguous/repeated entries and unavailable stages through the public interface and browser.

Implementation notes:

- Shared named targets define business name, address and operating-since month.
  The page check asks separate presence and support questions, sends only the
  relevant business declarations, and retains conflicting or undetermined
  entries instead of transcribing a value. Missing or invalid declarations skip
  only their comparisons. Existing domain validation and financing rules remain
  authoritative.
- Draft, private correction and reviewer workflows use the same public task
  interface. Arabic and English findings retain source/page/target context and
  ordinary inspect, permitted edit, replace and retain choices. Matching Save
  can retain temporary analysis. All model-visible business context participates
  in freshness checks; unrelated fields and reviewer notes preserve findings.
- The inherited one-page limit remains explicit. The seeded business PDFs have
  two pages and stay inspectable without whole-source agreement or absence.
  Ticket 09 adds multipage work for all tasks; ticket 10 adds locations using
  these named targets. Runtime still has no provider transport. Tests use actual
  fictional uploads and fake provider transport without paid inference.

Verification:

- All 11 focused public-interface and browser tests passed with real IndexedDB.
  They cover the complete draft journey through submission, missing/invalid
  declarations, different and absent values, unrelated documents, repeated and
  ambiguous entries, unreadable and unavailable findings, matching Save,
  declaration dependencies, correction permissions and private edits, reviewer
  notes, and the multipage limit.
- Typecheck and lint passed. Arabic mobile and English desktop captures were
  visually inspected.
- The complete public-interface suite passed all 236 tests with real browser
  IndexedDB. All 105 unit tests, production build and packaged-skill checks also
  passed.
- All six production assistance-screen checks passed across Chrome, Firefox and
  WebKit, covering identity and business sources, ordinary inspection, Saved
  demonstrations and unavailable live analysis. The checks used isolated local
  port 4180 because another project occupied 4173, and the existing WebKit
  compatibility wrapper.
- Independent Standards review reported zero findings. Independent Spec review
  reported zero findings.
