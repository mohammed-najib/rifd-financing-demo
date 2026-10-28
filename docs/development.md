# Development

[Documentation index](README.md) · [Arabic setup guide](getting-started.md) · [Architecture](architecture.md)

## Install and run

Use Node.js 22.19 or newer and pnpm 11.24.0. The lockfile pins the dependency graph.

```sh
git clone https://github.com/mohammed-najib/rifd-financing-demo.git
cd rifd-financing-demo
npm install --global pnpm@11.24.0
pnpm install --frozen-lockfile
pnpm dev
```

Vite normally serves the app at `http://127.0.0.1:5173`. Ordinary development needs no provider key. It does not enable real Jev inference.

To inspect the static production output:

```sh
pnpm build
pnpm preview
```

Open `http://127.0.0.1:4173`. The preview serves `dist/client` and rewrites application routes to `/_shell.html`. The build temporarily opens a local prerender server. A sandbox that blocks loopback binding must allow that server for the build to finish.

## Local Jev inference

Create an ignored `.env.local` in the repository root:

```dotenv
TYPESAFE_API_KEY=your_typesafe_api_key
```

Then run:

```sh
pnpm dev:jev
# http://127.0.0.1:5174
```

An existing `TYPESAFE_API_KEY` environment variable takes precedence. If neither source has a key, the script tries the original project's `LIVE_TYPESAFE_API_KEY` through the signed-in Firebase CLI. That fallback requires access to the original project. Use your own key for an independent checkout.

The key stays in the local API process. Never prefix it with `VITE_`, commit it, or put it in browser configuration. Stop the command with Ctrl+C. To choose another port:

```sh
pnpm dev:jev --port 5180
```

The browser and local API use the exact `127.0.0.1` origin, signed local sessions and the same fixed request/admission contracts as the hosted service. Opening a page, preparing a sample, saving or reopening findings does not start inference. Explicit Run and Retry actions can call TypeSafe and incur usage charges. A model run may include multiple stages.

Local limits include one run start per minute, 20 attempts per guest per UTC day and a shared 60-attempt daily network allowance. The full stage plan is reserved before dispatch, up to nine attempts for four selected pages. Unknown usage blocks further dispatch. These controls are request allowances, not an account-wide billing cap.

Usage counters, deduplication, leases and signing state survive restarts in `artifacts/local-jev/metadata.sqlite`. This database does not hold the provider key, source documents, declarations or answer archives. Keep it across restarts. Deleting it resets allowances and does not reconcile unknown usage. Vite blocks browser access to the local server files and database.

The local mode does not change hosted availability. `functions/index.ts` binds the dedicated provider secret, while Firestore admission independently controls dispatch. Hosted inference was enabled and checked in the [18 October release](releases/2026-10-18.md). Existing Auth, App Check, ingress, quotas and unknown-usage stops remain enforced. An operator with the existing admin credentials can close admission without resetting counters using `node scripts/live-control.mjs rifd-portfolio-mdnb disable`.

For the visible workflow, see the [Arabic AI guide](ai-features.md).

## Where things live

| Location | Responsibility |
| --- | --- |
| `src/ui`, `src/routes` | Screens, bilingual text, routing and unfinished input. |
| `src/demo` | Typed operations, simulated permissions, browser storage, receipts and fictional samples. |
| `packages/rifd-domain` | Pure validation, product/review rules and repayment calculations. |
| `src/evidence-assistance` | Document preparation, fixed questions, findings and result lifecycle. |
| `src/live-assistance`, `functions` | Local/hosted transport, authorization, admission and provider calls. |
| `tests`, `scripts` | Verification and development tools. |
| `docs` | Human guides and dated evidence. |
| `artifacts` | Ignored local reports, recordings and usage state. |

Application data is scoped to the browser profile and origin. Different ports have separate datasets. Sessions are tab-local; committed records and language are shared between tabs at the same origin. A fresh profile gives an independent demo. Use the app's confirmed reset when you want to replace its data.

## Styling

Tailwind CSS compiles through `@tailwindcss/vite`; there is no browser runtime or CDN. The root route loads `src/ui/styles.css` through its `?url` import. This file owns the Guided A colors, local Noto fonts, base styles and shared component skins.

Use logical spacing such as `ms-*`, `me-*` and `ps-*` so layouts work in RTL and LTR. Preserve the 15px root typography and 4px spacing unit. The `compact:` variant includes widths through 1199px; `narrow:` includes widths through 767px. Declare compact before narrow where both apply.

Preflight is omitted. Add `border-solid` with border utilities; for a single edge, also clear the other browser-default widths with `border-0`. Keep complete utility names in source rather than constructing fragments. Production class scanning includes `src` only. `pnpm check:css-sources` checks inclusion and exclusion, then leaves a clean production build.

## Tests and package guidance

Follow [the testing guide](testing.md) for focused checks, browser setup and reports. When changing the domain helpers or their packaged guidance, follow the package skills instructions in `AGENTS.md`. The package's [README](../packages/rifd-domain/README.md) explains its public API.

For work using installed libraries, follow `AGENTS.md`: list permitted skills with `pnpm skills:list --json`, then load a matching skill. Preserve the explicit `intent.skills` and `intent.exclude` policy in `package.json`. An editor hook is not proof that relevant guidance was loaded.

## Static hosting

`firebase.json` serves `dist/client`. The evidence API rewrite targets a separate Cloud Function; application routes fall back to `/_shell.html`. HTML revalidates with `no-cache`, while assets and fonts have a one-hour cache. `dist/server` is a build/prerender artifact, not the static Hosting directory.

To inspect the Hosting emulator, install Firebase CLI and run `pnpm emulators` after building. It uses `demo-rifd`, not the live project. See [testing](testing.md#hosting-and-performance) for automated gates. Deploying the frontend and enabling live inference are separate operations. Build or recording commands do not deploy either one.

## Files that stay local

Keep `.env.local`, provider keys, local credentials, raw traces, recordings and usage databases out of Git. `artifacts/`, generated builds, test reports and `.scratch/` are ignored. The old `.scratch` planning tree was removed; its tracked history remains available through [historical references](history.md).

Hosted function configuration uses `functions/.env.<project-id>`, which the Firebase CLI loads on deploy and in the emulator. That file stays local; copy `functions/.env.rifd-portfolio-mdnb.example` to `functions/.env.rifd-portfolio-mdnb` and fill in values for your own project. Committed examples use placeholders only.
