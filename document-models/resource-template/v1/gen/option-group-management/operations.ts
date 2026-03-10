import { type SignalDispatch } from "document-model";
import type {
  AddOptionGroupAction,
  UpdateOptionGroupAction,
  DeleteOptionGroupAction,
  AddFaqAction,
  UpdateFaqAction,
  DeleteFaqAction,
  ReorderFaqsAction,
} from "./actions.js";
import type { ResourceTemplateState } from "../types.js";

export interface ResourceTemplateOptionGroupManagementOperations {
  addOptionGroupOperation: (
    state: ResourceTemplateState,
    action: AddOptionGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateOptionGroupOperation: (
    state: ResourceTemplateState,
    action: UpdateOptionGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteOptionGroupOperation: (
    state: ResourceTemplateState,
    action: DeleteOptionGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  addFaqOperation: (
    state: ResourceTemplateState,
    action: AddFaqAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateFaqOperation: (
    state: ResourceTemplateState,
    action: UpdateFaqAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteFaqOperation: (
    state: ResourceTemplateState,
    action: DeleteFaqAction,
    dispatch?: SignalDispatch,
  ) => void;
  reorderFaqsOperation: (
    state: ResourceTemplateState,
    action: ReorderFaqsAction,
    dispatch?: SignalDispatch,
  ) => void;
}
