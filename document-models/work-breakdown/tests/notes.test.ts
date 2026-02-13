import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isWorkBreakdownDocument,
  addNote,
  removeNote,
  AddNoteInputSchema,
  RemoveNoteInputSchema,
} from "@powerhousedao/service-offering/document-models/work-breakdown";

describe("NotesOperations", () => {
  it("should handle addNote operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddNoteInputSchema());

    const updatedDocument = reducer(document, addNote(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_NOTE");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeNote operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveNoteInputSchema());

    const updatedDocument = reducer(document, removeNote(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_NOTE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
