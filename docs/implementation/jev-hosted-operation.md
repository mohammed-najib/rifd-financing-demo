# Hosted evidence assistance preparation

Ticket [13](../../.scratch/jev-evidence-assistance-implementation/issues/13-prepare-and-verify-hosted-operation.md)
is partially implemented. Dispatch remains compiled off and deployed admission
control is disabled. The function and Hosting rewrite have not been published.
The existing public application continues to serve its previous release.
No TypeSafe inference, purchase, refill or final acceptance batch ran.

## Configured and checked on 2026-10-18

The existing signed-in Firebase account provided agent access to
`rifd-portfolio-mdnb`. The Cloud Functions API was initially disabled; no web app,
Auth configuration or Firestore database existed. Required function, build,
secret, IAM, scheduler, App Check and reCAPTCHA APIs are now enabled.

[Configuration evidence](evidence/jev-hosted/configuration.json) records the new
web app, Standard Firestore database in europe-west1 with delete protection,
separate `rifd-live-analysis` and `rifd-live-cleanup` service identities, a
regionally replicated accounting secret and the empty dedicated
`LIVE_TYPESAFE_API_KEY` secret. No service-account private keys were created.
The accounting secret's initial value contains random bytes. Its text encoding
must be normalized before first deployment, pending the approval described below.
It has never keyed an allowance. Keep the resulting text value stable across
revisions and retention windows.

`functions/.env.rifd-portfolio-mdnb` pins the allowed Firebase app ID. The ignored
`.env.production.local` holds only public Firebase configuration and the public
reCAPTCHA Enterprise site key. The score-based key accepts the two default
Hosting domains, and its App Check registration has a one-hour token lifetime.
No debug App Check credential was created. A real browser attestation remains
unverified because no browser is available in this session.

Identity Platform initialization, anonymous sign-in and automatic anonymous-user
cleanup succeeded. The deployed [deny-all rules](../../firestore.rules) were
[released](evidence/jev-hosted/firestore-rules-deploy.json). A new real anonymous
session could sign in, but its control read and disposable metadata write both
returned HTTP 403. The write created no document. See the
[Auth and rules checks](evidence/jev-hosted/auth-and-rules.json). The test account
is subject to the configured cleanup policy; this short check cannot observe
its eventual deletion.

The [Google alert budget](evidence/jev-hosted/google-budget.json) tracks this
project's gross monthly costs against US$5, with actual-spend alerts at 50%, 80%
and 100% and a forecast alert at 100%. Default billing recipients and project
owners receive the platform notifications. Alert delivery has not been observed.
The existing budgets were preserved. The TypeSafe US$5 monthly target and its
alerts remain pending account access. Neither operating target is a guaranteed
account-wide cap. Google's [budget guidance](https://docs.cloud.google.com/billing/docs/how-to/budgets)
explains that alerts alone do not prevent charges.

The function source retains Node 22, europe-west1, 512 MiB, one CPU, minimum zero,
maximum one instance, concurrency two and a 55-second timeout. The narrow
Hosting rewrite already precedes the SPA fallback. Both functions now specify
their dedicated runtime identity. Closed checks do not bind the empty provider
secret. Later activation must install the dedicated provider key and bind it by
changing the compiled dispatch capability only after the remaining controls and
ticket 14 establish readiness.

All handler responses now receive the shared private/no-store headers, including
early protocol rejection and unexpected failures. The authorized service checks
request validity before its compiled dispatch stop, allowing authenticated
arbitrary-input checks without reserving allowance. Access still comes first.
The existing service-boundary test proves these refusals make no metadata
transaction.

## Approval needed for the remaining cloud changes

Automatic approval review rejected persistent IAM grants and log-routing changes.
It said the ticket did not specifically authorize the exact permissions,
recipients and project-wide security effects. A second review rejected creation
of the replacement accounting-secret version as an unspecified persistent
credential. Neither rejected action ran. No workaround applied these changes.

The exact proposed changes are reviewable in
[pending-operations.json](evidence/jev-hosted/pending-operations.json), generated
by `node scripts/configure-live-operations.mjs plan`:

- Give both runtime identities `roles/datastore.user` on this project. This grants
  read/write access to the project's Firestore data, currently the assistance
  metadata database. It does not grant visitors any database access.
- Give the analysis identity `roles/firebaseauth.viewer` for revoked/disabled guest
  checks. Cleanup gets no Auth role.
- Give only the analysis identity `roles/secretmanager.secretAccessor` on the two
  named secrets. Cleanup gets no secret access. The provider secret remains empty
  until the operator supplies the dedicated key.
