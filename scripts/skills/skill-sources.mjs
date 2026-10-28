import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, writeFileSync, renameSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { findSkillFiles, parseFrontmatter } from '@tanstack/intent';

const defaultPackage = fileURLToPath(new URL('../../packages/rifd-domain/', import.meta.url));
const stateName = 'skills/source-reviews.json';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function readState(root) {
  try {
    const state = JSON.parse(readFileSync(join(root, stateName), 'utf8'));
    if (state.schemaVersion !== 1 || !object(state.skills))
      throw new Error('Unsupported review evidence format');
    return { state, error: null };
  } catch (error) {
    return { state: { schemaVersion: 1, skills: {} }, error };
  }
}

function readSource(root, source) {
  // This repository declares exact, package-relative files. No URLs or globs.
  if (
    typeof source !== 'string' ||
    !source ||
    isAbsolute(source) ||
    /[:\\*?[\]{}\0]/.test(source) ||
    source.split('/').some(part => !part || part === '.' || part === '..')
  ) {
    throw new Error(`Unsupported source path: ${String(source)}`);
  }
  const path = realpathSync(join(root, source));
  const rel = relative(realpathSync(root), path);
  if (rel.startsWith('../') || isAbsolute(rel))
    throw new Error(`Source outside package: ${source}`);
  return hash(readFileSync(path));
}

export function inspectSkills(root = defaultPackage) {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const { state, error } = readState(root);
  const skillsRoot = join(root, 'skills');
  const files = findSkillFiles(skillsRoot).sort();
  if (!files.length) throw new Error('No skills found in the owning package');
  return files.map(file => {
    const name = relative(skillsRoot, dirname(file)).replaceAll('\\', '/');
    const reasons = [];
    const problems = [];
    const fm = parseFrontmatter(file);
    if (fm?.metadata?.library !== pkg.name || fm?.metadata?.library_version !== pkg.version) {
      problems.push('Skill library and library_version must match package.json');
    }
    if (!Array.isArray(fm?.sources) || !fm.sources.length)
      problems.push('No source files declared');
    const sources = {};
    for (const source of fm?.sources ?? []) {
      try {
        sources[source] = readSource(root, source);
      } catch (failure) {
        problems.push(`Unresolved source ${source}: ${failure.message}`);
      }
    }
    const skillSha256 = hash(readFileSync(file));
    const prior = state.skills[name];
    if (error) reasons.push(`Review evidence unavailable: ${error.message}`);
    if (
      !object(prior) ||
      !object(prior.sources) ||
      typeof prior.reason !== 'string' ||
      !prior.reason.trim()
    ) {
      reasons.push('No recorded source review');
    } else {
      if (prior.version !== pkg.version)
        reasons.push(`Package version changed: ${prior.version} -> ${pkg.version}`);
      if (prior.skillSha256 !== skillSha256) reasons.push('Skill content changed since review');
      for (const [source, sha] of Object.entries(sources)) {
        if (!prior.sources[source]) reasons.push(`No review evidence for source: ${source}`);
        else if (prior.sources[source] !== sha) reasons.push(`Source content changed: ${source}`);
      }
      for (const source of Object.keys(prior.sources)) {
        if (!(source in sources)) reasons.push(`Source removed or unresolved: ${source}`);
      }
    }
    return {
      name,
      version: pkg.version,
      skillSha256,
      sources,
      problems,
      reasons: [...problems, ...reasons],
      needsReview: problems.length > 0 || reasons.length > 0,
    };
  });
}

export function recordReview(root, name, reason) {
  if (typeof reason !== 'string' || !reason.trim())
    throw new Error('Supply an evidence-backed --reason before recording a review');
  const report = inspectSkills(root).find(skill => skill.name === name);
  if (!report) throw new Error(`Unknown skill: ${name}`);
  if (report.problems.length) throw new Error(report.problems.join('\n'));
  const { state, error } = readState(root);
  if (error && error.code !== 'ENOENT')
    throw new Error(`Repair review evidence before recording: ${error.message}`);
  state.skills[name] = {
    version: report.version,
    skillSha256: report.skillSha256,
    sources: report.sources,
    reason: reason.trim(),
  };
  const path = join(root, stateName);
  writeFileSync(`${path}.tmp`, `${JSON.stringify(state, null, 2)}\n`);
  renameSync(`${path}.tmp`, path);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args[0] === '--record' && args.length === 4 && args[2] === '--reason') {
      recordReview(defaultPackage, args[1], args[3]);
      console.log(`Recorded source review for ${args[1]}`);
    } else if (args.length === 0 || (args.length === 1 && args[0] === '--check')) {
      const reports = inspectSkills();
      if (args[0] === '--check') {
        const pending = reports.filter(skill => skill.needsReview);
        for (const skill of pending) console.error(`${skill.name}: ${skill.reasons.join('; ')}`);
        if (pending.length) process.exitCode = 1;
        else console.log(`All ${reports.length} packaged skills have current source reviews.`);
      } else console.log(JSON.stringify(reports, null, 2));
    } else {
      throw new Error(
        'Usage: skill-sources.mjs [--check | --record <skill> --reason <review evidence>]',
      );
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
