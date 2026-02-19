import type { Action } from "document-model";
import type {
  AddServiceGroupInput,
  UpdateServiceGroupInput,
  DeleteServiceGroupInput,
  ReorderServiceGroupsInput,
  AddServiceGroupTierPricingInput,
  SetServiceGroupSetupCostInput,
  RemoveServiceGroupSetupCostInput,
  AddRecurringPriceOptionInput,
  UpdateRecurringPriceOptionInput,
  RemoveRecurringPriceOptionInput,
  RemoveServiceGroupTierPricingInput,
} from "../types.js";

export type AddServiceGroupAction = Action & {
  type: "ADD_SERVICE_GROUP";
  input: AddServiceGroupInput;
};
export type UpdateServiceGroupAction = Action & {
  type: "UPDATE_SERVICE_GROUP";
  input: UpdateServiceGroupInput;
};
export type DeleteServiceGroupAction = Action & {
  type: "DELETE_SERVICE_GROUP";
  input: DeleteServiceGroupInput;
};
export type ReorderServiceGroupsAction = Action & {
  type: "REORDER_SERVICE_GROUPS";
  input: ReorderServiceGroupsInput;
};
export type AddServiceGroupTierPricingAction = Action & {
  type: "ADD_SERVICE_GROUP_TIER_PRICING";
  input: AddServiceGroupTierPricingInput;
};
export type SetServiceGroupSetupCostAction = Action & {
  type: "SET_SERVICE_GROUP_SETUP_COST";
  input: SetServiceGroupSetupCostInput;
};
export type RemoveServiceGroupSetupCostAction = Action & {
  type: "REMOVE_SERVICE_GROUP_SETUP_COST";
  input: RemoveServiceGroupSetupCostInput;
};
export type AddRecurringPriceOptionAction = Action & {
  type: "ADD_RECURRING_PRICE_OPTION";
  input: AddRecurringPriceOptionInput;
};
export type UpdateRecurringPriceOptionAction = Action & {
  type: "UPDATE_RECURRING_PRICE_OPTION";
  input: UpdateRecurringPriceOptionInput;
};
export type RemoveRecurringPriceOptionAction = Action & {
  type: "REMOVE_RECURRING_PRICE_OPTION";
  input: RemoveRecurringPriceOptionInput;
};
export type RemoveServiceGroupTierPricingAction = Action & {
  type: "REMOVE_SERVICE_GROUP_TIER_PRICING";
  input: RemoveServiceGroupTierPricingInput;
};

export type ServiceOfferingServiceGroupManagementAction =
  | AddServiceGroupAction
  | UpdateServiceGroupAction
  | DeleteServiceGroupAction
  | ReorderServiceGroupsAction
  | AddServiceGroupTierPricingAction
  | SetServiceGroupSetupCostAction
  | RemoveServiceGroupSetupCostAction
  | AddRecurringPriceOptionAction
  | UpdateRecurringPriceOptionAction
  | RemoveRecurringPriceOptionAction
  | RemoveServiceGroupTierPricingAction;
