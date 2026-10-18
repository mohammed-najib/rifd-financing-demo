# Slice 24 repository, case study and timed demonstration

> Dated implementation record. For current setup and behavior, start with the [documentation index](../README.md). Test counts, release identifiers and operational decisions below apply to the work recorded here.

This is the historical delivery record for the original 4:30 film. On 18 October 2026, the [current walkthrough](../demo-guide.md) was refreshed to 5:40 with the updated local website and Jev features. The original film and its recorded hashes remain available in the delivery release and Git history.

The delivery uses the existing repository and preserves its history. The application remains the measured Firebase release from [slice 23](23-evidence.md). This slice adds the public delivery documents, requirement checklist, case study, actual film, recording/export tools and evidence copies.

## Destinations and application identity

| Item | Actual destination |
| --- | --- |
| Public repository | <https://github.com/mohammed-najib/rifd-financing-demo> |
| Delivery release | <https://github.com/mohammed-najib/rifd-financing-demo/releases/tag/rifd-delivery-v1> |
| Live application | <https://rifd-portfolio-mdnb.web.app> |
| Expiring review preview | <https://rifd-portfolio-mdnb--rifd-review-0pctwjax.web.app>, expires 15 November 2026 at 20:32:46 UTC |
| Built application commit | `1352c140782168ce9e77773547e35658c19cff45` |
| Live Hosting release / version | `1792183590652000` / `ea1a7ab0ece6377e` |
| Measured source SHA-256 | `b40ed3702f8c955998aaf4b38246930469a1cdbd47bbec6ba68357c0d8e1f8fd` |
| Delivery review starting point | `86a9523565d09ac6775a60f322a475dc32fe8807` |

