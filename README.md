# RIFD / رِفد

A fictional, Arabic-first financing demo that saves records and evidence in the browser. The first six slices provide the complete seeded dataset, product comparison, [five-step saveable drafts](.scratch/financing-application-and-review-implementation/issues/03-compare-products-and-complete-drafts.md), session recovery, tab synchronization, conflict recovery, and [submission with public history](.scratch/financing-application-and-review-implementation/issues/06-submit-and-track-applications.md) in Arabic and English.

Mariam, Huda and Omar can read their own applications. Salma can read all submitted applications, including colleague assignments. Khaled is a simulated colleague and cannot sign in. Applicants can create drafts, edit all personal, business and financing fields, switch products, prepare four supporting documents, review completeness and submit. Submission opens read-only detail with a reference, immediate confirmation and public history. Authorized viewers can preview saved evidence. Notifications UI, queue controls and review actions belong to later tickets.

## Run

Use Node 22.12 or newer and pnpm 11.24.0. This slice was checked with Node 26.7.0 on Linux. The manifest pins React 19.3.1, TypeScript 5.9.3, TanStack Start 1.169.2, Router 1.170.44 and Tailwind CSS 4.3.3. The lockfile pins transitive packages.

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

A duplicated tab or one opened from another demo tab may inherit its initial identity. Its subsequent activity, identity changes, sign-out and expiry stay independent. The current identity remains visible in the header.

## Styling

Tailwind CSS 4.3.3 compiles through `@tailwindcss/vite` in both the application and the separate browser API harness. The root route links the compiled `src/ui/styles.css` through its existing `?url` import. No Tailwind browser runtime or CDN is used. Tailwind's [browser requirements](https://tailwindcss.com/docs/upgrade-guide#browser-requirements) are Chrome 111+, Firefox 128+ and Safari 16.4+; the documented current Chrome/Firefox targets remain the acceptance scope.

`src/ui/styles.css` defines the Guided A colors and local Noto font stacks with `@theme`. Its spacing unit is 4px, preserving pixel dimensions with the existing 15px root font size. Use named colors and logical spacing such as `ms-*`, `me-*` and `ps-*` for both directions. Preserve exact nonstandard sizes with arbitrary values instead of substituting the default type or spacing scale.

The `compact:` variant applies through 1199px and `narrow:` through 767px, inclusive. Declare compact before narrow so narrow overrides apply where both match. Default breakpoint variants are disabled. JSX utilities own individual layouts; shared skins and descendant rules use `@apply` in the components layer, which utilities can override.

Preflight is omitted to preserve existing headings, lists and native controls. Base styles, keyboard focus and dialog backdrops remain explicit. Include `border-solid` with border utilities; for a border on one edge, also include `border-0` before that edge utility to clear browser-default widths on other edges.

