---
name: freeze-repayment
description: >
  Use when creating or testing a fictional RIFD repayment snapshot with
  @rifd/domain, including markup rounding, monthly dates and completed amounts.
  Payment collection and real lending calculations are outside this helper.
metadata:
  purpose: Calculate and retain a fictional repayment snapshot with whole-rial arithmetic.
  type: core
  library: '@rifd/domain'
  library_version: '0.1.0'
sources:
  - skills/freeze-repayment/references/guide.md
  - src/index.ts
  - src/model.ts
---

1. Call `freezeRepayment` with safe integer YER, a permitted term, the selected
   product rules and a caller-validated calendar date. The helper checks the
   date's shape only. Pass the completed installment count for seeded history.
2. Save the returned snapshot at approval. Display its stored rows and totals
   later so a product-rule change cannot rewrite historical terms.
3. For rounding, date rollover or progress calculations, read the
   [repayment guide](references/guide.md). Check that row amounts sum to `total`
   and `completed + remaining === total`.

```ts
import { freezeRepayment, products } from '@rifd/domain'

const repayment = freezeRepayment(
  100_010, 6, products.inventory, '2026-10-14',
)
if (repayment.total !== 105_011 || repayment.rows[5].amount !== 17_506) {
  throw new Error('Unexpected whole-rial repayment')
}
```

The result is fictional demo data. These helpers perform no persistence or
payment processing. Handle thrown validation errors before saving a snapshot.
