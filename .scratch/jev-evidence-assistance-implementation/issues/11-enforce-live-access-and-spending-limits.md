# 11: Enforce live-access and spending limits

**What to build:** A visitor explicitly requests live analysis after seeing what will be transmitted, receives understandable access or allowance outcomes, and can continue ordinary work when the service refuses or stops the request.

**Blocked by:** [03: Check one-page applicant identity evidence](03-check-one-page-applicant-identity-evidence.md).

**Status:** complete

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Server, accounts, spending and privacy](../../jev-evidence-assistance/spec.md#server-accounts-spending-and-privacy); [Connected workflows and presentation](../../jev-evidence-assistance/spec.md#connected-workflows-and-presentation).

User stories: 40, 41, 42, 43, 58, 59, 60, 61, 62, 63.

- [x] Show the fictional-data/transmission notice before creating a Firebase guest session and the selected pages/minimum context before each submission. Verify anonymous Auth and reCAPTCHA Enterprise App Check on both direct and Hosting-routed endpoints before admission. Demo identities and CORS grant no inference allowance.
- [x] Expose only the fixed analysis contract with runtime validation, a maximum 10 MiB request body and 16 KiB metadata/context, and the specified image/question/resource bounds. Reject arbitrary prompts, questions, remote image URLs, model flags and provider options.
- [x] Reserve the complete planned run transactionally in server-only Firestore across instances/revisions before dispatch, up to nine attempts. Enforce one active analysis and one start per minute per guest, 20 guest attempts per UTC day, 60 network attempts per UTC day, and shared limits of 100 per UTC day and 1,000 per UTC month.
- [x] Use trusted ingress with daily keyed network identifiers, two active provider connections across the service and 60-second work leases. Bind random run IDs to keyed fingerprints of actual received images, allowed context and question versions. This fingerprint proves supplied-input equality, not browser financing authority or source authenticity.
- [x] Dispatch concurrent duplicates once, reject changed-input ID reuse and return only completion status for completed duplicates without archived-answer replay. Release only definitely unsent reservations; dispatched failures, timeouts, malformed or unknown outcomes consume allowance. Lease expiry/cancellation cannot authorize duplicate dispatch or assume refunds.
- [x] Enforce eight-second attempt, 45-second server, 50-second browser and 55-second function deadlines. Start supervision before copying/hashing/crop work or SDK preprocessing, cover durable marking and mapping, and recheck after marking and immediately before transport. Stronger access/accounting/resource stops prevent later stages.
- [x] Fail closed on missing admission/accounting state or operator disablement. Keep operator control under IAM with no public bypass. Resetting financing data or switching fictional identities never resets service allowances.
- [x] Use private, non-cacheable responses and metadata-only events. Keep source images, context and answers request-local, with no archive/cache. Exclude filenames, application/document IDs, declarations, answers, images, names, credentials and raw addresses from allowance records and logs.
- [x] Implement specified metadata retention: daily records for two UTC days, monthly aggregates until 35 days after month end and sanitized application logs for seven days, with expiry on reads and cleanup behavior. Keep ordinary work and Saved demonstrations available for denied, cancelled, offline or unavailable requests.
- [x] Verify the browser request/outcome path, direct/routed authorization, quota races, deduplication, cancellation/deadline stops and accounting through local/emulated services with dummy credentials and fake dispatch. A production caller must not be able to select the fake transport or bypass admission.

## Implementation and verification

Implemented on 2026-10-18. The fixed whole-run HTTP boundary, lazy Firebase
guest/App Check client, strict inline-PNG contract, transactional Firestore
admission, dispatch supervision and localized access outcomes are in place.
See [the implementation record](../../../docs/implementation/jev-live-access.md)
for the boundaries, retention contract, operator controls and verification.

Unit and focused browser checks pass, including local direct/routed HTTP,
quota races, duplicate status without answer replay, post-mark cancellation,
preprocessing deadlines and unknown usage. The Standard-edition Firestore
emulator verifies actual transaction serialization, denied client metadata
access and daily/monthly cleanup. Full API/screen regression and the required
two-axis review are recorded in the implementation record after completion.

Production has no provider workflow or fake transport selection. Ticket 12
supplies the fixed Jev workflow; ticket 13 provisions and verifies hosted
ingress, IAM, anonymous cleanup and the seven-day log bucket contract. Live
dispatch remains disabled until that work and bounded acceptance are complete.
No deployment, account configuration or external inference was performed.
