import { type SignalDispatch } from "document-model";
import type {
  AddPrerequisiteAction,
  UpdatePrerequisiteAction,
  RemovePrerequisiteAction,
  SetPrerequisiteStatusAction,
} from "./actions.js";
import type { WorkBreakdownState } from "../types.js";

export interface WorkBreakdownPrerequisitesOperations {
  addPrerequisiteOperation: (
    state: WorkBreakdownState,
    action: AddPrerequisiteAction,
    dispatch?: SignalDispatch,
  ) => void;
  updatePrerequisiteOperation: (
    state: WorkBreakdownState,
    action: UpdatePrerequisiteAction,
    dispatch?: SignalDispatch,
  ) => void;
  removePrerequisiteOperation: (
    state: WorkBreakdownState,
    action: RemovePrerequisiteAction,
    dispatch?: SignalDispatch,
  ) => void;
  setPrerequisiteStatusOperation: (
    state: WorkBreakdownState,
    action: SetPrerequisiteStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
}
