// TODO: remove eslint-disable rules once refactor is done
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { StateReducer } from "document-model";
import { isDocumentAction, createReducer } from "document-model/core";
import type { MultisigParticipationAgreementPHState } from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";

import { multisigParticipationAgreementAgreementOperations } from "../src/reducers/agreement.js";
import { multisigParticipationAgreementComplianceOperations } from "../src/reducers/compliance.js";

import {
  InitializeMpaInputSchema,
  SetActiveSignerInputSchema,
  SetWalletInputSchema,
  SetProcessDetailsInputSchema,
  AddPolicyLinkInputSchema,
  RemovePolicyLinkInputSchema,
  AddAssociationSignerInputSchema,
  RemoveAssociationSignerInputSchema,
  SubmitForSignatureInputSchema,
  RecordAssociationSignatureInputSchema,
  RecordActiveSignerSignatureInputSchema,
  TerminateVoluntaryInputSchema,
  TerminateBreachInputSchema,
  TerminateKeyCompromiseInputSchema,
  AddComplianceEventInputSchema,
  AmendComplianceEventInputSchema,
  MarkSlaBreachedInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<MultisigParticipationAgreementPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "INITIALIZE_MPA": {
      InitializeMpaInputSchema().parse(action.input);

      multisigParticipationAgreementAgreementOperations.initializeMpaOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_ACTIVE_SIGNER": {
      SetActiveSignerInputSchema().parse(action.input);

      multisigParticipationAgreementAgreementOperations.setActiveSignerOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_WALLET": {
      SetWalletInputSchema().parse(action.input);

      multisigParticipationAgreementAgreementOperations.setWalletOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_PROCESS_DETAILS": {
      SetProcessDetailsInputSchema().parse(action.input);

      multisigParticipationAgreementAgreementOperations.setProcessDetailsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_POLICY_LINK": {
      AddPolicyLinkInputSchema().parse(action.input);

      multisigParticipationAgreementAgreementOperations.addPolicyLinkOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_POLICY_LINK": {
      RemovePolicyLinkInputSchema().parse(action.input);

      multisigParticipationAgreementAgreementOperations.removePolicyLinkOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_ASSOCIATION_SIGNER": {
      AddAssociationSignerInputSchema().parse(action.input);

      multisigParticipationAgreementAgreementOperations.addAssociationSignerOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_ASSOCIATION_SIGNER": {
      RemoveAssociationSignerInputSchema().parse(action.input);

      multisigParticipationAgreementAgreementOperations.removeAssociationSignerOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SUBMIT_FOR_SIGNATURE": {
      SubmitForSignatureInputSchema().parse(action.input);

      multisigParticipationAgreementAgreementOperations.submitForSignatureOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "RECORD_ASSOCIATION_SIGNATURE": {
      RecordAssociationSignatureInputSchema().parse(action.input);

      multisigParticipationAgreementAgreementOperations.recordAssociationSignatureOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "RECORD_ACTIVE_SIGNER_SIGNATURE": {
      RecordActiveSignerSignatureInputSchema().parse(action.input);

      multisigParticipationAgreementAgreementOperations.recordActiveSignerSignatureOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "TERMINATE_VOLUNTARY": {
      TerminateVoluntaryInputSchema().parse(action.input);

      multisigParticipationAgreementAgreementOperations.terminateVoluntaryOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "TERMINATE_BREACH": {
      TerminateBreachInputSchema().parse(action.input);

      multisigParticipationAgreementAgreementOperations.terminateBreachOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "TERMINATE_KEY_COMPROMISE": {
      TerminateKeyCompromiseInputSchema().parse(action.input);

      multisigParticipationAgreementAgreementOperations.terminateKeyCompromiseOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_COMPLIANCE_EVENT": {
      AddComplianceEventInputSchema().parse(action.input);

      multisigParticipationAgreementComplianceOperations.addComplianceEventOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "AMEND_COMPLIANCE_EVENT": {
      AmendComplianceEventInputSchema().parse(action.input);

      multisigParticipationAgreementComplianceOperations.amendComplianceEventOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_SLA_BREACHED": {
      MarkSlaBreachedInputSchema().parse(action.input);

      multisigParticipationAgreementComplianceOperations.markSlaBreachedOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer =
  createReducer<MultisigParticipationAgreementPHState>(stateReducer);
