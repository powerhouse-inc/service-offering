import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isServiceOfferingDocument,
  addServiceGroup,
  updateServiceGroup,
  deleteServiceGroup,
  reorderServiceGroups,
  AddServiceGroupInputSchema,
  UpdateServiceGroupInputSchema,
  DeleteServiceGroupInputSchema,
  ReorderServiceGroupsInputSchema,
} from "@powerhousedao/service-offering/document-models/service-offering";

describe("ServiceGroupManagementOperations", () => {
  it("should handle addServiceGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddServiceGroupInputSchema());

    const updatedDocument = reducer(document, addServiceGroup(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_SERVICE_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateServiceGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateServiceGroupInputSchema());

    const updatedDocument = reducer(document, updateServiceGroup(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SERVICE_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteServiceGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteServiceGroupInputSchema());

    const updatedDocument = reducer(document, deleteServiceGroup(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_SERVICE_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle reorderServiceGroups operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ReorderServiceGroupsInputSchema());

    const updatedDocument = reducer(document, reorderServiceGroups(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REORDER_SERVICE_GROUPS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
