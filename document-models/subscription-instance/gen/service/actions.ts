import type { Action } from "document-model";
import type {
  AddServiceInput,
  RemoveServiceInput,
  UpdateServiceSetupCostInput,
  UpdateServiceRecurringCostInput,
  ReportSetupPaymentInput,
  ReportRecurringPaymentInput,
  UpdateServiceInfoInput,
  AddServiceFacetSelectionInput,
  RemoveServiceFacetSelectionInput,
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
export type AddServiceFacetSelectionAction = Action & {
  type: "ADD_SERVICE_FACET_SELECTION";
  input: AddServiceFacetSelectionInput;
};
export type RemoveServiceFacetSelectionAction = Action & {
  type: "REMOVE_SERVICE_FACET_SELECTION";
  input: RemoveServiceFacetSelectionInput;
};

export type SubscriptionInstanceServiceAction =
  | AddServiceAction
  | RemoveServiceAction
  | UpdateServiceSetupCostAction
  | UpdateServiceRecurringCostAction
  | ReportSetupPaymentAction
  | ReportRecurringPaymentAction
  | UpdateServiceInfoAction
  | AddServiceFacetSelectionAction
  | RemoveServiceFacetSelectionAction;
