import { createAction } from "document-model/core";
import {
  AddOptionGroupInputSchema,
  UpdateOptionGroupInputSchema,
  DeleteOptionGroupInputSchema,
  SetOptionGroupStandalonePricingInputSchema,
  AddOptionGroupTierPricingInputSchema,
  UpdateOptionGroupTierPricingInputSchema,
  RemoveOptionGroupTierPricingInputSchema,
} from "../schema/zod.js";
import type {
  AddOptionGroupInput,
  UpdateOptionGroupInput,
  DeleteOptionGroupInput,
  SetOptionGroupStandalonePricingInput,
  AddOptionGroupTierPricingInput,
  UpdateOptionGroupTierPricingInput,
  RemoveOptionGroupTierPricingInput,
} from "../types.js";
import type {
  AddOptionGroupAction,
  UpdateOptionGroupAction,
  DeleteOptionGroupAction,
  SetOptionGroupStandalonePricingAction,
  AddOptionGroupTierPricingAction,
  UpdateOptionGroupTierPricingAction,
  RemoveOptionGroupTierPricingAction,
} from "./actions.js";

export const addOptionGroup = (input: AddOptionGroupInput) =>
  createAction<AddOptionGroupAction>(
    "ADD_OPTION_GROUP",
    { ...input },
    undefined,
    AddOptionGroupInputSchema,
    "global",
  );

export const updateOptionGroup = (input: UpdateOptionGroupInput) =>
  createAction<UpdateOptionGroupAction>(
    "UPDATE_OPTION_GROUP",
    { ...input },
    undefined,
    UpdateOptionGroupInputSchema,
    "global",
  );

export const deleteOptionGroup = (input: DeleteOptionGroupInput) =>
  createAction<DeleteOptionGroupAction>(
    "DELETE_OPTION_GROUP",
    { ...input },
    undefined,
    DeleteOptionGroupInputSchema,
    "global",
  );

export const setOptionGroupStandalonePricing = (
  input: SetOptionGroupStandalonePricingInput,
) =>
  createAction<SetOptionGroupStandalonePricingAction>(
    "SET_OPTION_GROUP_STANDALONE_PRICING",
    { ...input },
    undefined,
    SetOptionGroupStandalonePricingInputSchema,
    "global",
  );

export const addOptionGroupTierPricing = (
  input: AddOptionGroupTierPricingInput,
) =>
  createAction<AddOptionGroupTierPricingAction>(
    "ADD_OPTION_GROUP_TIER_PRICING",
    { ...input },
    undefined,
    AddOptionGroupTierPricingInputSchema,
    "global",
  );

export const updateOptionGroupTierPricing = (
  input: UpdateOptionGroupTierPricingInput,
) =>
  createAction<UpdateOptionGroupTierPricingAction>(
    "UPDATE_OPTION_GROUP_TIER_PRICING",
    { ...input },
    undefined,
    UpdateOptionGroupTierPricingInputSchema,
    "global",
  );

export const removeOptionGroupTierPricing = (
  input: RemoveOptionGroupTierPricingInput,
) =>
  createAction<RemoveOptionGroupTierPricingAction>(
    "REMOVE_OPTION_GROUP_TIER_PRICING",
    { ...input },
    undefined,
    RemoveOptionGroupTierPricingInputSchema,
    "global",
  );
