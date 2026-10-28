# OpenRouter capability research for RIFD

Researched 2026-10-29 against public documentation and unauthenticated catalog GET requests. Baseline repository commit: `407adf3`. This is evidence for the Wayfinder plan, not a final model or architecture decision. The user prefers a balance of quality and low running cost, recorded media first, and fictional data.

## Findings

OpenRouter documents interfaces for every requested capability. They do not share one request/response contract. Text and media understanding use chat-style requests; images, speech, video jobs, embeddings, reranking and typed decisions have their own interfaces. The initial provider choice is therefore feasible on documentary evidence. Account access, actual quality, response parity and end-to-end latency remain untested.

| Capability | Documented interface | Planning consequence |
| --- | --- | --- |
| Text and image understanding | `POST /api/v1/chat/completions`; compatible models accept `image_url` parts. | Select a model and endpoint that support the required inputs and tool/structured-output parameters. [Image input guide](https://openrouter.ai/docs/guides/overview/multimodal/image-understanding). |
| Video understanding | Chat requests with `video_url` parts, including base64 data URLs. URL support differs by provider. | Google AI Studio accepts YouTube links; Vertex requires encoded data for this path. Duration and size limits are model-specific. A video-generation model does not imply video understanding. [Video input guide](https://openrouter.ai/docs/guides/overview/multimodal/videos). |
| Image generation/editing | `POST /api/v1/images`; discover models and per-endpoint capabilities through `/images/models`. | Validate resolution, aspect ratio, reference count and streaming against the selected endpoint. Aggregate model capabilities are a union, not a guarantee for every provider. [Image generation guide](https://openrouter.ai/docs/guides/overview/multimodal/image-generation). |
| Recorded speech transcription | `POST /api/v1/audio/transcriptions`; JSON audio input or supported multipart uploads. | Returns transcript JSON; verbose output can carry timing/speaker data. Multipart has a 25 MB cap; JSON/URL exceptions depend on provider. The guide warns of a 60-second upstream processing timeout. [STT guide](https://openrouter.ai/docs/guides/overview/multimodal/stt). |
| Spoken output | `POST /api/v1/audio/speech`, returning audio bytes. | MP3 and PCM are documented. Voice IDs, text limits and controls vary by model. [TTS guide](https://openrouter.ai/docs/guides/overview/multimodal/tts). |
| Audio understanding and conversational audio output | Chat requests use base64 `input_audio`; audio output requires SSE streaming. | This is not evidence of a bidirectional live voice session with interruption and turn-taking. Recorded input followed by text/TTS is a separate, simpler workflow. [Audio guide](https://openrouter.ai/docs/guides/overview/multimodal/audio). |
| Video generation | `POST /api/v1/videos`, poll `GET /videos/{jobId}`, then download content. Webhooks are documented. | Treat generation as a job with terminal states, not a short chat response. Validate duration, resolution, audio and references using `/videos/models`. [Video generation guide](https://openrouter.ai/docs/guides/overview/multimodal/video-generation). |
| Embeddings | `POST /api/v1/embeddings`; `/embeddings/models` discovers models. | Text and image embedding inputs are documented. Preserve model identity, dimensions and preprocessing with the index. [Embedding guide](https://openrouter.ai/docs/api_reference/embeddings). |
| Reranking | `POST /api/v1/rerank`, taking query, documents and optional `top_n`. | Returns source indexes and relevance scores. Usage exposes search units and tokens. Structured image/text documents require a compatible model. [Rerank reference](https://openrouter.ai/docs/api/api-reference/rerank/submit-a-rerank-request). |
| Jev decisions | `/api/alpha/decisions`, or TypeSafe-compatible `/api/v1/systemone`. | OpenRouter can serve Jev, but RIFD's current direct integration should remain until parity is checked. [Jev guide](https://openrouter.ai/docs/guides/community/jev). |

## Small candidate roster

These are candidates for comparison, not claims of superiority. Prices are public catalog values observed on the research date, in USD, before unrelated services or purchase fees. Endpoint choice, context tiers and media settings can change cost. The actual billed cost must be measured later.

### Text, structured output and understanding

The following entries all advertise tools and structured outputs in the [public model catalog](https://openrouter.ai/api/v1/models). Prices below are per million input/output tokens at the base context tier.

| Candidate | Reason to include | Price | Context and relevant inputs |
| --- | --- | --- | --- |
| `anthropic/claude-haiku-5.5` | Economical text/image baseline | $0.10 / $0.50 | 1M; text, image, file. Higher prices beyond 100K prompt tokens. |
| `openai/gpt-6-luna` | Independent economical baseline | $0.10 / $0.50 | 1.05M; text, image, file. Higher prices beyond 272K. |
| `google/gemini-3.8-flash` | One candidate for text, documents, recorded audio and video understanding | $0.825 / $4.125 | 1,048,576; text, image, file, audio, video. |
| `openai/gpt-6.1-terra` | More expensive comparison/escalation candidate | $1 / $5 | 1.05M; text, image, file. Higher prices beyond 272K. |

The roster deliberately avoids assuming that a cheaper or newer model is better. Arabic explanations, numerical fidelity and source-supported answers must be compared on RIFD examples.

### Speech

- `openai/whisper-large-v3-turbo` is a low-cost transcription candidate. The observed DeepInfra endpoint lists $0.00000333 per audio second, about $0.00020/minute; the Groq endpoint lists about $0.000667/minute. Do not assume automatic routing gives the same bill. [Endpoint metadata](https://openrouter.ai/api/v1/models/openai/whisper-large-v3-turbo/endpoints).
- `elevenlabs/scribe-v2` is a comparison candidate for timestamps and speaker handling. The catalog lists $0.0000611111 per audio second, about $0.003667/minute. These are duration rates, not text-token prices. [Transcription catalog](https://openrouter.ai/api/v1/models?output_modalities=transcription), [STT pricing rules](https://openrouter.ai/docs/guides/overview/multimodal/stt).
- Compare `elevenlabs/eleven-flash-v2.5` and `elevenlabs/eleven-v4-turbo` for spoken explanations. Both list $0.00004 per input character, or $0.04/1,000 characters. Flash v2.5 documents a 40,000-character limit. Arabic and English are listed for Flash v2.5; the current v4 family has broader language coverage, which still needs testing with the chosen voice. [Speech catalog](https://openrouter.ai/api/v1/models?output_modalities=speech), [ElevenLabs models](https://elevenlabs.io/docs/overview/models), [language list](https://elevenlabs.io/docs/help-center/other/what-languages-do-you-support).

Speech model names containing "realtime" or "conversational" do not establish OpenRouter session-level live voice support. No such contract was verified in the reviewed OpenRouter guides. The accepted recorded-media scope avoids depending on it.

### Generated images and videos

| Candidate | Verified cost unit | Relevant limits |
| --- | --- | --- |
| `qwen/qwen-image-2.1-turbo` | Alibaba endpoint: $0.0184/output image at 1K or 2K; input-image line is zero | Up to six outputs and four references; no SSE streaming. [Endpoint](https://openrouter.ai/api/v1/images/models/qwen/qwen-image-2.1-turbo/endpoints). |
| `google/gemini-nano-banana-2.1` | Google AI Studio endpoint: $0.00003/output image token, not per image | 1K/2K/4K, one output, up to fourteen references. Actual image-token count determines cost. [Endpoint](https://openrouter.ai/api/v1/images/models/google/gemini-nano-banana-2.1/endpoints). |
| `x-ai/grok-imagine-video-1.5-lite` | 2/3/14 cents per output second at 480p/720p/1080p; one cent per input image | 1 to 15 seconds; first-frame reference. Five seconds at 720p is $0.15 before references. [Video catalog](https://openrouter.ai/api/v1/videos/models). |
| `google/veo-3.1-lite` | At 720p: $0.03/second without audio, $0.05 with audio; higher-resolution SKUs differ | 4/6/8 seconds; 720p/1080p; first/last-frame references. [Video catalog](https://openrouter.ai/api/v1/videos/models). |

Evaluate generated Arabic text, diagram correctness and factual consistency separately from visual appeal. Render exact labels through application code if generation cannot preserve them. This is an evaluation proposal, not a measured finding.

### Retrieval and Jev

- `qwen/qwen3-embedding-8b` lists $0.01/million input tokens and 40,960 context in OpenRouter; `voyageai/voyage-4-lite` lists $0.02/million and 32,000. Both merit a text-retrieval comparison. Qwen's own model card describes multilingual, instruction-aware retrieval; model-specific input conventions still matter. [Embedding catalog](https://openrouter.ai/api/v1/embeddings/models), [Qwen model card](https://huggingface.co/Qwen/Qwen3-Embedding-8B).
- `google/gemini-embedding-2` is a multimodal investigation candidate, with text input listed at $0.20/million tokens and 8,192 context. The catalog advertises audio/video/file inputs, but its description and the reviewed OpenRouter embedding guide specifically describe text/images. Do not promise native audio/video retrieval through this interface without a contract check. [Catalog](https://openrouter.ai/api/v1/embeddings/models), [guide](https://openrouter.ai/docs/api_reference/embeddings).
- Compare `qwen/qwen3-reranker-8b` and `cohere/rerank-4-fast` with a Jev-based scorer. The public catalog and endpoint records return zero prompt/completion token prices for these rerankers. That does not establish free reranking: the API exposes search-unit accounting, and a usable per-search-unit OpenRouter price was not established. Resolve pricing before paid comparison. [Rerank catalog](https://openrouter.ai/api/v1/models?output_modalities=rerank), [API usage](https://openrouter.ai/docs/api/api-reference/rerank/submit-a-rerank-request).
- `typesafe/jev-1.14` lists $0.042/million input tokens and zero output charge. OpenRouter advertises text/image decisions with 262,144 context. The existing direct model is `jev-1.14.0`; TypeSafe documents lower default request/question limits and opt-in long context. Preserve the exact current behavior until tested. [Decisions catalog](https://openrouter.ai/api/v1/models?output_modalities=decisions), [TypeSafe limits](https://docs.typesafe.ai/models).

## Keep Jev, verify transport separately

OpenRouter's System One compatibility endpoint supports the TypeSafe SDK request shape, but its model-list response is incompatible with the SDK's model-list parser. Response model identifiers use OpenRouter names. The Decisions interface also has model-specific image formats, and Box support is Jev-specific. A shared gateway therefore does not erase model differences. [TypeSafe SDK compatibility](https://openrouter.ai/docs/guides/community/typesafe-sdk), [multimodal decisions](https://openrouter.ai/docs/guides/community/multimodal-decisions).

Retaining direct TypeSafe access is a practical comparison baseline for the working RIFD integration. Jev remains a candidate for evidence checks, routing and support checks around generated answers. TypeSafe's citation cookbook combines deterministic quote lookup with a narrow Jev judgment; its small published example is not proof of RIFD accuracy. [Citation cookbook](https://docs.typesafe.ai/cookbooks/citation_check).

## Fallbacks and remaining evidence

OpenRouter provider routing can restrict providers, require supported parameters, enforce data-policy preferences and cap price. Unsupported LLM parameters can otherwise be ignored. A fallback must preserve required input types, structured-output/tool support, selected data policy and price constraints. Model fallback and provider fallback are different choices. [Provider routing](https://openrouter.ai/docs/guides/routing/provider-selection).

The user subsequently capped the entire full test run at 15 minutes wall clock and rejected extensive verification matrices. The roster is a menu for choosing a small comparison, not a requirement to test every candidate. Plan a few representative cases and state what remains unmeasured.

No account settings, credits, private files or credentials were inspected. No paid inference, latency tests or model benchmarks were run. Public listings prove discoverability, not this account's access. For a focused later check, use a small set of Arabic/English cases covering supported claims, number/name fidelity, citation correctness, transcription of amounts, speech intelligibility, useful media output and total cost per completed workflow. Compare a cheap default with escalation, including the added Jev calls and retries. These are proposed evaluation criteria; the human decision tickets own thresholds and final choices.
