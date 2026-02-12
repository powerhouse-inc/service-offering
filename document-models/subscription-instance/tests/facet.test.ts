import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isSubscriptionInstanceDocument,
  setFacetSelection,
  removeFacetSelection,
  SetFacetSelectionInputSchema,
  RemoveFacetSelectionInputSchema,
} from "@powerhousedao/service-offering/document-models/subscription-instance";

describe("FacetOperations", () => {
  it("should handle setFacetSelection operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetFacetSelectionInputSchema());

    const updatedDocument = reducer(document, setFacetSelection(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_FACET_SELECTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeFacetSelection operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveFacetSelectionInputSchema());

    const updatedDocument = reducer(document, removeFacetSelection(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_FACET_SELECTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
