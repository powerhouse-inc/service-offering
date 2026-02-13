import { type SignalDispatch } from "document-model";
import type {
  AddDeliverableAction,
  UpdateDeliverableAction,
  RemoveDeliverableAction,
  SetDeliverableStatusAction,
} from "./actions.js";
import type { BusinessAnalysisState } from "../types.js";

export interface BusinessAnalysisDeliverablesOperations {
  addDeliverableOperation: (
    state: BusinessAnalysisState,
    action: AddDeliverableAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateDeliverableOperation: (
    state: BusinessAnalysisState,
    action: UpdateDeliverableAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeDeliverableOperation: (
    state: BusinessAnalysisState,
    action: RemoveDeliverableAction,
    dispatch?: SignalDispatch,
  ) => void;
  setDeliverableStatusOperation: (
    state: BusinessAnalysisState,
    action: SetDeliverableStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
}
