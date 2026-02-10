import type { Action } from "document-model";
import type {
  AddTierInput,
  UpdateTierInput,
  UpdateTierPricingInput,
  DeleteTierInput,
  AddTierPricingOptionInput,
  UpdateTierPricingOptionInput,
  RemoveTierPricingOptionInput,
  AddServiceLevelInput,
  UpdateServiceLevelInput,
  RemoveServiceLevelInput,
  AddUsageLimitInput,
  UpdateUsageLimitInput,
  RemoveUsageLimitInput,
} from "../types.js";

export type AddTierAction = Action & { type: "ADD_TIER"; input: AddTierInput };
export type UpdateTierAction = Action & {
  type: "UPDATE_TIER";
  input: UpdateTierInput;
};
export type UpdateTierPricingAction = Action & {
  type: "UPDATE_TIER_PRICING";
  input: UpdateTierPricingInput;
};
export type DeleteTierAction = Action & {
  type: "DELETE_TIER";
  input: DeleteTierInput;
};
export type AddTierPricingOptionAction = Action & {
  type: "ADD_TIER_PRICING_OPTION";
  input: AddTierPricingOptionInput;
};
export type UpdateTierPricingOptionAction = Action & {
  type: "UPDATE_TIER_PRICING_OPTION";
  input: UpdateTierPricingOptionInput;
};
export type RemoveTierPricingOptionAction = Action & {
  type: "REMOVE_TIER_PRICING_OPTION";
  input: RemoveTierPricingOptionInput;
};
export type AddServiceLevelAction = Action & {
  type: "ADD_SERVICE_LEVEL";
  input: AddServiceLevelInput;
};
export type UpdateServiceLevelAction = Action & {
  type: "UPDATE_SERVICE_LEVEL";
  input: UpdateServiceLevelInput;
};
export type RemoveServiceLevelAction = Action & {
  type: "REMOVE_SERVICE_LEVEL";
  input: RemoveServiceLevelInput;
};
export type AddUsageLimitAction = Action & {
  type: "ADD_USAGE_LIMIT";
  input: AddUsageLimitInput;
};
export type UpdateUsageLimitAction = Action & {
  type: "UPDATE_USAGE_LIMIT";
  input: UpdateUsageLimitInput;
};
export type RemoveUsageLimitAction = Action & {
  type: "REMOVE_USAGE_LIMIT";
  input: RemoveUsageLimitInput;
};

export type ServiceOfferingTierManagementAction =
  | AddTierAction
  | UpdateTierAction
  | UpdateTierPricingAction
  | DeleteTierAction
  | AddTierPricingOptionAction
  | UpdateTierPricingOptionAction
  | RemoveTierPricingOptionAction
  | AddServiceLevelAction
  | UpdateServiceLevelAction
  | RemoveServiceLevelAction
  | AddUsageLimitAction
  | UpdateUsageLimitAction
  | RemoveUsageLimitAction;
