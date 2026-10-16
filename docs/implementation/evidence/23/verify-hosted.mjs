import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { sourceEvidence, staticEvidence } from '../../../../scripts/delivery-evidence.mjs'

const [origin, output] = process.argv.slice(2)
assert(origin && output, 'Pass the hosted HTTPS origin and output JSON path.')
assert.equal(new URL(origin).protocol, 'https:')
const baseline = JSON.parse(await readFile(new URL('./verified-build.json', import.meta.url), 'utf8'))
const source = await sourceEvidence()
const build = await staticEvidence()
assert.equal(source.sha256, baseline.sourceSha256, 'Source changed. Recheck affected acceptance gates.')
assert.deepEqual(build, baseline.staticBuild, 'Build changed. Recheck affected acceptance gates.')

const results = []
for (const file of build.files) {
  const path = file.path.replace('dist/client', '')
  const response = await globalThis.fetch(new URL(`${path}?release-check=23`, origin), { cache: 'no-store' })
  const bytes = Buffer.from(await response.arrayBuffer())
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  assert.equal(response.status, 200, path)
  assert.equal(sha256, file.sha256, path)
  const contentType = response.headers.get('content-type')
  if (path.endsWith('.css')) assert.match(contentType, /text\/css/)
  if (path.endsWith('.js')) assert.match(contentType, /javascript/)
  if (path.endsWith('.woff2')) assert.match(contentType, /font\/woff2/)
  results.push({ path, status: response.status, contentType, bytes: bytes.length, sha256 })
}
const response = await globalThis.fetch(new URL('/staff/applications/RIFD-2026-007/decision?release-check=23', origin))
assert.equal(response.status, 200)
assert.match(response.headers.get('content-type'), /text\/html/)
assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'), build.files.find(file => file.path.endsWith('/_shell.html')).sha256)
await writeFile(output, JSON.stringify({ checkedAt: new Date().toISOString(), origin, outcome: 'passed', applicationCommit: baseline.commit, sourceSha256: source.sha256, deepLinkShell: 'matches the verified neutral shell', assets: results }, null, 2) + '\n')
console.log(`${origin}: all ${results.length} static files match the verified build; deep link serves the neutral shell.`)
