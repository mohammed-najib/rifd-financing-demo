# Local Jev inference and retry recovery

> Dated implementation record. For current setup and behavior, start with the [documentation index](../README.md). Test counts, release identifiers and operational decisions below apply to the work recorded here.

The app supports real Jev inference on the local development server through
`pnpm dev:jev`. By default, the app runs at http://127.0.0.1:5174. It uses the
existing TypeSafe SDK and admitted fixed workflow, with the key held by the
local API process. Hosted dispatch and historical validation accounting remain
unchanged. This work follows the operator's 18 October 2026 instruction to
implement the retry fix, enable local inference and test it locally.

The command accepts `TYPESAFE_API_KEY` from the environment or ignored
`.env.local`. Otherwise it obtains the existing project's dedicated
`LIVE_TYPESAFE_API_KEY` through the Firebase CLI. No key was written to a new
environment file. See [the run instructions](../development.md#local-jev-inference).

The [local server](../../src/live-assistance/local-server.ts) listens on IPv4
loopback and requires the exact app Host and Origin, a signed local session and
the fixed analysis contract. Its credentials are distinct from Firebase guest
credentials. The browser's notice describes this local mode in Arabic and
English. Session acquisition occurs only after an explicit Run or Retry.

[SQLite metadata](../../src/live-assistance/local-store.ts) implements the same
transactional admission interface used by the hosted service. Full run plans are
reserved and attempts marked durably before transport. Counters, deduplication,
connection leases, session signing state and unknown-accounting stops survive
server restarts. The database holds no provider key, source, declaration or
answer archive. Vite denies access to `artifacts/local-jev/`. Fake-provider tests
verify restart behavior, rejected origins/credentials, request validation and
the absence of the dummy provider key and declaration in the database.

The development app and API test server now use separate dependency caches.
Generated test reports are excluded from the app watcher so they cannot reload
a page during inference. A shared cache initially caused an Outdated Optimize
Dep response during the first app load; the cache separation resolved it before
any provider dispatch.

The retry defect was reproduced before editing. Three new browser tests then
failed on the same lost page count and selection. The controller now retains
known scope only when the inspected hash still matches the authorized source.
An early unavailable/offline exit preserves valid selected pages while keeping
prepared, dispatched and successful work empty. The UI therefore keeps page
controls and Retry available. Stale source authority cannot reuse that scope.

After the fix, the original minimal reproduction passes. New tests cover a
missing transport and both default and explicitly selected pages on a first
offline attempt, followed by reconnection and a successful fake-provider retry.
A manual Chrome DevTools check against the real local app also retained both
business pages and an enabled Retry button offline and after reconnection. That
manual check dispatched no additional native request.

Two real one-page identity checks ran through the normal app in Chrome DevTools
MCP. Actual fictional files were selected through the file input and their
declared names entered in the form. No test fixture transport or intercepted
provider response supplied these findings.

| Known source | Actual Jev result | Timing and usage |
| --- | --- | --- |
| English `en-identity-10` | Identity category, clear readability, printed name present and name consistent. Name-region highlight suppressed because P(single) was 0.98, below 0.99. | Provider HTTP 200 in 966 ms; Run-click to displayed result about 1.65 s. 3,225 input tokens and 232 output tokens. |
| Arabic `ar-identity-01` | Partial result. Identity category and name presence usable; readability invalid/unavailable; name support undetermined with native comparison confidence 0.84. Highlight suppressed. | Provider HTTP 200 in 715 ms; Run-click to controller completion about 1.39 s. 3,236 input tokens and 232 output tokens. |

Both responses identify `jev-1.14.0`. Each used one combined page/declaration
request. Both bound-verification stages were skipped for `no-eligible-regions`.
No automatic retries, replacement calls or extra examples ran. Local metadata
records two completed runs, four planned attempts, two marked attempts and two
released unsent slots. Total reported usage is 6,461 input and 464 output tokens.
Actual billed charges were not queried or inferred from those token counts.

The displayed source names were inspected against the actual fictional pages.
The English result was saved through ordinary Save, then reopened after reload
as previous live analysis without a new provider attempt. Changing to the Arabic
source and declaration made the English findings stale and unavailable until
the new explicit check. The Arabic partial result was also saved. Thresholds
and native-answer validation were not weakened to obtain a positive result.

Both candidate regions remained suppressed. This test therefore establishes
neither native bound-verification success nor useful live highlight coverage.
The examples were previously exposed smoke inputs. Native business, purchase,
financial/multipage reliability and broader bilingual accuracy were not measured
by these two calls. Their application workflows remain covered by deterministic
tests.

| Verification | Result |
| --- | --- |
| Full unit suite | 145 passed; one separate Firestore emulator test skipped because its emulator was not started. |
| Affected Chrome regressions | 32 passed, zero failed/skipped/retried. Includes the five live-access tests. |
| Original failing reproduction | Passed after the fix. |
| Typecheck and lint | Passed. |
| Production build | Passed. |
| Client isolation scan | No local session endpoint, local credential marker, SQLite module, provider secret name or dummy provider key found in client JavaScript. |
| Actual local HTTP access checks | Unsigned analysis returned 401. Browser requests for the SQLite database and local server bundle returned 403. |
| Real Jev HTTP | Two responses with HTTP 200 and reported usage; English complete, Arabic partial. |

Local test evidence is retained under `artifacts/jev-local-fix/`, including
before/after browser reports, native JSON and screenshots, the accounting
summary, and post-fix scope observations. Those files contain fictional evidence
and are ignored by Git. Production cloud configuration, the provider key,
historical ledgers, Saved demonstrations and display thresholds were not changed.
