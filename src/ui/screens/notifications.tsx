import { useEffect, useRef, useState } from 'react';
import type { AttemptIntent, Demo, ErrorKind } from '../../demo';
import type { Language, Notification } from '../../domain/model';
import { date, errors, events, text } from '../i18n';
import { notificationText as copy } from './notification-copy';

type NotificationIntent = Extract<AttemptIntent, { kind: 'markNotificationRead' }>;

export function NotificationCard({
  notice,
  language,
  disabled,
  open,
  markRead,
}: {
  notice: Notification;
  language: Language;
  disabled?: boolean;
  open: () => void;
  markRead: () => void;
}) {
  return (
    <article className="panel" data-notification={notice.id}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2>{events[notice.kind][language]}</h2>
        <span className="status bg-summary text-accent">
          {copy[notice.read ? 'read' : 'unread'][language]}
        </span>
      </div>
      <p>
        <bdi>{notice.applicationId}</bdi> · <bdi>{date(notice.date, language)}</bdi>
      </p>
      <div className="actions">
        <a
          className="button secondary"
          href={`/applications/${notice.applicationId}`}
          aria-disabled={!!disabled}
          onClick={event => {
            event.preventDefault();
            if (!disabled) open();
          }}
        >
          {copy.open[language]}
        </a>
        {!notice.read && (
          <button disabled={disabled} onClick={markRead}>
            {copy.mark[language]}
          </button>
        )}
      </div>
    </article>
  );
}

export function Notifications({
  demo,
  language,
  reload,
  go,
}: {
  demo: Demo;
  language: Language;
  reload: number;
  go: (path: string) => void;
}) {
  const [notices, setNotices] = useState<Notification[] | null>(null);
  const [error, setError] = useState<ErrorKind | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [pending, setPending] = useState<{
    intent: NotificationIntent;
    open: boolean;
    phase: 'working' | 'inspect' | 'retry';
  } | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    void demo.readNotifications().then(result => {
      if (!active) return;
      if (result.ok) setNotices(result.value);
      else setError(result.error.kind);
    });
    return () => {
      active = false;
    };
  }, [demo, reload, refresh]);
  const accept = (notification: Notification) =>
    setNotices(
      current =>
        current?.map(notice => (notice.id === notification.id ? notification : notice)) ?? null,
    );
  const run = async (intent: NotificationIntent, open: boolean) => {
    setPending({ intent, open, phase: 'working' });
    setError(null);
    const result = await demo.attempt(intent);
    if (!alive.current) return;
    if (!result.ok) {
      setError(result.error.kind);
      setPending({ intent, open, phase: 'retry' });
      return;
    }
    const outcome = result.value;
    if (outcome.status === 'committed') {
      accept(outcome.result.notification);
      setPending(null);
      if (open) go(outcome.result.destination);
      return;
    }
    if (outcome.status === 'unknown' || outcome.status === 'stale') {
      setError(outcome.status === 'stale' ? outcome.cause : 'outcomeUnknown');
      setPending({ intent, open, phase: 'inspect' });
      return;
    }
    setError('requestFailed');
    setPending({ intent, open, phase: 'retry' });
  };
  const open = async (notice: Notification) => {
    if (!notice.read) {
      void run(
        {
          kind: 'markNotificationRead',
          notificationId: notice.id,
          expectedRevision: notice.revision,
        },
        true,
      );
      return;
    }
    setError(null);
    const result = await demo.resolveNotification(notice.id);
    if (!alive.current) return;
    if (result.ok) go(result.value.destination);
    else setError(result.error.kind);
  };
  const inspect = async () => {
    if (!pending) return;
    setPending({ ...pending, phase: 'working' });
    const result = await demo.inspectAttempt(pending.intent);
    if (!alive.current) return;
    if (!result.ok) {
      setError(result.error.kind);
      setPending({ ...pending, phase: 'inspect' });
      return;
    }
    setError(null);
    if (result.value.status === 'committed') {
      accept(result.value.result.notification);
      setPending(null);
      if (pending.open) go(result.value.result.destination);
    } else if (result.value.status === 'notCommitted' && result.value.latest) {
      const current = result.value.latest as { notification: Notification };
      accept(current.notification);
      setPending(
        current.notification.revision === pending.intent.expectedRevision
          ? { ...pending, phase: 'retry' }
          : null,
      );
    } else {
      setPending({ ...pending, phase: 'retry' });
    }
  };
  return (
    <>
      <h1 tabIndex={-1}>{copy.title[language]}</h1>
      <p className="intro">{copy.intro[language]}</p>
      {!notices ? (
        !error && <p role="status">{text.readLoading[language]}</p>
      ) : notices.length ? (
        <div className="grid gap-5">
          {notices.map(notice => (
            <NotificationCard
              key={notice.id}
              notice={notice}
              language={language}
              disabled={!!pending}
              open={() => void open(notice)}
              markRead={() =>
                void run(
                  {
                    kind: 'markNotificationRead',
                    notificationId: notice.id,
                    expectedRevision: notice.revision,
                  },
                  false,
                )
              }
            />
          ))}
        </div>
      ) : (
        <p className="summary">{copy.empty[language]}</p>
      )}
      {pending?.phase === 'working' && <p role="status">{copy.saving[language]}</p>}
      {error && (
        <p className="summary" role="alert">
          {errors[error][language]}
        </p>
      )}
      {pending?.phase === 'inspect' && (
        <button onClick={() => void inspect()}>{copy.inspect[language]}</button>
      )}
      {pending?.phase === 'retry' && (
        <button onClick={() => void run(pending.intent, pending.open)}>
          {text.retry[language]}
        </button>
      )}
      {error && !pending && (
        <button
          onClick={() => {
            setError(null);
            setRefresh(value => value + 1);
          }}
        >
          {text.retry[language]}
        </button>
      )}
    </>
  );
}
