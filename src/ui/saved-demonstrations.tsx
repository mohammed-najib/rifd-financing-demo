import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Demo } from '../demo'
import type { Language } from '../domain/model'
import type { OpenedSavedDemonstration, SavedExample, SavedSelection } from '../demo/saved-demonstrations'
import { errors } from './i18n'
import { savedLimitations, savedNames, savedTargets, savedText } from './saved-demonstration-copy'

function SavedSource({ opened, language }: { opened: OpenedSavedDemonstration; language: Language }) {
  const [page, setPage] = useState(0)
  const [urls, setUrls] = useState<{ source: string; pages: string[] } | null>(null)
  const [imageValid, setImageValid] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const t = (key: keyof typeof savedText) => savedText[key][language]
  useEffect(() => {
    const source = URL.createObjectURL(new Blob([opened.source.bytes], { type: opened.source.mime }))
    const pages = opened.pages.map(page => URL.createObjectURL(new Blob([page.bytes], { type: 'image/png' })))
    setUrls({ source, pages })
    return () => { URL.revokeObjectURL(source); pages.forEach(url => URL.revokeObjectURL(url)) }
  }, [opened])
  const raster = opened.pages[page]
  const highlights = opened.capture.findings.highlights.filter(highlight => highlight.page === raster.page)
  return <div className="min-w-0">
    <div className="actions"><button className="secondary" disabled={page === 0} onClick={() => { setPage(page - 1); setImageValid(false); setImageFailed(false) }}>{t('previous')}</button><span role="status">{t('page')} {raster.page} / {opened.pages.length}</span><button className="secondary" disabled={page === opened.pages.length - 1} onClick={() => { setPage(page + 1); setImageValid(false); setImageFailed(false) }}>{t('next')}</button></div>
    {urls && <>
      <div className="relative" dir="ltr">
        <img className="block h-auto w-full" src={urls.pages[page]} alt={`${t('source')} ${raster.page}`} width={raster.width} height={raster.height} onLoad={event => { setImageValid(event.currentTarget.naturalWidth === raster.width && event.currentTarget.naturalHeight === raster.height) }} onError={() => { setImageValid(false); setImageFailed(true) }} />
        {imageValid && highlights.map(highlight => <span key={highlight.target} data-evidence-highlight={highlight.target} aria-hidden="true" className="pointer-events-none absolute box-border border-2 border-solid border-accent bg-accent/10" style={{ top: `${highlight.box.top * 100}%`, left: `${highlight.box.left * 100}%`, width: `${(highlight.box.right - highlight.box.left) * 100}%`, height: `${(highlight.box.bottom - highlight.box.top) * 100}%` }} />)}
      </div>
      {imageFailed && <p role="status">{t('imageFailed')}</p>}
      <div className="actions"><a className="button secondary" href={urls.source} target="_blank" rel="noopener noreferrer">{t('openSource')}</a><a className="button secondary" href={urls.source} download={opened.source.name}>{t('download')}</a></div>
    </>}
  </div>
}

