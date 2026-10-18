# Original financing release acceptance

This matrix records acceptance of the original financing demo before Jev was added. It is historical evidence, not a current all-features status page. Use [testing](../testing.md) for current commands, [the AI guide](../ai-features.md) for current behavior, and [the local Jev record](../implementation/jev-local-development.md) for subsequent native smoke results.

The [accepted matrix](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review/issues/07-acceptance-and-implementation-handoff.md#requirement-to-evidence-matrix) is the source of these thirty rows. The [82 user stories](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review/spec.md#user-stories) refine the same contract. Every row below links implementation and verification evidence; original failed invocations stay failed and explicit rechecks supply passing coverage.

The original application release was `1352c140782168ce9e77773547e35658c19cff45`, source fingerprint `b40ed3702f8c955998aaf4b38246930469a1cdbd47bbec6ba68357c0d8e1f8fd`, Hosting version `ea1a7ab0ece6377e`. See [the actual live/preview identifiers](../implementation/23-evidence.md), [delivery result](../implementation/24-evidence.md), [film manifest](../demo/film.json) and [reproduction guide](../demo-guide.md).

| ID | Accepted requirement | Evidence and completion condition |
| --- | --- | --- |
| A01 | Product selection and comparison | [Product boundaries, comparison, draft switching](../implementation/03-evidence.md) |
| A02 | Guided application | [Valid/invalid first submission and preserved draft](../implementation/06-evidence.md) |
| A03 | Draft management | [Save/reload bytes, captured save and failures](../implementation/02-evidence.md) |
| A04 | Document checklist, previews and replacement | [Real PDF/image preview, fallback and file envelope checks](../implementation/21-evidence.md) |
| A05 | Applicant workspace | [Role projections, own lists, history and deep links](../implementation/20-evidence.md) |
| A06 | Printable application summary | [Actual bilingual PDFs and public print equivalence](../implementation/21-evidence.md) |
| A07 | Staff queue | [Search/filter/sort/paging/preferences and viewport cards](../implementation/08-evidence.md) |
| A08 | Reviewer assignment | [Claim, transfer, assignment permissions](../implementation/09-evidence.md) |
| A09 | Review workspace | [Five checks, notes, internal/public visibility](../implementation/10-evidence.md) |
| A10 | Correction request and applicant response | [Target reasons, private saves and atomic resubmission](../implementation/13-evidence.md) |
| A11 | Highlighting and repeated correction rounds | [Fixed baselines, dependencies and repeated rounds](../implementation/13-evidence.md) |
| A12 | Approval and rejection | [Decision prerequisites; film adds a newly submitted rejection](../implementation/14-evidence.md) |
| A13 | Simulated stale-record conflict | [Stale refusal, retained reason, reclaim and fresh confirmation](../implementation/16-evidence.md) |
| A14 | Post-decision repayment overview | [Frozen schedule, rounding and stored Completed/Upcoming rows](../implementation/15-evidence.md) |
| A15 | In-app notifications | [One notification per event, read flags and current destination](../implementation/07-evidence.md) |
| A16 | pnpm, React, TypeScript and Start SPA | [Locked SPA build, static-only Hosting and exact assets](../implementation/23-evidence.md) |
| A17 | Typed asynchronous mocks and reusable domain rules | [Public typed operations and pure domain boundaries](../implementation/architecture.md) |
| A18 | Fictional records and resumable local persistence | [Thirteen-record seed and independent tab sessions](../implementation/18-evidence.md) |
| A19 | Demo reset | [Cancel/failure/success, races and receipt replay](../implementation/18-evidence.md) |
| A20 | Arabic/English and RTL/LTR | [Arabic/English preservation and mixed direction](../implementation/21-evidence.md) |
| A21 | Responsive applicant and staff screens | [Measured CSS widths, both roles and native zoom](../implementation/21-evidence.md) |
| A22 | Keyboard navigation and accessible validation | [Keyboard/focus/validation, four-scene Orca smoke](../implementation/21-evidence.md) |
| A23 | Reusable fields, statuses, dialogs, tables and attachments; gallery | [Public gallery uses actual production components](../implementation/19-evidence.md) |
| A24 | Simulated sign-in, role switching, expiry and forbidden access | [Expiry, same-identity recovery and neutral forbidden routes](../implementation/20-evidence.md) |
| A25 | Loading, empty states and recoverable failures | [Startup, schema, file failures, empty states and ready-offline work](../implementation/17-evidence.md) |
| A26 | Performance checks | [24 Lighthouse reports, pending feedback and static delivery](../implementation/22-evidence.md) |
| A27 | Firebase Hosting and direct-link refresh | [Dedicated preview/live IDs, refresh, routes and MIME/hash checks](../implementation/23-evidence.md) |
| A28 | Repository, flow sketch, focused tests and case study | [Public repository, delivery docs, reviewed source and timed film](../implementation/24-evidence.md) |
| A29 | Browser-only data and permission limitations | [Visible bilingual fictional/browser-local disclosures](../implementation/01-evidence.md) |
| A30 | Original optional extras and integration scope | [Original browser-only financing boundary](../implementation/architecture.md) |

## Numbered story coverage

The story numbers below refer to the accepted spec and map all 82 stories to the matrix above.

| Stories | Acceptance rows |
| --- | --- |
| 1, 2, 11, 12 | A01 |
| 3-10, 13-15 | A02, A03 |
| 16-23 | A04 |
| 24-27 | A05 |
| 28, 29 | A15 |
| 30 | A06 |
| 31-35 | A07 |
| 36-38 | A08 |
| 39-42 | A09 |
| 43-48, 53 | A10 |
| 49-52 | A11 |
| 54-57 | A12 |
| 58, 59 | A14 |
| 60, 61 | A13 |
| 62-64 | A18, A24, A25 |
| 65-69 | A24 |
| 70 | A20 |
| 71 | A22 |
| 72 | A21 |
| 73 | A23 |
| 74-76 | A25 |
| 77, 78 | A19 |
| 79 | A29 |
| 80 | A28 |
| 81 | A26, A27 |
| 82 | A16, A17, A28 |

## How to assess the results

Rows A01-A27 and A29-A30 inherit the completed functional, bilingual/manual, performance and release checks. A28 is completed by the verified public repository/release, reviewed delivery commit, measured film and final checks recorded in [slice 24](../implementation/24-evidence.md). The film gives breadth; it does not replace the longer acceptance evidence.

[Slice 20](../implementation/20-evidence.md) reconciles 602 unique browser cases while preserving its failed original invocation. [Slice 21](../implementation/21-evidence.md) records ordinary-browser walkthroughs, actual print/native preview inspection, native zoom and four user-assisted reader scenes, including its original failures and rechecks. [Slice 22](../implementation/22-evidence.md#final-results) records the complete regression plus affected reruns and measured build. [Slice 23](../implementation/23-evidence.md) reconciles preview/live cases while preserving original storage and launch failures. Ordinary Firefox checkpoint completion is distinct from its failed teardown.

The final [24 raw Lighthouse reports](../implementation/evidence/24/performance/) are published with their [run](../implementation/evidence/24/performance/run.json), [source](../implementation/evidence/24/performance/source.json), [affected acceptance result](../implementation/evidence/24/performance/affected-run.json) and [feedback measurements](../implementation/evidence/24/performance/affected-measurements.json). Local absolute artifact paths in historical JSON describe the measuring machine. Public file links here are the portable evidence entry points. The delivery release also retains the original performance bundle and uncut recording/trace.

## Actual browser and device scope

The automated engines were installed Chrome 155.0.8059.39, pinned Firefox 157.0 and WebKit 27.2 on Linux. Ordinary Chrome and Firefox 155.0.1 supplied the manual checks recorded in slice 21 and hosted smoke in slice 23. Widths 360/390/768/1440 are CSS viewports, not physical devices. The follow-up records native 200% zoom separately from earlier unsuccessful zoom attempts. The four-scene reader smoke used Orca 50.2, ordinary Firefox 155.0.1 and Speech Dispatcher. No physical-device or branded Safari check is claimed. See the underlying observations for each scene and limitation.

## Decision and design provenance

These immutable GitHub commit links preserve accepted planning and throwaway design/research history. The delivery publishes archival evidence refs so these commits remain reachable. Prototype code is not production code and never proves runtime correctness.

| Artifact | Immutable source |
| --- | --- |
| Accepted spec and nine resolved decisions | [Delivery starting commit](https://github.com/mohammed-najib/rifd-financing-demo/tree/86a9523565d09ac6775a60f322a475dc32fe8807/.scratch/financing-application-and-review) |
| Guided A visual comparison | [37e6dbaf](https://github.com/mohammed-najib/rifd-financing-demo/tree/37e6dbaf98d6f7084c5ebe14f08336689238f3af) |
| Reviewed applicant/staff walkthrough | [b9e4f0d6](https://github.com/mohammed-najib/rifd-financing-demo/tree/b9e4f0d63c0cfa85d8a991b4947a49b3e7014b75) |
| Walkthrough acceptance | [498d045c](https://github.com/mohammed-najib/rifd-financing-demo/tree/498d045c1158413560865520ce7f1f6b68473a74) |
| Browser persistence research | [f9c11624](https://github.com/mohammed-najib/rifd-financing-demo/tree/f9c1162449b0889f26532f1ba5df4fa4ebcc5f15), [research note](../research/browser-persistence-contract.md) |
| Acceptance tooling research | [942fd529](https://github.com/mohammed-najib/rifd-financing-demo/tree/942fd5298b87782dead0de73fe71d0eaeb8cfe8d), [research note](../research/acceptance-tooling.md) |
| Production Tailwind migration | [Comparison and source inclusion evidence](../implementation/tailwind-v4.md) |

## Reproducibility and limits

Follow the [development commands](../development.md) and the chapter guide from a fresh profile or use the confirmed public reset. Check the thirteen-record inventory and original unread notices before following the walkthrough. Save progress explicitly. Reset affects every tab in that profile/origin. Browser-local data can be inspected or removed by its visitor; identities and permissions are simulated. No request reaches a bank, no payment is processed and fresh-offline launch is outside scope. The public guide uses prepared fictional evidence.
