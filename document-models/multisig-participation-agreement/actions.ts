import { baseActions } from "document-model";
import { agreementActions, complianceActions } from "./gen/creators.js";

/** Actions for the MultisigParticipationAgreement document model */

export const actions = {
  ...baseActions,
  ...agreementActions,
  ...complianceActions,
};
