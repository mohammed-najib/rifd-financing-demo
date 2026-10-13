# Define demo access and reviewer assignment

Type: grilling
Labels: wayfinder:grilling
Status: open
Parent: [Plan the financing application and review platform](../map.md)
Blocked by: 01

## Question

Which demo identities can view or change each part of an application, and how do reviewer assignment, role switching, session expiry, and forbidden access behave?

Start with the actor actions and visibility distinctions from [Define application states and correction rules](01-application-states-and-corrections.md).

Decide how applicants relate to application records, how many fictional records are needed for a useful queue, and whether assignment is required for review actions. Specify who can assign or reassign an application and how the queue and review workspace expose that ownership.

Agree on a visibility and action matrix for applicant information, attachments, review checklists, correction reasons, internal notes, activity history, decision reasons, and notifications. Define where users return after simulated sign-in, role changes, an expired session, or a forbidden deep link, including the treatment of unsaved changes.

The main scope requires a stale-record conflict while a second interactive reviewer is deferred. What simulated outside change triggers the conflict, which actions must reject stale data, and what must a reviewer see before retrying? This ticket owns the user-facing conflict policy; [Define browser persistence and simulated failures](04-browser-state-and-simulated-failures.md) will define its implementation contract.

The answer should make the invented permissions and browser-only limitations clear enough to express in the interface without presenting them as real security guarantees.
