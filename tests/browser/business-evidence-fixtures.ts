import type { EvidenceInput } from '../../src/evidence-assistance/contract'
import type { Demo, DraftDocuments, PreparedAttachment } from '../../src/demo'
import type { Fields } from '../../src/domain/model'

export const businessInput: EvidenceInput = { action: 'check-document', applicationId: 'RIFD-2026-001', slot: 'business', audience: 'applicant', context: 'draft' }

export async function businessFile(lines = ['Fictional business evidence', 'Business name: Harbor Supplies', 'Address: 12 Market Street, Aden', 'Address: 90 Port Street, Aden', 'Operating since: 2025-01']) {
  const canvas = document.createElement('canvas'); canvas.width = 1000; canvas.height = 1320
  const context = canvas.getContext('2d')!
  context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#111'; context.font = '26px sans-serif'
  lines.forEach((line, i) => context.fillText(line, 40, 70 + i * 65))
  const blob = await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png'))
  return new File([blob], 'fictional-business.png', { type: 'image/png' })
}

export async function attachBusiness(file: File) {
  const context = await window.demo.context()
  if (!context.ok) throw new Error('context')
  const prepared = await window.demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: businessInput.applicationId, slot: 'business', selectionId: crypto.randomUUID(), source: { kind: 'local', file } })
  if (!prepared.ok) throw new Error(prepared.error.kind)
  return prepared.value
}

export async function saveBusiness(fields: Partial<Fields> = {}, attachment?: PreparedAttachment) {
  const context = await window.demo.context(), view = await window.demo.readApplication(businessInput.applicationId)
  if (!context.ok || !view.ok || view.value.role !== 'applicant' || !view.value.workspace) throw new Error('workspace')
  const workspace = view.value.workspace
  const documents = Object.fromEntries(Object.entries(workspace.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as DraftDocuments
  if (attachment) documents.business = { kind: 'prepared', attachment }
  const result = await window.demo.execute({ kind: 'saveDraft', datasetId: context.value.datasetId, applicationId: view.value.id, operationId: crypto.randomUUID(), expectedWorkspaceRevision: workspace.revision, product: view.value.product, fields: { ...workspace.snapshot.fields, ...fields }, documents })
  if (!result.ok) throw new Error(result.error.kind)
  return result.value
}

export async function requestBusinessCorrection(demo: Demo) {
  await demo.signIn('salma')
  const context = await demo.context(), view = await demo.readApplication('RIFD-2026-007')
  if (!context.ok || !view.ok) throw new Error('review')
  const result = await demo.execute({ kind: 'requestCorrections', datasetId: context.value.datasetId, applicationId: view.value.id, operationId: crypto.randomUUID(), expectedSharedRevision: view.value.sharedRevision, confirmed: true, targets: [
    { kind: 'document', slot: 'business', reason: { ar: 'استبدل إثبات النشاط غير الواضح.', en: 'Replace the unclear business evidence.' } },
    { kind: 'field', field: 'address', reason: { ar: 'صحح عنوان النشاط.', en: 'Correct the business address.' } },
  ] })
  if (!result.ok) throw new Error(result.error.kind)
  await demo.signIn('mariam')
}
