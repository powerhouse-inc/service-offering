import type { Action } from "document-model";
import type {
  SetProjectInfoInput,
  SetPhaseInput,
  SetStatusInput,
} from "../types.js";

export type SetProjectInfoAction = Action & {
  type: "SET_PROJECT_INFO";
  input: SetProjectInfoInput;
};
export type SetPhaseAction = Action & {
  type: "SET_PHASE";
  input: SetPhaseInput;
};
export type SetStatusAction = Action & {
  type: "SET_STATUS";
  input: SetStatusInput;
};

export type WorkBreakdownProjectAction =
  | SetProjectInfoAction
  | SetPhaseAction
  | SetStatusAction;
