import { z } from 'zod';
import {
  bilingualSchema,
  correctionTargetsSchema,
  fieldsSchema,
  languageSchema,
  productIdSchema,
  queuePreferencesSchema,
  resetContextSchema,
  slots,
  slotSchema,
} from '../../domain/model';
import type { ApplicationMutation, DemoOperation } from '../types';

const hintRevision = z.number().int().positive();
const preferenceVersion = {
  datasetId: z.string().uuid(),
  operationId: z.string().min(1),
  expectedRevision: hintRevision,
};
export const preferenceOperationSchema = z.discriminatedUnion('kind', [
  z
    .object({ ...preferenceVersion, kind: z.literal('setLanguage'), language: languageSchema })
    .strict(),
  z
    .object({
      ...preferenceVersion,
      kind: z.literal('setQueuePreferences'),
      queue: queuePreferencesSchema,
    })
    .strict(),
]);
export const commitHintSchema = z.discriminatedUnion('kind', [
  z.object({ datasetId: z.string().uuid(), kind: z.literal('reset') }).strict(),
  z.object({ datasetId: z.string().uuid(), kind: z.literal('analysis') }).strict(),
  z
    .object({
      datasetId: z.string().uuid(),
      kind: z.literal('preferences'),
      revision: hintRevision,
    })
    .strict(),
  z
    .object({
      datasetId: z.string().uuid(),
      kind: z.literal('workspace'),
      applicationId: z.string().min(1),
      revision: hintRevision,
    })
    .strict(),
  z
    .object({
      datasetId: z.string().uuid(),
      kind: z.literal('application'),
      applicationId: z.string().min(1),
      revision: hintRevision,
    })
    .strict(),
  z
    .object({
      datasetId: z.string().uuid(),
      kind: z.literal('notification'),
      notificationId: z.string().min(1),
      revision: hintRevision,
    })
    .strict(),
]);
export const resetOperationSchema = z
  .object({
    kind: z.literal('resetDemo'),
    context: resetContextSchema,
    operationId: z.string().min(1),
    confirmed: z.literal(true),
  })
  .strict();

export const notificationReadSchema = z
  .object({
    kind: z.literal('markNotificationRead'),
    datasetId: z.string().uuid(),
    operationId: z.string().min(1),
    notificationId: z.string().min(1),
    expectedRevision: z.number().int().positive(),
  })
  .strict();

export const preparedSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    mime: z.string(),
    size: z.number().int().positive(),
    hash: z.string().regex(/^[0-9a-f]{64}$/),
    source: z.enum(['local', 'sample']),
  })
  .strict();
const documentSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('saved'), fileId: z.string().nullable() }).strict(),
  z.object({ kind: z.literal('prepared'), attachment: preparedSchema }).strict(),
]);
export const saveDraftSchema = z
  .object({
    kind: z.literal('saveDraft'),
    datasetId: z.string().uuid(),
    operationId: z.string().min(1),
    applicationId: z.string().min(1),
    expectedWorkspaceRevision: z.number().int().nonnegative(),
    product: productIdSchema,
    fields: fieldsSchema.strict(),
    documents: z
      .object({
        identity: documentSchema,
        business: documentSchema,
        financial: documentSchema,
        purchase: documentSchema,
      })
      .strict(),
  })
  .strict();
export const submitSchema = saveDraftSchema
  .extend({ kind: z.literal('submit'), expectedSharedRevision: z.number().int().positive() })
  .strict();
export const saveCorrectionsSchema = saveDraftSchema
  .extend({ kind: z.literal('saveCorrections'), roundId: z.string().min(1) })
  .strict();
export const resubmitSchema = saveCorrectionsSchema
  .extend({ kind: z.literal('resubmit'), expectedSharedRevision: z.number().int().positive() })
  .strict();
