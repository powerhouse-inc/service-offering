import { createAction } from "document-model/core";
import {
  AddServiceInputSchema,
  UpdateServiceInputSchema,
  DeleteServiceInputSchema,
  AddFacetBindingInputSchema,
  RemoveFacetBindingInputSchema,
} from "../schema/zod.js";
import type {
  AddServiceInput,
  UpdateServiceInput,
  DeleteServiceInput,
  AddFacetBindingInput,
  RemoveFacetBindingInput,
} from "../types.js";
import type {
  AddServiceAction,
  UpdateServiceAction,
  DeleteServiceAction,
  AddFacetBindingAction,
  RemoveFacetBindingAction,
} from "./actions.js";

export const addService = (input: AddServiceInput) =>
  createAction<AddServiceAction>(
    "ADD_SERVICE",
    { ...input },
    undefined,
    AddServiceInputSchema,
    "global",
  );

export const updateService = (input: UpdateServiceInput) =>
  createAction<UpdateServiceAction>(
    "UPDATE_SERVICE",
    { ...input },
    undefined,
    UpdateServiceInputSchema,
    "global",
  );

export const deleteService = (input: DeleteServiceInput) =>
  createAction<DeleteServiceAction>(
    "DELETE_SERVICE",
    { ...input },
    undefined,
    DeleteServiceInputSchema,
    "global",
  );

export const addFacetBinding = (input: AddFacetBindingInput) =>
  createAction<AddFacetBindingAction>(
    "ADD_FACET_BINDING",
    { ...input },
    undefined,
    AddFacetBindingInputSchema,
    "global",
  );

export const removeFacetBinding = (input: RemoveFacetBindingInput) =>
  createAction<RemoveFacetBindingAction>(
    "REMOVE_FACET_BINDING",
    { ...input },
    undefined,
    RemoveFacetBindingInputSchema,
    "global",
  );
