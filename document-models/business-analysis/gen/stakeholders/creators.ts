import { createAction } from "document-model/core";
import {
  AddStakeholderInputSchema,
  UpdateStakeholderInputSchema,
  RemoveStakeholderInputSchema,
  SetEngagementLevelInputSchema,
} from "../schema/zod.js";
import type {
  AddStakeholderInput,
  UpdateStakeholderInput,
  RemoveStakeholderInput,
  SetEngagementLevelInput,
} from "../types.js";
import type {
  AddStakeholderAction,
  UpdateStakeholderAction,
  RemoveStakeholderAction,
  SetEngagementLevelAction,
} from "./actions.js";

export const addStakeholder = (input: AddStakeholderInput) =>
  createAction<AddStakeholderAction>(
    "ADD_STAKEHOLDER",
    { ...input },
    undefined,
    AddStakeholderInputSchema,
    "global",
  );

export const updateStakeholder = (input: UpdateStakeholderInput) =>
  createAction<UpdateStakeholderAction>(
    "UPDATE_STAKEHOLDER",
    { ...input },
    undefined,
    UpdateStakeholderInputSchema,
    "global",
  );

export const removeStakeholder = (input: RemoveStakeholderInput) =>
  createAction<RemoveStakeholderAction>(
    "REMOVE_STAKEHOLDER",
    { ...input },
    undefined,
    RemoveStakeholderInputSchema,
    "global",
  );

export const setEngagementLevel = (input: SetEngagementLevelInput) =>
  createAction<SetEngagementLevelAction>(
    "SET_ENGAGEMENT_LEVEL",
    { ...input },
    undefined,
    SetEngagementLevelInputSchema,
    "global",
  );
