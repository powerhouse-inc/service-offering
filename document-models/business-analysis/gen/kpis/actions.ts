import type { Action } from "document-model";
import type {
  AddKpiInput,
  UpdateKpiInput,
  RemoveKpiInput,
  RecordKpiMeasurementInput,
  SetKpiStatusInput,
} from "../types.js";

export type AddKpiAction = Action & { type: "ADD_KPI"; input: AddKpiInput };
export type UpdateKpiAction = Action & {
  type: "UPDATE_KPI";
  input: UpdateKpiInput;
};
export type RemoveKpiAction = Action & {
  type: "REMOVE_KPI";
  input: RemoveKpiInput;
};
export type RecordKpiMeasurementAction = Action & {
  type: "RECORD_KPI_MEASUREMENT";
  input: RecordKpiMeasurementInput;
};
export type SetKpiStatusAction = Action & {
  type: "SET_KPI_STATUS";
  input: SetKpiStatusInput;
};

export type BusinessAnalysisKpisAction =
  | AddKpiAction
  | UpdateKpiAction
  | RemoveKpiAction
  | RecordKpiMeasurementAction
  | SetKpiStatusAction;
