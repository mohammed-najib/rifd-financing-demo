// Use the application's effective initial submission month, never the wall clock
// at the time a historical or correction document is checked.
export function completedFinancialMonths(initialSubmissionMonth: string): string[] {
  const [year, month] = initialSubmissionMonth.split('-').map(Number);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(initialSubmissionMonth) || !year)
    throw new Error('invalid-submission-month');
  const submission = year * 12 + month - 1;
  return [3, 2, 1].map(offset => {
    const index = submission - offset;
    return `${String(Math.floor(index / 12)).padStart(4, '0')}-${String((index % 12) + 1).padStart(2, '0')}`;
  });
}