No remote existed at the start. The existing GitHub account authenticated successfully with network access. The repository was created public and connected as `origin`. Source decision/prototype/research commits are preserved through archival evidence refs, with [immutable links](../acceptance/README.md#decision-and-design-provenance). The final publication record is [publication.json](evidence/24/publication.json).

## Delivery documents

The root [README](../../README.md) contains pinned prerequisites, install/dev/static-build/check commands, public URLs, demo identities and Tailwind v4 conventions. The [chapter guide](../demo-guide.md) covers all thirteen seeds, sample variants, per-chapter identity/reference, failure controls, a normal new-rejection form, recovery, offline limits and confirmed reset. The [architecture note](../architecture.md) and [flow sketch](../user-flow.md) describe pure rules, typed operations, private/browser persistence, six statuses, assignment, publication and recovery.

The [acceptance checklist](../acceptance/README.md) maps all thirty normative matrix rows and all 82 numbered stories to evidence. It preserves failed original runs, explicit rechecks, actual CSS viewport/browser claims and the four-scene user-assisted reader scope. The [case study](../case-study.md) includes paired hosted applicant/staff captures, changed targets, stale decision recovery, actual print output, measured results, limitations and working delivery URLs.

The published [performance directory](evidence/24/performance/) copies all 24 raw final Lighthouse JSON reports, source/build binding, final affected acceptance result and feedback measurements. The original full HTML/trace/network/screenshot bundle accompanies the release. These are the measured slice 22 reports, not new audits. The source and accepted static file hashes are verified before and after the delivery checks.

## Actual film and capture provenance

The [MP4](../demo/rifd-demo.mp4), [bilingual WebVTT](../demo/captions.vtt), [chapter metadata](../demo/chapters.ffmetadata) and [film manifest](../demo/film.json) are real exported artifacts. The manifest retains ffprobe output, scene source ranges, source video hashes, exported film hash and chapter boundaries.

The film has a ten-second introduction, seven equal 35-second chapters and a fifteen-second closing, 270 seconds in total. Arabic screens come first; chapter captions are Arabic/English. Identity and record switches are labelled. An explicit English switch appears in chapter 7. The film is silent. Typing, preparation, prior setup and waits are condensed without substituting a successful state for a failed action.

The recorder uses ordinary installed Chrome against actual live Hosting in fresh isolated profiles. It uses normal UI operations, prepared readable samples and labelled controls. It does not inject fixtures, edit storage or use the test harness. It creates Omar's new Inventory application through normal validation, four samples and submission, then records a new reasoned rejection. Historical 006 is not used as proof of this action. The uncut take retains the full form setup. The changed-target and stale approval scenes show actual publication/refusal/reclaim/fresh confirmation. A separate staff-note capture shows a saved internal note. The review follow-up records all four dependent checks being repeated after verification and replacement acceptance.

Recording attempts that failed because of recorder labels, an ambiguous select, startup timing or navigation before a check write completed remain failed in the [capture ledger](evidence/24/capture-ledger.json). The final film edits successful scenes from the main take, a notes take, a corrected ending take and a dependent-rechecks take. The release retains the full source videos, traces and exact runner snapshots. The ending take uses a separate canonical browser dataset; transitions between prepared references and identities are explicit. The integrated [recorder](../demo/record.mjs) includes those capture fixes for future reproductions.

The [exporter](../demo/export.mjs) rejects missing scenes or unequal chapter allocations and verifies the actual encoded file with ffprobe. Visual inspection checks exported frames for captions, content, readable Arabic shaping and the labelled transitions. The [film review](evidence/24/film-review.json) records that inspection separately from automated duration checks.

## Validation

The full delivery acceptance result, failed invocations if any and explicit rechecks are recorded in [validation.json](evidence/24/validation.json). It identifies the actual source, checks, browser versions, counts and retained reports. The acceptance build runs from the locked application source. The previously measured `dist/client` is backed up first, restored afterward and compared with every accepted file hash. Historical captures regenerated by tests are retained with the new run, then restored in their original tracked locations.

The delivery changes no application code, domain helpers, package policy, dependencies, fonts, styles or Hosting settings. Existing accepted domain/public-demo/screen seams cover the behavior exercised here; no new application seam is added. Typecheck and a focused 19-case domain file were run during the work. The full acceptance invocation runs typecheck, lint, domain, packaged-guidance checks, a fresh build, full API and full screen suites and static delivery checks.

The complete invocation remains failed. All 165 API cases passed. Screen results were 563 passed and one Firefox language-setup failure, followed by three unchanged passing repetitions. Delivery results were 28 passed, two English sample-recovery CLS failures and twelve expected non-Chrome measurement skips. The unchanged focused layout recheck reproduced four failures in six attempts.

The [layout diagnosis](evidence/24/layout-diagnosis.json) isolated a test measurement race. A footer entry recorded at 6189.7 ms arrived at 6196.5 ms, after the first sample frame at 6190.1 ms. The observer used callback delivery time to admit an earlier route/focus transition. The preceding painted loading frame kept the footer below the viewport; fonts were already loaded, and picker geometry stayed constant. The corrected test timestamps frames and classifies each retained entry by its actual start time. It keeps the original thresholds, busy-frame checks, geometry assertions and recovery flow.

This changes one test file, so the original strict `verify:performance` command intentionally refuses the new overall source hash. It passed against the restored measured output before the measurement correction. The [delivery verifier](evidence/24/verify-measured-release.mjs) then permits only that test's exact reviewed old/new hash pair. Every other measured source file and all eight static files must match exactly. It also verifies live asset bytes, MIME types and the deep-link shell. This preserves the original reports and application release without claiming that their source inventory included the later test correction.

The corrected layout checks passed twelve runs: Arabic and English at 390 and 1440 CSS pixels, three repetitions each. [Case coverage](evidence/24/acceptance-coverage.json) associates each required case with its original result and explicit follow-up. All 564 screen and thirty required delivery cases have passing coverage; the original invocation stays failed. Typecheck and lint also passed after the correction. The [measured-release record](evidence/24/measured-release.json) confirms exact live bytes and the single permitted test difference.

The release's `acceptance-evidence.zip` retains original JSON reports and logs, all three original failure traces, failed unchanged layout repetitions, corrected layout traces, diagnostic frame logs and runner, and the 34 regenerated historical captures. It does not claim that every passing screen trace is included. The original run took 64 minutes; the full screen suite accounted for 43.7 minutes.

## Review and publication

The code-review skill runs independent Standards and Spec reviews of the staged delivery against the clean starting commit above. Findings and their resolution are retained in [review.json](evidence/24/review.json). The final commit is on the existing `main` branch and is pushed without rewriting history. The public release points to that delivery commit and retains the movie, captions, original measurements and source capture bundle. Public GitHub visibility, branch/release IDs, assets and immutable evidence refs are checked after publication.

### Standards

No documented-standard violations or material code-smell findings. The follow-up
also found no new issue in the shared check helper, source offsets/trimming,
Mermaid labels or expanded capture provenance.

### Spec

One P2 finding was fixed. Chapter 5 originally showed reset checks without
recording them again. The amended take repeats all four dependent checks through
the hosted UI after verification and replacement acceptance. The reviewer
confirmed the final exported Passed feedback, matching captions, MP4 hash and
unchanged 270-second duration. No open Spec findings remain.

Standards: 0 findings. Spec: 1 resolved P2, 0 open findings.

Both reviewers also examined the final measurement correction and exact-hash verifier. Neither found a new issue. They confirmed the preserved thresholds, raw excluded entries, twelve passing corrected measurements and exact unchanged application/static inventory.

The release was published and checked on 16 October 2026 at 22:31 UTC. Its tag retains reviewed delivery commit [`648a313`](https://github.com/mohammed-najib/rifd-financing-demo/commit/648a313de8f6c499d228922e03d353a6d89beec3). All six asset digests and fifteen anonymous public URLs passed verification. A following documentation commit records publication and ticket completion on `main` without moving the release tag.
