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
  workBreakdownDocumentType,
  isWorkBreakdownDocument,
  assertIsWorkBreakdownDocument,
  isWorkBreakdownState,
  assertIsWorkBreakdownState,
} from "@powerhousedao/service-offering/document-models/work-breakdown";
import { ZodError } from "zod";

describe("WorkBreakdown Document Model", () => {
  it("should create a new WorkBreakdown document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(workBreakdownDocumentType);
  });

  it("should create a new WorkBreakdown document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isWorkBreakdownDocument(document)).toBe(true);
    expect(isWorkBreakdownState(document.state)).toBe(true);
  });
  it("should reject a document that is not a WorkBreakdown document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsWorkBreakdownDocument(wrongDocumentType)).toThrow();
      expect(isWorkBreakdownDocument(wrongDocumentType)).toBe(false);
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
    expect(isWorkBreakdownState(wrongState.state)).toBe(false);
    expect(assertIsWorkBreakdownState(wrongState.state)).toThrow();
    expect(isWorkBreakdownDocument(wrongState)).toBe(false);
    expect(assertIsWorkBreakdownDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isWorkBreakdownState(wrongInitialState.state)).toBe(false);
    expect(assertIsWorkBreakdownState(wrongInitialState.state)).toThrow();
    expect(isWorkBreakdownDocument(wrongInitialState)).toBe(false);
    expect(assertIsWorkBreakdownDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isWorkBreakdownDocument(missingIdInHeader)).toBe(false);
    expect(assertIsWorkBreakdownDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isWorkBreakdownDocument(missingNameInHeader)).toBe(false);
    expect(assertIsWorkBreakdownDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isWorkBreakdownDocument(missingCreatedAtUtcIsoInHeader)).toBe(false);
    expect(
      assertIsWorkBreakdownDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isWorkBreakdownDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsWorkBreakdownDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
