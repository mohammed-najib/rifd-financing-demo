# Define demo access and reviewer assignment

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Parent: [Plan the financing application and review platform](../map.md)
Blocked by: 01

## Question

Which demo identities can view or change each part of an application, and how do reviewer assignment, role switching, session expiry, and forbidden access behave?

Start with the actor actions and visibility distinctions from [Define application states and correction rules](01-application-states-and-corrections.md).

Decide how applicants relate to application records and how many fictional records are needed for a useful queue. Start with the six core scenarios in [Define fictional products and application requirements](02-products-and-application-requirements.md#answer); choose their identity relationships and any additional queue records without losing those scenario facts. Review actions require the assigned reviewer, as settled in the workflow decision. Specify who can assign or reassign an application, in which states, and how the queue and review workspace expose that ownership. Assignment alone does not change application status, and correction resubmission itself preserves the assignee.

Agree on a visibility and action matrix for applicant information, attachments, review checklists, correction reasons, internal notes, activity history, decision reasons, and notifications. Define where users return after simulated sign-in, role changes, an expired session, or a forbidden deep link, including the treatment of unsaved changes.

Preserve the agreed distinction between the last submitted snapshot visible to reviewers and partially saved corrections visible to the applicant. Applicant history and decision reasons are public to that applicant; staff identity, assignment activity, document assessments, checklist edits, and internal notes remain internal.

The main scope requires a stale-record conflict while a second interactive reviewer is deferred. What simulated outside change triggers the conflict, which actions must reject stale data, and what must a reviewer see before retrying? This ticket owns the user-facing conflict policy; [Define browser persistence and simulated failures](04-browser-state-and-simulated-failures.md) will define its implementation contract.

The answer should make the invented permissions and browser-only limitations clear enough to express in the interface without presenting them as real security guarantees.

## Comments

### Round one, accepted on 2026-10-14

The user answered "Yes to all" to these four recommendations:

- Three selectable fictional applicants can each own multiple applications. Mariam owns the incomplete inventory draft, complete equipment submission, and historical equipment approval. A second applicant owns the missing-financial-evidence submission and correction response. A third owns the young-business rejection. Applicants can access only their own records. Preserve the previously agreed scenario facts.
- One reviewer is selectable; a fictional colleague supplies simulated outside activity without a second interactive reviewer. The selectable reviewer can read every submitted application, but review actions and internal notes require assignment to them. They can claim or reassign applications in Submitted, Under review, and Corrections requested. Final decisions retain their assignee. There is no separate administrator role.
- The initial staff queue contains twelve submitted applications: the five staff-visible core examples plus seven additional fictional records with varied states and assignments. The core draft stays outside the staff queue. Use five rows per page.
- Products and the component gallery are public. Application records, notifications, and staff screens require simulated sign-in through an explicit identity chooser without passwords. The chooser explains simulated permissions, and application screens retain a small bilingual notice equivalent to "Fictional demo · saved in this browser".

### Round two, accepted on 2026-10-14

The user answered "Yes to all" to these four recommendations:

- Reassignment preserves completed document assessments, checklist results, correction requests, and internal notes. Record the transfer internally and immediately make the previous reviewer's workspace read-only. Confirm transfers. Removing an assignment is allowed only in Submitted; Under review and Corrections requested retain an assignee. Queue rows and the workspace header show "Assigned to you", the colleague's name, or "Unassigned".
- Staff can read submitted information, attachments, correction history, document assessments, checklists, notes, and internal activity regardless of assignment. Applicants see only their own information, attachments, public history, correction reasons, and decision reasons. Document assessment statuses and other staff-only information are hidden from applicants. Only applicants can access and mark items read in their notification list. Printed summaries contain applicant-visible information for either role.
- The twelve-record queue has four Submitted records, three Under review, three Corrections requested, one Approved, and one Rejected. Submitted assignments are one selectable reviewer, one colleague, and two unassigned. Under review and Corrections requested each have two assigned to the selectable reviewer and one to the colleague. Both final records are assigned to the selectable reviewer. Mariam's complete equipment submission starts unassigned. The core missing-evidence, correction, approval, and rejection examples are assigned to the selectable reviewer. Distribute the seven additions across the same three applicants.
- Navigation, sign-out, and identity switching warn about unsaved work. Applicant drafts and correction responses offer Save and leave, Discard changes, and Stay. An unfinished internal note can offer Save note and leave where permitted. Unsent correction requests and decision dialogs offer discard or stay; leaving never submits them. Wait for an in-flight save or upload before completing a switch. A successful identity switch opens the new applicant's application list or the reviewer's staff queue.

### Round three, accepted on 2026-10-14

The user answered "Yes to all" to the final three recommendations and confirmed the complete agreement needed to resolve this ticket:

- Sessions expire after fifteen minutes of inactivity, with an explicit Expire session demo control. Expiry covers protected content and requires simulated sign-in again. Saved work remains saved. Unfinished input stays recoverable in the current tab for the same identity. Nothing saves or submits automatically after expiry. Selecting another identity requires explicitly discarding unfinished work before switching.
- Fresh sign-in opens the selected applicant's application list or the reviewer's queue. An allowed protected deep link resumes after sign-in. After expiry, the same identity returns to the previous screen after checking current permissions and application state; show the permitted read-only view if editing is no longer allowed. Forbidden or unavailable applications reveal no details and offer the identity's home or an identity switch. Pending actions never replay automatically.
- The stale-record control reassigns an Under review application from the selectable reviewer to the fictional colleague while leaving the open workspace stale. Refuse the next staff write, including assessments, checklist changes, notes, correction requests, decisions, and assignment changes. Require loading the latest record to show the new assignee and transfer activity. Preserve existing review results and recoverable unsent text, invalidate decision confirmations, and make the workspace read-only. The reviewer can explicitly reclaim, inspect, and retry where permitted. Never retry or overwrite automatically.

## Answer

Resolved on 2026-10-14 after the user accepted all eleven recommendations across three rounds. This resolution defines the demo's access, assignment, session, and user-facing conflict policies. Storage and mock-operation mechanics remain with [Define browser persistence and simulated failures](04-browser-state-and-simulated-failures.md).

### Demo identities and application relationships

- There are three selectable fictional applicants and one selectable fictional reviewer. A second fictional reviewer is a simulated colleague, not an interactive identity. There is no administrator identity.
- Each application belongs to one applicant. Each applicant can have several applications; a role or identity switch does not transfer them. Applicants can access only their own applications and notifications. Staff cannot access applicant drafts or unfinished correction workspaces.
- Preserve the six core scenarios, business names, financial figures, evidence windows, correction facts, and history agreed in [Define fictional products and application requirements](02-products-and-application-requirements.md#answer). When a scenario uses another applicant, its personal fields and applicant identity evidence must consistently reflect that applicant; the scenario's other facts remain intact.

| Core application | Applicant | Initial reviewer assignment |
| --- | --- | --- |
| Incomplete inventory draft | Mariam | None; outside the staff queue |
| Complete equipment application | Mariam | Unassigned |
| Inventory application missing financial evidence | Second applicant | Selectable reviewer |
| Inventory correction response | Second applicant | Selectable reviewer |
| Historical equipment approval | Mariam | Selectable reviewer |
| Young-business inventory rejection | Third applicant | Selectable reviewer |

Add seven submitted applications across the same three applicants. They supplement the core scenarios rather than replacing them. Their starting states and assignments fill the queue distribution below: two Submitted, three Under review, and two Corrections requested. Complete fictional names, evidence, and lifecycle activity belong to the seed-data contract in the browser-state ticket.

### Initial staff queue

The initial data has thirteen applications in total, including the one core draft. All twelve non-Draft applications appear in the staff queue. Use five rows per page, so the default queue spans three pages before filtering.

| Application status | Selectable reviewer | Simulated colleague | Unassigned | Total |
| --- | ---: | ---: | ---: | ---: |
| Submitted | 1 | 1 | 2 | 4 |
| Under review | 2 | 1 | 0 | 3 |
| Corrections requested | 2 | 1 | 0 | 3 |
| Approved | 1 | 0 | 0 | 1 |
| Rejected | 1 | 0 | 0 | 1 |
| Total | 7 | 3 | 2 | 12 |

The core complete equipment submission starts unassigned to demonstrate claiming before review. Assignment information is visible in queue rows and the workspace header, using Assigned to you, the colleague's name, or Unassigned. Search, status filtering, sorting, pagination, and saved preferences remain in scope; their exact controls and state contract belong to the browser-state and screen-flow tickets.

### Visibility matrix

Products and the component gallery are public. Application screens, records, previews, notifications, staff screens, and application print views require simulated sign-in. The applicant column below always means the application's own applicant. Another applicant and an unsigned visitor cannot read these records.

Staff reading access is independent of assignment. Assignment controls writes, not access to submitted records. Reviewers see the last submitted snapshot during partial correction saves; the applicant's private correction workspace becomes reviewer-visible only through successful resubmission.

| Information | Own applicant | Signed-in reviewer, assigned or unassigned |
| --- | --- | --- |
| Applicant information and application fields | Own draft, submitted information, and own saved correction work where applicable | Last submitted information only; no drafts or private correction work |
| Supporting attachments and previews | Own attachments and permitted draft or correction additions and replacements | Submitted attachments only |
| Application status | Visible | Visible |
| Document assessment status and reasons | Hidden; a requested replacement is explained through its correction target and reason | Visible |
| Review checklist and correction verification results | Hidden | Visible |
| Correction requests, targets, and reasons | Visible for own current and historical requests | Visible, including submitted responses and the fixed correction baseline |
| Reviewer identity and assignment activity | Hidden | Visible |
| Internal notes and internal activity | Hidden | Visible |
| Applicant history | Submission, review start, correction requests, resubmission, and final decisions | Visible alongside internal activity |
| Final decision and decision reason | Visible | Visible |
| Applicant notification list and read state | Own list only; can mark own items read | No access to the applicant's list or read controls; related events remain visible in application activity |
| Fictional repayment overview | Visible for own Approved applications | Visible for Approved submitted applications |
| Printed application summary | Applicant-visible information only | The same applicant-visible summary; omit reviewer identity, assignment, assessments, checklist, notes, and internal activity |

Applicant-visible document presence, upload progress, and save feedback do not expose staff assessment statuses. Correction requests and final decisions create the applicant notifications already agreed in the workflow ticket. Assignment changes and internal notes do not create applicant notifications or applicant-history entries.

### Action and assignment matrix

All actions still require the state and validation prerequisites from [Define application states and correction rules](01-application-states-and-corrections.md#answer). Assignment authority does not bypass them. Staff cannot directly edit applicant-supplied fields or replace their documents.

| Action | Authorized actor | Permitted application states |
| --- | --- | --- |
| Create, edit, save, upload to, or submit a draft | Its applicant | Draft; submission must satisfy the agreed normal validation |
| Edit and save correction work, upload requested documents, or resubmit | Its applicant | Corrections requested; only current correction targets are editable |
| Claim an unassigned application | Selectable reviewer through assignment controls | Submitted |
| Transfer an application to oneself or the colleague | Selectable reviewer through assignment controls | Submitted, Under review, Corrections requested |
| Remove an assignment | Selectable reviewer through assignment controls | Submitted only |
| Start review | Assigned reviewer | Submitted |
| Assess documents, record checklist results, verify corrections, request corrections, approve, or reject | Assigned reviewer | Under review, subject to the agreed prerequisites |
| Add an internal note | Assigned reviewer | Under review, Corrections requested, Approved, Rejected |
| View or print accessible applications and previews | Its applicant or signed-in reviewer | Applicant's own records or staff-accessible submitted records, according to the visibility matrix |
| Read or mark applicant notifications read | Their applicant | Any application state with an existing notification |

Under review and Corrections requested always retain an assignee. Approved and Rejected retain their final assignee, lock fields, attachments, and review results, and still permit that assigned reviewer to add internal notes. A reviewer reading another reviewer's record cannot perform review writes or add notes. Assignment controls remain available in the allowed nonfinal states so the selectable reviewer can explicitly take responsibility before writing.

Confirm transfers between reviewers. Assignment changes preserve application status, applicant information, document assessments, checklist results, correction requests and baselines, and existing notes. Record successful assignment changes in internal activity only. Applicant correction resubmission preserves the current assignee.

When the workspace receives the latest assignment, loss of assignment immediately makes review controls read-only. A cached screen may still have old controls before receiving that update; the simulated operations must refuse unauthorized or stale writes rather than treating those controls as authority.

### Sign-in, identity changes, and unsaved work

Simulated sign-in uses an explicit demo identity chooser without passwords. It clearly separates applicant identities from the selectable staff identity. The noninteractive colleague is not a sign-in option.

| Entry or interruption | Destination and retained work |
| --- | --- |
| Fresh sign-in without a pending protected link | Selected applicant's application list or reviewer's staff queue |
| Protected deep link while unsigned | Identity chooser, then the requested destination only if the selected identity has access |
| Deliberate identity or role switch | Resolve unfinished work and pending saves or uploads first, then open the new identity's application list or staff queue |
| Sign-out | Resolve unfinished work first, then the unsigned identity chooser; saved application data remains saved |
| Session expiry and sign-in as the same identity | Check current permissions and application state, then return to the previous permitted screen with recoverable unfinished input |
| Session expiry and selection of another identity | Explicitly discard unfinished input before switching, then open the new identity's home |
| Forbidden or unavailable application | Reveal no record details; offer the current identity's home or an explicit identity switch |

For in-app navigation, sign-out, and identity switching:

- Applicant drafts and correction responses offer Save and leave, Discard changes, and Stay. Saving unfinished information follows the existing draft or partial-correction rules; it does not submit or resubmit.
- An unfinished internal note can offer Save note and leave only when the current identity is authorized to add it in the current state.
- Unsent correction requests and decision dialogs offer discard or stay. Leaving never publishes a request, approves, or rejects an application.
- Save and leave completes the navigation or identity change only after saving succeeds. A failed save retains the input and current identity for recovery.
- Wait for an in-flight save or upload before completing a switch. Discarding unfinished changes does not undo an already successful operation.
- A same-identity return rechecks current access and state. If editing is no longer allowed, use the permitted read-only view and do not reapply retained edits or replay actions automatically.

Detailed routes, prompt layout, focus movement, browser-level navigation behavior, and preservation across refresh belong to the browser-state and screen-flow tickets. The expiry recovery promise here is for unfinished input retained in the current tab, not a promise of durable storage for every unsaved edit.

### Session expiry

Expire the simulated session after fifteen minutes of inactivity. An explicit Expire session demo control reproduces it without waiting. The browser-state ticket defines activity detection, timers, and how expiry interacts with pending asynchronous operations.

On expiry, cover protected content and require simulated sign-in again. Expiry provides no continuing authority to read protected information or save or submit changes. Work already saved remains saved; unfinished input stays recoverable in the current tab for the same identity. Recovery never automatically saves, submits, confirms a decision, or retries an interrupted action. Signing back in checks current authorization and application state before returning to the permitted screen.

Switching identities after expiry requires explicitly discarding unfinished input; do not show one identity's unfinished work to another. Public products and the component gallery remain available without a simulated session.

### Stale-record conflict demonstration and recovery

Provide a clearly identified demo control on an Under review application currently assigned to the selectable reviewer. It simulates the colleague taking assignment. The simulated record gains the colleague's assignment and an internal transfer event while the open review workspace deliberately retains its old view. The simulation does not change application status or erase review results.

Refuse a staff write based on that stale view. This includes starting review when relevant, document assessments, checklist or verification changes, internal notes, correction requests, final decisions, and assignment changes. The refused action does not save its proposed change, complete a transition, or create a corresponding activity entry or notification. The simulated transfer's own internal activity remains.

Recovery proceeds as follows:

1. Explain that the application changed and require Load latest. Do not offer a force-save or automatic retry.
2. Load the current permitted record. Show the colleague as assignee and the transfer in internal activity. Keep completed document assessments, checks, correction information, and notes.
3. Make review controls read-only under the new assignment. Preserve unsent text as recoverable, unapplied work for the same identity. Invalidate any earlier decision confirmation.
4. Let the reviewer explicitly reclaim the application through the normal confirmed assignment transfer.
5. Require inspection of the current record and an explicit retry where current state, assignment, and prerequisites permit it. Any final decision needs a new explicit confirmation.

The colleague remains noninteractive. The browser-state ticket defines record versions, write guards, error precedence, and operation timing, including how to report a stale record that has also lost assignment. Its implementation must preserve the user-facing sequence above. The screen-flow prototype validates the conflict explanation, recovery of text, read-only controls, reclaiming, and renewed confirmation.

### Demo disclosure and remaining work

The chooser explains that these are fictional identities and simulated permissions in a browser-only demonstration. Application screens retain a small bilingual notice equivalent to "Fictional demo · saved in this browser". The explanatory copy must make clear that the identity chooser and access restrictions are demonstration behavior, not real authentication or security guarantees for locally stored data. Actual bank services and real financing decisions remain outside scope.

- [Define browser persistence and simulated failures](04-browser-state-and-simulated-failures.md) owns the seed fixture details, durable and temporary state, session timers, asynchronous operation and authorization checks, record versions, reset, and failure contracts implementing this policy.
- [Validate applicant and staff screen flows](06-applicant-and-staff-screen-flows.md) validates routes, the chooser, assignment controls, visibility, printable summaries, warnings, expiry, forbidden access, and stale-record recovery in both languages and responsive layouts.
- No new decision ticket or fog graduation is needed. These remaining implementation-contract and prototype questions already belong to the existing map children. This session resolves only this access ticket and performs no application implementation.
