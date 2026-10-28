import { cp, mkdir, readFile } from 'node:fs/promises';

const packageRoot = new URL('../../node_modules/pdfjs-dist/', import.meta.url);
const { version } = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'));
if (version !== '5.4.296')
  throw new Error('PDF.js renderer and resources must remain pinned together');
const destination = new URL(`../../public/pdfjs/${version}/`, import.meta.url);
await mkdir(destination, { recursive: true });
for (const directory of ['cmaps', 'standard_fonts', 'wasm'])
  await cp(new URL(directory, packageRoot), new URL(directory, destination), { recursive: true });
await cp(new URL('LICENSE', packageRoot), new URL('LICENSE', destination));
