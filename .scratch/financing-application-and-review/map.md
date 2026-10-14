# Plan the financing application and review platform

Labels: wayfinder:map
Status: resolved

## Destination

Settle the product, workflow, interface, browser-state, and acceptance decisions needed to implement the full one-month scope in [Financing application and review platform](../../docs/project-options/01-financing-application-and-review.md). The map is complete when the decisions support a concrete implementation handoff and no in-scope decisions remain open.

## Notes

- This is a planning effort. Implementation follows the map. Record each decision in its ticket and link its resolution from this index.
- The user confirmed the full scope and technical constraints on 2026-10-13: pnpm, React, TypeScript, TanStack Start in SPA mode, classic Firebase Hosting, typed mocked asynchronous APIs, fictional data, browser-local persistence, and simulated authentication and permissions.
- Give all journeys equal emphasis. The correction journey is one of them. Preserve the three-to-five-minute demo target while deciding how to show the breadth of the product.
- Include an early visual prototype with an original portfolio identity, Arabic as the initial language, English switching, mobile applicant screens, and desktop staff screens. Both roles still need responsive layouts and keyboard access.
- The source document defines the full feature scope and delivery requirements. These confirmed preferences take precedence where the source gives the correction journey priority.
- [Bank portfolio context](../../docs/research/bank-portfolio-context.md) supplies existing research on the public-service context and static hosting constraints. Staff procedures and product terms remain fictional. The repository has no application code or dependency manifest yet.
- Follow [wayfinder](../../.agents/skills/wayfinder/SKILL.md), [domain-modeling](../../.agents/skills/domain-modeling/SKILL.md), and [unslop](../../.agents/skills/unslop/SKILL.md) each session. Use [grilling](../../.agents/skills/grilling/SKILL.md) for grilling tickets and [prototype](../../.agents/skills/prototype/SKILL.md) for prototype tickets. Record newly agreed domain terms in the root glossary when they arise.
- Use the [local Markdown tracker](../../.agents/skills/setup-matt-pocock-skills/issue-tracker-local.md). Child issues live in `issues/`. `Status: open` means unclaimed; claim a ticket by saving `Status: claimed` before working. A `Blocked by: none` ticket has no prerequisites; otherwise every listed issue must be `resolved`. Select the first open, unblocked child by filename number. Append a resolution under `## Answer`, set `Status: resolved`, and add its named link below.
- Add research tickets when a decision needs new external facts. The repository now has commits but no configured remote. Preserve research on a local throwaway branch and link a readable research note in this workspace; a push requires a separately configured remote and is unavailable in the current local tracker setup.

## Decisions so far

<!-- Add one named link and a short gist per resolved decision ticket. -->

- [Define application states and correction rules](issues/01-application-states-and-corrections.md#answer): Six application states, targeted repeatable corrections with a separate applicant workspace, reviewer verification, and final decisions with defined visibility and prerequisites.
- [Define fictional products and application requirements](issues/02-products-and-application-requirements.md#answer): Inventory and Equipment products with bilingual field and document contracts, five dependent review checks, whole-rial repayment illustrations, and six core demo examples.
- [Define demo access and reviewer assignment](issues/03-demo-access-and-reviewer-assignment.md#answer): Three applicant identities and one interactive reviewer, a twelve-record queue, assignment and visibility rules, recoverable session interruptions, and explicit recovery from simulated reassignment conflicts.
- [Verify browser storage and client initialization facts](issues/08-browser-storage-and-client-boundary-facts.md#answer): Primary-source facts for durable file bytes, atomic IndexedDB writes, per-tab sessions, cross-tab notices, storage failures, and SPA client initialization.
- [Define browser persistence and simulated failures](issues/04-browser-state-and-simulated-failures.md#answer): IndexedDB file persistence, explicit saves, atomic versioned operations and receipts, cross-tab recovery, tab-local sessions, and confirmed browser-wide reset.
- [Choose the bilingual visual direction](issues/05-bilingual-visual-direction.md#answer): A, Guided, with the رِفد / RIFD identity, spacious bilingual applicant forms, a staff sidebar and readable queue, and preserved comparison evidence.
- [Validate applicant and staff screen flows](issues/06-applicant-and-staff-screen-flows.md#answer): Accepted routes, five-step applicant forms, private correction workspace, staff queue and review layouts, explicit recovery, accessible bilingual behavior, and applicant-visible print summaries.
- [Verify browser-test and static-delivery tooling](issues/09-acceptance-tooling-facts.md#answer): Primary-source test/browser distinctions, same-context storage tests, signed-in Lighthouse conditions and classic Hosting emulator/preview checks.
- [Define acceptance evidence and the implementation handoff](issues/07-acceptance-and-implementation-handoff.md#answer): Accepted requirement-to-evidence matrix, focused tests and manual checks, four-week order, performance/static-hosting gates, delivery package and equal seven-chapter 4:30 demo.

## Not yet specified

None. All in-scope decisions are resolved, and the implementation handoff is accepted.

## Out of scope

- Building, deploying, or publishing the application during this map. The decisions cover the eventual hosted demo, repository, user-flow sketch, focused tests, and case study.
- Real financing decisions, identity verification, bank integrations, production authentication, server-backed persistence, and real payment processing.
- The source document's optional extras: side-by-side application version comparison, a second interactive reviewer with a configurable checklist, and applicant-facing simulated conversations. The required stale-record conflict still needs a demonstration within the main scope.
- Applicant withdrawal and reopening final decisions are outside the supported workflow, as settled in [Define application states and correction rules](issues/01-application-states-and-corrections.md#answer).
- Interactive payment and installment-completion actions are outside the read-only repayment illustration settled in [Define fictional products and application requirements](issues/02-products-and-application-requirements.md#answer).
- Fresh offline launches, service-worker provisioning, and background server synchronization exceed the loaded browser-local demo scope settled in [Define browser persistence and simulated failures](issues/04-browser-state-and-simulated-failures.md#answer).
