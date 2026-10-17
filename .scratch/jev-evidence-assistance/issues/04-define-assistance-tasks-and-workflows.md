# Define useful applicant and reviewer assistance

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Assignee: the operator
Parent: [Plan thoughtful Jev evidence assistance](../map.md)
Blocked by: 01, 02

## Question

For each existing document slot, what specific help should an applicant receive before submission and during corrections, and what evidence suggestions should a reviewer receive during assessment?

Choose concrete user tasks, triggers, inputs, visible outputs and human actions. Justify the role of image input, Choice, Score, Noul and Box within the connected workflows, including cases where an individual document needs only some of them. Specify meaningful criteria and no-match, absent-evidence and ambiguous outcomes without choosing arbitrary confidence thresholds. Keep document usability, document category, evidence support and formal reviewer assessments distinct. Decide what happens when a suggestion is wrong, when an applicant disagrees, and when no useful result is available. Preserve the accepted advisory boundary and exact calculations in code.

Resolve with the user using grilling and domain-modeling. The result should give later architecture and prototype work concrete scenarios and a capability-to-user-benefit mapping.

Read [Verify the Jev model and SDK contract](01-verify-jev-model-and-sdk-contract.md) and [Verify document preparation and highlight coordinates](02-verify-document-image-preparation.md) first.

## Comments

### Round 1 confirmed on 2026-10-17

The user answered "Yes to all" to the following proposed tasks, triggers and disagreement behavior. This ticket remains claimed while the judgment criteria and connected workflows are discussed.

| Document slot | Applicant task | Reviewer task |
| --- | --- | --- |
| Applicant identity evidence | Spot unreadable names or a possible mismatch with the applicant's name. | Locate the name and compare it with the application. |
| Business evidence | Check readability and possible differences in business name, address and operating-since month. | Find the source regions supporting those details. |
| Revenue and expense summary | Flag unreadable figures, an unexpected reporting period or possible disagreement with declared averages. | Locate the period and relevant figures for verification. |
| Stock purchase plan or supplier quotation | Check whether the purchase description and total budget are readable and appear consistent with the application. | Locate the description and budget supporting the intended purchase. |

These tasks use the information in the current fictional evidence. Identity authentication and itemized quotation analysis are outside this task set. Exact calculations and existing financing rules stay in code.

Assistance is requested explicitly, one document at a time. Applicants use "Check document" while preparing a draft or an allowed correction. During corrections, assistance addresses the reviewer's stated reason and respects the current field and document targets. A document-only replacement does not unlock declared fields. Reviewers use "Find supporting evidence" against the submitted document and application details.

An applicant can inspect, replace or retain a document and continue without explaining disagreement with a suggestion, subject to ordinary submission requirements. A reviewer can dismiss an incorrect suggestion and assess the source manually. Ambiguous findings show "could not determine"; failed analysis shows "analysis unavailable". Model findings do not issue corrections, record assessments or make financing decisions.

### Round 2 confirmed on 2026-10-17

The user answered "Yes to all" to the following capability roles and result criteria.

Choice identifies the apparent document category using identity evidence, business evidence, financial summary, stock purchase plan, equipment quotation, other, mixed content and cannot determine. A category suggestion helps identify a possible wrong-slot document; it never moves a file automatically.

Score measures readability alone for each analyzed page, using these independently described ordered levels:

1. Relevant text cannot be read reliably.
2. Some relevant text is readable, but details are obscured.
3. Relevant text and digits are clearly readable.

Missing information is reported separately. Readability does not imply agreement with application details or suitability for acceptance. Users see descriptive findings with uncertainty retained. The Score is not a document acceptance grade.

Choice also compares each relevant declared detail with the checked evidence. Its outcomes are:

| Outcome | Meaning |
| --- | --- |
| Appears consistent | Visible evidence appears to support the declared detail. |
| Appears different | Visible evidence appears to state a different detail. |
| Not found | The checked pages do not address that detail. |
| Conflicting entries | The checked evidence contains incompatible statements. |
| Cannot determine | The evidence is unreadable, ambiguous or insufficient. |

For figures and dates, Jev directs attention to printed evidence. People verify values; code owns normalization, reporting periods, averages and financing calculations. Assistance does not transcribe values automatically or fill form fields.

Image input supplies the rendered page. A Noul asks whether a specific named target is present in that image, independently of the Box locating it. A useful highlight requires an adequately established target and location; Box coordinates alone never establish presence. Each highlight has a companion finding naming the document, page and target. Uncertain presence or location leaves ordinary page inspection available without an overlay. Repeated or conflicting values remain explicit.

No numerical confidence thresholds were chosen. Task-specific evaluation must establish usable display rules before implementation treats these findings as reliable. None of the capability roles changes the advisory boundary.

### Round 3 and completed decision confirmed on 2026-10-17

