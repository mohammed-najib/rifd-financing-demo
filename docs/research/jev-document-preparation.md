# Jev document preparation and highlight coordinates

> Historical research. Repository state and provider facts below describe the inspection date, not the current checkout. See the [research index](README.md) and [current architecture](../architecture.md).

Researched 2026-10-17 for "Verify document preparation and highlight coordinates", part of "Plan thoughtful Jev evidence assistance". This report distinguishes source inspection, documented capabilities and proposed implementation approaches. It chooses no workflow policy and includes no inference calls or renderer benchmark.

## Findings that affect the map

The existing file boundary can supply evidence bytes and a content hash. PDF evidence needs page rasterization before Jev can inspect it. A returned region must retain the exact page, crop and transformation used for inference. A result about selected pages cannot establish a fact about unexamined pages. The current native PDF preview does not expose the page geometry needed by application-controlled highlights.

Both browser preparation and server preparation are documented possibilities. Neither has been tested in RIFD. The renderer choice, page limits, task coverage and accepted Arabic/English accuracy remain decisions or measurements for later tickets.

## Verified repository behavior

Source inspected at application commit `ae48d12e4524d0e1c560f88687154655df81b4ac`, using files in the main workspace. The report branch contains the same application source.

- `validateFileEnvelope` accepts PDF, PNG and JPG/JPEG names, consistent supplied MIME types and sizes from 1 through 5,000,000 bytes. This validates the envelope, not image decoding or PDF structure. [Domain validation](../../packages/rifd-domain/src/index.ts)
- Generated evidence uses 1000 × 1320 pixel canvases with loaded local Noto Sans and Noto Sans Arabic fonts. Identity evidence is PNG and purchase evidence is JPEG. Business and financial evidence are two-page PDFs containing JPEG page images. The PDF writer uses 500 × 660 PDF page units and image drawing operations; it does not write a searchable text layer. Reading the original PDF bytes, rather than regenerating pages from current application fields, preserves the evidence actually submitted. [Evidence generator](../../src/demo/evidence.ts), [PDF writer](../../src/demo/image-pdf.ts)
- `readFile` permits only files referenced by authorized snapshots, including relevant historical correction snapshots. Staff cannot read a private correction workspace. `readPrepared` additionally checks ownership and the editing context. Their public results contain copied bytes, name, MIME and hash. These are existing input boundaries, not permission to expose additional records to a service. [File reads](../../src/demo/index.ts), [public types](../../src/demo/types.ts)
- Current previews use an image element or native PDF object, with open/download links. They revoke temporary Blob URLs and suppress stale read completions on unmount. There is no page renderer, crop manifest, Box overlay, OCR engine or AI dependency. [Preview](../../src/ui/preview.tsx), [manifest](../../package.json)
- The application is a static SPA with browser-local persistence and simulated permissions. Loaded evidence and editing work offline. A remote preparation service would be new infrastructure; browser preparation would add assets whose offline loading behavior needs definition. [Architecture](../architecture.md)

Ran `pnpm skills:list --json` in the main workspace. The permitted skills cover application-field validation and repayment snapshots. Neither describes PDF/image preparation, so no unrelated package skill was loaded and no hidden guidance or dependency policy was changed.

## Jev's documented image boundary

The Images page currently documents the following contract:

| Property | Documented value |
| --- | --- |
| Encoding | Still PNG or JPEG; animated PNG rejected |
| Each dimension | 280 through 1568 pixels |
| Pixel area | 78,400 through 2,458,624 |
| Image file | At most 16 MiB |
| Request body | At most 32 MiB |
| Processed distinct images | At most 32 MiB combined |
| Expanded request | At most 32 MiB after replacing references |

Inputs outside the limits are rejected rather than resized. One invalid image fails the request. Metadata is removed without applying EXIF orientation, so upright pixels must be prepared beforehand. PNG/JPEG are the documented assets; PDF is not an image input. Multipart avoids base64's size expansion. Repeated asset references count repeatedly after expansion. Shared images can appear once in state and be named by path in questions. Image tokens count toward context and usage; an estimation formula is not yet supplied. [TypeSafe Images](https://docs.typesafe.ai/images)

