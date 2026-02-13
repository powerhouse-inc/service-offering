import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isBusinessAnalysisDocument,
  addDecision,
  updateDecision,
  removeDecision,
  setDecisionStatus,
  AddDecisionInputSchema,
  UpdateDecisionInputSchema,
  RemoveDecisionInputSchema,
  SetDecisionStatusInputSchema,
} from "@powerhousedao/service-offering/document-models/business-analysis";

describe("DecisionsOperations", () => {
  it("should handle addDecision operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddDecisionInputSchema());

    const updatedDocument = reducer(document, addDecision(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_DECISION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateDecision operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateDecisionInputSchema());

    const updatedDocument = reducer(document, updateDecision(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_DECISION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeDecision operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveDecisionInputSchema());

    const updatedDocument = reducer(document, removeDecision(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_DECISION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setDecisionStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetDecisionStatusInputSchema());

    const updatedDocument = reducer(document, setDecisionStatus(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_DECISION_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
