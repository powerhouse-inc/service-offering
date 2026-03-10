import { type SignalDispatch } from "document-model";
import type {
  SetSetupServicesAction,
  SetRecurringServicesAction,
} from "./actions.js";
import type { ResourceTemplateState } from "../types.js";

export interface ResourceTemplateServiceCategoryManagementOperations {
  setSetupServicesOperation: (
    state: ResourceTemplateState,
    action: SetSetupServicesAction,
    dispatch?: SignalDispatch,
  ) => void;
  setRecurringServicesOperation: (
    state: ResourceTemplateState,
    action: SetRecurringServicesAction,
    dispatch?: SignalDispatch,
  ) => void;
}
