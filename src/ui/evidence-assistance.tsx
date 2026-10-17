import { useEffect, useRef, useState } from 'react'
import type { Demo } from '../demo'
import type { Language } from '../domain/model'
import type { AssistanceState, EvidenceAssistance, EvidenceInput, SelectedEvidence } from '../evidence-assistance/contract'
import { assistanceText, findingText, reasonText } from './evidence-assistance-copy'
import { DocumentPreviewContent } from './preview'

export function IdentityAssistance({ demo, input, language, disabled, edit, replace }: { demo: Demo; input: EvidenceInput; language: Language; disabled: boolean; edit: () => void; replace: () => void }) {
  const [open, setOpen] = useState(false), [showSource, setShowSource] = useState(false), [retained, setRetained] = useState(false)
  const [selection, setSelection] = useState<SelectedEvidence | null>(null)
  const [state, setState] = useState<AssistanceState | null>(null)
  const [file, setFile] = useState<{ url: string; mime: string; name: string } | null>(null)
  const [renderFailed, setRenderFailed] = useState(false)
  const handle = useRef<EvidenceAssistance | null>(null)
  const key = JSON.stringify(input)
  const t = (key: keyof typeof assistanceText) => assistanceText[key][language]
  useEffect(() => {
    if (!open) return
    let active = true
    const controller = demo.createEvidenceAssistance(JSON.parse(key) as EvidenceInput)
    handle.current = controller
    setState(controller.read()); setSelection(null); setShowSource(false); setRetained(false)
    const unsubscribe = controller.subscribe(() => {
      if (!active) return
      const next = controller.read()
      setState(next)
      if (next.reason === 'unauthorized' || next.reason === 'stale') setSelection(null)
    })
    void controller.inspect().then(result => { if (active && result.ok) setSelection(result.value) })
    return () => { active = false; unsubscribe(); controller.dispose(); if (handle.current === controller) handle.current = null }
  }, [demo, key, open])
  useEffect(() => {
    setFile(null); setRenderFailed(false)
    if (!selection || !showSource) return
    const url = URL.createObjectURL(new Blob([selection.source.bytes], { type: selection.source.mime }))
    setFile({ url, mime: selection.source.mime, name: selection.source.name })
    return () => URL.revokeObjectURL(url)
  }, [selection, showSource])
  const busy = state?.status === 'preparing' || state?.status === 'running'
  return <section className="my-4 min-w-0 rounded-card border border-solid border-border p-4" aria-label={t('title')}>
    <h4>{t('title')}</h4><p>{t('notice')}</p>
    {!open ? <button disabled={disabled} onClick={() => setOpen(true)}>{t('check')}</button> : <>
      <p>{t('transmission')}</p>
      <div className="grid grid-cols-2 items-start gap-4 narrow:grid-cols-1"><div className="min-w-0"><h5>{t('context')}</h5>
        {selection ? <><p className="wrap-anywhere"><bdi>{selection.source.name}</bdi></p><p>{t('name')}: <bdi>{selection.declaration.fullName ?? t('missing')}</bdi></p></> : <p role="status">{t('unavailable')}</p>}
        <p>{t('scope')}</p>
        <div className="actions"><button disabled={!selection} onClick={() => setShowSource(value => !value)}>{t(showSource ? 'hideSource' : 'showSource')}</button>
          <button disabled={disabled || !selection || busy} onClick={() => void handle.current?.run()}>{t(state?.status === 'unavailable' || state?.status === 'cancelled' || state?.status === 'completed' ? 'retry' : 'run')}</button>
          {busy && <button onClick={() => handle.current?.cancel()}>{t('cancel')}</button>}
        </div>
      </div><div className="min-w-0" aria-live="polite" aria-busy={busy}>
        {state?.reason ? <p role="status">{reasonText[state.reason][language]}</p> : state && ['idle', 'preparing', 'running', 'cancelled'].includes(state.status) && <p role="status">{t(state.status as 'idle' | 'preparing' | 'running' | 'cancelled')}</p>}
        {state && <><h5>{t('coverage')}</h5><p>{t('total')}: {state.coverage.totalPages ?? t('unknown')}</p><ul>{(['selected', 'prepared', 'dispatched', 'successful', 'failed', 'unreadable', 'unchecked'] as const).map(kind => <li key={kind}>{t(kind)}: {kind === 'unchecked' && state.coverage.uncheckedCount !== null && state.coverage.uncheckedCount > 100 ? `${t('allPages')} ${state.coverage.uncheckedCount}` : state.coverage[kind].join(', ') || '—'}</li>)}</ul></>}
        {state?.result && <><p>{t('temporary')}</p><dl>{Object.entries(state.result.findings).map(([name, value]) => <div key={name}><dt>{t(name as keyof typeof state.result.findings)}</dt><dd>{findingText[value][language]}</dd></div>)}</dl>
          <details><summary>{t('provenance')}</summary><pre className="max-h-[400px] overflow-auto whitespace-pre-wrap wrap-anywhere text-xs" dir="ltr">{JSON.stringify(state.result, null, 2)}</pre></details>
        </>}
      </div></div>
      {showSource && file && <DocumentPreviewContent file={file} language={language} prepared={!!input.attachment} renderFailed={renderFailed} onRenderError={() => setRenderFailed(true)} />}
      <div className="actions"><button onClick={edit}>{t('edit')}</button><button onClick={replace}>{t('replace')}</button><button onClick={() => setRetained(true)}>{t('retain')}</button></div>
      {retained && <p role="status">{t('retained')}</p>}
    </>}
  </section>
}
