import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ApplicationView,
  AttemptIntent,
  Context,
  Controls,
  Demo,
  DraftDocuments,
  ErrorKind,
  PreparedAttachment,
  Preparation,
  Result,
} from '../../demo';
import {
  applicationSteps,
  normalizeField,
  products,
  stepFields,
  submissionMonth,
  validateFields,
  type ApplicationStep,
} from '../../domain';
import {
  slots,
  type DocumentSlot,
  type Fields,
  type Language,
  type ProductId,
  type Sample,
} from '../../domain/model';
import { DocumentPreview } from '../shared/preview';
import { SavedDemonstrations } from '../assistance/saved-demonstrations';
import { EvidenceAssistancePanel } from '../assistance/evidence-assistance';
import { evidenceTaskSlots, evidenceTargets } from '../../evidence-assistance/contract';
import {
  displayFieldValue,
  documentLabel,
  draftText,
  errors,
  fieldLabels,
  money,
  sampleLabels,
  text,
} from '../i18n';
import { activities, applicationText, documentRequirement, issueMessage } from './application-copy';
import type { Departure } from '../shared/departure';
import { CorrectionProgress, responseText, workspaceView } from './correction-response';
import { ApplicationField } from './application-field';
import { AttachmentPreparation, SavedAttachment } from '../shared/attachment-feedback';
import { DraftSaveFeedback } from '../shared/feedback';
import { containDialogFocus } from '../shared/dialog';
import { Select } from '../shared/select';
import { ApplicationSteps } from './application-steps';
import { FilePicker } from '../shared/file-picker';

type Selection = {
  id: string;
  source: Preparation['source'];
  name: string;
  status: 'preparing' | 'ready' | 'failed';
  progress: number;
  attachment?: PreparedAttachment;
  error?: ErrorKind;
};
type Selections = Partial<Record<DocumentSlot, Selection>>;
type DraftIntent = Extract<
  AttemptIntent,
  { kind: 'saveDraft' | 'saveCorrections' | 'submit' | 'resubmit' }
>;
export type DraftBuffer = {
  fields: Fields;
  product: ProductId;
  baseline: ApplicationView;
  selections: Selections;
  purchaseRemoved: boolean;
  status: 'unsaved' | 'saving' | 'saved' | 'failed' | 'unknown';
  error: ErrorKind | null;
  pending: DraftIntent | null;
  capturedSelections: Partial<Record<DocumentSlot, string>>;
};
const savedTime = (view: ApplicationView) =>
  view.role === 'applicant' ? view.workspace?.savedAt : null;
const initialBuffer = (input: ApplicationView, initialTerm?: number): DraftBuffer => {
  const view = workspaceView(input);
  const term =
    !savedTime(view) &&
    !view.snapshot.fields.term &&
    initialTerm !== undefined &&
    products[view.product].terms.includes(initialTerm)
      ? String(initialTerm)
      : view.snapshot.fields.term;
  return {
    fields: { ...view.snapshot.fields, term },
    product: view.product,
    baseline: view,
    selections: {},
    purchaseRemoved: false,
    status: savedTime(view) ? 'saved' : 'unsaved',
    error: null,
    pending: null,
    capturedSelections: {},
  };
};
export const draftDirty = (buffer: DraftBuffer) =>
  !savedTime(buffer.baseline) ||
  JSON.stringify(buffer.fields) !== JSON.stringify(buffer.baseline.snapshot.fields) ||
  buffer.product !== buffer.baseline.product ||
  buffer.purchaseRemoved ||
  Object.keys(buffer.selections).length > 0 ||
  buffer.status === 'unknown';
const fieldId = (field: keyof Fields) =>
  field === 'explanation' ? 'purchase-explanation' : `field-${field}`;
const focusIssue = (id: string) => {
  const control = document.getElementById(id);
  control?.focus();
  control?.scrollIntoView({ block: 'center' });
};
const publication = (intent: DraftIntent | null) =>
  intent?.kind === 'submit' || intent?.kind === 'resubmit';

export function RetainedDraft({
  demo,
  buffer,
  language,
  discard,
  confirmed,
}: {
  demo: Demo;
  buffer: DraftBuffer;
  language: Language;
  discard: () => void;
  confirmed: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKind | null>(null);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  return (
    <section className="summary my-6" aria-labelledby="retained-heading">
      <h2 id="retained-heading">{applicationText.retained[language]}</h2>
      <p>{applicationText.retainedHint[language]}</p>
      <details>
        <summary>{applicationText.review[language]}</summary>
        <p>{products[buffer.product].name[language]}</p>
        <dl className="facts">
          {Object.entries(buffer.fields).map(([field, value]) => (
            <div key={field}>
              <dt>{fieldLabels[field as keyof Fields][language]}</dt>
              <dd>
                <bdi>{value}</bdi>
              </dd>
            </div>
          ))}
        </dl>
        {Object.entries(buffer.selections).map(([slot, selection]) => (
          <p key={slot}>
            {documentLabel(slot as DocumentSlot, buffer.product)[language]}:{' '}
            <bdi>{selection.name}</bdi>
          </p>
        ))}
      </details>
      {error && <p role="alert">{errors[error][language]}</p>}
      {buffer.pending && (
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const result = await demo.inspectAttempt(buffer.pending!, buffer.baseline);
            if (!active.current) return;
            setBusy(false);
            if (!result.ok) setError(result.error.kind);
            else if (result.value.status === 'committed' && publication(buffer.pending))
              confirmed();
            else
              setError(result.value.status === 'notCommitted' ? 'requestFailed' : 'invalidState');
          }}
        >
          {publication(buffer.pending)
            ? buffer.pending?.kind === 'resubmit'
              ? responseText.inspectResubmission[language]
              : applicationText.inspectSubmission[language]
            : draftText.inspectOutcome[language]}
        </button>
      )}
      <button disabled={busy} onClick={discard}>
        {draftText.discard[language]}
      </button>
    </section>
  );
}

