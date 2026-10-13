# Aid disbursement operations console | توزيع المساعدات

Scope: one month for this project alone.

## Concept

Build an operations console for preparing assistance programs, validating recipient lists, reviewing payout batches, and investigating delivery exceptions. Include a compact mobile view for field staff checking assigned records.

Al-Amal publicly describes delivering social transfers through branches, agents, mobile teams, and electronic accounts. The screens, approval process, and operating rules below are invented for the portfolio.

## Users and main journey

- Operations employee: prepare a recipient list, correct errors, and submit a batch for review.
- Supervisor: inspect batch totals, return it for correction, or authorize a simulated processing run.
- Field employee: inspect assigned fictional recipients and record simulated delivery updates.

The main demo imports a flawed CSV, fixes duplicate and invalid records, obtains a supervisor decision, and follows the batch through partial completion and an exception retry.

## Expanded one-month scope

1. **Program workspace.** Create a fictional assistance program with a name, planned amount, dates, and distribution channels. Show preparation and delivery progress.
2. **CSV import wizard.** Provide a sample file, preview records, map columns, and report missing fields, invalid amounts, and duplicate identifiers.
3. **Recipient review.** Search and filter fictional recipients, inspect details, correct invalid records, and retain a clear explanation of validation failures.
4. **Batch preparation.** Select validated recipients, assign a payout channel, and calculate recipient counts and total amounts before submission.
5. **Supervisor review.** Compare totals and validation results, add a decision reason, and return a batch for correction or proceed with a simulated release.
6. **Processing monitor.** Show pending, processing, completed, and failed records with progress derived from the underlying data.
7. **Exception queue.** Group failures by reason, open the affected record, and retry eligible cases without paying completed records again in the simulation.
8. **Recipient history.** Link each fictional recipient to their program, batch, status changes, and delivery events.
9. **Field view.** Let staff find assigned records on mobile and record a simulated outcome. If connectivity is unavailable, mark the update as waiting to sync rather than completed.
10. **Operational reports.** Filter completion results by program, channel, and date. Export a batch summary and a separate exceptions list.
11. **Activity history.** Record who performed each simulated action, when it happened, and its reason. Preserve earlier batch decisions when corrections occur.

## Frontend quality and technical scope

Use pnpm, React, TypeScript, and TanStack Start in SPA mode on Firebase Hosting. Use fictional recipient data, mocked asynchronous APIs, local persistence, and deterministic scenarios that can be reset.

Support Arabic/English, RTL/LTR, keyboard-driven table use, accessible progress feedback, and mobile field screens. Reuse import, table, validation, confirmation, and status components. Include loading, empty, failure, session-expiry, and forbidden-action states.

All identity, role, and payout behavior is simulated. A browser-only demo cannot protect real recipient records or authorize transfers. Test import validation, batch totals, duplicate handling, transitions, and retry behavior with sample fixtures.

## Four-week plan

- **Week 1:** Define programs, batches, and payout states; sketch operations and field flows; build the bilingual shell and import wizard.
- **Week 2:** Complete recipient validation, batch preparation, totals, and supervisor review.
- **Week 3:** Build the processing monitor, exceptions queue, mobile field view, and reports.
- **Week 4:** Test import and retry edge cases, refine accessibility and larger tables, deploy, and prepare a walkthrough with a deliberately flawed sample CSV.

## Optional extras after the main scope works

- Add a map of fictional distribution locations with an accessible list alternative.
- Save CSV column mappings for later imports.
- Add a second-level supervisor review for batches above an explicitly fictional threshold.

## Demo and delivery target

Show import, correction, review, processing, and exception recovery in five minutes. Deliver a hosted console, repository, sample CSV files, workflow diagram, focused tests, and a design case study. Real beneficiary information, identity checks, donor integrations, and actual disbursement are outside scope.

## Sources

- [Al-Amal social transfers](https://alamalbank.com/services/3)
- [Job requirements](https://yemenhr.com/jobs/front-end-developer-react-typescript-confidential-sanaa-56d029c6)
- [Research and hosting constraints](../research/bank-portfolio-context.md)
