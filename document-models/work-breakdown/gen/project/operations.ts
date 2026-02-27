import { type SignalDispatch } from "document-model";
import type {
  SetProjectInfoAction,
  SetPhaseAction,
  SetStatusAction,
} from "./actions.js";
import type { WorkBreakdownState } from "../types.js";

export interface WorkBreakdownProjectOperations {
  setProjectInfoOperation: (
    state: WorkBreakdownState,
    action: SetProjectInfoAction,
    dispatch?: SignalDispatch,
  ) => void;
  setPhaseOperation: (
    state: WorkBreakdownState,
    action: SetPhaseAction,
    dispatch?: SignalDispatch,
  ) => void;
  setStatusOperation: (
    state: WorkBreakdownState,
    action: SetStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
}
