import type { MultisigParticipationAgreementState } from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";
import { SectionCard } from "./SectionCard.js";

interface TerminatedPhaseProps {
  state: MultisigParticipationAgreementState;
}

export function TerminatedPhase({ state }: TerminatedPhaseProps) {
  const slaBreachedCount = state.complianceEvents.filter(
    (e) => e.slaBreached,
  ).length;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-4">
        <h3 className="font-semibold text-red-800">Agreement Terminated</h3>
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-red-700">
          <div>
            <span className="font-medium">Date: </span>
            {state.terminationDate
              ? new Date(state.terminationDate).toLocaleDateString()
              : "—"}
          </div>
          {state.terminationReason && (
            <div className="col-span-2">
              <span className="font-medium">Reason: </span>
              {state.terminationReason}
            </div>
          )}
        </div>
      </div>

      <SectionCard title="Agreement Summary">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Association
            </p>
            <p className="mt-1 font-medium text-gray-900">
              {state.associationName ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Active Signer
            </p>
            <p className="mt-1 text-gray-900">
              {state.activeSigner?.name ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Effective Date
            </p>
            <p className="mt-1 text-gray-900">
              {state.effectiveDate
                ? new Date(state.effectiveDate).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Template Version
            </p>
            <p className="mt-1 text-gray-900">{state.templateVersion ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Compliance Events
            </p>
            <p className="mt-1 text-gray-900">
              {state.complianceEvents.length} total
              {slaBreachedCount > 0 && (
                <span className="ml-2 text-red-600">
                  ({slaBreachedCount} SLA breached)
                </span>
              )}
            </p>
          </div>
        </div>
      </SectionCard>

      {state.complianceEvents.length > 0 && (
        <SectionCard title="Compliance History">
          <div className="space-y-2">
            {state.complianceEvents.map((event) => (
              <div
                key={event.id}
                className={`flex items-center justify-between rounded px-3 py-2 text-sm ${
                  event.supersededById
                    ? "bg-gray-50 text-gray-400 line-through"
                    : event.slaBreached
                      ? "bg-red-50 text-red-800"
                      : "bg-gray-50 text-gray-700"
                }`}
              >
                <span>
                  {event.type.replace(/_/g, " ")}
                  {event.supersedes && (
                    <span className="ml-2 text-xs font-medium text-blue-600">
                      (amendment)
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(event.occurredAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
