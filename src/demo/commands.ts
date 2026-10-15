import { z } from 'zod'
import { fieldsSchema, languageSchema, productIdSchema, queuePreferencesSchema, slots, slotSchema } from '../domain/model'
import type { ApplicationOperation } from './types'

const hintRevision = z.number().int().positive()
const preferenceVersion = { datasetId: z.string().uuid(), operationId: z.string().min(1), expectedRevision: hintRevision }
export const preferenceOperationSchema = z.discriminatedUnion('kind', [
  z.object({ ...preferenceVersion, kind: z.literal('setLanguage'), language: languageSchema }).strict(),
  z.object({ ...preferenceVersion, kind: z.literal('setQueuePreferences'), queue: queuePreferencesSchema }).strict(),
])
export const commitHintSchema = z.discriminatedUnion('kind', [
  z.object({ datasetId: z.string().uuid(), kind: z.literal('preferences'), revision: hintRevision }).strict(),
  z.object({ datasetId: z.string().uuid(), kind: z.literal('workspace'), applicationId: z.string().min(1), revision: hintRevision }).strict(),
  z.object({ datasetId: z.string().uuid(), kind: z.literal('application'), applicationId: z.string().min(1), revision: hintRevision }).strict(),
  z.object({ datasetId: z.string().uuid(), kind: z.literal('notification'), notificationId: z.string().min(1), revision: hintRevision }).strict(),
])

export const notificationReadSchema = z.object({
  kind: z.literal('markNotificationRead'), datasetId: z.string().uuid(), operationId: z.string().min(1),
  notificationId: z.string().min(1), expectedRevision: z.number().int().positive(),
}).strict()

export const preparedSchema = z.object({
  id: z.string().min(1), name: z.string().min(1), mime: z.string(), size: z.number().int().positive(),
  hash: z.string().regex(/^[0-9a-f]{64}$/), source: z.enum(['local', 'sample']),
}).strict()
const documentSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('saved'), fileId: z.string().nullable() }).strict(),
  z.object({ kind: z.literal('prepared'), attachment: preparedSchema }).strict(),
])
export const saveDraftSchema = z.object({
  kind: z.literal('saveDraft'), datasetId: z.string().uuid(), operationId: z.string().min(1),
  applicationId: z.string().min(1), expectedWorkspaceRevision: z.number().int().nonnegative(),
  product: productIdSchema, fields: fieldsSchema.strict(),
  documents: z.object({ identity: documentSchema, business: documentSchema, financial: documentSchema, purchase: documentSchema }).strict(),
}).strict()
export const submitSchema = saveDraftSchema.extend({ kind: z.literal('submit'), expectedSharedRevision: z.number().int().positive() }).strict()
export const applicationOperationSchema = z.discriminatedUnion('kind', [saveDraftSchema, submitSchema])
export const preparationSchema = z.object({
  datasetId: z.string().uuid(), applicationId: z.string().min(1), slot: slotSchema, selectionId: z.string().min(1),
  product: productIdSchema.optional(),
  source: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('local'), file: z.instanceof(File) }).strict(),
    z.object({ kind: z.literal('sample'), sampleId: z.string().min(1) }).strict(),
    z.object({ kind: z.literal('generated'), fields: fieldsSchema.strict() }).strict(),
  ]),
}).strict()

export function draftFingerprint(operation: ApplicationOperation): string {
  return JSON.stringify({
    kind: operation.kind, applicationId: operation.applicationId, product: operation.product,
    fields: operation.fields,
    documents: slots.map(slot => {
      const document = operation.documents[slot]
      if (document.kind === 'saved') return [slot, document]
      const { name, mime, size, hash, source } = document.attachment
      return [slot, { kind: 'prepared', name, mime, size, hash, source }]
    }),
  })
}
