# Define application states and correction rules

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Parent: [Plan the financing application and review platform](../map.md)
Blocked by: none

## Question

What application states, actions, and transition rules describe the full journey from a saved draft through submission, review, corrections, and an approval or rejection?

Decide which actor can take each action, its prerequisites, the resulting state, and the history entry that explains it. Separate application status from document status, correction requests, and assignment wherever their meanings differ.

Resolve these concrete ambiguities:

- The source asks for both invalid-submission prevention and a submitted application with a missing document. Which deficiencies block submission, and which can the reviewer discover afterward? Does the demonstration need a deliberately seeded incomplete submission?
- When corrections are requested, which fields and attachments can the applicant change? Can the reviewer keep working, and what action returns the application to review?
- Can corrections repeat, can an applicant withdraw, and can a decision be reopened? Explicitly decide whether these actions belong in the supported workflow.
- What comparison baseline lets the reviewer see revised fields and documents after resubmission without adding the optional side-by-side version comparison?
- Which actions produce applicant-visible history or notifications, and what remains internal? How do decision reasons and the approved repayment overview fit the final states?

The answer should provide a transition table and representative valid and invalid journeys, including a complete first submission, correction and resubmission, approval, and rejection. Leave the concrete product fields and document requirements to [Define fictional products and application requirements](02-products-and-application-requirements.md).

## Comments

### Round one, accepted on 2026-10-14

The user accepted all three recommendations:

- Use six application states: Draft, Submitted, Under review, Corrections requested, Approved, and Rejected. Correction resubmission returns to Under review. Document review, correction requests, and assignment have separate meanings; document acceptance and assignment alone do not change application state.
- Normal submission requires complete required fields, valid values, and every required attachment successfully uploaded. Review can discover unreadable, incorrect, or outdated documents afterward. Seed an already-submitted incomplete example for the required missing-document demonstration; normal submission cannot create that example. Concrete requirements remain with the product ticket.
- Support repeated correction rounds. Applicant withdrawal and reopening final decisions are outside this workflow. Approval and rejection are final for that application.

### Round two, accepted on 2026-10-14

The user accepted all five recommendations:

- The assigned reviewer explicitly starts review, changing Submitted to Under review. Correction resubmission returns directly to Under review with the same reviewer. While Corrections requested, the reviewer can read the application and add internal notes; document checks, further correction requests, and decisions wait for resubmission.
- A correction request groups the currently required changes into one round. It identifies specific fields or document slots and gives a reason for each. The applicant can edit only those targets and save partial progress. Other fields stay locked. The financing product stays fixed after first submission.
- Each document slot has a review status of Missing, Awaiting review, Accepted, or Needs replacement. Uploading or replacing a file makes the slot Awaiting review. The reviewer accepts a document or marks it Needs replacement with a reason. Upload progress and upload failure describe the upload operation separately.
- Compare resubmitted values and documents with the application as it stood when the latest correction request was issued. Keep the baseline fixed for that round. Highlight changed fields and added or replaced documents. A later correction round gets a new baseline. Side-by-side version comparison remains outside scope.
- Applicant history shows submission, review start, correction requests, resubmission, approval, and rejection, including correction reasons and the final decision reason. Staff identity, assignment changes, document-review activity, checklist edits, and internal notes stay internal. Applicant notifications announce correction requests and final decisions and link to the application. Submission and resubmission have immediate confirmation and history entries.

### Round three, accepted on 2026-10-14

The user accepted all four recommendations:

