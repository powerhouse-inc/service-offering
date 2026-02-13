import { type SignalDispatch } from "document-model";
import type {
  AddKpiAction,
  UpdateKpiAction,
  RemoveKpiAction,
  RecordKpiMeasurementAction,
  SetKpiStatusAction,
} from "./actions.js";
import type { BusinessAnalysisState } from "../types.js";

export interface BusinessAnalysisKpisOperations {
  addKpiOperation: (
    state: BusinessAnalysisState,
    action: AddKpiAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateKpiOperation: (
    state: BusinessAnalysisState,
    action: UpdateKpiAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeKpiOperation: (
    state: BusinessAnalysisState,
    action: RemoveKpiAction,
    dispatch?: SignalDispatch,
  ) => void;
  recordKpiMeasurementOperation: (
    state: BusinessAnalysisState,
    action: RecordKpiMeasurementAction,
    dispatch?: SignalDispatch,
  ) => void;
  setKpiStatusOperation: (
    state: BusinessAnalysisState,
    action: SetKpiStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
}
