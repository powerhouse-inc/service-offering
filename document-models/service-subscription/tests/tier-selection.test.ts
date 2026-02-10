import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isServiceSubscriptionDocument,
  changeTier,
  setPricing,
  ChangeTierInputSchema,
  SetPricingInputSchema,
} from "@powerhousedao/service-offering/document-models/service-subscription";

describe("TierSelectionOperations", () => {
  it("should handle changeTier operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ChangeTierInputSchema());

    const updatedDocument = reducer(document, changeTier(input));

    expect(isServiceSubscriptionDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "CHANGE_TIER",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setPricing operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetPricingInputSchema());

    const updatedDocument = reducer(document, setPricing(input));

    expect(isServiceSubscriptionDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_PRICING",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
