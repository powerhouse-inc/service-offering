/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import { describe, it, expect } from "vitest";
import { generateMock } from "@powerhousedao/codegen";
import {
  reducer,
  utils,
  isServiceSubscriptionDocument,
  changeTier,
  ChangeTierInputSchema,
  setPricing,
  SetPricingInputSchema,
} from "@powerhousedao/service-offering/document-models/service-subscription";

describe("TierSelection Operations", () => {
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
