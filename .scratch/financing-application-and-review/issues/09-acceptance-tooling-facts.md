# Verify browser-test and static-delivery tooling

Type: research
Labels: wayfinder:research
Status: resolved
Parent: [Plan the financing application and review platform](../map.md)
Blocked by: none

## Question

Which current primary-source facts support a focused Vitest and Playwright verification plan for the agreed pure domain and browser-backed demo interface, and a repeatable static-build and performance acceptance check?

Verify real-browser IndexedDB and multi-page test support, the distinction between mobile emulation and physical-device evidence, reproducible Lighthouse measurement, and the official classic Firebase Hosting emulator/preview workflow for a TanStack Start SPA shell. Use existing [browser persistence research](../../../docs/research/browser-persistence-contract.md) and [hosting context](../../../docs/research/bank-portfolio-context.md) rather than redoing settled browser-storage research.

Do not choose human acceptance thresholds, install dependencies, create a Firebase project, authenticate, or deploy. No application build exists yet, so distinguish documented behavior from facts that require implementation verification. Preserve findings in one cited Markdown research note on a local throwaway research branch, with a readable workspace copy and immutable context pointer. No remote is configured, so do not push or open a PR.

The answer unblocks [Define acceptance evidence and the implementation handoff](07-acceptance-and-implementation-handoff.md). It supplies facts for a proposed test setup and eventual hosting checks, not approval of the handoff.

## Answer

Resolved on 2026-10-14 by a research subagent using the tools' official documentation and first-party source. The cited findings are in [Acceptance tooling facts](../../../docs/research/acceptance-tooling.md). Immutable archive: local branch `research/acceptance-tooling`, commit `942fd5298b87782dead0de73fe71d0eaeb8cfe8d`; readable evidence worktree `/tmp/impress-bank-acceptance-tooling-research`. No remote exists, so the branch was not pushed and no PR was opened.

- Vitest's Node environment can test pure TypeScript domain rules. Runtime tests do not replace compiler checks; selected Start/Vite/Vitest versions still need compatibility verification in the future application manifest.
- Playwright can exercise the real browser module and IndexedDB. Same-context tabs share this demo's dataset; separate contexts isolate datasets. Test refresh and stored byte fidelity explicitly rather than assuming storage snapshots prove it.
- Stable installed Chrome uses the `chrome` channel. Playwright Firefox and WebKit are patched builds; ordinary Firefox and branded Safari cannot be driven through those engines. Record pinned automation versions and use current ordinary Firefox for manual checks. Mobile emulation does not establish physical-device support.
- Lighthouse Navigation mode measures load performance. Preserve the signed-in tab and explicitly disable storage reset for protected-page audits, then clear HTTP caches separately. Verify identity, route and ready workspace before accepting a report. Record public first-visit and prepared-session measurements distinctly. The note supplies a proposed reproducible protocol, not measured results.
- Classic Hosting supports its emulator and temporary public preview channels. Inspect the actual Start static directory and shell before configuration; repeat direct-link/asset checks on the eventual hosted origin. Preview lifetime and CLI/account access must be recorded during implementation.

The findings support the proposed handoff without another product decision. Actual app behavior, performance, browser compatibility and hosting access remain unverified. This research installed nothing, authenticated nothing, started no emulator and deployed nothing.
