import { type SignalDispatch } from "document-model";
import type {
  InitializeMpaAction,
  SetActiveSignerAction,
  SetWalletAction,
  SetProcessDetailsAction,
  AddPolicyLinkAction,
  RemovePolicyLinkAction,
  AddAssociationSignerAction,
  RemoveAssociationSignerAction,
  SubmitForSignatureAction,
  RecordAssociationSignatureAction,
  RecordActiveSignerSignatureAction,
  TerminateVoluntaryAction,
  TerminateBreachAction,
  TerminateKeyCompromiseAction,
} from "./actions.js";
import type { MultisigParticipationAgreementState } from "../types.js";

export interface MultisigParticipationAgreementAgreementOperations {
  initializeMpaOperation: (
    state: MultisigParticipationAgreementState,
    action: InitializeMpaAction,
    dispatch?: SignalDispatch,
  ) => void;
  setActiveSignerOperation: (
    state: MultisigParticipationAgreementState,
    action: SetActiveSignerAction,
    dispatch?: SignalDispatch,
  ) => void;
  setWalletOperation: (
    state: MultisigParticipationAgreementState,
    action: SetWalletAction,
    dispatch?: SignalDispatch,
  ) => void;
  setProcessDetailsOperation: (
    state: MultisigParticipationAgreementState,
    action: SetProcessDetailsAction,
    dispatch?: SignalDispatch,
  ) => void;
  addPolicyLinkOperation: (
    state: MultisigParticipationAgreementState,
    action: AddPolicyLinkAction,
    dispatch?: SignalDispatch,
  ) => void;
  removePolicyLinkOperation: (
    state: MultisigParticipationAgreementState,
    action: RemovePolicyLinkAction,
    dispatch?: SignalDispatch,
  ) => void;
  addAssociationSignerOperation: (
    state: MultisigParticipationAgreementState,
    action: AddAssociationSignerAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeAssociationSignerOperation: (
    state: MultisigParticipationAgreementState,
    action: RemoveAssociationSignerAction,
    dispatch?: SignalDispatch,
  ) => void;
  submitForSignatureOperation: (
    state: MultisigParticipationAgreementState,
    action: SubmitForSignatureAction,
    dispatch?: SignalDispatch,
  ) => void;
  recordAssociationSignatureOperation: (
    state: MultisigParticipationAgreementState,
    action: RecordAssociationSignatureAction,
    dispatch?: SignalDispatch,
  ) => void;
  recordActiveSignerSignatureOperation: (
    state: MultisigParticipationAgreementState,
    action: RecordActiveSignerSignatureAction,
    dispatch?: SignalDispatch,
  ) => void;
  terminateVoluntaryOperation: (
    state: MultisigParticipationAgreementState,
    action: TerminateVoluntaryAction,
    dispatch?: SignalDispatch,
  ) => void;
  terminateBreachOperation: (
    state: MultisigParticipationAgreementState,
    action: TerminateBreachAction,
    dispatch?: SignalDispatch,
  ) => void;
  terminateKeyCompromiseOperation: (
    state: MultisigParticipationAgreementState,
    action: TerminateKeyCompromiseAction,
    dispatch?: SignalDispatch,
  ) => void;
}
