# 02: Show the five checked Saved demonstrations

**What to build:** Applicants and reviewers can choose a labelled Saved demonstration from the document workflow, inspect its original evidence and findings, and use that fallback in an already-loaded application while offline.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Fixed Saved demonstrations](../../jev-evidence-assistance/spec.md#fixed-saved-demonstrations); [Connected workflows and presentation](../../jev-evidence-assistance/spec.md#connected-workflows-and-presentation).

User stories: 36, 37, 38, 39, 43, 44, 45, 46, 47.

- [ ] Expose explicit example selection through the public demo interface and accepted applicant/reviewer layouts. Read and render the five accepted checked captures, their original fictional sources and context, analysis dates, coverage and provenance.
- [ ] Preserve checked-static-capture-v1, candidate-display-v1-dev10, evidence-questions-v1, full-page-pdfjs-5.4.296-v1 and jev-1.14.0. Keep the analysis date 2026-10-17 and check timestamp 2026-10-17T05:01:38.245Z; do not rescore captures using the provisional live policy.
- [ ] Retain exactly four certified static overlays: Arabic financial period, English business address, English stock-plan budget and English financial period. The English identity example has no overlay.
- [ ] Preserve the Arabic financial example's usable pages 1 and 2, unavailable pages 3 and 4 and suppressed comparisons. Retain the other examples' low presence, absent description, uncertified boundaries, wrong-period finding and suppressed incorrect average/absence findings exactly as specified.
- [ ] Attach a capture to a current document only when actual bytes, task/slot, selected/prepared pages, actual context, applicable versions and current source authority all match. Otherwise open the example's own read-only source/context without findings or boxes on the visitor's document. Use the exact recorded raster for any permitted static overlay.
- [ ] Keep Saved demonstration, previous live analysis, new live analysis and Illustrative example provenance distinct. Preserve native/mapped detail in explicitly opened provenance; show plain-language findings with page and named target in the normal workflow.
- [ ] Provide Arabic/English, narrow-screen, keyboard and screen-reader access, source open/download and page navigation. The accepted example assets must remain usable in the loaded offline journey without creating a guest session or making inference requests.
- [ ] Test exact capture selection, mismatch fallback, authority, preserved limitations and offline behavior through the public interface and browser. No application status, review check or assessment changes when a demonstration is opened.
