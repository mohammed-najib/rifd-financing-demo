import { z } from 'zod';
import { domainDate, parseWholeYER, products, submissionMonth, validateFields } from '../domain';
import {
  productIdSchema,
  slots,
  type ActorId,
  type Application,
  type Dataset,
  type Fields,
  type StoredFile,
} from '../domain/model';
import { createAssistance } from '../evidence-assistance/analysis/controller';
import { completedFinancialMonths } from '../evidence-assistance/analysis/financial';
import { evidenceDependencyKey } from '../evidence-assistance/analysis/record';
import type { AnalysisStorage } from '../evidence-assistance/analysis/storage';
import {
  evidenceTaskSlots,
  evidenceTargets,
  type EvidenceInput,
  type EvidenceTransport,
  type SelectedEvidence,
} from '../evidence-assistance/contract';
import { preparedSchema } from './operations/commands';
import {
  activeCorrection,
  correctionDocument,
  validateCorrectionFields,
} from './operations/corrections';
import { inspectionContext } from './operations/inspection';
import {
  hashBytes,
  matchesSavedContext,
  openSavedExample,
  savedExamples,
  type SavedSelection,
} from './saved-demonstrations';
import { DemoError } from './storage';
import type { Demo, PreparedAttachment, Result } from './types';

type Selection = { token: string; status: 'preparing' | 'ready' | 'failed'; attachmentId?: string };
type Preparation = {
  actor: ActorId;
  datasetId: string;
  file: StoredFile;
  product: Application['product'];
  reference: PreparedAttachment;
};

export type AssistanceRuntime = {
  read: () => Promise<Dataset>;
  attempt: <T>(run: () => Promise<T>) => Promise<Result<T>>;
  authority: (captured: number, who: ActorId, expectedDataset: string, data: Dataset) => void;
  permitted: (data: Dataset, who: ActorId, id: string) => Application;
  editable: (data: Dataset, who: ActorId, id: string) => Application;
  preparedFile: (
    who: ActorId,
    id: string,
    slot: string,
    reference: PreparedAttachment,
  ) => StoredFile;
  fileResult: (file: StoredFile | undefined) => {
    bytes: ArrayBuffer;
    name: string;
    mime: string;
    hash: string;
  };
  selections: Map<string, Selection>;
  preparations: Map<string, Preparation>;
  assistance: Set<ReturnType<typeof createAssistance>>;
  transport: EvidenceTransport | undefined;
  analysisStorage: AnalysisStorage;
  generation: () => number;
  sessionIdentity: () => ActorId | undefined;
  actor: () => ActorId;
};

