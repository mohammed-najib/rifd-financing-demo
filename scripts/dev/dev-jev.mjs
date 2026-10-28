import { execFile, spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { build } from 'esbuild';
import { loadEnv } from 'vite';

// Opt-in local inference. Never send the provider key to the Vite child or print
// secret-manager output. Ordinary dev and production builds stay unchanged.
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--port'))
  throw Error('Usage: pnpm dev:jev [--port 5174]');
const port = Number(args[1] ?? 5174);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Invalid local port');
const directory = resolve('artifacts/local-jev');
await mkdir(directory, { recursive: true, mode: 0o700 });
const env = loadEnv('local-jev', process.cwd(), '');
let apiKey = process.env.TYPESAFE_API_KEY || env.TYPESAFE_API_KEY;
if (!apiKey) {
  try {
    const result = await promisify(execFile)(
      'firebase',
      [
        'functions:secrets:access',
        'LIVE_TYPESAFE_API_KEY',
        '--project',
        'rifd-portfolio-mdnb',
        '--non-interactive',
      ],
      { timeout: 30_000, maxBuffer: 64 * 1024 },
    );
    apiKey = result.stdout.trim();
  } catch {
    throw Error(
      'Could not load the Jev key. Set TYPESAFE_API_KEY in .env.local or sign in to the Firebase CLI for the existing project.',
    );
  }
}
if (!apiKey || /\s/.test(apiKey)) throw Error('The Jev key is missing or invalid');
await import('../build/pdfjs-resources.mjs');
await build({
  entryPoints: ['src/live-assistance/server/local-server.ts'],
  outfile: `${directory}/server.cjs`,
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  logLevel: 'warning',
  define: { 'process.env.NODE_ENV': '"production"', 'import.meta.url': '__moduleUrl' },
  banner: { js: 'const __moduleUrl = require("node:url").pathToFileURL(__filename).href;' },
  plugins: [
    {
      name: 'disable-ai-devtools',
      setup(context) {
        context.onResolve({ filter: /^@tanstack\/ai-event-client$/ }, () => ({
          path: 'disabled',
          namespace: 'no-devtools',
        }));
        context.onLoad({ filter: /.*/, namespace: 'no-devtools' }, () => ({
          contents:
            'export const aiEventClient = { emit() {} }; export const devtoolsMiddleware = () => ({});',
          loader: 'js',
        }));
      },
    },
  ],
});
await build({
  entryPoints: ['src/live-assistance/server/crop-worker.mjs'],
  outfile: `${directory}/crop-worker.mjs`,
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  logLevel: 'warning',
});
const { startLocalJev } = createRequire(import.meta.url)(`${directory}/server.cjs`);
const local = await startLocalJev({
  apiKey,
  origin: `http://127.0.0.1:${port}`,
  statePath: `${directory}/metadata.sqlite`,
  onEvent: event => console.log(JSON.stringify(event)),
});
apiKey = undefined;
const childEnv = { ...process.env, VITE_LOCAL_JEV: '1', RIFD_LOCAL_JEV_TARGET: local.target };
delete childEnv.TYPESAFE_API_KEY;
delete childEnv.LIVE_TYPESAFE_API_KEY;
const child = spawn(
  process.execPath,
  [
    resolve('node_modules/vite/bin/vite.js'),
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
    '--strictPort',
    '--mode',
    'local-jev',
  ],
  { env: childEnv, stdio: 'inherit' },
);
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  child.kill('SIGTERM');
  await local.close();
}
process.once('SIGINT', () => {
  void stop();
});
process.once('SIGTERM', () => {
  void stop();
});
child.once('exit', code => {
  void stop().then(() => {
    process.exitCode = code ?? 0;
  });
});
child.once('error', () => {
  void stop().then(() => {
    process.exitCode = 1;
  });
});
console.log(
  `Local Jev inference enabled at http://127.0.0.1:${port}. Usage limits persist in artifacts/local-jev; hosted dispatch is unchanged.`,
);
