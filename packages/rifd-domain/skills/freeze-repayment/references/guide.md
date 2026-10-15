# Frozen repayment

`freezeRepayment(amount, term, rules, approvedAt, completedCount = 0)` returns a
`Repayment`. It rejects an unsafe or out-of-range amount, an unsupported term,
a date outside the `YYYY-MM-DD` shape, and a noninteger completed count outside
zero through the term. Calendar validity remains the caller's responsibility.

The helper rounds markup half-up to whole YER using
`Math.floor((amount * rules.markupPercent + 50) / 100)`. It divides the resulting
total into integer installments and puts the remainder in the final row.
For 100,010 YER over six months under inventory rules, markup is 5,001 YER,
total is 105,011 YER, the first five rows are 17,501 YER and the last is 17,506 YER.

Rows fall on the fifteenth, starting in the month after approval. October 2026
approval gives a first due date of `2026-11-15`; year rollover uses month
arithmetic. The first `completedCount` rows are `completed`; later rows are
`upcoming`. `completed` sums the completed row amounts and `remaining` subtracts
that sum from total.

The snapshot records amount, term, product, rule version, approval date, markup,
total and rows. Preserve these stored values when displaying historical
approvals. Recomputing from current product rules can change an old agreement.
This API models the demo's fixed arithmetic and has no calendar, banking or
payment-service integration.
