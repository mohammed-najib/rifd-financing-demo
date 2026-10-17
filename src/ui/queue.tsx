import { useEffect, useRef, useState } from 'react'
import { defaultParseSearch, defaultStringifySearch } from '@tanstack/react-router'
import { resolveQueueQuery } from '../demo/queue'
import type { Context, Demo, ErrorKind, QueuePreferenceOperation, QueueQuery, StaffQueue } from '../demo'
import { products } from '../domain'
import { queuePreferencesSchema, type Language, type QueuePreferences } from '../domain/model'
import { ApplicationRows } from './application-rows'
import { errors, statuses, text } from './i18n'
import { queueText } from './queue-copy'
import { EmptyQueue, ReadFailure } from './feedback'
import { Select } from './select'

export function queueHref(query: QueueQuery) {
  return `/staff/applications${defaultStringifySearch({ search: query.search, status: query.status, product: query.product, assignment: query.assignment, sort: query.sort, page: query.page })}`
}

export function StaffApplicationQueue({ demo, context, language, input, href, reload, go, acceptContext }: {
  demo: Demo; context: Context; language: Language; input: Record<string, unknown>; href: string; reload: number;
  go: (path: string, replace?: boolean) => void; acceptContext: (context: Context) => void;
}) {
  const query = resolveQueueQuery(input, context.preferences.queue)
  const queryHref = queueHref(query)
  const [queue, setQueue] = useState<StaffQueue | null>(null)
  const [reading, setReading] = useState(true)
  const [readError, setReadError] = useState<ErrorKind | null>(null)
  const [retry, setRetry] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [refused, setRefused] = useState<{ intent: QueuePreferenceOperation; error: ErrorKind; latest: Context | null; committed: boolean } | null>(null)
  const alive = useRef(true)
  const pagination = useRef<HTMLElement>(null)
  const actions = useRef({ go, acceptContext, href })
  actions.current = { go, acceptContext, href }
  const t = (key: keyof typeof text) => text[key][language]
  const q = (key: keyof typeof queueText) => queueText[key][language]
  const preferenceValues = ({ status, product, assignment, sort }: QueueQuery): QueuePreferences => ({ status, product, assignment, sort })

  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
  useEffect(() => { setSaved(false) }, [href])
  useEffect(() => {
    let active = true
    setReading(true); setReadError(null)
    const input = defaultParseSearch(new URL(queryHref, window.location.origin).search)
    void demo.readStaffQueue(input).then(result => {
      if (!active) return
      setReading(false)
      if (!result.ok) { setReadError(result.error.kind); return }
      setQueue(result.value)
      const canonical = queueHref(result.value.query)
      if (actions.current.href !== canonical) actions.current.go(canonical, true)
    })
    return () => { active = false }
  }, [demo, queryHref, reload, retry])
  useEffect(() => {
    if (reading || readError) return
    const focused = document.activeElement
    if (focused instanceof HTMLButtonElement && pagination.current?.contains(focused)) {
      focused.scrollIntoView({ block: 'center' })
    }
  }, [reading, readError, queue])

  const persist = async (intent: QueuePreferenceOperation) => {
    setSaving(true); setSaved(false)
    const result = await demo.execute(intent)
    if (!alive.current) return
    setSaving(false)
    if (result.ok) { setRefused(null); setSaved(true); actions.current.acceptContext(result.value) }
    else setRefused({ intent, error: result.error.kind, latest: null, committed: false })
  }
  const change = (patch: Partial<QueueQuery>, save = false) => {
    const next = { ...query, ...patch }
    go(queueHref(next))
    if (save) void persist({ kind: 'setQueuePreferences', datasetId: context.datasetId, operationId: crypto.randomUUID(), expectedRevision: context.preferences.revision, queue: preferenceValues(next) })
  }
  const inspect = async () => {
    if (!refused) return
    const intent = refused.intent
    setSaving(true)
    const result = await demo.inspectPreferenceOperation(intent)
    if (!alive.current) return
    setSaving(false)
    if (result.ok) {
      setRefused(current => current?.intent === intent ? { ...current, latest: result.value.context, committed: result.value.status === 'committed' } : current)
      actions.current.acceptContext(result.value.context)
    } else setRefused(current => current?.intent === intent ? { ...current, error: result.error.kind, latest: null } : current)
  }
  const describe = (value: QueuePreferences) => [
    value.status === 'all' ? q('all') : statuses[value.status][language],
    value.product === 'all' ? q('all') : products[value.product].name[language],
    value.assignment === 'all' ? q('all') : value.assignment === 'you' ? t('assignedToYou') : value.assignment === 'unassigned' ? t('unassigned') : q('colleague'),
    q(value.sort),
  ].join(' · ')
  const disabled = saving || !!refused
  const control = 'mt-1.5 w-full max-w-full rounded-control border border-solid border-control-border bg-surface p-2.5 text-inherit aria-disabled:cursor-wait aria-disabled:opacity-65'

  return <>
    <p className="eyebrow">{language === 'ar' ? 'مساحة العمل' : 'Workspace'}</p><h1 tabIndex={-1}>{t('staffApplications')}</h1><p className="intro">{t('staffIntro')}</p>
      <div className="queue-counts mb-5 grid grid-cols-6 gap-[15px] compact:grid-cols-3 narrow:grid-cols-2 narrow:gap-2.5" aria-label={t('all')} aria-busy={!queue && reading}>
        <div><strong>{queue?.total ?? '…'}</strong><span>{t('all')}</span></div>
        {queuePreferencesSchema.shape.status.options.filter(status => status !== 'all').map(status => <div key={status}><strong>{queue?.counts[status] ?? '…'}</strong><span>{statuses[status][language]}</span></div>)}
      </div>
      <p className="text-[13px] text-muted">{t('assignedToYou')}: <bdi>{queue?.assignments.you ?? '…'}</bdi> · {q('colleague')}: <bdi>{queue?.assignments.colleague ?? '…'}</bdi> · {t('unassigned')}: <bdi>{queue?.assignments.unassigned ?? '…'}</bdi></p>
    <section className="panel mb-5" aria-label={q('search')} aria-busy={saving}>
      <label className="block" htmlFor="queue-search">{q('search')}<input className={control} id="queue-search" type="search" value={query.search} aria-describedby="queue-search-hint" onChange={event => change({ search: event.target.value, page: 1 })} /></label>
      <p className="mt-1.5 text-[12px] text-muted" id="queue-search-hint">{q('searchHint')}</p>
      <div className="grid grid-cols-4 gap-4 compact:grid-cols-2 narrow:grid-cols-1">
        <div><label htmlFor="queue-status">{q('status')}</label><Select className="mt-1.5" label={q('status')} id="queue-status" aria-disabled={disabled} value={query.status} onValueChange={value => change({ status: value as QueuePreferences['status'], page: 1 }, true)} options={queuePreferencesSchema.shape.status.options.map(status => ({ value: status, label: status === 'all' ? q('all') : statuses[status][language] }))} /></div>
        <div><label htmlFor="queue-product">{q('product')}</label><Select className="mt-1.5" label={q('product')} id="queue-product" aria-disabled={disabled} value={query.product} onValueChange={value => change({ product: value as QueuePreferences['product'], page: 1 }, true)} options={queuePreferencesSchema.shape.product.options.map(product => ({ value: product, label: product === 'all' ? q('all') : products[product].name[language] }))} /></div>
        <div><label htmlFor="queue-assignment">{q('assignment')}</label><Select className="mt-1.5" label={q('assignment')} id="queue-assignment" aria-disabled={disabled} value={query.assignment} onValueChange={value => change({ assignment: value as QueuePreferences['assignment'], page: 1 }, true)} options={queuePreferencesSchema.shape.assignment.options.map(assignment => ({ value: assignment, label: assignment === 'all' ? q('all') : assignment === 'you' ? t('assignedToYou') : assignment === 'unassigned' ? t('unassigned') : q('colleague') }))} /></div>
        <div><label htmlFor="queue-sort">{q('sort')}</label><Select className="mt-1.5" label={q('sort')} id="queue-sort" aria-disabled={disabled} value={query.sort} onValueChange={value => change({ sort: value as QueuePreferences['sort'] }, true)} options={queuePreferencesSchema.shape.sort.options.map(sort => ({ value: sort, label: q(sort) }))} /></div>
      </div>
      <div className="actions mb-0"><button className="secondary" onClick={() => change({ search: '', page: 1 })}>{q('clear')}</button><button className="secondary" aria-disabled={disabled} onClick={() => { if (!disabled) change({ status: 'all', product: 'all', assignment: 'all', page: 1 }, true) }}>{q('reset')}</button></div>
      <p className="mt-3 mb-0 text-[13px] text-muted" role="status">{saving ? q('saving') : saved ? q('saved') : ''}</p>
    </section>
    {refused && <section className="summary" aria-label={q('conflict')}>
      <p role={refused.committed ? 'status' : 'alert'}>{refused.committed ? q('saved') : errors[refused.error][language]}</p>{!refused.committed && <p>{q('desired')}: {describe(refused.intent.queue)}</p>}
      <button disabled={saving} onClick={() => void inspect()}>{q('inspect')}</button>
      {refused.latest && <><p className="mt-3">{q('latest')}: {describe(refused.latest.preferences.queue)}</p>
        {!refused.committed && <button disabled={saving} onClick={() => void persist({ ...refused.intent, operationId: crypto.randomUUID(), expectedRevision: refused.latest!.preferences.revision })}>{q('reapply')}</button>}
        <button disabled={saving} onClick={() => { change({ ...refused.latest!.preferences.queue, page: 1 }); setRefused(null); setSaved(refused.committed) }}>{q('useLatest')}</button>
      </>}
    </section>}
    <div aria-busy={reading}>
      <p role="status" className="my-4 text-[13px] text-muted">{reading ? t('readLoading') : queue ? language === 'ar' ? `${queue.matched} طلب من ${queue.total}` : `${queue.matched} ${queue.matched === 1 ? 'application' : 'applications'} of ${queue.total}` : ''}</p>
      {readError ? <ReadFailure error={readError} language={language} retry={() => setRetry(value => value + 1)} />
        : !reading && queue && (queue.matched ? <ApplicationRows list={queue.rows} language={language} staff go={go} query={queueHref(queue.query).slice('/staff/applications'.length)} />
          : <EmptyQueue language={language} />)}
    </div>
    {queue && !readError && <nav ref={pagination} className="actions" aria-label={q('pagination')}>
      <button aria-disabled={reading || queue.query.page <= 1} onClick={() => { if (!reading && queue.query.page > 1) change({ page: queue.query.page - 1 }) }}>{q('previous')}</button>
      <span>{language === 'ar' ? `الصفحة ${queue.query.page} من ${queue.pages}` : `Page ${queue.query.page} of ${queue.pages}`}</span>
      <button aria-disabled={reading || queue.query.page >= queue.pages} onClick={() => { if (!reading && queue.query.page < queue.pages) change({ page: queue.query.page + 1 }) }}>{q('next')}</button>
    </nav>}
  </>
}
