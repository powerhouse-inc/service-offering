import { createAction } from "document-model/core";
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
} from "../schema/zod.js";
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

export const initializeMpa = (input: InitializeMpaInput) =>
  createAction<InitializeMpaAction>(
    "INITIALIZE_MPA",
    { ...input },
    undefined,
    InitializeMpaInputSchema,
    "global",
  );

export const setActiveSigner = (input: SetActiveSignerInput) =>
  createAction<SetActiveSignerAction>(
    "SET_ACTIVE_SIGNER",
    { ...input },
    undefined,
    SetActiveSignerInputSchema,
    "global",
  );

export const setWallet = (input: SetWalletInput) =>
  createAction<SetWalletAction>(
    "SET_WALLET",
    { ...input },
    undefined,
    SetWalletInputSchema,
    "global",
  );

export const setProcessDetails = (input: SetProcessDetailsInput) =>
  createAction<SetProcessDetailsAction>(
    "SET_PROCESS_DETAILS",
    { ...input },
    undefined,
    SetProcessDetailsInputSchema,
    "global",
  );

export const addPolicyLink = (input: AddPolicyLinkInput) =>
  createAction<AddPolicyLinkAction>(
    "ADD_POLICY_LINK",
    { ...input },
    undefined,
    AddPolicyLinkInputSchema,
    "global",
  );

export const removePolicyLink = (input: RemovePolicyLinkInput) =>
  createAction<RemovePolicyLinkAction>(
    "REMOVE_POLICY_LINK",
    { ...input },
    undefined,
    RemovePolicyLinkInputSchema,
    "global",
  );

export const addAssociationSigner = (input: AddAssociationSignerInput) =>
  createAction<AddAssociationSignerAction>(
    "ADD_ASSOCIATION_SIGNER",
    { ...input },
    undefined,
    AddAssociationSignerInputSchema,
    "global",
  );

export const removeAssociationSigner = (input: RemoveAssociationSignerInput) =>
  createAction<RemoveAssociationSignerAction>(
    "REMOVE_ASSOCIATION_SIGNER",
    { ...input },
    undefined,
    RemoveAssociationSignerInputSchema,
    "global",
  );

export const submitForSignature = (input: SubmitForSignatureInput) =>
  createAction<SubmitForSignatureAction>(
    "SUBMIT_FOR_SIGNATURE",
    { ...input },
    undefined,
    SubmitForSignatureInputSchema,
    "global",
  );

export const recordAssociationSignature = (
  input: RecordAssociationSignatureInput,
) =>
  createAction<RecordAssociationSignatureAction>(
    "RECORD_ASSOCIATION_SIGNATURE",
    { ...input },
    undefined,
    RecordAssociationSignatureInputSchema,
    "global",
  );

export const recordActiveSignerSignature = (
  input: RecordActiveSignerSignatureInput,
) =>
  createAction<RecordActiveSignerSignatureAction>(
    "RECORD_ACTIVE_SIGNER_SIGNATURE",
    { ...input },
    undefined,
    RecordActiveSignerSignatureInputSchema,
    "global",
  );

export const terminateVoluntary = (input: TerminateVoluntaryInput) =>
  createAction<TerminateVoluntaryAction>(
    "TERMINATE_VOLUNTARY",
    { ...input },
    undefined,
    TerminateVoluntaryInputSchema,
    "global",
  );

export const terminateBreach = (input: TerminateBreachInput) =>
  createAction<TerminateBreachAction>(
    "TERMINATE_BREACH",
    { ...input },
    undefined,
    TerminateBreachInputSchema,
    "global",
  );

export const terminateKeyCompromise = (input: TerminateKeyCompromiseInput) =>
  createAction<TerminateKeyCompromiseAction>(
    "TERMINATE_KEY_COMPROMISE",
    { ...input },
    undefined,
    TerminateKeyCompromiseInputSchema,
    "global",
  );
