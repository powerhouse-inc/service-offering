import type { PHDocument, PHBaseState } from "document-model";
import type { MultisigParticipationAgreementAction } from "./actions.js";
import type { MultisigParticipationAgreementState as MultisigParticipationAgreementGlobalState } from "./schema/types.js";

type MultisigParticipationAgreementLocalState = Record<PropertyKey, never>;

type MultisigParticipationAgreementPHState = PHBaseState & {
  global: MultisigParticipationAgreementGlobalState;
  local: MultisigParticipationAgreementLocalState;
};
type MultisigParticipationAgreementDocument =
  PHDocument<MultisigParticipationAgreementPHState>;

export * from "./schema/types.js";

export type {
  MultisigParticipationAgreementGlobalState,
  MultisigParticipationAgreementLocalState,
  MultisigParticipationAgreementPHState,
  MultisigParticipationAgreementAction,
  MultisigParticipationAgreementDocument,
};
