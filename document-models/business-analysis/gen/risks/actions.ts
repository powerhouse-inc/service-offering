import type { Action } from "document-model";
import type {
  AddRiskInput,
  UpdateRiskInput,
  RemoveRiskInput,
  SetRiskStatusInput,
} from "../types.js";

export type AddRiskAction = Action & { type: "ADD_RISK"; input: AddRiskInput };
export type UpdateRiskAction = Action & {
  type: "UPDATE_RISK";
  input: UpdateRiskInput;
};
export type RemoveRiskAction = Action & {
  type: "REMOVE_RISK";
  input: RemoveRiskInput;
};
export type SetRiskStatusAction = Action & {
  type: "SET_RISK_STATUS";
  input: SetRiskStatusInput;
};

export type BusinessAnalysisRisksAction =
  | AddRiskAction
  | UpdateRiskAction
  | RemoveRiskAction
  | SetRiskStatusAction;
