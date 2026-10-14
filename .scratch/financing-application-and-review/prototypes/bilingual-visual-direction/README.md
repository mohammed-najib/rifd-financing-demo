# Bilingual visual direction prototype

Throwaway comparison for [Choose the bilingual visual direction](../../issues/05-bilingual-visual-direction.md). On 2026-10-14 the user chose A with "I accept A". Preserve all three directions as the reviewed evidence. The current main-workspace ticket holds the resolution; the copy of that ticket on this archive branch predates it. This is a visual decision asset, not the application implementation.

From the repository root, run:

```sh
python3 -m http.server 4175 --bind 127.0.0.1 --directory .scratch/financing-application-and-review/prototypes/bilingual-visual-direction
```

Open [the Arabic application scene](http://127.0.0.1:4175/?variant=A&screen=form&lang=ar). The HTML also opens directly from disk.

## Compare

Use the floating bar to cycle A, B, and C, select a scene, or change language. Left and right arrow keys cycle directions unless an input, select, editable region, or dialog has focus. The URL records the direction, scene, and language. Switching them retains in-memory form input. Refresh discards edits.

| Direction | Structure | Typography and color | Tradeoff to judge |
| --- | --- | --- | --- |
| A, Guided / خطوة بخطوة | Horizontal applicant steps, form beside summary, staff sidebar, spacious queue, information beside review checks | Noto Sans Arabic and Noto Sans, teal and pale green | Familiar grouping; longer queue and review pages |
| B, Ledger / دفتر واضح | Chapter rail, single-column fields, top navigation, queue grouped by status within each page, document before review details | Noto Naskh Arabic and Noto Serif headings, Noto Sans body, warm paper and rust | Larger headings and more reading space; grouping makes global sort order less obvious |
| C, Workbench / مساحة عمل | Persistent navigation, vertical form steps, compact queue, separate document list, preview, and review panels | Noto Kufi Arabic headings, Noto Sans body, blue and dark navy | More information visible together; denser Arabic labels and document filenames |

Retain رِفد / RIFD and its simple original CSS mark as shown in accepted direction A. It is not an existing bank identity adopted for the demo. No name availability or trademark research has been performed. The visible portfolio notice identifies the products, people, and financing as fictional.

## Scenes and content

- `screen=form` shows Mariam's incomplete Inventory draft, 200,000 YER over six months with a 250,000 YER purchase budget and empty purchase explanation. Continue exposes linked validation feedback. The summary updates with amount and term edits.
- `screen=correction` shows Huda's 600,000 YER request and the requested amount reduction and readable stock-plan replacement. A sample replacement changes only the in-memory preparation label. It does not save, resubmit, or verify a correction.
- `screen=queue` uses all twelve non-Draft records from the agreed seed contract, five per page. Search, status filtering, amount/date sorting, pagination, and record-preview dialogs work. A and C use stacked records on narrow screens. B uses a grouped ledger.
- `screen=review` uses Mariam's Equipment review in progress, 900,000 YER over twelve months. Two documents are accepted, Operating history has passed, and the remaining outcomes are outstanding. A uses modal previews; B and C also show an inline preview. The 81,000 YER installment follows the agreed 8% illustration.
- `screen=gallery` shows application and document status labels, mixed Arabic and Latin text, focus, validation, typography, and palette samples.

The visual reference identifiers `RF-2026-1001` through `RF-2026-1012` label these samples. They do not settle the production identifier format. Entered names, business names, and purchase text stay as entered when the UI changes language. Numeric display uses Western digits, translated currency labels, and Gregorian dates.

The source contracts are [application states](../../issues/01-application-states-and-corrections.md#answer), [products and requirements](../../issues/02-products-and-application-requirements.md#answer), [access and assignment](../../issues/03-demo-access-and-reviewer-assignment.md#answer), and [browser state and seed records](../../issues/04-browser-state-and-simulated-failures.md#answer).

## Limits

There is no persistent storage, API, sign-in, file parsing, upload, save, submission, decision, or workflow transition. Actions outside the visual comparison explicitly report that limitation. Document previews are HTML samples. The form demonstrates purchase-explanation validation, not the complete field-validation contract. The step strip is illustrative. The applicant draft document preview is deliberately brief.

Direction A now supplies the visual baseline. Exact copy, sizes, and navigation behavior can be refined during the next prototype. The gallery is a comparison aid, not an accessibility certification. Session interruption, conflict recovery, full screen navigation, printing, complete document evidence, all validation boundaries, and the rest of the journeys belong to [Validate applicant and staff screen flows](../../issues/06-applicant-and-staff-screen-flows.md).

There is no production build in this standalone prototype. The comparison bar is gated to local hosts or `file:`. All fonts are bundled locally with their [license](fonts/LICENSE.txt), and the prototype makes no third-party requests.

## Inspection

Inspected in Chromium at 390px for applicant layouts and 1440px for staff queue and review layouts. All five scenes were also rendered at 360px in both languages for all three directions, with no page-wide horizontal overflow or runtime exceptions. Visual inspection caught and corrected RTL progress fractions.

Checked linked validation and focus movement, input retention across language and direction changes, arrow-key editing inside a textarea, queue filtering and row previews, document-preview focus, Escape dismissal, and visible keyboard focus. No automated test suite was added to this throwaway artifact.

Preserve this artifact on local branch `prototype/bilingual-visual-direction`. Do not merge the throwaway code into main. The map remains a planning effort; later application code must implement the agreed behavior separately.
