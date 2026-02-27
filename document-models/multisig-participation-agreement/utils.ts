import type { DocumentModelUtils } from "document-model";
import type { MultisigParticipationAgreementPHState } from "./gen/types.js";
import { utils as genUtils } from "./gen/utils.js";
import * as customUtils from "./src/utils.js";

/** Utils for the MultisigParticipationAgreement document model */
export const utils = {
  ...genUtils,
  ...customUtils,
} satisfies DocumentModelUtils<MultisigParticipationAgreementPHState>;
