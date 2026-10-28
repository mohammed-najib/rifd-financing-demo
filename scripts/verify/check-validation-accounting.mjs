import { readFile } from 'node:fs/promises';
import { checkValidationAccounting } from '../../src/live-assistance/server/validation-accounting.ts';

try {
  if (process.argv.length !== 3) throw Error('missing-file');
  const state = JSON.parse(await readFile(process.argv[2], 'utf8'));
  const result = checkValidationAccounting(state);
  // The local file may contain private billing references; never echo them.
  console.log(JSON.stringify({ ...result, dispatchAuthorized: false }));
  if (!result.eligibleForReservation) process.exitCode = 1;
} catch {
  console.log(
    JSON.stringify({
      eligibleForReservation: false,
      reason: 'unreadable-accounting',
      dispatchAuthorized: false,
    }),
  );
  process.exitCode = 1;
}
