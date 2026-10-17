# Review the evidence assistance prototype

The prototype supports [Validate the applicant and reviewer assistance experience](issues/07-prototype-evidence-assistance-experience.md#answer). The ticket holds the accepted resolution from the completed live review. This guide describes how to inspect the preserved artifact.

## Open the preview

- [Applicant, layout A](http://127.0.0.1:5187/applications/RIFD-2026-001/edit?step=documents&prototype=evidence&variant=A). Choose Mariam Salem.
- [Reviewer, layout B](http://127.0.0.1:5187/staff/applications/RIFD-2026-007?prototype=evidence&variant=B). Choose Salma Nasser. Use Switch identity if a different identity is already active.

Use the header language button for Arabic or English. The bottom arrows compare A, B and C on the same route. The scenario menu exposes the 31 scripted examples. The dashed frame contains the throwaway prototype. Its evidence is separate from the surrounding application's uploads, and actions inside it change memory only. The normal controls outside the frame still operate the local financing demo.

| Layout | Structure |
| --- | --- |
| A | Advice first, full source opened inline, human actions below |
| B | Source beside findings and reviewer assessment, stacked on narrow screens |
| C | Understand, inspect and act in separate steps |

## Try the behavior

1. As an applicant, compare Different name, Document-only correction and Missing declaration. Inspect or replace the evidence. The correction field remains locked; completing missing context makes its prior comparison stale.
2. As a reviewer, choose Conflicting totals and inspect both pages. Viewing a page does not confirm inspection automatically. Confirm explicitly, then record a simulated assessment or write your own replacement reason.
3. Choose Source cannot be opened. Acceptance is unavailable. A written explanation allows requesting replacement without a false inspection confirmation.
4. Start a simulated check in Over the page limit. Read the notice, review the context and select pages explicitly. More than four pages cannot be submitted. Cancel or complete the simulated run.
5. Explore stale, partial, failed, offline, restored, unsaved, expired, interrupted, busy, exhausted and unknown-usage states. Try clearing analysis, reassignment and cross-tab recovery.
6. Compare Matching saved demonstration, Mismatched saved example and Highlight reconstruction unavailable. All are labelled illustrative fixtures. There are no real captured model outputs; the simulated saved example explains the provenance required for a real capture. Mismatched examples do not attach to the current upload.
7. The archived model-terms checkbox preserves the comparison used during review. The accepted product uses plain-language findings, with model details only in provenance. The checkbox and its invented numbers are not selected product behavior or evidence of model quality or acceptance thresholds.

## Preserved artifact

- Local throwaway branch: `prototype/jev-evidence-assistance`.
- Initial prototype commit: `258a9d1`; accepted layout choice captured in `52da069`; completed live-review verdict captured in `9212ced`. Nothing from this branch is merged or pushed.
- Worktree: `/tmp/rifd-evidence-prototype`.
- Run from that checkout with `pnpm prototype:evidence`. The preview uses `127.0.0.1:5187`.
- [Source component](/tmp/rifd-evidence-prototype/src/ui/evidence-assistance.prototype.tsx), [scoped styles](/tmp/rifd-evidence-prototype/src/ui/evidence-assistance.prototype.css) and [full artifact notes](/tmp/rifd-evidence-prototype/docs/prototypes/evidence-assistance.md).
- Screenshots: [Arabic applicant](assets/ep-ar-applicant.png), [English applicant](assets/ep-en-applicant.png), [Arabic reviewer](assets/ep-ar-reviewer.png), [English reviewer](assets/ep-en-reviewer.png).

The branch preserves the source and screenshots even if the temporary worktree is later removed. Recreate a worktree from that local branch to run it again.

## Verification and limits

TypeScript and ESLint passed. Chrome exercised all 31 scenarios in all three layouts, in Arabic and English, at 390px for applicants and 1440px for reviewers. There were no browser page errors or horizontal overflow. Interaction checks covered correction locks, missing-context edits, the first-use notice, page selection, cancellation, page navigation, explicit inspection confirmation, reassignment and the unopenable-source exception. Keyboard checks covered layout cycling, source focus, page navigation and leaving arrow keys available inside text controls. All four screenshots were inspected.

This is a fixture-based interface study. It does not implement or verify inference, PDF preparation, persistence, permissions, seven-day cleanup, server allowances, native/TanStack mapping or model accuracy. No provider call, cloud provisioning or deployment was performed. The evaluation and handoff tickets retain that work.
