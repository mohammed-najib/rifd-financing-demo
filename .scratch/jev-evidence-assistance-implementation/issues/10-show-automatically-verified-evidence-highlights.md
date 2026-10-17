# 10: Show automatically verified evidence highlights

**What to build:** A visitor can follow a named finding to an automatically verified region on the exact supplied page, while uncertain or invalid locations leave the finding and ordinary source inspection available.

**Blocked by:** [03: Check one-page applicant identity evidence](03-check-one-page-applicant-identity-evidence.md).

**Status:** ready-for-agent

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Preparation, geometry and request bounds](../../jev-evidence-assistance/spec.md#preparation-geometry-and-request-bounds); [Provisional experimental display contract](../../jev-evidence-assistance/spec.md#provisional-experimental-display-contract); [Applicability, visibility and local retention](../../jev-evidence-assistance/spec.md#applicability-visibility-and-local-retention).

User stories: 19, 23, 24, 25, 26, 37, 39.

- [ ] Add fixed native Box targets, companion presence and multiplicity judgments, and one optional bound-verification stage per page through the shared controller. Verify the initial one-page identity journey; use the same named-target contract for later slots and multipage orchestration.
- [ ] Implement lossless-boundary-pad-v1 by copying the integer enclosure of the exact fractional Box without scaling and padding white to minimum 280-pixel sides. Retain the original fractional edges, crop hash/transform and unchanged parent page.
- [ ] Bind every verification answer to source, raster, actual context, policy/question versions, page, named target, exact rectangle and crop transform. A mismatch suppresses that location. Padding does not restore clipped glyphs or establish containment.
- [ ] Apply all six bound Nouls: each of four original-edge clipping probabilities at most 0.01, field/period association at least 0.99 and competing-value probability at most 0.01. Require native presence and selected single occurrence with P(single) at least 0.99, complete-source coverage and all existing readability/category/repetition/conflict/freshness guards.
- [ ] Keep nullable Box confidence unchanged and outside the display gate. Invalid, degenerate or padding-only geometry produces no overlay. Malformed Box output preserves independently valid non-Box findings; invalid usage or broader stage failures still make their affected stage unavailable.
- [ ] Limit verification to one stage per page, at most nine crops and 54 planned Nouls under the 64-question ceiling, with at most ten assets including the unchanged parent. Honor combined resource/deadline limits without retries, resizing or extra repair calls.
- [ ] Map normalized top-left coordinates using the actual raster scale, padding and current image-content rectangle. Resizing changes display geometry; RTL never mirrors physical axes. Recorded live overlays require exact raster reconstruction and hash matching before restoration.
- [ ] Show suppression and a named finding/source route with no extra human-confirmation step. Keep model numbers in provenance and preserve the four separately certified static Saved overlays under their original policy.
- [ ] Test exact binding, original-edge clipping, repeated/competing values, malformed/null Box, wrong transforms, padding, resize/RTL and known misleading pilot locations using fake transport and real fictional sources. Passing thresholds alone must never revive a known misleading region.
