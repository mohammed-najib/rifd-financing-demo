# Fixed Jev workflow connection

Ticket [12](../../.scratch/jev-evidence-assistance-implementation/issues/12-connect-the-bounded-workflow-to-tanstack-ai-and-jev.md)
connects the admitted server request to the fixed page, comparison and bound
verification stages. Production dispatch remains disabled by
`liveDispatchEnabled = false` in `functions/index.ts`, independently of admission
control. Hosted controls and bounded acceptance remain separate work.

## Provider boundary

The application pins `@tanstack/ai` 0.69.0, `@typesafe-ai/sdk` 0.7.0 and
`jev-1.14.0`. The adapter uses TanStack's Choice, Score and boolean builders and
`decide` lifecycle. The same native SDK request carries the fixed Box questions.
Box answers stay outside the TanStack answer map. The older built-in TypeSafe
adapter is not installed.

The server binds the dedicated `LIVE_TYPESAFE_API_KEY` Secret Manager secret.
The SDK uses its fixed official endpoint, image opt-in, default context limit,
eight-second attempt timeout and zero retries. Logging is off and compression
is disabled. The production function build replaces TanStack's devtools transport
with inert exports. Browser code imports neither provider SDK.

Each invocation owns its question maps, native response and mapped capture.
Validation checks native types, complete probability distributions, Score mean
and legend, nullable Box confidence and required integer usage. Invalid individual
answers remain visible in native provenance while valid independent judgments
continue. TanStack maps only valid supported answers. Its boolean split and
nearest Score level never supply display policy.

Native captures retain actual usage, response ID when supplied, requested and
returned model, dispatch/answer timestamps, mapped judgments, invalid answer names
and actual shared state. Images appear once in that state and fixed instructions
reference their named paths. Existing question definitions and raster/crop
manifests recover the complete model input. Comparison uses all admitted usable
pages, including its first page.

## Scope, cancellation and restoration

The browser includes its bounded raster manifests beside the prepared PNGs.
The server verifies PNG bytes, dimensions, raster hash, page and padding before
admission. Source hashes and transforms remain browser-supplied provenance;
they do not authorize financing access or prove original-source authenticity.
Financial expected months must match the code-derived initial-submission period.

The fixed workflow uses the existing admission and deadline controller for every
SDK call. True one-page evidence uses at most two attempts. Four-page evidence
uses at most nine, with no retry, split, repair call or fallback. Context overflow
stops the run with an explicit unavailable reason. Unknown usage consumes its
marked attempt, stops later work and leaves its connection outcome conservative.
Admission retains unresolved attempt identifiers beyond connection expiry and
sets a durable accounting barrier when required usage is missing or a dispatched
attempt ends with an unknown transport outcome. New guests,
revisions and pre-dispatch rechecks remain blocked until the operator reconciles
usage through IAM. Connection cleanup cannot clear this barrier or restore an
allowance. The operator must retain the existing counters during reconciliation.
The endpoint returns earlier accounted stages with the stop reason, allowing
browser composition to retain their original scope. Explicit server dispatch
metadata distinguishes a failed dispatched page from an undispatched tail.
Only preparation failures and attempted failed pages enter failed coverage;
unattempted pages remain unchecked. Retained partial runs explicitly record
unresolved accounting when a dispatched stage has no reported usage.

Server crop decoding, copying and compression run in a terminable worker with an
eight-second deadline under the server deadline. The browser and server crop
workers share a PNG encoder using pinned `fflate` 0.8.3. This makes the exact
lossless crop PNG reproducible across the two runtimes. The browser records the
server's actual verification bindings and rechecks them against its own source,
context and fixed definitions. Reopening reconstructs both raster and crop hashes
before drawing a highlight. Provider responses never write financing data.

## Verification and limits

Provider tests use dummy credentials and fake HTTP responses through the real
SDK. Browser integration crosses preparation, the browser client, admission,
the fixed workflow, SDK multipart transport, result composition, record validation
and exact highlight restoration. The four-page financial fixture exercises nine
dispatches and eight eligible highlights; unknown verification usage stops at
six dispatches and retains the financial findings. Separate checks cover partial
malformed answers, native versus mapped uncertainty, invocation isolation,
preprocessing cancellation, retry prevention and context overflow.

These are local software checks. They make zero external inference calls and
establish no new model-quality, native four-page context-fit, cost or latency
measurement. The existing experimental display qualification still applies.

The current [TypeSafe SDK guidance](https://docs.typesafe.ai/sdk/javascript),
[Box contract](https://docs.typesafe.ai/primitives/box),
[HTTP API](https://docs.typesafe.ai/api) and
[citation-checking cookbook](https://docs.typesafe.ai/cookbooks/citation_check)
were read alongside the exact installed package sources. The permitted package
skill catalog contains the two financing helper skills; neither matches this
integration. The existing `intent.skills` and `intent.exclude` policy is unchanged.

Final checks on 2026-10-18:

- All 136 ordinary unit tests and all 276 browser API tests pass. The separate
  Firestore emulator transaction, access and cleanup check also passes.
- Typecheck, lint, client production build and function/worker builds pass.
  The existing large-client-chunk build notice remains.
- All 11 package-skill tests, both packaged-skill validations and their source
  reviews pass. No dependency guidance policy changed.
- Built browser output contains neither provider SDK nor dedicated server
  secret references. Client/function output contains no dummy credentials, and
  the deployed function contains no devtools event transport.

The first broad browser run was discarded because source edits caused Vite to
reload active test pages. The final complete run used stable sources and passed
without retries. Local server checks and prerendering needed loopback access.
The emulator used the installed Rider Java runtime and the workspace's Node
runtime because the Firebase CLI bundles an older Node version.

## Standards

No remaining standards findings. The validated manifest participates in the
request fingerprint, with a same-PNG/changed-manifest regression. Shared Choice
and Score validators now govern both bridge and display interpretation.

## Spec

No remaining concrete specification findings or scope creep. The final review
confirmed actual dispatch/failure scope, unresolved accounting in provenance,
durable stops after unknown outcomes, manifest fingerprints and disabled
production dispatch.

Remaining findings: Standards zero; Spec zero. Both reviews compared the staged
implementation with starting commit `f9ac1dde442717f8f50f5c7162e004259915b474`.
