import { createAction } from "document-model";
import {
  InitializeSubscriptionInputSchema,
  SetResourceDocumentInputSchema,
  ActivateSubscriptionInputSchema,
  PauseSubscriptionInputSchema,
  SetExpiringInputSchema,
  CancelSubscriptionInputSchema,
  ResumeSubscriptionInputSchema,
  RenewExpiringSubscriptionInputSchema,
  SetBudgetCategoryInputSchema,
  RemoveBudgetCategoryInputSchema,
  UpdateCustomerInfoInputSchema,
  UpdateTierInfoInputSchema,
  SetOperatorNotesInputSchema,
  SetAutoRenewInputSchema,
  SetRenewalDateInputSchema,
  SettleBillingCycleInputSchema,
} from "../schema/zod.js";
import type {
  InitializeSubscriptionInput,
  SetResourceDocumentInput,
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
  SettleBillingCycleInput,
} from "../types.js";
import type {
  InitializeSubscriptionAction,
  SetResourceDocumentAction,
  ActivateSubscriptionAction,
  PauseSubscriptionAction,
  SetExpiringAction,
  CancelSubscriptionAction,
  ResumeSubscriptionAction,
  RenewExpiringSubscriptionAction,
  SetBudgetCategoryAction,
  RemoveBudgetCategoryAction,
  UpdateCustomerInfoAction,
  UpdateTierInfoAction,
  SetOperatorNotesAction,
  SetAutoRenewAction,
  SetRenewalDateAction,
  SettleBillingCycleAction,
} from "./actions.js";

export const initializeSubscription = (input: InitializeSubscriptionInput) =>
  createAction<InitializeSubscriptionAction>(
    "INITIALIZE_SUBSCRIPTION",
    { ...input },
    undefined,
    InitializeSubscriptionInputSchema,
    "global",
  );

export const setResourceDocument = (input: SetResourceDocumentInput) =>
  createAction<SetResourceDocumentAction>(
    "SET_RESOURCE_DOCUMENT",
    { ...input },
    undefined,
    SetResourceDocumentInputSchema,
    "global",
  );

export const activateSubscription = (input: ActivateSubscriptionInput) =>
  createAction<ActivateSubscriptionAction>(
    "ACTIVATE_SUBSCRIPTION",
    { ...input },
    undefined,
    ActivateSubscriptionInputSchema,
    "global",
  );

export const pauseSubscription = (input: PauseSubscriptionInput) =>
  createAction<PauseSubscriptionAction>(
    "PAUSE_SUBSCRIPTION",
    { ...input },
    undefined,
    PauseSubscriptionInputSchema,
    "global",
  );

export const setExpiring = (input: SetExpiringInput) =>
  createAction<SetExpiringAction>(
    "SET_EXPIRING",
    { ...input },
    undefined,
    SetExpiringInputSchema,
    "global",
  );

export const cancelSubscription = (input: CancelSubscriptionInput) =>
  createAction<CancelSubscriptionAction>(
    "CANCEL_SUBSCRIPTION",
    { ...input },
    undefined,
    CancelSubscriptionInputSchema,
    "global",
  );

export const resumeSubscription = (input: ResumeSubscriptionInput) =>
  createAction<ResumeSubscriptionAction>(
    "RESUME_SUBSCRIPTION",
    { ...input },
    undefined,
    ResumeSubscriptionInputSchema,
    "global",
  );

export const renewExpiringSubscription = (
  input: RenewExpiringSubscriptionInput,
) =>
  createAction<RenewExpiringSubscriptionAction>(
    "RENEW_EXPIRING_SUBSCRIPTION",
    { ...input },
    undefined,
    RenewExpiringSubscriptionInputSchema,
    "global",
  );

export const setBudgetCategory = (input: SetBudgetCategoryInput) =>
  createAction<SetBudgetCategoryAction>(
    "SET_BUDGET_CATEGORY",
    { ...input },
    undefined,
    SetBudgetCategoryInputSchema,
    "global",
  );

export const removeBudgetCategory = (input: RemoveBudgetCategoryInput) =>
  createAction<RemoveBudgetCategoryAction>(
    "REMOVE_BUDGET_CATEGORY",
    { ...input },
    undefined,
    RemoveBudgetCategoryInputSchema,
    "global",
  );

export const updateCustomerInfo = (input: UpdateCustomerInfoInput) =>
  createAction<UpdateCustomerInfoAction>(
    "UPDATE_CUSTOMER_INFO",
    { ...input },
    undefined,
    UpdateCustomerInfoInputSchema,
    "global",
  );

export const updateTierInfo = (input: UpdateTierInfoInput) =>
  createAction<UpdateTierInfoAction>(
    "UPDATE_TIER_INFO",
    { ...input },
    undefined,
    UpdateTierInfoInputSchema,
    "global",
  );

export const setOperatorNotes = (input: SetOperatorNotesInput) =>
  createAction<SetOperatorNotesAction>(
    "SET_OPERATOR_NOTES",
    { ...input },
    undefined,
    SetOperatorNotesInputSchema,
    "global",
  );

export const setAutoRenew = (input: SetAutoRenewInput) =>
  createAction<SetAutoRenewAction>(
    "SET_AUTO_RENEW",
    { ...input },
    undefined,
    SetAutoRenewInputSchema,
    "global",
  );

export const setRenewalDate = (input: SetRenewalDateInput) =>
  createAction<SetRenewalDateAction>(
    "SET_RENEWAL_DATE",
    { ...input },
    undefined,
    SetRenewalDateInputSchema,
    "global",
  );

export const settleBillingCycle = (input: SettleBillingCycleInput) =>
  createAction<SettleBillingCycleAction>(
    "SETTLE_BILLING_CYCLE",
    { ...input },
    undefined,
    SettleBillingCycleInputSchema,
    "global",
  );
