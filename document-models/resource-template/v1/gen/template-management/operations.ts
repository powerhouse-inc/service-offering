import { type SignalDispatch } from "document-model";
import type {
  UpdateTemplateInfoAction,
  UpdateTemplateStatusAction,
  SetOperatorAction,
  SetTemplateIdAction,
} from "./actions.js";
import type { ResourceTemplateState } from "../types.js";

export interface ResourceTemplateTemplateManagementOperations {
  updateTemplateInfoOperation: (
    state: ResourceTemplateState,
    action: UpdateTemplateInfoAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateTemplateStatusOperation: (
    state: ResourceTemplateState,
    action: UpdateTemplateStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
  setOperatorOperation: (
    state: ResourceTemplateState,
    action: SetOperatorAction,
    dispatch?: SignalDispatch,
  ) => void;
  setTemplateIdOperation: (
    state: ResourceTemplateState,
    action: SetTemplateIdAction,
    dispatch?: SignalDispatch,
  ) => void;
}