- Correction resubmission requires every requested field to contain a valid changed value, every requested document to have a successfully uploaded addition or replacement, and the whole application to pass submission validation. Partial progress can still be saved. Resubmission means ready for recheck. The reviewer verifies each requested change; accepting a replacement verifies its document target. Insufficient responses become targets in a fresh correction round.
- Approval requires all required documents to be Accepted and all required review checks to pass. Rejection requires a recorded failed review criterion. Missing or unsuitable documents alone lead to corrections; an independent failed criterion can justify rejection even when document review is incomplete. Both decisions require an applicant-visible reason and explicit confirmation by the assigned reviewer while Under review.
- Approval and rejection lock application fields, attachments, and the review checklist. Viewing, printing, reading notifications, and adding internal notes remain available. Later internal notes do not alter the recorded decision.
- Approval accepts the applicant's submitted financing terms. A reviewer needing different terms requests those changes before deciding. Only Approved applications have a fictional repayment overview. Upcoming and completed repayment entries do not create further application states. The product ticket owns schedule figures and calculation rules.

### Round four, accepted on 2026-10-14

The user accepted both remaining recommendations:

- Reviewers continue seeing the last submitted information while the applicant saves unfinished corrections. Partial saves belong to the applicant's correction workspace. Successful resubmission publishes corrected fields and attachments together, returns the application to Under review, and makes the changes available for comparison.
- Resubmission preserves unchanged documents' review statuses and unaffected checklist results. Added or replaced documents become Awaiting review. Changed fields and review checks that depend on changed information need fresh verification. The product ticket defines those dependencies.

## Answer

Resolved on 2026-10-14 after the user accepted all fourteen recommendations across four rounds. This resolution defines the workflow for the fictional demo.

### Separate domain meanings

- Application status has exactly six values: Draft, Submitted, Under review, Corrections requested, Approved, and Rejected.
- Each document slot independently has a review status of Missing, Awaiting review, Accepted, or Needs replacement. A supplied or replacement file starts Awaiting review. The reviewer accepts it or marks it Needs replacement with a reason. Upload progress and failure describe the upload operation, not a review outcome.
- A correction request is a bundle of specific field and document targets, each with a reason, and a fixed comparison baseline. Applicant response and reviewer verification are distinct. Resubmission does not automatically verify the response.
- Assignment identifies the responsible reviewer. Assignment alone changes neither application status nor document status. Review actions require the assigned reviewer; assignment and reassignment authority belong to the access ticket.
- The submitted snapshot is the information handed over at submission or resubmission. The correction workspace contains the applicant's saved, unfinished response. Reviewers see the submitted snapshot until resubmission succeeds.

### Transition table

History entries below describe successful actions. Refused or failed actions do not represent completed transitions. Concrete error, retry, and stale-record behavior belongs to the access and browser-state tickets.

| Action | Actor | Current state | Prerequisites | Resulting state | History and notification |
| --- | --- | --- | --- | --- | --- |
| Prepare or save a draft | Applicant | New application or Draft | Save may contain incomplete required information; submission validation is not a draft-completion requirement | Draft | Save feedback to the applicant; no public lifecycle entry or notification |
| Submit | Applicant | Draft | Required fields complete and valid; required attachments successfully uploaded; no pending or failed required upload | Submitted | Applicant-visible submission entry and immediate confirmation; no applicant notification-list item |
| Start review | Assigned reviewer | Submitted | Reviewer is assigned and authorized | Under review | Applicant-visible review-start entry; staff identity remains internal |
| Assess documents, record checks, or verify correction responses | Assigned reviewer | Under review | Examine the currently submitted information; give a reason for a document needing replacement | Under review | Internal document, checklist, or verification activity; no applicant lifecycle entry or notification |
| Request corrections, including another round | Assigned reviewer | Under review | At least one specific editable field or document target; reason for each; financing product cannot be a target | Corrections requested | Applicant-visible request and target reasons; applicant notification links to the required action; capture the round's baseline |
| Edit requested targets, upload requested documents, or save partial corrections | Applicant | Corrections requested | Change only the current request's targets; other fields and the financing product remain locked | Corrections requested | Applicant save/upload feedback; reviewer still sees the last submitted snapshot; no public lifecycle entry or notification |
| Resubmit corrections | Applicant | Corrections requested | Every requested field has a valid changed value; every requested document has a successfully uploaded addition or replacement; whole application passes submission validation | Under review | Publish corrected fields and documents together; preserve assignee; applicant-visible resubmission entry and immediate confirmation; no applicant notification-list item |
| Approve | Assigned reviewer | Under review | All required documents Accepted; all required review checks passed, including verification of requested corrections and checks affected by changes; applicant-visible reason; explicit confirmation | Approved | Applicant-visible approval and reason; applicant decision notification; fictional repayment overview available |
| Reject | Assigned reviewer | Under review | A recorded failed substantive review criterion independent of missing or unsuitable documents alone; applicant-visible reason; explicit confirmation | Rejected | Applicant-visible rejection and reason; applicant decision notification; no repayment overview |
| Add an internal note | Assigned reviewer | Under review, Corrections requested, Approved, or Rejected | Authorized access; a note cannot change the recorded decision | Same state | Internal activity only |
| View, print, or read a notification | Applicant or authorized staff as applicable | Accessible application | Role visibility and access rules apply | Same state | No application lifecycle transition |

