# Draft validation protocol

This proposal belongs to **Choose the automatic candidate and authorize exact validation**. It authorizes no dispatch. The accepted 200/100 envelope and US$1/US$4 limits are inputs. The method, exact roster, collection mode, cutoffs and execution approval remain pending.

## Fixed artifacts and terminology

The machine-readable roster is [roster-draft.json](../../worktrees/jev-automatic-verification/automatic-artifacts/roster-draft.json). Its digest covers the exact original and new family IDs, source and raster hashes, context, expected-answer references, page scope, request kinds, maximum attempt counts, six controlled probes and execution order. The source/label provenance is [manifest.json](../../worktrees/jev-automatic-verification/automatic-fixtures/manifest.json). New label files live separately in `automatic-fixtures/labels/development/` and `automatic-fixtures/labels/evaluation/`.

An original page belongs to the original source. A selected page is explicitly included in the run. An analyzed page has usable native non-Box answers; this does not establish that its text is readable. A crop is a derived asset from a returned or explicitly nominated rectangle on one parent raster. It never adds to the original or selected page counts. Original, selected, analyzed and usable coverage must remain distinct.

For a true original one-page source, the first request combines page questions and declared-detail comparisons. For a longer source, one selected page still uses a separate comparison. Sources of up to four pages require all pages; longer sources require explicit selection. Incomplete original coverage cannot establish whole-source agreement or absence.

## Execution order and freeze points

| Work | Maximum attempts | Permitted evidence use |
| --- | ---: | --- |
| Development pass A, 44 original one-page families and one four-page family | 97 | Development only |
| Six named standalone probes below | 6 | Development only |
| Development pass B, the same 45 families | 97 | Development only; repetitions are not new families |
| Fresh evaluation, 35 unopened original one-page families, six new one-page families and two new four-page families | 100 | Final frozen evaluation only |

There are no attempts for automatic retries, uncertain-dispatch replacements, capture requests, repair calls or post-evaluation tuning. An ordinary capture is saved from an already counted response. A diagnostic request consumes its named roster slot. Skipped or cancelled slots do not authorize substitutions. Dollar, credit and accounting stops can end the experiment before these maxima.

Before pass A, a real human independently checks expected answers and the exposure/family audit. Freeze the source/raster/context inventory, pass-A questions, code/mapping/preparation/crop versions and plan. This human review is not a per-highlight product interaction. No new or historical claim that the agent checked its own fixtures substitutes for it.

Pass A proposes `collectDevelopmentEvidence=true`. This collects six raw verification judgments for each valid returned rectangle within the same bounded page verification request, even when a display cutoff has not yet been established. It never grants display eligibility. This is instrumentation for development, not a production eligibility rule. Its use needs the next decision's explicit acceptance. Without it, unset ordinary/verification cells cause the runner to skip verification, preventing the planned collection of calibration data.

Run the six probes after pass A with the same frozen question meanings. Then allow one deliberate revision point before pass B. Any changed meanings, mapping, transforms, policy or context require explicit new versions. Old measurements are ineligible for changed meanings merely because they have compatible types or a new version number. A change that cannot fit the same exact request/attempt bounds returns to the decision; it does not acquire extra attempts.

Freeze pass B before its first dispatch. It tests the selected candidate and provisional development-only cutoffs on the same families. After pass B, select final cutoffs using only development evidence. Freeze all inputs, independently checked labels, family audit, roster, model, questions, code, mapping, preparation, crop method, executable policy and numeric cutoffs before any held-out model answer is opened. Evaluation failures become development evidence only for a later separately authorized experiment. They cannot repair this evaluation and remain untouched validation.

The current inactive [freeze draft](../../worktrees/jev-automatic-verification/automatic-artifacts/future-freeze-draft.json) deliberately fails its verifier. The [ledger definition](../../worktrees/jev-automatic-verification/automatic-artifacts/future-ledger-definition.json) is inactive and provides no live transport. The temporary fake ledgers demonstrate local durability and reservation behavior; they are not an activated paid ledger or a deployed allowance store.

## Exact probes

Each probe is one request. The roster includes exact context, source/raster hashes, scope and any controlled rectangles. [Draft probe expectations](../../worktrees/jev-automatic-verification/automatic-artifacts/probe-expectations-draft.json) require independent human checking.

| Probe | Request | Purpose |
| --- | --- | --- |
| P01-ar-business-partial | Combined one-page, `dev-ar-business-partial` | Partial readability and independent presence for a blurred business name |
| P02-ar-identity-unreadable | Combined one-page, `dev-ar-identity-unreadable` | Arabic unreadability, absent readable target and undetermined category/support |
| P03-ar-purchase-clipped-wrap | Verification only, `dev-ar-purchase-wrapped` | Two nominated rectangles truncate the bottom of wrapped Arabic description or currency value |
| P04-en-purchase-competing | Verification only, `dev-en-purchase-competing` | Repeated English budget values inside a conservative nominated region |
| P05-ar-financial-max-nine | Verification only, `dev-ar-financial-nine` | Nine targets, 54 Nouls and ten real image assets |
| P06-en-financial-full-four | Comparison only, `dev-en-financial-four` | Three comparisons over the complete four-image source, including conflicting printed averages |

The verification-only probes use controlled draft source-region rectangles. They do not pretend to have received a Box from an uncounted first call. Their outputs could evaluate the narrow questions, not the automatic chain. Complete-chain observations come from the full runs. Fake answers supplied here establish neither.

## Proposed threshold selection

