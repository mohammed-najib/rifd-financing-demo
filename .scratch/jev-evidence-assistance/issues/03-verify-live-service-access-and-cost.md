# Verify live service access and cost controls

Type: research
Labels: wayfinder:research
Status: resolved
Assignee: the operator
Parent: [Plan thoughtful Jev evidence assistance](../map.md)
Blocked by: none

## Question

Which server deployment and access-control options can support on-demand Jev analysis beside the current static Firebase-hosted demo, and what documented cost, credential and data-handling constraints must the human choose between?

Use official sources to compare a small Firebase HTTPS function and a Cloud Run service with the existing Hosting setup, including Node compatibility, hosting rewrites, timeouts, request limits, secret storage, local development and billing requirements. Explain which controls actually limit inference use for a public portfolio site; browser-simulated identities and CORS do not establish server authorization. Verify TypeSafe's currently published prices, usage accounting, rate limits and data-handling statements where available. Separate alerts from hard spend controls and document provider-account facts that cannot be known without authenticated access. Identify design choices for operator-only live access, bounded visitor access and labelled saved demonstrations without selecting one for the user.

Use the research skill and relevant provider guidance. Capture sourced findings in `docs/research/jev-live-service-options.md` on throwaway branch `research/jev-live-service-options`. Do not query private account settings, reveal credentials, provision infrastructure, incur inference charges or deploy anything.

These facts inform [Choose live access, deployment and spending policy](05-choose-live-service-and-spending-policy.md).

## Answer

Resolved on 2026-10-17 through primary-source research by a background agent using the research and TypeSafe skills and relevant provider guidance.

[Jev live service, access and cost options](../../../docs/research/jev-live-service-options.md) compares a second-generation Firebase HTTPS function and a Cloud Run service beside the existing static site. Both require billing and must fit Hosting's 60-second outer timeout. Node 22 is compatible with the inspected SDK. Real service admission must be separate from browser-simulated roles. The report compares operator-only and bounded visitor access without selecting a policy.

The published model rate is $0.042 per million input tokens, with free output and images charged at the input rate. Actual per-page usage and failed-attempt billing remain unknown; nullable usage cannot be counted as zero. Google budget alerts do not stop spending, while current Preview spend caps have delayed enforcement and possible billable overages. Neither controls external TypeSafe charges. Attempt allowances, retry budgets and account settings need an explicit policy.

Public TypeSafe statements cover no training on submitted input, purpose-based retention and an enterprise ZDR offering. A fixed account-specific retention period, ZDR entitlement, rate limits, credit settings and live access were not verified. The research made no private-account queries, inference calls or infrastructure changes.

The report is preserved in local commit `b644bf549dcd1d79aaad7cea6eea82951afb6d52` on `research/jev-live-service-options`, with an identical readable copy in the main workspace. The branch is not merged. Automatic approval review rejected external publication to the configured GitHub remote; a push remains pending explicit user approval. Local evidence is available for the dependent decisions.
