import { createAction } from "document-model/core";
import {
  SetSetupServicesInputSchema,
  SetRecurringServicesInputSchema,
} from "../schema/zod.js";
import type {
  SetSetupServicesInput,
  SetRecurringServicesInput,
} from "../types.js";
import type {
  SetSetupServicesAction,
  SetRecurringServicesAction,
} from "./actions.js";

export const setSetupServices = (input: SetSetupServicesInput) =>
  createAction<SetSetupServicesAction>(
    "SET_SETUP_SERVICES",
    { ...input },
    undefined,
    SetSetupServicesInputSchema,
    "global",
  );

export const setRecurringServices = (input: SetRecurringServicesInput) =>
  createAction<SetRecurringServicesAction>(
    "SET_RECURRING_SERVICES",
    { ...input },
    undefined,
    SetRecurringServicesInputSchema,
    "global",
  );
