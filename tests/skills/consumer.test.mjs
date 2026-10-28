import { strict as assert } from 'node:assert';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { listIntentSkills, loadIntentSkill } from '@tanstack/intent/core';

function fixture(t, policy) {
  const root = mkdtempSync(join(tmpdir(), 'rifd-consumer-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, '.git'));
  const marker = join(root, 'package-code-executed');
  const code = `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'executed'); throw new Error('Package code ran')`;
  const writePackage = (name, dependency) => {
    const location = join(root, 'node_modules', name);
    mkdirSync(location, { recursive: true });
    writeFileSync(
      join(location, 'package.json'),
      JSON.stringify({
        name,
        version: '1.2.3',
        main: 'entry.cjs',
        bin: 'entry.cjs',
        intent: { version: 1, repo: '.', docs: 'skills' },
        exports: './entry.cjs',
        scripts: {
          preinstall: 'node entry.cjs',
          postinstall: 'node entry.cjs',
          prepare: 'node entry.cjs',
        },
        dependencies: dependency ? { [dependency]: '1.2.3' } : {},
      }),
    );
    writeFileSync(join(location, 'entry.cjs'), code);
    for (const skill of ['forms', 'repayment', 'experimental-write']) {
      const dir = join(location, 'skills', skill);
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, 'SKILL.md'),
        `---\nname: ${skill}\ndescription: Use for ${skill}.\n---\n\nGuidance for ${name} ${skill}.\n\nRead [details](guide.md) for special cases.\n`,
      );
      writeFileSync(join(dir, 'guide.md'), 'REFERENCE_ONLY_CONTENT');
    }
  };
  writePackage('@fixture/allowed', '@fixture/transitive');
  writePackage('@fixture/transitive');
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({
      name: 'consumer',
      private: true,
      dependencies: { '@fixture/allowed': '1.2.3' },
      intent: policy,
    }),
  );
  return { root, marker };
}

test('scans reachable dependency files without running package entry points, bins or lifecycle scripts', t => {
  const { root, marker } = fixture(t, { skills: ['@fixture/allowed#forms'], exclude: [] });
  const catalog = listIntentSkills({ cwd: root });
  assert.deepEqual(
    catalog.skills.map(skill => skill.use),
    ['@fixture/allowed#forms'],
  );
  assert.equal(catalog.skills[0].packageVersion, '1.2.3');
  assert.ok(catalog.hiddenSourceCount > 0, 'Transitive skills must remain untrusted');
  const loaded = loadIntentSkill('@fixture/allowed#forms', { cwd: root });
  assert.ok(loaded.content.includes('Guidance for @fixture/allowed forms.'));
  assert.ok(existsSync(resolve(root, loaded.path)));
  const reference = /\[details\]\(([^)]+)\)/.exec(loaded.content)?.[1];
  assert.ok(reference, 'Loaded guidance must preserve an accessible reference');
  assert.equal(readFileSync(resolve(root, reference), 'utf8'), 'REFERENCE_ONLY_CONTENT');
  assert.ok(!loaded.content.includes('REFERENCE_ONLY_CONTENT'), 'References load only on demand');
  assert.throws(() => loadIntentSkill('@fixture/transitive#forms', { cwd: root }), {
    code: 'package-not-listed',
  });
  assert.throws(() => loadIntentSkill('@fixture/allowed#repayment', { cwd: root }), {
    code: 'package-not-listed',
  });
  assert.equal(existsSync(marker), false);
});

test('exclusions override a package allowlist for both catalog and direct loading', t => {
  const { root, marker } = fixture(t, {
    skills: ['@fixture/allowed'],
    exclude: ['@fixture/allowed#repayment', '*#experimental-*'],
  });
  assert.deepEqual(
    listIntentSkills({ cwd: root }).skills.map(skill => skill.use),
    ['@fixture/allowed#forms'],
  );
  assert.throws(() => loadIntentSkill('@fixture/allowed#repayment', { cwd: root }), {
    code: 'skill-excluded',
  });
  assert.throws(() => loadIntentSkill('@fixture/allowed#experimental-write', { cwd: root }), {
    code: 'skill-excluded',
  });
  assert.equal(existsSync(marker), false);
});

test('an explicit empty allowlist disables every discovered skill', t => {
  const { root } = fixture(t, { skills: [], exclude: [] });
  assert.deepEqual(listIntentSkills({ cwd: root }).skills, []);
  assert.throws(() => loadIntentSkill('@fixture/allowed#forms', { cwd: root }), {
    code: 'package-not-listed',
  });
});

test('malformed policy blocks discovery and loading', t => {
  const { root, marker } = fixture(t, { skills: ['@fixture/allowed'] });
  writeFileSync(join(root, 'package.json'), '{');
  assert.throws(() => listIntentSkills({ cwd: root }));
  assert.throws(() => loadIntentSkill('@fixture/allowed#forms', { cwd: root }));
  assert.equal(existsSync(marker), false);
});

test('repository policy permits only the named workspace skills', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.deepEqual(pkg.intent.skills, [
    'workspace:@rifd/domain#validate-application',
    'workspace:@rifd/domain#freeze-repayment',
  ]);
  assert.deepEqual(
    new Set(listIntentSkills({ cwd: root }).skills.map(skill => skill.use)),
    new Set(['@rifd/domain#validate-application', '@rifd/domain#freeze-repayment']),
  );
});
