import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isResourceTemplateDocument,
  updateTemplateInfo,
  updateTemplateStatus,
  setOperator,
  setTemplateId,
  UpdateTemplateInfoInputSchema,
  UpdateTemplateStatusInputSchema,
  SetOperatorInputSchema,
  SetTemplateIdInputSchema,
} from "@powerhousedao/service-offering/document-models/resource-template";

describe("TemplateManagementOperations", () => {
  it("should handle updateTemplateInfo operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateTemplateInfoInputSchema());

    const updatedDocument = reducer(document, updateTemplateInfo(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_TEMPLATE_INFO",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateTemplateStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateTemplateStatusInputSchema());

    const updatedDocument = reducer(document, updateTemplateStatus(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_TEMPLATE_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setOperator operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetOperatorInputSchema());

    const updatedDocument = reducer(document, setOperator(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_OPERATOR",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setTemplateId operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetTemplateIdInputSchema());

    const updatedDocument = reducer(document, setTemplateId(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_TEMPLATE_ID",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
