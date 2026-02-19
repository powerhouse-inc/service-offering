import { createAction } from "document-model/core";
import {
  AddServiceGroupInputSchema,
  UpdateServiceGroupInputSchema,
  DeleteServiceGroupInputSchema,
  ReorderServiceGroupsInputSchema,
  AddServiceGroupTierPricingInputSchema,
  SetServiceGroupSetupCostInputSchema,
  RemoveServiceGroupSetupCostInputSchema,
  AddRecurringPriceOptionInputSchema,
  UpdateRecurringPriceOptionInputSchema,
  RemoveRecurringPriceOptionInputSchema,
  RemoveServiceGroupTierPricingInputSchema,
} from "../schema/zod.js";
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
import type {
  AddServiceGroupAction,
  UpdateServiceGroupAction,
  DeleteServiceGroupAction,
  ReorderServiceGroupsAction,
  AddServiceGroupTierPricingAction,
  SetServiceGroupSetupCostAction,
  RemoveServiceGroupSetupCostAction,
  AddRecurringPriceOptionAction,
  UpdateRecurringPriceOptionAction,
  RemoveRecurringPriceOptionAction,
  RemoveServiceGroupTierPricingAction,
} from "./actions.js";

export const addServiceGroup = (input: AddServiceGroupInput) =>
  createAction<AddServiceGroupAction>(
    "ADD_SERVICE_GROUP",
    { ...input },
    undefined,
    AddServiceGroupInputSchema,
    "global",
  );

export const updateServiceGroup = (input: UpdateServiceGroupInput) =>
  createAction<UpdateServiceGroupAction>(
    "UPDATE_SERVICE_GROUP",
    { ...input },
    undefined,
    UpdateServiceGroupInputSchema,
    "global",
  );

export const deleteServiceGroup = (input: DeleteServiceGroupInput) =>
  createAction<DeleteServiceGroupAction>(
    "DELETE_SERVICE_GROUP",
    { ...input },
    undefined,
    DeleteServiceGroupInputSchema,
    "global",
  );

export const reorderServiceGroups = (input: ReorderServiceGroupsInput) =>
  createAction<ReorderServiceGroupsAction>(
    "REORDER_SERVICE_GROUPS",
    { ...input },
    undefined,
    ReorderServiceGroupsInputSchema,
    "global",
  );

export const addServiceGroupTierPricing = (
  input: AddServiceGroupTierPricingInput,
) =>
  createAction<AddServiceGroupTierPricingAction>(
    "ADD_SERVICE_GROUP_TIER_PRICING",
    { ...input },
    undefined,
    AddServiceGroupTierPricingInputSchema,
    "global",
  );

export const setServiceGroupSetupCost = (
  input: SetServiceGroupSetupCostInput,
) =>
  createAction<SetServiceGroupSetupCostAction>(
    "SET_SERVICE_GROUP_SETUP_COST",
    { ...input },
    undefined,
    SetServiceGroupSetupCostInputSchema,
    "global",
  );

export const removeServiceGroupSetupCost = (
  input: RemoveServiceGroupSetupCostInput,
) =>
  createAction<RemoveServiceGroupSetupCostAction>(
    "REMOVE_SERVICE_GROUP_SETUP_COST",
    { ...input },
    undefined,
    RemoveServiceGroupSetupCostInputSchema,
    "global",
  );

export const addRecurringPriceOption = (input: AddRecurringPriceOptionInput) =>
  createAction<AddRecurringPriceOptionAction>(
    "ADD_RECURRING_PRICE_OPTION",
    { ...input },
    undefined,
    AddRecurringPriceOptionInputSchema,
    "global",
  );

export const updateRecurringPriceOption = (
  input: UpdateRecurringPriceOptionInput,
) =>
  createAction<UpdateRecurringPriceOptionAction>(
    "UPDATE_RECURRING_PRICE_OPTION",
    { ...input },
    undefined,
    UpdateRecurringPriceOptionInputSchema,
    "global",
  );

export const removeRecurringPriceOption = (
  input: RemoveRecurringPriceOptionInput,
) =>
  createAction<RemoveRecurringPriceOptionAction>(
    "REMOVE_RECURRING_PRICE_OPTION",
    { ...input },
    undefined,
    RemoveRecurringPriceOptionInputSchema,
    "global",
  );

export const removeServiceGroupTierPricing = (
  input: RemoveServiceGroupTierPricingInput,
) =>
  createAction<RemoveServiceGroupTierPricingAction>(
    "REMOVE_SERVICE_GROUP_TIER_PRICING",
    { ...input },
    undefined,
    RemoveServiceGroupTierPricingInputSchema,
    "global",
  );
