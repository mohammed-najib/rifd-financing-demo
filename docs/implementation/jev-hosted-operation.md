# Hosted evidence assistance preparation

Ticket [13](../../.scratch/jev-evidence-assistance-implementation/issues/13-prepare-and-verify-hosted-operation.md)
remains in progress. The client, Hosting rewrite and both functions are published
at [the demo](https://rifd-portfolio-mdnb.web.app). Dispatch remains compiled off
and deployed admission control is disabled. Ordinary work and Saved demonstrations
remain available. No TypeSafe inference, purchase, refill or final acceptance
batch ran. Remaining prerequisites are listed below.

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
The initial accounting-secret version contained random bytes. After explicit
approval, version 2 installed a random 64-character ASCII value before first
runtime use. Only version 2 is bound. Neither version has keyed an allowance.
Keep the deployed value stable across revisions and retention windows. Its raw
value never entered source, reports or client configuration.

`functions/.env.rifd-portfolio-mdnb` pins the allowed Firebase app ID. The ignored
`.env.production.local` holds only public Firebase configuration and the public
reCAPTCHA Enterprise site key. The score-based key accepts the two default
Hosting domains, and its App Check registration has a one-hour token lifetime.
No debug App Check credential was created. The deployed browser bundle acquired
real anonymous Auth and reCAPTCHA Enterprise App Check credentials successfully.

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
maximum one instance, concurrency two and a 55-second timeout. The narrow Hosting
rewrite precedes the SPA fallback. The deployed runtime inspection confirms
these settings and the dedicated identities. Analysis is publicly invokable but
checks Auth and App Check inside the handler. Cleanup has no public invoker and
accepts the scheduler's dedicated identity. The provider secret has zero versions
and is neither declared nor bound in the disabled build. Firebase validates all
declared secrets, including unbound ones, so an unconditional declaration blocked
the first deployment. Later activation requires the dedicated provider key,
binding and all remaining readiness controls.

All handler responses now receive the shared private/no-store headers, including
early protocol rejection and unexpected failures. The authorized service checks
request validity before its compiled dispatch stop, allowing authenticated
arbitrary-input checks without reserving allowance. Access still comes first.
The existing service-boundary test proves these refusals make no metadata
transaction.

## Approved cloud changes

Automatic approval review initially rejected the persistent IAM grants,
log-routing changes and replacement accounting-secret version because their exact
effects were not specifically authorized. The user then explicitly approved the
reviewable proposal. All approved changes succeeded. No approval is pending for
these operations. See [the applied record](evidence/jev-hosted/approved-operations.json)
and [read-back verification](evidence/jev-hosted/operations-verification.json).

The exact approved changes are recorded in
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

The IAM/logging script applied the first four changes using an ephemeral
`RIFD_OPERATOR_ACCESS_TOKEN`. It preserved existing bindings and policy etags and
refuses conflicting existing log configuration. The accounting-secret update was
a separate approved step. No service-account private key was created or stored.
None of these operations enables inference.
IAM reads request policy version 3 so conditional bindings survive the update,
following Google's [policy-version guidance](https://docs.cloud.google.com/iam/docs/allow-policies#versions).

## Deployed control evidence

The earlier [endpoint preflight](evidence/jev-hosted/endpoint-preflight.json)
failed because the route and function were not deployed. Those failures remain
in the record. The [final function deployment](evidence/jev-hosted/final-functions-deploy.json)
and [Hosting release](evidence/jev-hosted/hosting-deploy.json) succeeded.
An initial cleanup creation received a transient Cloud Run 500; retry succeeded.
The CLI also required an Artifact Registry cleanup policy. Generated build images
now have one-day retention. Historical ledgers and saved captures were preserved.

[Runtime and asset verification](evidence/jev-hosted/deployed-runtime-and-assets.json)
confirms both functions are active, the analysis settings above, only accounting
secret version 2 bound, provider secret empty, control disabled and zero active
slots. Nine served shell/code/style assets match the local production build byte
for byte. None contains the actual accounting-secret value. The provider key
cannot be scanned because none has been installed.

`node scripts/verify-live-hosting.mjs` passed all six basic checks on the
direct and routed endpoints. Missing credentials, forged credentials with role
and forwarded-address claims, and wrong methods are refused. Each response has
`private, no-store, max-age=0`. See [endpoint results](evidence/jev-hosted/deployed-endpoints.json).

`node scripts/verify-live-browser.mjs --revoke-test-session` passed eight checks
using the actual deployed client module in a fresh headless Chrome context.
Real anonymous Auth and reCAPTCHA Enterprise credentials allow request validation
to reject forbidden questions, model selection and an image URL with HTTP 400.
Removing either credential returns 401. Revoking only that disposable guest's
session makes the original credentials return 401 on both endpoints. See
[browser and revocation evidence](evidence/jev-hosted/browser-attestation-and-revocation.json).
The optional revocation step uses operator ADC or an ephemeral access token;
without it the script performs six checks. Credentials and the raw guest ID stay
in memory. Every probe is incomplete and has no source image, so none can reserve
or dispatch a run. Expired, non-anonymous and wrong-app real credentials remain
unverified on the deployment; local verifier tests do not close those gaps.

Keep `LIVE_TRUSTED_PROXY_SUFFIX` unset until both actual ingress paths and forged
forwarded prefixes are examined securely. Do not log raw addresses or guess a
proxy suffix. The current unset value prevents work. No trusted chain or durable
quota behavior has been demonstrated on the deployment.

The function emits only fixed response status/outcome/reason fields and cleanup
counts. [Observed telemetry](evidence/jev-hosted/deployed-telemetry.json) contains
nine such entries in the seven-day bucket and zero matching application entries
in `_Default`. The arbitrary probe text is absent. No request, credentials,
source, context, run identifier or answer enters the application logger.
A seven-day configured bucket is not proof of seven-day physical deletion.
Platform, Auth and audit retention follow separate policies. There is no
application archive of source images, context or answers.

The hourly UTC scheduler is enabled and authenticates as the cleanup identity.
[The deployed cleanup probe](evidence/jev-hosted/deployed-cleanup.json) inserted
four isolated synthetic records while control stayed disabled. Running the actual
scheduler removed expired daily/monthly records and retained future records.
The probe removed its remaining fixtures and confirmed control was unchanged.
The first short observation finished before Scheduler ran; a later probe's
raw JSON comparison also misclassified equivalent empty-array encoding as a
control change. Both failed records are retained. The final comparison normalizes
field order and absent versus empty array values and passes.

This proves deployed cleanup respects supplied expiry times. It does not prove
the whole admission path computes the specified next-UTC-midnight or month-end
plus 35-day expiry, rejects expired reads, or prunes connection slots on the
deployment. Those still have local/emulator evidence only. Active-use browser
analysis cleanup is covered by the focused checks below.

## Cost of the approved operation

Google charges are possible now that the hosted resources are deployed. The
US$5 budget sends alerts and does not cap charges. Standard IAM grants are
[free](https://cloud.google.com/iam/pricing). Secret Manager includes the first
six active versions per billing account, then charges US$0.06 per version per
month; disabled versions also count. This project has two accounting versions.
See [Secret Manager pricing](https://cloud.google.com/secret-manager/pricing).
Scheduler includes three jobs per billing account, then charges US$0.10 per job
per month. See [Scheduler pricing](https://cloud.google.com/scheduler/pricing).
These allowances are shared with other projects. Build, registry, compute,
database, log, reCAPTCHA and network usage follow their applicable
[Firebase/Google pricing](https://firebase.google.com/pricing). No zero-cost
promise is possible. This work made zero paid TypeSafe attempts.

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
maximum four new attempts remain untouched. Activation still requires:

- Operator TypeSafe billing reconciliation, current credit, dedicated key,
  pinned-model/image access, account terms, refill disabled and spending alerts.
- Verified trusted ingress on both routes, including forged forwarded prefixes.
  The unset suffix currently refuses all otherwise valid work.
- Remaining real deployed credential cases and admission behavior, including
  transactional allowances, expired reads, expiry calculation and slot pruning.
  No paid attempt is needed to check these controls.
- Retention observations over their actual windows. Configured seven-day logs
  and anonymous cleanup eligibility do not establish physical deletion timing.

A skipped check is not a pass. Keep compiled dispatch and deployed control off
while any required prerequisite is incomplete.

Final local checks pass: typecheck, lint and all 140 unit tests. The separate
emulator test is skipped in the ordinary unit command. The function production
build passed before the successful deployment. The earlier client build, CSS
source isolation and five focused browser checks still apply because no client
source changed during deployment. The first CSS check could not bind the
sandbox's loopback interface; its rerun with loopback access passed and restored
a clean production build. The existing large client chunk warning remains.
Local checks do not substitute for unrun deployed checks or retention observations.

## Standards

The independent follow-up review of staged changes since `a823a7b` found no hard
documented violations and no substantive baseline code smells. It confirmed
disabled dispatch, server-side credentials, in-memory probe credentials and
telemetry limited to fixed status fields and cleanup counts. The initial review
from `9b8f665ab64f99eaabf2f8747405049bcef9ccbf` also had no findings.

## Spec

The independent follow-up review found two disclosed incomplete requirement
groups. Deployed controls and retention still need trusted ingress, allowance
behavior, expiry calculation, expired-read refusal and slot pruning, with actual
deletion timing remaining an observation limit. TypeSafe account readiness still
needs the two stopped attempts reconciled, current credit and account-specific
key/access/terms/refill/alert controls. It found no scope creep or confirmed code
defect. The real browser credential/revocation checks and metadata logger support
the requested verification without paid dispatch. Publication is complete.

The initial review prompted the IAM policy-version preservation fix before
apply. The ticket remains in progress and activation remains blocked.

Remaining findings: Standards zero; Spec two incomplete requirement groups,
with zero confirmed code defects.
