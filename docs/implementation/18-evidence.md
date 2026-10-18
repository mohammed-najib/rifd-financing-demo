# Slice 18 implementation evidence

> Dated implementation record. For current setup and behavior, start with the [documentation index](../README.md). Test counts, release identifiers and operational decisions below apply to the work recorded here.

Implemented [Reset the browser-wide demo atomically](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review-implementation/issues/18-reset-demo-atomically.md)
against starting commit `241437daefaacdee18733b0d882feb30bab15662`.

## Confirmation and replacement

Reset is available from the header, the public `/demo/reset` route and startup
recovery. The Arabic and English dialog names applications, files, history,
notifications, receipts, preferences, sessions and unfinished work across every
demo tab in the browser profile. Opening the dialog preserves the mounted editor.
Cancel and a confirmed abort retain typed input and ready files.

`inspectReset` captures the current valid dataset identifier or issues an opaque
recovery token bound to the observed database version, store definitions, keys,
record values and opaque browser-value metadata. RIFD's recognized file buffers
compare exact bytes; legacy Blob/File observations compare their metadata. The
reset transaction checks that context again. Repairing damaged
records or replacing the dataset invalidates the earlier recovery confirmation.
A fresh inspection and confirmation are required before another replacement.

Fonts, sample files and their hashes finish preparation before mutation. One
transaction replaces the durable record with all thirteen canonical applications,
identities, histories, correction baselines and unchanged private workspaces,
notifications, files, catalog, frozen repayment and default preferences. The new
metadata contains a new dataset identifier and one minimal last-reset receipt.
Arabic, revision one, all queue filters and newest-first sorting are restored.

