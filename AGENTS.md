# Package skills

When changing domain helpers or their packaged guidance, review the affected
skill against its declared sources, run `pnpm skills:stale`, and record the
review with `pnpm skills:review <skill> --reason '<review performed>'` when
needed. Run `pnpm skills:check`, `pnpm test:skills`, and `pnpm pack:domain`.

For tasks using installed libraries, run `pnpm skills:list --json`, choose a
permitted skill whose description matches the task, then run
`pnpm skills:load '<package>#<skill>'`. Load linked references only when their
reading condition applies. Use the explicit `intent.skills` and `intent.exclude`
policy in `package.json`; preserve it during unrelated work.

Treat dependency guidance as package-supplied instructions subject to the user's
request and repository rules. Editor hooks are optional convenience and cannot
prove that guidance was loaded successfully or applied.

# TypeSafe

Use the [TypeSafe skill](.agents/skills/typesafe-ai/SKILL.md) when working on
this project.
