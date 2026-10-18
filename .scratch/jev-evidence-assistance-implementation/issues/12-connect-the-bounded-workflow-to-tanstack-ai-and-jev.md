# 12: Connect the bounded workflow to TanStack AI and Jev

**What to build:** The application's fixed analysis workflow can obtain Jev judgments through the admitted server request and return correctly scoped findings, highlights and provenance to the visitor.

**Blocked by:** [09: Check multipage financial evidence](09-check-multipage-financial-evidence.md); [10: Show automatically verified evidence highlights](10-show-automatically-verified-evidence-highlights.md); [11: Enforce live-access and spending limits](11-enforce-live-access-and-spending-limits.md).

**Status:** implemented

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Server, accounts, spending and privacy](../../jev-evidence-assistance/spec.md#server-accounts-spending-and-privacy); [Preparation, geometry and request bounds](../../jev-evidence-assistance/spec.md#preparation-geometry-and-request-bounds); [Testing Decisions](../../jev-evidence-assistance/spec.md#testing-decisions).

User stories: 21, 22, 23, 24, 25, 39, 41, 42, 58, 60, 61.

- [x] Implement the selected application-owned adapter over @typesafe-ai/sdk 0.7.0 through @tanstack/ai 0.69.0, pinned to jev-1.14.0. Read current TypeSafe/package guidance and verify the exact combination before changing versions; use the operator's server-side dedicated secret.
- [x] Use TanStack's decide interface for Choice, Score and boolean questions while adding fixed native Box questions to the same SDK request. Keep Box captures outside the TanStack-supported answer map; do not invent a core Box type or substitute the older built-in TypeSafe adapter.
- [x] Set the server-owned TypeSafe-Danger-Zone-Images header to true and SDK maximum retries to zero. Disable content/debug logging and production devtools transport. Include each image once in shared state and reference its named path; use the default model context limit.
- [x] Preserve authoritative native answers, fractional Scores, complete distributions/Noul probabilities, nullable Box confidence, requested/returned model, available response IDs, timestamps and actual usage. TanStack's boolean split or rounded Score cannot drive display policy. Keep captures invocation-local under concurrency.
- [x] Validate malformed/nullable answers at the bridge and retain independently valid findings according to the display contract. Missing/invalid required usage makes the affected stage unavailable, consumes dispatched allowance and stops further work until accounting is resolved; never manufacture zero usage.
- [x] Wire all stages through the existing admission, cancellation and deadline controller. Verify true one-page runs use at most two attempts and four-page runs at most nine, including bound verification. Context overflow is unavailable work with explicit scope, never an automatic split or hidden fallback.
- [x] Keep every model-visible input in the browser applicability/provenance record, use fixed localized finding composition and preserve scoped partial successes. Returning a result never writes an assessment, correction, form field or financing decision.
- [x] Verify browser-to-endpoint-to-SDK-to-result paths with dummy credentials and fake provider HTTP transport, including native Box handling, preprocessing cancellation, invocation isolation, usage failure and full four-page composition. Ordinary development and CI make zero external inference calls.
- [x] Keep live dispatch disabled until the hosted controls and bounded acceptance work are complete. This integration supplies capability; it establishes no new model-quality, native four-page, cost or latency measurement.


## Implementation

The admitted fixed workflow now uses the application-owned TanStack AI 0.69.0
adapter over TypeSafe SDK 0.7.0, pinned to Jev 1.14.0. Native Box answers remain
outside TanStack's answer map. Valid independent judgments, exact crop bindings,
actual usage, response IDs and native/mapped provenance reach the browser.

Unknown usage or transport outcomes create a durable accounting barrier. Partial
results retain actual successful, dispatched, failed and unchecked scope, with
unresolved accounting recorded explicitly. Browser and server crop workers share
a deterministic PNG encoder so restored highlights reproduce the exact crop hash.
The server's dedicated provider secret stays out of browser output.

See [implementation and verification details](../../../docs/implementation/jev-workflow.md).

## Verification

- All 136 ordinary unit tests and all 276 browser API tests pass.
- The separate Firestore emulator check, typecheck, lint, client production build,
  function/worker builds and package-skill checks pass.
- Fake provider HTTP transport exercises the real SDK, native Box capture,
  uncertainty mapping, malformed answers, usage failures, invocation isolation,
  preprocessing cancellation, exact restoration and four-page/nine-attempt work.
- Standards and specification reviews have no remaining findings.

Production dispatch remains disabled pending hosted controls and bounded
acceptance. No external inference, deployment or new model-quality, native
four-page context-fit, cost or latency measurement occurred.
