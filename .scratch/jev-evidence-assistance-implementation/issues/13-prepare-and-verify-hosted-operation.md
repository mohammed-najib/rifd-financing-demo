# 13: Prepare and verify hosted operation

**What to build:** The demo operator has the hosted assistance service configured and its deployed controls verified, while visitors retain the ordinary application and Saved demonstrations until live activation is ready.

**Blocked by:** [05: Check evidence in private correction workspaces](05-check-evidence-in-private-correction-workspaces.md); [06: Find supporting evidence during reviewer examination](06-find-supporting-evidence-during-reviewer-examination.md); [07: Check business evidence](07-check-business-evidence.md); [08: Check purchase evidence](08-check-purchase-evidence.md); [12: Connect the bounded workflow to TanStack AI and Jev](12-connect-the-bounded-workflow-to-tanstack-ai-and-jev.md).

**Status:** ready-for-agent

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Server, accounts, spending and privacy](../../jev-evidence-assistance/spec.md#server-accounts-spending-and-privacy); [Dependency order of implementation slices](../../jev-evidence-assistance/spec.md#dependency-order-of-implementation-slices); [Testing Decisions](../../jev-evidence-assistance/spec.md#testing-decisions).

User stories: 43, 44, 45, 57, 58, 59, 60, 61, 62, 63, 64.

- [ ] Configure classic Firebase Hosting with the analysis route before the SPA fallback and a second-generation Node 22 HTTPS function in europe-west1, 512 MiB, one CPU, zero minimum/one maximum instance, concurrency two and a 55-second timeout.
- [ ] Configure the dedicated TypeSafe Secret Manager secret, service identity/IAM, anonymous Firebase Auth, App Check with reCAPTCHA Enterprise, server-only Firestore admission and operator disable state. Verify secret isolation from client assets and keep provider dispatch disabled during deployed control checks.
- [ ] Verify authorization on both direct and routed endpoints, non-cacheable responses, rejected arbitrary input and no-content telemetry in the deployed environment. Record the evidence and limitations rather than treating local/emulator success as deployed proof.
- [ ] Configure Identity Platform anonymous-account cleanup after checking actual terms/quotas. Distinguish eligibility after 30 days from guaranteed deletion on that day, and verify active-use/metadata cleanup behavior under the specified daily, monthly and log retention windows.
- [ ] Reconcile the stopped run's two outstanding attempts and current actual available credit before any later paid dispatch. Preserve historical ledgers/captures; token estimates and historical balance snapshots cannot establish current charges or credit. Unknown billing remains a dispatch stop.
- [ ] Verify pinned-model/image access, current pricing/terms, dedicated-key custody, refill disabled, transactional allowance configuration and the disable switch. Retain the US$5/month TypeSafe and US$5/month Google operating targets with alerts, without representing them as guaranteed account-wide caps.
- [ ] Prepare the bounded validation accounting controls for cumulative actual pre-feature charges plus pessimistic outstanding reservations at most US$1 and reconciled credit minus reservations at least US$4. No purchase, refill, protected-credit use or halted-controller restart is part of this work.
- [ ] Verify the notice explains Google and TypeSafe processing of transmitted fictional data without promising account-specific zero retention or processing only within the function region. The server retains no document/context/answer archive.
- [ ] Complete agent-accessible configuration and checks before requesting operator-only account actions. Record unresolved prerequisites concretely and leave live dispatch disabled while any required control is incomplete.
- [ ] Review the integrated Arabic/English applicant, correction and reviewer workflow evidence, analysis-store compatibility, source inspection, Saved fallback and loaded-app offline checks. Run only focused checks needed for new deployment behavior or unresolved failures. Preserve the separate single ten-minute final acceptance batch and its attempt budget.
