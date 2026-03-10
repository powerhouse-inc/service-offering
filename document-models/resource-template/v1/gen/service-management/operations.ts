import { type SignalDispatch } from "document-model";
import type {
  AddServiceAction,
  UpdateServiceAction,
  DeleteServiceAction,
  AddFacetBindingAction,
  RemoveFacetBindingAction,
} from "./actions.js";
import type { ResourceTemplateState } from "../types.js";

export interface ResourceTemplateServiceManagementOperations {
  addServiceOperation: (
    state: ResourceTemplateState,
    action: AddServiceAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateServiceOperation: (
    state: ResourceTemplateState,
    action: UpdateServiceAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteServiceOperation: (
    state: ResourceTemplateState,
    action: DeleteServiceAction,
    dispatch?: SignalDispatch,
  ) => void;
  addFacetBindingOperation: (
    state: ResourceTemplateState,
    action: AddFacetBindingAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeFacetBindingOperation: (
    state: ResourceTemplateState,
    action: RemoveFacetBindingAction,
    dispatch?: SignalDispatch,
  ) => void;
}
