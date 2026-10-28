import type { ApplicationView } from '../../demo'
import { normalizeField } from '../../domain'
import type { Bilingual, Fields, Language } from '../../domain/model'
import { date, displayFieldValue, documentLabel, fieldLabels, text } from '../i18n'

export const responseText = {
  resubmit: { ar: 'إعادة تقديم التصحيحات', en: 'Resubmit corrections' },
  resubmitted: { ar: 'أُعيد تقديم التصحيحات.', en: 'Corrections resubmitted.' },
  inspectResubmission: { ar: 'فحص نتيجة إعادة التقديم', en: 'Inspect resubmission outcome' },
  requiredChange: { ar: 'يلزم تغيير صالح عن المرجع، أو مستند بمحتوى مختلف.', en: 'Supply a valid change from baseline, or evidence with different content.' },
  title: { ar: 'الرد على التصحيحات', en: 'Respond to corrections' },
  hint: { ar: 'عدّل الأهداف المطلوبة فقط واحفظ حتى الإدخال غير المكتمل. يظل المنتج وباقي المعلومات للقراءة فقط. لا ترى المراجعة الرد الخاص حتى إعادة تقديمه.', en: 'Edit only the requested targets and save even incomplete input. The product and other information are read-only. Staff see the submitted information until resubmission.' },
  saved: { ar: 'محفوظ في مساحة التصحيح', en: 'Saved in correction workspace' },
  progress: { ar: 'تقدم الرد', en: 'Response progress' },
  changed: { ar: 'تغير عن المرجع؛ يلزم التحقق قبل إعادة التقديم', en: 'Changed from baseline; validation required before resubmission' },
  unchanged: { ar: 'لم يتغير عن المرجع بعد', en: 'Not changed from baseline yet' },
  summary: { ar: 'ملخص الرد الخاص', en: 'Private response summary' },
  newer: { ar: 'حُفظ رد خاص أحدث. بقيت تعديلاتك دون تطبيق. افحص الرد المحفوظ ثم اختر إعادة تطبيقها.', en: 'A newer private response was saved. Your edits remain unapplied. Inspect the saved response, then choose to reapply them.' },
  inspect: { ar: 'فحص مساحة التصحيح الأحدث', en: 'Inspect latest correction workspace' },
  open: { ar: 'فتح مساحة التصحيح', en: 'Open correction workspace' },
  private: { ar: 'هذا تقدم خاص محفوظ. تظل المعلومات المقدمة دون تغيير حتى إعادة التقديم.', en: 'This is privately saved progress. Submitted information stays unchanged until resubmission.' },
} satisfies Record<string, Bilingual>

export function workspaceView(view: ApplicationView): ApplicationView {
  return view.role === 'applicant' && view.workspace ? { ...view, snapshot: view.workspace.snapshot, documents: view.workspaceDocuments } : view
}

export function CorrectionProgress({ view, fields, documentChanged, language }: { view: ApplicationView; fields: Fields; documentChanged: (slot: 'identity' | 'business' | 'financial' | 'purchase') => boolean; language: Language }) {
  const round = view.rounds.at(-1)
  if (!round) return null
  const changed = (target: typeof round.targets[number]) => target.kind === 'field'
    ? normalizeField(target.field, fields[target.field]) !== normalizeField(target.field, round.baseline.fields[target.field])
    : documentChanged(target.slot)
  return <section className="summary mb-6" aria-labelledby="response-progress"><h3 id="response-progress">{responseText.progress[language]}</h3><p>{responseText.hint[language]}</p><p>{text.baseline[language]}: <bdi>{date(round.requestedAt, language)}</bdi></p>
    <p>{round.targets.filter(changed).length} / {round.targets.length} {responseText.changed[language]}</p>
    <ul>{round.targets.map(target => <li key={target.kind === 'field' ? target.field : target.slot}><strong>{target.kind === 'field' ? fieldLabels[target.field][language] : documentLabel(target.slot, view.product)[language]}</strong><p>{target.reason[language]}</p>
      {target.kind === 'field' && <p>{text.baseline[language]}: <bdi>{displayFieldValue(target.field, round.baseline.fields[target.field], language)}</bdi></p>}
      <p>{responseText[changed(target) ? 'changed' : 'unchanged'][language]}</p></li>)}</ul>
  </section>
}
