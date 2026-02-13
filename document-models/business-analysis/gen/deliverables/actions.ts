import type { Action } from "document-model";
import type {
  AddDeliverableInput,
  UpdateDeliverableInput,
  RemoveDeliverableInput,
  SetDeliverableStatusInput,
} from "../types.js";

export type AddDeliverableAction = Action & {
  type: "ADD_DELIVERABLE";
  input: AddDeliverableInput;
};
export type UpdateDeliverableAction = Action & {
  type: "UPDATE_DELIVERABLE";
  input: UpdateDeliverableInput;
};
export type RemoveDeliverableAction = Action & {
  type: "REMOVE_DELIVERABLE";
  input: RemoveDeliverableInput;
};
export type SetDeliverableStatusAction = Action & {
  type: "SET_DELIVERABLE_STATUS";
  input: SetDeliverableStatusInput;
};

export type BusinessAnalysisDeliverablesAction =
  | AddDeliverableAction
  | UpdateDeliverableAction
  | RemoveDeliverableAction
  | SetDeliverableStatusAction;
