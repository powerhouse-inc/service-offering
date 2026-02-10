import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isServiceSubscriptionDocument,
  setFacetSelection,
  removeFacetSelection,
  SetFacetSelectionInputSchema,
  RemoveFacetSelectionInputSchema,
} from "@powerhousedao/service-offering/document-models/service-subscription";

describe("FacetSelectionOperations", () => {
  it("should handle setFacetSelection operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetFacetSelectionInputSchema());

    const updatedDocument = reducer(document, setFacetSelection(input));

    expect(isServiceSubscriptionDocument(updatedDocument)).toBe(true);
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

    expect(isServiceSubscriptionDocument(updatedDocument)).toBe(true);
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
