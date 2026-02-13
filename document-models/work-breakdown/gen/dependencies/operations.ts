import { type SignalDispatch } from "document-model";
import type {
  AddDependencyAction,
  UpdateDependencyAction,
  RemoveDependencyAction,
} from "./actions.js";
import type { WorkBreakdownState } from "../types.js";

export interface WorkBreakdownDependenciesOperations {
  addDependencyOperation: (
    state: WorkBreakdownState,
    action: AddDependencyAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateDependencyOperation: (
    state: WorkBreakdownState,
    action: UpdateDependencyAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeDependencyOperation: (
    state: WorkBreakdownState,
    action: RemoveDependencyAction,
    dispatch?: SignalDispatch,
  ) => void;
}
