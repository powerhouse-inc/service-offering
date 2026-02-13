import type { Action } from "document-model";
import type {
  SetProjectInfoInput,
  SetProjectPhaseInput,
  SetProjectStatusInput,
} from "../types.js";

export type SetProjectInfoAction = Action & {
  type: "SET_PROJECT_INFO";
  input: SetProjectInfoInput;
};
export type SetProjectPhaseAction = Action & {
  type: "SET_PROJECT_PHASE";
  input: SetProjectPhaseInput;
};
export type SetProjectStatusAction = Action & {
  type: "SET_PROJECT_STATUS";
  input: SetProjectStatusInput;
};

export type BusinessAnalysisProjectAction =
  | SetProjectInfoAction
  | SetProjectPhaseAction
  | SetProjectStatusAction;
