# RIFD architecture

The browser runs the whole demo. Firebase Hosting serves `dist/client` with `/_shell.html` as its fallback. TanStack Start prerenders a neutral Arabic startup shell; browser-only initialization starts after mounting. Required routes need no runtime Start server. The [implementation architecture](implementation/architecture.md) documents operation types, revisions, seed fields and extension rules in detail.

```mermaid
flowchart TD
  Screens[React screens and unfinished input] --> Demo[Public typed asynchronous demo interface]
  Demo --> Domain[Pure domain rules]
  Demo --> Store[Private IndexedDB transactions and receipts]
  Demo --> Sessions[Tab-local simulated session]
  Demo --> Events[Committed change notifications to other tabs]
  Hosting[Firebase static shell and assets] --> Screens
```

`packages/rifd-domain` owns validation, normalization, transitions, correction dependencies, decision prerequisites and whole-YER arithmetic. It accepts explicit dates and product rules; it does not access UI, storage, timers or navigation. Its packaged guidance follows [the maintainer workflow](implementation/agent-skills.md).

`src/demo` exposes role-filtered reads and complete typed operations. It owns access checks, assignment, sessions, deterministic delays/failures, preparation, durable file bytes, versions and idempotent receipts. One transaction publishes all effects of submission, correction resubmission, a final decision or reset. Expected dataset/record/round revisions prevent stale writes. The primary accepted integration seam exercises this public interface against real IndexedDB. Screens invoke the same interface; they do not assemble storage patches.

React screens own unfinished text, selections, dialogs and accessible feedback. Saved Draft data, private correction workspaces and submitted snapshots are separate. A prepared file becomes durable only through Save or publication. Staff reads exclude private correction work; applicant reads/print exclude internal notes, checks and activity. These are demo permissions in a visitor-controlled browser, not a security boundary against that visitor.

Committed data and language are shared within an origin/profile. Sessions are tab-local. Change broadcasts refresh clean screens; dirty screens retain input and demand inspection. Recovery never silently retries a write. Startup validates schema, references, hashes and the required local sample catalog before Ready. Failure preserves data. Reset replaces the whole dataset atomically and invalidates prior tab work. See the [state/role/recovery sketch](user-flow.md).

