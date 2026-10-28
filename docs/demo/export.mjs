import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { spawn, execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';

const directory = resolve(process.argv[2] ?? '');
const destination = resolve('docs/demo');
const result = JSON.parse(await readFile(`${directory}/result.json`, 'utf8'));
if (result.outcome !== 'passed') throw new Error('A complete successful recording is required');
const originalScenes = JSON.parse(await readFile(`${directory}/scenes.json`, 'utf8'));
if (originalScenes.length !== 37) throw new Error('Expected all 37 original walkthrough scenes');
for (let chapter = 1; chapter <= 7; chapter++)
  if (
    originalScenes
      .filter(scene => scene.chapter === chapter)
      .reduce((sum, scene) => sum + scene.duration, 0) !== 35
  )
    throw new Error(`Chapter ${chapter} must total 35 seconds`);
const recording = JSON.parse(await readFile(`${directory}/recording.json`, 'utf8'));
const aiDirectory = process.argv[3] ? resolve(process.argv[3]) : null;
const ai = aiDirectory ? JSON.parse(await readFile(`${aiDirectory}/result.json`, 'utf8')) : null;
const aiRecording = aiDirectory
  ? JSON.parse(await readFile(`${aiDirectory}/recording.json`, 'utf8'))
  : null;
const aiScenes = aiDirectory
  ? JSON.parse(await readFile(`${aiDirectory}/scenes.json`, 'utf8'))
  : [];
if (
  aiDirectory &&
  (ai.outcome !== 'passed' ||
    ai.analysisRequests !== 1 ||
    aiScenes.length !== 8 ||
    aiScenes.reduce((sum, scene) => sum + scene.duration, 0) !== 70)
)
  throw new Error('Expected one real Jev run and all eight AI scenes totaling 70 seconds');
const scenes = [
  ...originalScenes.map(scene => ({
    ...scene,
    chapter: ai && scene.chapter >= 3 ? scene.chapter + 1 : scene.chapter,
    raw: scene.raw ?? recording.raw,
  })),
  ...aiScenes.map(scene => ({ ...scene, raw: scene.raw ?? aiRecording.raw })),
].sort((a, b) => a.chapter - b.chapter);
const titles = [
  ['مقدمة', 'Introduction'],
  ['المنتجات والتقديم', 'Products and application'],
  ['المستندات والتعافي', 'Documents and recovery'],
  ['المتابعة والإشعارات والطباعة', 'Tracking, notifications and print'],
  ['قائمة الطلبات والإسناد', 'Queue and assignment'],
  ['المراجعة والتصحيحات', 'Review and corrections'],
  ['القرارات والسداد', 'Decisions and repayment'],
  ['الوصول والجلسات وإعادة الضبط', 'Access, sessions and reset'],
  ['روابط التسليم', 'Delivery links'],
];
if (ai) titles.splice(3, 0, ['مساعدة Jev للمستندات', 'Jev document assistance']);
const journeyCount = titles.length - 2;
const totalSeconds = 25 + scenes.reduce((sum, scene) => sum + scene.duration, 0);
const runtime = `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
const transitionSeconds = 0.35;
await mkdir(`${directory}/edit`, { recursive: true });
// Trace finalization can outlast the captured video. Match each recorded scene
// to its screenshot instead of deriving an offset from total recording time.
const execute = promisify(execFile),
  frames = new Map(),
  sampleSize = 96 * 63 * 3;
const pixels = async args =>
  (
    await execute('ffmpeg', ['-v', 'error', ...args, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], {
      encoding: 'buffer',
      maxBuffer: 128 * 1024 * 1024,
    })
  ).stdout;
for (const scene of scenes) {
  if (!frames.has(scene.raw))
    frames.set(scene.raw, await pixels(['-i', scene.raw, '-vf', 'fps=10,scale=96:63']));
  const samples = frames.get(scene.raw);
  const reference = await pixels([
    '-i',
    resolve(dirname(scene.raw), `${scene.key}.png`),
    '-frames:v',
    '1',
    '-vf',
    'scale=96:63',
  ]);
  const candidates = [];
  for (
    let index = Math.max(0, Math.floor((scene.start - 3) * 10));
    index < Math.min(samples.length / sampleSize, (scene.end + 5) * 10);
    index++
  ) {
    let error = 0;
    for (let pixel = 0; pixel < sampleSize; pixel += 4)
      error += Math.abs(reference[pixel] - samples[index * sampleSize + pixel]);
    candidates.push({ time: index / 10, error: error / Math.ceil(sampleSize / 4) });
  }
  const minimum = Math.min(...candidates.map(candidate => candidate.error));
  const match = candidates
    .filter(candidate => candidate.error < minimum + 0.1)
    .sort((a, b) => Math.abs(a.time - scene.end + 0.1) - Math.abs(b.time - scene.end + 0.1))[0];
  if (!match || match.error > 8)
    throw Error(`Could not align ${scene.key} with its captured screen`);
  scene.videoOffset = match.time + 0.1 - scene.end;
  scene.alignmentError = Number(match.error.toFixed(3));
  // Keep the hold inside the stable screenshot interval. The following click
  // can close a dialog immediately after capture, before the next scene starts.
  scene.trimEnd ??= 0.6;
}
frames.clear();
async function ffmpeg(args) {
  const child = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: 'inherit',
  });
  const code = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', resolve);
  });
  if (code !== 0) throw new Error(`ffmpeg exited ${code}`);
}
const encoding = [
  '-an',
  '-c:v',
  'libx264',
  '-preset',
  'veryfast',
  '-crf',
  '23',
  '-pix_fmt',
  'yuv420p',
  '-r',
  '20',
  '-threads',
  '4',
];
const intermediateEncoding = [...encoding];
intermediateEncoding[intermediateEncoding.indexOf('-preset') + 1] = 'ultrafast';
intermediateEncoding[intermediateEncoding.indexOf('-crf') + 1] = '18';
const font = (await readFile('public/fonts/NotoSansArabic-Regular.woff2')).toString('base64');
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
  for (const [key, text] of [
    [
      'intro',
      `<h1>رِفد / RIFD</h1><h2>${ai ? 'رحلة التمويل مع مساعدة Jev للمستندات' : 'عرض تمويل تجريبي باللغتين'}</h2><p>Bilingual financing, from application to review</p><p>${ai ? 'واجهات محدثة، فحص ذكي، والقرار بيد المراجع' : 'أشخاص ومنتجات وقرارات افتراضية'}</p><p>Updated local build · ${ai ? 'One real Jev check · ' : ''}${runtime}</p><small>أشخاص وبيانات افتراضية. لا طلبات لبنك ولا مدفوعات.</small>`,
    ],
    [
      'closing',
      '<h1>جرّب رِفد / Explore RIFD</h1><p>github.com/mohammed-najib/rifd-financing-demo</p><h2>التجربة والدليل ودراسة الحالة</h2><p>docs/demo-guide.md · docs/case-study.md</p><p>Local Jev: pnpm dev:jev</p><small>Live demo: rifd-portfolio-mdnb.web.app<br>Recorded from the updated local build. Hosted releases are separate.</small>',
    ],
  ]) {
    await page.setContent(
      `<style>@font-face{font-family:Arabic;src:url(data:font/woff2;base64,${font})}*{box-sizing:border-box}body{margin:0;background:#f4efe6;color:#322e28;font-family:Arabic,sans-serif;display:grid;place-content:center;text-align:center;height:1080px;border-top:18px solid #0b6458}h1{font-size:80px;margin:0 0 24px;color:#0b6458}h2{font-size:36px}p{font-size:28px;margin:16px}small{font-size:22px;color:#70685b;line-height:1.8}</style>${text}`,
    );
    await page.evaluate(() => globalThis.document.fonts.ready);
    await page.screenshot({ path: `${directory}/edit/${key}.png` });
  }
  await page.close();
} finally {
  await browser.close();
}
const clock = seconds =>
  `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${(seconds % 60).toFixed(3).padStart(6, '0')}`;
