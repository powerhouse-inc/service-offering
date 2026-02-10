/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import { describe, it, expect } from "vitest";
import { generateMock } from "@powerhousedao/codegen";
import {
  reducer,
  utils,
  isFacetDocument,
  setFacetName,
  SetFacetNameInputSchema,
  setFacetDescription,
  SetFacetDescriptionInputSchema,
} from "@powerhousedao/service-offering/document-models/facet";

describe("FacetManagement Operations", () => {
  it("should handle setFacetName operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetFacetNameInputSchema());

    const updatedDocument = reducer(document, setFacetName(input));

    expect(isFacetDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_FACET_NAME",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle setFacetDescription operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetFacetDescriptionInputSchema());

    const updatedDocument = reducer(document, setFacetDescription(input));

    expect(isFacetDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_FACET_DESCRIPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
