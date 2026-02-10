import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isServiceSubscriptionDocument,
  addAddon,
  removeAddon,
  AddAddonInputSchema,
  RemoveAddonInputSchema,
} from "@powerhousedao/service-offering/document-models/service-subscription";

describe("AddOnManagementOperations", () => {
  it("should handle addAddon operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddAddonInputSchema());

    const updatedDocument = reducer(document, addAddon(input));

    expect(isServiceSubscriptionDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_ADDON");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeAddon operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveAddonInputSchema());

    const updatedDocument = reducer(document, removeAddon(input));

    expect(isServiceSubscriptionDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_ADDON",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
