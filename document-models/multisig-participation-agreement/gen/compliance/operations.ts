import { type SignalDispatch } from "document-model";
import type {
  AddComplianceEventAction,
  AmendComplianceEventAction,
  MarkSlaBreachedAction,
} from "./actions.js";
import type { MultisigParticipationAgreementState } from "../types.js";

export interface MultisigParticipationAgreementComplianceOperations {
  addComplianceEventOperation: (
    state: MultisigParticipationAgreementState,
    action: AddComplianceEventAction,
    dispatch?: SignalDispatch,
  ) => void;
  amendComplianceEventOperation: (
    state: MultisigParticipationAgreementState,
    action: AmendComplianceEventAction,
    dispatch?: SignalDispatch,
  ) => void;
  markSlaBreachedOperation: (
    state: MultisigParticipationAgreementState,
    action: MarkSlaBreachedAction,
    dispatch?: SignalDispatch,
  ) => void;
}