const assClock = seconds =>
  `${Math.floor(seconds / 3600)}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${(seconds % 60).toFixed(2).padStart(5, '0')}`;
const events = [];
let vtt = 'WEBVTT\n\n';
let cursor = 0;
const files = [];
const timeline = [];
function caption(duration, ar, en, title, label = '') {
  const start = cursor,
    end = cursor + duration;
  events.push(
    `Dialogue: 0,${assClock(start)},${assClock(end)},Caption,,0,0,0,,{\\fad(180,180)\\fs32}${ar}\\N{\\fs23}${en}`,
  );
  events.push(
    `Dialogue: 0,${assClock(start)},${assClock(end)},Title,,0,0,0,,{\\fad(180,180)}${title}${label ? ` | ${label}` : ''}`,
  );
  vtt += `${clock(start)} --> ${clock(end)}\n${ar}\n${en}\n\n`;
  timeline.push({ start, end, ar, en, label });
  cursor = end;
}
await ffmpeg([
  '-loop',
  '1',
  '-i',
  `${directory}/edit/intro.png`,
  '-t',
  '10',
  ...intermediateEncoding,
  `${directory}/edit/00.mp4`,
]);
files.push(`${directory}/edit/00.mp4`);
caption(
  10,
  'رِفد: عرض خيالي محلي باللغتين',
  'RIFD: a fictional bilingual browser-local demo',
  'رِفد / RIFD',
);
for (const [index, scene] of scenes.entries()) {
  console.log(`Exporting ${scene.key}`);
  const length = scene.end - scene.start - (scene.trimStart ?? 0) - scene.trimEnd;
  if (length <= 0) throw Error(`Scene ${scene.key} has no captured footage`);
  const speed = Math.min(1, scene.duration / length);
  const filter = `setpts=${speed}*(PTS-STARTPTS),fps=20,pad=1440:1080:0:50:color=0x0b6458,tpad=stop_mode=clone:stop_duration=${scene.duration},trim=duration=${scene.duration}`;
  const file = `${directory}/edit/${String(index + 1).padStart(2, '0')}.mp4`;
  await ffmpeg([
    '-ss',
    String(Math.max(0, scene.start + (scene.videoOffset ?? 0) + (scene.trimStart ?? 0))),
    '-t',
    String(length),
    '-i',
    scene.raw ?? recording.raw,
    '-vf',
    filter,
    '-t',
    String(scene.duration),
    ...intermediateEncoding,
    file,
  ]);
  files.push(file);
  caption(
    scene.duration,
    scene.ar,
    scene.en,
    `${scene.chapter}/${journeyCount} {\\fs26}${titles[scene.chapter][0]}{\\fs18} / ${titles[scene.chapter][1]}`,
    `${scene.identity} · ${scene.record.match(/^\d{3}$/) ? `RIFD-2026-${scene.record}` : scene.record}`,
  );
}
await ffmpeg([
  '-loop',
  '1',
  '-i',
  `${directory}/edit/closing.png`,
  '-t',
  '15',
  ...intermediateEncoding,
  `${directory}/edit/99.mp4`,
]);
files.push(`${directory}/edit/99.mp4`);
caption(
  15,
  'الدليل والأدلة ودراسة الحالة وروابط التجربة في المستودع',
  'Find the live demo, chapter guide, evidence and case study in the repository',
  'روابط التسليم / Delivery links',
);
if (cursor !== totalSeconds) throw new Error('Film timeline does not match the scene durations');
const ass = `[Script Info]\nScriptType: v4.00+\nPlayResX: 1440\nPlayResY: 1080\nWrapStyle: 0\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Caption,Noto Sans Arabic,23,&H00FFFFFF,&H00FFFFFF,&H00183B30,&H00183B30,0,0,0,0,100,100,0,0,1,1,0,2,15,15,8,1\nStyle: Title,Noto Sans Arabic,18,&H00FFFFFF,&H00FFFFFF,&H00183B30,&H00183B30,0,0,0,0,100,100,0,0,1,1,0,8,10,10,8,1\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n${events.join('\n')}\n`;
await writeFile(`${directory}/edit/captions.ass`, ass);
await writeFile(`${destination}/captions.vtt`, vtt.trimEnd() + '\n');
// Blend each new scene over the preceding final frame. Encoding one boundary
// at a time avoids opening dozens of full-resolution decoders together. The
// crossfade occupies the start of the new scene, preserving every caption time.
const smoothFiles = [files[0]];
for (let index = 1; index < files.length; index++) {
  const previousFrame = `${directory}/edit/last-${index}.png`;
  await ffmpeg(['-sseof', '-0.1', '-i', files[index - 1], '-frames:v', '1', previousFrame]);
  const file = `${directory}/edit/smooth-${index}.mp4`;
  const duration = index === files.length - 1 ? 15 : scenes[index - 1].duration;
  console.log(`Crossfade ${index}/${files.length - 1}`);
  await ffmpeg([
    '-loop',
    '1',
    '-t',
    String(transitionSeconds),
    '-i',
    previousFrame,
    '-i',
    files[index],
    '-filter_complex',
    `[0:v]fps=20,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[a];[1:v]fps=20,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[b];[a][b]xfade=transition=fade:duration=${transitionSeconds}:offset=0`,
    '-t',
    String(duration),
    ...intermediateEncoding,
    file,
  ]);
  smoothFiles.push(file);
}
await writeFile(
  `${directory}/edit/concat.txt`,
  smoothFiles.map(file => `file '${file.replaceAll("'", "'\\''")}'`).join('\n') + '\n',
);
await ffmpeg([
  '-f',
  'concat',
  '-safe',
  '0',
  '-i',
  `${directory}/edit/concat.txt`,
  '-c',
  'copy',
  `${directory}/edit/assembled.mp4`,
]);
let chapterCursor = 10;
const chapters = [
  { start: 0, end: 10, title: 'Introduction / مقدمة' },
  ...Array.from({ length: journeyCount }, (_, i) => {
    const start = chapterCursor;
    chapterCursor += scenes
      .filter(scene => scene.chapter === i + 1)
      .reduce((sum, scene) => sum + scene.duration, 0);
    return {
      start,
      end: chapterCursor,
      title: `${i + 1}. ${titles[i + 1][1]} / ${titles[i + 1][0]}`,
    };
  }),
  { start: chapterCursor, end: totalSeconds, title: 'Delivery links / روابط التسليم' },
];
const metadata =
  ';FFMETADATA1\ntitle=RIFD / رِفد\n' +
  chapters
    .map(
      chapter =>
        `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${chapter.start * 1000}\nEND=${chapter.end * 1000}\ntitle=${chapter.title}\n`,
    )
    .join('');
