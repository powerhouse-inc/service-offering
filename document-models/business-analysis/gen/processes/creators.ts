import { createAction } from "document-model/core";
import {
  AddProcessInputSchema,
  UpdateProcessInputSchema,
  RemoveProcessInputSchema,
  AddProcessStepInputSchema,
  UpdateProcessStepInputSchema,
  RemoveProcessStepInputSchema,
  ReorderProcessStepsInputSchema,
} from "../schema/zod.js";
import type {
  AddProcessInput,
  UpdateProcessInput,
  RemoveProcessInput,
  AddProcessStepInput,
  UpdateProcessStepInput,
  RemoveProcessStepInput,
  ReorderProcessStepsInput,
} from "../types.js";
import type {
  AddProcessAction,
  UpdateProcessAction,
  RemoveProcessAction,
  AddProcessStepAction,
  UpdateProcessStepAction,
  RemoveProcessStepAction,
  ReorderProcessStepsAction,
} from "./actions.js";

export const addProcess = (input: AddProcessInput) =>
  createAction<AddProcessAction>(
    "ADD_PROCESS",
    { ...input },
    undefined,
    AddProcessInputSchema,
    "global",
  );

export const updateProcess = (input: UpdateProcessInput) =>
  createAction<UpdateProcessAction>(
    "UPDATE_PROCESS",
    { ...input },
    undefined,
    UpdateProcessInputSchema,
    "global",
  );

export const removeProcess = (input: RemoveProcessInput) =>
  createAction<RemoveProcessAction>(
    "REMOVE_PROCESS",
    { ...input },
    undefined,
    RemoveProcessInputSchema,
    "global",
  );

export const addProcessStep = (input: AddProcessStepInput) =>
  createAction<AddProcessStepAction>(
    "ADD_PROCESS_STEP",
    { ...input },
    undefined,
    AddProcessStepInputSchema,
    "global",
  );

export const updateProcessStep = (input: UpdateProcessStepInput) =>
  createAction<UpdateProcessStepAction>(
    "UPDATE_PROCESS_STEP",
    { ...input },
    undefined,
    UpdateProcessStepInputSchema,
    "global",
  );

export const removeProcessStep = (input: RemoveProcessStepInput) =>
  createAction<RemoveProcessStepAction>(
    "REMOVE_PROCESS_STEP",
    { ...input },
    undefined,
    RemoveProcessStepInputSchema,
    "global",
  );

export const reorderProcessSteps = (input: ReorderProcessStepsInput) =>
  createAction<ReorderProcessStepsAction>(
    "REORDER_PROCESS_STEPS",
    { ...input },
    undefined,
    ReorderProcessStepsInputSchema,
    "global",
  );
