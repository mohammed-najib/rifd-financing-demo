# States, roles and recovery

Application status is separate from assignment, document review status and correction verification. The [glossary](../GLOSSARY.md) defines these terms. The [demo guide](demo-guide.md) names identities, records and controls for each path.

```mermaid
stateDiagram-v2
  state "Under review" as Under_review
  state "Corrections requested" as Corrections_requested
  [*] --> Draft: Applicant creates and explicitly saves
  Draft --> Submitted: All valid fields and four prepared files
  Submitted --> Under_review: Assigned reviewer starts review
  Under_review --> Corrections_requested: Confirm targets and individual reasons
  Corrections_requested --> Under_review: Applicant publishes all meaningful corrections
  Under_review --> Approved: Reason, prerequisites and fresh confirmation
  Under_review --> Rejected: Failed substantive criterion, reason and fresh confirmation
  Approved --> [*]
  Rejected --> [*]
```

| Boundary | Applicant | Reviewer |
| --- | --- | --- |
| Draft | Owner edits/saves incomplete values and files; explicit submission validates | Cannot read applicant drafts |
| Submitted | Reads submitted information/history, prints | Reads all submitted records; claim/confirmed transfer does not start review |
| Under review | Reads current submitted information | Assigned reviewer assesses documents, five checks, internal notes and correction targets |
| Corrections requested | Edits only current targets; Save stays private; Resubmit publishes atomically | Reads unchanged submitted snapshot and saves authorized notes; no decision or assessments until resubmission |
| Approved / Rejected | Reads reason/history and prints; Approved adds frozen illustration | Reads final record; assigned reviewer can save internal notes; final fields, evidence, checks and assignment stay locked |

Only accepted documents, five Passed checks and verified outstanding targets allow approval. Missing evidence calls for corrections. Rejection requires a failed substantive criterion. Both decisions require an applicant-visible reason and a new explicit confirmation. New approvals freeze entirely Upcoming entries; historical Completed entries stay fixed.

```mermaid
flowchart LR
  Baseline[Fixed correction baseline] --> Private[Applicant private response]
  Private -->|Save| Private
  Private -->|All targets meaningful, Resubmit| Snapshot[New submitted snapshot]
  Snapshot --> Changed[Highlight changed targets and reset dependent checks]
  Changed --> Verify[Reviewer verifies targets and repeats affected checks]
  Verify --> Decision[Fresh decision or another correction round]
```

Salma can read colleague assignments, but only the current assignee can write review results. A confirmed transfer preserves status and review work. Unassignment is permitted only before review. Khaled cannot sign in.

```mermaid
flowchart TD
  Write[Write from an old revision] --> Refused[No write effects, retain unsent text]
  Refused --> Latest[Load latest reveals current assignment]
  Latest --> Reclaim[Confirm reclaim if permitted]
  Reclaim --> Inspect[Inspect current application or review]
  Inspect --> Fresh[Choose a new action and confirm again]
  Uncertain[Completion not observed] --> Receipt[Inspect operation outcome]
  Receipt --> Committed[Committed receipt: show saved result]
  Receipt --> Absent[Not committed: explicit retry]
  Expiry[15 minutes inactive or Expire session] --> Covered[Protected content covered, same-tab buffer private]
  Covered --> Same[Same identity signs in and inspects access]
  Same --> Recover[Recover permitted input without replay]
  Covered --> Other[Other identity requires explicit discard]
  Reset[Confirmed browser-wide reset] --> Seeds[Restore 13 seeds, Arabic and preferences]
  Seeds --> Invalidate[Invalidate old tab sessions, buffers and pending work]
```

A forbidden or missing reference uses a neutral unavailable screen. There is no record-detail flash before access resolves. Startup/storage failures preserve data and offer explicit retry; failed reset preserves the prior dataset. These guarantees concern the simulated interface, not resistance to local storage inspection.
