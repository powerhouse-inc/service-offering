import {
  AgreementTerminatedError,
  EventAlreadySupersededError,
  EventNotFoundError,
} from "../../gen/compliance/error.js";
import type { MultisigParticipationAgreementComplianceOperations } from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";

export const multisigParticipationAgreementComplianceOperations: MultisigParticipationAgreementComplianceOperations =
  {
    addComplianceEventOperation(state, action) {
      if (state.status === "TERMINATED") {
        throw new AgreementTerminatedError(
          "Cannot add compliance events to a terminated MPA",
        );
      }
      const slaDeadlineAt = action.input.slaDeadlineHours
        ? new Date(
            new Date(action.input.occurredAt).getTime() +
              action.input.slaDeadlineHours * 3600000,
          ).toISOString()
        : null;
      state.complianceEvents.push({
        id: action.input.id,
        type: action.input.type as any,
        occurredAt: action.input.occurredAt,
        enteredAt: action.input.enteredAt,
        enteredBy: action.input.enteredBy || null,
        description: action.input.description || null,
        slaDeadlineHours: action.input.slaDeadlineHours || null,
        slaDeadlineAt,
        slaBreached: false,
        supersededById: null,
        supersedes: null,
        amendmentReason: null,
      });
    },

    amendComplianceEventOperation(state, action) {
      const original = state.complianceEvents.find(
        (e) => e.id === action.input.supersedes,
      );
      if (!original) {
        throw new EventNotFoundError(
          `Compliance event with id ${action.input.supersedes} not found`,
        );
      }
      if (original.supersededById) {
        throw new EventAlreadySupersededError(
          `Compliance event ${action.input.supersedes} has already been superseded`,
        );
      }
      original.supersededById = action.input.newEventId;
      const slaDeadlineAt = action.input.slaDeadlineHours
        ? new Date(
            new Date(action.input.occurredAt).getTime() +
              action.input.slaDeadlineHours * 3600000,
          ).toISOString()
        : null;
      state.complianceEvents.push({
        id: action.input.newEventId,
        type: action.input.type as any,
        occurredAt: action.input.occurredAt,
        enteredAt: action.input.enteredAt,
        enteredBy: action.input.enteredBy || null,
        description: action.input.description || null,
        slaDeadlineHours: action.input.slaDeadlineHours || null,
        slaDeadlineAt,
        slaBreached: false,
        supersededById: null,
        supersedes: action.input.supersedes,
        amendmentReason: action.input.amendmentReason,
      });
    },

    markSlaBreachedOperation(state, action) {
      const event = state.complianceEvents.find(
        (e) => e.id === action.input.eventId,
      );
      if (!event) {
        throw new EventNotFoundError(
          `Compliance event with id ${action.input.eventId} not found`,
        );
      }
      event.slaBreached = true;
    },
  };
