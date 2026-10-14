# Applicant and staff screen-flow walkthrough

Throwaway decision asset for [Validate applicant and staff screen flows](/home/mdnb/Dev/Projects/project_impress_bank/.scratch/financing-application-and-review/issues/06-applicant-and-staff-screen-flows.md). Prepared and accepted on 2026-10-14. The user replied, "I accept the proposed flows". The [screen-flow ticket](/home/mdnb/Dev/Projects/project_impress_bank/.scratch/financing-application-and-review/issues/06-applicant-and-staff-screen-flows.md#answer) holds the canonical resolution. This archive preserves the reviewed Guided A walkthrough.

The question is whether the proposed routes, screen grouping, next actions, and recovery messages let applicants and reviewers keep their place and distinguish unsaved input, saved progress, and submitted information.

## Open it

Open `index.html` directly. Fonts, styles, scripted scenes, and fictional records are embedded, so no network or installation is needed. For a local URL, run from this directory:

```sh
python3 -m http.server 4176 --bind 127.0.0.1
```

Then open [the Arabic short tour](http://127.0.0.1:4176/#/walk/tour/1?lang=ar) or [the English short tour](http://127.0.0.1:4176/#/walk/tour/1?lang=en).

`index.html` is the shareable artifact. `data.js`, `app.js`, `style.css`, `build.py`, and the two fonts are its editable sources. Run `python3 build.py` after changing them. The bundled font license is in `FONT-LICENSE.txt`.

## Review it

The seven-stop tour gives every journey one stop. Allow roughly three to five minutes for this overview. The seven chapter tabs contain the longer review, including alternatives and failures. Each step button loads a named planned state. Steps are illustrative snapshots, not an implementation of domain operations. Switching scenes resets the example.

1. Products, drafts and submission covers public comparison, sign-in, the applicant list, five form steps, invalid submission, product switching, and successful publication.
2. Documents and saving covers invalid files, progress, failed preparation, ready files, failed saves, saved replacements, preview failure, later typing during save, and failed submission.
3. Tracking, corrections and print covers notifications, target reasons, private partial saves, unchanged-response errors, resubmission, history, and the printable summary.
4. Staff queue and assignment covers all twelve submitted records, search, filters, sorting, five-row pagination, empty results, claiming, starting review, reassignment, and returning to the queue.
5. Evidence, checks and correction rounds covers missing evidence, previews, internal notes, target selection, waiting for the applicant, changed information, dependent checks, repeated rounds, and verification.
6. Decision, conflict and repayment covers reasons and confirmation, the simulated reassignment conflict, Load latest, unapplied reason text, reclaiming, renewed confirmation, approval, the historical schedule, and rejection.
7. Session, tabs and recovery covers language changes, departure prompts, independent tab sessions, newer data, private-workspace conflicts, expiry, unavailable records, startup, unknown outcomes, reset failure and success, and the component gallery.

Try typing a name or Arabic-Indic amount and switching language. Queue search, filters, sorting and pagination operate on the full seed list. Document previews are HTML illustrations of fictional evidence. Dialogs use the native modal element, support Escape, and return focus to their opener. The print scene invokes the browser's print dialog and has a separate print stylesheet.

The [reviewed proposal](screen-contract.md) preserves the route entry, saving, focus, loading, empty states, and recovery matrix presented to the user. It is historical decision evidence. Consult the [resolved screen-flow ticket](/home/mdnb/Dev/Projects/project_impress_bank/.scratch/financing-application-and-review/issues/06-applicant-and-staff-screen-flows.md#answer) for the canonical agreement.

## Fidelity and evidence

The prototype includes all thirteen agreed application records, the three applicants, the selectable reviewer, and the noninteractive colleague. It preserves the queue distribution, financial figures, product terms, correction targets, document and check outcomes, fixed domain date, and historical repayment example from the resolved decisions. Reference numbers are local illustrative identifiers.

This is a guided screen review. It does not implement IndexedDB, file-byte storage, hashing, durable preferences, session timers, actual multiple-tab synchronization, async operations, authorization, or operation receipts. Startup, reset, errors, and saved versus submitted states are depicted rather than executed. Refresh discards edits. Use the browser-persistence resolution as the eventual implementation contract.

JavaScript syntax checks passed. No automated tests were added or run. Browser inventory returned no available browser and opening the in-app browser failed, so rendered desktop/mobile layout, print pagination, and actual keyboard behavior have not been visually verified in this session. The user accepted the proposed behavior. The CSS includes responsive layouts and print rules, whose implementation still needs verification.

## Primary sources

- [Application states and correction rules](/home/mdnb/Dev/Projects/project_impress_bank/.scratch/financing-application-and-review/issues/01-application-states-and-corrections.md#answer)
- [Products and application requirements](/home/mdnb/Dev/Projects/project_impress_bank/.scratch/financing-application-and-review/issues/02-products-and-application-requirements.md#answer)
- [Demo access and reviewer assignment](/home/mdnb/Dev/Projects/project_impress_bank/.scratch/financing-application-and-review/issues/03-demo-access-and-reviewer-assignment.md#answer)
- [Browser persistence and simulated failures](/home/mdnb/Dev/Projects/project_impress_bank/.scratch/financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer)
- [Accepted Guided visual direction](/home/mdnb/Dev/Projects/project_impress_bank/.scratch/financing-application-and-review/issues/05-bilingual-visual-direction.md#answer)

Keep this code on its throwaway branch. The planning branch retains the user's decision and a pointer to this evidence after review.
