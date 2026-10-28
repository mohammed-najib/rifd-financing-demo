import { spawn } from 'node:child_process';

const budget = Number(process.env.RIFD_GATE_BUDGET ?? 600);
const started = Date.now();

function run(name, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n[gate] ${name}`);
    const child = spawn('pnpm', args, {
      env: { ...process.env, RIFD_CAPTURE: process.env.RIFD_CAPTURE ?? '0' },
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('close', code => resolve({ name, code: code ?? 1, durationMs: Date.now() - started }));
  });
}

const checks = [
  ['format', ['format:check']],
  ['typecheck', ['typecheck']],
  ['lint', ['lint']],
  ['unit', ['test']],
  ['skills', ['test:skills']],
  ['build', ['build:test']],
];

for (const [name, args] of checks) {
  const result = await run(name, args);
  if (result.code !== 0) process.exit(result.code);
}

const suites = await Promise.all([
  run('api', [
    'exec',
    'playwright',
    'test',
    '--config',
    'playwright.api.gate.config.ts',
    '--project=chrome',
    '--workers=3',
  ]),
  run('screens', [
    'exec',
    'playwright',
    'test',
    '--config',
    'playwright.gate.config.ts',
    '--project=chrome',
    '--workers=2',
  ]),
]);
const failed = suites.find(result => result.code !== 0);
if (failed) process.exit(failed.code);

const smokeProjects = process.env.RIFD_WEBKIT_EXECUTABLE ? ['--project=webkit'] : [];
if (smokeProjects.length) {
  const smoke = await run('WebKit smoke', [
    'exec',
    'playwright',
    'test',
    '--config',
    'playwright.gate.config.ts',
    ...smokeProjects,
    '--grep',
    '@smoke',
    '--workers=1',
  ]);
  if (smoke.code !== 0) process.exit(smoke.code);
} else {
  console.log('\n[gate] skipped WebKit smoke (set RIFD_WEBKIT_EXECUTABLE to enable)');
}

const seconds = Math.round((Date.now() - started) / 1000);
console.log(`\n[gate] passed in ${seconds}s${budget > 0 ? ` (budget ${budget}s)` : ''}`);
if (budget > 0 && seconds > budget) {
  console.error(`[gate] exceeded the ${budget}s budget`);
  process.exit(1);
}
