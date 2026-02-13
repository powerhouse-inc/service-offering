import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isWorkBreakdownDocument,
  addPrerequisite,
  updatePrerequisite,
  removePrerequisite,
  setPrerequisiteStatus,
  AddPrerequisiteInputSchema,
  UpdatePrerequisiteInputSchema,
  RemovePrerequisiteInputSchema,
  SetPrerequisiteStatusInputSchema,
} from "@powerhousedao/service-offering/document-models/work-breakdown";

describe("PrerequisitesOperations", () => {
  it("should handle addPrerequisite operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddPrerequisiteInputSchema());

    const updatedDocument = reducer(document, addPrerequisite(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_PREREQUISITE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updatePrerequisite operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdatePrerequisiteInputSchema());

    const updatedDocument = reducer(document, updatePrerequisite(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_PREREQUISITE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removePrerequisite operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemovePrerequisiteInputSchema());

    const updatedDocument = reducer(document, removePrerequisite(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_PREREQUISITE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setPrerequisiteStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetPrerequisiteStatusInputSchema());

    const updatedDocument = reducer(document, setPrerequisiteStatus(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_PREREQUISITE_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
