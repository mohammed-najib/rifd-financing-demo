import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/$')({
  component: () => null,
  validateSearch: (search: Record<string, unknown>): Record<string, unknown> => Object.fromEntries(
    ['product', 'step', 'search', 'status', 'assignment', 'sort', 'page'].filter(key => key in search).map(key => [key, search[key]]),
  ),
})
