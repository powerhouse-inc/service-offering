import type { Action } from "document-model";
import type {
  AddSelectedOptionGroupInput,
  RemoveSelectedOptionGroupInput,
} from "../types.js";

export type AddSelectedOptionGroupAction = Action & {
  type: "ADD_SELECTED_OPTION_GROUP";
  input: AddSelectedOptionGroupInput;
};
export type RemoveSelectedOptionGroupAction = Action & {
  type: "REMOVE_SELECTED_OPTION_GROUP";
  input: RemoveSelectedOptionGroupInput;
};

export type SubscriptionInstanceOptionGroupAction =
  | AddSelectedOptionGroupAction
  | RemoveSelectedOptionGroupAction;
