import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isServiceSubscriptionDocument,
  updateBillingProjection,
  setCachedSnippets,
  UpdateBillingProjectionInputSchema,
  SetCachedSnippetsInputSchema,
} from "@powerhousedao/service-offering/document-models/service-subscription";

describe("BillingProjectionOperations", () => {
  it("should handle updateBillingProjection operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateBillingProjectionInputSchema());

    const updatedDocument = reducer(document, updateBillingProjection(input));

    expect(isServiceSubscriptionDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_BILLING_PROJECTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setCachedSnippets operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetCachedSnippetsInputSchema());

    const updatedDocument = reducer(document, setCachedSnippets(input));

    expect(isServiceSubscriptionDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_CACHED_SNIPPETS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
