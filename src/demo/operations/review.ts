import { currentCorrectionTargets, decisionReadiness, reviewRules } from '../../domain'
import type { Application, Bilingual } from '../../domain/model'
import { DemoError } from '../storage'
import type { z } from 'zod'
import type { reviewOperationSchema } from './commands'

type ReviewEdit = Extract<z.infer<typeof reviewOperationSchema>, { kind: 'assessDocument' | 'recordCheck' | 'saveNote' | 'verifyCorrection' }>
const checks: Record<string, Bilingual> = {
  evidence: { ar: 'اتساق المستندات والبيانات', en: 'Evidence consistency' },
  operatingHistory: { ar: 'مدة مزاولة النشاط', en: 'Operating history' },
  purpose: { ar: 'ملاءمة الغرض لمنتج التمويل', en: 'Product purpose fit' },
  budget: { ar: 'توافق مبلغ التمويل مع تكلفة الشراء', en: 'Purchase budget coverage' },
  capacity: { ar: 'القدرة التوضيحية على السداد', en: 'Repayment capacity' },
}
const outcomes: Record<string, Bilingual> = {
  accepted: { ar: 'مقبول', en: 'Accepted' }, needsReplacement: { ar: 'يحتاج إلى استبدال', en: 'Needs replacement' },
  unchecked: { ar: 'لم يُفحص', en: 'Unchecked' }, passed: { ar: 'اجتاز', en: 'Passed' }, failed: { ar: 'لم يجتز', en: 'Failed' },
}
const hasText = (value: { ar: string; en: string } | null) => !!value && !!value.ar.trim() && !!value.en.trim()

export function validateReviewCommand(application: Application, command: z.infer<typeof reviewOperationSchema>) {
  if (command.kind === 'approve' || command.kind === 'reject') {
    const readiness = decisionReadiness(application)
    if (!hasText(command.reason) || !(command.kind === 'approve' ? readiness.canApprove : readiness.canReject)) throw new DemoError('validation')
  } else if (command.kind === 'verifyCorrection') {
    const round = application.rounds.find(round => round.id === command.roundId)
    if (!round?.response || !currentCorrectionTargets(application.rounds).some(({ roundId, target }) => roundId === command.roundId && target.kind === 'field' && target.field === command.field)) throw new DemoError('validation')
  } else if (command.kind === 'assessDocument') {
    if (!command.inspection || command.inspection.kind === 'unableToOpen' && command.status !== 'needsReplacement') throw new DemoError('validation')
    if (!application.submitted?.documents[command.slot] || application.submitted.documents[command.slot] !== command.fileId) throw new DemoError('validation')
    if (command.status === 'needsReplacement' ? !hasText(command.reason) : command.reason !== null) throw new DemoError('validation')
  } else if (command.kind === 'recordCheck' && command.outcome === 'passed') {
    if (command.check === 'evidence') {
      if (!application.submitted || Object.values(application.submitted.documents).some(file => !file) || !application.assessments || Object.values(application.assessments).some(value => value.status !== 'accepted')) throw new DemoError('validation')
    } else if (command.check !== 'purpose') {
      if (!reviewRules(application.submitted!.fields, application.product, application.submittedAt!)[command.check].passes) throw new DemoError('validation')
    }
  } else if (command.kind === 'saveNote' && !hasText(command.text)) throw new DemoError('validation')
}

export function applyReviewCommand(application: Application, command: ReviewEdit, entry: Pick<Application['activity'][number], 'id' | 'sequence' | 'date' | 'actor'>) {
  if (command.kind === 'assessDocument') {
    application.assessments![command.slot] = { status: command.status, reason: command.reason }
    // A changed assessment invalidates the prior consistency attestation.
    application.checks!.evidence = 'unchecked'
    for (const { roundId, target } of currentCorrectionTargets(application.rounds)) {
      if (application.rounds.find(round => round.id === roundId)?.response && target.kind === 'document' && target.slot === command.slot) target.verified = command.status === 'accepted'
    }
    const documents: Record<string, Bilingual> = { identity: { ar: 'إثبات هوية المتقدم', en: 'Applicant identity evidence' }, business: { ar: 'إثبات النشاط التجاري', en: 'Business evidence' }, financial: { ar: 'ملخص الإيرادات والمصروفات', en: 'Revenue and expense summary' }, purchase: application.product === 'inventory' ? { ar: 'خطة شراء المخزون', en: 'Stock purchase plan' } : { ar: 'عرض سعر المعدات', en: 'Supplier quotation' } }
    application.activity.push({ ...entry, kind: 'assessed', description: {
      ar: `${documents[command.slot].ar}: ${outcomes[command.status].ar}.`, en: `${documents[command.slot].en}: ${outcomes[command.status].en}.`,
    } })
  } else if (command.kind === 'recordCheck') {
    application.checks![command.check] = command.outcome
    application.activity.push({ ...entry, kind: 'checked', description: { ar: `${checks[command.check].ar}: ${outcomes[command.outcome].ar}.`, en: `${checks[command.check].en}: ${outcomes[command.outcome].en}.` } })
  } else if (command.kind === 'verifyCorrection') {
    const target = application.rounds.find(round => round.id === command.roundId)!.targets.find(target => target.kind === 'field' && target.field === command.field)!
    target.verified = command.verified
    application.activity.push({ ...entry, kind: 'verified', description: { ar: command.verified ? 'تم التحقق من تغيير الحقل المطلوب.' : 'أُلغي التحقق من الحقل المطلوب.', en: command.verified ? 'Requested field change verified.' : 'Requested field verification cleared.' } })
  } else {
    application.notes.push({ id: entry.id, actor: 'salma', date: entry.date, text: command.text })
    application.activity.push({ ...entry, kind: 'note', description: { ar: 'حُفظت ملاحظة داخلية.', en: 'Internal note saved.' } })
  }
}
