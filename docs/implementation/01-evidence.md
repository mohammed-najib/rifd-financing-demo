# Slice 01 evidence

Implementation of [Open the bilingual demo and inspect seeded applications](../../.scratch/financing-application-and-review-implementation/issues/01-open-bilingual-seeded-demo.md), against planning baseline `b59adca9e23d44eddef8f0b83519f191f50302f3`.

Checked on 2026-10-14 on Omarchy Linux, x86_64, using Node 26.7.0, pnpm 11.24.0, Vite 8.3.4, Vitest 5.0.4, Playwright 1.64.1 and Firebase CLI 15.30.0. Browser versions are installed stable Chrome 155.0.8059.39, pinned Playwright Firefox 157.0 revision 1555 and pinned Playwright WebKit 27.2 revision 2370.

## Commands and results

Typecheck, lint and the SPA production build passed. The inspected build produces `dist/client/_shell.html` with neutral Arabic/English startup content and no application details. `firebase.json` serves that directory, preserves static assets, and rewrites missing paths to the generated shell. Browser checks use this static output with no Start runtime server. The API test harness runs separately and is absent from `dist/client`.

The final suite command is:

```sh
pnpm test
pnpm test:browser:api
RIFD_HOSTING=1 pnpm test:browser
```

On this Arch-based host, the WebKit Ubuntu fallback binary needs compatible ICU 74, libxml2 and flite libraries. For this run, the official Ubuntu packages `libicu74_74.2-1ubuntu3_amd64.deb`, `libxml2_2.9.14+dfsg-1.3ubuntu3_amd64.deb` and `libflite1_2.2-7build1_amd64.deb` were extracted under `/tmp/rifd-webkit-libs`. A temporary launcher sets the binary's library, resource and injected-bundle paths while preserving the pinned browser. Its path is passed with `RIFD_WEBKIT_EXECUTABLE=/tmp/rifd-webkit-run.sh`. No system packages or browser binaries were modified. On supported Ubuntu, use Playwright's ordinary `install --with-deps` workflow from the README.

Final result: 37 tests passed. This includes 10 pure-domain tests, 6 real-browser public-interface integration tests in Chrome, and 21 production screen/static checks across Chrome, Firefox and WebKit. Typecheck, lint and build also passed after the review fixes. The browser suite ran through Firebase Hosting's emulator with no Start runtime server.

## Covered behavior

- The complete thirteen-record seed, 5/5/3 ownership counts, twelve-record staff queue, 4/3/3/1/1 state counts, 7/3/2 assignment counts, stable submission dates/amounts/terms and unread notices.
- Concurrent empty startup retains one dataset. Competing language writes refuse one stale preference. Exact receipt replay creates no new revision; changed intent is refused.
- Arabic-first chooser, saved English and direction after refresh, identity home, protected sign-in return, neutral forbidden destinations and inaccessible staff drafts.
- Applicant projections omit assignment, assessments and notes. Staff projections omit draft/private correction work and applicant notification/sample access. Corrections initially remain at the submitted 600,000 YER baseline.
- Authorized saved evidence survives refresh with matching hashes and lengths. PNG/JPEG signatures and actual two-page PDF parsing confirm real bytes.
- Keyboard language switching retains focus. Applicant and staff content fit 360, 390, 768 and 1440 CSS pixel viewports in both languages. Stored historical repayment remains read-only and retains completed/remaining amounts.
- Local asset status/MIME, font license availability, neutral generated shell, storage-denial recovery with public products, and ready offline navigation.

## Visual inspection and limits

Arabic staff queue and English applicant correction screenshots were visually inspected for spacing, translated labels, data separation and mixed-direction text. Preserved screenshots from the final Chrome production run are [Arabic staff queue at 1440px](evidence/01/staff-queue-ar-1440.png) and [English applicant correction detail at 1440px](evidence/01/applicant-correction-en-1440.png). Both were visually inspected.

These checks cover the runnable read slice. They do not establish later write, preview, print, gallery, queue-filter or reset behavior. Full manual ordinary Firefox, screen-reader, 200% zoom, seven-journey and Lighthouse acceptance remain with their owning tickets. Playwright Firefox/WebKit and responsive emulation do not establish branded Safari or physical-device support. No Hosting release has been deployed.

## Standards

No findings. The staged changes respect the documented domain/demo/UI boundaries, use the glossary consistently, and test through the public interface with actual IndexedDB. The private corruption fixture falls within the spec's explicit exception. No material baseline smells were found. The follow-up review found no new issues in the fixes or font-license provenance.

## Spec

The first review found two issues: applicant correction rounds exposed internal target verification flags, and chooser sign-in resumed inaccessible pending links. Applicant projections and types now omit verification. Sign-in checks the selected role and record access, opens the identity home for inaccessible links, and keeps already-signed-in forbidden entry neutral. Both fixes have regression coverage through the agreed public/browser interfaces. The follow-up review confirmed both findings resolved and found no new material issues.

Standards: 0 findings. Spec: 2 initial findings resolved, 0 outstanding. Neither axis has a remaining issue.
