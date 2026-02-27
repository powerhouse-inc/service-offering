import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isWorkBreakdownDocument,
  setProjectInfo,
  setPhase,
  setStatus,
  SetProjectInfoInputSchema,
  SetPhaseInputSchema,
  SetStatusInputSchema,
} from "@powerhousedao/service-offering/document-models/work-breakdown";
import {
  reducer,
  utils,
  isWorkBreakdownDocument,
  setProjectInfo,
  setPhase,
  setStatus,
  SetProjectInfoInputSchema,
  SetPhaseInputSchema,
  SetStatusInputSchema,
} from "wbd/document-models/work-breakdown";

describe("ProjectOperations", () => {
  it("should handle setProjectInfo operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetProjectInfoInputSchema());

    const updatedDocument = reducer(document, setProjectInfo(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_PROJECT_INFO",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setPhase operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetPhaseInputSchema());

    const updatedDocument = reducer(document, setPhase(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("SET_PHASE");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetStatusInputSchema());

    const updatedDocument = reducer(document, setStatus(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("SET_STATUS");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
