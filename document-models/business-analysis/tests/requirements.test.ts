import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isBusinessAnalysisDocument,
  addRequirement,
  updateRequirement,
  removeRequirement,
  setRequirementStatus,
  addAcceptanceCriterion,
  updateAcceptanceCriterion,
  removeAcceptanceCriterion,
  linkRequirements,
  addRequirementCategory,
  updateRequirementCategory,
  removeRequirementCategory,
  AddRequirementInputSchema,
  UpdateRequirementInputSchema,
  RemoveRequirementInputSchema,
  SetRequirementStatusInputSchema,
  AddAcceptanceCriterionInputSchema,
  UpdateAcceptanceCriterionInputSchema,
  RemoveAcceptanceCriterionInputSchema,
  LinkRequirementsInputSchema,
  AddRequirementCategoryInputSchema,
  UpdateRequirementCategoryInputSchema,
  RemoveRequirementCategoryInputSchema,
} from "@powerhousedao/service-offering/document-models/business-analysis";

describe("RequirementsOperations", () => {
  it("should handle addRequirement operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddRequirementInputSchema());

    const updatedDocument = reducer(document, addRequirement(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_REQUIREMENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateRequirement operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateRequirementInputSchema());

    const updatedDocument = reducer(document, updateRequirement(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_REQUIREMENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeRequirement operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveRequirementInputSchema());

    const updatedDocument = reducer(document, removeRequirement(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_REQUIREMENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setRequirementStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetRequirementStatusInputSchema());

    const updatedDocument = reducer(document, setRequirementStatus(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_REQUIREMENT_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addAcceptanceCriterion operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddAcceptanceCriterionInputSchema());

    const updatedDocument = reducer(document, addAcceptanceCriterion(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_ACCEPTANCE_CRITERION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateAcceptanceCriterion operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateAcceptanceCriterionInputSchema());

    const updatedDocument = reducer(document, updateAcceptanceCriterion(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_ACCEPTANCE_CRITERION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeAcceptanceCriterion operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveAcceptanceCriterionInputSchema());

    const updatedDocument = reducer(document, removeAcceptanceCriterion(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_ACCEPTANCE_CRITERION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle linkRequirements operation", () => {
    const document = utils.createDocument();
    const input = generateMock(LinkRequirementsInputSchema());

    const updatedDocument = reducer(document, linkRequirements(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "LINK_REQUIREMENTS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addRequirementCategory operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddRequirementCategoryInputSchema());

    const updatedDocument = reducer(document, addRequirementCategory(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_REQUIREMENT_CATEGORY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateRequirementCategory operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateRequirementCategoryInputSchema());

    const updatedDocument = reducer(document, updateRequirementCategory(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_REQUIREMENT_CATEGORY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeRequirementCategory operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveRequirementCategoryInputSchema());

    const updatedDocument = reducer(document, removeRequirementCategory(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_REQUIREMENT_CATEGORY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
