/* global document, window, sessionStorage, performance, requestAnimationFrame, MutationObserver, fetch, location */
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { arch, cpus, freemem, platform, release, totalmem } from 'node:os'
import { resolve } from 'node:path'
import puppeteer from 'puppeteer-core'
import { startFlow } from 'lighthouse'
import { sourceEvidence, staticEvidence } from './delivery-evidence.mjs'

const directory = resolve('artifacts/performance/22', new Date().toISOString().replaceAll(':', '-'))
await mkdir(directory, { recursive: true })
// Bind every measurement to a fresh build, even when an emulator is already open.
try { await writeFile(`${directory}/build.log`, execFileSync('pnpm', ['build'], { encoding: 'utf8' })) }
catch (error) {
  await writeFile(`${directory}/build.log`, `${error.stdout ?? ''}\n${error.stderr ?? ''}`)
  throw error
}
const origin = 'http://127.0.0.1:4173'
const routes = [
  { name: 'products', path: '/products', identity: null, heading: { ar: 'منتجات التمويل', en: 'Financing products' } },
  { name: 'applicant', path: '/applications', identity: { ar: 'مريم سالم', en: 'Mariam Salem' }, heading: { ar: 'طلباتي', en: 'My applications' } },
  { name: 'queue', path: '/staff/applications', identity: { ar: 'سلمى ناصر', en: 'Salma Nasser' }, heading: { ar: 'قائمة الطلبات', en: 'Application queue' } },
  { name: 'review', path: '/staff/applications/RIFD-2026-007', identity: { ar: 'سلمى ناصر', en: 'Salma Nasser' }, heading: { ar: 'RIFD-2026-007', en: 'RIFD-2026-007' } },
]
const source = await sourceEvidence()
const report = {
  startedAt: new Date().toISOString(), directory, origin, source, staticBuild: await staticEvidence(),
  host: { platform: platform(), release: release(), arch: arch(), cpu: cpus()[0].model, cores: cpus().length, totalMemory: totalmem(), freeMemory: freemem(), node: process.version, pnpm: execFileSync('pnpm', ['--version'], { encoding: 'utf8' }).trim(), firebase: execFileSync('firebase', ['--version'], { encoding: 'utf8' }).trim() },
  dependencies: JSON.parse(await readFile('package.json', 'utf8')),
  protocol: { formFactor: 'mobile', throttlingMethod: 'simulate', disableStorageReset: true, cache: 'CDP clearBrowserCache, setCacheDisabled true then false before each hard navigation', runsPerCombination: 3, diagnosticProbe: process.env.RIFD_AUDIT_PROBE ?? null, execution: process.env.RIFD_AUDIT_PROBE ? 'Diagnostic development probe; not a complete release gate. Concurrent development work may affect these results.' : 'sequential; no concurrent test/build/audit jobs', publicEnglish: 'Empty storage at navigation. English is explicitly selected through the UI inside the measured navigation callback after real startup.', completion: 'Real workspace ready, expected heading, language, route and permitted tab identity, then two animation frames.' },
  runs: [], gates: [], outcome: 'failed',
}
await writeFile(`${directory}/source.json`, JSON.stringify(source, null, 2) + '\n')
console.log(`Performance artifacts: ${directory}`)

