import type { ErrorKind } from '../../demo';
import type { Language } from '../../domain/model';
import { applicationText } from '../application/application-copy';
import { draftText, errors, text } from '../i18n';
import { queueText } from '../queue/queue-copy';

export type SaveStatus = 'unsaved' | 'saving' | 'saved' | 'failed' | 'unknown';
export function DraftSaveFeedback({
  status,
  savedAt,
  error,
  operation,
  language,
}: {
  status: SaveStatus;
  savedAt: string | null;
  error: ErrorKind | null;
  operation?: 'submit' | 'resubmit';
  language: Language;
}) {
  const message =
    operation && status === 'saving'
      ? applicationText.submitting
      : operation && status === 'unknown'
        ? applicationText.submissionUnknown
        : operation && status === 'failed'
          ? applicationText.submissionFailed
          : draftText[status];
  return (
    <>
      <div className="draft-feedback" aria-busy={status === 'saving'}>
        <p role="status">{message[language]}</p>
        <p>
          {draftText.lastSave[language]}:{' '}
          <bdi>
            {savedAt
              ? new Intl.DateTimeFormat(language === 'ar' ? 'ar-u-nu-latn' : 'en-GB', {
                  dateStyle: 'medium',
                  timeStyle: 'medium',
                }).format(new Date(savedAt))
              : applicationText.noSave[language]}
          </bdi>
        </p>
      </div>
      {error && (
        <p role="alert">
          {operation && error === 'requestFailed'
            ? applicationText.submissionFailed[language]
            : operation && error === 'outcomeUnknown'
              ? applicationText.submissionUnknown[language]
              : errors[error][language]}
        </p>
      )}
    </>
  );
}

export function LoadingPanel({ language }: { language: Language }) {
  return (
    <section
      className="panel min-h-[250px] pt-[75px] text-center text-muted narrow:pt-5"
      role="status"
      aria-busy="true"
    >
      {text.readLoading[language]}
    </section>
  );
}

export function ReadFailure({
  error,
  language,
  retry,
}: {
  error: ErrorKind;
  language: Language;
  retry: () => void;
}) {
  return (
    <p className="mt-5" role="alert">
      {errors[error][language]} <button onClick={retry}>{text.retry[language]}</button>
    </p>
  );
}

export function EmptyQueue({ language }: { language: Language }) {
  return (
    <section className="panel">
      <h2>{queueText.empty[language]}</h2>
      <p>{queueText.emptyHint[language]}</p>
    </section>
  );
}
