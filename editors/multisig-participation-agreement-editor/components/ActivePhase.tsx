import { useState } from "react";
import { generateId } from "document-model/core";
import type {
  MultisigParticipationAgreementState,
  ComplianceEventType,
} from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { MultisigParticipationAgreementAction } from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";
import {
  terminateVoluntary,
  terminateBreach,
  terminateKeyCompromise,
} from "../../../document-models/multisig-participation-agreement/gen/agreement/creators.js";
import {
  addComplianceEvent,
  amendComplianceEvent,
  markSlaBreached,
} from "../../../document-models/multisig-participation-agreement/gen/compliance/creators.js";
import { SectionCard } from "./SectionCard.js";

interface ActivePhaseProps {
  state: MultisigParticipationAgreementState;
  dispatch: DocumentDispatch<MultisigParticipationAgreementAction>;
}

type TerminationType = "voluntary" | "breach" | "key_compromise";

const COMPLIANCE_EVENT_TYPES: ComplianceEventType[] = [
  "UNAVAILABILITY_NOTICE",
  "SIGNATURE_REQUEST_RESPONSE",
  "AML_KYC_REQUEST",
  "AML_KYC_RESPONSE",
  "CONFLICT_OF_INTEREST_DISCLOSURE",
  "COORDINATION_RESPONSE",
  "DISPUTE_RESOLUTION",
  "KEY_COMPROMISE_REPORTED",
  "KEY_COMPROMISE_REPLACEMENT_COMPLETED",
];

