import type { Action } from "document-model";
import type {
  InitializeSubscriptionInput,
  SetResourceDocumentInput,
  UpdateSubscriptionStatusInput,
  ActivateSubscriptionInput,
  PauseSubscriptionInput,
  SetExpiringInput,
  CancelSubscriptionInput,
  ResumeSubscriptionInput,
  RenewExpiringSubscriptionInput,
  SetBudgetCategoryInput,
  RemoveBudgetCategoryInput,
  UpdateCustomerInfoInput,
  UpdateTierInfoInput,
  SetOperatorNotesInput,
  SetAutoRenewInput,
  SetRenewalDateInput,
  UpdateBillingProjectionInput,
} from "../types.js";

export type InitializeSubscriptionAction = Action & {
  type: "INITIALIZE_SUBSCRIPTION";
  input: InitializeSubscriptionInput;
};
export type SetResourceDocumentAction = Action & {
  type: "SET_RESOURCE_DOCUMENT";
  input: SetResourceDocumentInput;
};
export type UpdateSubscriptionStatusAction = Action & {
  type: "UPDATE_SUBSCRIPTION_STATUS";
  input: UpdateSubscriptionStatusInput;
};
export type ActivateSubscriptionAction = Action & {
  type: "ACTIVATE_SUBSCRIPTION";
  input: ActivateSubscriptionInput;
};
export type PauseSubscriptionAction = Action & {
  type: "PAUSE_SUBSCRIPTION";
  input: PauseSubscriptionInput;
};
export type SetExpiringAction = Action & {
  type: "SET_EXPIRING";
  input: SetExpiringInput;
};
export type CancelSubscriptionAction = Action & {
  type: "CANCEL_SUBSCRIPTION";
  input: CancelSubscriptionInput;
};
export type ResumeSubscriptionAction = Action & {
  type: "RESUME_SUBSCRIPTION";
  input: ResumeSubscriptionInput;
};
export type RenewExpiringSubscriptionAction = Action & {
  type: "RENEW_EXPIRING_SUBSCRIPTION";
  input: RenewExpiringSubscriptionInput;
};
export type SetBudgetCategoryAction = Action & {
  type: "SET_BUDGET_CATEGORY";
  input: SetBudgetCategoryInput;
};
export type RemoveBudgetCategoryAction = Action & {
  type: "REMOVE_BUDGET_CATEGORY";
  input: RemoveBudgetCategoryInput;
};
export type UpdateCustomerInfoAction = Action & {
  type: "UPDATE_CUSTOMER_INFO";
  input: UpdateCustomerInfoInput;
};
export type UpdateTierInfoAction = Action & {
  type: "UPDATE_TIER_INFO";
  input: UpdateTierInfoInput;
};
export type SetOperatorNotesAction = Action & {
  type: "SET_OPERATOR_NOTES";
  input: SetOperatorNotesInput;
};
export type SetAutoRenewAction = Action & {
  type: "SET_AUTO_RENEW";
  input: SetAutoRenewInput;
};
export type SetRenewalDateAction = Action & {
  type: "SET_RENEWAL_DATE";
  input: SetRenewalDateInput;
};
export type UpdateBillingProjectionAction = Action & {
  type: "UPDATE_BILLING_PROJECTION";
  input: UpdateBillingProjectionInput;
};

export type SubscriptionInstanceSubscriptionAction =
  | InitializeSubscriptionAction
  | SetResourceDocumentAction
  | UpdateSubscriptionStatusAction
  | ActivateSubscriptionAction
  | PauseSubscriptionAction
  | SetExpiringAction
  | CancelSubscriptionAction
  | ResumeSubscriptionAction
  | RenewExpiringSubscriptionAction
  | SetBudgetCategoryAction
  | RemoveBudgetCategoryAction
  | UpdateCustomerInfoAction
  | UpdateTierInfoAction
  | SetOperatorNotesAction
  | SetAutoRenewAction
  | SetRenewalDateAction
  | UpdateBillingProjectionAction;
