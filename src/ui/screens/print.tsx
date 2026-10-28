import type { PrintSummary } from '../../demo';
import { products } from '../../domain';
import type { Language } from '../../domain/model';
import { date, documentLabel, statuses, text } from '../i18n';
import {
  ApplicationInformation,
  PublicCorrections,
  PublicHistory,
} from '../application/public-record';

export const printText = {
  title: { ar: 'ملخص الطلب للطباعة', en: 'Printable application summary' },
  print: { ar: 'طباعة الملخص', en: 'Print summary' },
  back: { ar: 'العودة إلى الطلب', en: 'Back to application' },
  draft: {
    ar: 'مسودة. يعرض هذا الملخص آخر تقدم محفوظ فقط.',
    en: 'Draft. This summary contains only the last saved progress.',
  },
  submitted: {
    ar: 'يعرض هذا الملخص آخر معلومات مقدمة. لا يشمل التصحيحات الخاصة غير المقدمة.',
    en: 'This summary contains the last submitted information. Unfinished private corrections are excluded.',
  },
  saved: { ar: 'آخر حفظ', en: 'Last saved' },
};

export function PrintApplication({
  summary,
  language,
  staff,
  queueSearch,
  go,
}: {
  summary: PrintSummary;
  language: Language;
  staff: boolean;
  queueSearch: string;
  go: (path: string) => void;
}) {
  const destination = `${staff ? '/staff' : ''}/applications/${summary.id}${summary.status === 'draft' ? '/edit?step=personal' : staff ? queueSearch : ''}`;
  return (
    <article
      className="print-summary mx-auto max-w-[960px]"
      lang={language}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <p className="eyebrow">رِفد / RIFD · {products[summary.product].name[language]}</p>
      <h1 tabIndex={-1}>{printText.title[language]}</h1>
      <p>
        <bdi className="font-latin">{summary.id}</bdi> · {statuses[summary.status][language]}
      </p>
      <p>{text.notice[language]}</p>
      <p>{printText[summary.status === 'draft' ? 'draft' : 'submitted'][language]}</p>
      <p>
        {summary.savedAt ? printText.saved[language] : text.submittedAt[language]}:{' '}
        <bdi>
          {summary.savedAt
            ? date(summary.savedAt.slice(0, 10), language)
            : summary.submittedAt
              ? date(summary.submittedAt, language)
              : text.notSubmitted[language]}
        </bdi>
      </p>
      <div className="print-controls actions">
        <button onClick={() => window.print()}>{printText.print[language]}</button>
        <a
          className="button secondary"
          href={destination}
          onClick={event => {
            event.preventDefault();
            go(destination);
          }}
        >
          {printText.back[language]}
        </a>
      </div>
      <section className="panel mb-6">
        <h2>
          {text[summary.status === 'draft' ? 'savedInformation' : 'submittedInformation'][language]}
        </h2>
        <ApplicationInformation record={summary} language={language} />
      </section>
      <section className="panel mb-6">
        <h2>{text.documents[language]}</h2>
        <ul className="document-list">
          {summary.documents.map(document => (
            <li key={document.slot}>
              <strong>{documentLabel(document.slot, summary.product)[language]}</strong>
              <p>
                {document.file
                  ? text[summary.status === 'draft' ? 'savedInDraft' : 'included'][language]
                  : text.missing[language]}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <PublicCorrections record={summary} language={language} />
      <PublicHistory history={summary.history} language={language} />
    </article>
  );
}