While Corrections requested, reviewer work is limited to reading the last submitted snapshot and adding internal notes. Document assessments, checklist changes, verification, additional correction requests, approval, and rejection wait until resubmission. A single application has one outstanding applicant correction request at a time.

### Submission and the incomplete demonstration

Normal submission prevents incomplete required fields, invalid values, missing required attachments, and required uploads that have not succeeded. Structural validity does not establish that a document is readable, current, or the right document. Those deficiencies can be discovered in review and lead to a targeted correction request.

Seed an already-submitted application with a missing required document to satisfy the source's missing-document demonstration. Clearly treat it as a prepared demo record. The normal submission journey cannot produce it. Also retain a complete first-submission journey; the map gives all journeys equal emphasis.

### Correction response, verification, and comparison

The reviewer groups all currently needed changes into one request, identifying each field or document slot and its reason. The applicant can save incomplete progress but can edit only those targets. The product stays fixed after first submission. A valid unchanged field does not satisfy a requested field change, and an existing unsuitable attachment does not satisfy a requested replacement.

Reviewer visibility remains on the submitted snapshot during partial saves. Successful resubmission hands over the completed response as a whole and returns the application directly to Under review. It does not return to Submitted or require a second Start review action.

On resubmission:

- Added and replaced documents become Awaiting review. Unchanged documents retain their review statuses.
- Changed field targets require fresh verification. Checks depending on changed fields or documents return to an unchecked condition; unaffected check results remain available. The product ticket defines the dependency mapping.
- Accepting a requested document verifies that document target. The reviewer separately verifies requested field changes. Approval requires the required checks and correction verification to be complete.
- If responses remain insufficient, issue a fresh correction round with the still-needed targets and reasons. Preserve the earlier request, response, and assessments in history. Repeated rounds are supported.
- Rejection on an independent failed criterion may end the application before every document or correction response is verified. Preserve the actual incomplete review outcomes rather than implying acceptance.

Compare the response with the application as it stood when the latest correction request was issued. The baseline stays fixed during that round; partial saves never replace it. Highlight changed field values and added or replaced documents after resubmission. The next correction round captures a new baseline from the latest submitted information. No side-by-side version comparison is included.

### History, notifications, and final states

Applicant history contains submission, review start, correction requests, resubmission, approval, and rejection. Correction requests expose their target reasons, and final decisions expose their decision reason. The applicant does not see staff identity, assignment changes, document-review activity, checklist edits, or internal notes. Staff chronological activity includes both the shared lifecycle events and internal activity.

Applicant notification-list items announce correction requests and final decisions and link to the relevant application. Submission and resubmission instead have immediate confirmation and history entries. Draft saves, partial correction saves, uploads, and internal review activity do not create applicant lifecycle notifications.

Approval accepts the applicant's submitted financing terms. Staff cannot silently amend those terms as part of approving; changes must first be requested and resubmitted. Approved and Rejected are terminal. Application fields, attachments, and the review checklist become read-only. Authorized viewing, printing, reading notifications, and adding internal notes remain possible, and later notes do not alter the decision.

