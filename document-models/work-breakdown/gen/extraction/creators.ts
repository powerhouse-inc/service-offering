import { createAction } from "document-model/core";
import {
  SetAiContextInputSchema,
  AddExtractionRecordInputSchema,
  UpdateExtractionRecordInputSchema,
  ClearExtractionHistoryInputSchema,
} from "../schema/zod.js";
import type {
  SetAiContextInput,
  AddExtractionRecordInput,
  UpdateExtractionRecordInput,
  ClearExtractionHistoryInput,
} from "../types.js";
import type {
  SetAiContextAction,
  AddExtractionRecordAction,
  UpdateExtractionRecordAction,
  ClearExtractionHistoryAction,
} from "./actions.js";

export const setAiContext = (input: SetAiContextInput) =>
  createAction<SetAiContextAction>(
    "SET_AI_CONTEXT",
    { ...input },
    undefined,
    SetAiContextInputSchema,
    "global",
  );

export const addExtractionRecord = (input: AddExtractionRecordInput) =>
  createAction<AddExtractionRecordAction>(
    "ADD_EXTRACTION_RECORD",
    { ...input },
    undefined,
    AddExtractionRecordInputSchema,
    "global",
  );

export const updateExtractionRecord = (input: UpdateExtractionRecordInput) =>
  createAction<UpdateExtractionRecordAction>(
    "UPDATE_EXTRACTION_RECORD",
    { ...input },
    undefined,
    UpdateExtractionRecordInputSchema,
    "global",
  );

export const clearExtractionHistory = (input: ClearExtractionHistoryInput) =>
  createAction<ClearExtractionHistoryAction>(
    "CLEAR_EXTRACTION_HISTORY",
    { ...input },
    undefined,
    ClearExtractionHistoryInputSchema,
    "global",
  );
