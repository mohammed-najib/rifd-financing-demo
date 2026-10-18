# Slice 02 evidence

> Dated implementation record. For current setup and behavior, start with the [documentation index](../README.md). Test counts, release identifiers and operational decisions below apply to the work recorded here.

Implementation of [Save and restore a draft with a real attachment](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review-implementation/issues/02-save-and-restore-draft-with-attachment.md), against starting commit `17eb290c233119acfe6752b79ca64f4ca37836bf`.

Checked on 2026-10-14 on Omarchy Linux, x86_64, with the same pinned runtime, Playwright browsers and temporary WebKit compatibility launcher documented in [slice 01 evidence](01-evidence.md). Tests use installed stable Chrome and pinned Playwright Firefox/WebKit. They do not establish physical-device or branded Safari support.

## Implemented behavior

Mariam's seeded draft provides a raw purchase-explanation editor and product-specific stock-plan slot. Empty and invalid text saves unchanged. The sample picker and local PDF/JPEG/PNG selection use real preparation, deterministic progress and SHA-256 over actual bytes. Ready to save remains distinct from saved draft evidence. Saved information, bytes and previews restore after refresh.

The public `saveDraft` command captures its input before delay and commits workspace, file bytes and receipt in one IndexedDB transaction. Saves increment only the private workspace revision. Failure retains the previous saved file, prepared bytes and raw edits. An upload failure retains the selection for explicit retry; other progress can save with the previous document. Typing after Save begins survives and remains unsaved.

Receipts support exact replay after refresh, changed-intent refusal across operation kinds, and current permitted projections. An unknown result must be inspected before retry. Tests suppress a transaction completion observer while letting IndexedDB commit, then inspect the receipt and prove replay adds no revision. Subscriber/broadcast exceptions after commit cannot turn a save into failure. Storage failure aborts after a successful put request and leaves no file reference, receipt or workspace change.

Controls expose current-tab normal/slow timing and one armed next-upload, next-progress-save or next-application-write failure. Invalid envelopes, stale versions, wrong datasets, forged prepared references, preference writes and exact replay cannot consume an application-write failure. Normal retry succeeds without rearming.

Clean views reread shared commits. Dirty views retain their buffers and require latest-value inspection and explicit reapplication. Browser Back/Forward and links use the same Stay, Discard changes and Save and leave dialog. Pending preparation/saving blocks departure. Previews use authorized reads, disposable Blob URLs and open/download recovery for unreadable evidence. Local evidence and saving continue in an already-loaded offline demo.

## Verification

Focused tests ran through the accepted pure-domain, public demo interface and actual screen seams. The interface harness uses real IndexedDB and ships only on its separate Vite test server. Native transaction observation and post-commit messaging faults are injected at browser-system boundaries; tests do not assert private storage layouts.

The final suite commands are:

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:browser:api
pnpm build
RIFD_HOSTING=1 RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser
```

Final result: 82 tests passed, comprising 19 pure-domain tests, 18 real-browser interface tests in Chrome and 45 production screen checks across Chrome, Firefox and WebKit. The screen suite ran through Firebase Hosting's emulator with no Start runtime server. Typecheck, lint and the final static build passed. Vite retains the existing large-chunk warning from the bundled PDF and startup resources.

The suite includes zero/5,000,000/5,000,001-byte envelopes, extension/MIME mismatch and empty-MIME fallback; real inclusive-limit bytes after refresh; independent known SHA-256; prepared/saved distinctions; replacement rollback; retained selections/ready files; captured input; expired/switched authority; superseded selections; receipt replay; unknown inspection; post-commit observer failure; simultaneous private saves; both-language failures; native two-page PDF/download; unreadable JPEG recovery; local PNG; loaded offline preparation/save; clean/dirty tab updates; and history departure guards.

Visual inspection covers [Arabic saved progress at 390 CSS pixels](evidence/02/draft-saved-ar-390.png) and [English preview at 1440 pixels](evidence/02/draft-preview-en-1440.png), with overflow assertions at 360, 390, 768 and 1440 pixels. The inspected layout fits both directions, wraps filenames and keeps preview recovery actions accessible.

## Standards

No outstanding findings. The review found duplicated receipt lookup policy. A private helper now keeps execution and inspection aligned while callers retain authority and access checks.

## Spec

No outstanding findings. Review found that inspection after an intervening save could label an older buffer Saved, browser history could bypass the departure guard, and a dirty editor could retain an old preview after another tab replaced the saved file. Real-screen tests reproduced these defects before the fixes. Saved status now compares with the current returned projection; the router blocker covers history navigation; a changed current file closes the preview and revokes its URL while retaining input. Receipt inspection also updates the saved summary without relying on a missing commit hint.

Review totals: Standards 0 outstanding; Spec 0 outstanding.