async function clickText(page, label) {
  const matches = (button, label) => button.getAttribute('aria-label') === label || button.textContent?.trim() === label
  await page.waitForFunction(label => [...document.querySelectorAll('button')].some(button => (button.getAttribute('aria-label') === label || button.textContent?.trim() === label) && !button.disabled), {}, label)
  for (const button of await page.$$('button')) if (await button.evaluate(matches, label)) { await button.click(); return }
  throw new Error(`Missing button ${label}`)
}
async function ready(page) { await page.waitForSelector('[data-workspace-ready="true"]', { timeout: 180_000 }) }
function verifyUrl(value, route) {
  const url = new URL(value)
  const expected = route.name === 'queue' ? { search: '', status: 'all', product: 'all', assignment: 'all', sort: 'dateDesc', page: '1' } : {}
  if (url.origin !== origin || url.pathname !== route.path || [...url.searchParams].length !== Object.keys(expected).length || Object.entries(expected).some(([key, value]) => url.searchParams.get(key) !== value)) throw new Error(`Wrong route/query: ${value}`)
}
async function verify(page, route, language) {
  await ready(page)
  await page.waitForFunction(({ heading, language }) => document.documentElement.lang === language && document.querySelector('main h1')?.textContent?.trim() === heading, { timeout: 30_000 }, { heading: route.heading[language], language })
  if (route.name === 'review') await page.waitForSelector('#review-information')
  if (route.name === 'queue' || route.name === 'applicant') await page.waitForSelector('[data-application]')
  await page.waitForFunction(() => !document.querySelector('main[aria-busy="true"], main [aria-busy="true"]'))
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  verifyUrl(page.url(), route)
  const evidence = await page.evaluate(() => ({ url: location.href, heading: document.querySelector('main h1')?.textContent, header: document.querySelector('header')?.textContent, session: sessionStorage.getItem('rifd.session.v1'), readyAtMs: performance.now(), startupReadyAtMs: window.rifdReadyAt, resources: performance.getEntriesByType('resource').map(entry => ({ name: entry.name, startTime: entry.startTime, duration: entry.duration, transferSize: entry.transferSize })) }))
  if (route.identity && !evidence.header?.includes(route.identity[language])) throw new Error('Wrong identity')
  return evidence
}

