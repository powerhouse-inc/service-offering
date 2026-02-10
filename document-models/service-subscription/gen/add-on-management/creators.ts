import { createAction } from "document-model/core";
import { AddAddonInputSchema, RemoveAddonInputSchema } from "../schema/zod.js";
import type { AddAddonInput, RemoveAddonInput } from "../types.js";
import type { AddAddonAction, RemoveAddonAction } from "./actions.js";

export const addAddon = (input: AddAddonInput) =>
  createAction<AddAddonAction>(
    "ADD_ADDON",
    { ...input },
    undefined,
    AddAddonInputSchema,
    "global",
  );

export const removeAddon = (input: RemoveAddonInput) =>
  createAction<RemoveAddonAction>(
    "REMOVE_ADDON",
    { ...input },
    undefined,
    RemoveAddonInputSchema,
    "global",
  );
