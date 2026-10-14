# Define fictional products and application requirements

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Parent: [Plan the financing application and review platform](../map.md)
Blocked by: 01

## Question

What two fictional financing products and application requirements make the product comparison, guided application, document checklist, review checklist, and approved repayment example coherent?

Use the submission and correction rules agreed in [Define application states and correction rules](01-application-states-and-corrections.md).

Choose each product's intended applicant, illustrative amount and term limits, required information, required documents, and differences that justify a comparison. Define the personal, business, financing, and attachment fields, their validation, and which requirements apply at draft save, initial submission, correction, or decision.

Decide whether applicants can change products after saving a draft and what happens to incompatible information. Specify accepted attachment types, size and count limits, sample previews, and how replacement documents satisfy a requirement. Distinguish a missing document from a supplied document that a reviewer finds unsuitable.

The workflow decision fixes the product after first submission and limits correction editing to requested targets while requiring the entire response to pass submission validation. Define any coupled fields that must be requested together to permit a valid correction. Map review checks to the fields and document slots whose changes require those checks to be repeated; unaffected results and unchanged document statuses are preserved.

Agree on the fictional repayment example: currency, amount precision, schedule dates, totals, any illustrative charges, and upcoming or completed entries. Decide whether it is a fixed sample or calculated from the approved application's terms. Its wording must clearly identify it as fictional.

The answer should define enough domain vocabulary, fields, validation rules, and sample records to support all journeys in Arabic and English. Product terms and eligibility rules are portfolio inventions, not claims about the bank's offerings.

## Comments

### Round one, accepted on 2026-10-14

The user accepted all four recommendations:

- Offer Inventory financing / تمويل المخزون and Equipment financing / تمويل المعدات. Both serve an individual owner applying for an established small business. Inventory covers stock replenishment with smaller amounts and shorter terms; equipment covers productive equipment with larger amounts and longer terms. Both share an application structure.
- Use Yemeni rials and accept whole-rial financing amounts. Calculate the repayment illustration from the approved amount and term, with a clearly fictional markup added once, equal monthly installments, and rounding adjustment in the final installment. Show financing amount, markup, and total separately. Exact product limits and markup rates remain to be chosen.
- Accept PDF, JPEG, and PNG files up to 5 MB each, with one current attachment per document slot. A PDF can contain multiple pages. Each slot has a preview and replacement action. Actual local files versus sample attachments remains with the browser-state ticket.
- Allow draft product switching while preserving common information and shared documents. Ask for confirmation before removing incompatible product-specific information or documents. Revalidate amount and term against the new product, preserving invalid values for the applicant to correct rather than silently adjusting them.

### Round two, accepted on 2026-10-14

The user accepted all five recommendations:

- Inventory financing permits 100,000–1,000,000 YER for 6 or 12 months, with a 5% illustrative markup added once. Equipment financing permits 500,000–3,000,000 YER for 12, 18, or 24 months, with an 8% illustrative markup added once. No additional charges appear in the illustration. The overlapping amounts support comparison by purpose, documents, term, and repayment total.
- Require applicant full name, mobile number, and city; email is optional. Accept Arabic or English names and city text. Contact validation checks input format, and sample contacts are fictional.
- Require business name, activity, business address, operating-since month, average monthly revenue, and average monthly operating expenses. Activity choices are Retail, Services, and Small production. Revenue and expenses use whole YER and describe the latest three completed months.
- Both products require requested amount, repayment term, purchase budget, and a short intended-purchase explanation. Purchase budget is the total expected purchase cost and may exceed the financing amount. Product-specific documents distinguish the purposes.
- Both products require applicant identity evidence, business evidence, and a revenue and expense summary. Inventory additionally requires a stock purchase plan; Equipment instead requires a supplier quotation. Every preview contains clearly fictional sample content. Financial evidence supports monthly figures, and purchase evidence supports the intended purchase and budget.

### Round three, accepted on 2026-10-14

The user accepted all five recommendations:

