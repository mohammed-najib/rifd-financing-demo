# 13: Resubmit, verify and repeat correction rounds

**What to build:** Complete responses publish together, return to the same assigned review, highlight changes, reset only dependent checks and support verification or another round.

**Blocked by:** [12: Save a private correction response](12-save-private-correction-response.md).

**Status:** ready-for-agent

**Source:** [RIFD specification](../../financing-application-and-review/spec.md). Its accepted behavior, permissions, transaction guarantees, bilingual presentation and testing decisions apply to this slice.

**User stories:** 46, 47, 48, 49, 50, 51, 52 from the [specification's numbered stories](../../financing-application-and-review/spec.md#user-stories).

**Decision detail:** [Application states and correction rules](../../financing-application-and-review/issues/01-application-states-and-corrections.md#answer); [Products and application requirements](../../financing-application-and-review/issues/02-products-and-application-requirements.md#answer); [Browser persistence and simulated failures](../../financing-application-and-review/issues/04-browser-state-and-simulated-failures.md#answer).

- [ ] Require valid canonically changed requested fields, new missing evidence or different-content replacements, and whole-application validation; reject unrequested edits and renamed identical bytes.
- [ ] Atomically publish response/files with both revisions, retire workspace, preserve current assignment/financial window and append one resubmission event/receipt without notification.
- [ ] Mark changed files Awaiting review; retain other assessments; reset exactly dependent checks and outstanding verification.
- [ ] Show baseline-relative changed targets and require separate field verification; accepting the requested document verifies its target.
- [ ] Support a further correction request with new baseline/workspace, preserve prior history and avoid permanently blocking on historical insufficient responses.
- [ ] Verify Huda's four-check reset with Operating history preserved, missing evidence, repeated unsuitable replacement, publication abort/replay, private-save isolation and same-context races.
