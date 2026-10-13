# Merchant payments and collections workspace | تحصيل

Scope: one month for this project alone.

## Concept

Build a merchant workspace for requesting payments, following transaction states, issuing receipts, handling refund requests, and closing a day's collections. Pair a desktop owner dashboard with a mobile cashier view and a small simulated customer payment page.

The bank's PYes service supports payments, purchases, transfers, and statements. This project draws on that public context; the merchant tools and workflows below are proposed portfolio features.

## Users and main journey

- Cashier: create a payment request, monitor its status, and issue a receipt.
- Merchant owner: review collections, investigate exceptions, and inspect daily settlement summaries.
- Simulated customer: open a demo payment link and complete a fictional payment.

The standout demo shows an interrupted confirmation. The interface keeps the payment pending, checks its status, and displays a receipt after confirmation without creating a duplicate payment.

## Expanded one-month scope

1. **Collections overview.** Show today's confirmed collections, pending requests, refunds, and a trend chart. Every total should derive from the displayed records.
2. **Payment requests.** Enter an amount and description, generate a local demo payment link and QR code, and support request expiry or cancellation.
3. **Customer payment view.** Provide a responsive confirmation flow with success, cancellation, pending, and failure scenarios using fictional funds.
4. **Transaction history.** Add search, date and status filters, sorting, pagination, and CSV export. Preserve useful filter state in the URL.
5. **Transaction detail.** Display a reference, amount, customer alias, status history, and related events. Keep mixed Arabic text and reference numbers readable.
6. **Receipts.** Create a printable bilingual receipt and allow users to copy the transaction reference.
7. **Refund request flow.** Request a full refund on an eligible fictional transaction, capture a reason, and show its simulated review and completion states.
8. **Cashier and owner views.** Give the cashier a focused collection screen and the owner a broader overview. Include a clearly labeled demo role switcher.
9. **Day closing.** Group confirmed payments and refunds into a daily statement. Show transactions that remain pending and carry them forward without counting them as confirmed income.
10. **Settlement summaries.** Distinguish collected funds from simulated settled funds and explain differences through linked transactions.
11. **Exception handling.** Demonstrate expired requests, delayed confirmation, retryable failures, and repeated button clicks with deterministic scenarios.
12. **Merchant preferences.** Add a fictional shop profile, language preference, receipt details, and local persistence.

## Frontend quality and technical scope

Use pnpm, React, TypeScript, and TanStack Start in SPA mode, deployed to Firebase Hosting. Keep payments and API responses simulated, with typed data, controllable latency, local persistence, and a reset option.

Provide Arabic/English and RTL/LTR support, mobile cashier layouts, keyboard navigation, accessible charts with table alternatives, and shared amount, date, table, and status components. Represent amounts consistently and test calculations without relying on floating-point arithmetic for money.

Include simulated sign-in, session expiry, and access-denied screens. Mocked roles demonstrate the intended UX; they do not enforce backend authorization. Test transaction transitions, repeated submissions, refund eligibility, and statement totals.

## Four-week plan

- **Week 1:** Map the payment states, design owner and cashier flows, establish the bilingual component system, and build the overview and transaction list.
- **Week 2:** Build payment requests, the customer demo page, status updates, transaction details, and receipts.
- **Week 3:** Add refunds, day closing, settlement summaries, preferences, and exception scenarios.
- **Week 4:** Test calculations and workflows, refine accessibility and responsiveness, check performance, deploy, and record the walkthrough.

## Optional extras after the main scope works

- Support partial refunds with a clear remaining refundable amount.
- Add comparisons across two fictional shop locations.
- Cache previously loaded statements for read-only offline access, showing their last update time.

## Demo and delivery target

Demonstrate request creation, delayed confirmation, receipt generation, and the resulting daily statement in three to five minutes. Deliver the hosted demo, repository, payment-state diagram, focused tests, and design case study. Real transfers, payment-provider integrations, and accounting-system integrations are outside scope.

## Sources

- [Al-Amal PYes service](https://alamalbank.com/service/19)
- [Job requirements](https://yemenhr.com/jobs/front-end-developer-react-typescript-confidential-sanaa-56d029c6)
- [Research and hosting constraints](../research/bank-portfolio-context.md)
