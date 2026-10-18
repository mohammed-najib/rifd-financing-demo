# Live access and spending controls

Ticket [11](../../.scratch/jev-evidence-assistance-implementation/issues/11-enforce-live-access-and-spending-limits.md)
adds the bounded service boundary. Ticket 12 supplies the fixed Jev workflow;
ticket 13 configures and verifies hosted operation. Production dispatch remains
disabled. No external inference or deployment is part of these checks.

## Request and browser behavior

The visitor sees the fictional-data notice, Google and TypeSafe processing,
selected pages and relevant declarations before Run. Only Run imports Firebase,
initializes reCAPTCHA Enterprise App Check and creates or resumes anonymous Auth.
Financing reset, fictional role selection, navigation and language changes never
reset this Auth identity or create inference requests. Offline Run stops before
preparation or guest creation. Refusal leaves ordinary source and financing work
available, with localized access, rate, allowance and availability outcomes.

`browserLiveTransport` sends one whole run to `/api/evidence-analysis`. It strips
filenames, financing identifiers and local authority records. The runtime schema
allows only task/context, declarations/correction context, explicit page scope
and inline PNGs. Unknown keys, questions, prompts, URLs and provider flags fail.
The server checks the 10 MiB body, 16 KiB metadata, four pages, PNG CRCs and bounded
inflation, actual dimensions, per-image 2 MiB, combined 8 MiB and eight million
pixels. Preparation failures retain the original selected scope and full plan.
An ID contains the UTC date plus a random UUID. Old-date IDs cannot start work
after their two-day deduplication records are cleaned up.

`createLiveService` receives a fixed internal workflow and a guarded evaluation
method. It supervises authorization, decoding/hashing, admission, preprocessing,
durable marking, transport, mapping and completion. Each attempt has eight
seconds, server work 45, the browser 50, and the deployed function 55. An expired
reservation day cannot dispatch a new stage across UTC midnight. Future crop/SDK
work must honor the supplied signal and use terminable workers for synchronous
image work. The service checks stage question, target, asset and cumulative crop
budgets. Resource, access, accounting and deadline stops halt later stages even
if a workflow catches their errors.

## Admission and privacy

Firestore transactions serialize revisions against server-only control, run,
guest, daily network, shared day and shared month documents. All production
requests verify revoked/expired Auth tokens, the anonymous provider and the
configured App Check app before admission. CORS and fictional identities grant
no allowance. Both endpoint routes use the same verifier.

Every new run reserves its complete maximum of two or nine attempts before work.
Guest limits are one active run, one start per minute and 20 attempts per UTC day.
Network limits are 60 attempts per UTC day; shared limits are 100 daily and 1,000
monthly. Two durable provider-connection slots and 60-second leases span
instances and revisions. Missing control or required accounting prevents work.

Run IDs bind to HMAC fingerprints of actual PNG bytes, canonical allowed context
and question versions. Fingerprints establish supplied-input equality, never
source authenticity or browser financing authority. Concurrent duplicates return
status, completed duplicates never replay an answer, and changed inputs conflict.
Durable marking precedes transport, with cancellation and disable checks after
marking and immediately before send. Marked failures, timeouts, malformed usage
and unknown outcomes consume allowance. Only never-marked entries can be refunded.
Late database commits cannot authorize late transport. Failed cleanup remains
conservative, retaining the reservation. Lease expiry cannot revive a run.

Daily records expire at midnight after two UTC days. Monthly counters expire
35 days after the end of their month. Reads enforce expiry; an hourly bounded,
transactionally rechecked sweep deletes expired records. No source, context,
answer, filename, financing identifier, raw Auth ID, address or credential enters
metadata. There is no application content logger, answer archive or cache.
Private no-store response headers apply to success, denial and duplicate status.

The prototype Firestore rules deny all client reads and writes; Admin SDK and
operator access require IAM. Review and verify these rules before broad sharing.

## Operator handoff

Build with `pnpm build:functions`. Hosting rewrites the narrow route before the
SPA fallback. The function uses Node 22 in europe-west1, 512 MiB, one CPU,
zero minimum and one maximum instance, concurrency two and timeout 55 seconds.
`functions/package.json` contains only server runtime dependencies. Browser
configuration uses public `VITE_LIVE_FIREBASE_CONFIG` and
`VITE_LIVE_RECAPTCHA_ENTERPRISE_SITE_KEY`. Never place provider or accounting
secrets in these values.

Use IAM application-default credentials with
`node scripts/live-control.mjs PROJECT initialize|disable|status`. Initialization
creates disabled control once and cannot overwrite it or reset allowances.
There is no HTTP operator action or fake transport selector. The dedicated
`LIVE_ACCOUNTING_KEY` Secret Manager value must have at least 32 bytes and remain
stable across revisions and the retained allowance windows. Configure the allowed
`LIVE_FIREBASE_APP_ID` separately from fictional roles.

`LIVE_TRUSTED_PROXY_SUFFIX` is unset by default. Ticket 13 must verify the actual
platform-appended ingress chain on direct and Hosting requests, including forged
forwarded prefixes, before pinning its comma-separated trusted proxy suffix.
An absent or mismatched suffix fails closed. This local implementation does not
claim to have verified deployed ingress.

The application-log bucket contract is in `functions/log-retention.json`.
Ticket 13 must provision that bucket with seven-day retention, route matching
application logs to it and exclude duplicate storage in longer-lived buckets.
Check the deployed service names in its filter, actual cleanup, and platform/Auth
retention separately. Configure Identity Platform anonymous-account cleanup in
that same hosted effort, without promising deletion exactly at 30 days.
Live dispatch stays closed until those checks and the bounded acceptance work
are complete. A missing workflow keeps production closed even if control is
mistakenly enabled.

## Verification

Focused local tests exercise the fixed request/result interface, independent
controllers sharing serializable metadata, real local direct/routed HTTP,
Firebase verifier policy with dummy credentials, races and UTC quotas, duplicate
status, cancellation after marking, preprocessing deadlines, unknown usage and
four-page/nine-stage bounds. Browser checks cover notice timing, real prepared
PNG transmission, refusal, source access, Arabic/English and offline retry.
The Standard-edition Firestore emulator checks actual transactions, deny-all
rules and two-day/month-end cleanup. These establish local behavior only.

Run emulator checks explicitly with `FIRESTORE_EMULATOR_HOST` supplied by
`firebase emulators:exec --only firestore --project demo-rifd` and
`node node_modules/vitest/vitest.mjs run tests/live/firestore.emulator.test.ts`.
The emulator test refuses non-local hosts and otherwise skips in ordinary tests.

The TypeSafe [documentation index](https://docs.typesafe.ai/llms.txt) and
[HTTP contract](https://docs.typesafe.ai/api) were read. Firebase's
[App Check verification](https://firebase.google.com/docs/app-check/custom-resource-backend),
[reCAPTCHA Enterprise setup](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider),
[Auth token verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
and [transaction guidance](https://firebase.google.com/docs/firestore/manage-data/transactions)
informed the adapters. The permitted package-skill catalog was checked; neither
financing helper skill matches these infrastructure changes. Its intent policy
remains unchanged.
