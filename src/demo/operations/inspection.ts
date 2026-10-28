import type { ActorId, Application, Dataset, DocumentSlot, Fields } from '../../domain/model'

const details: Record<DocumentSlot, readonly (keyof Fields)[]> = {
  identity: ['fullName'],
  business: ['businessName', 'address', 'operatingSince'],
  financial: ['revenue', 'expenses'],
  purchase: ['activity', 'explanation', 'budget', 'amount'],
}

// An equality token, not a credential. Use the same authorized state on reads and
// inside the synchronous review transaction. Never bind unrelated staff notes.
export function inspectionContext(data: Dataset, reviewer: ActorId, application: Application, slot: DocumentSlot): string | null {
  const snapshot = application.submitted
  const file = data.files.find(file => file.id === snapshot?.documents[slot])
  if (!snapshot || !file) return null
  return JSON.stringify({
    version: 'source-inspection-v1', datasetId: data.meta.datasetId, reviewer,
    applicationId: application.id, slot, fileId: file.id, hash: file.hash,
    product: application.product,
    details: details[slot].map(field => [field, snapshot.fields[field]]),
    evidenceMonths: slot === 'financial' ? application.evidenceMonths : null,
    submittedAt: application.submittedAt,
    publications: application.history.filter(event => ['submitted', 'resubmitted', 'correctionsRequested'].includes(event.kind)).map(event => [event.id, event.sequence]),
    assignments: application.activity.filter(event => event.kind === 'assigned').map(event => [event.id, event.sequence]),
    assignee: application.assignee,
  })
}