const reviewVersion = {
  datasetId: z.string().uuid(),
  operationId: z.string().min(1),
  applicationId: z.string().min(1),
  expectedSharedRevision: z.number().int().positive(),
};
const inspectionSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('inspected'),
      contextToken: z.string().min(1),
      confirmed: z.literal(true),
    })
    .strict(),
  z.object({ kind: z.literal('unableToOpen'), contextToken: z.string().min(1) }).strict(),
]);
export const reviewOperationSchema = z.discriminatedUnion('kind', [
  z
    .object({
      ...reviewVersion,
      kind: z.enum(['claimApplication', 'startReview', 'unassignApplication']),
    })
    .strict(),
  z
    .object({
      ...reviewVersion,
      kind: z.literal('transferApplication'),
      from: z.enum(['salma', 'khaled']),
      to: z.enum(['salma', 'khaled']),
      confirmed: z.literal(true),
      simulated: z.literal(true).optional(),
    })
    .strict(),
  // Omission is parsed only so an exact historical receipt can still be replayed.
  // New assessments require inspection inside the authorized transaction.
  z
    .object({
      ...reviewVersion,
      kind: z.literal('assessDocument'),
      slot: slotSchema,
      fileId: z.string().min(1),
      status: z.enum(['accepted', 'needsReplacement']),
      reason: bilingualSchema.nullable(),
      inspection: inspectionSchema.optional(),
    })
    .strict(),
  z
    .object({
      ...reviewVersion,
      kind: z.literal('recordCheck'),
      check: z.enum(['evidence', 'operatingHistory', 'purpose', 'budget', 'capacity']),
      outcome: z.enum(['unchecked', 'passed', 'failed']),
    })
    .strict(),
  z.object({ ...reviewVersion, kind: z.literal('saveNote'), text: bilingualSchema }).strict(),
  z
    .object({
      ...reviewVersion,
      kind: z.literal('verifyCorrection'),
      roundId: z.string().min(1),
      field: fieldsSchema.keyof(),
      verified: z.boolean(),
    })
    .strict(),
  z
    .object({
      ...reviewVersion,
      kind: z.literal('requestCorrections'),
      targets: correctionTargetsSchema,
      confirmed: z.literal(true),
    })
    .strict(),
  z
    .object({
      ...reviewVersion,
      kind: z.enum(['approve', 'reject']),
      reason: bilingualSchema,
      confirmed: z.literal(true),
      confirmationSessionId: z.string().uuid(),
    })
    .strict(),
]);
export const applicationOperationSchema = z.discriminatedUnion('kind', [
  saveDraftSchema,
  submitSchema,
  saveCorrectionsSchema,
  resubmitSchema,
]);
export const applicationMutationSchema = z.discriminatedUnion('kind', [
  saveDraftSchema,
  submitSchema,
  saveCorrectionsSchema,
  resubmitSchema,
  reviewOperationSchema,
]);
export const preparationSchema = z
  .object({
    datasetId: z.string().uuid(),
    applicationId: z.string().min(1),
    slot: slotSchema,
    selectionId: z.string().min(1),
    product: productIdSchema.optional(),
    source: z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('local'), file: z.instanceof(File) }).strict(),
      z.object({ kind: z.literal('sample'), sampleId: z.string().min(1) }).strict(),
      z.object({ kind: z.literal('generated'), fields: fieldsSchema.strict() }).strict(),
    ]),
  })
  .strict();

export function applicationFingerprint(
  operation: ApplicationMutation | z.infer<typeof reviewOperationSchema>,
): string {
  if (operation.kind === 'approve' || operation.kind === 'reject')
    return JSON.stringify({
      kind: operation.kind,
      applicationId: operation.applicationId,
      reason: operation.reason,
      confirmed: operation.confirmed,
    });
  if (operation.kind === 'verifyCorrection')
    return JSON.stringify({
      kind: operation.kind,
      applicationId: operation.applicationId,
      roundId: operation.roundId,
      field: operation.field,
      verified: operation.verified,
    });
  if (operation.kind === 'requestCorrections')
    return JSON.stringify({
      kind: operation.kind,
      applicationId: operation.applicationId,
      targets: operation.targets,
      confirmed: operation.confirmed,
    });
  if (operation.kind === 'assessDocument')
    return JSON.stringify({
      kind: operation.kind,
      applicationId: operation.applicationId,
      slot: operation.slot,
      fileId: operation.fileId,
      status: operation.status,
      reason: operation.reason,
      ...(operation.inspection ? { inspection: operation.inspection } : {}),
    });
  if (operation.kind === 'recordCheck')
    return JSON.stringify({
      kind: operation.kind,
      applicationId: operation.applicationId,
      check: operation.check,
      outcome: operation.outcome,
    });
  if (operation.kind === 'saveNote')
    return JSON.stringify({
      kind: operation.kind,
      applicationId: operation.applicationId,
      text: operation.text,
    });
  if (!('fields' in operation))
    return JSON.stringify(
      operation.kind === 'transferApplication'
        ? {
            kind: operation.kind,
            applicationId: operation.applicationId,
            from: operation.from,
            to: operation.to,
            confirmed: operation.confirmed,
            ...(operation.simulated ? { simulated: true } : {}),
          }
        : { kind: operation.kind, applicationId: operation.applicationId },
    );
  return JSON.stringify({
    kind: operation.kind,
    applicationId: operation.applicationId,
    product: operation.product,
    ...('roundId' in operation ? { roundId: operation.roundId } : {}),
    fields: operation.fields,
    documents: slots.map(slot => {
      const document = operation.documents[slot];
      if (document.kind === 'saved') return [slot, document];
      const { name, mime, size, hash, source } = document.attachment;
      return [slot, { kind: 'prepared', name, mime, size, hash, source }];
    }),
  });
}

// Receipts and retries share one identity rule: what the caller asked for,
// without the store-supplied envelope or the session that confirmed it.
export function operationFingerprint(operation: DemoOperation): string {
  if (operation.kind === 'resetDemo')
    return JSON.stringify({ kind: operation.kind, context: operation.context });
  if (operation.kind === 'markNotificationRead')
    return JSON.stringify({ kind: operation.kind, notificationId: operation.notificationId });
  if (operation.kind === 'setLanguage')
    return JSON.stringify({ kind: operation.kind, language: operation.language });
  if (operation.kind === 'setQueuePreferences')
    return JSON.stringify({ kind: operation.kind, queue: operation.queue });
  return applicationFingerprint(operation);
}
