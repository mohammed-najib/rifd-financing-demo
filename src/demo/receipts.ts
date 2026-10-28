import type { z } from 'zod'
import type { ActorId, Dataset } from '../domain/model'
import { applicationFingerprint, reviewOperationSchema } from './operations/commands'
import type { ApplicationMutation, NotificationReadOperation, PreferenceOperation } from './types'
import { DemoError } from './storage'

type ReviewOperationInput = z.infer<typeof reviewOperationSchema>

export function applicationReceipt(data: Dataset, who: ActorId, operation: ApplicationMutation | ReviewOperationInput) {
  const receipt = data.mutationReceipts.find(receipt => receipt.actor === who && receipt.operationId === operation.operationId)
  if (data.receipts.some(receipt => receipt.actor === who && receipt.operationId === operation.operationId) || receipt && receipt.fingerprint !== applicationFingerprint(operation)) throw new DemoError('identifierMisuse')
  return receipt
}

export function notificationReceipt(data: Dataset, who: ActorId, command: NotificationReadOperation) {
  const fingerprint = JSON.stringify({ kind: command.kind, notificationId: command.notificationId })
  const receipt = data.receipts.find(receipt => receipt.actor === who && receipt.operationId === command.operationId)
  if (data.mutationReceipts.some(receipt => receipt.actor === who && receipt.operationId === command.operationId) || receipt && receipt.fingerprint !== fingerprint) throw new DemoError('identifierMisuse')
  return { receipt, fingerprint }
}

export function preferenceReceipt(data: Dataset, by: string, command: PreferenceOperation) {
  const fingerprint = JSON.stringify(command.kind === 'setLanguage' ? { kind: command.kind, language: command.language } : { kind: command.kind, queue: command.queue })
  const receipt = data.receipts.find(receipt => receipt.actor === by && receipt.operationId === command.operationId)
  if (data.mutationReceipts.some(receipt => receipt.actor === by && receipt.operationId === command.operationId) || receipt && receipt.fingerprint !== fingerprint) throw new DemoError('identifierMisuse')
  return { receipt, fingerprint }
}