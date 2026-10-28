import type { EvidenceInput } from '../../../src/evidence-assistance/contract'
import type { DraftDocuments, PreparedAttachment } from '../../../src/demo'
import type { Fields, ProductId } from '../../../src/domain/model'
import { businessFile } from './business-evidence-fixtures'

export const purchaseInput: EvidenceInput = { action: 'check-document', applicationId: 'RIFD-2026-001', slot: 'purchase', audience: 'applicant', context: 'draft' }
export const purchaseFile = async (product: ProductId = 'inventory', lines?: string[]) => {
  const file = await businessFile(lines ?? [product === 'inventory' ? 'Fictional stock purchase plan' : 'Fictional equipment supplier quotation', product === 'inventory' ? 'Purchase: Restock shop shelves with supplies' : 'Purchase: Productive packing equipment', 'Total budget: 900,000 YER'])
  return new File([await file.arrayBuffer()], 'fictional-purchase.png', { type: file.type })
}
export async function attachPurchase(product: ProductId = 'inventory', file?: File) {
  const context = await window.demo.context()
  if (!context.ok) throw new Error('context')
  const prepared = await window.demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: purchaseInput.applicationId, slot: 'purchase', product, selectionId: crypto.randomUUID(), source: { kind: 'local', file: file ?? await purchaseFile(product) } })
  if (!prepared.ok) throw new Error(prepared.error.kind)
  return prepared.value
}
export async function savePurchase(fields: Partial<Fields> = {}, attachment?: PreparedAttachment, product?: ProductId) {
  const context = await window.demo.context(), view = await window.demo.readApplication(purchaseInput.applicationId)
  if (!context.ok || !view.ok || view.value.role !== 'applicant' || !view.value.workspace) throw new Error('workspace')
  const documents = Object.fromEntries(Object.entries(view.value.snapshot.documents).map(([slot, fileId]) => [slot, { kind: 'saved', fileId }])) as DraftDocuments
  if (attachment) documents.purchase = { kind: 'prepared', attachment }
  else if (product && product !== view.value.product) documents.purchase = { kind: 'saved', fileId: null }
  const result = await window.demo.execute({ kind: 'saveDraft', datasetId: context.value.datasetId, applicationId: view.value.id, operationId: crypto.randomUUID(), expectedWorkspaceRevision: view.value.workspace.revision, product: product ?? view.value.product, fields: { ...view.value.snapshot.fields, ...fields }, documents })
  if (!result.ok) throw new Error(result.error.kind)
  return result.value
}

export async function requestPurchaseCorrection(demo: import('../../../src/demo').Demo) {
  await demo.signIn('salma')
  const context = await demo.context(), view = await demo.readApplication('RIFD-2026-007')
  if (!context.ok || !view.ok) throw new Error('review')
  const result = await demo.execute({ kind: 'requestCorrections', datasetId: context.value.datasetId, applicationId: view.value.id, operationId: crypto.randomUUID(), expectedSharedRevision: view.value.sharedRevision, confirmed: true, targets: [
    { kind: 'document', slot: 'purchase', reason: { ar: 'استبدل عرض السعر غير الواضح.', en: 'Replace the unclear supplier quotation.' } },
    { kind: 'field', field: 'budget', reason: { ar: 'صحح الميزانية الإجمالية.', en: 'Correct the total purchase budget.' } },
  ] })
  if (!result.ok) throw new Error(result.error.kind)
  await demo.signIn('mariam')
}
