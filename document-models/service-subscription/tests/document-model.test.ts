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
  serviceSubscriptionDocumentType,
  isServiceSubscriptionDocument,
  assertIsServiceSubscriptionDocument,
  isServiceSubscriptionState,
  assertIsServiceSubscriptionState,
} from "@powerhousedao/service-offering/document-models/service-subscription";
import { ZodError } from "zod";

describe("ServiceSubscription Document Model", () => {
  it("should create a new ServiceSubscription document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(serviceSubscriptionDocumentType);
  });

  it("should create a new ServiceSubscription document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isServiceSubscriptionDocument(document)).toBe(true);
    expect(isServiceSubscriptionState(document.state)).toBe(true);
  });
  it("should reject a document that is not a ServiceSubscription document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsServiceSubscriptionDocument(wrongDocumentType)).toThrow();
      expect(isServiceSubscriptionDocument(wrongDocumentType)).toBe(false);
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
    expect(isServiceSubscriptionState(wrongState.state)).toBe(false);
    expect(assertIsServiceSubscriptionState(wrongState.state)).toThrow();
    expect(isServiceSubscriptionDocument(wrongState)).toBe(false);
    expect(assertIsServiceSubscriptionDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isServiceSubscriptionState(wrongInitialState.state)).toBe(false);
    expect(assertIsServiceSubscriptionState(wrongInitialState.state)).toThrow();
    expect(isServiceSubscriptionDocument(wrongInitialState)).toBe(false);
    expect(assertIsServiceSubscriptionDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isServiceSubscriptionDocument(missingIdInHeader)).toBe(false);
    expect(assertIsServiceSubscriptionDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isServiceSubscriptionDocument(missingNameInHeader)).toBe(false);
    expect(assertIsServiceSubscriptionDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isServiceSubscriptionDocument(missingCreatedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsServiceSubscriptionDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(
      isServiceSubscriptionDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toBe(false);
    expect(
      assertIsServiceSubscriptionDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
