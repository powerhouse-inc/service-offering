import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isBusinessAnalysisDocument,
  addStakeholder,
  updateStakeholder,
  removeStakeholder,
  setEngagementLevel,
  AddStakeholderInputSchema,
  UpdateStakeholderInputSchema,
  RemoveStakeholderInputSchema,
  SetEngagementLevelInputSchema,
} from "@powerhousedao/service-offering/document-models/business-analysis";

describe("StakeholdersOperations", () => {
  it("should handle addStakeholder operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddStakeholderInputSchema());

    const updatedDocument = reducer(document, addStakeholder(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_STAKEHOLDER",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateStakeholder operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateStakeholderInputSchema());

    const updatedDocument = reducer(document, updateStakeholder(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_STAKEHOLDER",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeStakeholder operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveStakeholderInputSchema());

    const updatedDocument = reducer(document, removeStakeholder(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_STAKEHOLDER",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setEngagementLevel operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetEngagementLevelInputSchema());

    const updatedDocument = reducer(document, setEngagementLevel(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_ENGAGEMENT_LEVEL",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
