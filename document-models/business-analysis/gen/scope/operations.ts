import { type SignalDispatch } from "document-model";
import type {
  AddAssumptionAction,
  UpdateAssumptionAction,
  RemoveAssumptionAction,
  SetAssumptionStatusAction,
  AddScopeItemAction,
  UpdateScopeItemAction,
  RemoveScopeItemAction,
} from "./actions.js";
import type { BusinessAnalysisState } from "../types.js";

export interface BusinessAnalysisScopeOperations {
  addAssumptionOperation: (
    state: BusinessAnalysisState,
    action: AddAssumptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateAssumptionOperation: (
    state: BusinessAnalysisState,
    action: UpdateAssumptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeAssumptionOperation: (
    state: BusinessAnalysisState,
    action: RemoveAssumptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  setAssumptionStatusOperation: (
    state: BusinessAnalysisState,
    action: SetAssumptionStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
  addScopeItemOperation: (
    state: BusinessAnalysisState,
    action: AddScopeItemAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateScopeItemOperation: (
    state: BusinessAnalysisState,
    action: UpdateScopeItemAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeScopeItemOperation: (
    state: BusinessAnalysisState,
    action: RemoveScopeItemAction,
    dispatch?: SignalDispatch,
  ) => void;
}
