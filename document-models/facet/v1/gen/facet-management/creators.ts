import { createAction } from "document-model/core";
import {
  SetFacetNameInputSchema,
  SetFacetDescriptionInputSchema,
} from "../schema/zod.js";
import type { SetFacetNameInput, SetFacetDescriptionInput } from "../types.js";
import type {
  SetFacetNameAction,
  SetFacetDescriptionAction,
} from "./actions.js";

export const setFacetName = (input: SetFacetNameInput) =>
  createAction<SetFacetNameAction>(
    "SET_FACET_NAME",
    { ...input },
    undefined,
    SetFacetNameInputSchema,
    "global",
  );

export const setFacetDescription = (input: SetFacetDescriptionInput) =>
  createAction<SetFacetDescriptionAction>(
    "SET_FACET_DESCRIPTION",
    { ...input },
    undefined,
    SetFacetDescriptionInputSchema,
    "global",
  );
