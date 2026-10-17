# 04: Retain and clear applicable analysis

**What to build:** A visitor can reopen the latest applicable analysis, understand when it has become stale, and clear it without losing financing data or allowing an older completion to restore it.

**Blocked by:** [03: Check one-page applicant identity evidence](03-check-one-page-applicant-identity-evidence.md).

**Status:** ready-for-agent

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Browser-result compatibility](../../jev-evidence-assistance/spec.md#browser-result-compatibility); [Applicability, visibility and local retention](../../jev-evidence-assistance/spec.md#applicability-visibility-and-local-retention).

User stories: 39, 44, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57.

- [ ] Create a separately versioned IndexedDB analysis database behind the public demo interface only after financing startup establishes the current dataset. Preserve the financing database's strict store layout and logical schema; never insert analysis fields into financing records or import experiment ledgers.
- [ ] Persist the specified bounded source/context, page/stage coverage, native/mapped judgments, usage/accounting, timestamp, raster/crop manifest and version record. Keep prepared visitor images temporary. Key authority by dataset, application, slot, audience and authorized snapshot/workspace/round.
- [ ] Atomically retain one latest completed run with usable findings per context for seven days after actual completion. A terminal partial result can replace it with explicit scope; failure or cancellation preserves the previous applicable result and its existing expiry.
- [ ] Keep runs over unsaved edits or prepared files in view memory until an ordinary Save matches their actual inputs. Assistance never performs that Save. Report persistence failure as temporary-only availability.
- [ ] Recheck authorization, expiry, actual source, every model-visible context dependency and applicable versions on reopening, including offline. Show restored results as previous live analysis with their original dates, mark changed dependencies stale and remove current agreement/absence claims and active overlays.
- [ ] Require exact raster reconstruction and hash verification before restoring a recorded live overlay once highlights are implemented. Unavailable reconstruction preserves ordinary viewing. Reject incompatible/corrupt analysis without blocking valid financing reads.
- [ ] Invalidate pending generations before clear, reset, relevant edits, sign-out and view disposal. On reset, invalidate old dataset authority before separate analysis cleanup, recover interrupted cleanup during active use, and prove that late completions cannot populate either dataset.
- [ ] Send only identifiers/revision hints across tabs. Revalidate on commits, activation/focus, finding use and assessment writes, preserving unsaved input and the document being examined. An interrupted reload neither resumes a paid request nor replays an archived server answer.
- [ ] Keep applicant and reviewer records in their authorized projections; exclude assistance from print, notifications and review activity. Expire on reads and clean during active use without promising background deletion while the browser is closed.
- [ ] Exercise these outcomes through the public demo interface and real IndexedDB, using existing storage/startup, reset, stale-write and cross-tab fault patterns. Include refused effects and continued financing access after analysis-store failure.