Source detection is limited to `src` by the utilities import's `source('../')`. Keep complete utility names in source, including finite status-class maps. Add an explicit source only when production UI lives outside this directory. Follow Tailwind's [class detection guidance](https://tailwindcss.com/docs/detecting-classes-in-source-files) for variants. Keep any necessary complex CSS in the existing layers and avoid an additional reset.

See [migration verification](docs/implementation/tailwind-v4.md) for the baseline, visual comparison and checks. Later feature and acceptance tickets extend those checks; their statuses remain unchanged.

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
| `/applications/new?product=equipment` | Explicit new-or-resume choice, then a new unsaved Equipment draft |
| `/applications/RIFD-2026-001/edit?step=personal` | Mariam's five-step saved incomplete draft |
| `/applications/RIFD-2026-004` | Huda's submitted correction baseline and separate private saved response |
| `/staff/applications` | Salma's twelve-record read queue |
| `/staff/applications/RIFD-2026-005` | Historical approval, internal review and frozen repayment data |
| Other paths or unauthorized records | Neutral unavailable result with safe navigation |

An unsigned supported protected link resumes after sign-in only if the chosen identity can read it. Other choices open the selected identity's home. A forbidden destination exposes no application details. Intentional identity switching opens the new identity's home. Applicant documents display saved presence; staff document assessments and notes remain separate.

Choose a product, sign in as an applicant and explicitly start a new application or resume a saved draft. The steps are Personal, Business, Financing, Documents and Review; incomplete steps remain reachable and invalid step queries fall back to Personal. Enter even incomplete or invalid values, then select prepared samples or local fictional PDF, JPEG or PNG files for the four requirements. New applications and a switched product's fourth slot generate fictional samples from the current input. Other sample choices retain the canonical seed evidence.

Review checks format and document completeness separately from substantive review criteria. Switching products confirms removal of a supplied fourth document, stages removal until saving, and preserves shared information and invalid amount/term values.

On Review, Submit application validates the complete current form and all four documents. Pending or failed selections require retry or explicit discard, even when an older file is saved. Successful submission publishes the form and files together, opens read-only detail, and adds one history entry with no notification. It freezes the demo submission date and financial evidence months. Own applications shows each record's status and permitted next action. Submission failures retain input and ready files for explicit retry.

Preparation reports progress and Ready to save. Save progress commits the captured raw input and ready bytes together. Refresh restores saved input and actual evidence; it discards unfinished edits and unsaved selections. Saved file previews include open/download alternatives. A failed replacement preserves the old saved file.

The draft's Demo controls panel sets normal or slow timing and one next-upload, next-save, next-submission or next-application-storage-write failure. Controls belong to the current tab and reset on refresh. Retry failed preparation without reselecting, or retry failed saving/submission without preparing again. An uncertain result requires Inspect save outcome or Inspect submission outcome before retry. Another tab's conflicting save requires inspection and explicit reapplication. In-app departure offers Stay, Discard changes or Save and leave; pending work must finish and failed selections must be completed or discarded before saving and leaving.

Committed notices and tab activation refresh clean screens from authorized storage. A newer saved draft preserves dirty raw input and prepared files, disables saving, and offers Inspect latest draft followed by Reapply my edits. A competing language save retains the intended language and requires Inspect latest saved preference before Reapply my preference. Each reapplication captures the inspected revision and uses a new intent; a further competing save requires inspection again. Discard my choice dismisses a refused language change. Missed notices are recovered on activation, and a failed notice cannot duplicate or misreport a committed save.

The header's Expire session control interrupts the current session immediately. Fifteen minutes without pointer or keyboard interaction does the same; mouse movement, completed requests and other tabs' activity do not renew it. Protected screens and previews close, and the tab retains unfinished input privately. Choose the same identity to inspect current access and return to the previous permitted screen, including after visiting public products. If editing has ended, recovery opens the current read-only record without applying the retained input. Choose another identity only after explicitly discarding unfinished work. Recovery never saves or retries an action automatically. A save interrupted before its outcome was observed requires Inspect save outcome; a save that committed before expiry remains saved. Refresh still removes unsaved tab-memory work.

## Data and architecture

See [architecture and seed contract](docs/implementation/architecture.md) and [submission evidence](docs/implementation/06-evidence.md). Browser startup creates all thirteen canonical applications, identities, histories, correction baselines and unchanged private workspaces, notifications, files, sample variants, frozen repayment and Arabic preferences in one IndexedDB transaction. It validates existing schema, shapes, references and SHA-256 bytes before readiness. Missing or damaged data offers retry and stays preserved. Confirmed recovery/reset UI belongs to tickets 17 and 18.

A new browser profile or isolated Playwright context starts a fresh demo. For development, clearing this origin's site data in browser settings removes its saved dataset and sessions; the next startup seeds it again. The domain date is fixed at 2026-10-14. Session timing uses elapsed real time.

Local Noto Sans and Noto Sans Arabic fonts come from the archived Guided A evidence. The matching [Noto Sans OFL](public/fonts/OFL-NotoSans.txt) and [Noto Sans Arabic OFL](public/fonts/OFL-NotoSansArabic.txt) licenses accompany the unchanged font bytes. The prototype's [original license bundle](public/fonts/LICENSE.txt) is also preserved. Seed documents visibly identify their contents as DEMO / تجريبي. These are invented people, evidence, terms and outcomes. No application reaches a bank and no payment is processed.
