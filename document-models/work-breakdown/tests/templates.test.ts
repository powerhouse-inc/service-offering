import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isWorkBreakdownDocument,
  addTemplate,
  updateTemplate,
  removeTemplate,
  setTemplateMode,
  applyTemplate,
  AddTemplateInputSchema,
  UpdateTemplateInputSchema,
  RemoveTemplateInputSchema,
  SetTemplateModeInputSchema,
  ApplyTemplateInputSchema,
} from "@powerhousedao/service-offering/document-models/work-breakdown";
import {
  reducer,
  utils,
  isWorkBreakdownDocument,
  addTemplate,
  updateTemplate,
  removeTemplate,
  setTemplateMode,
  applyTemplate,
  AddTemplateInputSchema,
  UpdateTemplateInputSchema,
  RemoveTemplateInputSchema,
  SetTemplateModeInputSchema,
  ApplyTemplateInputSchema,
} from "wbd/document-models/work-breakdown";

describe("TemplatesOperations", () => {
  it("should handle addTemplate operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddTemplateInputSchema());

    const updatedDocument = reducer(document, addTemplate(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_TEMPLATE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateTemplate operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateTemplateInputSchema());

    const updatedDocument = reducer(document, updateTemplate(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_TEMPLATE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeTemplate operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveTemplateInputSchema());

    const updatedDocument = reducer(document, removeTemplate(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_TEMPLATE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setTemplateMode operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetTemplateModeInputSchema());

    const updatedDocument = reducer(document, setTemplateMode(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_TEMPLATE_MODE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle applyTemplate operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ApplyTemplateInputSchema());

    const updatedDocument = reducer(document, applyTemplate(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "APPLY_TEMPLATE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
