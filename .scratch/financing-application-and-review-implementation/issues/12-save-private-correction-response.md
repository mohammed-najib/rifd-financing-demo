# 12: Save a private correction response

**What to build:** Applicants edit only requested targets and save unfinished corrections without changing the reviewer's submitted snapshot.

**Blocked by:** [11: Request targeted corrections](11-request-targeted-corrections.md).

**Status:** complete

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 25, 44, 45 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Application states and correction rules](../../financing-application-and-review/issues/01-application-states-and-corrections.md#answer); [Browser persistence and simulated failures](../../financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer).

**Styling:** Follow the [Tailwind v4 conventions](../../../README.md#styling) for new or changed UI, preserving Guided A, both directions and the shared design tokens.

- [x] Open the current target-only workspace with reasons, fixed baseline/date, progress and review summary; make other information read-only.
- [x] Save incomplete/invalid requested input and prepared target files using private workspace revision and active round ownership/state checks.
- [x] Keep shared revision, baseline, published files and review outcomes unchanged; assignment or internal-note changes must not block an otherwise current private save.
- [x] Apply document preparation/replacement and failed-save retention, session/departure recovery and stale private-workspace inspection.
- [x] Return obsolete/completed-round links to permitted current detail with explanation.
- [x] Verify a same-context applicant/reviewer pair, saved-file reload, private-versus-submitted projections, forbidden target changes, competing saves and expiry.

## Implementation

Completed on 2026-10-15. See the [implementation and verification evidence](../../../docs/implementation/12-evidence.md) for target-only editing, private transactional saves, file persistence, failure and session recovery, conflict inspection, stale-round handling and bilingual screenshots.

All 103 domain tests, 93 public-interface cases, 27 correction screen cases across Chrome, Firefox and WebKit, and 15 existing Chrome draft/departure/notification regressions pass. Typecheck, lint, the static build, packaged-skill checks and packed-package consumer verification pass. Separate Standards and Spec reviews have no outstanding findings.
