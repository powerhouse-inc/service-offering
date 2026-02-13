import { createAction } from "document-model/core";
import {
  AddDependencyInputSchema,
  UpdateDependencyInputSchema,
  RemoveDependencyInputSchema,
} from "../schema/zod.js";
import type {
  AddDependencyInput,
  UpdateDependencyInput,
  RemoveDependencyInput,
} from "../types.js";
import type {
  AddDependencyAction,
  UpdateDependencyAction,
  RemoveDependencyAction,
} from "./actions.js";

export const addDependency = (input: AddDependencyInput) =>
  createAction<AddDependencyAction>(
    "ADD_DEPENDENCY",
    { ...input },
    undefined,
    AddDependencyInputSchema,
    "global",
  );

export const updateDependency = (input: UpdateDependencyInput) =>
  createAction<UpdateDependencyAction>(
    "UPDATE_DEPENDENCY",
    { ...input },
    undefined,
    UpdateDependencyInputSchema,
    "global",
  );

export const removeDependency = (input: RemoveDependencyInput) =>
  createAction<RemoveDependencyAction>(
    "REMOVE_DEPENDENCY",
    { ...input },
    undefined,
    RemoveDependencyInputSchema,
    "global",
  );
