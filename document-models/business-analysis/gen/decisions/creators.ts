import { createAction } from "document-model/core";
import {
  AddDecisionInputSchema,
  UpdateDecisionInputSchema,
  RemoveDecisionInputSchema,
  SetDecisionStatusInputSchema,
} from "../schema/zod.js";
import type {
  AddDecisionInput,
  UpdateDecisionInput,
  RemoveDecisionInput,
  SetDecisionStatusInput,
} from "../types.js";
import type {
  AddDecisionAction,
  UpdateDecisionAction,
  RemoveDecisionAction,
  SetDecisionStatusAction,
} from "./actions.js";

export const addDecision = (input: AddDecisionInput) =>
  createAction<AddDecisionAction>(
    "ADD_DECISION",
    { ...input },
    undefined,
    AddDecisionInputSchema,
    "global",
  );

export const updateDecision = (input: UpdateDecisionInput) =>
  createAction<UpdateDecisionAction>(
    "UPDATE_DECISION",
    { ...input },
    undefined,
    UpdateDecisionInputSchema,
    "global",
  );

export const removeDecision = (input: RemoveDecisionInput) =>
  createAction<RemoveDecisionAction>(
    "REMOVE_DECISION",
    { ...input },
    undefined,
    RemoveDecisionInputSchema,
    "global",
  );

export const setDecisionStatus = (input: SetDecisionStatusInput) =>
  createAction<SetDecisionStatusAction>(
    "SET_DECISION_STATUS",
    { ...input },
    undefined,
    SetDecisionStatusInputSchema,
    "global",
  );
