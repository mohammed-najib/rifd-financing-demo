import { PDFDocument } from 'pdf-lib'
import type { EvidenceInput, StageRequest } from '../../../src/evidence-assistance/contract'
import { nativeIdentity } from './evidence-transport'

export const financialInput: EvidenceInput = { action: 'check-document', applicationId: 'RIFD-2026-001', slot: 'financial', audience: 'applicant', context: 'draft', declaredFinancial: { revenue: '١٦٣٬٢٠٠', expenses: '81,600' } }

export async function financialFile(count = 4, options: { wrongPeriod?: boolean; conflict?: boolean; large?: boolean; monthlyPages?: boolean } = {}) {
  const pdf = await PDFDocument.create()
  for (let i = 0; i < count; i++) {
    const canvas = document.createElement('canvas'); canvas.width = options.large ? 1500 : 700; canvas.height = options.large ? 1500 : 950
    const context = canvas.getContext('2d')!
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#000'; context.font = '23px sans-serif'
    const months = options.wrongPeriod ? ['2026-04', '2026-05', '2026-06'] : ['2026-07', '2026-08', '2026-09']
    const visibleMonths = options.monthlyPages && i < 3 ? [months[i]] : months
    const lines = ['Fictional revenue and expense summary', 'ملخص إيرادات ومصروفات افتراضي', `Reporting period: ${visibleMonths.join(', ')}`, ...(options.monthlyPages && i === 3 ? [] : visibleMonths).map(month => `${month}: revenue 163200 YER, expenses 81600 YER`), ...(!options.monthlyPages || i === 3 ? ['Average revenue: 163200 YER', 'Average expenses: 81600 YER'] : []), ...(options.conflict ? ['Conflicting average revenue: 190000 YER'] : []), `Original source page ${i + 1}`]
    lines.forEach((line, index) => context.fillText(line, 25, 60 + index * 55, canvas.width - 50))
    const blob = await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.9))
    const image = await pdf.embedJpg(await blob.arrayBuffer())
    pdf.addPage([canvas.width, canvas.height]).drawImage(image, { x: 0, y: 0, width: canvas.width, height: canvas.height })
  }
  return new File([new Uint8Array(await pdf.save())], 'fictional-financial.pdf', { type: 'application/pdf' })
}

export async function attachFinancial(file: File) {
  const context = await window.demo.context()
  if (!context.ok) throw new Error('context')
  const result = await window.demo.prepareAttachment({ datasetId: context.value.datasetId, applicationId: financialInput.applicationId, slot: 'financial', selectionId: crypto.randomUUID(), source: { kind: 'local', file } })
  if (!result.ok) throw new Error(result.error.kind)
  return result.value
}

export function nativeFinancial(request: Pick<StageRequest, 'questions'> & Partial<Pick<StageRequest, 'stage' | 'image'>>, options: { period?: 'different' | 'conflict'; revenue?: 'conflict'; unreadable?: boolean; monthlyPages?: boolean } = {}) {
  const support = (choice: string) => ({ type: 'choice', choice, confidence: 0.999, probabilities: { consistent: choice === 'consistent' ? 1 : 0, different: choice === 'different' ? 1 : 0, not_found: choice === 'not_found' ? 1 : 0, conflict: choice === 'conflict' ? 1 : 0, uncertain: 0 } })
  const answers: Record<string, unknown> = {
    category: { type: 'choice', choice: 'financial', confidence: 0.999, probabilities: { identity: 0, business: 0, financial: 1, stock: 0, equipment: 0, other: 0, mixed: 0, uncertain: 0 } },
    readability: options.unreadable ? { ...nativeIdentity().answers.readability, score: 0, probabilities: { '0': 1, '1': 0, '2': 0 } } : nativeIdentity().answers.readability,
    periodPresence: { type: 'noul', noul: 0.999 },
    month1RevenuePresence: { type: 'noul', noul: 0.999 }, month1ExpensesPresence: { type: 'noul', noul: 0.999 },
    month2RevenuePresence: { type: 'noul', noul: 0.999 }, month2ExpensesPresence: { type: 'noul', noul: 0.999 },
    month3RevenuePresence: { type: 'noul', noul: 0.999 }, month3ExpensesPresence: { type: 'noul', noul: 0.999 },
    revenuePresence: { type: 'noul', noul: 0.999 }, expensesPresence: { type: 'noul', noul: 0.999 },
    revenueSupport: support(options.revenue ?? 'consistent'), expensesSupport: support('consistent'), periodSupport: support(options.period ?? 'consistent'),
  }
  if (options.monthlyPages && request.stage === 'page') {
    const page = request.image!.manifest.page
    for (const month of [1, 2, 3]) for (const field of ['Revenue', 'Expenses']) answers[`month${month}${field}Presence`] = { type: 'noul', noul: page === month ? 0.999 : 0.001 }
    if (page !== 4) for (const field of ['revenue', 'expenses']) { answers[`${field}Presence`] = { type: 'noul', noul: 0.001 }; answers[`${field}Support`] = support('not_found') }
  }
  return { model: 'jev-1.14.0', answers: Object.fromEntries(Object.entries(answers).filter(([key]) => key in request.questions)), usage: { input_tokens: 2500, output_tokens: 100 } }
}

export async function partialFinancialFile() {
  const pdf = await PDFDocument.load(await (await financialFile(1, { conflict: true })).arrayBuffer())
  pdf.addPage([700, 950]).drawText('Fictional second page requiring a missing font resource', { x: 25, y: 850 })
  return new File([new Uint8Array(await pdf.save())], 'partial-financial.pdf', { type: 'application/pdf' })
}
