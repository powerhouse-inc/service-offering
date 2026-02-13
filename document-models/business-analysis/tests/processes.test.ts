import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isBusinessAnalysisDocument,
  addProcess,
  updateProcess,
  removeProcess,
  addProcessStep,
  updateProcessStep,
  removeProcessStep,
  reorderProcessSteps,
  AddProcessInputSchema,
  UpdateProcessInputSchema,
  RemoveProcessInputSchema,
  AddProcessStepInputSchema,
  UpdateProcessStepInputSchema,
  RemoveProcessStepInputSchema,
  ReorderProcessStepsInputSchema,
} from "@powerhousedao/service-offering/document-models/business-analysis";

describe("ProcessesOperations", () => {
  it("should handle addProcess operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddProcessInputSchema());

    const updatedDocument = reducer(document, addProcess(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_PROCESS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateProcess operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateProcessInputSchema());

    const updatedDocument = reducer(document, updateProcess(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_PROCESS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeProcess operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveProcessInputSchema());

    const updatedDocument = reducer(document, removeProcess(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_PROCESS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addProcessStep operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddProcessStepInputSchema());

    const updatedDocument = reducer(document, addProcessStep(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_PROCESS_STEP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateProcessStep operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateProcessStepInputSchema());

    const updatedDocument = reducer(document, updateProcessStep(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_PROCESS_STEP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeProcessStep operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveProcessStepInputSchema());

    const updatedDocument = reducer(document, removeProcessStep(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_PROCESS_STEP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle reorderProcessSteps operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ReorderProcessStepsInputSchema());

    const updatedDocument = reducer(document, reorderProcessSteps(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REORDER_PROCESS_STEPS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
