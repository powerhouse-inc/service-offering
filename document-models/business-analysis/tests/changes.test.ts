import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isBusinessAnalysisDocument,
  addChangeRequest,
  updateChangeRequest,
  setChangeRequestStatus,
  AddChangeRequestInputSchema,
  UpdateChangeRequestInputSchema,
  SetChangeRequestStatusInputSchema,
} from "@powerhousedao/service-offering/document-models/business-analysis";

describe("ChangesOperations", () => {
  it("should handle addChangeRequest operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddChangeRequestInputSchema());

    const updatedDocument = reducer(document, addChangeRequest(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_CHANGE_REQUEST",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateChangeRequest operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateChangeRequestInputSchema());

    const updatedDocument = reducer(document, updateChangeRequest(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_CHANGE_REQUEST",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setChangeRequestStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetChangeRequestStatusInputSchema());

    const updatedDocument = reducer(document, setChangeRequestStatus(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_CHANGE_REQUEST_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
