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
  businessAnalysisDocumentType,
  isBusinessAnalysisDocument,
  assertIsBusinessAnalysisDocument,
  isBusinessAnalysisState,
  assertIsBusinessAnalysisState,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import { ZodError } from "zod";

describe("BusinessAnalysis Document Model", () => {
  it("should create a new BusinessAnalysis document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(businessAnalysisDocumentType);
  });

  it("should create a new BusinessAnalysis document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isBusinessAnalysisDocument(document)).toBe(true);
    expect(isBusinessAnalysisState(document.state)).toBe(true);
  });
  it("should reject a document that is not a BusinessAnalysis document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsBusinessAnalysisDocument(wrongDocumentType)).toThrow();
      expect(isBusinessAnalysisDocument(wrongDocumentType)).toBe(false);
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
    expect(isBusinessAnalysisState(wrongState.state)).toBe(false);
    expect(assertIsBusinessAnalysisState(wrongState.state)).toThrow();
    expect(isBusinessAnalysisDocument(wrongState)).toBe(false);
    expect(assertIsBusinessAnalysisDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isBusinessAnalysisState(wrongInitialState.state)).toBe(false);
    expect(assertIsBusinessAnalysisState(wrongInitialState.state)).toThrow();
    expect(isBusinessAnalysisDocument(wrongInitialState)).toBe(false);
    expect(assertIsBusinessAnalysisDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isBusinessAnalysisDocument(missingIdInHeader)).toBe(false);
    expect(assertIsBusinessAnalysisDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isBusinessAnalysisDocument(missingNameInHeader)).toBe(false);
    expect(assertIsBusinessAnalysisDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isBusinessAnalysisDocument(missingCreatedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsBusinessAnalysisDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(
      isBusinessAnalysisDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toBe(false);
    expect(
      assertIsBusinessAnalysisDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
