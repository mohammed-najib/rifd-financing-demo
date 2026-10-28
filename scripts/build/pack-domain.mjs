import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inspectSkills } from '../skills/skill-sources.mjs'
import { listIntentSkills, loadIntentSkill } from '@tanstack/intent/core'

const root = fileURLToPath(new URL('../../', import.meta.url))
const packageRoot = join(root, 'packages/rifd-domain')
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
if (pkg.private !== true || pkg.publishConfig?.access === 'public') {
  throw new Error('Local package verification requires private: true and no public publish setting')
}
const destination = join(root, 'artifacts')
mkdirSync(destination, { recursive: true })
execFileSync('npm', ['pack', '--pack-destination', destination], {
  cwd: packageRoot,
  env: { ...process.env, npm_config_cache: '/tmp/rifd-npm-cache' },
  stdio: 'inherit',
})
const archive = join(destination, `${pkg.name.replace(/^@/, '').replace('/', '-')}-${pkg.version}.tgz`)
const entries = new Set(execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trim().split('\n'))
const packedManifest = JSON.parse(execFileSync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' }))
if (packedManifest.private !== true || packedManifest.publishConfig?.access === 'public') {
  throw new Error('Packed manifest must block registry publication')
}
const expected = ['package.json', 'README.md', 'skills/source-reviews.json']
for (const name of ['index', 'application', 'model']) expected.push(`dist/${name}.js`, `dist/${name}.d.ts`)
for (const skill of inspectSkills(packageRoot)) {
  expected.push(`skills/${skill.name}/SKILL.md`, ...Object.keys(skill.sources))
}
for (const file of expected) {
  if (!entries.has(`package/${file}`)) throw new Error(`Tarball is missing ${file}`)
}
for (const entry of entries) {
  if (!/^package\/(?:package\.json|README\.md|(?:dist|src|skills)\/.*)$/.test(entry)) {
    throw new Error(`Unexpected tarball entry: ${entry}`)
  }
}
console.log(`Verified ${entries.size} tarball files: ${archive}`)

const consumer = mkdtempSync(join(tmpdir(), 'rifd-packed-consumer-'))
try {
  const installed = join(consumer, 'node_modules/@rifd/domain')
  mkdirSync(installed, { recursive: true })
  execFileSync('tar', ['-xzf', archive, '-C', installed, '--strip-components=1'])
  symlinkSync(realpathSync(join(root, 'node_modules/zod')), join(consumer, 'node_modules/zod'))
  mkdirSync(join(consumer, '.git'))
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({
    name: 'packed-consumer', type: 'module', dependencies: { '@rifd/domain': pkg.version },
    intent: { skills: ['@rifd/domain#validate-application', '@rifd/domain#freeze-repayment'], exclude: ['*#experimental-*'] },
  }))
  const catalog = listIntentSkills({ cwd: consumer })
  if (catalog.skills.length !== 2 || catalog.skills.some(skill => skill.packageVersion !== pkg.version)) {
    throw new Error('Packed skills were not discovered at the released version')
  }
  for (const skill of catalog.skills) loadIntentSkill(skill.use, { cwd: consumer })
  const example = `
import { parseWholeYER, freezeRepayment, products } from '@rifd/domain'
import { fieldsSchema } from '@rifd/domain/model'
import { resolveStep } from '@rifd/domain/application'
const amount = parseWholeYER('١٠٠٬٠١٠')
if (amount !== 100010) throw new Error('Packed parser failed')
const snapshot = freezeRepayment(amount, 6, products.inventory, '2026-10-14')
if (snapshot.total !== 105011 || snapshot.rows[5].amount !== 17506) throw new Error('Packed repayment failed')
if (resolveStep('invalid') !== 'personal' || fieldsSchema.safeParse({}).success) throw new Error('Packed subpath failed')
`
  writeFileSync(join(consumer, 'example.mjs'), example)
  writeFileSync(join(consumer, 'example.mts'), example)
  execFileSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--strict', '--skipLibCheck', '--target', 'ES2022', '--module', 'NodeNext', join(consumer, 'example.mts')], { stdio: 'inherit' })
  execFileSync(process.execPath, [join(consumer, 'example.mjs')], { stdio: 'inherit' })
  console.log('Verified packed ESM imports, TypeScript declarations and task-specific skill loading')
} finally {
  rmSync(consumer, { recursive: true, force: true })
}
