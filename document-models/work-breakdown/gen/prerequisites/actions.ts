import type { Action } from "document-model";
import type {
  AddPrerequisiteInput,
  UpdatePrerequisiteInput,
  RemovePrerequisiteInput,
  SetPrerequisiteStatusInput,
} from "../types.js";

export type AddPrerequisiteAction = Action & {
  type: "ADD_PREREQUISITE";
  input: AddPrerequisiteInput;
};
export type UpdatePrerequisiteAction = Action & {
  type: "UPDATE_PREREQUISITE";
  input: UpdatePrerequisiteInput;
};
export type RemovePrerequisiteAction = Action & {
  type: "REMOVE_PREREQUISITE";
  input: RemovePrerequisiteInput;
};
export type SetPrerequisiteStatusAction = Action & {
  type: "SET_PREREQUISITE_STATUS";
  input: SetPrerequisiteStatusInput;
};

export type WorkBreakdownPrerequisitesAction =
  | AddPrerequisiteAction
  | UpdatePrerequisiteAction
  | RemovePrerequisiteAction
  | SetPrerequisiteStatusAction;
