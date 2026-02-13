import type { Action } from "document-model";
import type {
  AddDependencyInput,
  UpdateDependencyInput,
  RemoveDependencyInput,
} from "../types.js";

export type AddDependencyAction = Action & {
  type: "ADD_DEPENDENCY";
  input: AddDependencyInput;
};
export type UpdateDependencyAction = Action & {
  type: "UPDATE_DEPENDENCY";
  input: UpdateDependencyInput;
};
export type RemoveDependencyAction = Action & {
  type: "REMOVE_DEPENDENCY";
  input: RemoveDependencyInput;
};

export type WorkBreakdownDependenciesAction =
  | AddDependencyAction
  | UpdateDependencyAction
  | RemoveDependencyAction;