- Create the `rifd-live-application` Logging bucket in europe-west1 with seven-day
  retention. Route only the two services' stdout/stderr to it. Add the matching
  exclusion to `_Default` so those application logs are not also kept there for
  30 days. Preserve unrelated routing and platform/audit logs. The observed
  `_Required` bucket separately retains audit logs for 400 days.
- Add one random ASCII accounting-secret version before its first runtime use.
  The raw value stays in Secret Manager and never enters source, output or client
  configuration. No historical allowance or ledger changes accompany this step.

After approval, the IAM/logging script can apply the first four changes with
operator application-default credentials or an ephemeral
`RIFD_OPERATOR_ACCESS_TOKEN`. It preserves existing bindings and policy etags and
refuses conflicting existing log configuration. The accounting-secret update is
a separate explicitly approved step. None of these commands enables inference.
IAM reads request policy version 3 so conditional bindings survive the update,
following Google's [policy-version guidance](https://docs.cloud.google.com/iam/docs/allow-policies#versions).

## Hosted checks still required

The [endpoint preflight](evidence/jev-hosted/endpoint-preflight.json) failed all
six basic checks. Hosting returned the existing HTML shell with HTTP 200 and
`no-cache`; the conventional direct function URL returned HTTP 404. These are
missing deployment prerequisites, not successful authorization or cache checks.

After the approved IAM/logging/secret steps, build and deploy the functions and
Hosting route with dispatch still compiled off. Inspect the deployed v2 function
and Cloud Run settings, bound secret versions, actual service names and IAM,
then rerun `node scripts/verify-live-hosting.mjs`. The probe sends only incomplete
arbitrary input and invalid credentials by default. Optional real guest and App
Check tokens come from `LIVE_CHECK_ID_TOKEN` and
`LIVE_CHECK_APP_CHECK_TOKEN`; it never records them or transmits a valid run.
Missing real tokens are an explicit skip. Never substitute debug tokens for
proof of reCAPTCHA Enterprise browser attestation.

Verify missing, expired, revoked, non-anonymous, wrong-app and forged credentials,
then both valid tokens plus forbidden questions/options/URLs, on routed and
direct endpoints. Inspect private/no-store headers and no answer caching.
The invalid-input probe does not establish every one of these cases. In
particular, forged-token refusal cannot prove successful App Check verification.

Keep `LIVE_TRUSTED_PROXY_SUFFIX` unset until both actual ingress paths and forged
forwarded prefixes are examined securely. Do not log raw addresses or guess a
proxy suffix. The current unset value prevents work. No trusted chain or durable
quota behavior has been demonstrated on the deployment.

Check sanitized application telemetry in its actual destination, absence of
content/debug/devtools output, and absence of duplicate application storage in
longer-lived sinks. A seven-day configured bucket is not proof of seven-day
physical cleanup. Platform, Auth and audit retention follow separate policies.
There is no application archive of source images, context or answers.

Verify deployed hourly cleanup and expired reads with isolated synthetic metadata,
including daily records at the second following UTC midnight, monthly records
35 days after month end and connection-slot pruning. Preserve real counters.
The cleanup function is not deployed, so these remain local/emulator evidence.
Active-use browser analysis cleanup is covered by the focused checks below.

## Account terms and accounting stop

