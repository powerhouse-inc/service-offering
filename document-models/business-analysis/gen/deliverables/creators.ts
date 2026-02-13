import { createAction } from "document-model/core";
import {
  AddDeliverableInputSchema,
  UpdateDeliverableInputSchema,
  RemoveDeliverableInputSchema,
  SetDeliverableStatusInputSchema,
} from "../schema/zod.js";
import type {
  AddDeliverableInput,
  UpdateDeliverableInput,
  RemoveDeliverableInput,
  SetDeliverableStatusInput,
} from "../types.js";
import type {
  AddDeliverableAction,
  UpdateDeliverableAction,
  RemoveDeliverableAction,
  SetDeliverableStatusAction,
} from "./actions.js";

export const addDeliverable = (input: AddDeliverableInput) =>
  createAction<AddDeliverableAction>(
    "ADD_DELIVERABLE",
    { ...input },
    undefined,
    AddDeliverableInputSchema,
    "global",
  );

export const updateDeliverable = (input: UpdateDeliverableInput) =>
  createAction<UpdateDeliverableAction>(
    "UPDATE_DELIVERABLE",
    { ...input },
    undefined,
    UpdateDeliverableInputSchema,
    "global",
  );

export const removeDeliverable = (input: RemoveDeliverableInput) =>
  createAction<RemoveDeliverableAction>(
    "REMOVE_DELIVERABLE",
    { ...input },
    undefined,
    RemoveDeliverableInputSchema,
    "global",
  );

export const setDeliverableStatus = (input: SetDeliverableStatusInput) =>
  createAction<SetDeliverableStatusAction>(
    "SET_DELIVERABLE_STATUS",
    { ...input },
    undefined,
    SetDeliverableStatusInputSchema,
    "global",
  );