export function ActivePhase({ state, dispatch }: ActivePhaseProps) {
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminationType, setTerminationType] =
    useState<TerminationType>("voluntary");
  const [terminationReason, setTerminationReason] = useState("");
  const [terminationDate, setTerminationDate] = useState(
    new Date().toISOString().substring(0, 10),
  );

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventType, setEventType] = useState<ComplianceEventType>(
    "UNAVAILABILITY_NOTICE",
  );
  const [eventDescription, setEventDescription] = useState("");
  const [eventOccurredAt, setEventOccurredAt] = useState(
    new Date().toISOString().substring(0, 10),
  );
  const [eventSlaHours, setEventSlaHours] = useState("");

  const [amendingId, setAmendingId] = useState<string | null>(null);
  const [amendReason, setAmendReason] = useState("");
  const [amendDescription, setAmendDescription] = useState("");
  const [amendEventType, setAmendEventType] = useState<ComplianceEventType>(
    "UNAVAILABILITY_NOTICE",
  );

  function handleTerminate() {
    const dateIso = new Date(terminationDate).toISOString();
    if (terminationType === "voluntary") {
      dispatch(
        terminateVoluntary({
          terminationDate: dateIso,
          terminationReason: terminationReason || undefined,
        }),
      );
    } else if (terminationType === "breach") {
      if (!terminationReason) return;
      dispatch(
        terminateBreach({
          terminationDate: dateIso,
          terminationReason,
        }),
      );
    } else {
      dispatch(terminateKeyCompromise({ terminationDate: dateIso }));
    }
    setShowTerminateModal(false);
  }

  function handleAddEvent() {
    const id = generateId();
    const now = new Date().toISOString();
    dispatch(
      addComplianceEvent({
        id,
        type: eventType,
        occurredAt: new Date(eventOccurredAt).toISOString(),
        enteredAt: now,
        description: eventDescription || undefined,
        slaDeadlineHours: eventSlaHours ? parseInt(eventSlaHours) : undefined,
      }),
    );
    setShowAddEvent(false);
    setEventDescription("");
    setEventSlaHours("");
  }

  function handleAmend(originalId: string) {
    const newId = generateId();
    const now = new Date().toISOString();
    dispatch(
      amendComplianceEvent({
        supersedes: originalId,
        newEventId: newId,
        type: amendEventType,
        occurredAt: now,
        enteredAt: now,
        amendmentReason: amendReason,
        description: amendDescription || undefined,
      }),
    );
    setAmendingId(null);
    setAmendReason("");
    setAmendDescription("");
  }

  const activeEvents = state.complianceEvents.filter((e) => !e.supersededById);

  return (
    <div className="space-y-6">
      {/* Agreement Summary */}
      <SectionCard title="Agreement Summary">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Active Signer
            </p>
            <p className="mt-1 font-medium text-gray-900">
              {state.activeSigner?.name ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Effective Date
            </p>
            <p className="mt-1 font-medium text-gray-900">
              {state.effectiveDate
                ? new Date(state.effectiveDate).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Wallet
            </p>
            <p className="mt-1 font-medium text-gray-900">
              {state.wallet
                ? `${state.wallet.decisionQuorum}/${state.wallet.numberOfKeys} on ${state.wallet.signaturePlatform}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Communication Channel
            </p>
            <p className="mt-1 text-gray-900">
              {state.communicationChannel ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Unavailability Threshold
            </p>
            <p className="mt-1 text-gray-900">
              {state.unavailabilityThresholdHours
                ? `${state.unavailabilityThresholdHours}h`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Association Signers
            </p>
            <p className="mt-1 text-gray-900">
              {state.associationSigners.length}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Compliance Events */}
      <SectionCard title="Compliance Events">
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowAddEvent(!showAddEvent)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showAddEvent ? "Cancel" : "Add Event"}
          </button>
        </div>

        {showAddEvent && (
          <div className="mb-4 space-y-3 rounded-md border border-blue-100 bg-blue-50 p-4">
            <h4 className="text-sm font-semibold text-blue-800">
              New Compliance Event
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600">Type *</label>
                <select
                  value={eventType}
                  onChange={(e) =>
                    setEventType(e.target.value as ComplianceEventType)
                  }
                  className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {COMPLIANCE_EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600">
                  Occurred At *
                </label>
                <input
                  type="date"
                  value={eventOccurredAt}
                  onChange={(e) => setEventOccurredAt(e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">
                  SLA Deadline (hours)
                </label>
                <input
                  type="number"
                  min={1}
                  value={eventSlaHours}
                  onChange={(e) => setEventSlaHours(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">
                  Description
                </label>
                <input
                  type="text"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Optional notes"
                  className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleAddEvent}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save Event
            </button>
          </div>
        )}

        {activeEvents.length === 0 ? (
          <p className="text-sm text-gray-400">
            No compliance events recorded.
          </p>
        ) : (
          <div className="space-y-3">
            {activeEvents.map((event) => (
              <div
                key={event.id}
                className={`rounded-md border p-4 ${
                  event.slaBreached
                    ? "border-red-200 bg-red-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {event.type.replace(/_/g, " ")}
                      </span>
                      {event.slaBreached && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          SLA Breached
                        </span>
                      )}
                      {event.supersedes && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Amendment
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Occurred:{" "}
                      {new Date(event.occurredAt).toLocaleDateString()}
                      {event.slaDeadlineAt && (
                        <>
                          {" "}
                          · SLA:{" "}
                          {new Date(event.slaDeadlineAt).toLocaleDateString()}
                        </>
                      )}
                    </p>
                    {event.description && (
                      <p className="text-xs text-gray-600">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!event.slaBreached && event.slaDeadlineAt && (
                      <button
                        onClick={() =>
                          dispatch(markSlaBreached({ eventId: event.id }))
                        }
                        className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                      >
                        Mark SLA Breached
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setAmendingId(amendingId === event.id ? null : event.id)
                      }
                      className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                    >
                      Amend
                    </button>
                  </div>
                </div>

                {amendingId === event.id && (
                  <div className="mt-3 space-y-3 rounded border border-blue-100 bg-blue-50 p-3">
                    <h5 className="text-xs font-semibold text-blue-800">
                      Amend Event
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600">
                          New Type *
                        </label>
                        <select
                          value={amendEventType}
                          onChange={(e) =>
                            setAmendEventType(
                              e.target.value as ComplianceEventType,
                            )
                          }
                          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                        >
                          {COMPLIANCE_EVENT_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600">
                          Amendment Reason *
                        </label>
                        <input
                          type="text"
                          value={amendReason}
                          onChange={(e) => setAmendReason(e.target.value)}
                          placeholder="Why amending?"
                          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600">
                          New Description
                        </label>
                        <input
                          type="text"
                          value={amendDescription}
                          onChange={(e) => setAmendDescription(e.target.value)}
                          placeholder="Updated notes"
                          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleAmend(event.id)}
                      disabled={!amendReason}
                      className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Submit Amendment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Terminate */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowTerminateModal(true)}
          className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Terminate Agreement
        </button>
      </div>

      {showTerminateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Terminate Agreement
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This action is irreversible.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Termination Type
                </label>
                <select
                  value={terminationType}
                  onChange={(e) =>
                    setTerminationType(e.target.value as TerminationType)
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="voluntary">Voluntary</option>
                  <option value="breach">Breach</option>
                  <option value="key_compromise">Key Compromise</option>
                </select>
              </div>

              {terminationType !== "key_compromise" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reason{terminationType === "breach" ? " *" : ""}
                  </label>
                  <textarea
                    value={terminationReason}
                    onChange={(e) => setTerminationReason(e.target.value)}
                    rows={3}
                    placeholder="Describe the reason for termination"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Termination Date
                </label>
                <input
                  type="date"
                  value={terminationDate}
                  onChange={(e) => setTerminationDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowTerminateModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTerminate}
                disabled={terminationType === "breach" && !terminationReason}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
