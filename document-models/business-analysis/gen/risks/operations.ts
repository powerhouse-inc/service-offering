import { type SignalDispatch } from "document-model";
import type {
  AddRiskAction,
  UpdateRiskAction,
  RemoveRiskAction,
  SetRiskStatusAction,
} from "./actions.js";
import type { BusinessAnalysisState } from "../types.js";

export interface BusinessAnalysisRisksOperations {
  addRiskOperation: (
    state: BusinessAnalysisState,
    action: AddRiskAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateRiskOperation: (
    state: BusinessAnalysisState,
    action: UpdateRiskAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeRiskOperation: (
    state: BusinessAnalysisState,
    action: RemoveRiskAction,
    dispatch?: SignalDispatch,
  ) => void;
  setRiskStatusOperation: (
    state: BusinessAnalysisState,
    action: SetRiskStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
}
