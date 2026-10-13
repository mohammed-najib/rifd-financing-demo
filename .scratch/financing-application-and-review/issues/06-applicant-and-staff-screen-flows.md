# Validate applicant and staff screen flows

Type: prototype
Labels: wayfinder:prototype
Status: open
Parent: [Plan the financing application and review platform](../map.md)
Blocked by: 04, 05

## Question

What routes, screen structure, and interactions let applicants and reviewers complete every agreed journey without losing their place or misunderstanding the shared application state?

The prerequisites are [Define browser persistence and simulated failures](04-browser-state-and-simulated-failures.md), including its domain and access dependencies, and [Choose the bilingual visual direction](05-bilingual-visual-direction.md).

Use a rough navigable prototype or guided walkthrough to review the agreed domain, access, persistence, failure behavior, and visual direction together. Give all journeys equal emphasis:

- Compare products, create or restore a draft, move through form steps, review entries, and submit.
- Add and preview documents, respond to validation, replace a document, and recover from a failed save or upload.
- Find submitted applications, follow history and notifications, complete corrections, and print an application summary.
- Search, filter, sort, paginate, and assign the staff queue while preserving preferences.
- Inspect the application and documents, use the checklist and internal notes, request corrections, and inspect revised information.
- Approve or reject with a reason and confirmation, recover from a stale-record conflict, and view the fictional repayment overview.
- Switch language or demo role, encounter session expiry or forbidden access, and reset the demo.

Resolve navigation and deep links, save feedback, unsaved-change warnings, loading and empty states, error recovery, focus movement, accessible validation, and responsive alternatives to dense staff layouts. Include the small component gallery and printable summary in the route and layout decisions. Decide consistent date, amount, numeral, and mixed-direction text presentation.

The answer should link the prototype and capture the user's agreed route map and screen behaviors. If the walkthrough exposes a new domain decision, create the specific follow-up ticket instead of silently deciding it in the UI.
