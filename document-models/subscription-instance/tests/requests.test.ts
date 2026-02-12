import { describe, it } from "vitest";
import {
  reducer,
  utils,
  isSubscriptionInstanceDocument,
  createClientRequest,
  approveRequest,
  rejectRequest,
  CreateClientRequestInputSchema,
  ApproveRequestInputSchema,
  RejectRequestInputSchema,
} from "@powerhousedao/service-offering/document-models/subscription-instance";
import { generateMock } from "@powerhousedao/codegen";

// Note: The requests module has been removed from SubscriptionInstance.
// These tests are stubbed out until the module is re-implemented.

describe("RequestsOperations", () => {
  it.skip("requests module has been removed", () => {
    // Tests skipped - requests module no longer exists
  });

  it("should handle createClientRequest operation", () => {
    const document = utils.createDocument();
    const input = generateMock(CreateClientRequestInputSchema());

    const updatedDocument = reducer(document, createClientRequest(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "CREATE_CLIENT_REQUEST",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle approveRequest operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ApproveRequestInputSchema());

    const updatedDocument = reducer(document, approveRequest(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "APPROVE_REQUEST",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle rejectRequest operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RejectRequestInputSchema());

    const updatedDocument = reducer(document, rejectRequest(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REJECT_REQUEST",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