Only Approved applications have an explicitly fictional repayment overview. Upcoming and completed repayment entries do not change application status. Schedule figures, dates, totals, and fixed-sample versus calculated behavior belong to the product ticket. Applicant withdrawal and reopening final decisions are outside scope.

### Representative valid journeys

1. Complete first submission and approval: save an incomplete Draft, finish required fields and uploads, submit to Submitted, assign a reviewer without changing status, start Under review, accept required documents and pass required checks, then confirm approval with a reason. The applicant sees the lifecycle history, an approval notification, and the fictional repayment overview.
2. Missing-document correction: open the prepared incomplete Submitted record, start Under review, request the missing document with a reason, and enter Corrections requested. The applicant saves partial work while the reviewer still sees the missing slot. Successful resubmission returns to Under review with the document Awaiting review. Accept the document, verify the request, complete the checks, and approve.
3. Repeated replacement: a normally submitted attachment proves unreadable in Under review. Mark Needs replacement and request a replacement. The applicant replaces it and resubmits; it becomes Awaiting review. If still unsuitable, issue a fresh round with a new baseline and reason. A suitable later replacement is accepted and verified before approval.
4. Field correction: request a changed financing amount and any coupled editable targets needed for a valid response. The applicant changes only those targets and resubmits. Highlight the change against the fixed request baseline, preserve unchanged document statuses, repeat the amount-related checks, and verify the changed field before deciding.
5. Rejection: start review of a submitted application and record a failed substantive eligibility or suitability criterion. Confirm rejection with its applicant-visible reason, even if unrelated document review remains incomplete. The applicant receives a rejection notification and sees no repayment overview. Later internal notes leave Rejected unchanged.

### Representative invalid journeys

| Attempt | Why it is refused |
| --- | --- |
| Submit with an invalid required value, a missing required document, or a pending or failed required upload | Normal submission prerequisites are unmet; the application remains Draft |
| Applicant edits submitted information outside a correction request | Applicant editing is available in Draft or for current correction targets |
| Change an unrequested field or switch products during corrections | Editing is limited to requested targets, and product is fixed after first submission |
| Resubmit an unchanged requested field, omit a requested replacement, or fail whole-application validation | The response is incomplete or invalid; remain Corrections requested |
| Start review or decide as an unassigned reviewer | Review actions require the assigned reviewer |
| Request corrections or decide directly from Submitted | Review must first start |
| Assess documents, issue another request, or decide while Corrections requested | The applicant's response must first be resubmitted |
| Approve with unaccepted required documents, unchecked affected criteria, unverified corrections, or a failed required check | Approval prerequisites are unmet |
| Reject solely because a required document is missing or unsuitable | That deficiency calls for corrections; rejection requires an independent failed criterion |
| Approve or reject without a reason or explicit confirmation | Both are mandatory |
| Modify fields, attachments, or the checklist after a final decision; withdraw; reopen a decision | Final data is locked, and withdrawal and reopening are outside the supported workflow |

### Context for remaining decisions

- [Define fictional products and application requirements](02-products-and-application-requirements.md) owns concrete field and document requirements, review criteria, coupled correction targets, the dependency mapping for repeating checks, sample records, and repayment figures.
- [Define demo access and reviewer assignment](03-demo-access-and-reviewer-assignment.md) owns identity-to-record access, assignment and reassignment authority, the detailed visibility matrix, session behavior, and the stale-record conflict policy. It must preserve assigned-reviewer review actions and the last-submitted view during partial corrections.
- [Define browser persistence and simulated failures](04-browser-state-and-simulated-failures.md) owns storage and operation contracts for submitted snapshots, saved correction workspaces, fixed baselines, publication on successful resubmission, history, notifications, and failure recovery.
- The later prototype and handoff tickets validate these decisions in Arabic and English and turn them into implementation and acceptance evidence. No new decision ticket is needed for this resolution; the remaining specific questions fit the existing children.
