import { foldDigits, parseWholeYER } from '../../domain';
import { queuePreferencesSchema, type QueuePreferences } from '../../domain/model';
import type { ApplicationSummary, QueueQuery, StaffQueue } from '../types';

export function resolveQueueQuery(
  input: Record<string, unknown>,
  saved: QueuePreferences,
): QueueQuery {
  const filters = { ...saved };
  for (const key of ['status', 'product', 'assignment', 'sort'] as const) {
    const parsed = queuePreferencesSchema.shape[key].safeParse(input[key]);
    if (parsed.success) Object.assign(filters, { [key]: parsed.data });
  }
  const page =
    typeof input.page === 'number'
      ? input.page
      : typeof input.page === 'string' && /^\d+$/.test(input.page)
        ? Number(input.page)
        : 1;
  return {
    ...filters,
    search: typeof input.search === 'string' ? input.search : '',
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

export function projectQueue(
  rows: ApplicationSummary[],
  input: Record<string, unknown>,
  saved: QueuePreferences,
): StaffQueue {
  const query = resolveQueueQuery(input, saved);
  const counts: StaffQueue['counts'] = {
    submitted: 0,
    underReview: 0,
    correctionsRequested: 0,
    approved: 0,
    rejected: 0,
  };
  const assignments: StaffQueue['assignments'] = { you: 0, colleague: 0, unassigned: 0 };
  const assignment = (row: ApplicationSummary) =>
    row.assignedToYou ? 'you' : row.assignment ? 'colleague' : 'unassigned';
  for (const row of rows) {
    if (row.status !== 'draft') counts[row.status]++;
    assignments[assignment(row)]++;
  }
  const search = foldDigits(query.search).normalize('NFC').trim().toLowerCase();
  const matched = rows
    .filter(
      row =>
        [row.id, row.fullName, row.businessName].some(value =>
          foldDigits(value).normalize('NFC').toLowerCase().includes(search),
        ) &&
        (query.status === 'all' || row.status === query.status) &&
        (query.product === 'all' || row.product === query.product) &&
        (query.assignment === 'all' || assignment(row) === query.assignment),
    )
    .sort((a, b) => {
      const difference = query.sort.startsWith('date')
        ? (a.submittedAt ?? '').localeCompare(b.submittedAt ?? '')
        : (parseWholeYER(a.amount) ?? 0) - (parseWholeYER(b.amount) ?? 0);
      return (query.sort.endsWith('Desc') ? -difference : difference) || a.id.localeCompare(b.id);
    });
  const pages = Math.max(1, Math.ceil(matched.length / 5));
  query.page = Math.min(query.page, pages);
  return {
    rows: matched.slice((query.page - 1) * 5, query.page * 5),
    query,
    total: rows.length,
    matched: matched.length,
    pages,
    counts,
    assignments,
  };
}
