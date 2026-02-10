import { createAction } from "document-model/core";
import {
  AddOptionGroupInputSchema,
  UpdateOptionGroupInputSchema,
  DeleteOptionGroupInputSchema,
} from "../schema/zod.js";
import type {
  AddOptionGroupInput,
  UpdateOptionGroupInput,
  DeleteOptionGroupInput,
} from "../types.js";
import type {
  AddOptionGroupAction,
  UpdateOptionGroupAction,
  DeleteOptionGroupAction,
} from "./actions.js";

export const addOptionGroup = (input: AddOptionGroupInput) =>
  createAction<AddOptionGroupAction>(
    "ADD_OPTION_GROUP",
    { ...input },
    undefined,
    AddOptionGroupInputSchema,
    "global",
  );

export const updateOptionGroup = (input: UpdateOptionGroupInput) =>
  createAction<UpdateOptionGroupAction>(
    "UPDATE_OPTION_GROUP",
    { ...input },
    undefined,
    UpdateOptionGroupInputSchema,
    "global",
  );

export const deleteOptionGroup = (input: DeleteOptionGroupInput) =>
  createAction<DeleteOptionGroupAction>(
    "DELETE_OPTION_GROUP",
    { ...input },
    undefined,
    DeleteOptionGroupInputSchema,
    "global",
  );
