import type { Action } from "document-model";
import type {
  InitializeSubscriptionInput,
  ActivateSubscriptionInput,
  CancelSubscriptionInput,
  ExpireSubscriptionInput,
} from "../types.js";

export type InitializeSubscriptionAction = Action & {
  type: "INITIALIZE_SUBSCRIPTION";
  input: InitializeSubscriptionInput;
};
export type ActivateSubscriptionAction = Action & {
  type: "ACTIVATE_SUBSCRIPTION";
  input: ActivateSubscriptionInput;
};
export type CancelSubscriptionAction = Action & {
  type: "CANCEL_SUBSCRIPTION";
  input: CancelSubscriptionInput;
};
export type ExpireSubscriptionAction = Action & {
  type: "EXPIRE_SUBSCRIPTION";
  input: ExpireSubscriptionInput;
};

export type ServiceSubscriptionSubscriptionManagementAction =
  | InitializeSubscriptionAction
  | ActivateSubscriptionAction
  | CancelSubscriptionAction
  | ExpireSubscriptionAction;
