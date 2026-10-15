---
name: validate-application
description: >
  Use when parsing whole-rial input, comparing edited fields, or checking an
  application form with @rifd/domain. Covers Arabic digits and product limits;
  credit decisions and persistence require the caller's own rules.
metadata:
  purpose: Preserve raw form input while validating and comparing RIFD application fields.
  type: core
  library: '@rifd/domain'
  library_version: '0.1.0'
sources:
  - skills/validate-application/references/guide.md
  - src/application.ts
  - src/index.ts
  - src/model.ts
---

1. Keep the user's raw `Fields` strings in the form. Use `parseWholeYER` for
   numeric interpretation and `normalizeField` only for comparison. Both accept
   Arabic-Indic digits. A failed money parse returns `null`; zero is valid for
   revenue and expenses.
2. Parse untyped input with `fieldsSchema` from `@rifd/domain/model` before calling
   `validateFields`. Pass the selected `products` entry and an explicit submission
   month. The result lists format and range issues, not credit decisions.
3. Preserve incomplete values while saving drafts. Require an empty issue list
   when the caller submits the form, and check document presence separately.

```ts
import { parseWholeYER, products, validateFields } from '@rifd/domain'
import { fieldsSchema } from '@rifd/domain/model'

export function checkApplication(input: unknown) {
  const fields = fieldsSchema.parse(input)
  return {
    amount: parseWholeYER(fields.amount),
    issues: validateFields(fields, products.inventory, '2026-10'),
  }
}
```

When choosing numeric, date, or text comparison rules, read the
[field guide](references/guide.md). Test Arabic digits, grouped money, invalid
grouping and the selected product's inclusive bounds. A formatted input that
passes these checks still needs the caller's substantive review.
