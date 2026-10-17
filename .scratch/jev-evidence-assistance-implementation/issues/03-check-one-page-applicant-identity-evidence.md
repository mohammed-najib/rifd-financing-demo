# 03: Check one-page applicant identity evidence

**What to build:** An applicant chooses Check document for one-page identity evidence in a draft, sees the actual source and declared context to be checked, and receives scoped category, readability, presence and name-support findings through the fixed analysis interface.

**Blocked by:** [02: Show the five checked Saved demonstrations](02-show-the-five-checked-saved-demonstrations.md).

**Status:** ready-for-agent

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [User tasks and capability traceability](../../jev-evidence-assistance/spec.md#user-tasks-and-capability-traceability); [Preparation, geometry and request bounds](../../jev-evidence-assistance/spec.md#preparation-geometry-and-request-bounds); [Provisional experimental display contract](../../jev-evidence-assistance/spec.md#provisional-experimental-display-contract); [Connected workflows and presentation](../../jev-evidence-assistance/spec.md#connected-workflows-and-presentation).

User stories: 1, 4, 6, 8, 17, 18, 20, 21, 22, 23, 27, 29, 30, 36, 37, 38, 39, 40, 41, 42, 43.

- [ ] Introduce the shared typed action/input/result contract and bounded one-page controller needed by this journey. Define extensible slot/audience/context identifiers, fixed question versions, dependency manifests, stage outcomes, provenance and a whole-run attempt plan so later slots and workflows reuse the same interface.
- [ ] Obtain saved or prepared evidence through authorized demo reads and use the actual bytes. Support a PNG, JPEG or proven one-page PDF; normalize orientation once and render complete pages with a pinned PDF.js renderer and matching worker/resources. Do not regenerate evidence from declarations.
- [ ] Enforce the source-byte, source-pixel, decoded-side, PDF-page, prepared-image, request-context and preparation-time bounds in the specification. Record source/raster hashes, dimensions, orientation, padding, viewport and transforms. Reject incomplete or encrypted/unparseable input without blocking ordinary source inspection.
- [ ] Compose one combined page-and-declaration stage only for a source proven to have exactly one page. Keep an allowance plan for at most two stages when bound verification becomes available. A selected page from a longer source cannot qualify for the one-page shortcut or complete-source claims.
- [ ] Use fixed category Choice, readability Score, named-target presence Noul and name-support Choice questions. Apply the accepted 0.99/0.01 defaults, retain native distributions and fractional Score, and distinguish a different printed name from an absent name. Missing or invalid declared names disable only their dependent comparison.
- [ ] Show accepted applicant layout A, selected source/context, explicit analysis coverage, named findings and optional provenance in both languages. Use the experimental notice and preserve ordinary edit, replace, retain, Save and submission behavior. Add no transcription, identity authentication or automatic financing action.
- [ ] Implement explicit run/cancel/retry and temporary in-view results, with dependency/authority generations preventing stale or late completions after replacement, relevant edits, sign-out or departure. Cancel and dispose workers, images and object URLs; navigation, reload and language changes never start a request.
- [ ] Verify the complete browser-to-controller-to-result path using dummy credentials and fake provider transport. Keep fake responses confined to tests or explicitly labelled illustrative demonstrations; ordinary runtime reports live analysis unavailable until the service integration exists.
- [ ] Keep the data and controller behavior independent of screen event handlers and pure financing helpers. Test authorized bytes, preparation failures, missing context, uncertainty, cancellation, no unintended writes and source access at the existing public interface plus focused browser checks.
