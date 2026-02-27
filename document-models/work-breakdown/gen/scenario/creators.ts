import { createAction } from "document-model/core";
import {
  AddInputInputSchema,
  UpdateInputInputSchema,
  RemoveInputInputSchema,
  AddStepInputSchema,
  UpdateStepInputSchema,
  RemoveStepInputSchema,
  AddSubstepInputSchema,
  UpdateSubstepInputSchema,
  RemoveSubstepInputSchema,
} from "../schema/zod.js";
import type {
  AddInputInput,
  UpdateInputInput,
  RemoveInputInput,
  AddStepInput,
  UpdateStepInput,
  RemoveStepInput,
  AddSubstepInput,
  UpdateSubstepInput,
  RemoveSubstepInput,
} from "../types.js";
import type {
  AddInputAction,
  UpdateInputAction,
  RemoveInputAction,
  AddStepAction,
  UpdateStepAction,
  RemoveStepAction,
  AddSubstepAction,
  UpdateSubstepAction,
  RemoveSubstepAction,
} from "./actions.js";

export const addInput = (input: AddInputInput) =>
  createAction<AddInputAction>(
    "ADD_INPUT",
    { ...input },
    undefined,
    AddInputInputSchema,
    "global",
  );

export const updateInput = (input: UpdateInputInput) =>
  createAction<UpdateInputAction>(
    "UPDATE_INPUT",
    { ...input },
    undefined,
    UpdateInputInputSchema,
    "global",
  );

export const removeInput = (input: RemoveInputInput) =>
  createAction<RemoveInputAction>(
    "REMOVE_INPUT",
    { ...input },
    undefined,
    RemoveInputInputSchema,
    "global",
  );

export const addStep = (input: AddStepInput) =>
  createAction<AddStepAction>(
    "ADD_STEP",
    { ...input },
    undefined,
    AddStepInputSchema,
    "global",
  );

export const updateStep = (input: UpdateStepInput) =>
  createAction<UpdateStepAction>(
    "UPDATE_STEP",
    { ...input },
    undefined,
    UpdateStepInputSchema,
    "global",
  );

export const removeStep = (input: RemoveStepInput) =>
  createAction<RemoveStepAction>(
    "REMOVE_STEP",
    { ...input },
    undefined,
    RemoveStepInputSchema,
    "global",
  );

export const addSubstep = (input: AddSubstepInput) =>
  createAction<AddSubstepAction>(
    "ADD_SUBSTEP",
    { ...input },
    undefined,
    AddSubstepInputSchema,
    "global",
  );

export const updateSubstep = (input: UpdateSubstepInput) =>
  createAction<UpdateSubstepAction>(
    "UPDATE_SUBSTEP",
    { ...input },
    undefined,
    UpdateSubstepInputSchema,
    "global",
  );

export const removeSubstep = (input: RemoveSubstepInput) =>
  createAction<RemoveSubstepAction>(
    "REMOVE_SUBSTEP",
    { ...input },
    undefined,
    RemoveSubstepInputSchema,
    "global",
  );
