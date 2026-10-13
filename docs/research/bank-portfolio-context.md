# Bank portfolio context

Accessed 2026-10-13. Sources below are the bank's own pages and official framework or hosting documentation. This note supports choosing one frontend project to complete in about one month, following the user's revised timeframe. It does not describe the bank's private systems. The five expanded alternatives are recorded separately in [project-options](../project-options/), each scoped to a month on its own.

## Verified bank context

- **Financing applications.** Al-Amal publishes a financing request form with customer contact details, address, requested amount and business description. Its individual financing product targets owners of small and medium enterprises and uses Islamic Murabaha financing in Yemeni rials. Its separate electronic financing product targets shopkeepers, enterprise owners and PYes agents, including customers offering bill-payment services. [Public request form](https://alamalbank.com/financing-request), [individual financing product](https://alamalbank.com/loans/2), [electronic financing product](https://alamalbank.com/en/loans/10).
- **PYes / بيس.** The bank describes a mobile wallet supporting purchases, bill payments and money transfers, accessible through its app or SMS. Listed functions include account statements, balance inquiries, financing repayments and outstanding instalments. This is a strong basis for a mobile payment or merchant demo. [Official PYes description](https://alamalbank.com/service/19).
- **Social transfers.** The bank distributes donor cash assistance through branches and agents, mobile payout teams, and deposits into bank or PYes accounts. It explicitly describes reaching remote areas and people who need home visits. These are grounds for a payout-operations concept; they do not establish what internal software the bank uses. [Social transfer service](https://alamalbank.com/services/3).

## Portfolio implications and recommendation

These are design judgments, not claims about the bank's current processes or hiring preferences.

A financing application with a staff review workspace remains the recommended choice. It has a directly observable public starting point and can demonstrate complex forms, Arabic RTL, responsive layout, validation, saved drafts, a review table and clear status transitions in a short walkthrough. The expanded [one-month financing option](../project-options/01-financing-application-and-review.md) includes product selection, document corrections, review decisions, notifications, and a fictional repayment view. Staff roles, document requests, review statuses and decision rules must be presented as invented demo behavior.

The other directions remain credible alternatives:

- A wallet or merchant collection demo has the closest connection to PYes. Focus on one payment journey, receipts and useful failure states rather than rebuilding a complete banking app.
- A social-assistance payout dashboard connects to the bank's documented social transfers. Batch review and payout exception workflows would be invented demo behavior.
- A reconciliation tool can demonstrate table filtering, matching and discrepancy handling. Account statements and payments are documented services, but the bank's reconciliation process is not established by these sources.
- A service-case workspace can demonstrate search, timelines and forms. Its queue, priorities and service-level rules would be generic design choices, with weaker bank-specific evidence than the first three ideas.

Use fictional records and a clearly identified portfolio demo. An offline draft may be saved locally, but a payment or payout must not appear completed merely because an offline action was queued. That distinction is a recommended interaction design choice, not a statement about PYes implementation.

## TanStack Start and classic Firebase Hosting

TanStack Start documents a SPA mode enabled with `tanstackStart({ spa: { enabled: true } })`. A build prerenders the root shell to `/_shell.html` by default, while matched routes render in the browser. The shell still involves build-time rendering, so browser-only storage access needs an appropriate client boundary. [SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode).

Firebase Hosting serves static assets and supports catch-all rewrites for client-side routes. For Start's default shell, the fallback destination would be `/_shell.html`, not an assumed `/index.html`. Existing files take precedence over rewrites. Point Hosting's `public` setting at the actual generated static asset directory after inspecting the chosen starter's build. [Hosting configuration](https://firebase.google.com/docs/hosting/full-config), [Start hosting guide](https://tanstack.com/start/latest/docs/framework/react/guide/hosting).

Classic Hosting alone does not execute the Start server bundle. Runtime server functions, server routes and request-time SSR require a server deployment, such as Cloud Run or Cloud Functions behind Hosting rewrites. SPA mode can coexist with those services; it does not turn runtime server code into static files. Cloud Run additionally requires billing setup. [Firebase Hosting overview](https://firebase.google.com/docs/hosting), [Hosting with Cloud Run](https://firebase.google.com/docs/hosting/cloud-run), [SPA mode and server routes](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode#allowing-server-functions-and-server-routes).

For a one-month frontend project, use pnpm, Start SPA mode, deterministic fictional data and simulated asynchronous requests with success, loading and error cases. Add browser persistence only where it makes the demo useful. This keeps the proposed scope compatible with classic Firebase Hosting without requiring a backend deployment. The user reports that Firebase CLI is already installed; no installation, account changes or deployment were performed for this research.
