import { createAction } from "document-model/core";
import {
  AddOptionGroupInputSchema,
  UpdateOptionGroupInputSchema,
  DeleteOptionGroupInputSchema,
  AddFaqInputSchema,
  UpdateFaqInputSchema,
  DeleteFaqInputSchema,
  ReorderFaqsInputSchema,
} from "../schema/zod.js";
import type {
  AddOptionGroupInput,
  UpdateOptionGroupInput,
  DeleteOptionGroupInput,
  AddFaqInput,
  UpdateFaqInput,
  DeleteFaqInput,
  ReorderFaqsInput,
} from "../types.js";
import type {
  AddOptionGroupAction,
  UpdateOptionGroupAction,
  DeleteOptionGroupAction,
  AddFaqAction,
  UpdateFaqAction,
  DeleteFaqAction,
  ReorderFaqsAction,
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

export const addFaq = (input: AddFaqInput) =>
  createAction<AddFaqAction>(
    "ADD_FAQ",
    { ...input },
    undefined,
    AddFaqInputSchema,
    "global",
  );

export const updateFaq = (input: UpdateFaqInput) =>
  createAction<UpdateFaqAction>(
    "UPDATE_FAQ",
    { ...input },
    undefined,
    UpdateFaqInputSchema,
    "global",
  );

export const deleteFaq = (input: DeleteFaqInput) =>
  createAction<DeleteFaqAction>(
    "DELETE_FAQ",
    { ...input },
    undefined,
    DeleteFaqInputSchema,
    "global",
  );

export const reorderFaqs = (input: ReorderFaqsInput) =>
  createAction<ReorderFaqsAction>(
    "REORDER_FAQS",
    { ...input },
    undefined,
    ReorderFaqsInputSchema,
    "global",
  );
