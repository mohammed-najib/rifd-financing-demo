# RIFD / رِفد

A fictional, Arabic-first financing demo that saves records and evidence in the browser. This repository currently implements [ticket 01](.scratch/financing-application-and-review-implementation/issues/01-open-bilingual-seeded-demo.md): choose an identity and inspect the complete seeded dataset in Arabic or English.

Mariam, Huda and Omar can read their own applications. Salma can read all submitted applications, including colleague assignments. Khaled is a simulated colleague and cannot sign in. Editing, submission, notifications UI, document previews, queue controls and review actions belong to later tickets and have no runnable controls here.

## Run

Use Node 22.12 or newer and pnpm 11.24.0. This slice was checked with Node 26.7.0 on Linux. The manifest pins React 19.3.1, TypeScript 5.9.3, TanStack Start 1.169.2 and Router 1.170.44. The lockfile pins transitive packages.

```sh
npm install --global pnpm@11.24.0
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` uses Vite's development server. To inspect production files:

```sh
pnpm build
pnpm preview
```

Open <http://127.0.0.1:4173>. The preview serves `dist/client` and rewrites missing paths to its generated `/_shell.html`. It runs a static Node file server. The generated `dist/server` is used by Start during prerendering and is not part of the Hosting directory. The build itself needs permission to open a temporary local prerender server.

The chooser starts in Arabic. Choose English explicitly to persist it independently of the tab's identity. Sign-in is passwordless and fictional. Sessions last fifteen minutes of inactivity and survive refresh while valid. Other tabs share committed data and language, with independent identities.

## Check

```sh
pnpm typecheck
pnpm lint
pnpm test                       # Pure domain
pnpm test:browser:api           # Public demo interface with actual IndexedDB in Chrome
pnpm build
pnpm test:browser               # Production static screens, Chrome / Firefox / WebKit
```

Install ordinary Google Chrome and the pinned Playwright Firefox and WebKit binaries. On a Playwright-supported Linux distribution:

```sh
pnpm exec playwright install --with-deps firefox webkit
```

Chrome tests use the installed `chrome` channel. Firefox and WebKit use Playwright's patched binaries. Responsive checks emulate CSS viewports, not physical devices. Read [slice 01 evidence](docs/implementation/01-evidence.md) for the actual tested versions and host arrangement.

The API harness runs only on a separate Vite test server at `/tests/browser/api.html`. It imports the same public module as the screens. It does not ship in the static build. API and screen reports use separate artifact directories so independent runs cannot erase each other's traces. Failures retain traces and screenshots under `test-results/`; the screen HTML report is under `playwright-report/`.

Install Firebase CLI 15.30.0 to reproduce the Hosting checks:

```sh
npm install --global firebase-tools@15.30.0
pnpm build
RIFD_HOSTING=1 pnpm test:browser
```

The emulator uses the local `demo-rifd` project identifier and the committed `firebase.json`. It serves only `dist/client`, preserves actual assets before the fallback, and runs without a Start runtime server. `pnpm emulators` starts it for manual inspection. No Firebase project has been provisioned or deployed. The SPA setup follows [Start's SPA guide](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode); the inspected output determines the [Hosting fallback](https://firebase.google.com/docs/hosting/full-config).

## Explore

| Path | Current behavior |
| --- | --- |
| `/`, `/sign-in` | Neutral startup followed by identity home or chooser |
| `/products` | Public fictional product comparison |
| `/applications` | Current applicant's saved applications |
| `/applications/RIFD-2026-001` | Mariam's saved incomplete draft |
| `/applications/RIFD-2026-004` | Huda's submitted correction baseline and separate private saved response |
| `/staff/applications` | Salma's twelve-record read queue |
| `/staff/applications/RIFD-2026-005` | Historical approval, internal review and frozen repayment data |
| Other paths or unauthorized records | Neutral unavailable result with safe navigation |

An unsigned supported protected link resumes after sign-in only if the chosen identity can read it. Other choices open the selected identity's home. A forbidden destination exposes no application details. Intentional identity switching opens the new identity's home. Applicant documents display saved presence; staff document assessments and notes remain separate. Every record view is read-only in this slice.

## Data and architecture

See [architecture and seed contract](docs/implementation/architecture.md). Browser startup creates all thirteen canonical applications, identities, histories, correction baselines and unchanged private workspaces, notifications, files, sample variants, frozen repayment and Arabic preferences in one IndexedDB transaction. It validates existing schema, shapes, references and SHA-256 bytes before readiness. Missing or damaged data offers retry and stays preserved. Confirmed recovery/reset UI belongs to tickets 17 and 18.

A new browser profile or isolated Playwright context starts a fresh demo. For development, clearing this origin's site data in browser settings removes its saved dataset and sessions; the next startup seeds it again. The domain date is fixed at 2026-10-14. Session timing uses elapsed real time.

Local Noto Sans and Noto Sans Arabic fonts come from the archived Guided A evidence. The matching [Noto Sans OFL](public/fonts/OFL-NotoSans.txt) and [Noto Sans Arabic OFL](public/fonts/OFL-NotoSansArabic.txt) licenses accompany the unchanged font bytes. The prototype's [original license bundle](public/fonts/LICENSE.txt) is also preserved. Seed documents visibly identify their contents as DEMO / تجريبي. These are invented people, evidence, terms and outcomes. No application reaches a bank and no payment is processed.
