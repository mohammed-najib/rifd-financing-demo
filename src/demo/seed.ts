import { freezeRepayment, products } from '../domain'
import { slots, type Application, type Bilingual, type Dataset, type DocumentSlot, type StoredFile } from '../domain/model'
import { fileFromBytes, makeFile } from './evidence'
import { amountReason, approvalReason, financialReason, identities, manifest, purchaseReason, quotationReason, rejectionReason, seedFields } from './seed-manifest'

export async function prepareSeed(): Promise<Dataset> {
  // Reuse identical rendered content within this preparation only. File IDs,
  // ownership, hashes and the complete durable catalog remain per application.
  const rendered = new Map<string, Promise<ArrayBuffer>>()
  const files: StoredFile[] = []
  const catalog: Dataset['catalog'] = []
  const applications: Application[] = []
  const notifications: Dataset['notifications'] = []
  const addFile = (file: StoredFile, variant: Dataset['catalog'][number]['variant']) => {
    files.push(file)
    catalog.push({ id: file.id, applicationId: file.applicationId, slot: file.slot, fileId: file.id, product: manifest.find(seed => file.applicationId === `RIFD-2026-${String(seed.number).padStart(3, '0')}`)!.product, variant })
  }
  for (const seed of manifest) {
    const id = `RIFD-2026-${String(seed.number).padStart(3, '0')}`
    const fields = seedFields(seed)
    const evidenceMonths = seed.number === 5 ? ['2026-04', '2026-05', '2026-06'] : ['2026-07', '2026-08', '2026-09']
    const documents: Application['submitted'] = { fields, documents: { identity: null, business: null, financial: null, purchase: null } }
    for (const slot of slots) {
      const file = await makeFile(id, slot, fields, seed.product, evidenceMonths, 'original', seed.replacement === slot, seed.number === 6, rendered)
      addFile(file, 'original')
      if (seed.missing !== slot) documents.documents[slot] = file.id
      if (seed.replacement === slot || seed.missing === slot) {
        const responseFields = seed.number === 4 ? { ...fields, amount: '450000' } : fields
        addFile(await makeFile(id, slot, responseFields, seed.product, evidenceMonths, 'replacement', false, false, rendered), 'replacement')
        const identical = { ...file, id: `${file.id}-renamed`, name: `DEMO-renamed-${file.name}` }
        addFile(identical, 'identical')
      }
    }
    const assessor = seed.assignee ?? 'salma'
    const history: Application['history'] = []
    const activity: Application['activity'] = []
    const event = (kind: Application['history'][number]['kind'], date: string, reason: Bilingual | null = null) => {
      const entry = { id: `${id}-${kind}`, sequence: 1, date, kind, reason }
      history.push(entry)
      activity.push({ ...entry, actor: kind === 'submitted' ? seed.owner : assessor, kind: kind === 'resubmitted' ? 'submitted' : kind, description: reason ?? { ar: kind, en: kind } })
    }
    if (seed.submitted) event('submitted', seed.submitted)
    if (seed.assignee && seed.submitted) activity.push({ id: `${id}-assignment`, sequence: 1, date: seed.submitted, actor: assessor, kind: 'assigned', description: { ar: 'أُسند الطلب إلى المراجع.', en: 'Application assigned to reviewer.' } })
    if (seed.review) event('reviewStarted', seed.review)
    const assessments: Application['assessments'] = seed.status === 'draft' ? null : Object.fromEntries(slots.map(slot => [slot, {
      status: seed.missing === slot ? 'missing' : seed.replacement === slot ? 'needsReplacement' : seed.accepted?.includes(slot) ? 'accepted' : 'awaitingReview',
      reason: seed.replacement === slot ? slot === 'financial' ? financialReason : seed.number === 13 ? quotationReason : purchaseReason : null,
    }])) as NonNullable<Application['assessments']>
    const checks: Application['checks'] = seed.status === 'draft' ? null : {
      evidence: seed.status === 'approved' ? 'passed' : 'unchecked',
      operatingHistory: seed.operating ?? 'unchecked', purpose: seed.status === 'approved' ? 'passed' : 'unchecked',
      budget: seed.status === 'approved' ? 'passed' : 'unchecked', capacity: seed.status === 'approved' ? 'passed' : seed.capacity ?? 'unchecked',
    }
    if (seed.review && assessments && checks) {
      for (const slot of slots) if (assessments[slot].status !== 'awaitingReview' && assessments[slot].status !== 'missing') {
        activity.push({ id: `${id}-assessment-${slot}`, sequence: 1, date: seed.review, actor: assessor, kind: 'assessed', description: {
          ar: `تقييم المستند ${slot}: ${assessments[slot].status}`, en: `Document ${slot}: ${assessments[slot].status}`,
        } })
      }
      for (const [check, status] of Object.entries(checks)) if (status !== 'unchecked') {
        activity.push({ id: `${id}-check-${check}`, sequence: 1, date: seed.review, actor: assessor, kind: 'checked', description: { ar: `فحص ${check}: ${status}`, en: `Check ${check}: ${status}` } })
      }
    }
    const rounds: Application['rounds'] = []
    if (seed.request) {
      const targets: Application['rounds'][number]['targets'] = []
      if (seed.number === 4) targets.push({ kind: 'field', field: 'amount', reason: amountReason, verified: false })
      const slot = seed.replacement as DocumentSlot
      const reason = slot === 'financial' ? financialReason : seed.number === 13 ? quotationReason : purchaseReason
      targets.push({ kind: 'document', slot, reason, verified: false })
      rounds.push({ id: `${id}-round-1`, requestedAt: seed.request, baseline: structuredClone(documents), targets, response: null })
      event('correctionsRequested', seed.request, { ar: targets.map(target => target.reason.ar).join(' '), en: targets.map(target => target.reason.en).join(' ') })
      notifications.push({ id: `${id}-notice`, owner: seed.owner, applicationId: id, kind: 'correctionsRequested', date: seed.request, read: false, revision: 1 })
    }
    if (seed.final) {
      const kind = seed.status === 'approved' ? 'approved' : 'rejected'
      event(kind, seed.final, kind === 'approved' ? approvalReason : rejectionReason)
      notifications.push({ id: `${id}-notice`, owner: seed.owner, applicationId: id, kind, date: seed.final, read: false, revision: 1 })
    }
    const notes: Application['notes'] = seed.review ? [{ id: `${id}-note`, actor: assessor, date: seed.review, text: {
      ar: seed.request ? 'المستند يحتاج إلى نسخة مقروءة. يظل التقييم على المعلومات المقدمة.' : 'ملاحظة داخلية افتراضية للمراجع عن فحص المستندات.',
      en: seed.request ? 'Evidence needs a readable copy. Continue assessing submitted information.' : 'Fictional internal reviewer note on document inspection.',
    } }] : []
    for (const note of notes) activity.push({ id: note.id, sequence: 1, date: note.date, actor: assessor, kind: 'note', description: note.text })
    applications.push({
      id, owner: seed.owner, product: seed.product, status: seed.status, assignee: seed.assignee, sharedRevision: 1,
      submittedAt: seed.submitted, evidenceMonths, submitted: seed.status === 'draft' ? null : structuredClone(documents),
      workspace: seed.status === 'draft' || seed.request ? { revision: 1, roundId: rounds[0]?.id ?? null, savedAt: seed.request ?? '2026-10-14', snapshot: structuredClone(documents) } : null,
      history, rounds, assessments, checks, notes, activity,
      repayment: seed.status === 'approved' ? freezeRepayment(seed.amount, seed.term, products[seed.product], seed.final!, 2) : null,
    })
  }
  const draftFile = files[0]
  addFile(await fileFromBytes('sample-invalid', draftFile.applicationId, 'identity', 'DEMO-invalid.txt', 'text/plain', new TextEncoder().encode('DEMO / تجريبي').buffer), 'invalidType')
  addFile(await fileFromBytes('sample-empty', draftFile.applicationId, 'identity', 'DEMO-empty.pdf', 'application/pdf', new ArrayBuffer(0)), 'empty')
  addFile(await fileFromBytes('sample-oversized', draftFile.applicationId, 'identity', 'DEMO-oversized.pdf', 'application/pdf', new ArrayBuffer(5_000_001)), 'oversized')
  // One durable order covers both public and internal events, including same-day events.
  const events = applications.flatMap(application => application.activity).sort((a, b) => a.date.localeCompare(b.date))
  events.forEach((entry, index) => { entry.sequence = index + 1 })
  for (const application of applications) {
    for (const entry of application.history) entry.sequence = events.find(event => event.id === entry.id)!.sequence
    application.activity.sort((a, b) => a.sequence - b.sequence)
    application.history.sort((a, b) => a.sequence - b.sequence)
  }
  return {
    meta: { schemaVersion: 1, seedVersion: 1, ruleVersion: 1, datasetId: crypto.randomUUID(), eventSequence: events.length },
    identities: structuredClone(identities), applications, files, notifications, catalog,
    preferences: { revision: 1, language: 'ar', queue: { status: 'all', product: 'all', assignment: 'all', sort: 'dateDesc' } }, receipts: [], mutationReceipts: [],
  }
}
