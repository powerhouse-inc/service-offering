import { createAction } from "document-model/core";
import {
  AddGlossaryTermInputSchema,
  UpdateGlossaryTermInputSchema,
  RemoveGlossaryTermInputSchema,
} from "../schema/zod.js";
import type {
  AddGlossaryTermInput,
  UpdateGlossaryTermInput,
  RemoveGlossaryTermInput,
} from "../types.js";
import type {
  AddGlossaryTermAction,
  UpdateGlossaryTermAction,
  RemoveGlossaryTermAction,
} from "./actions.js";

export const addGlossaryTerm = (input: AddGlossaryTermInput) =>
  createAction<AddGlossaryTermAction>(
    "ADD_GLOSSARY_TERM",
    { ...input },
    undefined,
    AddGlossaryTermInputSchema,
    "global",
  );

export const updateGlossaryTerm = (input: UpdateGlossaryTermInput) =>
  createAction<UpdateGlossaryTermAction>(
    "UPDATE_GLOSSARY_TERM",
    { ...input },
    undefined,
    UpdateGlossaryTermInputSchema,
    "global",
  );

export const removeGlossaryTerm = (input: RemoveGlossaryTermInput) =>
  createAction<RemoveGlossaryTermAction>(
    "REMOVE_GLOSSARY_TERM",
    { ...input },
    undefined,
    RemoveGlossaryTermInputSchema,
    "global",
  );
