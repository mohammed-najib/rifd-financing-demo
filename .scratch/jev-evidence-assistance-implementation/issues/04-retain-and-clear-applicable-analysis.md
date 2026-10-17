# 04: Retain and clear applicable analysis

**What to build:** A visitor can reopen the latest applicable analysis, understand when it has become stale, and clear it without losing financing data or allowing an older completion to restore it.

**Blocked by:** [03: Check one-page applicant identity evidence](03-check-one-page-applicant-identity-evidence.md).

**Status:** implemented

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Browser-result compatibility](../../jev-evidence-assistance/spec.md#browser-result-compatibility); [Applicability, visibility and local retention](../../jev-evidence-assistance/spec.md#applicability-visibility-and-local-retention).

User stories: 39, 44, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57.

- [x] Create a separately versioned IndexedDB analysis database behind the public demo interface only after financing startup establishes the current dataset. Preserve the financing database's strict store layout and logical schema; never insert analysis fields into financing records or import experiment ledgers.
- [x] Persist the specified bounded source/context, page/stage coverage, native/mapped judgments, usage/accounting, timestamp, raster/crop manifest and version record. Keep prepared visitor images temporary. Key authority by dataset, application, slot, audience and authorized snapshot/workspace/round.
- [x] Atomically retain one latest completed run with usable findings per context for seven days after actual completion. A terminal partial result can replace it with explicit scope; failure or cancellation preserves the previous applicable result and its existing expiry.
- [x] Keep runs over unsaved edits or prepared files in view memory until an ordinary Save matches their actual inputs. Assistance never performs that Save. Report persistence failure as temporary-only availability.
- [x] Recheck authorization, expiry, actual source, every model-visible context dependency and applicable versions on reopening, including offline. Show restored results as previous live analysis with their original dates, mark changed dependencies stale and remove current agreement/absence claims and active overlays.
- [x] Require exact raster reconstruction and hash verification before restoring a recorded live overlay once highlights are implemented. Unavailable reconstruction preserves ordinary viewing. Reject incompatible/corrupt analysis without blocking valid financing reads.
- [x] Invalidate pending generations before clear, reset, relevant edits, sign-out and view disposal. On reset, invalidate old dataset authority before separate analysis cleanup, recover interrupted cleanup during active use, and prove that late completions cannot populate either dataset.
- [x] Send only identifiers/revision hints across tabs. Revalidate on commits, activation/focus, finding use and assessment writes, preserving unsaved input and the document being examined. An interrupted reload neither resumes a paid request nor replays an archived server answer.
- [x] Keep applicant and reviewer records in their authorized projections; exclude assistance from print, notifications and review activity. Expire on reads and clean during active use without promising background deletion while the browser is closed.
- [x] Exercise these outcomes through the public demo interface and real IndexedDB, using existing storage/startup, reset, stale-write and cross-tab fault patterns. Include refused effects and continued financing access after analysis-store failure.

Implementation notes:

- The existing one-page draft identity task now retains and clears results through
  the public assistance handle. Correction and reviewer task enablement remain in
  tickets 05 and 06. Context keys already separate audience, workspace/snapshot
  context and round.
- Live highlights remain disabled. This slice retains raster provenance without
  restoring any overlay. Ticket 10 must reconstruct and hash-check a raster before
  using recorded geometry.
- Browser tests cover offline restoration, partial replacement, matching Save,
  expiry, stale claims, storage corruption/refusal/rollback, reset cleanup recovery,
  late completions, cross-tab generations, private projections and bilingual clear.
  Runtime still has no live transport, and no paid inference was used.