export function DraftEditor({
  demo,
  view: suppliedView,
  context,
  language,
  retained,
  remember,
  departure,
  savedView,
  step,
  changeStep,
  initialTerm,
}: {
  demo: Demo;
  view: ApplicationView;
  context: Context;
  language: Language;
  step: ApplicationStep;
  changeStep: (step: ApplicationStep) => void;
  retained?: DraftBuffer;
  remember: (value: DraftBuffer) => void;
  departure: (value: Departure | null) => void;
  savedView: (value: ApplicationView) => void;
  initialTerm?: number;
}) {
  const view = useMemo(() => workspaceView(suppliedView), [suppliedView]);
  const corrections = view.status === 'correctionsRequested';
  const targets = corrections ? view.rounds.at(-1)!.targets : [];
  const targetFields = targets.flatMap(target => (target.kind === 'field' ? [target.field] : []));
  const targetSlots = targets.flatMap(target => (target.kind === 'document' ? [target.slot] : []));
  const c = (key: keyof typeof responseText) => responseText[key][language];
  const initial = retained && draftDirty(retained) ? retained : initialBuffer(view, initialTerm);
  const [buffer, render] = useState(initial);
  const state = useRef(initial);
  const mounted = useRef(true);
  const retainOnUnmount = useRef(true);
  const preparations = useRef<Partial<Record<DocumentSlot, Promise<Result<PreparedAttachment>>>>>(
    {},
  );
  const [samples, setSamples] = useState<Sample[] | null>(null);
  const [sampleLoadFailed, setSampleLoadFailed] = useState(false);
  const [sampleRequest, setSampleRequest] = useState(0);
  const [sampleIds, setSampleIds] = useState<Partial<Record<DocumentSlot, string>>>({});
  const [preview, setPreview] = useState<{ slot: DocumentSlot; kind: 'saved' | 'ready' } | null>(
    null,
  );
  const [latest, setLatest] = useState<ApplicationView | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const [checked, setChecked] = useState(false);
  const [reapplyConfirmation, setReapplyConfirmation] = useState<ApplicationView | null>(null);
  const reapplyControl = useRef<HTMLButtonElement>(null);
  const [switchTo, setSwitchTo] = useState<ProductId | null>(null);
  const switchDialog = useRef<HTMLDialogElement>(null);
  const productControl = useRef<HTMLButtonElement>(null);
  const confirmationWasOpen = useRef(false);
  const confirmationOpener = useRef<HTMLElement | null>(null);
  const focusTarget = useRef<string | null>(null);
  const [, redrawControls] = useState(0);
  const controls = demo.controls();
  const t = (key: keyof typeof draftText) => draftText[key][language];
  const a = (key: keyof typeof applicationText) => applicationText[key][language];
  const update = (next: DraftBuffer) => {
    retainOnUnmount.current = true;
    state.current = next;
    remember(next);
    if (mounted.current) render(next);
  };
  const dirty = draftDirty(buffer);
  const locked = buffer.status === 'saving' || buffer.status === 'unknown';
  const newer =
    (!corrections && view.sharedRevision > buffer.baseline.sharedRevision) ||
    (view.role === 'applicant' &&
      buffer.baseline.role === 'applicant' &&
      !!view.workspace &&
      !!buffer.baseline.workspace &&
      view.workspace.revision > buffer.baseline.workspace.revision);
  const conflict = newer || buffer.error === 'staleWorkspace' || buffer.error === 'staleRecord';
  const fieldIssues = validateFields(
    buffer.fields,
    products[buffer.product],
    view.submittedAt?.slice(0, 7) ?? submissionMonth,
  );
  const effectiveSaved = (slot: DocumentSlot) =>
    slot === 'purchase' && buffer.purchaseRemoved
      ? null
      : buffer.baseline.documents.find(document => document.slot === slot)?.file;
  const targetChanged = (target: (typeof targets)[number]) => {
    const round = view.rounds.at(-1)!;
    if (target.kind === 'field')
      return (
        normalizeField(target.field, buffer.fields[target.field]) !==
        normalizeField(target.field, round.baseline.fields[target.field])
      );
    const selection = buffer.selections[target.slot];
    const baselineFile = suppliedView.documents.find(
      document => document.file?.id === round.baseline.documents[target.slot],
    )?.file;
    return selection
      ? selection.status === 'ready' &&
          !!selection.attachment &&
          selection.attachment.hash !== baselineFile?.hash
      : !!effectiveSaved(target.slot) && effectiveSaved(target.slot)?.hash !== baselineFile?.hash;
  };
  const unchangedTargets = targets.filter(target => !targetChanged(target));
  const missingSlots = slots.filter(slot =>
    buffer.selections[slot] ? buffer.selections[slot]?.status !== 'ready' : !effectiveSaved(slot),
  );
  useEffect(() => {
    if (preview?.kind === 'saved') {
      const file = effectiveSaved(preview.slot);
      if (!file || !view.documents.some(document => document.file?.id === file.id))
        setPreview(null);
    }
  }, [preview, view]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      for (const slot of slots) demo.cancelPreparation(view.id, slot);
      const current = state.current;
      const selections = Object.fromEntries(
        Object.entries(current.selections).map(([slot, selection]) => [
          slot,
          selection.status === 'preparing'
            ? { ...selection, status: 'failed', error: 'sessionExpired' }
            : selection,
        ]),
      ) as Selections;
      if (retainOnUnmount.current)
        remember({
          ...current,
          selections,
          status:
            current.status === 'saving' ? (current.pending ? 'unknown' : 'failed') : current.status,
        });
      departure(null);
    };
  }, []);
  useEffect(() => {
    let active = true;
    setSamples(null);
    setSampleLoadFailed(false);
    void demo.listSamples(view.id).then(result => {
      if (!active) return;
      if (!result.ok) {
        setSamples([]);
        setSampleLoadFailed(true);
        return;
      }
      setSamples(result.value);
      setSampleIds(
        Object.fromEntries(
          slots.map(slot => [slot, result.value.find(sample => sample.slot === slot)?.id ?? '']),
        ),
      );
    });
    return () => {
      active = false;
    };
  }, [demo, view.id, sampleRequest]);
  useEffect(() => {
    if (newer && !draftDirty(state.current) && (view.status === 'draft' || corrections))
      update(initialBuffer(view));
  }, [view]);
  useEffect(() => {
    if (focusTarget.current) focusIssue(focusTarget.current);
    else document.getElementById('step-heading')?.focus({ preventScroll: true });
    focusTarget.current = null;
  }, [step]);
  useEffect(() => {
    if (switchTo || reapplyConfirmation) {
      confirmationOpener.current = reapplyConfirmation
        ? reapplyControl.current
        : productControl.current;
      confirmationWasOpen.current = true;
      switchDialog.current?.showModal();
    } else if (confirmationWasOpen.current) {
      confirmationWasOpen.current = false;
      const opener = confirmationOpener.current;
      const target = opener?.isConnected
        ? opener
        : (productControl.current ?? document.getElementById('step-heading'));
      target?.focus();
    }
  }, [switchTo, reapplyConfirmation]);
  const prepare = (slot: DocumentSlot, source: Preparation['source'], name: string) => {
    if (state.current.status === 'saving' || state.current.status === 'unknown') return;
    setPreview(null);
    const id = crypto.randomUUID();
    update({
      ...state.current,
      selections: {
        ...state.current.selections,
        [slot]: { id, source, name, status: 'preparing', progress: 0 },
      },
      status: 'unsaved',
      error: null,
      pending: null,
    });
    const promise = demo.prepareAttachment(
      {
        datasetId: context.datasetId,
        applicationId: view.id,
        slot,
        product: state.current.product,
        selectionId: id,
        source,
      },
      progress => {
        const selection = state.current.selections[slot];
        if (mounted.current && selection?.id === id)
          update({
            ...state.current,
            selections: { ...state.current.selections, [slot]: { ...selection, progress } },
          });
      },
    );
    preparations.current[slot] = promise;
    void promise.then(result => {
      const selection = state.current.selections[slot];
      if (!mounted.current || selection?.id !== id) return;
      update({
        ...state.current,
        selections: {
          ...state.current.selections,
          [slot]: result.ok
            ? {
                ...selection,
                status: 'ready',
                progress: 100,
                name: result.value.name,
                attachment: result.value,
              }
            : { ...selection, status: 'failed', error: result.error.kind },
        },
      });
    });
  };
  const acceptSaved = (
    saved: ApplicationView,
    intent: DraftIntent,
    captured: DraftBuffer['capturedSelections'],
  ) => {
    const application = workspaceView(saved);
    const current = state.current;
    if (publication(intent)) {
      retainOnUnmount.current = false;
      departure(null);
      savedView(saved);
      return;
    }
    const selections = { ...current.selections };
    for (const slot of slots) {
      const document = intent.documents[slot];
      if (
        document.kind === 'prepared' &&
        selections[slot]?.id === captured[slot] &&
        application.snapshot.documents[slot] === document.attachment.id
      )
        delete selections[slot];
    }
    const next = {
      ...current,
      baseline: application,
      selections,
      purchaseRemoved: false,
      status: 'saved' as const,
      error: null,
      pending: null,
    };
    update({ ...next, status: draftDirty(next) ? 'unsaved' : 'saved' });
    savedView(saved);
    setLatest(null);
  };
  const execute = async (
    intent: DraftIntent,
    captured: DraftBuffer['capturedSelections'],
  ): Promise<boolean> => {
    update({
      ...state.current,
      status: 'saving',
      error: null,
      pending: intent,
      capturedSelections: captured,
    });
    const result = await demo.attempt(intent, state.current.baseline);
    if (!mounted.current) return false;
    if (!result.ok) {
      update({ ...state.current, status: 'failed', error: result.error.kind });
      return false;
    }
    const outcome = result.value;
    if (outcome.status === 'committed') {
      acceptSaved(outcome.result.application, intent, captured);
      return publication(intent) || !draftDirty(state.current);
    }
    if (outcome.status === 'unknown') {
      update({ ...state.current, status: 'unknown', error: 'outcomeUnknown' });
      return false;
    }
    update({
      ...state.current,
      status: 'failed',
      error: outcome.status === 'stale' ? outcome.cause : 'requestFailed',
    });
    return false;
  };
  const save = async (): Promise<boolean> => {
    const current = state.current;
    if (
      current.status === 'saving' ||
      current.status === 'unknown' ||
      conflict ||
      current.baseline.role !== 'applicant' ||
      !current.baseline.workspace
    )
      return false;
    const fields = { ...current.fields };
    const captured = Object.fromEntries(
      Object.entries(current.selections).map(([slot, selection]) => [slot, selection.id]),
    );
    update({ ...current, status: 'saving', error: null });
    await Promise.all(
      slots
        .filter(slot => current.selections[slot]?.status === 'preparing')
        .map(slot => preparations.current[slot]),
    );
    if (!mounted.current) return false;
    const documents = Object.fromEntries(
      slots.map(slot => [
        slot,
        {
          kind: 'saved',
          fileId:
            slot === 'purchase' && current.purchaseRemoved
              ? null
              : current.baseline.snapshot.documents[slot],
        },
      ]),
    ) as DraftDocuments;
    for (const slot of slots) {
      const selection = state.current.selections[slot];
      if (
        selection &&
        selection.id === captured[slot] &&
        selection.status === 'ready' &&
        selection.attachment
      )
        documents[slot] = { kind: 'prepared', attachment: selection.attachment };
    }
    const intent: DraftIntent = corrections
      ? {
          kind: 'saveCorrections',
          applicationId: view.id,
          product: current.product,
          fields,
          documents,
          roundId: current.baseline.workspace!.roundId!,
        }
      : { kind: 'saveDraft', applicationId: view.id, product: current.product, fields, documents };
    return execute(intent, captured);
  };
  const submit = async () => {
    const current = state.current;
    if (locked || conflict || current.baseline.role !== 'applicant' || !current.baseline.workspace)
      return;
    setChecked(true);
    if (fieldIssues.length || missingSlots.length || unchangedTargets.length) {
      requestAnimationFrame(() => document.getElementById('validation-summary')?.focus());
      return;
    }
    const documents = Object.fromEntries(
      slots.map(slot => {
        const selection = current.selections[slot];
        return [
          slot,
          selection?.attachment
            ? { kind: 'prepared', attachment: selection.attachment }
            : {
                kind: 'saved',
                fileId:
                  slot === 'purchase' && current.purchaseRemoved
                    ? null
                    : current.baseline.snapshot.documents[slot],
              },
        ];
      }),
    ) as DraftDocuments;
    const intent: DraftIntent = corrections
      ? {
          kind: 'resubmit',
          applicationId: view.id,
          product: current.product,
          fields: { ...current.fields },
          documents,
          roundId: current.baseline.workspace!.roundId!,
        }
      : {
          kind: 'submit',
          applicationId: view.id,
          product: current.product,
          fields: { ...current.fields },
          documents,
        };
    const captured = Object.fromEntries(
      Object.entries(current.selections).map(([slot, selection]) => [slot, selection.id]),
    );
    await execute(intent, captured);
  };
  const discardSelection = (slot: DocumentSlot) => {
    demo.cancelPreparation(view.id, slot);
    setPreview(null);
    const selections = { ...state.current.selections };
    delete selections[slot];
    update({ ...state.current, selections, status: 'unsaved', error: null, pending: null });
  };
  const discard = () => {
    for (const slot of slots) demo.cancelPreparation(view.id, slot);
    setPreview(null);
    update(initialBuffer(view));
    retainOnUnmount.current = false;
  };
  useEffect(() => {
    departure({
      dirty,
      pending:
        buffer.status === 'saving' ||
        Object.values(buffer.selections).some(selection => selection.status === 'preparing'),
      canSave:
        !locked &&
        !conflict &&
        Object.values(buffer.selections).every(selection => selection.status === 'ready'),
      save,
      discard,
    });
  }, [buffer, view, latest]);
  const inspectOutcome = async () => {
    if (!state.current.pending) return;
    setInspecting(true);
    const intent = state.current.pending;
    const result = await demo.inspectAttempt(intent, state.current.baseline);
    if (!mounted.current) return;
    setInspecting(false);
    if (!result.ok) {
      update({ ...state.current, error: result.error.kind });
      return;
    }
    if (result.value.status === 'committed')
      acceptSaved(result.value.result.application, intent, state.current.capturedSelections);
    else
      update({
        ...state.current,
        status: 'failed',
        error: result.value.status === 'stale' ? result.value.cause : 'requestFailed',
      });
  };
  const inspectLatest = async () => {
    setInspecting(true);
    const result = await demo.readApplication(view.id);
    if (!mounted.current) return;
    setInspecting(false);
    if (result.ok) setLatest(workspaceView(result.value));
    else update({ ...state.current, error: result.error.kind });
  };
  const switchProduct = (product: ProductId) => {
    const current = state.current;
    if (product === current.product) return;
    demo.cancelPreparation(view.id, 'purchase');
    setPreview(null);
    const selections = { ...current.selections };
    delete selections.purchase;
    update({
      ...current,
      product,
      selections,
      purchaseRemoved: current.purchaseRemoved || !!current.baseline.snapshot.documents.purchase,
      status: 'unsaved',
      pending: null,
      error: null,
    });
    setChecked(true);
    setSwitchTo(null);
  };
  const applyLatest = (application: ApplicationView) => {
    const current = state.current;
    update({
      ...current,
      baseline: application,
      purchaseRemoved:
        current.purchaseRemoved ||
        (application.product !== current.product && !!application.snapshot.documents.purchase),
      status: 'unsaved',
      error: null,
      pending: null,
    });
    setLatest(null);
    setReapplyConfirmation(null);
  };
  const cancelSwitch = () => {
    setSwitchTo(null);
    setReapplyConfirmation(null);
  };
  const openIssue = (target: ApplicationStep, id: string) => {
    if (corrections || target === step) focusIssue(id);
    else {
      focusTarget.current = id;
      changeStep(target);
    }
  };
  const renderField = (field: keyof Fields) => (
    <ApplicationField
      key={field}
      field={field}
      id={fieldId(field)}
      value={buffer.fields[field]}
      product={buffer.product}
      language={language}
      issue={checked ? fieldIssues.find(issue => issue.field === field) : undefined}
      disabled={locked && publication(buffer.pending)}
      change={value =>
        update({
          ...state.current,
          fields: { ...state.current.fields, [field]: value },
          status: locked ? state.current.status : 'unsaved',
          pending: locked ? state.current.pending : null,
        })
      }
    />
  );
  const shownIssues =
    checked && (fieldIssues.length > 0 || missingSlots.length > 0 || unchangedTargets.length > 0);
  const savedAt = savedTime(buffer.baseline);
  return (
    <section
      className="draft-editor my-6"
      aria-labelledby="draft-heading"
      aria-busy={buffer.status === 'saving'}
    >
      <h2 id="draft-heading">{corrections ? c('title') : t('edit')}</h2>
      {corrections && (
        <CorrectionProgress
          view={suppliedView}
          fields={buffer.fields}
          documentChanged={slot => {
            const selection = buffer.selections[slot];
            const baselineId = view.rounds.at(-1)!.baseline.documents[slot];
            const baselineFile = suppliedView.documents.find(
              document => document.file?.id === baselineId,
            )?.file;
            const file = selection
              ? selection.status === 'ready'
                ? selection.attachment
                : null
              : effectiveSaved(slot);
            return !!file && file.hash !== baselineFile?.hash;
          }}
          language={language}
        />
      )}
      {!savedAt && <p className="summary">{a('newHint')}</p>}
      {!corrections && (
        <ApplicationSteps current={step} language={language} changeStep={changeStep} />
      )}
      <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(240px,1fr)] gap-6 narrow:grid-cols-1">
        <div className="panel">
          <h2 id="step-heading" tabIndex={-1}>
            {corrections ? text.corrections[language] : a(step)}
          </h2>
          {shownIssues && (
            <div
              className="summary border-danger-border bg-danger-surface text-danger-text"
              id="validation-summary"
              role="alert"
              tabIndex={-1}
            >
              <h3>{a('errors')}</h3>
              <ul>
                {fieldIssues.map(issue => {
                  const target = (Object.keys(stepFields) as Array<keyof typeof stepFields>).find(
                    group => stepFields[group].includes(issue.field),
                  )!;
                  return (
                    <li key={issue.field}>
                      <a
                        href={`?step=${target}#${fieldId(issue.field)}`}
                        onClick={event => {
                          event.preventDefault();
                          openIssue(target, fieldId(issue.field));
                        }}
                      >
                        {fieldLabels[issue.field][language]}: {issueMessage(issue)[language]}
                      </a>
                    </li>
                  );
                })}
                {unchangedTargets.map(target => (
                  <li
                    key={
                      target.kind === 'field' ? `change-${target.field}` : `change-${target.slot}`
                    }
                  >
                    <a
                      href={`#${target.kind === 'field' ? fieldId(target.field) : `${target.slot}-file`}`}
                      onClick={event => {
                        event.preventDefault();
                        focusIssue(
                          target.kind === 'field' ? fieldId(target.field) : `${target.slot}-file`,
                        );
                      }}
                    >
                      {target.kind === 'field'
                        ? fieldLabels[target.field][language]
                        : documentLabel(target.slot, buffer.product)[language]}
                      : {c('requiredChange')}
                    </a>
                  </li>
                ))}
                {missingSlots.map(slot => (
                  <li key={slot}>
                    <a
                      href={`?step=documents#${slot}-file`}
                      onClick={event => {
                        event.preventDefault();
                        openIssue('documents', `${slot}-file`);
                      }}
                    >
                      {documentLabel(slot, buffer.product)[language]}: {a('missing')}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {step === 'business' && <p className="text-[13px] text-muted">{a('financialHint')}</p>}
          {!corrections && step === 'financing' && (
            <>
              <label htmlFor="draft-product">{a('product')}</label>
              <Select
                id="draft-product"
                label={a('product')}
                ref={productControl}
                value={buffer.product}
                disabled={locked}
                onValueChange={value => {
                  const product = value as ProductId;
                  if (product === buffer.product) return;
                  if (effectiveSaved('purchase') || buffer.selections.purchase)
                    setSwitchTo(product);
                  else switchProduct(product);
                }}
                options={Object.values(products).map(product => ({
                  value: product.id,
                  label: product.name[language],
                }))}
              />
              {buffer.purchaseRemoved && <p role="status">{a('stagedRemoval')}</p>}
            </>
          )}
          {corrections
            ? targetFields.map(renderField)
            : step !== 'documents' && step !== 'review' && stepFields[step].map(renderField)}
          {(corrections || step === 'documents') && sampleLoadFailed && (
            <div role="alert" className="summary">
              <p>{t('samplesFailed')}</p>
              <button
                className="secondary"
                disabled={locked}
                onClick={() => setSampleRequest(request => request + 1)}
              >
                {text.retry[language]}
              </button>
            </div>
          )}
          {(corrections ? targetSlots : step === 'documents' ? slots : []).map(slot => {
            const selection = buffer.selections[slot];
            const savedFile = effectiveSaved(slot);
            const available =
              samples?.filter(
                sample =>
                  sample.slot === slot &&
                  (slot !== 'purchase' || sample.product === buffer.product),
              ) ?? [];
            const sampleId =
              available.find(sample => sample.id === sampleIds[slot])?.id ?? available[0]?.id ?? '';
            return (
              <section
                key={slot}
                aria-labelledby={`${slot}-heading`}
                className="mb-6 border-0 border-b border-solid border-border pb-6"
              >
                <h3 id={`${slot}-heading`}>{documentLabel(slot, buffer.product)[language]}</h3>
                <p>{documentRequirement(slot, buffer.product)[language]}</p>
                <p id={`${slot}-hint`} className="text-[13px] text-muted">
                  {t('fileHint')}
                </p>
                <SavedDemonstrations
                  demo={demo}
                  language={language}
                  current={{
                    applicationId: view.id,
                    slot,
                    language,
                    fileId: selection ? null : (savedFile?.id ?? null),
                    attachment: selection?.attachment,
                    fields: buffer.fields,
                    product: buffer.product,
                  }}
                />
                <label htmlFor={`${slot}-file`}>{t('chooseFile')}</label>
                <FilePicker
                  id={`${slot}-file`}
                  language={language}
                  name={selection?.name ?? savedFile?.name}
                  saved={!selection && !!savedFile}
                  disabled={locked}
                  describedBy={`${slot}-hint${selection?.error ? ` ${slot}-preparation-error` : ''}`}
                  invalid={!!selection?.error || (checked && missingSlots.includes(slot))}
                  choose={file => prepare(slot, { kind: 'local', file }, file.name)}
                />
                <div
                  className="sample-picker my-4 flex flex-wrap items-center gap-3"
                  aria-busy={samples === null}
                >
                  {available.length ? (
                    <>
                      <label htmlFor={`${slot}-sample`}>{t('sample')}</label>
                      <Select
                        id={`${slot}-sample`}
                        label={t('sample')}
                        value={sampleId}
                        disabled={locked}
                        onValueChange={value => setSampleIds({ ...sampleIds, [slot]: value })}
                        options={available.map(sample => ({
                          value: sample.id,
                          label:
                            sample.variant === 'original'
                              ? documentLabel(slot, buffer.product)[language]
                              : sampleLabels[sample.variant][language],
                        }))}
                      />
                    </>
                  ) : (
                    <>
                      <p className="m-0 w-full font-semibold text-accent">{t('sample')}</p>
                      <p
                        className="m-0 min-h-12 flex-[1_1_250px] text-[13px] text-muted"
                        role="status"
                      >
                        {samples === null
                          ? text.readLoading[language]
                          : sampleLoadFailed
                            ? t('samplesFailed')
                            : t('generatedSampleHint')}
                      </p>
                    </>
                  )}
                  <button
                    disabled={samples === null || sampleLoadFailed || locked}
                    onClick={() =>
                      prepare(
                        slot,
                        sampleId
                          ? { kind: 'sample', sampleId }
                          : { kind: 'generated', fields: { ...buffer.fields } },
                        documentLabel(slot, buffer.product)[language],
                      )
                    }
                  >
                    {t('useSample')}
                  </button>
                </div>
                {selection && (
                  <AttachmentPreparation
                    selection={selection}
                    language={language}
                    errorId={`${slot}-preparation-error`}
                    locked={locked}
                    retry={() => prepare(slot, selection.source, selection.name)}
                    preview={() => setPreview({ slot, kind: 'ready' })}
                    discard={() => discardSelection(slot)}
                  />
                )}
                {(savedFile || !selection) && (
                  <SavedAttachment
                    file={savedFile}
                    language={language}
                    label={corrections ? c('saved') : undefined}
                    preview={() => setPreview({ slot, kind: 'saved' })}
                  />
                )}
                {evidenceTaskSlots.includes(slot) && (
                  <EvidenceAssistancePanel
                    key={JSON.stringify([
                      view.role === 'applicant' ? view.workspace?.roundId : null,
                      slot === 'purchase' ? buffer.product : null,
                      selection?.attachment?.id ?? selection?.id ?? savedFile?.id,
                      ...evidenceTargets(slot).map(target => buffer.fields[target.field]),
                    ])}
                    demo={demo}
                    product={buffer.product}
                    language={language}
                    disabled={
                      locked ||
                      conflict ||
                      (!!selection && selection.status !== 'ready') ||
                      (!selection && !savedFile)
                    }
                    input={{
                      action: 'check-document',
                      applicationId: view.id,
                      slot,
                      audience: 'applicant',
                      context: corrections ? 'correction-workspace' : 'draft',
                      ...(corrections ? { roundId: view.rounds.at(-1)!.id } : {}),
                      fileId: selection ? null : savedFile?.id,
                      attachment: selection?.attachment,
                      ...(slot === 'financial'
                        ? {
                            declaredFinancial: {
                              revenue: buffer.fields.revenue,
                              expenses: buffer.fields.expenses,
                            },
                          }
                        : slot === 'identity'
                          ? { declaredName: buffer.fields.fullName }
                          : slot === 'purchase'
                            ? {
                                declaredPurchase: {
                                  product: buffer.product,
                                  explanation: buffer.fields.explanation,
                                  budget: buffer.fields.budget,
                                },
                              }
                            : {
                                declaredBusiness: {
                                  businessName: buffer.fields.businessName,
                                  address: buffer.fields.address,
                                  operatingSince: buffer.fields.operatingSince,
                                },
                              }),
                    }}
                    edit={
                      slot === 'identity'
                        ? corrections
                          ? targetFields.includes('fullName')
                            ? () => focusIssue(fieldId('fullName'))
                            : undefined
                          : () => changeStep('personal')
                        : undefined
                    }
                    detailEdits={
                      slot === 'business' || slot === 'purchase' || slot === 'financial'
                        ? (slot === 'financial'
                            ? (['revenue', 'expenses'] as const)
                            : slot === 'purchase'
                              ? (['explanation', 'budget'] as const)
                              : (['businessName', 'address', 'operatingSince'] as const)
                          )
                            .filter(field => !corrections || targetFields.includes(field))
                            .map(field => ({
                              field,
                              action: () =>
                                corrections
                                  ? focusIssue(fieldId(field))
                                  : openIssue(
                                      slot === 'purchase' ? 'financing' : 'business',
                                      fieldId(field),
                                    ),
                            }))
                        : undefined
                    }
                    replace={() => focusIssue(`${slot}-file`)}
                  />
                )}
              </section>
            );
          })}
          {(corrections || step === 'review') && (
            <>
              <h3>{corrections ? c('summary') : a('review')}</h3>
              <p>{a('reviewHint')}</p>
              <h3>{products[buffer.product].name[language]}</h3>
              <dl className="facts information">
                {Object.entries(buffer.fields).map(([key, value]) => (
                  <div key={key}>
                    <dt>{fieldLabels[key as keyof Fields][language]}</dt>
                    <dd>
                      <bdi
                        dir={
                          [
                            'mobile',
                            'email',
                            'operatingSince',
                            'amount',
                            'term',
                            'revenue',
                            'expenses',
                            'budget',
                          ].includes(key)
                            ? 'ltr'
                            : undefined
                        }
                      >
                        {key === 'activity'
                          ? activities[buffer.fields.activity]?.[language]
                          : displayFieldValue(key as keyof Fields, value, language)}
                      </bdi>
                    </dd>
                  </div>
                ))}
              </dl>
              <ul>
                {slots.map(slot => (
                  <li key={slot}>
                    {documentLabel(slot, buffer.product)[language]}:{' '}
                    <bdi dir="ltr">
                      {buffer.selections[slot]?.name ??
                        effectiveSaved(slot)?.name ??
                        text.missing[language]}
                    </bdi>
                    {buffer.selections[slot] && (
                      <span>
                        {' '}
                        ·{' '}
                        {t(
                          buffer.selections[slot]?.status === 'ready'
                            ? 'ready'
                            : buffer.selections[slot]?.status === 'preparing'
                              ? 'preparing'
                              : 'preparationFailed',
                        )}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setChecked(true);
                  requestAnimationFrame(() =>
                    document.getElementById('validation-summary')?.focus(),
                  );
                }}
              >
                {a('check')}
              </button>
              {checked && !shownIssues && <p role="status">{a('valid')}</p>}
              {
                <button
                  aria-busy={buffer.status === 'saving' && publication(buffer.pending)}
                  disabled={locked || inspecting || conflict}
                  onClick={() => void submit()}
                >
                  {buffer.status === 'saving' && publication(buffer.pending) && (
                    <span className="button-spinner" aria-hidden="true" />
                  )}
                  {corrections ? c('resubmit') : a('submit')}
                </button>
              }
            </>
          )}
          <div className="actions">
            {!corrections && step !== 'personal' && (
              <button
                onClick={() => changeStep(applicationSteps[applicationSteps.indexOf(step) - 1])}
              >
                {a('previous')}
              </button>
            )}
            {!corrections && step !== 'review' && (
              <button
                onClick={() => changeStep(applicationSteps[applicationSteps.indexOf(step) + 1])}
              >
                {a('next')}
              </button>
            )}
          </div>
        </div>
        <aside className="summary self-start">
          <h2>{products[buffer.product].name[language]}</h2>
          <p>{products[buffer.product].purpose[language]}</p>
          <p>
            <bdi dir="ltr">
              <bdi dir="ltr">{money(products[buffer.product].minimum, language)}</bdi> /{' '}
              <bdi dir="ltr">{money(products[buffer.product].maximum, language)}</bdi>
            </bdi>
          </p>
          <p>
            <bdi dir="ltr">{products[buffer.product].terms.join(' / ')}</bdi>{' '}
            {text.months[language]}
          </p>
          <p>
            {text.markup[language]}: <bdi dir="ltr">{products[buffer.product].markupPercent}%</bdi>.{' '}
            {a('once')}
          </p>
          <p>{a('eligibility')}</p>
        </aside>
      </div>
      <DraftSaveFeedback
        status={buffer.status}
        savedAt={savedAt ?? null}
        error={buffer.error}
        operation={
          publication(buffer.pending) ? (buffer.pending!.kind as 'submit' | 'resubmit') : undefined
        }
        language={language}
      />
      {buffer.status === 'unknown' ? (
        <button disabled={inspecting} onClick={() => void inspectOutcome()}>
          {publication(buffer.pending)
            ? buffer.pending?.kind === 'resubmit'
              ? c('inspectResubmission')
              : a('inspectSubmission')
            : t('inspectOutcome')}
        </button>
      ) : (
        <button
          disabled={inspecting || conflict}
          aria-disabled={buffer.status === 'saving' || inspecting || conflict}
          onClick={() => void save()}
        >
          {t('save')}
        </button>
      )}
      {conflict && (
        <div className="summary">
          <p role="status">{corrections ? c('newer') : t('newer')}</p>
          <button
            disabled={inspecting || buffer.status === 'saving'}
            onClick={() => void inspectLatest()}
          >
            {corrections ? c('inspect') : t('loadLatest')}
          </button>
          {latest && (
            <>
              <p>
                {t('latestExplanation')}:{' '}
                {latest.snapshot.fields.explanation || text.emptyExplanation[language]}
              </p>
              <dl className="facts">
                {Object.entries(latest.snapshot.fields).map(([field, value]) => (
                  <div key={field}>
                    <dt>{fieldLabels[field as keyof Fields][language]}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p>{products[latest.product].name[language]}</p>
              {latest.documents.map(document => (
                <p key={document.slot}>
                  {documentLabel(document.slot, latest.product)[language]}:{' '}
                  {document.file?.name ?? text.missing[language]}
                </p>
              ))}
              <button
                ref={reapplyControl}
                onClick={() => {
                  if (
                    latest.product !== state.current.product &&
                    latest.snapshot.documents.purchase
                  )
                    setReapplyConfirmation(latest);
                  else applyLatest(latest);
                }}
              >
                {t('reapply')}
              </button>
            </>
          )}
        </div>
      )}
      <details className="draft-feedback demo-controls">
        <summary>{t('controls')}</summary>
        <p>{t('controlScope')}</p>
        <label>
          <input
            type="checkbox"
            checked={controls.slow}
            onChange={event => {
              demo.setControls({ ...controls, slow: event.target.checked });
              redrawControls(value => value + 1);
            }}
          />
          {t('slow')}
        </label>
        <p>{t(controls.slow ? 'slowTiming' : 'normalTiming')}</p>
        <label htmlFor="next-failure">{t('nextFailure')}</label>
        <Select
          id="next-failure"
          label={t('nextFailure')}
          value={controls.failure ?? ''}
          onValueChange={value => {
            demo.setControls({
              ...controls,
              failure: value ? (value as Controls['failure']) : null,
            });
            redrawControls(value => value + 1);
          }}
          options={[
            { value: '', label: t('none') },
            { value: 'upload', label: t('uploadFailure') },
            { value: 'save', label: t('saveFailure') },
            { value: 'submission', label: a('submissionFailure') },
            { value: 'storage', label: t('storageFailure') },
          ]}
        />
      </details>
      {preview && (
        <DocumentPreview
          demo={demo}
          applicationId={view.id}
          fileId={preview.kind === 'saved' ? effectiveSaved(preview.slot)?.id : undefined}
          attachment={
            preview.kind === 'ready' ? buffer.selections[preview.slot]?.attachment : undefined
          }
          label={documentLabel(preview.slot, buffer.product)}
          language={language}
          close={() => setPreview(null)}
        />
      )}
      {(switchTo || reapplyConfirmation) && (
        <dialog
          ref={switchDialog}
          className="w-[650px]"
          aria-labelledby="switch-heading"
          onKeyDown={containDialogFocus}
          onCancel={cancelSwitch}
        >
          <h2 id="switch-heading">{a('switchTitle')}</h2>
          <p>
            {documentLabel('purchase', reapplyConfirmation?.product ?? buffer.product)[language]}
          </p>
          <p>{a('switchHint')}</p>
          <div className="actions">
            <button onClick={cancelSwitch}>{a('cancel')}</button>
            <button
              onClick={() => {
                if (reapplyConfirmation) applyLatest(reapplyConfirmation);
                else if (switchTo) switchProduct(switchTo);
              }}
            >
              {a('confirmSwitch')}
            </button>
          </div>
        </dialog>
      )}
    </section>
  );
}
