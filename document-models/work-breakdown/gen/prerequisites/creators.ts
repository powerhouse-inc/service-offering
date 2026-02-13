import { createAction } from "document-model/core";
import {
  AddPrerequisiteInputSchema,
  UpdatePrerequisiteInputSchema,
  RemovePrerequisiteInputSchema,
  SetPrerequisiteStatusInputSchema,
} from "../schema/zod.js";
import type {
  AddPrerequisiteInput,
  UpdatePrerequisiteInput,
  RemovePrerequisiteInput,
  SetPrerequisiteStatusInput,
} from "../types.js";
import type {
  AddPrerequisiteAction,
  UpdatePrerequisiteAction,
  RemovePrerequisiteAction,
  SetPrerequisiteStatusAction,
} from "./actions.js";

export const addPrerequisite = (input: AddPrerequisiteInput) =>
  createAction<AddPrerequisiteAction>(
    "ADD_PREREQUISITE",
    { ...input },
    undefined,
    AddPrerequisiteInputSchema,
    "global",
  );

export const updatePrerequisite = (input: UpdatePrerequisiteInput) =>
  createAction<UpdatePrerequisiteAction>(
    "UPDATE_PREREQUISITE",
    { ...input },
    undefined,
    UpdatePrerequisiteInputSchema,
    "global",
  );

export const removePrerequisite = (input: RemovePrerequisiteInput) =>
  createAction<RemovePrerequisiteAction>(
    "REMOVE_PREREQUISITE",
    { ...input },
    undefined,
    RemovePrerequisiteInputSchema,
    "global",
  );

export const setPrerequisiteStatus = (input: SetPrerequisiteStatusInput) =>
  createAction<SetPrerequisiteStatusAction>(
    "SET_PREREQUISITE_STATUS",
    { ...input },
    undefined,
    SetPrerequisiteStatusInputSchema,
    "global",
  );
