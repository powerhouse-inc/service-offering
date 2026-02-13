import type { Action } from "document-model";
import type {
  AddAssumptionInput,
  UpdateAssumptionInput,
  RemoveAssumptionInput,
  SetAssumptionStatusInput,
  AddScopeItemInput,
  UpdateScopeItemInput,
  RemoveScopeItemInput,
} from "../types.js";

export type AddAssumptionAction = Action & {
  type: "ADD_ASSUMPTION";
  input: AddAssumptionInput;
};
export type UpdateAssumptionAction = Action & {
  type: "UPDATE_ASSUMPTION";
  input: UpdateAssumptionInput;
};
export type RemoveAssumptionAction = Action & {
  type: "REMOVE_ASSUMPTION";
  input: RemoveAssumptionInput;
};
export type SetAssumptionStatusAction = Action & {
  type: "SET_ASSUMPTION_STATUS";
  input: SetAssumptionStatusInput;
};
export type AddScopeItemAction = Action & {
  type: "ADD_SCOPE_ITEM";
  input: AddScopeItemInput;
};
export type UpdateScopeItemAction = Action & {
  type: "UPDATE_SCOPE_ITEM";
  input: UpdateScopeItemInput;
};
export type RemoveScopeItemAction = Action & {
  type: "REMOVE_SCOPE_ITEM";
  input: RemoveScopeItemInput;
};

export type BusinessAnalysisScopeAction =
  | AddAssumptionAction
  | UpdateAssumptionAction
  | RemoveAssumptionAction
  | SetAssumptionStatusAction
  | AddScopeItemAction
  | UpdateScopeItemAction
  | RemoveScopeItemAction;
