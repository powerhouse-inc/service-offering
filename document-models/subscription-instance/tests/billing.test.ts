import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isSubscriptionInstanceDocument,
  updateBillingProjection,
  UpdateBillingProjectionInputSchema,
} from "@powerhousedao/service-offering/document-models/subscription-instance";

// Billing module (invoices) has been removed.
// Billing projection is now handled by the subscription module.

describe("BillingProjection", () => {
  it("should handle updateBillingProjection operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateBillingProjectionInputSchema());

    const updatedDocument = reducer(document, updateBillingProjection(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_BILLING_PROJECTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