Current TypeSafe [model documentation](https://docs.typesafe.ai/models) lists
`jev-1.14.0` and US$0.042 per million input tokens, with free output tokens.
[Image guidance](https://docs.typesafe.ai/images) describes image/Box support as
experimental, requires the explicit image header and bills image tokens at the
same input rate. These public facts do not prove this account's access, negotiated
terms, available credit or actual charges. No provider endpoint was called here.

The [legal overview](https://docs.typesafe.ai/legal),
[customer agreement](https://typesafe.ai/legal/mca),
[data processing addendum](https://typesafe.ai/legal/data-processing) and
[privacy policy](https://typesafe.ai/legal/privacy-policy) were checked. They do
not establish account-specific zero retention. The agreement describes opt-in
refills and directs customers to their account for current credit. Dedicated-key
custody, image/model entitlement, applicable account terms, refill disabled and
TypeSafe alerts require an authenticated operator account. No such browser or
credential is available here. Do not send a provider key through chat.

Google's [anonymous Auth cleanup guidance](https://firebase.google.com/docs/auth/web/anonymous-auth#automatic-clean-up)
states that new accounts may be deleted any time after 30 days. Existing accounts
become eligible 30 days after enabling cleanup; linking a sign-in method exempts
an account. This is based on account creation/enablement, not a guaranteed
30-day inactivity timer. [Pricing](https://cloud.google.com/identity-platform/pricing)
excludes anonymous users from monthly-active-user counts when automatic cleanup
is enabled. The current [Auth limits](https://firebase.google.com/docs/auth/limits)
include 100 new accounts per hour per address; actual abuse limits can still
apply. Enabled configuration is verified; eventual account deletion is not.

The [historical file checksums](evidence/jev-hosted/configuration.json) preserve
the halted ledger and Saved index. Two completed attempts remain unreconciled.
Retired unrun proposal slots grant no collection permission. Historical balance
snapshots and token-price estimates were not treated as current credit or actual
charges.

Before any later paid call, the operator must reconcile all actual pre-feature
charges, including both stopped attempts, and check current available credit.
Copy [the empty template](../../functions/validation-accounting.example.json)
to an ignored location such as `artifacts/validation-accounting.json`, fill it
from actual billing records, then run:

```sh
node scripts/check-validation-accounting.mjs artifacts/validation-accounting.json
```

Amounts are integer billionths of a US dollar. `priorActualNano` covers all
pre-feature charges except the two separately listed stopped attempts. Record
those once each. Each new smoke attempt needs its pessimistic maximum reservation
based on current pricing, including failures. Reconciled actuals stay in
`validationAttempts`; outstanding reservations retain their full maximum.
An unknown dispatched outcome must be marked `unknown` and stops further work.
The guard rejects missing evidence, stale/future credit observations, unknown
billing, duplicate attempts and plans exceeding four new attempts. It enforces
actual charges plus all outstanding/proposed reservations at most US$1, and
current reconciled credit minus those reservations at least US$4. Credit
observations expire after 15 minutes for this preparatory check.

This is a read-only preflight. A passing result only means eligible for a durable
reservation; it does not reserve, dispatch, reconcile billing, enforce account-wide
spend or establish freshness against other account activity. Ticket 14 must
reread actual credit and durably reserve immediately before any send, using a new
bounded runner rather than restarting the retired controller. The empty template
currently fails closed. No historical ledger was changed.

## Integrated evidence and verification

The [live access report](jev-live-access.md), [workflow report](jev-workflow.md),
existing correction/reviewer browser suites, [architecture](../architecture.md)
and current Arabic/English panel copy were reviewed. Applicant and private
correction work use their authorized source/context; reviewer findings use the
submitted snapshot and cannot replace inspection confirmation. Analysis storage
stays separate from financing storage. Ordinary source inspection and labelled
Saved demonstrations remain available when live work is refused.

Five focused browser checks pass without retry: notice/Run timing with localized
refusal, offline retry without a new guest request, analysis-store incompatibility,
interrupted reset cleanup and matching Saved-source replay offline. These reuse
the public Demo/real IndexedDB boundaries. Earlier integrated Arabic/English
applicant, correction and reviewer evidence is retained; no broad suite or model
quality collection was repeated. The
[client scan](evidence/jev-hosted/client-isolation.json) finds no provider SDK,
server secret reference or dummy credential in 209 client files. It checks names
and known test strings, not account-specific secret values.

The notice explicitly describes Google and TypeSafe processing of selected
fictional pages and context, possible processing outside the server region,
limited usage metadata and no server content archive. It promises neither
account-specific zero retention nor processing exclusively in europe-west1.

The separate single ten-minute final acceptance batch, its shutdown minute and
maximum four new attempts remain untouched. Hosted authorization, trusted
ingress, no-content telemetry, real cleanup and TypeSafe billing/access still
block activation. A skipped check is not a pass.

Final local checks pass: typecheck, lint, client/function production builds, CSS
source isolation, all 140 unit tests and the five focused browser checks. The
separate emulator test is skipped in the ordinary unit command. The first CSS
check could not bind the sandbox's loopback interface; its rerun with loopback
access passed and restored a clean production build. The existing large client
chunk warning remains. None of these results substitutes for the failed hosted
endpoint checks or the unrun retention observations.

## Standards

The independent standards review found no documented violations or substantive
code smells. It used the staged change from starting commit
`9b8f665ab64f99eaabf2f8747405049bcef9ccbf`.

## Spec

The independent spec review found three disclosed incomplete requirement groups:
function/Hosting publication, deployed controls and retention proof, and TypeSafe
account reconciliation and readiness. It found no scope creep or confirmed code
defect. Review prompted the policy-version preservation fix above, checked
against Google's documentation before any IAM apply. The ticket remains in
progress and activation remains blocked.

Remaining findings: Standards zero; Spec three incomplete requirement groups.
