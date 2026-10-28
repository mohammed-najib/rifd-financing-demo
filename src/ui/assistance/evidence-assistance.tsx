import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Demo } from '../../demo';
import type { Language, ProductId } from '../../domain/model';
import {
  declaredDetail,
  evidenceTargets,
  locationTargets,
  type AssistanceState,
  type BusinessField,
  type PurchaseField,
  type FinancialField,
  type Findings,
  type EvidenceAssistance,
  type EvidenceInput,
  type SelectedEvidence,
} from '../../evidence-assistance/contract';
import {
  assistanceText,
  detailFindingText,
  findingText,
  reasonText,
} from './evidence-assistance-copy';
import { SourcePages } from './source-pages';
import { SourceRegionDialog } from './source-region-dialog';
import { documentLabel, fieldLabels } from '../i18n';
import { localJevEnabled } from '../../live-assistance/client';

export function EvidenceAssistancePanel({
  demo,
  input,
  product,
  language,
  disabled,
  edit,
  detailEdits,
  replace,
  children,
  contextToken,
}: {
  demo: Demo;
  input: EvidenceInput;
  product: ProductId;
  language: Language;
  disabled: boolean;
  edit?: () => void;
  detailEdits?: { field: BusinessField | PurchaseField | FinancialField; action: () => void }[];
  replace?: () => void;
  children?: ReactNode;
  contextToken?: string | null;
}) {
  const reviewer = input.audience === 'reviewer';
  // Drafts use null for a selection still being prepared and undefined for an empty slot.
  const missingDocument = !reviewer && input.fileId !== null && !input.fileId && !input.attachment;
  const business = input.slot === 'business',
    purchase = input.slot === 'purchase';
  const financial = input.slot === 'financial';
  const detailTask = business || purchase || financial;
  const findingsCopy = detailTask ? detailFindingText : findingText;
  const [selectedPages, setSelectedPages] = useState<number[] | null>(null);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [open, setOpen] = useState(false),
    [showSource, setShowSource] = useState(false),
    [retained, setRetained] = useState(false);
  const [selection, setSelection] = useState<SelectedEvidence | null>(null);
  const [state, setState] = useState<AssistanceState | null>(null);
  const [file, setFile] = useState<{ url: string; mime: string; name: string } | null>(null);
  const [cleared, setCleared] = useState<'success' | 'failed' | null>(null);
  const [region, setRegion] = useState<{ page: number; target: string; serial: number } | null>(
    null,
  );
  const handle = useRef<EvidenceAssistance | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  // Matching Save changes a prepared reference into a saved file reference, but
  // keeps the same source and context. Preserve its temporary run for retention.
  const key = JSON.stringify({
    ...input,
    fileId: input.attachment?.id ?? input.fileId,
    attachment: undefined,
  });
  const selectedInput = useMemo(() => input, [key, contextToken]);
  const t = (key: keyof typeof assistanceText) => assistanceText[key][language];
  useEffect(() => {
    if (open) heading.current?.focus();
  }, [open]);
  useEffect(() => {
    if (!open || missingDocument) return;
    let active = true;
    const controller = demo.createEvidenceAssistance(selectedInput);
    handle.current = controller;
    setState(controller.read());
    setRegion(null);
    setSelectedPages(null);
    setSelection(null);
    setShowSource(reviewer);
    setRetained(false);
    let inspecting = false;
    const inspectSelection = async () => {
      if (inspecting) return;
      inspecting = true;
      try {
        const result = await controller.inspect();
        if (active) setSelection(result.ok ? result.value : null);
      } finally {
        inspecting = false;
      }
    };
    const unsubscribe = controller.subscribe(() => {
      if (!active) return;
      const next = controller.read();
      setState(next);
      if (next.reason === 'unauthorized') setSelection(null);
      if (next.reason === 'stale') {
        setSelection(null);
        void inspectSelection();
      }
    });
    void inspectSelection();
    return () => {
      active = false;
      unsubscribe();
      controller.dispose();
      if (handle.current === controller) handle.current = null;
    };
  }, [demo, selectedInput, open, missingDocument]);
  useEffect(() => {
    setFile(null);
    if (!selection || !showSource) return;
    const url = URL.createObjectURL(
      new Blob([selection.source.bytes], { type: selection.source.mime }),
    );
    setFile({ url, mime: selection.source.mime, name: selection.source.name });
    return () => URL.revokeObjectURL(url);
  }, [selection, showSource]);
  const clearAnalysis = async () => {
    setCleared(null);
    const controller = handle.current ?? demo.createEvidenceAssistance(input);
    if (controller === handle.current && scope.length) setSelectedPages(scope);
    const result = await controller.clear();
    setState(controller.read());
    setCleared(result.ok ? 'success' : 'failed');
    if (controller !== handle.current) controller.dispose();
    else {
      const inspected = await controller.inspect();
      if (controller === handle.current) {
        setSelection(inspected.ok ? inspected.value : null);
        setState(controller.read());
      }
    }
  };
  const scope = selectedPages ?? state?.coverage.selected ?? [];
  const totalPages = state?.coverage.totalPages;
  const multiple = totalPages !== null && totalPages !== undefined && totalPages > 1;
  const label = (name: keyof Findings) =>
    multiple ? t(name).replace(/, page 1$|، الصفحة 1$/, '') : t(name);
  const busy = state?.status === 'preparing' || state?.status === 'running';
  useEffect(() => {
    if (multiple && !scope.length) setPagesOpen(true);
  }, [multiple, scope.length]);
  const regionDialog = region && selection && state?.result && !state.result.stale && (
    <SourceRegionDialog
      source={selection.source}
      run={state.result}
      region={region}
      label={t(locationTargets(input.slot).find(target => target.id === region.target)!.presence)}
      language={language}
      close={() => setRegion(null)}
    />
  );
  if (!reviewer) {
    const result = state?.result;
    const previousResult =
      result &&
      (result.restored ||
        result.stale ||
        busy ||
        JSON.stringify(state?.coverage) !== JSON.stringify(result.coverage));
    const attention =
      result &&
      (result.stale ||
        Object.values(result.findings).some(value =>
          [
            'different',
            'conflict',
            'not_found',
            'other',
            'mixed',
            'partial',
            'unreadable',
            'undetermined',
            'unavailable',
            'missing-context',
          ].includes(value),
        ));
    const editLabel = (field: BusinessField | PurchaseField | FinancialField) =>
      t(
        (
          {
            businessName: 'editBusinessName',
            address: 'editAddress',
            operatingSince: 'editOperatingSince',
            explanation: 'editDescription',
            budget: 'editBudget',
            revenue: 'editRevenue',
            expenses: 'editExpenses',
          } as const
        )[field],
      );
    const resultLabel = (name: keyof Findings) =>
      name === 'category'
        ? t('documentType')
        : name === 'readability'
          ? t('documentReadability')
          : name === 'nameSupport'
            ? fieldLabels.fullName[language]
            : evidenceTargets(input.slot).find(target => target.support === name)
              ? fieldLabels[
                  evidenceTargets(input.slot).find(target => target.support === name)!.field
                ][language]
              : label(name);
    return (
      <section className="evidence-assistance document-check" aria-label={t('title')}>
        <div className="check-heading">
          <h4 ref={heading} tabIndex={-1}>
            {t('check')}
          </h4>
          <p>{t('simpleIntro')}</p>
        </div>
        {!open ? (
          <button disabled={disabled && !missingDocument} onClick={() => setOpen(true)}>
            {t('check')}
          </button>
        ) : missingDocument ? (
          <div className="check-empty">
            <p>{t('addDocumentFirst')}</p>
            {replace && (
              <button className="secondary" onClick={replace}>
                {t('chooseDocument')}
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="check-notice">{t('notice')}</p>
            {!result && <p className="check-notice">{t('simplePrivacy')}</p>}
            {(!result || busy || state?.reason) && (
              <div className="check-progress" role="status" aria-live="polite" aria-busy={busy}>
                {busy && <span className="button-spinner" aria-hidden="true" />}
                {busy
                  ? t('checkingDocument')
                  : state?.reason
                    ? reasonText[state.reason][language]
                    : result
                      ? t(attention ? 'checkReview' : 'checkComplete')
                      : state?.status === 'cancelled'
                        ? t('cancelled')
                        : selection
                          ? t('checkReady')
                          : t('loadingCheck')}
              </div>
            )}
            {selection?.correction && (
              <div className="check-correction">
                <h5>{t('permittedTargets')}</h5>
                <ul>
                  {selection.correction.targets.map(target => (
                    <li key={target.kind === 'field' ? target.field : target.slot}>
                      <strong>
                        {target.kind === 'field'
                          ? fieldLabels[target.field][language]
                          : documentLabel(target.slot, product)[language]}
                      </strong>
                      <p>{target.reason[language]}</p>
                    </li>
                  ))}
                </ul>
                {!result && (
                  <div className="actions">
                    {edit && (
                      <button
                        className="secondary"
                        disabled={disabled || !selection}
                        onClick={edit}
                      >
                        {t('edit')}
                      </button>
                    )}
                    {detailEdits?.map(item => (
                      <button
                        className="secondary"
                        key={item.field}
                        disabled={disabled || !selection}
                        onClick={item.action}
                      >
                        {editLabel(item.field)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {multiple && (
              <div className="check-pages">
                <p>
                  {t('selected')}: <bdi dir="ltr">{scope.join(', ') || t('unknown')}</bdi> ·{' '}
                  {t('total')}: {totalPages}
                </p>
                <details
                  open={pagesOpen}
                  onToggle={event => setPagesOpen(event.currentTarget.open)}
                >
                  <summary>{t('selectPages')}</summary>
                  <fieldset disabled={busy}>
                    <legend className="sr-only">{t('selectPages')}</legend>
                    <div className="check-page-options">
                      {totalPages &&
                        totalPages <= 100 &&
                        Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <label key={page}>
                            <input
                              type="checkbox"
                              checked={scope.includes(page)}
                              disabled={!scope.includes(page) && scope.length >= 4}
                              onChange={event =>
                                setSelectedPages(
                                  event.target.checked
                                    ? [...scope, page].sort((a, b) => a - b)
                                    : scope.filter(value => value !== page),
                                )
                              }
                            />{' '}
                            {t('page')} {page}
                          </label>
                        ))}
                    </div>
                  </fieldset>
                </details>
              </div>
            )}
            <div className="actions check-controls">
              <button
                disabled={disabled || !selection || busy || !scope.length || scope.length > 4}
                onClick={() => void handle.current?.run(scope)}
              >
                {t(
                  state?.status === 'unavailable' ||
                    state?.status === 'cancelled' ||
                    state?.status === 'completed'
                    ? 'retry'
                    : 'run',
                )}
              </button>
              {busy && (
                <button className="secondary" onClick={() => handle.current?.cancel()}>
                  {t('cancel')}
                </button>
              )}
              <button
                className="secondary"
                disabled={!selection}
                onClick={() => setShowSource(value => !value)}
              >
                {t(showSource ? 'hideSource' : 'showSource')}
              </button>
              {!result && replace && (
                <button className="secondary" disabled={disabled || !selection} onClick={replace}>
                  {t('replace')}
                </button>
              )}
            </div>
            {result && (
              <div className={`check-result${attention ? ' check-result-attention' : ''}`}>
                <h5>{t(attention ? 'checkReview' : 'checkComplete')}</h5>
                {previousResult && (
                  <p className="check-scope-warning">
                    <strong>{t('previous')}</strong>
                    <br />
                    {t('resultScope')}:{' '}
                    <bdi dir="ltr">{result.coverage.successful.join(', ') || t('unknown')}</bdi>
                  </p>
                )}
                {result.stale ? (
                  <p>{reasonText.stale[language]}</p>
                ) : (
                  <>
                    {result.coverage.unchecked.length > 0 && (
                      <p className="check-scope-warning">
                        {t('partialScope')} {t('checkedScope')}:{' '}
                        <bdi dir="ltr">{result.coverage.successful.join(', ') || t('unknown')}</bdi>
                      </p>
                    )}
                    {result.stages.some(stage => stage.outcome === 'partial') && (
                      <p>{t('partialResults')}</p>
                    )}
                    <dl className="check-findings">
                      {Object.entries(result.findings)
                        .filter(([name]) => !name.endsWith('Presence'))
                        .map(([name, value]) => {
                          const target = evidenceTargets(input.slot).find(
                            target => target.support === name,
                          );
                          const detailEdit = detailEdits?.find(
                            item => item.field === target?.field,
                          );
                          return (
                            <div key={name}>
                              <dt>{resultLabel(name as keyof Findings)}</dt>
                              <dd>
                                <span>{findingsCopy[value][language]}</span>
                                {name === 'nameSupport' && edit && (
                                  <button
                                    className="secondary"
                                    disabled={disabled || !selection}
                                    onClick={edit}
                                  >
                                    {t('edit')}
                                  </button>
                                )}
                                {detailEdit && (
                                  <button
                                    className="secondary"
                                    disabled={disabled || !selection}
                                    onClick={detailEdit.action}
                                  >
                                    {editLabel(detailEdit.field)}
                                  </button>
                                )}
                              </dd>
                            </div>
                          );
                        })}
                    </dl>
                    {result.locations?.length ? (
                      <details className="check-inspection">
                        <summary>{t('inspectRegion')}</summary>
                        <div className="actions">
                          {result.locations.map(location => (
                            <button
                              className="secondary"
                              key={`${location.page}-${location.target}`}
                              disabled={!selection}
                              onClick={() =>
                                setRegion({
                                  page: location.page,
                                  target: location.target,
                                  serial: Date.now(),
                                })
                              }
                            >
                              {t('inspectRegion')}:{' '}
                              {t(
                                locationTargets(input.slot).find(
                                  target => target.id === location.target,
                                )!.presence,
                              )}{' '}
                              · {t('page')} {location.page}
                            </button>
                          ))}
                        </div>
                        {result.locations.some(location => location.status !== 'shown') && (
                          <p>{t('highlightSuppressed')}</p>
                        )}
                      </details>
                    ) : null}
                  </>
                )}
              </div>
            )}
            {(result || state?.status === 'unavailable' || state?.status === 'cancelled') && (
              <div className="actions check-next-actions">
                {result && replace && (
                  <button className="secondary" disabled={disabled || !selection} onClick={replace}>
                    {t('replace')}
                  </button>
                )}
                <button
                  disabled={disabled || !selection}
                  onClick={() => {
                    void handle.current?.refresh();
                    setRetained(true);
                  }}
                >
                  {t('retain')}
                </button>
              </div>
            )}
            {retained && <p role="status">{t('retained')}</p>}
            {state?.storage === 'incompatible' && <p role="status">{t('incompatible')}</p>}
            {state?.storage === 'temporary-only' && <p role="status">{t('storageFailed')}</p>}
            {showSource && file && selection && (
              <div className="check-source">
                <SourcePages
                  key={selection.source.hash}
                  source={selection.source}
                  file={file}
                  language={language}
                  run={result}
                />
              </div>
            )}
            <details className="check-details">
              <summary>{t('checkDetails')}</summary>
              <h5>{t('context')}</h5>
              {selection && (
                <>
                  <p className="wrap-anywhere">
                    <bdi>{selection.source.name}</bdi>
                  </p>
                  {selection.declaration.financial && (
                    <p>
                      {t('expectedMonths')}:{' '}
                      <bdi>{selection.declaration.financial.expectedMonths.join(', ')}</bdi>
                    </p>
                  )}
                  {selection.declaration.purchase && (
                    <p>
                      {t('product')}:{' '}
                      {documentLabel('purchase', selection.declaration.purchase.product)[language]}
                    </p>
                  )}
                  {evidenceTargets(input.slot).map(target => (
                    <p key={target.field} className="wrap-anywhere">
                      {fieldLabels[target.field][language]}:{' '}
                      <bdi>
                        {declaredDetail(selection.declaration, target).value ??
                          t(detailTask ? 'missingDetail' : 'missing')}
                      </bdi>
                    </p>
                  ))}
                </>
              )}
              {(!result || result.stale) && (
                <div className="actions">
                  {edit && (
                    <button className="secondary" disabled={disabled || !selection} onClick={edit}>
                      {t('edit')}
                    </button>
                  )}
                  {detailEdits?.map(item => (
                    <button
                      className="secondary"
                      key={item.field}
                      disabled={disabled || !selection}
                      onClick={item.action}
                    >
                      {editLabel(item.field)}
                    </button>
                  ))}
                </div>
              )}
              {selection?.correction && <p>{t('correctionHint')}</p>}
              {state && (
                <>
                  <h5>{t('coverage')}</h5>
                  <p>
                    {t('total')}: {state.coverage.totalPages ?? t('unknown')}
                  </p>
                  <ul>
                    {(
                      [
                        'selected',
                        'prepared',
                        'dispatched',
                        'successful',
                        'failed',
                        'unreadable',
                        'unchecked',
                      ] as const
                    ).map(kind => (
                      <li key={kind}>
                        {t(kind)}: <bdi dir="ltr">{state.coverage[kind].join(', ') || '—'}</bdi>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {result && (
                <>
                  <dl className="check-findings">
                    {Object.entries(result.findings)
                      .filter(([name]) => name.endsWith('Presence'))
                      .map(([name, value]) => (
                        <div key={name}>
                          <dt>{label(name as keyof Findings)}</dt>
                          <dd>{findingsCopy[value][language]}</dd>
                        </div>
                      ))}
                  </dl>
                  <p>{t(result.temporary ? 'temporary' : 'saved')}</p>
                  <p>
                    {t('checkedOn')}:{' '}
                    <time dateTime={result.provenance.completedAt}>
                      {new Date(result.provenance.completedAt).toLocaleString(language)}
                    </time>
                  </p>
                  <p>
                    {t('expires')}:{' '}
                    <time dateTime={result.expiresAt}>
                      {new Date(result.expiresAt).toLocaleString(language)}
                    </time>
                  </p>
                  {multiple && result.pages && (
                    <>
                      <p>{t('scopedFindings')}</p>
                      {result.pages.map(page => (
                        <p key={page.page}>
                          {t('page')} {page.page}: {findingText[page.findings.category][language]} ·{' '}
                          {findingText[page.findings.readability][language]}
                        </p>
                      ))}
                    </>
                  )}
                </>
              )}
              <details>
                <summary>{t('privacyDetails')}</summary>
                <p>{t(localJevEnabled ? 'localPrivacy' : 'livePrivacy')}</p>
              </details>
              <button className="secondary" onClick={() => void clearAnalysis()}>
                {t('clear')}
              </button>
            </details>
            {cleared && <p role="status">{t(cleared === 'failed' ? 'clearFailed' : 'cleared')}</p>}
          </>
        )}
        {regionDialog}
      </section>
    );
  }
  return (
    <section
      className="evidence-assistance my-4 min-w-0 rounded-card border border-solid border-border p-4"
      aria-label={t('title')}
    >
      <h4 ref={heading} tabIndex={-1}>
        {t('title')}
      </h4>
      <p>{t('notice')}</p>
      {!open ? (
        <>
          <button disabled={disabled} onClick={() => setOpen(true)}>
            {t(reviewer ? 'find' : 'check')}
          </button>
          {children}
        </>
      ) : (
        <>
          <p className="check-notice">{t('simplePrivacy')}</p>
          <details className="check-details">
            <summary>{t('privacyDetails')}</summary>
            <p>{t(localJevEnabled ? 'localPrivacy' : 'livePrivacy')}</p>
          </details>
          <div
            className={
              reviewer
                ? 'grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] items-start gap-4 compact:grid-cols-1'
                : 'grid grid-cols-2 items-start gap-4 narrow:grid-cols-1'
            }
          >
            {reviewer && (
              <div className="min-w-0" aria-label={t('source')}>
                <h5>{t('source')}</h5>
                {file && selection ? (
                  <SourcePages
                    key={selection.source.hash}
                    source={selection.source}
                    file={file}
                    language={language}
                    run={state?.result}
                  />
                ) : (
                  <p role="status">{t('unavailable')}</p>
                )}
              </div>
            )}
            <div className={reviewer ? 'min-w-0' : 'contents'}>
              <div className="min-w-0">
                <h5>{t('context')}</h5>
                {selection ? (
                  <>
                    <p className="wrap-anywhere">
                      <bdi>{selection.source.name}</bdi>
                    </p>
                    {selection.declaration.financial && (
                      <p>
                        {t('expectedMonths')}:{' '}
                        <bdi>{selection.declaration.financial.expectedMonths.join(', ')}</bdi>
                      </p>
                    )}
                    {selection.declaration.purchase && (
                      <p>
                        {t('product')}:{' '}
                        {
                          documentLabel('purchase', selection.declaration.purchase.product)[
                            language
                          ]
                        }
                      </p>
                    )}
                    {evidenceTargets(input.slot).map(target => (
                      <p key={target.field} className="wrap-anywhere">
                        {detailTask ? fieldLabels[target.field][language] : t('name')}:{' '}
                        <bdi>
                          {declaredDetail(selection.declaration, target).value ??
                            t(detailTask ? 'missingDetail' : 'missing')}
                        </bdi>
                      </p>
                    ))}
                  </>
                ) : (
                  <p role="status">{t('unavailable')}</p>
                )}
                {selection?.correction && (
                  <>
                    <h5>{t('permittedTargets')}</h5>
                    <ul>
                      {selection.correction.targets.map(target => (
                        <li key={target.kind === 'field' ? target.field : target.slot}>
                          <strong>
                            {target.kind === 'field'
                              ? fieldLabels[target.field][language]
                              : documentLabel(target.slot, product)[language]}
                          </strong>
                          <p className="wrap-anywhere">{target.reason[language]}</p>
                        </li>
                      ))}
                    </ul>
                    <p>{t('correctionHint')}</p>
                  </>
                )}
                <p>{t('scope')}</p>
                {multiple && totalPages && totalPages <= 100 ? (
                  <fieldset disabled={busy}>
                    <legend>{t('selectPages')}</legend>
                    <div className="flex max-h-48 flex-wrap gap-3 overflow-auto">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <label key={page}>
                          <input
                            type="checkbox"
                            checked={scope.includes(page)}
                            disabled={!scope.includes(page) && scope.length >= 4}
                            onChange={event =>
                              setSelectedPages(
                                event.target.checked
                                  ? [...scope, page].sort((a, b) => a - b)
                                  : scope.filter(value => value !== page),
                              )
                            }
                          />{' '}
                          {t('page')} {page}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : null}
                <p>
                  {t('selected')}: <bdi>{scope.join(', ') || t('unknown')}</bdi>
                </p>
                <div className="actions">
                  {!reviewer && (
                    <button disabled={!selection} onClick={() => setShowSource(value => !value)}>
                      {t(showSource ? 'hideSource' : 'showSource')}
                    </button>
                  )}
                  <button
                    disabled={disabled || !selection || busy || !scope.length || scope.length > 4}
                    onClick={() => void handle.current?.run(scope)}
                  >
                    {t(
                      state?.status === 'unavailable' ||
                        state?.status === 'cancelled' ||
                        state?.status === 'completed'
                        ? 'retry'
                        : 'run',
                    )}
                  </button>
                  {busy && <button onClick={() => handle.current?.cancel()}>{t('cancel')}</button>}
                </div>
              </div>
              {reviewer && <h5>{t('findings')}</h5>}
              <div className="min-w-0" aria-live="polite" aria-busy={busy}>
                {state?.reason ? (
                  <p role="status">{reasonText[state.reason][language]}</p>
                ) : (
                  state &&
                  ['idle', 'preparing', 'running', 'cancelled'].includes(state.status) && (
                    <p role="status">
                      {t(state.status as 'idle' | 'preparing' | 'running' | 'cancelled')}
                    </p>
                  )
                )}
                {state?.result?.stale && (
                  <p className="wrap-anywhere">
                    {t('oldScope')}: <bdi>{state.result.provenance.source.name}</bdi>
                    {evidenceTargets(input.slot).map(target => (
                      <span key={target.field}>
                        {' '}
                        · {fieldLabels[target.field][language]}:{' '}
                        <bdi>
                          {declaredDetail(state.result!.provenance.context, target).value ??
                            t(detailTask ? 'missingDetail' : 'missing')}
                        </bdi>
                      </span>
                    ))}
                  </p>
                )}
                {state && (
                  <details className="check-details">
                    <summary>{t('checkDetails')}</summary>
                    <h5>{t('coverage')}</h5>
                    <p>
                      {t('total')}: {state.coverage.totalPages ?? t('unknown')}
                    </p>
                    <ul>
                      {(
                        [
                          'selected',
                          'prepared',
                          'dispatched',
                          'successful',
                          'failed',
                          'unreadable',
                          'unchecked',
                        ] as const
                      ).map(kind => (
                        <li key={kind}>
                          {t(kind)}:{' '}
                          {kind === 'unchecked' &&
                          state.coverage.uncheckedCount !== null &&
                          state.coverage.uncheckedCount > 100 ? (
                            `${t('allPages')} ${state.coverage.uncheckedCount}`
                          ) : (
                            <bdi dir="ltr">{state.coverage[kind].join(', ') || '—'}</bdi>
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {state?.storage === 'incompatible' && <p role="status">{t('incompatible')}</p>}
                {state?.storage === 'temporary-only' && <p role="status">{t('storageFailed')}</p>}
                {state?.result?.stale && state.reason !== 'stale' && (
                  <p role="status">{reasonText.stale[language]}</p>
                )}
                {state?.result &&
                  !state.result.stale &&
                  state.result.stages.some(stage => stage.outcome === 'partial') && (
                    <p role="status">{t('partialResults')}</p>
                  )}
                {state?.result && (
                  <>
                    {JSON.stringify(state.coverage) !== JSON.stringify(state.result.coverage) && (
                      <p>
                        {t('resultScope')}: <bdi>{state.result.coverage.successful.join(', ')}</bdi>{' '}
                        · {t('total')}: {state.result.coverage.totalPages}
                      </p>
                    )}
                    <p>
                      {t(
                        state.result.restored
                          ? 'previous'
                          : state.result.temporary
                            ? 'temporary'
                            : 'saved',
                      )}
                    </p>
                    <p>
                      <time dateTime={state.result.provenance.completedAt}>
                        {new Date(state.result.provenance.completedAt).toLocaleString(language)}
                      </time>{' '}
                      · {t('expires')}{' '}
                      <time dateTime={state.result.expiresAt}>
                        {new Date(state.result.expiresAt).toLocaleString(language)}
                      </time>
                    </p>
                    <dl className="check-findings">
                      {Object.entries(state.result.findings).map(([name, value]) => (
                        <div key={name}>
                          <dt>{label(name as keyof Findings)}</dt>
                          <dd>{findingsCopy[value][language]}</dd>
                        </div>
                      ))}
                    </dl>
                    {!state.result.stale &&
                      state.result.locations?.map(location => (
                        <div key={`${location.page}-${location.target}`}>
                          <p>
                            {t(
                              location.status === 'shown'
                                ? 'highlightAvailable'
                                : 'highlightSuppressed',
                            )}
                          </p>
                          <button
                            disabled={!selection}
                            onClick={() =>
                              setRegion({
                                page: location.page,
                                target: location.target,
                                serial: Date.now(),
                              })
                            }
                          >
                            {t('inspectRegion')}:{' '}
                            {t(
                              locationTargets(input.slot).find(
                                target => target.id === location.target,
                              )!.presence,
                            )}{' '}
                            · {t('page')} {location.page}
                          </button>
                        </div>
                      ))}
                    {multiple && !state.result.stale && state.result.pages && (
                      <>
                        <p>{t('scopedFindings')}</p>
                        {state.result.pages.map(page => (
                          <div key={page.page}>
                            <h6>
                              {t('page')} {page.page}
                            </h6>
                            <p>
                              {findingText[page.findings.category][language]} ·{' '}
                              {findingText[page.findings.readability][language]}
                            </p>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            {reviewer && (
              <div className="min-w-0">
                <h5>{t('assessment')}</h5>
                {children}
              </div>
            )}
          </div>
          {!reviewer && showSource && file && selection && (
            <SourcePages
              key={selection.source.hash}
              source={selection.source}
              file={file}
              language={language}
              run={state?.result}
            />
          )}
          {!reviewer && (
            <div className="actions">
              {edit && (
                <button disabled={disabled || !selection} onClick={edit}>
                  {t('edit')}
                </button>
              )}
              {detailEdits?.map(({ field, action }) => (
                <button key={field} disabled={disabled || !selection} onClick={action}>
                  {t(
                    (
                      {
                        businessName: 'editBusinessName',
                        address: 'editAddress',
                        operatingSince: 'editOperatingSince',
                        explanation: 'editDescription',
                        budget: 'editBudget',
                        revenue: 'editRevenue',
                        expenses: 'editExpenses',
                      } as const
                    )[field],
                  )}
                </button>
              ))}
              {replace && (
                <button disabled={disabled || !selection} onClick={replace}>
                  {t('replace')}
                </button>
              )}
              <button
                disabled={disabled || !selection}
                onClick={() => {
                  void handle.current?.refresh();
                  setRetained(true);
                }}
              >
                {t('retain')}
              </button>
            </div>
          )}
          {retained && <p role="status">{t('retained')}</p>}
        </>
      )}
      <button onClick={() => void clearAnalysis()}>{t('clear')}</button>
      {cleared && <p role="status">{t(cleared === 'failed' ? 'clearFailed' : 'cleared')}</p>}
      {regionDialog}
    </section>
  );
}
