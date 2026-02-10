import { type SignalDispatch } from "document-model";
import type {
  SetFacetSelectionAction,
  RemoveFacetSelectionAction,
} from "./actions.js";
import type { ServiceSubscriptionState } from "../types.js";

export interface ServiceSubscriptionFacetSelectionOperations {
  setFacetSelectionOperation: (
    state: ServiceSubscriptionState,
    action: SetFacetSelectionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeFacetSelectionOperation: (
    state: ServiceSubscriptionState,
    action: RemoveFacetSelectionAction,
    dispatch?: SignalDispatch,
  ) => void;
}
