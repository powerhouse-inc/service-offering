import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isBusinessAnalysisDocument,
  addRisk,
  updateRisk,
  removeRisk,
  setRiskStatus,
  AddRiskInputSchema,
  UpdateRiskInputSchema,
  RemoveRiskInputSchema,
  SetRiskStatusInputSchema,
} from "@powerhousedao/service-offering/document-models/business-analysis";

describe("RisksOperations", () => {
  it("should handle addRisk operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddRiskInputSchema());

    const updatedDocument = reducer(document, addRisk(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_RISK");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateRisk operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateRiskInputSchema());

    const updatedDocument = reducer(document, updateRisk(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_RISK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeRisk operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveRiskInputSchema());

    const updatedDocument = reducer(document, removeRisk(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_RISK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setRiskStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetRiskStatusInputSchema());

    const updatedDocument = reducer(document, setRiskStatus(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_RISK_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