Every cell is keyed by language, slot, target, task and outcome. Category uses native confidence; readability uses the native probability mass of an unambiguous level, never a rounded fractional Score. Presence/absence and verification use native Noul probabilities or their complements. Multiplicity uses the native single probability. Box confidence has no calibrated gate; null remains null. Final locations still require valid geometry, complete usable original coverage, freshness, unique presence, conflict guards, bound verification and all six applicable measured checks.

For the next decision, propose this auditable selection procedure:

1. Record native values and independently checked labels for each eligible exact question/preparation meaning. Preserve negative examples, suppressed outputs and denominator counts. Group derivatives and repeats by source family; repeated passes do not multiply the family count.
2. Keep a cell unset unless it has at least five checked development families and the relevant failure alternatives. Five is a proposed minimum for selection, not statistical evidence that a 95% release target holds. The next decision can reject it; do not fill an empty cell with a pooled language or field cutoff.
3. Enumerate distinct observed candidate cutoffs, evaluate the resulting complete deterministic policy on all eligible development cases, and record every candidate's errors, harmful findings, useful coverage and family count. Require zero observed harmful findings. Select the lowest qualifying cutoff for useful coverage, with a fixed deterministic tie rule. If none qualifies, retain an unset cell.
4. Jointly evaluate all clipping/association/competition decisions in the location policy. Accuracy of an individual Noul cannot certify the combined overlay. Publish counts and uncertainty intervals; a tiny denominator cannot prove reliability.
5. Freeze selected numeric values and evidence references before fresh evaluation. No choice based on a held-out answer is eligible.

The executable draft currently has 568 unset cells. The label-only development audit identifies 313 with no planned example and 183 with fewer than five named families. These are per-cell counts, not independent-layout counts or observed calibration. The fixed arithmetic roster therefore cannot make every cell eligible under this proposal. The next decision must either revise the exact development roster before dispatch, replacing selected second-pass repeats with equal-attempt new development families, or accept continued undetermined outputs and the resulting likely coverage blockers. Such revisions require new assets, labels and a new digest before execution. No replacement is automatic. The fresh roster also needs an outcome-by-target human audit; metadata kind names are insufficient.

Financial amount findings retain the reporting-period guard. In particular, a partial run may leave the period unestablished and suppress an amount warning even where a conflict is visible. This conservative behavior needs review with the exact policy. A measured conflict from usable checked evidence can otherwise survive as a scoped warning while other pages are unavailable. Agreement and absence require complete usable original coverage.

## Accounting and access prerequisites

Immediately before future authorization/execution, independently verify current pinned-model/image access, published pricing, actual available credit, automatic refill disabled, billing/retention terms and the relevant allowance/authorization rules. Reconcile earlier actual validation charges, including delayed or unexplained charges. Historical usage estimates and balance snapshots do not establish an actual bill or current credit.

Use integer nano-dollar accounting. At the checked price, one 65,536-token reservation is US$0.002752512. Reserve every complete run before its first dispatch and the complete phase plan durably. The fake store enforces 200 development/100 evaluation, exact phase order, no repeated phase, immutable roster digest and simultaneous limits:

- Earlier reconciled validation charges plus new actual charges and outstanding pessimistic reservations must be at most US$1.
- Reconciled available credit minus outstanding pessimistic reservations must remain at least US$4.

The 300 new reservations total US$0.8257536. Adding the original token estimate yields US$0.831268704. This is reservation arithmetic, not verified account billing or an account-wide bill guarantee. Do not purchase credits, enable refill, use protected funds or transfer unused attempts between phases.

The local fake store writes a dispatch mark, fsyncs and renames before calling transport. A crash after that mark is uncertain dispatch even if transmission never began. Unknown dispatch/usage, an interrupted lock, excess token usage, access/resource/deadline failures or unexplained balances block further work. Known usage stays conservatively reserved until actual charges and the available balance are reconciled. Failed dispatched attempts remain counted. Cancellation does not establish provider cancellation or a refund. There is no automatic lock expiry, recovery dispatch or retry.

A new future execution ledger must begin with independently reconciled facts, the exact authorization/freeze evidence and no unresolved prior accounting. None has been activated here. The fake initializer accepts dummy accounting solely for tests and must not become a production initializer by renaming its mode.

## Runtime and interpretation

The deterministic order is ascending page calls, one separate multipage comparison when relevant, then ascending page verification. Each provider attempt has an eight-second limit. The server run keeps its 45-second deadline, including validation, encoding and crop work. Crop work uses one cancellable worker at a time, an eight-second page bound and 20-second cumulative preparation bound. Nine sequential stages may time out before completion. No source omission, downscaling after rejection, extra verification call, long-context opt-in or repair loop is permitted.

The unchanged release gates remain 95% category/support correctness, 85% readability correctness, 70% useful findings, 60% useful highlights, measured separately by language, and zero harmful findings. Actual per-run provider cost targets remain below US$0.01/US$0.02 and p95 goals remain 12/35 seconds. A nine-attempt reservation is US$0.024772608, already above the larger actual-cost target. Only actual measured usage can establish its cost, and failure is a blocker.

Keep native request/response timing distinct from complete local preparation, upload and composition, and distinguish both from deployed/mobile feature timing. The 43 fresh full runs include only two four-page families. They do not establish representative four-page p95 or new-layout reliability. No participant study or human-speed/success gate is added. Application integration, deployed authorization/privacy/resource checks, representative performance, billing and release decisions remain outstanding.
