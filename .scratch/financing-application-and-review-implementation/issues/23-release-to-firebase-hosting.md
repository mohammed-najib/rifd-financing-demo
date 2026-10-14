# 23: Release the verified demo to Firebase Hosting

**What to build:** The accepted dedicated-project preview and live static demo, with actual release identifiers and hosted smoke evidence.

**Blocked by:** [20: Complete browser and reliability acceptance evidence](20-browser-and-reliability-acceptance.md); [21: Verify bilingual layouts, keyboard flows, previews and print](21-bilingual-accessibility-preview-and-print-acceptance.md); [22: Pass performance and static-route delivery gates](22-performance-and-static-route-gates.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 81, 82 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Acceptance and implementation handoff](../../financing-application-and-review/issues/07-acceptance-and-implementation-handoff.md#answer); [Acceptance tooling facts](../../financing-application-and-review/issues/09-acceptance-tooling-facts.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [ ] Resolve actual Firebase account access, available project identifier, classic site and preview permissions at this stage; obtain user action only for human-only prerequisites.
- [ ] Deploy the verified static build to rifd-review, record preview URL/expiry and run hosted public/protected route, asset, identity, language and refresh checks.
- [ ] Fix preview findings and rerun affected acceptance gates before live release to the default web.app site.
- [ ] Record project/site IDs, build directory, release commit, live URL and hosted evidence; do not invent resources or treat a local build as hosted verification.
- [ ] Recheck live startup, direct links, static assets and core journeys in supported browsers.
- [ ] Build with the pinned Tailwind/Vite packages and verify generated CSS and local fonts are served as real assets after direct-link refresh on Hosting.
