import { type SignalDispatch } from "document-model";
import type {
  AddTemplateAction,
  UpdateTemplateAction,
  RemoveTemplateAction,
  SetTemplateModeAction,
  ApplyTemplateAction,
} from "./actions.js";
import type { WorkBreakdownState } from "../types.js";

export interface WorkBreakdownTemplatesOperations {
  addTemplateOperation: (
    state: WorkBreakdownState,
    action: AddTemplateAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateTemplateOperation: (
    state: WorkBreakdownState,
    action: UpdateTemplateAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeTemplateOperation: (
    state: WorkBreakdownState,
    action: RemoveTemplateAction,
    dispatch?: SignalDispatch,
  ) => void;
  setTemplateModeOperation: (
    state: WorkBreakdownState,
    action: SetTemplateModeAction,
    dispatch?: SignalDispatch,
  ) => void;
  applyTemplateOperation: (
    state: WorkBreakdownState,
    action: ApplyTemplateAction,
    dispatch?: SignalDispatch,
  ) => void;
}
