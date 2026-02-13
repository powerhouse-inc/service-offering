import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isWorkBreakdownDocument,
  addInput,
  updateInput,
  removeInput,
  addStep,
  updateStep,
  removeStep,
  addSubstep,
  updateSubstep,
  removeSubstep,
  AddInputInputSchema,
  UpdateInputInputSchema,
  RemoveInputInputSchema,
  AddStepInputSchema,
  UpdateStepInputSchema,
  RemoveStepInputSchema,
  AddSubstepInputSchema,
  UpdateSubstepInputSchema,
  RemoveSubstepInputSchema,
} from "@powerhousedao/service-offering/document-models/work-breakdown";

describe("ScenarioOperations", () => {
  it("should handle addInput operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddInputInputSchema());

    const updatedDocument = reducer(document, addInput(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_INPUT");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateInput operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateInputInputSchema());

    const updatedDocument = reducer(document, updateInput(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_INPUT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeInput operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveInputInputSchema());

    const updatedDocument = reducer(document, removeInput(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_INPUT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addStep operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddStepInputSchema());

    const updatedDocument = reducer(document, addStep(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_STEP");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateStep operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateStepInputSchema());

    const updatedDocument = reducer(document, updateStep(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_STEP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeStep operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveStepInputSchema());

    const updatedDocument = reducer(document, removeStep(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_STEP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addSubstep operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddSubstepInputSchema());

    const updatedDocument = reducer(document, addSubstep(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_SUBSTEP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateSubstep operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateSubstepInputSchema());

    const updatedDocument = reducer(document, updateSubstep(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SUBSTEP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeSubstep operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveSubstepInputSchema());

    const updatedDocument = reducer(document, removeSubstep(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_SUBSTEP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
