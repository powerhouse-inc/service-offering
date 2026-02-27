/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import { describe, it, expect } from "vitest";
import {
  utils,
  initialGlobalState,
  initialLocalState,
  multisigParticipationAgreementDocumentType,
  isMultisigParticipationAgreementDocument,
  assertIsMultisigParticipationAgreementDocument,
  isMultisigParticipationAgreementState,
  assertIsMultisigParticipationAgreementState,
} from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";
import { ZodError } from "zod";

describe("MultisigParticipationAgreement Document Model", () => {
  it("should create a new MultisigParticipationAgreement document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(
      multisigParticipationAgreementDocumentType,
    );
  });

  it("should create a new MultisigParticipationAgreement document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isMultisigParticipationAgreementDocument(document)).toBe(true);
    expect(isMultisigParticipationAgreementState(document.state)).toBe(true);
  });
  it("should reject a document that is not a MultisigParticipationAgreement document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(
        assertIsMultisigParticipationAgreementDocument(wrongDocumentType),
      ).toThrow();
      expect(isMultisigParticipationAgreementDocument(wrongDocumentType)).toBe(
        false,
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
    }
  });
  const wrongState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongState.state.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isMultisigParticipationAgreementState(wrongState.state)).toBe(false);
    expect(
      assertIsMultisigParticipationAgreementState(wrongState.state),
    ).toThrow();
    expect(isMultisigParticipationAgreementDocument(wrongState)).toBe(false);
    expect(
      assertIsMultisigParticipationAgreementDocument(wrongState),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isMultisigParticipationAgreementState(wrongInitialState.state)).toBe(
      false,
    );
    expect(
      assertIsMultisigParticipationAgreementState(wrongInitialState.state),
    ).toThrow();
    expect(isMultisigParticipationAgreementDocument(wrongInitialState)).toBe(
      false,
    );
    expect(
      assertIsMultisigParticipationAgreementDocument(wrongInitialState),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isMultisigParticipationAgreementDocument(missingIdInHeader)).toBe(
      false,
    );
    expect(
      assertIsMultisigParticipationAgreementDocument(missingIdInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isMultisigParticipationAgreementDocument(missingNameInHeader)).toBe(
      false,
    );
    expect(
      assertIsMultisigParticipationAgreementDocument(missingNameInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(
      isMultisigParticipationAgreementDocument(missingCreatedAtUtcIsoInHeader),
    ).toBe(false);
    expect(
      assertIsMultisigParticipationAgreementDocument(
        missingCreatedAtUtcIsoInHeader,
      ),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(
      isMultisigParticipationAgreementDocument(
        missingLastModifiedAtUtcIsoInHeader,
      ),
    ).toBe(false);
    expect(
      assertIsMultisigParticipationAgreementDocument(
        missingLastModifiedAtUtcIsoInHeader,
      ),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
