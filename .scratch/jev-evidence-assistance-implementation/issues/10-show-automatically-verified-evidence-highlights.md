# 10: Show automatically verified evidence highlights

**What to build:** A visitor can follow a named finding to an automatically verified region on the exact supplied page, while uncertain or invalid locations leave the finding and ordinary source inspection available.

**Blocked by:** [03: Check one-page applicant identity evidence](03-check-one-page-applicant-identity-evidence.md).

**Status:** implemented

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Preparation, geometry and request bounds](../../jev-evidence-assistance/spec.md#preparation-geometry-and-request-bounds); [Provisional experimental display contract](../../jev-evidence-assistance/spec.md#provisional-experimental-display-contract); [Applicability, visibility and local retention](../../jev-evidence-assistance/spec.md#applicability-visibility-and-local-retention).

User stories: 19, 23, 24, 25, 26, 37, 39.

- [x] Add fixed native Box targets, companion presence and multiplicity judgments, and one optional bound-verification stage per page through the shared controller. Verify the initial one-page identity journey; use the same named-target contract for later slots and multipage orchestration.
- [x] Implement lossless-boundary-pad-v1 by copying the integer enclosure of the exact fractional Box without scaling and padding white to minimum 280-pixel sides. Retain the original fractional edges, crop hash/transform and unchanged parent page.
- [x] Bind every verification answer to source, raster, actual context, policy/question versions, page, named target, exact rectangle and crop transform. A mismatch suppresses that location. Padding does not restore clipped glyphs or establish containment.
- [x] Apply all six bound Nouls: each of four original-edge clipping probabilities at most 0.01, field/period association at least 0.99 and competing-value probability at most 0.01. Require native presence and selected single occurrence with P(single) at least 0.99, complete-source coverage and all existing readability/category/repetition/conflict/freshness guards.
- [x] Keep nullable Box confidence unchanged and outside the display gate. Invalid, degenerate or padding-only geometry produces no overlay. Malformed Box output preserves independently valid non-Box findings; invalid usage or broader stage failures still make their affected stage unavailable.
- [x] Limit verification to one stage per page, at most nine crops and 54 planned Nouls under the 64-question ceiling, with at most ten assets including the unchanged parent. Honor combined resource/deadline limits without retries, resizing or extra repair calls.
- [x] Map normalized top-left coordinates using the actual raster scale, padding and current image-content rectangle. Resizing changes display geometry; RTL never mirrors physical axes. Recorded live overlays require exact raster reconstruction and hash matching before restoration.
- [x] Show suppression and a named finding/source route with no extra human-confirmation step. Keep model numbers in provenance and preserve the four separately certified static Saved overlays under their original policy.
- [x] Test exact binding, original-edge clipping, repeated/competing values, malformed/null Box, wrong transforms, padding, resize/RTL and known misleading pilot locations using fake transport and real fictional sources. Passing thresholds alone must never revive a known misleading region.

## Implementation

Implemented in commit `6f72ab6`.

The shared controller asks fixed native Box, presence and multiplicity questions
and runs at most one bound-verification stage per page. Lossless crops retain
fractional original boundaries, integer enclosures, white padding, hashes and
transforms. All six Nouls and the source, context, coverage and freshness guards
control display. Malformed Box answers preserve independent findings.

Named findings open the supplied source even when locations are suppressed.
Overlays use physical top-left coordinates through resize and RTL changes.
Reopening reconstructs and hash-checks the exact raster and crop before drawing.
Known misleading pilot targets remain suppressed on their original source and
page, including shifted rectangles. The four certified static Saved overlays
retain their original policy.

## Verification

- All 270 browser API tests and 105 unit tests passed.
- Typecheck, lint, production build and CSS source-isolation checks passed.
- Focused regressions cover lossless pixel copying, all six bound checks,
  malformed/null Box output, repeated and competing values, exact binding and
  restoration, padding, resize/RTL, resource/accounting stops, nine-crop and
  four-page request plans, and actual fictional pilot sources.
- Standards review found no documented-rule violations. Its optional worker
  supervision deduplication suggestion remains outside this ticket. Spec review
  confirmed the suppression and metadata fixes with no remaining findings.

Verification used fake provider transport. Live provider integration, service
admission, hosted operation and activation remain in tickets 11 through 14.
No paid inference or deployment occurred.
