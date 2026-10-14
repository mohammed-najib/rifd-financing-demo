# 22: Pass performance and static-route delivery gates

**What to build:** Measured production performance and a static Hosting-emulator build whose public/protected deep links and assets work correctly.

**Blocked by:** [19: Expose the production component gallery](19-production-component-gallery.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 81, 82 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Acceptance and implementation handoff](../../financing-application-and-review/issues/07-acceptance-and-implementation-handoff.md#answer); [Acceptance tooling facts](../../financing-application-and-review/issues/09-acceptance-tooling-facts.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [ ] Audit four agreed routes in both languages three times using the accepted Lighthouse protocol and recorded versions/conditions.
- [ ] Require median score at least 90 per route/language, CLS at most 0.1 every run and pending feedback within 100 ms for slow save/upload/submit/decision.
- [ ] Separate empty-storage first visits and prepared-session loads, preserve the signed-in tab, disable storage reset, clear HTTP caches and reject wrong-screen/readiness results.
- [ ] Record startup/resource preparation separately; fix failures without hiding required readiness or mock-latency work.
- [ ] Inspect actual static output and run all agreed direct-link/refresh/asset/MIME/query/fallback checks in the Hosting emulator, with no Start runtime server.
- [ ] Retain reports and gate results for the eventual release commit; later code changes require rerunning affected gates.
- [ ] Measure the compiled Tailwind CSS alongside JavaScript and fonts; verify source scanning covers production UI without pulling classes from archived prototypes or documentation.
