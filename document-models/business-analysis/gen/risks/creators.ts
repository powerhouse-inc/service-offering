import { createAction } from "document-model/core";
import {
  AddRiskInputSchema,
  UpdateRiskInputSchema,
  RemoveRiskInputSchema,
  SetRiskStatusInputSchema,
} from "../schema/zod.js";
import type {
  AddRiskInput,
  UpdateRiskInput,
  RemoveRiskInput,
  SetRiskStatusInput,
} from "../types.js";
import type {
  AddRiskAction,
  UpdateRiskAction,
  RemoveRiskAction,
  SetRiskStatusAction,
} from "./actions.js";

export const addRisk = (input: AddRiskInput) =>
  createAction<AddRiskAction>(
    "ADD_RISK",
    { ...input },
    undefined,
    AddRiskInputSchema,
    "global",
  );

export const updateRisk = (input: UpdateRiskInput) =>
  createAction<UpdateRiskAction>(
    "UPDATE_RISK",
    { ...input },
    undefined,
    UpdateRiskInputSchema,
    "global",
  );

export const removeRisk = (input: RemoveRiskInput) =>
  createAction<RemoveRiskAction>(
    "REMOVE_RISK",
    { ...input },
    undefined,
    RemoveRiskInputSchema,
    "global",
  );

export const setRiskStatus = (input: SetRiskStatusInput) =>
  createAction<SetRiskStatusAction>(
    "SET_RISK_STATUS",
    { ...input },
    undefined,
    SetRiskStatusInputSchema,
    "global",
  );
