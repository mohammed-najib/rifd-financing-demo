# Define browser persistence and simulated failures

Type: grilling
Labels: wayfinder:grilling
Status: open
Parent: [Plan the financing application and review platform](../map.md)
Blocked by: 02, 03

## Question

What state ownership, persistence model, and typed asynchronous API contract make the whole demo resumable and keep applicant and staff views consistent?

Use the agreed workflow together with [Define fictional products and application requirements](02-products-and-application-requirements.md) and [Define demo access and reviewer assignment](03-demo-access-and-reviewer-assignment.md).

Decide what lives in durable browser storage, the URL, or the current session. Cover drafts, submitted applications, document data and previews, correction baselines, assignment, notes, activity, notification read state, repayment examples, language, and saved queue preferences. Resolve whether real local files are accepted or only sample attachments are used, and what survives refresh in either case.

Specify the boundaries between domain rules, mock operations, persistence, and UI state. Define operation inputs, outputs, validation errors, record versions, and the point at which a save or simulated upload counts as successful. Decide whether multiple tabs synchronize, how stale versions are detected, and how a partial or repeated operation avoids inconsistent status, history, and notifications.

Which deterministic controls reproduce latency, upload progress, failed draft saves, failed submissions, storage failure, session expiry, forbidden access, and the agreed stale-record conflict? Define recovery behavior and what the user retains after each failure. Decide whether offline behavior is supported and how the interface represents it.

Define seed data, reset scope, storage schema changes, and startup behavior for missing, outdated, or damaged saved data. Respect the existing research note's static hosting constraints, including build-time rendering of the SPA shell and client boundaries for browser storage. If a technical fact is still unknown, identify a focused research prerequisite before closing this ticket.

The answer should supply an operation and persistence contract plus a failure-and-recovery table that later implementation can follow.
