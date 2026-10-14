# RIFD implementation tickets

These 24 implementation tickets cover the [RIFD specification](../financing-application-and-review/spec.md). The user accepted the proposed granularity on 2026-10-14. Publication retains the presented dependencies. Each ticket has its own acceptance criteria and starts at `ready-for-agent`.

Implementation ticket numbers are local to this directory. The original [planning map](../financing-application-and-review/map.md) and its resolved decision tickets retain their existing numbers. The specification remains the parent and authority for required behavior and scope.

Start with [01: Open the bilingual demo and inspect seeded applications](issues/01-open-bilingual-seeded-demo.md). A later ticket can start when every ticket named in its Blocked by field is complete. The table lists direct blockers; their prerequisites also apply. Tickets 03, 04, 05 and 17 can branch after 02. The staff queue, 08, can start after 01.

Every feature ticket includes the relevant domain rules, typed operations, persistence, accessible Arabic/English UI and focused verification. Tests use the public demo interface and real browser storage, with pure-domain tests for rule boundaries. Extend receipts, failure controls, permission checks, dataset/session guards and retained-work recovery as each operation is added. Maintain setup and architecture documentation alongside the slices. Final acceptance tickets close coverage and record the completed product's evidence.

| Ticket | Blocked by | Specification user stories |
| --- | --- | --- |
| [01: Open the bilingual demo and inspect seeded applications](issues/01-open-bilingual-seeded-demo.md) | None | 24, 38, 69, 70, 72, 79 |
| [02: Save and restore a draft with a real attachment](issues/02-save-and-restore-draft-with-attachment.md) | [01](issues/01-open-bilingual-seeded-demo.md) | 8, 9, 10, 16, 17, 18, 19, 20, 21, 22, 23, 64, 74 |
| [03: Compare products and complete five-step drafts](issues/03-compare-products-and-complete-drafts.md) | [02](issues/02-save-and-restore-draft-with-attachment.md) | 1, 2, 3, 4, 5, 6, 7, 11, 12, 13 |
| [04: Recover sessions and resolve unfinished work before leaving](issues/04-recover-sessions-and-unfinished-work.md) | [02](issues/02-save-and-restore-draft-with-attachment.md) | 65, 66, 67, 68, 69 |
| [05: Synchronize tabs and recover conflicting saved progress](issues/05-synchronize-tabs-and-recover-conflicts.md) | [02](issues/02-save-and-restore-draft-with-attachment.md) | 62, 63, 64 |
| [06: Submit applications and track their public history](issues/06-submit-and-track-applications.md) | [03](issues/03-compare-products-and-complete-drafts.md), [04](issues/04-recover-sessions-and-unfinished-work.md), [05](issues/05-synchronize-tabs-and-recover-conflicts.md) | 14, 15, 24, 25, 26, 27 |
| [07: Read notifications and print applicant-visible summaries](issues/07-notifications-and-print-summaries.md) | [06](issues/06-submit-and-track-applications.md) | 28, 29, 30 |
| [08: Search and organize the staff queue](issues/08-search-and-organize-staff-queue.md) | [01](issues/01-open-bilingual-seeded-demo.md) | 31, 32, 33, 34, 35 |
| [09: Assign applications and start review](issues/09-assign-applications-and-start-review.md) | [02](issues/02-save-and-restore-draft-with-attachment.md), [08](issues/08-search-and-organize-staff-queue.md) | 36, 37, 38 |
| [10: Assess evidence, record review checks and save internal notes](issues/10-assess-evidence-checks-and-notes.md) | [04](issues/04-recover-sessions-and-unfinished-work.md), [09](issues/09-assign-applications-and-start-review.md) | 39, 40, 41, 42 |
| [11: Request targeted corrections](issues/11-request-targeted-corrections.md) | [06](issues/06-submit-and-track-applications.md), [10](issues/10-assess-evidence-checks-and-notes.md) | 43, 53 |
| [12: Save a private correction response](issues/12-save-private-correction-response.md) | [11](issues/11-request-targeted-corrections.md) | 25, 44, 45 |
| [13: Resubmit, verify and repeat correction rounds](issues/13-resubmit-and-verify-corrections.md) | [12](issues/12-save-private-correction-response.md) | 46, 47, 48, 49, 50, 51, 52 |
| [14: Confirm final decisions and freeze approved terms](issues/14-confirm-decisions-and-freeze-terms.md) | [13](issues/13-resubmit-and-verify-corrections.md) | 54, 55, 56, 57, 64 |
| [15: Show the frozen repayment overview](issues/15-show-frozen-repayment-overview.md) | [14](issues/14-confirm-decisions-and-freeze-terms.md) | 58, 59 |
| [16: Demonstrate stale staff writes and explicit recovery](issues/16-recover-stale-staff-writes.md) | [14](issues/14-confirm-decisions-and-freeze-terms.md) | 60, 61 |
| [17: Recover startup failures and keep loaded work usable offline](issues/17-recover-startup-and-use-offline.md) | [02](issues/02-save-and-restore-draft-with-attachment.md) | 75, 76 |
| [18: Reset the browser-wide demo atomically](issues/18-reset-demo-atomically.md) | [04](issues/04-recover-sessions-and-unfinished-work.md), [05](issues/05-synchronize-tabs-and-recover-conflicts.md), [17](issues/17-recover-startup-and-use-offline.md) | 77, 78 |
| [19: Expose the production component gallery](issues/19-production-component-gallery.md) | [07](issues/07-notifications-and-print-summaries.md), [15](issues/15-show-frozen-repayment-overview.md), [16](issues/16-recover-stale-staff-writes.md), [18](issues/18-reset-demo-atomically.md) | 73 |
| [20: Complete browser and reliability acceptance evidence](issues/20-browser-and-reliability-acceptance.md) | [19](issues/19-production-component-gallery.md) | 64, 74, 82 |
| [21: Verify bilingual layouts, keyboard flows, previews and print](issues/21-bilingual-accessibility-preview-and-print-acceptance.md) | [19](issues/19-production-component-gallery.md) | 70, 71, 72, 82 |
| [22: Pass performance and static-route delivery gates](issues/22-performance-and-static-route-gates.md) | [19](issues/19-production-component-gallery.md) | 81, 82 |
| [23: Release the verified demo to Firebase Hosting](issues/23-release-to-firebase-hosting.md) | [20](issues/20-browser-and-reliability-acceptance.md), [21](issues/21-bilingual-accessibility-preview-and-print-acceptance.md), [22](issues/22-performance-and-static-route-gates.md) | 81, 82 |
| [24: Publish the repository, case study and timed demo](issues/24-repository-case-study-and-timed-demo.md) | [23](issues/23-release-to-firebase-hosting.md) | 80, 82 |

All 82 user stories have at least one owning ticket. Shared stories appear where implementation and verification address different parts of the same requirement. The final browser, manual and performance evidence must satisfy the complete [accepted requirement-to-evidence matrix](../financing-application-and-review/issues/07-acceptance-and-implementation-handoff.md#requirement-to-evidence-matrix), including requirements beyond the story summaries. If verification or preview findings change the application, rerun affected gates against the release commit before completing delivery.
