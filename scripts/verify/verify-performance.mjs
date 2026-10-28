import { readFile } from 'node:fs/promises';
import { sourceEvidence, staticEvidence } from '../lib/delivery-evidence.mjs';

const path = process.argv[2];
if (!path) throw new Error('Pass the retained performance run.json path');
const report = JSON.parse(await readFile(path, 'utf8'));
if (report.outcome !== 'passed') throw new Error('This performance run did not pass all gates');
if (report.source.sha256 !== (await sourceEvidence()).sha256)
  throw new Error('Source changed. Rerun the affected delivery/performance gates.');
if (JSON.stringify(report.staticBuild) !== JSON.stringify(await staticEvidence()))
  throw new Error('Static build changed. Rerun the affected delivery/performance gates.');
console.log('The passing performance reports still match the current source and static build.');
