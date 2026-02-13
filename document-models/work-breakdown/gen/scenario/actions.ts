import type { Action } from "document-model";
import type {
  AddInputInput,
  UpdateInputInput,
  RemoveInputInput,
  AddStepInput,
  UpdateStepInput,
  RemoveStepInput,
  AddSubstepInput,
  UpdateSubstepInput,
  RemoveSubstepInput,
} from "../types.js";

export type AddInputAction = Action & {
  type: "ADD_INPUT";
  input: AddInputInput;
};
export type UpdateInputAction = Action & {
  type: "UPDATE_INPUT";
  input: UpdateInputInput;
};
export type RemoveInputAction = Action & {
  type: "REMOVE_INPUT";
  input: RemoveInputInput;
};
export type AddStepAction = Action & { type: "ADD_STEP"; input: AddStepInput };
export type UpdateStepAction = Action & {
  type: "UPDATE_STEP";
  input: UpdateStepInput;
};
export type RemoveStepAction = Action & {
  type: "REMOVE_STEP";
  input: RemoveStepInput;
};
export type AddSubstepAction = Action & {
  type: "ADD_SUBSTEP";
  input: AddSubstepInput;
};
export type UpdateSubstepAction = Action & {
  type: "UPDATE_SUBSTEP";
  input: UpdateSubstepInput;
};
export type RemoveSubstepAction = Action & {
  type: "REMOVE_SUBSTEP";
  input: RemoveSubstepInput;
};

export type WorkBreakdownScenarioAction =
  | AddInputAction
  | UpdateInputAction
  | RemoveInputAction
  | AddStepAction
  | UpdateStepAction
  | RemoveStepAction
  | AddSubstepAction
  | UpdateSubstepAction
  | RemoveSubstepAction;
