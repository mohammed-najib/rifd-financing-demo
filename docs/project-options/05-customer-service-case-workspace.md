# Customer service case platform | متابعة الطلبات

Scope: one month for this project alone.

## Concept

Build a connected customer portal and staff workspace for payment questions, financing inquiries, and service complaints. Let a customer open a case, help an employee investigate the related records, and give a supervisor a useful view of unresolved work.

This is a proposed portfolio design for a bank. Its queues, response targets, permissions, and escalation rules are fictional; public research does not establish the bank's support process.

## Users and main journey

- Customer: submit a question or complaint, provide requested information, and follow the response.
- Support employee: investigate, add internal notes, reply, and resolve or escalate a case.
- Supervisor: manage assignments, inspect overdue cases, and review workload.

The main demo starts with a complaint about a pending payment. An employee finds the related transaction, asks for more information, and resolves the case after a simulated transaction update. The customer sees the public conversation and status changes.

## Expanded one-month scope

1. **Customer intake.** Choose a case category, enter details, link a fictional transaction, attach a sample document, and receive a case reference.
2. **Customer tracking.** Show open and past cases, status history, public replies, and outstanding requests for information.
3. **Staff inbox.** Add search, filters for status and priority, assignment, sorting, pagination, and saved queue views.
4. **Customer context.** Present a fictional profile with related transactions, financing requests, and previous cases. Link records directly to their detail panels.
5. **Case timeline.** Combine replies, internal notes, assignment changes, attachments, and status updates in chronological order with clear visibility labels.
6. **Investigation tools.** Search transaction references, inspect their status history, and associate or remove a linked record with a recorded reason.
7. **Response composer.** Offer editable Arabic and English response templates, attachment previews, draft saving, and a review step before a simulated send.
8. **Assignment and escalation.** Reassign a case, raise its priority, escalate to a supervisor, and record the reason for each action.
9. **Response targets.** Display elapsed time and approaching or missed targets using explicit fictional rules. Explain when a case is waiting for the customer.
10. **Resolution and reopening.** Record a resolution category and summary, then allow the demo customer to reopen a case with additional information.
11. **Supervisor overview.** Show queue size, overdue cases, workload per employee, and resolution trends. Link each metric to the records behind it.
12. **Activity notifications.** Notify each demo role about assignments, replies, and reopened cases with direct links to the next action.

## Frontend quality and technical scope

Use pnpm, React, TypeScript, and TanStack Start in SPA mode on Firebase Hosting. Use synthetic customers, typed mocked APIs, local persistence, and resettable demo scenarios. All message delivery stays inside the simulation.

Support Arabic/English, RTL/LTR, mobile customer screens, keyboard access, accessible dialogs, and reusable table, timeline, message, and status components. Render user-entered messages as plain text and demonstrate safe handling of markup-like input.

Include simulated sign-in, session expiry, forbidden views, slow searches, failed saves, and conflicting updates. The distinction between public replies and internal notes is a UX demonstration; browser-only storage cannot enforce confidentiality. Test visibility selectors, status changes, reopening, draft recovery, and response-target calculations.

## Four-week plan

- **Week 1:** Map case states and role views, sketch customer and staff journeys, establish the bilingual design system, and build intake and the inbox.
- **Week 2:** Build case details, timelines, linked records, response drafts, and customer tracking.
- **Week 3:** Add assignment, escalation, response targets, reopening, notifications, and the supervisor overview.
- **Week 4:** Test complete journeys and visibility behavior, refine accessibility and responsiveness, check performance, deploy, and prepare the case study.

## Optional extras after the main scope works

- Add a searchable bilingual knowledge base with articles linked to case categories.
- Add a simulated customer satisfaction prompt after resolution.
- Add bulk assignment with per-case validation and a preview of affected records.

## Demo and delivery target

Walk through customer intake, investigation, a public reply, resolution, and reopening in five minutes. Deliver the hosted demo, repository, case-state diagram, focused tests, reusable component examples, and a short design case study. Live email or SMS, real customer records, and bank system integrations are outside scope.

## Sources

- [Job requirements](https://yemenhr.com/jobs/front-end-developer-react-typescript-confidential-sanaa-56d029c6)
- [Research and hosting constraints](../research/bank-portfolio-context.md)
