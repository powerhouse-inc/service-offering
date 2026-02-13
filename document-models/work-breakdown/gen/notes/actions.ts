import type { Action } from "document-model";
import type { AddNoteInput, RemoveNoteInput } from "../types.js";

export type AddNoteAction = Action & { type: "ADD_NOTE"; input: AddNoteInput };
export type RemoveNoteAction = Action & {
  type: "REMOVE_NOTE";
  input: RemoveNoteInput;
};

export type WorkBreakdownNotesAction = AddNoteAction | RemoveNoteAction;
