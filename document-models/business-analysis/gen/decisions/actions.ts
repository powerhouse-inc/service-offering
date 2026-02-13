import type { Action } from "document-model";
import type {
  AddDecisionInput,
  UpdateDecisionInput,
  RemoveDecisionInput,
  SetDecisionStatusInput,
} from "../types.js";

export type AddDecisionAction = Action & {
  type: "ADD_DECISION";
  input: AddDecisionInput;
};
export type UpdateDecisionAction = Action & {
  type: "UPDATE_DECISION";
  input: UpdateDecisionInput;
};
export type RemoveDecisionAction = Action & {
  type: "REMOVE_DECISION";
  input: RemoveDecisionInput;
};
export type SetDecisionStatusAction = Action & {
  type: "SET_DECISION_STATUS";
  input: SetDecisionStatusInput;
};

export type BusinessAnalysisDecisionsAction =
  | AddDecisionAction
  | UpdateDecisionAction
  | RemoveDecisionAction
  | SetDecisionStatusAction;
