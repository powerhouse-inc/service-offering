import { createAction } from "document-model/core";
import {
  SetFacetTargetInputSchema,
  RemoveFacetTargetInputSchema,
  AddFacetOptionInputSchema,
  RemoveFacetOptionInputSchema,
} from "../schema/zod.js";
import type {
  SetFacetTargetInput,
  RemoveFacetTargetInput,
  AddFacetOptionInput,
  RemoveFacetOptionInput,
} from "../types.js";
import type {
  SetFacetTargetAction,
  RemoveFacetTargetAction,
  AddFacetOptionAction,
  RemoveFacetOptionAction,
} from "./actions.js";

export const setFacetTarget = (input: SetFacetTargetInput) =>
  createAction<SetFacetTargetAction>(
    "SET_FACET_TARGET",
    { ...input },
    undefined,
    SetFacetTargetInputSchema,
    "global",
  );

export const removeFacetTarget = (input: RemoveFacetTargetInput) =>
  createAction<RemoveFacetTargetAction>(
    "REMOVE_FACET_TARGET",
    { ...input },
    undefined,
    RemoveFacetTargetInputSchema,
    "global",
  );

export const addFacetOption = (input: AddFacetOptionInput) =>
  createAction<AddFacetOptionAction>(
    "ADD_FACET_OPTION",
    { ...input },
    undefined,
    AddFacetOptionInputSchema,
    "global",
  );

export const removeFacetOption = (input: RemoveFacetOptionInput) =>
  createAction<RemoveFacetOptionAction>(
    "REMOVE_FACET_OPTION",
    { ...input },
    undefined,
    RemoveFacetOptionInputSchema,
    "global",
  );