- Submission validation uses trimmed text limits of 2–100 characters for applicant and business names, 2–60 for city, 5–250 for business address, and 20–500 for purchase explanation. Mobile accepts an optional leading plus and 9–15 digits, with spaces and hyphens as separators. Optional email must have valid address format and at most 254 characters. Monthly revenue and expenses are each whole YER within 0–50,000,000; purchase budget is whole YER within 1–50,000,000. Operating-since must be a valid Gregorian month no later than the initial submission month. Amount and term follow product limits. Drafts and partial corrections may retain unfinished or invalid input; file type and size validation precedes upload.
- Review assesses four invented substantive criteria: at least six completed operating months at initial submission, purchase fitting the selected product, financing amount not exceeding purchase budget, and the largest monthly installment not exceeding 40% of positive monthly surplus. Monthly surplus is revenue minus operating expenses. A failed criterion permits rejection with a reason, while a curable problem may instead lead to corrections.
- Documents must be readable and consistent with the application. Identity evidence names the applicant; business evidence supports business name, address, and operating-since; financial evidence covers the three completed months before initial submission and supports declared averages; purchase evidence supports the purchase explanation and budget. Missing, unreadable, stale, or inconsistent evidence leads to corrections.
- Round markup to the nearest whole YER with halves upward. Round the first monthly installments down and put the remaining balance into the final installment. Due dates are the 15th, starting in the month after approval. Fix the demo date at 14 October 2026. The repayment overview is read-only; an older approved sample provides completed entries, while new approvals start with upcoming entries.
- Both languages display Western digits and Gregorian dates with translated month names and currency labels: ر.ي. in Arabic and YER in English. Accept Arabic-Indic numeric and phone input. Entered names and explanations remain as entered on language changes, and numbers and contact values remain readable from left to right.

### Round four, accepted on 2026-10-14

The user accepted all three remaining recommendations:

- Use five required checklist checks: Evidence consistency, Operating history, Product purpose fit, Purchase budget coverage, and Repayment capacity. Checks begin Unchecked; the reviewer records Passed or Failed. Numerical checks follow the agreed calculations and cannot pass when their thresholds fail. Evidence consistency cannot pass until all required documents are accepted and match current information. Recheck changed dependencies while retaining unaffected results. An unchanged document can retain Accepted while a related field change requires fresh consistency review.
- Limit correction editing to information that actually needs changing. Recheck all affected checks, without requiring changes to otherwise correct dependent fields. Request a field and its supporting document together only when both need correction. Compare normalized values; formatting-only spacing or digit changes do not satisfy a requested change.
- Prepare six core records: an incomplete Inventory draft, a complete Equipment submission, a prepared Inventory submission missing financial evidence, an Inventory correction response needing a reduced amount and readable purchase plan, a historical Equipment approval, and an Inventory rejection on operating history. Equipment examples use 1,200,000 YER over 18 months with 72,000 YER installments. The correction reduces 600,000 to 450,000 YER over six months, changing installments from 105,000 to 78,750 against an 80,000 capacity limit. The historical approval is dated 10 July 2026, with August and September completed and 15 October next. Identity relationships and additional queue records belong to the access ticket.

## Answer

