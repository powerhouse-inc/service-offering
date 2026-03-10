import { createAction } from "document-model/core";
import {
  AddOptionInputSchema,
  UpdateOptionInputSchema,
  RemoveOptionInputSchema,
  ReorderOptionsInputSchema,
} from "../schema/zod.js";
import type {
  AddOptionInput,
  UpdateOptionInput,
  RemoveOptionInput,
  ReorderOptionsInput,
} from "../types.js";
import type {
  AddOptionAction,
  UpdateOptionAction,
  RemoveOptionAction,
  ReorderOptionsAction,
} from "./actions.js";

export const addOption = (input: AddOptionInput) =>
  createAction<AddOptionAction>(
    "ADD_OPTION",
    { ...input },
    undefined,
    AddOptionInputSchema,
    "global",
  );

export const updateOption = (input: UpdateOptionInput) =>
  createAction<UpdateOptionAction>(
    "UPDATE_OPTION",
    { ...input },
    undefined,
    UpdateOptionInputSchema,
    "global",
  );

export const removeOption = (input: RemoveOptionInput) =>
  createAction<RemoveOptionAction>(
    "REMOVE_OPTION",
    { ...input },
    undefined,
    RemoveOptionInputSchema,
    "global",
  );

export const reorderOptions = (input: ReorderOptionsInput) =>
  createAction<ReorderOptionsAction>(
    "REORDER_OPTIONS",
    { ...input },
    undefined,
    ReorderOptionsInputSchema,
    "global",
  );
