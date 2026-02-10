import { createAction } from "document-model/core";
import {
  AddServiceGroupInputSchema,
  UpdateServiceGroupInputSchema,
  DeleteServiceGroupInputSchema,
  ReorderServiceGroupsInputSchema,
} from "../schema/zod.js";
import type {
  AddServiceGroupInput,
  UpdateServiceGroupInput,
  DeleteServiceGroupInput,
  ReorderServiceGroupsInput,
} from "../types.js";
import type {
  AddServiceGroupAction,
  UpdateServiceGroupAction,
  DeleteServiceGroupAction,
  ReorderServiceGroupsAction,
} from "./actions.js";

export const addServiceGroup = (input: AddServiceGroupInput) =>
  createAction<AddServiceGroupAction>(
    "ADD_SERVICE_GROUP",
    { ...input },
    undefined,
    AddServiceGroupInputSchema,
    "global",
  );

export const updateServiceGroup = (input: UpdateServiceGroupInput) =>
  createAction<UpdateServiceGroupAction>(
    "UPDATE_SERVICE_GROUP",
    { ...input },
    undefined,
    UpdateServiceGroupInputSchema,
    "global",
  );

export const deleteServiceGroup = (input: DeleteServiceGroupInput) =>
  createAction<DeleteServiceGroupAction>(
    "DELETE_SERVICE_GROUP",
    { ...input },
    undefined,
    DeleteServiceGroupInputSchema,
    "global",
  );

export const reorderServiceGroups = (input: ReorderServiceGroupsInput) =>
  createAction<ReorderServiceGroupsAction>(
    "REORDER_SERVICE_GROUPS",
    { ...input },
    undefined,
    ReorderServiceGroupsInputSchema,
    "global",
  );
