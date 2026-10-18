# Slice 23 Firebase Hosting release

> Dated implementation record. For current setup and behavior, start with the [documentation index](../README.md). Test counts, release identifiers and operational decisions below apply to the work recorded here.

The verified preview is live on the dedicated project's default site. All
required hosted checks have passing evidence after the explicit rechecks below.
The [release binding](evidence/23/release.json) records the final IDs, build,
application commit and results. This record completes
[issue 23](https://github.com/mohammed-najib/rifd-financing-demo/blob/3983386c06f5ab7db68003f07f08ae0a6717d9b7/.scratch/financing-application-and-review-implementation/issues/23-release-to-firebase-hosting.md).

## Release identity and build

| Item | Actual value |
| --- | --- |
| Firebase project and default classic Hosting site | `rifd-portfolio-mdnb` |
| Project number | `1060449933466` |
| Application release commit | `1352c140782168ce9e77773547e35658c19cff45` |
| Static build directory | `dist/client` |
| SPA fallback | `/_shell.html` |
| Preview channel | `rifd-review` |
| Preview URL | <https://rifd-portfolio-mdnb--rifd-review-0pctwjax.web.app> |
| Preview expires | 15 November 2026 at 20:32:46 UTC |
| Preview release | `1792182777711000` |
| Preview version | `ea1a7ab0ece6377e` |
| Live URL | <https://rifd-portfolio-mdnb.web.app> |
| Live release | `1792183590652000` |
| Live version | `ea1a7ab0ece6377e`, the accepted preview version |
| Live promotion | 16 October 2026 at 20:46:30 UTC |

Firebase CLI 15.30.0 used the existing signed-in account to create the new
dedicated project, confirm its default classic Hosting site and publish the
preview. No human-only prerequisite remained. The committed `.firebaserc`
selects this dedicated project. Deployment commands also pass the project ID
explicitly. The [deployment result](evidence/23/preview-deploy.json) and
[channel response](evidence/23/preview-channels.json) retain the actual Firebase
identifiers and expiration.
The [promotion result](evidence/23/live-promotion.json) and
[live channel response](evidence/23/live-channels.json) confirm that live serves
the same Hosting version. All eight [live static-file checks](evidence/23/live-assets.json)
match the accepted local output, with the expected MIME types and neutral shell.

The release uses the exact output accepted in [slice 22](22-evidence.md).
`pnpm verify:performance` passed before deployment and after the Hosting setup.
The source fingerprint remains
`b40ed3702f8c955998aaf4b38246930469a1cdbd47bbec6ba68357c0d8e1f8fd`.
The [verified build record](evidence/23/verified-build.json) retains every
static-file hash, the application commit, the accepted performance medians and
the prior acceptance report paths. Tailwind CSS 4.3.3, its Vite plugin 4.3.3 and
Vite 8.3.4 remain pinned in the manifest and lockfile.

No application code, dependencies, generated assets or Hosting rewrites changed
in this ticket. A rebuild would change TanStack's serialized prerender timestamp,
so this release preserves the audited output. The existing full acceptance and
performance evidence remains applicable. At the user's request, this ticket
runs focused hosted checks rather than repeating the long full acceptance suite.

## Hosted verification

The [hosted-check configuration](evidence/23/hosted-checks.mjs) reuses accepted
production-screen and delivery tests against an explicit HTTPS origin, with
three workers, zero retries, fresh browser contexts and retained traces. It
starts no local server and ships no test interface.

Its 22 selected cases per engine cover both languages, all required public and
protected route families, direct entry and refresh, chooser return destinations,
identity permissions, invalid-step and stale-round fallbacks, query restoration,
neutral startup, actual asset MIME types and absence of protected-data flashes.
The selected journeys also exercise new submission with validation and recovery
after a failed submission, saved evidence preview, notification persistence and
cross-tab
expiry, private correction resubmission and reviewer verification, queue claim
and review, a new rejection, approval with frozen repayment, and aborted and
successful reset. Print and repayment direct links are included.

`verify-hosted.mjs` independently compares every hosted static file with the
accepted SHA-256 inventory. It checks CSS, JavaScript and WOFF2 MIME types and
requires a protected deep link to return the exact neutral shell. The
[preview asset results](evidence/23/preview-assets.json) pass for all eight files.

The [accepted preview matrix](evidence/23/preview-accepted.json) binds all 66
unique cases to passing results. The [first run](evidence/23/preview-checks.json)
remains failed, with 60 passes and six Firefox failures. The screenshots show
browser-storage errors at startup or during preference and submission writes.
The unchanged cases passed explicit one-worker rechecks with browser profiles
on disk, [five cases](evidence/23/preview-firefox-recheck-checks.json) and the
[remaining English submission](evidence/23/preview-firefox-submission-recheck-checks.json).
No assertion, timeout or application code changed. The original run had three
workers and used the host's `/tmp` tmpfs, with about 1.7 GB free. Three short
[startup probes](evidence/23/storage-probe.json) also passed on that original
filesystem. The underlying browser storage error was not isolated, so the
evidence does not establish that disk capacity alone caused it.

Playwright 1.64.1 launched Chrome 155.0.8059.39, pinned Firefox 157.0 and WebKit
27.2. All checks used zero automatic retries and had no skips. The first
configuration resolved the relative output directory beneath this evidence
directory. Its artifacts were moved to `artifacts/release/23/preview/` after
the run. The raw report stays unchanged; its compact summary records the path
relocation and hashes the retained traces. The committed configuration resolves
new results directories from the working directory.

The [first live run](evidence/23/live-checks.json) passed all 30 Firefox and
WebKit cases. Its 15 Chrome cases failed before navigation. The
[launch error inventory](evidence/23/live-launch-failures.json) identifies the
same fatal `Socket path too long` error in every failure. The disk-backed
temporary path exceeded Chrome's Unix socket limit. Chrome's explicit rerun
uses its working default `/tmp` location; Firefox and WebKit retain the
disk-backed profiles. The original live run remains failed.
All 15 unchanged [Chrome recheck cases](evidence/23/live-chrome-recheck-checks.json)
passed with no retries or skips. The [accepted live matrix](evidence/23/live-accepted.json)
binds all 45 unique live cases to passing evidence. Live promotion and all
checks used Hosting version `ea1a7ab0ece6377e` without a rebuild.

Typecheck, lint and the 19 cases in `src/domain/index.test.ts` passed.
The final `pnpm verify:performance` check still matched the source and every
audited static file. No long full-suite rerun was needed for these release-only
changes. Browser runs that regenerated slice 13 screenshots had those captures
retained under this release's artifacts directory, then restored the historical
tracked files.

An additional ordinary Firefox 155.0.1 smoke uses a fresh headless Selenium
session. The [preview observations](evidence/23/ordinary-firefox/preview.json)
record twelve Arabic/English checkpoints covering public startup, unsigned
protected entry, applicant return and business-step refresh, repayment, role
switch and reviewer refresh, print and the reset warning. Both local Noto font
faces are loaded at every checkpoint. The default Firefox MCP launcher failed
before navigation; the existing working `/usr/bin/firefox` and geckodriver
0.37.1 setup supplied the independent check with Selenium 4.36.0. Its
[exact runner](evidence/23/ordinary-firefox/runner.mjs.txt) records the host paths.
This smoke is separate from the longer Playwright journeys. Browser widths are
CSS viewports. No physical-device or branded Safari check is claimed.

The same twelve checkpoints completed on the live origin, recorded in the
[live observations](evidence/23/ordinary-firefox/live.json). Both invocations
wrote their observations before `driver.quit` failed with `Failed to decode
response from marionette`. The [preview log](evidence/23/ordinary-firefox/preview.log)
and [live log](evidence/23/ordinary-firefox/live.log) retain those teardown errors;
both runner exit codes were 1. The checkpoint results do not claim that either
whole runner invocation exited successfully. The live runner also used the
disk-backed temporary directory. Representative ordinary Firefox preview and
live screenshots were inspected directly; the styles and text rendered.
The [preview Arabic staff view](evidence/23/ordinary-firefox/preview-ar-staff.png)
and [live English products view](evidence/23/ordinary-firefox/live-en-products.png)
retain two of those captures. The [capture inventory](evidence/23/ordinary-firefox/captures.json)
hashes all 24 ordinary Firefox screenshots.

## Reproduce and promote

Keep the accepted `dist/client` output and verify it before publishing:

```sh
pnpm verify:performance artifacts/performance/22/2026-10-16T19-56-49.594Z/run.json
firebase hosting:channel:deploy rifd-review --expires 30d \
  --no-authorized-domains --project rifd-portfolio-mdnb --non-interactive --json
```

Use the actual preview URL returned by Firebase. Run the hosted checks with a
new results directory for each invocation:

```sh
mkdir -p artifacts/release/23/browser-tmp
TMPDIR="$PWD/artifacts/release/23/browser-tmp" \
RIFD_HOSTED_ORIGIN=https://rifd-portfolio-mdnb--rifd-review-0pctwjax.web.app \
RIFD_HOSTED_RESULTS=artifacts/release/23/preview \
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh \
pnpm exec playwright test --config docs/implementation/evidence/23/hosted-checks.mjs \
  --project firefox --project webkit

node docs/implementation/evidence/23/verify-hosted.mjs \
  https://rifd-portfolio-mdnb--rifd-review-0pctwjax.web.app \
  artifacts/release/23/preview-assets.json
```

For Chrome, omit `TMPDIR` and pass `--project chrome`. For Firefox and WebKit,
use the disk-backed `TMPDIR` shown above and pass
`--project firefox --project webkit`. Give these invocations separate results
directories. The long disk path exceeds Chrome's Unix socket path limit and
prevents launch, so do not apply it to Chrome.

Omit the WebKit override on a supported Playwright host. The host-specific
launcher is documented in [slice 01](01-evidence.md). The screen checks use
installed Chrome and Playwright's pinned Firefox and WebKit.

After preview acceptance, promote the exact preview version without rebuilding:

```sh
firebase hosting:clone rifd-portfolio-mdnb:rifd-review rifd-portfolio-mdnb:live \
  --project rifd-portfolio-mdnb --non-interactive --json
```

This follows Firebase's documented [channel cloning workflow](https://firebase.google.com/docs/hosting/manage-hosting-resources#clone_a_version_from_one_channel_to_another).
The live invocation selects 45 cases, retaining all bilingual route and refresh
checks and repeating the mutation journeys in English across all three engines:

```sh
TMPDIR="$PWD/artifacts/release/23/browser-tmp" \
RIFD_HOSTED_ORIGIN=https://rifd-portfolio-mdnb.web.app \
RIFD_HOSTED_RESULTS=artifacts/release/23/live \
RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh \
pnpm exec playwright test --config docs/implementation/evidence/23/hosted-checks.mjs \
  --project firefox --project webkit \
  --grep 'public static deep links|protected direct links|complete first submission,.*in en|en resubmission publishes|en first submission through approval|en a new young business submits|cancel and aborted reset|draft saves incomplete text|notifications persist.*in en'
```

Run the same selection separately with `--project chrome`, `TMPDIR` unset and
a new results directory, as in `artifacts/release/23/live-chrome-recheck/`.

Repeat `verify-hosted.mjs` against that live origin with a fresh output path.
A preview channel has its own origin and browser-local dataset; it does not copy
visitor data to the live site. Full raw reports, traces, screenshots, runner
logs and commands remain in the ignored `artifacts/release/23/` directory.
The committed summaries retain case results and report/trace hashes.

## Review

The required independent reviews compare the staged release work against the
clean starting commit `1352c140782168ce9e77773547e35658c19cff45`.

### Standards

No documented-standard violations or material code-smell findings.

### Spec

No implementation defects or unrequested behavior. The original failed runs
remain separate from the accepted preview and live matrices. The source commit
identifies the built application; this ticket adds Hosting selection and
release verification and evidence.

Standards: 0 findings. Spec: 0 findings.
