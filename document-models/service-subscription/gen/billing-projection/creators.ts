import { createAction } from "document-model/core";
import {
  UpdateBillingProjectionInputSchema,
  SetCachedSnippetsInputSchema,
} from "../schema/zod.js";
import type {
  UpdateBillingProjectionInput,
  SetCachedSnippetsInput,
} from "../types.js";
import type {
  UpdateBillingProjectionAction,
  SetCachedSnippetsAction,
} from "./actions.js";

export const updateBillingProjection = (input: UpdateBillingProjectionInput) =>
  createAction<UpdateBillingProjectionAction>(
    "UPDATE_BILLING_PROJECTION",
    { ...input },
    undefined,
    UpdateBillingProjectionInputSchema,
    "global",
  );

export const setCachedSnippets = (input: SetCachedSnippetsInput) =>
  createAction<SetCachedSnippetsAction>(
    "SET_CACHED_SNIPPETS",
    { ...input },
    undefined,
    SetCachedSnippetsInputSchema,
    "global",
  );
