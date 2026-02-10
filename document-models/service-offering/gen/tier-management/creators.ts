import { createAction } from "document-model/core";
import {
  AddTierInputSchema,
  UpdateTierInputSchema,
  UpdateTierPricingInputSchema,
  DeleteTierInputSchema,
  AddTierPricingOptionInputSchema,
  UpdateTierPricingOptionInputSchema,
  RemoveTierPricingOptionInputSchema,
  AddServiceLevelInputSchema,
  UpdateServiceLevelInputSchema,
  RemoveServiceLevelInputSchema,
  AddUsageLimitInputSchema,
  UpdateUsageLimitInputSchema,
  RemoveUsageLimitInputSchema,
} from "../schema/zod.js";
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
import type {
  AddTierAction,
  UpdateTierAction,
  UpdateTierPricingAction,
  DeleteTierAction,
  AddTierPricingOptionAction,
  UpdateTierPricingOptionAction,
  RemoveTierPricingOptionAction,
  AddServiceLevelAction,
  UpdateServiceLevelAction,
  RemoveServiceLevelAction,
  AddUsageLimitAction,
  UpdateUsageLimitAction,
  RemoveUsageLimitAction,
} from "./actions.js";

export const addTier = (input: AddTierInput) =>
  createAction<AddTierAction>(
    "ADD_TIER",
    { ...input },
    undefined,
    AddTierInputSchema,
    "global",
  );

export const updateTier = (input: UpdateTierInput) =>
  createAction<UpdateTierAction>(
    "UPDATE_TIER",
    { ...input },
    undefined,
    UpdateTierInputSchema,
    "global",
  );

export const updateTierPricing = (input: UpdateTierPricingInput) =>
  createAction<UpdateTierPricingAction>(
    "UPDATE_TIER_PRICING",
    { ...input },
    undefined,
    UpdateTierPricingInputSchema,
    "global",
  );

export const deleteTier = (input: DeleteTierInput) =>
  createAction<DeleteTierAction>(
    "DELETE_TIER",
    { ...input },
    undefined,
    DeleteTierInputSchema,
    "global",
  );

export const addTierPricingOption = (input: AddTierPricingOptionInput) =>
  createAction<AddTierPricingOptionAction>(
    "ADD_TIER_PRICING_OPTION",
    { ...input },
    undefined,
    AddTierPricingOptionInputSchema,
    "global",
  );

export const updateTierPricingOption = (input: UpdateTierPricingOptionInput) =>
  createAction<UpdateTierPricingOptionAction>(
    "UPDATE_TIER_PRICING_OPTION",
    { ...input },
    undefined,
    UpdateTierPricingOptionInputSchema,
    "global",
  );

export const removeTierPricingOption = (input: RemoveTierPricingOptionInput) =>
  createAction<RemoveTierPricingOptionAction>(
    "REMOVE_TIER_PRICING_OPTION",
    { ...input },
    undefined,
    RemoveTierPricingOptionInputSchema,
    "global",
  );

export const addServiceLevel = (input: AddServiceLevelInput) =>
  createAction<AddServiceLevelAction>(
    "ADD_SERVICE_LEVEL",
    { ...input },
    undefined,
    AddServiceLevelInputSchema,
    "global",
  );

export const updateServiceLevel = (input: UpdateServiceLevelInput) =>
  createAction<UpdateServiceLevelAction>(
    "UPDATE_SERVICE_LEVEL",
    { ...input },
    undefined,
    UpdateServiceLevelInputSchema,
    "global",
  );

export const removeServiceLevel = (input: RemoveServiceLevelInput) =>
  createAction<RemoveServiceLevelAction>(
    "REMOVE_SERVICE_LEVEL",
    { ...input },
    undefined,
    RemoveServiceLevelInputSchema,
    "global",
  );

export const addUsageLimit = (input: AddUsageLimitInput) =>
  createAction<AddUsageLimitAction>(
    "ADD_USAGE_LIMIT",
    { ...input },
    undefined,
    AddUsageLimitInputSchema,
    "global",
  );

export const updateUsageLimit = (input: UpdateUsageLimitInput) =>
  createAction<UpdateUsageLimitAction>(
    "UPDATE_USAGE_LIMIT",
    { ...input },
    undefined,
    UpdateUsageLimitInputSchema,
    "global",
  );

export const removeUsageLimit = (input: RemoveUsageLimitInput) =>
  createAction<RemoveUsageLimitAction>(
    "REMOVE_USAGE_LIMIT",
    { ...input },
    undefined,
    RemoveUsageLimitInputSchema,
    "global",
  );
