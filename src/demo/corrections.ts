import { normalizeField } from '../domain'
import type { Application, DocumentSlot, Fields, Snapshot, StoredFile } from '../domain/model'
import type { SaveCorrectionsOperation, ResubmitOperation } from './types'
import { DemoError } from './storage'

export function activeCorrection(application: Application, roundId = application.workspace?.roundId) {
  const round = application.rounds.at(-1)
  if (application.status !== 'correctionsRequested' || !application.workspace || !round || round.response || round.id !== roundId || application.workspace.roundId !== round.id) throw new DemoError('invalidState')
  return round
}

export function correctionDocument(application: Application, slot: DocumentSlot) {
  const round = activeCorrection(application)
  if (!round.targets.some(target => target.kind === 'document' && target.slot === slot)) throw new DemoError('permissionDenied', slot)
  return round
}

export function validateCorrectionFields(application: Application, fields: Fields, roundId = application.workspace?.roundId) {
  const round = activeCorrection(application, roundId)
  for (const field of Object.keys(fields) as Array<keyof Fields>) {
    if (!round.targets.some(target => target.kind === 'field' && target.field === field) && fields[field] !== round.baseline.fields[field]) throw new DemoError('permissionDenied')
  }
  return round
}

export function validateCorrectionSave(application: Application, command: SaveCorrectionsOperation | ResubmitOperation) {
  const round = validateCorrectionFields(application, command.fields, command.roundId)
  if (application.product !== command.product) throw new DemoError('permissionDenied')
  for (const slot of Object.keys(command.documents) as DocumentSlot[]) {
    const document = command.documents[slot]
    if (!round.targets.some(target => target.kind === 'document' && target.slot === slot) && (document.kind !== 'saved' || document.fileId !== round.baseline.documents[slot])) throw new DemoError('permissionDenied', slot)
  }
}

export function validateResubmission(application: Application, response: Snapshot, files: StoredFile[]) {
  const round = activeCorrection(application)
  for (const target of round.targets) {
    if (target.kind === 'field') {
      if (normalizeField(target.field, response.fields[target.field]) === normalizeField(target.field, round.baseline.fields[target.field])) throw new DemoError('validation')
    } else {
      const before = files.find(file => file.id === round.baseline.documents[target.slot])
      const after = files.find(file => file.id === response.documents[target.slot])
      if (!after || before?.hash === after.hash) throw new DemoError('validation', target.slot)
    }
  }
}
