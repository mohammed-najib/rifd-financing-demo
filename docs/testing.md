# Testing

[Documentation index](README.md) · [Development](development.md)

Choose checks that exercise the behavior you changed. A screenshot, model smoke call and passing unit test answer different questions.

## Everyday checks

| Command | What it checks |
| --- | --- |
| `pnpm typecheck` | TypeScript contracts in the application, server code and tests. |
| `pnpm lint` | Repository lint rules. |
| `pnpm test` | Pure domain rules and evidence-service/controller logic, including local fake-provider tests. |
| `pnpm test:skills` | Packaged guidance and its consumer policy. |
| `pnpm build` | Production client/server compilation and SPA prerendering. |
| `pnpm check:css-sources` | Production CSS sources included, docs/artifacts excluded, followed by a clean rebuild. |

The local HTTP tests open temporary loopback servers. The build also opens a temporary prerender server. `listen EPERM` in a sandbox can mean local binding is blocked. Allow the required local server and rerun the affected check before treating it as an application regression.

The Firestore admission test requires its emulator. A skipped emulator test is not a passing emulator check.

## Browser tests

Install ordinary Google Chrome and Playwright's pinned Firefox and WebKit on a supported system:

```sh
pnpm exec playwright install --with-deps firefox webkit
pnpm test:browser:api
pnpm build:test
pnpm test:browser
```

The API suite uses Chrome and actual IndexedDB through a separate Vite harness on port 4174. Screen tests use the built static application on port 4173 across Chrome, Firefox and WebKit. `build:test` disables hosted inference even if local production environment files exist. The harness is not part of the production build.

For an affected screen suite, build first and select its file and project:

```sh
pnpm exec playwright test tests/browser/application/drafts.screens.spec.ts --project=chrome
```

Browser tests use isolated contexts with fictional data. Do not run a reset walkthrough in a browser profile containing work you want to keep. Responsive tests emulate CSS viewports; they do not establish physical-device or branded Safari support.

Failures retain traces and screenshots in `test-results/`. Selected screen tests also write screenshots to `artifacts/browser-evidence/`. HTML reports are separated into `playwright-report/api` and `playwright-report/screens`. These directories are ignored by Git.

## Full acceptance

```sh
pnpm test:acceptance
```

This command runs typecheck, lint, unit/package checks, a fresh build, browser API/screens and Hosting delivery gates. It retains timestamped logs and reports in `artifacts/acceptance/20/`. Use `RIFD_ACCEPTANCE_SLICE=24` to select that archive label. A label does not change the tested behavior.

Review failed invocations and explicit reruns separately. Historical counts and browser versions are in the [original acceptance matrix](acceptance/README.md); they describe that release, not every later commit.

## Hosting and performance

The recorded Hosting setup used Firebase CLI 15.30.0. With Firebase CLI installed:

```sh
pnpm build
pnpm test:delivery
pnpm test:performance
```

Delivery gates start the local Hosting emulator with `demo-rifd`. Performance measurements use the built static output, mobile Lighthouse settings and repeated runs. They write reports under `artifacts/performance/22/`.

```sh
pnpm verify:performance artifacts/performance/22/your-run-directory/run.json
```

Use the actual directory printed by the measurement command. Verification binds results to source and build hashes. A same-source rebuild can change a prerender timestamp, so keep the measured output until verification is complete.

## Testing Jev

Ordinary automated tests use fake provider responses. They verify authorization, page selection, independent document controls, cancellation, stale-result handling, save/reopen behavior, accounting and presentation. They do not measure native model accuracy.

For a manual native check:

1. Start `pnpm dev:jev` using your own TypeSafe key.
2. Use a fictional source and declaration. Inspect the exact selected file and pages.
3. Start one explicit check, then inspect both the findings and their source.
4. Save matching work and reopen it. Confirm that reopening does not start another provider request.
5. Change relevant information and confirm that previous findings stop being current.

Native requests can cost money. Do not automatically retry them to obtain a preferred answer. Partial findings and suppressed highlights are valid outcomes to inspect. The [film manifest](demo/film.json) records a native call during filming. That call does not establish broad bilingual or multipage reliability.

## Documentation checks

For documentation-only work, check relative links and section anchors, review Arabic direction and code blocks in a rendered preview, and open the linked images/video. Changes to current guides should not rewrite raw historical evidence or turn old test results into claims about the current build.
