import type { Action } from "document-model";
import type {
  InitializeMpaInput,
  SetActiveSignerInput,
  SetWalletInput,
  SetProcessDetailsInput,
  AddPolicyLinkInput,
  RemovePolicyLinkInput,
  AddAssociationSignerInput,
  RemoveAssociationSignerInput,
  SubmitForSignatureInput,
  RecordAssociationSignatureInput,
  RecordActiveSignerSignatureInput,
  TerminateVoluntaryInput,
  TerminateBreachInput,
  TerminateKeyCompromiseInput,
} from "../types.js";

export type InitializeMpaAction = Action & {
  type: "INITIALIZE_MPA";
  input: InitializeMpaInput;
};
export type SetActiveSignerAction = Action & {
  type: "SET_ACTIVE_SIGNER";
  input: SetActiveSignerInput;
};
export type SetWalletAction = Action & {
  type: "SET_WALLET";
  input: SetWalletInput;
};
export type SetProcessDetailsAction = Action & {
  type: "SET_PROCESS_DETAILS";
  input: SetProcessDetailsInput;
};
export type AddPolicyLinkAction = Action & {
  type: "ADD_POLICY_LINK";
  input: AddPolicyLinkInput;
};
export type RemovePolicyLinkAction = Action & {
  type: "REMOVE_POLICY_LINK";
  input: RemovePolicyLinkInput;
};
export type AddAssociationSignerAction = Action & {
  type: "ADD_ASSOCIATION_SIGNER";
  input: AddAssociationSignerInput;
};
export type RemoveAssociationSignerAction = Action & {
  type: "REMOVE_ASSOCIATION_SIGNER";
  input: RemoveAssociationSignerInput;
};
export type SubmitForSignatureAction = Action & {
  type: "SUBMIT_FOR_SIGNATURE";
  input: SubmitForSignatureInput;
};
export type RecordAssociationSignatureAction = Action & {
  type: "RECORD_ASSOCIATION_SIGNATURE";
  input: RecordAssociationSignatureInput;
};
export type RecordActiveSignerSignatureAction = Action & {
  type: "RECORD_ACTIVE_SIGNER_SIGNATURE";
  input: RecordActiveSignerSignatureInput;
};
export type TerminateVoluntaryAction = Action & {
  type: "TERMINATE_VOLUNTARY";
  input: TerminateVoluntaryInput;
};
export type TerminateBreachAction = Action & {
  type: "TERMINATE_BREACH";
  input: TerminateBreachInput;
};
export type TerminateKeyCompromiseAction = Action & {
  type: "TERMINATE_KEY_COMPROMISE";
  input: TerminateKeyCompromiseInput;
};

export type MultisigParticipationAgreementAgreementAction =
  | InitializeMpaAction
  | SetActiveSignerAction
  | SetWalletAction
  | SetProcessDetailsAction
  | AddPolicyLinkAction
  | RemovePolicyLinkAction
  | AddAssociationSignerAction
  | RemoveAssociationSignerAction
  | SubmitForSignatureAction
  | RecordAssociationSignatureAction
  | RecordActiveSignerSignatureAction
  | TerminateVoluntaryAction
  | TerminateBreachAction
  | TerminateKeyCompromiseAction;
