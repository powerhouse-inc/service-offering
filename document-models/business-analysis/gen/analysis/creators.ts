import { createAction } from "document-model/core";
import {
  AddAnalysisInputSchema,
  UpdateAnalysisInputSchema,
  RemoveAnalysisInputSchema,
  AddAnalysisEntryInputSchema,
  UpdateAnalysisEntryInputSchema,
  RemoveAnalysisEntryInputSchema,
} from "../schema/zod.js";
import type {
  AddAnalysisInput,
  UpdateAnalysisInput,
  RemoveAnalysisInput,
  AddAnalysisEntryInput,
  UpdateAnalysisEntryInput,
  RemoveAnalysisEntryInput,
} from "../types.js";
import type {
  AddAnalysisAction,
  UpdateAnalysisAction,
  RemoveAnalysisAction,
  AddAnalysisEntryAction,
  UpdateAnalysisEntryAction,
  RemoveAnalysisEntryAction,
} from "./actions.js";

export const addAnalysis = (input: AddAnalysisInput) =>
  createAction<AddAnalysisAction>(
    "ADD_ANALYSIS",
    { ...input },
    undefined,
    AddAnalysisInputSchema,
    "global",
  );

export const updateAnalysis = (input: UpdateAnalysisInput) =>
  createAction<UpdateAnalysisAction>(
    "UPDATE_ANALYSIS",
    { ...input },
    undefined,
    UpdateAnalysisInputSchema,
    "global",
  );

export const removeAnalysis = (input: RemoveAnalysisInput) =>
  createAction<RemoveAnalysisAction>(
    "REMOVE_ANALYSIS",
    { ...input },
    undefined,
    RemoveAnalysisInputSchema,
    "global",
  );

export const addAnalysisEntry = (input: AddAnalysisEntryInput) =>
  createAction<AddAnalysisEntryAction>(
    "ADD_ANALYSIS_ENTRY",
    { ...input },
    undefined,
    AddAnalysisEntryInputSchema,
    "global",
  );

export const updateAnalysisEntry = (input: UpdateAnalysisEntryInput) =>
  createAction<UpdateAnalysisEntryAction>(
    "UPDATE_ANALYSIS_ENTRY",
    { ...input },
    undefined,
    UpdateAnalysisEntryInputSchema,
    "global",
  );

export const removeAnalysisEntry = (input: RemoveAnalysisEntryInput) =>
  createAction<RemoveAnalysisEntryAction>(
    "REMOVE_ANALYSIS_ENTRY",
    { ...input },
    undefined,
    RemoveAnalysisEntryInputSchema,
    "global",
  );
