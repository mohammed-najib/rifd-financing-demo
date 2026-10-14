import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/$')({ component: () => null, validateSearch: (search: Record<string, unknown>): { product?: string; step?: string } => ({ product: typeof search.product === 'string' ? search.product : undefined, step: typeof search.step === 'string' ? search.step : undefined }) })
