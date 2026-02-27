import type { Action } from "document-model";
import type {
  AddComplianceEventInput,
  AmendComplianceEventInput,
  MarkSlaBreachedInput,
} from "../types.js";

export type AddComplianceEventAction = Action & {
  type: "ADD_COMPLIANCE_EVENT";
  input: AddComplianceEventInput;
};
export type AmendComplianceEventAction = Action & {
  type: "AMEND_COMPLIANCE_EVENT";
  input: AmendComplianceEventInput;
};
export type MarkSlaBreachedAction = Action & {
  type: "MARK_SLA_BREACHED";
  input: MarkSlaBreachedInput;
};

export type MultisigParticipationAgreementComplianceAction =
  | AddComplianceEventAction
  | AmendComplianceEventAction
  | MarkSlaBreachedAction;
