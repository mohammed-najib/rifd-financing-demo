import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Demo } from '../demo'
import type { Language, ProductId } from '../domain/model'
import { declaredDetail, evidenceTargets, type AssistanceState, type BusinessField, type PurchaseField, type FinancialField, type Findings, type EvidenceAssistance, type EvidenceInput, type SelectedEvidence } from '../evidence-assistance/contract'
import { assistanceText, detailFindingText, findingText, reasonText } from './evidence-assistance-copy'
import { SourcePages } from './source-pages'
import { documentLabel, fieldLabels } from './i18n'

export function EvidenceAssistancePanel({ demo, input, product, language, disabled, edit, detailEdits, replace, children, contextToken }: { demo: Demo; input: EvidenceInput; product: ProductId; language: Language; disabled: boolean; edit?: () => void; detailEdits?: { field: BusinessField | PurchaseField | FinancialField; action: () => void }[]; replace?: () => void; children?: ReactNode; contextToken?: string | null }) {
  const reviewer = input.audience === 'reviewer'
  const business = input.slot === 'business', purchase = input.slot === 'purchase'
  const financial = input.slot === 'financial'
  const detailTask = business || purchase || financial
  const findingsCopy = detailTask ? detailFindingText : findingText
  const [selectedPages, setSelectedPages] = useState<number[] | null>(null)
  const [open, setOpen] = useState(false), [showSource, setShowSource] = useState(false), [retained, setRetained] = useState(false)
  const [selection, setSelection] = useState<SelectedEvidence | null>(null)
  const [state, setState] = useState<AssistanceState | null>(null)
  const [file, setFile] = useState<{ url: string; mime: string; name: string } | null>(null)
  const [cleared, setCleared] = useState<'success' | 'failed' | null>(null)
  const handle = useRef<EvidenceAssistance | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  // Matching Save changes a prepared reference into a saved file reference, but
  // keeps the same source and context. Preserve its temporary run for retention.
  const key = JSON.stringify({ ...input, fileId: input.attachment?.id ?? input.fileId, attachment: undefined })
  const selectedInput = useMemo(() => input, [key, contextToken])
  const t = (key: keyof typeof assistanceText) => assistanceText[key][language]
  useEffect(() => { if (open) heading.current?.focus() }, [open])
  useEffect(() => {
    if (!open) return
    let active = true
    const controller = demo.createEvidenceAssistance(selectedInput)
    handle.current = controller
    setState(controller.read()); setSelectedPages(null); setSelection(null); setShowSource(reviewer); setRetained(false)
    let inspecting = false
    const inspectSelection = async () => {
      if (inspecting) return
      inspecting = true
      try {
        const result = await controller.inspect()
        if (active) setSelection(result.ok ? result.value : null)
      } finally { inspecting = false }
    }
    const unsubscribe = controller.subscribe(() => {
      if (!active) return
      const next = controller.read()
      setState(next)
      if (next.reason === 'unauthorized') setSelection(null)
      if (next.reason === 'stale') { setSelection(null); void inspectSelection() }
    })
    void inspectSelection()
    return () => { active = false; unsubscribe(); controller.dispose(); if (handle.current === controller) handle.current = null }
  }, [demo, selectedInput, open])
  useEffect(() => {
    setFile(null)
    if (!selection || !showSource) return
    const url = URL.createObjectURL(new Blob([selection.source.bytes], { type: selection.source.mime }))
    setFile({ url, mime: selection.source.mime, name: selection.source.name })
    return () => URL.revokeObjectURL(url)
  }, [selection, showSource])
  const clearAnalysis = async () => {
    setCleared(null)
    const controller = handle.current ?? demo.createEvidenceAssistance(input)
    if (controller === handle.current && scope.length) setSelectedPages(scope)
    const result = await controller.clear()
    setState(controller.read()); setCleared(result.ok ? 'success' : 'failed')
    if (controller !== handle.current) controller.dispose()
    else {
      const inspected = await controller.inspect()
      if (controller === handle.current) { setSelection(inspected.ok ? inspected.value : null); setState(controller.read()) }
    }
  }
  const scope = selectedPages ?? state?.coverage.selected ?? []
  const totalPages = state?.coverage.totalPages
  const multiple = totalPages !== null && totalPages !== undefined && totalPages > 1
  const label = (name: keyof Findings) => multiple ? t(name).replace(/, page 1$|، الصفحة 1$/, '') : t(name)
  const busy = state?.status === 'preparing' || state?.status === 'running'
  return <section className="evidence-assistance my-4 min-w-0 rounded-card border border-solid border-border p-4" aria-label={t('title')}>
    <h4 ref={heading} tabIndex={-1}>{t('title')}</h4><p>{t('notice')}</p>
    {!open ? <><button disabled={disabled} onClick={() => setOpen(true)}>{t(reviewer ? 'find' : 'check')}</button>{children}</> : <>
      <p>{t(input.context === 'correction-workspace' ? financial ? 'financialCorrectionTransmission' : purchase ? 'purchaseCorrectionTransmission' : business ? 'businessCorrectionTransmission' : 'correctionTransmission' : financial ? 'financialTransmission' : purchase ? 'purchaseTransmission' : business ? 'businessTransmission' : 'transmission')}</p>
      <div className={reviewer ? 'grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] items-start gap-4 compact:grid-cols-1' : 'grid grid-cols-2 items-start gap-4 narrow:grid-cols-1'}>
      {reviewer && <div className="min-w-0" aria-label={t('source')}><h5>{t('source')}</h5>{file && selection ? <SourcePages key={selection.source.hash} source={selection.source} file={file} language={language} /> : <p role="status">{t('unavailable')}</p>}</div>}
      <div className={reviewer ? 'min-w-0' : 'contents'}><div className="min-w-0"><h5>{t('context')}</h5>
        {selection ? <><p className="wrap-anywhere"><bdi>{selection.source.name}</bdi></p>{selection.declaration.financial && <p>{t('expectedMonths')}: <bdi>{selection.declaration.financial.expectedMonths.join(', ')}</bdi></p>}{selection.declaration.purchase && <p>{t('product')}: {documentLabel('purchase', selection.declaration.purchase.product)[language]}</p>}{evidenceTargets(input.slot).map(target => <p key={target.field} className="wrap-anywhere">{detailTask ? fieldLabels[target.field][language] : t('name')}: <bdi>{declaredDetail(selection.declaration, target).value ?? t(detailTask ? 'missingDetail' : 'missing')}</bdi></p>)}</> : <p role="status">{t('unavailable')}</p>}
        {selection?.correction && <><h5>{t('permittedTargets')}</h5><ul>{selection.correction.targets.map(target => <li key={target.kind === 'field' ? target.field : target.slot}><strong>{target.kind === 'field' ? fieldLabels[target.field][language] : documentLabel(target.slot, product)[language]}</strong><p className="wrap-anywhere">{target.reason[language]}</p></li>)}</ul><p>{t('correctionHint')}</p></>}
        <p>{t('scope')}</p>
        {totalPages && totalPages <= 100 ? <fieldset disabled={busy}><legend>{t('selectPages')}</legend><div className="flex max-h-48 flex-wrap gap-3 overflow-auto">{Array.from({ length: totalPages }, (_, i) => i + 1).map(page => <label key={page}><input type="checkbox" checked={scope.includes(page)} disabled={!scope.includes(page) && scope.length >= 4} onChange={event => setSelectedPages(event.target.checked ? [...scope, page].sort((a, b) => a - b) : scope.filter(value => value !== page))} /> {t('page')} {page}</label>)}</div></fieldset> : null}
        <p>{t('selected')}: <bdi>{scope.join(', ') || t('unknown')}</bdi></p>
        <div className="actions">{!reviewer && <button disabled={!selection} onClick={() => setShowSource(value => !value)}>{t(showSource ? 'hideSource' : 'showSource')}</button>}
          <button disabled={disabled || !selection || busy || !scope.length || scope.length > 4} onClick={() => void handle.current?.run(scope)}>{t(state?.status === 'unavailable' || state?.status === 'cancelled' || state?.status === 'completed' ? 'retry' : 'run')}</button>
          {busy && <button onClick={() => handle.current?.cancel()}>{t('cancel')}</button>}
        </div></div>
      {reviewer && <h5>{t('findings')}</h5>}
      <div className="min-w-0" aria-live="polite" aria-busy={busy}>
        {state?.reason ? <p role="status">{reasonText[state.reason][language]}</p> : state && ['idle', 'preparing', 'running', 'cancelled'].includes(state.status) && <p role="status">{t(state.status as 'idle' | 'preparing' | 'running' | 'cancelled')}</p>}
        {state?.result?.stale && <p className="wrap-anywhere">{t('oldScope')}: <bdi>{state.result.provenance.source.name}</bdi>{evidenceTargets(input.slot).map(target => <span key={target.field}> · {fieldLabels[target.field][language]}: <bdi>{declaredDetail(state.result!.provenance.context, target).value ?? t(detailTask ? 'missingDetail' : 'missing')}</bdi></span>)}</p>}
        {state && <><h5>{t('coverage')}</h5><p>{t('total')}: {state.coverage.totalPages ?? t('unknown')}</p><ul>{(['selected', 'prepared', 'dispatched', 'successful', 'failed', 'unreadable', 'unchecked'] as const).map(kind => <li key={kind}>{t(kind)}: {kind === 'unchecked' && state.coverage.uncheckedCount !== null && state.coverage.uncheckedCount > 100 ? `${t('allPages')} ${state.coverage.uncheckedCount}` : <bdi dir="ltr">{state.coverage[kind].join(', ') || '—'}</bdi>}</li>)}</ul></>}
        {state?.storage === 'incompatible' && <p role="status">{t('incompatible')}</p>}
        {state?.storage === 'temporary-only' && <p role="status">{t('storageFailed')}</p>}
        {state?.result?.stale && state.reason !== 'stale' && <p role="status">{reasonText.stale[language]}</p>}
        {state?.result && !state.result.stale && state.result.stages.some(stage => stage.outcome === 'partial') && <p role="status">{t('partialResults')}</p>}
        {state?.result && <>{JSON.stringify(state.coverage) !== JSON.stringify(state.result.coverage) && <p>{t('resultScope')}: <bdi>{state.result.coverage.successful.join(', ')}</bdi> · {t('total')}: {state.result.coverage.totalPages}</p>}<p>{t(state.result.restored ? 'previous' : state.result.temporary ? 'temporary' : 'saved')}</p>
          <p><time dateTime={state.result.provenance.completedAt}>{new Date(state.result.provenance.completedAt).toLocaleString(language)}</time> · {t('expires')} <time dateTime={state.result.expiresAt}>{new Date(state.result.expiresAt).toLocaleString(language)}</time></p><dl>{Object.entries(state.result.findings).map(([name, value]) => <div key={name}><dt>{label(name as keyof Findings)}</dt><dd>{findingsCopy[value][language]}</dd></div>)}</dl>
          {multiple && !state.result.stale && state.result.pages && <><p>{t('scopedFindings')}</p>{state.result.pages.map(page => <div key={page.page}><h6>{t('page')} {page.page}</h6><p>{findingText[page.findings.category][language]} · {findingText[page.findings.readability][language]}</p></div>)}</>}
          <details onToggle={() => void handle.current?.refresh()}><summary>{t('provenance')}</summary><pre className="max-h-[400px] overflow-auto whitespace-pre-wrap wrap-anywhere text-xs" dir="ltr">{JSON.stringify(state.result, null, 2)}</pre></details>
        </>}
      </div></div>
      {reviewer && <div className="min-w-0"><h5>{t('assessment')}</h5>{children}</div>}
      </div>
      {!reviewer && showSource && file && selection && <SourcePages key={selection.source.hash} source={selection.source} file={file} language={language} />}
      {!reviewer && <div className="actions">{edit && <button disabled={disabled || !selection} onClick={edit}>{t('edit')}</button>}{detailEdits?.map(({ field, action }) => <button key={field} disabled={disabled || !selection} onClick={action}>{t(({ businessName: 'editBusinessName', address: 'editAddress', operatingSince: 'editOperatingSince', explanation: 'editDescription', budget: 'editBudget', revenue: 'editRevenue', expenses: 'editExpenses' } as const)[field])}</button>)}{replace && <button disabled={disabled || !selection} onClick={replace}>{t('replace')}</button>}<button disabled={disabled || !selection} onClick={() => { void handle.current?.refresh(); setRetained(true) }}>{t('retain')}</button></div>}
      {retained && <p role="status">{t('retained')}</p>}
    </>}
    <button onClick={() => void clearAnalysis()}>{t('clear')}</button>
    {cleared && <p role="status">{t(cleared === 'failed' ? 'clearFailed' : 'cleared')}</p>}
  </section>
}
