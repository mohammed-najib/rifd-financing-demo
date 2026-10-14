# 12: Save a private correction response

**What to build:** Applicants edit only requested targets and save unfinished corrections without changing the reviewer's submitted snapshot.

**Blocked by:** [11: Request targeted corrections](11-request-targeted-corrections.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 25, 44, 45 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Application states and correction rules](../../financing-application-and-review/issues/01-application-states-and-corrections.md#answer); [Browser persistence and simulated failures](../../financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer).

- [ ] Open the current target-only workspace with reasons, fixed baseline/date, progress and review summary; make other information read-only.
- [ ] Save incomplete/invalid requested input and prepared target files using private workspace revision and active round ownership/state checks.
- [ ] Keep shared revision, baseline, published files and review outcomes unchanged; assignment or internal-note changes must not block an otherwise current private save.
- [ ] Apply document preparation/replacement and failed-save retention, session/departure recovery and stale private-workspace inspection.
- [ ] Return obsolete/completed-round links to permitted current detail with explanation.
- [ ] Verify a same-context applicant/reviewer pair, saved-file reload, private-versus-submitted projections, forbidden target changes, competing saves and expiry.
