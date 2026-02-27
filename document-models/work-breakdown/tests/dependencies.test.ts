import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isWorkBreakdownDocument,
  addDependency,
  updateDependency,
  removeDependency,
  AddDependencyInputSchema,
  UpdateDependencyInputSchema,
  RemoveDependencyInputSchema,
} from "@powerhousedao/service-offering/document-models/work-breakdown";
import {
  reducer,
  utils,
  isWorkBreakdownDocument,
  addDependency,
  updateDependency,
  removeDependency,
  AddDependencyInputSchema,
  UpdateDependencyInputSchema,
  RemoveDependencyInputSchema,
} from "wbd/document-models/work-breakdown";

describe("DependenciesOperations", () => {
  it("should handle addDependency operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddDependencyInputSchema());

    const updatedDocument = reducer(document, addDependency(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_DEPENDENCY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateDependency operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateDependencyInputSchema());

    const updatedDocument = reducer(document, updateDependency(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_DEPENDENCY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeDependency operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveDependencyInputSchema());

    const updatedDocument = reducer(document, removeDependency(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_DEPENDENCY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
