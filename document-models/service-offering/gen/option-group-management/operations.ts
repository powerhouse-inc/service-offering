import { type SignalDispatch } from "document-model";
import type {
  AddOptionGroupAction,
  UpdateOptionGroupAction,
  DeleteOptionGroupAction,
} from "./actions.js";
import type { ServiceOfferingState } from "../types.js";

export interface ServiceOfferingOptionGroupManagementOperations {
  addOptionGroupOperation: (
    state: ServiceOfferingState,
    action: AddOptionGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateOptionGroupOperation: (
    state: ServiceOfferingState,
    action: UpdateOptionGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteOptionGroupOperation: (
    state: ServiceOfferingState,
    action: DeleteOptionGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
}
