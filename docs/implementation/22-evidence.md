# Performance and static delivery gates

Issue 22 passed the performance and static delivery gates. All 24 Lighthouse runs
passed, with route/language medians of 94-99 and CLS zero throughout. The final
delivery matrix passed in Chrome, Firefox and WebKit.

## Changes under measurement

The first diagnostic product audit scored 35 with CLS 0.14 and 25.6 seconds of
blocking time. JPEG-backed PDF pages removed the PNG decoding/recompression
cost. A small image-only PDF writer then removed the general editor from the
production bundle. The independent `pdf-lib` parser checks both saved PDF types
after reload, including their two 500 by 660 point pages. I also rendered all four
saved pages with Poppler and inspected their bilingual text, boundaries and
footers. The generated pages remain readable with no clipping or missing glyphs.

The body now contains the startup panel's margin instead of moving when that
panel disappears. Language selection displays the new choice after its
preference operation commits. The saved language and direction now apply before
the first workspace paint. A successful language command flushes that committed
context into React immediately, before background context reads can delay its
frame. It does not display an uncommitted preference.
Route-heading focus preserves the router's scroll position.

The static shell contained two neutral startup panels because both App and the
child-route pending component rendered one. Child pending content is now empty;
App owns the visible startup panel. The staff grid aligns its rows at the start
instead of stretching its temporary loading rows. Queue counts reserve their
space while loading, and URL canonicalization no longer repeats an unchanged
queue read. These fixes brought the queue diagnostic to 96 Arabic and 95 English
with CLS zero in both languages.

The first full regression run passed all 159 API cases, then exposed three screen
failures from an attempted optimistic language preview. The preview could display
English before saving it and allowed a keyboard activation during its busy state.
That change was removed. The final regression and performance runs below use the
committed preference before changing the screen language.

Both local font faces use WOFF2 and are preloaded. Font preparation loads the
actual faces and rejects resource failures; it reuses the stylesheet's requests.
The Arabic face retains all original glyphs. The Latin face retains U+0000-024F,
U+1E00-1EFF, U+2000-206F, U+20A0-20CF, U+2190-2194 and U+2212, including shaping
features and hinting. Other scripts use the browser's fallback fonts. The OFL
notices remain in `public/fonts`.

