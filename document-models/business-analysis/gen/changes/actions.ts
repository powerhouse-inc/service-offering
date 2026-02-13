import type { Action } from "document-model";
import type {
  AddChangeRequestInput,
  UpdateChangeRequestInput,
  SetChangeRequestStatusInput,
} from "../types.js";

export type AddChangeRequestAction = Action & {
  type: "ADD_CHANGE_REQUEST";
  input: AddChangeRequestInput;
};
export type UpdateChangeRequestAction = Action & {
  type: "UPDATE_CHANGE_REQUEST";
  input: UpdateChangeRequestInput;
};
export type SetChangeRequestStatusAction = Action & {
  type: "SET_CHANGE_REQUEST_STATUS";
  input: SetChangeRequestStatusInput;
};

export type BusinessAnalysisChangesAction =
  | AddChangeRequestAction
  | UpdateChangeRequestAction
  | SetChangeRequestStatusAction;
