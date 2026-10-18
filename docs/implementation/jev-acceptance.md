# Focused evidence assistance acceptance

Ticket [14](../../.scratch/jev-evidence-assistance-implementation/issues/14-run-focused-acceptance-and-decide-activation-readiness.md)
completed one bounded acceptance batch on 2026-10-18. **Do not activate live
dispatch.** The accounting guard still refuses `missing-reconciliation`, and
native readiness remains unestablished because both optional language checks
were skipped. Offline application checks passed. No new misleading finding,
unsafe displayed region, broken binding, permission leak or spending-control
failure was observed in the checked cases.

## Batch and accounting

The conservative shared window starts at 10:50:00 UTC, before the first recorded
clock observation at 10:50:22. Collection must end by 10:59:00, leaving the final
minute for shutdown/reporting before 11:00:00. Preparation, source inspection,
review and reporting all belong to this window. Command timestamps and elapsed
times are retained under [the evidence directory](evidence/jev-acceptance/).
This is one batch, with no controller restart or chained collection.

The [read-only accounting recheck](evidence/jev-acceptance/accounting-stop.json)
refused reservation. Two historical completed attempts still have unknown actual
charges; the existing usage export matches their usage but has no monetary
charges. The operator's last credit observation predates this batch and was not
refreshed. No token estimate was substituted for billing evidence. Ticket 13's
[operator waiver](evidence/jev-hosted/operator-resolution.json) resolved its
preparation scope and explicitly preserved this accounting guard.

The Arabic and English native one-page checks are **skipped**, not passed.
New provider attempts, reservations, findings, shown regions, suppressions,
failed attempts and unknown outcomes are all zero. Native preparation, provider
and end-to-end times are unavailable because no native run started. No new
inference usage or actual-charge evidence exists. Historical charges remain
unverified. No purchase, refill or protected credit was used.

Any future paid dispatch still requires actual reconciliation of all earlier
pre-feature charges and the two stopped attempts, fresh actual credit, and
durable pessimistic reservations. Actual charges plus outstanding reservations
must stay at most US$1; available reconciled credit minus reservations must stay
at least US$4. Failures and unknown outcomes count. This report grants no new
batch or attempt allowance. The accepted smoke limit remains at most two known
one-page examples, one Arabic and one English, with at most one combined request
and one bound-verification request each. Four attempts total include failures,
unknown outcomes and captures, with zero automatic retries or replacement calls.

## Executed software checks

| Check | Result | Command elapsed |
| --- | --- | --- |
| Focused server/provider/admission/accounting tests | 29 passed | 3.028 s |
| Focused existing browser regressions | 44 passed, zero failed/skipped, zero retries | 159.781 s |
| Full ordinary unit suite | 143 passed, one skipped | 5.855 s |
| Typecheck | Passed | 16.616 s |
| Lint | Passed | 22.492 s |

The [browser case results](evidence/jev-acceptance/focused-browser-results.json)
and command logs retain exact scope. Tests use dummy credentials and fake
provider transport. They cover malformed/null/degenerate Box isolation, all four
original-edge clipping guards, competing/repeated values, target/crop/source/
transform/context mismatches, partial coverage, period ordering, stale/late
results, unavailable stages and admission/spending stops. Sixteen negative
highlight scenarios preserve named findings while suppressing their region.
Five known misleading pilot targets, each with its original and slightly shifted
rectangle, remain suppressed in ten checks with zero verification dispatches.
These suppressions do not count as useful highlight coverage.

The fake four-page SDK workflow completes at nine attempts with eight shown
regions. Unknown verification usage stops at six attempts with zero shown
regions while retaining financial findings. Unknown page usage stops at two
attempts and preserves explicit failed/unchecked coverage. These are software
composition checks and establish no native four-page reliability or cost.

The first browser launch and first full unit run failed because the sandbox
denied local listening with `EPERM`. Both records remain. Repeating with approved
loopback access passed without code changes. The full unit suite's Firestore
emulator check was skipped because no emulator was started. Existing deployed
transaction and cleanup evidence is linked below; the skip is not a fresh pass.
No full browser matrix, fresh deployment, mobile performance run or build was
performed for this report-only change.

## Source and displayed-output inspection

All five unchanged Saved demonstrations were opened through the local UI and
their displayed findings and first-page regions inspected against their actual
bundled rasters. [Captured findings/text/timings](evidence/jev-acceptance/saved-inspection.json)
and five screenshots are retained. This replays exposed historical cases; it is
neither fresh native inference nor held-out evaluation.

