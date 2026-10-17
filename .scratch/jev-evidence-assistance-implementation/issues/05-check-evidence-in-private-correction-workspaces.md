# 05: Check evidence in private correction workspaces

**What to build:** An applicant checks evidence while preparing requested corrections, sees findings tied to the actual reviewer reason and permitted targets, and keeps both unfinished work and assistance history private.

**Blocked by:** [04: Retain and clear applicable analysis](04-retain-and-clear-applicable-analysis.md).

**Status:** ready-for-agent

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Connected workflows and presentation](../../jev-evidence-assistance/spec.md#connected-workflows-and-presentation); [Applicability, visibility and local retention](../../jev-evidence-assistance/spec.md#applicability-visibility-and-local-retention).

User stories: 2, 17, 27, 28, 29, 30, 50, 51, 54, 55.

- [ ] Enable Check document in the current owner-authorized correction workspace using the same task interface as drafts. Include the actual reviewer-written reason, permitted targets, relevant declarations and current saved/prepared source in the dependency manifest.
- [ ] Use the slot tasks already implemented; later task definitions must work through the same context interface without requiring another correction workflow. Verify this slice with the available identity task and fake transport.
- [ ] Respect existing correction permissions in both UI and operations. A document-only target cannot unlock a field edit, advice cannot satisfy a correction target, and ignoring advice cannot bypass a required eligible changed file or normalized field change.
- [ ] Keep incomplete changes and analysis private until ordinary Save/resubmission rules apply. Resubmission publishes the correction response but never its applicant assistance history. Staff reads, print, notifications and review activity must exclude that history.
- [ ] Bind current authority to the correction round and workspace; invalidate relevant findings or pending work after source/detail changes, round closure, resubmission, reset or sign-out. Unsaved runs stay temporary until a matching ordinary Save.
- [ ] Use the actual initial submission month for correction financial context when that task becomes available, and preserve deterministic financing calculations and validation.
- [ ] Present Arabic/English findings beside permitted actions with accessible source navigation, narrow-screen support and explicit unavailable/stale/partial states. Analysis availability never adds a resubmission prerequisite.
- [ ] Extend public-interface correction tests with real IndexedDB for visibility, forbidden edits, unchanged financing effects, matching Save, round transitions and late completions, plus the user-visible correction journey.
