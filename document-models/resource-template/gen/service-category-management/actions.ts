import type { Action } from "document-model";
import type {
  SetSetupServicesInput,
  SetRecurringServicesInput,
} from "../types.js";

export type SetSetupServicesAction = Action & {
  type: "SET_SETUP_SERVICES";
  input: SetSetupServicesInput;
};
export type SetRecurringServicesAction = Action & {
  type: "SET_RECURRING_SERVICES";
  input: SetRecurringServicesInput;
};

export type ResourceTemplateServiceCategoryManagementAction =
  | SetSetupServicesAction
  | SetRecurringServicesAction;
