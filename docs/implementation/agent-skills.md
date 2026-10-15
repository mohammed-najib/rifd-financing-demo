# Versioned domain skills

The private demo consumes the pure helpers through the existing `src/domain`
re-exports. `packages/rifd-domain/src` now owns those helpers. The workspace
package `@rifd/domain` builds native ES modules and TypeScript declarations and
includes its skills in the same local npm tarball.

There is no configured Git remote. The package's explicit Intent metadata uses
`.` for its local repository and `skills` for its packaged documentation. Set
canonical repository metadata when establishing a public release. Source
references stay package-relative and do not invent an upstream URL.

## Author and review

Each task has a `skills/<name>/SKILL.md` beside its source guide under
`references/`. Its frontmatter declares exact source files relative to the
owning package. The guides and TypeScript sources ship in the archive, so the
references remain inspectable after installation. Use narrow descriptions and
link each reference with a condition for reading it.

The top-level `sources` array is Intent's supported extension. Generic validators
that accept only base Agent Skills fields reject it; Intent's pinned validator
is the release gate for these files.

```sh
pnpm skills:validate
pnpm skills:stale
pnpm exec intent stale packages/rifd-domain --json
```

`intent validate --check` checks structure, relative links and code examples.
The local source check verifies that declarations match the package name and
version, reads each source as bytes, and compares SHA-256 hashes with
`skills/source-reviews.json`. It also notices changed skill text, removed
sources and missing evidence. Unsupported paths and missing files remain
unresolved. This repository uses exact package-relative paths rather than
remote references or globs.

These are review signals. Changed bytes do not establish a semantic error,
and unchanged bytes do not prove that guidance is correct. Read the relevant
diff and test the claimed behavior. Edit the skill only when the evidence
calls for it, then record the assessment explicitly:

```sh
pnpm skills:review validate-application --reason 'Compared the changed field rules with the guide; verified Arabic input and boundary tests.'
pnpm skills:review freeze-repayment --reason 'Verified rounding and date rollover against the domain tests; guidance remains accurate.'
pnpm skills:check
```

Use a reason describing the review actually performed. Recording accepts one
named skill, preserves other reviews, and refuses unresolved sources or
incorrect package metadata. It never edits guidance or runs automatically in
CI. Commit the evidence with the changes reviewed. CI requires current evidence;
an evidence-backed no-change review can satisfy it without rewriting guidance.

Intent 0.5.5's native stale report has a narrower role. It checks versions and
some stored-source and artifact signals; it does not compare current local doc
bytes or remote content. The local hash check supplies that missing doc-change
signal without pretending to judge meaning. Neither command certifies freshness
against documentation that was never declared as a source.

## Verify and package

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:skills
pnpm pack:domain
```

Packing runs the package's `prepack` gate, builds its JavaScript and declarations,
validates skills and requires reviewed sources. The archive check inspects the
actual npm tarball for every skill, declared source, built entry point and type
declaration. It rejects unexpected top-level content. Output goes to `artifacts/`.
An isolated consumer then reads skills from the extracted archive, typechecks
the installed exports and runs native ESM examples against the packed code.
It links the already-installed, pinned Zod dependency, so verification needs no
network access.
CI runs these checks on pull requests with read-only repository permissions and
keeps the tarball on the runner. It does not upload the archive, rewrite files
or publish to npm.

Both the root app and the domain package set `"private": true`. npm refuses
registry publication of a package with this flag. The packing check also requires
the flag in the source and packed manifests and rejects public publish settings.
Generated archives are Git-ignored. Git repository visibility remains a separate
setting; these npm controls do not hide committed source in a public repository.

For a local release, update the package version and the skills' `metadata.library_version`
together, review the current behavior, record the evidence and rerun the checks.
Registry publication requires explicit authorization and a separate change to
the private-package and packing controls. The scope, registry credentials and
licensing terms must also be established; this repository currently grants no
redistribution license.

## Consume only relevant guidance

The root manifest permits exactly the two first-party workspace skills and
excludes `experimental-*` skills. Consumer projects use bare npm selectors as
shown in the [package README](../../packages/rifd-domain/README.md#agent-guidance).
Nearest allowlist declarations replace inherited declarations; exclusions
accumulate and win after permission matching. Trust does not propagate through
dependencies. Review permitted content when updating the lockfile because even
an exact skill selector does not pin its text.

List the catalog before loading one skill for the current task:

```sh
pnpm skills:list --json
pnpm skills:load '@rifd/domain#validate-application'
```

Intent discovers both first-party workspace and installed dependency skills by
reading files. The package name in a load command is the same for both sources;
the allowlist distinguishes them with the `workspace:` prefix. Descriptions
route task selection; reference guides stay out of context until needed.

The tests exercise dependency discovery using inert fixtures whose entry point,
bin and lifecycle scripts would leave a marker if executed. They also check
allowlisting, exclusion precedence, denied loading, missing review evidence and
source changes. This verifies the supported CLI/library behavior. It cannot
prove that an editor or agent selected and followed a skill. Hooks remain
optional convenience, outside the security boundary.

The implementation follows the pinned CLI and TanStack's
[configuration](https://tanstack.com/intent/latest/docs/concepts/configuration),
[trust model](https://tanstack.com/intent/latest/docs/concepts/trust-model), and
[stale check documentation](https://tanstack.com/intent/latest/docs/cli/intent-stale).