| Saved source | Comparison outputs / withheld | Shown regions | Source inspection |
| --- | --- | --- | --- |
| [Arabic financial](evidence/jev-acceptance/saved-ar-financial-01.png) | 0 / 3 | 1 | Period region encloses July to September. Pages 3 and 4 remain explicitly unavailable. No full-document agreement is claimed. |
| [English business](evidence/jev-acceptance/saved-en-business-02.png) | 3 / 0 | 1 | Printed name differs; address and April 2022 start agree. Only the address is highlighted. |
| [English purchase](evidence/jev-acceptance/saved-en-purchase-03.png) | 2 / 0 | 1 | Description is absent; 361400 YER budget agrees and is highlighted. Equipment quotation behavior is unverified. |
| [English identity](evidence/jev-acceptance/saved-en-identity-10.png) | 1 / 0 | **0** | Printed fictional name agrees. Uncertified name boundary remains undisplayed. |
| [English financial](evidence/jev-acceptance/saved-en-financial-10.png) | 0 / 3 | 1 | Printed April to June differs from required July to September. The period region is safe; all comparisons, including incorrect average-absence answers, remain visibly withheld. |

There are six displayed comparisons, six withheld comparisons and four shown
regions across these five replays. Category/readability outputs are separate.
Of eight historical pages, six have usable analysis and two failed native Box
validation in the original pilot. Only the first page of the four-page source
was visually reinspected now; its full-document conflict remains untested.
The UI keeps experimental wording and original analysis dates visible.

Replay, including browser launch, source decoding and screenshots, took 10.080 s;
per-example replay times were 1.088, 0.570, 0.468, 0.630 and 0.922 s respectively.
These are local replay timings, not preparation/provider latency or deployed p95.
An initial completed replay was repeated within this batch after its detailed
JSON was overwritten by command timing metadata. Both command records remain;
only the second replay supplies the counts above. Neither replay invoked Jev.

The actual Arabic repeated-name source visibly contains two conflicting name
entries. The known financial rectangles clip amount digits. Their original
failures remain in the regression fixture and original pilot report; no passing
fake probability revives them. The English financial source visibly prints its
averages, so the historical absence findings must remain suppressed. No
capability was removed to obtain a passing result.

## Operational readiness decision

The [hosted-operation report](jev-hosted-operation.md) and its preserved evidence
record deployed direct/routed authorization, App Check, deny-all client metadata
rules, transactional allowances, unknown-accounting stops, disable controls,
secret isolation, non-cacheable responses, metadata-only telemetry and scheduler
cleanup. These are prior Ticket 13 observations, not cloud checks rerun here.
Earlier failed cleanup observations also remain preserved; the final normalized
cleanup comparison passed. Eventual Auth deletion, seven-day physical log
deletion and alert delivery remain unobserved.

The compiled `liveDispatchEnabled = false` and last recorded deployed
`enabled = false` remain unchanged. The provider secret is installed but unbound
in the disabled build. There is no TypeSafe spending alert; evidence of a
supported option was waived for Ticket 13. Operating targets and alerts are not
guaranteed account-wide caps. Activation must preserve the implemented controls,
bind the dedicated secret through the normal deployment workflow, and resolve
concrete prerequisites. No activation or deployment was performed here.

Keep live dispatch disabled. Accounting reconciliation is unresolved, both
native checks were skipped, and current live behavior with the dedicated key
was not observed. These are limitations and blockers, not model failures or a
request to recreate the retired selector, signed freeze or five-family process.
The scoped offline checks and Saved replay support their specific application
behaviors only. No broader defect requiring collection or a capability change
was found in this batch.

Broad bilingual accuracy/calibration, harm frequency, all slot/outcome behavior,
native four-page reliability, deployed/mobile p95 and human time savings remain
unverified. The desired 95% category/support correctness, 85% readability,
70% useful findings, 60% useful highlights, US$0.01/US$0.02 one/four-page cost and
12/35-second p95 targets remain goals, not measurements or new statistical
validation prerequisites. Historical [pilot failures](../../.scratch/jev-evidence-assistance/evaluation/report.md),
stopped-controller records, Saved sources/captures and policy versions remain
intact under the [preservation check](evidence/jev-acceptance/preservation.json).

## Review and closure

The independent Standards and Spec reviews compared this report and evidence with starting commit `0d26ace4f1e98985ca3989415ac4f34594e2eddd`. Standards found one minor prose issue, corrected before commit, and no code smells. Spec found no substantive omissions, scope creep or incorrect behavior. The final [batch record](evidence/jev-acceptance/batch.json) and [shutdown record](evidence/jev-acceptance/shutdown.json) close the shared time window. All 550 preserved files matched their preparation hashes. Remaining findings: Standards zero; Spec zero.
