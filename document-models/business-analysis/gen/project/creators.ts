import { createAction } from "document-model/core";
import {
  SetProjectInfoInputSchema,
  SetProjectPhaseInputSchema,
  SetProjectStatusInputSchema,
} from "../schema/zod.js";
import type {
  SetProjectInfoInput,
  SetProjectPhaseInput,
  SetProjectStatusInput,
} from "../types.js";
import type {
  SetProjectInfoAction,
  SetProjectPhaseAction,
  SetProjectStatusAction,
} from "./actions.js";

export const setProjectInfo = (input: SetProjectInfoInput) =>
  createAction<SetProjectInfoAction>(
    "SET_PROJECT_INFO",
    { ...input },
    undefined,
    SetProjectInfoInputSchema,
    "global",
  );

export const setProjectPhase = (input: SetProjectPhaseInput) =>
  createAction<SetProjectPhaseAction>(
    "SET_PROJECT_PHASE",
    { ...input },
    undefined,
    SetProjectPhaseInputSchema,
    "global",
  );

export const setProjectStatus = (input: SetProjectStatusInput) =>
  createAction<SetProjectStatusAction>(
    "SET_PROJECT_STATUS",
    { ...input },
    undefined,
    SetProjectStatusInputSchema,
    "global",
  );
