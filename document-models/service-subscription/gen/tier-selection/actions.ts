import type { Action } from "document-model";
import type { ChangeTierInput, SetPricingInput } from "../types.js";

export type ChangeTierAction = Action & {
  type: "CHANGE_TIER";
  input: ChangeTierInput;
};
export type SetPricingAction = Action & {
  type: "SET_PRICING";
  input: SetPricingInput;
};

export type ServiceSubscriptionTierSelectionAction =
  | ChangeTierAction
  | SetPricingAction;
