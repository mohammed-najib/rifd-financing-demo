# Original financing release acceptance

This matrix records acceptance of the original financing demo before Jev was added. It is historical evidence, not a current all-features status page. Use [testing](../testing.md) for current commands and [the AI guide](../ai-features.md) for current behavior.

The [accepted matrix](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review/issues/07-acceptance-and-implementation-handoff.md#requirement-to-evidence-matrix) is the source of these thirty rows. The [82 user stories](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review/spec.md#user-stories) refine the same contract. The table summarizes the original acceptance criteria.

The original application release was `1352c140782168ce9e77773547e35658c19cff45`, source fingerprint `b40ed3702f8c955998aaf4b38246930469a1cdbd47bbec6ba68357c0d8e1f8fd`, Hosting version `ea1a7ab0ece6377e`. See the [film manifest](../demo/film.json) and [reproduction guide](../demo-guide.md).

| ID | Accepted requirement | Scope |
| --- | --- | --- |
| A01 | Product selection and comparison | Product boundaries, comparison, draft switching |
| A02 | Guided application | Valid/invalid first submission and preserved draft |
| A03 | Draft management | Save/reload bytes, captured save and failures |
| A04 | Document checklist, previews and replacement | Real PDF/image preview, fallback and file envelope checks |
| A05 | Applicant workspace | Role projections, own lists, history and deep links |
| A06 | Printable application summary | Actual bilingual PDFs and public print equivalence |
| A07 | Staff queue | Search/filter/sort/paging/preferences and viewport cards |
| A08 | Reviewer assignment | Claim, transfer, assignment permissions |
| A09 | Review workspace | Five checks, notes, internal/public visibility |
| A10 | Correction request and applicant response | Target reasons, private saves and atomic resubmission |
| A11 | Highlighting and repeated correction rounds | Fixed baselines, dependencies and repeated rounds |
| A12 | Approval and rejection | Decision prerequisites; film adds a newly submitted rejection |
| A13 | Simulated stale-record conflict | Stale refusal, retained reason, reclaim and fresh confirmation |
| A14 | Post-decision repayment overview | Frozen schedule, rounding and stored Completed/Upcoming rows |
| A15 | In-app notifications | One notification per event, read flags and current destination |
| A16 | pnpm, React, TypeScript and Start SPA | Locked SPA build, static-only Hosting and exact assets |
| A17 | Typed asynchronous mocks and reusable domain rules | Public typed operations and pure domain boundaries |
| A18 | Fictional records and resumable local persistence | Thirteen-record seed and independent tab sessions |
| A19 | Demo reset | Cancel/failure/success, races and receipt replay |
| A20 | Arabic/English and RTL/LTR | Arabic/English preservation and mixed direction |
| A21 | Responsive applicant and staff screens | Measured CSS widths, both roles and native zoom |
| A22 | Keyboard navigation and accessible validation | Keyboard/focus/validation, four-scene Orca smoke |
| A23 | Reusable fields, statuses, dialogs, tables and attachments; gallery | Public gallery uses actual production components |
| A24 | Simulated sign-in, role switching, expiry and forbidden access | Expiry, same-identity recovery and neutral forbidden routes |
| A25 | Loading, empty states and recoverable failures | Startup, schema, file failures, empty states and ready-offline work |
| A26 | Performance checks | 24 Lighthouse reports, pending feedback and static delivery |
| A27 | Firebase Hosting and direct-link refresh | Dedicated preview/live IDs, refresh, routes and MIME/hash checks |
| A28 | Repository, flow sketch, focused tests and case study | Public repository, delivery docs, reviewed source and timed film |
| A29 | Browser-only data and permission limitations | Visible bilingual fictional/browser-local disclosures |
| A30 | Original optional extras and integration scope | Original browser-only financing boundary |

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

This matrix describes the original release. Use the [testing guide](../testing.md) to verify the current project.

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

## Reproducibility and limits

Follow the [development commands](../development.md) and the chapter guide from a fresh profile or use the confirmed public reset. Check the thirteen-record inventory and original unread notices before following the walkthrough. Save progress explicitly. Reset affects every tab in that profile/origin. Browser-local data can be inspected or removed by its visitor; identities and permissions are simulated. No request reaches a bank, no payment is processed and fresh-offline launch is outside scope. The public guide uses prepared fictional evidence.
