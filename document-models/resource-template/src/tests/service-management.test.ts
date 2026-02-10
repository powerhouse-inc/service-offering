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
  addService,
  AddServiceInputSchema,
  updateService,
  UpdateServiceInputSchema,
  deleteService,
  DeleteServiceInputSchema,
  addFacetBinding,
  AddFacetBindingInputSchema,
  removeFacetBinding,
  RemoveFacetBindingInputSchema,
} from "@powerhousedao/service-offering/document-models/resource-template";

describe("ServiceManagement Operations", () => {
  it("should handle addService operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddServiceInputSchema());

    const updatedDocument = reducer(document, addService(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_SERVICE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle updateService operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateServiceInputSchema());

    const updatedDocument = reducer(document, updateService(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SERVICE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle deleteService operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteServiceInputSchema());

    const updatedDocument = reducer(document, deleteService(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_SERVICE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle addFacetBinding operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddFacetBindingInputSchema());

    const updatedDocument = reducer(document, addFacetBinding(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_FACET_BINDING",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle removeFacetBinding operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveFacetBindingInputSchema());

    const updatedDocument = reducer(document, removeFacetBinding(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_FACET_BINDING",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
