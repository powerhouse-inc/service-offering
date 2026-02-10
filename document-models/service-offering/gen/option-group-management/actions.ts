import type { Action } from "document-model";
import type {
  AddOptionGroupInput,
  UpdateOptionGroupInput,
  DeleteOptionGroupInput,
} from "../types.js";

export type AddOptionGroupAction = Action & {
  type: "ADD_OPTION_GROUP";
  input: AddOptionGroupInput;
};
export type UpdateOptionGroupAction = Action & {
  type: "UPDATE_OPTION_GROUP";
  input: UpdateOptionGroupInput;
};
export type DeleteOptionGroupAction = Action & {
  type: "DELETE_OPTION_GROUP";
  input: DeleteOptionGroupInput;
};

export type ServiceOfferingOptionGroupManagementAction =
  | AddOptionGroupAction
  | UpdateOptionGroupAction
  | DeleteOptionGroupAction;