await writeFile(`${destination}/chapters.ffmetadata`, metadata);
// Font files stay local. libass shapes Arabic and uses the host's Noto fonts.
await ffmpeg([
  '-i',
  `${directory}/edit/assembled.mp4`,
  '-i',
  `${destination}/chapters.ffmetadata`,
  '-map_metadata',
  '1',
  '-map_chapters',
  '1',
  '-vf',
  `ass=${directory}/edit/captions.ass`,
  '-t',
  String(totalSeconds),
  ...encoding,
  '-movflags',
  '+faststart',
  `${destination}/rifd-demo.mp4`,
]);
const probe = JSON.parse(
  execFileSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_format',
      '-show_streams',
      '-show_chapters',
      '-of',
      'json',
      `${destination}/rifd-demo.mp4`,
    ],
    { encoding: 'utf8' },
  ),
);
if (
  Number(probe.format.duration) !== totalSeconds ||
  probe.chapters.length !== chapters.length ||
  probe.chapters.some(
    (chapter, index) =>
      Number(chapter.start_time) !== chapters[index].start ||
      Number(chapter.end_time) !== chapters[index].end,
  )
)
  throw new Error('Exported duration or chapter metadata is wrong');
const sha = async path =>
  createHash('sha256')
    .update(await readFile(path))
    .digest('hex');
