import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isResourceTemplateDocument,
  addOptionGroup,
  updateOptionGroup,
  deleteOptionGroup,
  addFaq,
  updateFaq,
  deleteFaq,
  reorderFaqs,
  AddOptionGroupInputSchema,
  UpdateOptionGroupInputSchema,
  DeleteOptionGroupInputSchema,
  AddFaqInputSchema,
  UpdateFaqInputSchema,
  DeleteFaqInputSchema,
  ReorderFaqsInputSchema,
} from "@powerhousedao/service-offering/document-models/resource-template";

describe("OptionGroupManagementOperations", () => {
  it("should handle addOptionGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddOptionGroupInputSchema());

    const updatedDocument = reducer(document, addOptionGroup(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
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

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
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

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_OPTION_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addFaq operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddFaqInputSchema());

    const updatedDocument = reducer(document, addFaq(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_FAQ");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateFaq operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateFaqInputSchema());

    const updatedDocument = reducer(document, updateFaq(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("UPDATE_FAQ");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteFaq operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteFaqInputSchema());

    const updatedDocument = reducer(document, deleteFaq(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("DELETE_FAQ");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle reorderFaqs operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ReorderFaqsInputSchema());

    const updatedDocument = reducer(document, reorderFaqs(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REORDER_FAQS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
