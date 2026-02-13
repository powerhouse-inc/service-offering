import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isBusinessAnalysisDocument,
  addAssumption,
  updateAssumption,
  removeAssumption,
  setAssumptionStatus,
  addScopeItem,
  updateScopeItem,
  removeScopeItem,
  AddAssumptionInputSchema,
  UpdateAssumptionInputSchema,
  RemoveAssumptionInputSchema,
  SetAssumptionStatusInputSchema,
  AddScopeItemInputSchema,
  UpdateScopeItemInputSchema,
  RemoveScopeItemInputSchema,
} from "@powerhousedao/service-offering/document-models/business-analysis";

describe("ScopeOperations", () => {
  it("should handle addAssumption operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddAssumptionInputSchema());

    const updatedDocument = reducer(document, addAssumption(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_ASSUMPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateAssumption operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateAssumptionInputSchema());

    const updatedDocument = reducer(document, updateAssumption(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_ASSUMPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeAssumption operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveAssumptionInputSchema());

    const updatedDocument = reducer(document, removeAssumption(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_ASSUMPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setAssumptionStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetAssumptionStatusInputSchema());

    const updatedDocument = reducer(document, setAssumptionStatus(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_ASSUMPTION_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addScopeItem operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddScopeItemInputSchema());

    const updatedDocument = reducer(document, addScopeItem(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_SCOPE_ITEM",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateScopeItem operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateScopeItemInputSchema());

    const updatedDocument = reducer(document, updateScopeItem(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SCOPE_ITEM",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeScopeItem operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveScopeItemInputSchema());

    const updatedDocument = reducer(document, removeScopeItem(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_SCOPE_ITEM",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
