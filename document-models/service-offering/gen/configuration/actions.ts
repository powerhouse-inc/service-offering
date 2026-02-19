import type { Action } from "document-model";
import type {
  SetFinalConfigurationInput,
  ClearFinalConfigurationInput,
} from "../types.js";

export type SetFinalConfigurationAction = Action & {
  type: "SET_FINAL_CONFIGURATION";
  input: SetFinalConfigurationInput;
};
export type ClearFinalConfigurationAction = Action & {
  type: "CLEAR_FINAL_CONFIGURATION";
  input: ClearFinalConfigurationInput;
};

export type ServiceOfferingConfigurationAction =
  | SetFinalConfigurationAction
  | ClearFinalConfigurationAction;
