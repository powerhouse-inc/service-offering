import { type SignalDispatch } from "document-model";
import type {
  AddAnalysisAction,
  UpdateAnalysisAction,
  RemoveAnalysisAction,
  AddAnalysisEntryAction,
  UpdateAnalysisEntryAction,
  RemoveAnalysisEntryAction,
} from "./actions.js";
import type { BusinessAnalysisState } from "../types.js";

export interface BusinessAnalysisAnalysisOperations {
  addAnalysisOperation: (
    state: BusinessAnalysisState,
    action: AddAnalysisAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateAnalysisOperation: (
    state: BusinessAnalysisState,
    action: UpdateAnalysisAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeAnalysisOperation: (
    state: BusinessAnalysisState,
    action: RemoveAnalysisAction,
    dispatch?: SignalDispatch,
  ) => void;
  addAnalysisEntryOperation: (
    state: BusinessAnalysisState,
    action: AddAnalysisEntryAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateAnalysisEntryOperation: (
    state: BusinessAnalysisState,
    action: UpdateAnalysisEntryAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeAnalysisEntryOperation: (
    state: BusinessAnalysisState,
    action: RemoveAnalysisEntryAction,
    dispatch?: SignalDispatch,
  ) => void;
}
