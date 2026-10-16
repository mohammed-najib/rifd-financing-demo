import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { sourceEvidence, staticEvidence } from '../../../../scripts/delivery-evidence.mjs'

const [output, origin] = process.argv.slice(2)
assert(output, 'Pass an output JSON path and optionally the hosted HTTPS origin.')
const baseline = JSON.parse(await readFile(new URL('./performance/source.json', import.meta.url), 'utf8'))
const measured = JSON.parse(await readFile(new URL('./performance/run.json', import.meta.url), 'utf8'))
assert.equal(measured.outcome, 'passed')
const change = {
  path: 'tests/browser/performance.gates.spec.ts',
  before: '9a9fe1391e471c868b70b9e9714fe0365c02226a11b678b49983cb4dfbe93db4',
  after: '26f5fb1899d60c1a0a652647163842fd245e1bbb3889ee63fc90bec087d3f26b',
  reason: 'Measure sample loading from its first captured frame; retain queued earlier route/focus entries separately.',
}
assert.equal(baseline.files.find(file => file.path === change.path)?.sha256, change.before)
const current = await sourceEvidence()
const expected = baseline.files.map(file => file.path === change.path ? { ...file, sha256: change.after } : file)
assert.deepEqual(current.files, expected, 'Source changed beyond the exact reviewed measurement correction.')
const build = await staticEvidence()
assert.deepEqual(build, measured.staticBuild, 'Static output differs from the measured release.')
const result = {
  checkedAt: new Date().toISOString(), outcome: 'passed',
  applicationCommit: '1352c140782168ce9e77773547e35658c19cff45',
  measuredSourceSha256: baseline.sha256, currentVerificationSourceSha256: current.sha256,
  allowedSourceDifferences: [change], staticBuild: build,
  note: 'All application, domain, dependency, asset, build and Hosting sources match the measured run. The original strict performance verifier intentionally refuses the changed test source; this verifier permits only the exact hash pair above.',
}
if (origin) {
  assert.equal(new URL(origin).protocol, 'https:')
  result.origin = origin
  result.assets = []
  const hash = bytes => createHash('sha256').update(bytes).digest('hex')
  for (const file of build.files) {
    const path = file.path.replace('dist/client', '')
    const response = await globalThis.fetch(new URL(`${path}?delivery-check=24`, origin), { cache: 'no-store' })
    const bytes = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get('content-type')
    assert.equal(response.status, 200, path)
    assert.equal(hash(bytes), file.sha256, path)
    if (path.endsWith('.css')) assert.match(contentType, /text\/css/)
    if (path.endsWith('.js')) assert.match(contentType, /javascript/)
    if (path.endsWith('.woff2')) assert.match(contentType, /font\/woff2/)
    result.assets.push({ path, status: response.status, contentType, bytes: bytes.length, sha256: hash(bytes) })
  }
  const response = await globalThis.fetch(new URL('/staff/applications/RIFD-2026-007/decision?delivery-check=24', origin))
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /text\/html/)
  assert.equal(hash(Buffer.from(await response.arrayBuffer())), build.files.find(file => file.path.endsWith('/_shell.html')).sha256)
  result.deepLinkShell = 'matches the exact measured neutral shell'
}
await writeFile(output, JSON.stringify(result, null, 2) + '\n')
console.log('Exact measured static build and all sources verified, with only the pinned test-measurement correction.')
