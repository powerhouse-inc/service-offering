import { createAction } from "document-model/core";
import {
  SetFacetSelectionInputSchema,
  RemoveFacetSelectionInputSchema,
} from "../schema/zod.js";
import type {
  SetFacetSelectionInput,
  RemoveFacetSelectionInput,
} from "../types.js";
import type {
  SetFacetSelectionAction,
  RemoveFacetSelectionAction,
} from "./actions.js";

export const setFacetSelection = (input: SetFacetSelectionInput) =>
  createAction<SetFacetSelectionAction>(
    "SET_FACET_SELECTION",
    { ...input },
    undefined,
    SetFacetSelectionInputSchema,
    "global",
  );

export const removeFacetSelection = (input: RemoveFacetSelectionInput) =>
  createAction<RemoveFacetSelectionAction>(
    "REMOVE_FACET_SELECTION",
    { ...input },
    undefined,
    RemoveFacetSelectionInputSchema,
    "global",
  );
