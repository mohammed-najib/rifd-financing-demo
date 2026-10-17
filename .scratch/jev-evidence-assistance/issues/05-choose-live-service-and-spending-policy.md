# Choose live access, deployment and spending policy

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Assignee: the operator
Parent: [Plan thoughtful Jev evidence assistance](../map.md)
Blocked by: 01, 03, 04

## Question

How should visitors and the demo operator access live Jev analysis, where should the server run, and which data and spending limits make that access appropriate for this fictional public demo?

Decide live access eligibility, deployment/runtime, provider credential ownership, request admission, per-user and shared limits, a concrete spending envelope, timeout and retry policy, and behavior when a limit or service failure prevents analysis. Choose the handling and retention of fictional document bytes, derived images, results and logs. Preserve useful saved demonstrations and state clearly when the operator must configure credentials or account settings. Choose the narrow integration interface and SDK approach needed by the selected tasks. The user explicitly requires TanStack AI as of the second decision round; establish its concrete role while preserving Jev's native typed-judgment contract.

Choose browser/server ownership of image decoding and PDF rasterization, the renderer approach and associated preview geometry, and numerical limits for pages, pixels, preparation work and concurrent inference. Define bounded request composition for the selected tasks. Apply the accepted default of checking every page within the analysis limit and requiring explicit page selection when it is exceeded, as resolved in [Define useful applicant and reviewer assistance](04-define-assistance-tasks-and-workflows.md#answer).

Resolve with the user using grilling and domain-modeling. Any human-only setup needed to settle a decision becomes a separate task ticket; provisioning and deployment for delivery remain implementation work.

Use [Verify the Jev model and SDK contract](01-verify-jev-model-and-sdk-contract.md), [Verify live service access and cost controls](03-verify-live-service-access-and-cost.md) and the tasks chosen in [Define useful applicant and reviewer assistance](04-define-assistance-tasks-and-workflows.md).

## Comments

### Round 1 confirmed on 2026-10-17

The user answered "Yes to all" to these four starting decisions:

- Visitors may request live checks of their own fictional uploads, subject to server-enforced per-visitor and shared allowances. Saved demonstrations remain available when live checks are unavailable. Selecting a fictional applicant or reviewer does not grant additional allowance.
- Initial spending targets are US$5 per month for TypeSafe and US$5 per month for Google. Provider-attempt limits and a server disable switch support those targets, but do not guarantee a maximum total bill. This planning decision authorizes no purchase or inference call in this session.
- The browser decodes images and renders PDFs with a pinned PDF.js renderer. Only selected prepared page images and necessary application details cross the inference server boundary. Analysis previews and highlights use the same prepared images.
- Live submission accepts fictional evidence only, with an explicit notice before transmission. There is no server archive of document content or analysis results and no content in logs. Google and TypeSafe process submitted data; account-specific zero retention by TypeSafe is not promised. Existing browser storage and clearly labelled saved demonstrations remain available.

Deployment, admission, numerical limits, bounded requests, failure handling and operational retention details remain for the next rounds. The ticket is still claimed.

### Round 2 confirmed on 2026-10-17

The user answered "Yes to all" to these operating choices and added, "Take note that I want to use Tanstack AI library in this project."

- Use a second-generation Firebase HTTPS function beside classic Hosting, with Node 22, region `europe-west1`, 512 MiB memory, one CPU, zero minimum instances, one maximum instance and HTTP concurrency two. The operator owns the Google and TypeSafe accounts and a dedicated TypeSafe key stored in Secret Manager.
- Use anonymous Firebase Authentication and App Check for live admission. Verify both tokens server-side, including direct service calls. Guest identity is separate from fictional demo roles. Operator maintenance uses Google IAM and provides no public quota bypass.
- Allow one active analysis and one new start per minute per guest identity. Provider-attempt allowances are 20 per guest per UTC day, 60 per network address per UTC day, 100 shared per UTC day and 1,000 shared per UTC calendar month. Enforce at most two concurrent provider calls through a server-only transactional Firestore allowance store. Fail closed when that store is unavailable. Dispatched attempts with uncertain outcomes consume allowance.
- Analyze at most four pages per run, all pages when within that limit, otherwise an explicit selection of up to four. PDFs over 100 pages, encrypted documents and incomplete renders have no live analysis. Keep the original 5,000,000-byte attachment limit. Prepare full-page PNGs with each side 280 through 1568 pixels, at most 2 MiB each and 8 MiB combined. Preserve orientation and proportions, padding rather than cropping narrow pages. Before decoding, limit source images to 20 million pixels and 8,192 pixels per side. Prepare one page at a time, at most eight seconds per page and 20 seconds per run. Failed or oversized preparation leaves manual review available without silent quality reduction or dropped pages.
- Keep only content-free allowance and duplicate-protection metadata server-side. Daily records live for two UTC days; monthly aggregates live for 35 days after their month ends. Sanitized operational logs live for seven days. Use daily keyed network identifiers instead of retaining raw network addresses in the allowance store. Provider and platform retention remain subject to their own settings and terms. Browser-result persistence remains a later lifecycle decision.

TanStack AI is now a requirement. Its role, bounded request composition, deadlines, retry/failure behavior and remaining operational details must be settled before resolution. No dependencies have been installed and no infrastructure has been changed.

### Anonymous-account cleanup confirmed on 2026-10-17

The user selected "Yes, use automatic anonymous-account cleanup." Enable cleanup through Firebase Authentication with Identity Platform after verifying the project's pricing and quotas. Anonymous accounts become eligible for deletion after 30 days; no exact deletion deadline is promised. Authentication-account retention is separate from allowance-metadata retention.

### Failure behavior confirmed on 2026-10-17

The user selected "Yes, explicit retries and visible partial coverage." Do not retry provider requests automatically. An explicit new run after failure or cooldown consumes allowance for every dispatched attempt. Busy or exhausted service offers a clear availability message and labelled saved examples. Retain successful page findings with incomplete-coverage warnings; failed and unchecked pages cannot establish absence or agreement. Provider authentication errors disable live dispatch until the operator fixes them. Manual review remains available.

### TanStack AI compatibility facts checked on 2026-10-17

A read-only background check inspected published `@tanstack/ai@0.69.0` and `@tanstack/ai-typesafe@0.1.12` archives. [TanStack's evaluation API](https://tanstack.com/ai/latest/docs/evaluate/evaluate) provides `decide`, `choice`, `score` and `boolean`, with Noul probability retained by `boolean`. Its public result does not include Box. The [built-in TypeSafe adapter](https://github.com/TanStack/ai/blob/main/packages/ai-typesafe/src/adapters/evaluate.ts) lacks SDK image-asset transport, rejects nullable usage and omits native response headers. The [public adapter contract](https://tanstack.com/ai/latest/docs/reference/interfaces/EvaluateAdapter) permits an application-owned SDK bridge. Released adapter results require numeric usage, so unknown native usage needs an explicit error path rather than fabricated counters. These facts inform the remaining architecture proposal; no bridge or live request has been executed.

### Launch and submission gates confirmed on 2026-10-17

The user selected "Yes, use these launch and submission gates." Show the fictional-data/transmission notice before creating a live guest session, then the selected pages and relevant application details before each submission. Keep live dispatch disabled until credentials, billing alerts, Auth/App Check, transactional allowances and the disable switch are configured. Verify pinned-model/image access and applicable account terms, disable TypeSafe automatic credit refill, and pass the later quality, latency and cost gates. Ordinary local and CI testing uses fake transport and dummy credentials. Provisioning and paid measurement remain separately scoped work.

### Final choices and completed policy confirmed on 2026-10-17

The user answered "Yes to all" to the TanStack AI bridge, bounded request/deadline plan and reservation/duplicate policy, and confirmed that the completed policy was ready to record and close. The answer below is authoritative; earlier comments preserve the conversation.

## Answer

Resolved on 2026-10-17 through live grilling with the user, using wayfinder, TypeSafe, domain-modeling and the relevant TanStack AI and Firebase guidance. The user confirmed every policy choice and the completed decision. This is a planning resolution, not evidence that infrastructure or model behavior has passed validation.

### Public access and ownership

Demo visitors may explicitly request live assistance for their own fictional uploads in the applicant and reviewer workflows agreed in [Define useful applicant and reviewer assistance](04-define-assistance-tasks-and-workflows.md#answer). Saved demonstrations and manual work remain available when live assistance is unavailable. All findings remain advisory.

Use anonymous Firebase Authentication and App Check with reCAPTCHA Enterprise. Create the guest session only after showing the fictional-data and transmission notice. Verify the ID token and App Check token before admitting work, on both the Hosting route and direct service endpoint. A guest account is an allowance key, not proof of a unique person or a financing role. Selecting a fictional applicant or reviewer cannot grant additional allowance. CORS and browser state do not authorize inference.

The demo operator owns the Google and TypeSafe accounts, pays their bills and holds a dedicated TypeSafe API key in Secret Manager. Visitors never supply provider credentials. Operator maintenance uses Google IAM; there is no public quota bypass. Enable Firebase Authentication with Identity Platform and automatic anonymous-account cleanup after checking project pricing and quotas. Accounts become eligible for deletion after 30 days, rather than being guaranteed deletion on that day. [Firebase cleanup contract](https://firebase.google.com/docs/auth/web/anonymous-auth#automatic_clean-up)

### Deployment and integration boundary

Keep classic Firebase Hosting and add a second-generation HTTPS function with the following launch configuration:

| Setting | Decision |
| --- | --- |
| Runtime and region | Node 22, `europe-west1` |
| Resources | 512 MiB memory, one CPU |
| Scaling | Zero minimum instances, one maximum instance |
| HTTP concurrency | Two |
| Function timeout | 55 seconds |
| Provider secret | Dedicated operator key bound through Secret Manager |

Use a narrow same-origin analysis endpoint before the SPA fallback, with private, non-cacheable responses. Its application-facing interface accepts an applicant document check or reviewer source-finding action, a known document slot, prepared page images and the minimum allowed context. The server owns the model, fixed question definitions, criteria and resource limits. It does not expose arbitrary prompts, provider options, remote image URLs or a general model proxy. It validates the envelope and computes fingerprints from the bytes and allowed context it actually receives.

This endpoint consumes supplied fictional evidence; it does not become the authority for browser-held financing records. Existing authorized browser file reads and private correction boundaries still determine what the interface submits. An original-file hash supplied by the browser cannot prove server-side that the prepared pixels came from that original. The result-lifecycle ticket must preserve that distinction.

### TanStack AI and native Jev responses

TanStack AI is required. Use the checked `@tanstack/ai@0.69.0` evaluation API with an application-owned adapter backed by `@typesafe-ai/sdk@0.7.0`, pinned to `jev-1.14.0`. Verify this combination before upgrading. This gives TanStack AI responsibility for typed question construction, evaluation mapping and lifecycle handling, while the SDK handles native image assets and Box transport.

Opt into experimental image/Box support using the documented `TypeSafe-Danger-Zone-Images: true` header at the server boundary. Do not expose experimental flags as visitor-controlled options.

For each invocation, create an isolated adapter and native-response capture. Call `decide()` with `choice`, `score` and `boolean` questions. The adapter adds the fixed native Box questions and makes one SDK request, then returns only TanStack-supported answers to `decide()`. The outer analysis interface combines the mapped answers with validated native Box results and response provenance. Box is not cast into a nonexistent TanStack core question type. Captures are never shared between simultaneous requests. The public [evaluation adapter interface](https://tanstack.com/ai/latest/docs/reference/interfaces/EvaluateAdapter) supports this boundary; the bridge itself still requires verification.

Keep the native response authoritative, including distributions, Noul probabilities, fractional Scores, nullable Box confidence, usage, requested/returned model and available response identifiers. TanStack's `boolean().value` uses a 0.5 split, but product display rules use the native Noul probability and the evaluated policy. Do not treat a nearest Score level as an acceptance grade. [TanStack evaluation semantics](https://tanstack.com/ai/latest/docs/evaluate/evaluate)

The released adapter-result contract requires numeric usage. If native usage is unknown and cannot be represented, fail that page or comparison as unavailable, preserve its unknown accounting state and consume the dispatched attempt. Never substitute zero, an estimate or a type cast. A null Box confidence remains null and does not by itself require failing unrelated judgments. Disable SDK/content debug logging and production devtools transport. Any lifecycle middleware must emit only sanitized operational metadata.

The built-in `@tanstack/ai-typesafe@0.1.12` adapter is not sufficient for this image-and-Box workflow. Its inspected transport lacks native SDK asset handling and Box result support. The [compatibility notes above](#tanstack-ai-compatibility-facts-checked-on-2026-10-17) preserve the checked facts. No additional chat model or model-directed execution is part of this interface.

### Browser preparation and preview geometry

The browser decodes image bytes and rasterizes PDFs with a pinned PDF.js library and matching worker/resources. Original files remain in existing browser storage. Only selected prepared PNGs and necessary context cross the server boundary. Never regenerate evidence from current form values in place of reading the supplied file.

| Resource | Launch limit |
| --- | --- |
| Original attachment | Existing PDF/PNG/JPEG envelope, 1 through 5,000,000 bytes |
| Source image before decoding | At most 20,000,000 pixels and 8,192 pixels on either side |
| PDF page count | At most 100; encrypted or unparseable PDFs have no live analysis |
| Selected pages per run | At most four |
| Each prepared PNG | Each side 280 through 1568 pixels, at most 2 MiB |
| Combined prepared images | At most 8 MiB and 8,000,000 pixels |
| Preparation concurrency | One page at a time |
| Preparation time | At most eight seconds per page and 20 seconds per run |
| API body | At most 10 MiB, including framing and context |
| Metadata and relevant context | At most 16 KiB combined |

Check every page when the document fits the analysis limits. Otherwise require an explicit selection of up to four pages that also fits the combined bounds. Do not silently truncate, crop, reduce quality or drop failed pages. A page that cannot render completely is not an inference input. If the selected set cannot be prepared, offer an explicit narrower selection or manual inspection. Exceeding a live-analysis limit does not invalidate an otherwise permitted attachment or block ordinary submission/review.

Normalize image orientation once. Render each selected PDF page completely, preserve proportions and use padding to meet minimum side dimensions for narrow pages. Treat resource-guard omissions as incomplete rendering, not a successful page. Bound decoded work as well as compressed bytes, dispose finished/cancelled rendering resources and verify the guards on representative mobile devices.

Use the exact submitted raster for the analysis preview. Retain the source page, rotation/viewport, upright dimensions, actual scale and padding in its preparation manifest. Convert normalized top-left Box coordinates through that manifest and the current displayed image-content rectangle. Resizing affects display geometry only; Arabic RTL layout never mirrors the physical image axes. A box in padding, an invalid rectangle or an uncertain/repeated target cannot create a misleading overlay. Ordinary source inspection remains available. The [preparation research](../../../docs/research/jev-document-preparation.md) explains the transforms that must be tested.

### Bounded question composition

Use at most one provider call per selected page, followed by at most one document-wide comparison call. Each request places a given image once in shared state; questions refer to its named path. Keep default model context limits and disable visitor-controlled long context. Context overflow is an unavailable analysis, not permission to expand or silently narrow the request. Image-token fit is a measurement prerequisite, not a consequence of satisfying pixel limits. [TypeSafe image/context contract](https://docs.typesafe.ai/images)

Each page call has at most 32 questions and at most nine named evidence targets. The bounded suite can include category Choice, readability Score and, for each requested target, presence Noul, multiplicity Choice and Box. Ask the independent presence and location judgments together. Multiplicity distinguishes a single usable occurrence from repeated or ambiguous occurrences; ambiguous repetition suppresses the overlay and leaves a named page-level finding for manual inspection. Use only judgments relevant to the requested task.

Targets follow the accepted document-slot tasks: applicant name; business name, address and start month; financial reporting period, monthly figures and printed averages; purchase description and budget. Nine targets accommodate the agreed three-month financial-summary workflow without adding itemized quotation analysis. A bounded target list cannot establish the absence of information outside its checked scope.

The optional document-wide call uses successfully analyzed page images and at most four separate declared-detail comparisons. It preserves conflicting evidence and incomplete coverage. Missing declarations disable only their dependent comparisons. If that call fails, retain usable page findings and identify the comparisons as unavailable. No valid negative or consistency claim can be inferred from failed or unchecked pages.

With four pages, this is at most five dispatched provider attempts per run. Process page requests sequentially. There is no hidden follow-up, repair, retry or model-directed loop.

### Allowances, reservations and duplicate submissions

Initial spending targets are US$5 per UTC calendar month for TypeSafe and US$5 per month for Google. They are operating targets, not a guaranteed maximum bill. Admission controls bound attempts through this endpoint; they do not cap all infrastructure charges or unrelated account/key use. Keep a server-side disable switch and configure billing alerts before launch.

| Admission control | Limit |
| --- | --- |
| Active analyses per guest identity | One |
| New starts per guest identity | One per minute |
| Provider attempts per guest identity | 20 per UTC day |
| Provider attempts per network address | 60 per UTC day |
| Shared provider attempts | 100 per UTC day; 1,000 per UTC calendar month |
| Concurrent locally active provider calls | Two across the service |
| Work lease | 60 seconds |

Use a server-only transactional Firestore allowance store across instances and revisions. Reserve the run's full planned attempt count atomically before dispatch. Only reservations known not to have been sent can be released. Timeouts, abandoned connections, malformed provider responses, unknown usage and other uncertain dispatched outcomes consume allowance. Missing accounting or unavailable admission state prevents live dispatch. Anonymous identities can be recreated, so network and shared controls remain necessary.

Bind a random run ID to a server-computed keyed fingerprint of actual submitted images, allowed context and question versions. Concurrent duplicates cannot dispatch twice. Reusing an ID with different inputs is rejected. A finished duplicate reports completion without replaying an archived answer. An explicit rerun uses a new ID and fresh allowance. Browser recovery and result persistence remain for the lifecycle decision.

Lease expiry cannot authorize a duplicate dispatch. Cancellation does not release capacity while local work remains active. The concurrency limit concerns local provider connections; abort does not prove remote inference stopped or was unbilled. Unknown outcomes retain their attempt charges. Derive network keys from trustworthy deployment ingress rather than accepting a client-supplied address claim.

At the documented US$0.042 per million input tokens, 1,000 attempts of 65,536 tokens would be approximately US$2.75. This is conservative estimation arithmetic, not a billing guarantee. Actual image usage, failed-attempt billing and account enforcement require checking; do not count unknown usage as zero. [Published model pricing and limits](https://docs.typesafe.ai/models)

### Deadlines and failure behavior

| Boundary | Deadline |
| --- | --- |
| Each provider attempt | Eight seconds |
| Server analysis | 45 seconds total |
| Browser analysis request | 50 seconds |
| Function | 55 seconds |

The server deadline covers its validation, encoding/upload, provider work and response handling. Start cancellation control before SDK preprocessing, propagate it through every call and refuse new stages without remaining time. Explicitly disable SDK retries with `retry: { maxRetries: 0 }`. The function and browser bounds leave room beneath Hosting's documented 60-second timeout. Browser preparation has its separate 20-second bound. These are timeout ceilings, not measured latency targets.

A visitor may explicitly retry after failure or cooldown, with a new run and fresh allowance. Busy service, exhausted quota, network/provider failure, invalid preparation, unknown usage and context overflow show an availability outcome. Successful page findings remain usable only within their visible successful scope. Distinguish unavailable analysis from unreadable evidence and from evidence not found. Provider authentication failures disable live dispatch until the operator fixes them.

Offer labelled saved demonstrations and manual inspection. A saved example cannot claim to analyze a changed upload. Inference availability never adds a submission, correction or reviewer-assessment prerequisite. Exact result freshness, cancellation visibility, cross-tab behavior and saved-example matching belong to [Define result freshness, visibility and saved demonstrations](06-define-result-lifecycle-and-provenance.md).

### Data and retention

Live submission is restricted to fictional evidence. Show the transmission notice before guest-session creation and show selected pages and relevant details before every submission. Google and TypeSafe process the transmitted data. Do not promise account-specific TypeSafe zero retention or processing confined to the selected Google region.

| Data | Handling |
| --- | --- |
| Original files and financing records | Remain in existing browser storage and visibility boundaries |
| Browser prepared images | Temporary working/preview data; dispose on cancellation, replacement or view disposal |
| Server images, declarations and native answers | Request-local memory only; no archive, object storage or retained content cache |
| Server allowance metadata | Counters, keyed request fingerprints, work leases and status/accounting metadata only |
| Network identifier in allowance store | Daily keyed value; no raw address retained there |
| Daily metadata | Retain for two UTC days, then delete |
| Monthly aggregates | Delete 35 days after the corresponding month ends |
| Sanitized application operational logs | Seven days |
| Anonymous Auth accounts | Automatic cleanup eligibility after 30 days, subject to Firebase's cleanup contract |
| Browser analysis results | Persistence and visibility to be decided by the lifecycle ticket |

Allowance records and application logs must not contain document/application IDs, filenames, names, declarations, images, answers or credentials. Quota keys and random analysis-run identifiers must not become a document index. Enforce expiration in application reads and verify physical cleanup behavior. Platform audit/access logs, authentication and provider retention follow their own configured settings and terms; the seven-day application-log policy is not a promise covering every provider record. Avoid raw request/error-body logging and content-bearing telemetry.

### Validation and remaining route

Live dispatch remains disabled until the operator configures the dedicated credentials, billing alerts, Auth/App Check, account cleanup, transactional allowances and disable switch. Check TypeSafe pinned-model/image access, credits, quotas, applicable retention/billing terms and disabled automatic refill. These account facts were not inspected in this session.

Ordinary local/CI tests use fake provider transport and dummy credentials. Verify the TanStack bridge's native/mapped results, one-call batching, invocation isolation, unknown usage and nullable confidence, cancellation, metadata-only lifecycle events, admission races, duplicate handling, leases, quota boundaries, prepared-image geometry and resource guards. Do not infer that an emulator or disabled debug logging alone prevents billed calls or external telemetry.

[Define evidence quality and workflow acceptance gates](08-define-evaluation-and-release-gates.md) must establish representative Arabic/English quality, request/context fit, preparation memory, end-to-end latency and actual cost before launch. If an account setup or paid experiment is needed to settle a planning decision, create a bounded task with its inputs, purpose and cost at that point. Routine delivery provisioning remains implementation work. The accepted request plan does not claim those measurements have passed.

The policy decision is complete. The existing lifecycle, interface-prototype and evaluation tickets cover the remaining route. No application dependencies, credentials, cloud resources or deployment were changed, and no paid inference was performed.
