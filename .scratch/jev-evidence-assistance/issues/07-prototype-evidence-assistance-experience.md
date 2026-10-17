# Validate the applicant and reviewer assistance experience

Type: prototype
Labels: wayfinder:prototype
Status: resolved
Assignee: the operator
Parent: [Plan thoughtful Jev evidence assistance](../map.md)
Blocked by: 04, 06

## Question

Can applicants understand how to improve a document, and can reviewers inspect the source behind a suggestion and retain control, in the existing bilingual responsive interface?

Create a throwaway prototype of the selected workflows with representative fictional evidence. Include Arabic and English, a narrow applicant screen, a desktop reviewer screen, keyboard access, page navigation and source highlights. Show useful, ambiguous, absent-target, incorrect, stale, pending, failed, offline and saved-demonstration states. Treat labelled fixture outputs as prototype data; live inference is not a prerequisite unless a separate decision specifically calls for it. Check that model terminology and confidence displays help a user make a decision before exposing them.

Resolve through a live user review using the prototype skill. Link the artifact and the accepted behavior; prototype code is not the application implementation.

Prototype the accepted contracts from [Define useful applicant and reviewer assistance](04-define-assistance-tasks-and-workflows.md#answer) and [Define result freshness, visibility and saved demonstrations](06-define-result-lifecycle-and-provenance.md#answer).

Use the accepted [workflow examples](04-define-assistance-tasks-and-workflows.md#workflow-examples), including locked-field document corrections, incomplete form comparisons, historical reporting periods and conflicting or partially analyzed pages. Reviewers continue authoring their own assessment and correction reasons.

Include the accepted [live-service policy](05-choose-live-service-and-spending-policy.md#answer): notice before live guest-session creation, page/context review before submission, explicit page selection when limits are exceeded, bounded preparation, busy/exhausted admission, explicit retries, unknown-usage unavailability, partial page findings and the absence of server answer replay. Show these with fixtures; cloud provisioning and live inference are not prerequisites for this prototype.

Use the [lifecycle resolution](06-define-result-lifecycle-and-provenance.md#answer) for restored and stale findings, seven-day retention and clearing, unsaved checks, cancellation and interrupted refresh, private correction handoff, reassignment and cross-tab conflicts. Demonstrate inspection confirmation through ordinary source viewing and the unopenable-source replacement exception. Distinguish a captured saved demonstration from an illustrative fixture, including a mismatched upload and unavailable reconstructed highlights. Keep fixtures labelled; obtaining real model captures is not a prerequisite for this interface decision.

## Comments

### Prototype prepared on 2026-10-17

The [review guide and artifact pointers](../prototype-review.md) link three structural variants inside the existing application detail screens. A presents advice beside the document, B pairs the source with findings and assessment, and C separates understanding, inspection and action into guided steps. The fixtures cover the accepted workflow, service and lifecycle cases in Arabic and English. All 31 scenarios remain labelled Illustrative example, including the simulated saved-demonstration presentation.

The full throwaway artifact is preserved locally on `prototype/jev-evidence-assistance`, initial commit `258a9d1`, with a runnable worktree at `/tmp/rifd-evidence-prototype`. It is neither merged nor published. TypeScript, ESLint, responsive browser checks and keyboard interaction checks passed. The guide records the verification scope and limits. There were no live inference calls, cloud changes or application-integration changes on main.

### Live review, layout choice confirmed on 2026-10-17

The user selected "A for applicants, B for reviewers" after the prototype was made available. This establishes the structural preference and is captured on the prototype branch in commit `52da069`. Review of the optional model terminology and confidence-number display is still pending; the ticket remains claimed until that live interface review is complete.

### Live review completed on 2026-10-17

The user selected "Keep plain language; model details only in provenance" for the remaining display question. Together with the accepted applicant/reviewer layout combination, this completes the interface decision. The resolution below records the accepted behavior and the limits of the prototype evidence.

## Answer

Resolved on 2026-10-17 through a live review of the throwaway prototype, using wayfinder, prototype, TypeSafe, domain-modeling and unslop. The user selected A for applicants and B for reviewers, then selected plain language with model details only in provenance. These are interface decisions; the prototype is not the application implementation or evidence of model accuracy.

### Accepted layouts and wording

Use A for applicants. Present the relevant finding beside the document task, followed by an inline full-source viewer when requested and the applicant's available actions. Keep the sequence usable on a narrow screen. The applicant can inspect, retain or replace evidence and edit permitted fields under the existing draft or correction rules. A document-only correction keeps unrelated declaration fields locked.

Use B for reviewers. Show the full source beside the findings and the reviewer's assessment controls on desktop, stacking the content on narrow screens. Preserve page navigation, ordinary source viewing, named findings and optional source highlights. RTL changes the reading layout without reversing physical image coordinates. C remains a preserved alternative, rather than the selected structure.

Use plain language in both roles. Findings describe readability, apparent document category, a specific comparison, uncertainty or unavailability in terms that explain what the person should inspect or do. Use wording such as "could not determine," "not found in the checked pages," "appears different" and "analysis unavailable" with the source and actual page scope. Do not put Choice, Score, Noul, Box, fractional Scores, probability distributions or confidence badges beside routine findings. They do not become an acceptance grade or a financing decision.

Model names, versions, native and mapped judgments, probabilities, confidence and analysis/preparation details belong only in explicitly opened provenance under the existing visibility permissions. Preserve their original semantics and unavailable values as required by [Define result freshness, visibility and saved demonstrations](06-define-result-lifecycle-and-provenance.md#answer). The review-only checkbox used to compare invented numbers in the archived prototype is not an accepted product control. This decision selects presentation, not numerical thresholds or claims that the model is reliable.

### Human actions and interface states

The [accepted workflows](04-define-assistance-tasks-and-workflows.md#answer), [service policy](05-choose-live-service-and-spending-policy.md#answer) and [lifecycle](06-define-result-lifecycle-and-provenance.md#answer) remain authoritative. The selected layouts express those contracts as follows:

- Keep advice separate from the applicant's edits and the reviewer's document assessment. Reviewers continue authoring assessment and correction reasons. Dismissal changes the suggestion display, not the recorded review outcome.
- Let reviewers inspect the ordinary current source without running assistance. Opening a page or highlight does not automatically confirm inspection. Keep explicit confirmation separate from the assessment; reset it when its source, dependent context, submission or assignment changes. An unopenable source permits an explained replacement assessment without claiming a successful inspection, while acceptance remains unavailable.
- Keep missing-declaration comparisons separate from category, readability and source findings. Show the expected historical reporting period and retain conflicting page entries. Name successful, failed and unchecked scope; partial work cannot imply whole-document agreement or absence. Uncertain or unusable locations have no overlay.
- Show the first-use transmission notice before live guest-session creation and show selected pages and relevant context before submission. Require explicit selection when the page limit is exceeded. Bounded preparation, busy service, exhausted allowance, unknown usage, failure, cancellation and explicit retry have availability wording and leave ordinary work accessible.
- Identify stale findings, restored previous analysis, temporary unsaved checks, interrupted refresh, seven-day expiry and clearing. Changed inputs disable affected current comparisons and overlays. Cancellation does not promise remote termination or an allowance refund. Interrupted work does not restart automatically, and server completion metadata cannot replay a lost answer.
- Keep applicant correction assistance private during the ordinary handoff. Reassignment does not transfer inspection confirmation. Cross-tab recovery preserves local edits and requires fresh authorized inspection of changed state.
- Distinguish a real captured Saved demonstration from an Illustrative example. A saved example keeps its original date, source, scope and provenance. A mismatched upload gets a separate example with its own evidence. Unavailable reconstruction leaves the ordinary source available without a box on an unverified rendering. All outputs in this prototype remain illustrative fixtures.

### Artifact and verification

The [review guide](../prototype-review.md) links the runnable preview, source, four screenshots and walkthrough. The full set of alternatives is preserved on the local throwaway branch `prototype/jev-evidence-assistance`. The initial artifact is commit `258a9d1`; the layout verdict is captured in `52da069`; the completed live-review verdict is captured in `9212ced`. The branch is not merged or published. Main retains the planning decision and its context pointers.

TypeScript and ESLint passed. Chrome exercised all 31 scenarios in all three layouts for Arabic and English, at 390px applicant and 1440px reviewer widths, with no browser page errors or horizontal overflow. Additional checks covered correction locks, missing-context edits, first-use notice order, page-selection limits, cancellation, page navigation, explicit confirmation, reassignment and the unopenable-source exception. Keyboard checks covered layout cycling, source focus, page navigation and preserving arrow keys in text controls. Four screenshots were visually inspected.

These checks establish that the fixture interface can express the selected behavior. They do not establish measured applicant or reviewer task success, screen-reader usability, model quality, calibrated display rules, PDF geometry, persistence, permission enforcement, service limits or cost. No live inference, cloud provisioning or deployment was performed.

### Handoff

[Define evidence quality and workflow acceptance gates](08-define-evaluation-and-release-gates.md) is now unblocked. It must evaluate the selected A/B interfaces and plain-language findings, including uncertainty, source inspection and provenance access, alongside the already required quality, lifecycle and service checks. If measurement reveals a specific additional decision or bounded experiment, create it there. No new ticket or fog graduation is justified by the accepted layout and wording choices alone.

[Confirm the specification and implementation handoff](09-confirm-specification-and-implementation-handoff.md) must carry this structure and provenance-only model detail into the implementation specification. Prototype code remains throwaway; the selected behavior needs proper implementation under the accepted contracts.
