# RIFD domain

`@rifd/domain` contains the existing demo's pure TypeScript field validation,
product rules, read and review permissions and fictional repayment calculations. It is an
ES module with TypeScript declarations. Browser persistence and UI stay in the
private demo app. This package's code has no granted redistribution license.

Both workspace packages set `"private": true`, which blocks npm publication.
Packing creates a local archive; CI verifies it without uploading it. Registry
publication requires a separate, explicit change to these controls. These npm
settings do not control the visibility of source committed to a Git repository.

```ts
import { parseWholeYER, freezeRepayment, products } from '@rifd/domain'

const amount = parseWholeYER('١٠٠٬٠١٠')
if (amount !== null) {
  const snapshot = freezeRepayment(amount, 6, products.inventory, '2026-10-14')
  console.log(snapshot.total) // 105011
}
```

Runtime schemas and domain types are available through `@rifd/domain/model`.
`reviewPermissions(actor, application)` returns permitted claim, transfer,
unassignment and review-start actions for the current status and assignee.
The demo operation boundary checks current session, dataset and revisions before
using these rules. A displayed permission never grants write authority.
The package performs no persistence, authentication, lending decisions or
payment processing. Its dates, rules and data model belong to a fictional demo.

## Agent guidance

The package ships two task-specific skills beside their source guides under
`skills/`. Their `metadata.library_version` matches this package's release.
Install the reviewed CLI explicitly in a consumer project:

```sh
npm install --save-dev --save-exact @tanstack/intent@0.5.5 --ignore-scripts
```

Add an explicit policy to the consumer's `package.json` before discovery:

```json
{
  "intent": {
    "skills": [
      "@rifd/domain#validate-application",
      "@rifd/domain#freeze-repayment"
    ],
    "exclude": ["*#experimental-*"]
  }
}
```

These bare selectors permit installed npm sources. Inside this source
workspace, use `workspace:@rifd/domain#<skill>` instead. A dependency's
permissions do not extend to its dependencies. An empty `skills` array disables
all guidance. Intent 0.5.5 still permits all discovered skills when the key is
absent, so keep the declaration explicit. Exact skill selectors avoid opting
into future skills; dependency updates can still change permitted instructions.

```sh
npm exec --no -- intent list --json
npm exec --no -- intent load '@rifd/domain#validate-application'
```

List metadata first, then load the skill that matches the current task. Read
its linked guide only when needed. Use `freeze-repayment` for repayment work.
Exclusions apply after the allowlist and can block a whole package or a skill.

Intent scans package metadata and static skill files, including reachable
transitive dependencies, without executing discovered packages' entry points,
bins or lifecycle scripts. Yarn PnP discovery uses the project's `.pnp.cjs`
runtime; this workspace uses pnpm's filesystem layout. Ordinary npm installation
has its own lifecycle behavior, separate from Intent discovery.

Editor hooks are optional convenience. Observing a load command does not prove
that it succeeded, that the skill was relevant or that the agent followed it.
Use repository policy, review and normal execution permissions as the controls.

See Intent's [configuration](https://tanstack.com/intent/latest/docs/concepts/configuration)
and [trust model](https://tanstack.com/intent/latest/docs/concepts/trust-model).
