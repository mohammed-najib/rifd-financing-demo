# Financing application and review platform | طلب تمويل

Recommended first choice for the Al-Amal Bank portfolio. Scope: one month for this project alone.

## Concept

Build a bilingual financing platform that connects a small-business applicant with a staff review team. Follow a request from the first saved draft through document corrections and a recorded review decision. An approved example can also display a fictional repayment schedule.

Al-Amal publishes a financing request form and financing products for small and medium enterprises. That makes this concept relevant to its public services. The proposed staff workflow and sample product terms are invented for the portfolio.

## Users and main journey

- Applicant: select a fictional product, submit a request, respond to document requests, and track progress.
- Reviewer: inspect the application, request corrections, and record a decision.

The main demo starts with an incomplete mobile application. A reviewer requests a missing document, the applicant supplies it, and the reviewer completes the decision. Both views reflect the same demo record and history.

## Expanded one-month scope

1. **Product selection.** Offer two fictional financing products with clear requirements and a comparison view. Use illustrative terms rather than reproducing unverified bank terms.
2. **Guided application.** Split personal details, business information, financing needs, and attachments into manageable steps. Include inline validation, a review step, and warnings before leaving with unsaved changes.
3. **Draft management.** Save progress locally, resume a draft after refresh, and show when the latest save succeeded or failed.
4. **Document checklist.** Preview sample attachments, validate file type and size, show upload progress through simulated requests, and explain which documents need replacement.
5. **Applicant workspace.** Show submitted requests, outstanding actions, status history, and a printable application summary.
6. **Staff queue.** Add search, status filters, sorting, pagination, saved filter preferences, and assignment to a demo reviewer.
7. **Review workspace.** Combine applicant information, a document panel, a checklist, internal notes, and a chronological activity history.
8. **Correction cycle.** Request specific changes with a reason. Highlight the applicant's revised fields when the reviewer reopens the request.
9. **Decision flow.** Record an approval or rejection with a reason and confirmation. Show a simulated stale-record conflict if another reviewer has changed the request.
10. **Post-decision overview.** For an approved sample, display an explicitly fictional repayment schedule with upcoming and completed entries. Keep payment processing simulated.
11. **Notifications.** Add an in-app notification list linking directly to requested actions and recent decisions.

## Frontend quality and technical scope

Use pnpm, React, TypeScript, and TanStack Start in SPA mode, hosted on Firebase Hosting. Use typed, mocked asynchronous APIs and fictional data. Local persistence should make the demo resumable and include a reset control.

Provide Arabic/English switching, RTL/LTR layouts, responsive applicant and staff screens, keyboard navigation, accessible validation, and consistent date and amount formatting. Build reusable fields, status indicators, dialogs, tables, and attachment components, with a small component gallery.

Include simulated sign-in, session expiry, and forbidden-access states. Clearly identify role switching and permissions as demo behavior. Test draft restoration, correction requests, invalid submissions, and allowed status transitions. Record the limitations of browser-only data and permissions.

## Four-week plan

- **Week 1:** Define the user flows and status model, sketch the main screens, establish the bilingual design system, and build the application form.
- **Week 2:** Complete drafts, document handling, applicant tracking, and typed request mocks.
- **Week 3:** Build the staff queue, review and correction cycle, decisions, notifications, and sample repayment view.
- **Week 4:** Test the complete journey, refine accessibility and mobile layouts, check performance and direct-link refreshes, deploy, and prepare the case study.

## Optional extras after the main scope works

- Compare successive versions of an application side by side.
- Add a second reviewer and a configurable approval checklist.
- Add an applicant-facing messages panel using simulated conversations.

## Demo and delivery target

A reviewer should understand the complete application-to-decision journey in three to five minutes. Deliver a hosted demo, repository, user-flow sketch, focused tests, and a short case study explaining design decisions. Real financing decisions, identity verification, and bank integrations are outside this frontend project.

## Sources

- [Al-Amal financing request](https://alamalbank.com/financing-request)
- [Al-Amal individual financing](https://alamalbank.com/loans/2)
- [Job requirements](https://yemenhr.com/jobs/front-end-developer-react-typescript-confidential-sanaa-56d029c6)
- [Research and hosting constraints](../research/bank-portfolio-context.md)
