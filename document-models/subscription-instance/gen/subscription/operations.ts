import { type SignalDispatch } from "document-model";
import type {
  InitializeSubscriptionAction,
  SetResourceDocumentAction,
  UpdateSubscriptionStatusAction,
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
  UpdateBillingProjectionAction,
} from "./actions.js";
import type { SubscriptionInstanceState } from "../types.js";

export interface SubscriptionInstanceSubscriptionOperations {
  initializeSubscriptionOperation: (
    state: SubscriptionInstanceState,
    action: InitializeSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  setResourceDocumentOperation: (
    state: SubscriptionInstanceState,
    action: SetResourceDocumentAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateSubscriptionStatusOperation: (
    state: SubscriptionInstanceState,
    action: UpdateSubscriptionStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
  activateSubscriptionOperation: (
    state: SubscriptionInstanceState,
    action: ActivateSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  pauseSubscriptionOperation: (
    state: SubscriptionInstanceState,
    action: PauseSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  setExpiringOperation: (
    state: SubscriptionInstanceState,
    action: SetExpiringAction,
    dispatch?: SignalDispatch,
  ) => void;
  cancelSubscriptionOperation: (
    state: SubscriptionInstanceState,
    action: CancelSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  resumeSubscriptionOperation: (
    state: SubscriptionInstanceState,
    action: ResumeSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  renewExpiringSubscriptionOperation: (
    state: SubscriptionInstanceState,
    action: RenewExpiringSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  setBudgetCategoryOperation: (
    state: SubscriptionInstanceState,
    action: SetBudgetCategoryAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeBudgetCategoryOperation: (
    state: SubscriptionInstanceState,
    action: RemoveBudgetCategoryAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateCustomerInfoOperation: (
    state: SubscriptionInstanceState,
    action: UpdateCustomerInfoAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateTierInfoOperation: (
    state: SubscriptionInstanceState,
    action: UpdateTierInfoAction,
    dispatch?: SignalDispatch,
  ) => void;
  setOperatorNotesOperation: (
    state: SubscriptionInstanceState,
    action: SetOperatorNotesAction,
    dispatch?: SignalDispatch,
  ) => void;
  setAutoRenewOperation: (
    state: SubscriptionInstanceState,
    action: SetAutoRenewAction,
    dispatch?: SignalDispatch,
  ) => void;
  setRenewalDateOperation: (
    state: SubscriptionInstanceState,
    action: SetRenewalDateAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateBillingProjectionOperation: (
    state: SubscriptionInstanceState,
    action: UpdateBillingProjectionAction,
    dispatch?: SignalDispatch,
  ) => void;
}
