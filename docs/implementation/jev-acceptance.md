# Focused evidence assistance acceptance

The operator accepted the Arabic result remaining undetermined after an
additional [Arabic rerun](#additional-arabic-rerun). No further collection is
needed for that request. Actual charges remain pending and activation disabled.

The operator subsequently authorized running both skipped checks and reporting
TypeSafe credit spent afterward. The [follow-up outcome](#operator-authorized-follow-up)
records a passing emulator check and two completed native examples. Actual
charges remain pending the operator's report, and live dispatch stays disabled.
The original bounded batch below is preserved as its own historical outcome.

Ticket [14](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/jev-evidence-assistance-implementation/issues/14-run-focused-acceptance-and-decide-activation-readiness.md)
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
validation prerequisites. Historical [pilot failures](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/jev-evidence-assistance/evaluation/report.md),
stopped-controller records, Saved sources/captures and policy versions remain
intact under the [preservation check](evidence/jev-acceptance/preservation.json).

## Review and closure

The independent Standards and Spec reviews compared this report and evidence with starting commit `0d26ace4f1e98985ca3989415ac4f34594e2eddd`. Standards found one minor prose issue, corrected before commit, and no code smells. Spec found no substantive omissions, scope creep or incorrect behavior. The final [batch record](evidence/jev-acceptance/batch.json) and [shutdown record](evidence/jev-acceptance/shutdown.json) close the shared time window. All 550 preserved files matched their preparation hashes. Remaining findings: Standards zero; Spec zero.

## Operator-authorized follow-up

The operator instructed, "do them both and for typesafe I will later after the
run will tell you how much credit is spent". The [authorization record](evidence/jev-acceptance/followup/authorization.json)
permits a limited follow-up with actual spending reported afterward. This
explicitly changes the earlier requirement to reconcile actual charges before
this smoke run. It does not mark historical billing reconciled, alter the
permanent accounting guard, enable hosted dispatch or restart the retired
controller. A separate local ledger records every new attempt before transport,
including a US$0.002 planning amount per dispatched attempt and unknown actual
charges. The runner did not reserve each example's entire two-attempt plan before
starting, and this report does not establish US$0.002 as a proven maximum charge.
This is a spending-control limitation of the local smoke runner. The last
privately recorded credit exceeds the protected balance after the recorded
planning amounts, but no fresh console credit observation was available.
Compliance with cumulative actual charges and current protected credit remains
unverified until the operator supplies actual spending and credit evidence.

The follow-up uses a conservative 11:02:00 UTC start, a collection cutoff of
11:11:00 and an 11:12:00 reporting deadline on 2026-10-18. It was explicitly
requested after the original batch. No autonomous additional collection or
replacement examples were added.

The existing Firestore emulator test passed with the repository's actual
deny-all rules and local `demo-rifd` database. It checks transaction contention,
shared admission limits, unknown-accounting stops, denied browser metadata reads,
privacy of identifiers and expiry cleanup. The final complete ordinary suite
with `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` passed **144 tests with zero skips**.
The emulator's focused run took 10.78 s and the complete suite took 5.87 s as
reported by Vitest. Typecheck passed. [Test evidence](evidence/jev-acceptance/followup/full-unit-with-emulator.log)
and the [focused emulator log](evidence/jev-acceptance/followup/emulator-test.log)
are retained. The original skipped result remains unchanged.

Both requested native examples completed using the dedicated secret and real
`jev-1.14.0` inference through the existing native/TanStack bridge and public
browser assistance workflow. The secret stayed in process memory and never
entered browser code or evidence files. The local smoke transport did not invoke
the disabled deployed function, so this does not establish a deployed native run.

| Example | Displayed findings | Shown / suppressed regions | Attachment preparation / before-dispatch / provider / run elapsed |
| --- | --- | --- | --- |
| [Arabic identity](evidence/jev-acceptance/followup/ar-identity-01.png) | Identity category and printed name present; readability and name comparison undetermined | **0 / 1** | 1.242 / 0.340 / 1.127 / 2.018 s |
| [English identity](evidence/jev-acceptance/followup/en-identity-10.png) | Identity category, clear text, printed name present and name consistent | **0 / 1** | 1.242 / 0.357 / 0.874 / 1.900 s |

The displayed panels and actual source rasters were inspected. Both printed
names match the supplied fictional declarations. The Arabic native readability
Score is 1.97, with a clear-readability probability of 0.97 below the fixed 0.99
probability threshold. Its comparison confidence is 0.82, below the fixed 0.99
comparison threshold, so the comparison is also undetermined. The English single-value probability is 0.98, below
the region eligibility threshold. Both candidate regions remain visibly
suppressed. No highlight was shown and no suppressed region counts as successful
highlight coverage. There are eight displayed finding values, including two
undetermined values, two suppressed regions and zero failed source pages.

Exactly **two provider attempts** returned HTTP 200 with usage, one combined
request per language. Both bound-verification stages were **skipped for
`no-eligible-regions`**. No automatic retries, replacement calls, failed attempts
or unknown transport outcomes occurred. The two unused attempt slots grant no
further collection permission. A local DOM setup error was corrected before any
provider dispatch; its empty ledger and failure log remain private.

[Sanitized native results](evidence/jev-acceptance/followup/native-results.json)
retain stage outcomes, source hashes, versions, findings, suppressions and
timings. Attachment preparation precedes the Run click. Before-dispatch time
includes run preparation; provider time measures the HTTP exchange, and run
elapsed starts at the Run click and ends at the terminal result. These two cases
do not establish latency percentiles. Raw responses, exact token usage, provider
request identifiers and the attempt ledger remain in ignored
`artifacts/acceptance-followup/`, with content hashes in the sanitized record.
Usage accounting reported by the application means tokens were supplied; actual
billing remains **pending the operator's credit-spent report**.

All 550 historical files still match their original hashes. No historical
attempt, policy, Saved capture or source changed. Keep dispatch disabled pending
actual reconciliation and an activation decision. Native name checking now has
this limited smoke evidence, while native bound verification and useful
highlights remain unobserved in the follow-up. All broad quality, cost and p95
claims listed above remain unverified. Post-run billing cannot retroactively
establish a reservation made before dispatch. This smoke runner's planning
limitation must not be treated as a successful spending-control acceptance.

Independent follow-up review found zero Standards issues and one Spec issue,
the reservation limitation now disclosed above. Native outcomes and test counts
matched the evidence. No further paid collection was used to address the finding.
The [closure record](evidence/jev-acceptance/followup/closure.json) confirms both
temporary local servers stopped within the authorized window. The production
admission and accounting implementations remain unchanged.

## Additional Arabic rerun

The operator requested another Arabic comparison, then explicitly accepted
"it is ok if it is undetermined". One additional native combined request returned
HTTP 200 with usage. The displayed name comparison remains **undetermined**.
There were no retries, no bound-verification call and zero displayed highlights.
The full two-attempt plan was recorded before dispatch in a separate ledger,
with a US$0.003 per-attempt maximum derived from the published default context
limit and price, rounded upward. Long context was forbidden. The definitely
unsent second slot was released after completion; the dispatched attempt remains
unreconciled. These are planning amounts, not actual billing evidence.
The [current model documentation](https://docs.typesafe.ai/models) supplies the
published context and pricing basis; account actual charges remain unverified.

The source, raster manifest, declaration state, questions, versions, dependencies
and plan exactly matched the preceding Arabic input. Display thresholds did not
change. The native match confidence increased from 0.82 to 0.85, still below 0.99.
The readability answer was invalid because its stated Score was 1.97 while its
distribution implied 1.98. The bridge retained the invalid answer in provenance
and excluded it from usable findings. The UI showed partial results and
readability unavailable; the candidate region stayed suppressed. This is a
partial native result, not a passing automated comparison or highlight.

Direct visual inspection confirms that the fictional printed name
"سالم نور التجريبي 107" matches the declaration. That manual source inspection is
separate from the automated undetermined result. [The source/result screenshot](evidence/jev-acceptance/arabic-rerun/ar-identity-01.png)
and [sanitized result](evidence/jev-acceptance/arabic-rerun/result.json) retain the
actual outcome. Attachment preparation took 1.246 s, provider HTTP time 1.308 s,
and Run-click-to-result time 2.236 s. The latter excludes attachment preparation.
There are now three native attempts across the operator-requested follow-up and
rerun. All historical records and prior results remain preserved. Actual credit
spent awaits the operator's report. Dispatch stays disabled.

All ten existing native-bridge regressions passed after the rerun. No production
source or test code changed; the preceding full suite's 144 passing tests remain
the full-suite evidence. Independent Standards and Spec reviews found zero new
issues. The [closure record](evidence/jev-acceptance/arabic-rerun/closure.json)
confirms the local server stopped and all 550 historical files stayed unchanged.
