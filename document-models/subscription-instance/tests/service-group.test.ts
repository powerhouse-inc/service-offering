import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isSubscriptionInstanceDocument,
  addServiceGroup,
  removeServiceGroup,
  addServiceToGroup,
  removeServiceFromGroup,
  AddServiceGroupInputSchema,
  RemoveServiceGroupInputSchema,
  AddServiceToGroupInputSchema,
  RemoveServiceFromGroupInputSchema,
} from "@powerhousedao/service-offering/document-models/subscription-instance";

describe("ServiceGroupOperations", () => {
  it("should handle addServiceGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddServiceGroupInputSchema());

    const updatedDocument = reducer(document, addServiceGroup(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_SERVICE_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeServiceGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveServiceGroupInputSchema());

    const updatedDocument = reducer(document, removeServiceGroup(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_SERVICE_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addServiceToGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddServiceToGroupInputSchema());

    const updatedDocument = reducer(document, addServiceToGroup(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_SERVICE_TO_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeServiceFromGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveServiceFromGroupInputSchema());

    const updatedDocument = reducer(document, removeServiceFromGroup(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_SERVICE_FROM_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
