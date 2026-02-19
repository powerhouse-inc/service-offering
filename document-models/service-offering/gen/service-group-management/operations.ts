import { type SignalDispatch } from "document-model";
import type {
  AddServiceGroupAction,
  UpdateServiceGroupAction,
  DeleteServiceGroupAction,
  ReorderServiceGroupsAction,
  AddServiceGroupTierPricingAction,
  SetServiceGroupSetupCostAction,
  RemoveServiceGroupSetupCostAction,
  AddRecurringPriceOptionAction,
  UpdateRecurringPriceOptionAction,
  RemoveRecurringPriceOptionAction,
  RemoveServiceGroupTierPricingAction,
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
  addServiceGroupTierPricingOperation: (
    state: ServiceOfferingState,
    action: AddServiceGroupTierPricingAction,
    dispatch?: SignalDispatch,
  ) => void;
  setServiceGroupSetupCostOperation: (
    state: ServiceOfferingState,
    action: SetServiceGroupSetupCostAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeServiceGroupSetupCostOperation: (
    state: ServiceOfferingState,
    action: RemoveServiceGroupSetupCostAction,
    dispatch?: SignalDispatch,
  ) => void;
  addRecurringPriceOptionOperation: (
    state: ServiceOfferingState,
    action: AddRecurringPriceOptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateRecurringPriceOptionOperation: (
    state: ServiceOfferingState,
    action: UpdateRecurringPriceOptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeRecurringPriceOptionOperation: (
    state: ServiceOfferingState,
    action: RemoveRecurringPriceOptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeServiceGroupTierPricingOperation: (
    state: ServiceOfferingState,
    action: RemoveServiceGroupTierPricingAction,
    dispatch?: SignalDispatch,
  ) => void;
}
