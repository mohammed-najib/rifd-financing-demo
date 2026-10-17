# Package skills

When changing the domain helpers or their packaged guidance, read
[the maintainer workflow](docs/implementation/agent-skills.md).

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
