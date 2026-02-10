import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isResourceTemplateDocument,
  addTargetAudience,
  removeTargetAudience,
  AddTargetAudienceInputSchema,
  RemoveTargetAudienceInputSchema,
} from "@powerhousedao/service-offering/document-models/resource-template";

describe("AudienceManagementOperations", () => {
  it("should handle addTargetAudience operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddTargetAudienceInputSchema());

    const updatedDocument = reducer(document, addTargetAudience(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_TARGET_AUDIENCE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeTargetAudience operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveTargetAudienceInputSchema());

    const updatedDocument = reducer(document, removeTargetAudience(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_TARGET_AUDIENCE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
