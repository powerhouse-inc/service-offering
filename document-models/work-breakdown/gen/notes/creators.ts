import { createAction } from "document-model/core";
import { AddNoteInputSchema, RemoveNoteInputSchema } from "../schema/zod.js";
import type { AddNoteInput, RemoveNoteInput } from "../types.js";
import type { AddNoteAction, RemoveNoteAction } from "./actions.js";

export const addNote = (input: AddNoteInput) =>
  createAction<AddNoteAction>(
    "ADD_NOTE",
    { ...input },
    undefined,
    AddNoteInputSchema,
    "global",
  );

export const removeNote = (input: RemoveNoteInput) =>
  createAction<RemoveNoteAction>(
    "REMOVE_NOTE",
    { ...input },
    undefined,
    RemoveNoteInputSchema,
    "global",
  );
