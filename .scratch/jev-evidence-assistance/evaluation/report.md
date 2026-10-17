# Capped Jev feasibility evaluation

The bounded experiment is finished. It establishes real image, Choice, Score, Noul and Box responses through the selected TanStack/TypeSafe bridge, with low observed local latency and reported token cost. It does **not** pass the release gates. The candidate overlay policy produced five visibly misleading highlights. Arabic comparison rules remain unresolved, and full four-page comparison context fit was not tested successfully.

All 20 provider attempts were used, ten development and ten held-out. All returned HTTP 200 with numeric usage and the pinned `jev-1.14.0` model. Seventeen stages mapped successfully; three development page/probe stages became unavailable because a Box for an absent target had zero area. No retry, repair, replacement or extra capture call was made.

Detailed provider usage totals and derived cost are retained in local evaluation records. Account billing and balance were not independently reconciled. [Published pricing](https://docs.typesafe.ai/models)

## Scope and integrity

The frozen corpus has 80 fictional cases, 40 Arabic and 40 English, ten per slot/language pairing. Each pairing has five development and five held-out cases. The paid roster used eight distinct source documents across all four slots and both languages, plus a development probe over the same financial source. That is three development documents and five held-out documents, not 80 evaluated documents. The other 72 cases remain unrun.

The project prerequisites were recorded locally. This repository omits account-specific evidence and identifies no account state as current; verify all access, billing, and retention conditions before any future dispatch.

Related records are not translated or declaration-altered versions split between cohorts. The synthetic documents do share layout templates. The corpus includes clear, mismatched, absent, unreadable, repeated, conflicting, unrelated, mixed, rotated and misleading-instruction cases, with wrong-period financial evidence. It contains no narrow source needing padding. Padding, encrypted/oversized PDFs, failed rendering and maximum decoded-source admission therefore remain unverified, even though they belong to the broader acceptance plan. The paid subset does not cover every category, readability level or negative outcome.

Use the immutable [corpus manifest](corpus/manifest.json) together with [run status](corpus/run-status.json). The frozen manifest retains its pre-run state; run status records actual dispatch, complete/partial completion and mapped failures. Seven document runs completed both mapped stages. The four-page financial run remained partial.

Every paid response was checked against its retained HTTP body, frozen source/raster hashes, context and fixed questions. All 20 response IDs were present and distinct. The native distributions, fractional Scores, probabilities, Box coordinates/confidence and usage remain intact. [Capture checks](capture-checks.json), [all observations](observations.json), [attempt ledger](attempt-ledger.json)

## Bridge and preparation findings

The isolated bridge uses TanStack AI 0.69.0 and TypeSafe SDK 0.7.0. TanStack `decide()` constructs/maps Choice, Score and boolean/Noul judgments; one SDK request adds native Box questions and image assets. Captures are invocation-local. The observed maximum concurrency was two transport intervals, during the independent English development runs. Their question sets, native results and distinct response IDs stayed associated with their own invocations.

Twenty-eight offline tests passed using dummy credentials and fake transport. They cover one-call image/Box batching, four-image transport, concurrent isolation, native distributions, fractional Score, Noul probability, numeric/unknown usage, nullable Box confidence, malformed answers, retry suppression, cancellation/deadlines, durable phase budgets and the real SDK body type. Synthetic results establish integration behavior only. Live Box confidence was numeric in this sample; nullable confidence was tested synthetically. [Verification](verification.txt)

The first local execution exposed a request-size guard bug. The SDK supplies an encoded multipart `Blob`; the guard initially read `byteLength` instead of `size`. Seven SDK transport callbacks failed before network dispatch. The ledger remained ten unused reservations, with no dispatched timestamps, HTTP bodies or provider results. A failing fake-transport regression reproduced the bug. After fixing it, an explicit audit reused exactly those same known-unsent slots. No ledger reset or additional allowance was granted. Original local failures remain retained. [Recovery audit](pre-dispatch-recovery.json), [failing regression](request-size-regression-red.txt)

The 83 source pages were prepared as actual full-page PNGs. The paid pages were 1120 × 1568 pixels. Four pages totalled 7,024,640 pixels, below the combined bound. The extra probe reached the permitted 1568-pixel side boundary and the actual maximum suite of nine targets and 29 questions. Each page-stage request used its complete page raster. Long context and failure-driven downscaling were disabled. Inspection crops in the QA folder were made only after inference and never sent to Jev.

PDF.js 5.4.296 and its matching worker rendered the four-page Arabic PDF. An unpaid roundtrip re-rendered 13 pages from the eight roster documents plus rotated and partially unreadable examples. Every raster matched its frozen candidate exactly. This checks the local renderer and bytes, not mobile memory, all preparation guards or cross-browser behavior. [Preparation checks](qa/preparation-roundtrip.json), [roster images](qa/paid-roster-contact.png)

The provider accepted the full-page 29-question requests. The largest observed input usage was 10,192 tokens and the largest actual encoded request was 207,687 bytes. Image-token attribution is not separately reported. The financial comparison received **two** successful page images because pages 3 and 4 failed local Box validation. The promised four-image comparison with actual full-page images remains unmeasured. Fake four-asset transport cannot establish that context fit. No extra attempt was used to repair this missing observation.

## Frozen candidate policy and quality

[Candidate display policy](candidate-display-policy.json) was frozen from development captures before held-out dispatch. It is a pilot policy, not an approved release policy. Category requires a specific outcome and native confidence at least 0.99. Clear-readability wording requires P(level 2) at least 0.80 for Arabic or 0.93 for English; the other two wording rules remain unresolved because no development example exercised them. A fractional Score is retained as a score, not converted to a percentage.

English comparison confidence floors are 1.00 for consistent, 0.92 for different and 0.76 for not found, derived from the observed correct development outcomes. Arabic comparisons and unobserved decisive outcomes remain unresolved. Completeness, usable pages, compatible category and reporting-period guards suppress unsupported findings. Financial averages cannot receive a decisive comparison without a qualifying consistent-period finding. These floors are small-sample candidates, not calibrated language-wide thresholds.

Overlay candidates require clear readable evidence, a specific compatible category, valid geometry, presence at least 0.94 Arabic or 0.99 English, and a selected single occurrence with P(single) at least 0.83 Arabic or 0.84 English. No numeric Box-confidence cutoff was established. Confidence cannot establish presence or uniqueness. No policy or question was tuned on held-out answers.

The repeated-name held-out case demonstrates why these conditions are insufficient. Two incompatible name entries were visibly present. Jev returned presence 0.99, P(single) 0.90 and Box confidence 0.89, then located one entry. The document-wide Choice correctly returned conflicting entries, but the frozen overlay rule still admitted the single-entry proposal. That is an observed zero-harm gate failure.

Visual source checking found three clipped Arabic amounts and one English amount whose Box crossed the printed digits, plus the repeated-name failure. Of twelve admitted overlay candidates, four contained the complete frozen region and were certified useful; five were visibly misleading; three boundary/padding cases were not certified. The conservative region check failed eight proposals, which is not the same as proving all eight visibly misleading. [Visual checks](qa/highlight-review.png), [individual judgments](capture-checks.json)

There were 57 primary target judgments across eleven pages, including 24 clear unique targets. The candidate admitted twelve overlays and suppressed 45. Four certified highlights give 4/24 useful coverage, 1/16 Arabic and 3/8 English. The held-out subset had one certified highlight among seven clear unique targets. These denominators describe eight documents and do not turn target questions into independent documents. The probe is reported separately and excluded from primary quality counts.

Candidate category findings were correct on 6/6 displayed pages, clear-readability wording on 8/8 displayed pages and field comparisons on 6/6 displayed fields. Those small displayed sets conceal substantial abstention and unavailable work. Arabic comparisons displayed nothing. On the five held-out documents, only one field comparison was displayed. These figures cannot establish the accepted full quality or coverage gates.

Raw primary category answers matched 8/11 page expectations, with three financial-page abstentions. Nearest native readability levels matched 10/11 expectations; the blurred purchase case was not assigned the expected unreadable level, and the frozen policy abstained. Native field outcomes matched 13/18 scoped expectations, including only 7/10 held-out field outcomes. A partial comparison is judged against its actual scope, where agreement/absence cannot be established.

As a diagnostic of the SDK's 0.5 boolean mapping, presence direction matched 41/42 Arabic and 14/15 English target labels. This is not the product presence rule or an independence/calibration claim. The misses were the visibly printed business-name fields, at 0.21 Arabic and 0.41 English. These mismatch fixtures print a generic different-value phrase in that field. The human labels treat the field as present; fixture wording may affect what the model considers a business name. Presence success did not prevent the repeated-target failure. The one expected repeated target was incorrectly classified single.

Raw comparison failures included agreement from incomplete financial scope, not-found results for readable averages belonging to the wrong period, and a not-found budget result on unreadable evidence. The candidate scope/period/readability rules suppressed those claims. The Arabic misleading-instruction business case returned correct native field comparisons on this one document, which is useful evidence but not prompt-injection robustness.

## Checked saved demonstrations

Five [saved demonstration bundles](saved-demonstrations/index.json) retain actual responses, timestamps, source/context/version hashes and limitations. They cover all four slots and both languages across the selected examples. They are local artifacts, not installed or published application features.

The fixed examples permit only four individually certified overlays: the Arabic financial period, English business address, English purchase budget and English financial period. The English identity example retains its correct comparison with its uncertified Box suppressed. The Arabic financial example explicitly shows partial coverage; the old-period English financial example retains its suppressed/incorrect raw comparisons in provenance. No output was replaced with scripted success.

This post-capture selection is checking a fixed saved example, not changing the frozen live candidate or re-scoring the held-out set as a pass. Changed source, context, page selection or versions require showing a separate example rather than claiming a fresh check.

## Release implications and unmeasured work

The overlay zero-harm gate failed. Current strict Box validation also discards otherwise useful page judgments when an absent-target Box is degenerate. Arabic comparison rules, both non-clear readability descriptions, complete financial conflict handling and full four-page comparison context fit remain unresolved. The 80-case corpus has not been evaluated, and the five held-out documents cannot establish calibrated reliability or representative p95.

The local timings below exclude browser-process startup, deployed transport, application presentation and mobile conditions. First/subsequent local attempts are identified; provider backend coldness is unknown. No deployed latency, Google cost, participant task success or reviewer speed improvement was measured. The participant study was waived, not performed.

Production admission, Auth/App Check, transactional quota races, permissions, freshness, persistence, cleanup, logging/telemetry and direct endpoint checks remain implementation/launch work. The experiment deployed no cloud resources, changed no account settings, bought no credit and changed no application dependencies. The operator key is validated by T3 Env and retained only in the ignored local `.env`; the example is [.env.example](.env.example).

Carry these failures and gaps to **Choose release scope and measured display rules**. Do not treat local success, suppressions or checked saved examples as approval of live release. Any further inference or revalidation needs a separate bounded decision and budget.

## Recoverable assets and code

The exact live execution code is local branch `experiment/jev-feasibility`, commit `9e677de2cc205711a08c8e9ee9f3c4180c4abee1`. Frozen-policy scoring was committed at `6806e5c34632f2e61f96a777fd87be8b6d518bdf` before held-out answers were inspected. The [experiment source](../../worktrees/jev-feasibility/experiment/README.md), [provenance](experiment-provenance.json), [frozen inputs](frozen-inputs.json), [questions](question-definitions.json), [roster](corpus/paid-roster.json) and [operator/human prerequisites](human-corpus-review.json) are retained locally. No branch or capture was pushed or merged.

The tables below are generated from retained observations. Counts use primary pages and fields, excluding the repeated development probe unless stated. Displayed errors, abstentions and unavailable stages are separate; empty cells cannot pass a gate.

## Counts by slot and language

| Language | Slot | Corpus / dispatched documents | Available / primary pages | Category correct / shown | Readability correct / shown | Fields correct / shown | Certified / admitted highlights | Unique targets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ar | identity | 10 / 1 | 1 / 1 | 1 / 1 | 1 / 1 | 0 / 0 | 0 / 1 | 0 |
| ar | business | 10 / 1 | 1 / 1 | 0 / 0 | 1 / 1 | 0 / 0 | 0 / 0 | 3 |
| ar | financial | 10 / 1 | 2 / 4 | 1 / 1 | 2 / 2 | 0 / 0 | 1 / 4 | 13 |
| ar | purchase | 10 / 1 | 1 / 1 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 |
| en | identity | 10 / 1 | 1 / 1 | 1 / 1 | 1 / 1 | 1 / 1 | 0 / 1 | 1 |
| en | business | 10 / 1 | 1 / 1 | 1 / 1 | 1 / 1 | 3 / 3 | 1 / 2 | 3 |
| en | financial | 10 / 1 | 1 / 1 | 1 / 1 | 1 / 1 | 0 / 0 | 1 / 3 | 3 |
| en | purchase | 10 / 1 | 1 / 1 | 1 / 1 | 1 / 1 | 2 / 2 | 1 / 1 | 1 |

## Phase, abstention and raw denominators

Category/readability abstentions below concern available pages. The two unavailable primary pages are additional. Field abstentions include unresolved rules and scope guards.

| Phase | Language | Documents / pages | Category shown / abstained / unavailable | Readability shown / abstained / unavailable | Fields shown / abstained | Raw fields correct / asked |
| --- | --- | --- | --- | --- | --- | --- |
| development | ar | 1 / 4 | 1 / 1 / 2 | 2 / 0 / 2 | 0 / 3 | 1 / 3 |
| development | en | 2 / 2 | 2 / 0 / 0 | 2 / 0 / 0 | 5 / 0 | 5 / 5 |
| evaluation | ar | 3 / 3 | 1 / 2 / 0 | 2 / 1 / 0 | 0 / 6 | 5 / 6 |
| evaluation | en | 2 / 2 | 2 / 0 / 0 | 2 / 0 / 0 | 1 / 3 | 2 / 4 |

## Field outcomes

| Native outcome | Native selected | Correct for actual scope | Displayed | Displayed correct |
| --- | --- | --- | --- | --- |
| consistent | 8 | 6 | 4 | 4 |
| different | 3 | 3 | 1 | 1 |
| not_found | 4 | 1 | 1 | 1 |
| conflicting | 1 | 1 | 0 | 0 |
| cannot_determine | 2 | 2 | 0 | 0 |

## Capability observations

| Capability | Real observation | Limit |
| --- | --- | --- |
| Image input | Twenty successful native responses over full-page PNG inputs; Arabic and English content supported actual judgments. | Four-image comparison, image-token attribution, general scan quality and mobile behavior unmeasured. |
| Choice | Correct English mismatch/absence findings; Arabic conflicting-name comparison correct; three financial page category abstentions. | Raw field errors and weak displayed coverage; Arabic display rules unresolved. |
| Score | Fractional values/distributions preserved; clear wording correct on eight displayed pages. | Blurred evidence received an incorrect nearest raw level. No development negative readability case; two wording levels unresolved. |
| Noul | Separate presence probability retained; 55/57 primary diagnostic directions agree with labels. | Two printed business-name field misses and no protection against false single-occurrence judgments. |
| Box | Four source-checked useful overlays retained from these same responses. | Five misleading proposals, three uncertified boundaries and three unavailable stages from degenerate absent-target geometry. Numeric live confidence; nullable confidence tested only synthetically. |

## Individual provider timings and usage

Each row is one dispatched attempt, including validation failures. The first row is the first local fetch from the development process. The first evaluation fetch is also the first in a new phase process; later attempts are subsequent within that phase. None proves backend cold/warm state. No production p95 is claimed.

| Attempt | Phase | Document / stage | Images | Local invocation seconds | Input tokens | Mapped |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | development | ar-financial-01 / page-1 | 1 | 1.515 | 8027 | yes |
| 2 | development | ar-financial-01 / page-2 | 1 | 0.762 | 8027 | yes |
| 3 | development | ar-financial-01 / page-3 | 1 | 0.850 | 8026 | unavailable |
| 4 | development | ar-financial-01 / page-4 | 1 | 1.192 | 8025 | unavailable |
| 5 | development | ar-financial-01 / comparison | 2 | 1.188 | 10192 | yes |
| 6 | development | en-business-02 / page-1 | 1 | 0.891 | 6115 | yes |
| 7 | development | en-purchase-03 / page-1 | 1 | 1.094 | 5837 | yes |
| 8 | development | en-business-02 / comparison | 1 | 1.758 | 5602 | yes |
| 9 | development | en-purchase-03 / comparison | 1 | 0.609 | 5369 | yes |
| 10 | development | ar-financial-01 / page-4 | 1 | 0.723 | 8021 | unavailable |
| 11 | evaluation | ar-identity-06 / page-1 | 1 | 1.394 | 5547 | yes |
| 12 | evaluation | ar-identity-06 / comparison | 1 | 0.905 | 5145 | yes |
| 13 | evaluation | en-identity-10 / page-1 | 1 | 0.718 | 5541 | yes |
| 14 | evaluation | en-identity-10 / comparison | 1 | 0.650 | 5130 | yes |
| 15 | evaluation | ar-business-08 / page-1 | 1 | 0.897 | 6144 | yes |
| 16 | evaluation | ar-business-08 / comparison | 1 | 0.619 | 5666 | yes |
| 17 | evaluation | en-financial-10 / page-1 | 1 | 0.900 | 8010 | yes |
| 18 | evaluation | en-financial-10 / comparison | 1 | 0.798 | 5639 | yes |
| 19 | evaluation | ar-purchase-04 / page-1 | 1 | 0.714 | 5851 | yes |
| 20 | evaluation | ar-purchase-04 / comparison | 1 | 0.618 | 5398 | yes |

## Document preparation and local completion

These observations start after the headless browser process is running. Completion includes local preparation, waiting and capture handling, with CLI output rather than application presentation. The financial run is partial. The business run includes waiting while its paired purchase document was prepared.

| Phase | Document | Pages | Preparation seconds | Provider-run seconds | Local completion seconds |
| --- | --- | --- | --- | --- | --- |
| development | ar-financial-01 | 4 | 1.460 | 5.576 | 7.050 |
| development | ar-financial-01 probe | 1 | 0.613 | 0.738 | 1.366 |
| development | en-business-02 | 1 | 0.218 | 2.676 | 3.113 |
| development | en-purchase-03 | 1 | 0.199 | 1.725 | 1.934 |
| evaluation | ar-business-08 | 1 | 0.233 | 1.544 | 1.799 |
| evaluation | ar-identity-06 | 1 | 0.259 | 2.329 | 2.615 |
| evaluation | ar-purchase-04 | 1 | 0.219 | 1.358 | 1.607 |
| evaluation | en-financial-10 | 1 | 0.303 | 1.732 | 2.057 |
| evaluation | en-identity-10 | 1 | 0.182 | 1.394 | 1.601 |

Detailed development and held-out usage figures are retained in local evaluation records. Account billing reconciliation remains unmeasured.

