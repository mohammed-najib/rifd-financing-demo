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
