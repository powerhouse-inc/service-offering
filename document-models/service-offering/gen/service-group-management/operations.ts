import { type SignalDispatch } from "document-model";
import type {
  AddServiceGroupAction,
  UpdateServiceGroupAction,
  DeleteServiceGroupAction,
  ReorderServiceGroupsAction,
} from "./actions.js";
import type { ServiceOfferingState } from "../types.js";

export interface ServiceOfferingServiceGroupManagementOperations {
  addServiceGroupOperation: (
    state: ServiceOfferingState,
    action: AddServiceGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateServiceGroupOperation: (
    state: ServiceOfferingState,
    action: UpdateServiceGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteServiceGroupOperation: (
    state: ServiceOfferingState,
    action: DeleteServiceGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  reorderServiceGroupsOperation: (
    state: ServiceOfferingState,
    action: ReorderServiceGroupsAction,
    dispatch?: SignalDispatch,
  ) => void;
}
