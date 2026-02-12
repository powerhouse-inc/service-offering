import { type SignalDispatch } from "document-model";
import type {
  AddServiceAction,
  RemoveServiceAction,
  UpdateServiceSetupCostAction,
  UpdateServiceRecurringCostAction,
  ReportSetupPaymentAction,
  ReportRecurringPaymentAction,
  UpdateServiceInfoAction,
  UpdateServiceLevelAction,
} from "./actions.js";
import type { SubscriptionInstanceState } from "../types.js";

export interface SubscriptionInstanceServiceOperations {
  addServiceOperation: (
    state: SubscriptionInstanceState,
    action: AddServiceAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeServiceOperation: (
    state: SubscriptionInstanceState,
    action: RemoveServiceAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateServiceSetupCostOperation: (
    state: SubscriptionInstanceState,
    action: UpdateServiceSetupCostAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateServiceRecurringCostOperation: (
    state: SubscriptionInstanceState,
    action: UpdateServiceRecurringCostAction,
    dispatch?: SignalDispatch,
  ) => void;
  reportSetupPaymentOperation: (
    state: SubscriptionInstanceState,
    action: ReportSetupPaymentAction,
    dispatch?: SignalDispatch,
  ) => void;
  reportRecurringPaymentOperation: (
    state: SubscriptionInstanceState,
    action: ReportRecurringPaymentAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateServiceInfoOperation: (
    state: SubscriptionInstanceState,
    action: UpdateServiceInfoAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateServiceLevelOperation: (
    state: SubscriptionInstanceState,
    action: UpdateServiceLevelAction,
    dispatch?: SignalDispatch,
  ) => void;
}
