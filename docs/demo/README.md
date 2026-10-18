# Recording the walkthrough

[Documentation index](../README.md) · [Arabic chapter guide](../demo-guide.md) · [Current film](rifd-demo.mp4)

The current film is 5:40, silent, with Arabic/English captions and 350 ms crossfades. It records the updated local application at commit `04cf9e4`, not a new hosted deployment. Its [manifest](film.json) binds the takes, captions and film by hash; [review.json](review.json) records export checks.

## Prerequisites

Install the project as described in [development](../development.md), plus ordinary Chrome, ffmpeg with libass and ffprobe. The original journeys use a static preview on port 4173. The AI take uses local Jev on port 5174 and requires a working provider key.

The recorders use isolated Chrome contexts, real screens and normal app operations. They do not inject a financing dataset, intercept AI responses or supply a fixture provider. The AI recorder makes an actual paid request. Recording and export do not deploy anything.

## Record new takes

In the first terminal:

```sh
pnpm build
pnpm preview
```

In a second terminal, record the seven original journeys:

```sh
RIFD_DEMO_OUTPUT=artifacts/demo/current/walkthrough node docs/demo/record.mjs
```

Start the local inference mode in another terminal:

```sh
pnpm dev:jev
```

Then record the AI chapter once:

```sh
RIFD_DEMO_OUTPUT=artifacts/demo/current/ai node docs/demo/record-ai.mjs
```

Choose a new output directory for a new take. The AI recorder refuses to repeat a take that already started its native request. Do not bypass that guard to repeat a charged call automatically. `--reviewer-only` can finish a missing reviewer scene after seven completed AI scenes without another AI request.

The current AI chapter contains one real Jev call, reopened prior findings, field inspection and labelled saved examples. Partial findings and suppressed highlights remain visible. It does not establish broad model accuracy or successful native highlighting.

## Export and inspect

```sh
node docs/demo/export.mjs artifacts/demo/current/walkthrough artifacts/demo/current/ai
```

Export rejects incomplete takes, matches scene timing to captured screenshots and writes the film, captions, chapter metadata and manifest in this directory. It preserves seven 35-second journeys and inserts the 70-second AI chapter. Scene transitions blend over the preceding final frame without shifting caption or chapter boundaries.

Before publishing:

1. Play the beginning, AI chapter and closing. Check Arabic/English text and labelled identity/record switches.
2. Inspect every scene ending and transition. Look for blank frames, abrupt jumps, clipped dialogs and captions covering controls.
3. Confirm the duration and chapter boundaries against the manifest, and decode the entire MP4 with ffmpeg.
4. Open the film through the README link as well as locally.

The published refresh also used per-scene trim adjustments to keep stable scene endings. Source take metadata retains those choices. A fresh recording still needs visual review; the export alone does not prove smooth transitions.

## Keep raw data local

Full WebM takes, screenshots, traces, source timings and session/usage evidence are written under ignored `artifacts/`. Do not add raw takes, credentials, native response dumps or local usage state to Git. Only reviewed public media and safe export metadata belong here.

The [original delivery film and evidence](../implementation/24-evidence.md) remain historical. The current film's source/hash and native-call count are in `film.json`; they should change only when the film is actually replaced.
