import { type SignalDispatch } from "document-model";
import type {
  InitializeSubscriptionAction,
  ActivateSubscriptionAction,
  CancelSubscriptionAction,
  ExpireSubscriptionAction,
} from "./actions.js";
import type { ServiceSubscriptionState } from "../types.js";

export interface ServiceSubscriptionSubscriptionManagementOperations {
  initializeSubscriptionOperation: (
    state: ServiceSubscriptionState,
    action: InitializeSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  activateSubscriptionOperation: (
    state: ServiceSubscriptionState,
    action: ActivateSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  cancelSubscriptionOperation: (
    state: ServiceSubscriptionState,
    action: CancelSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  expireSubscriptionOperation: (
    state: ServiceSubscriptionState,
    action: ExpireSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
}
