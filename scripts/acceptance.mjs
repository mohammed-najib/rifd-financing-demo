import { execFileSync, spawn } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { arch, platform, release } from 'node:os'
import { resolve } from 'node:path'
import { chromium, firefox, webkit } from '@playwright/test'
import { sourceEvidence, staticEvidence } from './delivery-evidence.mjs'

// Every invocation has its own reports. A focused recheck cannot erase the
// complete run's failures, screenshots or traces.
const slice = process.env.RIFD_ACCEPTANCE_SLICE ?? '20'
if (!/^[1-9]\d*$/.test(slice)) throw new Error('RIFD_ACCEPTANCE_SLICE must be a positive issue number')
const directory = resolve('artifacts/acceptance', slice, new Date().toISOString().replaceAll(':', '-'))
await mkdir(directory, { recursive: true })
const source = await sourceEvidence()
await writeFile(`${directory}/source.json`, JSON.stringify(source, null, 2) + '\n')
const report = {
  startedAt: new Date().toISOString(), directory, source: { head: source.head, sha256: source.sha256 },
  host: { platform: platform(), release: release(), arch: arch(), node: process.version, pnpm: execFileSync('pnpm', ['--version'], { encoding: 'utf8' }).trim(), playwright: JSON.parse(await readFile('node_modules/@playwright/test/package.json', 'utf8')).version },
  browsers: [], steps: [], outcome: 'failed',
}
const env = { ...process.env, RIFD_ACCEPTANCE_DIR: directory }
async function run(name, args) {
  const started = Date.now()
  const log = createWriteStream(`${directory}/${name}.log`)
  console.log(`Running pnpm ${args.join(' ')}`)
  const child = spawn('pnpm', args, { env, stdio: ['ignore', 'pipe', 'pipe'] })
  child.stdout.on('data', data => { log.write(data); process.stdout.write(data) })
  child.stderr.on('data', data => { log.write(data); process.stderr.write(data) })
  const exitCode = await new Promise((resolve, reject) => { child.on('error', reject); child.on('close', code => resolve(code ?? 1)) })
  await new Promise(resolve => log.end(resolve))
  report.steps.push({ name, command: ['pnpm', ...args], exitCode, durationMs: Date.now() - started })
  return exitCode === 0
}
try {
  for (const [name, browserType, options] of [
    ['chrome', chromium, { channel: 'chrome' }],
    ['firefox', firefox, {}],
    ['webkit', webkit, { executablePath: process.env.RIFD_WEBKIT_EXECUTABLE }],
  ]) {
    const browser = await browserType.launch(options)
    try { report.browsers.push({ name, version: browser.version(), executable: name === 'chrome' ? 'installed chrome channel' : options.executablePath ?? browserType.executablePath(), ...(name === 'chrome' ? {} : { bundledExecutable: browserType.executablePath() }) }) }
    finally { await browser.close() }
  }
  for (const name of ['typecheck', 'lint', 'test', 'test:skills', 'skills:check']) await run(name.replaceAll(':', '-'), [name])
  if (await run('build', ['build:test'])) {
    report.staticBuild = (await staticEvidence()).files
    await run('api', ['test:browser:api', '--workers=3', '--timeout=180000'])
    await run('screens', ['test:browser', '--workers=3', '--timeout=180000'])
    await run('delivery', ['test:delivery'])
    report.suites = await Promise.all(['api', 'screens', 'delivery'].map(async name => {
      const result = JSON.parse(await readFile(`${directory}/${name}/report.json`, 'utf8'))
      return { name, ...result.stats }
    }))
  }
  report.outcome = report.steps.length === 9 && report.steps.every(step => step.exitCode === 0) ? 'passed' : 'failed'
} catch (error) {
  report.error = String(error)
} finally {
  report.finishedAt = new Date().toISOString()
  await writeFile(`${directory}/run.json`, JSON.stringify(report, null, 2) + '\n')
  console.log(`Acceptance ${report.outcome}. Reports: ${directory}`)
  if (report.outcome !== 'passed') process.exitCode = 1
}
