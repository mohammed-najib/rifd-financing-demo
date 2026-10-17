# 01: Require source inspection before document assessment

**What to build:** A reviewer inspects the current supplied source and explicitly confirms that inspection before recording a document assessment. An unopenable source has an honest, explained Needs replacement route.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

Specification: [Experimental Jev evidence assistance](../../jev-evidence-assistance/spec.md). Relevant decisions: [Inspection and command compatibility](../../jev-evidence-assistance/spec.md#inspection-and-command-compatibility); [Testing Decisions](../../jev-evidence-assistance/spec.md#testing-decisions).

User stories: 31, 32, 33, 34, 35.

- [ ] Add inspection confirmation to the reviewer controls and public assessment operation. Validate it inside the authorized review transaction as well as in the UI; opening a source or receiving assistance never supplies confirmation.
- [ ] Bind confirmation to the current reviewer, dataset, application, document slot, supplied file and actual hash, relevant submitted details, submission/correction publication and assignment history.
- [ ] Invalidate confirmation after relevant source/detail changes, resubmission, reset and reassignment, including reassignment away and back. After a fresh revision read, unrelated staff notes may retain otherwise valid confirmation. Preserve existing stale-write and permission behavior.
- [ ] Permit an explicitly explained unable-to-open assessment only as Needs replacement. Reject acceptance through that exception and do not require a false inspection assertion.
- [ ] Update the runtime command contract, intent fingerprint and valid assessment callers together. Keep existing financing records and historical receipts readable, preserve exact committed-operation replay, and reject ambiguous old/new intent reuse without duplicate effects.
- [ ] Provide Arabic and English controls, keyboard access and accessible feedback in the existing source/assessment workflow. Keep confirmation distinct from the assessment and introduce no per-highlight confirmation.
- [ ] Extend tests at the public demo interface with real IndexedDB for direct bypass attempts, invalidation, the exception, stale revisions and receipt replay. Cover the user-visible confirmation flow and preserve existing financing decisions and review prerequisites.
- [ ] Complete any small supporting refactor within this slice before changing behavior. This ticket needs no provider calls, analysis store or later assistance UI.
