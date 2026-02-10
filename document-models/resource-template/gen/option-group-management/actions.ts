import type { Action } from "document-model";
import type {
  AddOptionGroupInput,
  UpdateOptionGroupInput,
  DeleteOptionGroupInput,
  AddFaqInput,
  UpdateFaqInput,
  DeleteFaqInput,
  ReorderFaqsInput,
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
export type AddFaqAction = Action & { type: "ADD_FAQ"; input: AddFaqInput };
export type UpdateFaqAction = Action & {
  type: "UPDATE_FAQ";
  input: UpdateFaqInput;
};
export type DeleteFaqAction = Action & {
  type: "DELETE_FAQ";
  input: DeleteFaqInput;
};
export type ReorderFaqsAction = Action & {
  type: "REORDER_FAQS";
  input: ReorderFaqsInput;
};

export type ResourceTemplateOptionGroupManagementAction =
  | AddOptionGroupAction
  | UpdateOptionGroupAction
  | DeleteOptionGroupAction
  | AddFaqAction
  | UpdateFaqAction
  | DeleteFaqAction
  | ReorderFaqsAction;
