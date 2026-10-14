# Choose the bilingual visual direction

Type: prototype
Labels: wayfinder:prototype
Status: resolved
Parent: [Plan the financing application and review platform](../map.md)
Blocked by: none

## Question

Which original portfolio identity and visual direction make the financing application clear in Arabic and English for mobile applicants and desktop reviewers?

Use the confirmed brief: Arabic initially, explicit language switching, mobile applicant screens, desktop staff screens, and responsive behavior for both roles. Compare a small set of distinct rough UI directions using representative application, queue, and review content from [Define application states and correction rules](01-application-states-and-corrections.md#answer) and [Define fictional products and application requirements](02-products-and-application-requirements.md#answer). Use their bilingual product labels, document requirements, amounts, dates, and sample scenarios.

The human should be able to compare typography, Arabic line length, spacing, navigation, table density, status presentation, document actions, and the clarity of the portfolio-demo identity. Include enough RTL and LTR content to judge mixed-direction names, identifiers, amounts, dates, and controls. Show focus and validation treatments in representative components.

Resolve the choice through the user's reaction to the prototype. Record the chosen direction, the reasons, and the remaining limitations. Link the throwaway asset from the resolution; detailed screen behavior belongs in [Validate applicant and staff screen flows](06-applicant-and-staff-screen-flows.md).

## Comments

### Visual comparison prepared on 2026-10-14

Claimed for Mohammed Najib's visual-direction session. The [archived throwaway prototype and run instructions](/tmp/project-impress-bank-bilingual-visual-direction/.scratch/financing-application-and-review/prototypes/bilingual-visual-direction/README.md) provide three directions on one route, selected by `?variant=A`, `B`, or `C`. The floating bar also switches among the application, correction, queue, review, and component scenes. Arabic is the default, with an explicit English switch and responsive layouts for both roles.

- Guided / خطوة بخطوة uses spacious form sections, a summary beside the form, and a familiar staff sidebar.
- Ledger / دفتر واضح uses chapter navigation, larger Arabic headings, a grouped queue, and a document-first review layout.
- Workbench / مساحة عمل uses compact queue rows and adjacent document-list, preview, and checklist panels.

The proposed portfolio identity is رِفد / RIFD. The sample records follow the resolved product, workflow, access, and browser-state contracts. Reference identifiers are visual placeholders. No live financing, saved application data, or review decisions are created.

The user was asked to choose or combine directions and react to the proposed identity. The ticket remained claimed pending that exchange.

### Direction accepted on 2026-10-14

The user replied, "I accept A". No combination with B or C was requested. Retain the رِفد / RIFD identity shown in A as part of the selected design; the user did not give a separate naming rationale.

## Answer

Resolved on 2026-10-14. Use **A, Guided / خطوة بخطوة**, as the shared visual direction for applicants and reviewers. The user's explicit selection settles the comparison. Its design tradeoff is spacious grouping and familiar navigation, with more vertical scrolling than the denser Workbench alternative. No further personal rationale was supplied by the user.

### Chosen visual baseline

| Area | Direction to carry forward |
| --- | --- |
| Portfolio identity | رِفد / RIFD with the simple ascending three-bar mark shown in A. Keep the visible notice identifying the identity, products, people, and financing as fictional portfolio content. |
| Typography | Noto Sans Arabic and Noto Sans for the interface, with clear heading weight and comfortable Arabic line spacing. Preserve local font availability and the bundled license. |
| Color and shape | Teal primary actions, pale green summaries, white panels on a light neutral background, dark text, muted borders, and rounded controls and panels. Prototype references include accent `#0b6458`, page `#f5f7f4`, summary `#e4efea`, text `#192f2c`, and a 15px panel radius. Refine exact sizes and tokens during screen validation without reopening the overall direction. |
| Applicant layout | A restrained header, horizontal step indicator, spacious form sections, and a financing summary beside the form on wide screens. Stack content on narrow screens. Keep requested corrections explicit and separate from unchanged information. |
| Staff layout | A labelled sidebar, queue counts and filters above a readable table, and application information and documents beside the review checklist and internal notes. Document previews open in a focused dialog. |
| Responsive layouts | Convert the staff table into stacked application records at narrow widths. Move staff navigation into a compact horizontal layout. Stack review content and keep applicant controls usable on small screens. |
| Status and document treatments | Use written status labels with restrained color. Keep application status distinct from document review status. Applicant document displays show presence or preparation information without exposing staff assessments. |
| Arabic and English | Arabic initially, explicit language switching, mirrored layout using logical start and end, preserved entered names and text, Western display digits, Gregorian dates, and translated currency labels. Isolate identifiers, phones, filenames, and numeric fractions so mixed-direction content remains legible. |
| Focus and validation | Visible focus outlines, associated field labels and error descriptions, a linked validation summary, focus on the relevant invalid field, and a dismissible preview dialog. Error text accompanies the red treatment. |

The same visual language applies across both roles. This choice does not adopt B's chapter and ledger structure or C's three-panel review layout. Domain terms and workflow rules remain those of the resolved prerequisite tickets; no glossary term changed.

### Preserved primary source

The full comparison, including A, B, C, local fonts, and run instructions, is committed on local throwaway branch `prototype/bilingual-visual-direction` at `37e6dbaf98d6f7084c5ebe14f08336689238f3af`. The prototype directory in that commit is `.scratch/financing-application-and-review/prototypes/bilingual-visual-direction`.

- [Read the archived prototype guide](/tmp/project-impress-bank-bilingual-visual-direction/.scratch/financing-application-and-review/prototypes/bilingual-visual-direction/README.md).
- [Open A's Arabic application scene](http://127.0.0.1:4175/?variant=A&screen=form&lang=ar) while the local preview server is running.
- [Open A's staff review scene](http://127.0.0.1:4175/?variant=A&screen=review&lang=ar).

The temporary worktree is a convenience; the Git commit preserves the evidence if that directory is removed. Recreate a readable checkout from the repository root with:

```sh
git worktree add --detach /tmp/rifd-visual-direction-evidence 37e6dbaf98d6f7084c5ebe14f08336689238f3af
```

Run the guide's one-command server from that checkout. Do not merge this throwaway branch into main or promote its code directly into the application. Main retains the decision and its evidence pointer.

### Evidence and limits

The comparison was inspected in Chromium at 390px for applicant layouts and 1440px for staff layouts. All five scenes in all three directions also rendered at 360px in Arabic and English without page-wide horizontal overflow or runtime exceptions. Checks covered validation focus, preservation of entered text when changing language or direction, arrow-key editing, queue filtering, document previews, Escape dismissal, and visible keyboard focus. These checks support the visual choice, not complete accessibility or workflow acceptance.

The prototype uses in-memory inputs and HTML document examples. It does not implement persistence, authentication, file handling, complete field validation, lifecycle transitions, or real financing. Reference identifiers are illustrative. The choice supplies a visual baseline, not a final route map or production component contract.

[Validate applicant and staff screen flows](06-applicant-and-staff-screen-flows.md) is now unblocked and owns the complete journeys, navigation, save and upload feedback, recovery states, focus behavior, print layout, and full bilingual interaction checks. The existing prototype fog remains until that walkthrough exposes a concrete new decision. No new ticket is needed from this visual selection, and this session resolves only this ticket.