try {
  const server = await fetch(`${origin}/_shell.html`)
  if (!server.ok) throw new Error('Start the local Firebase Hosting emulator before auditing')
  // A probe retains honest reports but can never count as the complete gate.
  const selected = process.env.RIFD_AUDIT_PROBE ? routes.filter(route => route.name === process.env.RIFD_AUDIT_PROBE) : routes
  for (const route of selected) for (const language of ['ar', 'en']) for (let run = 1; run <= (process.env.RIFD_AUDIT_PROBE ? 1 : 3); run++) {
    const name = `${route.name}-${language}-${run}`
    const result = { name, route: route.path, language, run, mode: route.identity ? 'prepared-session' : 'empty-storage-first-visit', accepted: false }
    report.runs.push(result)
    const browser = await puppeteer.launch({ executablePath: '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
    try {
      const page = await browser.newPage()
      await page.evaluateOnNewDocument(() => {
        const observer = new MutationObserver(() => {
          if (document.querySelector('[data-workspace-ready="true"]') && !window.rifdReadyAt) window.rifdReadyAt = performance.now()
        })
        observer.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-workspace-ready'] })
      })
      report.host.chrome = await browser.version()
      if (route.identity) {
        await page.goto(`${origin}${route.path}`)
        await ready(page)
        result.freshStartupMs = await page.evaluate(() => window.rifdReadyAt)
        if (language === 'en') { await clickText(page, 'English'); await page.waitForFunction(() => document.documentElement.lang === 'en') }
        await clickText(page, route.identity[language])
        await verify(page, route, language)
        result.sessionBefore = await page.evaluate(() => sessionStorage.getItem('rifd.session.v1'))
        if (!result.sessionBefore) throw new Error('Missing prepared tab session')
      }
      const flow = await startFlow(page, { name, config: { extends: 'lighthouse:default', settings: { onlyCategories: ['performance'], disableStorageReset: true, formFactor: 'mobile', throttlingMethod: 'simulate' } } })
      const cdp = await page.createCDPSession()
      await cdp.send('Network.enable')
      await cdp.send('Network.clearBrowserCache')
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: false })
      await flow.navigate(async () => {
        await page.goto(`${origin}${route.path}`, { waitUntil: 'load', timeout: 180_000 })
        await ready(page)
        if (!route.identity && language === 'en') await clickText(page, 'English')
        result.screen = await verify(page, route, language)
      })
      const flowResult = await flow.createFlowResult()
      const step = flowResult.steps[0]
      const lhr = step.lhr
      const artifacts = flow.createArtifactsJson().gatherSteps[0].artifacts
      await writeFile(`${directory}/${name}.html`, await flow.generateReport())
      await writeFile(`${directory}/${name}.json`, JSON.stringify(lhr))
      await writeFile(`${directory}/${name}.trace.json`, JSON.stringify(artifacts.Trace))
      await writeFile(`${directory}/${name}.network.json`, JSON.stringify(artifacts.DevtoolsLog))
      await page.screenshot({ path: `${directory}/${name}.png`, fullPage: true })
      if (lhr.runtimeError) throw new Error(lhr.runtimeError.message)
      verifyUrl(lhr.finalDisplayedUrl, route)
      if (!lhr.configSettings.disableStorageReset) throw new Error('Audit reset storage')
      const cached = new Set(artifacts.DevtoolsLog.filter(entry => entry.method === 'Network.requestServedFromCache').map(entry => entry.params.requestId))
      const seen = new Set()
      result.coldRequests = artifacts.DevtoolsLog.filter(entry => entry.method === 'Network.responseReceived').filter(entry => {
        const url = entry.params.response.url
        if (!url.startsWith(origin) || seen.has(url)) return false
        seen.add(url); return true
      }).map(entry => ({ url: entry.params.response.url, cached: cached.has(entry.params.requestId) || !!entry.params.response.fromDiskCache || !!entry.params.response.fromServiceWorker || !!entry.params.response.fromPrefetchCache }))
      const coldUrls = result.coldRequests.map(request => request.url)
      if (!coldUrls.includes(`${origin}${route.path}`) || !['.js', '.css', 'NotoSans-Regular.woff2', 'NotoSansArabic-Regular.woff2'].every(suffix => coldUrls.some(url => url.endsWith(suffix)))) throw new Error('Missing cold document, script, stylesheet or font request evidence')
      if (result.coldRequests.some(request => request.cached)) throw new Error('A first HTTP resource request was served from cache')
      const final = await verify(page, route, language)
      if (route.identity && result.sessionBefore !== final.session) throw new Error('Prepared tab session changed during audit')
      Object.assign(result, { accepted: true, score: lhr.categories.performance.score * 100, cls: lhr.audits['cumulative-layout-shift'].numericValue, readinessMs: result.screen.readyAtMs, lighthouseVersion: lhr.lighthouseVersion, settings: lhr.configSettings, warnings: lhr.runWarnings })
      console.log(`${name}: score ${result.score}, CLS ${result.cls}, ready ${Math.round(result.readinessMs)}ms`)
    } catch (error) { result.error = String(error); console.error(`${name}: ${result.error}`) }
    finally { await browser.close(); await writeFile(`${directory}/run.json`, JSON.stringify(report, null, 2) + '\n') }
  }
  for (const route of routes) for (const language of ['ar', 'en']) {
    const runs = report.runs.filter(run => run.route === route.path && run.language === language)
    const median = runs.filter(run => run.accepted).map(run => run.score).sort((a, b) => a - b)[1]
    report.gates.push({ route: route.path, language, median, passed: runs.length === 3 && runs.every(run => run.accepted && run.cls <= 0.1) && median >= 90 })
  }
  const finalSource = await sourceEvidence()
  if (source.sha256 !== finalSource.sha256) throw new Error('Source changed during measurement. Rerun affected gates.')
  report.outcome = report.gates.every(gate => gate.passed) ? 'passed' : 'failed'
} catch (error) { report.error = String(error) }
finally {
  report.finishedAt = new Date().toISOString()
  await writeFile(`${directory}/run.json`, JSON.stringify(report, null, 2) + '\n')
  console.log(`Performance ${report.outcome}. Reports: ${directory}`)
  if (report.outcome !== 'passed') process.exitCode = 1
}