Tailwind CSS 4.3.3 compiles through its pinned Vite plugin. `src/ui/styles.css` declares Guided A tokens with `@theme`, local Noto WOFF2 fonts and explicit base styles. Source detection includes production `src` only. Preflight is omitted. Logical utilities support RTL/LTR, with custom compact/narrow boundaries at 1199/767px. The [styling contract](../README.md#styling), [migration comparison](implementation/tailwind-v4.md) and [measured release](implementation/22-evidence.md#final-results) document preserved appearance and generated asset sizes.

The [acceptance checklist](acceptance/README.md) separates automated behavior, ordinary-browser manual work, print inspection, performance and hosted checks. Browser-only persistence, no real authentication or payment processing, and fresh-offline launch remain explicit limits.

Draft, private correction and submitted identity, business, financial and purchase assistance use `Demo.createEvidenceAssistance`. The handle owns an
explicit inspect/run/cancel/refresh/clear lifecycle and retained results. Authorized reads bind
actual source bytes, relevant declarations and authority/dependency generations.
Completion rechecks those dependencies. Replacement, relevant edits, sign-out,
reset and view disposal cannot publish late findings. Language changes do not run
analysis. Assistance never writes financing data.

Correction inputs bind the current workspace's round identifier. The same task
context includes the actual reviewer-written target reasons, permitted fields and
document slots, and the actual initial submission month.
Every question depends on that shared context. Document-only correction targets
keep the name read-only in operations and presentation. Matching ordinary Save
can retain a temporary result without restarting its run. Resubmission closes
that round's analysis authority and publishes only the correction response.
Staff reads, public print, notifications and review activity exclude applicant
analysis before and after publication. Correction validation and deterministic
financing calculations continue through their existing operations.

Reviewers use `find-supporting-evidence` with the same task definitions and
lifecycle. The selector reads the authorized submitted snapshot even while an
applicant saves private corrections. Reviewer inputs cannot override declarations
or supply prepared files. Staff reading does not require assignment and grants no
write permission. Reviewer records remain separate from applicant records.
Their dependency key includes the existing inspection context, so publication and
assignment transitions invalidate findings, including reassignment away and back.
Unrelated notes preserve findings after a fresh authorized read.

The shared assistance panel places the submitted source, findings and existing
assessment controls in three columns on desktop and stacks them on smaller
screens. Ordinary PDF inspection has explicit page navigation, open and download
routes independent of analysis coverage and limits. Opening a source or receiving
findings never confirms inspection. Assessment writes still require the current
inspection confirmation or the explained unable-to-open replacement exception.

`src/evidence-assistance` separates the shared contracts, fixed question/display
policy, cancellable browser preparation and controller. Preparation uses one
terminable worker per complete PNG/JPEG or selected original PDF page, one at a time. PDF.js 5.4.296,
its worker and resources are pinned together. Install/dev/build copy the matching
resources into ignored `public/pdfjs`; production builds retain them as static
assets. Source/raster hashes, orientation, padding and transforms accompany each
result. The pinned JPEG decoder rejects truncated scans that browser decoding
would repair silently. Encrypted, incomplete or oversized sources remain available
through ordinary inspection. Analysis supports at most 100 original PDF pages and
four selected full pages, eight seconds per page and 20 seconds of cumulative
preparation. All pages are selected when they fit; longer or resource-limited
sources require an explicit narrower selection. Rendering failures preserve
selected, prepared, failed and unchecked scope without substituting rasters.

Shared target definitions identify business name, address and operating-since
month for separate presence and support findings. Invalid or missing declarations
skip only their comparisons. Existing domain validation determines applicability;
operating-history arithmetic and eligibility stay in the domain rules. Every
model-visible declaration participates in each question's dependency manifest.
Business checks share correction permissions, reviewer source selection and
retention without depending on unrelated applicant fields or staff notes.
The common multipage controller also applies to business evidence. Automatic
highlights remain a separate implementation ticket.

Purchase checks name separate description and total-budget targets. Inventory
financing expects a stock purchase plan; Equipment financing expects a supplier
quotation. Apparent category remains a finding independent of document suitability.
Whole-rial parsing and declaration validity use the existing domain helpers;
itemized analysis, product purpose fit and purchase budget coverage stay outside
assistance. Every question binds the selected product and both purchase details.
Relevant edits or product/source changes suppress old findings. Matching ordinary
Save can retain a temporary purchase run. Correction edits remain limited to the
requested fields, and reviewer checks use the submitted purchase evidence.
The same complete-source and readability/category/presence guards apply.

Financial checks name the reporting period, revenue and operating expenses for
each of three months, and both printed averages. Code derives the three completed
months from the effective initial submission month. Drafts use the existing demo
submission month; historical and correction contexts use the actual initial
submission month. Whole-rial parsing and validation stay in code. Assistance
compares explicitly printed averages, never computes or transcribes missing ones.
Missing declarations skip only their comparisons. Period findings precede amount
findings, and wrong or conflicting periods suppress amount conclusions.

A source proven to have exactly one page combines page and declaration work,
reserving a second stage for later bound verification. Multipage sources dispatch
ascending page stages and at most one comparison over usable pages. A single
selected page from a longer original retains that multipage plan. Four selected
pages reserve at most nine attempts, including one future verification per page.
Comparison requests include each raster once. Actual verification, service
admission and native SDK integration belong to subsequent tickets.

Agreement and absence require complete usable coverage of the original source.
Conflicts witnessed on usable checked pages can remain scoped warnings, with
financial-period guards. Failed comparisons preserve independent page findings.
Runs never merge coverage. The Arabic/English panel shows explicit page selection,
coverage, period-first findings and ordinary source navigation. Advice remains
optional during Save, submission and reviewer assessment.

The controller retains native answers, distributions, fractional readability,
usage, per-page manifests, fixed requests and timestamps in provenance. Restoring
an analysis revalidates the page scope, stage plan, question definitions and
native-to-display composition. Ordinary runtime has no provider transport and
reports live analysis unavailable. Only test entry points inject fake transports.
Actual multipage fictional PDFs and deterministic four-page plans verify browser
behavior; native four-image context fit and representative reliability remain
unverified.

Analysis uses the separate version-1 `rifd-evidence-analysis` IndexedDB database
after financing startup validates the current dataset. The financing database
keeps its one-store layout and unchanged logical records. Context records retain
one bounded completed run, its original seven-day expiry, native/mapped answers,
coverage, dependency manifest and versions. Prepared visitor images are never
archived. Restored results retain their dates and say previous live analysis.
Changed dependencies keep explicitly stale scope and provenance while suppressing
current findings. Corrupt or incompatible analysis does not affect financing reads.

Web Locks serialize financing commits/reset with analysis retention. Each context
has a run generation and a separate clear generation. A newer run fences late
completions without discarding another view's completed unsaved result; clear
fences both. Without Web Locks, assistance remains temporary. Unsaved sources and
context become durable only after matching ordinary Save. Failed/cancelled runs
retain the previous result and expiry. Storage failure leaves new findings
temporary and reports that they cannot be recovered after closing.

Reset invalidates local authority before replacing financing data. Cleanup of
old-dataset and expired analysis runs during startup and activation, including
recovery after interrupted cleanup. Public `analysisAvailability()` reports its
status. Cross-tab hints carry dataset identifiers only; each view rereads its own
authorized source/context. Reads never restart inference or replay a server
answer. No live overlays are implemented yet; a later highlight restoration must
reconstruct and verify the recorded raster before drawing anything.
