# Jev live service, access and cost options

> Historical research. Repository state and provider facts below describe the inspection date, not the current checkout. See the [research index](README.md) and [current architecture](../architecture.md).

Researched on 2026-10-17 for **Verify live service access and cost controls**, part of **Plan thoughtful Jev evidence assistance**. This report records facts and choices for the later human decision. It selects no deployment, access policy or budget. No inference, private-account query, provisioning or deployment was performed.

## What the project has today

The checked-in [Firebase configuration](../../firebase.json) serves `dist/client`, sends unmatched paths to `/_shell.html`, and configures only the Hosting emulator. [package.json](../../package.json) requires Node `>=22.19.0` and has no TypeSafe SDK or server package. The [architecture](../architecture.md) places application records, file bytes and simulated sessions in the browser. Its role restrictions explicitly are not a security boundary against a visitor controlling that browser.

Therefore a server that receives an applicant ID, reviewer role, document hash or revision from this app cannot treat that field as proof of authorization. A new inference endpoint needs its own admission policy. Keeping the current browser workflow does not require copying the whole financing application to a server.

## Two deployment options beside classic Hosting

Both options keep the existing static site. A narrow analysis route can be forwarded to server code. Neither requires migrating the application to Firebase App Hosting.

| Concern | Firebase HTTPS function, second generation | Cloud Run service |
| --- | --- | --- |
| Runtime | Firebase supports Node 22 and both ESM and CommonJS. A separate function package can use Node 22. [Runtime options](https://firebase.google.com/docs/functions/manage-functions) | A container can carry the Node runtime and any image/PDF dependencies. Cloud Run supports Node.js and other languages. [Hosting integration](https://firebase.google.com/docs/hosting/cloud-run) |
| Existing hostname | Hosting supports a rewrite with `functionId` and `region`. `pinTag` can tie the function revision to a Hosting release. [Functions integration](https://firebase.google.com/docs/hosting/functions) | Hosting supports a rewrite with `serviceId` and a supported `region`; `pinTag` ties the service revision to the Hosting release. [Cloud Run integration](https://firebase.google.com/docs/hosting/cloud-run) |
| Request time | An HTTP function can run for up to 60 minutes, but a Hosting request times out after 60 seconds. [Function quotas](https://firebase.google.com/docs/functions/quotas), [Hosting timeout](https://firebase.google.com/docs/hosting/functions) | Cloud Run defaults to 300 seconds and permits up to 3,600 seconds. The Hosting route still stops waiting after 60 seconds. [Service timeout](https://cloud.google.com/run/docs/configuring/request-timeout), [Hosting timeout](https://firebase.google.com/docs/hosting/cloud-run) |
| Body size | The published second-generation limit is 32 MB of uncompressed HTTP request data. [Function quotas](https://firebase.google.com/docs/functions/quotas) | HTTP/1 requests have a 32 MiB limit. The service's HTTP/2 exception does not establish the capacity of a request travelling through Hosting. [Cloud Run quotas](https://cloud.google.com/run/quotas) |
| Secrets | Store the provider key in Secret Manager, define it with `defineSecret`, and bind access to the function. [Secret parameters](https://firebase.google.com/docs/functions/config-env#secret_parameters) | Reference a Secret Manager version as an environment variable or mounted file. The service identity needs Secret Manager Secret Accessor. [Cloud Run secrets](https://cloud.google.com/run/docs/configuring/services/secrets) |
| Local development | Hosting and Functions emulators test the rewrite together. The current project would need Functions added to its emulator configuration. [Local function testing](https://firebase.google.com/docs/hosting/functions) | Run the container locally and connect the development client to it. The current Hosting-only emulator configuration does not itself provide a Cloud Run container. [Local container testing](https://firebase.google.com/docs/hosting/cloud-run#test_locally) |
| Billing prerequisite | Deploying supported Node runtimes requires Blaze. [Hosting and Functions](https://firebase.google.com/docs/hosting/functions) | Requires a Cloud Billing account even when usage falls inside free allowances. Linking billing upgrades a Spark Firebase project to Blaze. [Cloud Run prerequisites](https://firebase.google.com/docs/hosting/cloud-run#before_you_begin) |

The TypeSafe JavaScript SDK requires Node 22 or newer and includes TypeScript declarations, ESM and CommonJS. Its automatic zstd compression requires Node 22.15 or newer. The repository's Node floor is compatible, but a deployed runtime and the chosen SDK version still need verification during implementation. [TypeSafe JavaScript SDK](https://docs.typesafe.ai/sdk/javascript)

The engineering tradeoff is the amount of packaging to own. A function fits a small request validator and TypeSafe adapter, with Firebase deployment and emulator support. A container offers explicit control over native image/PDF tools and the HTTP server. Neither option proves that PDF rendering belongs on the server; that is a separate architecture decision.

For either route, place the specific API rewrite before the existing `**` shell fallback and test both API and application paths. Return `Cache-Control: private, no-store` for analysis responses. Firebase strips most cookies before forwarding, preserving the specially named `__session` cookie; this matters if the later identity design chooses cookies. POST responses are not CDN-cached. [Hosting cache behavior](https://firebase.google.com/docs/hosting/manage-cache)

The request must fit every layer: browser encoding, Hosting, application parser, function/container and TypeSafe. The provider allows 32 MiB bodies; images accept PNG or JPEG and at most 16 MiB per file. Base64 increases transfer size, while the SDK uploads image bytes as multipart. Choose a smaller application limit with space for metadata and framing, and test it through the actual hosted route. This report did not establish a separate Hosting upload ceiling. [HTTP API](https://docs.typesafe.ai/api), [Image limits and transfer](https://docs.typesafe.ai/images)

## Timeouts, retries and local isolation

The SDK's default timeout is 10 seconds **per attempt**, with no total retry deadline. Its retry policy allows two retries after the first attempt, includes timeouts and connection failures, and can honor a server retry delay of up to 60 seconds. Default retries can therefore exceed Hosting's outer deadline. [Client options](https://docs.typesafe.ai/sdk/javascript/api/interfaces/TypeSafeClientConfig), [Retry policy](https://docs.typesafe.ai/sdk/javascript/api/interfaces/RetryPolicy)

A later implementation should choose one total analysis deadline below the route deadline, then allocate time to validation, uploads, each provider attempt and response handling. It must account for every provider attempt, including a second analysis stage. A timed-out connection does not prove that the provider performed no work. Cloud Run specifically warns that a request timeout closes the connection without terminating its container's processing. [Cloud Run timeout behavior](https://cloud.google.com/run/docs/configuring/request-timeout)

Use a fake TypeSafe transport for ordinary local and CI tests. The Functions emulator can access production secrets through application default credentials; `.secret.local` overrides those values. Consequently, running an emulator is not evidence that inference cannot be billed. Supply a dummy key and fake transport unless a separately authorized live experiment is being run. [Emulator secrets](https://firebase.google.com/docs/functions/config-env#emulator_support)

## Access choices for the human decision

These are possible policies, not decisions made by this research.

| Policy | What a visitor experiences | What the server must enforce | Main tradeoff |
| --- | --- | --- | --- |
| Operator-only live analysis | Everyone can use labelled saved demonstrations. An approved operator can initiate real analysis. | A real operator identity and allowlist, or a private IAM-protected endpoint used through an operator tool. | Least public inference exposure; visitors cannot freely test their own evidence live. |
| Bounded visitor analysis of curated examples | Visitors choose known fictional examples and trigger a real request while allowance remains. | An allowlist of example IDs resolved to server-owned bytes, fixed questions/model, shared attempt budget, per-caller throttling and duplicate handling. | Limits input variability and data handling; demonstrates less of the upload workflow. |
| Bounded visitor analysis of uploads | Visitors can send prepared fictional document pages within stated limits. | Verified admission, strict size/page limits, fixed questions/model, a shared budget, per-caller limits, cancellation policy and request validation. | Closest to the full workflow; needs more abuse controls and a clear upload notice. |

Firebase Auth can supply an ID token that the server verifies before trusting its UID. A verified UID still needs an authorization rule. The app's existing simulated role is separate from this identity. Cloud Run also supports a private service with IAM invoker access; its authenticated local proxy is an operator/developer option, not a login flow automatically supplied by a Hosting rewrite. [Verify Firebase ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens), [Cloud Run developer authentication](https://cloud.google.com/run/docs/authenticating/developers)

App Check can add app/device attestation. Firebase explicitly says it does not stop all abuse and distinguishes it from user authentication. Built-in Functions support applies to callable functions; a plain HTTPS endpoint or Cloud Run service must verify App Check tokens as a custom backend. [App Check](https://firebase.google.com/docs/app-check), [Custom backend verification](https://firebase.google.com/docs/app-check/custom-resource-backend)

CORS restricts browser access to responses; it does not stop an independent HTTP client from calling an endpoint. A same-origin rewrite does not grant identity or make a provider key safe in frontend code. Likewise, a hidden button, a browser-local quota and a claimed document hash cannot enforce a shared allowance. These are security consequences of accepting requests from a visitor-controlled client, not additional Firebase guarantees.

For a public endpoint, enforce the same admission rules on its direct service URL as on its Hosting route. The documented Hosting-to-Cloud-Run setup allows unauthenticated platform invocations, so application authorization must run before any provider request. A private IAM design needs its own verified invocation path. [Hosting deployment instructions](https://firebase.google.com/docs/hosting/cloud-run#step_3_deploy_the_container_image_to_cloud_run)

Saved examples are already an accepted requirement. Their results should remain tied to the matching fictional evidence, model, question version and recording time. When live analysis fails or allowance is exhausted, offer an explicitly labelled saved example. A saved answer cannot claim to analyze a visitor's changed document. The exact interface remains a later decision.

## Published TypeSafe cost and usage facts

| Fact verified on the research date | Consequence |
| --- | --- |
| `jev-1.14.0` is published at $42 per billion input tokens, or $0.042 per million; output tokens are free. | Estimate provider charges from input usage. This excludes hosting, processing, storage and tax. [Models](https://docs.typesafe.ai/models) |
| Images count as input tokens at the text rate, with no separate image charge. The image guide says estimation guidance is still forthcoming. | Do not infer exact tokens from file bytes or pixels. Record actual usage during an authorized experiment. Repeating an image reference can increase what the model reads even when uploaded once. [Image accounting](https://docs.typesafe.ai/images#image-tokens) |
| The default context limits are 64k per request and 32k per question. Long context is separately enabled. | Pin the model and permitted request options on the server; do not let visitors enable larger contexts or arbitrary questions. [Model limits](https://docs.typesafe.ai/models) |
| Rate limits apply per organization in tokens/second and requests/second. The private console shows the actual allowance. | No universal numeric quota is established here. A 429 is a provider limit event, not a monthly spend boundary. [Rate limits](https://docs.typesafe.ai/models#rate-limits) |
| The SDK's usage fields are `number \| null`. | Missing usage is unknown, never zero. Response-only accounting can miss timed-out attempts. [SDK 0.7.0 types](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.7.0/src/types.ts) |

For illustration only, one successful request using 10,000 input tokens costs $0.00042 at the published rate. One thousand such requests cost $0.42. This arithmetic is not a measured document cost or a promise about page counts. Retries and multi-stage requests increase attempts. Images need representative measurements.

The customer agreement describes purchased and promotional credits. Automatic refill is opt-in. Without automatic refill, the agreement says TypeSafe **may** decline output after credits are exhausted. It does not establish an unconditional zero-overrun guarantee. Credit consumption can vary with account settings, and the account displays its balance. Confirm the actual account contract, refill settings and enforcement before relying on prepaid credit as a spend boundary. [Master customer agreement, section 8](https://typesafe.ai/legal/mca)

## Controls that reduce spending, and their limits

There are two bills: Google infrastructure and TypeSafe inference. A limit on one is not a limit on the other. Cloud Run functions and source deployments can also incur Cloud Build and Artifact Registry charges outside Cloud Run compute pricing. Secret management, any shared accounting store and retained logs add their own possible costs. [Cloud Run pricing](https://cloud.google.com/run/pricing)

Google's current documentation distinguishes alerts-only budgets from Preview spend-cap budgets. Alerts do not pause services. The newer caps pause eligible services after reported spending reaches the threshold, but enforcement can lag by several minutes and overages remain billable. Firebase lists Cloud Functions and App Hosting's underlying Cloud Run services among eligible services. Eligibility and configuration for the chosen project/service need checking later. These caps are not a TypeSafe usage control and do not cover an entire multi-service bill. [Budget alerts](https://firebase.google.com/docs/projects/billing/avoid-surprise-bills), [Spend-cap limits](https://firebase.google.com/docs/projects/billing/spend-caps)

Maximum instances and concurrency reduce simultaneous work. They do not bound the number of requests over a month, and Cloud Run documents brief periods above its maximum instance setting. A single instance can still make many paid provider requests. [Maximum instances](https://cloud.google.com/run/docs/configuring/max-instances)

An application-controlled admission budget can bound the number of provider attempts sent through this server. The design would need:

- A durable, shared counter or reservation ledger checked atomically before dispatch, across instances and revisions. An in-memory counter is insufficient.
- Server-owned model, questions, image/page limits and a finite attempt count. Every retry or follow-up consumes a reservation before it is sent.
- An idempotency key tied to validated evidence and question versions, with explicit handling for concurrent duplicates and unknown outcomes.
- A policy for missing usage and uncertain timeout outcomes. Retaining their reservation is conservative; refunding them automatically can admit more work than intended.
- A server-side disable switch, an exhaustion response and a fail-closed rule if the shared accounting store is unavailable.

Those are engineering requirements for a proposed control, not features verified in the existing app. A monetary promise also needs a defensible maximum charge per admitted attempt, current provider terms and a margin. Until image-token estimation and failed-attempt billing are established, describe the control as an attempt allowance with estimated spend. Even a correct inference limiter does not cap all charges from requests reaching Google infrastructure, nor requests made elsewhere with the same TypeSafe key.

## Data handling and facts still unknown

TypeSafe's privacy policy says it does not train or fine-tune models on submitted input, and states that its services are hosted in the United States. It retains personal data for as long as reasonably necessary for its stated purposes. The DPA likewise gives a purpose-based retention period rather than a fixed number of days. The legal documentation offers zero data retention for enterprise customers. No account-specific ZDR entitlement was verified. [Privacy policy](https://typesafe.ai/legal/privacy-policy), [DPA, schedule I](https://typesafe.ai/legal/data-processing), [Enterprise ZDR](https://docs.typesafe.ai/legal)

Therefore the demo should not promise that an uploaded page is never retained, stays in the selected Google region, or is processed only locally. The accepted scope is fictional evidence. The later policy must say which bytes leave the browser, when live submission occurs, whether the app retains those bytes or results server-side, and how saved examples differ. Sending no raw documents to application logs is an implementation choice we can control. The SDK's debug level logs request bodies without redacting them, so enabling debug logging would undermine that choice. [SDK logging options](https://docs.typesafe.ai/sdk/javascript/api/interfaces/TypeSafeClientConfig)

The following remain unverified and must not be inferred from checked-in project IDs or public examples:

- The project's Blaze/billing status, permissions, available regions, quotas, spend-cap eligibility and other workloads sharing its bill.
- TypeSafe account access to the pinned model and experimental images, its RPS/TPS quotas, balance, promotional terms, refill settings, negotiated price or ZDR agreement.
- Billing treatment for abandoned, timed-out or unsuccessful inference attempts, and any provider idempotency guarantee. Public pages read here do not establish those guarantees.
- Real page-token counts, Arabic/English accuracy, cold-start latency, upload latency, deadline behavior and rate-limit behavior for this workflow.
- The exact retention period applying to this account and any image-specific retention or processing-location agreement.

The decision ticket can now choose who receives live access, what evidence they may send, function versus container, authentication and admission controls, an initial allowance, and failure behavior. Any authenticated setup or paid measurement needed to settle those choices should become a separately scoped task before implementation.
