import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isSubscriptionInstanceDocument,
  addSelectedOptionGroup,
  removeSelectedOptionGroup,
  AddSelectedOptionGroupInputSchema,
  RemoveSelectedOptionGroupInputSchema,
} from "@powerhousedao/service-offering/document-models/subscription-instance";

describe("OptionGroupOperations", () => {
  it("should handle addSelectedOptionGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddSelectedOptionGroupInputSchema());

    const updatedDocument = reducer(document, addSelectedOptionGroup(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_SELECTED_OPTION_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeSelectedOptionGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveSelectedOptionGroupInputSchema());

    const updatedDocument = reducer(document, removeSelectedOptionGroup(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_SELECTED_OPTION_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
