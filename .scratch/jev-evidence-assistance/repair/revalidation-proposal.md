# Proposed repair-feasibility revalidation

This is a proposal for **Choose the repaired display policy and revalidation budget**. It authorizes zero dispatches. The recommendation is to retain a small 20-attempt experiment, ten development and ten held-out, with a US$1 accounting stop. Its purpose is to decide whether this repair deserves further work. The existing broader release gates remain blocked afterward unless separately established.

## Fixed candidate roster

The [machine-readable roster](../../worktrees/jev-offline-repair/offline-artifacts/revalidation-roster-proposal.json) records source-family IDs and source/old-label hashes. These are candidate records, not inferred outcomes. Independent humans must check the revised expectations before any new model output.

| Phase | Source family and task | Attempts |
| --- | --- | --- |
| Development | `ar-financial-01`, all four full-page images with nine targets per page, then complete document comparison. Revisit clipped amounts, degenerate absent-target Boxes and the fourth-page conflicting average. | 5 |
| Development | `ar-identity-06`, page and comparison. Revisit the false single-occurrence name and conflict guard. | 2 |
| Development | `en-financial-10`, page and comparison. Revisit clipped English amount and wrong-period averages. | 2 |
| Development | `en-purchase-04`, one unreadable-page probe. Deliberately designate this previously unrun family as development. | 1 |
| Held-out | `ar-identity-10`, page and comparison, clear identity from a distinct record family. | 2 |
| Held-out | `en-business-06`, page and comparison, conflicting entries. | 2 |
| Held-out | `ar-financial-10`, page and comparison, unexpected period. | 2 |
| Held-out | `en-purchase-10`, page and comparison, clear purchase from a distinct record family. | 2 |
| Held-out | `en-identity-04`, page and comparison, unreadable identity. | 2 |

The five proposed held-out families have no model output in the original captures/ledger. This session selected them using IDs, language, slot and kind metadata. Their source pixels and expected answers were not inspected. They are distinct fictional record families under the original manifest, and share the old synthetic layout templates. They are fresh model-output cases, not evidence of generalization to new layouts or real scans.

A human must confirm that none is a translation, declaration-altered copy or other derivative of an exposed family. Failed family audit stops the proposal; it does not authorize an unlisted replacement. If fresh layout families are required, independently authored fictional families must be supplied and a revised roster accepted before dispatch. Those assets are currently unavailable.

## Cells and limits

Report every task/language/outcome cell, including empty cells and unavailable attempts. The roster's metadata suggests the cells below; human prelabels, not these descriptions or model predictions, determine the actual denominators.

| Task | Arabic feasibility evidence | English feasibility evidence | Still missing or sparse |
| --- | --- | --- | --- |
| Category Choice | Financial/identity and uncertainty on unsuitable content | Financial/business/purchase/identity and uncertainty | All eight outcomes are implemented, but mixed, other, stock versus equipment and category errors are not comprehensively sampled in both languages. |
| Readability Score | Clear development and financial/identity held-out observations | Clear financial development, unreadable purchase development and unreadable identity held-out | No planned partially readable development example; Arabic unreadable and both partial wording cutoffs remain unmeasured. |
| Per-field support Choice | Complete four-page consistency/conflict, repeated-name conflict, wrong-period and clear identity | Wrong-period development, conflicting business and clear purchase held-out | All five outcomes exist, but no balanced not-found/different/consistent/conflicting/undetermined cell per language. Do not select missing cutoffs from held-out answers. |
| Presence Noul | Present, absent monthly targets, repeats and wrong-period fields | Printed amounts, purchase targets and unreadability | Unreadable low presence is not labelled absence. False-presence/absence and language calibration remain sparse. |
| Multiplicity and Box | Complete four-page conflicts and repeated-name regression; clear held-out identity | Clipped-amount regression and clear purchase/competing business held-out | Few unique targets; no fresh four-page held-out family, no padding case and no guaranteed live null-confidence response. |

Within each case, label category, per-page readability, field presence independently of value agreement, multiplicity including identical repeats, complete target glyph regions and competing regions, all requested support outcomes, period, source/page association and full versus actual selected scope. Human region checks must distinguish visible clipping from a conservative frozen-region boundary failure. Record all output suppressions and unopenable/unavailable sources.

## Freeze and execution order if separately approved

