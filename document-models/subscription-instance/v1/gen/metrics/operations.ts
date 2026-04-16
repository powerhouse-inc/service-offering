import { type SignalDispatch } from "document-model";
import type {
  AddServiceMetricAction,
  UpdateMetricAction,
  UpdateMetricUsageAction,
  RemoveServiceMetricAction,
  IncrementMetricUsageAction,
  DecrementMetricUsageAction,
  ResetMetricCycleAction,
} from "./actions.js";
import type { SubscriptionInstanceState } from "../types.js";

export interface SubscriptionInstanceMetricsOperations {
  addServiceMetricOperation: (
    state: SubscriptionInstanceState,
    action: AddServiceMetricAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateMetricOperation: (
    state: SubscriptionInstanceState,
    action: UpdateMetricAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateMetricUsageOperation: (
    state: SubscriptionInstanceState,
    action: UpdateMetricUsageAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeServiceMetricOperation: (
    state: SubscriptionInstanceState,
    action: RemoveServiceMetricAction,
    dispatch?: SignalDispatch,
  ) => void;
  incrementMetricUsageOperation: (
    state: SubscriptionInstanceState,
    action: IncrementMetricUsageAction,
    dispatch?: SignalDispatch,
  ) => void;
  decrementMetricUsageOperation: (
    state: SubscriptionInstanceState,
    action: DecrementMetricUsageAction,
    dispatch?: SignalDispatch,
  ) => void;
  resetMetricCycleOperation: (
    state: SubscriptionInstanceState,
    action: ResetMetricCycleAction,
    dispatch?: SignalDispatch,
  ) => void;
}
