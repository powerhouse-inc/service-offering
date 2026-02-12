import { type SignalDispatch } from "document-model";
import type {
  CreateClientRequestAction,
  ApproveRequestAction,
  RejectRequestAction,
} from "./actions.js";
import type { SubscriptionInstanceState } from "../types.js";

export interface SubscriptionInstanceRequestsOperations {
  createClientRequestOperation: (
    state: SubscriptionInstanceState,
    action: CreateClientRequestAction,
    dispatch?: SignalDispatch,
  ) => void;
  approveRequestOperation: (
    state: SubscriptionInstanceState,
    action: ApproveRequestAction,
    dispatch?: SignalDispatch,
  ) => void;
  rejectRequestOperation: (
    state: SubscriptionInstanceState,
    action: RejectRequestAction,
    dispatch?: SignalDispatch,
  ) => void;
}
