# Jev 1.14 model and JavaScript SDK contract

Accessed 2026-10-17 for "Verify the Jev model and SDK contract", part of "Plan thoughtful Jev evidence assistance". This report establishes documented behavior and published client behavior. It does not choose assistance tasks, thresholds, deployment or spending policy.

## Evidence and version pins

The official model catalog accepts `jev-1.14.0`, released October 14, 2026. At access time, `jev-preview` points to that version and `jev-latest` points to `jev-1.13.0`. Responses identify the answering model. `GET /v1/models` currently lists aliases; omission of a versioned ID from that list does not mean the ID is unsupported. Pin `jev-1.14.0` to avoid an alias changing the evaluated model. These are catalog facts; this research did not authenticate or test account access. [Models](https://docs.typesafe.ai/models).

The public npm registry reports `@typesafe-ai/sdk` **0.7.0** as `latest`, published `2026-10-14T21:25:39.441Z`, with Node.js `>=22`. The downloaded archive's SHA-1 matched registry metadata, `f3d06cd9913f0861b05cf45e1bd27e9d867dd3ec`. Its package manifest and shipped `dist/index.d.mts` were inspected in memory without installation or execution. [Registry metadata](https://registry.npmjs.org/@typesafe-ai%2fsdk), [Published archive](https://registry.npmjs.org/@typesafe-ai/sdk/-/sdk-0.7.0.tgz).

The official `v0.7.0` tag resolves to commit `b844cd1aca12855a5d24a2df52a1401c86e7d37a`; source links below use that immutable commit. The release adds images and Box, removes exported request payload types, and raises the Node minimum. Score's ordered-array criteria arrived in 0.6.0. Older SDK examples and cached search results do not establish the current contract. [Tag reference](https://api.github.com/repos/typesafe-ai/typesafe-sdk-js/git/ref/tags/v0.7.0), [Changelog](https://docs.typesafe.ai/sdk/javascript/changelog).

## Vision and question types

Vision is image input across the question types, not a fifth answer type. Jev 1.13 and 1.14 accept images; Box requires 1.14. Images can appear in state, instructions or criteria. Images and Box are experimental, below TypeSafe's stated production standard, and require `TypeSafe-Danger-Zone-Images: true` on each relevant request. [Images](https://docs.typesafe.ai/images).

| Question | Input definition | Answer and interpretation |
| --- | --- | --- |
| Choice | `type: "choice"`; criteria map from option names to descriptions, up to 255 options | `choice` is the highest-probability option; `probabilities` covers every option; `confidence` summarizes certainty. Supply a no-match option when candidates may not cover the input. [Choice](https://docs.typesafe.ai/primitives/choice). |
| Score | `type: "score"`; ordered criteria array, 2–10 levels | `score` is the probability-weighted mean of level indices, from 0 to `levels.length - 1`; it can be fractional. `legend`, `probabilities` and `confidence` accompany it. Describe one dimension with independently meaningful levels. [Score](https://docs.typesafe.ai/primitives/score). |
| Noul | `type: "noul"`; a yes/no instruction, optionally clarified with `true` and `false` criteria | `noul` is probability of yes, from 0 to 1. There is no separate confidence. Near 0.5 means uncertainty between yes and no, not medium intensity. Separate Nouls can represent conditions that coexist. [Noul](https://docs.typesafe.ai/primitives/noul). |
| Box | `type: "box"`; instructions identify one target and its image; no criteria | `box` contains normalized `top`, `bottom`, `left`, `right` edges. The top-left image corner is the origin. Multiply horizontal edges by width and vertical edges by height. [Box](https://docs.typesafe.ai/primitives/box). |

Question IDs identify responses but are not model instructions. Questions must carry their own meaning. Named state paths can identify the intended document, page or image. The ordinary response has `model`, `answers` keyed by question ID, and `usage`. [Question definitions](https://docs.typesafe.ai/primitives), [API response](https://docs.typesafe.ai/api#response-body).

The shipped SDK declares `Question` as the union of those four question types. `SystemOneResult<Q>` preserves question-name and Choice-option types; Score legends preserve criterion structure with images converted to reference strings. `BoxResponse.confidence` is **`number | null`**, and both usage counters are **`number | null`**. Null means unreported, not zero. These nullable declarations also appear in the downloaded npm artifact. [Published type source](https://github.com/typesafe-ai/typesafe-sdk-js/blob/b844cd1aca12855a5d24a2df52a1401c86e7d37a/src/types.ts#L80-L195).

### Box absence and ambiguity

Box always returns coordinates, even when the target is absent. Ask a presence Noul in the same request and use that answer to decide whether the box is meaningful. One question locates one target. For repeated targets, identify the intended instance or separately assess `none`, `one` and `several`; region searches may then be necessary. Low-confidence boxes can be checked on a better crop or with per-edge Nouls. No universal confidence threshold is documented. These patterns do not establish accuracy for signatures, seals or document fields. [Box guidance](https://docs.typesafe.ai/primitives/box#writing-box-questions).

Implementation implication: coordinates alone cannot mean “evidence found.” A crop or highlight also needs the originating image/page and any resize, padding or crop transformation retained by the application. That bookkeeping follows from normalized image coordinates; Box does not provide an application document ID.

### Confidence and score meaning

Choice confidence is `(pMax - 1/n) / (1 - 1/n)`. Score confidence compares expected distance from the most likely level with the corresponding spread of a uniform distribution, floored at zero. Their numbers describe the model's distribution. They do not independently certify correctness or authorize a workflow action. Box's confidence formula is not specified on the general confidence page. [Confidence formulas](https://docs.typesafe.ai/confidence#how-confidence-is-calculated).

A fractional Score is an expected position, not a measured percentage or a probability that an application is acceptable. Different distributions can have the same mean. For example, equal mass at the two ends of a three-level scale has mean 1, as does certainty at its middle level. Preserve the distribution when that distinction matters. [Reading a Score](https://docs.typesafe.ai/primitives/score#reading-a-score).

## Images, preparation and request limits

| Limit | Documented value |
| --- | --- |
| Image format | Still PNG/JPEG; animated PNG rejected |
| File size | 16 MiB per image, after base64 decoding |
| Each dimension | 280–1568 pixels, inclusive |
| Pixel count | 78,400–2,458,624 |
| Body | 32 MiB including multipart framing or base64 |
| Processed distinct images combined | 32 MiB |
| Expanded request | 32 MiB; repeated image references add repeated image content |
| Asset reference lengths | 1,024 UTF-8 bytes each; 65,536 combined |

Images outside limits are rejected, not resized. One rejected image fails the request. Processing can enlarge files. Rotate pixels upright before submission because EXIF orientation is discarded. Resize, pad or crop beforehand. No direct PDF input is documented; document pages need conversion into supported images or another supported state representation. [Image limits and preparation](https://docs.typesafe.ai/images#limits).

HTTP assets use a top-level reference map. Each image uses either a multipart `part` or `data_base64` plus lowercase `png`, `jpg` or `jpeg`. References match string values, including substrings; object keys are excluded. Unreferenced assets fail. Unique references prevent accidental matches. The SDK constructs references and multipart uploads. [Image transport](https://docs.typesafe.ai/images#sending-images-in-a-request).

SDK `image()` accepts `Blob`, `ArrayBuffer` or `ArrayBufferView`; `File` is a Blob subtype. `Image.fromBase64()` decodes file bytes. The SDK detects a multipart content type from the file signature and otherwise sends `application/octet-stream`; it does not convert unsupported formats. Blob MIME metadata does not establish format support. `withAssets` and `withAssets.join` retain image attachments inside text. A plain interpolation can leave an unattached reference and reject before transmission. Reusing one Image object avoids duplicate upload under its generated reference; assigning several explicit aliases causes one upload per alias. [Asset source](https://github.com/typesafe-ai/typesafe-sdk-js/blob/b844cd1aca12855a5d24a2df52a1401c86e7d37a/src/assets.ts).

Default context is 64k tokens per request and 32k per question. The first includes state plus all questions; the second includes state plus one question. No separate question-count limit is documented. `TypeSafe-Danger-Zone-Long-Context: true` raises both to 262k, with documented latency and accuracy tradeoffs. Organization rate limits measure requests and tokens per second. [Model limits](https://docs.typesafe.ai/models#context-length).

The general HTTP endpoint is `POST https://api.typesafe.ai/v1/systemone` with bearer authentication. JSON must be UTF-8 without a BOM, nested at most 64 levels, and contain finite numbers. Compression does not remove the body-size restriction. [HTTP request rules](https://docs.typesafe.ai/api#request-rules).

## Batching, dependencies and usage

Questions in one request evaluate independently against shared state. One answer does not become another question's context. Independent presence, category and quality judgments can therefore share a request. A later judgment that requires an earlier result to construct a crop, fetch evidence or determine candidates needs a subsequent request. Code chooses which speculative answers to consume. This is batching questions against a state, not a documented asynchronous batch-job service. [Parallel questions and dependencies](https://docs.typesafe.ai/primitives#ask-multiple-questions-together), [Speculative fan-out](https://docs.typesafe.ai/patterns/fan-out).

Images count toward input tokens and context at the same token price as text; image-token estimation guidance is still pending. Putting a commonly used image in state avoids embedding it separately in every question. [Image token accounting](https://docs.typesafe.ai/images#image-tokens).

The listed model price is $0.042 per million input tokens; output tokens are free. Each result reports usage for its request, subject to the nullable SDK counters above. The source does not accumulate a billing ledger over failed attempts. [Model pricing](https://docs.typesafe.ai/models), [Client transport](https://github.com/typesafe-ai/typesafe-sdk-js/blob/b844cd1aca12855a5d24a2df52a1401c86e7d37a/src/client.ts#L394-L471).

## SDK boundary, validation and failures

`TypeSafeClient` defaults to `jev-latest`, reads `TYPESAFE_API_KEY` if no key is passed, and refuses browser use unless explicitly overridden. `defaultHeaders` or per-call `headers` carry the image opt-in. The package exposes ESM, CommonJS and TypeScript declarations. Its configurable `fetch` allows transport tests without model calls. Debug logging includes bodies; credential-header redaction does not redact document content. [Client configuration](https://docs.typesafe.ai/sdk/javascript/api/interfaces/TypeSafeClientConfig), [Package exports](https://github.com/typesafe-ai/typesafe-sdk-js/blob/b844cd1aca12855a5d24a2df52a1401c86e7d37a/package.json).

Construction can throw for missing credentials or invalid configuration. `systemOne()` catches its request-validation failures and returns a rejected promise. Builders can still throw synchronously, such as a Score receiving a map instead of an array. SDK validation checks nonempty questions, nonempty Choice criteria, at least two Score levels, and a Noul instruction or described outcome. It does not enforce all server upper limits. [Client method](https://docs.typesafe.ai/sdk/javascript/api/classes/TypeSafeClient#systemone), [Question builders and validation](https://github.com/typesafe-ai/typesafe-sdk-js/blob/b844cd1aca12855a5d24a2df52a1401c86e7d37a/src/questions.ts).

The transport parses JSON and casts the result to its generic TypeScript type. It does not runtime-validate every successful answer, probability or coordinate. A non-JSON successful body can become text despite the declared result type. Implementation implication: application-boundary validation remains meaningful, particularly for saved demonstrations and malformed proxy responses. [Response parsing](https://github.com/typesafe-ai/typesafe-sdk-js/blob/b844cd1aca12855a5d24a2df52a1401c86e7d37a/src/client.ts#L367-L392), [Body parser](https://github.com/typesafe-ai/typesafe-sdk-js/blob/b844cd1aca12855a5d24a2df52a1401c86e7d37a/src/client.ts#L542-L560).

HTTP errors include 400 for invalid requests or context overflow, 401 for authentication, 413 for size limits, 415 for unsupported compression, 422 for schema validation, 429 for rate limits and 529 for overload. Image-specific errors also use 400 and 413. Inspect the error body rather than treating every 400 as one condition. [API errors](https://docs.typesafe.ai/api#errors), [Image errors](https://docs.typesafe.ai/images#errors).

SDK `APIError` retains status, headers, parsed body and the optional `x-typesafe-request-id`. Its subclasses cover common statuses, while 413 and 415 remain generic APIError instances. `withResponse()` exposes successful response metadata; `asResponse()` still rejects unsuccessful HTTP responses. [Error source](https://github.com/typesafe-ai/typesafe-sdk-js/blob/b844cd1aca12855a5d24a2df52a1401c86e7d37a/src/errors.ts), [APIPromise](https://docs.typesafe.ai/sdk/javascript/api/classes/APIPromise).

### Retries and cancellation

Defaults are two retries after the initial attempt, with retries for 408, 429, 500–599, connection failures and timeouts. Backoff starts at 500 ms, doubles to 5,000 ms maximum, and subtracts up to 25% jitter. `retry-after-ms` takes precedence over `Retry-After`; accepted server delays are at most 60,000 ms, after which the client uses backoff. Setting `maxRetries: 0` disables retries. [Retry implementation](https://github.com/typesafe-ai/typesafe-sdk-js/blob/b844cd1aca12855a5d24a2df52a1401c86e7d37a/src/retry.ts).

The default timeout is 10,000 ms **per attempt**, including response-body delivery. There is no total retry deadline. Asset preparation and compression precede the per-attempt timer. An `AbortSignal` cancels caller waiting, active fetch/body delivery and retry waits; caller cancellation becomes `APIUserAbortError` and is not retried. The source also checks cancellation while awaiting asset encoding and compression. [Request options](https://docs.typesafe.ai/sdk/javascript/api/interfaces/RequestOptions), [Client timeout configuration](https://docs.typesafe.ai/sdk/javascript/api/interfaces/TypeSafeClientConfig#timeout), [Transport cancellation](https://github.com/typesafe-ai/typesafe-sdk-js/blob/b844cd1aca12855a5d24a2df52a1401c86e7d37a/src/client.ts#L394-L540).

No inspected source promises that cancelling the local request stops completed server work, refunds tokens, or deduplicates a retried evaluation. A timeout after submission leaves that outcome unknown. Total deadline, attempt budget, stale-result handling and spending policy remain application decisions.

## Relevant official evidence-review patterns

- The value-extraction cookbook finds candidate spans with code, uses Choice to select a candidate or `none`, then copies and normalizes the original value. It cannot select a value the candidate finder omitted. This is a useful distinction between selecting evidence and generating an amount or identifier. [Pre-parsed value extraction](https://docs.typesafe.ai/cookbooks/pre_parsed_value_extraction_cookbook).
- The citation cookbook first checks literal quote presence with code, then asks Choice whether the surrounding source supports the claim. Presence and semantic support are separate checks. [Citation verification](https://docs.typesafe.ai/cookbooks/citation_check).
- The extraction cascade checks individual extracted fields with Nouls about specific failures, then escalates when its rule fires. The published example uses `jev-1.12`; its thresholds and results do not establish 1.14 behavior for this project. [Extraction cascade](https://docs.typesafe.ai/cookbooks/sde_cascade).

These are decomposition examples. They do not select the demo's assistance tasks or justify changing an application status from model confidence.

## Resolved documentation differences and remaining evidence

| Difference or uncertainty | Research conclusion |
| --- | --- |
| Models overview says “Text”; the general question/API overview omits Box/assets | Dedicated Images and Box pages plus the published 0.7.0 source explicitly support them. Treat the overview as incomplete, while retaining the experimental qualification. |
| Box page shows numeric confidence; SDK permits null | Handle unreported confidence as a distinct condition. The published declaration is broader than the example. |
| API usage shows integers; SDK permits null | Token usage can be unavailable. Do not substitute zero when accounting. |
| General API marks instructions required; SDK permits null or omitted instructions | SDK acceptance is not proof of server acceptance. Use explicit meaningful instructions; omitted-instruction server behavior was not exercised. |
| Score legend overview says string values; SDK supports structured descriptions | Preserve the actual criterion structure and asset reference strings. Do not assume all legends are strings. |
| Some generated reference pages rendered only navigation; cached npm/search pages showed 0.6.0 | Official tagged source and the directly read registry/archive establish the inspected 0.7.0 declarations. |

Sources for these comparisons are the [models overview](https://docs.typesafe.ai/models), [HTTP API](https://docs.typesafe.ai/api), [dedicated image contract](https://docs.typesafe.ai/images), [dedicated Box contract](https://docs.typesafe.ai/primitives/box), [shipped type source](https://github.com/typesafe-ai/typesafe-sdk-js/blob/b844cd1aca12855a5d24a2df52a1401c86e7d37a/src/types.ts) and [registry metadata](https://registry.npmjs.org/@typesafe-ai%2fsdk).

Accuracy, localization quality, calibration, actual latency, per-page token costs, account limits and live availability remain unmeasured. The model documentation identifies English as its strongest language; it supplies no Arabic document benchmark here. Representative Arabic and English evidence, absent and repeated targets, unreadable crops and conflicting fields still need an evaluation tied to the selected tasks. [Language support](https://docs.typesafe.ai/models#language-support).

No credentials, inference requests, SDK installation, implementation, cloud resources or product decisions were part of this research. Public documentation and source inspection establish the contract above; they cannot establish usefulness on the demo's evidence corpus.
