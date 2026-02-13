import type { Action } from "document-model";
import type {
  AddProcessInput,
  UpdateProcessInput,
  RemoveProcessInput,
  AddProcessStepInput,
  UpdateProcessStepInput,
  RemoveProcessStepInput,
  ReorderProcessStepsInput,
} from "../types.js";

export type AddProcessAction = Action & {
  type: "ADD_PROCESS";
  input: AddProcessInput;
};
export type UpdateProcessAction = Action & {
  type: "UPDATE_PROCESS";
  input: UpdateProcessInput;
};
export type RemoveProcessAction = Action & {
  type: "REMOVE_PROCESS";
  input: RemoveProcessInput;
};
export type AddProcessStepAction = Action & {
  type: "ADD_PROCESS_STEP";
  input: AddProcessStepInput;
};
export type UpdateProcessStepAction = Action & {
  type: "UPDATE_PROCESS_STEP";
  input: UpdateProcessStepInput;
};
export type RemoveProcessStepAction = Action & {
  type: "REMOVE_PROCESS_STEP";
  input: RemoveProcessStepInput;
};
export type ReorderProcessStepsAction = Action & {
  type: "REORDER_PROCESS_STEPS";
  input: ReorderProcessStepsInput;
};

export type BusinessAnalysisProcessesAction =
  | AddProcessAction
  | UpdateProcessAction
  | RemoveProcessAction
  | AddProcessStepAction
  | UpdateProcessStepAction
  | RemoveProcessStepAction
  | ReorderProcessStepsAction;
