import { type SignalDispatch } from "document-model";
import type {
  UpdateBillingProjectionAction,
  SetCachedSnippetsAction,
} from "./actions.js";
import type { ServiceSubscriptionState } from "../types.js";

export interface ServiceSubscriptionBillingProjectionOperations {
  updateBillingProjectionOperation: (
    state: ServiceSubscriptionState,
    action: UpdateBillingProjectionAction,
    dispatch?: SignalDispatch,
  ) => void;
  setCachedSnippetsOperation: (
    state: ServiceSubscriptionState,
    action: SetCachedSnippetsAction,
    dispatch?: SignalDispatch,
  ) => void;
}