1. Accept or revise the candidate and this exact roster with the user. Resolve whether inspection-confirmed highlights are an acceptable useful Box role. Retain automatic live overlays as unverified. No extra call, OCR model, crop, downscale, long context or new service limit is proposed.
2. Independently human-check source pixels and revised labels before viewing new outputs. Keep held-out labels/results away from threshold selection. Seal source/raster bytes, context and reporting months, scope, split/family audit, labels/regions, roster and source-inspection instructions in a new directory. Never modify the original experiment assets.
3. Freeze the code commit, jev-1.14.0, all dependency/preparation versions, `evidence-questions-v2-repair`, mapping and policy structure before development dispatch. Record authorization, attempt partition, dollar stop and pricing basis. No dynamic question editing mid-run.
4. Execute development within ten attempts. Use the exact four images and all 29 page questions, then the three-field four-image comparison. Inspect all outputs against independent labels. If context does not fit, any harmful result appears, or the candidate cannot support a useful evaluated role, stop and return the limitation to the user. Do not spend remaining attempts patching the candidate.
5. Select cutoffs only for cells supported by correct development outcomes. Record distributions, misses, errors and abstentions and the selection rule. Keep every unobserved cell null. Tiny observed minima are experimental, not calibrated reliability. Freeze the entire policy and its development-evidence hashes before any held-out dispatch.
6. Execute the five held-out runs within their separate ten attempts. Any failure consumes its slot. Report the frozen policy once. An inspected failure makes that family development material for future revisions; it cannot be rerun as untouched validation. Capture available responses from these same attempts without an extra capture call.

The future task must supply a separately reviewed runner with durable full-run reservations and a new ledger. The current candidate deliberately has no live runner. A source label checker is a real human, not an agent claiming independence from its own fixture generation.

## Attempt and cost accounting

Twenty is a hard total maximum, partitioned 10/10 without transfers. Reserve each run's complete plan before starting. There are no bonus attempts for failure, replacement, validation, saved captures or uncertain dispatch. Disable all SDK retries. Count a timeout, unknown outcome, malformed response or abandoned dispatched connection as consumed. Do not infer a refund or remote cancellation. Proven unsent reservations need an explicit audit; never reset the ledger.

Run provider calls sequentially for this proposal. Keep eight seconds per attempt and 45 seconds per server analysis, with the existing browser/function/preparation bounds. Reserve remaining time before starting a stage. Native numeric usage above the 65,536-input-token reservation assumption halts further work while retaining the actual number.

The proposed US$1 stop is conservative accounting, not a guaranteed account bill cap. At the original documented US$0.042 per million input tokens, twenty attempts each reserving 65,536 tokens imply US$0.05505024 before any undocumented charges or rounding. Reverify current account pricing, access, image/model permission, sufficient existing credit, disabled automatic refill and terms before dispatch. Do not purchase credit or change account settings under this proposal.

Before each run, require reported cost plus pessimistic reserved cost to remain within US$1. Stop on unavailable accounting, unknown usage, authentication/access failure, overflow, harmful findings, deadline/resource failure or exhausted phase allowance. Reconcile available account charge/balance evidence after each phase; discrepancies suspend further work. Save no credentials or authorization headers in captures. Unknown charges remain unknown, never zero. Infrastructure cost and production billing remain unmeasured.

## What to observe and what this cannot approve

For each dispatched stage retain source/context/question/policy hashes, requested/returned model, timestamp and response ID, actual page assets, encoded bytes, native answers/distributions, mapping, location availability, usage, charge evidence and error classification. Preserve original false-single and clipping behavior separately from any revised response. Use a genuine null-confidence response only if one occurs; otherwise retain the synthetic-only limitation.

Measure preparation, SDK encoding, transport/model and local completion timings, and whether this is the first or a subsequent local call. Provider coldness is unknown unless independently observed. There are no additional timing repeats in the cap. Ten development and ten held-out attempts cannot establish representative p95, mobile/deployed completion or Google cost. Application presentation is absent from the CLI measurement.

Report raw and displayed correctness, useful coverage, abstentions, unavailable scope, full-value containment, competing values and human-confirmed overlays by language/task. Model-quality observations come only from new native responses. Replay and fake transport remain integration evidence. Human confirmation is not measured task success or faster review, and no participant study is reinstated.

The unchanged release gates are 95% displayed category/support correctness, 85% three-level readability correctness, 70% useful findings and 60% useful highlights, separately by language, with zero harmful findings overriding those percentages. The 12/35-second p95 goals and US$0.01/US$0.02 per-run provider-cost targets remain. A small feasible repair does not pass these gates by omission. Broader independent families, balanced outcome/language/task cells, representative timing and the existing functional/operational launch checks need separate scoped work and authorization.
