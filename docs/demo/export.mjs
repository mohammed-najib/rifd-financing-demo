import { chromium } from '@playwright/test'
import { createHash } from 'node:crypto'
import { spawn, execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const directory = resolve(process.argv[2] ?? '')
const destination = resolve('docs/demo')
const result = JSON.parse(await readFile(`${directory}/result.json`, 'utf8'))
if (result.outcome !== 'passed') throw new Error('A complete successful recording is required')
const scenes = JSON.parse(await readFile(`${directory}/scenes.json`, 'utf8')).sort((a, b) => a.chapter - b.chapter)
if (scenes.length !== 37) throw new Error('Expected all 37 recorded scenes')
for (let chapter = 1; chapter <= 7; chapter++) if (scenes.filter(scene => scene.chapter === chapter).reduce((sum, scene) => sum + scene.duration, 0) !== 35) throw new Error(`Chapter ${chapter} must total 35 seconds`)
const recording = JSON.parse(await readFile(`${directory}/recording.json`, 'utf8'))
const titles = [
  ['مقدمة', 'Introduction'], ['المنتجات والتقديم', 'Products and application'], ['المستندات والتعافي', 'Documents and recovery'],
  ['المتابعة والإشعارات والطباعة', 'Tracking, notifications and print'], ['قائمة الطلبات والإسناد', 'Queue and assignment'],
  ['المراجعة والتصحيحات', 'Review and corrections'], ['القرارات والسداد', 'Decisions and repayment'], ['الوصول والجلسات وإعادة الضبط', 'Access, sessions and reset'], ['روابط التسليم', 'Delivery links'],
]
await mkdir(`${directory}/edit`, { recursive: true })
async function ffmpeg(args) {
  const child = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })
  const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve) })
  if (code !== 0) throw new Error(`ffmpeg exited ${code}`)
}
const encoding = ['-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '25', '-pix_fmt', 'yuv420p', '-r', '20']
const font = (await readFile('public/fonts/NotoSansArabic-Regular.woff2')).toString('base64')
const browser = await chromium.launch({ channel: 'chrome' })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } })
  for (const [key, text] of [
    ['intro', '<h1>رِفد / RIFD</h1><h2>عرض تمويل تجريبي باللغتين</h2><p>Fictional bilingual financing application and review</p><p>بيانات محلية في هذا المتصفح. لا طلبات لبنك ولا مدفوعات.</p><p>Browser-local data. Simulated identities and decisions.</p><p>Seven journeys · 35 seconds each · 4:30</p>'],
    ['closing', '<h1>جرّب رِفد / Explore RIFD</h1><p>rifd-portfolio-mdnb.web.app</p><p>github.com/mohammed-najib/rifd-financing-demo</p><h2>الدليل والأدلة ودراسة الحالة في المستودع</h2><p>docs/demo-guide.md · docs/acceptance · docs/case-study.md</p><p>Fictional people, products and decisions. No real payment.</p>'],
  ]) {
    await page.setContent(`<style>@font-face{font-family:Arabic;src:url(data:font/woff2;base64,${font})}*{box-sizing:border-box}body{margin:0;background:#edf2ee;color:#183b30;font-family:Arabic,sans-serif;display:grid;place-content:center;text-align:center;height:1080px;border-top:24px solid #27634d}h1{font-size:80px;margin:0 0 24px}h2{font-size:36px}p{font-size:28px;margin:16px}</style>${text}`)
    await page.evaluate(() => globalThis.document.fonts.ready)
    await page.screenshot({ path: `${directory}/edit/${key}.png` })
  }
  await page.close()
} finally { await browser.close() }
const clock = seconds => `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${(seconds % 60).toFixed(3).padStart(6, '0')}`
const assClock = seconds => `${Math.floor(seconds / 3600)}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${(seconds % 60).toFixed(2).padStart(5, '0')}`
const events = []
let vtt = 'WEBVTT\n\n'
let cursor = 0
const files = []
const timeline = []
function caption(duration, ar, en, title, label = '') {
  const start = cursor, end = cursor + duration
  events.push(`Dialogue: 0,${assClock(start)},${assClock(end)},Caption,,0,0,0,,{\\fs32}${ar}\\N{\\fs23}${en}`)
  events.push(`Dialogue: 0,${assClock(start)},${assClock(end)},Title,,0,0,0,,${title}${label ? ` | ${label}` : ''}`)
  vtt += `${clock(start)} --> ${clock(end)}\n${ar}\n${en}\n\n`
  timeline.push({ start, end, ar, en, label })
  cursor = end
}
await ffmpeg(['-loop', '1', '-i', `${directory}/edit/intro.png`, '-t', '10', ...encoding, `${directory}/edit/00.mp4`])
files.push(`${directory}/edit/00.mp4`)
caption(10, 'رِفد: عرض خيالي محلي باللغتين', 'RIFD: a fictional bilingual browser-local demo', 'رِفد / RIFD')
for (const [index, scene] of scenes.entries()) {
  console.log(`Exporting ${scene.key}`)
  const length = scene.end - scene.start - (scene.trimStart ?? 0)
  const speed = Math.min(1, scene.duration / length)
  const filter = `setpts=${speed}*(PTS-STARTPTS),fps=20,pad=1440:1080:0:50:color=0x183b30,tpad=stop_mode=clone:stop_duration=${scene.duration},trim=duration=${scene.duration}`
  const file = `${directory}/edit/${String(index + 1).padStart(2, '0')}.mp4`
  await ffmpeg(['-ss', String(Math.max(0, scene.start + (scene.videoOffset ?? 0) + (scene.trimStart ?? 0))), '-t', String(length), '-i', scene.raw ?? recording.raw, '-vf', filter, '-t', String(scene.duration), ...encoding, file])
  files.push(file)
  caption(scene.duration, scene.ar, scene.en, `${scene.chapter}/7 {\\fs26}${titles[scene.chapter][0]}{\\fs18} / ${titles[scene.chapter][1]}`, `${scene.identity} · ${scene.record.match(/^\d{3}$/) ? `RIFD-2026-${scene.record}` : scene.record}`)
}
await ffmpeg(['-loop', '1', '-i', `${directory}/edit/closing.png`, '-t', '15', ...encoding, `${directory}/edit/99.mp4`])
files.push(`${directory}/edit/99.mp4`)
caption(15, 'الدليل والأدلة ودراسة الحالة وروابط التجربة في المستودع', 'Find the live demo, chapter guide, evidence and case study in the repository', 'روابط التسليم / Delivery links')
if (cursor !== 270) throw new Error('Film timeline must be 270 seconds')
const ass = `[Script Info]\nScriptType: v4.00+\nPlayResX: 1440\nPlayResY: 1080\nWrapStyle: 0\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Caption,Noto Sans Arabic,23,&H00FFFFFF,&H00FFFFFF,&H00183B30,&H00183B30,0,0,0,0,100,100,0,0,1,1,0,2,15,15,8,1\nStyle: Title,Noto Sans Arabic,18,&H00FFFFFF,&H00FFFFFF,&H00183B30,&H00183B30,0,0,0,0,100,100,0,0,1,1,0,8,10,10,8,1\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n${events.join('\n')}\n`
await writeFile(`${directory}/edit/captions.ass`, ass)
await writeFile(`${destination}/captions.vtt`, vtt.trimEnd() + '\n')
await writeFile(`${directory}/edit/concat.txt`, files.map(file => `file '${file.replaceAll("'", "'\\''")}'`).join('\n') + '\n')
await ffmpeg(['-f', 'concat', '-safe', '0', '-i', `${directory}/edit/concat.txt`, '-c', 'copy', `${directory}/edit/assembled.mp4`])
const chapters = [{ start: 0, end: 10, title: 'Introduction / مقدمة' }, ...Array.from({ length: 7 }, (_, i) => ({ start: 10 + i * 35, end: 45 + i * 35, title: `${i + 1}. ${titles[i + 1][1]} / ${titles[i + 1][0]}` })), { start: 255, end: 270, title: 'Delivery links / روابط التسليم' }]
const metadata = ';FFMETADATA1\ntitle=RIFD / رِفد\n' + chapters.map(chapter => `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${chapter.start * 1000}\nEND=${chapter.end * 1000}\ntitle=${chapter.title}\n`).join('')
await writeFile(`${destination}/chapters.ffmetadata`, metadata)
// Font files stay local. libass shapes Arabic and uses the host's Noto fonts.
await ffmpeg(['-i', `${directory}/edit/assembled.mp4`, '-i', `${destination}/chapters.ffmetadata`, '-map_metadata', '1', '-map_chapters', '1', '-vf', `ass=${directory}/edit/captions.ass`, '-t', '270', ...encoding, '-movflags', '+faststart', `${destination}/rifd-demo.mp4`])
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-show_chapters', '-of', 'json', `${destination}/rifd-demo.mp4`], { encoding: 'utf8' }))
if (Number(probe.format.duration) !== 270 || probe.chapters.length !== 9 || probe.chapters.slice(1, 8).some(chapter => Number(chapter.end_time) - Number(chapter.start_time) !== 35)) throw new Error('Exported duration or chapter metadata is wrong')
const sha = async path => createHash('sha256').update(await readFile(path)).digest('hex')
await writeFile(`${destination}/film.json`, JSON.stringify({ recordedAt: result.recordedAt, exportedAt: new Date().toISOString(), origin: result.origin, browser: result.browser, viewport: { width: 1440, height: 950 }, video: { width: 1440, height: 1080, fps: 20, seconds: 270, sha256: await sha(`${destination}/rifd-demo.mp4`) }, raw: { path: recording.raw, sha256: await sha(recording.raw) }, traceSha256: await sha(`${directory}/trace.zip`), captionsSha256: await sha(`${destination}/captions.vtt`), rejectionId: result.rejectionId, chapters, scenes: timeline, edits: scenes, supplementary: await Promise.all([...new Set(scenes.map(scene => scene.raw).filter(Boolean))].map(async path => ({ path, sha256: await sha(path) }))), probe }, null, 2) + '\n')
console.log('Export verified: 270 seconds, seven 35-second journey chapters, 10-second introduction and 15-second closing.')
