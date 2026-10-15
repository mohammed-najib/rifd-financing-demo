import type { Application, DocumentSlot, Fields } from '../domain/model'
import type { SaveCorrectionsOperation } from './types'
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

export function validateCorrectionSave(application: Application, command: SaveCorrectionsOperation) {
  const round = activeCorrection(application, command.roundId)
  if (application.product !== command.product) throw new DemoError('permissionDenied')
  for (const field of Object.keys(command.fields) as Array<keyof Fields>) {
    if (!round.targets.some(target => target.kind === 'field' && target.field === field) && command.fields[field] !== round.baseline.fields[field]) throw new DemoError('permissionDenied')
  }
  for (const slot of Object.keys(command.documents) as DocumentSlot[]) {
    const document = command.documents[slot]
    if (!round.targets.some(target => target.kind === 'document' && target.slot === slot) && (document.kind !== 'saved' || document.fileId !== round.baseline.documents[slot])) throw new DemoError('permissionDenied', slot)
  }
}
