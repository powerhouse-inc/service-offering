import type { Action } from "document-model";
import type {
  AddServiceMetricInput,
  UpdateMetricInput,
  UpdateMetricUsageInput,
  RemoveServiceMetricInput,
  IncrementMetricUsageInput,
  DecrementMetricUsageInput,
  ResetMetricCycleInput,
} from "../types.js";

export type AddServiceMetricAction = Action & {
  type: "ADD_SERVICE_METRIC";
  input: AddServiceMetricInput;
};
export type UpdateMetricAction = Action & {
  type: "UPDATE_METRIC";
  input: UpdateMetricInput;
};
export type UpdateMetricUsageAction = Action & {
  type: "UPDATE_METRIC_USAGE";
  input: UpdateMetricUsageInput;
};
export type RemoveServiceMetricAction = Action & {
  type: "REMOVE_SERVICE_METRIC";
  input: RemoveServiceMetricInput;
};
export type IncrementMetricUsageAction = Action & {
  type: "INCREMENT_METRIC_USAGE";
  input: IncrementMetricUsageInput;
};
export type DecrementMetricUsageAction = Action & {
  type: "DECREMENT_METRIC_USAGE";
  input: DecrementMetricUsageInput;
};
export type ResetMetricCycleAction = Action & {
  type: "RESET_METRIC_CYCLE";
  input: ResetMetricCycleInput;
};

export type SubscriptionInstanceMetricsAction =
  | AddServiceMetricAction
  | UpdateMetricAction
  | UpdateMetricUsageAction
  | RemoveServiceMetricAction
  | IncrementMetricUsageAction
  | DecrementMetricUsageAction
  | ResetMetricCycleAction;
