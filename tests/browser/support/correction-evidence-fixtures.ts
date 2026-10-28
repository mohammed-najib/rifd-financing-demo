import type { Demo, DraftDocuments, PreparedAttachment } from '../../../src/demo';
import type { CorrectionTarget, Fields } from '../../../src/domain/model';

export const correctionApplicationId = 'RIFD-2026-007';
export const identityReason = {
  ar: 'استبدل الهوية بصورة واضحة للاسم المعلن.',
  en: 'Replace the identity evidence with a clear image of the declared name.',
};

export async function requestIdentityCorrection(demo: Demo, fields: CorrectionTarget[] = []) {
  await demo.signIn('salma');
  const context = await demo.context(),
    view = await demo.readApplication(correctionApplicationId);
  if (!context.ok || !view.ok) throw new Error('fixture');
  const result = await window.commitOn(demo, {
    kind: 'requestCorrections',
    applicationId: view.value.id,
    confirmed: true,
    targets: [{ kind: 'document', slot: 'identity', reason: identityReason }, ...fields],
  });
  if (!result.ok) throw new Error(result.error.kind);
  await demo.signIn('mariam');
  return correctionInput(demo);
}

export async function correctionInput(demo: Demo) {
  const view = await demo.readApplication(correctionApplicationId);
  if (!view.ok || view.value.role !== 'applicant' || !view.value.workspace)
    throw new Error('workspace');
  return {
    action: 'check-document' as const,
    applicationId: view.value.id,
    slot: 'identity' as const,
    audience: 'applicant' as const,
    context: 'correction-workspace' as const,
    roundId: view.value.workspace.roundId!,
  };
}

export async function correctionCommand(
  _demo: Demo,
  fields: Partial<Fields> = {},
  attachment?: PreparedAttachment,
  kind: 'saveCorrections' | 'resubmit' = 'saveCorrections',
): Promise<import('../../../src/demo').AttemptIntent> {
  const view = await _demo.readApplication(correctionApplicationId);
  if (!view.ok || view.value.role !== 'applicant' || !view.value.workspace)
    throw new Error('workspace');
  const workspace = view.value.workspace;
  const documents = Object.fromEntries(
    Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [
      slot,
      { kind: 'saved', fileId },
    ]),
  ) as DraftDocuments;
  if (attachment) documents.identity = { kind: 'prepared', attachment };
  return {
    kind,
    applicationId: view.value.id,
    roundId: workspace.roundId!,
    product: view.value.product,
    fields: { ...workspace.snapshot.fields, ...fields },
    documents,
  };
}

export async function prepareCorrectionIdentity(demo: Demo, file: File) {
  const context = await demo.context();
  if (!context.ok) throw new Error('context');
  const prepared = await demo.prepareAttachment({
    datasetId: context.value.datasetId,
    applicationId: correctionApplicationId,
    slot: 'identity',
    selectionId: crypto.randomUUID(),
    source: { kind: 'local', file },
  });
  if (!prepared.ok) throw new Error(prepared.error.kind);
  return prepared.value;
}
