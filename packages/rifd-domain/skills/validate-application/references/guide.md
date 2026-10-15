# Application fields

`Fields` stores input as strings, except `activity`, which is `retail`, `services`
or `production`. `fieldsSchema` checks the runtime shape. `validateFields` checks
format and ranges and returns `FieldIssue[]`; it does not mutate input.

`parseWholeYER` folds Arabic-Indic digits, trims outer whitespace and accepts
ungrouped integers or groups of three separated by `,` or `٬`. It returns a safe
integer or `null`. `١٬٢٠٠٬٠٠٠` becomes `1200000`. `1,00,000`, `1.0`, `1e6`, `+100`
and internal whitespace fail. Do not use truthiness to distinguish zero from a
failed parse.

`normalizeField` produces comparison keys. It folds digits, normalizes text to
NFC, collapses whitespace and lowercases text. It removes spaces and hyphens
from mobile numbers, canonicalizes valid money and integer terms, and preserves
meaningful punctuation and Arabic diacritics. These keys are unsuitable as the
authoritative displayed or stored form values.

| Input | Format rule |
| --- | --- |
| `amount` | Selected product's inclusive minimum and maximum |
| `term` | Selected product's permitted integer month count |
| `revenue`, `expenses` | Whole YER from zero through 50,000,000 |
| `budget` | Whole YER from one through 50,000,000 |
| `operatingSince` | Nonzero year and valid `YYYY-MM`, no later than submission month |
| `email` | Optional, ASCII address with dotted domain, at most 254 characters |
| `mobile` | Optional leading `+`, then 9 to 15 digits after normalization |

The inventory product permits 100,000 through 1,000,000 YER and terms of 6 or 12
months. Equipment permits 500,000 through 3,000,000 YER and 12, 18 or 24 months.
Read the current `products` value when selecting rules.

Text limits count Unicode code points after trimming. Format validation does
not establish operating history, evidence quality, budget coverage, surplus,
document presence or eligibility. Those belong to the calling application.
