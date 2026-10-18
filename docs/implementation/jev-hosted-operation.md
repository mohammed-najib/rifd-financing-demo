# Hosted evidence assistance preparation

Ticket [13](../../.scratch/jev-evidence-assistance-implementation/issues/13-prepare-and-verify-hosted-operation.md)
remains in progress. The client, Hosting rewrite and both functions are published
at [the demo](https://rifd-portfolio-mdnb.web.app). Dispatch remains compiled off
and deployed admission control is disabled. Ordinary work and Saved demonstrations
remain available. No TypeSafe inference, purchase, refill or final acceptance
batch ran. The remaining account prerequisites are historical charge reconciliation,
and TypeSafe spending alerts. The operator has confirmed ordinary self-service
prepaid terms and supplied current displayed credit,
confirmed refill is disabled and installed the dedicated key. That key passed a
read-only model-listing request. These observations do not reconcile charges or
authorize inference.

## Configured and checked on 2026-10-18

The existing signed-in Firebase account provided agent access to
`rifd-portfolio-mdnb`. The Cloud Functions API was initially disabled; no web app,
Auth configuration or Firestore database existed. Required function, build,
secret, IAM, scheduler, App Check and reCAPTCHA APIs are now enabled.

[Configuration evidence](evidence/jev-hosted/configuration.json) records the new
web app, Standard Firestore database in europe-west1 with delete protection,
separate `rifd-live-analysis` and `rifd-live-cleanup` service identities and
regionally replicated accounting and provider secrets. This initial record predates
the operator's dedicated-key upload, verified in
[the custody record](evidence/jev-hosted/provider-key-custody.json).
No service-account private keys were created.
The initial accounting-secret version contained random bytes. After explicit
approval, version 2 installed a random 64-character ASCII value before first
runtime use. Only version 2 is bound. Neither version has keyed a production
allowance. Version 2 signs network proofs;
the isolated admission verifier used a separate random fixture key.
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
The existing budgets were preserved. The TypeSafe US$5 monthly target remains;
the operator could not find an account alert setting. A supported alert option
remains to be established with the provider. Neither operating target is a guaranteed
account-wide cap. Google's [budget guidance](https://docs.cloud.google.com/billing/docs/how-to/budgets)
explains that alerts alone do not prevent charges.

The function source retains Node 22, europe-west1, 512 MiB, one CPU, minimum zero,
maximum one instance, concurrency two and a 55-second timeout. The narrow Hosting
rewrite precedes the SPA fallback. The deployed runtime inspection confirms
these settings and the dedicated identities. Analysis is publicly invokable but
checks Auth and App Check inside the handler. Cleanup has no public invoker and
accepts the scheduler's dedicated identity. The provider secret now has one enabled version, installed privately by the
operator. It remains undeclared and unbound in the disabled build. Firebase
validates every declared secret, including unbound secrets, so the initially empty
secret blocked an unconditional declaration during the first deployment. Later
activation requires binding and all remaining readiness controls.

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
  named secrets. Cleanup gets no secret access. The operator has now supplied the dedicated key; the disabled function does
  not receive it.
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
secret version 2 bound, provider secret installed but unbound, control disabled
and zero active slots. Nine served shell/code/style assets match the local
production build byte for byte. Neither actual secret value occurs in those
assets. The audit read both values into process memory without recording them.
The [network-proof deployment](evidence/jev-hosted/network-proof-deployment.json)
records the later function update and corresponding Hosting release.

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
or dispatch a run. This rerun passed against the current deployment. Expired, non-anonymous and
wrong-app real credentials were not separately collected; rejection for those
cases is covered at the verifier boundary, without claiming a deployed test.

An [IAM-private probe](evidence/jev-hosted/ingress-private-probe.json) examined
both actual ingress paths and forged forwarded prefixes. Hosting had two
forwarded hops with rotating Google intermediaries. Google ownership alone cannot
authorize an earlier hop, so the implementation trusts no Hosting proxy range.
Raw visitor addresses stayed only in process memory.

The client instead obtains an authenticated `/network-proof` from the canonical
direct function endpoint after explicit Run. Issuance requires real anonymous
Auth, App Check, the pinned managed socket peer and the canonical authority in
`LIVE_TRUSTED_INGRESS`. It uses only the rightmost platform-appended caller address,
consistent with Google's [forwarding-header contract](https://docs.cloud.google.com/functions/docs/reference/headers).
The HMAC-signed proof contains a keyed guest identifier and a daily keyed network
identifier, with no raw address or guest ID. It cannot cross guests, UTC days or
signing keys. This source-free credential request does not reserve allowance. Both analysis routes
verify the same proof; neither trusts caller-provided forwarding claims. Missing
configuration or a changed platform peer refuses work until reverified.

[Deployed network-proof checks](evidence/jev-hosted/deployed-network-proof.json)
passed eleven HTTP checks, including actual browser CORS/reCAPTCHA, forged
prefixes, independent missing credentials, arbitrary proof input and refusal on
the alternate run.app authority. Four private log correlations confirm that valid
proofs verify on both analysis routes and tampered proofs do not. Every analysis
probe encountered the compiled dispatch stop. Control and its update time stayed
unchanged. This bounds work by the observed network; it does not identify a unique
visitor or prevent visitors from changing actual networks. A guest can reuse its
proof until UTC midnight after changing networks; quota remains attributed to the
network observed during issuance, rather than a newly observed analysis-source
address. No proof can name an arbitrary unobserved address or cross guests.

The function emits fixed response status/outcome/reason fields, a boolean
`ingressVerified`, network-proof readiness and cleanup counts.
[Observed telemetry](evidence/jev-hosted/deployed-telemetry.json) contains eleven
current entries in the seven-day bucket and zero matching application entries
in `_Default`. Earlier cleanup observations remain in
[their report](evidence/jev-hosted/deployed-cleanup.json). The arbitrary probe text is absent. No request, credentials,
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

A later [deployed admission check](evidence/jev-hosted/deployed-admission.json)
ran the unchanged production admission, Firestore and cleanup modules under the
actual analysis identity in an IAM-private cloud function. Two admission instances
shared one isolated real Firestore collection. All eighteen checks passed,
including transactional daily/monthly caps, cross-instance deduplication, guest
concurrency, operator disable on reservation/recheck, two connection slots,
expired-slot pruning, unknown-accounting stop, unsent-only refunds and refusal of
expired records before a sweep. Actual records had daily expiry at
2026-10-20T00:00:00Z and monthly expiry at 2026-12-06T00:00:00Z, from October 18
execution. Cleanup retained records before expiry and deleted them at expiry.
No raw guest, network or run ID appeared in the stored synthetic metadata.

The verifier's [source](../../scripts/verify-hosted-admission.ts) redirects only
the metadata collection; it has no provider transport and never enables public
control. All synthetic records were removed and production control was unchanged.
The two temporary IAM-private functions and one-hour Hosting preview were then
[deleted and their absence verified](evidence/jev-hosted/temporary-resource-removal.json).
These are deployed component checks, not an enabled public admission run. Future
expiry boundaries use explicit clocks rather than waiting out the retention
windows. Active-use browser analysis cleanup is covered by the focused checks
below. Eventual Auth deletion and physical log deletion remain observation limits,
not claims made by this check.

## Cost of the approved operation

Google charges are possible now that the hosted resources are deployed. The
US$5 budget sends alerts and does not cap charges. Standard IAM grants are
[free](https://cloud.google.com/iam/pricing). Secret Manager includes the first
six active versions per billing account, then charges US$0.06 per version per
month; disabled versions also count. This project has two accounting versions and
one provider-key version.
See [Secret Manager pricing](https://cloud.google.com/secret-manager/pricing).
Scheduler includes three jobs per billing account, then charges US$0.10 per job
per month. See [Scheduler pricing](https://cloud.google.com/scheduler/pricing).
These allowances are shared with other projects. Build, registry, compute,
database, log, reCAPTCHA and network usage follow their applicable
[Firebase/Google pricing](https://firebase.google.com/pricing). No zero-cost
promise is possible. This work made zero TypeSafe inference attempts and one read-only model metadata
request. No input images or model input tokens were sent to TypeSafe.

## Account terms and accounting stop

Current TypeSafe [model documentation](https://docs.typesafe.ai/models) lists
`jev-1.14.0` and US$0.042 per million input tokens, with free output tokens.
[Image guidance](https://docs.typesafe.ai/images) describes image/Box support as
experimental, requires the explicit image header and bills image tokens at the
same input rate. These public facts do not prove this account's access, negotiated
terms, available credit or actual charges. The dedicated key was accepted by
one documented `GET /v1/models` request, returning the current aliases. The
[access record](evidence/jev-hosted/provider-model-access.json) combines this
account authentication with the documented acceptance of versioned model IDs and
the explicit image opt-in header. No image inference was run, so it proves neither
image quality nor a successful native evaluation with this new key.

The [legal overview](https://docs.typesafe.ai/legal),
[customer agreement](https://typesafe.ai/legal/mca),
[data processing addendum](https://typesafe.ai/legal/data-processing) and
[privacy policy](https://typesafe.ai/legal/privacy-policy) were checked. They do
not establish account-specific zero retention. The agreement describes opt-in
refills and directs customers to their account for current credit. The operator reported the current displayed credit, automatic refill disabled,
and only a rounded Usage total, then installed the dedicated key through a
hidden-input Secret Manager upload. The [sanitized account report](evidence/jev-hosted/operator-account-report.json)
keeps the balance amount out of version control. Its private credit observation
cannot stay current indefinitely. The custody check read version metadata only;
the later model request and asset audit read the value only into process memory.
No key entered an env file, shell history, chat or report. The operator subsequently
confirmed ordinary self-service prepaid terms and refreshed the displayed credit
observation. The operator could not find a spending-alert setting; provider confirmation of
a supported alert option remains necessary. No custom
zero-retention agreement is assumed.

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

The operator then supplied a console usage CSV. Its request count and input/output
token totals match the two stopped attempts, with consistent dates. The
[sanitized review](evidence/jev-hosted/usage-export-review.json) records that match
without account identifiers, usage amounts or balance. The original CSV and
comparison details are preserved under ignored `artifacts/usage-export-review/`.
The export contains no monetary charge, currency, rate, balance or individual
provider request identifier. Matching usage does not establish actual debits, and
the other aggregate row does not establish complete prior account coverage.
No estimated charge has been inserted into the accounting state or historical
ledger.


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
maximum four new attempts remain untouched. The agent-accessible deployment,
ingress, admission, cleanup, credential, cache and content-free telemetry checks
are complete. Activation still requires actual historical charge reconciliation,
a fresh pre-dispatch credit read, TypeSafe alert confirmation and the separate
bounded acceptance decision. A rounded usage total cannot establish the two
stopped attempts' actual charges. The documented public API has model listing
and evaluation, without a billing reconciliation endpoint. Do not probe undocumented
billing paths or substitute token estimates for actual debits.

The supplied export contains usage rather than charges. Obtain the provider's
billing breakdown
for both stopped requests and prior pre-feature charges. The provider's
[support guidance](https://help.typesafe.ai/articles/8737694518-who-should-i-reach-out-to-with-support-requests)
identifies its billing contact. The operator has answered all requested account questions. No support message
has been sent on the user's behalf. A local draft with the two timestamps is prepared in the ignored
`artifacts/typesafe-billing-request.txt`; the operator must fill the organization
locally. No purchase or refill is needed to obtain this evidence. The validation
accounting file remains incomplete and the read-only guard refuses it.

Final local checks pass: typecheck, lint, all 143 unit tests and the standalone
hosted-verifier typecheck. The separate emulator test is skipped in the ordinary
unit command. Both production builds passed. The focused live-access browser
suite passed both checks after this client change. Earlier store compatibility,
cleanup, Saved replay and bilingual workflow checks remain applicable. The first
browser invocation used the wrong test path and found no tests; the corrected
path passed. Build and HTTP tests need loopback access, which the sandbox blocks;
their permitted reruns passed. The existing large client chunk warning remains.
Local checks do not substitute for unrun native inference or elapsed retention
observations.

## Standards

The independent follow-up review since `fdbe70c` found no hard documented
violations and no substantive baseline smells. Network proofs bind the authenticated
guest, UTC day and observed network without exposing raw identifiers. Both routes
verify the signature; issuance fails closed for unexpected peers or authorities.
Cancellation covers the handshake, and authorization time reduces the remaining
analysis deadline. Secrets and proof contents stay out of application logs.

The verifier now uses a fixed October 18 calendar fixture with literal October 20
and December 6 expectations. These independently match the retained actual
October 18 deployment result. This correction needs no additional deployed run.
The report now distinguishes the stable keyed guest identifier from the daily
keyed network identifier. Earlier reviews since `9b8f665` and `a823a7b` also found
no hard standards violations. The documentation-only follow-up since `7c001d7`
also found no hard violation or substantive smell. It confirmed that the usage
export review publishes no account identifiers, balances or raw usage values.


## Spec

One requirement group remains partial, accurately disclosed. The spec requires
reconciliation of both stopped attempts and actual available credit before a
future paid call, plus pinned-model/image access, pricing, applicable terms,
dedicated-key custody, refill disabled and account cleanup before activation.
Actual historical charges, fresh reconciled credit and TypeSafe alerts remain
unresolved. Subsequent operator confirmation establishes ordinary self-service
prepaid terms. The usage export supports historical token usage, not actual
monetary reconciliation. Model listing authenticates the installed key
but does not prove native image evaluation. These remain prerequisites for future
paid work; dispatch is compiled off, production control is disabled and no
inference ran.

The review found no scope creep or confirmed implementation errors. The
source-free handshake and temporary IAM-private verifier support the requested
ingress and deployed control checks. The same-guest network-attribution limitation
is stated explicitly. Firestore evidence distinguishes production-component
verification from an enabled public admission run. Configured retention, synthetic
expiry boundaries and observed cleanup support preparation. Physical log/Auth
deletion remains an observation limit, with no new waiting period imposed.

The initial review prompted the IAM policy-version preservation fix before
apply. The ticket remains in progress only for the account-readiness group.

The documentation-only follow-up found no new defect, scope creep or privacy
issue. It confirmed that the export supports usage comparison without reconciling
monetary debits, and that an alert setting not found by the operator remains an
unresolved control. No additional unit run was needed for these evidence changes.

Remaining findings: Standards zero; Spec one incomplete account-readiness group,
with zero confirmed code defects or scope creep.
