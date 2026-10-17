# 05: Check evidence in private correction workspaces

**What to build:** An applicant checks evidence while preparing requested corrections, sees findings tied to the actual reviewer reason and permitted targets, and keeps both unfinished work and assistance history private.

**Blocked by:** [04: Retain and clear applicable analysis](04-retain-and-clear-applicable-analysis.md).

**Status:** implemented

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Connected workflows and presentation](../../jev-evidence-assistance/spec.md#connected-workflows-and-presentation); [Applicability, visibility and local retention](../../jev-evidence-assistance/spec.md#applicability-visibility-and-local-retention).

User stories: 2, 17, 27, 28, 29, 30, 50, 51, 54, 55.

- [x] Enable Check document in the current owner-authorized correction workspace using the same task interface as drafts. Include the actual reviewer-written reason, permitted targets, relevant declarations and current saved/prepared source in the dependency manifest.
- [x] Use the slot tasks already implemented; later task definitions must work through the same context interface without requiring another correction workflow. Verify this slice with the available identity task and fake transport.
- [x] Respect existing correction permissions in both UI and operations. A document-only target cannot unlock a field edit, advice cannot satisfy a correction target, and ignoring advice cannot bypass a required eligible changed file or normalized field change.
- [x] Keep incomplete changes and analysis private until ordinary Save/resubmission rules apply. Resubmission publishes the correction response but never its applicant assistance history. Staff reads, print, notifications and review activity must exclude that history.
- [x] Bind current authority to the correction round and workspace; invalidate relevant findings or pending work after source/detail changes, round closure, resubmission, reset or sign-out. Unsaved runs stay temporary until a matching ordinary Save.
- [x] Use the actual initial submission month for correction financial context when that task becomes available, and preserve deterministic financing calculations and validation.
- [x] Present Arabic/English findings beside permitted actions with accessible source navigation, narrow-screen support and explicit unavailable/stale/partial states. Analysis availability never adds a resubmission prerequisite.
- [x] Extend public-interface correction tests with real IndexedDB for visibility, forbidden edits, unchanged financing effects, matching Save, round transitions and late completions, plus the user-visible correction journey.

Implementation notes:

- The existing identity task now accepts an owner-authorized correction workspace
  and explicit round identifier through `Demo.createEvidenceAssistance`. Actual
  reviewer reasons, permitted targets and the initial submission month accompany
  the declared name and supplied source, and participate in every finding's
  dependencies and retained provenance.
- Document-only targets keep name edits unavailable in both UI and operations.
  Existing eligible-file and normalized-field-change validation still controls
  resubmission. Assistance does not save or publish financing work.
- Matching ordinary Save retains an unsaved run without restarting it. Relevant
  changes, round publication, sign-out and reset fence late completions. New rounds
  cannot restore the preceding round's analysis. Applicant assistance history
  remains private through resubmission and stays out of staff reads, print,
  notifications and review activity.
- Arabic and English correction journeys cover reviewer context, permitted
  actions, keyboard/source navigation, narrow layouts, partial findings, matching
  Save, restoration, clear and resubmission while analysis is unavailable.
  Runtime still has no live transport; all analysis here uses fake transports,
  with no paid inference. Later slot tasks and highlights remain separate tickets.

Verification:

- Typecheck, lint, production build and all 105 unit tests passed.
- The complete public-interface suite passed all 216 tests with real IndexedDB.
- Focused correction-response, resubmission and identity-assistance production
  suites passed 57 tests across Chrome, Firefox and WebKit. WebKit's default
  launcher lacked ICU libraries; all 19 WebKit tests passed on retry using the
  repository-documented `/tmp/rifd-webkit-run.sh` compatibility wrapper.
- Independent Standards and Spec reviews reported zero findings on each axis.
