import { strict as assert } from 'node:assert';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { inspectSkills, recordReview } from '../../scripts/skills/skill-sources.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'rifd-source-review-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = fileURLToPath(new URL('../../packages/rifd-domain/', import.meta.url));
  for (const name of ['package.json', 'src', 'skills'])
    cpSync(join(source, name), join(root, name), { recursive: true });
  rmSync(join(root, 'skills/source-reviews.json'), { force: true });
  return root;
}

test('missing evidence remains pending and a named review preserves other pending skills', t => {
  const root = fixture(t);
  assert.ok(inspectSkills(root).every(skill => skill.needsReview));
  assert.throws(() => recordReview(root, 'validate-application', ' '), /reason/);
  recordReview(root, 'validate-application', 'Compared field documentation and boundary behavior.');
  let reports = inspectSkills(root);
  assert.equal(reports.find(skill => skill.name === 'validate-application').needsReview, false);
  assert.equal(reports.find(skill => skill.name === 'freeze-repayment').needsReview, true);
  recordReview(root, 'freeze-repayment', 'Checked integer rounding and monthly rollover.');
  reports = inspectSkills(root);
  assert.ok(reports.every(skill => !skill.needsReview));
});

test('changed docs reopen review without rewriting guidance and can receive a no-change assessment', t => {
  const root = fixture(t);
  recordReview(root, 'validate-application', 'Verified current fields.');
  const guide = join(root, 'skills/validate-application/references/guide.md');
  const skillPath = join(root, 'skills/validate-application/SKILL.md');
  const guidance = readFileSync(skillPath, 'utf8');
  writeFileSync(guide, readFileSync(guide, 'utf8') + '\nA clarifying documentation example.\n');
  const report = inspectSkills(root).find(skill => skill.name === 'validate-application');
  assert.equal(report.needsReview, true);
  assert.ok(report.reasons.some(reason => reason.startsWith('Source content changed:')));
  recordReview(
    root,
    'validate-application',
    'Read the doc clarification; existing skill guidance still applies.',
  );
  assert.equal(
    inspectSkills(root).find(skill => skill.name === 'validate-application').needsReview,
    false,
  );
  assert.equal(readFileSync(skillPath, 'utf8'), guidance);
});

test('missing sources and invalid provenance cannot be recorded as reviewed', t => {
  const root = fixture(t);
  rmSync(join(root, 'src/application.ts'));
  assert.throws(
    () => recordReview(root, 'validate-application', 'Unverified'),
    /Unresolved source/,
  );
  const path = join(root, 'package.json');
  const pkg = JSON.parse(readFileSync(path, 'utf8'));
  writeFileSync(path, JSON.stringify({ ...pkg, version: '0.2.0' }));
  assert.throws(() => recordReview(root, 'freeze-repayment', 'Unverified'), /library_version/);
});

test('new sources and changed skill text require a fresh review', t => {
  const root = fixture(t);
  recordReview(root, 'freeze-repayment', 'Verified current behavior.');
  const path = join(root, 'skills/freeze-repayment/SKILL.md');
  writeFileSync(join(root, 'src/new-rule.ts'), 'export const newRule = 1\n');
  writeFileSync(
    path,
    readFileSync(path, 'utf8').replace('sources:\n', 'sources:\n  - src/new-rule.ts\n'),
  );
  const report = inspectSkills(root).find(skill => skill.name === 'freeze-repayment');
  assert.ok(report.reasons.includes('No review evidence for source: src/new-rule.ts'));
  assert.ok(report.reasons.includes('Skill content changed since review'));
});

test('source paths that escape through symlinks stay unresolved', t => {
  const root = fixture(t);
  const outside = mkdtempSync(join(tmpdir(), 'rifd-outside-package-'));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  writeFileSync(join(outside, 'secret.md'), 'Outside the package');
  symlinkSync(join(outside, 'secret.md'), join(root, 'src/escape.md'));
  const path = join(root, 'skills/freeze-repayment/SKILL.md');
  writeFileSync(
    path,
    readFileSync(path, 'utf8').replace('sources:\n', 'sources:\n  - src/escape.md\n'),
  );
  assert.throws(
    () => recordReview(root, 'freeze-repayment', 'Unverified'),
    /Source outside package/,
  );
});

test('corrupt evidence fails conservatively and is not silently replaced', t => {
  const root = fixture(t);
  const path = join(root, 'skills/source-reviews.json');
  writeFileSync(path, '{');
  assert.ok(inspectSkills(root).every(skill => skill.needsReview));
  assert.throws(
    () => recordReview(root, 'freeze-repayment', 'Unverified'),
    /Repair review evidence/,
  );
  assert.equal(readFileSync(path, 'utf8'), '{');
});
