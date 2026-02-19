import { type SignalDispatch } from "document-model";
import type {
  SetAiContextAction,
  AddExtractionRecordAction,
  UpdateExtractionRecordAction,
  ClearExtractionHistoryAction,
} from "./actions.js";
import type { WorkBreakdownState } from "../types.js";

export interface WorkBreakdownExtractionOperations {
  setAiContextOperation: (
    state: WorkBreakdownState,
    action: SetAiContextAction,
    dispatch?: SignalDispatch,
  ) => void;
  addExtractionRecordOperation: (
    state: WorkBreakdownState,
    action: AddExtractionRecordAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateExtractionRecordOperation: (
    state: WorkBreakdownState,
    action: UpdateExtractionRecordAction,
    dispatch?: SignalDispatch,
  ) => void;
  clearExtractionHistoryOperation: (
    state: WorkBreakdownState,
    action: ClearExtractionHistoryAction,
    dispatch?: SignalDispatch,
  ) => void;
}
