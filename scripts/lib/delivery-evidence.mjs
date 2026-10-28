import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

export async function sourceEvidence() {
  const deleted = new Set(git('ls-files', '--deleted', '-z').split('\0'));
  const paths = git('ls-files', '--cached', '--others', '--exclude-standard', '-z')
    .split('\0')
    .filter(
      path =>
        !deleted.has(path) &&
        (/^(src|tests|scripts|packages|public)\//.test(path) ||
          /^(package.json|pnpm-lock.yaml|firebase.json|.*\.config\.(ts|js)|tsconfig.json)$/.test(
            path,
          )),
    )
    .sort();
  const files = await Promise.all(
    paths.map(async path => ({ path, sha256: hash(await readFile(path)) })),
  );
  return {
    head: git('rev-parse', 'HEAD'),
    changes: git('status', '--short'),
    sha256: hash(JSON.stringify(files)),
    files,
  };
}

export async function staticEvidence() {
  const files = [];
  for (const path of (await readdir('dist/client', { recursive: true, withFileTypes: true }))
    .filter(file => file.isFile())
    .map(file => `${file.parentPath}/${file.name}`)
    .sort()) {
    const bytes = await readFile(path);
    files.push({
      path,
      bytes: bytes.length,
      gzipBytes: gzipSync(bytes).length,
      sha256: hash(bytes),
    });
  }
  const hosting = JSON.parse(await readFile('firebase.json', 'utf8')).hosting;
  if (
    hosting.public !== 'dist/client' ||
    !hosting.rewrites.some(rule => rule.source === '**' && rule.destination === '/_shell.html')
  )
    throw new Error('Hosting does not serve the inspected static shell');
  if (files.some(file => /tests\/browser|api\.html/.test(file.path)))
    throw new Error('Test harness shipped in static output');
  const shell = await readFile('dist/client/_shell.html', 'utf8');
  if (!shell.includes('جارٍ تجهيز العرض التجريبي') || /ورشة المدار|متجر الندى|\/src\//.test(shell))
    throw new Error('Static shell contains unexpected content');
  return {
    hosting,
    files,
    totals: Object.fromEntries(
      ['js', 'css', 'woff2'].map(extension => {
        const selected = files.filter(file => file.path.endsWith(`.${extension}`));
        return [
          extension,
          {
            bytes: selected.reduce((sum, file) => sum + file.bytes, 0),
            gzipBytes: selected.reduce((sum, file) => sum + file.gzipBytes, 0),
          },
        ];
      }),
    ),
  };
}
