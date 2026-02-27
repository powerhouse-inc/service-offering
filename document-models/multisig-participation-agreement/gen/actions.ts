import type { MultisigParticipationAgreementAgreementAction } from "./agreement/actions.js";
import type { MultisigParticipationAgreementComplianceAction } from "./compliance/actions.js";

export * from "./agreement/actions.js";
export * from "./compliance/actions.js";

export type MultisigParticipationAgreementAction =
  | MultisigParticipationAgreementAgreementAction
  | MultisigParticipationAgreementComplianceAction;
