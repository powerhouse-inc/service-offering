import { type SignalDispatch } from "document-model";
import type { AddAddonAction, RemoveAddonAction } from "./actions.js";
import type { ServiceSubscriptionState } from "../types.js";

export interface ServiceSubscriptionAddOnManagementOperations {
  addAddonOperation: (
    state: ServiceSubscriptionState,
    action: AddAddonAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeAddonOperation: (
    state: ServiceSubscriptionState,
    action: RemoveAddonAction,
    dispatch?: SignalDispatch,
  ) => void;
}
