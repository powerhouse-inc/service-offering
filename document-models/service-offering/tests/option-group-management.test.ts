import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isServiceOfferingDocument,
  addOptionGroup,
  updateOptionGroup,
  deleteOptionGroup,
  AddOptionGroupInputSchema,
  UpdateOptionGroupInputSchema,
  DeleteOptionGroupInputSchema,
} from "@powerhousedao/service-offering/document-models/service-offering";

describe("OptionGroupManagementOperations", () => {
  it("should handle addOptionGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddOptionGroupInputSchema());

    const updatedDocument = reducer(document, addOptionGroup(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_OPTION_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateOptionGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateOptionGroupInputSchema());

    const updatedDocument = reducer(document, updateOptionGroup(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_OPTION_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteOptionGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteOptionGroupInputSchema());

    const updatedDocument = reducer(document, deleteOptionGroup(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_OPTION_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
