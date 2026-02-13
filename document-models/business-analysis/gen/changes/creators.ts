import { createAction } from "document-model/core";
import {
  AddChangeRequestInputSchema,
  UpdateChangeRequestInputSchema,
  SetChangeRequestStatusInputSchema,
} from "../schema/zod.js";
import type {
  AddChangeRequestInput,
  UpdateChangeRequestInput,
  SetChangeRequestStatusInput,
} from "../types.js";
import type {
  AddChangeRequestAction,
  UpdateChangeRequestAction,
  SetChangeRequestStatusAction,
} from "./actions.js";

export const addChangeRequest = (input: AddChangeRequestInput) =>
  createAction<AddChangeRequestAction>(
    "ADD_CHANGE_REQUEST",
    { ...input },
    undefined,
    AddChangeRequestInputSchema,
    "global",
  );

export const updateChangeRequest = (input: UpdateChangeRequestInput) =>
  createAction<UpdateChangeRequestAction>(
    "UPDATE_CHANGE_REQUEST",
    { ...input },
    undefined,
    UpdateChangeRequestInputSchema,
    "global",
  );

export const setChangeRequestStatus = (input: SetChangeRequestStatusInput) =>
  createAction<SetChangeRequestStatusAction>(
    "SET_CHANGE_REQUEST_STATUS",
    { ...input },
    undefined,
    SetChangeRequestStatusInputSchema,
    "global",
  );
