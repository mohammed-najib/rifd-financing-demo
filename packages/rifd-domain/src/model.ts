import { z } from 'zod'

export const languageSchema = z.enum(['ar', 'en'])
export type Language = z.infer<typeof languageSchema>
export const bilingualSchema = z.object({ ar: z.string(), en: z.string() })
export type Bilingual = z.infer<typeof bilingualSchema>
export const identityIdSchema = z.enum(['mariam', 'huda', 'omar', 'salma', 'khaled'])
export const actorIdSchema = z.enum(['mariam', 'huda', 'omar', 'salma'])
export type ActorId = z.infer<typeof actorIdSchema>
export const identitySchema = z.object({
  id: identityIdSchema, name: bilingualSchema, role: z.enum(['applicant', 'reviewer']),
  selectable: z.boolean(), mobile: z.string(), email: z.string(), city: z.string(),
})
export type Identity = z.infer<typeof identitySchema>
export const productIdSchema = z.enum(['inventory', 'equipment'])
export type ProductId = z.infer<typeof productIdSchema>
export const statusSchema = z.enum(['draft', 'submitted', 'underReview', 'correctionsRequested', 'approved', 'rejected'])
export type ApplicationStatus = z.infer<typeof statusSchema>
export const slotSchema = z.enum(['identity', 'business', 'financial', 'purchase'])
export type DocumentSlot = z.infer<typeof slotSchema>
export const slots = slotSchema.options
export const fieldsSchema = z.object({
  fullName: z.string(), mobile: z.string(), city: z.string(), email: z.string(),
  businessName: z.string(), activity: z.enum(['retail', 'services', 'production']),
  address: z.string(), operatingSince: z.string(), revenue: z.string(), expenses: z.string(),
  amount: z.string(), term: z.string(), budget: z.string(), explanation: z.string(),
})
export type Fields = z.infer<typeof fieldsSchema>
export const documentsSchema = z.object({
  identity: z.string().nullable(), business: z.string().nullable(),
  financial: z.string().nullable(), purchase: z.string().nullable(),
})
export const snapshotSchema = z.object({ fields: fieldsSchema, documents: documentsSchema })
export type Snapshot = z.infer<typeof snapshotSchema>
export const historySchema = z.object({
  id: z.string(), sequence: z.number().int().positive(), date: z.string(),
  kind: z.enum(['submitted', 'reviewStarted', 'correctionsRequested', 'resubmitted', 'approved', 'rejected']),
  reason: bilingualSchema.nullable(),
})
export const targetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('field'), field: z.enum(['amount']), reason: bilingualSchema, verified: z.boolean() }),
  z.object({ kind: z.literal('document'), slot: slotSchema, reason: bilingualSchema, verified: z.boolean() }),
])
export const roundSchema = z.object({
  id: z.string(), requestedAt: z.string(), baseline: snapshotSchema,
  targets: z.array(targetSchema).nonempty(), response: snapshotSchema.nullable(),
})
export const assessmentSchema = z.object({
  status: z.enum(['missing', 'awaitingReview', 'accepted', 'needsReplacement']), reason: bilingualSchema.nullable(),
})
export const checkSchema = z.enum(['unchecked', 'passed', 'failed'])
export const checksSchema = z.object({
  evidence: checkSchema, operatingHistory: checkSchema, purpose: checkSchema,
  budget: checkSchema, capacity: checkSchema,
})
export const repaymentSchema = z.object({
  amount: z.number().int(), term: z.number().int(), product: productIdSchema, ruleVersion: z.literal(1),
  approvedAt: z.string(), markup: z.number().int(), total: z.number().int(),
  rows: z.array(z.object({ due: z.string(), amount: z.number().int(), status: z.enum(['completed', 'upcoming']) })),
  completed: z.number().int(), remaining: z.number().int(),
})
export type Repayment = z.infer<typeof repaymentSchema>
export const activitySchema = z.object({
  id: z.string(), sequence: z.number().int().positive(), date: z.string(), actor: identityIdSchema,
  kind: z.enum(['submitted', 'assigned', 'reviewStarted', 'assessed', 'checked', 'correctionsRequested', 'approved', 'rejected', 'note']),
  description: bilingualSchema,
})
export const applicationSchema = z.object({
  id: z.string(), owner: z.enum(['mariam', 'huda', 'omar']), product: productIdSchema, status: statusSchema,
  assignee: z.enum(['salma', 'khaled']).nullable(), sharedRevision: z.number().int().positive(),
  submittedAt: z.string().nullable(), evidenceMonths: z.array(z.string()).length(3),
  submitted: snapshotSchema.nullable(),
  workspace: z.object({ revision: z.number().int().positive(), roundId: z.string().nullable(), savedAt: z.string(), snapshot: snapshotSchema }).nullable(),
  history: z.array(historySchema), rounds: z.array(roundSchema),
  assessments: z.object({ identity: assessmentSchema, business: assessmentSchema, financial: assessmentSchema, purchase: assessmentSchema }).nullable(),
  checks: checksSchema.nullable(),
  notes: z.array(z.object({ id: z.string(), actor: z.enum(['salma', 'khaled']), date: z.string(), text: bilingualSchema })),
  activity: z.array(activitySchema), repayment: repaymentSchema.nullable(),
})
export type Application = z.infer<typeof applicationSchema>
export const fileSchema = z.object({
  id: z.string(), applicationId: z.string(), slot: slotSchema, name: z.string(),
  mime: z.string(), size: z.number().int().nonnegative(), hash: z.string().regex(/^[0-9a-f]{64}$/),
  bytes: z.instanceof(ArrayBuffer),
})
export type StoredFile = z.infer<typeof fileSchema>
export const notificationSchema = z.object({
  id: z.string(), owner: z.enum(['mariam', 'huda', 'omar']), applicationId: z.string(),
  kind: z.enum(['correctionsRequested', 'approved', 'rejected']), date: z.string(), read: z.boolean(), revision: z.number().int().positive(),
})
export type Notification = z.infer<typeof notificationSchema>
export const sampleSchema = z.object({
  id: z.string(), applicationId: z.string(), slot: slotSchema, fileId: z.string(), product: productIdSchema.optional(),
  variant: z.enum(['original', 'replacement', 'invalidType', 'empty', 'oversized', 'identical']),
})
export type Sample = z.infer<typeof sampleSchema>
export const queuePreferencesSchema = z.object({
  status: z.enum(['all', 'submitted', 'underReview', 'correctionsRequested', 'approved', 'rejected']),
  product: z.enum(['all', 'inventory', 'equipment']),
  assignment: z.enum(['all', 'you', 'colleague', 'unassigned']),
  sort: z.enum(['dateDesc', 'dateAsc', 'amountDesc', 'amountAsc']),
}).strict()
export type QueuePreferences = z.infer<typeof queuePreferencesSchema>
export const preferencesSchema = z.object({
  revision: z.number().int().positive(), language: languageSchema,
  queue: queuePreferencesSchema,
})
export type Preferences = z.infer<typeof preferencesSchema>
export const mutationReceiptSchema = z.object({
  kind: z.enum(['saveDraft', 'submit']), actor: actorIdSchema, datasetId: z.string().uuid(),
  operationId: z.string(), fingerprint: z.string(), applicationId: z.string(),
  workspaceRevision: z.number().int().positive(), sharedRevision: z.number().int().positive(), savedAt: z.string(),
})
export type MutationReceipt = z.infer<typeof mutationReceiptSchema>
export const datasetSchema = z.object({
  meta: z.object({ schemaVersion: z.literal(1), seedVersion: z.literal(1), ruleVersion: z.literal(1), datasetId: z.string().uuid(), eventSequence: z.number().int().nonnegative() }),
  identities: z.array(identitySchema), applications: z.array(applicationSchema), files: z.array(fileSchema),
  notifications: z.array(notificationSchema), catalog: z.array(sampleSchema), preferences: preferencesSchema,
  receipts: z.array(z.object({ actor: z.string(), operationId: z.string(), fingerprint: z.string(), revision: z.number().int() })),
  // Supported additive migration for datasets created by slice 01.
  mutationReceipts: z.array(mutationReceiptSchema).default([]),
})
export type Dataset = z.infer<typeof datasetSchema>
