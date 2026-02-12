import { type SignalDispatch } from "document-model";
import type {
  AddSelectedOptionGroupAction,
  RemoveSelectedOptionGroupAction,
} from "./actions.js";
import type { SubscriptionInstanceState } from "../types.js";

export interface SubscriptionInstanceOptionGroupOperations {
  addSelectedOptionGroupOperation: (
    state: SubscriptionInstanceState,
    action: AddSelectedOptionGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeSelectedOptionGroupOperation: (
    state: SubscriptionInstanceState,
    action: RemoveSelectedOptionGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
}
