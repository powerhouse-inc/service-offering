import { createAction } from "document-model/core";
import {
  SetProjectInfoInputSchema,
  SetPhaseInputSchema,
  SetStatusInputSchema,
} from "../schema/zod.js";
import type {
  SetProjectInfoInput,
  SetPhaseInput,
  SetStatusInput,
} from "../types.js";
import type {
  SetProjectInfoAction,
  SetPhaseAction,
  SetStatusAction,
} from "./actions.js";

export const setProjectInfo = (input: SetProjectInfoInput) =>
  createAction<SetProjectInfoAction>(
    "SET_PROJECT_INFO",
    { ...input },
    undefined,
    SetProjectInfoInputSchema,
    "global",
  );

export const setPhase = (input: SetPhaseInput) =>
  createAction<SetPhaseAction>(
    "SET_PHASE",
    { ...input },
    undefined,
    SetPhaseInputSchema,
    "global",
  );

export const setStatus = (input: SetStatusInput) =>
  createAction<SetStatusAction>(
    "SET_STATUS",
    { ...input },
    undefined,
    SetStatusInputSchema,
    "global",
  );
