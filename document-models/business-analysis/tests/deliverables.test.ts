import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isBusinessAnalysisDocument,
  addDeliverable,
  updateDeliverable,
  removeDeliverable,
  setDeliverableStatus,
  AddDeliverableInputSchema,
  UpdateDeliverableInputSchema,
  RemoveDeliverableInputSchema,
  SetDeliverableStatusInputSchema,
} from "@powerhousedao/service-offering/document-models/business-analysis";

describe("DeliverablesOperations", () => {
  it("should handle addDeliverable operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddDeliverableInputSchema());

    const updatedDocument = reducer(document, addDeliverable(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_DELIVERABLE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateDeliverable operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateDeliverableInputSchema());

    const updatedDocument = reducer(document, updateDeliverable(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_DELIVERABLE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeDeliverable operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveDeliverableInputSchema());

    const updatedDocument = reducer(document, removeDeliverable(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_DELIVERABLE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setDeliverableStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetDeliverableStatusInputSchema());

    const updatedDocument = reducer(document, setDeliverableStatus(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_DELIVERABLE_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