The user answered "Yes to all" to the final workflow choices and explicitly confirmed recording and closing this decision. Checks cover every page within the configured analysis limit; exceeding it requires explicit page selection. Coverage is shown before and after analysis, and conflicting pages remain explicit. Incomplete application details disable only their dependent comparisons. Capability use follows the requested task. Code supplies the financial period from the initial submission month, provisionally for drafts. Reviewers continue writing their own assessment and correction reasons using the existing controls.

## Answer

Resolved on 2026-10-17 through three live grilling rounds with the user, using wayfinder, TypeSafe and domain-modeling. The user accepted every proposed choice and confirmed the completed workflow decision. This answer is the authoritative workflow contract for the dependent tickets.

### User tasks and inputs

Assistance is requested explicitly for one document slot at a time. Applicants choose "Check document" in a draft or while preparing an allowed correction. Reviewers choose "Find supporting evidence" against the submitted document and application details. The same task meanings apply in Arabic and English.

Use the supplied file's actual page images, the relevant declared details and the slot's requirement. Correction assistance also uses the actual reviewer-written reason and permitted targets. Page images come from the supplied bytes, rather than regenerated evidence assembled from the application's current values. The source file, page and coverage must remain identifiable in every finding.

| Document slot | Relevant application context | Applicant benefit | Reviewer benefit |
| --- | --- | --- | --- |
| Applicant identity evidence | Applicant name | Spot an unreadable name or possible disagreement before handing over evidence. | Locate the name region and compare it with the applicant's declaration. |
| Business evidence | Business name, address and operating-since month | Identify unreadable details or possible disagreement with the business information. | Find the regions supporting those details. Operating-history calculations remain in code. |
| Revenue and expense summary | Declared average revenue and operating expenses; expected three completed months before initial submission | Spot unreadable figures, an unexpected period or possible disagreement with the declared averages. | Locate the reporting period, monthly figures and printed averages for verification. |
| Stock purchase plan for Inventory; supplier quotation for Equipment | Selected product, purchase explanation and total purchase budget | Check whether the description and budget are readable and appear consistent with the application. | Locate the description and budget supporting the intended purchase. Product-purpose and budget-coverage assessments remain human review checks. |

Current fictional samples determine the scope of these tasks. Identity authentication, identity-number or expiry checks and itemized quotation analysis are outside the selected task set. The existing samples and rules are described in [evidence generation](../../../src/demo/evidence.ts), [document requirements](../../../src/ui/application-copy.ts) and [review checks](../../../packages/rifd-domain/src/review.ts).

### Capability roles and result criteria

Document category, document usability, evidence support and the reviewer's document assessment are separate concepts. Their domain definitions are in the [glossary](../../../GLOSSARY.md).

| Capability | Judgment or input | User benefit and boundary |
| --- | --- | --- |
| Image input | Rendered images of the supplied document pages, including scans and image-only PDFs. | Lets assistance inspect the visual evidence the user supplied and connects findings to the source. |
| Choice for category | Identity evidence, business evidence, financial summary, stock purchase plan, equipment quotation, other, mixed content or cannot determine. | Flags a possible wrong-slot document. It never relocates a file or establishes suitability. |
| Score | Readability of relevant visible text on each analyzed page, against the ordered levels below. | Helps applicants spot evidence that is hard to inspect and helps reviewers recognize reading limitations. It never grades eligibility or document acceptance. |
| Choice for evidence support | One comparison per relevant declared detail, using the outcomes below. | Directs attention to possible agreement, disagreement or a gap in the evidence without turning the suggestion into a review outcome. |
| Noul | Whether a specific named target is present in the identified image. | Prevents coordinates alone from being treated as evidence that a target was found. Target presence is separate from agreement with the declared value. |
| Box | The location of one named target in one identified page image. | Helps the user reach the source detail quickly. Each usable location has a companion finding with document, page and target. |

Category describes apparent content. "Other" means the content appears to be outside the known categories; "mixed content" means it combines kinds; "cannot determine" preserves insufficient or ambiguous evidence. Category findings use only the analyzed pages. A clearly unrelated document prompts inspection or replacement without irrelevant field comparisons.

Readability uses these ordered descriptions:

1. Relevant text cannot be read reliably.
2. Some relevant text is readable, but details are obscured.
3. Relevant text and digits are clearly readable.

Missing information is reported separately. A readable page can contain different information from the application. A fractional Score and its distribution retain their API meaning; users receive descriptive findings with uncertainty, rather than an acceptance grade. A blank or unrelated page does not establish a readable match for an absent detail.

| Evidence-support outcome | Criterion |
| --- | --- |
| Appears consistent | Visible evidence appears to support the particular declared detail. |
| Appears different | Visible evidence appears to state a different detail. |
| Not found | The checked pages do not address that detail. Display the scope as "Not found in the checked pages." |
| Conflicting entries | The checked evidence contains incompatible statements about that detail. |
| Cannot determine | The evidence is unreadable, ambiguous or insufficient for the comparison. |

For example, the presence question identifies an applicant-name region, while the support question compares its content with the declared applicant name. A different printed name must not be reduced to an absence finding merely because the declared name is absent.

