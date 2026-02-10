import type { Action } from "document-model";
import type {
  AddServiceGroupInput,
  UpdateServiceGroupInput,
  DeleteServiceGroupInput,
  ReorderServiceGroupsInput,
} from "../types.js";

export type AddServiceGroupAction = Action & {
  type: "ADD_SERVICE_GROUP";
  input: AddServiceGroupInput;
};
export type UpdateServiceGroupAction = Action & {
  type: "UPDATE_SERVICE_GROUP";
  input: UpdateServiceGroupInput;
};
export type DeleteServiceGroupAction = Action & {
  type: "DELETE_SERVICE_GROUP";
  input: DeleteServiceGroupInput;
};
export type ReorderServiceGroupsAction = Action & {
  type: "REORDER_SERVICE_GROUPS";
  input: ReorderServiceGroupsInput;
};

export type ServiceOfferingServiceGroupManagementAction =
  | AddServiceGroupAction
  | UpdateServiceGroupAction
  | DeleteServiceGroupAction
  | ReorderServiceGroupsAction;