export function createAssistanceOperations(runtime: AssistanceRuntime) {
  const {
    read,
    attempt,
    authority,
    permitted,
    editable,
    preparedFile,
    fileResult,
    selections,
    preparations,
    assistance,
    transport,
    analysisStorage,
    generation,
    sessionIdentity,
    actor,
  } = runtime;

  const createEvidenceAssistance: Demo['createEvidenceAssistance'] = input => {
    const selectedInput: EvidenceInput = structuredClone(input);
    const captured = generation();
    const who = sessionIdentity();
    const task = {
      applicationId: z.string().min(1),
      slot: z.enum(slots),
      fileId: z.string().nullable().optional(),
    };
    const schema = z.discriminatedUnion('action', [
      z
        .object({
          ...task,
          action: z.literal('check-document'),
          audience: z.literal('applicant'),
          context: z.enum(['draft', 'correction-workspace']),
          roundId: z.string().min(1).optional(),
          attachment: preparedSchema.optional(),
          declaredFinancial: z
            .object({ revenue: z.string(), expenses: z.string() })
            .strict()
            .optional(),
          declaredName: z.string().optional(),
          declaredBusiness: z
            .object({ businessName: z.string(), address: z.string(), operatingSince: z.string() })
            .strict()
            .optional(),
          declaredPurchase: z
            .object({ product: productIdSchema, explanation: z.string(), budget: z.string() })
            .strict()
            .optional(),
        })
        .strict(),
      z
        .object({
          ...task,
          action: z.literal('find-supporting-evidence'),
          audience: z.literal('reviewer'),
          context: z.literal('submitted'),
        })
        .strict(),
    ]);
    const authorize = (data: Dataset) => {
      const parsed = schema.safeParse(selectedInput);
      if (!parsed.success) throw new DemoError('validation');
      const command = parsed.data;
      if (!evidenceTaskSlots.includes(command.slot)) throw new DemoError('unavailable');
      if (
        command.action === 'check-document' &&
        ((command.slot !== 'financial' && command.declaredFinancial !== undefined) ||
          (command.slot !== 'identity' && command.declaredName !== undefined) ||
          (command.slot !== 'business' && command.declaredBusiness !== undefined) ||
          (command.slot !== 'purchase' && command.declaredPurchase !== undefined))
      )
        throw new DemoError('validation');
      if (!who) throw new DemoError('sessionExpired');
      authority(captured, who, data.meta.datasetId, data);
      if (command.action === 'find-supporting-evidence') {
        if (who !== 'salma') throw new DemoError('permissionDenied');
        const application = permitted(data, who, command.applicationId);
        const snapshot = application.submitted;
        const reviewContext = inspectionContext(data, who, application, command.slot);
        if (!snapshot || !reviewContext) throw new DemoError('unavailable');
        return {
          command,
          application,
          snapshot,
          workspace: null,
          round: null,
          correction: undefined,
          reviewContext,
        };
      }
      const application = editable(data, who, command.applicationId);
      if (!application.workspace) throw new DemoError('unavailable');
      const round =
        command.context === 'correction-workspace' && command.roundId
          ? activeCorrection(application, command.roundId)
          : null;
      if (
        (command.context === 'correction-workspace' && !round) ||
        (command.context === 'draft' && application.status !== 'draft')
      )
        throw new DemoError('unavailable');
      if (round) {
        correctionDocument(application, command.slot);
        if (
          command.declaredName !== undefined &&
          command.declaredName !== application.workspace.snapshot.fields.fullName &&
          !round.targets.some(target => target.kind === 'field' && target.field === 'fullName')
        )
          throw new DemoError('permissionDenied');
        for (const [field, value] of Object.entries(
          command.declaredFinancial ?? command.declaredBusiness ?? {},
        ))
          if (
            value !== application.workspace.snapshot.fields[field as keyof Fields] &&
            !round.targets.some(target => target.kind === 'field' && target.field === field)
          )
            throw new DemoError('permissionDenied');
        if (command.declaredPurchase) {
          if (command.declaredPurchase.product !== application.product)
            throw new DemoError('permissionDenied');
          for (const field of ['explanation', 'budget'] as const)
            if (
              command.declaredPurchase[field] !== application.workspace.snapshot.fields[field] &&
              !round.targets.some(target => target.kind === 'field' && target.field === field)
            )
              throw new DemoError('permissionDenied');
        }
      }
      const correction = round
        ? {
            targets: round.targets.map(target =>
              target.kind === 'field'
                ? { kind: target.kind, field: target.field, reason: target.reason }
                : { kind: target.kind, slot: target.slot, reason: target.reason },
            ),
            initialSubmissionMonth: application.submittedAt!.slice(0, 7),
          }
        : undefined;
      return {
        command,
        application,
        snapshot: application.workspace.snapshot,
        workspace: application.workspace,
        round,
        correction,
        reviewContext: undefined,
      };
    };
    const resolve = (): Promise<Result<SelectedEvidence>> =>
      attempt(async () => {
        const data = await read();
        const { command, application, snapshot, workspace, round, correction, reviewContext } =
          authorize(data);
        let file: StoredFile | undefined;
        const active =
          command.action === 'check-document'
            ? selections.get(`${who}/${application.id}/${command.slot}`)
            : undefined;
        if (command.action === 'check-document' && command.attachment) {
          if (
            snapshot.documents[command.slot] !== command.attachment.id &&
            (active?.status !== 'ready' || active.attachmentId !== command.attachment.id)
          )
            throw new DemoError('supersededSelection');
          file = preparedFile(who!, application.id, command.slot, command.attachment);
        } else {
          const id = snapshot.documents[command.slot];
          if (
            !id ||
            (command.fileId !== undefined && command.fileId !== id) ||
            (active && (active.status !== 'ready' || active.attachmentId !== id))
          )
            throw new DemoError('supersededSelection');
          file = data.files.find(
            file =>
              file.id === id && file.applicationId === application.id && file.slot === command.slot,
          );
        }
        if (!file) throw new DemoError('unavailable');
        const purchase = command.action === 'check-document' ? command.declaredPurchase : undefined;
        const product = purchase?.product ?? application.product;
        if (
          command.slot === 'purchase' &&
          product !== application.product &&
          !('attachment' in command && command.attachment)
        )
          throw new DemoError('supersededSelection');
        if (
          command.slot === 'purchase' &&
          command.action === 'check-document' &&
          command.attachment &&
          preparations.get(file.id)?.product !== product
        )
          throw new DemoError('supersededSelection');
        const fields = {
          ...snapshot.fields,
          ...(command.action === 'check-document'
            ? (command.declaredFinancial ??
              command.declaredBusiness ??
              (purchase
                ? { explanation: purchase.explanation, budget: purchase.budget }
                : command.declaredName !== undefined
                  ? { fullName: command.declaredName }
                  : {}))
            : {}),
        };
        const issues = validateFields(
          fields,
          products[product],
          application.submittedAt?.slice(0, 7) ?? submissionMonth,
        );
        const detail = (field: keyof Fields) => ({
          value: issues.some(issue => issue.field === field) ? null : fields[field],
          status: !fields[field].trim()
            ? ('missing' as const)
            : issues.some(issue => issue.field === field)
              ? ('invalid' as const)
              : ('valid' as const),
        });
        const budget = detail('budget');
        const initialSubmissionMonth = application.submittedAt?.slice(0, 7) ?? submissionMonth;
        const declaration: SelectedEvidence['declaration'] =
          command.slot === 'financial'
            ? {
                financial: {
                  initialSubmissionMonth,
                  expectedMonths: completedFinancialMonths(initialSubmissionMonth),
                  revenue: {
                    ...detail('revenue'),
                    value:
                      detail('revenue').status === 'valid'
                        ? String(parseWholeYER(fields.revenue))
                        : null,
                  },
                  expenses: {
                    ...detail('expenses'),
                    value:
                      detail('expenses').status === 'valid'
                        ? String(parseWholeYER(fields.expenses))
                        : null,
                  },
                },
              }
            : command.slot === 'purchase'
              ? {
                  purchase: {
                    product,
                    explanation: detail('explanation'),
                    budget: {
                      ...budget,
                      value:
                        budget.status === 'valid' ? String(parseWholeYER(fields.budget)) : null,
                    },
                  },
                }
              : command.slot === 'business'
                ? {
                    business: {
                      businessName: detail('businessName'),
                      address: detail('address'),
                      operatingSince: detail('operatingSince'),
                    },
                  }
                : { fullName: detail('fullName').value, status: detail('fullName').status };
        const source = { id: file.id, ...fileResult(file) };
        const actualHash = await hashBytes(source.bytes);
        const latest = await read();
        const fresh = authorize(latest);
        if (
          (command.slot === 'purchase' && fresh.application.product !== application.product) ||
          evidenceTargets(command.slot).some(
            target => fresh.snapshot.fields[target.field] !== snapshot.fields[target.field],
          ) ||
          fresh.snapshot.documents[command.slot] !== snapshot.documents[command.slot] ||
          fresh.reviewContext !== reviewContext ||
          JSON.stringify(fresh.correction) !== JSON.stringify(correction) ||
          (command.action === 'check-document' &&
            selections.get(`${who}/${application.id}/${command.slot}`)?.token !== active?.token)
        )
          throw new DemoError('staleWorkspace');
        if (actualHash !== file.hash) throw new DemoError('damaged');
        const selection: SelectedEvidence = {
          source,
          declaration,
          ...(correction ? { correction } : {}),
          binding: {
            datasetId: data.meta.datasetId,
            applicationId: application.id,
            slot: command.slot,
            audience: command.audience,
            context: command.context,
            contextId: round?.id ?? command.context,
            roundId: round?.id ?? null,
            authorityGeneration: captured,
            sharedRevision: application.sharedRevision,
            workspaceRevision: workspace?.revision ?? 0,
            durable:
              (!workspace || !!workspace.savedAt) &&
              product === application.product &&
              snapshot.documents[command.slot] === file.id &&
              evidenceTargets(command.slot).every(
                target => fields[target.field] === snapshot.fields[target.field],
              ),
            ...(reviewContext ? { reviewContext } : {}),
            dependencyKey: '',
          },
        };
        selection.binding.dependencyKey = evidenceDependencyKey(selection);
        return selection;
      });
    const authorizeClear = (): Promise<Result<SelectedEvidence['binding']>> =>
      attempt(async () => {
        const data = await read();
        const { command, application, workspace, round, reviewContext } = authorize(data);
        return {
          datasetId: data.meta.datasetId,
          applicationId: application.id,
          slot: command.slot,
          audience: command.audience,
          context: command.context,
          contextId: round?.id ?? command.context,
          roundId: round?.id ?? null,
          authorityGeneration: captured,
          sharedRevision: application.sharedRevision,
          workspaceRevision: workspace?.revision ?? 0,
          durable: false,
          dependencyKey: '',
          ...(reviewContext ? { reviewContext } : {}),
        };
      });
    const handle = createAssistance(resolve, transport, analysisStorage, authorizeClear, () => {
      assistance.delete(handle);
    });
    assistance.add(handle);
    return handle.api;
  };

  const listSavedDemonstrations: Demo['listSavedDemonstrations'] = async () => ({
    ok: true,
    value: savedExamples(),
  });

  const selectSavedDemonstration: Demo['selectSavedDemonstration'] = input =>
    attempt(async () => {
      const selection: SavedSelection = structuredClone(input);
      const current = selection.current;
      const captured = generation();
      const who = current ? actor() : null;
      const resolve = (data: Dataset) => {
        if (!current || !who) throw new DemoError('unavailable');
        authority(captured, who, data.meta.datasetId, data);
        const application = permitted(data, who, current.applicationId);
        const snapshot =
          who !== 'salma' && application.workspace
            ? application.workspace.snapshot
            : application.submitted;
        if (!snapshot) throw new DemoError('unavailable');
        let file: StoredFile | undefined;
        if (current.attachment) {
          if (who === 'salma' || application.owner !== who) throw new DemoError('unavailable');
          if (application.status !== 'draft') correctionDocument(application, current.slot);
          const selected = selections.get(`${who}/${application.id}/${current.slot}`);
          if (selected?.status !== 'ready' || selected.attachmentId !== current.attachment.id)
            throw new DemoError('supersededSelection');
          file = preparedFile(who, application.id, current.slot, current.attachment);
        } else {
          const id = snapshot.documents[current.slot];
          if (current.fileId && current.fileId !== id) throw new DemoError('unavailable');
          const selected = selections.get(`${who}/${application.id}/${current.slot}`);
          const sourceCurrent =
            current.fileId !== null &&
            (!selected || (selected.status === 'ready' && selected.attachmentId === id));
          if (sourceCurrent)
            file = data.files.find(
              file =>
                file.id === id &&
                file.applicationId === application.id &&
                file.slot === current.slot,
            );
        }
        const canEdit =
          who !== 'salma' &&
          !!application.workspace &&
          ['draft', 'correctionsRequested'].includes(application.status);
        if (canEdit && current.fields && application.status === 'correctionsRequested')
          validateCorrectionFields(application, current.fields);
        const fields = canEdit && current.fields ? current.fields : snapshot.fields;
        const product =
          canEdit && application.status === 'draft' && current.product
            ? current.product
            : application.product;
        const initialMonth = (application.submittedAt ?? domainDate).slice(0, 7);
        const fingerprint = JSON.stringify([
          application.status,
          snapshot,
          application.rounds,
          application.assignee,
          application.activity,
          file?.id,
          file?.hash,
          file?.size,
          fields,
          product,
        ]);
        return {
          file,
          fields,
          product,
          months: application.evidenceMonths,
          initialMonth,
          fingerprint,
        };
      };
      const observed = current ? resolve(await read()) : null;
      const opened = await openSavedExample(selection.exampleId);
      if (!opened) throw new DemoError('unavailable');
      const sourceMatches =
        observed?.file && (await hashBytes(observed.file.bytes)) === opened.capture.source.sha256;
      if (current) {
        const latest = resolve(await read());
        if (
          observed?.fingerprint === latest.fingerprint &&
          sourceMatches &&
          matchesSavedContext(
            opened.capture,
            current,
            latest.fields,
            latest.product,
            latest.months,
            latest.initialMonth,
          )
        )
          opened.attachment = 'current-document';
      }
      return opened;
    });

  return { createEvidenceAssistance, listSavedDemonstrations, selectSavedDemonstration };
}
