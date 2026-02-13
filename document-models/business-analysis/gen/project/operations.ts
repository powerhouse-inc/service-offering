import { type SignalDispatch } from "document-model";
import type {
  SetProjectInfoAction,
  SetProjectPhaseAction,
  SetProjectStatusAction,
} from "./actions.js";
import type { BusinessAnalysisState } from "../types.js";

export interface BusinessAnalysisProjectOperations {
  setProjectInfoOperation: (
    state: BusinessAnalysisState,
    action: SetProjectInfoAction,
    dispatch?: SignalDispatch,
  ) => void;
  setProjectPhaseOperation: (
    state: BusinessAnalysisState,
    action: SetProjectPhaseAction,
    dispatch?: SignalDispatch,
  ) => void;
  setProjectStatusOperation: (
    state: BusinessAnalysisState,
    action: SetProjectStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
}
