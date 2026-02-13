import { type SignalDispatch } from "document-model";
import type {
  AddProcessAction,
  UpdateProcessAction,
  RemoveProcessAction,
  AddProcessStepAction,
  UpdateProcessStepAction,
  RemoveProcessStepAction,
  ReorderProcessStepsAction,
} from "./actions.js";
import type { BusinessAnalysisState } from "../types.js";

export interface BusinessAnalysisProcessesOperations {
  addProcessOperation: (
    state: BusinessAnalysisState,
    action: AddProcessAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateProcessOperation: (
    state: BusinessAnalysisState,
    action: UpdateProcessAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeProcessOperation: (
    state: BusinessAnalysisState,
    action: RemoveProcessAction,
    dispatch?: SignalDispatch,
  ) => void;
  addProcessStepOperation: (
    state: BusinessAnalysisState,
    action: AddProcessStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateProcessStepOperation: (
    state: BusinessAnalysisState,
    action: UpdateProcessStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeProcessStepOperation: (
    state: BusinessAnalysisState,
    action: RemoveProcessStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  reorderProcessStepsOperation: (
    state: BusinessAnalysisState,
    action: ReorderProcessStepsAction,
    dispatch?: SignalDispatch,
  ) => void;
}
