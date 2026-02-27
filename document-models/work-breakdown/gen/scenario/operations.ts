import { type SignalDispatch } from "document-model";
import type {
  AddInputAction,
  UpdateInputAction,
  RemoveInputAction,
  AddStepAction,
  UpdateStepAction,
  RemoveStepAction,
  AddSubstepAction,
  UpdateSubstepAction,
  RemoveSubstepAction,
} from "./actions.js";
import type { WorkBreakdownState } from "../types.js";

export interface WorkBreakdownScenarioOperations {
  addInputOperation: (
    state: WorkBreakdownState,
    action: AddInputAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateInputOperation: (
    state: WorkBreakdownState,
    action: UpdateInputAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeInputOperation: (
    state: WorkBreakdownState,
    action: RemoveInputAction,
    dispatch?: SignalDispatch,
  ) => void;
  addStepOperation: (
    state: WorkBreakdownState,
    action: AddStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateStepOperation: (
    state: WorkBreakdownState,
    action: UpdateStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeStepOperation: (
    state: WorkBreakdownState,
    action: RemoveStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  addSubstepOperation: (
    state: WorkBreakdownState,
    action: AddSubstepAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateSubstepOperation: (
    state: WorkBreakdownState,
    action: UpdateSubstepAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeSubstepOperation: (
    state: WorkBreakdownState,
    action: RemoveSubstepAction,
    dispatch?: SignalDispatch,
  ) => void;
}