probe.format.filename = relative(process.cwd(), probe.format.filename);
await writeFile(
  `${destination}/film.json`,
  JSON.stringify(
    {
      recordedAt: result.recordedAt,
      exportedAt: new Date().toISOString(),
      sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      origin: result.origin,
      browser: result.browser,
      viewport: { width: 1440, height: 950 },
      video: {
        width: 1440,
        height: 1080,
        fps: 20,
        seconds: totalSeconds,
        sha256: await sha(`${destination}/rifd-demo.mp4`),
      },
      transitions: { type: 'crossfade', seconds: transitionSeconds, count: smoothFiles.length - 1 },
      raw: { path: relative(process.cwd(), recording.raw), sha256: await sha(recording.raw) },
      traceSha256: await sha(`${directory}/trace.zip`),
      captionsSha256: await sha(`${destination}/captions.vtt`),
      ai: ai
        ? {
            ...ai,
            nativeRun: JSON.parse(await readFile(`${aiDirectory}/native-run.json`, 'utf8')),
            traceSha256: await sha(`${aiDirectory}/trace.zip`),
          }
        : null,
      rejectionId: result.rejectionId,
      chapters,
      scenes: timeline,
      edits: scenes.map(scene => ({ ...scene, raw: relative(process.cwd(), scene.raw) })),
      supplementary: await Promise.all(
        [...new Set(scenes.map(scene => scene.raw))]
          .filter(path => path !== recording.raw)
          .map(async path => ({ path: relative(process.cwd(), path), sha256: await sha(path) })),
      ),
      probe,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `Export verified: ${runtime}, ${journeyCount} journey chapters, ${smoothFiles.length - 1} crossfades.`,
);
