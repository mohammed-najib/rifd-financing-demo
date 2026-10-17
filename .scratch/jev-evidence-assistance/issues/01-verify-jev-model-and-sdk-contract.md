# Verify the Jev model and SDK contract

Type: research
Labels: wayfinder:research
Status: resolved
Assignee: the operator
Parent: [Plan thoughtful Jev evidence assistance](../map.md)
Blocked by: none

## Question

What does the current official contract for pinned `jev-1.14.0` support across image input, Box, Choice, Score and Noul, and which limitations must the demo design respect?

Verify the exact model ID and aliases; image formats, size and context limits; request headers; state, asset references and question schemas; response semantics and confidence; absent-target Box behavior; batching; usage accounting; errors, retry and cancellation behavior; and the JavaScript SDK version and declarations needed for these features. Distinguish documented API behavior from experimental support, unavailable guidance and empirical accuracy that still needs evaluation. Resolve conflicts between overview pages and dedicated feature references using official docs and published SDK source. Include relevant official document-inspection and verification patterns without adopting example thresholds as policy.

Use the research and TypeSafe skills. Read primary sources and capture findings in `docs/research/jev-1.14-contract.md` on throwaway branch `research/jev-1.14-contract`. Do not install dependencies into the application, make inference calls or choose product policy. Link the report and preserved branch on resolution.

These facts inform [Define useful applicant and reviewer assistance](04-define-assistance-tasks-and-workflows.md) and [Choose live access, deployment and spending policy](05-choose-live-service-and-spending-policy.md).

## Answer

Resolved on 2026-10-17 through primary-source research by a background agent using the research and TypeSafe skills.

[Jev 1.14 model and JavaScript SDK contract](../../../docs/research/jev-1.14-contract.md) records the supported questions, image transport and limits, SDK behavior and documentation differences. Pin `jev-1.14.0`; vision supplies image input to the question types. Images and Box require experimental opt-in. Box returns coordinates even when its target is absent, so location needs a separate presence judgment. Published SDK 0.7.0 requires Node 22+, allows null Box confidence and usage counters, retries twice after the initial attempt, and applies its default timeout per attempt. Its successful response parsing does not provide runtime validation of all typed fields.

Actual Arabic/English accuracy, calibration, image-token costs, latency, account access and failed-attempt billing remain unmeasured. These are explicit inputs to the later workflow, service and evaluation decisions, not claims established by this research. No inference calls or application dependency changes occurred.

The report is preserved in local commit `1bc2a85d1ccf6312f25670762d68fa5449d9aad7` on `research/jev-1.14-contract`, with an identical readable copy in the main workspace. The branch is not merged. Automatic approval review rejected external publication to the configured GitHub remote; a push remains pending explicit user approval. Local evidence is available for the dependent decisions.
