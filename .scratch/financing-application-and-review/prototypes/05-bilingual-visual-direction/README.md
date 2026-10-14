# PROTOTYPE — bilingual visual direction (throwaway)

Ticket: [Choose the bilingual visual direction](../../issues/05-bilingual-visual-direction.md)
Question: which original portfolio identity and visual direction make the financing application clear in Arabic and English for mobile applicants and desktop reviewers?

Three radically different visual directions render the same nine screens from the same agreed domain content. Nothing here persists, mutates, or ships. The winning direction is folded into the real design system later; this code is thrown away.

## Run it

```bash
cd .scratch/financing-application-and-review/prototypes/05-bilingual-visual-direction
python3 -m http.server 5173
```

Open http://localhost:5173/ — it starts on variant A, Arabic, applicant screens.

Any static server works (`npx serve`, `php -S`). Opening `index.html` directly also works; the optional webfonts and the `?variant=` param both survive `file://`.

## Controls

The dark pill at the bottom centre is the prototype switcher, not part of any design.

| Control | Effect |
| --- | --- |
| `←` / `→` (pill arrows or keyboard) | Cycle variant A → B → C |
| Screen dropdown, or `shift` + `←` / `→` | Cycle the nine screens |
| Language button | Arabic ⇄ English, whole interface including direction |
| `390` / `760` / `1280` / `full` | Viewport width. Applicant screens default to 390, staff screens to 1280, so force the other to judge responsive behaviour |
| `Esc` | Close any dialog or sheet |

Every control writes to the URL, so a view is shareable and reload-stable:
`http://localhost:5173/?variant=C&screen=queue&lang=ar&width=1280`

## The three directions

| | A — السجلّ / Ledger | B — البطاقات / Cards | C — المنصّة / Console |
| --- | --- | --- | --- |
| Claim | A financing application is a document. Calm, typographic, public-service | A financing application is a set of tasks on a phone. Bold, coloured, thumb-first | Review is data work. Dense, keyboard-first, pro tool |
| Arabic type | Amiri / Noto Naskh headings, 2.05 line-height, 68ch prose measure | Cairo / Noto Kufi headings, IBM Plex Sans Arabic body, short card-width lines | IBM Plex Sans Arabic throughout, 1.72 line-height, 13.5px base |
| Latin and numerals | Noto Serif, Noto Sans Mono figures | Inter, IBM Plex Mono figures | IBM Plex Mono for every reference, amount, and date |
| Navigation | Masthead with underlined text tabs; left rail on staff screens | Sticky pill header, bottom tab bar, tabbed workspace | Dark app bar with breadcrumbs and `/` search; three-pane master-detail |
| Density | Hairline ledger rows, generous padding | Cards, 48px tap targets, no tables at all | 5px table rows, sticky uppercase headers, zebra striping |
| Status | Small dot + text label, muted palette | Filled rounded chips with icons | Square outlined tags with a 3px colour bar |
| Demo identity | One thin dark ribbon line | Full-width brand-colour banner | `MSR·DEMO` token plus a strip with reset and expire controls |
| Focus | 2px accent underline on fields, offset outline elsewhere | 3px soft indigo ring, 12px radius | 2px square ring with `outline-offset: 1px`, visible `kbd` hints |
| Validation | Errors summary block, red field border, `!` marker in a circle | Red banner card, pink field, badge `!` per error | Inline trailing `!`, red start-border message, error count in the sticky bar |

## Screens

Applicant, mobile-first: product comparison, application steps with the seeded Equipment-switch validation failures, required documents with a failed replacement upload, applications and notifications with history, correction workspace with baseline-versus-response, fictional repayment illustration.

Reviewer, desktop-first: twelve-record staff queue with filters, sorting, pagination, and assignment, review workspace with documents, five checks, correction verification, notes, and activity, corrections and decision states including the stale-record conflict.

Content comes from the resolved tickets: [application states and corrections](../../issues/01-application-states-and-corrections.md#answer), [products and application requirements](../../issues/02-products-and-application-requirements.md#answer), [demo access and reviewer assignment](../../issues/03-demo-access-and-reviewer-assignment.md#answer), [browser persistence and simulated failures](../../issues/04-browser-state-and-simulated-failures.md#answer). Amounts, dates, references, names, checks, and document slots are the agreed fixtures, not invented here.

## What to judge

1. Arabic line length and leading at each variant's chosen measure, especially in reasons, explanations, and checklist dependencies.
2. Mixed-direction runs: `MSR-26-103`, `+000000000002`, `1,200,000 ر.ي.`, `2026-10-14`, `stock-plan-unreadable-demo.jpg` inside Arabic sentences.
3. Whether status reads at a glance in a dense queue row and in a narrow mobile card.
4. Document actions: preview, replace, retry, accept, needs replacement with a reason.
5. Table density versus card layout for the twelve-record queue at 390px and 1280px.
6. Focus and validation clarity for keyboard use in both directions.
7. Whether the identity reads as an original portfolio piece rather than a bank clone, and whether the fictional-demo notice is unmistakable without dominating.
8. Staff desktop versus applicant mobile: does one direction serve both roles, or should the roles diverge?

Say which variant wins, or steal across them: "the header from C, the status chips from B, the ledger table from A" is the most useful answer.
