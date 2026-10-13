# Define application states and correction rules

Type: grilling
Labels: wayfinder:grilling
Status: open
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
