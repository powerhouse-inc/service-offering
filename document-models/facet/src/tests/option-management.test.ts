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
  addOption,
  AddOptionInputSchema,
  updateOption,
  UpdateOptionInputSchema,
  removeOption,
  RemoveOptionInputSchema,
  reorderOptions,
  ReorderOptionsInputSchema,
} from "@powerhousedao/service-offering/document-models/facet";

describe("OptionManagement Operations", () => {
  it("should handle addOption operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddOptionInputSchema());

    const updatedDocument = reducer(document, addOption(input));

    expect(isFacetDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_OPTION");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle updateOption operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateOptionInputSchema());

    const updatedDocument = reducer(document, updateOption(input));

    expect(isFacetDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_OPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle removeOption operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveOptionInputSchema());

    const updatedDocument = reducer(document, removeOption(input));

    expect(isFacetDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_OPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle reorderOptions operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ReorderOptionsInputSchema());

    const updatedDocument = reducer(document, reorderOptions(input));

    expect(isFacetDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REORDER_OPTIONS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