Font conversion used fontTools 4.60.1 and system woff2 1.0.2. The original TTFs
are retained in Git at `665f6d90e230cad30b435d4650ad5471093ecdf9`. The Latin
subset command used `--unicodes` with the ranges above, `--layout-features='*'`
and `--notdef-outline`, then `woff2_compress`. Arabic used only
`woff2_compress`. These operations follow the [fontTools subset interface](https://fonttools.readthedocs.io/en/latest/subset/index.html).

Seed preparation reuses identical rendered evidence within that preparation.
File IDs and ownership stay separate, and every required sample is durable
before Ready. Canvas work and startup hash checks yield in short batches, as
described by the [browser task scheduling guidance](https://developer.chrome.com/blog/use-scheduler-yield).
Complete dataset validation uses Zod's public `jitless` parse option. This avoids
the cold schema-compilation spike without removing any check. Read-only storage
decoding, validation and startup hash checks yield between batches so their work
does not accumulate into one blocking task. Mock delays remain
400 ms for normal requests, 1,500 ms for slow requests and 4,000 ms for slow
preparation, in addition to actual work.

The [first final matrix](../../artifacts/performance/22/2026-10-16T19-39-56.954Z/run.json)
exposed intermittent English first-visit failures. A
measured language write took 528 ms; one trace showed the completed transaction
near 455 ms and React's next render near 537 ms. The required oversized boundary
sample contributed 5,000,001 zero bytes to every full-dataset write. Storage now
losslessly encodes large all-zero buffers as bounded `rifd-zero-v1` descriptors.
It checks every word and trailing byte before encoding, then reconstructs real
ArrayBuffers before shape validation, operation callbacks and startup hashes.
Normal writes and reset use the same encoder. Raw legacy buffers remain valid;
malformed descriptors require recovery. The new API test went red before this
format was implemented and then passed exact bytes/hashes, a nonzero final byte,
reload, offline reads, reset/replay and damaged descriptors. Compression reduced
copying; the [compression-only probe](../../artifacts/performance/22/2026-10-16T19-52-10.825Z/run.json)
still failed CLS. The committed-context flush resolved the remaining render delay.

## Protocol and retained evidence

`pnpm test:performance` rebuilds production output before measuring. The runner
uses Lighthouse 13.5.0, Puppeteer 25.9.0, the default mobile simulated Slow 4G/4x
CPU configuration and installed Google Chrome. Actual host, dependency, browser,
viewport and throttling settings accompany each report. All final audits run
sequentially with other test/build/audit jobs stopped.

Each public products run starts with empty application storage. An English
first visit selects English through a native pointer action within the measured
navigation. Each protected run independently prepares seeds, selects the intended
language and identity, and preserves that exact tab for the audited hard
navigation. Storage reset stays disabled. CDP clears the HTTP disk cache and
toggles cache disabling to clear memory cache separately. Network logs reject
cached first requests. This follows the [accepted Lighthouse user-flow API](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md).

Every callback waits for the real workspace marker, expected heading, route,
identity, language, settled busy states and two animation frames. Chooser,
expired, recovery and wrong-screen reports are refused. Each run retains JSON,
HTML, trace, network log and screenshot. Fresh startup and resource timings are
separate from prepared-session scores. Diagnostic probes are incomplete matrices
and never establish a gate pass, including probes affected by concurrent work.

Pending-feedback checks use a 390 by 950 CSS-pixel viewport and centered trigger.
They measure the input event to the animation frame after visible busy/progress
feedback, retaining timing JSON, screenshots and interaction traces. Intentional
completion delays remain outside the feedback interval. Correction-picker checks
retain frame geometry and Layout Shift entries during initial loading and
same-identity recovery in both languages at 390 and 1440 pixels.

I inspected the retained slice 20 Firefox Retry preparation and WebKit Demo
controls traces, including their action records and captured frames. The picker
appeared while those pointer actions were in progress. The current picker keeps
its label on a separate line and reserves the select/button row while samples
load. The new checks measure that row through initial loading and recovery. An
early gate also caught the footer moving as the correction editor grew; the
workspace now reserves a viewport of height while loading. The final gate reruns
both geometry and CLS measurements and retains its interaction traces.

The static suite uses only `dist/client` in the Firebase Hosting emulator with
`/_shell.html` fallback. Its bilingual matrix covers public products/gallery,
root/reset/unavailable paths, applicant list/edit/correction/history/print/
repayment and staff queue/review/request/decision/print/repayment. It repeats
direct entries and refreshes, verifies permitted sign-in return, wrong-identity
fallback, invalid steps, stale rounds, nonapproved repayment, query preservation,
language restoration, neutral startup, asset MIME and harness exclusion.

The [passing Tailwind source canaries](../../artifacts/acceptance/22/postfix-2026-10-16T20-00-37.880Z/css-sources.log)
verify production inclusion and exclusion of both documentation and `.scratch`
prototypes. The checker removes its probes and
rebuilds clean output. Static inventory records raw/gzip JavaScript, compiled
Tailwind CSS and font sizes with every file's SHA-256.

## Final results

Before the final storage encoding and committed-render scheduling fixes, the
[complete acceptance run](../../artifacts/acceptance/22/2026-10-16T18-32-29.199Z/run.json)
passed all nine command steps. Typecheck, lint, package guidance checks and the
production build passed, alongside 105 domain tests, 11 package-skill tests,
159 browser API tests and 564 screen tests. Each of Chrome, Firefox and WebKit
passed 188 screen cases. The dedicated delivery suite passed 30 cases; its 12
expected skips reserve timing and Layout Shift API measurements for Chrome.
All three browser engines ran the static matrix. There were no flaky results.

The run used Playwright 1.64.1, installed Chrome 155.0.8059.39, bundled Firefox
157.0 and WebKit 27.2. The host's [WebKit launcher](../../artifacts/acceptance/22/2026-10-16T18-32-29.199Z/webkit-launcher.sh)
is retained with the report. This records the tested engines and platform; it
does not establish branded Safari or physical-device support.

After the final storage and render fixes, the
[final affected acceptance run](../../artifacts/acceptance/22/postfix-2026-10-16T20-00-37.880Z/run.json)
passed all nine command steps against the final performance source fingerprint.
Typecheck, lint, 105 domain tests, 11 package-skill tests, guidance checks and
the production build passed again. All 165 API cases and 180 affected screen
cases passed, with 60 screen cases per browser. Those cases cover startup and
resource recovery, language persistence/focus/caret, preference conflicts,
identity selection, offline saved previews, cross-tab updates and reset.
The complete delivery matrix passed 30 cases with 12 expected skips of Chrome-only
measurements. It took 10.8 minutes. There were no flaky results.

The final [feedback and layout measurements](../../artifacts/acceptance/22/postfix-2026-10-16T20-00-37.880Z/delivery/measurements.json)
passed the 100 ms feedback limit. Values below are input-to-paint upper bounds
in milliseconds.

| Action | Arabic | English |
| --- | ---: | ---: |
| Save | 24.8 | 24.5 |
| Upload | 25.4 | 28.2 |
| Submission | 25.1 | 28.7 |
| Decision | 26.6 | 26.8 |

Correction-picker CLS was zero during initial loading and same-identity recovery
in both languages at both widths. Its height and button horizontal position each
changed by zero pixels across those captured frames. Interaction traces, pending
screenshots and frame/shift data remain with the delivery results. The baseline's
34 regenerated captures and final affected run's 18 regenerated captures are
retained under their respective `screens/captures` directories. Earlier slices'
tracked images were restored.

The [final Lighthouse matrix](../../artifacts/performance/22/2026-10-16T19-56-49.594Z/run.json)
passed all 24 runs with CLS zero throughout. Medians were:

| Route | Arabic | English |
| --- | ---: | ---: |
| `/products` | 96 | 95 |
| `/applications` | 96 | 96 |
| `/staff/applications` | 94 | 95 |
| `/staff/applications/RIFD-2026-007` | 99 | 96 |

The host was Linux x64, Intel i7-6820HQ at 2.70 GHz, eight logical CPUs and
16.65 GB memory. The report records Node 26.7.0, pnpm 11.24.0, Firebase CLI
15.30.0 and Chrome 155.0.8059.39. Raw observed startup markers were 1.57-1.78
seconds for fresh preparation before protected audits. Public startup markers
were 1.60-1.67 seconds. Complete public screens settled at 1.67-2.22 seconds,
including English selection; prepared protected screens settled at 1.13-1.20
seconds. These observed timings are separate from Lighthouse's simulated metrics.

| Production output | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
| JavaScript | 663,477 | 195,047 |
| Compiled Tailwind CSS | 23,929 | 5,240 |
| WOFF2 fonts | 134,568 | 134,398 |

All files and SHA-256 values accompany the static inventory. The final source
fingerprint is `b40ed3702f8c955998aaf4b38246930469a1cdbd47bbec6ba68357c0d8e1f8fd`.
The final API, affected UI and delivery reruns above use this same fingerprint.

A same-source acceptance rebuild changed only TanStack's serialized root route
`updatedAt` timestamp in `dist/client/_shell.html`. Every other static file hash
was identical. Both [shell versions and their comparison](../../artifacts/performance/22/2026-10-16T19-56-49.594Z/shell-equivalence.json)
are retained. The audited shell was recovered by matching its existing SHA-256
over the recorded build window, then restored as the final artifact. Its exact
hash is `72dd9c41ec5fe87d2b450ec8b40c3c010572dc8f121b1414c491a43ed9ebe359`.
The original reports remain unchanged. `pnpm verify:performance` then passed
against the current source and every static-file hash. This is timestamp-only
build nondeterminism; builds are not byte-for-byte reproducible.

The [release binding](../../artifacts/acceptance/22/release.json) records the
commit, source fingerprint and retained report paths. Keep the audited output
for release. `pnpm verify:performance` rejects later source or artifact changes;
rerun affected gates after later code changes.

## Review

The independent Standards and Spec reviews compared the staged implementation
with `665f6d90e230cad30b435d4650ad5471093ecdf9`. Both reviewers checked the final
startup, queue, language, yielding and cold-resource changes again. They also
reviewed the late storage encoding and committed-context flush with no new
findings. The final affected UI rerun covers language focus/caret, preference
conflicts and identity selection across all three browsers.

### Standards

The initial review found that a failed CSS FontFace could not be loaded again on
explicit Retry. Retry now replaces only the failed face, while the first failure
still refuses startup. Both existing font-failure and stylesheet-failure Retry
screen tests passed. The final review reported no remaining Standards findings.

### Spec

The initial review found that the performance runner rejected the queue's valid
canonical query. It now verifies all six expected query values as well as the
origin/path, both in the settled screen and Lighthouse result. The final review
reported no remaining Spec findings.

Remaining findings: Standards 0; Spec 0.
