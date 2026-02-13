import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isBusinessAnalysisDocument,
  setProjectInfo,
  setProjectPhase,
  setProjectStatus,
  SetProjectInfoInputSchema,
  SetProjectPhaseInputSchema,
  SetProjectStatusInputSchema,
} from "@powerhousedao/service-offering/document-models/business-analysis";

describe("ProjectOperations", () => {
  it("should handle setProjectInfo operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetProjectInfoInputSchema());

    const updatedDocument = reducer(document, setProjectInfo(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_PROJECT_INFO",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setProjectPhase operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetProjectPhaseInputSchema());

    const updatedDocument = reducer(document, setProjectPhase(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_PROJECT_PHASE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setProjectStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetProjectStatusInputSchema());

    const updatedDocument = reducer(document, setProjectStatus(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_PROJECT_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