Resolved on 2026-10-14 after the user accepted all seventeen recommendations across four rounds. This contract supplies fictional products, application requirements, review dependencies, repayment arithmetic, and core sample data. [Define application states and correction rules](01-application-states-and-corrections.md#answer) remains the authority for lifecycle transitions, correction snapshots, actor actions, and history visibility.

### Product contract

Both products serve an individual owner applying for an established small business. Retail, Services, and Small production are the supported activity choices. The six-month operating requirement is a review criterion, not a submission-format restriction. These are portfolio inventions, not claims about actual bank offerings.

| Property | Inventory financing / تمويل المخزون | Equipment financing / تمويل المعدات |
| --- | --- | --- |
| Purpose | Replenish business stock | Purchase productive business equipment |
| Currency | YER | YER |
| Inclusive amount range | 100,000–1,000,000, in whole YER | 500,000–3,000,000, in whole YER |
| Repayment terms | 6 or 12 months | 12, 18, or 24 months |
| Illustrative markup | 5% of financing amount, added once | 8% of financing amount, added once |
| Other illustrated charges | None | None |
| Shared documents | Identity evidence, business evidence, revenue and expense summary | Identity evidence, business evidence, revenue and expense summary |
| Product-specific document | Stock purchase plan | Supplier quotation |

The markup rate is fixed per product across its available terms. Comparison shows purpose, amount range, available terms, required documents, and markup. Financing amount, illustrative markup, and repayment total have distinct labels. Product choice is fixed after first submission.

### Fields and submission validation

All fields below are required at submission except email. The selected product is also required. Text limits apply after trimming surrounding whitespace; names and descriptive text accept Arabic or English. Monetary inputs are whole-rial values, and input normalization accepts Western and Arabic-Indic digits.

| Group | English label | Arabic label | Submission rule |
| --- | --- | --- | --- |
| Product selection | Financing product | منتج التمويل | Inventory or Equipment |
| Personal | Full name | الاسم الكامل | 2–100 characters |
| Personal | Mobile number | رقم الجوال | Optional leading `+`, then 9–15 digits; spaces and hyphens are separators |
| Personal | City | المدينة | 2–60 characters |
| Personal | Email | البريد الإلكتروني | Optional; valid address format when supplied; at most 254 characters |
| Business | Business name | اسم النشاط التجاري | 2–100 characters |
| Business | Business activity | نوع النشاط | Retail / التجزئة, Services / الخدمات, or Small production / إنتاج صغير |
| Business | Business address | عنوان النشاط التجاري | 5–250 characters |
| Business | Operating since | شهر بدء النشاط | Valid Gregorian year and month, no later than initial submission month |
| Business | Average monthly revenue | متوسط الإيرادات الشهرية | Whole YER, inclusive 0–50,000,000 |
| Business | Average monthly operating expenses | متوسط مصروفات التشغيل الشهرية | Whole YER, inclusive 0–50,000,000 |
| Financing | Requested amount | مبلغ التمويل المطلوب | Whole YER within selected product's inclusive range |
| Financing | Repayment term | مدة السداد | One of selected product's available month counts |
| Financing | Purchase budget | تكلفة الشراء المتوقعة | Whole YER, inclusive 1–50,000,000; total expected purchase cost |
| Financing | Purchase explanation | وصف الشراء والغرض منه | 20–500 characters |

The financial figures describe the three completed calendar months before the initial submission month and exclude the repayments illustrated for this application. Freeze that reference window at first submission. A correction response continues to use it rather than silently changing the financial period.

The purchase budget may exceed requested financing. Financing exceeding budget, nonpositive monthly surplus, insufficient operating history, and an unsuitable purchase purpose are substantive review concerns. They do not add submission-format blockers. Thus an application can be structurally valid and later fail review.

| Stage | Requirements |
| --- | --- |
| Draft save | May retain incomplete or invalid field input. Required-field completeness and review eligibility do not block saving. |
| File upload | Validate allowed type and size before upload. A required file must finish uploading successfully before it can satisfy submission requirements. |
| Initial submission | All required fields valid, product selected, and all four required document slots successfully supplied. Required uploads cannot be pending or failed. Record the initial submission month. |
| Partial correction save | May retain unfinished or invalid changes in the applicant workspace. Reviewer-visible submitted information is unchanged. |
| Correction resubmission | Every requested field meaningfully changed and valid; every requested document added or replaced through a successful upload; whole application passes submission validation. Only requested targets are editable. |
| Approval | All required documents Accepted, all five required checklist checks Passed for current information, and all outstanding requested corrections verified. |
| Rejection | At least one failed substantive criterion among Operating history, Product purpose fit, Purchase budget coverage, or Repayment capacity. An evidence deficiency alone leads to corrections. |

Both final decisions also retain the workflow's assigned-reviewer, Under review, applicant-visible reason, and explicit-confirmation prerequisites.

### Draft product switching

Allow switching only while Draft. Preserve common personal, business, and financing information and the three shared documents. Both products use the same field structure; their fourth document slot differs.

If switching would discard a supplied product-specific document, confirm before discarding it. Cancelling preserves the current product and draft. Confirming removes the incompatible product-specific document and exposes the new required slot. Preserve entered amount, term, budget, and explanation; revalidate amount and term against the new product, displaying invalid values for correction rather than clamping or silently replacing them. The applicant can revise the shared explanation to fit the newly selected purpose.

### Document contract and sample preview content

Each product has four required document slots and one current file per slot. Allow PDF, JPEG, and PNG, at most 5 MB per file, meaning 5,000,000 bytes. A PDF may contain multiple pages. Each slot supports preview and replacement. Actual local-file acceptance, sample selection, storage, and upload recovery belong to the browser-state ticket.

| Document slot | Arabic label | Applies to | Required evidence and preview content |
| --- | --- | --- | --- |
| Applicant identity evidence | إثبات هوية المتقدم | Both | Readable fictional identity evidence naming the declared applicant |
| Business evidence | إثبات النشاط التجاري | Both | Fictional business record supporting declared business name, address, and operating-since month |
| Revenue and expense summary | ملخص الإيرادات والمصروفات | Both | The three completed months before initial submission, with figures and averages supporting the declared monthly revenue and expenses |
| Stock purchase plan | خطة شراء المخزون | Inventory | Intended stock purchase and total cost consistent with purchase explanation and budget |
| Supplier quotation | عرض سعر المعدات | Equipment | Intended productive equipment and quoted total cost consistent with purchase explanation and budget |

Every prepared preview contains visible `DEMO / تجريبي` identification and fictional content. Provide translated document labels and explanatory copy. Entered names and business text stay as entered when the UI language changes.

A Missing slot has no supplied document. Awaiting review has a successfully supplied file awaiting assessment. Accepted means the reviewer found the supplied file suitable. Needs replacement retains the supplied file and records why it is unsuitable. File-envelope validation does not establish readability, correct content, or relevance to the application. Missing, unreadable, stale, or inconsistent evidence leads to a correction request with the affected slot or fields and reasons.

Replacing a file makes it Awaiting review when the response is published. Successful field-only corrections preserve unchanged files' review statuses but can invalidate the evidence consistency check. The reviewer then reassesses the relationship between the current field and the existing evidence and requests another correction if necessary.

### Required review checklist and dependencies

Use five fixed checks, each Unchecked, Passed, or Failed. The assigned reviewer records the outcome. Numeric results follow the rules below and cannot be overridden to Passed while the rule fails. A failed substantive criterion permits rejection; a curable problem can instead produce targeted corrections. A failed Evidence consistency check calls for corrections and cannot by itself justify rejection.

| Check | Arabic label | Pass rule | Changed dependencies that require rechecking |
| --- | --- | --- | --- |
| Evidence consistency | اتساق المستندات والبيانات | All four required documents Accepted and consistent with the current document-supported information | Applicant full name; business name and address; operating-since month; revenue and expenses; purchase explanation and budget; any added or replaced required document |
| Operating history | مدة مزاولة النشاط | At least six operating months between declared start month and initial submission month | Operating-since month or business evidence |
| Product purpose fit | ملاءمة الغرض لمنتج التمويل | Reviewer confirms that the purchase serves the selected product's purpose in the declared business activity | Business activity, purchase explanation, or stock purchase plan / supplier quotation |
| Purchase budget coverage | توافق مبلغ التمويل مع تكلفة الشراء | Financing amount does not exceed purchase budget | Financing amount, purchase budget, or stock purchase plan / supplier quotation |
| Repayment capacity | القدرة التوضيحية على السداد | Monthly surplus positive, and largest illustrated installment no greater than 40% of that surplus | Financing amount, repayment term, revenue, expenses, or revenue and expense summary |

For month-level operating history, subtract the start month's year-and-month index from the initial submission month's index. For example, August 2026 to October 2026 is two months. The initial submission month and fixed product terms are stable reference inputs.

On resubmission, changed dependencies return affected checks to Unchecked. Keep unaffected results. Added and replaced documents become Awaiting review, while unchanged documents retain their statuses. Corrections verification remains separate from the five checks: requested field changes must be verified, and accepting a requested document verifies that document target. Approval uses current outstanding targets; preserved insufficient responses from earlier rounds are historical outcomes, not permanent blockers after a later response satisfies the carried-forward request.

### Related correction targets

Dependencies determine rechecking, not permission to edit. Request only fields and documents that actually need changing, with a reason for each. Request related targets together when both need correction; every requested field must then meaningfully change. Do not unlock an entire dependency group merely because one member changed.

- Reducing financing amount repeats budget coverage and repayment capacity. A correct budget and term stay locked unless separately requested.
- Changing repayment term repeats repayment capacity. Amount, budget, and supporting evidence can stay unchanged.
- If declared revenue is wrong but the financial summary is correct, request the revenue field. Repeat evidence consistency and repayment capacity against the existing summary.
- If declared figures are correct but the summary is stale or unreadable, request only the summary replacement. Repeat its dependent checks after resubmission.
- If a field and supporting evidence both need correction, include both targets. A corrected purchase explanation and replacement purchase document repeat evidence consistency and product purpose fit; replacing purchase evidence also repeats budget coverage.

Compare normalized values when checking meaningful changes and deciding which field dependencies changed. Formatting-only spacing or digit-style changes do not satisfy a requested field correction. The browser-state operation contract owns canonical comparison and error behavior. Partial correction saves remain separate from the submitted snapshot and fixed round baseline.

### Repayment calculation, dates, and display

Use whole YER throughout. Let `P` be valid financing amount, `r` the product markup percentage as 5 or 8, and `N` the repayment term in months:

```text
markup = floor((P × r + 50) / 100)
repayment total = P + markup
regular installment = floor(repayment total / N)
first N − 1 installments = regular installment each
final installment = repayment total − regular installment × (N − 1)
monthly surplus = average monthly revenue − average monthly operating expenses
```

The markup formula rounds to nearest whole YER with halves upward. The final installment includes the allocation remainder. Capacity uses the largest actual installment, including that final adjustment. For a positive surplus, the 40% condition can be expressed exactly as `5 × largest installment <= 2 × monthly surplus`.

Amounts and terms are available during review to calculate the illustration needed for capacity assessment. A dated repayment overview is available only after approval. Approval accepts the submitted terms; requests for different terms must occur through corrections before deciding.

Fix the domain demonstration date at 2026-10-14. All installment due dates are the 15th. The first is in the calendar month after approval, followed by one installment each month. Approval on 14 October 2026 therefore starts on 15 November 2026. Historical approval on 10 July 2026 starts on 15 August 2026.

The overview is read-only. New approvals start with all installments Upcoming / قادم. The historical sample has two prepared Completed / مكتمل entries. A due date passing does not record payment or change application status. No interactive payment or installment-completion action is part of this workflow. Show financing amount, markup, repayment total, completed amount, remaining amount, and upcoming and completed entries as a fictional illustration.

Both languages display Western digits and Gregorian dates with translated month names. Numeric and phone input also accepts Arabic-Indic digits. Arabic currency label is `ر.ي.`; English is `YER`. Amounts and contact values remain readable left to right inside either language layout. UI language switching changes labels and formatting while preserving entered names and explanations.

Use clear copy such as:

| Purpose | Arabic | English |
| --- | --- | --- |
| Demo identification | عرض تجريبي. البيانات والمنتجات وشروط التمويل افتراضية. | Demo. Data, products, and financing terms are fictional. |
| Repayment heading | جدول سداد توضيحي افتراضي | Fictional repayment illustration |
| Review criteria explanation | معايير مراجعة افتراضية لهذا العرض التجريبي. | Review criteria invented for this demo. |
| Financing amount | مبلغ التمويل | Financing amount |
| Markup | الزيادة التوضيحية | Illustrative markup |
| Repayment total | إجمالي السداد التوضيحي | Illustrated repayment total |
| Completed amount | المبلغ المكتمل في المثال | Completed amount in the example |
| Remaining amount | المبلغ المتبقي في المثال | Remaining amount in the example |

### Six core sample records

These fixture defaults support all agreed journeys. Identity-to-record relationships, reviewer identities, assignments, and any additional queue records belong to the access ticket. Preserve the scenario facts when choosing those relationships.

Use fictional personal defaults of full name `مريم سالم`, mobile `+000000000001`, city `عدن`, and optional email `mariam@example.test`. Use business address `شارع السوق، موقع تجريبي، عدن`. These contact values serve the demo's format checks. Established-business financial evidence can show the same stated revenue and expense figures for each of the three months, making its displayed averages exact. The young-business rejection instead shows July revenue and expenses of zero, and August and September revenue of 900,000 and expenses of 600,000 each. This gives the declared three-month averages of 600,000 and 400,000 without implying activity before the business began.

| Core record | Product and starting state | Financing / purchase budget, YER | Term | Revenue / expenses, YER per month | Scenario fact |
| --- | --- | --- | --- | --- | --- |
| Incomplete inventory draft / مسودة مخزون غير مكتملة | Inventory, Draft | 200,000 / 250,000 | 6 months | 700,000 / 500,000 | Purchase explanation empty; save and restore incomplete input. Common documents and stock plan can be supplied to demonstrate confirmation before switching products. Equipment switch preserves amount and term as invalid values to correct. |
| Complete equipment application / طلب معدات مكتمل | Equipment, Submitted | 1,200,000 / 1,500,000 | 18 months | 900,000 / 650,000 | All four required files supplied, initially Awaiting review; all checks initially Unchecked. Complete first review and approval. |
| Inventory application missing financial evidence / طلب مخزون ينقصه الملخص المالي | Inventory, Submitted | 300,000 / 350,000 | 6 months | 700,000 / 500,000 | Required financial-summary slot Missing; other three supplied and Awaiting review. Explicitly prepared incomplete submission, unavailable through normal submission. |
| Inventory correction response / تصحيح طلب مخزون | Inventory, Corrections requested | Initially 600,000 / 650,000; corrected amount 450,000 | 6 months | 700,000 / 500,000 | Request targets amount and unreadable stock-plan replacement. Other documents Accepted. Preserve original submitted snapshot and fixed request baseline until resubmission. |
| Historical equipment approval / موافقة معدات سابقة | Equipment, Approved | 1,200,000 / 1,500,000 | 18 months | 900,000 / 650,000 | All documents Accepted and checks Passed; approved 10 July 2026. August and September installments completed; 15 October next. |
| Young-business inventory rejection / رفض طلب مخزون لنشاط حديث | Inventory, Rejected | 200,000 / 240,000 | 6 months | 600,000 / 400,000 | All required files were supplied at submission. Business start August 2026 and submission October 2026 give only two operating months; rejection is on this substantive criterion. |

| Record | Business name | Activity | Operating since | Initial submission and financial window |
| --- | --- | --- | --- | --- |
| Incomplete inventory draft | متجر السهل التجريبي | Retail | 2025-01 | Not yet submitted; preparation uses October demo context |
| Complete equipment application | ورشة المدار التجريبية | Services | 2024-03 | 2026-10-02; financial evidence for July, August, and September 2026 |
| Inventory application missing financial evidence | متجر النخيل التجريبي | Retail | 2025-01 | 2026-10-05; requested financial evidence for July, August, and September 2026 |
| Inventory correction response | متجر الندى التجريبي | Retail | 2025-01 | 2026-10-02; financial evidence for July, August, and September 2026; correction request dated 2026-10-04 |
| Historical equipment approval | ورشة المدار التجريبية | Services | 2024-03 | 2026-07-03; financial evidence for April, May, and June 2026 |
| Young-business inventory rejection | ورشة البداية التجريبية | Small production | 2026-08 | 2026-10-02; reject 2026-10-03 after confirming operating history |

Use entered purchase explanation `شراء آلة طباعة لاستخدامها في أعمال الورشة وتقديم خدمات الطباعة.` for Equipment examples. For the missing-financial Inventory example use `شراء مخزون جديد من المواد الغذائية لتجديد البضائع في المتجر.`; for the correction example use `شراء مخزون من المستلزمات المنزلية لتجديد البضائع في المتجر.`; for the rejection example use `شراء مواد أولية لتجديد مخزون الورشة ودعم نشاط الإنتاج الصغير.`. The incomplete draft's explanation stays empty until the applicant completes it.

The correction sample's active request has a reason for each target. The amount reason explains that the illustrated installment exceeds the fictional capacity limit and asks for a reduced financing request. The document reason asks for a readable purchase plan showing intended purchases and total cost. In its baseline, Repayment capacity is Failed, Operating history Passed, and Evidence consistency, Product purpose fit, and Purchase budget coverage can remain Unchecked pending a readable purchase plan. After a 450,000 response and a readable plan, publish the response, repeat affected checks, verify both targets, and approve only when all conditions pass.

For the rejection sample, business evidence is Accepted and Operating history Failed. Other uncompleted review outcomes may remain Unchecked and other supplied files Awaiting review, consistent with rejection before all document review finishes. Its applicant-visible reason states that the demo criterion requires six operating months and the application records two. It receives no repayment overview.

Seed activity and applicant history consistently with each lifecycle position. Submitted examples have a submission entry. The correction sample has submission, review start, and a correction request with target reasons. Approved and Rejected samples have submission, review start, and their final decision and reason, plus the internal review activity supporting the decision. Applicant notifications include the active correction request and final decisions. Assignment events and staff identity remain internal under the workflow decision.

### Arithmetic reference examples

| Example | Markup, YER | Repayment total, YER | Installments | Capacity result |
| --- | --- | --- | --- | --- |
| Complete or historical equipment, 1,200,000 over 18 months | 96,000 | 1,296,000 | 18 × 72,000 | Pass: 72,000 <= 100,000, given 250,000 monthly surplus |
| Missing-financial inventory, 300,000 over 6 months | 15,000 | 315,000 | 6 × 52,500 | Would pass capacity after review: 52,500 <= 80,000 |
| Correction baseline, 600,000 over 6 months | 30,000 | 630,000 | 6 × 105,000 | Fail: 105,000 > 80,000 |
| Correction response, 450,000 over 6 months | 22,500 | 472,500 | 6 × 78,750 | Pass: 78,750 <= 80,000 |
| Young-business rejection, 200,000 over 6 months | 10,000 | 210,000 | 6 × 35,000 | Capacity could pass, but operating history fails |
| Whole-rial rounding reference, Inventory 100,010 over 6 months | 5,001 | 105,011 | First five 17,501; final 17,506 | Use 17,506 when evaluating capacity |

The historical schedule runs from 15 August 2026 through 15 January 2028. Two completed entries total 144,000 YER. Sixteen upcoming entries total 1,152,000 YER. The next is 15 October 2026, one day after the fixed demonstration date.

### Representative boundaries and remaining context

- A too-short name or explanation, invalid phone/email format, fractional monetary value, amount outside product limits, unsupported term, future start month, forbidden file type, oversized file, or missing required upload blocks normal submission.
- Zero revenue or expenses can be structurally valid. Nonpositive surplus fails capacity during review. Fewer than six operating months can likewise be structurally valid and fail review.
- Financing greater than purchase budget is structurally valid within the individual fields' bounds but fails Purchase budget coverage.
- A replaced document reopens its dependent checks even if field numbers are unchanged. An unrelated phone correction requires verification of that target while preserving unrelated checklist results.
- Initial submission of the missing-financial example is a deliberate seed exception, not a bypass in the normal submit action.
- [Define demo access and reviewer assignment](03-demo-access-and-reviewer-assignment.md) owns identity mapping, assignment authority, additional queue examples, access visibility, and stale-record policy.
- [Define browser persistence and simulated failures](04-browser-state-and-simulated-failures.md) owns mock inputs and errors, normalized comparisons, storage of entered drafts versus published snapshots, upload handling, record versions, fixed demo-date behavior, and failure recovery.
- [Choose the bilingual visual direction](05-bilingual-visual-direction.md) and [Validate applicant and staff screen flows](06-applicant-and-staff-screen-flows.md) use this domain content and agreed numeric/date semantics when prototyping. Prototype work owns layout and interactions rather than choosing replacement product rules.

No new decision ticket is required. The remaining precise implementation-contract and interface questions fit the existing map children; unexpected bilingual or responsive interaction problems remain in the map's fog until a prototype makes them concrete.
