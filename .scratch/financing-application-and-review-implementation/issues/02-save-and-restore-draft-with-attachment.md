# 02: Save and restore a draft with a real attachment

**What to build:** A narrow draft edit and document slot that saves raw input and real file bytes together, restores after refresh, previews files, and recovers from failed or uncertain saves.

**Blocked by:** [01: Open the bilingual demo and inspect seeded applications](01-open-bilingual-seeded-demo.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 8, 9, 10, 16, 17, 18, 19, 20, 21, 22, 23, 64, 74 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Browser persistence and simulated failures](../../financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer); [Products and application requirements](../../financing-application-and-review/issues/02-products-and-application-requirements.md#answer).

- [ ] Edit one field and the product-specific document slot on Mariam's seeded draft. Save incomplete or invalid raw progress and prepared file bytes together, with saving/saved/failed and last-save feedback.
- [ ] Support samples/local fictional PDF, JPEG and PNG, envelope boundaries, SHA-256 identity, deterministic progress, ready-versus-saved labels, protected previews and allowed fallback.
- [ ] Add the complete application-mutation contract through this save: transactional workspace/dataset/session checks, captured payload, receipts, exact replay, changed-intent rejection, unknown-outcome inspection and post-commit notification semantics.
- [ ] Preserve previous files on failed replacement, selected files on preparation failure, ready files on save failure, and edits typed after a save begins. Ignore superseded late results.
- [ ] Introduce labelled slow/next-upload/next-save/next-storage-write controls with the specified timing and one-shot consumption. Future mutations must extend these same controls and guarantees.
- [ ] Prove actual bytes after refresh, file-envelope boundaries, transaction abort without partial effects, receipt replay, outcome inspection and saved-versus-unsaved distinctions using the public interface and real screens.
