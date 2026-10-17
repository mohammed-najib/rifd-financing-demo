# 02: Show the five checked Saved demonstrations

**What to build:** Applicants and reviewers can choose a labelled Saved demonstration from the document workflow, inspect its original evidence and findings, and use that fallback in an already-loaded application while offline.

**Blocked by:** None (can start immediately).

**Status:** implemented

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Fixed Saved demonstrations](../../jev-evidence-assistance/spec.md#fixed-saved-demonstrations); [Connected workflows and presentation](../../jev-evidence-assistance/spec.md#connected-workflows-and-presentation).

User stories: 36, 37, 38, 39, 43, 44, 45, 46, 47.

- [x] Expose explicit example selection through the public demo interface and accepted applicant/reviewer layouts. Read and render the five accepted checked captures, their original fictional sources and context, analysis dates, coverage and provenance.
- [x] Preserve checked-static-capture-v1, candidate-display-v1-dev10, evidence-questions-v1, full-page-pdfjs-5.4.296-v1 and jev-1.14.0. Keep the analysis date 2026-10-17 and check timestamp 2026-10-17T05:01:38.245Z; do not rescore captures using the provisional live policy.
- [x] Retain exactly four certified static overlays: Arabic financial period, English business address, English stock-plan budget and English financial period. The English identity example has no overlay.
- [x] Preserve the Arabic financial example's usable pages 1 and 2, unavailable pages 3 and 4 and suppressed comparisons. Retain the other examples' low presence, absent description, uncertified boundaries, wrong-period finding and suppressed incorrect average/absence findings exactly as specified.
- [x] Attach a capture to a current document only when actual bytes, task/slot, selected/prepared pages, actual context, applicable versions and current source authority all match. Otherwise open the example's own read-only source/context without findings or boxes on the visitor's document. Use the exact recorded raster for any permitted static overlay.
- [x] Keep Saved demonstration, previous live analysis, new live analysis and Illustrative example provenance distinct. Preserve native/mapped detail in explicitly opened provenance; show plain-language findings with page and named target in the normal workflow.
- [x] Provide Arabic/English, narrow-screen, keyboard and screen-reader access, source open/download and page navigation. The accepted example assets must remain usable in the loaded offline journey without creating a guest session or making inference requests.
- [x] Test exact capture selection, mismatch fallback, authority, preserved limitations and offline behavior through the public interface and browser. No application status, review check or assessment changes when a demonstration is opened.

## Implementation

`Demo.listSavedDemonstrations` and `Demo.selectSavedDemonstration` expose the five
checked bundles. Their original JSON, fictional sources and recorded rasters are
bundled under `src/demo/saved-demonstrations/`. All source and raster bytes are
hash-checked before use. The static path reads the retained findings directly.

Selection rechecks current source authority after asynchronous work. Pending,
failed, superseded and removed sources cannot fall back to an older saved file.
Correction context rejects edits to protected declarations through the same
permission rule as ordinary correction saving. Mismatches open the example's
own evidence and declarations.

Applicants can open the source inline beside their document task. Reviewers see
the source beside findings and their own assessment controls on wide screens,
with stacked content on narrow screens. Inspection confirmation remains explicit.
Native/mapped answers and version details appear in opened provenance.

Eager assets make every example available after going offline, including examples
not previously opened. This adds about 1.1 MB compressed to the initial bundle.

## Verification

- Typecheck, lint and production build passed.
- All 105 unit tests and both package-skill tests passed.
- All 177 public-interface browser tests passed against real IndexedDB in Chrome.
- All 603 production screen tests passed, 201 each in Chrome, Firefox and WebKit. All 15 new feature cases passed in that matrix.
- Standards review has no outstanding findings after the source-selection fix.
- Spec review has no outstanding findings after the source-selection and locked-field fixes.

The new public-interface regressions cover all five captures, four retained
overlays, partial coverage, suppressed comparisons, actual-byte matching, context
and version mismatches, prepared-source authority, saved offline restoration,
sign-out during a read and protected correction declarations. Browser cases cover
Arabic/English offline selection, keyboard use, narrow layouts, source navigation
and download access, provenance, context changes and separate human assessment.

Reproduce the checks with:

```sh
pnpm typecheck
pnpm lint
pnpm build
pnpm test
pnpm test:skills
pnpm test:browser:api --workers=3
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser --workers=3 --timeout=120000
```

The WebKit override uses the existing host compatibility launcher documented in
`docs/implementation/01-evidence.md`. Automated viewport and accessibility checks
cover the controls and findings. No new physical-device or screen-reader smoke
check, hosted deployment, provider inference or model-quality measurement is
claimed by this delivery.