Unreadable, skipped or failed pages cannot establish absence. If one checked page supports a detail and another contradicts it, retain the conflict. Repeated occurrences stay explicit; incompatible values must not be hidden by selecting only the matching occurrence. Each location needs a sufficiently identified target and usable geometry. If presence or location is uncertain, suppress the overlay and leave ordinary page inspection available.

The pinned model's [documented contract](../../../docs/research/jev-1.14-contract.md) establishes that Box returns coordinates even for an absent target. Its separate presence check is therefore required. No numerical confidence thresholds were chosen here. [Define evidence quality and workflow acceptance gates](08-define-evaluation-and-release-gates.md) must evaluate the descriptive criteria, uncertainty and highlight-display rules on representative evidence. The role mapping establishes intended usefulness, not measured model accuracy.

### Connected workflows

1. The user selects a document action. Show which pages will be checked. Include every page that fits the configured analysis limit; exceeding the limit requires explicit page selection rather than silent truncation. After running, identify the pages actually analyzed and distinguish failed, skipped or unreadable pages.
2. Run the judgments useful for that action and available context. An incomplete or invalid declared value disables only its dependent comparison, with a message such as "Enter revenue to compare." Category, readability and useful source-location assistance remain available where applicable. A missing document remains subject to ordinary document requirements.
3. Return named findings assembled from fixed, localized wording, relevant application context, the page scope and any usable source locations. Every field comparison remains separate. A check need not exercise all capabilities: readability can use image input and Score; locating a figure can use image input, Noul and Box; a field comparison adds Choice where appropriate.
4. The applicant inspects the finding and chooses whether to edit an allowed field, replace the document or retain it. In a correction workspace, the reviewer-written reason and existing targets govern available changes. A document-only replacement cannot unlock an undeclared field change. The workspace remains private until ordinary resubmission.
5. The reviewer inspects the source, then records an assessment or writes a correction reason through the existing controls. Reviewers author their own reasons. Suggestions neither prefill a decision nor generate assessment or correction prose. Existing role, assignment, application-status and correction-verification rules continue to govern these actions.

Code supplies the expected financial period from the application's initial submission month. A draft uses its provisional submission month; corrections and historical records retain the actual initial submission month. Jev points to printed figures and dates and suggests their relationship to declarations. People verify values. Code owns normalization, reporting periods, averages, whole-rial arithmetic and financing rules. Assistance performs no automatic transcription or form filling.

An applicant may disagree without supplying an explanation and continue when ordinary submission requirements pass. Ignoring advice does not satisfy an outstanding correction target: a required replacement still needs an eligible changed file, and a required field change still follows existing normalization rules. Reviewers may dismiss incorrect advice and assess manually. Findings never change document review status, record a review check, issue a correction or make a financing decision.

Ambiguous findings show "could not determine." Failed inference or an unrenderable file shows "analysis unavailable," with retry or replacement options. These outcomes leave manual work available. AI unavailability does not add a submission or assessment prerequisite.

### Workflow examples

- A draft identity image names someone else. Assistance points to a possible name disagreement. The applicant inspects it, then edits the draft name, replaces the image or retains it; the model makes no identity or acceptance decision.
- A financial-document correction permits only replacement of the summary. Its figures are obscured. Assistance identifies reading limitations and cannot determine the comparison. The revenue field stays locked. A usable replacement can be prepared privately; ordinary resubmission requirements still apply.
- A historical application has April-to-June evidence because of its initial submission month. The expected period remains that original three-month window when the document is inspected later.
- A purchase PDF has incompatible totals on two pages. A matching value on one page does not hide the other. If only one page was checked, its finding names that limited coverage. The reviewer examines the source before writing an assessment or correction reason.
- An applicant has uploaded a summary before entering revenue. Category and readability remain useful; the revenue comparison asks for the missing declaration. A source-finding action uses only the capabilities it needs.
- A target is absent, repeated ambiguously or too uncertain to locate. Ordinary source inspection remains available without a misleading highlight. A model or rendering failure provides no finding about the document's substantive suitability.

### Remaining decisions and handoff

The workflow decision is complete. Its existing dependent tickets retain the following work:

- [Choose live access, deployment and spending policy](05-choose-live-service-and-spending-policy.md): Deployment and access, credential ownership, browser/server preparation ownership, numerical page and resource limits, spending, request admission, timeout and retry policy.
- [Define result freshness, visibility and saved demonstrations](06-define-result-lifecycle-and-provenance.md): Exact source/context applicability, provisional-period rollover, partial-coverage records, stale and late results, visibility, persistence and saved-example matching.
- [Validate the applicant and reviewer assistance experience](07-prototype-evidence-assistance-experience.md): Concrete bilingual layouts, wording, accessible source inspection and review of the accepted workflow examples.
- [Define evidence quality and workflow acceptance gates](08-define-evaluation-and-release-gates.md): Measured quality, calibrated display rules, false-positive treatment, latency/cost evidence and any bounded experiment needed before specification handoff.

No implementation, inference call, deployment or numerical threshold selection was part of this resolution.
