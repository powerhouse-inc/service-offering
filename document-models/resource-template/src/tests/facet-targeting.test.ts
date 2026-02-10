/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import { describe, it, expect } from "vitest";
import { generateMock } from "@powerhousedao/codegen";
import {
  reducer,
  utils,
  isResourceTemplateDocument,
  setFacetTarget,
  SetFacetTargetInputSchema,
  removeFacetTarget,
  RemoveFacetTargetInputSchema,
  addFacetOption,
  AddFacetOptionInputSchema,
  removeFacetOption,
  RemoveFacetOptionInputSchema,
} from "@powerhousedao/service-offering/document-models/resource-template";

describe("FacetTargeting Operations", () => {
  it("should handle setFacetTarget operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetFacetTargetInputSchema());

    const updatedDocument = reducer(document, setFacetTarget(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_FACET_TARGET",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle removeFacetTarget operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveFacetTargetInputSchema());

    const updatedDocument = reducer(document, removeFacetTarget(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_FACET_TARGET",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle addFacetOption operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddFacetOptionInputSchema());

    const updatedDocument = reducer(document, addFacetOption(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_FACET_OPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle removeFacetOption operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveFacetOptionInputSchema());

    const updatedDocument = reducer(document, removeFacetOption(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_FACET_OPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
