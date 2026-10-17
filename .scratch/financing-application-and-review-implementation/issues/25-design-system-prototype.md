# 25: Apply the selected linen design

The user selected Variant N after comparing layouts, Arabic fonts, corner radii,
custom dropdowns and supporting colors. N combines the Clarity layout, original
Noto Sans Arabic font, 8px cards, 4px controls, the compact checkmark menu and a
warm linen palette. The logo and primary actions retain `#0b6458`.

The complete comparison remains on `prototype/design-system-directions` at
`44fd5c9`. That branch is the primary source for all sixteen alternatives and
the user's selection. The production implementation is on
`feat/linen-design-system`, based on `main`, without the comparison switcher,
prototype modules or extra fonts.

The shared theme covers applicant and staff pages, forms, dialogs, statuses,
recovery states and the component gallery. The products page uses the chosen
hero, animated growth mark, product cards and journey. Its actions open the real
draft flow. The chosen product and term survive sign-in and seed a new draft;
saved drafts and retained work keep their own values.

`src/ui/select.tsx` supplies the compact dropdown throughout the website. It
preserves labels, validation descriptions, disabled states, keyboard navigation,
numeric and text typeahead, focus retention and dismissal. Menus use a portal
to avoid card clipping, choose available space above or below the field, and
scroll long lists. Reduced motion and forced colors have explicit styles.
The SVG tab icon is embedded so offline navigation does not retry an external
favicon request. Its linen background and original green match the site.

The site can be reviewed with `pnpm dev`, or built with `pnpm build` and served
with `pnpm preview`. A preview server must restart after a rebuild because it
loads the generated HTML shell at startup.

Validation passed: TypeScript, ESLint, 105 unit tests, the production build and
whitespace checks. All 191 Chrome browser scenarios passed across the initial
run and targeted reruns. The initial run passed 172 scenarios; the remaining 19
passed after updating heading expectations, embedding the offline favicon and
disabling trace recording to avoid the local artifact quota. The three shared
dropdown scenarios also passed in Firefox and WebKit.

Browser coverage includes Arabic and English layouts, narrow viewports,
keyboard interaction, product and term selection into a new draft, staff
filters, submission, corrections, review, repayment, printing and offline
recovery. Reports and local captures are in `/tmp/rifd-selected-n`. The existing
large JavaScript chunk build warning remains. No public deployment was made.

The `/components` page is now the canonical catalogue, with sixteen linked
sections covering identity and colors, buttons, card surfaces, financing cards,
all application fields, selection and upload controls, steps and pagination,
statuses, attachments, save feedback, queue views, notifications, repayment,
history, loading and dialogs. Gallery interactions use local example state.

Identity cards, product cards, queue counts, application steps, notification
cards, repayment schedules and preview content are shared with production
pages. The catalogue uses the existing field, select, attachment, status,
queue-row, history, repayment-summary and departure-dialog implementations.
Future visual changes belong in these shared implementations and styles.

Cards share border, shadow and timing rules. Nested cards avoid cumulative
movement. Native buttons and action links share primary and secondary states;
file buttons and disclosures have matching feedback. Disabled controls,
semantic error colors, reduced motion and print output retain explicit rules.

The expanded gallery passed eight Chrome browser tests and six targeted
Firefox/WebKit tests, alongside TypeScript, ESLint, 105 unit tests and the
production build. Reports are in `/tmp/rifd-canonical-gallery` and
`/tmp/rifd-canonical-crossbrowser`.

The site audit passed 46 page/language combinations spanning public pages,
applicant drafts and documents, corrections, staff review and decision pages,
repayment and print views. It inspected 334 card instances, 660 enabled action
instances, 20 disabled actions and 12 file controls, and checked each route at
390px for horizontal overflow. Its report and captures are in
`/tmp/rifd-site-interaction-audit`.
