import type { Action } from "document-model";
import type { AddAddonInput, RemoveAddonInput } from "../types.js";

export type AddAddonAction = Action & {
  type: "ADD_ADDON";
  input: AddAddonInput;
};
export type RemoveAddonAction = Action & {
  type: "REMOVE_ADDON";
  input: RemoveAddonInput;
};

export type ServiceSubscriptionAddOnManagementAction =
  | AddAddonAction
  | RemoveAddonAction;
