# RIFD delivery and chapter guide

Open the [live demo](https://rifd-portfolio-mdnb.web.app), [public repository](https://github.com/mohammed-najib/rifd-financing-demo), [4:30 film](demo/rifd-demo.mp4), [case study](case-study.md) and [acceptance checklist](acceptance/README.md). The film is silent, with Arabic and English captions. Setup, waits and typing are condensed; each record and identity switch is labelled.

## Reproduce the delivered application

Follow the root [install/run/build/check commands](../README.md#run). Use the pinned lockfile, Node 22.19+ and pnpm 11.24.0. `pnpm dev` serves development at port 5173; `pnpm build && pnpm preview` serves static production at port 4173. `/components` is public. No bank credentials, server database or application secrets are needed.

The hosted application is commit `1352c140782168ce9e77773547e35658c19cff45`, Firebase Hosting version `ea1a7ab0ece6377e`. The [release record](implementation/23-evidence.md) records live and expiring preview URLs. The delivery release adds documentation and recording tools. Rebuilding the same source changes a prerender timestamp; it does not reproduce the audited shell byte for byte. Preserve the measured output before running build checks, or build in a separate checkout.

## Identities and starting data

The chooser starts in Arabic. Select English explicitly when needed. Sign-in has no password and simulates permissions. Every browser profile and origin has its own dataset. Preview and live do not share records. Two tabs at the same origin share committed data and language, with independent sessions. A duplicated tab can inherit its initial identity; subsequent switching and expiry remain independent.

| Identity | Role and home | Initial records |
| --- | --- | --- |
| مريم سالم / Mariam Salem | Applicant, `/applications` | 001, 002, 005, 007, 010 |
| هدى علي / Huda Ali | Applicant, `/applications` | 003, 004, 008, 011, 012 |
| عمر حسن / Omar Hassan | Applicant, `/applications` | 006, 009, 013 |
| سلمى ناصر / Salma Nasser | Reviewer, `/staff/applications` | Reads all twelve submitted records; writes only assigned permitted records |
| خالد علي / Khaled Ali | Internal colleague, cannot sign in | Assigned 008, 011, 013; confirmed transfers simulate his responsibility |

References begin `RIFD-2026-`. See the [complete thirteen-record inventory](implementation/architecture.md#seed-inventory) for state, product, assignment, notifications and evidence details. Initial applicant totals are 5/5/3. The staff queue has four Submitted, three Under review, three Corrections requested, one Approved and one Rejected. Seven are assigned to Salma, three to Khaled, two unassigned. Mariam's Draft is excluded from the queue. Five initial notices are unread.

The domain date is 14 October 2026; inactivity uses real elapsed time. Monetary values use whole YER. The historical 005 approval retains eighteen 72,000 YER installments, two Completed, 144,000 completed and 1,152,000 remaining. No payment action exists.

## Samples, controls and recovery

Use the prepared fictional samples, never personal documents. The four slots are applicant identity, business evidence, revenue/expense summary and a stock plan or supplier quotation. Use sample prepares bytes. Ready to save is still unsaved. Save progress persists a draft/private correction; Submit or Resubmit publishes to the reviewer. Saved files survive refresh. Unsaved selections and tab-memory text do not.

The sample selector includes matching originals, readable replacements and identical bytes with a different name. For Huda 004, select the `replacement` plan reflecting 450,000 YER. A renamed identical file does not satisfy a correction. PDF, JPEG and PNG accept 1 through 5,000,000 bytes with matching extension/MIME; empty MIME is allowed when the extension is supported. The catalog also contains empty, invalid-type and 5,000,001-byte examples. Envelope acceptance does not establish readable document contents.

| Labelled control | Scope and recovery |
| --- | --- |
| Slow requests | Current tab only. Requests take 1,500 ms; file preparation takes 4,000 ms, plus actual work. Normal request/preparation delays are 400/1,200 ms. |
| Next failure: preparation, save, submission or storage | One armed failure; invalid input and exact operation replay do not consume it. Retry explicitly. A failed replacement keeps the saved file; failed save retains prepared bytes. Refresh clears controls. |
| Expire session | Covers protected content immediately. Sign in as the same identity to inspect and recover permitted current-tab text. No action replays automatically. |
| Simulate reassignment to Khaled | Available on Salma's eligible Under review record. Commits a transfer while holding that view stale. Attempt a write, Load latest, confirm reclaim, inspect current information and start a new action. |
| Inspect save/submission/review/decision outcome | Use after uncertain completion before retry. A committed receipt prevents duplicate effects. |
| Reset demo | Read the browser-wide warning and explicitly choose Replace all demo data. See below. |

After readiness, disconnecting the network still permits saved local data, loaded routes and prepared samples. A fresh offline launch is outside scope. Startup/storage errors preserve data and offer Retry. Close old tabs if an upgrade is blocked. Manual storage deletion is a development tool, not the normal recovery procedure.

## Longer journey walkthrough

Reset once before this sequence. A chapter's record switch is deliberate; it does not imply that a different reference is the previous application's next state. The film uses these same real UI operations. The full uncut recording and trace are attached to the public delivery release.

| Film time | Starting identity and record | Longer path, controls and expected result |
| --- | --- | --- |
| 0:00 to 0:10 | Unsigned | Introduce fictional browser-local RIFD. No bank request, verified identity or real payment. |
| 0:10 to 0:45 | Mariam 001, Inventory Draft | Compare `/products`. Resume 001 financing. Try amount `12` and submit from Review to expose linked validation. Set amount `100010`, term `6`, and a stock-purchase explanation. Save, refresh and review. After the document exercise below, submit normally. Detail shows reference 001, Submitted and public history. |
| 0:45 to 1:20 | Mariam 001 before submission | Documents step: choose an empty PNG and inspect the error. Use a readable sample, observe preparation and Ready to save, save and refresh, preview the saved file. Prepare a replacement, arm Next failure = save, attempt Save, observe failure and retained previous file, then explicitly save again. The film edits this pre-submission document work after chapter 1 and labels the record. |
| 1:20 to 1:55 | Mariam 001, then historical 005 | Open own list, 001 detail and history. Notifications: open the existing 005 approval notice, observe its current destination and persistent read state. Open Print summary. Compare actual [Arabic and English print PDFs](implementation/21-evidence.md#automated-evidence), including staff/public equivalence. |
| 1:55 to 2:30 | Salma queue, then submitted 001 | Search Arabic-Indic `٠٠٤`, clear, filter Submitted, sort amount ascending, clear status and page forward. Leave/revisit the queue to restore filters/sort with empty search/page one. Open 001 and Claim. Status remains Submitted until Start review. |
| 2:30 to 3:05 | Salma 007, Huda 004, Salma 004 | On 007 save an internal note, inspect a name-target request and its reason, then cancel the unsent composer. Switch explicitly to Huda 004's existing amount/plan request. Enter `٤٥٠٬٠٠٠`, choose the readable replacement plan and save privately. Submitted data stays at 600,000. Resubmit. As Salma, inspect the changed targets, verify the amount, accept the plan and repeat only affected checks. For an actual new request/repeated round, follow [slice 11](implementation/11-evidence.md) and [slice 13](implementation/13-evidence.md). |
| 3:05 to 3:40 | Salma 001, new Omar application, historical 005 | For 001, accept four documents and record five Passed checks first. Enter an approval reason. Simulate reassignment; attempted confirmed approval is refused. Load latest retains the reason read-only, confirm reclaim, inspect the latest application, then inspect and confirm approval anew. Separately create Omar's new application as below, fail Operating history and confirm a reasoned rejection. Finally switch to historical 005's frozen Completed/Upcoming illustration. New 001 approval has only Upcoming rows. |
| 3:40 to 4:15 | Salma 005, Mariam, then unsigned | Switch English and Arabic on the same record. Expire session and sign back in as Salma. Switch Mariam; `/applications/RIFD-2026-004` is neutral forbidden access. Open `/components`. Open `/demo/reset`, read the warning and confirm replacement. Arabic, chooser, original records and unread notices return. |
| 4:15 to 4:30 | Unsigned | Follow the live, repository, case-study, acceptance and chapter-guide links. |

### Create the new rejection through the normal form

As Omar, open `/applications/new?product=inventory`, choose New application and complete the existing prefilled personal fields. Set business name `DEMO متجر جديد`, fictional Aden address, operating since `2026-08`, monthly revenue `700000`, expenses `500000`, financing amount `100010`, term `6`, purchase budget `250000` and an explanation of a fictional stock purchase. Prepare all four samples, inspect Review and submit. Record the actual generated reference. The recorded reference is `RIFD-2026-220f6d40-02bf-4d5e-8919-b21485f889d0`. New references are generated, so copy the actual reference shown after submission.

Switch Salma, open that reference, Claim, then Start review. Operating history cannot pass because only two months elapsed; mark it Failed. Open Record final decision, write the two-month/six-month reason, Inspect rejection and Confirm final decision. Approval stays unavailable. Omar can open the new decision notice and public reason. Historical 006 is a separate seed and does not prove this new action. The uncut take retains the normal form setup; the short film condenses it.

### Reset safely

Open `/demo/reset`, then choose Reset demo to open the confirmation. Read the list of browser-wide replacements, then choose Replace all demo data. Cancel retains work. Failure preserves the previous dataset and offers inspection/retry. Success invalidates old sessions, buffers, previews and pending work in all tabs and returns to Arabic identity selection. Choose Mariam to confirm the original Draft, or Salma to confirm the twelve-record queue. A fresh profile gives an independent reproduction without touching another profile's work.

## Record and export again

Install ffmpeg with libass, ffprobe and ordinary Chrome. From the repository root:

```sh
RIFD_DEMO_OUTPUT=artifacts/demo/24/new-take node docs/demo/record.mjs
node docs/demo/export.mjs artifacts/demo/24/new-take
```

The recorder uses an isolated Chrome context on live Hosting, real screens and normal operations. It writes a full WebM, trace, scene times, viewport screenshots and a result. It never injects fixture state or calls a hidden API. Export refuses incomplete scenes, makes each chapter exactly 35 seconds, emits bilingual captions, chapter metadata and a measured MP4. Export condenses typing and waits. Inspect the exported frames and watch each chapter before publishing. The output manifest binds the raw take, film, captions and chapter timings by SHA-256.

`pnpm test:acceptance` runs the full checks and fresh production build. Review retained failures and explicit rechecks separately. Follow [acceptance](acceptance/README.md), [architecture](architecture.md) and the [flow sketch](user-flow.md) to extend behavior.

The recorded slice 24 invocation took about 64 minutes on the documented Linux host: 9.4 minutes for API cases, 43.7 for screens and 10.8 for delivery gates. Focused diagnosis and rechecks are separate. Runtime depends on the host and browser versions.
