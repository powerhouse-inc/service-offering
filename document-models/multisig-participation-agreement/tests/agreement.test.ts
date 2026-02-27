import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isMultisigParticipationAgreementDocument,
  initializeMpa,
  setActiveSigner,
  setWallet,
  setProcessDetails,
  addPolicyLink,
  removePolicyLink,
  addAssociationSigner,
  removeAssociationSigner,
  submitForSignature,
  recordAssociationSignature,
  recordActiveSignerSignature,
  terminateVoluntary,
  terminateBreach,
  terminateKeyCompromise,
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
} from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";

describe("AgreementOperations", () => {
  it("should handle initializeMpa operation", () => {
    const document = utils.createDocument();
    const input = generateMock(InitializeMpaInputSchema());

    const updatedDocument = reducer(document, initializeMpa(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "INITIALIZE_MPA",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setActiveSigner operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetActiveSignerInputSchema());

    const updatedDocument = reducer(document, setActiveSigner(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_ACTIVE_SIGNER",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setWallet operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetWalletInputSchema());

    const updatedDocument = reducer(document, setWallet(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("SET_WALLET");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setProcessDetails operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetProcessDetailsInputSchema());

    const updatedDocument = reducer(document, setProcessDetails(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_PROCESS_DETAILS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addPolicyLink operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddPolicyLinkInputSchema());

    const updatedDocument = reducer(document, addPolicyLink(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_POLICY_LINK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removePolicyLink operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemovePolicyLinkInputSchema());

    const updatedDocument = reducer(document, removePolicyLink(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_POLICY_LINK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addAssociationSigner operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddAssociationSignerInputSchema());

    const updatedDocument = reducer(document, addAssociationSigner(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_ASSOCIATION_SIGNER",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeAssociationSigner operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveAssociationSignerInputSchema());

    const updatedDocument = reducer(document, removeAssociationSigner(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_ASSOCIATION_SIGNER",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle submitForSignature operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SubmitForSignatureInputSchema());

    const updatedDocument = reducer(document, submitForSignature(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SUBMIT_FOR_SIGNATURE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle recordAssociationSignature operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RecordAssociationSignatureInputSchema());

    const updatedDocument = reducer(
      document,
      recordAssociationSignature(input),
    );

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "RECORD_ASSOCIATION_SIGNATURE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle recordActiveSignerSignature operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RecordActiveSignerSignatureInputSchema());

    const updatedDocument = reducer(
      document,
      recordActiveSignerSignature(input),
    );

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "RECORD_ACTIVE_SIGNER_SIGNATURE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle terminateVoluntary operation", () => {
    const document = utils.createDocument();
    const input = generateMock(TerminateVoluntaryInputSchema());

    const updatedDocument = reducer(document, terminateVoluntary(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "TERMINATE_VOLUNTARY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle terminateBreach operation", () => {
    const document = utils.createDocument();
    const input = generateMock(TerminateBreachInputSchema());

    const updatedDocument = reducer(document, terminateBreach(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "TERMINATE_BREACH",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle terminateKeyCompromise operation", () => {
    const document = utils.createDocument();
    const input = generateMock(TerminateKeyCompromiseInputSchema());

    const updatedDocument = reducer(document, terminateKeyCompromise(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "TERMINATE_KEY_COMPROMISE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
