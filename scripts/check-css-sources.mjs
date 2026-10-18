import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'

const id = randomUUID()
const probes = [
  [`src/delivery-scan-${id}.html`, 'production'],
  [`docs/delivery-scan-${id}.html`, 'documentation'],
  [`artifacts/delivery-scan-${id}.html`, 'archive'],
]
const created = []
try {
  await mkdir('artifacts', { recursive: true })
  for (const [path, label] of probes) {
    await writeFile(path, `<div class="[--rifd-${label}-scan:1]"></div>`, { flag: 'wx' })
    created.push(path)
  }
  execFileSync('pnpm', ['build'], { stdio: 'inherit' })
  const css = (await Promise.all((await readdir('dist/client/assets')).filter(path => path.endsWith('.css')).map(path => readFile(`dist/client/assets/${path}`, 'utf8')))).join('\n')
  if (!css.includes('--rifd-production-scan:1')) throw new Error('Production source is missing from compiled CSS')
  if (css.includes('--rifd-documentation-scan') || css.includes('--rifd-archive-scan')) throw new Error('Nonproduction sources reached compiled CSS')
  console.log('CSS scanning passed: production included; documentation and archived prototypes excluded.')
} finally {
  await Promise.all(created.map(path => unlink(path)))
  // Leave a real production build, with no probe classes, even after failure.
  execFileSync('pnpm', ['build'], { stdio: 'inherit' })
}
