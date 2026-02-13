import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isBusinessAnalysisDocument,
  addGlossaryTerm,
  updateGlossaryTerm,
  removeGlossaryTerm,
  AddGlossaryTermInputSchema,
  UpdateGlossaryTermInputSchema,
  RemoveGlossaryTermInputSchema,
} from "@powerhousedao/service-offering/document-models/business-analysis";

describe("GlossaryOperations", () => {
  it("should handle addGlossaryTerm operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddGlossaryTermInputSchema());

    const updatedDocument = reducer(document, addGlossaryTerm(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_GLOSSARY_TERM",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateGlossaryTerm operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateGlossaryTermInputSchema());

    const updatedDocument = reducer(document, updateGlossaryTerm(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_GLOSSARY_TERM",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeGlossaryTerm operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveGlossaryTermInputSchema());

    const updatedDocument = reducer(document, removeGlossaryTerm(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_GLOSSARY_TERM",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
