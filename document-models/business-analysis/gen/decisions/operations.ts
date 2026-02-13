import { type SignalDispatch } from "document-model";
import type {
  AddDecisionAction,
  UpdateDecisionAction,
  RemoveDecisionAction,
  SetDecisionStatusAction,
} from "./actions.js";
import type { BusinessAnalysisState } from "../types.js";

export interface BusinessAnalysisDecisionsOperations {
  addDecisionOperation: (
    state: BusinessAnalysisState,
    action: AddDecisionAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateDecisionOperation: (
    state: BusinessAnalysisState,
    action: UpdateDecisionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeDecisionOperation: (
    state: BusinessAnalysisState,
    action: RemoveDecisionAction,
    dispatch?: SignalDispatch,
  ) => void;
  setDecisionStatusOperation: (
    state: BusinessAnalysisState,
    action: SetDecisionStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
}