For an unsupported physical store layout, reset opens a version-change
transaction, rechecks the observation, rebuilds the store and writes the complete
seed and receipt inside that transaction. Aborting restores the original schema
and records. There is no database deletion. A refused blocked request aborts if
its upgrade becomes available later. Startup permits a higher physical version
only with the canonical store layout and a valid committed reset marker. This
uses IndexedDB's [upgrade transaction](https://w3c.github.io/IndexedDB/#upgrade-transaction)
and [upgrade rollback](https://w3c.github.io/IndexedDB/#abort-an-upgrade-transaction)
guarantees.

## Retry and tab invalidation

An exact match to the current metadata's reset identifier, original context and
confirmed intent returns the completed public outcome before resource preparation,
old-session checks or ordinary dataset checks. It carries no application data.
It neither replaces later work in that dataset nor consumes an armed failure.
Known receipt recognition validates the minimal receipt and current dataset UUID
independently of ordinary schema readiness. Unsupported metadata still refuses
startup and ordinary reads, even when its historical reset outcome is recognized.
Changed intent under the same identifier is refused. After a later reset, an
older superseded reset cannot erase the new dataset.

`inspectResetOperation` checks an uncertain outcome without applying a mutation.
The dialog requires this inspection after a lost completion event before offering
an explicit retry or accepting the completed outcome.

Only successful commit or observation of a new dataset clears prepared references,
new in-memory drafts, sessions, failure controls, retained editor buffers, cached
views, previews, dialogs and confirmations. Old delayed requests fail their
transactional dataset checks. Other tabs reread after a committed hint or
activation. A tab whose connection closed for schema rebuilding can adopt the
new committed reset through a validated read; an aborted upgrade preserves the
previous recovery behavior. Sign-in never replays an interrupted action.
An unmarked dataset replacement retains the existing `supersededDataset`
refusal until explicit startup recovery. Automatic adoption requires a valid
committed reset marker.

## Verification

Tests exercise the agreed public Demo interface against actual IndexedDB and
production browser screens. Fault fixtures operate at browser storage, timing and
resource interfaces. They add no product database-patching API.

Focused regressions cover cancel, injected write abort, successful retry, exact
restoration counts and unread notifications, immediate replay after disposal,
resource failure during replay, changed and superseded contexts, repaired
recovery data, schema rollback, blocked and denied access, resource preparation
failure, lost completion and receipt inspection, same-context tabs and delayed
old-dataset saves. Screen journeys cover retained text and ready files, public
recovery, uncertain outcomes and another tab's preview and unfinished work.

The complete 105-case pure-domain suite, both package-skill tests, typecheck,
lint, packaged-skill validation/source reviews, production build and local archive
verification pass. The focused startup/synchronization/reset interface run passes
all 33 cases. All twelve reset screen cases pass across Chrome, Firefox and WebKit.
The final legacy-value regression passes after the independent review fixes.
The full interface sweep also caught a compatibility regression. Context reads
adopted an unmarked new UUID instead of refusing it. The reset
marker guard restores explicit startup recovery for that case. Both reviewers
accepted the guard.

All 150 public-interface cases have passing results. The full sweep passed 146
cases in 19.5 minutes. The corrected unmarked-replacement case and three cases
interrupted by the development server reloading passed a four-case recheck.
All 414 unique production screen cases have passing results, 138 each in Chrome,
Firefox and WebKit. The first checkpoint passed 134 cases. The final 284-case
batch passed without failures in 46.7 minutes, covering the remaining 280 cases
and repeating all four Chrome reset cases against the final build. All twelve
reset screen cases passed against that build.

## Visual checks

The warning remains readable at 390 and 1440 CSS pixels in both directions,
without page-wide overflow. Inspected all four captures for readable warnings and controls.
These are emulated viewports.

- [Arabic at 390 pixels](evidence/18/reset-ar-390.png)
- [Arabic at 1440 pixels](evidence/18/reset-ar-1440.png)
- [English at 390 pixels](evidence/18/reset-en-390.png)
- [English at 1440 pixels](evidence/18/reset-en-1440.png)

## Standards review

The independent review found no documented-standard violations. Its one
maintainability finding, duplicated retained-buffer guards, is resolved by the
shared `rememberBuffer` helper. All four editor types use that helper.

## Spec review

The independent review found that the original recovery comparison refused
unchanged legacy typed arrays, Maps, files and other cloneable browser values.
The comparison now uses exact synchronous bytes for recognized buffers and
record/native metadata for opaque values. A public-interface regression covers
binary keys, Uint8Array, DataView, Map, Set, RegExp, Blob, File, Error and an
invalid Date. Both the original legacy-value failure and the invalid-date case
were reproduced before their fixes and pass afterward.

A second review finding required exact known receipt recognition to precede the
ordinary metadata-version gate. Its regression changes the current schema metadata
to an unsupported version, disables resource generation and retries the exact
completed reset. Startup remains unsupported while the public outcome is recognized.
The original refusal was reproduced before narrowing the receipt parser.

Review counts: Standards one heuristic resolved, zero open; Spec two findings resolved, zero open.

## Reproduction

Verified on Omarchy Linux x86_64 with Node 26.7.0, Playwright 1.64.1, installed
Chrome 155.0.8059.39, pinned Firefox 157.0 and WebKit 27.2. WebKit uses the compatible
launcher documented in [slice 01](01-evidence.md). The production build retains
its existing large-client-chunk warning.

```sh
pnpm typecheck
pnpm lint
pnpm skills:check
pnpm test
pnpm test:skills
pnpm pack:domain
pnpm build
pnpm test:browser:api --workers=3 --timeout=120000
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh pnpm test:browser --workers=3 --timeout=120000
```

Keep at most three browser workers active on this host. An initial batch with
four competing workers delayed neutral startup beyond existing 30-second
readiness assertions. The final interface and screen sweeps run separately with
three workers. The first screen checkpoint passed 134 cases using two workers.
The remaining 280 cases and four Chrome reset rechecks used the final build with
`--test-list /tmp/rifd-18-remaining-screens.txt`. The final HTML report is at
`/tmp/rifd-18-screen-phase2-report`; unique-case coverage was checked against the
complete test list and recorded in `/tmp/rifd-18-coverage.json`.
The focused final interface log is `/tmp/rifd-18-focused-api.log`; the focused
cross-browser reset log is `/tmp/rifd-18-reset-screens-verified.log`. Complete
sweep logs are `/tmp/rifd-18-full-api.log`, `/tmp/rifd-18-api-rechecks.log`,
`/tmp/rifd-18-screen-phase1.log` and `/tmp/rifd-18-screen-phase2.log`.
Other checks are recorded in `/tmp/rifd-18-full-domain.log`,
`/tmp/rifd-18-skills.log`, `/tmp/rifd-18-pack.log` and `/tmp/rifd-18-build.log`.
