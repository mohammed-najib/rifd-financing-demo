# Partial native validation result

Collection ended at the user's request to finish within ten minutes. The controller exited and its durable ledger records an explicit operator stop. No further call or restart is authorized. This is a stopped, incomplete validation result for [Run capped selection-bound Jev validation](../../issues/22-run-capped-selection-bound-jev-validation.md), supplied to [Decide release from selection-bound validation results](../../issues/23-decide-release-from-selection-bound-validation-results.md).

## What ran

One Arabic identity-document run made two successful native `jev-1.14.0` calls on 2026-10-17. The combined page request returned HTTP 200 at 17:27:25 UTC; the bound crop-verification request returned HTTP 200 at 17:27:26 UTC. The complete local run took **4.535 seconds**. Worker time was 2.836 seconds, including 2.419 seconds across the two provider stages and 0.200 seconds of crop preparation. Input-file loading took 0.978 milliseconds. This was one process-cold observation, with no claim about provider cache state or p95.

The local-only native and mapped capture preserves every answer, request identifier, numeric usage, source/page scope, target/crop binding and actual execution/crop-worker proof. The two requests returned three Choice answers, one Score, seven Nouls and one Box. Images, Box and the other primitives therefore have actual transport observations. Their correctness, usefulness and returned-region safety have not been independently adjudicated.

The signed activation manifest is `7e5670c39b6ce877df05bd6c3641a1a6b6f30630754bda554fe21f31c909758e`, executed from source/artifact commit `9a9b891c59d15e5833158bfc8389bebda7c8cdcb`. Initial freeze digest is `232748939156128da46cfeda45207db65aab0be1addecf72d2dc704aee17fd95`; executing graph digest is `472cb770feffc305df3e9be442b3cc88ff7f3af742dfcea31aaea8e74c14dc80`. Actual worker and crop-worker loaded bytes and fixed-bootstrap identities match the signed manifest. No code, bootstrap, dependency, question, policy or numerical meaning changed after the initial freeze.

Genuine runtime receipts and account captures were checked before ledger creation. Their identity-bound contents and signatures are kept local and excluded from this repository. No private signing key or passphrase was accessed. An initial automatic approval rejection was resolved by checking the generated fictional source, visible evaluation-only notices, exact payload hashes and genuine signed authorization; the same controlled launch was then accepted. Rejection itself dispatched nothing.

## Attempts and accounting

The [complete attempt inventory](attempt-outcomes.json) records two used development attempts and **294 unrun proposed attempts**. One of 149 planned runs produced outputs; 148 never started. No named standalone probe, pass B or evaluation ran. Four additional evaluation attempts outside the exact 96-attempt proposal remain unused.

The local-only stopped ledger snapshot retains both attempts as completed but unreconciled, plus 198 unused development reservations. Evaluation was never reserved. Those records are preserved, not reset or reused. The runtime ledger is halted and the controller process has exited.

Exact provider usage and account-cost figures are omitted from this repository. Actual new billed charges and the post-run balance remain unknown. The raw ledger and usage records stay in the local workspace.

The prior run records and native captures remain in the local workspace. They are excluded from this repository because they contain account-specific usage and billing details.

## What this result cannot establish

Independent native adjudications are zero. Arabic has one observed case awaiting adjudication; English has none. Category/support correctness, readability, useful findings, useful highlights and every finding-type harm gate remain undetermined. Zero adjudicated harms does not pass a zero-harm requirement.

All 568 actual numerical cells remain unset. The five-family and negative-alternative requirements were not evaluated. Pass A was not completed, the single revision point was not reached, no pass-B freeze occurred, and actual selection was never executed. There is no selected-policy artifact or final evaluation freeze. The uncalibrated composition produced no accepted automatic highlight.

Actual cost gates, bilingual coverage, four-page context fit and representative 12/35-second p95 remain unestablished. The first run's 4.535 seconds is descriptive. The earlier 1-hour-52-minute figure summed hard deadlines for all 149 runs; it was not a measured duration or a reason to keep running after the user's limit.

The full bilingual applicant/reviewer destination remains. The partial sample grants no release or handoff approval and does not narrow the required capabilities. `release-display-v1` and fixed `checked-static-capture-v1` Saved demonstrations remain authoritative. Actual billing evidence can be appended later without resuming this stopped experiment. The existing results decision owns that uncertainty and any decision about the unfinished validation route.
