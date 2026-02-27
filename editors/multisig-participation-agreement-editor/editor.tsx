import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { useSelectedMultisigParticipationAgreementDocument } from "../../document-models/multisig-participation-agreement/hooks.js";
import { StatusBadge } from "./components/StatusBadge.js";
import { DraftPhase } from "./components/DraftPhase.js";
import { PendingSignaturePhase } from "./components/PendingSignaturePhase.js";
import { ActivePhase } from "./components/ActivePhase.js";
import { TerminatedPhase } from "./components/TerminatedPhase.js";

export default function Editor() {
  const [document, dispatch] =
    useSelectedMultisigParticipationAgreementDocument();
  const state = document.state.global;

  return (
    <div className="mx-auto max-w-4xl bg-gray-50 p-6">
      <DocumentToolbar />

      <div className="ph-default-styles space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {state.associationName
                ? `MPA — ${state.associationName}`
                : "Multisig Participation Agreement"}
            </h1>
            {state.activeSigner?.name && (
              <p className="mt-0.5 text-sm text-gray-500">
                Participant: {state.activeSigner.name}
              </p>
            )}
          </div>
          <StatusBadge status={state.status} />
        </div>

        <hr className="border-gray-200" />

        {/* Phase-specific content */}
        {(!state.status || state.status === "DRAFT") && (
          <DraftPhase state={state} dispatch={dispatch} />
        )}
        {state.status === "PENDING_SIGNATURE" && (
          <PendingSignaturePhase state={state} dispatch={dispatch} />
        )}
        {state.status === "ACTIVE" && (
          <ActivePhase state={state} dispatch={dispatch} />
        )}
        {state.status === "TERMINATED" && <TerminatedPhase state={state} />}
      </div>
    </div>
  );
}
