import { z } from 'zod'
import { bounds } from '../evidence-assistance/contract'
import { rasterSchema } from '../evidence-assistance/record'

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)
const text = z.string().max(4096)
const detail = z.object({ value: text.nullable(), status: z.enum(['valid', 'invalid', 'missing']) }).strict().refine(value => value.status !== 'valid' || !!value.value?.trim())
const reason = z.object({ ar: text, en: text }).strict()
const correction = z.object({ initialSubmissionMonth: month, targets: z.array(z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('field'), field: z.enum(['fullName', 'mobile', 'city', 'email', 'businessName', 'activity', 'address', 'operatingSince', 'revenue', 'expenses', 'amount', 'term', 'budget', 'explanation']), reason }).strict(),
  z.object({ kind: z.literal('document'), slot: z.enum(['identity', 'business', 'financial', 'purchase']), reason }).strict(),
])).min(1).max(18) }).strict()
const base = {
  // The UTC date bounds deduplication lifetime after metadata cleanup.
  runId: z.string().regex(/^\d{4}-\d{2}-\d{2}\.[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/), audience: z.enum(['applicant', 'reviewer']), context: z.enum(['draft', 'correction-workspace', 'submitted']),
  totalPages: z.number().int().min(1).max(100), selectedPages: z.array(z.number().int().min(1).max(100)).min(1).max(4),
  pages: z.array(z.object({ page: z.number().int().min(1).max(100), png: z.string().max(Math.ceil(bounds.imageBytes / 3) * 4).regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/), manifest: rasterSchema.optional() }).strict()).min(1).max(4),
  correction: correction.optional(),
}
export const liveRequestSchema = z.discriminatedUnion('slot', [
  z.object({ ...base, slot: z.literal('identity'), declaration: z.object({ fullName: text.nullable(), status: z.enum(['valid', 'missing', 'invalid']) }).strict() }).strict(),
  z.object({ ...base, slot: z.literal('business'), declaration: z.object({ business: z.object({ businessName: detail, address: detail, operatingSince: detail }).strict() }).strict() }).strict(),
  z.object({ ...base, slot: z.literal('purchase'), declaration: z.object({ purchase: z.object({ product: z.enum(['inventory', 'equipment']), explanation: detail, budget: detail }).strict() }).strict() }).strict(),
  z.object({ ...base, slot: z.literal('financial'), declaration: z.object({ financial: z.object({ initialSubmissionMonth: month, expectedMonths: z.array(month).length(3), revenue: detail, expenses: detail }).strict() }).strict() }).strict(),
])
export type LiveRequest = z.infer<typeof liveRequestSchema>
export const liveReasons = ['access-denied', 'service-disabled', 'service-unavailable', 'service-busy', 'accounting-unavailable', 'guest-active', 'guest-rate', 'guest-allowance', 'network-allowance', 'daily-allowance', 'monthly-allowance', 'run-conflict', 'run-expired', 'run-stopped', 'deadline', 'invalid-request', 'body-limit', 'context-limit', 'prepared-limit', 'invalid-response'] as const
export type LiveReason = typeof liveReasons[number]
const dispatches = z.array(z.object({ stage: z.enum(['combined-page-declaration', 'page', 'document-comparison', 'bound-verification']), page: z.number().int().min(1).max(100) }).strict()).max(9)
export const liveReplySchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('unavailable'), reason: z.enum(liveReasons), dispatched: dispatches.optional() }).strict(),
  z.object({ status: z.literal('duplicate'), completion: z.enum(['active', 'completed', 'stopped']) }).strict(),
  z.object({ status: z.literal('completed'), stages: z.array(z.object({ stage: z.enum(['combined-page-declaration', 'page', 'document-comparison', 'bound-verification']), page: z.number().int().min(1).max(100), answer: z.unknown() }).strict()).max(9), stoppedReason: z.enum(liveReasons).optional(), dispatched: dispatches.optional() }).strict(),
])
export type LiveReply = z.infer<typeof liveReplySchema>
