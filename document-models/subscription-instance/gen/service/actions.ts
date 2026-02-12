import type { Action } from "document-model";
import type {
  AddServiceInput,
  RemoveServiceInput,
  UpdateServiceSetupCostInput,
  UpdateServiceRecurringCostInput,
  ReportSetupPaymentInput,
  ReportRecurringPaymentInput,
  UpdateServiceInfoInput,
  UpdateServiceLevelInput,
} from "../types.js";

export type AddServiceAction = Action & {
  type: "ADD_SERVICE";
  input: AddServiceInput;
};
export type RemoveServiceAction = Action & {
  type: "REMOVE_SERVICE";
  input: RemoveServiceInput;
};
export type UpdateServiceSetupCostAction = Action & {
  type: "UPDATE_SERVICE_SETUP_COST";
  input: UpdateServiceSetupCostInput;
};
export type UpdateServiceRecurringCostAction = Action & {
  type: "UPDATE_SERVICE_RECURRING_COST";
  input: UpdateServiceRecurringCostInput;
};
export type ReportSetupPaymentAction = Action & {
  type: "REPORT_SETUP_PAYMENT";
  input: ReportSetupPaymentInput;
};
export type ReportRecurringPaymentAction = Action & {
  type: "REPORT_RECURRING_PAYMENT";
  input: ReportRecurringPaymentInput;
};
export type UpdateServiceInfoAction = Action & {
  type: "UPDATE_SERVICE_INFO";
  input: UpdateServiceInfoInput;
};
export type UpdateServiceLevelAction = Action & {
  type: "UPDATE_SERVICE_LEVEL";
  input: UpdateServiceLevelInput;
};

export type SubscriptionInstanceServiceAction =
  | AddServiceAction
  | RemoveServiceAction
  | UpdateServiceSetupCostAction
  | UpdateServiceRecurringCostAction
  | ReportSetupPaymentAction
  | ReportRecurringPaymentAction
  | UpdateServiceInfoAction
  | UpdateServiceLevelAction;
