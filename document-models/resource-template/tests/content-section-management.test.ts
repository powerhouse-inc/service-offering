import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isResourceTemplateDocument,
  addContentSection,
  updateContentSection,
  deleteContentSection,
  reorderContentSections,
  AddContentSectionInputSchema,
  UpdateContentSectionInputSchema,
  DeleteContentSectionInputSchema,
  ReorderContentSectionsInputSchema,
} from "@powerhousedao/service-offering/document-models/resource-template";

describe("ContentSectionManagementOperations", () => {
  it("should handle addContentSection operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddContentSectionInputSchema());

    const updatedDocument = reducer(document, addContentSection(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_CONTENT_SECTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateContentSection operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateContentSectionInputSchema());

    const updatedDocument = reducer(document, updateContentSection(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_CONTENT_SECTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteContentSection operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteContentSectionInputSchema());

    const updatedDocument = reducer(document, deleteContentSection(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_CONTENT_SECTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle reorderContentSections operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ReorderContentSectionsInputSchema());

    const updatedDocument = reducer(document, reorderContentSections(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REORDER_CONTENT_SECTIONS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
