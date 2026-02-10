import type { Action } from "document-model";
import type {
  UpdateBillingProjectionInput,
  SetCachedSnippetsInput,
} from "../types.js";

export type UpdateBillingProjectionAction = Action & {
  type: "UPDATE_BILLING_PROJECTION";
  input: UpdateBillingProjectionInput;
};
export type SetCachedSnippetsAction = Action & {
  type: "SET_CACHED_SNIPPETS";
  input: SetCachedSnippetsInput;
};

export type ServiceSubscriptionBillingProjectionAction =
  | UpdateBillingProjectionAction
  | SetCachedSnippetsAction;
