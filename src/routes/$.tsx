import { createFileRoute } from '@tanstack/react-router'
import { App } from '../ui/app'
export const Route = createFileRoute('/$')({ component: App, validateSearch: (search: Record<string, unknown>): { product?: string; step?: string } => ({ product: typeof search.product === 'string' ? search.product : undefined, step: typeof search.step === 'string' ? search.step : undefined }) })