Vision and Box remain experimental and require `TypeSafe-Danger-Zone-Images: true`. Box supports `jev-1.14.0`. Its coordinates are top-left-origin fractions of the addressed image, with ordered edges between zero and one. Each question returns one box and confidence. There is no absent-target response: even an absent target produces coordinates. The documented pattern pairs location with a Noul presence judgment. Thresholds need evaluation on the intended images. [TypeSafe Box](https://docs.typesafe.ai/primitives/box)

The Models page lists `jev-latest` as `jev-1.13.0` and `jev-preview` as `jev-1.14.0` on this research date. The chosen version should be sent explicitly. Its generic input table still says text, while the specific Images and Box pages describe image support. Treat this as a documentation inconsistency and recheck the image contract before implementation. The model's language guidance favors English accuracy and requires evaluation on other languages; it supplies no Arabic document-reading guarantee. [TypeSafe Models](https://docs.typesafe.ai/models)

## PDF pages and image normalization

PDF.js documents page retrieval, viewport construction and canvas rendering. A viewport combines scale, page rotation and conversion from PDF coordinates to top-left canvas coordinates. A page render must finish before its canvas is exported or reused. Display backing resolution can differ from CSS size; the inference raster must have deliberately chosen pixel dimensions rather than inheriting the screen's device-pixel ratio. [PDF.js browser examples](https://mozilla.github.io/pdf.js/examples/)

The API accepts PDF bytes as a typed array; transfer to its worker can take ownership of that array. It reports `numPages`. Its `stopAtErrors` option rejects some parse failures instead of attempting recovery; the default is recovery. `maxImageSize` skips oversized embedded images, so that option alone cannot prove a complete page render. Render options also control annotation inclusion, form appearances and optional content. These settings affect what the model sees and belong in preparation provenance. [PDF.js API source](https://mozilla.github.io/pdf.js/api/draft/api.js.html)

A proposed preparation sequence is:

1. Capture the authorized original bytes and content hash. Give the renderer a disposable copy if the same buffer is still needed elsewhere.
2. For PDFs, discover page count and identify requested pages before rendering. Record each selected page as pending, rendered, failed or skipped. Count only inputs to successful inference requests as analyzed.
3. Render each page using explicit rotation, dimensions and rendering settings. Do not substitute a PDF's embedded thumbnail or extract one embedded image as if it represented the whole page. The repository's simple image PDFs are a special format, not a general PDF parsing contract.
4. For photographs, decode orientation once, rasterize upright pixels and record the resulting dimensions. Resize, crop or pad this canonical raster with recorded geometry.
5. Export and validate the actual encoded output, then bind it to its source record and page. Keep the original untouched.

Steps above are an implementation option inferred from the documented APIs and current file model. Page selection and partial-analysis behavior remain product decisions.

`createImageBitmap` accepts Blob input, crop coordinates, EXIF-aware `imageOrientation: "from-image"`, explicit resize dimensions and resize-quality choices. Its default color conversion is implementation-dependent. This provides a browser normalization option, but EXIF rotations and reflections still need cross-browser fixtures. Do not both apply EXIF during decoding and manually repeat the rotation. [MDN createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap)

Canvas export can produce PNG, or a supported requested format such as JPEG. `toBlob` may return null and may throw for a canvas containing disallowed cross-origin content. The API has no explicit baseline/progressive JPEG switch. PNG is therefore a documented encoding option when exact JPEG encoder behavior is unknown; encoded size and document readability still need measurement. [MDN toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)

A geometry consequence of the published dimension limits is that a source's longest-to-shortest-side ratio above `1568 / 280 = 5.6` cannot fit using only uniform scaling. Padding, selecting smaller regions, or tiles would be needed. Enlarging a tiny scan can satisfy dimensions but cannot recover missing detail. Every padded or tiled result needs the inverse transform below. These are mathematical consequences and design options, not model quality claims.

For Arabic, source rasterization works from the document's visual content instead of reconstructing text from application fields. Rendering fidelity still needs checking. Generated RIFD PDFs contain shaped bilingual text in images; a text extraction API cannot recover a text layer that the writer never created. PDF.js exposes text-content and structure-tree APIs for documents that contain those structures, but a structure tree may be absent. No OCR capability was established by those APIs. [Local PDF writer](../../src/demo/image-pdf.ts), [PDFPageProxy](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFPageProxy.html)

## Mapping a Box to its source

The following transform is derived from ordinary affine geometry. It is a proposed contract to test, not existing RIFD code. Distinguish these coordinate spaces:

| Space | Identity and units |
| --- | --- |
| Original source | Original file hash; PDF page user units or encoded image pixels |
| Canonical page | Upright full-page raster, with dimensions and source-to-raster transform |
| Submitted image | Exact encoded page/crop/tile, pixel dimensions, scaling and padding |
| Displayed page | Current visible image content rectangle in CSS pixels |

For an image of width `Wi` and height `Hi` sent to Jev, convert each normalized corner to submitted-image pixels with `xi = u × Wi`, `yi = v × Hi`. Preserve fractional precision until the final draw or pixel crop.

If that submitted image comes from canonical-page crop `[cx, cy, cw, ch]`, drawn at actual scale `sx, sy` with left/top padding `px, py`, the inverse is:

```text
pageX = cx + (xi - px) / sx
pageY = cy + (yi - py) / sy
```

Use actual draw sizes after integer rounding to compute the scales. A box extending into padding does not identify source content there; retain the raw result and flag or clip the displayed intersection explicitly. Crops must retain their parent image identity, crop rectangle and page number. Repeat the transform for nested crops, or retain the composed matrix.

For rotation or reflection, transform all four corners, not only top-left and bottom-right. Keep the resulting quadrilateral or compute its enclosing rectangle for display. PDF.js's `PageViewport` supplies `convertToPdfPoint` and `convertToViewportPoint`, using the viewport's forward/inverse matrix. Store the viewport parameters, including page origin and rotation, rather than assuming a simple vertical flip. [PDF.js PageViewport source](https://raw.githubusercontent.com/mozilla/pdf.js/master/src/display/page_viewport.js)

For a centered `object-fit: contain` display of a canonical page `Wp × Hp` inside content area `Cw × Ch`, the derived display transform is:

```text
k = min(Cw / Wp, Ch / Hp)
offsetX = (Cw - k * Wp) / 2
offsetY = (Ch - k * Hp) / 2
displayX = offsetX + k * pageX
displayY = offsetY + k * pageY
```

Add the content area's screen position if drawing outside its positioned parent. Account for borders and any different `object-position`. `contain` can leave empty space within an element; multiplying normalized coordinates by the entire element bounds would put boxes in the wrong place. [MDN object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit)

The model's x-axis remains physical left-to-right in an Arabic interface. RTL text layout must not mirror image geometry. Resizing the preview changes only the display transform; replacing the source bytes, choosing another page, or changing preparation invalidates the old source association. These are implementation consequences of the coordinate definitions.

## Coverage and provenance

A proposed result record should carry enough information to reconstruct its input:

- Application, dataset, document slot, file identifier and source byte hash; relevant workspace or submitted-snapshot revision.
- Original page count when known, selected page numbers, and per-page preparation/request outcome. Preserve unknown count when parsing fails.
- Source page dimensions, rotation and viewport parameters; canonical raster dimensions; crop/tile ancestry, scale, padding and output dimensions.
- Prepared image hash, format, encoder settings, renderer version, relevant rendering options and preparation version.
- The exact image reference addressed by each question, question definition/version, requested and returned model IDs, raw answers, and analysis time.

This is a suggested evidence contract, not an adopted persistence schema. It lets later tickets distinguish document completeness from page selection, successful rendering from model completion, and old findings from current files. For example, analyzing page 1 of a three-page quotation can support a page-1 observation; it cannot establish that a signature is absent from the complete quotation. A crop-level absence is narrower still.

Presence and location must address the same image and target. Cropping away a heading, currency or period can remove context needed to interpret a figure. A page overview plus a detailed crop is one possible input combination, but the task must specify which evidence each judgment uses. No workflow-wide confidence or coverage guarantee follows from a valid rectangle.

## Browser and server preparation options

| Approach | Documented basis | Consequences to evaluate |
| --- | --- | --- |
| Browser PDF.js and browser image decoding | PDF.js browser rendering and `createImageBitmap` APIs cited above | Original files can stay in existing browser storage; only selected prepared images need cross the new inference boundary. Adds renderer/worker assets, local memory work and device-dependent decoding. |
| Server PDF.js and Node canvas | Mozilla's example loads typed-array bytes, renders a page with a canvas factory, exports PNG and cleans the page | Allows a pinned runtime and centralized limits, but requires uploading source bytes, server processing capacity and a returned transform manifest or matching raster. |
| Browser preview with server preparation | Composition of those documented approaches | Needs explicit source hashes and identical geometry or returned prepared rasters. Two independent renderers must not be assumed pixel-identical. |

The server example configures CMaps and standard-font resources. A deployed renderer must package the resources required by its chosen version and document corpus. These are feasible candidates, not verified deployment recipes. [Official Node PDF-to-PNG example](https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/node/pdf2png/pdf2png.mjs)

PDF.js requires matching library and worker versions. Its FAQ describes support differences among environments and warns against keeping every page rendered at high resolution. Pinning and testing the eventual package is necessary because the linked draft API/source pages can change. [PDF.js FAQ](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions)

## Cancellation, failures and resource bounds

PDF.js offers render-task cancellation, which rejects the render promise and may wait for a rendering pause. Its document loading task can destroy its worker and abort its network requests. Treat cancellation as its own outcome; do not mark the page analyzed. [RenderTask](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-RenderTask.html), [PDFDocumentLoadingTask](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFDocumentLoadingTask.html)

Browser `AbortController` can stop fetch and response consumption. That establishes local cancellation, not proof that a remote inference job stopped or was unbilled. Generation/file-hash checks are still needed before showing late results. `ImageBitmap.close()` releases bitmap resources; PDF page cleanup and revoking temporary preview URLs belong in disposal. [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort), [ImageBitmap.close](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap/close), [existing preview disposal](../../src/ui/preview.tsx)

A compressed-file limit does not bound decoded memory. An RGBA raster alone takes approximately `width × height × 4` bytes; decoder buffers, canvases, exports and copies add overhead. At Jev's largest square, that is 9,834,496 bytes per buffer, before overhead. Browser canvas limits vary by environment. OffscreenCanvas can move canvas work to a worker, but support for the entire chosen renderer pipeline still needs testing. [PDF.js memory guidance](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions#i-want-to-render-all-100-pages-in-a-document-at-a-high-resolution-is-it-a-good-idea), [MDN canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas)

Proposed resource controls to measure are source dimensions, output pixels, page count, concurrent renders, retained raster bytes and elapsed preparation time. Process pages with bounded concurrency and dispose unused rasters. No universal safe values or preparation latency were established here.

Distinguish malformed/unsupported input, password-required PDF, render failure, incomplete rendering, encoding failure, cancellation, request rejection and an ordinary unreadable-document judgment. PDF.js exposes a password callback; whether RIFD should support encrypted fictional files is still a product choice. Successful recovery from a damaged PDF is not evidence that all page content survived. [Loading-task API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFDocumentLoadingTask.html), [error-recovery controls](https://mozilla.github.io/pdf.js/api/draft/api.js.html)

## Accessible inspection options

A canvas alone does not expose its drawn objects as semantic HTML. Findings can therefore have a companion DOM list with the target, document name, page number, analyzed coverage and advisory result. An ordinary button can open the matching page and region, with keyboard controls for page navigation and zoom. If crop adjustment exists, keyboard-operable controls are needed alongside pointer dragging. This is a proposed interaction approach; the prototype must settle labels, focus and layout. [MDN canvas accessibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas#accessibility), [W3C keyboard guidance](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)

Text alternatives need to convey the visual information's purpose, and color cannot be the only way findings are distinguished. Numbered regions linked to named findings are one option. A label such as "business name region, page 2" explains a highlight but does not make all text in a scanned document accessible. Prepared fictional examples could have authored text equivalents; arbitrary image-only evidence needs a separately evaluated text alternative. A model's selected location must not be presented as verified transcription. [W3C non-text content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html), [W3C use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)

## What remains unverified

- No PDF.js package was installed, selected or executed. Browser and Node feasibility comes from official examples, not a RIFD integration test.
- No files were sent to TypeSafe. Actual acceptance of prepared RIFD pages, image-token usage, latency, cost and Arabic/English judgments remain unmeasured.
- Prototype fixtures should include all EXIF orientations, PDF page rotations and nonzero page origins, narrow images needing padding, multiple pages, crops crossing edges, absent/repeated targets, broken files and cancelled/replaced work.
- Compare original and submitted rasters for Arabic joining, small text, mixed Arabic/Latin digits and currency/period context. Measure localization against manually marked source regions, including transforms at different zoom levels and RTL layouts.
- Decide page selection, maximum work, partial coverage wording, encrypted-file handling and browser/server ownership through the human decision tickets. Select model thresholds only after representative evidence is available.

The research establishes available APIs and geometric requirements. It does not establish rendering fidelity, localization accuracy, accessibility conformance or production readiness.