export function SavedDemonstrations({ demo, current, language, reviewer = false, children }: {
  demo: Demo; current: NonNullable<SavedSelection['current']>; language: Language; reviewer?: boolean; children?: ReactNode;
}) {
  const [examples, setExamples] = useState<SavedExample[]>([])
  const [opened, setOpened] = useState<{ key: string; value: OpenedSavedDemonstration } | null>(null)
  const [showSource, setShowSource] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const generation = useRef(0)
  const key = JSON.stringify(current)
  const currentKey = useRef(key)
  currentKey.current = key
  const t = (key: keyof typeof savedText) => savedText[key][language]
  useEffect(() => {
    let active = true
    void demo.listSavedDemonstrations().then(result => { if (active && result.ok) setExamples(result.value) })
    const invalidate = () => { generation.current++; setOpened(null); setBusy(false) }
    const unsubscribe = demo.subscribe(invalidate)
    window.addEventListener('focus', invalidate)
    return () => { active = false; generation.current++; unsubscribe(); window.removeEventListener('focus', invalidate) }
  }, [demo])
  useEffect(() => { generation.current++; setOpened(null); setBusy(false); setError(null) }, [key])
  const select = async (exampleId: string) => {
    const run = ++generation.current
    setOpened(null); setBusy(true); setError(null); setShowSource(reviewer)
    const result = await demo.selectSavedDemonstration({ exampleId, current })
    if (run !== generation.current || key !== currentKey.current) return
    setBusy(false)
    if (result.ok) setOpened({ key, value: result.value })
    else setError(errors[result.error.kind][language])
  }
  const selected = opened?.key === key ? opened.value : null
  const capture = selected?.capture
  return <section className="mt-4 min-w-0" aria-label={t('title')}>
    <details><summary>{t('choose')}</summary><p>{t('experimental')}</p><p>{t('notice')}</p><div className="actions">{examples.map(example => <button className="secondary" key={example.id} onClick={() => void select(example.id)}>{t('open')} {savedNames[example.id as keyof typeof savedNames][language]}</button>)}</div></details>
    {!selected && children}
    {busy && <p role="status">{t('loading')}</p>}{error && <p role="alert">{error}</p>}
    {capture && selected && <div key={capture.sourceFamily} className="mt-4 rounded-card border border-solid border-border p-3">
      <h4>{t('mode')} · {savedNames[capture.sourceFamily as keyof typeof savedNames][language]}</h4><p>{t('date')}</p><p>{t('notice')}</p>
      <p role="status">{t(selected.attachment === 'current-document' ? 'attached' : 'separate')}</p>
      <div className={reviewer ? 'grid grid-cols-2 items-start gap-4 compact:grid-cols-1' : ''}>
        {reviewer && <SavedSource key={capture.sourceFamily} opened={selected} language={language} />}
        <div className="min-w-0"><h5>{t('coverage')}</h5><ul>{capture.findings.pages.map(page => <li key={page.page}>{t('page')} {page.page} · {t(page.available ? 'available' : 'unavailable')}{page.category && <p>{savedTargets[page.category][language]}</p>}{page.readability === 2 && <p>{t('readable')}</p>}</li>)}</ul>
          <ul>{capture.findings.comparisons.map(finding => <li key={finding.field}>{t('page')} {capture.findings.pages.filter(page => page.available).map(page => page.page).join(', ')} · {savedTargets[finding.field][language]}: {t(finding.outcome === 'consistent' || finding.outcome === 'different' || finding.outcome === 'not_found' ? finding.outcome : 'suppressed')}</li>)}</ul>
          <p>{savedLimitations[capture.sourceFamily as keyof typeof savedLimitations][language]}</p>
          <h5>{t('context')}</h5><dl className="facts">{Object.entries(capture.context.comparisons).map(([target, value]) => <div key={target}><dt>{savedTargets[target][language]}</dt><dd><bdi>{value}</bdi></dd></div>)}</dl>
          {reviewer && <><h5>{t('assessment')}</h5>{selected.attachment === 'example' && <p>{t('assessmentHelp')}</p>}</>}
          {children}
        </div>
      </div>
      {!reviewer && <><button className="secondary" onClick={() => setShowSource(!showSource)} aria-expanded={showSource}>{t(showSource ? 'hide' : 'show')}</button>{showSource && <SavedSource key={capture.sourceFamily} opened={selected} language={language} />}</>}
      <details className="mt-4"><summary>{t('provenance')}</summary><pre dir="ltr" className="max-h-[400px] overflow-auto whitespace-pre-wrap text-[12px] wrap-anywhere">{JSON.stringify({ provenance: selected.provenance, attachment: selected.attachment, ...capture }, null, 2)}</pre></details>
      <button className="secondary mt-3" onClick={() => { generation.current++; setOpened(null) }}>{t('close')}</button>
    </div>}
  </section>
}
