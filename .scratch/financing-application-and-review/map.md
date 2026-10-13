# Plan the financing application and review platform

Labels: wayfinder:map
Status: open

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
- No external research prerequisite is currently identified beyond the existing research note. Add research tickets when a decision needs new external facts. Git has no commits or remote yet, so a future research session must establish how to preserve and share its throwaway branch before attempting a push.

## Decisions so far

<!-- Add one named link and a short gist per resolved decision ticket. -->

## Not yet specified

- Further decisions may emerge from trying the bilingual prototypes with the agreed workflow. In particular, discover where Arabic content, narrow screens, or keyboard use make an agreed interaction impractical; the concrete problems are not known yet.

## Out of scope

- Building, deploying, or publishing the application during this map. The decisions cover the eventual hosted demo, repository, user-flow sketch, focused tests, and case study.
- Real financing decisions, identity verification, bank integrations, production authentication, server-backed persistence, and real payment processing.
- The source document's optional extras: side-by-side application version comparison, a second interactive reviewer with a configurable checklist, and applicant-facing simulated conversations. The required stale-record conflict still needs a demonstration within the main scope.
