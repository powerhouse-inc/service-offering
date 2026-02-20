import { createAction } from "document-model/core";
import {
  SetFinalConfigurationInputSchema,
  ClearFinalConfigurationInputSchema,
} from "../schema/zod.js";
import type {
  SetFinalConfigurationInput,
  ClearFinalConfigurationInput,
} from "../types.js";
import type {
  SetFinalConfigurationAction,
  ClearFinalConfigurationAction,
} from "./actions.js";

export const setFinalConfiguration = (input: SetFinalConfigurationInput) =>
  createAction<SetFinalConfigurationAction>(
    "SET_FINAL_CONFIGURATION",
    { ...input },
    undefined,
    SetFinalConfigurationInputSchema,
    "global",
  );

export const clearFinalConfiguration = (input: ClearFinalConfigurationInput) =>
  createAction<ClearFinalConfigurationAction>(
    "CLEAR_FINAL_CONFIGURATION",
    { ...input },
    undefined,
    ClearFinalConfigurationInputSchema,
    "global",
  );
