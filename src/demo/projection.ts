import { canReadApplication, reviewPermissions } from '../domain';
import { slots, type ActorId, type Application, type Dataset } from '../domain/model';
import { inspectionContext } from './operations/inspection';
import type { ApplicationSummary, ApplicationView } from './types';

export function project(data: Dataset, who: ActorId, application: Application): ApplicationView {
  const snapshot = application.submitted ?? application.workspace!.snapshot;
  const common = {
    id: application.id,
    product: application.product,
    status: application.status,
    sharedRevision: application.sharedRevision,
    snapshot,
    submittedAt: application.submittedAt,
    evidenceMonths: application.evidenceMonths,
    history: application.history,
    repayment: application.repayment,
    documents: slots.map(slot => {
      const file = data.files.find(file => file.id === snapshot.documents[slot]);
      return {
        slot,
        file: file
          ? { id: file.id, name: file.name, mime: file.mime, size: file.size, hash: file.hash }
          : null,
      };
    }),
  };
  return who === 'salma'
    ? {
        ...common,
        role: 'reviewer',
        inspectionContexts: Object.fromEntries(
          slots.map(slot => [slot, inspectionContext(data, who, application, slot)]),
        ) as Record<(typeof slots)[number], string | null>,
        rounds: application.rounds,
        assignment:
          data.identities.find(identity => identity.id === application.assignee)?.name ?? null,
        assignedToYou: application.assignee === who,
        permissions: reviewPermissions(who, application),
        assessments: application.assessments,
        checks: application.checks,
        notes: application.notes,
        activity: application.activity,
      }
    : {
        ...common,
        role: 'applicant',
        workspace: application.workspace,
        workspaceDocuments: slots.map(slot => {
          const file = data.files.find(
            file => file.id === application.workspace?.snapshot.documents[slot],
          );
          return {
            slot,
            file: file
              ? { id: file.id, name: file.name, mime: file.mime, size: file.size, hash: file.hash }
              : null,
          };
        }),
        rounds: application.rounds.map(round => ({
          id: round.id,
          requestedAt: round.requestedAt,
          baseline: round.baseline,
          response: round.response,
          targets: round.targets.map(target =>
            target.kind === 'field'
              ? { kind: target.kind, field: target.field, reason: target.reason }
              : { kind: target.kind, slot: target.slot, reason: target.reason },
          ),
        })),
      };
}

export function summaries(data: Dataset, who: ActorId): ApplicationSummary[] {
  return data.applications
    .filter(application => canReadApplication(who, application))
    .map(application => {
      const fields = (application.submitted ?? application.workspace!.snapshot).fields;
      return {
        id: application.id,
        product: application.product,
        status: application.status,
        fullName: fields.fullName,
        businessName: fields.businessName,
        amount: fields.amount,
        term: fields.term,
        submittedAt: application.submittedAt,
        nextAction:
          application.status === 'draft'
            ? ('inspectDraft' as const)
            : application.status === 'correctionsRequested'
              ? ('inspectCorrections' as const)
              : ('viewApplication' as const),
        ...(who === 'salma'
          ? {
              assignment:
                data.identities.find(identity => identity.id === application.assignee)?.name ??
                null,
              assignedToYou: application.assignee === who,
            }
          : {}),
      };
    })
    .sort(
      (a, b) =>
        (b.submittedAt ?? '').localeCompare(a.submittedAt ?? '') || a.id.localeCompare(b.id),
    );
}
