# Verify document preparation and highlight coordinates

Type: research
Labels: wayfinder:research
Status: resolved
Assignee: the operator
Parent: [Plan thoughtful Jev evidence assistance](../map.md)
Blocked by: none

## Question

Which documented image and PDF preparation approaches can turn the demo's existing PNG, JPEG and multipage PDF evidence into valid Jev inputs while retaining a trustworthy link from each returned Box to the source page?

Inspect the current evidence generator, file read boundary and preview. Verify official browser and rendering-library guidance for PDF page rasterization, page selection, image orientation, resizing, crops or tiles, and transforms between original page pixels, submitted image pixels, normalized boxes and displayed coordinates. Cover Arabic text, browser resource limits, cancellation, unreadable or malformed files, page coverage, and keyboard-accessible alternatives to overlays. Compare feasible client and server preparation approaches and identify what must be prototyped or measured. Preserve the distinction between whole-document evidence and the subset of pages actually analyzed.

Use the research and TypeSafe skills. Capture primary-source findings in `docs/research/jev-document-preparation.md` on throwaway branch `research/jev-document-preparation`. Inspect installed-library guidance under the repository policy when needed. Do not modify application dependencies, produce a production renderer, send documents to a service or choose workflow policy.

These facts inform [Define useful applicant and reviewer assistance](04-define-assistance-tasks-and-workflows.md) and [Define result freshness, visibility and saved demonstrations](06-define-result-lifecycle-and-provenance.md).

## Answer

Resolved on 2026-10-17 through primary-source research by a background agent using the research and TypeSafe skills.

[Jev document preparation and highlight coordinates](../../../docs/research/jev-document-preparation.md) records the existing file and preview boundaries, official image constraints, browser and server rendering options, and coordinate requirements. Existing generated PDFs contain page images and need rasterization for Jev input. The native PDF preview supplies no application-controlled page overlay. PDF.js documents browser and Node rendering, viewport transforms and cancellation; no renderer was installed or executed in this research.

Source file identity, selected page, preparation geometry and the submitted raster must remain associated with each result. A returned Box must map through any crop, padding, scaling and rotation before display; RTL text layout does not reverse image coordinates. A result from selected pages cannot establish a fact about unexamined pages. The report marks transform formulas and provenance records as proposed contracts, leaving ownership, page limits and interface policy to human decisions.

Arabic readability, rendering fidelity, highlight accuracy, resource bounds and accessible interaction still need representative tests or a prototype. No document was sent to TypeSafe.

The report is preserved in local commit `79b3e4ec0ab53e13073886c3f180a1194a3a4de6` on `research/jev-document-preparation`, with an identical readable copy in the main workspace. The branch is not merged. Automatic approval review rejected external publication to the configured GitHub remote; a push remains pending explicit user approval. Local evidence is available for the dependent decisions.
