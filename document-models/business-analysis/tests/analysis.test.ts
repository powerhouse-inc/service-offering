import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isBusinessAnalysisDocument,
  addAnalysis,
  updateAnalysis,
  removeAnalysis,
  addAnalysisEntry,
  updateAnalysisEntry,
  removeAnalysisEntry,
  AddAnalysisInputSchema,
  UpdateAnalysisInputSchema,
  RemoveAnalysisInputSchema,
  AddAnalysisEntryInputSchema,
  UpdateAnalysisEntryInputSchema,
  RemoveAnalysisEntryInputSchema,
} from "@powerhousedao/service-offering/document-models/business-analysis";

describe("AnalysisOperations", () => {
  it("should handle addAnalysis operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddAnalysisInputSchema());

    const updatedDocument = reducer(document, addAnalysis(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_ANALYSIS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateAnalysis operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateAnalysisInputSchema());

    const updatedDocument = reducer(document, updateAnalysis(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_ANALYSIS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeAnalysis operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveAnalysisInputSchema());

    const updatedDocument = reducer(document, removeAnalysis(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_ANALYSIS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addAnalysisEntry operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddAnalysisEntryInputSchema());

    const updatedDocument = reducer(document, addAnalysisEntry(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_ANALYSIS_ENTRY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateAnalysisEntry operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateAnalysisEntryInputSchema());

    const updatedDocument = reducer(document, updateAnalysisEntry(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_ANALYSIS_ENTRY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeAnalysisEntry operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveAnalysisEntryInputSchema());

    const updatedDocument = reducer(document, removeAnalysisEntry(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_ANALYSIS_ENTRY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
