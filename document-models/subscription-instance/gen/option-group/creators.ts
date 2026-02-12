import { createAction } from "document-model/core";
import {
  AddSelectedOptionGroupInputSchema,
  RemoveSelectedOptionGroupInputSchema,
} from "../schema/zod.js";
import type {
  AddSelectedOptionGroupInput,
  RemoveSelectedOptionGroupInput,
} from "../types.js";
import type {
  AddSelectedOptionGroupAction,
  RemoveSelectedOptionGroupAction,
} from "./actions.js";

export const addSelectedOptionGroup = (input: AddSelectedOptionGroupInput) =>
  createAction<AddSelectedOptionGroupAction>(
    "ADD_SELECTED_OPTION_GROUP",
    { ...input },
    undefined,
    AddSelectedOptionGroupInputSchema,
    "global",
  );

export const removeSelectedOptionGroup = (
  input: RemoveSelectedOptionGroupInput,
) =>
  createAction<RemoveSelectedOptionGroupAction>(
    "REMOVE_SELECTED_OPTION_GROUP",
    { ...input },
    undefined,
    RemoveSelectedOptionGroupInputSchema,
    "global",
  );
