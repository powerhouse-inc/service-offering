import { type SignalDispatch } from "document-model";
import type {
  SetFinalConfigurationAction,
  ClearFinalConfigurationAction,
} from "./actions.js";
import type { ServiceOfferingState } from "../types.js";

export interface ServiceOfferingConfigurationOperations {
  setFinalConfigurationOperation: (
    state: ServiceOfferingState,
    action: SetFinalConfigurationAction,
    dispatch?: SignalDispatch,
  ) => void;
  clearFinalConfigurationOperation: (
    state: ServiceOfferingState,
    action: ClearFinalConfigurationAction,
    dispatch?: SignalDispatch,
  ) => void;
}
