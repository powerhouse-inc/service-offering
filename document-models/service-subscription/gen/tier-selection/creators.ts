import { createAction } from "document-model/core";
import { ChangeTierInputSchema, SetPricingInputSchema } from "../schema/zod.js";
import type { ChangeTierInput, SetPricingInput } from "../types.js";
import type { ChangeTierAction, SetPricingAction } from "./actions.js";

export const changeTier = (input: ChangeTierInput) =>
  createAction<ChangeTierAction>(
    "CHANGE_TIER",
    { ...input },
    undefined,
    ChangeTierInputSchema,
    "global",
  );

export const setPricing = (input: SetPricingInput) =>
  createAction<SetPricingAction>(
    "SET_PRICING",
    { ...input },
    undefined,
    SetPricingInputSchema,
    "global",
  );
