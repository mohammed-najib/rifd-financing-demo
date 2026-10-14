# Verify browser storage and client initialization facts

Type: research
Labels: wayfinder:research
Status: resolved
Parent: [Plan the financing application and review platform](../map.md)
Blocked by: none

## Question

Which verified browser and framework facts support durable PDF/JPEG/PNG attachments, atomic application updates, per-tab simulated sessions, and notifications of committed cross-tab changes in the planned static SPA?

Use official browser standards, first-party API documentation, and TanStack Start's official documentation. Check IndexedDB Blob storage and transaction completion, localStorage limits and suitability, cross-tab messaging versus durable state, sessionStorage tab isolation and copying, browser storage failure or eviction, and the browser initialization boundary for Start SPA mode. Identify implementation traps affecting transaction lifetime, asynchronous mock delays, and notification ordering. Do not choose product policy or an application library.

This research supports [Define browser persistence and simulated failures](04-browser-state-and-simulated-failures.md), whose agreed user-facing choices remain authoritative. Preserve the report on a local `research/browser-persistence-contract` branch and link a readable research asset. The repository has commits but no configured remote, so a remote push cannot be performed in this session; do not invent a remote or request credentials.

## Answer

Resolved on 2026-10-14 through primary-source research by a background agent using the research skill.

[Browser persistence and client initialization](../../../docs/research/browser-persistence-contract.md) records the verified facts and source links. IndexedDB supports Blob/File records and atomic multi-store transactions. Successful writes require transaction completion; request success and completed upload preparation alone do not establish a saved result. Perform mock delays, file reads, and hashing before a short write transaction. Version checks and related writes must share that transaction.

Cross-tab messages are hints to reread committed storage, not durable data. sessionStorage separates subsequent tab changes but an opener can supply an initial copy. Handle blocked or unavailable storage, transaction failures, quota and eviction, and database upgrades. Browser startup must remain outside TanStack Start's prerendered shell. SHA-256 can compare attachment content in a secure context; filename alone is not file content.

The research report is preserved in commit `f9c1162449b0889f26532f1ba5df4fa4ebcc5f15` on local branch `research/browser-persistence-contract`, with an identical readable copy in the main workspace. The branch was not merged. No configured remote exists, so no push was attempted.

No new research blocker remains for the planning contract. The eventual implementation still needs to verify the selected Start build and supported browsers, attachment round trips, concurrent writes, and failure behavior. This research did not implement or test an application and makes no permanent-retention guarantee.
