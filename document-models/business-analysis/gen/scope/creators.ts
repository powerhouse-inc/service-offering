import { createAction } from "document-model/core";
import {
  AddAssumptionInputSchema,
  UpdateAssumptionInputSchema,
  RemoveAssumptionInputSchema,
  SetAssumptionStatusInputSchema,
  AddScopeItemInputSchema,
  UpdateScopeItemInputSchema,
  RemoveScopeItemInputSchema,
} from "../schema/zod.js";
import type {
  AddAssumptionInput,
  UpdateAssumptionInput,
  RemoveAssumptionInput,
  SetAssumptionStatusInput,
  AddScopeItemInput,
  UpdateScopeItemInput,
  RemoveScopeItemInput,
} from "../types.js";
import type {
  AddAssumptionAction,
  UpdateAssumptionAction,
  RemoveAssumptionAction,
  SetAssumptionStatusAction,
  AddScopeItemAction,
  UpdateScopeItemAction,
  RemoveScopeItemAction,
} from "./actions.js";

export const addAssumption = (input: AddAssumptionInput) =>
  createAction<AddAssumptionAction>(
    "ADD_ASSUMPTION",
    { ...input },
    undefined,
    AddAssumptionInputSchema,
    "global",
  );

export const updateAssumption = (input: UpdateAssumptionInput) =>
  createAction<UpdateAssumptionAction>(
    "UPDATE_ASSUMPTION",
    { ...input },
    undefined,
    UpdateAssumptionInputSchema,
    "global",
  );

export const removeAssumption = (input: RemoveAssumptionInput) =>
  createAction<RemoveAssumptionAction>(
    "REMOVE_ASSUMPTION",
    { ...input },
    undefined,
    RemoveAssumptionInputSchema,
    "global",
  );

export const setAssumptionStatus = (input: SetAssumptionStatusInput) =>
  createAction<SetAssumptionStatusAction>(
    "SET_ASSUMPTION_STATUS",
    { ...input },
    undefined,
    SetAssumptionStatusInputSchema,
    "global",
  );

export const addScopeItem = (input: AddScopeItemInput) =>
  createAction<AddScopeItemAction>(
    "ADD_SCOPE_ITEM",
    { ...input },
    undefined,
    AddScopeItemInputSchema,
    "global",
  );

export const updateScopeItem = (input: UpdateScopeItemInput) =>
  createAction<UpdateScopeItemAction>(
    "UPDATE_SCOPE_ITEM",
    { ...input },
    undefined,
    UpdateScopeItemInputSchema,
    "global",
  );

export const removeScopeItem = (input: RemoveScopeItemInput) =>
  createAction<RemoveScopeItemAction>(
    "REMOVE_SCOPE_ITEM",
    { ...input },
    undefined,
    RemoveScopeItemInputSchema,
    "global",
  );
